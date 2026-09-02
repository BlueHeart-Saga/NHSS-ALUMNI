from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
from bson import ObjectId
from app.core.database import get_db
from app.middleware.auth import get_current_user, require_roles

router = APIRouter(prefix="/school-events", tags=["School Events & Celebrations"])

class CreateSchoolEventRequest(BaseModel):
    title: str
    category: str = "ANNUAL_DAY"  # ANNUAL_DAY, SPORTS_DAY, CULTURAL_FEST, NATIONAL_DAY, EXHIBITION, CELEBRATION, ACADEMIC_MEET, GRADUATION_DAY, OTHER
    event_date: str  # YYYY-MM-DD
    end_date: Optional[str] = None
    start_time: Optional[str] = "09:00 AM"
    end_time: Optional[str] = "04:00 PM"
    venue: str = "School Main Campus"
    chief_guest: Optional[str] = None
    target_audience: Optional[str] = "ALL_STUDENTS"  # ALL_STUDENTS, PARENTS, STAFF, PUBLIC, ALUMNI_GUESTS
    description: str
    cover_image_url: Optional[str] = None
    gallery_urls: Optional[List[str]] = []
    status: str = "UPCOMING"  # UPCOMING, COMPLETED, CANCELLED

class UpdateSchoolEventRequest(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    event_date: Optional[str] = None
    end_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    venue: Optional[str] = None
    chief_guest: Optional[str] = None
    target_audience: Optional[str] = None
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    gallery_urls: Optional[List[str]] = None
    status: Optional[str] = None

@router.get("")
async def list_school_events(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """List all official school events and celebrations."""
    db = get_db()
    school_id = current_user.get("school_id")

    query = {}
    if school_id:
        query["$or"] = [{"school_id": school_id}, {"school_id": {"$exists": False}}, {"school_id": None}]

    if category and category != "ALL":
        query["category"] = category
    if status and status != "ALL":
        query["status"] = status
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"venue": {"$regex": search, "$options": "i"}},
            {"chief_guest": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]

    cursor = db.school_events.find(query).sort("event_date", -1)
    events_list = await cursor.to_list(length=200)

    res = []
    for doc in events_list:
        res.append({
            "id": str(doc["_id"]),
            "school_id": str(doc.get("school_id")) if doc.get("school_id") else None,
            "title": doc.get("title", ""),
            "category": doc.get("category", "ANNUAL_DAY"),
            "event_date": doc.get("event_date", ""),
            "end_date": doc.get("end_date"),
            "start_time": doc.get("start_time", "09:00 AM"),
            "end_time": doc.get("end_time", "04:00 PM"),
            "venue": doc.get("venue", "School Campus"),
            "chief_guest": doc.get("chief_guest"),
            "target_audience": doc.get("target_audience", "ALL_STUDENTS"),
            "description": doc.get("description", ""),
            "cover_image_url": doc.get("cover_image_url"),
            "gallery_urls": doc.get("gallery_urls", []),
            "status": doc.get("status", "UPCOMING"),
            "created_at": doc.get("created_at", datetime.now(timezone.utc)).isoformat() if isinstance(doc.get("created_at"), datetime) else str(doc.get("created_at", ""))
        })
    return res

@router.post("")
async def create_school_event(
    payload: CreateSchoolEventRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    """Create a new official school event or celebration."""
    db = get_db()
    school_id = current_user.get("school_id")

    now = datetime.now(timezone.utc)
    doc = payload.dict()
    doc["school_id"] = school_id
    doc["created_at"] = now
    doc["updated_at"] = now

    res = await db.school_events.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc["created_at"] = now.isoformat()
    doc["updated_at"] = now.isoformat()
    return doc

@router.get("/{event_id}")
async def get_school_event(
    event_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get single school event details."""
    db = get_db()
    try:
        doc = await db.school_events.find_one({"_id": ObjectId(event_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid School Event ID format")

    if not doc:
        raise HTTPException(status_code=404, detail="School event not found")

    return {
        "id": str(doc["_id"]),
        "school_id": str(doc.get("school_id")) if doc.get("school_id") else None,
        "title": doc.get("title", ""),
        "category": doc.get("category", "ANNUAL_DAY"),
        "event_date": doc.get("event_date", ""),
        "end_date": doc.get("end_date"),
        "start_time": doc.get("start_time", "09:00 AM"),
        "end_time": doc.get("end_time", "04:00 PM"),
        "venue": doc.get("venue", "School Campus"),
        "chief_guest": doc.get("chief_guest"),
        "target_audience": doc.get("target_audience", "ALL_STUDENTS"),
        "description": doc.get("description", ""),
        "cover_image_url": doc.get("cover_image_url"),
        "gallery_urls": doc.get("gallery_urls", []),
        "status": doc.get("status", "UPCOMING"),
        "created_at": doc.get("created_at", datetime.now(timezone.utc)).isoformat() if isinstance(doc.get("created_at"), datetime) else str(doc.get("created_at", ""))
    }

@router.put("/{event_id}")
async def update_school_event(
    event_id: str,
    payload: UpdateSchoolEventRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    """Update an existing school event or celebration."""
    db = get_db()
    try:
        oid = ObjectId(event_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid School Event ID format")

    update_fields = {k: v for k, v in payload.dict().items() if v is not None}
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    update_fields["updated_at"] = datetime.now(timezone.utc)

    res = await db.school_events.update_one({"_id": oid}, {"$set": update_fields})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="School event not found")

    updated = await db.school_events.find_one({"_id": oid})
    return {
        "id": str(updated["_id"]),
        "school_id": str(updated.get("school_id")) if updated.get("school_id") else None,
        "title": updated.get("title", ""),
        "category": updated.get("category", "ANNUAL_DAY"),
        "event_date": updated.get("event_date", ""),
        "end_date": updated.get("end_date"),
        "start_time": updated.get("start_time", "09:00 AM"),
        "end_time": updated.get("end_time", "04:00 PM"),
        "venue": updated.get("venue", "School Campus"),
        "chief_guest": updated.get("chief_guest"),
        "target_audience": updated.get("target_audience", "ALL_STUDENTS"),
        "description": updated.get("description", ""),
        "cover_image_url": updated.get("cover_image_url"),
        "gallery_urls": updated.get("gallery_urls", []),
        "status": updated.get("status", "UPCOMING")
    }

@router.delete("/{event_id}")
async def delete_school_event(
    event_id: str,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    """Delete a school event."""
    db = get_db()
    try:
        oid = ObjectId(event_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid School Event ID format")

    res = await db.school_events.delete_one({"_id": oid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="School event not found")

    return {"success": True, "message": "School event deleted successfully"}
