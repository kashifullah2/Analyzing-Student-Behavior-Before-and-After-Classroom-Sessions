# Complete Startup Guide - BehaviourAnalyzer with uv

## 🎯 Quick Start (Development)

### Terminal 1: Backend (with uv)
```bash
cd /home/kashifullah/BehaviourAnalyzer
source /home/kashifullah/ai/bin/activate
cd backend
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Expected Output:
```
✓ Using device: cpu
✓ Emotion Model (best.pt) Loaded Successfully via YOLO
✓ YOLOv8 Face Detection Model Loaded Successfully
INFO:     Started server process [PID]
INFO:     Application startup complete.
```

### Terminal 2: Frontend (with npm)
```bash
cd /home/kashifullah/BehaviourAnalyzer/frontend
npm install  # First time only
npm run dev
```

Visit: `http://localhost:5173`

---

## 🔧 Initial Setup (One-time)

### 1. Install Backend Dependencies with uv
```bash
cd /home/kashifullah/BehaviourAnalyzer/backend
source /home/kashifullah/ai/bin/activate
uv pip install -r requirements.txt
```

### 2. Setup Database
```bash
cd /home/kashifullah/BehaviourAnalyzer/backend
python migrate.py
```

### 3. Install Frontend Dependencies
```bash
cd /home/kashifullah/BehaviourAnalyzer/frontend
npm install
```

---

## 📋 Service Status Checks

### Verify Backend is Running
```bash
curl http://localhost:8000/docs
```
(Should open Swagger API documentation)

### Verify Models are Loaded
```bash
source /home/kashifullah/ai/bin/activate
cd backend
uv run python -c "from services import _yolo_model, _emotion_model, load_models; load_models(); print('✓ Models OK' if _yolo_model and _emotion_model else '⚠️  Model Load Failed')"
```

### Run Test
```bash
source /home/kashifullah/ai/bin/activate
cd /home/kashifullah/BehaviourAnalyzer
uv run python test_backend.py
```

---

## 🛠 Common Commands with uv

### Install a Single Package
```bash
source /home/kashifullah/ai/bin/activate
uv pip install package_name
```

### Freeze Requirements
```bash
source /home/kashifullah/ai/bin/activate
uv pip freeze > requirements.txt
```

### Run Python Script
```bash
source /home/kashifullah/ai/bin/activate
uv run python script.py
```

### Run with Arguments
```bash
source /home/kashifullah/ai/bin/activate
uv run python -m module.name --arg value
```

---

## 📊 Architecture

```
┌─────────────────────────────────────┐
│     Frontend (React + Vite)         │
│   http://localhost:5173             │
└──────────────┬──────────────────────┘
               │ HTTP/REST
               ▼
┌─────────────────────────────────────┐
│  Backend (FastAPI + uvicorn)        │
│  http://localhost:8000              │
│  /docs for API documentation        │
└──────┬────────────────────┬─────────┘
       │                    │
       ▼                    ▼
┌──────────────┐      ┌──────────────┐
│  PostgreSQL  │      │   Models     │
│  Database    │      │ (best.pt,    │
│              │      │  yolov8n-..) │
└──────────────┘      └──────────────┘
```

---

## 💡 Tips & Tricks

### Use UV for Faster Package Management
`uv` is significantly faster than `pip`:
```bash
# Instead of: pip install -r requirements.txt
uv pip install -r requirements.txt

# Instead of: pip install package
uv pip install package
```

### Check Python Version
```bash
source /home/kashifullah/ai/bin/activate
python --version
```

### Activate Environment Permanently (in .bashrc)
```bash
echo 'source /home/kashifullah/ai/bin/activate' >> ~/.bashrc
source ~/.bashrc
```

### Run Backend in Production
```bash
source /home/kashifullah/ai/bin/activate
cd backend
uv run gunicorn main:app -b 0.0.0.0:8000 -w 4 --timeout 120
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Models not loading | `uv run python -c "from services import load_models; load_models()"` |
| Port 8000 already in use | `lsof -i :8000` then `kill -9 PID` |
| CORS errors in frontend | Check `ALLOWED_ORIGINS` in `.env` |
| Webcam not detected | Check `/dev/video0` permissions |
| GPU not detected | Check CUDA installation: `uv run python -c "import torch; print(torch.cuda.is_available())"` |

