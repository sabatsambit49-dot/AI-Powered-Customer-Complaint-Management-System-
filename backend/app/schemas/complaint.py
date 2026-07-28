from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ExtractionResult(BaseModel):
    complaint_source: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    product_name: Optional[str] = None
    product_strength_grade: Optional[str] = None
    batch_lot_number: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    quantity_affected: Optional[str] = None
    complaint_type: Optional[str] = None
    complaint_date: Optional[str] = None
    detailed_description: Optional[str] = None

class ComplaintCreate(ExtractionResult):
    raw_text: Optional[str] = None
    file_name: Optional[str] = None
    initial_severity: Optional[str] = "Minor"
    priority: Optional[str] = "Low"
    status: Optional[str] = "Pending Triage"
    completeness_score: Optional[int] = 0
    missing_fields: Optional[List[str]] = []
    clarifying_questions: Optional[List[str]] = []
    duplicate_flag: Optional[bool] = False
    duplicate_matches: Optional[List[dict]] = []
    root_cause_category: Optional[str] = None
    root_cause_reasoning: Optional[str] = None
    capa_recommendation: Optional[str] = None
    summary: Optional[str] = None
    regulatory_reporting_flag: Optional[str] = None
    sentiment_urgency: Optional[str] = None
    detected_language: Optional[str] = "English"
    severity_justification: Optional[str] = None

class ComplaintResponse(ComplaintCreate):
    id: int
    complaint_number: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    timestamp: datetime
