import logging
import pytest
from app.pipeline.normalize import normalize_text, utf16_index
from app.pipeline.masking import mask_sensitive_data
from app.main import app, rate_limiter
from fastapi.testclient import TestClient

client = TestClient(app)

def test_unicode_normalization_and_cleanup():
    # Test NFC and zero-width char removal
    raw = "Hello\u200bWorld\r\n\r\n\r\n\r\nTest"
    cleaned, truncated = normalize_text(raw, max_chars=4000)
    assert cleaned == "HelloWorld\n\nTest"
    assert not truncated

def test_utf16_offsets_with_emoji_and_tamil():
    # Tamil and emoji multi-byte code units test
    text = "Hello 😀 வணக்கம்"
    assert utf16_index(text, 0) == 0
    assert utf16_index(text, 6) == 6
    assert utf16_index(text, 7) == 8
    assert text[0:7] == "Hello 😀"

def test_masking_test_vectors():
    # OTP
    masked, _ = mask_sensitive_data("OTP is 482913")
    assert masked == "OTP is [hidden:otp]"

    masked, _ = mask_sensitive_data("Share the OTP 482913 now")
    assert masked == "Share the OTP [hidden:otp] now"

    # Card
    masked, _ = mask_sensitive_data("Card 4111 1111 1111 1111")
    assert "[hidden:card]" in masked

    # Aadhaar
    masked, _ = mask_sensitive_data("Aadhaar 1234 5678 9012")
    assert "[hidden:aadhaar]" in masked

    # PAN
    masked, _ = mask_sensitive_data("PAN is ABCDE1234F")
    assert "[hidden:pan]" in masked

    # Phone
    masked1, _ = mask_sensitive_data("Call 9876543210")
    assert "[hidden:phone]" in masked1

    masked2, _ = mask_sensitive_data("Call +91 98765 43210")
    assert "[hidden:phone]" in masked2

    # Account
    masked, _ = mask_sensitive_data("account 123456789012345")
    assert "[hidden:account]" in masked

    # Unchanged protected tokens
    prot = "Reg: INH000000000 rameshadvisor@okaxis 9876543210@ybl Rs 5000 10 slots http://x.example/a1234567890"
    masked_prot, _ = mask_sensitive_data(prot)
    assert "INH000000000" in masked_prot
    assert "rameshadvisor@okaxis" in masked_prot
    assert "9876543210@ybl" in masked_prot
    assert "http://x.example/a1234567890" in masked_prot

def test_masking_idempotency():
    raw = "OTP is 482913 and Aadhaar is 1234 5678 9012"
    masked1, _ = mask_sensitive_data(raw)
    masked2, _ = mask_sensitive_data(masked1)
    assert masked1 == masked2

def test_log_privacy(caplog):
    caplog.set_level(logging.INFO)
    rate_limiter.requests.clear()
    sensitive_msg = "My secret phone is 9876543210 and OTP is 999888. Pay Rs 5000."
    res = client.post("/api/analyze", json={"text": sensitive_msg, "allow_ai": False})
    assert res.status_code == 200

    log_text = caplog.text
    assert "9876543210" not in log_text
    assert "999888" not in log_text
    assert "sensitive_msg" not in log_text
    assert "Pay Rs 5000" not in log_text
