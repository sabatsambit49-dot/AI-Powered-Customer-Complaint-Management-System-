import json
import asyncio
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sse_starlette.sse import EventSourceResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.complaint import Complaint, ChatMessage
from app.schemas.complaint import ComplaintCreate, ComplaintResponse, ChatRequest, ChatResponse, StatusUpdate
from app.graph.workflow import complaint_pipeline
from app.services.chat_service import generate_chat_response

router = APIRouter(prefix="/complaints", tags=["Complaints"])

def generate_complaint_number(db: Session) -> str:
    count = db.query(Complaint).count() + 1
    year = datetime.now().year
    return f"CC-{year}-{count:03d}"


@router.post("/extract")
async def extract_complaint_fields(
    raw_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    file_bytes = None
    file_name = None
    if file:
        file_bytes = await file.read()
        file_name = file.filename

    if not raw_text and not file_bytes:
        raise HTTPException(status_code=400, detail="Must provide either raw text or a document file.")

    initial_state = {
        "raw_input": file_bytes if file_bytes else raw_text,
        "file_name": file_name,
        "db_session": db
    }

    final_state = complaint_pipeline.invoke(initial_state)

    # Format result for frontend form auto-population
    fields = final_state.get("extracted_fields", {})
    return {
        "complaint_source": fields.get("complaint_source"),
        "customer_name": fields.get("customer_name"),
        "customer_email": fields.get("customer_email"),
        "product_name": fields.get("product_name"),
        "product_strength_grade": fields.get("product_strength_grade"),
        "batch_lot_number": fields.get("batch_lot_number"),
        "manufacturing_date": fields.get("manufacturing_date"),
        "expiry_date": fields.get("expiry_date"),
        "quantity_affected": fields.get("quantity_affected"),
        "complaint_type": fields.get("complaint_type"),
        "complaint_date": fields.get("complaint_date"),
        "detailed_description": fields.get("detailed_description"),
        "raw_text": final_state.get("extracted_raw_text"),
        "file_name": file_name,
        "initial_severity": final_state.get("initial_severity", "Major"),
        "priority": final_state.get("priority", "Medium"),
        "completeness_score": final_state.get("completeness_score", 0),
        "missing_fields": final_state.get("missing_fields", []),
        "clarifying_questions": final_state.get("clarifying_questions", []),
        "duplicate_flag": final_state.get("duplicate_flag", False),
        "duplicate_matches": final_state.get("duplicate_matches", []),
        "root_cause_category": final_state.get("root_cause_category"),
        "root_cause_reasoning": final_state.get("root_cause_reasoning"),
        "capa_recommendation": final_state.get("capa_recommendation"),
        "summary": final_state.get("summary"),
        "regulatory_reporting_flag": final_state.get("regulatory_reporting_flag"),
        "sentiment_urgency": final_state.get("sentiment_urgency"),
        "detected_language": final_state.get("detected_language", "English"),
        "severity_justification": final_state.get("severity_justification")
    }


@router.post("/stream-extract")
async def stream_extract_complaint(
    raw_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    file_bytes = None
    file_name = None
    if file:
        file_bytes = await file.read()
        file_name = file.filename

    if not raw_text and not file_bytes:
        raise HTTPException(status_code=400, detail="Must provide either raw text or a document file.")

    async def event_generator():
        initial_state = {
            "raw_input": file_bytes if file_bytes else raw_text,
            "file_name": file_name,
            "db_session": db
        }
        
        # Execute pipeline step by step or invoke & stream
        yield {"event": "progress", "data": json.dumps({"step": "Ingesting document...", "percentage": 10})}
        await asyncio.sleep(0.2)
        
        final_state = complaint_pipeline.invoke(initial_state)

        steps = [
            ("Analyzing language & sentiment...", 25),
            ("Extracting structured fields...", 45),
            ("Checking completeness & compliance...", 65),
            ("Evaluating severity & priority...", 80),
            ("Scanning for duplicate complaints...", 90),
            ("Generating root cause & CAPA recommendations...", 100)
        ]

        for step_msg, pct in steps:
            yield {"event": "progress", "data": json.dumps({"step": step_msg, "percentage": pct})}
            await asyncio.sleep(0.15)

        fields = final_state.get("extracted_fields", {})
        result_payload = {
            "complaint_source": fields.get("complaint_source"),
            "customer_name": fields.get("customer_name"),
            "customer_email": fields.get("customer_email"),
            "product_name": fields.get("product_name"),
            "product_strength_grade": fields.get("product_strength_grade"),
            "batch_lot_number": fields.get("batch_lot_number"),
            "manufacturing_date": fields.get("manufacturing_date"),
            "expiry_date": fields.get("expiry_date"),
            "quantity_affected": fields.get("quantity_affected"),
            "complaint_type": fields.get("complaint_type"),
            "complaint_date": fields.get("complaint_date"),
            "detailed_description": fields.get("detailed_description"),
            "raw_text": final_state.get("extracted_raw_text"),
            "file_name": file_name,
            "initial_severity": final_state.get("initial_severity", "Major"),
            "priority": final_state.get("priority", "Medium"),
            "completeness_score": final_state.get("completeness_score", 0),
            "missing_fields": final_state.get("missing_fields", []),
            "clarifying_questions": final_state.get("clarifying_questions", []),
            "duplicate_flag": final_state.get("duplicate_flag", False),
            "duplicate_matches": final_state.get("duplicate_matches", []),
            "root_cause_category": final_state.get("root_cause_category"),
            "root_cause_reasoning": final_state.get("root_cause_reasoning"),
            "capa_recommendation": final_state.get("capa_recommendation"),
            "summary": final_state.get("summary"),
            "regulatory_reporting_flag": final_state.get("regulatory_reporting_flag"),
            "sentiment_urgency": final_state.get("sentiment_urgency"),
            "detected_language": final_state.get("detected_language", "English"),
            "severity_justification": final_state.get("severity_justification")
        }

        yield {"event": "complete", "data": json.dumps(result_payload)}

    return EventSourceResponse(event_generator())


@router.post("", response_model=ComplaintResponse)
def create_complaint(complaint_in: ComplaintCreate, db: Session = Depends(get_db)):
    comp_num = generate_complaint_number(db)
    
    complaint = Complaint(
        complaint_number=comp_num,
        complaint_source=complaint_in.complaint_source,
        customer_name=complaint_in.customer_name,
        customer_email=complaint_in.customer_email,
        complaint_date=complaint_in.complaint_date,
        product_name=complaint_in.product_name,
        product_strength_grade=complaint_in.product_strength_grade,
        batch_lot_number=complaint_in.batch_lot_number,
        manufacturing_date=complaint_in.manufacturing_date,
        expiry_date=complaint_in.expiry_date,
        quantity_affected=complaint_in.quantity_affected,
        complaint_type=complaint_in.complaint_type,
        detailed_description=complaint_in.detailed_description,
        raw_text=complaint_in.raw_text,
        file_name=complaint_in.file_name,
        initial_severity=complaint_in.initial_severity or "Minor",
        priority=complaint_in.priority or "Low",
        status=complaint_in.status or "Pending Triage",
        completeness_score=complaint_in.completeness_score or 0,
        missing_fields=complaint_in.missing_fields or [],
        clarifying_questions=complaint_in.clarifying_questions or [],
        duplicate_flag=complaint_in.duplicate_flag or False,
        duplicate_matches=complaint_in.duplicate_matches or [],
        root_cause_category=complaint_in.root_cause_category,
        root_cause_reasoning=complaint_in.root_cause_reasoning,
        capa_recommendation=complaint_in.capa_recommendation,
        summary=complaint_in.summary,
        regulatory_reporting_flag=complaint_in.regulatory_reporting_flag,
        sentiment_urgency=complaint_in.sentiment_urgency,
        detected_language=complaint_in.detected_language or "English",
        severity_justification=complaint_in.severity_justification
    )

    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint


@router.get("", response_model=List[ComplaintResponse])
def list_complaints(
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)

    if severity:
        query = query.filter(Complaint.initial_severity == severity)
    if status:
        query = query.filter(Complaint.status == status)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Complaint.product_name.ilike(s)) |
            (Complaint.batch_lot_number.ilike(s)) |
            (Complaint.customer_name.ilike(s)) |
            (Complaint.complaint_number.ilike(s))
        )

    return query.order_by(Complaint.created_at.desc()).all()


@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


@router.post("/chat-draft")
def chat_with_draft_assistant(chat_req: ChatRequest, complaint_draft: dict):
    reply_text = generate_chat_response(chat_req.message, complaint_draft)
    return {"reply": reply_text, "timestamp": datetime.utcnow()}


@router.post("/{complaint_id}/chat", response_model=ChatResponse)
def chat_with_complaint_assistant(
    complaint_id: int,
    chat_req: ChatRequest,
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    history = db.query(ChatMessage).filter(ChatMessage.complaint_id == complaint_id).order_by(ChatMessage.created_at.asc()).all()

    # Save user message
    user_msg = ChatMessage(complaint_id=complaint_id, sender="user", content=chat_req.message)
    db.add(user_msg)
    db.commit()

    comp_dict = {
        "complaint_number": complaint.complaint_number,
        "product_name": complaint.product_name,
        "product_strength_grade": complaint.product_strength_grade,
        "batch_lot_number": complaint.batch_lot_number,
        "initial_severity": complaint.initial_severity,
        "priority": complaint.priority,
        "complaint_type": complaint.complaint_type,
        "customer_name": complaint.customer_name,
        "detailed_description": complaint.detailed_description,
        "severity_justification": complaint.severity_justification,
        "root_cause_category": complaint.root_cause_category,
        "capa_recommendation": complaint.capa_recommendation,
        "regulatory_reporting_flag": complaint.regulatory_reporting_flag
    }

    reply_text = generate_chat_response(chat_req.message, comp_dict, history)

    assistant_msg = ChatMessage(complaint_id=complaint_id, sender="assistant", content=reply_text)
    db.add(assistant_msg)
    db.commit()

    return ChatResponse(reply=reply_text, timestamp=assistant_msg.created_at)


@router.patch("/{complaint_id}/status", response_model=ComplaintResponse)
def update_complaint_status(
    complaint_id: int,
    status_in: StatusUpdate,
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    complaint.status = status_in.status
    db.commit()
    db.refresh(complaint)
    return complaint


@router.delete("/{complaint_id}")
def delete_complaint(complaint_id: int, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    db.delete(complaint)
    db.commit()
    return {"message": "Complaint deleted successfully", "id": complaint_id}
