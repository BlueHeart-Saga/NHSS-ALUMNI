import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from pydantic import BaseModel

from app.core.database import get_db
from app.middleware.auth import get_current_user

logger = logging.getLogger("app.notifications")
router = APIRouter(prefix="/notifications", tags=["Notifications"])


def _serialize(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "user_id": doc.get("user_id"),
        "kind": doc.get("kind", "GENERAL"),
        "title": doc.get("title", ""),
        "body": doc.get("body", ""),
        "related_type": doc.get("related_type"),
        "related_id": doc.get("related_id"),
        "is_read": bool(doc.get("is_read", False)),
        "created_at": doc.get("created_at"),
        "read_at": doc.get("read_at"),
    }


async def create_notification(
    db,
    user_id: str,
    title: str,
    body: str,
    kind: str = "GENERAL",
    related_type: Optional[str] = None,
    related_id: Optional[str] = None,
) -> Optional[str]:
    """Server-side helper used by other endpoints (e.g. sponsor rejection).

    Does NOT raise on failure — notifications are best-effort and should not
    break the caller's transaction.
    """
    if not user_id:
        return None
    try:
        now = datetime.now(timezone.utc)
        doc = {
            "user_id": str(user_id),
            "kind": kind,
            "title": title,
            "body": body,
            "related_type": related_type,
            "related_id": str(related_id) if related_id else None,
            "is_read": False,
            "created_at": now,
            "read_at": None,
        }
        res = await db.notifications.insert_one(doc)
        return str(res.inserted_id)
    except Exception as e:
        logger.warning(f"create_notification failed for user={user_id}: {e}")
        return None


@router.get("/my")
async def list_my_notifications(
    limit: int = 100,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    user_id = current_user.get("user_id")
    if not user_id:
        return []
    cursor = (
        db.notifications.find({"user_id": str(user_id)})
        .sort("created_at", -1)
        .limit(min(limit, 200))
    )
    docs = await cursor.to_list(length=min(limit, 200))
    return [_serialize(d) for d in docs]


@router.get("/my/unread-count")
async def unread_count(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user.get("user_id")
    if not user_id:
        return {"count": 0}
    count = await db.notifications.count_documents(
        {"user_id": str(user_id), "is_read": False}
    )
    return {"count": count}


@router.put("/{notification_id}/read")
async def mark_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    user_id = current_user.get("user_id")
    try:
        oid = ObjectId(notification_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid notification id")
    result = await db.notifications.update_one(
        {"_id": oid, "user_id": str(user_id)},
        {"$set": {"is_read": True, "read_at": datetime.now(timezone.utc)}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"success": True}


@router.put("/read-all")
async def mark_all_read(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user.get("user_id")
    if not user_id:
        return {"success": True, "updated": 0}
    result = await db.notifications.update_many(
        {"user_id": str(user_id), "is_read": False},
        {"$set": {"is_read": True, "read_at": datetime.now(timezone.utc)}},
    )
    return {"success": True, "updated": result.modified_count}