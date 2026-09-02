import os
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
from bson import ObjectId
from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.services.azure_blob import blob_service, MEDIA_DIR

logger = logging.getLogger("app.memories")

router = APIRouter(prefix="/memories", tags=["Event Memories & Photos Management"])

class MemoryCreatePayload(BaseModel):
    title: str
    album_name: Optional[str] = "General School Gallery"
    media_type: Optional[str] = "IMAGE"  # IMAGE, VIDEO, ALBUM
    image_url: Optional[str] = ""
    cover_image_url: Optional[str] = ""
    media_urls: Optional[List[str]] = []
    video_url: Optional[str] = None
    video_thumbnail_url: Optional[str] = None
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
    cover = p.get("cover_image_url") or p.get("image_url") or ""
    urls = p.get("media_urls") or []
    if not urls and cover:
        urls = [cover]

    return {
        "id": str(p["_id"]),
        "title": p.get("title", "School Memory"),
        "album_name": p.get("album_name", "General School Gallery"),
        "media_type": p.get("media_type", "IMAGE"),
        "image_url": cover,
        "cover_image_url": cover,
        "media_urls": urls,
        "video_url": p.get("video_url"),
        "video_thumbnail_url": p.get("video_thumbnail_url"),
        "description": p.get("description", ""),
        "batch_year": str(p.get("batch_year", p.get("batch_id", ""))),
        "uploader_name": p.get("uploader_name", "Alumni Member"),
        "uploader_email": p.get("uploader_email", ""),
        "uploader_id": str(p.get("uploaded_by", "")),
        "status": p.get("status", "APPROVED"),
        "admin_remarks": p.get("admin_remarks", ""),
        "created_at": p.get("created_at", datetime.now(timezone.utc)).isoformat() if isinstance(p.get("created_at"), datetime) else str(p.get("created_at", ""))
    }

@router.get("")
async def list_memories(
    status: Optional[str] = Query(None, description="Status filter: ALL, SUBMITTED, APPROVED, etc."),
    media_type: Optional[str] = Query(None, description="Media filter: ALL, IMAGE, VIDEO, ALBUM"),
    album_name: Optional[str] = Query(None, description="Filter by album name"),
    search: Optional[str] = Query(None)
):
    db = get_db()
    query = {}

    if status and status.upper() != "ALL":
        if status.upper() == "PENDING":
            query["status"] = {"$in": ["SUBMITTED", "UNDER_REVIEW"]}
        else:
            query["status"] = status.upper()

    if media_type and media_type.upper() != "ALL":
        query["media_type"] = media_type.upper()

    if album_name and album_name != "ALL":
        query["album_name"] = album_name

    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"album_name": {"$regex": search, "$options": "i"}},
            {"uploader_name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]

    cursor = db.memories.find(query).sort("created_at", -1)
    photos = await cursor.to_list(length=300)
    return [format_memory(p) for p in photos]

@router.get("/albums")
async def list_memory_albums():
    """Returns grouped list of albums with cover photo & media count."""
    db = get_db()
    pipeline = [
        {"$group": {
            "_id": "$album_name",
            "count": {"$sum": 1},
            "cover_image_url": {"$first": {"$ifNull": ["$cover_image_url", "$image_url"]}},
            "last_updated": {"$max": "$created_at"},
            "statuses": {"$push": "$status"}
        }},
        {"$sort": {"last_updated": -1}}
    ]
    results = await db.memories.aggregate(pipeline).to_list(length=100)
    albums = []
    for r in results:
        album_title = r["_id"] or "General School Gallery"
        albums.append({
            "album_name": album_title,
            "count": r.get("count", 0),
            "cover_image_url": r.get("cover_image_url", ""),
            "last_updated": str(r.get("last_updated", ""))
        })
    return albums

@router.post("")
async def create_memory(payload: MemoryCreatePayload):
    db = get_db()
    status = payload.status.upper() if payload.status else "SUBMITTED"
    if status not in VALID_STATUSES:
        status = "SUBMITTED"

    cover = (payload.cover_image_url or payload.image_url or "").strip()
    urls = payload.media_urls if payload.media_urls else ([cover] if cover else [])

    now = datetime.now(timezone.utc)
    doc = {
        "title": payload.title.strip(),
        "album_name": payload.album_name.strip() if payload.album_name else "General School Gallery",
        "media_type": payload.media_type.upper() if payload.media_type else "IMAGE",
        "image_url": cover,
        "cover_image_url": cover,
        "media_urls": urls,
        "video_url": payload.video_url.strip() if payload.video_url else None,
        "video_thumbnail_url": payload.video_thumbnail_url.strip() if payload.video_thumbnail_url else None,
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

@router.post("/upload")
async def upload_single_memory_file(file: UploadFile = File(...)):
    """Uploads single image or video file for memories."""
    content_type = file.content_type or ""
    contents = await file.read()

    if len(contents) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 50MB")

    if content_type.startswith("image/"):
        image_url, _, _ = await blob_service.upload_image(contents, file.filename, content_type)
        return {"url": image_url, "filename": file.filename, "media_type": "IMAGE"}
    elif content_type.startswith("video/"):
        ext = os.path.splitext(file.filename)[1] or ".mp4"
        unique_name = f"video_{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(MEDIA_DIR, unique_name)
        with open(file_path, "wb") as f:
            f.write(contents)
        video_url = f"/uploads/{unique_name}"
        return {"url": video_url, "filename": file.filename, "media_type": "VIDEO"}
    else:
        raise HTTPException(status_code=400, detail="Only image (JPG, PNG, WebP) and video files (MP4, WebM, MOV) are supported.")

@router.post("/upload-multiple")
async def upload_multiple_memory_files(files: List[UploadFile] = File(...)):
    """Uploads multiple images or videos at once."""
    results = []
    for file in files:
        content_type = file.content_type or ""
        contents = await file.read()
        if content_type.startswith("image/"):
            image_url, _, _ = await blob_service.upload_image(contents, file.filename, content_type)
            results.append({"url": image_url, "filename": file.filename, "media_type": "IMAGE"})
        elif content_type.startswith("video/"):
            ext = os.path.splitext(file.filename)[1] or ".mp4"
            unique_name = f"video_{uuid.uuid4().hex}{ext}"
            file_path = os.path.join(MEDIA_DIR, unique_name)
            with open(file_path, "wb") as f:
                f.write(contents)
            video_url = f"/uploads/{unique_name}"
            results.append({"url": video_url, "filename": file.filename, "media_type": "VIDEO"})
    return {"urls": [r["url"] for r in results], "files": results}

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

    return {"success": True, "message": "Memory record deleted successfully"}
