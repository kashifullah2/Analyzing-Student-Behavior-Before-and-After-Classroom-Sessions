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
    """
    Generates advice based on the specific classroom data provided.
    """
    if not llm:
        return "AI Service is currently unavailable. Please check your API Key configuration."

    context_text = f"""
    CLASSROOM DATA CONTEXT:
    - Session Name: {session_stats.get('info', {}).get('class_name', 'Unknown')}
    - Total Students: {session_stats.get('entry_stats', {}).get('total_faces', 0)}
    - Room Vibe Score: {session_stats.get('entry_stats', {}).get('vibe_score', 0)}/10
    - Confusion Index: {session_stats.get('entry_stats', {}).get('confusion_index', 0)}%
    - Boredom Level: {session_stats.get('entry_stats', {}).get('boredom_meter', 0)}%
    - Est. Attendance: {session_stats.get('entry_stats', {}).get('attendance_est', 0)}
    """

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert AI Pedagogical Coach. You assist teachers by analyzing their classroom emotion data. Keep answers concise, actionable, and encouraging. Use the provided data to justify your advice."),
        ("system", "{context}"),
        ("user", "{question}")
    ])

    chain = prompt | llm | StrOutputParser()

    try:
        response = chain.invoke({"context": context_text, "question": question})
        return response
    except Exception as e:
        return f"AI Error: {str(e)}"