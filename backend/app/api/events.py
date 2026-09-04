from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from app.core.database import get_db
from app.schemas.models import CreateEventRequest, UpdateEventRequest, EventResponse, MapCoordinates
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

    if not events_list:
        return []

    event_ids = [str(e["_id"]) for e in events_list]
    batch_ids = []
    for e in events_list:
        if e.get("batch_id"):
            try:
                batch_ids.append(ObjectId(e["batch_id"]))
            except Exception:
                batch_ids.append(e["batch_id"])

    # Batch Query 1: Single query for batch lookup
    batch_map = {}
    if batch_ids:
        batches_docs = await db.batches.find({"_id": {"$in": batch_ids}}).to_list(length=len(batch_ids))
        for b in batches_docs:
            batch_map[str(b["_id"])] = b.get("name") or f"Batch of {b.get('passing_year', '')}"

    # Batch Query 2: Single aggregation pipeline for RSVP counts & guest totals
    att_map = {}
    if event_ids:
        pipeline = [
            {"$match": {"event_id": {"$in": event_ids}}},
            {"$group": {
                "_id": {"event_id": "$event_id", "status": "$rsvp_status"},
                "count": {"$sum": 1},
                "total_adults": {"$sum": {"$ifNull": ["$adults_count", 1]}},
                "total_children": {"$sum": {"$ifNull": ["$children_count", 0]}}
            }}
        ]
        agg_docs = await db.event_attendance.aggregate(pipeline).to_list(length=500)
        for doc in agg_docs:
            ev_id = doc["_id"]["event_id"]
            st = doc["_id"].get("status", "ATTENDING")
            cnt = doc.get("count", 0)
            adults = doc.get("total_adults", 0)
            children = doc.get("total_children", 0)
            
            if ev_id not in att_map:
                att_map[ev_id] = {"attending": 0, "maybe": 0, "declined": 0, "guests": 0}
            
            if st == "ATTENDING":
                att_map[ev_id]["attending"] = cnt
                att_map[ev_id]["guests"] = adults + children
            elif st == "MAYBE":
                att_map[ev_id]["maybe"] = cnt
            elif st == "DECLINED":
                att_map[ev_id]["declined"] = cnt

    res = []
    for e in events_list:
        e_id = str(e["_id"])
        b_name = batch_map.get(str(e.get("batch_id")), "School-wide") if e.get("batch_id") else "School-wide"
        counts = att_map.get(e_id, {"attending": 0, "maybe": 0, "declined": 0, "guests": 0})

        res.append(EventResponse(
            id=e_id,
            school_id=school_id,
            batch_id=str(e["batch_id"]) if e.get("batch_id") else None,
            batch_name=b_name,
            title=e["title"],
            title_ta=e.get("title_ta"),
            description=e["description"],
            description_ta=e.get("description_ta"),
            event_date=e["event_date"],
            start_time=e["start_time"],
            end_time=e.get("end_time"),
            venue=e["venue"],
            address=e.get("address"),
            map_coordinates=MapCoordinates(**e["map_coordinates"]) if e.get("map_coordinates") else None,
            registration_deadline=e.get("registration_deadline"),
            guest_allowed=e.get("guest_allowed", True),
            max_capacity=e.get("max_capacity", 300),
            cover_image_url=e.get("cover_image_url"),
            cover_image_url_ta=e.get("cover_image_url_ta"),
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
        "title_ta": request.title_ta,
        "description": request.description,
        "description_ta": request.description_ta,
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
        "cover_image_url_ta": request.cover_image_url_ta,
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
        batch_name=(batch.get("name") or f"Batch of {batch.get('passing_year', '')}") if batch else "School-wide",
        title=request.title,
        title_ta=request.title_ta,
        description=request.description,
        description_ta=request.description_ta,
        event_date=request.event_date,
        start_time=request.start_time,
        end_time=request.end_time,
        venue=request.venue,
        address=request.address,
        map_coordinates=request.map_coordinates,
        registration_deadline=request.registration_deadline,
        guest_allowed=request.guest_allowed,
        max_capacity=request.max_capacity,
        cover_image_url=request.cover_image_url,
        cover_image_url_ta=request.cover_image_url_ta,
        registration_url=request.registration_url,
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
        batch_name=(batch.get("name") or f"Batch of {batch.get('passing_year', '')}") if batch else "School-wide",
        title=e["title"],
        title_ta=e.get("title_ta"),
        description=e["description"],
        description_ta=e.get("description_ta"),
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
        cover_image_url_ta=e.get("cover_image_url_ta"),
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

@router.delete("/{event_id}")
async def delete_event(
    event_id: str,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    db = get_db()
    school_id = current_user["school_id"]

    res = await db.events.delete_one({"_id": ObjectId(event_id), "school_id": school_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")

    await db.event_attendance.delete_many({"event_id": event_id})
    return {"success": True, "message": "Event deleted successfully"}

@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    request: UpdateEventRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "BATCH_COORDINATOR"]))
):
    db = get_db()
    school_id = current_user["school_id"]

    existing = await db.events.find_one({"_id": ObjectId(event_id), "school_id": school_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")

    # Coordinator validation
    if "SCHOOL_ADMIN" not in current_user["roles"] and existing.get("batch_id"):
        batch = await db.batches.find_one({"_id": ObjectId(existing["batch_id"])})
        if not batch or current_user["user_id"] not in batch.get("coordinators", []):
            raise HTTPException(status_code=403, detail="Coordinator can only edit events for their assigned batch")

    update_data = {k: v for k, v in request.model_dump().items() if v is not None}
    if "map_coordinates" in update_data and update_data["map_coordinates"]:
        update_data["map_coordinates"] = request.map_coordinates.model_dump()

    if update_data:
        await db.events.update_one(
            {"_id": ObjectId(event_id), "school_id": school_id},
            {"$set": update_data}
        )

    return await get_event_details(event_id=event_id, current_user=current_user)
