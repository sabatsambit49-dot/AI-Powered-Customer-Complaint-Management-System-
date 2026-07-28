import json
import re
import logging
from typing import Dict, Any, List
from groq import Groq
from app.core.config import settings
from app.graph.state import GraphState
from app.services.document_parser import parse_document
from app.schemas.complaint import ExtractionResult
from sqlalchemy.orm import Session
from app.models.complaint import Complaint

logger = logging.getLogger("pharma_qms.nodes")

def get_groq_client():
    if not settings.GROQ_API_KEY:
        return None
    return Groq(api_key=settings.GROQ_API_KEY)


def safe_json_parse(text: str) -> Dict[str, Any]:
    """Helper to safely extract JSON block from LLM output."""
    if not text:
        return {}
    text_clean = text.strip()
    try:
        return json.loads(text_clean)
    except Exception:
        match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text_clean, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except Exception:
                pass
        match_brace = re.search(r'(\{.*?\})', text_clean, re.DOTALL)
        if match_brace:
            try:
                return json.loads(match_brace.group(1))
            except Exception:
                pass
        return {}


# NODE 1: INGEST NODE
def ingest_node(state: GraphState) -> GraphState:
    raw_input = state.get("raw_input", "")
    file_name = state.get("file_name")

    if file_name and isinstance(raw_input, bytes):
        text = parse_document(raw_input, file_name)
    else:
        text = str(raw_input)

    state["extracted_raw_text"] = text
    state["current_step"] = "Ingest completed"
    state["progress_percentage"] = 10
    return state


# NODE 2: LANGUAGE & SENTIMENT NODE
def language_sentiment_node(state: GraphState) -> GraphState:
    text = state.get("extracted_raw_text", "")
    client = get_groq_client()

    if not client or not text.strip():
        state["detected_language"] = "English"
        state["translated_text"] = text
        state["sentiment_urgency"] = "Neutral"
        state["progress_percentage"] = 20
        return state

    system_prompt = "You are an automated data extraction node. Output ONLY a valid JSON object. Do NOT write prose or reply letters."
    user_prompt = f"""Analyze the following pharmaceutical quality complaint text:
1. Detect language.
2. Determine sentiment & urgency (e.g., "Urgent - High Concern", "Angry", "Neutral", "Routine inquiry").
3. If non-English, provide English translation. Otherwise repeat original text.

Return STRICT JSON:
{{
  "detected_language": "English",
  "sentiment_urgency": "Urgent - High Concern",
  "translated_text": "..."
}}

Text:
{text[:2000]}"""

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=settings.PRIMARY_MODEL,
            response_format={"type": "json_object"},
            temperature=0.0,
            max_tokens=500
        )
        data = safe_json_parse(response.choices[0].message.content)
        state["detected_language"] = data.get("detected_language", "English")
        state["sentiment_urgency"] = data.get("sentiment_urgency", "Neutral")
        state["translated_text"] = data.get("translated_text", text)
    except Exception:
        state["detected_language"] = "English"
        state["sentiment_urgency"] = "Neutral"
        state["translated_text"] = text

    state["current_step"] = "Language & Sentiment analyzed"
    state["progress_percentage"] = 20
    return state


# NODE 3: EXTRACTION NODE (llama-3.1-8b-instant with llama-3.3-70b-versatile retry)
def extraction_node(state: GraphState) -> GraphState:
    text = state.get("translated_text") or state.get("extracted_raw_text", "")
    client = get_groq_client()

    empty_fields = {
        "complaint_source": None,
        "customer_name": None,
        "customer_email": None,
        "product_name": None,
        "product_strength_grade": None,
        "batch_lot_number": None,
        "manufacturing_date": None,
        "expiry_date": None,
        "quantity_affected": None,
        "complaint_type": None,
        "complaint_date": None,
        "detailed_description": None
    }

    if not client or not text.strip():
        state["extracted_fields"] = empty_fields
        state["progress_percentage"] = 35
        return state

    system_prompt = (
        "You are an automated pharmaceutical data extraction engine for a cGMP Quality Management System. "
        "Your sole task is to extract structured fields from the raw complaint document into a STRICT JSON object matching the requested schema. "
        "DO NOT write any greeting, introduction, prose, customer reply letter, or explanations. "
        "Return ONLY a valid JSON object."
    )

    user_prompt = f"""Extract the following structured fields from the raw pharmaceutical quality complaint text:
- complaint_source: Source or channel (e.g. Hospital Pharmacy, Retail Pharmacy, Distributor, Patient, Customer QA Audit)
- customer_name: Full name of customer/contact person or organization (e.g. Rajesh Mehta / Svenska Pharma AB)
- customer_email: Email address of customer/contact person (e.g. r.mehta@svenska-pharma.se)
- complaint_date: Date of complaint (YYYY-MM-DD)
- product_name: Exact drug product or API material name (e.g. Metformin Hydrochloride API)
- product_strength_grade: Strength or grade (e.g. EP/USP Grade, 500mg)
- batch_lot_number: Batch or Lot Number (e.g. MHC-2507-018)
- manufacturing_date: Manufacturing date (YYYY-MM-DD or MM/YYYY)
- expiry_date: Expiry date (YYYY-MM-DD or MM/YYYY)
- quantity_affected: Quantity affected (e.g. 250 kg, 2 vials)
- complaint_type: Defect classification (e.g. Out of Specification / OOS Assay, Foreign Particulate, Mislabeling)
- detailed_description: Concise summary of reported defect and observations (DO NOT paste raw document headers or full raw text here; write a clean concise summary of the reported defect)

Raw Complaint Text:
{text}

Return ONLY valid JSON with null for missing fields."""

    print(f"\n==================== [EXTRACTION LLM PROMPT] ====================")
    print(f"SYSTEM PROMPT:\n{system_prompt}\n")
    print(f"USER PROMPT:\n{user_prompt}")
    print(f"=================================================================\n")

    raw_llm_response = ""
    parsed_fields = {}

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=settings.PRIMARY_MODEL,
            response_format={"type": "json_object"},
            temperature=0.0,
            max_tokens=800
        )
        raw_llm_response = response.choices[0].message.content
        print(f"\n==================== [RAW LLM RESPONSE (ATTEMPT 1)] ====================")
        print(raw_llm_response)
        print(f"=======================================================================\n")
        
        parsed_fields = safe_json_parse(raw_llm_response)
        # Validate using Pydantic schema
        validated_schema = ExtractionResult(**{**empty_fields, **parsed_fields})
        state["extracted_fields"] = validated_schema.model_dump()
    except Exception as e_first:
        print(f"⚠️ Primary LLM Extraction Attempt Failed or Parse Error: {str(e_first)}. Retrying with REASONING_MODEL...")
        try:
            retry_response = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model=settings.REASONING_MODEL,
                response_format={"type": "json_object"},
                temperature=0.0,
                max_tokens=800
            )
            raw_llm_response = retry_response.choices[0].message.content
            print(f"\n==================== [RAW LLM RESPONSE (ATTEMPT 2 - RETRY)] ====================")
            print(raw_llm_response)
            print(f"===============================================================================\n")

            parsed_fields = safe_json_parse(raw_llm_response)
            validated_schema = ExtractionResult(**{**empty_fields, **parsed_fields})
            state["extracted_fields"] = validated_schema.model_dump()
        except Exception as e_second:
            print(f"❌ Extraction failed completely after retry: {str(e_second)}")
            state["extracted_fields"] = empty_fields
            state["error"] = "extraction_failed"

    state["current_step"] = "Structured fields extracted"
    state["progress_percentage"] = 35
    return state


# NODE 4: COMPLETENESS CHECKER NODE
def completeness_checker_node(state: GraphState) -> GraphState:
    fields = state.get("extracted_fields", {})
    mandatory = ["product_name", "batch_lot_number", "complaint_type", "detailed_description", "customer_name"]
    
    missing = []
    for field in mandatory:
        val = fields.get(field)
        if not val or str(val).lower() in ["null", "none", "unknown", "n/a"]:
            missing.append(field)

    total_mandatory = len(mandatory)
    present_count = total_mandatory - len(missing)
    score = int((present_count / total_mandatory) * 100)

    questions = []
    if "batch_lot_number" in missing:
        questions.append("Could you please provide the specific Batch or Lot Number printed on the primary packaging?")
    if "product_name" in missing:
        questions.append("Which specific drug product or API material is this complaint referring to?")
    if "complaint_type" in missing:
        questions.append("Could you clarify the primary nature of the quality defect (e.g., physical defect, labeling error, efficacy issue)?")

    state["completeness_score"] = score
    state["missing_fields"] = missing
    state["clarifying_questions"] = questions
    state["current_step"] = "Completeness evaluation finished"
    state["progress_percentage"] = 45
    return state


# NODE 5: RISK & SEVERITY CLASSIFICATION NODE (llama-3.1-8b-instant)
def risk_severity_node(state: GraphState) -> GraphState:
    fields = state.get("extracted_fields", {})
    desc = fields.get("detailed_description", "")
    ctype = fields.get("complaint_type", "")
    client = get_groq_client()

    default_severity = "Major"
    default_priority = "Medium"
    default_reg = "Standard QMS Handling"
    default_just = "Automated risk triage evaluated based on product type and defect details."

    if not client:
        state["initial_severity"] = default_severity
        state["priority"] = default_priority
        state["regulatory_reporting_flag"] = default_reg
        state["severity_justification"] = default_just
        state["progress_percentage"] = 60
        return state

    system_prompt = "You are an automated Pharma QMS Risk Classification node. Output ONLY a valid JSON object. Do NOT write prose or reply letters."
    user_prompt = f"""As a Pharma QMS QA Director, evaluate the risk severity of this complaint.
Pharma Severity Rules:
- CRITICAL: Direct patient safety impact, sterility failure, foreign particulate in injectable, mislabeled dose strength, batch-wide contamination, adverse reactions. Priority = High. Regulatory Flag = "Escalation Recommended - FAR / Adverse Event Notification".
- MAJOR: Out of specification potency, container seal failure, physical tablet discoloration/crumbling, cold chain excursion, minor labeling defect without dose confusion. Priority = Medium. Regulatory Flag = "Standard QMS Investigation".
- MINOR: Commercial delay, shipping damage to secondary carton, cosmetic outer box scuff, general customer inquiry. Priority = Low. Regulatory Flag = "Standard QMS Handling".

Complaint Details:
Product: {fields.get('product_name')}
Type: {ctype}
Description: {desc}

Return STRICT JSON:
{{
  "initial_severity": "Critical",
  "priority": "High",
  "regulatory_reporting_flag": "Escalation Recommended - Field Alert Report (FAR)",
  "severity_justification": "Detailed 2-sentence explanation of why this risk score was assigned."
}}"""

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=settings.PRIMARY_MODEL,
            response_format={"type": "json_object"},
            temperature=0.0,
            max_tokens=400
        )
        data = safe_json_parse(response.choices[0].message.content)
        state["initial_severity"] = data.get("initial_severity", default_severity)
        state["priority"] = data.get("priority", default_priority)
        state["regulatory_reporting_flag"] = data.get("regulatory_reporting_flag", default_reg)
        state["severity_justification"] = data.get("severity_justification", default_just)
    except Exception:
        state["initial_severity"] = default_severity
        state["priority"] = default_priority
        state["regulatory_reporting_flag"] = default_reg
        state["severity_justification"] = default_just

    state["current_step"] = "Risk & Severity classified"
    state["progress_percentage"] = 60
    return state


# NODE 6: DUPLICATE DETECTION NODE
def duplicate_detection_node(state: GraphState) -> GraphState:
    db: Session = state.get("db_session")
    fields = state.get("extracted_fields", {})
    batch = fields.get("batch_lot_number")
    product = fields.get("product_name")

    duplicate_matches = []
    is_duplicate = False

    if db and (batch or product):
        query = db.query(Complaint)
        if batch and str(batch).strip() and str(batch).lower() not in ["null", "none"]:
            matches = query.filter(Complaint.batch_lot_number.ilike(f"%{str(batch).strip()}%")).all()
            for m in matches:
                duplicate_matches.append({
                    "id": m.id,
                    "complaint_number": m.complaint_number,
                    "product_name": m.product_name,
                    "batch_lot_number": m.batch_lot_number,
                    "complaint_type": m.complaint_type,
                    "initial_severity": m.initial_severity,
                    "reason": f"Matching Batch Lot Number ({m.batch_lot_number})"
                })
        
        if duplicate_matches:
            is_duplicate = True

    state["duplicate_flag"] = is_duplicate
    state["duplicate_matches"] = duplicate_matches
    state["current_step"] = "Duplicate detection scan complete"
    state["progress_percentage"] = 70
    return state


# NODE 7: ROOT CAUSE RECOMMENDATION NODE (llama-3.3-70b-versatile)
def root_cause_node(state: GraphState) -> GraphState:
    fields = state.get("extracted_fields", {})
    client = get_groq_client()

    default_cat = "Manufacturing Deviation / Packaging Defect"
    default_reason = "Probable root cause involves equipment setup or material quality deviation during lot processing."

    if not client:
        state["root_cause_category"] = default_cat
        state["root_cause_reasoning"] = default_reason
        state["progress_percentage"] = 80
        return state

    system_prompt = "You are an automated Root Cause Analysis node in a cGMP facility. Output ONLY a valid JSON object. Do NOT write prose or reply letters."
    user_prompt = f"""Analyze this quality complaint and determine the probable root cause category and technical reasoning.

Categories:
- Manufacturing / Processing Deviation
- Packaging & Labeling Line Error
- Cold-Chain / Storage Transport Excursion
- Raw Material / API Sub-potency / OOS Assay
- Facility & Environmental Sterility Defect
- Customer Handling / Storage Misuse

Complaint Data:
Product: {fields.get('product_name')} (Batch: {fields.get('batch_lot_number')})
Complaint Type: {fields.get('complaint_type')}
Description: {fields.get('detailed_description')}

Return STRICT JSON:
{{
  "root_cause_category": "Raw Material / API Sub-potency / OOS Assay",
  "root_cause_reasoning": "Detailed 2-3 sentence technical hypothesis explaining the probable root cause."
}}"""

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=settings.REASONING_MODEL,
            response_format={"type": "json_object"},
            temperature=0.0,
            max_tokens=400
        )
        data = safe_json_parse(response.choices[0].message.content)
        state["root_cause_category"] = data.get("root_cause_category", default_cat)
        state["root_cause_reasoning"] = data.get("root_cause_reasoning", default_reason)
    except Exception:
        state["root_cause_category"] = default_cat
        state["root_cause_reasoning"] = default_reason

    state["current_step"] = "Root cause analyzed"
    state["progress_percentage"] = 80
    return state


# NODE 8: CAPA RECOMMENDATION NODE (llama-3.3-70b-versatile)
def capa_node(state: GraphState) -> GraphState:
    fields = state.get("extracted_fields", {})
    rc_cat = state.get("root_cause_category", "")
    client = get_groq_client()

    default_capa = "1. Immediate Quarantine of affected lot. 2. Perform retention sample inspection. 3. Review batch production record (BPR)."

    if not client:
        state["capa_recommendation"] = default_capa
        state["progress_percentage"] = 90
        return state

    system_prompt = "You are an automated CAPA recommendation node. Output ONLY a valid JSON object. Do NOT write prose or reply letters."
    user_prompt = f"""Draft a formal 3-step Corrective and Preventive Action (CAPA) recommendation for this pharmaceutical quality complaint.

Product: {fields.get('product_name')} (Batch: {fields.get('batch_lot_number')})
Root Cause Category: {rc_cat}
Description: {fields.get('detailed_description')}

Return STRICT JSON:
{{
  "capa_recommendation": "1. Immediate Action: Quarantine retaining stock and issue customer advisory.\\n2. Corrective Action: Audit machine vision sensor alignment on packaging line #3.\\n3. Preventive Action: Update SOP-QA-402 to mandate dual-signoff on foil reel loading."
}}"""

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=settings.REASONING_MODEL,
            response_format={"type": "json_object"},
            temperature=0.0,
            max_tokens=400
        )
        data = safe_json_parse(response.choices[0].message.content)
        state["capa_recommendation"] = data.get("capa_recommendation", default_capa)
    except Exception:
        state["capa_recommendation"] = default_capa

    state["current_step"] = "CAPA recommendations generated"
    state["progress_percentage"] = 90
    return state


# NODE 9: SUMMARY NODE (llama-3.3-70b-versatile)
def summary_node(state: GraphState) -> GraphState:
    fields = state.get("extracted_fields", {})
    sev = state.get("initial_severity", "Major")
    rc = state.get("root_cause_category", "")
    client = get_groq_client()

    default_sum = f"Quality complaint regarding {fields.get('product_name', 'product')} (Batch {fields.get('batch_lot_number', 'N/A')}). Classified as {sev} severity."

    if not client:
        state["summary"] = default_sum
        state["progress_percentage"] = 100
        state["is_complete"] = True
        return state

    system_prompt = "You are an automated Executive QA Summary node. Output ONLY a valid JSON object. Do NOT write prose or reply letters."
    user_prompt = f"""Summarize this complaint into a concise 2-sentence executive summary for QA Reviewers.

Product: {fields.get('product_name')}
Batch: {fields.get('batch_lot_number')}
Customer: {fields.get('customer_name')}
Severity: {sev}
Root Cause: {rc}
Description: {fields.get('detailed_description')}

Return STRICT JSON:
{{
  "summary": "Executive summary paragraph here."
}}"""

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=settings.REASONING_MODEL,
            response_format={"type": "json_object"},
            temperature=0.0,
            max_tokens=300
        )
        data = safe_json_parse(response.choices[0].message.content)
        state["summary"] = data.get("summary", default_sum)
    except Exception:
        state["summary"] = default_sum

    state["current_step"] = "Complaint pipeline complete"
    state["progress_percentage"] = 100
    state["is_complete"] = True
    return state
