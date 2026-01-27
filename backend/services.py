import cv2
import numpy as np
import os
import tempfile
from tensorflow.keras.models import load_model
from collections import Counter
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import psutil

sessions = {}
MODEL_PATH = "face_model.h5"
EMOTIONS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

try:
    if os.path.exists(MODEL_PATH):
        model = load_model(MODEL_PATH)
        print("✓ Model loaded")
    else:
        model = None
        print("⚠ Simulation Mode")
except:
    model = None

def analyze_cv2_image(img):
    if img is None: return []
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    
    results = []
    for (x, y, w, h) in faces:
        roi_gray = gray[y:y+h, x:x+w]
        roi_resized = cv2.resize(roi_gray, (48, 48))
        
        if model:
            img_pixels = np.expand_dims(roi_resized, axis=0)
            img_pixels = np.expand_dims(img_pixels, axis=-1)
            pred = model.predict(img_pixels, verbose=0)[0]
            emotion = EMOTIONS[np.argmax(pred)]
        else:
            emotion = np.random.choice(EMOTIONS)
            
        results.append({
            "emotion": emotion,
            "bbox": [int(x), int(y), int(w), int(h)] # <--- Sends coordinates to frontend
        })
    return results

def detect_emotion_from_frame(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return analyze_cv2_image(img)

def calculate_advanced_stats(data_points):
    if not data_points:
        return {"total_faces": 0, "counts": {e: 0 for e in EMOTIONS}, "confusion_index": 0, "boredom_meter": 0, "vibe_score": 0, "attendance_est": 0, "at_risk_index": 0}
    
    emotions = [d['emotion'] for d in data_points]
    counts = Counter(emotions)
    total = len(emotions)
    safe_counts = {e: counts.get(e, 0) for e in EMOTIONS}

    confusion = ((safe_counts['Surprise'] + safe_counts['Fear']) / total) * 100
    boredom = (safe_counts['Neutral'] / total) * 100
    
    pos = safe_counts['Happy'] + safe_counts['Surprise']
    neg = safe_counts['Sad'] + safe_counts['Angry'] + safe_counts['Disgust'] + safe_counts['Fear']
    vibe = 5 + ((pos - neg) / total) * 5
    vibe = max(1, min(10, vibe))
    
    risk = ((safe_counts['Sad'] + safe_counts['Angry'] + safe_counts['Fear']) / total) * 100

    # FIX: Attendance based on max faces in a single timestamp
    timestamps = [d.get('timestamp') for d in data_points]
    attendance = max(Counter(timestamps).values()) if timestamps else 0

    return {
        "total_faces": total, 
        "counts": safe_counts, 
        "confusion_index": round(confusion, 1), 
        "boredom_meter": round(boredom, 1), 
        "vibe_score": round(vibe, 1),
        "at_risk_index": round(risk, 1),
        "attendance_est": attendance
    }

def get_system_health():
    return {"cpu_usage": psutil.cpu_percent(), "ram_usage": psutil.virtual_memory().percent}

def generate_pdf(session_id):
    if session_id not in sessions: return None
    filename = f"report_{session_id}.pdf"
    c = canvas.Canvas(filename, pagesize=letter)
    data = sessions[session_id]
    stats = calculate_advanced_stats(data['entry_data'] + data['exit_data'])
    
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 750, "Analyzing Student Behavior Report")
    c.setFont("Helvetica", 12)
    c.drawString(50, 730, f"Class: {data['info']['class_name']}")
    c.drawString(50, 715, f"Vibe Score: {stats['vibe_score']}/10")
    c.save()
    return filename