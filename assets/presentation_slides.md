---
marp: true
theme: default
class: lead
backgroundColor: #f8f9fa
paginate: true
---

# Analyzing Student Behavior Before and After Classroom Sessions
### An AI-Based Approach for Educational Assessment

**Student Name:** Kashifullah
**Institution:** [Insert University/College Name]

---

# 1. Background and Motivation

- Traditional teaching lacks immediate, objective feedback on student engagement.
- Instructors struggle to assess the collective emotional state of a classroom in real-time.
- **Why it matters:** Emotion directly impacts learning outcomes, retention, and comprehension.
- **The Goal:** Build an automated system that objectively measures classroom emotional shifts across a lecture.

---

# 2. Problem Statement

How can educators quantitatively measure the *emotional impact* of a lecture on an entire class? 

Current methods (surveys, subjective observation) are slow, biased, or disruptive. There is an absence of an automated, temporally aware tool that can monitor emotional distribution and provide actionable pedagogical advice instantly.

---

# 3. Project Objectives

1. Develop a **Facial Emotion Recognition (FER)** pipeline to classify student emotions.
2. Design a **Dual-Phase Monitoring System** (entry vs. exit) to calculate the "Emotional Shift".
3. Compute structured **Engagement Metrics** (Vibe Score, Confusion Index, Boredom Meter).
4. Integrate an **AI Pedagogical Coach** (LLM) to provide context-aware teaching advice based on session data.
5. Provide a seamless **web-based Dashboard** for live monitoring and PDF reporting.

---

# 4. System Architecture

The project employs a modern **3-Tier Client-Server Architecture**:

- **Frontend (Presentation):** React.js + Vite + Tailwind CSS. Handles UI, routing, and media capture.
- **Backend (Application Logic):** Python FastAPI. Handles video multiprocessing, API endpoints, AI LLM (Groq), and OpenCV pipeline.
- **Database (Data Storage):** PostgreSQL + SQLAlchemy ORM. Stores users, session records, emotion data points, and chat logs securely (Bcrypt/JWT).

---

# 5. Core Methodology: Computer Vision

- **Student Detection (Counting):** Ultralytics **YOLOv8** (`yolov8n.pt`). Detects human bodies robustly, ensuring highly accurate student attendance estimates.
- **Emotion Classification:**
  - Extracts the estimated head region from the YOLO bounding box.
  - Generates predictions using **EfficientNet-B0** (Validation Accuracy: ~77.6%, Params: ~5.3M).
  - Fine-tuned on the **FER2013** dataset (35,000 images, 7 classes).

---

# 6. Novel Engagement Metrics

Raw emotion labels (Happy, Neutral, Sad, Surprise, Angry, Fear, Disgust) are aggregated into actionable indices:

- **Vibe Score (1-10):** Ratio of positive to negative emotions.
- **Boredom Meter (%):** Proportion of 'Neutral' detections.
- **Confusion Index (%):** Proportion of 'Surprise' and 'Fear'.
- **At-Risk Index (%):** Proportion of 'Sad', 'Angry', and 'Fear'.
- **Estimated Attendance:** Peak simultaneous faces detected in a single timestamp.

---

# 7. AI Pedagogical Coach

- Powered by **Meta Llama-3** (qwen/qwen3-32b) via the **Groq API**.
- Orchestrated using **LangChain**.
- **How it works:** 
  - The backend injects real-time session statistics (Vibe Score, Confusion %, etc.) into a hidden System Prompt.
  - The instructor asks a question (e.g., *"Why is my class so confused?"*).
  - The LLM replies with highly context-aware, tailored pedagogical advice.

---

# 8. Experimental Results

**Model Benchmarking on FER2013:**
- Custom CNN: 51.9%
- ResNet-50: 72.4%
- **EfficientNet-B0: 77.6% (Deployed Model)**

**System Level Results:**
Simulated sessions correctly identified positive emotional shifts.
*Example:* 'Happy' detections increased from 15% (entry) to 35% (exit), while 'Sad' detections dropped from 18% to 8%. The **Vibe Score** rose from 4.2 to 7.8/10.

*(Refer to thesis plots for graphical analysis charts)*

---

# 9. System Interface & Features
*(Optional: Insert Project Screenshots Here)*

1. **Dashboard:** Live updating charts built with Recharts.
2. **Live Monitor:** Camera feed or asynchronous batch video uploads.
3. **AI Assistant:** Real-time chat interface parsing LLM feedback.
4. **Session Archives:** Browse history and restore old sessions.

---

# 10. Limitations Identified

1. **Resolution & Class Imbalance:** FER2013 images are 48x48. Model struggles differentiating 'Disgust' from 'Angry' due to dataset imbalance.
2. **Face ROI Estimation:** Relying on the top 25% of YOLO's body bbox works well for sitting students, but can be less precise if students are standing or slouching.
3. **No Temporal Sequence:** Analysis is frame-by-frame; struggles to track identical students across time (no tracking IDs).

---

# 11. Future Work

- **Dedicated Face Detectors:** Upgrade from bounding box estimation to precise facial landmarking via RetinaFace.
- **Dataset Expansion:** Retrain on high-resolution datasets like AffectNet (224x224, 1M+ images) using Focal Loss to fix imbalance.
- **Multimodal Architectures:** Combine facial data with posture estimation, audio sentiment (speech tone), and sequence tracking models (LSTMs).

---

# 12. Conclusion

**BehaviorAnalyzer** successfully proves the feasibility of fully automated classroom emotional assessment. 

By combining Deep Learning (CV), modern web stacks, and Generative AI (LLMs), the platform empowers educators to shift from intuition-based teaching to data-driven pedagogical improvement.

---

# Questions?

Thank you for your time and attention. 

**Demonstration Available Upon Request.**
