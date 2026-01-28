import os
import uuid
import json
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
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
    
    # Check if there are any stats to display "live" or just return info
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
            bbox=r['bbox'], # Already stringified in services or need to here? services returns list/dict. services.analyze_cv2_image returns bbox string? No, let's check services.py. 
            # I updated services.py to return str(bbox).
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
    timestamp = datetime.now().isoformat()
    
    # Batch add results
    # Ideally use bulk_insert_mappings but loop is fine for prototype scale
    for r in results:
        new_data = models.EmotionData(
            session_id=session_id,
            type=type,
            emotion=r['emotion'],
            bbox=r['bbox'],
            timestamp=timestamp # All video frames get same upload timestamp or calculated offset? timestamp per frame.
        )
        # Note: services.process_video_file returns list of dicts.
        # I should probably assign distinct timestamps if possible, but for stats it doesn't matter much unless we plot over time.
        # Let's just use upload timestamp for now as "video upload time".
        db.add(new_data)
        
    db.commit()
    return {"status": "success", "frames_processed": len(results)}

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
    db.commit() # Commit to save user message first
    
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