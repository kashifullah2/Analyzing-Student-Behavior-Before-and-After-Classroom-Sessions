# Face Detection - Setup & Usage Guide

## ✅ What Was Fixed

1. **YOLO Model Loading** - Added proper error handling and validation for face detection
2. **Emotion Model Integration** - Updated `best.pt` to load via YOLO ultralytics instead of raw PyTorch
3. **Fallback Detection** - Faces are now detected and returned even if emotion detection temporarily fails
4. **Dependencies** - Added `ultralytics` to requirements.txt for YOLO functionality

## 🚀 Running with `uv`

### 1. Activate the Environment
```bash
source /home/kashifullah/ai/bin/activate
```

### 2. Install Dependencies (First Time)
```bash
cd /home/kashifullah/BehaviourAnalyzer/backend
uv pip install -r requirements.txt
```

### 3. Start the Backend Server
```bash
cd /home/kashifullah/BehaviourAnalyzer/backend
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The `--reload` flag enables hot-reload during development. Remove it for production:
```bash
uv run uvicorn main:app --host 0.0.0.0 --port 8000
```

### 4. Test Face Detection
```bash
# In a new terminal, from project root
source /home/kashifullah/ai/bin/activate
uv run python test_backend.py
```

## 📊 Expected Output

```
✓ Response received
📊 Faces detected: 1
   Face 1: happy, BBox: [181, 206, 135, 169]
```

## 🔧 Models Used

| Model | File | Purpose |
|-------|------|---------|
| YOLOv8 Face Detection | `yolov8n-face.pt` | Face boundary detection |
| Emotion Classification | `best.pt` | Emotion classification (Happy, Sad, Angry, etc.) |

## 📡 API Endpoints

### Analyze Frame (Entry/Exit)
```bash
POST /sessions/{session_id}/analyze
Content-Type: multipart/form-data

file: [image file]
type: entry | exit | video
```

### Response
```json
{
  "results": [
    {
      "emotion": "happy",
      "bbox": [x, y, width, height]
    }
  ]
}
```

## 🎯 Key Features

- ✓ Real-time face detection with bounding boxes
- ✓ 7-class emotion classification (Angry, Disgust, Fear, Happy, Sad, Surprise, Neutral)
- ✓ Frame caching for performance (YOLO runs every 5 frames by default)
- ✓ GPU support (auto-detects CUDA if available, falls back to CPU)
- ✓ Batch emotion prediction for efficiency

## 📝 Notes

- The backend requires a valid database connection for session management
- Models are loaded once at startup and cached globally for performance
- Frame skipping reduces computational load while maintaining accuracy
