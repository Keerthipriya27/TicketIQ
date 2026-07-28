import json
import pytest
from fastapi.testclient import TestClient

from app import app
import api.routes as routes


class FakeResponse:
    def __init__(self, payload: dict):
        class Msg:
            def __init__(self, content):
                self.content = content

        class Choice:
            def __init__(self, content):
                self.message = Msg(content)

        self.choices = [Choice(json.dumps(payload))]


class FakeClient:
    class chat:
        class completions:
            @staticmethod
            def create(*args, **kwargs):
                return FakeResponse({"summary": "ok", "category": "general", "priority": "low", "assigned_team": "support"})


@pytest.fixture(autouse=True)
def patch_groq_client(monkeypatch):
    # Replace the real client with a fake to ensure tests don't call external APIs.
    monkeypatch.setattr(routes, "client", FakeClient())


@pytest.fixture()
def client():
    return TestClient(app)


def test_root(client):
    r = client.get("/")
    assert r.status_code == 200
    assert r.json().get("message") == "TicketIQ API Running"


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json().get("status") == "healthy"


def test_analyze_valid_ticket(client):
    payload = {"ticket": "My app crashes on startup"}
    r = client.post("/analyze", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert "summary" in data
    assert "category" in data


def test_analyze_empty_ticket(client):
    payload = {"ticket": ""}
    r = client.post("/analyze", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data.get("summary") == "ok"


def test_analyze_missing_field(client):
    r = client.post("/analyze", json={})
    assert r.status_code == 422


def test_analyze_invalid_json(client):
    # Send invalid JSON body
    r = client.post("/analyze", data="not-a-json", headers={"content-type": "application/json"})
    assert r.status_code in (400, 422)


def test_analyze_client_exception(monkeypatch, client):
    # Make the client raise an exception and assert API surfaces 500
    class BadClient:
        class chat:
            class completions:
                @staticmethod
                def create(*args, **kwargs):
                    raise RuntimeError("upstream error")

    monkeypatch.setattr(routes, "client", BadClient())
    # The endpoint will raise when the downstream client errors; assert that the exception propagates.
    with pytest.raises(RuntimeError):
        client.post("/analyze", json={"ticket": "error case"})
