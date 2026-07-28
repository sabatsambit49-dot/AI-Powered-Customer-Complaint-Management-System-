from app.graph.nodes import (
    ingest_node,
    completeness_checker_node,
    duplicate_detection_node
)

def test_ingest_node():
    state = {"raw_input": "Sample complaint raw text content", "file_name": "test.txt"}
    new_state = ingest_node(state)
    assert new_state["extracted_raw_text"] == "Sample complaint raw text content"
    assert new_state["progress_percentage"] == 10

def test_completeness_checker_node():
    state = {
        "extracted_fields": {
            "product_name": "Ceftriaxone 1g",
            "batch_lot_number": "CFT-9082",
            "complaint_type": "Foreign Particulate",
            "detailed_description": "Black particulate floating in vial",
            "customer_name": "St. Jude Hospital"
        }
    }
    new_state = completeness_checker_node(state)
    assert new_state["completeness_score"] == 100
    assert len(new_state["missing_fields"]) == 0

def test_completeness_checker_node_missing_fields():
    state = {
        "extracted_fields": {
            "product_name": None,
            "batch_lot_number": None,
            "complaint_type": "Discoloration",
            "detailed_description": "Tablet turned brown",
            "customer_name": "Retail Pharmacy"
        }
    }
    new_state = completeness_checker_node(state)
    assert new_state["completeness_score"] < 100
    assert "product_name" in new_state["missing_fields"]
    assert "batch_lot_number" in new_state["missing_fields"]
    assert len(new_state["clarifying_questions"]) > 0
