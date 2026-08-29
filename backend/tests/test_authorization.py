import pytest
from fastapi import HTTPException
from app.middleware.auth import require_roles, require_verified_alumni

@pytest.mark.asyncio
async def test_require_roles_success():
    checker = require_roles(["SCHOOL_ADMIN"])
    user = {"user_id": "1", "roles": ["SCHOOL_ADMIN"]}
    res = await checker(user)
    assert res == user

@pytest.mark.asyncio
async def test_require_roles_forbidden():
    checker = require_roles(["SCHOOL_ADMIN"])
    user = {"user_id": "1", "roles": ["ALUMNI"]}
    with pytest.raises(HTTPException) as exc:
        await checker(user)
    assert exc.value.status_code == 403

@pytest.mark.asyncio
async def test_require_verified_alumni_pending():
    user = {"user_id": "1", "roles": ["ALUMNI"], "verification_status": "PENDING"}
    with pytest.raises(HTTPException) as exc:
        await require_verified_alumni(user)
    assert exc.value.status_code == 403
