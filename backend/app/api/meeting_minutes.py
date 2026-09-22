import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response
from bson import ObjectId

from app.core.database import get_db, build_school_filter
from app.core.cache import ttl_cache
from app.middleware.auth import require_roles
from app.schemas.models import (
    MeetingMinuteCreateRequest,
    MeetingMinuteUpdateRequest,
)
from app.services.azure_blob import blob_service

logger = logging.getLogger("app.meeting_minutes")
router = APIRouter(prefix="/meeting-minutes", tags=["Association Meeting Minutes"])

ADMIN_ROLES = ["SCHOOL_ADMIN", "SUPER_ADMIN", "PRIMARY_DEVELOPER", "DEVELOPER"]


def _serialize(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "school_id": str(doc["school_id"]) if doc.get("school_id") else None,
        "title": doc.get("title", ""),
        "title_ta": doc.get("title_ta"),
        "meeting_date": doc.get("meeting_date", ""),
        "meeting_time": doc.get("meeting_time"),
        "meeting_type": doc.get("meeting_type"),
        "notes": doc.get("notes"),
        "notes_ta": doc.get("notes_ta"),
        "pdf_url": doc.get("pdf_url"),
        "pdf_file_name": doc.get("pdf_file_name"),
        "pdf_file_size": doc.get("pdf_file_size"),
        "is_published": doc.get("is_published", False),
        "display_order": doc.get("display_order", 1),
        "status": doc.get("status", "ACTIVE"),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }


# ---------------------------------------------------------------------------
# PUBLIC ENDPOINTS
# ---------------------------------------------------------------------------
@router.get("/public")
async def public_list_meeting_minutes(response: Response):
    """Published meetings only, newest first."""
    response.headers["Cache-Control"] = "no-store"

    cached = ttl_cache.get("public:meeting-minutes")
    if cached is not None:
        return cached

    db = get_db()
    cursor = db.meeting_minutes.find(
        {"is_published": True, "status": "ACTIVE"}
    ).sort([("meeting_date", -1), ("created_at", -1)])
    docs = await cursor.to_list(length=500)

    res = [_serialize(d) for d in docs]
    ttl_cache.set("public:meeting-minutes", res, ttl=30)
    return res


# ---------------------------------------------------------------------------
# ADMIN ENDPOINTS
# ---------------------------------------------------------------------------
@router.get("/admin/all")
async def admin_list_meeting_minutes(
    current_user: dict = Depends(require_roles(ADMIN_ROLES)),
):
    db = get_db()
    school_id = current_user.get("school_id")
    query = {}
    if school_id:
        school_filter = await build_school_filter(school_id)
        if school_filter:
            query.update(school_filter)

    cursor = db.meeting_minutes.find(query).sort([("meeting_date", -1), ("created_at", -1)])
    docs = await cursor.to_list(length=500)
    return [_serialize(d) for d in docs]


@router.get("/admin/{meeting_id}")
async def admin_get_meeting_minute(
    meeting_id: str,
    current_user: dict = Depends(require_roles(ADMIN_ROLES)),
):
    db = get_db()
    oid = ObjectId(meeting_id) if ObjectId.is_valid(meeting_id) else meeting_id
    doc = await db.meeting_minutes.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Meeting minute not found")
    return _serialize(doc)


@router.post("/admin")
async def admin_create_meeting_minute(
    payload: MeetingMinuteCreateRequest,
    current_user: dict = Depends(require_roles(ADMIN_ROLES)),
):
    db = get_db()
    school_id = current_user.get("school_id") or "PLATFORM"
    now = datetime.now(timezone.utc)

    doc = {
        "school_id": school_id,
        "title": payload.title,
        "title_ta": payload.title_ta,
        "meeting_date": payload.meeting_date,
        "meeting_time": payload.meeting_time,
        "meeting_type": payload.meeting_type,
        "notes": payload.notes,
        "notes_ta": payload.notes_ta,
        "pdf_url": payload.pdf_url,
        "pdf_file_name": payload.pdf_file_name,
        "pdf_file_size": payload.pdf_file_size,
        "pdf_blob_path": payload.pdf_blob_path,
        "is_published": payload.is_published,
        "display_order": payload.display_order,
        "status": payload.status or "ACTIVE",
        "created_at": now,
        "updated_at": now,
    }
    res = await db.meeting_minutes.insert_one(doc)

    await db.audit_logs.insert_one({
        "school_id": school_id,
        "user_id": current_user["user_id"],
        "action": "MEETING_MINUTE_CREATED",
        "resource_type": "meeting_minute",
        "resource_id": str(res.inserted_id),
        "timestamp": now,
    })

    ttl_cache.invalidate("public:meeting-minutes")
    return {"success": True, "id": str(res.inserted_id), "message": "Meeting record created"}


@router.put("/admin/{meeting_id}")
async def admin_update_meeting_minute(
    meeting_id: str,
    payload: MeetingMinuteUpdateRequest,
    current_user: dict = Depends(require_roles(ADMIN_ROLES)),
):
    db = get_db()
    oid = ObjectId(meeting_id) if ObjectId.is_valid(meeting_id) else meeting_id

    update_fields = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_fields:
        return {"success": True, "message": "Nothing to update"}

    update_fields["updated_at"] = datetime.now(timezone.utc)

    result = await db.meeting_minutes.update_one({"_id": oid}, {"$set": update_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Meeting minute not found")

    await db.audit_logs.insert_one({
        "school_id": current_user.get("school_id"),
        "user_id": current_user["user_id"],
        "action": "MEETING_MINUTE_UPDATED",
        "resource_type": "meeting_minute",
        "resource_id": meeting_id,
        "metadata": {"fields": list(update_fields.keys())},
        "timestamp": datetime.now(timezone.utc),
    })

    ttl_cache.invalidate("public:meeting-minutes")
    return {"success": True, "message": "Meeting record updated"}


@router.delete("/admin/{meeting_id}")
async def admin_delete_meeting_minute(
    meeting_id: str,
    current_user: dict = Depends(require_roles(ADMIN_ROLES)),
):
    db = get_db()
    oid = ObjectId(meeting_id) if ObjectId.is_valid(meeting_id) else meeting_id
    result = await db.meeting_minutes.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Meeting minute not found")

    await db.audit_logs.insert_one({
        "school_id": current_user.get("school_id"),
        "user_id": current_user["user_id"],
        "action": "MEETING_MINUTE_DELETED",
        "resource_type": "meeting_minute",
        "resource_id": meeting_id,
        "timestamp": datetime.now(timezone.utc),
    })

    ttl_cache.invalidate("public:meeting-minutes")
    return {"success": True, "message": "Meeting record deleted"}


@router.post("/admin/upload-pdf")
async def admin_upload_meeting_minutes_pdf(
    file: UploadFile = File(...),
    school_id: Optional[str] = Form(None),
    current_user: dict = Depends(require_roles(ADMIN_ROLES)),
):
    """Upload a Meeting Minutes PDF attachment. No text extraction is performed —
    the admin enters the notes manually in the form."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    if len(content) > 30 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="PDF exceeds 30MB limit")

    effective_school_id = school_id or current_user.get("school_id") or "general"

    url = await blob_service.upload_raw_file(
        file_content=content,
        filename=file.filename,
        content_type="application/pdf",
        school_id=effective_school_id,
    )

    return {
        "success": True,
        "pdf_url": url,
        "file_name": file.filename,
        "file_size": len(content),
    }