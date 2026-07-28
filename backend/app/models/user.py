from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=False)
    role = Column(String(100), default="QA Reviewer")
    created_at = Column(DateTime, default=datetime.utcnow)
