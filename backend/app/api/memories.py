from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from app.core.database import get_db
from app.schemas.models import MemoryResponse
from app.middleware.auth import get_current_user, require_verified_alumni
from app.services.azure_blob import blob_service

router = APIRouter(prefix="/memories", tags=["Event Memories & Photos"])

@router.get("", response_model=List[MemoryResponse])
async def list_memories(
    batch_id: Optional[str] = Query(None),
    event_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    school_id = current_user["school_id"]

    query = {"school_id": school_id, "status": "APPROVED"}
    if batch_id:
        query["batch_id"] = batch_id
    if event_id:
        query["event_id"] = event_id

    cursor = db.memories.find(query).sort("created_at", -1)
    photos = await cursor.to_list(length=100)

    res = []
    for p in photos:
        uploader = await db.alumni.find_one({"_id": ObjectId(p["uploaded_by"])}) if p.get("uploaded_by") else None
        res.append(MemoryResponse(
            id=str(p["_id"]),
            school_id=school_id,
            batch_id=str(p.get("batch_id", "")),
            event_id=str(p["event_id"]) if p.get("event_id") else None,
            title=p.get("title"),
            image_url=p["image_url"],
            uploader_name=uploader["full_name"] if uploader else "Verified Alumnus",
            uploader_id=str(p.get("uploaded_by", "")),
            created_at=p.get("created_at", datetime.now(timezone.utc))
        ))
    return res

@router.post("/upload", response_model=MemoryResponse)
async def upload_memory_photo(
    batch_id: str = Form(...),
    event_id: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: dict = Depends(require_verified_alumni)
):
    db = get_db()
    school_id = current_user["school_id"]
    alumni = current_user["alumni"]

    if not alumni:
        raise HTTPException(status_code=400, detail="Verified alumni record required")

    # Validate image file size and MIME type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files (JPG, PNG, WebP) are allowed")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024: # 10MB limit
        raise HTTPException(status_code=400, detail="Image file exceeds maximum limit of 10MB")

    # Upload to Azure Blob Storage / Local Fallback
    image_url, blob_path = await blob_service.upload_image(contents, file.filename, file.content_type)

    now = datetime.now(timezone.utc)
    doc = {
        "school_id": school_id,
        "batch_id": batch_id,
        "event_id": event_id,
        "title": title or "Reunion Memory",
        "image_url": image_url,
        "blob_path": blob_path,
        "uploaded_by": str(alumni["_id"]),
        "status": "APPROVED",
        "created_at": now
    }

    res = await db.memories.insert_one(doc)
    m_id = str(res.inserted_id)

    return MemoryResponse(
        id=m_id,
        school_id=school_id,
        batch_id=batch_id,
        event_id=event_id,
        title=title,
        image_url=image_url,
        uploader_name=alumni["full_name"],
        uploader_id=str(alumni["_id"]),
        created_at=now
    )

@router.delete("/{memory_id}")
async def delete_memory(
    memory_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    school_id = current_user["school_id"]

    photo = await db.memories.find_one({"_id": ObjectId(memory_id), "school_id": school_id})
    if not photo:
        raise HTTPException(status_code=404, detail="Photo memory not found")

    alumni = current_user.get("alumni")
    is_owner = alumni and str(alumni["_id"]) == photo.get("uploaded_by")
    is_admin = "SCHOOL_ADMIN" in current_user["roles"]

    if not is_owner and not is_admin:
        raise HTTPException(status_code=403, detail="You can only delete your own photos or perform admin moderation")

    await db.memories.delete_one({"_id": ObjectId(memory_id)})
    return {"success": True, "message": "Memory photo deleted"}
