# Analyzing Student Behavior Before and After Classroom Sessions

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Backend-FastAPI-blue)
![React](https://img.shields.io/badge/Frontend-React%20Vite-cyan)
![Database](https://img.shields.io/badge/DB-PostgreSQL-blueviolet)

**BehaviorAnalyzer** is an advanced AI-based platform designed to analyze student behavior and emotional states before and after classroom sessions. It utilizes Computer Vision (OpenCV & TensorFlow) for real-time emotion detection and Large Language Models (Groq/Llama-3) for pedagogical coaching.

## 🚀 Key Features

*   **Dual-Phase Monitoring:** Simultaneous "Entry" and "Exit" video feeds to track emotional shifts.
*   **Smart Face Detection:** Real-time facial recognition with bounding boxes and emotion labeling overlay.
*   **Real-time Analytics:** Live calculation of **Vibe Score**, **Confusion Index**, and **Boredom Meter**.
*   **AI Assistant:** Integrated Chatbot powered by **Llama-3** to provide teaching advice based on live class data.
*   **Smart Alerts:** Automated detection of "High Risk" or "Low Engagement" states.
*   **Report Generation:** One-click PDF export of session summaries.
*   **Secure Auth:** JWT-based Login/Signup system with role management.

---

## 🛠 Tech Stack

*   **Frontend:** React.js, Vite, Tailwind CSS (Luminous Pro Refined Design), Recharts, Lucide Icons.
*   **Backend:** Python FastAPI, SQLAlchemy, Pydantic.
*   **AI/ML:** TensorFlow/Keras (Emotion Recognition), LangChain + Groq API (Llama-3).
*   **Database:** PostgreSQL.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
1.  **Node.js & npm** (v18+)
2.  **Python** (v3.9+)
3.  **PostgreSQL Database**
4.  **Groq API Key** (Get one at [console.groq.com](https://console.groq.com))

---

## ⚙️ Installation Guide

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Analyzing-Student-Behavior-Before-and-After-Classroom-Sessions.git
cd Analyzing-Student-Behavior-Before-and-After-Classroom-Sessions
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Environment Configuration**
Create a `.env` file inside the `backend/` folder:
```env
DATABASE_URL="postgresql://user:password@localhost/dbname"
SECRET_KEY="your_super_secret_key"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=60
GROQ_API_KEY="your_groq_api_key"
ALLOWED_ORIGINS="http://localhost:5173"
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file for Vite
echo "VITE_API_URL=http://localhost:8000" > .env
```

### 4. How to Run
You need two terminals running simultaneously.

**Terminal 1: Backend**
```bash
cd backend
# Ensure venv is active
uvicorn main:app --reload
# Server starts at: http://localhost:8000
```

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
# App starts at: http://localhost:5173
```