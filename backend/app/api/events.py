from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from app.core.database import get_db
from app.schemas.models import CreateEventRequest, EventResponse, MapCoordinates
from app.middleware.auth import get_current_user, require_roles

router = APIRouter(prefix="/events", tags=["Events & Get-Togethers"])

@router.get("", response_model=List[EventResponse])
async def list_events(
    batch_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    school_id = current_user["school_id"]

    query = {}
    if school_id:
        query["$or"] = [{"school_id": school_id}, {"school_id": {"$exists": False}}, {"school_id": None}]

    if batch_id:
        query["batch_id"] = batch_id
    
    if status:
        query["status"] = status
    elif "SCHOOL_ADMIN" not in current_user.get("roles", []):
        query["status"] = "PUBLISHED"

    cursor = db.events.find(query).sort("event_date", -1)
    events_list = await cursor.to_list(length=100)

    res = []
    for e in events_list:
        e_id = str(e["_id"])
        batch = await db.batches.find_one({"_id": ObjectId(e["batch_id"])}) if e.get("batch_id") else None

        # Calculate attendance counts
        attending = await db.event_attendance.count_documents({"event_id": e_id, "rsvp_status": "ATTENDING"})
        maybe = await db.event_attendance.count_documents({"event_id": e_id, "rsvp_status": "MAYBE"})
        declined = await db.event_attendance.count_documents({"event_id": e_id, "rsvp_status": "DECLINED"})

        # Calculate total guest count
        cursor_att = db.event_attendance.find({"event_id": e_id, "rsvp_status": "ATTENDING"})
        att_docs = await cursor_att.to_list(length=1000)
        total_guests = sum(a.get("adults_count", 1) + a.get("children_count", 0) for a in att_docs)

        res.append(EventResponse(
            id=e_id,
            school_id=school_id,
            batch_id=str(e["batch_id"]) if e.get("batch_id") else None,
            batch_name=batch["name"] if batch else "School-wide",
            title=e["title"],
            description=e["description"],
            event_date=e["event_date"],
            start_time=e["start_time"],
            end_time=e["end_time"],
            venue=e["venue"],
            address=e["address"],
            map_coordinates=MapCoordinates(**e["map_coordinates"]) if e.get("map_coordinates") else None,
            registration_deadline=e.get("registration_deadline"),
            guest_allowed=e.get("guest_allowed", True),
            max_capacity=e.get("max_capacity", 300),
            cover_image_url=e.get("cover_image_url"),
            registration_url=e.get("registration_url"),
            status=e.get("status", "PUBLISHED"),
            attending_count=attending,
            maybe_count=maybe,
            declined_count=declined,
            total_guests=total_guests,
            created_by=str(e.get("created_by", "")),
            created_at=e.get("created_at", datetime.now(timezone.utc))
        ))
    return res

@router.post("", response_model=EventResponse)
async def create_event(
    request: CreateEventRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "BATCH_COORDINATOR"]))
):
    db = get_db()
    school_id = current_user["school_id"]

    # Check batch scope authorization for coordinator
    if "SCHOOL_ADMIN" not in current_user["roles"] and request.batch_id:
        batch = await db.batches.find_one({"_id": ObjectId(request.batch_id)})
        if not batch or current_user["user_id"] not in batch.get("coordinators", []):
            raise HTTPException(status_code=403, detail="Coordinator can only create events for their assigned batch")

    now = datetime.now(timezone.utc)
    status_val = "PUBLISHED" if request.publish_immediately else "DRAFT"

    doc = {
        "school_id": school_id,
        "batch_id": request.batch_id,
        "title": request.title,
        "description": request.description,
        "event_date": request.event_date,
        "start_time": request.start_time,
        "end_time": request.end_time,
        "venue": request.venue,
        "address": request.address,
        "map_coordinates": request.map_coordinates.model_dump() if request.map_coordinates else None,
        "registration_deadline": request.registration_deadline,
        "guest_allowed": request.guest_allowed,
        "max_capacity": request.max_capacity,
        "cover_image_url": request.cover_image_url,
        "registration_url": request.registration_url,
        "status": status_val,
        "created_by": current_user["user_id"],
        "created_at": now
    }

    res = await db.events.insert_one(doc)
    e_id = str(res.inserted_id)

    batch = await db.batches.find_one({"_id": ObjectId(request.batch_id)}) if request.batch_id else None

    return EventResponse(
        id=e_id,
        school_id=school_id,
        batch_id=request.batch_id,
        batch_name=batch["name"] if batch else "School-wide",
        title=request.title,
        description=request.description,
        event_date=request.event_date,
        start_time=request.start_time,
        end_time=request.end_time,
        venue=request.venue,
        address=request.address,
        map_coordinates=request.map_coordinates,
        registration_deadline=request.registration_deadline,
        guest_allowed=request.guest_allowed,
        max_capacity=request.max_capacity,
        status=status_val,
        attending_count=0,
        maybe_count=0,
        declined_count=0,
        total_guests=0,
        created_by=current_user["user_id"],
        created_at=now
    )

@router.get("/{event_id}", response_model=EventResponse)
async def get_event_details(event_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    school_id = current_user["school_id"]

    e = await db.events.find_one({"_id": ObjectId(event_id), "school_id": school_id})
    if not e:
        raise HTTPException(status_code=404, detail="Event not found")

    batch = await db.batches.find_one({"_id": ObjectId(e["batch_id"])}) if e.get("batch_id") else None

    attending = await db.event_attendance.count_documents({"event_id": event_id, "rsvp_status": "ATTENDING"})
    maybe = await db.event_attendance.count_documents({"event_id": event_id, "rsvp_status": "MAYBE"})
    declined = await db.event_attendance.count_documents({"event_id": event_id, "rsvp_status": "DECLINED"})

    cursor_att = db.event_attendance.find({"event_id": event_id, "rsvp_status": "ATTENDING"})
    att_docs = await cursor_att.to_list(length=1000)
    total_guests = sum(a.get("adults_count", 1) + a.get("children_count", 0) for a in att_docs)

    return EventResponse(
        id=event_id,
        school_id=school_id,
        batch_id=str(e["batch_id"]) if e.get("batch_id") else None,
        batch_name=batch["name"] if batch else "School-wide",
        title=e["title"],
        description=e["description"],
        event_date=e["event_date"],
        start_time=e["start_time"],
        end_time=e["end_time"],
        venue=e["venue"],
        address=e["address"],
        map_coordinates=MapCoordinates(**e["map_coordinates"]) if e.get("map_coordinates") else None,
        registration_deadline=e.get("registration_deadline"),
        guest_allowed=e.get("guest_allowed", True),
        max_capacity=e.get("max_capacity", 300),
        status=e.get("status", "PUBLISHED"),
        attending_count=attending,
        maybe_count=maybe,
        declined_count=declined,
        total_guests=total_guests,
        created_by=str(e.get("created_by", "")),
        created_at=e.get("created_at", datetime.now(timezone.utc))
    )

@router.post("/{event_id}/publish")
async def publish_event(
    event_id: str,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "BATCH_COORDINATOR"]))
):
    db = get_db()
    school_id = current_user["school_id"]

    await db.events.update_one(
        {"_id": ObjectId(event_id), "school_id": school_id},
        {"$set": {"status": "PUBLISHED"}}
    )
    return {"success": True, "message": "Event published successfully"}

@router.post("/{event_id}/cancel")
async def cancel_event(
    event_id: str,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "BATCH_COORDINATOR"]))
):
    db = get_db()
    school_id = current_user["school_id"]

    await db.events.update_one(
        {"_id": ObjectId(event_id), "school_id": school_id},
        {"$set": {"status": "CANCELLED"}}
    )
    return {"success": True, "message": "Event status updated to CANCELLED"}
