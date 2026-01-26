import cv2
import numpy as np
import os
import tempfile
from tensorflow.keras.models import load_model
from collections import Counter, defaultdict
from datetime import datetime
import psutil

# --- CONFIGURATION ---
MODEL_PATH = "face_model.h5"
try:
    if os.path.exists(MODEL_PATH):
        model = load_model(MODEL_PATH)
        print(f"✓ Model loaded from {MODEL_PATH}")
    else:
        model = None
        print("⚠ Model not found. Using SIMULATION mode.")
except Exception as e:
    model = None
    print(f"⚠ Error loading model: {e}")

EMOTIONS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

# --- CORE FUNCTIONS ---

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
            # Simulation
            emotion = np.random.choice(EMOTIONS, p=[0.05, 0.05, 0.05, 0.35, 0.15, 0.1, 0.25])
            confidence = 0.85 + (np.random.random() * 0.1)
            
        results.append({
            "emotion": emotion,
            "confidence": confidence,
            "bbox": [int(x), int(y), int(w), int(h)]
        })
    return results

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

# --- ADVANCED ANALYTICS ---

def calculate_advanced_stats(data_points):
    if not data_points:
        return {
            "total_faces": 0,
            "counts": {e: 0 for e in EMOTIONS},
            "distribution": {},
            "timeline": [],
            "engagement_score": 0,
            "at_risk_index": 0,
            "recommendation": "Waiting for data..."
        }
    
    emotions = [d['emotion'] for d in data_points]
    counts = Counter(emotions)
    total = len(emotions)
    
    # Ensure all keys exist
    safe_counts = {e: counts.get(e, 0) for e in EMOTIONS}
    
    # Engagement Calculation
    score = 0
    for e in emotions:
        if e == 'Happy': score += 1.0
        elif e == 'Surprise': score += 0.8
        elif e == 'Neutral': score += 0.5
        else: score -= 0.2
    engagement_score = max(0, min(100, (score / total) * 100)) if total > 0 else 0

    # Risk Index
    risk_count = safe_counts['Sad'] + safe_counts['Fear'] + safe_counts['Angry']
    risk_index = (risk_count / total * 100) if total > 0 else 0

    # Smart Recommendation
    rec = "Maintain current pace."
    if risk_index > 30: rec = "⚠ High negative emotions. Consider a break."
    elif engagement_score > 75: rec = "🌟 Excellent engagement! Keep it up."
    elif engagement_score < 40: rec = "📉 Energy low. Try an interactive activity."

    return {
        "total_faces": total,
        "counts": safe_counts, # Raw counts for Happy, Neutral, etc.
        "distribution": {k: round(v/total*100, 1) for k, v in safe_counts.items()},
        "engagement_score": round(engagement_score, 1),
        "at_risk_index": round(risk_index, 1),
        "dominant_emotion": counts.most_common(1)[0][0] if counts else "None",
        "recommendation": rec
    }

def get_system_health():
    return {
        "cpu_usage": psutil.cpu_percent(),
        "ram_usage": psutil.virtual_memory().percent
    }