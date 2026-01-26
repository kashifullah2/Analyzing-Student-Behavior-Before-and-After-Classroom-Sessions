# Analyzing-Student-Behavior-Before-and-After-Classroom-Sessions

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Backend-FastAPI-blue)
![React](https://img.shields.io/badge/Frontend-React%20Vite-cyan)
![Database](https://img.shields.io/badge/DB-PostgreSQL-blueviolet)

**Analyzing-Student-Behavior-Before-and-After-Classroom-Sessions** is an advanced AI-based platform designed to analyze student behavior and emotional states before and after classroom sessions. It utilizes Computer Vision (OpenCV & TensorFlow) for real-time emotion detection and Large Language Models (Groq/Llama-3) for pedagogical coaching.

## 🚀 Key Features

* **Dual-Phase Monitoring:** Simultaneous "Entry" and "Exit" video feeds to track emotional shifts.
* **Real-time Analytics:** Live calculation of **Vibe Score**, **Confusion Index**, and **Boredom Meter**.
* **AI Pedagogical Coach:** Integrated Chatbot powered by Llama-3 to provide teaching advice based on live class data.
* **Smart Alerts:** Automated detection of "High Risk" or "Low Engagement" states.
* **Report Generation:** One-click PDF export of session summaries.
* **Secure Auth:** JWT-based Login/Signup system with role management.

---

## 🛠 Tech Stack

* **Frontend:** React.js, Vite, Tailwind CSS (Horizon/Midnight Themes), Recharts, Lucide Icons.
* **Backend:** Python FastAPI, SQLAlchemy, Pydantic.
* **AI/ML:** TensorFlow/Keras (Emotion Recognition), LangChain + Groq API (Chatbot).
* **Database:** PostgreSQL.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
1.  **Node.js & npm** (v16+)
2.  **Python** (v3.9+)
3.  **PostgreSQL Database**
4.  **Groq API Key** (Get one at [console.groq.com](https://console.groq.com))

---

## ⚙️ Installation Guide

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/edumotion-ai.git](https://github.com/your-username/edumotion-ai.git)
cd edumotion-ai


🪟 Windows

1️⃣ Download Node.js

Go to 👉 https://nodejs.org

Install LTS version

npm installs automatically

cd backend
# Create virtual environment
python -m venv venv
# Activate environment
.\venv\Scripts\activate
# Install dependencies
pip install -r requirements.txt

## 🐧 Linux / macOS
sudo apt update
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs


cd backend
# Create virtual environment
python3 -m venv venv
# Activate environment
source venv/bin/activate
# Install dependencies
pip install -r requirements.txt


3. Environment Configuration
Create a .env file inside the backend/ folder and add your credentials:

DATABASE_URL="POSTGRESS_URL"
SECRET_KEY="your_super_secret_random_string"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=60
GROQ_API_KEY="your_groq_api_key_here"


4. Frontend Setup (React)
Open a new terminal window:

cd frontend
# Install dependencies
npm install
# Install UI libraries
npm install axios react-router-dom lucide-react recharts

🏃‍♂️ How to Run
You need two terminals running simultaneously.

Terminal 1: Backend

# Inside /backend folder (ensure venv is active)
uvicorn main:app --reload

Server will start at: http://localhost:8000

Terminal 2: Frontend
Server will start at: http://localhost:8000

Terminal 2: Frontend