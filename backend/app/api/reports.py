import csv
import io
from fastapi import APIRouter, Depends, HTTPException, Response
from app.core.database import get_db
from app.schemas.models import DashboardReportResponse
from app.middleware.auth import require_roles

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

@router.get("/summary", response_model=DashboardReportResponse)
async def get_dashboard_summary(
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "BATCH_COORDINATOR"]))
):
    db = get_db()
    school_id = current_user["school_id"]

    total_alumni = await db.alumni.count_documents({"school_id": school_id})
    verified_alumni = await db.alumni.count_documents({"school_id": school_id, "verification_status": "APPROVED"})
    pending_alumni = await db.alumni.count_documents({"school_id": school_id, "verification_status": "PENDING"})
    active_batches = await db.batches.count_documents({"school_id": school_id, "status": "ACTIVE"})
    upcoming_events = await db.events.count_documents({"school_id": school_id, "status": "PUBLISHED"})
    recent_checkins = await db.checkins.count_documents({"school_id": school_id})

    turnout_pct = (recent_checkins / verified_alumni * 100) if verified_alumni > 0 else 0.0

    return DashboardReportResponse(
        total_alumni=total_alumni,
        verified_alumni=verified_alumni,
        pending_alumni=pending_alumni,
        active_batches=active_batches,
        upcoming_events=upcoming_events,
        recent_checkins_count=recent_checkins,
        attendance_turnout_percentage=round(turnout_pct, 1)
    )

@router.get("/export-alumni")
async def export_alumni_csv(
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    db = get_db()
    school_id = current_user["school_id"]

    cursor = db.alumni.find({"school_id": school_id}).sort("passing_year", -1)
    alumni_list = await cursor.to_list(length=5000)

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Alumni ID", "Full Name", "Batch Year", "Admission Number", "Section",
        "Mobile", "Email", "Current City", "Profession", "Verification Status"
    ])

    for a in alumni_list:
        writer.writerow([
            str(a["_id"]),
            a.get("full_name", ""),
            a.get("passing_year", ""),
            a.get("admission_number", ""),
            a.get("section", ""),
            a.get("mobile", ""),
            a.get("email", ""),
            a.get("current_city", ""),
            a.get("profession", ""),
            a.get("verification_status", "")
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=alumni_roster.csv"}
    )

@router.get("/export-attendance/{event_id}")
async def export_event_attendance_csv(
    event_id: str,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "BATCH_COORDINATOR"]))
):
    db = get_db()
    school_id = current_user["school_id"]
    from bson import ObjectId

    cursor = db.event_attendance.find({"event_id": event_id})
    att_list = await cursor.to_list(length=5000)

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Alumni Name", "Batch Year", "Admission Number", "RSVP Status",
        "Adult Guests", "Child Guests", "Total Guests Expected", "Check-in Status", "Check-in Time"
    ])

    for att in att_list:
        alumni = await db.alumni.find_one({"_id": ObjectId(att["alumni_id"])})
        checkin = await db.checkins.find_one({"event_id": event_id, "alumni_id": att["alumni_id"]})

        writer.writerow([
            alumni.get("full_name", "Unknown") if alumni else "Unknown",
            alumni.get("passing_year", "") if alumni else "",
            alumni.get("admission_number", "") if alumni else "",
            att.get("rsvp_status", ""),
            att.get("adults_count", 1),
            att.get("children_count", 0),
            att.get("total_guests", 1),
            "Checked In" if checkin else "Not Checked In",
            checkin["checked_in_at"].strftime("%Y-%m-%d %I:%M %p") if checkin else ""
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=event_{event_id}_attendance.csv"}
    )
