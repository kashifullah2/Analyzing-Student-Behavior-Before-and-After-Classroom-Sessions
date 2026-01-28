from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    phone = Column(String(20))
    gender = Column(String(10))
    address = Column(String(255))
    hashed_password = Column(String(255))

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(100))
    class_name = Column(String(100))
    instructor = Column(String(100))
    created_at = Column(String(30))

class EmotionData(Base):
    __tablename__ = "emotion_data"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(36), index=True)
    type = Column(String(20)) # entry, exit, video
    emotion = Column(String(20))
    bbox = Column(String(100)) # stored as string "[x,y,w,h]"
    timestamp = Column(String(30))

class ChatLog(Base):
    __tablename__ = "chat_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(36), index=True)
    role = Column(String(20)) # user, bot
    text = Column(String(5000)) # Large text
    timestamp = Column(String(30))