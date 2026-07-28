from typing import TypedDict, Optional, List, Dict, Any

class GraphState(TypedDict, total=False):
    # Input
    raw_input: str
    file_name: Optional[str]
    db_session: Any

    # Node 1: Ingest
    extracted_raw_text: str

    # Node 2: Language & Sentiment
    detected_language: str
    translated_text: str
    sentiment_urgency: str

    # Node 3: Structured Field Extraction
    extracted_fields: Dict[str, Any]

    # Node 4: Completeness Check
    completeness_score: int
    missing_fields: List[str]
    clarifying_questions: List[str]

    # Node 5: Risk & Severity Classification
    initial_severity: str
    priority: str
    regulatory_reporting_flag: str
    severity_justification: str

    # Node 6: Duplicate Detection
    duplicate_flag: bool
    duplicate_matches: List[Dict[str, Any]]

    # Node 7: Root Cause Recommendation
    root_cause_category: str
    root_cause_reasoning: str

    # Node 8: CAPA Recommendation
    capa_recommendation: str

    # Node 9: Summary
    summary: str

    # Pipeline Metadata / Progress Tracker
    current_step: str
    progress_percentage: int
    is_complete: bool
    error: Optional[str]
