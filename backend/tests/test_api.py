import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import get_settings

client = TestClient(app)

def test_health_check():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["schema_version"] == "1.0"
    assert "ai_enabled" in data
    assert "features" in data

def test_valid_rules_only_request():
    payload = {
        "text": "Daily 3% guaranteed profit. Pay Rs 5000 to rameshadvisor@okaxis",
        "ui_language": "en",
        "allow_ai": False,
    }
    res = client.post("/api/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["mode"] == "rules_only"
    assert data["input_kind"] == "solicitation_message"
    assert data["tier"]["level"] == "several_indicators"
    assert len(data["claims"]) > 0

def test_invalid_ui_language():
    payload = {
        "text": "Hello world",
        "ui_language": "fr",  # Invalid
        "allow_ai": False,
    }
    res = client.post("/api/analyze", json=payload)
    assert res.status_code == 400
    data = res.json()
    assert data["error"]["code"] == "invalid_input"
    assert data["error"]["retryable"] is False

def test_invalid_image_mime():
    payload = {
        "text": "Hello",
        "image": {
            "mime": "image/gif",  # Invalid
            "data_base64": "aGVsbG8="
        },
        "ui_language": "en",
        "allow_ai": False
    }
    res = client.post("/api/analyze", json=payload)
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "invalid_input"

def test_invalid_image_base64():
    payload = {
        "text": "",
        "image": {
            "mime": "image/png",
            "data_base64": "!!!invalid_base64!!!"
        },
        "ui_language": "en",
        "allow_ai": False
    }
    res = client.post("/api/analyze", json=payload)
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "invalid_input"

def test_invalid_image_magic_bytes():
    import base64
    fake_png = base64.b64encode(b"NOT_A_REAL_PNG_HEADER").decode()
    payload = {
        "text": "",
        "image": {
            "mime": "image/png",
            "data_base64": fake_png
        },
        "ui_language": "en",
        "allow_ai": False
    }
    res = client.post("/api/analyze", json=payload)
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "invalid_input"

def test_oversized_text():
    payload = {
        "text": "A" * 25000,  # Over 20000 limit
        "ui_language": "en",
        "allow_ai": False
    }
    res = client.post("/api/analyze", json=payload)
    assert res.status_code == 413
    assert res.json()["error"]["code"] == "payload_too_large"

def test_security_headers():
    res = client.get("/health")
    assert res.headers["Cache-Control"] == "no-store"
    assert res.headers["X-Content-Type-Options"] == "nosniff"
    assert res.headers["Referrer-Policy"] == "no-referrer"

def test_rate_limiting():
    # Execute multiple rapid requests to trigger 429
    settings = get_settings()
    for _ in range(settings.rate_limit_per_min + 5):
        res = client.post("/api/analyze", json={"text": "Test message", "allow_ai": False})
        if res.status_code == 429:
            break
    assert res.status_code == 429
    assert res.json()["error"]["code"] == "rate_limited"
    assert "Retry-After" in res.headers
