import pytest
from app.core.security import generate_otp, create_access_token, decode_token, generate_qr_ticket_token, decode_qr_ticket_token

def test_otp_generation():
    otp = generate_otp()
    assert len(otp) == 6
    assert otp.isdigit()

def test_jwt_token_flow():
    payload = {"sub": "user_123", "school_id": "school_abc", "roles": ["ALUMNI"]}
    token = create_access_token(payload)
    decoded = decode_token(token)

    assert decoded["sub"] == "user_123"
    assert decoded["school_id"] == "school_abc"
    assert "ALUMNI" in decoded["roles"]

def test_qr_ticket_token_flow():
    qr_token = generate_qr_ticket_token("event_99", "alumni_42", "school_abc")
    decoded = decode_qr_ticket_token(qr_token)

    assert decoded["event_id"] == "event_99"
    assert decoded["alumni_id"] == "alumni_42"
    assert decoded["school_id"] == "school_abc"
    assert decoded["type"] == "event_qr_ticket"
