from langgraph.graph import StateGraph, END
from app.graph.state import GraphState
from app.graph.nodes import (
    ingest_node,
    language_sentiment_node,
    extraction_node,
    completeness_checker_node,
    risk_severity_node,
    duplicate_detection_node,
    root_cause_node,
    capa_node,
    summary_node
)

def create_complaint_pipeline():
    workflow = StateGraph(GraphState)

    # Add all 9 distinct nodes
    workflow.add_node("ingest", ingest_node)
    workflow.add_node("language_sentiment", language_sentiment_node)
    workflow.add_node("extraction", extraction_node)
    workflow.add_node("completeness", completeness_checker_node)
    workflow.add_node("risk_severity", risk_severity_node)
    workflow.add_node("duplicate_detection", duplicate_detection_node)
    workflow.add_node("root_cause", root_cause_node)
    workflow.add_node("capa", capa_node)
    workflow.add_node("summary", summary_node)

    # Set entry point
    workflow.set_entry_point("ingest")

    # Define linear execution edges
    workflow.add_edge("ingest", "language_sentiment")
    workflow.add_edge("language_sentiment", "extraction")
    workflow.add_edge("extraction", "completeness")
    workflow.add_edge("completeness", "risk_severity")
    workflow.add_edge("risk_severity", "duplicate_detection")
    workflow.add_edge("duplicate_detection", "root_cause")
    workflow.add_edge("root_cause", "capa")
    workflow.add_edge("capa", "summary")
    workflow.add_edge("summary", END)

    return workflow.compile()

complaint_pipeline = create_complaint_pipeline()
