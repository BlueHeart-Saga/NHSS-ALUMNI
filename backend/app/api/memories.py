from fastapi import APIRouter, Depends, HTTPException, Query, Body
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
from bson import ObjectId
from app.core.database import get_db
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/memories", tags=["Event Memories & Photos Management"])

class MemoryCreatePayload(BaseModel):
    title: str
    image_url: str
    description: Optional[str] = None
    batch_year: Optional[str] = None
    batch_id: Optional[str] = None
    uploader_name: Optional[str] = "Alumni Member"
    uploader_email: Optional[str] = None
    status: Optional[str] = "SUBMITTED"

class MemoryStatusUpdatePayload(BaseModel):
    status: str
    admin_remarks: Optional[str] = None

VALID_STATUSES = [
    "DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED",
    "REJECTED", "CHANGES_REQUESTED", "REPORTED", "HIDDEN", "DELETED"
]

def format_memory(p: dict) -> dict:
    return {
        "id": str(p["_id"]),
        "title": p.get("title", "School Memory"),
        "image_url": p.get("image_url", ""),
        "description": p.get("description", ""),
        "batch_year": str(p.get("batch_year", p.get("batch_id", ""))),
        "uploader_name": p.get("uploader_name", "Alumni Member"),
        "uploader_email": p.get("uploader_email", ""),
        "uploader_id": str(p.get("uploaded_by", "")),
        "status": p.get("status", "APPROVED"),
        "admin_remarks": p.get("admin_remarks", ""),
        "created_at": str(p.get("created_at", ""))
    }

@router.get("")
async def list_memories(
    status: Optional[str] = Query(None, description="Status filter: ALL, SUBMITTED, APPROVED, etc.")
):
    db = get_db()
    query = {}

    if status and status.upper() != "ALL":
        if status.upper() == "PENDING":
            query["status"] = {"$in": ["SUBMITTED", "UNDER_REVIEW"]}
        else:
            query["status"] = status.upper()

    cursor = db.memories.find(query).sort("created_at", -1)
    photos = await cursor.to_list(length=200)
    return [format_memory(p) for p in photos]

@router.post("")
async def create_memory(payload: MemoryCreatePayload):
    db = get_db()
    status = payload.status.upper() if payload.status else "SUBMITTED"
    if status not in VALID_STATUSES:
        status = "SUBMITTED"

    now = datetime.now(timezone.utc)
    doc = {
        "title": payload.title.strip(),
        "image_url": payload.image_url.strip(),
        "description": payload.description.strip() if payload.description else "",
        "batch_year": payload.batch_year.strip() if payload.batch_year else "",
        "batch_id": payload.batch_id.strip() if payload.batch_id else "",
        "uploader_name": payload.uploader_name.strip() if payload.uploader_name else "Alumni Member",
        "uploader_email": payload.uploader_email.strip() if payload.uploader_email else "",
        "status": status,
        "admin_remarks": "",
        "created_at": now,
        "updated_at": now
    }

    res = await db.memories.insert_one(doc)
    doc["_id"] = res.inserted_id
    return format_memory(doc)

@router.put("/{memory_id}/status")
async def update_memory_status(memory_id: str, payload: MemoryStatusUpdatePayload):
    db = get_db()
    status = payload.status.upper()
    if status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {VALID_STATUSES}")

    try:
        obj_id = ObjectId(memory_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid memory ID format")

    memory = await db.memories.find_one({"_id": obj_id})
    if not memory:
        raise HTTPException(status_code=404, detail="Memory record not found")

    update_fields = {
        "status": status,
        "admin_remarks": payload.admin_remarks.strip() if payload.admin_remarks else "",
        "updated_at": datetime.now(timezone.utc)
    }

    await db.memories.update_one({"_id": obj_id}, {"$set": update_fields})
    updated = await db.memories.find_one({"_id": obj_id})
    return format_memory(updated)

@router.delete("/{memory_id}")
async def delete_memory(memory_id: str):
    db = get_db()
    try:
        obj_id = ObjectId(memory_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid memory ID format")

    res = await db.memories.delete_one({"_id": obj_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Memory record not found")

    return {"success": True, "message": "Memory photo deleted successfully"}
