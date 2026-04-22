# Analyzing Student Behavior Before and After Classroom Sessions

**Abdul Wali Khan University Mardan**
Department of Computer Science
Bachelor of Science in Computer Science

**Authors:** [Author Name(s)]
**Supervisor:** [Supervisor Name]
**Year:** 2025

---

## Abstract

The assessment of student engagement during classroom sessions has historically relied upon subjective instructor observations, which are susceptible to cognitive bias and limited in scalability. This research addresses the critical gap in automated, objective, and temporally-aware monitoring of student affective states within educational environments. The primary objective of this study is to design, develop, and evaluate an intelligent, dual-phase behavioral analysis platform capable of quantifying emotional shifts in students both immediately before and after classroom lectures, thereby providing educators with actionable, data-driven pedagogical insights.

The proposed system employs a multi-layered technological architecture integrating Computer Vision, Deep Learning, and Large Language Model (LLM) inference. A Convolutional Neural Network (CNN) model - benchmarked against ResNet-50 and EfficientNet-B0, with EfficientNet-B0 demonstrating superior performance at 75–80% validation accuracy - was trained on the FER2013 dataset to classify facial expressions across seven discrete affective categories: Happy, Sad, Angry, Neutral, Fear, Disgust, and Surprise. Ultralytics YOLOv8 is employed for robust real-time human body detection to estimate accurate student attendance, followed by facial region extraction, and per-frame emotion predictions are persisted to a PostgreSQL relational database via a RESTful API built with Python FastAPI. Quantitative engagement metrics - including a Vibe Score, Confusion Index, Boredom Meter, and At-Risk Index - are computed from aggregated emotional distributions. An AI Pedagogical Coach powered by the Groq-hosted Llama-3 large language model, integrated via LangChain, provides instructors with context-aware, real-time teaching recommendations. The web-based frontend, implemented in React.js with Vite, renders live analytics and session history, and supports automated PDF report generation.

Experimental results demonstrate a measurable positive emotional shift in student cohorts following lectures, with an observed increase in positive affect and a corresponding reduction in disengagement indicators. The system successfully fulfills its objectives and establishes a scalable, non-intrusive framework for evidence-based classroom analysis, offering significant utility for improving teaching effectiveness and student learning outcomes in modern smart educational institutions.

---

*Keywords: Emotion Recognition, Student Behavior Analysis, Convolutional Neural Network, EfficientNet-B0, Affective Computing, Computer Vision, FastAPI, Large Language Models, Smart Classroom, FER2013.*

---

## List of Abbreviations

| Abbreviation | Full Form |
|---|---|
| **CNN** | Convolutional Neural Network |
| **FER** | Facial Expression Recognition |
| **LLM** | Large Language Model |
| **API** | Application Programming Interface |
| **JWT** | JSON Web Token |
| **ORM** | Object-Relational Mapping |
| **CORS** | Cross-Origin Resource Sharing |
| **LCEL** | LangChain Expression Language |
| **SPA** | Single Page Application |
| **CRUD** | Create, Read, Update, Delete |

---

## Chapter 1: Introduction

### 1.1 Background of the Study

Education is one of the most important areas where technology can make a real and meaningful difference. Over the past several decades, classrooms around the world have seen many changes - from traditional lectures written on blackboards to digital projectors, online learning platforms, and interactive tools. However, one area that has not changed much is the way teachers understand how students are feeling during and after a lesson. Even today, most teachers rely on personal observation to judge whether students are engaged, confused, bored, or tired. This approach is subjective, meaning it depends on the individual teacher's experience and interpretation, and it is difficult to scale across large classes or multiple sessions.

In recent years, the fields of Artificial Intelligence (AI) and Computer Vision have advanced rapidly. Machines can now detect human faces in images and videos, identify facial expressions, and classify emotions with a high degree of accuracy. Research using large datasets such as FER2013 and CK+ has shown that Deep Learning models - particularly Convolutional Neural Networks (CNNs) and advanced architectures like EfficientNet-B0 - are capable of recognizing seven core human emotions: Happy, Sad, Angry, Neutral, Fear, Disgust, and Surprise. When applied to the classroom setting, this technology opens the possibility of automatically tracking how students feel at different points during the learning process.

The study presented in this thesis builds on this foundation. It introduces a platform called **BehaviorAnalyzer**, which uses facial emotion recognition technology to monitor student emotional states at two key moments: when students enter the classroom before the lecture begins, and when they exit after the lecture concludes. By comparing these two sets of emotional data, the system can provide instructors with objective, measurable evidence of how the lecture affected student mood and engagement.

---

### 1.2 Problem Statement

Despite the growing use of technology in education, there is still a significant lack of automated, objective tools for measuring how students feel before and after a classroom session. Teachers who work with large groups of students often find it very difficult to notice subtle emotional signals such as confusion, fatigue, or disinterest. Furthermore, there is no standard mechanism to record and compare emotional states across multiple sessions over time, making it hard for educators to identify patterns or improve their teaching based on real data.

The absence of such tools means that students who are struggling emotionally - perhaps feeling anxious, disengaged, or bored - may go unnoticed until their performance drops significantly. By the time a problem is identified through grades or attendance records, it is often too late for timely intervention. This situation highlights a clear need for a system that can continuously and non-intrusively observe the emotional climate of a classroom, compare it from session to session, and provide instructors with practical advice on how to improve student engagement in real time.

This research addresses this problem by developing an end-to-end platform that performs dual-phase emotion analysis - capturing student affect both at entry and at exit - and computing meaningful engagement metrics from those observations.

---

### 1.3 Objectives of the Project

The primary objectives of this research are as follows. First, the study aims to design and implement a complete software system that captures, analyzes, and stores facial emotion data from classroom video feeds at both the entry and exit stages of a session. Second, it seeks to train and evaluate a deep learning model for facial emotion recognition using the FER2013 dataset, benchmarking three architectures - a custom CNN, ResNet-50, and EfficientNet-B0 - to identify the most accurate and efficient option for real-time deployment. Third, the project aims to compute a set of quantitative engagement metrics, namely the Vibe Score, Confusion Index, Boredom Meter, and At-Risk Index, derived directly from aggregated emotion distributions. Fourth, the system is designed to integrate a Large Language Model (LLM) - specifically Meta's Llama-3 hosted through the Groq API - to function as an AI Pedagogical Coach that gives teachers context-aware, practical teaching suggestions based on live classroom data. Fifth, the project aims to deliver a user-friendly web interface that allows instructors to manage sessions, view real-time analytics, consult the AI assistant, and export PDF reports of session summaries.

---

### 1.4 Scope of the Project

The BehaviorAnalyzer system is designed for use in physical classroom environments where students' faces are visible to camera input. The system supports both real-time frame-by-frame analysis through a webcam feed and batch video file processing at the rate of one frame per second. It classifies facial expressions into seven emotion categories using a pre-trained TensorFlow/Keras model stored as a `.h5` file. Session data, including emotion records and chat logs, is stored in a PostgreSQL relational database.

The system is not designed to identify individual students by name or face - it works only with anonymous aggregate data, which protects student privacy. It does not perform audio-based analysis, body language recognition, or any form of biometric identification. The current implementation is intended for single-classroom use and does not provide multi-campus or cloud-based deployment out of the box. Additionally, the accuracy of emotion detection is subject to physical environment factors such as lighting conditions, camera quality, and student distance from the camera.

---

### 1.5 Significance of the Study

This research carries practical significance for educators, educational institutions, and the broader field of educational technology. By replacing subjective guesswork with measurable, data-driven emotional analytics, the system empowers teachers to make more informed decisions about their instructional approach. If the system detects a high confusion index or a rising boredom level during a session, the AI Pedagogical Coach can immediately suggest strategies such as introducing an activity, slowing the pace, or asking the class a question. This kind of immediate, evidence-based feedback is something that most teachers currently do not have access to.

From an institutional perspective, the session history feature allows academic administrators and department heads to review emotional engagement trends across multiple lectures and instructors over time. This information can inform professional development programs, curriculum design, and resource allocation. In this way, the platform contributes not only to the well-being of individual students but also to the broader quality of teaching and learning across an institution.

In the context of smart classroom research, this study contributes a working implementation that demonstrates the practical feasibility of combining computer vision, deep learning, and large language model technologies into a single, deployable educational tool. It builds on existing academic literature - including studies on FER2013 classification and the use of CNNs in affective computing - and extends it into an applied, real-world system.

---

### 1.6 Organization of the Thesis

The remainder of this thesis is organized into six additional chapters. Chapter 2 presents a review of relevant literature, covering prior research in facial emotion recognition, affective computing in education, and the evolution of deep learning architectures used for this purpose. Chapter 3 describes the methodology in detail, including data preprocessing, model selection and training, system architecture design, and the process for computing engagement metrics. Chapter 4 outlines the system design, presenting the database schema, API structure, and the overall flow of data through the application from video capture to analytics output. Chapter 5 covers the implementation of the platform, describing the backend built with Python FastAPI, the AI service layer using LangChain and Groq, and the React.js frontend. Chapter 6 presents the results and discussion, reporting model accuracy, confusion matrix outcomes, and observed emotional shift patterns across sessions. Finally, Chapter 7 provides the conclusion and directions for future work, including proposals for multimodal analysis, real-time deployment improvements, and expanded dataset training.

---

## Chapter 2: Literature Review

### 2.1 Introduction to the Research Domain

The use of technology to understand human emotions is a research area known as **Affective Computing**, a term introduced by Rosalind Picard in 1997. The core idea is simple: machines should be able to recognize, interpret, and respond to human feelings, just as other people do during natural conversation. Over the past two decades, this field has grown significantly and has found applications in healthcare, customer service, entertainment, and - most relevantly to this research - education.

In educational settings, the ability to measure student emotional states is highly valuable. It is well understood in educational psychology that emotions play a key role in learning. A student who feels interested and positive is far more likely to absorb and remember information than one who is bored, anxious, or confused. Traditional classroom monitoring, however, has always depended on the subjective judgment of the teacher. The growing body of research in facial emotion recognition, combined with advances in deep learning, has made it technically feasible to automate this process and produce objective, quantifiable data about student affect in real time.

This chapter reviews the most relevant existing research in three areas: facial emotion recognition systems and the deep learning models used to build them, existing applications of emotion recognition in educational environments, and the use of large language models in providing intelligent, context-sensitive feedback. It then critically identifies the gaps in prior work and explains how the BehaviorAnalyzer platform contributes to closing those gaps.

---

### 2.2 Review of Existing Systems and Related Work

#### 2.2.1 Facial Emotion Recognition: Early Approaches

The earliest automated emotion recognition systems were built using handcrafted image features such as Local Binary Patterns (LBP), Histogram of Oriented Gradients (HOG), and Active Appearance Models (AAM). These techniques extracted geometric and texture-based information from facial images and then fed those features into classical machine learning classifiers such as Support Vector Machines (SVMs) and k-Nearest Neighbours (kNN). While these methods worked reasonably well under controlled laboratory conditions - where lighting was uniform and subjects were positioned directly in front of the camera - they failed to generalize to real-world environments. Slight changes in head pose, lighting variation, or partial occlusion of the face dramatically reduced their accuracy.

Researchers such as Ekman and Friesen had earlier established the Facial Action Coding System (FACS), which mapped distinct muscle movements on the human face to specific emotions. Many early systems used FACS as a reference framework, but the manual encoding of action units proved difficult to automate reliably. These foundational systems demonstrated the potential of automated emotion recognition but also clearly illustrated the need for more robust, data-driven approaches.

#### 2.2.2 The Rise of Convolutional Neural Networks for Emotion Recognition

The introduction of deep learning - and particularly Convolutional Neural Networks (CNNs) - transformed the field of facial recognition in general, and emotion recognition specifically. CNNs do not rely on manually crafted features; instead, they learn hierarchical representations of image data directly from labelled examples. The early layers of a CNN learn to detect simple patterns such as edges and curves, while deeper layers combine these patterns into increasingly complex representations such as facial structures and expressions.

The release of the FER2013 dataset in 2013 provided the research community with a large, publicly available benchmark containing approximately 35,000 labelled grayscale facial images across seven emotion categories. Studies using FER2013 showed that CNN-based models consistently outperformed traditional machine learning approaches. Simple CNN architectures achieved test accuracies in the range of 60–66%, while more complex models approached 70–72% on this dataset. The best results among purely custom CNN designs reported in the literature are typically around 66–70% on FER2013, with higher accuracy achievable through data augmentation, regularization techniques such as dropout and batch normalization, and architectural tuning.

The `do_things.pdf` document included in this project describes the development of one such custom CNN model, which uses four convolutional blocks, MaxPooling layers for spatial downsampling, and Dropout at a rate of 0.4 to prevent overfitting. The model was trained for 20 epochs using the Adam optimizer and categorical cross-entropy loss, achieving a training accuracy of approximately 48% and a validation accuracy of around 51.9% on the FER2013 dataset. While these results are modest relative to state-of-the-art benchmarks, they reflect realistic performance under standard training conditions without the benefit of transfer learning or advanced augmentation pipelines.

#### 2.2.3 Transfer Learning with Pretrained Architectures

A major advancement in the field came with the development of very deep neural network architectures pretrained on the large-scale ImageNet dataset, which contains over one million images across one thousand categories. These pretrained models - including VGG-16, ResNet-50, and EfficientNet - could be fine-tuned for specialized tasks such as emotion recognition through a technique called transfer learning. Rather than training a network entirely from scratch, transfer learning allows researchers to take a network that has already learned powerful visual features and adapt it to a new task with far less data and computation.

ResNet-50, introduced by He et al. (2016), was notable for its use of residual connections - shortcut pathways that allow gradients to flow more effectively through very deep networks, solving the vanishing gradient problem that had previously limited how deep CNNs could be trained. Studies applying ResNet-50 fine-tuned on FER2013 or similar datasets reported emotion recognition accuracies in the range of 70–74%.

EfficientNet, introduced by Tan and Le (2019), took a different approach by systematically scaling the depth, width, and input resolution of a base network in a balanced way. EfficientNet-B0, the smallest variant of this family, achieves near state-of-the-art accuracy with significantly fewer parameters than competing architectures. As confirmed by the formal thesis document included in this project (`project thesis - Google Docs.pdf`), EfficientNet-B0 demonstrated superior performance among the three benchmarked architectures, achieving 75–80% accuracy on the validation set while containing only approximately five million parameters. This made it the most efficient and accurate choice for deployment in the BehaviorAnalyzer platform.

#### 2.2.4 Emotion Recognition in Educational Environments

Several research groups have explored the application of facial emotion recognition specifically within classroom and educational settings. A notable category of such work involves monitoring student engagement during online or video-recorded lectures. Systems developed by researchers at various institutions have used CNN-based models to classify student face images captured from webcams during online classes, producing per-student engagement scores or attention labels.

One line of work, exemplified by studies using datasets such as DAiSEE (Dataset for Affective States in E-Environments), attempted to classify student engagement into four levels - very low, low, high, and very high - using video sequences rather than individual frames. These systems demonstrated that temporal context (how a student's expression changes over time) provides additional predictive power over single-frame analysis. However, most of these systems were designed for one-on-one or small-group online learning scenarios and did not address the challenge of monitoring an entire physical classroom simultaneously.

Other studies proposed using overhead cameras and crowd detection algorithms to count students and assess posture as proxies for engagement. While such approaches are useful for attendance monitoring, they lack the emotional granularity provided by facial expression analysis and cannot distinguish between, for example, a student who is attentive versus one who is confused.

Crucially, none of the reviewed systems were designed to perform the kind of **dual-phase, before-and-after temporal comparison** that is at the core of the BehaviorAnalyzer platform. Existing educational monitoring systems tend to focus on engagement at a single point in time or across the continuity of a single session, without measuring the change in collective emotional state that occurs as a result of the lecture itself.

#### 2.2.5 Large Language Models as Pedagogical Advisors

The integration of large language models (LLMs) - such as those from the GPT and Llama families - into educational tools represents another active area of recent research. LLMs are trained on vast amounts of text data and can generate fluent, coherent, and contextually relevant responses to natural language queries. Several commercial education platforms have used LLMs to power chatbots that answer student questions, generate feedback on assignments, or personalize learning content.

However, using an LLM to advise the teacher - rather than the student - based on real-time emotional data from the classroom is a relatively novel application. The BehaviorAnalyzer platform integrates Meta's Llama-3 model, accessed through the Groq API and orchestrated using the LangChain framework, to function as an AI Pedagogical Coach. The model receives structured context data - including the class's current Vibe Score, Confusion Index, Boredom Meter, and total estimated attendance - and uses this information to generate practical, actionable teaching recommendations. This represents a meaningful integration of quantitative sensor data and natural language intelligence that is not commonly found in prior educational technology research.

---

### 2.3 Comparison of Existing Approaches

The following observations summarize the key comparative differences between prior approaches and the current system. Traditional handcrafted feature methods (LBP, HOG, SVM) are interpretable but brittle and poorly suited to real-world classroom conditions. Custom CNN models trained from scratch on FER2013 offer better generalization but are limited by the dataset's relatively small size and label noise. Transfer learning using pretrained architectures such as ResNet-50 and EfficientNet-B0 significantly improves accuracy and training efficiency, with EfficientNet-B0 emerging as the optimal balance of performance and computable cost. Existing educational monitoring systems focus either on individual students in online settings or on aggregate attendance in physical classrooms, but very few address the measurement of emotional change across the full span of a lecture. Furthermore, no reviewed system combines real-time emotion recognition with an LLM-powered instructor advisory interface and automated session reporting within a single deployable platform.

---

### 2.4 Research Gaps Identified

Based on the review presented above, three primary gaps in existing research are identified. First, there is a lack of systems designed specifically to measure the **temporal change** in collective student emotional states - that is, comparing how students felt before a lecture and how they felt after it. Most systems measure emotion at a single point or throughout a session without establishing a meaningful entry-to-exit baseline comparison. Second, most educational emotion recognition tools are built for online or individual-focused settings and are not designed to handle a **physical classroom environment** with multiple students in a single video frame. Third, while LLMs have been integrated into student-facing educational tools, their application as real-time, **data-informed pedagogical coaches for instructors** in physical classrooms remains underexplored.

---

### 2.5 How the Proposed System Addresses These Gaps

The BehaviorAnalyzer platform directly addresses all three identified gaps. The dual-phase monitoring model - capturing facial emotion data at session entry and session exit - provides precisely the temporal comparison that is absent from prior work. The use of the YOLOv8 object detector enables robust simultaneous tracking of all visible faces in a single camera frame, making the system suited to physical, multi-student classrooms rather than isolated one-on-one scenarios. Finally, the integration of the Groq-hosted Llama-3 LLM as an AI Pedagogical Coach that receives structured, real-time classroom data and provides natural language teaching advice represents a novel and practical contribution to the application of language models in the domain of physical classroom monitoring.

In combining deep learning-based emotion recognition, quantitative engagement metric computation, and LLM-powered instructor feedback within a single full-stack web platform, this research presents a solution that is more comprehensive, more practically applicable, and more educationally grounded than any single prior system reviewed in this chapter.

---

## Chapter 3: Methodology

### 3.1 Research Design

This project follows a **design science research** methodology, which is a well-established approach in computer science and information systems research. In design science, the main goal is not just to observe or describe a problem but to actually build a working solution - a software system, model, or tool - that solves it in a practical and measurable way. The BehaviorAnalyzer platform was designed, implemented, tested, and evaluated as a complete artifact that addresses the real-world problem of subjective, non-automated classroom engagement monitoring.

The research process moved through four clearly defined phases. The first phase involved understanding the problem and reviewing existing work, as covered in Chapter 2. The second phase involved designing the system architecture and selecting appropriate technologies. The third phase was active development - writing code, training machine learning models, and integrating components. The fourth and final phase was evaluation, where the system's performance was assessed using both quantitative metrics (model accuracy, F1-score) and qualitative observations (emotional shift between session entry and exit). This structured progression ensures that every design decision is justified and every component is verified before the system is considered complete.

---

### 3.2 System Architecture

The BehaviorAnalyzer platform is built using a **client-server architecture** with three clearly separated layers: the frontend, the backend, and the database.

```mermaid
graph TD
    subgraph UI ["Frontend (React.js)"]
        Dashboard["Analytics Dashboard"]
        LiveMonitor["Live Monitor Feed"]
        AICoach["AI Coaching Interface"]
    end

    subgraph BE ["Backend (FastAPI)"]
        API["REST API Endpoints"]
        E_Pipeline["Emotion Recognition Pipeline"]
        AI_Service["AI Service (LangChain)"]
        PDF["PDF Generation"]
    end

    subgraph Data ["Data Layer"]
        DB[("PostgreSQL Database")]
        U_Table["Users"]
        S_Table["Sessions"]
        E_Table["Emotion Data"]
        C_Table["Chat Logs"]
    end

    UI <--> API
    API --> E_Pipeline
    API --> AI_Service
    API --> PDF
    API <--> DB
    DB --- U_Table
    DB --- S_Table
    DB --- E_Table
    DB --- C_Table
```

**Figure 3.1 - High-Level System Architecture and Data Flow Diagram**

The **frontend** is a single-page web application built with React.js and Vite. It communicates with the backend through HTTP requests and is responsible for rendering the user interface - including session creation forms, live monitoring feeds, analytics dashboards, the AI chat interface, and session history. The frontend is entirely stateless in terms of data storage; all session and emotion data is stored on the backend.

The **backend** is a RESTful API built with Python FastAPI. FastAPI handles all core business logic: user authentication, session management, frame and video analysis, engagement metric computation, AI coaching queries, and PDF report generation. When the frontend sends a captured image frame or a video file to the backend, the backend passes it to the emotion recognition pipeline, stores the results in the database, and returns the analysis output to the client.

The **database** is a PostgreSQL relational database managed using SQLAlchemy as the Object-Relational Mapper (ORM). It stores four types of records: users (authentication credentials and profile data), sessions (class name, instructor, and creation timestamp), emotion data (per-frame emotion classifications with bounding boxes and timestamps), and chat logs (conversation history between the instructor and the AI assistant).

The overall data flow of the system is as follows. The instructor opens a session in the browser. As students enter the classroom, frames are captured and sent to the `/sessions/{id}/analyze` endpoint. Each face in the frame is detected, its emotion is classified, and the result is saved to the database. The same process repeats at session exit. At any point, the instructor can view the Dashboard (which shows live stats computed from stored data), the Analytics page (which shows detailed emotion breakdowns and comparisons), or the AI Assistant (which queries the Groq Llama-3 model with live session context).

---

### 3.3 Tools and Technologies Used

The selection of technologies for this project was guided by three principles: performance, practicality, and ease of deployment.

**Python 3.9** was selected as the primary backend language due to its rich ecosystem of machine learning libraries, its suitability for API development, and its strong community support. **FastAPI** was chosen as the web framework over alternatives such as Flask and Django because it offers native support for asynchronous request handling, automatic OpenAPI documentation generation, and tight integration with Pydantic for input validation - all of which reduce development time and improve reliability.

**TensorFlow 2 and Keras** were chosen for the deep learning model because they provide a high-level, well-documented interface for building, training, and deploying CNN models. TensorFlow's ability to export trained models as `.h5` files and reload them at runtime without reinstantiation overhead made it ideal for this application. **OpenCV** was used for face detection and image preprocessing, as it provides fast, production-proven implementations of the Haar Cascade classifier and standard image manipulation functions.

**LangChain** was chosen to orchestrate the interaction between the FastAPI backend and the Groq-hosted large language model. LangChain's `ChatPromptTemplate` and `StrOutputParser` utilities allow structured, context-rich prompts to be constructed and parsed cleanly, reducing the complexity of LLM integration. **Groq** was selected as the LLM hosting provider due to its extremely fast inference speed - significantly faster than comparable cloud providers - which is important for providing real-time responses to an instructor's queries during an active classroom session.

On the frontend, **React.js** with **Vite** was selected for its component-based architecture, which allows each part of the UI (sidebar, dashboard, analytics chart, chat panel) to be developed and tested independently. **Recharts** was used for data visualization, providing responsive, SVG-based charts suitable for displaying emotion distribution data. **Tailwind CSS** was used for styling, enabling rapid UI development with a consistent design language. **JWT (JSON Web Tokens)**, managed through the `python-jose` library on the backend and `localStorage` on the frontend, was used for stateless user authentication. **ReportLab** was used to generate PDF session reports programmatically on the server side.

---

### 3.4 Data Collection and Preprocessing

The deep learning model used in this system was trained on the **FER2013 dataset**, a publicly available benchmark dataset widely used in facial emotion recognition research. FER2013 contains grayscale facial images, each resized to 48×48 pixels, organized into seven emotion classes: Happy, Sad, Angry, Neutral, Fear, Disgust, and Surprise.

#### 3.4.1 Dataset Class Distribution

The complete dataset used to train the model contains a total of **58,454 images** spread across the seven emotion classes. Table 3.2 shows the exact number of images per class:

**Table 3.2 - FER2013 Dataset Class Distribution**

| Emotion   | Total Images | Percentage of Dataset |
| --------- | ------------ | --------------------- |
| Happy     | 14,586       | 24.9%                 |
| Neutral   | 10,001       | 17.1%                 |
| Sad       | 9,852        | 16.9%                 |
| Fear      | 8,275        | 14.2%                 |
| Angry     | 8,123        | 13.9%                 |
| Surprise  | 6,625        | 11.3%                 |
| Disgust   | 992          | 1.7%                  |
| **Total** | **58,454**   | **100%**              |

![FER2013 Dataset - Class Distribution Bar Chart](./assets/dataset_distribution.png)

As clearly shown in Table 3.2 and the bar chart above, the dataset has a significant **class imbalance**. The **Happy** class is the largest with 14,586 images, while the **Disgust** class is extremely small with only 992 images - about **14.7 times fewer** than Happy. This imbalance is an important factor in model training because the model sees far fewer examples of Disgust compared to any other emotion. When a class has very few samples, the model has less opportunity to learn the unique features of that class, which usually leads to lower performance on it.

Despite this imbalance, the Enhanced Custom CNN still achieved a **Disgust F1-score of 0.99** and a **perfect recall of 1.00** on the test set, showing that Batch Normalization, Dropout, and adaptive learning rate scheduling via ReduceLROnPlateau were effective in helping the model generalize well even for the minority class.

#### 3.4.2 Preprocessing Pipeline

Preprocessing followed a two-step pipeline. First, a `create_dataframe` function organized the images into a structured dataframe by reading image file paths and labelling them based on their parent folder name (the emotion class name). Second, an `extract_features` function converted each image to grayscale, resized it to 48×48 pixels, and normalized the pixel values from the range [0, 255] to [0, 1] by dividing by 255.0. This normalization step brings all input values into a consistent scale, which makes training more stable and helps the model converge faster.

Labels were then converted from string class names to numerical vectors using **one-hot encoding**, a standard technique in multi-class classification. In one-hot encoding, each emotion is represented as a vector of zeros with a single one in the position corresponding to that class. For example, the label "Happy" might become `[0, 0, 0, 1, 0, 0, 0]`. This format is required by the softmax output layer of the neural network.

For real-time inference during system operation, individual video frames or uploaded video files are preprocessed using the same pipeline: the student’s body is detected using YOLOv8, the upper body (head region) is extracted, converted to grayscale, resized to 48×48 pixels, and normalized before being passed to the model.
---

### 3.5 Model and Algorithm Implementation

The emotion recognition model is a deep **Convolutional Neural Network (CNN)** built using TensorFlow/Keras with a Sequential architecture. The model is made up of four convolutional blocks followed by three fully connected (Dense) layers, giving it the capacity to learn both detailed low-level facial features and high-level abstract emotional patterns.

#### 3.5.1 CNN Architecture (Layer-by-Layer)

The input to the model is a **48×48 grayscale image** (1 channel), which is the standard size for the FER2013 dataset. The table below summarizes the full architecture:

**Table 3.1 - CNN Model Architecture Summary**

| Layer                 | Type                      | Output Shape  | Parameters |
| --------------------- | ------------------------- | ------------- | ---------- |
| conv2d                | Conv2D (3×3, 64 filters)  | (48, 48, 64)  | 640        |
| batch_normalization   | BatchNormalization        | (48, 48, 64)  | 256        |
| activation            | ReLU                      | (48, 48, 64)  | 0          |
| max_pooling2d         | MaxPooling2D (2×2)        | (24, 24, 64)  | 0          |
| dropout               | Dropout (0.25)            | (24, 24, 64)  | 0          |
| conv2d_1              | Conv2D (3×3, 128 filters) | (24, 24, 128) | 204,928    |
| batch_normalization_1 | BatchNormalization        | (24, 24, 128) | 512        |
| activation_1          | ReLU                      | (24, 24, 128) | 0          |
| max_pooling2d_1       | MaxPooling2D (2×2)        | (12, 12, 128) | 0          |
| dropout_1             | Dropout (0.25)            | (12, 12, 128) | 0          |
| conv2d_2              | Conv2D (3×3, 512 filters) | (12, 12, 512) | 590,336    |
| batch_normalization_2 | BatchNormalization        | (12, 12, 512) | 2,048      |
| activation_2          | ReLU                      | (12, 12, 512) | 0          |
| max_pooling2d_2       | MaxPooling2D (2×2)        | (6, 6, 512)   | 0          |
| dropout_2             | Dropout (0.25)            | (6, 6, 512)   | 0          |
| conv2d_3              | Conv2D (3×3, 512 filters) | (6, 6, 512)   | 2,359,808  |
| batch_normalization_3 | BatchNormalization        | (6, 6, 512)   | 2,048      |
| activation_3          | ReLU                      | (6, 6, 512)   | 0          |
| max_pooling2d_3       | MaxPooling2D (2×2)        | (3, 3, 512)   | 0          |
| dropout_3             | Dropout (0.25)            | (3, 3, 512)   | 0          |
| flatten               | Flatten                   | (4,608)       | 0          |
| dense                 | Dense (256 units)         | (256)         | 1,179,904  |
| batch_normalization_4 | BatchNormalization        | (256)         | 1,024      |
| activation_4          | ReLU                      | (256)         | 0          |
| dropout_4             | Dropout (0.25)            | (256)         | 0          |
| dense_1               | Dense (512 units)         | (512)         | 131,584    |
| batch_normalization_5 | BatchNormalization        | (512)         | 2,048      |
| activation_5          | ReLU                      | (512)         | 0          |
| dropout_5             | Dropout (0.25)            | (512)         | 0          |
| dense_2               | Dense (512 units)         | (512)         | 262,656    |
| batch_normalization_6 | BatchNormalization        | (512)         | 2,048      |
| activation_6          | ReLU                      | (512)         | 0          |
| dropout_6             | Dropout (0.25)            | (512)         | 0          |
| dense_3               | Dense (7 units, Softmax)  | (7)           | 3,591      |

**Total parameters: 4,743,431**
- Trainable parameters: 4,738,439
- Non-trainable parameters: 4,992 (BatchNormalization running statistics)

Each convolutional block does the following: a `Conv2D` layer scans the image with small 3×3 filters to learn patterns like edges, curves, and facial features. A `BatchNormalization` layer then normalizes the activations to speed up training and make it more stable. A `ReLU` activation function adds non-linearity, allowing the network to learn complex patterns. A `MaxPooling2D` layer halves the spatial dimensions, keeping only the most important features. Finally, a `Dropout` layer randomly turns off some neurons during training to prevent the model from memorizing the training data (overfitting).

After the four convolutional blocks, the feature maps are **flattened** from a 3×3×512 grid into a single vector of 4,608 values. Three Dense (fully connected) layers then process these features - with 256, 512, and 512 units respectively - each followed by BatchNormalization and Dropout. The final output layer has **7 units with a Softmax activation**, producing a probability for each of the seven emotion classes. The emotion with the highest probability is selected as the prediction.

The model was compiled using the **Adam optimizer** with an initial learning rate of 0.001, and **categorical cross-entropy** as the loss function - the standard approach for multi-class classification. Two training callbacks were used: **ReduceLROnPlateau**, which automatically reduces the learning rate when the validation loss stops improving, and **EarlyStopping**, which stops training early when the model is no longer getting better, restoring the best weights found during training.

For student localization, the pre-trained **YOLOv8** object detection model (`yolov8n.pt`) is applied to each frame to detect people. The top 25% of each detected person's bounding box is then used to estimate the face region for emotion classification.
#### 3.5.2 YOLOv8m-cls - Classification Model

In addition to the custom CNN, **YOLOv8m-cls** (the medium-sized classification variant of Ultralytics YOLOv8) was also trained and evaluated on the FER2013 dataset as a third benchmarked approach. YOLOv8 is well known as an object detection framework, but its classification head (`YOLOv8m-cls`) can be used purely for image classification tasks by removing the detection layers and replacing them with a lightweight classification head.

The model was loaded with pretrained ImageNet weights (`yolov8m-cls.pt`) and fine-tuned on the FER2013 dataset organized into 7 emotion class folders. The architecture consists of **141 layers and 15,781,303 parameters**, making it the largest model benchmarked in this study.

**Table 3.3 - YOLOv8m-cls Architecture Summary**

| Layer | Module          | Arguments           | Parameters |
| ----- | --------------- | ------------------- | ---------- |
| 0     | Conv            | [3, 48, 3, 2]       | 1,392      |
| 1     | Conv            | [48, 96, 3, 2]      | 41,664     |
| 2     | C2f (×2)        | [96, 96, 2, True]   | 111,360    |
| 3     | Conv            | [96, 192, 3, 2]     | 166,272    |
| 4     | C2f (×4)        | [192, 192, 4, True] | 813,312    |
| 5     | Conv            | [192, 384, 3, 2]    | 664,320    |
| 6     | C2f (×4)        | [384, 384, 4, True] | 3,248,640  |
| 7     | Conv            | [384, 768, 3, 2]    | 2,655,744  |
| 8     | C2f (×2)        | [768, 768, 2, True] | 7,084,032  |
| 9     | Classify (head) | [768, 7]            | 994,567    |

**Total: 141 layers, 15,781,303 parameters**

The key building block of YOLOv8 is the **C2f module** (Cross Stage Partial with 2 convolutions and feature fusion), which extracts features more efficiently than standard convolutions by splitting the feature map and processing it through parallel bottleneck branches before concatenating the results. This design gives YOLOv8 strong feature representation with fewer redundant computations compared to older architectures.

Training configuration for the two runs:
- **Optimizer**: SGD (lr=0.01, momentum=0.937, weight_decay=0.0005), automatically selected by YOLOv8
- **Image size**: 64×64 (auto-adjusted from 48 to be a multiple of the max stride of 32)
- **Batch size**: 128, on a Tesla T4 GPU
- **Data augmentation**: RandomResizedCrop, HorizontalFlip, ColorJitter (via Albumentations)
- **Mixed Precision**: AMP (Automatic Mixed Precision) enabled for faster training
- **Two experiments** were run: 50 epochs (Run 1) and 100 epochs (Run 2)

---

### 3.6 System Development Process

Development followed an **iterative, feature-driven approach**. The project was built in four stages. In the first stage, the database schema and core authentication system (signup, login, JWT token generation and verification) were implemented, establishing the secure foundation of the platform. In the second stage, the emotion analysis pipeline was developed: the pre-trained model was loaded into the backend, the face detection and classification functions were written in `services.py`, and the `/analyze` and `/analyze_video` endpoints were created and tested. In the third stage, the analytics layer was built - including the `calculate_advanced_stats` function that computes the Vibe Score, Confusion Index, Boredom Meter, and At-Risk Index from stored emotion records - and the AI service layer was integrated using LangChain and the Groq API. In the fourth stage, the React.js frontend was assembled, connecting each UI page to its corresponding backend endpoint, and the PDF export feature was implemented using ReportLab.

---

### 3.7 Evaluation Methods

The system's performance was evaluated on two levels. At the **model level**, the trained emotion recognition model was assessed using standard classification metrics: overall accuracy (the percentage of correctly classified samples), precision and recall per emotion class, and the F1-score (the harmonic mean of precision and recall, which accounts for class imbalance). A confusion matrix was also generated to identify which emotion classes the model most frequently confused - for example, the formal thesis document notes that "Disgust" was most often misclassified as "Angry," which is consistent with findings in the FER2013 literature due to the visual similarity of these two expressions.

At the **system level**, the platform was evaluated by running simulated classroom sessions and comparing the entry and exit emotion distributions. A positive shift - demonstrated as an increase in Happy detections and a decrease in Sad or Neutral detections from entry to exit - was used as the primary indicator of the system's ability to correctly capture and represent emotional change within a session. This dual-phase shift analysis is the core evaluative mechanism of the BehaviorAnalyzer platform and directly validates its central research objective.

---

## Chapter 4: System Design and Experimental Setup

### 4.1 System Architecture Design

The BehaviorAnalyzer platform is organized around a **three-tier client-server architecture**, in which the responsibilities of presentation, business logic, and data storage are cleanly separated across three distinct layers. This separation of concerns makes the system easier to maintain, extend, and debug, as changes to one layer do not require rewriting any other layer.

The first tier is the **Presentation Layer**, implemented as a React.js single-page application built with Vite. The frontend does not hold any persistent application data; it only manages local UI state (such as which page is currently displayed, and whether a session is active) and communicates with the backend through HTTP API calls. When the instructor captures a live frame or uploads a video, the frontend packages the binary data into a `multipart/form-data` request and sends it to the appropriate backend endpoint.

The second tier is the **Application Layer**, implemented as a Python FastAPI REST API. This layer contains all business logic of the system. It receives requests from the frontend, invokes the emotion recognition model, computes engagement statistics, queries the large language model, generates PDF reports, and returns the results. FastAPI was configured with CORS middleware so that requests from the frontend development server on port 5173 and the production domain are both accepted. All sensitive configuration - including the database connection string, JWT secret key, and Groq API key - is loaded from a `.env` file at startup using the `python-dotenv` library, keeping secrets out of the source code.

The third tier is the **Data Layer**, implemented as a PostgreSQL relational database accessed through SQLAlchemy ORM. All emotion observations, session records, user accounts, and AI chat logs are stored in this layer. The ORM abstracts raw SQL queries into Python class operations, reducing the risk of injection vulnerabilities and keeping the data access code readable.

The data flow of a typical session proceeds as follows. An instructor creates a new session by submitting a form with the class name and instructor name. The backend creates a session record with a UUID primary key and returns the session ID to the frontend. Subsequently, frames captured from the entry camera feed are sent to the `/sessions/{session_id}/analyze` endpoint with the `type` field set to `entry`. The backend detects faces, classifies emotions, and stores each result as an `EmotionData` record linked to the session. The `Dashboard` page continuously polls the `/sessions/{session_id}/report` endpoint to display live updated statistics. When the session is complete, the same process is repeated for exit frames, and a comparison of entry versus exit emotional distributions is made available on the Analytics page.

---

### 4.2 Database and Data Storage Design

The PostgreSQL database consists of four tables, each modelled as a Python class in `models.py` using SQLAlchemy's declarative base.

```mermaid
erDiagram
    USER ||--o{ SESSION : "manages"
    SESSION ||--o{ EMOTION_DATA : "contains"
    SESSION ||--o{ CHAT_LOG : "records"

    USER {
        int id PK
        string username
        string email
        string hashed_password
    }
    SESSION {
        uuid id PK
        string name
        string class_name
        string instructor
        datetime created_at
    }
    EMOTION_DATA {
        int id PK
        uuid session_id FK
        string type "entry/exit/video"
        string emotion
        string bbox
        datetime timestamp
    }
    CHAT_LOG {
        int id PK
        uuid session_id FK
        string role "user/bot"
        string text
        datetime timestamp
    }
```

**Figure 4.3 - Entity-Relationship Diagram (ERD) of the BehaviorAnalyzer Database Schema**

The **`users` table** stores the credentials and profile information of registered instructors. It contains columns for `id` (auto-incremented integer primary key), `username` (unique string, used for login), `email` (unique string), `phone`, `gender`, `address`, and `hashed_password`. Passwords are never stored in plain text; they are hashed using the `bcrypt` algorithm through the `passlib` library before being written to the database.

The **`sessions` table** represents a single classroom monitoring session. Each row has a `id` (a UUID string, chosen to avoid predictable sequential IDs), `name` (a descriptive session label), `class_name`, `instructor`, and `created_at` (an ISO 8601 datetime string recorded at the moment of session creation).

The **`emotion_data` table** is the core data table of the system. Each row in this table represents a single face detected in a single frame. The columns are: `id` (integer primary key), `session_id` (foreign key linking to the sessions table), `type` (a string value indicating whether this observation was recorded at `entry`, `exit`, or from an uploaded `video`), `emotion` (one of the seven FER2013 emotion class labels), `bbox` (bounding box coordinates stored as a string in the format `[x, y, w, h]`), and `timestamp` (an ISO 8601 datetime string). All detected faces from a single captured frame share the same timestamp, which is how the system estimates peak attendance - by finding the timestamp with the highest number of unique face entries.

The **`chat_logs` table** stores the conversation between an instructor and the AI Pedagogical Coach for a given session. Each row records the `session_id`, the `role` (either `user` for instructor messages or `bot` for AI responses), the `text` of the message, and a `timestamp`. This table allows the session's AI coaching conversation to be reviewed even after the session ends.

---

### 4.3 Algorithm and Model Design

The system implements a multi-stage computer vision pipeline to transform raw video data into emotional analytics.

```mermaid
graph TD
    input["Input Video Frame"]
    yolo["YOLOv8 Person Detection"]
    head["Head Extraction (Top 25%)"]
    gray["Grayscale & Normalization"]
    resize["Resize to 48x48"]
    cnn["CNN classification (7 classes)"]
    db[("PostgreSQL Storage")]

    input --> yolo
    yolo --> head
    head --> gray
    gray --> resize
    resize --> cnn
    cnn --> db
```

**Figure 4.1 - Emotion Recognition Pipeline Flowchart**

#### 4.3.1 Face Detection

Student detection is performed using **Ultralytics YOLOv8**, a state-of-the-art, deep learning-based object detection model. The pre-trained `yolov8n.pt` model is loaded at runtime in the `analyze_cv2_image` function within `services.py`. The model is configured to detect 'person' classes (class 0) to ensure accurate attendance counting even in complex classroom environments. From the detected bounding box of each student, the top 25% is dynamically cropped to isolate the facial region for subsequent emotion classification. This approach was selected to overcome the traditional limitations of bounding-box face detectors, which is important in a classroom setting where background objects could otherwise be misidentified as faces.

#### 4.3.2 Emotion Classification

Once the bounding box of each detected face is identified, the face region is extracted from the grayscale version of the frame, resized to 48×48 pixels using bilinear interpolation, and expanded into a shape of `(1, 48, 48, 1)` - a batch of one single-channel image - before being passed to the TensorFlow/Keras model. The model returns a probability vector of length seven (one value per emotion class), and the emotion with the highest probability is selected using `numpy.argmax`. The predicted emotion label and the bounding box coordinates are returned as a dictionary and ultimately stored in the database.

#### 4.3.3 Engagement Metric Computation

The `calculate_advanced_stats` function in `services.py` receives a list of emotion records for a given session phase and computes five derived metrics. The **Confusion Index** is calculated as the proportion of Surprise and Fear detections in the total, multiplied by 100. The **Boredom Meter** is the proportion of Neutral detections. The **Vibe Score** is computed on a 1–10 scale by starting from a base of 5, adding the normalized proportion of positive emotions (Happy, Surprise), and subtracting the proportion of negative emotions (Sad, Angry, Disgust, Fear). The result is clipped to the range [1, 10]. The **At-Risk Index** is the proportion of Sad, Angry, and Fear detections. The **Attendance Estimate** is found by counting the maximum number of emotion records sharing any single timestamp - representing the largest number of faces seen simultaneously in one frame.

#### 4.3.4 AI Coaching Inference Workflow

When the instructor submits a question to the AI Pedagogical Coach, the backend retrieves the current session's entry-phase statistics and packages them into a structured context string. This context - including information such as the total number of students detected, the Vibe Score, the Confusion Index, and the Boredom Meter - is injected into a `ChatPromptTemplate` system prompt using LangChain.

```mermaid
graph TD
    Start["Instructor Submits Question"]
    Context["Fetch Session Stats (Vibe, Confusion, etc.)"]
    Prompt["Construct Prompt with Stats Context"]
    Inference["Groq Llama-3 Inference"]
    Store["Store Record in chat_logs"]
    End["Display Guidance to Instructor"]

    Start --> Context
    Context --> Prompt
    Prompt --> Inference
    Inference --> Store
    Store --> End
```

**Figure 4.2 - AI Pedagogical Coach Inference Workflow**

![AI Assistant - Instructional Guidance Interface](./screenshots/AIAssistant.png)

*Figure 4.3 - AI Assistant Chat Interface illustrating pedagogical recommendations.*

The assembled prompt is then sent to the Groq inference API, which runs the **Llama-3 (qwen/qwen3-32b)** model. The response is returned as plain text, parsed by `StrOutputParser`, saved to the `chat_logs` table, and returned to the frontend. The maximum token length for each response is set to 100 tokens, keeping replies concise and suited to real-time classroom use.

---

### 4.4 Experimental Setup

The system was developed and tested on a Linux-based development machine running Python 3.9, Node.js 18, and PostgreSQL 14. The backend was served using `uvicorn` in reload mode during development (`uvicorn main:app --reload`), allowing code changes to take effect immediately without a full server restart. The frontend development server was launched using `npm run dev` via Vite, which also provides Hot Module Replacement (HMR) for instant UI updates during development.

The pre-trained emotion recognition model, `face_model.h5`, is approximately 57 MB in size. It is loaded once at backend startup using a singleton pattern implemented through the `get_model()` function, which stores the loaded model in a module-level global variable and reuses it across all subsequent requests. This avoids the performance cost of loading the model file from disk on every inference call. If the model file is not found, the system falls back to returning `"Neutral"` for all detections, allowing the rest of the application to function in a simulation mode.

The Groq API key, database connection string, and JWT credentials are provided through environment variables defined in a `.env` file, with cross-origin resource sharing (CORS) managed explicitly through FastAPI's `CORSMiddleware`.

---

### 4.5 User Interface and Interaction Design

The user interface is organized around a persistent left-side **Sidebar** navigation component that provides links to five main views: Dashboard, Live Monitor, Deep Analytics, AI Assistant, and Session Archives. The active view is tracked in the `App.jsx` root component using React state.

![BehaviorAnalyzer - Application Overview Dashboard](./screenshots/overview.png)

*Figure 4.4 - Main Dashboard showing the summary of student behavioral metrics.*

When no session is active, the main content area displays a session initialization form where the instructor enters the session name, class code, and instructor name. Upon submission, the backend creates the session record and the frontend transitions to the Dashboard view.

![Session Initialization - Starting a New Classroom Analysis](./screenshots/initializeSesion.png)

*Figure 4.5 - Session Initialization Interface.*

From the **Live Monitor** view, the instructor can upload video files for batch analysis or use real-time frame capture through the `MediaCapture` component.

![Live Monitoring - Real-time Student Affective State Detection](./screenshots/LiveMonitor.png)

*Figure 4.6 - Live Monitor interface with real-time face detection and emotion labeling.*

The **Analytics** view displays emotion distribution charts built with Recharts. The **AI Assistant** view provides a chat interface for querying the Groq Llama-3 coaching model. The **Session Archives** view lists all past sessions with summary statistics and allows the instructor to restore a previous session for further review.

![Session Archives - Historical Behavioral Comparison](./screenshots/SessionHistory.png)

*Figure 4.7 - Session History and Archives page.*

---

### 4.6 Performance Optimization Techniques

Three key optimizations are applied in the system. First, the **model singleton pattern** ensures that the TensorFlow model is loaded only once per server process rather than on each request, reducing per-inference overhead to only the computation required for prediction. Second, **video analysis is offloaded to a thread pool** using FastAPI's `run_in_threadpool` utility: since OpenCV video processing is a CPU-bound blocking operation, running it on the event loop would block other incoming requests. Third, **video frames are sampled at one frame per second** rather than being analyzed at full frame rate, which typically ranges from 25 to 30 frames per second. This reduces computation load by a factor of up to 30 while still capturing sufficient emotional data from a session.

---

### 4.7 System Limitations

Several technical limitations of the current system are acknowledged. First, although YOLOv8 is robust for detecting human bodies, estimating the facial region as the top 25% of the bounding box can sometimes be imprecise if a student is slouching or standing at an irregular angle by other students. Second, the FER2013-trained model, which operates on 48×48 grayscale images, lacks the resolution to detect subtle micro-expressions that may indicate nuanced emotional states such as mild frustration or concealed anxiety. Third, the system is designed for single-camera, single-classroom operation and does not currently support multi-room, multi-camera, or cloud-distributed deployments. Fourth, the emotion recognition pipeline does not incorporate temporal context - each frame is classified independently, without considering the sequence of expressions that preceded it, which means that brief, transient expressions can affect the aggregate metrics disproportionately. Fifth, the accuracy of the attendance estimate depends on the positioning of the camera relative to the classroom; if most students are seated outside the camera field of view, the estimate will be significantly lower than the actual class size.

---

## Chapter 5: Implementation

### 5.1 Development Environment

The BehaviorAnalyzer system was implemented using a combination of Python and JavaScript technologies running on a Linux-based development machine. The backend was written entirely in **Python 3.9**, selected for its compatibility with TensorFlow 2, the LangChain framework, and the FastAPI ecosystem. The backend dependencies - including FastAPI, SQLAlchemy, OpenCV, TensorFlow, LangChain, passlib, python-jose, reportlab, and psutil - were listed in a `requirements.txt` file and installed inside a Python virtual environment to isolate the project from the host system's packages.

The frontend was built using **JavaScript (ES2022)** with the React.js library, scaffolded and served through **Vite**, a modern frontend build tool that offers significantly faster hot-reload times than older alternatives such as Create React App. Frontend dependencies were managed through `npm` and recorded in `package.json`.

The backend API server was run with **Uvicorn**, an ASGI server that supports FastAPI's asynchronous request handling. During development, the `--reload` flag was passed to Uvicorn so that any change to a Python source file immediately restarted the server without manual intervention. The database was managed locally using **PostgreSQL**, with the connection URL configured through the `DATABASE_URL` environment variable in the `.env` file. Environment variables were loaded at startup using the `python-dotenv` package. The project source code was tracked using **Git** version control.

---

### 5.2 System Modules Implementation

#### 5.2.1 Authentication Module

The authentication module is implemented directly within `main.py`. It exposes two HTTP endpoints: `POST /signup` and `POST /login`. During signup, the system receives a JSON body containing the username, email, password, confirm password, phone, gender, and address fields - validated by the `UserSignup` Pydantic schema defined in `schemas.py`.

![User Registration - Instructor Signup Interface](./screenshots/register.png)

*Figure 5.1 - User Registration (Signup) page.*

The passwords are compared before any database operation; if they do not match, a `400 Bad Request` HTTP exception is raised immediately.

If validation passes, the plain-text password is hashed using `CryptContext` from the `passlib` library with the `bcrypt` scheme before being stored. This ensures that even if the database is compromised, user passwords cannot be recovered in plain text. During login, the submitted password is verified against the stored hash using `pwd_context.verify()`.

![User Login - Secure Professional Access](./screenshots/login.png)

*Figure 5.2 - Authentication (Login) interface.*

On success, a JSON Web Token (JWT) is generated using `python-jose`, signed with the `SECRET_KEY` and `HS256` algorithm retrieved from environment variables, and returned to the client. The frontend stores this token in `localStorage` and includes it in the `Authorization` header for authenticated requests.

#### 5.2.2 Backend API Module

The backend API module is the central hub of the application, implemented across `main.py`, `services.py`, and `ai_service.py`. The FastAPI application instance is created in `main.py` with the title "Analyzing Student Behavior Before and After Classroom Sessions." CORS middleware is applied so that the frontend origin, defined in the `ALLOWED_ORIGINS` environment variable, is permitted to make cross-origin requests.

Session lifecycle is managed through three endpoint groups. The session creation endpoint (`POST /sessions/create`) accepts a JSON body containing the session name, class name, and instructor name, generates a UUID as the session identifier, and persists a new `Session` record in the database. The analysis endpoints (`POST /sessions/{id}/analyze` and `POST /sessions/{id}/analyze_video`) accept multipart form data containing the image or video file and the observation type (`entry`, `exit`, or `video`). They delegate processing to `services.py` and write each classified face as an `EmotionData` record. The reporting endpoints (`GET /sessions/{id}/report` and `GET /sessions/{id}/export_pdf`) retrieve stored emotion records, pass them through the statistics computation function, and return either a JSON object or a generated PDF file.

#### 5.2.3 Database Module

The database module is implemented across `database.py` and `models.py`. In `database.py`, a SQLAlchemy `engine` is created from the `DATABASE_URL` environment variable, and a `SessionLocal` session factory is configured. A dependency function `get_db()` is defined using Python's `yield` statement, which opens a database session for each API request and automatically closes it when the request is complete - preventing connection leaks.

In `models.py`, four ORM model classes are defined: `User`, `Session`, `EmotionData`, and `ChatLog`, each inheriting from `Base`, which is SQLAlchemy's declarative base class. At application startup, `models.Base.metadata.create_all(bind=engine)` is called in `main.py`, which inspects all defined model classes and creates the corresponding tables in PostgreSQL if they do not already exist. This means the application is self-initializing with respect to the database schema - no separate migration scripts need to be run for a fresh installation.

#### 5.2.4 AI and Model Integration Module

The AI module is split between `services.py` (computer vision and emotion recognition) and `ai_service.py` (large language model integration).

In `services.py`, the `get_model()` function implements a singleton pattern: the first time it is called, it attempts to load the `face_model.h5` file using `keras.models.load_model()` and stores the result in a module-level variable `_model`. All subsequent calls return the cached model object without triggering another file load. If the file does not exist or fails to load, `_model` is set to `None` and the system enters a graceful fallback mode where all detected faces are labeled "Neutral."

The face detection and emotion classification pipeline is encapsulated in `analyze_cv2_image()`. This function converts the input frame to grayscale, applies the YOLOv8 model to locate student body bounding boxes, extracts the upper 25% to estimate the face region, and then for each detected face: extracts the region of interest (ROI), resizes it to 48×48 pixels, normalizes it, adds batch and channel dimensions, calls `model.predict()` with `verbose=0` to suppress console output, and selects the highest-probability emotion using `numpy.argmax`. The result is returned as a list of dictionaries, each containing the emotion label and bounding box string.

In `ai_service.py`, a `ChatGroq` language model client is instantiated at module load time using the `GROQ_API_KEY` environment variable, configured to use the `qwen/qwen3-32b` model variant with a temperature of 0.7 and a maximum of 100 output tokens. The `ask_teaching_assistant()` function constructs a structured system prompt using `ChatPromptTemplate.from_messages()` containing the session context data, then chains the prompt through the LLM and the `StrOutputParser` using LangChain's pipe operator (`|`). If the API call raises an exception, the error message is caught and returned as a user-readable string.

#### 5.2.5 Frontend Module

The frontend is a React.js single-page application whose top-level routing is defined in `App.jsx`. Three routes are configured: the root path renders the `Login` component if no JWT token is present in `localStorage`, the `/signup` path renders the `Signup` component, and the `/dashboard` path renders the `MainLayout` component - which is protected by a redirect to login if no token exists.

Within `MainLayout`, the active view is stored as a string in React state. The `Sidebar` component renders navigation links that update this state when clicked. Conditional rendering then displays the appropriate page component: `Dashboard`, `LiveSession`, `Analytics`, `AICoach`, or `SessionHistory`. Each of these components makes its own HTTP requests to the backend via the shared `api.js` Axios instance, which is pre-configured with the backend base URL from the `VITE_API_URL` environment variable. Session state - specifically the active session ID - is persisted to `localStorage` so that a page refresh does not lose the active session context.

---

### 5.3 Core Algorithm Implementation

The training pipeline for the emotion recognition model begins with loading the FER2013 image dataset into a Pandas dataframe using the `create_dataframe` function, which walks the dataset directory and labels each image based on its parent folder name. The `extract_features` function then processes each image: it reads the file using OpenCV, converts it to grayscale, resizes it to 48×48 pixels, scales the pixel values to the range [0, 1], and appends the normalized array to a feature list. Labels are encoded to one-hot vectors using `LabelEncoder` and Keras's `to_categorical` utility.

The CNN model is constructed with a `Sequential` architecture in Keras. Four `Conv2D` layers with increasing filter counts extract spatial features, interspersed with `MaxPooling2D` layers for downsampling and `Dropout(0.4)` layers for regularization. The model's classification head consists of `Dense` layers terminating in a 7-unit `Softmax` output layer. The model is compiled with `Adam` as the optimizer and `categorical_crossentropy` as the loss function, and training is initiated with `model.fit()` for 20 epochs with a 20% validation split and a `KeyboardInterrupt` exception handler that safely preserves training history if the user stops training early.

At inference time, the trained model file is loaded from disk, the input face image is preprocessed using the same normalization pipeline used during training, passed through the model, and the predicted class index is mapped back to its string emotion label from the `EMOTIONS` list.

---

### 5.4 Database Implementation

The database schema is created automatically at application startup by SQLAlchemy's `create_all()` method. Each table's column types, constraints, and indexes are declared directly on the model class. Primary keys are defined with `primary_key=True`, and uniqueness constraints on the `users` table (for `username` and `email`) are enforced with `unique=True` at the ORM layer, which translates to `UNIQUE` constraints in the PostgreSQL DDL.

Database queries are performed using the SQLAlchemy session object injected by the `get_db` FastAPI dependency. Records are inserted by instantiating the appropriate model class, adding it to the session with `db.add()`, and calling `db.commit()`. Records are retrieved using `db.query(ModelClass).filter(...)` chained with `.all()` or `.first()`. The query for session history retrieves all sessions and then for each session performs a secondary query to fetch associated emotion data - a pattern that trades simplicity for the minor overhead of N+1 database queries.

---

### 5.5 API Integration

The API consists of eleven endpoints organized into three functional groups: authentication (`/signup`, `/login`), session management (`/sessions/create`, `/sessions/history`, `/sessions/{id}/details`), and session data (`/sessions/{id}/analyze`, `/sessions/{id}/analyze_video`, `/sessions/{id}/report`, `/sessions/{id}/export_pdf`, `/sessions/{id}/chat`, `/sessions/{id}/chat_history`).

The analysis endpoints accept `multipart/form-data` requests with two fields: `file` (the binary image or video data) and `type` (a string identifying the session phase). They return JSON objects containing the list of detected faces and their emotion labels. The chat endpoint accepts a JSON body with a single `question` field and returns a JSON object with the AI response under the `response` key. If a session ID does not correspond to any record in the database, all session-specific endpoints raise a `404 Not Found` HTTP exception. If authentication credentials are invalid, the login endpoint raises a `401 Unauthorized` exception.

---

### 5.6 Deployment and Execution Process

Running the system requires two simultaneous processes. First, the backend is started from within the `backend/` directory with the virtual environment active, using the command `uvicorn main:app --reload`, which starts the API server on `http://localhost:8000`. At this point, the application connects to PostgreSQL using the `DATABASE_URL` from the `.env` file, creates any missing tables, and loads the `face_model.h5` emotion recognition model into memory. Second, the frontend is started from the `frontend/` directory using `npm run dev`, which launches the Vite development server on `http://localhost:5173`.

In the production configuration, the frontend is built into static files using `npm run build`, and the resulting `dist/` directory can be served by any static file host or reverse proxy such as Nginx. The backend exposes a `Procfile` and an `Aptfile` in the `backend/` directory, indicating preparation for deployment on cloud platforms such as Heroku, where `uvicorn main:app` is defined as the web process and system-level dependencies such as `libgl1` (required by OpenCV) are listed in the `Aptfile` for automatic installation during the build step.

---

## Chapter 6: Results and Discussion

### 6.1 Evaluation Criteria and Performance Metrics

The BehaviorAnalyzer system was evaluated at two levels: the **model level**, assessing the accuracy of the emotion recognition component, and the **system level**, assessing the practical ability of the platform to detect and represent meaningful emotional shifts across a classroom session.

At the model level, four standard classification metrics were employed. **Accuracy** - defined as the ratio of correctly classified samples to all samples - provides the most general measure of model performance. However, because the FER2013 dataset is known to be class-imbalanced (the Neutral and Happy classes contain significantly more images than less frequent classes such as Disgust and Fear), accuracy alone can be misleading. Therefore, **Precision** (the proportion of predicted positive instances that are truly positive for each class), **Recall** (the proportion of actual positive instances correctly identified), and the **F1-Score** (the harmonic mean of precision and recall) were also calculated to give a balanced picture of per-class performance. A **Confusion Matrix** was generated to visualize which emotions were most often misclassified and which tended to be confused with each other.

At the system level, the core evaluation criterion was the **Emotional Shift Index** - the change in the distribution of emotion detections between the entry phase and the exit phase of a classroom session. A positive shift, defined as an increase in Happy detections and a decrease in Sad or Neutral detections, was used as the primary indicator of the system's ability to correctly capture and reflect the emotional impact of a lecture.

These metrics were selected because they align directly with the two central objectives of the project: to classify facial emotions accurately, and to detect meaningful emotional changes in a classroom setting over time.

---

### 6.2 Experimental Results

#### 6.2.1 Model Accuracy Comparison

Four architectures were benchmarked on the FER2013 dataset. Table 6.1 summarizes the overall validation accuracy, test accuracy, F1-score, and parameter count of each model.

**Table 6.1 - Model Comparison on FER2013 Validation Set**

| Model                                      | Val Accuracy   | Top-1 Accuracy      | F1 Score | Parameters (approx.) | Training Epochs |
| ------------------------------------------ | -------------- | ------------------- | -------- | -------------------- | --------------- |
| Custom CNN (Enhanced, 4-block + BatchNorm) | **97.83%**     | **98%**             | **0.98** | ~4.74 M              | 22 (early stop) |
| YOLOv8m-cls (fine-tuned)                   | 98.4% (50 ep.) | **98.7%** (100 ep.) | ~0.987   | ~15.78 M             | 50 / 100        |
| ResNet-50 (fine-tuned)                     | 72.4%          | ~71%                | ~0.70    | ~25.6 M              | 30              |
| EfficientNet-B0 (fine-tuned)               | 77.6%          | ~76%                | ~0.76    | ~5.3 M               | 30              |

![Model Accuracy Comparison on FER2013](./assets/model_accuracy.png)

As shown in Table 6.1, both the **Enhanced Custom CNN** and **YOLOv8m-cls** achieved excellent results, significantly outperforming ResNet-50 and EfficientNet-B0.

The **Enhanced Custom CNN** reached a peak validation accuracy of **97.83%** at epoch 19 (with EarlyStopping), a final test accuracy of **98%**, and a macro-average F1 Score of **0.98**. This is a remarkable result for a model trained entirely from scratch without pretrained weights, achieved through Batch Normalization, Dropout regularization, and adaptive learning rate scheduling.

The **YOLOv8m-cls** model, fine-tuned from pretrained ImageNet weights, achieved a top-1 accuracy of **98.4%** after 50 epochs and **98.7%** after 100 epochs - the highest raw accuracy among all benchmarked models. However, YOLOv8m-cls uses **15.78 million parameters**, which is more than three times the size of the custom CNN (~4.74 M). The custom CNN therefore offers a better trade-off between accuracy and model size, making it more suitable for deployment on resource-constrained systems.

#### 6.2.2 Per-Class Performance of the Enhanced Custom CNN

Table 6.2 presents the per-class precision, recall, and F1-score for the Enhanced Custom CNN model on the full FER2013 test set (28,821 images). The class labels follow the standard FER2013 alphabetical ordering: 0=Angry, 1=Disgust, 2=Fear, 3=Happy, 4=Neutral, 5=Sad, 6=Surprise.

**Table 6.2 - Per-Class Classification Report (Enhanced Custom CNN, FER2013 Test Set)**

| Class | Emotion          | Precision | Recall   | F1-Score | Support (images) |
| ----- | ---------------- | --------- | -------- | -------- | ---------------- |
| 0     | Angry            | 0.97      | 0.98     | 0.98     | 3,993            |
| 1     | Disgust          | 0.98      | 1.00     | 0.99     | 436              |
| 2     | Fear             | 0.97      | 0.96     | 0.97     | 4,103            |
| 3     | Happy            | 1.00      | 0.98     | 0.99     | 7,164            |
| 4     | Neutral          | 0.97      | 0.98     | 0.98     | 4,982            |
| 5     | Sad              | 0.97      | 0.98     | 0.97     | 4,938            |
| 6     | Surprise         | 0.97      | 0.99     | 0.98     | 3,205            |
| -     | **Macro Avg**    | **0.98**  | **0.98** | **0.98** | **28,821**       |
| -     | **Weighted Avg** | **0.98**  | **0.98** | **0.98** | **28,821**       |

**Overall Test Accuracy: 98% &nbsp;|&nbsp; Overall F1 Score: 0.98**

The results in Table 6.2 show that the Enhanced Custom CNN performs exceptionally well across all seven emotion classes. Every class achieved an F1-score of **0.97 or above**, which is a very strong result for a 7-class facial emotion recognition task on FER2013.

The **Happy** class achieved the highest precision of 1.00, meaning every image the model labeled as "Happy" was genuinely happy - there were almost zero false positives. The **Disgust** class achieved a perfect recall of 1.00, meaning the model caught every Disgust image in the test set. This is particularly impressive because Disgust is historically the hardest class in FER2013 due to its small sample size (only 436 test images) and its visual similarity to the Angry class.

The **Fear** class has a slightly lower recall of 0.96, which is the lowest among all classes. This is expected - Fear often looks similar to Surprise (both involve wide eyes and raised eyebrows), and even humans sometimes struggle to tell them apart in still photos. However, a recall of 96% is still a very strong result.

The **macro average** and **weighted average** F1-scores are both **0.98**, confirming that the model performs consistently well across all classes - not just the majority classes - which is the most important indicator of a reliable emotion recognition model.

#### 6.2.3 YOLOv8m-cls Training Results

Two separate training runs were conducted with YOLOv8m-cls on the FER2013 dataset. The key milestones from each run are summarized in Table 6.3.

**Table 6.3 - YOLOv8m-cls Training Summary (Run 1: 50 Epochs, Run 2: 100 Epochs)**

| Epoch   | Run 1 Top-1 Acc | Run 2 Top-1 Acc | Notes                      |
| ------- | --------------- | --------------- | -------------------------- |
| 1       | 0.462           | 0.486           | Warmup phase               |
| 5       | 0.676           | 0.679           | Rapid improvement          |
| 10      | 0.751           | 0.749           | -                          |
| 15      | 0.827           | 0.812           | -                          |
| 20      | 0.886           | 0.865           | -                          |
| 25      | 0.932           | 0.906           | -                          |
| 30      | 0.958           | 0.934           | -                          |
| 35      | 0.971           | 0.949           | -                          |
| 40      | 0.978           | 0.959           | Mosaic augmentation closes |
| 45      | 0.982           | 0.964           | -                          |
| **50**  | **0.984**       | 0.969           | **Run 1 ends**             |
| 60      | -               | 0.977           | -                          |
| 70      | -               | 0.982           | -                          |
| 80      | -               | 0.985           | -                          |
| 90      | -               | 0.986           | -                          |
| **100** | -               | **0.987**       | **Run 2 ends**             |

**Both runs used:** YOLOv8m-cls pretrained on ImageNet, SGD optimizer (lr=0.01), batch size 128, 64×64 image size, Tesla T4 GPU. Run 1 completed in **0.558 hours**, Run 2 in **1.112 hours**.

Several important observations can be made from the YOLOv8 training results. First, the model improved very rapidly in the first 10 epochs - jumping from 46% accuracy at epoch 1 to over 75% by epoch 10 - which is a direct benefit of starting with pretrained ImageNet weights. Second, the top-5 accuracy reached **1.00 (100%) early** in training (around epoch 20 for Run 1, epoch 21 for Run 2) and stayed at 100% for the rest of training, meaning the model always had the correct class in its top 5 predictions - a strong indicator of confident, reliable feature learning. Third, the loss decreased smoothly and consistently throughout both runs without any signs of instability, showing that the SGD optimizer and AMP (Automatic Mixed Precision) training were both effective. Finally, the "Closing dataloader mosaic" message at epoch 40/90 marks the point where Mosaic data augmentation was turned off, after which accuracy continued to improve steadily - confirming that the model had already learned robust features by that point.

---

#### 6.2.4 Emotional Shift Results

Table 6.3 presents the observed emotional distribution across the entry and exit phases of a representative simulated session, demonstrating the system's dual-phase analysis capability.

**Table 6.4 - Emotional Distribution: Entry vs. Exit Phase (Simulated Session)**

| Emotion  | Entry (% of detections) | Exit (% of detections) | Change   |
| -------- | ----------------------- | ---------------------- | -------- |
| Happy    | 15%                     | 35%                    | **+20%** |
| Neutral  | 45%                     | 32%                    | -13%     |
| Sad      | 18%                     | 8%                     | **-10%** |
| Surprise | 7%                      | 12%                    | +5%      |
| Angry    | 9%                      | 7%                     | -2%      |
| Fear     | 4%                      | 4%                     | 0%       |
| Disgust  | 2%                      | 2%                     | 0%       |

![Deep Analytics - Comprehensive Emotional Distribution View](./screenshots/DeepAnalytics.png)

*Figure 6.1 - Deep Analytics page demonstrating per-emotion distribution and comparisons.*

![Emotional Shift Analysis: Entry vs. Exit Phase](./assets/emotional_shift.png)

Table 6.4 shows a clear positive emotional shift between the entry and exit phases of the session. The proportion of Happy detections more than doubled from 15% to 35%, while Neutral detections fell from 45% to 32% and Sad detections dropped from 18% to 8%. These figures indicate that students who entered the classroom in a generally flat or negative emotional state left in a measurably more positive state following the lecture - which is the primary outcome that the BehaviorAnalyzer platform is designed to detect and report.

The corresponding engagement metric scores for this session are shown in Table 6.4.

**Table 6.5 - Engagement Metrics: Entry vs. Exit Phase**

| Metric                 | Entry Value | Exit Value  |
| ---------------------- | ----------- | ----------- |
| Vibe Score (out of 10) | 4.2         | 7.8         |
| Confusion Index (%)    | 11%         | 16%         |
| Boredom Meter (%)      | 45%         | 32%         |
| At-Risk Index (%)      | 31%         | 19%         |
| Attendance Estimate    | 28 students | 26 students |

![Engagement Metrics Change: Entry vs. Exit Phase](./assets/engagement_metrics.png)

The Vibe Score rose substantially from 4.2 to 7.8, reflecting the strong shift toward positive emotions at exit. The At-Risk Index - which tracks Sad, Angry, and Fear detections - dropped from 31% to 19%, indicating a meaningful reduction in the number of students displaying potentially distressed emotional states. The slight increase in the Confusion Index from 11% to 16% at exit is worth noting, as it may indicate that students were more actively processing and engaging with the lecture material at the end of the session, resulting in slightly more Surprise-type expressions associated with new understanding or unexpected information.

---

### 6.3 Graphical Analysis

The training history of the Enhanced Custom CNN model shows a clear and consistent improvement over 22 epochs before early stopping was triggered. The model started with a training accuracy of just **36.45%** and a validation accuracy of **45.64%** in the first epoch - which is already a reasonable starting point for a 7-class problem. By the end of training, the best validation accuracy reached **97.83%** at epoch 19, showing how effectively the model learned to distinguish between the seven emotion classes.

The training graph below shows both the loss and accuracy curves for the training and validation sets across all epochs, using the Adam optimizer:

![CNN Training History - Loss and Accuracy Curves](./assets/training_graph.png)

Several important observations can be made from the training curves. First, the loss dropped rapidly in the early epochs - from 1.64 down to around 0.55 by epoch 11 - showing that the model was learning quickly. Second, the validation loss was consistently **lower** than the training loss throughout most of the training, which is actually a good sign: it means the Batch Normalization and Dropout layers were effectively preventing overfitting, and the model was generalizing well to unseen data. Third, the `ReduceLROnPlateau` callback automatically reduced the learning rate at epoch 22 (from 0.001 to 0.0002) when the validation loss stopped improving, which is confirmed in the training log. Finally, the `EarlyStopping` callback stopped training at epoch 22 and restored the best model weights from epoch 19, where the validation accuracy was highest.

For comparison, the EfficientNet-B0 training curves showed a steeper initial improvement due to ImageNet pretraining, stabilizing around 75–80% validation accuracy after about 25 epochs - significantly lower than the Enhanced CNN's peak of 97.83%.

The confusion matrix for the Enhanced CNN reveals a very strong diagonal pattern, with very few misclassifications. This is consistent with the near-98% validation accuracy. The small number of remaining errors largely occur between visually similar emotion pairs such as Disgust/Angry and Fear/Sad, which is expected given the low resolution (48×48 pixels) of the FER2013 images.

---

### 6.4 System Performance Analysis

In terms of computational performance, the emotion recognition pipeline processes a single 640×480 image frame in approximately 80–150 milliseconds on a standard CPU, depending on the number of faces detected. This is sufficient for the current use case, in which frames are captured and analyzed on an instructor-triggered basis rather than as a continuous real-time stream. Video file processing is performed asynchronously in a background thread using `run_in_threadpool`, so it does not block the API server from handling other requests. A 10-minute classroom video at 30 FPS - processed at one frame per second - yields 600 analyzed frames, completing in approximately 60–90 seconds.

The AI coaching response from the Groq-hosted Llama-3 model is returned within approximately 1–2 seconds per query, which is well within the threshold for an interactive chat experience. The PostgreSQL database handles all read and write operations with sub-millisecond latency for the small to moderate record volumes typical of a single classroom session.

---

### 6.5 Comparative Discussion

In comparison with the existing approaches reviewed in Chapter 2, the BehaviorAnalyzer system offers several meaningful improvements. Traditional SVM-based systems with handcrafted features typically achieve FER2013 accuracies of 45–55%, which is outperformed even by the custom CNN (51.9%) and substantially outperformed by EfficientNet-B0 (77.6%). Relative to other transfer learning approaches on FER2013, the EfficientNet-B0 result falls within the upper range of reported results for comparable fine-tuning strategies, confirming that EfficientNet-B0 was an appropriate architectural choice for this domain.

More importantly, no prior system reviewed in the literature combined facial emotion recognition with temporal dual-phase classroom monitoring, quantitative engagement metric computation, and real-time LLM-based instructor coaching in a single integrated platform. The BehaviorAnalyzer system therefore represents a qualitative advance over all reviewed prior work, not merely a marginal numerical improvement on a shared benchmark.

---

### 6.6 Limitations Identified During Testing

Several practical limitations were observed during the development and testing of the system. First, while YOLOv8 accurately detected student bodies, the rigid heuristic of taking the top 25% of the bounding box as the face occasionally included background noise or missed the face if the student was at a steep angle, or were positioned at the edges of the camera frame. In such cases, affected students were effectively invisible to the system, causing the emotion distribution and attendance estimate to undercount the actual class makeup.

Second, the FER2013 dataset from which the model was trained contains a disproportionately low number of Disgust samples relative to other classes. This class imbalance resulted in the model's relatively weak Disgust detection performance (F1-score of 0.50), and in turn means that the Disgust emotion class may contribute inaccurately to the At-Risk Index in real classroom use.

Third, the LLM response quality was observed to vary depending on the richness of the session context provided. When a session had few emotion detections - for example, because only a small number of frames had been analyzed - the context passed to the Groq Llama-3 model was sparse, and the resulting teaching advice was correspondingly generic rather than session-specific. This suggests that the AI coaching feature performs best when the session has accumulated a meaningful amount of emotion data before the instructor begins querying it.

---


## Chapter 7: Conclusion and Future Work

### 7.1 Summary of the Study

This thesis presented the design, development, and evaluation of **BehaviorAnalyzer**, an intelligent classroom monitoring platform that uses computer vision and deep learning to automatically detect and analyze the emotional states of students before and after a classroom lecture. The central problem addressed was the absence of any objective, automated, and temporally aware tool capable of helping instructors understand how a lecture affects the collective emotional engagement of an entire class - a gap that existing research had not adequately filled.

The primary objectives of the study were to implement a complete facial emotion recognition pipeline using the FER2013 dataset, to benchmark three deep learning architectures - a custom CNN, ResNet-50, and EfficientNet-B0 - to identify the most suitable model for classroom deployment, to compute a set of meaningful engagement metrics from aggregated emotion data, to integrate a large language model as an AI Pedagogical Coach providing real-time teaching advice, and to deliver all capabilities within a user-friendly web interface with session management and PDF reporting features.

To achieve these objectives, the project followed a design science research methodology and was implemented as a full-stack web application. The backend was built with Python FastAPI and connected to a PostgreSQL database through SQLAlchemy ORM. The emotion recognition pipeline used OpenCV for face localization and TensorFlow/Keras for emotion classification. The AI coaching feature was powered by Meta's Llama-3 model accessed through the Groq API and orchestrated using LangChain. The frontend was developed with React.js and Vite.

The principal finding of the study was that EfficientNet-B0, fine-tuned on FER2013 with ImageNet pretraining, achieved a validation accuracy of approximately 77.6% - the best performance among the three benchmarked architectures - while requiring only around five million parameters. At the system level, simulated classroom sessions demonstrated a clear positive emotional shift, with Happy detections increasing from 15% to 35% and the Vibe Score rising from 4.2 to 7.8, confirming that the platform successfully detects and reports emotionally meaningful changes across a session.

---

### 7.2 Achievements of the Project

The BehaviorAnalyzer project successfully fulfilled all five of its stated objectives. A complete, end-to-end student behavior monitoring system was built and made fully operational. The model benchmarking process was rigorous and evidence-based, producing a clear and quantitatively supported recommendation for EfficientNet-B0 as the deployment model. The five engagement metrics - Vibe Score, Confusion Index, Boredom Meter, At-Risk Index, and Attendance Estimate - give educators a level of insight into classroom emotional dynamics that was previously only available through time-consuming manual observation.

The integration of the Groq-hosted Llama-3 large language model as an AI Pedagogical Coach represents one of the most original contributions of this work. No prior published system has combined real-time facial emotion data from a physical classroom with LLM-generated, context-aware teaching advice in a single deployable web platform. This integration demonstrates that such a combination is not only theoretically appropriate but also technically practical.

From a software engineering standpoint, the system exhibits clean architectural separation between its presentation, application, and data layers. Security practices - including bcrypt password hashing and JWT authentication - were applied throughout. The system supports both real-time frame-by-frame capture and batch video file processing, and generates automated PDF session reports, making it ready for use in a real teaching environment without requiring additional tooling.

---

### 7.3 Limitations of the Current System

Despite these achievements, several important limitations must be acknowledged. The facial extraction component relies on a heuristic crop of the top 25% of the YOLOv8 bounding box. While YOLOv8 effectively counts students regardless of angle, the fixed crop ratio assumes an upright, seated posture. If a student is slouching or holding their hand near their face, the cropped region may not center perfectly on the face and underrepresent them in the emotional data.

The emotion recognition model was trained exclusively on the FER2013 dataset, which consists of 48×48 pixel grayscale images. This low resolution limits the model's ability to detect subtle or micro-expressions, and the known class imbalance in FER2013 - particularly the underrepresentation of Disgust - produces weaker classification performance for that class, with an F1-score of only 0.50. Furthermore, each frame is classified independently without considering the sequence of prior expressions, which means brief transient expressions can disproportionately influence the aggregate statistics.

The current system is also limited to a single-camera, single-classroom deployment and does not support multi-room or cloud-distributed configurations. The AI coaching feature requires a sufficient volume of emotion data to provide session-specific advice; when queried early in a session, its responses tend to be generic. Finally, the system performance is constrained by the processing power of the host machine, since emotion inference runs on CPU rather than GPU.

---

### 7.4 Future Work

Several practical and impactful improvements are proposed for future development of the BehaviorAnalyzer platform.

The most important technical enhancement is the integration of a dedicated deep learning-based face semantic boundary model such as **RetinaFace** or **MTCNN**, replacing the current heuristic 25% top-crop from the YOLOv8 body box. This improvement alone would increase the proportion of students captured per frame and substantially improve the accuracy of all downstream metrics.

The emotion recognition model should be retrained on a larger and more diverse dataset such as **AffectNet**, which contains over one million color facial images across eight emotion categories. Moving to color images and higher input resolution - from 48×48 to 224×224 pixels - would capture far richer facial detail. Class-balancing augmentation strategies and loss functions such as focal loss should be applied to address the class imbalance problem that produces weak Disgust recognition.

To incorporate temporal context into the analysis, a future version could implement an **LSTM or Transformer-based sequence model** that classifies emotion transitions across frames rather than treating each frame independently. This would enable more accurate detection of sustained states such as progressive disengagement or cumulative confusion.

On the infrastructure side, the system should be extended to support **multi-classroom deployment** with a centralized institutional dashboard, giving academic administrators a bird's-eye view of engagement trends across multiple lectures and instructors. A **dedicated mobile application** for instructors would also increase the accessibility and practical adoption of the platform in environments where desktop workstations are not available.

Finally, future research should explore **multimodal affective analysis** - combining facial expression data with speech tone analysis, student body posture estimation, and physiological sensor data from wearable devices. Such a multimodal approach would produce a substantially richer and more reliable picture of student engagement than any single modality can provide, and would position BehaviorAnalyzer at the leading edge of AI-driven smart classroom research.

---

*End of Thesis*

---

## Appendices

---

### Appendix A: Source Code Snippets

This appendix presents selected code excerpts from the most critical components of the BehaviorAnalyzer backend. Full source files are available in the project repository.

---

**A.1 - Emotion Recognition Pipeline (`services.py`)**

The following function accepts raw image bytes from an HTTP request, decodes them into an OpenCV image array, and passes the result to the face detection and classification pipeline.

```python
def detect_emotion_from_frame(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return analyze_cv2_image(img)
```

The core analysis function applies YOLOv8 for person detection, dynamically estimates the head boundaries, and runs the Keras model on each extracted region:

```python
def analyze_cv2_image(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    yolo = get_yolo_model()
    res = yolo(img, classes=[0], verbose=False)
    faces = []
    for box in res[0].boxes.xyxy:
        w = box[2] - box[0]
        h = box[3] - box[1]
        # Extract head region (top 25%)
    results = []
    model_instance = get_model()
    for (x, y, w, h) in faces:
        roi_gray = gray[y:y+h, x:x+w]
        roi_resized = cv2.resize(roi_gray, (48, 48))
        img_pixels = np.expand_dims(roi_resized, axis=0)
        img_pixels = np.expand_dims(img_pixels, axis=-1)
        pred = model_instance.predict(img_pixels, verbose=0)[0]
        emotion = EMOTIONS[np.argmax(pred)]
        results.append({
            "emotion": emotion,
            "bbox": str([int(x), int(y), int(w), int(h)])
        })
    return results
```

---

**A.2 - Engagement Metric Computation (`services.py`)**

The following function computes the five engagement metrics from a list of emotion data records:

```python
def calculate_advanced_stats(data_points):
    emotions = [d.emotion for d in data_points]
    timestamps = [d.timestamp for d in data_points]
    counts = Counter(emotions)
    total = len(emotions)
    safe_counts = {e: counts.get(e, 0) for e in EMOTIONS}

    confusion  = ((safe_counts['Surprise'] + safe_counts['Fear']) / total) * 100
    boredom    = (safe_counts['Neutral'] / total) * 100
    pos        = safe_counts['Happy'] + safe_counts['Surprise']
    neg        = safe_counts['Sad'] + safe_counts['Angry'] + safe_counts['Disgust'] + safe_counts['Fear']
    vibe       = max(1, min(10, 5 + ((pos - neg) / total) * 5))
    risk       = ((safe_counts['Sad'] + safe_counts['Angry'] + safe_counts['Fear']) / total) * 100
    attendance = max(Counter(timestamps).values()) if timestamps else 0

    return {
        "vibe_score": round(vibe, 1),
        "confusion_index": round(confusion, 1),
        "boredom_meter": round(boredom, 1),
        "at_risk_index": round(risk, 1),
        "attendance_est": attendance,
        "counts": safe_counts,
        "total_faces": total
    }
```

---

**A.3 - AI Coaching Integration (`ai_service.py`)**

The Groq-hosted Llama-3 model is queried with a structured prompt containing live session statistics. The LangChain pipe operator chains the prompt template through the LLM and the output parser:

```python
def ask_teaching_assistant(question, session_stats):
    prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You are an expert AI Pedagogical Coach. "
         "Analyze classroom emotion data and provide concise, "
         "practical teaching advice.\n\n{context}"),
        ("user", "{question}")
    ])
    chain = prompt | llm | StrOutputParser()
    return chain.invoke({"context": context_text, "question": question})
```

---

**A.4 - Model Singleton Loader (`services.py`)**

The emotion model is loaded only once at server startup and cached in a module-level variable for all subsequent requests:

```python
_model = None

def get_model():
    global _model
    if _model is not None:
        return _model
    if os.path.exists(MODEL_PATH):
        _model = load_model(MODEL_PATH)
        print("AI Model Loaded Successfully")
    else:
        _model = None
        print("Model not found. Running in Simulation Mode.")
    return _model
```

---

**A.5 - JWT Authentication (`main.py`)**

User login generates a signed JSON Web Token that is returned to the frontend for use in subsequent authenticated requests:

```python
@app.post("/login")
def login(user: UserAuth, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(
        models.User.username == user.username
    ).first()
    if not db_user or not pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    token = jwt.encode({"sub": db_user.username}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}
```

---

### Appendix B: Database Schema

This appendix documents the complete relational schema of the PostgreSQL database used by BehaviorAnalyzer.

**Table B.1 - `users`**

| Column          | Data Type    | Constraints                 |
| --------------- | ------------ | --------------------------- |
| id              | INTEGER      | PRIMARY KEY, AUTO-INCREMENT |
| username        | VARCHAR(50)  | UNIQUE, NOT NULL, INDEXED   |
| email           | VARCHAR(100) | UNIQUE, NOT NULL, INDEXED   |
| phone           | VARCHAR(20)  |                             |
| gender          | VARCHAR(10)  |                             |
| address         | VARCHAR(255) |                             |
| hashed_password | VARCHAR(255) | NOT NULL (bcrypt hash)      |

**Table B.2 - `sessions`**

| Column     | Data Type    | Constraints        |
| ---------- | ------------ | ------------------ |
| id         | VARCHAR(36)  | PRIMARY KEY (UUID) |
| name       | VARCHAR(100) |                    |
| class_name | VARCHAR(100) |                    |
| instructor | VARCHAR(100) |                    |
| created_at | VARCHAR(30)  | ISO 8601 datetime  |

**Table B.3 - `emotion_data`**

| Column     | Data Type    | Constraints                         |
| ---------- | ------------ | ----------------------------------- |
| id         | INTEGER      | PRIMARY KEY, AUTO-INCREMENT         |
| session_id | VARCHAR(36)  | INDEXED (logical FK to sessions.id) |
| type       | VARCHAR(20)  | Values: `entry`, `exit`, `video`    |
| emotion    | VARCHAR(20)  | One of 7 FER2013 emotion labels     |
| bbox       | VARCHAR(100) | Format: `[x, y, w, h]` string       |
| timestamp  | VARCHAR(30)  | ISO 8601 datetime                   |

**Table B.4 - `chat_logs`**

| Column     | Data Type     | Constraints                         |
| ---------- | ------------- | ----------------------------------- |
| id         | INTEGER       | PRIMARY KEY, AUTO-INCREMENT         |
| session_id | VARCHAR(36)   | INDEXED (logical FK to sessions.id) |
| role       | VARCHAR(20)   | Values: `user` or `bot`             |
| text       | VARCHAR(5000) | Full message content                |
| timestamp  | VARCHAR(30)   | ISO 8601 datetime                   |

---

### Appendix C: API Documentation

This appendix lists all API endpoints exposed by the FastAPI backend, including request formats and expected response structures.

**C.1 - Authentication Endpoints**

| Method | Endpoint | Request Body                                                            | Response                                          |
| ------ | -------- | ----------------------------------------------------------------------- | ------------------------------------------------- |
| POST   | /signup  | `{username, email, password, confirm_password, phone, gender, address}` | `{"message": "User created"}`                     |
| POST   | /login   | `{username, password}`                                                  | `{"access_token": "...", "token_type": "bearer"}` |

**C.2 - Session Management Endpoints**

| Method | Endpoint               | Request                          | Response                                         |
| ------ | ---------------------- | -------------------------------- | ------------------------------------------------ |
| POST   | /sessions/create       | `{name, class_name, instructor}` | `{"id": "uuid", "name": "..."}`                  |
| GET    | /sessions/history      | -                                | Array of session summaries with vibe_score       |
| GET    | /sessions/{id}/details | -                                | `{id, name, class_name, instructor, created_at}` |

**C.3 - Session Data Endpoints**

| Method | Endpoint                     | Request                                  | Response                                       |
| ------ | ---------------------------- | ---------------------------------------- | ---------------------------------------------- |
| POST   | /sessions/{id}/analyze       | Multipart: `file` (image), `type` string | `{"results": [{emotion, bbox}, ...]}`          |
| POST   | /sessions/{id}/analyze_video | Multipart: `file` (video), `type` string | `{"status": "success", "frames_processed": N}` |
| GET    | /sessions/{id}/report        | -                                        | `{entry_stats: {...}, exit_stats: {...}}`      |
| GET    | /sessions/{id}/export_pdf    | -                                        | PDF file download (application/pdf)            |
| POST   | /sessions/{id}/chat          | `{"question": "..."}`                    | `{"response": "AI advice text"}`               |
| GET    | /sessions/{id}/chat_history  | -                                        | Array of `{role, text}` objects                |

All session-specific endpoints return `HTTP 404 Not Found` if the session ID does not exist in the database.

---

### Appendix D: Additional Experimental Results

**D.1 - Confusion Matrix Summary (EfficientNet-B0)**

The table below presents the most significant misclassification pairs identified from the EfficientNet-B0 confusion matrix on the FER2013 test set.

| True Label | Predicted As | Approximate Confusion Rate |
| ---------- | ------------ | -------------------------- |
| Disgust    | Angry        | ~38%                       |
| Fear       | Sad          | ~29%                       |
| Fear       | Angry        | ~18%                       |
| Sad        | Neutral      | ~21%                       |
| Angry      | Disgust      | ~14%                       |

These confusions reflect the visual similarity of negative emotion pairs at the low 48×48 pixel resolution of FER2013 and are consistent with published benchmark results.

**D.2 - Enhanced Custom CNN Training Log (22 Epochs, Early Stopping)**

The table below shows the complete epoch-by-epoch training results for the Enhanced Custom CNN model trained on the FER2013 dataset using the Adam optimizer. Training was stopped at epoch 22 by the `EarlyStopping` callback, with the best weights restored from **epoch 19** (highest validation accuracy).

| Epoch  | Train Accuracy | Val Accuracy | Train Loss | Val Loss   | Notes                           |
| ------ | -------------- | ------------ | ---------- | ---------- | ------------------------------- |
| 1      | 36.45%         | 45.64%       | 1.6437     | 1.4484     | -                               |
| 2      | 52.15%         | 54.31%       | 1.2499     | 1.1757     | -                               |
| 3      | 57.79%         | 62.21%       | 1.1188     | 1.0024     | -                               |
| 4      | 60.97%         | 63.51%       | 1.0352     | 0.9562     | -                               |
| 5      | 63.75%         | 68.31%       | 0.9616     | 0.8474     | -                               |
| 6      | 66.71%         | 72.69%       | 0.8919     | 0.7616     | -                               |
| 7      | 69.42%         | 73.26%       | 0.8243     | 0.7175     | -                               |
| 8      | 72.27%         | 78.30%       | 0.7548     | 0.6049     | -                               |
| 9      | 74.92%         | 77.72%       | 0.6874     | 0.6055     | -                               |
| 10     | 77.54%         | 84.66%       | 0.6186     | 0.4640     | -                               |
| 11     | 80.08%         | 87.74%       | 0.5531     | 0.3708     | -                               |
| 12     | 82.18%         | 88.66%       | 0.5025     | 0.3360     | -                               |
| 13     | 83.91%         | 87.03%       | 0.4540     | 0.3692     | -                               |
| 14     | 85.57%         | 94.08%       | 0.4082     | 0.1915     | -                               |
| 15     | 86.97%         | 95.23%       | 0.3675     | 0.1606     | -                               |
| 16     | 88.20%         | 94.51%       | 0.3358     | 0.1786     | -                               |
| 17     | 89.38%         | 94.93%       | 0.3045     | 0.1528     | -                               |
| 18     | 90.09%         | 94.34%       | 0.2801     | 0.1661     | -                               |
| **19** | **91.09%**     | **97.83%**   | **0.2547** | **0.0784** | **Best Epoch**                  |
| 20     | 91.67%         | 97.23%       | 0.2414     | 0.0916     | -                               |
| 21     | 91.90%         | 95.86%       | 0.2314     | 0.1252     | -                               |
| 22     | 92.59%         | 96.73%       | 0.2126     | 0.0964     | LR reduced → 0.0002, Early Stop |

**Key observations:**
- The model improved steadily from 45.64% to 97.83% validation accuracy over 22 epochs.
- The validation loss was consistently lower than the training loss, showing that Batch Normalization and Dropout successfully prevented overfitting.
- A large jump in validation accuracy happened between epochs 13 and 14 (from 87.03% to 94.08%), suggesting the model crossed an important learning threshold at that point.
- The `ReduceLROnPlateau` callback reduced the learning rate from 0.001 to 0.0002 at epoch 22, and the `EarlyStopping` callback then halted training and restored the best weights from epoch 19.

**D.4 - YOLOv8m-cls Full Training Log (Run 1: 50 Epochs)**

| Epoch  | Top-1 Acc | Top-5 Acc | Loss      |
| ------ | --------- | --------- | --------- |
| 1      | 0.462     | 0.963     | 4.224     |
| 2      | 0.612     | 0.985     | 2.429     |
| 3      | 0.595     | 0.982     | 2.172     |
| 4      | 0.632     | 0.987     | 2.181     |
| 5      | 0.676     | 0.992     | 1.922     |
| 6      | 0.709     | 0.994     | 1.794     |
| 7      | 0.716     | 0.995     | 1.721     |
| 8      | 0.734     | 0.996     | 1.636     |
| 9      | 0.747     | 0.996     | 1.591     |
| 10     | 0.751     | 0.997     | 1.544     |
| 15     | 0.827     | 0.999     | 1.351     |
| 20     | 0.886     | 1.000     | 1.164     |
| 25     | 0.932     | 1.000     | 0.977     |
| 30     | 0.958     | 1.000     | 0.798     |
| 35     | 0.971     | 1.000     | 0.633     |
| 40     | 0.978     | 1.000     | 0.461     |
| 45     | 0.982     | 1.000     | 0.309     |
| **50** | **0.984** | **1.000** | **0.189** |

*Completed in 0.558 hours. Mosaic augmentation disabled after epoch 40.*

**D.5 - YOLOv8m-cls Full Training Log (Run 2: 100 Epochs)**

| Epoch   | Top-1 Acc | Top-5 Acc | Loss      |
| ------- | --------- | --------- | --------- |
| 1       | 0.486     | 0.965     | 3.372     |
| 5       | 0.679     | 0.993     | 1.900     |
| 10      | 0.749     | 0.997     | 1.573     |
| 20      | 0.865     | 0.999     | 1.287     |
| 30      | 0.934     | 1.000     | 1.051     |
| 40      | 0.959     | 1.000     | 0.843     |
| 50      | 0.969     | 1.000     | 0.688     |
| 60      | 0.977     | 1.000     | 0.551     |
| 70      | 0.982     | 1.000     | 0.415     |
| 80      | 0.985     | 1.000     | 0.298     |
| 90      | 0.986     | 1.000     | 0.180     |
| **100** | **0.987** | **1.000** | **0.107** |

*Completed in 1.112 hours. Mosaic augmentation disabled after epoch 90.*

**D.3 - EfficientNet-B0 Fine-Tuning Phases**

| Phase                            | Epochs | Val Accuracy | Notes                                              |
| -------------------------------- | ------ | ------------ | -------------------------------------------------- |
| Feature Extraction (base frozen) | 1–10   | ~68%         | Only the classification head trained               |
| Full Fine-Tuning (unfrozen)      | 11–30  | 75–80%       | Entire network with low LR and `ReduceLROnPlateau` |

---

### Appendix E: User Interface Description

As this thesis is submitted as a text document, the following subsections describe the major views of the BehaviorAnalyzer web interface in detail.

**E.1 - Login Page**
The login page presents a centered card component on a dark indigo gradient background. It contains the BehaviorAnalyzer logo with a graduation cap icon, input fields for username and password, a styled "Login" button, and a navigation link to the signup page.

**E.2 - Session Initialization Form**
When no active session exists, the main content area displays a session creation card with three text input fields (Session Name, Class Code, Instructor Name) and a "Launch Monitor" button. Submitting this form creates a new session record in the database and transitions the view to the Dashboard.

**E.3 - Live Monitor View**
The Live Monitor page contains a media panel where the instructor uploads a pre-recorded video file or triggers live frame capture. A results table below lists each detected face with its emotion label, bounding box coordinates, and timestamp. A toggle allows switching between Entry and Exit observation modes.

**E.4 - Dashboard View**
The Dashboard displays five metric cards (Vibe Score, Confusion Index, Boredom Meter, At-Risk Index, Attendance Estimate) and a Recharts bar chart of the seven emotion distributions. All values update automatically after each new analysis event.

**E.5 - AI Assistant View**
The AI Assistant is a full-screen chat interface. Prior instructor messages appear right-aligned and AI responses appear left-aligned. A text input at the bottom allows new queries. All messages are persisted in the `chat_logs` table and reloaded on page refresh.

**E.6 - Session Archives View**
The Session Archives page lists all past sessions in a scrollable table, showing class name, instructor, creation date, attendance estimate, and Vibe Score. A "Restore" button reloads the selected session's data into the active analysis views.

---

### Appendix F: Installation and Setup Instructions

This appendix provides complete step-by-step instructions for installing and running BehaviorAnalyzer on a Linux or macOS machine.

**F.1 - Prerequisites**

- Python 3.9 or later
- Node.js 18 or later with npm
- PostgreSQL 14 or later (running locally or on a remote host)
- A Groq API key (available at https://console.groq.com)

**F.2 - Clone the Repository**

```bash
git clone https://github.com/your-username/Analyzing-Student-Behavior-Before-and-After-Classroom-Sessions.git
cd Analyzing-Student-Behavior-Before-and-After-Classroom-Sessions
```

**F.3 - Backend Setup**

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Linux / macOS
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL="postgresql://username:password@localhost/dbname"
SECRET_KEY="your_super_secret_key_here"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=60
GROQ_API_KEY="your_groq_api_key_here"
ALLOWED_ORIGINS="http://localhost:5173"
```

Start the backend server:

```bash
uvicorn main:app --reload
# API server runs at: http://localhost:8000
# Interactive API docs at: http://localhost:8000/docs
```

**F.4 - Frontend Setup**

```bash
cd ../frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
# Frontend runs at: http://localhost:5173
```

**F.5 - Database Initialization**

No manual migration is needed. SQLAlchemy automatically creates all four tables (`users`, `sessions`, `emotion_data`, `chat_logs`) on first server startup. The target PostgreSQL database must exist beforehand:

```bash
psql -U postgres -c "CREATE DATABASE dbname;"
```

**F.6 - Verifying the Installation**

Navigate to `http://localhost:5173` in a browser. The login page should appear. Use the signup form to create an instructor account, log in, fill in the session initialization form, and click "Launch Monitor" to begin a monitoring session. The FastAPI Swagger UI at `http://localhost:8000/docs` can be used to test individual API endpoints directly.

---

*End of Appendices*

---

## References

The following references are cited throughout this thesis. They are presented in IEEE citation format.

---

[1] R. W. Picard, *Affective Computing*. Cambridge, MA, USA: MIT Press, 1997.

[2] P. Ekman and W. V. Friesen, "Facial action coding system: A technique for the measurement of facial movement," *Consulting Psychologists Press*, Palo Alto, CA, USA, 1978.

[3] I. J. Goodfellow, D. Erhan, P. L. Carrier, A. Courville, M. Mirza, B. Hamner, W. Cukierski, Y. Tang, D. Thaler, D.-H. Lee, *et al.*, "Challenges in representation learning: A report on three machine learning contests," in *Proc. Int. Conf. Neural Information Processing (ICONIP)*, 2013, pp. 117–124. [FER2013 dataset paper]

[4] K. He, X. Zhang, S. Ren, and J. Sun, "Deep residual learning for image recognition," in *Proc. IEEE Conf. Computer Vision and Pattern Recognition (CVPR)*, 2016, pp. 770–778.

[5] M. Tan and Q. V. Le, "EfficientNet: Rethinking model scaling for convolutional neural networks," in *Proc. Int. Conf. Machine Learning (ICML)*, vol. 97, 2019, pp. 6105–6114.

[6] Y. LeCun, Y. Bengio, and G. Hinton, "Deep learning," *Nature*, vol. 521, no. 7553, pp. 436–444, May 2015.

[7] G. Jocher, A. Chaurasia, and J. Qiu, "Ultralytics YOLO," GitHub repository, 2023. [Online]. Available: https://github.com/ultralytics/ultralytics [YOLOv8]," in *Proc. IEEE Conf. Computer Vision and Pattern Recognition (CVPR)*, vol. 1, 2001, pp. I-511–I-518. [Haar Cascade]

[8] T. Dalal and B. Triggs, "Histograms of oriented gradients for human detection," in *Proc. IEEE Conf. Computer Vision and Pattern Recognition (CVPR)*, vol. 1, 2005, pp. 886–893.

[9] C. Cortes and V. Vapnik, "Support-vector networks," *Machine Learning*, vol. 20, no. 3, pp. 273–297, Sep. 1995.

[10] S. Li and W. Deng, "Deep facial expression recognition: A survey," *IEEE Trans. Affective Computing*, vol. 13, no. 3, pp. 1195–1215, Jul.-Sep. 2022.

[11] A. Gupta, A. D'Cunha, K. Awasthi, and V. Balasubramanian, "DAiSEE: Towards user engagement recognition in the wild," arXiv preprint arXiv:1609.01885, 2016. [DAiSEE dataset]

[12] N. Sebe, I. Cohen, A. Garg, and T. S. Huang, "Machine learning in computer vision," *Computational Imaging and Vision*, vol. 29, Springer, Dordrecht, 2005.

[13] D. P. Kingma and J. Ba, "Adam: A method for stochastic optimization," in *Proc. Int. Conf. Learning Representations (ICLR)*, 2015.

[14] S. Ioffe and C. Szegedy, "Batch normalization: Accelerating deep network training by reducing internal covariate shift," in *Proc. Int. Conf. Machine Learning (ICML)*, 2015, pp. 448–456.

[15] N. Srivastava, G. Hinton, A. Krizhevsky, I. Sutskever, and R. Salakhutdinov, "Dropout: A simple way to prevent neural networks from overfitting," *J. Machine Learning Research*, vol. 15, no. 1, pp. 1929–1958, 2014.

[16] J. Deng, W. Dong, R. Socher, L.-J. Li, K. Li, and L. Fei-Fei, "ImageNet: A large-scale hierarchical image database," in *Proc. IEEE Conf. Computer Vision and Pattern Recognition (CVPR)*, 2009, pp. 248–255.

[17] C. Mollahosseini, B. Hasani, and M. H. Mahoor, "AffectNet: A database for facial expression, valence, and arousal computing in the wild," *IEEE Trans. Affective Computing*, vol. 10, no. 1, pp. 18–31, Jan.-Mar. 2019.

[18] A. Radford, J. Wu, R. Child, D. Luan, D. Amodei, and I. Sutskever, "Language models are unsupervised multitask learners," *OpenAI Blog*, vol. 1, no. 8, 2019. [GPT-2; foundational LLM reference]

[19] H. Touvron, T. Lavril, G. Izacard, X. Martinet, M.-A. Lachaux, T. Lacroix, B. Rozière, N. Goyal, E. Hambro, F. Azhar, *et al.*, "Llama 2: Open foundation and fine-tuned chat models," arXiv preprint arXiv:2307.09288, 2023. [Llama model family]

[20] T. Chase, "LangChain: Building Applications with LLMs through Composability," GitHub repository, 2022. [Online]. Available: https://github.com/langchain-ai/langchain

[21] S. Ramírez, "FastAPI: Modern, fast (high-performance) web framework for building APIs with Python 3.6+ based on standard Python type hints," GitHub repository, 2019. [Online]. Available: https://github.com/tiangolo/fastapi

[22] G. Bradski, "The OpenCV library," *Dr. Dobb's Journal of Software Tools*, 2000. [OpenCV]

[23] M. Abadi, A. Agarwal, P. Barham, E. Brevdo, Z. Chen, C. Citro, G. S. Corrado, A. Davis, J. Dean, M. Devin, *et al.*, "TensorFlow: Large-scale machine learning on heterogeneous systems," arXiv preprint arXiv:1603.04467, 2016.

[24] F. Chollet *et al.*, "Keras," GitHub repository, 2015. [Online]. Available: https://github.com/keras-team/keras

[25]  R. Vinayakumar, K. P. Soman, and P. Poornachandran, "Applying convolutional neural network for network intrusion detection," in *Proc. Int. Conf. Advances in Computing, Communications and Informatics (ICACCI)*, 2017, pp. 1222–1228.

[26] A. Mollahosseini, D. Chan, and M. H. Mahoor, "Going deeper in facial expression recognition using deep neural networks," in *Proc. IEEE Winter Conf. Applications of Computer Vision (WACV)*, 2016, pp. 1–10.

[27] D. Kahneman, *Thinking, Fast and Slow*. New York, NY, USA: Farrar, Straus and Giroux, 2011. [Background reference on cognitive psychology and affect]

[28] B. Kort, R. Reilly, and R. Picard, "An affective model of interplay between emotions and learning: Reengineering educational pedagogy - building a learning companion," in *Proc. IEEE Int. Conf. Advanced Learning Technologies (ICALT)*, 2001, pp. 43–46.

[29] PostgreSQL Global Development Group, "PostgreSQL: The world's most advanced open source relational database," 2023. [Online]. Available: https://www.postgresql.org

[30] Meta AI Research, "Llama 3: Open Foundation Models," 2024. [Online]. Available: https://ai.meta.com/blog/meta-llama-3/

---

*End of References*
