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
        user = await db.users.find_one({"_id": user_id})
        if not user:
            # Check string or ObjectId
            from bson import ObjectId
            try:
                user = await db.users.find_one({"_id": ObjectId(user_id)})
            except Exception:
                pass

        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or deleted")

        # Find associated alumni record if any
        alumni = await db.alumni.find_one({"user_id": str(user["_id"])})

        return {
            "user_id": str(user["_id"]),
            "school_id": str(user.get("school_id", school_id)),
            "roles": user.get("roles", roles),
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
