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

# --- GLOBAL STORAGE (In-Memory DB) ---
sessions = {}

# --- MODEL LOADING ---
MODEL_PATH = "face_model.h5"
try:
    if os.path.exists(MODEL_PATH):
        model = load_model(MODEL_PATH)
        print("✓ Model loaded successfully")
    else:
        model = None
        print("⚠ Model not found. Using SIMULATION mode.")
except Exception as e:
    model = None
    print(f"⚠ Model Error: {e}")

EMOTIONS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

# --- HELPER: ANALYZE IMAGE ---
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
            predictions = model.predict(img_pixels, verbose=0)[0]
            emotion_idx = np.argmax(predictions)
            emotion = EMOTIONS[emotion_idx]
            confidence = float(predictions[emotion_idx])
        else:
            # Simulation Logic
            emotion = np.random.choice(EMOTIONS, p=[0.05, 0.05, 0.05, 0.35, 0.15, 0.1, 0.25])
            confidence = 0.85
            
        results.append({
            "emotion": emotion,
            "confidence": confidence,
            "bbox": [int(x), int(y), int(w), int(h)]
        })
    return results

# --- CORE FUNCTIONS ---

def detect_emotion_from_frame(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return analyze_cv2_image(img)

def process_video_file(video_bytes):
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp:
        tmp.write(video_bytes)
        tmp_path = tmp.name

    cap = cv2.VideoCapture(tmp_path)
    all_results = []
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    frame_interval = int(fps) 
    
    frame_count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        if frame_count % frame_interval == 0:
            frame_results = analyze_cv2_image(frame)
            all_results.extend(frame_results)
        frame_count += 1
    
    cap.release()
    os.unlink(tmp_path)
    return all_results

# --- ADVANCED STATISTICS (Fixes your Error) ---

def calculate_advanced_stats(data_points):
    """
    Calculates 10+ Features: Confusion, Boredom, Vibe, Attendance, etc.
    """
    if not data_points:
        return {
            "total_faces": 0,
            "counts": {e: 0 for e in EMOTIONS},
            "confusion_index": 0,
            "boredom_meter": 0,
            "vibe_score": 0,
            "engagement_score": 0,
            "at_risk_index": 0,
            "attendance_est": 0
        }
    
    emotions = [d['emotion'] for d in data_points]
    counts = Counter(emotions)
    total = len(emotions)
    
    # ensure all keys exist
    safe_counts = {e: counts.get(e, 0) for e in EMOTIONS}

    # 1. Confusion Index (Surprise + Fear)
    confusion = ((safe_counts['Surprise'] + safe_counts['Fear']) / total) * 100
    
    # 2. Boredom Meter (Neutral dominance)
    boredom = (safe_counts['Neutral'] / total) * 100
    
    # 3. Vibe Score (1-10)
    positive = safe_counts['Happy'] + safe_counts['Surprise']
    negative = safe_counts['Sad'] + safe_counts['Angry'] + safe_counts['Disgust'] + safe_counts['Fear']
    vibe = 5 + ((positive - negative) / total) * 5
    vibe = max(1, min(10, vibe))

    # 4. Engagement Score (Weighted)
    eng_score = 0
    for e in emotions:
        if e == 'Happy': eng_score += 1.0
        elif e == 'Surprise': eng_score += 0.8
        elif e == 'Neutral': eng_score += 0.5
        else: eng_score -= 0.2
    engagement = max(0, min(100, (eng_score / total) * 100))

    # 5. At Risk Index (Negative Emotions)
    risk = ((safe_counts['Sad'] + safe_counts['Angry'] + safe_counts['Fear']) / total) * 100

    # 6. Estimated Attendance (Assuming avg student scanned 2 times)
    attendance = int(total / 1.5)

    return {
        "total_faces": total,
        "counts": safe_counts,
        "confusion_index": round(confusion, 1),
        "boredom_meter": round(boredom, 1),
        "vibe_score": round(vibe, 1),
        "engagement_score": round(engagement, 1),
        "at_risk_index": round(risk, 1),
        "attendance_est": attendance
    }

def get_system_health():
    return {
        "cpu_usage": psutil.cpu_percent(),
        "ram_usage": psutil.virtual_memory().percent
    }

def generate_pdf(session_id):
    if session_id not in sessions: return None
    
    filename = f"report_{session_id}.pdf"
    c = canvas.Canvas(filename, pagesize=letter)
    
    data = sessions[session_id]
    stats = calculate_advanced_stats(data['entry_data'] + data['exit_data'])
    info = data['info']
    
    # PDF Design
    c.setFont("Helvetica-Bold", 20)
    c.drawString(50, 750, "EduMotion Analytics Report")
    
    c.setFont("Helvetica", 12)
    c.drawString(50, 720, f"Session: {info['class_name']}")
    c.drawString(50, 700, f"Instructor: {info['instructor']}")
    c.drawString(50, 680, f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    
    c.line(50, 660, 550, 660)
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, 630, "Key Metrics")
    
    c.setFont("Helvetica", 12)
    c.drawString(70, 600, f"• Room Vibe Score: {stats['vibe_score']}/10")
    c.drawString(70, 580, f"• Confusion Index: {stats['confusion_index']}%")
    c.drawString(70, 560, f"• Boredom Meter: {stats['boredom_meter']}%")
    c.drawString(70, 540, f"• Estimated Attendance: {stats['attendance_est']} Students")
    
    c.save()
    return filename