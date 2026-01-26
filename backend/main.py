from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import uuid
import io
import pandas as pd
import os
import models
import database
import services
import ai_service
from schemas import UserSignup, UserAuth
models.Base.metadata.create_all(bind=database.engine)
app = FastAPI(title="EduMotion AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("SECRET_KEY")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")



@app.post("/signup")
def signup(user: UserSignup, db: Session = Depends(database.get_db)):
    if user.password != user.confirm_password:
        raise HTTPException(400, "Passwords do not match")
    
    hashed_pw = pwd_context.hash(user.password)
    new_user = models.User(
        username=user.username, email=user.email, phone=user.phone,
        gender=user.gender, address=user.address, hashed_password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    return {"message": "User created"}

@app.post("/login")
def login(user: UserAuth, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    
    token = jwt.encode({"sub": db_user.username}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}

# --- SESSION ROUTES ---
class SessionCreate(BaseModel):
    name: str
    class_name: str
    instructor: str

@app.post("/sessions/create")
async def create_session(session: SessionCreate):
    session_id = str(uuid.uuid4())
    services.sessions[session_id] = {
        "info": session.dict(),
        "created_at": datetime.now().isoformat(),
        "entry_data": [],
        "exit_data": []
    }
    return {"id": session_id, "name": session.name}

# --- ANALYZE ROUTES ---
@app.post("/sessions/{session_id}/analyze")
async def analyze_frame(session_id: str, type: str = Form(...), file: UploadFile = File(...)):
    if session_id not in services.sessions: raise HTTPException(404, "Session not found")
    contents = await file.read()
    results = services.detect_emotion_from_frame(contents)
    timestamp = datetime.now().isoformat()
    for res in results:
        services.sessions[session_id][f"{type}_data"].append({**res, "timestamp": timestamp})
    return {"results": results}

@app.post("/sessions/{session_id}/analyze_video")
async def analyze_video(session_id: str, type: str = Form(...), file: UploadFile = File(...)):
    if session_id not in services.sessions: raise HTTPException(404, "Session not found")
    contents = await file.read()
    results = services.process_video_file(contents)
    timestamp = datetime.now().isoformat()
    for res in results:
        services.sessions[session_id][f"{type}_data"].append({**res, "timestamp": timestamp})
    return {"status": "success"}

# --- REPORTING ROUTES ---
@app.get("/sessions/{session_id}/report")
async def get_report(session_id: str):
    if session_id not in services.sessions: raise HTTPException(404, "Session not found")
    data = services.sessions[session_id]
    
    # THIS WAS THE FIX: Ensuring the function exists in services.py
    entry_stats = services.calculate_advanced_stats(data["entry_data"])
    exit_stats = services.calculate_advanced_stats(data["exit_data"])
    
    return {
        "session_info": data["info"],
        "entry_stats": entry_stats,
        "exit_stats": exit_stats,
        "system_health": services.get_system_health()
    }

@app.get("/sessions/{session_id}/export_pdf")
async def export_pdf(session_id: str):
    if session_id not in services.sessions: raise HTTPException(404, "Session not found")
    
    pdf_path = services.generate_pdf(session_id)
    if not pdf_path: raise HTTPException(500, "PDF Generation failed")
    
    return FileResponse(pdf_path, media_type='application/pdf', filename=f"Report_{session_id}.pdf")

@app.post("/sessions/{session_id}/chat")
async def chat_with_assistant(session_id: str, chat: ai_service.ChatRequest):
    if session_id not in services.sessions: raise HTTPException(404, "Session not found")
    
    data = services.sessions[session_id]
    stats = {
        "info": data["info"],
        "entry_stats": services.calculate_advanced_stats(data["entry_data"]),
        "exit_stats": services.calculate_advanced_stats(data["exit_data"])
    }
    
    response = ai_service.ask_teaching_assistant(chat.question, stats)
    return {"response": response}