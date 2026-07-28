from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String(50), unique=True, index=True, nullable=False)
    
    # Section 1: Origin & Customer Details
    complaint_source = Column(String(200), nullable=True)
    customer_name = Column(String(200), nullable=True)
    customer_email = Column(String(200), nullable=True)
    complaint_date = Column(String(50), nullable=True)

    # Section 2: Product & Batch Identification
    product_name = Column(String(200), nullable=True)
    product_strength_grade = Column(String(100), nullable=True)
    batch_lot_number = Column(String(100), index=True, nullable=True)
    manufacturing_date = Column(String(50), nullable=True)
    expiry_date = Column(String(50), nullable=True)
    quantity_affected = Column(String(100), nullable=True)

    # Section 3: Complaint Details
    complaint_type = Column(String(200), nullable=True)
    detailed_description = Column(Text, nullable=True)
    raw_text = Column(Text, nullable=True)
    file_name = Column(String(200), nullable=True)

    # Section 4: Initial Assessment & AI Output
    initial_severity = Column(String(50), default="Minor")
    priority = Column(String(50), default="Low")
    status = Column(String(50), default="Pending Triage")
    completeness_score = Column(Integer, default=0)
    missing_fields = Column(JSON, default=list)
    clarifying_questions = Column(JSON, default=list)
    duplicate_flag = Column(Boolean, default=False)
    duplicate_matches = Column(JSON, default=list)
    root_cause_category = Column(String(200), nullable=True)
    root_cause_reasoning = Column(Text, nullable=True)
    capa_recommendation = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    
    # Bonus AI fields
    regulatory_reporting_flag = Column(String(200), nullable=True)
    sentiment_urgency = Column(String(100), nullable=True)
    detected_language = Column(String(50), default="English")
    translated_text = Column(Text, nullable=True)
    severity_justification = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    chat_messages = relationship("ChatMessage", back_populates="complaint", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    sender = Column(String(50), nullable=False) # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="chat_messages")
