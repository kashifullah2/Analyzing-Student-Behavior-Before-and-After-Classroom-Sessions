from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime
import uuid
import os
from dotenv import load_dotenv

import models, database, services, ai_service
from schemas import UserSignup, UserAuth

load_dotenv()
models.Base.metadata.create_all(bind=database.engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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
async def create_session(session: SessionCreate):
    sid = str(uuid.uuid4())
    services.sessions[sid] = {"info": session.dict(), "created_at": datetime.now().isoformat(), "entry_data": [], "exit_data": [], "chat_history": []}
    return {"id": sid, "name": session.name}

@app.get("/sessions/{session_id}/details")
async def get_session_details(session_id: str):
    if session_id not in services.sessions: raise HTTPException(404, "Not Found")
    return services.sessions[session_id]

@app.get("/sessions/history")
async def get_session_history():
    history = []
    for sid, data in services.sessions.items():
        stats = services.calculate_advanced_stats(data.get("entry_data", []))
        history.append({
            "id": sid, "class_name": data["info"]["class_name"], "instructor": data["info"]["instructor"],
            "created_at": data["created_at"], "vibe_score": stats["vibe_score"], "attendance": stats["attendance_est"]
        })
    return sorted(history, key=lambda x: x['created_at'], reverse=True)

@app.post("/sessions/{session_id}/analyze")
async def analyze_frame(session_id: str, type: str = Form(...), file: UploadFile = File(...)):
    if session_id not in services.sessions: raise HTTPException(404, "Not Found")
    res = services.detect_emotion_from_frame(await file.read())
    timestamp = datetime.now().isoformat()
    for r in res: services.sessions[session_id][f"{type}_data"].append({**r, "timestamp": timestamp})
    return {"results": res}

@app.get("/sessions/{session_id}/report")
async def get_report(session_id: str):
    data = services.sessions[session_id]
    return {
        "entry_stats": services.calculate_advanced_stats(data["entry_data"]),
        "exit_stats": services.calculate_advanced_stats(data["exit_data"])
    }

@app.get("/sessions/{session_id}/export_pdf")
async def export_pdf(session_id: str):
    return FileResponse(services.generate_pdf(session_id), media_type='application/pdf', filename="report.pdf")

@app.post("/sessions/{session_id}/chat")
async def chat_with_assistant(session_id: str, chat: ai_service.ChatRequest):
    data = services.sessions[session_id]
    data["chat_history"].append({"role": "user", "text": chat.question})
    stats = services.calculate_advanced_stats(data["entry_data"])
    response = ai_service.ask_teaching_assistant(chat.question, {"entry_stats": stats, "info": data["info"]})
    data["chat_history"].append({"role": "bot", "text": response})
    return {"response": response}