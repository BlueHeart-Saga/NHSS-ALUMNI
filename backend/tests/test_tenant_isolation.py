import pytest
from fastapi import HTTPException
from app.middleware.auth import require_roles, require_verified_alumni

@pytest.mark.asyncio
async def test_unauthenticated_role_access():
    checker = require_roles(["SCHOOL_ADMIN"])
    alumni_user = {
        "user_id": "user_alumni_1",
        "school_id": "school_abc",
        "roles": ["ALUMNI"],
        "verification_status": "APPROVED"
    }

    with pytest.raises(HTTPException) as exc_info:
        await checker(alumni_user)
    assert exc_info.value.status_code == 403
    assert "Action requires one of the following roles" in exc_info.value.detail

@pytest.mark.asyncio
async def test_unverified_alumni_access_blocked():
    pending_user = {
        "user_id": "user_pending_1",
        "school_id": "school_abc",
        "roles": ["ALUMNI"],
        "verification_status": "PENDING"
    }

    with pytest.raises(HTTPException) as exc_info:
        await require_verified_alumni(pending_user)
    assert exc_info.value.status_code == 403
    assert "Only APPROVED alumni can perform this action" in exc_info.value.detail

@pytest.mark.asyncio
async def test_admin_role_bypasses_alumni_check():
    admin_user = {
        "user_id": "user_admin_1",
        "school_id": "school_abc",
        "roles": ["SCHOOL_ADMIN"],
        "verification_status": "NOT_APPLICABLE"
    }

    res = await require_verified_alumni(admin_user)
    assert res == admin_user
