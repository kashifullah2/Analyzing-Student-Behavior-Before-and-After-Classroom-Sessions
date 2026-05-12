import cv2
import numpy as np
import tempfile
import os
import uuid
import json
import base64
import threading
from datetime import datetime
from collections import Counter

from hsemotion_onnx.facial_emotions import HSEmotionRecognizer
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import psutil

# ─── Load Models (once at import time) ───────────────────────────────────────────
face_net = cv2.dnn.readNetFromCaffe("deploy.prototxt", "face.caffemodel")
fer = HSEmotionRecognizer(model_name='enet_b0_8_best_afew')

EMOTIONS = ['Anger', 'Contempt', 'Disgust', 'Fear', 'Happiness', 'Neutral', 'Sadness', 'Surprise']

# ─── BUG FIX #4: Single lock covering all model inference ─────────────────────────
# Using one lock for all inference prevents any lock-ordering deadlocks.
_model_lock = threading.Lock()


# ─── Face Detection Helper ────────────────────────────────────────────────────────
def _detect_faces(frame, confidence_threshold=0.25):
    """Detect faces in a BGR frame. Must be called with _model_lock held."""
    h, w = frame.shape[:2]
    blob = cv2.dnn.blobFromImage(
        cv2.resize(frame, (300, 300)), 1.0,
        (300, 300), (104.0, 177.0, 123.0)
    )
    face_net.setInput(blob)
    detections = face_net.forward()

    boxes = []
    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence < confidence_threshold:
            continue
        box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
        x1, y1, x2, y2 = box.astype("int")
        pad = 20
        x1 = max(0, x1 - pad)
        y1 = max(0, y1 - pad)
        x2 = min(w, x2 + pad)
        y2 = min(h, y2 + pad)
        boxes.append((x1, y1, x2, y2))
    return boxes


# ─── Process a Single Frame ───────────────────────────────────────────────────────
def _process_frame(frame):
    """Detect faces and predict emotions in one BGR frame.
    Returns list of dicts: [{"emotion", "confidence", "bbox"}, ...]
    """
    with _model_lock:
        boxes = _detect_faces(frame)
        if not boxes:
            return []

        # Crop all faces for batch prediction
        face_crops = []
        valid_boxes = []
        for bbox in boxes:
            x1, y1, x2, y2 = bbox
            face_crop = frame[y1:y2, x1:x2]
            if face_crop.size == 0:
                continue
            face_rgb = cv2.cvtColor(face_crop, cv2.COLOR_BGR2RGB)
            face_crops.append(face_rgb)
            valid_boxes.append(bbox)

        if not face_crops:
            return []

        # Batch predict all faces at once (much faster)
        emotions, scores_batch = fer.predict_multi_emotions(face_crops)
        
        results = []
        for i in range(len(valid_boxes)):
            emotion_label = emotions[i]
            # scores_batch[i] is an array of probabilities, take max
            top_idx = np.argmax(scores_batch[i])
            confidence = round(float(scores_batch[i][top_idx]), 2)
            
            x1, y1, x2, y2 = valid_boxes[i]
            results.append({
                "emotion":    emotion_label,
                "confidence": confidence,
                "bbox":       [int(x1), int(y1), int(x2 - x1), int(y2 - y1)]  # [x, y, w, h]
            })
            
    return results


# ─── Detect Emotion from Uploaded Image Bytes ────────────────────────────────────
def detect_emotion_from_frame(file_bytes: bytes) -> list:
    """Process raw image bytes from an HTTP upload.
    Returns list of dicts: [{"emotion", "confidence", "bbox"}, ...]
    """
    np_arr = np.frombuffer(file_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if frame is None:
        return []
    return _process_frame(frame)


# ─── Webcam Manager ───────────────────────────────────────────────────────────────
class WebcamManager:
    """Manages a single shared webcam for WebSocket streaming."""

    def __init__(self):
        self._cap = None
        self._cam_lock = threading.Lock()
        self._active_connections = 0
        self._latest_frame = None
        self._reader_thread = None
        self._stop_event = threading.Event()
        # ─── Frame-skip optimisation: only run inference every N frames ───
        self._frame_counter = 0
        self._skip_interval = 2  # detect every 2nd frame
        self._cached_results = []

    def _read_loop(self):
        """Continuously drain the camera buffer to prevent lag."""
        while not self._stop_event.is_set():
            with self._cam_lock:
                if self._cap and self._cap.isOpened():
                    ret, frame = self._cap.read()
                    if ret:
                        self._latest_frame = frame
            # Tiny sleep to avoid 100% CPU on empty reads
            import time
            time.sleep(0.01)

    def start(self):
        with self._cam_lock:
            self._active_connections += 1
            if self._cap is None or not self._cap.isOpened():
                self._cap = cv2.VideoCapture(0)
                self._cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                self._cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                print("[Webcam] Camera opened")
                import time
                time.sleep(1.0)  # warm-up — crucial on Linux

                # Start background reader thread
                self._stop_event.clear()
                self._reader_thread = threading.Thread(target=self._read_loop, daemon=True)
                self._reader_thread.start()

    def stop(self):
        with self._cam_lock:
            self._active_connections -= 1
            if self._active_connections <= 0:
                self._active_connections = 0
                self._stop_event.set()
                if self._reader_thread:
                    self._reader_thread.join(timeout=1.0)
                    self._reader_thread = None
                if self._cap and self._cap.isOpened():
                    self._cap.release()
                    self._cap = None
                    self._latest_frame = None
                    print("[Webcam] Camera released")

    def capture_and_detect(self):
        """Get the latest frame and run detection.
        Returns (frame_base64, results).
        Runs inference only every Nth frame to prevent lag.
        """
        # Grab the latest frame (no blocking I/O here!)
        with self._cam_lock:
            if self._latest_frame is None:
                return None, []
            frame = self._latest_frame.copy()

        # ─── Frame-skip: only run expensive inference every N frames ─────
        self._frame_counter += 1
        if self._frame_counter % self._skip_interval == 1 or self._frame_counter == 1:
            self._cached_results = _process_frame(frame)

        results = self._cached_results

        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 50])
        frame_b64 = base64.b64encode(buffer).decode('utf-8')

        return frame_b64, results


# Global singleton
webcam_manager = WebcamManager()


# ─── Process Uploaded Video File ──────────────────────────────────────────────────
def process_video_file(file_bytes: bytes) -> list:
    """Sample frames from an uploaded video and run emotion detection.
    Returns list of dicts: [{"emotion", "confidence", "bbox"}, ...]
    """
    # ─── BUG FIX #5: Detect actual file type from magic bytes instead of
    # always using .mp4 — some browsers send .webm or .mov which OpenCV
    # fails to open when given the wrong extension.
    suffix = _detect_video_suffix(file_bytes)

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.write(file_bytes)
    tmp.close()

    cap = cv2.VideoCapture(tmp.name)

    if not cap.isOpened():
        os.unlink(tmp.name)
        print(f"[Video] Failed to open video file (detected suffix: {suffix})")
        return []

    results = []
    frame_count = 0
    sample_interval = 10  # analyze 1 frame every 10

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frame_count += 1
            if frame_count % sample_interval != 0:
                continue
            frame_results = _process_frame(frame)
            if frame_results:
                results.append(frame_results)
    finally:
        cap.release()
        os.unlink(tmp.name)

    return results

# ─── Process and Annotate Video File ─────────────────────────────────────────────
def process_and_annotate_video(file_bytes: bytes):
    """Process a video, draw emotions on frames, and return a tuple of
    (path_to_annotated_mp4: str, all_results: list).
    Returns ("", []) on any failure so callers always get a 2-tuple.
    """
    suffix = _detect_video_suffix(file_bytes)

    in_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    in_tmp.write(file_bytes)
    in_tmp.close()

    cap = cv2.VideoCapture(in_tmp.name)
    if not cap.isOpened():
        os.unlink(in_tmp.name)
        # ─── BUG FIX: was returning a bare "" string; now always returns a 2-tuple
        return "", []

    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps    = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0:
        fps = 30

    # ─── BUG FIX: use a dedicated temp path for the intermediate AVI so the
    # out_tmp name is not reused/deleted prematurely in the finally block.
    out_tmp     = tempfile.NamedTemporaryFile(delete=False, suffix=".avi")
    temp_avi    = out_tmp.name
    out_tmp.close()

    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    out    = cv2.VideoWriter(temp_avi, fourcc, fps, (width, height))

    # Dynamic sizing based on resolution
    base_dim   = max(width, height)
    line_thick = max(2, int(base_dim * 0.005))
    font_scale = max(0.5, base_dim * 0.001)

    all_results  = []
    last_results = []
    frame_count  = 0
    sample_interval = 3  # analyze 1 out of every 3 frames

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1
            if frame_count % sample_interval == 1 or frame_count == 1:
                last_results = _process_frame(frame)
                if last_results:
                    all_results.append(last_results)

            # Draw on frame
            for res in last_results:
                # ─── BUG FIX: replaced eval() with json.loads() to safely parse
                # the bbox string.  Falls back gracefully if bbox is already a list.
                raw_bbox = res['bbox']
                if isinstance(raw_bbox, str):
                    try:
                        bbox_list = json.loads(raw_bbox)
                    except (json.JSONDecodeError, ValueError):
                        continue
                else:
                    bbox_list = raw_bbox

                if not (isinstance(bbox_list, (list, tuple)) and len(bbox_list) == 4):
                    continue

                x, y, w, h = [int(v) for v in bbox_list]
                emotion = res['emotion']
                conf    = res['confidence']

                color = (0, 255, 0)
                if emotion in ['Anger', 'Disgust', 'Fear', 'Sadness']:
                    color = (0, 0, 255)

                cv2.rectangle(frame, (x, y), (x + w, y + h), color, line_thick)
                label = f"{emotion} {int(conf * 100)}%"
                (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, font_scale, line_thick)
                cv2.rectangle(frame, (x, y - th - 10), (x + tw, y), color, -1)
                cv2.putText(frame, label, (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX,
                            font_scale, (255, 255, 255), max(1, line_thick - 1))

            out.write(frame)
    finally:
        cap.release()
        out.release()
        os.unlink(in_tmp.name)

    # Convert to browser-friendly h264 mp4
    import subprocess
    final_mp4 = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4").name
    try:
        subprocess.run([
            "ffmpeg", "-y", "-i", temp_avi,
            "-vcodec", "libx264", "-pix_fmt", "yuv420p",
            "-crf", "23", "-preset", "fast", final_mp4
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception as e:
        print(f"[Video] FFmpeg encoding failed: {e}")
        return "", []
    finally:
        # ─── BUG FIX: only clean up temp_avi (the AVI written by OpenCV).
        # out_tmp.name == temp_avi so there is no separate stale file to delete.
        if os.path.exists(temp_avi):
            os.unlink(temp_avi)

    return final_mp4, all_results


def _detect_video_suffix(file_bytes: bytes) -> str:
    """Sniff the first few bytes to determine the video container format."""
    header = file_bytes[:12]
    if header[:4] == b'\x1aE\xdf\xa3':
        return '.webm'
    if header[4:8] in (b'ftyp', b'moov', b'mdat'):
        return '.mp4'
    # ─── BUG FIX: OGG magic bytes are b'OggS', not b'OGG'
    if header[:4] == b'OggS':
        return '.ogv'
    if header[:4] == b'RIFF':
        return '.avi'
    # Default fallback
    return '.mp4'


# ─── Advanced Stats ───────────────────────────────────────────────────────────────
def calculate_advanced_stats(data_points) -> dict:
    """Calculate classroom analytics from emotion data points.
    Accepts SQLAlchemy ORM objects or plain dicts.
    """
    empty = {
        "total_faces": 0,
        "counts": {e: 0 for e in EMOTIONS},
        "confusion_index": 0,
        "boredom_meter": 0,
        "vibe_score": 0,
        "attendance_est": 0,
        "at_risk_index": 0
    }
    if not data_points:
        return empty

    def _get(item, key):
        return getattr(item, key, None) or (item.get(key) if isinstance(item, dict) else None)

    emotions   = [_get(d, 'emotion')   for d in data_points if _get(d, 'emotion')]
    timestamps = [_get(d, 'timestamp') for d in data_points if _get(d, 'timestamp')]

    if not emotions:
        return empty

    counts      = Counter(emotions)
    total       = len(emotions)
    safe_counts = {e: counts.get(e, 0) for e in EMOTIONS}

    confusion = ((safe_counts['Fear'] + safe_counts['Surprise']) / total) * 100
    boredom   = (safe_counts['Neutral'] / total) * 100

    pos  = safe_counts['Happiness'] + safe_counts['Surprise']
    neg  = safe_counts['Sadness'] + safe_counts['Anger'] + safe_counts['Disgust'] + safe_counts['Fear']
    vibe = max(1.0, min(10.0, 5 + ((pos - neg) / total) * 5))

    risk = ((safe_counts['Sadness'] + safe_counts['Anger'] + safe_counts['Fear']) / total) * 100

    valid_ts   = [t for t in timestamps if t]
    attendance = max(Counter(valid_ts).values()) if valid_ts else 0

    return {
        "total_faces":     total,
        "counts":          safe_counts,
        "confusion_index": round(confusion, 1),
        "boredom_meter":   round(boredom, 1),
        "vibe_score":      round(vibe, 1),
        "at_risk_index":   round(risk, 1),
        "attendance_est":  attendance
    }


# ─── System Health ────────────────────────────────────────────────────────────────
def get_system_health() -> dict:
    return {
        "cpu_usage": psutil.cpu_percent(),
        "ram_usage": psutil.virtual_memory().percent
    }


# ─── PDF Report ───────────────────────────────────────────────────────────────────
def generate_pdf(session_info: dict, before_stats: dict, after_stats: dict, confirmed_attendance: int = 0) -> str:
    filename = f"report_{uuid.uuid4()}.pdf"
    c = canvas.Canvas(filename, pagesize=letter)

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 750, "Student Emotion Analysis Report")
    c.setFont("Helvetica", 12)
    c.drawString(50, 725, f"Generated : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    c.drawString(50, 710, f"Class     : {session_info.get('class_name', 'N/A')}")
    c.drawString(50, 695, f"Instructor: {session_info.get('instructor', 'N/A')}")

    c.setFont("Helvetica-Bold", 13)
    c.drawString(50, 670, f"Confirmed Attendance (min of entry/exit): {confirmed_attendance} students")

    def draw_stats(title, stats, start_y):
        y = start_y
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, title);                                                    y -= 20
        c.setFont("Helvetica", 12)
        c.drawString(50, y, f"Vibe Score      : {stats['vibe_score']} / 10");          y -= 15
        c.drawString(50, y, f"Attendance Est  : {stats['attendance_est']}");           y -= 15
        c.drawString(50, y, f"Confusion Index : {stats['confusion_index']}%");         y -= 15
        c.drawString(50, y, f"Boredom Meter   : {stats['boredom_meter']}%");           y -= 15
        c.drawString(50, y, f"At-Risk Index   : {stats['at_risk_index']}%");           y -= 15
        c.drawString(50, y, f"Total Readings  : {stats['total_faces']}");              y -= 20
        c.setFont("Helvetica-Bold", 11)
        c.drawString(50, y, "Emotion Breakdown:");                                     y -= 15
        c.setFont("Helvetica", 11)
        for emo, cnt in stats['counts'].items():
            pct = round((cnt / stats['total_faces']) * 100, 1) if stats['total_faces'] else 0
            c.drawString(60, y, f"{emo:<12}: {cnt:>4}  ({pct}%)")
            y -= 14
        return y

    y = draw_stats("── Before Class ──", before_stats, 645)
    y -= 20
    draw_stats("── After Class ──", after_stats, y)

    c.save()
    print(f"[PDF] Report saved → {filename}")
    return filename