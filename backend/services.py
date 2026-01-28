import cv2
import numpy as np
import os
import tempfile
from tensorflow.keras.models import load_model
from collections import Counter
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import psutil

MODEL_PATH = os.path.join(os.path.dirname(__file__), "face_model.h5")
EMOTIONS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

_model = None

def get_model():
    global _model
    if _model is not None:
        return _model
    
    try:
        if os.path.exists(MODEL_PATH):
            _model = load_model(MODEL_PATH)
            print("✓ AI Model Loaded Successfully")
        else:
            _model = None
            print(f"⚠ Model not found at {MODEL_PATH}. Running in Simulation Mode.")
    except Exception as e:
        _model = None
        print(f"⚠ Error loading model: {e}")
    
    return _model

def analyze_cv2_image(img):
    if img is None: return []
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    
    results = []
    model_instance = get_model()
    for (x, y, w, h) in faces:
        if model_instance:
            roi_gray = gray[y:y+h, x:x+w]
            roi_resized = cv2.resize(roi_gray, (48, 48))
            img_pixels = np.expand_dims(roi_resized, axis=0)
            img_pixels = np.expand_dims(img_pixels, axis=-1)
            pred = model_instance.predict(img_pixels, verbose=0)[0]
            emotion = EMOTIONS[np.argmax(pred)]
        else:
            emotion = "Neutral" # Fallback if no model
            
        results.append({
            "emotion": emotion,
            "bbox": str([int(x), int(y), int(w), int(h)]) # Store as string for DB
        })
    return results

def detect_emotion_from_frame(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return analyze_cv2_image(img)

def process_video_file(video_bytes):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tfile:
        tfile.write(video_bytes)
        temp_filename = tfile.name
    
    cap = cv2.VideoCapture(temp_filename)
    results = []
    frame_rate = cap.get(cv2.CAP_PROP_FPS) or 30
    frame_interval = int(frame_rate) # Analyze 1 frame per second
    
    count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        
        if count % frame_interval == 0:
            frame_results = analyze_cv2_image(frame)
            for res in frame_results:
                 # Add implicit timestamp offset based on frame count? 
                 # For now just collecting emotions is enough for stats
                results.append(res)
        count += 1
        
    cap.release()
    os.unlink(temp_filename)
    return results

def calculate_advanced_stats(data_points):
    if not data_points:
        return {"total_faces": 0, "counts": {e: 0 for e in EMOTIONS}, "confusion_index": 0, "boredom_meter": 0, "vibe_score": 0, "attendance_est": 0, "at_risk_index": 0}
    
    # Handle both dicts and SQLAlchemy objects
    emotions = []
    timestamps = []
    for d in data_points:
        if isinstance(d, dict):
            emotions.append(d.get('emotion'))
            timestamps.append(d.get('timestamp'))
        else:
            emotions.append(d.emotion)
            timestamps.append(d.timestamp)

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

    # FIX: Attendance is Max faces seen in a single timestamp frame
    # timestamps might be None or ISO strings
    valid_timestamps = [t for t in timestamps if t]
    attendance = max(Counter(valid_timestamps).values()) if valid_timestamps else 0

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

def generate_pdf(session_info, entry_stats, exit_stats):
    # session_info: dict with class_name, instructor etc. (or object converted to dict)
    # stats: calculated stats
    
    # Assuming session_id is available in info, or passed separately? 
    # Let's just create a unique filename
    import uuid
    filename = f"/tmp/report_{uuid.uuid4()}.pdf"
    c = canvas.Canvas(filename, pagesize=letter)
    
    # Combine stats for general report or show both?
    # Original showed "vibe_score" which implies aggregated logic?
    # Let's show Entry vs Exit stats
    
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 750, "Analyzing Student Behavior Report")
    
    c.setFont("Helvetica", 12)
    c.drawString(50, 720, f"Class: {session_info.get('class_name', 'N/A')}")
    c.drawString(50, 705, f"Instructor: {session_info.get('instructor', 'N/A')}")
    
    y = 680
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Entry Analysis")
    c.setFont("Helvetica", 12)
    y -= 20
    c.drawString(50, y, f"Vibe Score: {entry_stats['vibe_score']}/10")
    y -= 15
    c.drawString(50, y, f"Attendance Est: {entry_stats['attendance_est']}")
    y -= 15
    c.drawString(50, y, f"Confusion Index: {entry_stats['confusion_index']}%")
    
    y -= 40
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Exit Analysis")
    c.setFont("Helvetica", 12)
    y -= 20
    c.drawString(50, y, f"Vibe Score: {exit_stats['vibe_score']}/10")
    y -= 15
    c.drawString(50, y, f"Attendance Est: {exit_stats['attendance_est']}")
    y -= 15
    c.drawString(50, y, f"Confusion Index: {exit_stats['confusion_index']}%")

    c.save()
    return filename