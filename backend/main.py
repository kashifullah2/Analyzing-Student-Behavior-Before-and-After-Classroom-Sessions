import os
import uuid
import json
import asyncio
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt
from dotenv import load_dotenv

import models, database, services, ai_service
from schemas import UserSignup, UserAuth

load_dotenv()
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Analyzing Student Behavior Before and After Classroom Sessions")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- AUTH ROUTES ---
@app.post("/signup")
def signup(user: UserSignup, db: Session = Depends(database.get_db)):
    if user.password != user.confirm_password: raise HTTPException(400, "Passwords mismatch")
    hashed_pw = pwd_context.hash(user.password)
    new_user = models.User(username=user.username, email=user.email, hashed_password=hashed_pw, phone=user.phone, gender=user.gender, address=user.address)
    db.add(new_user); db.commit()
    return {"message": "User created"}

@app.post("/login")
def login(user: UserAuth, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    token = jwt.encode({"sub": db_user.username}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}

class SessionCreate(BaseModel):
    name: str; class_name: str; instructor: str

@app.post("/sessions/create")
async def create_session(session: SessionCreate, db: Session = Depends(database.get_db)):
    sid = str(uuid.uuid4())
    new_session = models.Session(
        id=sid,
        name=session.name,
        class_name=session.class_name,
        instructor=session.instructor,
        created_at=datetime.now().isoformat()
    )
    db.add(new_session)
    db.commit()
    return {"id": sid, "name": session.name}

@app.get("/sessions/{session_id}/details")
async def get_session_details(session_id: str, db: Session = Depends(database.get_db)):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session: raise HTTPException(404, "Not Found")
    
    return {"id": session.id, "name": session.name, "class_name": session.class_name, "instructor": session.instructor, "created_at": session.created_at}

@app.get("/sessions/history")
async def get_session_history(db: Session = Depends(database.get_db)):
    sessions = db.query(models.Session).all()
    history = []
    for s in sessions:
        # Get stats for this session to show in history
        entry_data = db.query(models.EmotionData).filter(models.EmotionData.session_id == s.id, models.EmotionData.type == 'entry').all()
        stats = services.calculate_advanced_stats(entry_data)
        
        history.append({
            "id": s.id, 
            "class_name": s.class_name, 
            "instructor": s.instructor,
            "created_at": s.created_at, 
            "vibe_score": stats["vibe_score"], 
            "attendance": stats["attendance_est"]
        })
    return sorted(history, key=lambda x: x['created_at'], reverse=True)

@app.post("/sessions/{session_id}/analyze")
async def analyze_frame(session_id: str, type: str = Form(...), file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session: raise HTTPException(404, "Not Found")
    
    res = services.detect_emotion_from_frame(await file.read())
    timestamp = datetime.now().isoformat()
    
    for r in res:
        new_data = models.EmotionData(
            session_id=session_id,
            type=type,
            emotion=r['emotion'],
            bbox=r['bbox'],
            timestamp=timestamp
        )
        db.add(new_data)
    
    db.commit()
    return {"results": res}

@app.post("/sessions/{session_id}/analyze_video")
async def analyze_video(session_id: str, type: str = Form(...), file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session: raise HTTPException(404, "Not Found")
    
    from fastapi.concurrency import run_in_threadpool
    results = await run_in_threadpool(services.process_video_file, await file.read())
    base_time = datetime.now()
    total_detections = 0
    for idx, frame_results in enumerate(results):
        # Assign a slightly different timestamp to each frame so attendance logic works
        frame_ts = (base_time + timedelta(milliseconds=idx * 100)).isoformat()
        for r in frame_results:
            new_data = models.EmotionData(
                session_id=session_id,
                type=type,
                emotion=r['emotion'],
                bbox=r['bbox'],
                timestamp=frame_ts
            )
            db.add(new_data)
            total_detections += 1
        
    db.commit()
    return {"status": "success", "frames_processed": len(results), "total_detections": total_detections}


@app.post("/sessions/{session_id}/analyze_video_full")
async def analyze_video_full(session_id: str, type: str = Form(...), file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    """Processes a video fully, annotates it, saves results to DB, and returns the MP4 file."""
    from fastapi.concurrency import run_in_threadpool
    from starlette.background import BackgroundTask

    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session: raise HTTPException(404, "Not Found")
    
    # Process video and get file path and results
    output_path, all_results = await run_in_threadpool(services.process_and_annotate_video, await file.read())
    
    if not output_path or not os.path.exists(output_path):
        raise HTTPException(500, "Video processing failed")
        
    # Save the detected results into the DB so the dashboard updates and counts students
    base_time = datetime.now()
    for idx, frame_results in enumerate(all_results):
        # Increment timestamp per frame so Counter(valid_ts) works correctly for attendance
        frame_ts = (base_time + timedelta(milliseconds=idx * 100)).isoformat()
        for res in frame_results:
            new_data = models.EmotionData(
                session_id=session_id,
                type=type,
                emotion=res['emotion'],
                bbox=res['bbox'],
                timestamp=frame_ts
            )
            db.add(new_data)
    
    if all_results:
        db.commit()
        
    # Return the file and delete it after sending
    return FileResponse(
        output_path, 
        media_type="video/mp4",
        filename="analyzed_video.mp4",
        background=BackgroundTask(os.unlink, output_path)
    )




# ─── WebSocket: Real-time Webcam Emotion Streaming ────────────────────────────────
@app.websocket("/ws/webcam/{session_id}/{capture_type}")
async def websocket_webcam(websocket: WebSocket, session_id: str, capture_type: str):
    """
    WebSocket endpoint for real-time webcam emotion detection.
    
    Architecture: Webcam (Python/OpenCV) → detect locally → push results via WebSocket → React displays
    
    The backend opens the webcam, runs face detection + emotion recognition on each frame,
    and streams both the JPEG-encoded frame (base64) and detection results to the React client.
    """
    await websocket.accept()
    print(f"[WS] Client connected — session={session_id}, type={capture_type}")

    # Start webcam (async wrapper to avoid blocking)
    await asyncio.get_event_loop().run_in_executor(None, services.webcam_manager.start)

    # Get a DB session for persisting results
    db = database.SessionLocal()
    client_active = True

    async def listen_for_stop():
        nonlocal client_active
        try:
            while True:
                msg = await websocket.receive_text()
                if msg == "stop":
                    print(f"[WS] Client requested stop - {capture_type}")
                    client_active = False
                    break
        except WebSocketDisconnect:
            print(f"[WS] Client disconnected normally - {capture_type}")
            client_active = False
        except Exception:
            client_active = False

    listener_task = asyncio.create_task(listen_for_stop())

    try:
        frame_count = 0
        db_pending = 0  # track unsaved DB records for batched commits
        while client_active:
            # Capture frame and detect emotions (runs in threadpool to not block event loop)
            frame_b64, results = await asyncio.get_event_loop().run_in_executor(
                None, services.webcam_manager.capture_and_detect
            )

            if frame_b64 is None:
                await asyncio.sleep(0.1)
                continue

            frame_count += 1

            # Save detections to DB (batched every 10 frames to reduce I/O lag)
            if results:
                timestamp = datetime.now().isoformat()
                for r in results:
                    db.add(models.EmotionData(
                        session_id=session_id,
                        type=capture_type,
                        emotion=r['emotion'],
                        bbox=r['bbox'],
                        timestamp=timestamp
                    ))
                db_pending += 1
                if db_pending >= 10:
                    db.commit()
                    db_pending = 0

            # Send frame + results to React client
            await websocket.send_json({
                "frame": frame_b64,
                "results": results,
                "face_count": len(results),
                "timestamp": datetime.now().isoformat()
            })

            await asyncio.sleep(0.066)

    except WebSocketDisconnect:
        print(f"[WS] Client disconnected unexpectedly — session={session_id}, type={capture_type}")
    except asyncio.CancelledError:
        print(f"[WS] Task was cancelled by server! session={session_id}, type={capture_type}")
    except Exception as e:
        print(f"[WS] Error: {e} - type: {type(e)}")
    finally:
        client_active = False
        listener_task.cancel()
        # Flush any remaining batched DB records
        try:
            db.commit()
        except Exception:
            pass
        services.webcam_manager.stop()
        db.close()
        print(f"[WS] Cleanup complete — session={session_id}, type={capture_type}")


@app.get("/sessions/{session_id}/report")
async def get_report(session_id: str, db: Session = Depends(database.get_db)):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session: raise HTTPException(404, "Not Found")
    
    entry_data = db.query(models.EmotionData).filter(models.EmotionData.session_id == session_id, models.EmotionData.type.in_(['entry', 'video'])).all()
    exit_data = db.query(models.EmotionData).filter(models.EmotionData.session_id == session_id, models.EmotionData.type == 'exit').all()
    
    return {
        "entry_stats": services.calculate_advanced_stats(entry_data),
        "exit_stats": services.calculate_advanced_stats(exit_data)
    }

@app.get("/sessions/{session_id}/export_pdf")
async def export_pdf(session_id: str, db: Session = Depends(database.get_db)):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session: raise HTTPException(404, "Not Found")
    
    entry_data = db.query(models.EmotionData).filter(models.EmotionData.session_id == session_id, models.EmotionData.type.in_(['entry', 'video'])).all()
    exit_data = db.query(models.EmotionData).filter(models.EmotionData.session_id == session_id, models.EmotionData.type == 'exit').all()
    
    entry_stats = services.calculate_advanced_stats(entry_data)
    exit_stats = services.calculate_advanced_stats(exit_data)
    
    session_info = {"class_name": session.class_name, "instructor": session.instructor}
    path = services.generate_pdf(session_info, entry_stats, exit_stats)
    
    return FileResponse(path, media_type='application/pdf', filename="report.pdf")

@app.post("/sessions/{session_id}/chat")
async def chat_with_assistant(session_id: str, chat: ai_service.ChatRequest, db: Session = Depends(database.get_db)):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session: raise HTTPException(404, "Not Found")
    
    # Save user message
    db.add(models.ChatLog(session_id=session_id, role="user", text=chat.question, timestamp=datetime.now().isoformat()))
    db.commit()
    
    # Get stats for context
    entry_data = db.query(models.EmotionData).filter(models.EmotionData.session_id == session_id, models.EmotionData.type.in_(['entry', 'video'])).all()
    stats = services.calculate_advanced_stats(entry_data)
    
    session_info = {"class_name": session.class_name, "instructor": session.instructor}
    
    response = ai_service.ask_teaching_assistant(chat.question, {"entry_stats": stats, "info": session_info})
    
    # Save bot response
    db.add(models.ChatLog(session_id=session_id, role="bot", text=response, timestamp=datetime.now().isoformat()))
    db.commit()
    
    return {"response": response}

@app.get("/sessions/{session_id}/chat_history")
async def get_chat_history(session_id: str, db: Session = Depends(database.get_db)):
    history = db.query(models.ChatLog).filter(models.ChatLog.session_id == session_id).order_by(models.ChatLog.id).all()
    return [{"role": h.role, "text": h.text} for h in history]