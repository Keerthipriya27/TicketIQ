import pytest
from fastapi.testclient import TestClient
from app import app
from database import init_db

@pytest.fixture(scope="module")
def client():
    init_db()
    with TestClient(app) as c:
        yield c

def test_root(client):
    r = client.get("/")
    assert r.status_code == 200
    assert r.json().get("message") == "TicketIQ API Running"

def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json().get("status") == "healthy"

def test_analyze_valid_ticket(client):
    payload = {"ticket": "My application crashes every time I export PDF report."}
    r = client.post("/analyze", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert "summary" in data
    assert "category" in data
    assert "priority" in data
    assert "assigned_team" in data
    assert "reasoning" in data
    assert "confidence_score" in data

def test_analyze_empty_ticket(client):
    payload = {"ticket": "   "}
    r = client.post("/analyze", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert "empty" in data.get("summary", "").lower()

def test_analyze_huge_ticket(client):
    huge_text = "Urgent system bug report. " * 500
    r = client.post("/analyze", json={"ticket": huge_text})
    assert r.status_code == 200
    data = r.json()
    assert "summary" in data

def test_analyze_billing_ticket(client):
    payload = {"ticket": "I was charged twice on my invoice this month. Requesting refund."}
    r = client.post("/analyze", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data.get("category") == "Billing & Payments"
    assert data.get("assigned_team") == "Billing"

def test_analyze_technical_ticket(client):
    payload = {"ticket": "Fatal error 500 exception in database connection string."}
    r = client.post("/analyze", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data.get("category") == "Technical Support"

def test_analyze_security_ticket(client):
    payload = {"ticket": "Unauthorized login attempt detected on admin account from unknown IP."}
    r = client.post("/analyze", json=payload)
    assert r.status_code == 200
    assert data_sec := r.json()
    assert data_sec.get("category") == "Account & Security"

def test_analyze_missing_field(client):
    r = client.post("/analyze", json={})
    assert r.status_code == 422

def test_analyze_invalid_json(client):
    r = client.post("/analyze", data="invalid-json-string", headers={"content-type": "application/json"})
    assert r.status_code in (400, 422)

def test_ticket_crud_workflow(client):
    # 1. Create Ticket
    create_payload = {
        "title": "Integration Test Ticket",
        "description": "Database latency spikes over 500ms during peak load.",
        "priority": "High",
        "category": "Technical Support",
        "department": "Engineering",
        "status": "pending"
    }
    res_create = client.post("/tickets", json=create_payload)
    assert res_create.status_code == 201
    created_ticket = res_create.json()
    ticket_id = created_ticket["id"]
    assert created_ticket["title"] == create_payload["title"]

    # 2. Get All Tickets
    res_list = client.get("/tickets")
    assert res_list.status_code == 200
    tickets_list = res_list.json()
    assert len(tickets_list) >= 1

    # 3. Get Ticket By ID
    res_get = client.get(f"/tickets/{ticket_id}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == ticket_id

    # 4. Update Ticket
    update_payload = {"status": "in_progress", "priority": "High"}
    res_update = client.put(f"/tickets/{ticket_id}", json=update_payload)
    assert res_update.status_code == 200
    assert res_update.json()["status"] == "in_progress"

    # 5. Get Analytics
    res_analytics = client.get("/analytics")
    assert res_analytics.status_code == 200
    analytics_data = res_analytics.json()
    assert "totalCount" in analytics_data
    assert analytics_data["totalCount"] >= 1

    # 6. Delete Ticket
    res_delete = client.delete(f"/tickets/{ticket_id}")
    assert res_delete.status_code == 200

    # Verify Deletion
    res_get_deleted = client.get(f"/tickets/{ticket_id}")
    assert res_get_deleted.status_code == 404
