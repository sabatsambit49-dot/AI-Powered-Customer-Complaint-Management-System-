from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_headers():
    response = client.post("/api/auth/login", json={
        "username": "qa_reviewer",
        "password": "pharma_demo_reviewer_123"
    })
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_auth_login_success_and_failure():
    # Success
    res = client.post("/api/auth/login", json={
        "username": "qa_reviewer",
        "password": "pharma_demo_reviewer_123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["username"] == "qa_reviewer"
    assert data["role"] == "QA Lead Reviewer"

    # Failure (wrong password)
    fail_res = client.post("/api/auth/login", json={
        "username": "qa_reviewer",
        "password": "wrong_password"
    })
    assert fail_res.status_code == 401
    assert fail_res.json()["detail"] == "Invalid username or password"

    # Me endpoint
    headers = {"Authorization": f"Bearer {data['access_token']}"}
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["username"] == "qa_reviewer"


def test_unauthenticated_request_rejected():
    response = client.get("/api/complaints")
    assert response.status_code == 401


def test_list_complaints_authenticated():
    headers = get_auth_headers()
    response = client.get("/api/complaints", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_and_get_complaint():
    headers = get_auth_headers()
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
    response = client.post("/api/complaints", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["complaint_number"].startswith("CC-")
    assert data["product_name"] == "Ceftriaxone 1g"

    cid = data["id"]
    get_res = client.get(f"/api/complaints/{cid}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == cid

    # Test Patch Status to Resolved
    patch_res = client.patch(f"/api/complaints/{cid}/status", json={"status": "Resolved"}, headers=headers)
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Resolved"

    # Test Delete Complaint
    del_res = client.delete(f"/api/complaints/{cid}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["id"] == cid

    # Verify 404 on get after delete
    get_after_del = client.get(f"/api/complaints/{cid}", headers=headers)
    assert get_after_del.status_code == 404
