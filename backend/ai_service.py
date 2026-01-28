import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel

load_dotenv()

class ChatRequest(BaseModel):
    question: str

api_key = os.getenv("GROQ_API_KEY")

if api_key:
    llm = ChatGroq(model="qwen/qwen3-32b", temperature=0.7, api_key=api_key, max_tokens=100)
else:
    llm = None
    print("⚠ Warning: GROQ_API_KEY not found in .env file")

def ask_teaching_assistant(question, session_stats):

    if not llm:
        return "AI Service is currently unavailable. Please check your API Key configuration."

    context_text = f"""
    CLASSROOM DATA CONTEXT:
    - Session Name: {session_stats.get('info', {}).get('class_name', 'Unknown')}
    - Total Students: {session_stats.get('entry_stats', {}).get('total_faces', 0)}
    - Room Vibe Score: {session_stats.get('entry_stats', {}).get('vibe_score', 0)}/10
    - Confusion Index: {session_stats.get('entry_stats', {}).get('confusion_index', 0)}%
    - Boredom Level: {session_stats.get('entry_stats', {}).get('boredom_meter', 0)}%
    - Estimated Attendance: {session_stats.get('entry_stats', {}).get('attendance_est', 0)}
    """

    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You are an expert AI Pedagogical Coach. "
            "Analyze classroom emotion data and provide concise, practical, and encouraging teaching advice.\n\n"
            "{context}"
        ),
        ("user", "{question}")
    ])

    chain = prompt | llm | StrOutputParser()

    try:
        return chain.invoke({
            "context": context_text,
            "question": question
        })
    except Exception as e:
        return f"AI Error: {str(e)}"
