from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_list_complaints_empty():
    response = client.get("/api/complaints")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_and_get_complaint():
    payload = {
        "complaint_source": "Hospital Pharmacy",
        "customer_name": "St. Jude Hospital",
        "product_name": "Ceftriaxone 1g",
        "batch_lot_number": "CFT-9082",
        "complaint_type": "Foreign Particulate",
        "detailed_description": "Particulate floating in vial",
        "initial_severity": "Critical",
        "priority": "High"
    }
    response = client.post("/api/complaints", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["complaint_number"].startswith("CC-")
    assert data["product_name"] == "Ceftriaxone 1g"

    cid = data["id"]
    get_res = client.get(f"/api/complaints/{cid}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == cid

    # Test Patch Status to Resolved
    patch_res = client.patch(f"/api/complaints/{cid}/status", json={"status": "Resolved"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Resolved"

    # Test Delete Complaint
    del_res = client.delete(f"/api/complaints/{cid}")
    assert del_res.status_code == 200
    assert del_res.json()["id"] == cid

    # Verify 404 on get after delete
    get_after_del = client.get(f"/api/complaints/{cid}")
    assert get_after_del.status_code == 404
