from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from app.core.database import get_db
from app.schemas.models import CreateAnnouncementRequest, UpdateAnnouncementRequest, AnnouncementResponse
from app.middleware.auth import get_current_user, require_roles
from app.services.fcm import notification_service

router = APIRouter(prefix="/announcements", tags=["Announcements Feed"])

@router.get("", response_model=List[AnnouncementResponse])
async def list_announcements(
    batch_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    school_id = current_user.get("school_id")

    query = {}
    if school_id:
        query["school_id"] = school_id

    if batch_id:
        query["$or"] = [{"target": "SCHOOL"}, {"batch_id": batch_id}]

    cursor = db.announcements.find(query).sort("created_at", -1)
    announcements = await cursor.to_list(length=100)

    res = []
    for a in announcements:
        creator = await db.alumni.find_one({"user_id": a.get("created_by")}) if a.get("created_by") else None
        res.append(AnnouncementResponse(
            id=str(a["_id"]),
            school_id=str(a.get("school_id", school_id or "")),
            batch_id=str(a["batch_id"]) if a.get("batch_id") else None,
            target=a.get("target", "SCHOOL"),
            category=a.get("category", "GENERAL"),
            title=a.get("title", ""),
            title_ta=a.get("title_ta"),
            content=a.get("content", ""),
            content_ta=a.get("content_ta"),
            poster_url=a.get("poster_url"),
            created_by_name=creator["full_name"] if creator else "School Admin",
            created_at=a.get("created_at", datetime.now(timezone.utc)),
            updated_at=a.get("updated_at")
        ))
    return res

@router.post("", response_model=AnnouncementResponse)
async def create_announcement(
    request: CreateAnnouncementRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "BATCH_COORDINATOR", "SUPER_ADMIN"]))
):
    db = get_db()
    school_id = current_user.get("school_id")

    now = datetime.now(timezone.utc)
    doc = {
        "school_id": school_id,
        "batch_id": request.batch_id,
        "target": request.target,
        "category": request.category or "GENERAL",
        "title": request.title,
        "title_ta": request.title_ta,
        "content": request.content,
        "content_ta": request.content_ta,
        "poster_url": request.poster_url,
        "created_by": current_user["user_id"],
        "created_at": now
    }

    res = await db.announcements.insert_one(doc)
    a_id = str(res.inserted_id)

    # Dispatch notification push
    try:
        await notification_service.broadcast_announcement(
            request.target,
            request.batch_id or school_id or "ALL",
            request.title,
            request.content
        )
    except Exception as e:
        print(f"Failed to dispatch push notification: {e}")

    creator = await db.alumni.find_one({"user_id": current_user["user_id"]})

    return AnnouncementResponse(
        id=a_id,
        school_id=str(school_id or ""),
        batch_id=request.batch_id,
        target=request.target,
        category=request.category or "GENERAL",
        title=request.title,
        title_ta=request.title_ta,
        content=request.content,
        content_ta=request.content_ta,
        poster_url=request.poster_url,
        created_by_name=creator["full_name"] if creator else "School Admin",
        created_at=now
    )

@router.put("/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement(
    announcement_id: str,
    request: UpdateAnnouncementRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "BATCH_COORDINATOR", "SUPER_ADMIN"]))
):
    db = get_db()
    
    try:
        obj_id = ObjectId(announcement_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid announcement ID")

    existing = await db.announcements.find_one({"_id": obj_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Announcement not found")

    update_fields = {"updated_at": datetime.now(timezone.utc)}
    if request.target is not None:
        update_fields["target"] = request.target
    if request.batch_id is not None:
        update_fields["batch_id"] = request.batch_id
    if request.category is not None:
        update_fields["category"] = request.category
    if request.title is not None:
        update_fields["title"] = request.title
    if request.title_ta is not None:
        update_fields["title_ta"] = request.title_ta
    if request.content is not None:
        update_fields["content"] = request.content
    if request.content_ta is not None:
        update_fields["content_ta"] = request.content_ta
    if request.poster_url is not None:
        update_fields["poster_url"] = request.poster_url

    await db.announcements.update_one({"_id": obj_id}, {"$set": update_fields})
    updated = await db.announcements.find_one({"_id": obj_id})

    creator = await db.alumni.find_one({"user_id": updated.get("created_by")}) if updated.get("created_by") else None

    return AnnouncementResponse(
        id=str(updated["_id"]),
        school_id=str(updated.get("school_id", "")),
        batch_id=str(updated["batch_id"]) if updated.get("batch_id") else None,
        target=updated.get("target", "SCHOOL"),
        category=updated.get("category", "GENERAL"),
        title=updated.get("title", ""),
        title_ta=updated.get("title_ta"),
        content=updated.get("content", ""),
        content_ta=updated.get("content_ta"),
        poster_url=updated.get("poster_url"),
        created_by_name=creator["full_name"] if creator else "School Admin",
        created_at=updated.get("created_at", datetime.now(timezone.utc)),
        updated_at=updated.get("updated_at")
    )

@router.delete("/{announcement_id}")
async def delete_announcement(
    announcement_id: str,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "BATCH_COORDINATOR", "SUPER_ADMIN"]))
):
    db = get_db()
    try:
        obj_id = ObjectId(announcement_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid announcement ID")

    res = await db.announcements.delete_one({"_id": obj_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")

    return {"success": True, "message": "Announcement deleted successfully"}
