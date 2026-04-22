# BehaviorAnalyzer — Viva Interview Questions & Answers

> **Project:** Analyzing Student Behavior Before and After Classroom Sessions
> **Total Questions:** 70 (10 Easy + 10 Medium + 10 Hard + 10 Tricky + 30 Theoretical)
> All answers are in **simple, easy-to-explain words** — perfect for viva preparation.

---

## 🟢 PART 1 — EASY QUESTIONS (10)

---

**Q1. What is your project about? Explain in 2-3 lines.**

**Answer:** My project is called **BehaviorAnalyzer**. It uses a camera to detect student emotions (like happy, sad, bored) when they **enter** the classroom and again when they **exit**. By comparing both, the teacher can see if the lecture improved or worsened student mood.

---

**Q2. What programming languages did you use and where?**

**Answer:** I used **Python** for the backend (API, AI model, database logic) and **JavaScript** for the frontend (the website that teachers use). Python handles the "brain" and JavaScript handles the "face" of the application.

---

**Q3. What are the 7 emotions your system can detect?**

**Answer:** The 7 emotions are: **Happy, Sad, Angry, Neutral, Fear, Disgust, and Surprise**. These are defined in my `services.py` file as:
```python
EMOTIONS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
```

---

**Q4. What dataset did you use to train your emotion model?**

**Answer:** I used **FER2013** (Facial Expression Recognition 2013). It has around **58,454 grayscale images** of size **48×48 pixels**, each labeled with one of the 7 emotions. It is a free, publicly available benchmark dataset.

---

**Q5. What is the "Vibe Score" in your dashboard?**

**Answer:** The Vibe Score is a number from **1 to 10** that shows the overall "mood" of the class. It starts at 5 (neutral). If more students are Happy or Surprised, the score goes **up**. If more are Sad, Angry, or Fearful, it goes **down**. The exact formula in my `services.py` is:
```python
vibe = 5 + ((positive - negative) / total) * 5
```

---

**Q6. What is FastAPI and why did you use it?**

**Answer:** **FastAPI** is a modern Python web framework for building APIs. I used it because:
1. It is **very fast** (built on async Python).
2. It **auto-generates API documentation** (Swagger UI at `/docs`).
3. It has built-in **data validation** using Pydantic models.
My backend app is created in `main.py` as: `app = FastAPI(title="Analyzing Student Behavior...")`.

---

**Q7. What database did you use, and can your system also work without PostgreSQL?**

**Answer:** I primarily used **PostgreSQL**. But I also wrote a **fallback** in my `database.py` — if the `DB_URL` environment variable is missing, the system automatically switches to **SQLite** (a local file-based database called `app.db`):
```python
if not SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"
```
So yes, it works without PostgreSQL too.

---

**Q8. How many tables does your database have? Name them.**

**Answer:** My database has **4 tables**, defined in `models.py`:
1. **users** — stores instructor login credentials (username, email, hashed password)
2. **sessions** — stores classroom sessions (name, class code, instructor, date)
3. **emotion_data** — stores each detected face's emotion, bounding box, and type (entry/exit/video)
4. **chat_logs** — stores the conversation between the teacher and the AI assistant

---

**Q9. What frontend framework did you use and which libraries help you show charts?**

**Answer:** I used **React.js** (version 19) with **Vite** as the build tool. For charts, I used **Recharts** — it gives me BarCharts, PieCharts, RadarCharts, and AreaCharts. For icons, I used **Lucide React**. For styling, I used **Tailwind CSS v4**. For the webcam, I used **react-webcam**.

---

**Q10. What is the "AI Pedagogical Coach" in your project?**

**Answer:** It is an AI chatbot inside my app. When the teacher types a question (like "How can I improve engagement?"), the system takes the **current classroom stats** (Vibe Score, Confusion Index, etc.) and sends them along with the question to a **Large Language Model (Llama-3)**. The AI gives **practical teaching advice** based on the real data. The code is in `ai_service.py`.

---

## 🟡 PART 2 — MEDIUM QUESTIONS (10)

---

**Q11. How does your system detect faces in a video frame? Walk through the pipeline.**

**Answer:** Here is the step-by-step pipeline from my `services.py` → `analyze_cv2_image()` function:
1. Convert the image to **grayscale** using `cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)`
2. Use **Haar Cascade Classifier** (`haarcascade_frontalface_default.xml`) to find face bounding boxes
3. For each face: **crop** the face region, **resize** it to 48×48 pixels, **normalize** pixel values (0-1)
4. Add batch and channel dimensions: shape becomes `(1, 48, 48, 1)`
5. Pass it to the **TensorFlow/Keras CNN model** → `model.predict()` returns 7 probabilities
6. Pick the highest probability using `np.argmax(pred)` → that's the predicted emotion

---

**Q12. Explain JWT authentication in your project. How does login work?**

**Answer:** When a user logs in via `POST /login`:
1. The backend checks the username against the database
2. It verifies the password using `pwd_context.verify()` (bcrypt hash comparison)
3. If correct, it creates a **JWT token**: `jwt.encode({"sub": username}, SECRET_KEY, algorithm="HS256")`
4. The token is sent back to the frontend
5. The frontend stores it in **`localStorage`** and uses it for future requests
JWT was implemented using the `python-jose` library. The algorithm is **HS256**.

---

**Q13. What is "Haar Cascade" and why did you use it for face detection?**

**Answer:** Haar Cascade is a **pre-trained face detection algorithm** built into OpenCV. It uses patterns of light and dark regions (called Haar features) to quickly find faces in an image. I used it because:
- It's **fast** and works in real-time
- It comes **built-in** with OpenCV (no extra download needed)
- It works well for **frontal face detection**
In my code: `face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')`

---

**Q14. How does your system handle video file uploads without freezing the server?**

**Answer:** Video processing is CPU-heavy and blocking. If I run it on the main thread, the whole server would freeze. So I used **`run_in_threadpool`** from FastAPI:
```python
from fastapi.concurrency import run_in_threadpool
results = await run_in_threadpool(services.process_video_file, await file.read())
```
This runs the video processing in a **background thread**, keeping the server responsive for other users. Also, I only process **1 frame per second** (not all 30 fps), which reduces the load by ~30x.

---

**Q15. How do you calculate the "Confusion Index" and "Boredom Meter"?**

**Answer:** Both are calculated in `services.py` → `calculate_advanced_stats()`:
- **Confusion Index** = % of students showing **Surprise + Fear** (these suggest the student doesn't understand):
  ```python
  confusion = ((counts['Surprise'] + counts['Fear']) / total) * 100
  ```
- **Boredom Meter** = % of students showing **Neutral** (flat, unengaged expression):
  ```python
  boredom = (counts['Neutral'] / total) * 100
  ```

---

**Q16. What is Pydantic and how do you use it?**

**Answer:** **Pydantic** is a Python library for **data validation**. When the frontend sends data to my API, Pydantic checks if the data is correct before processing it. For example, my `schemas.py` has:
```python
class UserSignup(BaseModel):
    username: str
    email: str
    phone: str
    gender: str
    address: str
    password: str
    confirm_password: str
```
If someone sends a signup request without an email, FastAPI will automatically return a **422 error** (Unprocessable Entity) — I don't need to write that check manually.

---

**Q17. Explain the `get_db()` dependency function. Why does it use `yield`?**

**Answer:** The `get_db()` function in `database.py` opens a database connection for each API request and **automatically closes it** when the request finishes:
```python
def get_db():
    db = SessionLocal()
    try:
        yield db  # gives the connection to the route
    finally:
        db.close()  # always closes, even if there's an error
```
The `yield` keyword makes it a **generator**. FastAPI uses it as a **dependency injection** — every route that needs the database just writes `db: Session = Depends(database.get_db)` and gets a fresh, safe connection.

---

**Q18. How does the frontend communicate with the backend?**

**Answer:** The frontend uses **Axios** (an HTTP client library). I configured it in `api.js`:
```javascript
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});
```
All components (Dashboard, LiveSession, AICoach, etc.) import this `api` object and make calls like:
- `api.get('/sessions/{id}/report')` — fetches stats
- `api.post('/sessions/{id}/analyze', formData)` — sends a captured frame
- `api.post('/sessions/{id}/chat', { question })` — sends AI question
The base URL comes from an **environment variable** (`VITE_API_URL`).

---

**Q19. What is CORS and why did you need it?**

**Answer:** **CORS (Cross-Origin Resource Sharing)** is a security rule in browsers. My frontend runs on `localhost:5173` (Vite) and my backend runs on `localhost:8000` (FastAPI). By default, the browser **blocks** requests between different ports. So I added CORS middleware in `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
This tells the browser: "It's okay, allow the frontend to talk to this backend."

---

**Q20. How does your "Session History" feature work?**

**Answer:** The `GET /sessions/history` endpoint in `main.py`:
1. Fetches **all sessions** from the database
2. For each session, it also queries the **entry emotion data**
3. It calculates stats (vibe_score, attendance) using `calculate_advanced_stats()`
4. Returns everything sorted by **date (newest first)**
On the frontend, `SessionHistory.jsx` shows this in a table with **search/filter** functionality. Teachers can click "View Report" to **restore** any past session and see its full dashboard again.

---

## 🔴 PART 3 — TOUGH / HARD QUESTIONS (10)

---

**Q21. Explain the CNN architecture you used. How many layers, what does each block do?**

**Answer:** My model has **4 convolutional blocks** + **3 dense layers** + **1 output layer**. Total: ~4.74 million parameters.

Each convolutional block does:
1. **Conv2D** (3×3 filters) — scans the image to find patterns like edges and curves
2. **BatchNormalization** — keeps values stable for faster training
3. **ReLU** activation — adds non-linearity (allows learning complex patterns)
4. **MaxPooling2D** (2×2) — halves the image size, keeping important features
5. **Dropout** (0.25) — randomly disables neurons to prevent overfitting

Filter progression: **64 → 128 → 512 → 512** (gets deeper to learn more complex features).

After flattening (3×3×512 = 4608 values), three Dense layers (256 → 512 → 512) process the features. The final layer has **7 neurons with Softmax**, giving a probability for each emotion.

---

**Q22. What is the Singleton Pattern and how did you implement it for model loading?**

**Answer:** Loading the `.h5` model file (57 MB) from disk is slow. The Singleton Pattern ensures it's loaded **only once**. In my `services.py`:
```python
_model = None  # global variable

def get_model():
    global _model
    if _model is not None:
        return _model  # already loaded, just return it
    try:
        _model = load_model(MODEL_PATH)
    except:
        _model = None  # fallback: return Neutral for all
    return _model
```
The first request loads the model. Every subsequent request reuses `_model` from memory — no disk I/O needed. If the model file is missing, the system gracefully falls back to labeling everything as "Neutral."

---

**Q23. How does LangChain connect your backend to the Groq LLM? Trace the full flow.**

**Answer:** In `ai_service.py`:
1. A `ChatGroq` client is created with the API key: `llm = ChatGroq(model="qwen/qwen3-32b", temperature=0.7, max_tokens=100)`
2. When a teacher asks a question, `ask_teaching_assistant()` is called
3. It builds a **context string** with live classroom data (Vibe Score, Confusion %, Boredom %, Attendance)
4. A **ChatPromptTemplate** combines the system role ("You are an AI Pedagogical Coach...") with the context and the user's question
5. The chain is built: `chain = prompt | llm | StrOutputParser()`
6. `chain.invoke()` sends the prompt to **Groq's API** (which runs the LLM on ultra-fast hardware)
7. The response is parsed to plain text and returned

The `|` (pipe) operator is LangChain's **LCEL (LangChain Expression Language)** — it chains prompt → model → output parser together.

---

**Q24. What is Categorical Cross-Entropy and why is it the right loss function here?**

**Answer:** **Categorical Cross-Entropy** measures how wrong the model's predicted probabilities are compared to the true label. 

For example, if the true emotion is "Happy" = `[0,0,0,1,0,0,0]` and the model predicts `[0.1, 0, 0, 0.7, 0.1, 0, 0.1]`, cross-entropy calculates the "distance" between these two. The model's goal during training is to **minimize** this distance.

It's the right choice because:
- We have a **multi-class** problem (7 emotions, only 1 correct)
- Labels are **one-hot encoded** (a vector of 0s and 1s)
- Softmax output + Cross-Entropy loss = mathematically the most efficient combination for classification

---

**Q25. What are Batch Normalization and Dropout? Why do you use both together?**

**Answer:** 
- **Batch Normalization** normalizes the values flowing through the network after each layer. This speeds up training and makes it more stable — without it, values can become very large or very small, causing the model to learn slowly.
- **Dropout (0.25)** randomly turns off 25% of neurons during each training step. This forces the model to not rely on any single neuron and prevents **overfitting** (memorizing the training data instead of learning patterns).

I use them **together** because they solve different problems: BatchNorm helps the model **learn faster**, and Dropout helps the model **generalize better**. My model achieved 97.83% accuracy with this combination.

---

**Q26. How does your `process_video_file()` function work? Explain the sampling strategy.**

**Answer:** In `services.py`:
```python
def process_video_file(video_bytes):
    # 1. Save video bytes to a temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tfile:
        tfile.write(video_bytes)

    # 2. Open with OpenCV
    cap = cv2.VideoCapture(temp_filename)
    frame_rate = cap.get(cv2.CAP_PROP_FPS) or 30
    frame_interval = int(frame_rate)  # skip this many frames = 1 frame/sec

    # 3. Process only every Nth frame (1 per second)
    count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        if count % frame_interval == 0:  # only every 1 second
            results = analyze_cv2_image(frame)
        count += 1

    # 4. Clean up temp file
    os.unlink(temp_filename)
```
Instead of analyzing all 30 frames per second, I analyze only **1 frame per second** — this reduces work by **30x** while still capturing enough data for meaningful statistics.

---

**Q27. How does the Dashboard component poll for real-time updates?**

**Answer:** In `Dashboard.jsx`, I use `setInterval` inside a `useEffect` hook:
```javascript
useEffect(() => {
    const fetchData = async () => {
        const res = await api.get(`/sessions/${sessionId}/report`);
        setData(res.data);
    };
    const interval = setInterval(fetchData, 2000); // every 2 seconds
    return () => clearInterval(interval); // cleanup on unmount
}, [sessionId]);
```
Every **2 seconds**, the Dashboard asks the backend for the latest entry/exit stats. The returned data includes emotion counts, Vibe Score, Confusion Index, etc. The charts (Bar and Pie) update automatically because React **re-renders** when `setData()` changes the state. The cleanup function `clearInterval` prevents memory leaks when the component unmounts.

---

**Q28. What is SQLAlchemy ORM and how does `create_all()` work?**

**Answer:** **SQLAlchemy** is a Python library that lets me work with databases using Python classes instead of raw SQL. It's called an **ORM (Object-Relational Mapper)** because it maps Python objects to database tables.

In `models.py`, I define classes like:
```python
class EmotionData(Base):
    __tablename__ = "emotion_data"
    id = Column(Integer, primary_key=True)
    emotion = Column(String(20))
    ...
```
Then in `main.py`, I call:
```python
models.Base.metadata.create_all(bind=database.engine)
```
This looks at all my model classes and **automatically creates the SQL tables** in the database if they don't exist. No need to write `CREATE TABLE` SQL queries manually. This makes the app **self-initializing** — fresh installation just works.

---

**Q29. How does the `MediaCapture.jsx` component handle both webcam and file upload?**

**Answer:** `MediaCapture.jsx` has a `mode` state (`'webcam'` or `'upload'`):

**Webcam mode:**
- Uses `react-webcam` to show a live camera feed
- Every **800ms**, `captureAndDetect()` takes a screenshot → sends it to `POST /sessions/{id}/analyze` → draws **bounding boxes + emotion labels** on a canvas overlaying the video

**Upload mode:**
- Shows a drag-and-drop area
- When a file is selected, it checks if it's an **image** or **video**
- Images go to `/analyze`, videos go to `/analyze_video`
- For images, bounding boxes are drawn on an overlay canvas using the `drawBoxes()` helper function

The component also draws **green bounding boxes** with emotion labels on detected faces using Canvas 2D API, handling both mirrored webcam and normal upload orientations.

---

**Q30. How does password hashing work in your signup flow?**

**Answer:** In `main.py`, I use **passlib** with the **bcrypt** algorithm:
```python
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
```
During **signup**: `hashed_pw = pwd_context.hash(user.password)` — this converts "mypassword123" into something like "$2b$12$LJ3..." which is impossible to reverse.

During **login**: `pwd_context.verify(user.password, db_user.hashed_password)` — this checks if the plain password matches the hash **without ever decrypting** the hash.

Even if a hacker steals the database, they can't see the real passwords. This is a **one-way function** — you can hash forward but never reverse it.

---

## 🟠 PART 4 — TRICKY QUESTIONS (10)

---

**Q31. Your `services.py` uses Haar Cascade, but your thesis mentions YOLOv8. Which one does the actual code use?**

**Answer:** Good catch — **the running code** in `services.py` uses **Haar Cascade** (`haarcascade_frontalface_default.xml`) for face detection. However, I also have `yolov8n.pt` and `yolov8n-face.pt` files in the backend directory. The thesis describes the YOLOv8-based approach as the **intended/advanced version**, where YOLOv8 detects the full body and the top 25% is cropped for the face. The current deployed code uses Haar Cascade as a **simpler, lighter-weight alternative** that works well for frontal classroom scenarios. YOLOv8 was benchmarked as a classification model (YOLOv8m-cls) for accuracy comparison.

---

**Q32. What happens if the face_model.h5 file is missing? Does the whole system crash?**

**Answer:** No! The system has a **graceful fallback** built into `get_model()`:
```python
if os.path.exists(MODEL_PATH):
    _model = load_model(MODEL_PATH)
else:
    _model = None
    print("⚠ Model not found. Running in Simulation Mode.")
```
And in `analyze_cv2_image()`:
```python
if model_instance:
    emotion = EMOTIONS[np.argmax(pred)]
else:
    emotion = "Neutral"  # fallback
```
So the system runs in **"Simulation Mode"** — it detects faces but labels everything as "Neutral." This means the dashboard, charts, AI coach, and PDF export all still work. Only the emotion accuracy is lost.

---

**Q33. Your database uses `String(36)` for session IDs. Why not auto-increment Integer?**

**Answer:** I use **UUID** (Universally Unique Identifier) instead of sequential integers for sessions:
```python
sid = str(uuid.uuid4())  # e.g., "a3f5c7e1-..."
```
Reasons:
- **Security**: Sequential IDs (1, 2, 3...) are predictable — an attacker could guess other session URLs. UUIDs are practically impossible to guess.
- **No collisions**: Even if two servers create sessions at the same time, UUIDs won't conflict.
- **Privacy**: You can't tell how many total sessions exist by looking at one ID.

---

**Q34. How does your "Attendance Estimate" actually work? Is it accurate?**

**Answer:** In `calculate_advanced_stats()`:
```python
valid_timestamps = [t for t in timestamps if t]
attendance = max(Counter(valid_timestamps).values()) if valid_timestamps else 0
```
It counts the **most faces detected in any single timestamp** (i.e., a single frame). If one frame captured 28 faces and another captured 25, the attendance estimate is **28**.

**Limitations:**
- If a student's face is blocked by someone else → **not counted**
- If a student is outside the camera's view → **not counted**
- If the same student appears after moving → could be **double-counted**
So it's an **estimate**, not an exact headcount.

---

**Q35. Your frontend stores the JWT token in localStorage. Is this secure?**

**Answer:** It's a common approach for **prototypes and thesis projects**, but in a production app, it has a security risk called **XSS (Cross-Site Scripting)**. If someone injects malicious JavaScript into the page, they could read `localStorage` and steal the token.

A more secure alternative would be to store the token in an **HTTP-only cookie**, which JavaScript cannot access. However, for this academic project and local deployment, `localStorage` is acceptable and widely used in React tutorials and NextAuth examples.

---

**Q36. What would happen if two teachers open the same session simultaneously?**

**Answer:** The system **would actually handle it**, but with a caveat. Both teachers would hit the same session endpoints and their data would be **mixed together** in the `emotion_data` table. The stats would combine all detections from both sources. There's no per-user session locking in the current implementation. In a production system, I would add **session ownership** (linking sessions to user IDs) and **WebSocket-based real-time sync**.

---

**Q37. Why does your AI Coach use `max_tokens=100`? What are the trade-offs?**

**Answer:** In `ai_service.py`:
```python
llm = ChatGroq(model="qwen/qwen3-32b", temperature=0.7, max_tokens=100)
```
- **100 tokens ≈ about 75 words** — this keeps responses short and actionable, perfect for a teacher who needs quick advice during class.
- **Trade-off**: Sometimes the AI might get **cut off mid-sentence** if it tries to give a longer explanation. Increasing to 200-300 tokens would fix this but would make responses slower.
- **Temperature 0.7** means the responses are somewhat creative but still mostly focused — not too random, not too robotic.

---

**Q38. Your `database.py` has a fix for "postgres://" URLs. What is that about?**

**Answer:** This line:
```python
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
```
This is a **Heroku deployment fix**. Heroku's database addon provides a URL starting with `postgres://`, but SQLAlchemy version 1.4+ only accepts `postgresql://`. Without this fix, deploying on Heroku would crash with a "scheme not recognized" error. It shows the app was prepared for **cloud deployment**.

---

**Q39. What is the `cache_utils.py` in your backend? Is it being used?**

**Answer:** `cache_utils.py` implements an **in-memory caching system** with TTL (Time To Live). It has:
- A `Cache` class that stores key-value pairs with expiry timestamps
- Three pre-configured caches: `model_cache` (1 hour TTL), `session_stats_cache` (1 minute), `detector_cache` (1 hour)
- A `@cached` decorator for easy function-level caching

Currently, it's **defined but not actively imported** in the main application. It was prepared as an **optimization layer** — for example, to cache session stats so the database isn't queried every 2 seconds when the dashboard polls. In a production environment, this would be replaced with **Redis**.

---

**Q40. If the system says a student is "Angry" but they're just concentrating hard, how do you handle that?**

**Answer:** This is a real **limitation of facial emotion recognition**. Concentration can look like anger (furrowed eyebrows, tense jaw). The system handles this in two ways:
1. **Aggregate over many students**: One "false Angry" among 30 students doesn't change the overall Vibe Score much.
2. **Temporal comparison**: Even if the absolute labels aren't perfect, if the entry phase shows 10 "Angry" and exit shows 5 "Angry," the **relative change** is still meaningful.

However, this is fundamentally why the thesis recommends **future multimodal analysis** — adding body posture and voice tone analysis to improve accuracy beyond just facial expressions at 48×48 pixel resolution.

---

## 📋 QUICK REFERENCE: Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React.js 19, Vite 7, Tailwind CSS 4, Recharts, Axios, react-webcam, Lucide icons |
| **Backend** | Python 3.9, FastAPI, Uvicorn, SQLAlchemy ORM |
| **AI/ML** | TensorFlow/Keras (CNN model), OpenCV (face detection), NumPy |
| **LLM** | LangChain, Groq API, Llama-3 / Qwen-3 model |
| **Database** | PostgreSQL (primary), SQLite (fallback) |
| **Security** | bcrypt (passwords), JWT with HS256 (auth), CORS middleware |
| **PDF Export** | ReportLab |
| **Deployment** | Gunicorn + Uvicorn Workers (Procfile), Aptfile for system deps |
| **Utilities** | python-dotenv, psutil (system health), uuid |

---

## 📋 QUICK REFERENCE: Key Files Map

| File | Purpose |
|------|---------|
| `backend/main.py` | All API endpoints (auth, sessions, analyze, report, chat, PDF) |
| `backend/services.py` | Face detection, emotion classification, stats calculation, PDF generation |
| `backend/ai_service.py` | LangChain + Groq LLM integration for AI Coaching |
| `backend/models.py` | SQLAlchemy ORM models (4 tables) |
| `backend/schemas.py` | Pydantic validation schemas (UserSignup, UserAuth) |
| `backend/database.py` | DB engine, session factory, `get_db()` dependency |
| `backend/cache_utils.py` | In-memory caching with TTL support |
| `frontend/src/App.jsx` | Main layout, routing, session management |
| `frontend/src/api.js` | Axios instance with base URL config |
| `frontend/src/components/Dashboard.jsx` | Live metrics cards + Bar/Pie charts |
| `frontend/src/components/LiveSession.jsx` | Real-time monitoring with dual Entry/Exit feeds |
| `frontend/src/components/MediaCapture.jsx` | Webcam capture + file upload + bounding box drawing |
| `frontend/src/components/Analytics.jsx` | Radar chart + Area chart for deep analysis |
| `frontend/src/components/AICoach.jsx` | Chat interface with conversation history |
| `frontend/src/components/Auth.jsx` | Login + Signup with split-layout design |
| `frontend/src/components/SessionHistory.jsx` | Past sessions table with search filtering |
| `frontend/src/index.css` | Design system tokens, custom classes, animations |

---
---

## 🧠 PART 5 — THEORETICAL QUESTIONS (30)

> These are **concept-based** questions an examiner may ask after seeing your project. They test whether you understand the "why" behind your choices.

---

### 🔬 AI / Machine Learning Theory (10)

---

**Q41. What is a Convolutional Neural Network (CNN)? Why is it used for images?**

**Answer:** A CNN is a special type of neural network designed for image data. Instead of treating every pixel independently, it uses small **filters (kernels)** that slide over the image to detect patterns like edges, textures, and shapes. This is called **convolution**. CNNs are used for images because:
- They **share weights** across the image, so they need fewer parameters than a fully connected network
- They detect patterns **regardless of position** (a smile in the top-left is treated the same as in the bottom-right — this is called translation invariance)
- They learn **hierarchical features**: simple edges in early layers → complex features like eyes and mouths in deeper layers

---

**Q42. What is the difference between Overfitting and Underfitting?**

**Answer:**
- **Overfitting** = The model memorizes the training data too well. It gets very high accuracy on training data, but performs poorly on new unseen data. Like a student who memorizes answers but can't solve new questions.
- **Underfitting** = The model is too simple to learn the patterns. It performs poorly on both training and testing data. Like a student who didn't study enough.

In my project, I prevent overfitting using **Dropout** (randomly disabling neurons) and **BatchNormalization**. I prevent underfitting by using a sufficiently deep CNN (4 convolutional blocks + 3 dense layers).

---

**Q43. What is Transfer Learning? Why didn't you use it for your final model?**

**Answer:** Transfer Learning means taking a model that was already trained on a large dataset (like ImageNet with millions of images) and reusing its learned features for a new, smaller task. For example, ResNet-50 and EfficientNet-B0 were pretrained on ImageNet and fine-tuned on FER2013.

I benchmarked both, but my **custom CNN trained from scratch** actually outperformed them (97.83% vs 72-77%). This happened because:
- FER2013 images are **48×48 grayscale** — very different from ImageNet's large color photos
- The pretrained models learned features for general objects (cars, dogs), not specifically for facial micro-expressions
- A custom architecture tailored for small grayscale faces was more efficient

---

**Q44. What is the Vanishing Gradient Problem?**

**Answer:** During training, the model learns by sending error signals backward through the layers (called **backpropagation**). In very deep networks, these signals can become extremely tiny (vanish) as they pass through many layers. When gradients vanish, the early layers stop learning — they don't get enough signal to update their weights.

**Solutions used in my project:**
- **ReLU activation** (instead of sigmoid) — ReLU doesn't squash gradients as much
- **Batch Normalization** — keeps gradients flowing at healthy values
- **Residual connections** (used in ResNet-50) — provide shortcut paths so gradients can skip layers

---

**Q45. What is the difference between Precision, Recall, and F1-Score?**

**Answer:** Imagine the model predicts "Happy" for some faces:
- **Precision** = Of all faces the model labeled "Happy," how many were actually Happy? (Are the predictions trustworthy?)
- **Recall** = Of all truly Happy faces, how many did the model correctly find? (Did we miss any?)
- **F1-Score** = The **harmonic mean** of Precision and Recall — a single number that balances both.

Example: If 10 faces are truly Happy, the model labels 8 correctly (Recall = 80%) but also wrongly labels 2 Neutral faces as Happy (Precision = 8/10 = 80%). F1 = 80%.

I use F1-Score because **accuracy alone is misleading** with imbalanced classes (Disgust has only 992 images vs Happy's 14,586).

---

**Q46. What is a Confusion Matrix?**

**Answer:** It is a **table** that shows how well the model classified each class. Rows represent the **true label** and columns represent the **predicted label**. The diagonal cells show **correct predictions**; off-diagonal cells show **mistakes**.

For example, if 15 truly "Fear" images were predicted as "Surprise," that shows up as a number in the Fear-row, Surprise-column. This tells us which emotions are **commonly confused** with each other. In my model, Disgust/Angry and Fear/Surprise are the most confused pairs because they look visually similar at 48×48 resolution.

---

**Q47. What is Data Augmentation and why is it important?**

**Answer:** Data augmentation creates **new training samples** by applying transformations to existing images — rotating, flipping horizontally, zooming, shifting, or changing brightness. The model sees a slightly different version of each image every time.

It's important because:
- It **increases the effective dataset size** without collecting new data
- It prevents **overfitting** by adding variety
- It helps with **class imbalance** — you can augment minority classes more (like Disgust with only 992 images)

In the YOLOv8m-cls training, augmentations like **RandomResizedCrop, HorizontalFlip, and ColorJitter** were applied using Albumentations library.

---

**Q48. Explain the Adam Optimizer in simple terms.**

**Answer:** Adam (Adaptive Moment Estimation) is the algorithm that adjusts the model's weights during training. Think of it as the "teacher" that tells the model "you need to change this weight by this much."

Adam is smart because:
- It keeps a **running average of past gradients** (momentum) — so it doesn't overreact to one noisy sample
- It adjusts the **learning rate for each weight individually** — weights that change a lot get smaller steps, weights that barely move get bigger pushes
- It combines the best of two other optimizers: SGD with momentum + RMSProp

In my project: `Adam(learning_rate=0.001)` — this 0.001 is the starting step size, which ReduceLROnPlateau later reduces automatically when training stalls.

---

**Q49. What is One-Hot Encoding and why is it needed?**

**Answer:** Neural networks can't work with text labels like "Happy" or "Sad" — they only understand numbers. One-hot encoding converts each class label into a **binary vector** where only one position is 1 and the rest are 0:
- Angry → `[1, 0, 0, 0, 0, 0, 0]`
- Disgust → `[0, 1, 0, 0, 0, 0, 0]`
- Happy → `[0, 0, 0, 1, 0, 0, 0]`

Why not just use numbers (0, 1, 2...)? Because that would imply an **order** — the model would think Neutral(6) > Happy(3) > Angry(0), which is wrong. One-hot encoding treats all classes as **equally different**.

---

**Q50. What is a Large Language Model (LLM)? How is it different from your CNN?**

**Answer:**
- **LLM** (like Llama-3) is trained on billions of words of text. It understands and generates human language. It's used for chatbots, translation, writing, and reasoning.
- **CNN** is trained on images. It understands visual patterns. It's used for image classification, face detection, and object recognition.

In my project, the **CNN classifies emotions** from face images (visual task), and the **LLM provides teaching advice** based on those emotion stats (language task). They solve completely different problems and are connected through my backend — the CNN produces the data, and the LLM interprets it in natural language.

---

### 🌐 Web Development & REST API Theory (10)

---

**Q51. What is a REST API? What are the HTTP methods you used?**

**Answer:** **REST (Representational State Transfer)** is a set of rules for building web APIs. The server exposes "endpoints" (URLs), and the client sends requests to them.

HTTP methods I used:
- **GET** — retrieve data (e.g., `GET /sessions/history` fetches all past sessions)
- **POST** — send/create data (e.g., `POST /sessions/create` creates a new session, `POST /login` submits credentials)

My API is RESTful because: each URL represents a resource (`/sessions`, `/users`), and the HTTP method tells the server what to do with it.

---

**Q52. What is the difference between Client-Side Rendering (CSR) and Server-Side Rendering (SSR)?**

**Answer:**
- **CSR** (what I use): The server sends a nearly empty HTML file + JavaScript bundle. React runs **in the browser** and builds the page dynamically. The user sees a loading spinner first, then the content appears.
- **SSR**: The server generates the full HTML on each request and sends it to the browser. The user sees content immediately.

I used **CSR with Vite + React** because my app is a dashboard tool (not a public website needing SEO). The initial load is a one-time cost, and after that, navigation between Dashboard/Analytics/Chat is **instant** because React only updates cached components without full page reloads.

---

**Q53. What is the difference between Authentication and Authorization?**

**Answer:**
- **Authentication** = "Who are you?" — verifying identity. My system does this via the login form + JWT token generation.
- **Authorization** = "What are you allowed to do?" — checking permissions. My current system gives all logged-in users the same access.

In a production version, I would add **role-based authorization** — for example, only "admin" users can delete sessions, while regular teachers can only view their own sessions.

---

**Q54. What is an SPA (Single Page Application)?**

**Answer:** An SPA is a web application that loads a **single HTML page** and dynamically updates the content without refreshing the entire page. My frontend is an SPA:
- The browser loads `index.html` once
- React Router handles navigation between `/`, `/signup`, and `/dashboard`
- When you click "Dashboard" → "Analytics" → "AI Coach," React just **swaps the component** — no full page reload

Benefits: **faster navigation, smoother user experience, less server load**. Drawback: initial load is slightly slower because the entire React bundle must download first.

---

**Q55. What is `useEffect` in React and why is it important?**

**Answer:** `useEffect` is a React Hook that runs **side effects** — code that interacts with things outside the component itself, like:
- Fetching data from the API
- Setting up timers (polling every 2 seconds)
- Subscribing to events

In my project, almost every component uses `useEffect`:
- `Dashboard.jsx` → polls `/report` every 2 seconds
- `AICoach.jsx` → loads chat history on mount
- `LiveSession.jsx` → polls metrics every 2 seconds

The **cleanup function** (returned by useEffect) is crucial — it stops intervals when components unmount, preventing memory leaks.

---

**Q56. What is the difference between SQL and NoSQL databases?**

**Answer:**
- **SQL** (like PostgreSQL): Data is stored in **tables with rows and columns**. You define a strict schema first. Relationships between tables use foreign keys. Best for structured, predictable data.
- **NoSQL** (like MongoDB): Data is stored as flexible **documents (JSON-like)**. No fixed schema required. Best for unstructured or rapidly changing data.

I chose PostgreSQL (SQL) because my data is **highly structured** — every emotion record has the same fields (session_id, type, emotion, bbox, timestamp). Tables have clear relationships (sessions → emotion_data). SQL is the right choice for analytics where you need to query, filter, and aggregate data reliably.

---

**Q57. What is Middleware? Give an example from your project.**

**Answer:** Middleware is code that runs **between** receiving a request and executing the endpoint — like a security checkpoint at an airport.

In my project, **CORSMiddleware** is middleware:
```python
app.add_middleware(CORSMiddleware, allow_origins=..., ...)
```
Every incoming request passes through this middleware first. It checks: "Is this request coming from an allowed origin?" If yes, it adds the proper CORS headers and lets the request proceed. If no, it blocks it.

Other examples: logging middleware (record every request), auth middleware (check JWT on every request), rate-limiting middleware (block users making too many requests).

---

**Q58. What is Environment Variable management and why is `.env` important?**

**Answer:** Environment variables are settings that change between **development, testing, and production** environments. My `.env` file stores:
- `DB_URL` — database connection string
- `SECRET_KEY` — for JWT signing
- `GROQ_API_KEY` — for AI model access
- `ALLOWED_ORIGINS` — for CORS

Why `.env` instead of hardcoding?
- **Security**: API keys and passwords stay out of the source code (and Git)
- **Flexibility**: Same code works in different environments by just changing the `.env` file
- **Best practice**: `.env` is listed in `.gitignore` so it's never pushed to GitHub

I load them using `python-dotenv` on the backend and `import.meta.env` on the frontend (Vite automatically reads `VITE_` prefixed variables).

---

**Q59. What is Component-Based Architecture in React?**

**Answer:** Instead of building one giant page, React breaks the UI into **small, reusable pieces** called components. Each component manages its own logic and appearance.

My app has these components:
- `Sidebar` — navigation menu
- `Dashboard` — shows metric cards + charts
- `LiveSession` — shows dual webcam feeds
- `MediaCapture` — handles webcam + file upload
- `AICoach` — chat interface
- `Analytics` — radar + area charts
- `Auth` (Login/Signup) — authentication forms

Benefits: each component can be **developed independently, tested separately, and reused**. For example, `MediaCapture` is used **twice** in `LiveSession` — once for entry feed and once for exit feed — with just a different `type` prop.

---

**Q60. What is the difference between Synchronous and Asynchronous programming?**

**Answer:**
- **Synchronous**: Tasks run one after another. If Task A takes 5 seconds, Task B waits 5 seconds before starting. Like standing in a single line at a shop.
- **Asynchronous**: Tasks can start without waiting for others to finish. While Task A is waiting for a network response, Task B can start. Like placing an order at a restaurant — you don't stand at the kitchen door waiting.

In my project:
- **Backend**: FastAPI uses `async/await` — when one request waits for a database query, the server handles other requests instead of freezing
- **Frontend**: `fetch` and Axios calls are asynchronous — the UI stays responsive while waiting for API responses
- **Video processing**: Uses `run_in_threadpool()` so heavy CPU work doesn't block the async event loop

---

### 🏗️ Software Engineering & General Theory (10)

---

**Q61. What Software Development methodology did you follow?**

**Answer:** I followed **Design Science Research** combined with an **iterative, feature-driven approach**. I built the project in stages:
1. **Stage 1**: Database schema + authentication (signup, login, JWT)
2. **Stage 2**: Emotion analysis pipeline (model loading, face detection, classification, `/analyze` endpoint)
3. **Stage 3**: Analytics layer (Vibe Score, Confusion Index) + AI Coach integration (LangChain + Groq)
4. **Stage 4**: Frontend assembly (React components) + PDF export

Each stage was tested before moving to the next. This is similar to **Agile methodology** where you deliver working pieces incrementally.

---

**Q62. What is the Three-Tier Architecture? How does your project follow it?**

**Answer:** Three-tier architecture separates an application into three layers:

| Tier | My Project | Responsibility |
|------|-----------|----------------|
| **Presentation** | React.js frontend | What the user sees and interacts with |
| **Application/Logic** | FastAPI backend | Business logic, AI processing, API endpoints |
| **Data** | PostgreSQL database | Stores all persistent data |

Benefits: I can change the frontend (e.g., switch from React to Vue) without touching the backend. I can switch from PostgreSQL to MySQL without changing any API logic. Each layer is **independent and replaceable**.

---

**Q63. What is an ORM? What are its advantages over raw SQL?**

**Answer:** **ORM (Object-Relational Mapper)** translates between Python objects and database tables. SQLAlchemy is my ORM.

Instead of writing: `SELECT * FROM emotion_data WHERE session_id = 'abc123'`
I write: `db.query(EmotionData).filter(EmotionData.session_id == 'abc123').all()`

Advantages:
- **Readable**: Python code is clearer than raw SQL
- **Safe**: Automatically prevents **SQL injection attacks** (a hacker can't inject malicious SQL through input fields)
- **Portable**: Same code works on PostgreSQL, SQLite, MySQL — just change the connection string
- **Maintainable**: If I rename a column, the IDE can find all references

---

**Q64. What is Dependency Injection? Where do you use it?**

**Answer:** Dependency injection means instead of a function creating its own dependencies, they are **provided from outside**. FastAPI uses this pattern with `Depends()`.

In my project, every route that needs the database writes:
```python
def signup(user: UserSignup, db: Session = Depends(database.get_db)):
```
The route doesn't create the database session itself — FastAPI **injects** it. This means:
- The route is **easier to test** (you can inject a fake database)
- The connection is **always properly closed** (thanks to the `yield` pattern)
- **No duplicate code** — every route gets a database session the same way

---

**Q65. What is Affective Computing?**

**Answer:** Affective Computing is the field of study where machines are designed to **recognize, interpret, and respond to human emotions**. The term was introduced by **Rosalind Picard in 1997** at MIT.

My project is an applied example of Affective Computing: it uses a camera to detect facial expressions, classifies them into emotions using AI, and then provides actionable feedback through the AI Coach. Applications include healthcare (detecting depression), customer service (detecting frustration), gaming (adaptive difficulty), and education (my project).

---

**Q66. What is the difference between Classification and Regression in Machine Learning?**

**Answer:**
- **Classification**: The output is a **category/label** from a fixed set. Example: my model outputs one of 7 emotions (Happy, Sad, etc.). The Vibe Score is ultimately derived from classified emotions.
- **Regression**: The output is a **continuous number**. Example: predicting a student's exam score (82.5, 91.3).

My project is a **multi-class classification** problem — 7 possible classes, and each face gets exactly one label. The final Softmax layer outputs probabilities for all 7 classes, and I pick the highest one.

---

**Q67. What is an API endpoint? How many does your system have?**

**Answer:** An API endpoint is a specific URL that the client can call to perform an action. Each endpoint has an **HTTP method** (GET/POST) and a **path** (like `/sessions/create`).

My system has **11 endpoints**:
1. `POST /signup` — create new user
2. `POST /login` — authenticate user
3. `POST /sessions/create` — start a new session
4. `GET /sessions/history` — list all past sessions
5. `GET /sessions/{id}/details` — get session info
6. `POST /sessions/{id}/analyze` — analyze a single frame
7. `POST /sessions/{id}/analyze_video` — analyze a video file
8. `GET /sessions/{id}/report` — get entry/exit stats
9. `GET /sessions/{id}/export_pdf` — download PDF report
10. `POST /sessions/{id}/chat` — send question to AI Coach
11. `GET /sessions/{id}/chat_history` — get conversation history

---

**Q68. What is the difference between Stateful and Stateless architecture?**

**Answer:**
- **Stateful**: The server remembers who you are between requests (e.g., using server-side sessions stored in memory).
- **Stateless**: The server does NOT remember anything. Each request must carry all information needed (e.g., JWT token).

My backend is **stateless** — it doesn't store active sessions in server memory. Every request carries a JWT token for identity and a session UUID for context. This is important because:
- The server can **restart** without losing user sessions
- You can run **multiple server instances** (horizontal scaling) and any instance can handle any request
- It's the standard for REST APIs

---

**Q69. What is Normalization in the context of images? Why divide by 255?**

**Answer:** Image pixels have values from **0 (black) to 255 (white)**. Neural networks work best when input values are between **0 and 1** (small numbers). Dividing by 255 scales every pixel to this range:
- 0 → 0.0
- 128 → 0.502
- 255 → 1.0

Why it matters:
- Without normalization, the model's gradients become **very large**, making training unstable
- Normalized values mean the model starts from a **balanced starting point**
- Convergence is **much faster** — the model reaches good accuracy in fewer epochs

In my code: `img_pixels = img_pixels / 255.0` (though OpenCV's resize handles this implicitly when converting to float32 arrays).

---

**Q70. What ethical concerns does your project raise?**

**Answer:** The main ethical concerns are:

1. **Privacy**: Recording students' faces raises privacy concerns. My system addresses this by working with **anonymous aggregate data** — it never stores names, student IDs, or individual face images. Only emotion counts are saved.

2. **Consent**: Students should be **informed** that a camera is analyzing their expressions. In a real deployment, consent forms and visible signage would be required.

3. **Bias**: The FER2013 dataset may not represent all ethnicities and age groups equally. This could cause the model to perform **differently for different demographics** — a form of algorithmic bias.

4. **Misuse**: An institution could misuse the data to penalize teachers unfairly based on low Vibe Scores, or to profile students. The system should be used as a **supportive tool**, not for surveillance or punishment.

5. **Accuracy dependency**: Making decisions based on 48×48 pixel emotion detection has inherent error margins. The system should **supplement** human judgment, not replace it.
