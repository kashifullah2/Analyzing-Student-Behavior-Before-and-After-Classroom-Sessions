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
    llm = ChatGroq(model="llama3-8b-8192", temperature=0.7, api_key=api_key)
else:
    llm = None
    print("⚠ Warning: GROQ_API_KEY not found in .env file")
