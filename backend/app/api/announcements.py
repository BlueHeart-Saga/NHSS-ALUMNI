from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from app.core.database import get_db
from app.schemas.models import CreateAnnouncementRequest, AnnouncementResponse
from app.middleware.auth import get_current_user, require_roles
from app.services.fcm import notification_service

router = APIRouter(prefix="/announcements", tags=["Announcements Feed"])

@router.get("", response_model=List[AnnouncementResponse])
async def list_announcements(
    batch_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    school_id = current_user["school_id"]

    query = {"school_id": school_id}
    if batch_id:
        query["$or"] = [{"target": "SCHOOL"}, {"batch_id": batch_id}]

    cursor = db.announcements.find(query).sort("created_at", -1)
    announcements = await cursor.to_list(length=100)

    res = []
    for a in announcements:
        creator = await db.alumni.find_one({"user_id": a.get("created_by")}) if a.get("created_by") else None
        res.append(AnnouncementResponse(
            id=str(a["_id"]),
            school_id=school_id,
            batch_id=str(a["batch_id"]) if a.get("batch_id") else None,
            target=a["target"],
            title=a["title"],
            content=a["content"],
            created_by_name=creator["full_name"] if creator else "School Admin",
            created_at=a.get("created_at", datetime.now(timezone.utc))
        ))
    return res

@router.post("", response_model=AnnouncementResponse)
async def create_announcement(
    request: CreateAnnouncementRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "BATCH_COORDINATOR"]))
):
    db = get_db()
    school_id = current_user["school_id"]

    now = datetime.now(timezone.utc)
    doc = {
        "school_id": school_id,
        "batch_id": request.batch_id,
        "target": request.target,
        "title": request.title,
        "content": request.content,
        "created_by": current_user["user_id"],
        "created_at": now
    }

    res = await db.announcements.insert_one(doc)
    a_id = str(res.inserted_id)

    # Dispatch notification push
    await notification_service.broadcast_announcement(request.target, request.batch_id or school_id, request.title, request.content)

    creator = await db.alumni.find_one({"user_id": current_user["user_id"]})

    return AnnouncementResponse(
        id=a_id,
        school_id=school_id,
        batch_id=request.batch_id,
        target=request.target,
        title=request.title,
        content=request.content,
        created_by_name=creator["full_name"] if creator else "School Admin",
        created_at=now
    )
