from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from datetime import datetime
import uuid
import io
import pandas as pd
import services # Import the updated services

app = FastAPI(title="EduMotion Advanced API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sessions = {}

# --- Models ---
class SessionCreate(BaseModel):
    name: str
    class_name: str
    instructor: str

class SessionResponse(BaseModel):
    id: str
    name: str
    created_at: str

# --- Routes ---

@app.post("/sessions/create", response_model=SessionResponse)
async def create_session(session: SessionCreate):
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "info": session.dict(),
        "created_at": datetime.now().isoformat(),
        "entry_data": [],
        "exit_data": []
    }
    return {"id": session_id, "name": session.name, "created_at": sessions[session_id]["created_at"]}

@app.post("/sessions/{session_id}/analyze")
async def analyze_frame(session_id: str, type: str = Form(...), file: UploadFile = File(...)):
    if session_id not in sessions: raise HTTPException(404, "Session not found")
    
    contents = await file.read()
    results = services.detect_emotion_from_frame(contents)
    
    timestamp = datetime.now().isoformat()
    for res in results:
        # Add timestamp for Trend Analysis
        sessions[session_id][f"{type}_data"].append({**res, "timestamp": timestamp})
            
    return {"faces_detected": len(results), "results": results}

@app.post("/sessions/{session_id}/analyze_video")
async def analyze_video(session_id: str, type: str = Form(...), file: UploadFile = File(...)):
    if session_id not in sessions: raise HTTPException(404, "Session not found")
    
    contents = await file.read()
    results = services.process_video_file(contents)
    
    timestamp = datetime.now().isoformat()
    for res in results:
        sessions[session_id][f"{type}_data"].append({**res, "timestamp": timestamp})
            
    return {"status": "success", "count": len(results)}

@app.get("/sessions/{session_id}/report")
async def get_report(session_id: str):
    if session_id not in sessions: raise HTTPException(404, "Session not found")
    
    data = sessions[session_id]
    
    return {
        "session_info": data["info"],
        "entry_stats": services.calculate_advanced_stats(data["entry_data"]),
        "exit_stats": services.calculate_advanced_stats(data["exit_data"]),
        "system_health": services.get_system_health() # New Feature
    }

@app.get("/sessions/{session_id}/export")
async def export_csv(session_id: str):
    if session_id not in sessions: raise HTTPException(404, "Session not found")
    
    data = sessions[session_id]
    
    # Flatten data for CSV
    all_records = []
    for r in data["entry_data"]: all_records.append({**r, "Type": "Entry"})
    for r in data["exit_data"]: all_records.append({**r, "Type": "Exit"})
    
    df = pd.DataFrame(all_records)
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=session_{session_id}.csv"
    return response