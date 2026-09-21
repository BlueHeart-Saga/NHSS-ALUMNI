import pytest
import time
from fastapi import HTTPException
from app.core.security import generate_otp, create_access_token, decode_token, generate_qr_ticket_token, decode_qr_ticket_token
from app.services.sms import (
    normalize_indian_mobile, is_valid_indian_mobile, send_sms_otp,
    get_mobile_query_variants, build_mobile_query_filter
)
from app.api.auth import OTP_STORE, _validate_and_consume_otp

def test_otp_generation():
    otp = generate_otp()
    assert len(otp) == 6
    assert otp.isdigit()

def test_normalize_indian_mobile():
    assert normalize_indian_mobile("9876543210") == "+919876543210"
    assert normalize_indian_mobile("+91 98765 43210") == "+919876543210"
    assert normalize_indian_mobile("09876543210") == "+919876543210"
    assert normalize_indian_mobile("919876543210") == "+919876543210"
    assert normalize_indian_mobile("+919876543210") == "+919876543210"

def test_get_mobile_query_variants():
    # Test all variations mentioned by user: 7639191119, +917639191119, +91 7639191119, 917639191119
    for input_val in ["7639191119", "+917639191119", "+91 7639191119", "917639191119", "07639191119"]:
        variants = get_mobile_query_variants(input_val)
        assert "7639191119" in variants
        assert "+917639191119" in variants
        assert "+91 7639191119" in variants
        assert "917639191119" in variants

    query_filter = build_mobile_query_filter("+91 7639191119")
    assert {"mobile": "7639191119"} in query_filter
    assert {"mobile": "+91 7639191119"} in query_filter
    assert {"mobile": "+917639191119"} in query_filter

def test_is_valid_indian_mobile():
    assert is_valid_indian_mobile("9876543210") is True
    assert is_valid_indian_mobile("+919876543210") is True
    assert is_valid_indian_mobile("+91 87654 32109") is True
    assert is_valid_indian_mobile("7123456789") is True
    assert is_valid_indian_mobile("6123456789") is True
    # Invalid numbers
    assert is_valid_indian_mobile("12345") is False
    assert is_valid_indian_mobile("1234567890") is False  # Does not start with 6,7,8,9
    assert is_valid_indian_mobile("0000000000") is False
    assert is_valid_indian_mobile("") is False

@pytest.fixture(autouse=True)
def mock_sms_gateway():
    """Ensure NO real SMS are sent to 2Factor during testing to conserve user tokens."""
    from unittest.mock import patch
    with patch("app.api.auth.send_sms_otp", return_value=(True, "mock_test_session")):
        yield

@pytest.mark.asyncio
async def test_send_sms_otp_mock():
    from unittest.mock import patch, MagicMock
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"Status": "Success", "Details": "test_session_123"}
        mock_get.return_value = mock_resp

        # Valid mobile with mock response
        success, session = await send_sms_otp("9876543210", "123456")
        assert success is True
        assert session == "test_session_123"

    # Invalid mobile format
    fail_success, fail_reason = await send_sms_otp("123", "123456")
    assert fail_success is False
    assert "Invalid" in fail_reason

def test_otp_store_validation_and_rate_limiting():
    mobile = "9876543210"
    norm_mob = normalize_indian_mobile(mobile)
    otp = "654321"
    now_ts = time.time()

    # 1. Setup valid OTP in store
    OTP_STORE[norm_mob] = {
        "otp": otp,
        "created_at": now_ts,
        "expires_at": now_ts + 300,
        "attempts": 0,
        "max_attempts": 5,
        "mobile": norm_mob
    }

    # 2. Validation with correct OTP succeeds and consumes OTP (single-use)
    record = _validate_and_consume_otp(email=None, mobile=mobile, otp=otp)
    assert record["otp"] == otp
    assert norm_mob not in OTP_STORE  # Consumed

    # 3. Subsequent verification of same consumed OTP must fail
    with pytest.raises(HTTPException) as exc_info:
        _validate_and_consume_otp(email=None, mobile=mobile, otp=otp)
    assert exc_info.value.status_code == 400

    # 4. Expired OTP handling
    OTP_STORE[norm_mob] = {
        "otp": "112233",
        "created_at": now_ts - 400,
        "expires_at": now_ts - 100,  # Expired
        "attempts": 0,
        "max_attempts": 5,
        "mobile": norm_mob
    }
    with pytest.raises(HTTPException) as exc_info:
        _validate_and_consume_otp(email=None, mobile=mobile, otp="112233")
    assert exc_info.value.status_code == 400
    assert "expired" in exc_info.value.detail.lower()

    # 5. Invalid OTP and attempt lockout
    OTP_STORE[norm_mob] = {
        "otp": "999888",
        "created_at": now_ts,
        "expires_at": now_ts + 300,
        "attempts": 0,
        "max_attempts": 3,
        "mobile": norm_mob
    }
    # Enter wrong OTP 3 times
    for _ in range(3):
        with pytest.raises(HTTPException) as exc_info:
            _validate_and_consume_otp(email=None, mobile=mobile, otp="000000")
        assert exc_info.value.status_code == 400

    # 4th attempt exceeds max_attempts (3)
    with pytest.raises(HTTPException) as exc_info:
        _validate_and_consume_otp(email=None, mobile=mobile, otp="000000")
    assert exc_info.value.status_code == 429
    assert "attempts" in exc_info.value.detail.lower()

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

def test_api_send_and_verify_otp_flow():
    from unittest.mock import patch, MagicMock, AsyncMock
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)
    test_mobile = "9876500001"

    # 1. Clear any leftover OTP in store
    OTP_STORE.pop(f"+91{test_mobile}", None)
    OTP_STORE.pop(test_mobile, None)

    # 2. Test send-otp with invalid mobile
    resp_invalid = client.post("/api/v1/auth/send-otp", json={"mobile": "123"})
    assert resp_invalid.status_code == 400
    assert "valid mobile" in resp_invalid.json()["detail"].lower()

    # 3. Test send-otp with valid mobile
    resp_send = client.post("/api/v1/auth/send-otp", json={"mobile": test_mobile})
    assert resp_send.status_code == 200
    data = resp_send.json()
    assert data["success"] is True
    assert data["mobile"] == f"+91{test_mobile}"
    assert "otp" not in data or data.get("otp") is None  # Never return OTP

    # 4. Test rate-limiting cooldown (immediate duplicate request)
    resp_cooldown = client.post("/api/v1/auth/send-otp", json={"mobile": test_mobile})
    assert resp_cooldown.status_code == 429
    assert "wait" in resp_cooldown.json()["detail"].lower()

    # 5. Extract stored OTP for verification testing
    stored = OTP_STORE[f"+91{test_mobile}"]
    real_otp = stored["otp"]

    # 6. Test verify-otp with incorrect OTP
    resp_wrong = client.post("/api/v1/auth/verify-otp", json={"mobile": test_mobile, "otp": "000000"})
    assert resp_wrong.status_code == 400
    assert "invalid otp" in resp_wrong.json()["detail"].lower()

    # 7. Test verify-otp with correct OTP (mocking DB for unit test isolation)
    mock_db = MagicMock()
    mock_db.users.find_one = AsyncMock(return_value={"_id": "mock_id_123", "school_id": "school_1", "roles": ["ALUMNI"]})
    mock_db.alumni.find_one = AsyncMock(return_value=None)
    mock_db.schools.find_one = AsyncMock(return_value={"_id": "school_1"})

    with patch("app.api.auth.get_db", return_value=mock_db):
        resp_correct = client.post("/api/v1/auth/verify-otp", json={"mobile": test_mobile, "otp": real_otp})
        assert resp_correct.status_code == 200
        token_data = resp_correct.json()
        assert "access_token" in token_data
        assert token_data["token_type"] == "bearer"

    # 8. Test single-use guarantee: Re-using the same OTP must now fail
    resp_reuse = client.post("/api/v1/auth/verify-otp", json={"mobile": test_mobile, "otp": real_otp})
    assert resp_reuse.status_code == 400

def test_resend_otp_invalidates_old_otp():
    from unittest.mock import patch, MagicMock, AsyncMock
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)
    test_mobile = "9876500002"
    norm_mob = f"+91{test_mobile}"

    # 1. Clear any prior record
    OTP_STORE.pop(norm_mob, None)
    OTP_STORE.pop(test_mobile, None)

    # 2. First send
    resp1 = client.post("/api/v1/auth/send-otp", json={"mobile": test_mobile})
    assert resp1.status_code == 200
    first_otp = OTP_STORE[norm_mob]["otp"]

    # 3. Simulate elapsed cooldown (move created_at back by 35 seconds)
    OTP_STORE[norm_mob]["created_at"] = time.time() - 35
    OTP_STORE[test_mobile]["created_at"] = time.time() - 35

    # 4. Resend OTP
    resp2 = client.post("/api/v1/auth/send-otp", json={"mobile": test_mobile})
    assert resp2.status_code == 200
    second_otp = OTP_STORE[norm_mob]["otp"]

    # 5. Old OTP must now be INVALID
    with pytest.raises(HTTPException) as exc_info:
        _validate_and_consume_otp(email=None, mobile=test_mobile, otp=first_otp)
    assert exc_info.value.status_code == 400
    assert "invalid" in exc_info.value.detail.lower()

    # 6. New OTP must be VALID
    mock_db = MagicMock()
    mock_db.users.find_one = AsyncMock(return_value={"_id": "user_2", "school_id": "s1", "roles": ["ALUMNI"]})
    mock_db.alumni.find_one = AsyncMock(return_value=None)
    mock_db.schools.find_one = AsyncMock(return_value={"_id": "s1"})

    with patch("app.api.auth.get_db", return_value=mock_db):
        resp_verify = client.post("/api/v1/auth/verify-otp", json={"mobile": test_mobile, "otp": second_otp})
        assert resp_verify.status_code == 200

def test_two_factor_api_failure_handling():
    from unittest.mock import patch
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)
    test_mobile = "9876500003"
    norm_mob = f"+91{test_mobile}"

    OTP_STORE.pop(norm_mob, None)
    OTP_STORE.pop(test_mobile, None)

    # Mock send_sms_otp failure
    with patch("app.api.auth.send_sms_otp", return_value=(False, "Gateway down")):
        resp = client.post("/api/v1/auth/send-otp", json={"mobile": test_mobile})
        assert resp.status_code == 502
        assert "Unable to send OTP. Please try again." in resp.json()["detail"]
        # Invalidate OTP on provider error: store must not retain OTP
        assert norm_mob not in OTP_STORE

def test_api_key_security_and_no_credential_leak():
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)
    test_mobile = "9876500004"

    resp = client.post("/api/v1/auth/send-otp", json={"mobile": test_mobile})
    assert resp.status_code == 200
    data = resp.json()

    # Never leak OTP, API keys, or provider tokens in response
    assert "44c3362c" not in str(data)
    assert "api_key" not in data
    assert "token" not in data
    assert "otp" not in data or data.get("otp") is None

def test_invitation_token_security():
    from app.core.security import generate_invitation_token, hash_token
    raw, hashed = generate_invitation_token()
    assert len(raw) > 20
    assert len(hashed) == 64  # sha256 hex
    assert hash_token(raw) == hashed
    raw2, hashed2 = generate_invitation_token()
    assert raw != raw2
    assert hashed != hashed2

def test_invitation_api_suite():
    from unittest.mock import patch, MagicMock, AsyncMock
    from fastapi.testclient import TestClient
    from datetime import datetime, timezone, timedelta
    from bson import ObjectId
    from app.main import app
    from app.core.security import generate_invitation_token, hash_token

    client = TestClient(app)
    raw_token, token_hash = generate_invitation_token()
    mock_user_id = str(ObjectId())
    mock_alumni_id = str(ObjectId())
    mock_school_id = str(ObjectId())
    test_mob = "+919876543210"

    mock_invitation = {
        "_id": ObjectId(),
        "token_hash": token_hash,
        "user_id": mock_user_id,
        "alumni_id": mock_alumni_id,
        "school_id": mock_school_id,
        "mobile": test_mob,
        "used": False,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    }

    mock_db = MagicMock()
    mock_db.account_invitations.find_one = AsyncMock(return_value=mock_invitation)
    mock_db.account_invitations.update_one = AsyncMock()
    mock_db.users.find_one = AsyncMock(return_value={
        "_id": ObjectId(mock_user_id),
        "full_name": "Ravi Kumar",
        "mobile": test_mob,
        "account_status": "PENDING_ACTIVATION",
        "roles": ["ALUMNI"],
        "school_id": mock_school_id
    })
    mock_db.users.update_one = AsyncMock()
    mock_db.alumni.find_one = AsyncMock(return_value={
        "_id": ObjectId(mock_alumni_id),
        "user_id": mock_user_id,
        "school_id": mock_school_id,
        "full_name": "Ravi Kumar",
        "mobile": test_mob,
        "verification_status": "APPROVED"
    })
    mock_db.alumni.update_one = AsyncMock()
    mock_db.alumni.update_many = AsyncMock()
    mock_db.schools.find_one = AsyncMock(return_value={"_id": ObjectId(mock_school_id), "name": "NHSS Alumni School"})

    with patch("app.api.auth.get_db", return_value=mock_db), \
         patch("app.api.auth.send_sms_otp", return_value=(True, "mock_session_123")):

        # 1. Validate Invitation Token
        val_resp = client.get(f"/api/v1/auth/invitation/validate?token={raw_token}")
        assert val_resp.status_code == 200
        val_data = val_resp.json()
        assert val_data["valid"] is True
        assert val_data["full_name"] == "Ravi Kumar"
        assert "******3210" in val_data["masked_mobile"]
        assert val_data["mobile"] == test_mob

        # 2. Send Invitation OTP
        send_otp_resp = client.post("/api/v1/auth/invitation/send-otp", json={"token": raw_token})
        assert send_otp_resp.status_code == 200
        assert send_otp_resp.json()["success"] is True

        # Extract generated OTP from OTP_STORE
        stored_otp = OTP_STORE[test_mob]["otp"]

        # 3. Verify Invitation OTP
        verify_otp_resp = client.post("/api/v1/auth/invitation/verify-otp", json={"token": raw_token, "otp": stored_otp})
        assert verify_otp_resp.status_code == 200
        assert verify_otp_resp.json()["success"] is True

        # 4. Activate Account With Password
        new_pw = "SecurePass123!"
        act_resp = client.post("/api/v1/auth/invitation/activate", json={"token": raw_token, "password": new_pw})
        assert act_resp.status_code == 200
        act_data = act_resp.json()
        assert act_data["success"] is True
        assert "activated successfully" in act_data["message"]
        assert mock_db.users.update_one.called
        assert mock_db.account_invitations.update_one.called

def test_link_mobile_endpoint():
    from unittest.mock import patch, MagicMock, AsyncMock
    from fastapi.testclient import TestClient
    from bson import ObjectId
    from app.main import app, api_v1
    from app.middleware.auth import get_current_user

    client = TestClient(app)
    mock_user_id = str(ObjectId())

    override = lambda: {
        "user_id": mock_user_id,
        "school_id": str(ObjectId()),
        "roles": ["ALUMNI"],
        "email": "test@gmail.com"
    }
    app.dependency_overrides[get_current_user] = override
    api_v1.dependency_overrides[get_current_user] = override

    headers = {"Authorization": "Bearer test-token"}

    mock_db = MagicMock()
    # 1. Test invalid mobile
    resp = client.post("/api/v1/auth/link-mobile", json={"mobile": "12345"}, headers=headers)
    assert resp.status_code == 400
    assert "valid 10-digit" in resp.json()["detail"]

    # 2. Test duplicate mobile registered to another account
    mock_db.users.find_one = AsyncMock(return_value={"_id": ObjectId(), "mobile": "+919876543210"})
    with patch("app.api.auth.get_db", return_value=mock_db):
        resp = client.post("/api/v1/auth/link-mobile", json={"mobile": "9876543210"}, headers=headers)
        assert resp.status_code == 400
        assert "already registered" in resp.json()["detail"]

    # 3. Test successful link
    mock_db.users.find_one = AsyncMock(return_value=None)
    mock_db.users.update_one = AsyncMock()
    mock_db.alumni.update_one = AsyncMock()
    with patch("app.api.auth.get_db", return_value=mock_db):
        resp = client.post("/api/v1/auth/link-mobile", json={"mobile": "9876543210"}, headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["mobile"] == "+919876543210"
        assert mock_db.users.update_one.called
        assert mock_db.alumni.update_one.called

    app.dependency_overrides.pop(get_current_user, None)
    api_v1.dependency_overrides.pop(get_current_user, None)

def test_send_otp_with_hashed_password():
    from unittest.mock import patch, MagicMock, AsyncMock
    from bson import ObjectId
    from fastapi.testclient import TestClient
    from app.main import app
    from app.core.security import get_password_hash

    client = TestClient(app)
    mock_db = MagicMock()
    hashed_pw = get_password_hash("12345678")

    # 1. Correct password matches hashed password in DB
    mock_db.users.find_one = AsyncMock(return_value={
        "_id": ObjectId(),
        "email": "admin@nhss.com",
        "mobile": "+919876543210",
        "password_hash": hashed_pw,
        "roles": ["SCHOOL_ADMIN"]
    })
    mock_db.users.update_one = AsyncMock()

    with patch("app.api.auth.get_db", return_value=mock_db), \
         patch("app.api.auth.send_sms_otp", return_value=(True, "mock-session")):
        resp = client.post("/api/v1/auth/send-otp", json={
            "email": "admin@nhss.com",
            "check_user": True,
            "password": "12345678"
        })
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    # 2. Incorrect password fails with 400
    with patch("app.api.auth.get_db", return_value=mock_db):
        resp = client.post("/api/v1/auth/send-otp", json={
            "email": "admin@nhss.com",
            "check_user": True,
            "password": "wrongpassword"
        })
        assert resp.status_code == 400
        assert "Incorrect password" in resp.json()["detail"]




