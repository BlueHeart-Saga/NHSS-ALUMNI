from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime, timezone
from bson import ObjectId
from app.core.database import get_db
from app.core.security import generate_qr_ticket_token
from app.schemas.models import RSVPRequest, RSVPResponse, AttendanceSummaryResponse
from app.middleware.auth import get_current_user, require_verified_alumni, require_roles

router = APIRouter(prefix="/attendance", tags=["Attendance & RSVP"])

@router.post("/{event_id}/rsvp", response_model=RSVPResponse)
async def submit_rsvp(
    event_id: str,
    request: RSVPRequest,
    current_user: dict = Depends(require_verified_alumni)
):
    db = get_db()
    school_id = current_user["school_id"]
    alumni = current_user["alumni"]

    if not alumni:
        raise HTTPException(status_code=400, detail="Alumni profile required for RSVP")

    alumni_id = str(alumni["_id"])

    # Check if event exists
    event = await db.events.find_one({"_id": ObjectId(event_id), "school_id": school_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event.get("status") == "CANCELLED":
        raise HTTPException(status_code=400, detail="Cannot RSVP to a cancelled event")

    # Overbooking Prevention Check
    if request.rsvp_status == "ATTENDING":
        max_capacity = event.get("max_capacity", 300)
        # Calculate current confirmed attendance (excluding this alumni's prior RSVP if updating)
        cursor_att = db.event_attendance.find({
            "event_id": event_id,
            "rsvp_status": "ATTENDING",
            "alumni_id": {"$ne": alumni_id}
        })
        existing_rsvps = await cursor_att.to_list(length=2000)
        current_confirmed = sum(a.get("total_guests", a.get("adults_count", 1) + a.get("children_count", 0)) for a in existing_rsvps)
        
        new_requested = request.adults_count + request.children_count

        if current_confirmed + new_requested > max_capacity:
            available_seats = max(0, max_capacity - current_confirmed)
            raise HTTPException(
                status_code=409,
                detail=f"Capacity Exceeded: This get-together is capped at {max_capacity} attendees. Only {available_seats} seat(s) remaining."
            )

    # Generate cryptographic QR token for ticket
    qr_token = generate_qr_ticket_token(event_id, alumni_id, school_id)

    now = datetime.now(timezone.utc)
    total_expected = (request.adults_count if request.rsvp_status == "ATTENDING" else 0) + (request.children_count if request.rsvp_status == "ATTENDING" else 0)

    doc = {
        "school_id": school_id,
        "event_id": event_id,
        "alumni_id": alumni_id,
        "rsvp_status": request.rsvp_status,
        "adults_count": request.adults_count,
        "children_count": request.children_count,
        "total_guests": total_expected,
        "qr_token": qr_token,
        "updated_at": now
    }

    await db.event_attendance.update_one(
        {"event_id": event_id, "alumni_id": alumni_id},
        {"$set": doc},
        upsert=True
    )

    return RSVPResponse(
        event_id=event_id,
        alumni_id=alumni_id,
        rsvp_status=request.rsvp_status,
        adults_count=request.adults_count,
        children_count=request.children_count,
        total_expected=total_expected,
        qr_token=qr_token,
        updated_at=now
    )

@router.get("/{event_id}/my-ticket", response_model=RSVPResponse)
async def get_my_ticket(event_id: str, current_user: dict = Depends(require_verified_alumni)):
    db = get_db()
    alumni = current_user["alumni"]
    if not alumni:
        raise HTTPException(status_code=404, detail="Alumni record not found")

    alumni_id = str(alumni["_id"])
    att = await db.event_attendance.find_one({"event_id": event_id, "alumni_id": alumni_id})
    if not att:
        raise HTTPException(status_code=404, detail="No RSVP ticket found for this event")

    return RSVPResponse(
        event_id=event_id,
        alumni_id=alumni_id,
        rsvp_status=att["rsvp_status"],
        adults_count=att.get("adults_count", 1),
        children_count=att.get("children_count", 0),
        total_expected=att.get("total_guests", 1),
        qr_token=att.get("qr_token", ""),
        updated_at=att.get("updated_at", datetime.now(timezone.utc))
    )

@router.get("/{event_id}/dashboard", response_model=AttendanceSummaryResponse)
async def get_attendance_dashboard(
    event_id: str,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "BATCH_COORDINATOR"]))
):
    db = get_db()
    school_id = current_user["school_id"]

    event = await db.events.find_one({"_id": ObjectId(event_id), "school_id": school_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    cursor_att = db.event_attendance.find({"event_id": event_id})
    attendance_records = await cursor_att.to_list(length=2000)

    confirmed = sum(1 for a in attendance_records if a.get("rsvp_status") == "ATTENDING")
    maybe = sum(1 for a in attendance_records if a.get("rsvp_status") == "MAYBE")
    declined = sum(1 for a in attendance_records if a.get("rsvp_status") == "DECLINED")

    adults = sum(a.get("adults_count", 1) for a in attendance_records if a.get("rsvp_status") == "ATTENDING")
    children = sum(a.get("children_count", 0) for a in attendance_records if a.get("rsvp_status") == "ATTENDING")
    total_expected = adults + children

    checked_in = await db.checkins.count_documents({"event_id": event_id})

    return AttendanceSummaryResponse(
        event_id=event_id,
        total_rsvp_count=len(attendance_records),
        confirmed_alumni=confirmed,
        maybe_alumni=maybe,
        declined_alumni=declined,
        total_adult_guests=adults,
        total_child_guests=children,
        total_expected_people=total_expected,
        checked_in_count=checked_in
    )

@router.get("/{event_id}/roster")
async def get_attendance_roster(
    event_id: str,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "BATCH_COORDINATOR"]))
):
    db = get_db()
    cursor = db.event_attendance.find({"event_id": event_id})
    attendance_list = await cursor.to_list(length=1000)

    roster = []
    for att in attendance_list:
        alumni = await db.alumni.find_one({"_id": ObjectId(att["alumni_id"])})
        checkin = await db.checkins.find_one({"event_id": event_id, "alumni_id": att["alumni_id"]})
        
        roster.append({
            "alumni_id": att["alumni_id"],
            "full_name": alumni["full_name"] if alumni else "Unknown",
            "passing_year": alumni["passing_year"] if alumni else 2010,
            "admission_number": alumni.get("admission_number", "") if alumni else "",
            "rsvp_status": att["rsvp_status"],
            "adults_count": att.get("adults_count", 1),
            "children_count": att.get("children_count", 0),
            "total_guests": att.get("total_guests", 1),
            "is_checked_in": checkin is not None,
            "checked_in_at": checkin["checked_in_at"].strftime("%I:%M %p") if checkin else None
        })

    return roster
