import asyncio
from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_token
from app.core.database import get_db

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        school_id = payload.get("school_id")
        roles = payload.get("roles", ["ALUMNI"])

        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

        db = get_db()
        user_obj_id = ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id
        user_str_id = str(user_id)

        # Run user and alumni database lookups concurrently in parallel
        user_task = db.users.find_one({"_id": user_obj_id})
        alumni_task = db.alumni.find_one({"user_id": user_str_id})

        user, alumni = await asyncio.gather(user_task, alumni_task)

        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or deleted")

        user_roles = user.get("roles")
        if not user_roles:
            legacy_role = user.get("role")
            if legacy_role:
                user_roles = [legacy_role.upper()]
            else:
                user_roles = roles or ["ALUMNI"]
        if isinstance(user_roles, list):
            user_roles = [str(r).upper() for r in user_roles]

        return {
            "user_id": str(user["_id"]),
            "school_id": str(user.get("school_id", school_id)),
            "roles": user_roles,
            "mobile": user.get("mobile"),
            "email": user.get("email"),
            "alumni": alumni,
            "verification_status": alumni.get("verification_status") if alumni else "NOT_REGISTERED"
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication failed")


def require_roles(allowed_roles: list):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_roles = current_user.get("roles", [])
        if not any(role in user_roles for role in allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action requires one of the following roles: {allowed_roles}"
            )
        return current_user
    return role_checker

async def require_verified_alumni(current_user: dict = Depends(get_current_user)):
    # SCHOOL_ADMIN bypasses alumni verification check
    if "SCHOOL_ADMIN" in current_user.get("roles", []):
        return current_user

    status_val = current_user.get("verification_status")
    if status_val != "APPROVED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. Alumni profile status is '{status_val}'. Only APPROVED alumni can perform this action."
        )
    return current_user
