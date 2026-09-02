from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from bson import ObjectId
from app.core.database import get_db
from app.core.security import decode_qr_ticket_token
from app.schemas.models import ScanQRRequest, ManualCheckinRequest, CheckinResultResponse
from app.middleware.auth import require_roles

router = APIRouter(prefix="/checkins", tags=["QR Check-In Terminal"])

@router.post("/scan", response_model=CheckinResultResponse)
async def scan_qr_token(
    request: ScanQRRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "BATCH_COORDINATOR"]))
):
    db = get_db()
    school_id = current_user["school_id"]

    try:
        payload = decode_qr_ticket_token(request.qr_token)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    token_event_id = payload.get("event_id")
    alumni_id = payload.get("alumni_id")
    token_school_id = payload.get("school_id")

    # Security Validations
    if token_school_id != school_id:
        raise HTTPException(status_code=400, detail="Invalid QR Code: Ticket issued by another school")

    if token_event_id != request.event_id:
        raise HTTPException(status_code=400, detail="Invalid QR Code: Ticket issued for a different event")

    # Fetch Alumni Details
    alumni = await db.alumni.find_one({"_id": ObjectId(alumni_id), "school_id": school_id})
    if not alumni:
        raise HTTPException(status_code=404, detail="Alumni profile not found")

    batch = await db.batches.find_one({"school_id": school_id, "passing_year": alumni["passing_year"]})
    batch_name = (batch.get("name") or f"Class of {alumni.get('passing_year', '')}") if batch else f"Class of {alumni.get('passing_year', '')}"

    # Check RSVP status
    att = await db.event_attendance.find_one({"event_id": request.event_id, "alumni_id": alumni_id})
    if not att or att.get("rsvp_status") != "ATTENDING":
        raise HTTPException(status_code=400, detail=f"{alumni['full_name']} does not have a confirmed ATTENDING RSVP")

    # Prevent duplicate check-in
    existing_checkin = await db.checkins.find_one({"event_id": request.event_id, "alumni_id": alumni_id})
    if existing_checkin:
        t_str = existing_checkin["checked_in_at"].strftime("%I:%M %p")
        raise HTTPException(status_code=400, detail=f"DUPLICATE SCAN: {alumni['full_name']} was already checked in at {t_str}")

    now = datetime.now(timezone.utc)
    checkin_doc = {
        "school_id": school_id,
        "event_id": request.event_id,
        "alumni_id": alumni_id,
        "checked_in_by": current_user["user_id"],
        "checked_in_at": now,
        "method": "QR_SCAN"
    }

    await db.checkins.insert_one(checkin_doc)

    return CheckinResultResponse(
        success=True,
        message="CHECK-IN SUCCESSFUL",
        alumni_name=alumni["full_name"],
        batch_name=batch_name,
        checked_in_at=now.strftime("%I:%M %p"),
        total_guests=att.get("total_guests", 1)
    )

@router.post("/manual", response_model=CheckinResultResponse)
async def manual_checkin(
    request: ManualCheckinRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "BATCH_COORDINATOR"]))
):
    db = get_db()
    school_id = current_user["school_id"]

    alumni = await db.alumni.find_one({"_id": ObjectId(request.alumni_id), "school_id": school_id})
    if not alumni:
        raise HTTPException(status_code=404, detail="Alumni record not found")

    batch = await db.batches.find_one({"school_id": school_id, "passing_year": alumni["passing_year"]})
    batch_name = batch["name"] if batch else f"Class of {alumni['passing_year']}"

    existing_checkin = await db.checkins.find_one({"event_id": request.event_id, "alumni_id": request.alumni_id})
    if existing_checkin:
        t_str = existing_checkin["checked_in_at"].strftime("%I:%M %p")
        raise HTTPException(status_code=400, detail=f"{alumni['full_name']} already checked in at {t_str}")

    now = datetime.now(timezone.utc)
    checkin_doc = {
        "school_id": school_id,
        "event_id": request.event_id,
        "alumni_id": request.alumni_id,
        "checked_in_by": current_user["user_id"],
        "checked_in_at": now,
        "method": "MANUAL"
    }

    await db.checkins.insert_one(checkin_doc)

    return CheckinResultResponse(
        success=True,
        message="MANUAL CHECK-IN SUCCESSFUL",
        alumni_name=alumni["full_name"],
        batch_name=batch_name,
        checked_in_at=now.strftime("%I:%M %p"),
        total_guests=1
    )
