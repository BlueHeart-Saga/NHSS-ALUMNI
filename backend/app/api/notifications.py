import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from bson import ObjectId
from pydantic import BaseModel

from app.core.config import settings
from app.core.database import get_db
from app.middleware.auth import get_current_user

logger = logging.getLogger("app.notifications")
router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/whatsapp/webhook")
async def verify_whatsapp_webhook(
    request: Request,
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
):
    """
    Meta WhatsApp Cloud API Webhook Verification Endpoint.
    Responds to Meta's GET challenge when configuring webhook in Meta App Dashboard.
    """
    expected_token = getattr(settings, "WHATSAPP_VERIFY_TOKEN", None) or "nhss_alumni_whatsapp_webhook_token_2026"

    if hub_mode == "subscribe" and hub_verify_token == expected_token:
        logger.info(f"✅ Meta WhatsApp Webhook verified successfully! Challenge: {hub_challenge}")
        return Response(content=str(hub_challenge or ""), media_type="text/plain", status_code=200)

    logger.warning(
        f"⚠️ WhatsApp Webhook verification failed. mode='{hub_mode}', token='{hub_verify_token}', expected='{expected_token}'"
    )
    raise HTTPException(status_code=403, detail="Verification token mismatch or invalid mode")


@router.post("/whatsapp/webhook")
async def receive_whatsapp_webhook(request: Request):
    """
    Receives incoming WhatsApp Cloud API events (delivery receipts, status updates) from Meta.
    """
    try:
        data = await request.json()
        logger.info(f"📩 Received WhatsApp Webhook Event: {data}")
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Error parsing WhatsApp webhook payload: {e}")
        return {"status": "ok"}


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