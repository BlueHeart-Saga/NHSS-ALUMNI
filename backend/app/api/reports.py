import csv
import io
from fastapi import APIRouter, Depends, HTTPException, Response
from app.core.database import get_db
from app.schemas.models import DashboardReportResponse
from app.middleware.auth import require_roles

from bson import ObjectId

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

async def build_school_filter(school_id: str = None):
    if not school_id or str(school_id).strip() in ["None", "undefined", "null", ""]:
        return {}

    db = get_db()
    s_str = str(school_id).strip()
    target_ids = [s_str]
    try:
        target_ids.append(ObjectId(s_str))
    except Exception:
        pass

    school_or = [{"code": s_str}]
    if ObjectId.is_valid(s_str):
        school_or.append({"_id": ObjectId(s_str)})
    else:
        school_or.append({"_id": s_str})

    school = await db.schools.find_one({"$or": school_or})
    if school:
        s_id_str = str(school["_id"])
        s_id_obj = school["_id"]
        s_code = school.get("code")
        for val in [s_id_str, s_id_obj, s_code]:
            if val and val not in target_ids:
                target_ids.append(val)

    return {"school_id": {"$in": target_ids}}

@router.get("/summary", response_model=DashboardReportResponse)
async def get_dashboard_summary(
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "BATCH_COORDINATOR", "SUPER_ADMIN", "DEVELOPER", "PLATFORM_DEVELOPER"]))
):
    db = get_db()
    school_id = current_user.get("school_id")
    base_filter = await build_school_filter(school_id)

    # 1. Single aggregation pipeline on db.alumni to aggregate status counts without session explosion
    alumni_pipeline = []
    if base_filter:
        alumni_pipeline.append({"$match": base_filter})
    alumni_pipeline.append({
        "$group": {
            "_id": "$verification_status",
            "count": {"$sum": 1}
        }
    })

    alumni_counts = await db.alumni.aggregate(alumni_pipeline).to_list(length=100)

    total_alumni = 0
    verified_alumni = 0
    pending_alumni = 0

    for item in alumni_counts:
        status_val = item.get("_id")
        cnt = item.get("count", 0)
        total_alumni += cnt
        if status_val in ["APPROVED", "VERIFIED"]:
            verified_alumni += cnt
        elif status_val == "PENDING":
            pending_alumni += cnt

    # 2. Sequential count queries to prevent session overflow on Cosmos DB
    batch_query = {**base_filter}
    batch_query["$or"] = [{"status": "ACTIVE"}, {"status": {"$exists": False}}, {"status": None}]

    events_query = dict(base_filter)
    checkins_query = dict(base_filter)

    active_batches = await db.batches.count_documents(batch_query)
    upcoming_events = await db.events.count_documents(events_query)
    recent_checkins = await db.checkins.count_documents(checkins_query)

    turnout_pct = (recent_checkins / verified_alumni * 100) if verified_alumni > 0 else (100.0 if recent_checkins > 0 else 0.0)

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
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "SUPER_ADMIN", "DEVELOPER", "PLATFORM_DEVELOPER"]))
):
    db = get_db()
    school_id = current_user.get("school_id")
    filter_query = await build_school_filter(school_id)

    cursor = db.alumni.find(filter_query).sort("passing_year", -1)
    alumni_list = await cursor.to_list(length=10000)

    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL, lineterminator="\r\n")

    # Complete 44-column Header matching all editable spreadsheet & profile fields
    writer.writerow([
        "Alumni ID",
        "Full Name",
        "Name in Tamil",
        "Mobile Number",
        "Country Code",
        "Gender",
        "Date of Birth",
        "Email",
        "Blood Group",
        "Father Name",
        "Mother Name",
        "Current City",
        "Current State",
        "Address",
        "Country",
        "School Name",
        "Joining Year",
        "Passing Year",
        "Leaving Class",
        "Admission Number",
        "Roll No",
        "Section",
        "No Higher Ed",
        "College Name",
        "Degree",
        "Custom Degree",
        "Department",
        "College Reg No",
        "College Joining Yr",
        "College Passing Yr",
        "Employment Status",
        "Company Name",
        "Designation",
        "Industry",
        "Total Experience",
        "Skills",
        "LinkedIn URL",
        "Instagram URL",
        "WhatsApp Number",
        "Website URL",
        "Profile Photo URL",
        "Is Volunteer",
        "Willing to Donate",
        "Verification Status"
    ])

    def excel_safe_text(value) -> str:
        """Wrap string values in an Excel ="..." formula so Excel treats them as TEXT.
        This prevents long numeric/hex strings (like MongoDB ObjectIds and mobile
        numbers with + country code) from being converted into scientific notation.
        Internal double quotes are escaped by doubling them.
        """
        if value is None:
            return ""
        s = str(value)
        if s == "":
            return ""
        escaped = s.replace('"', '""')
        return f'="{escaped}"'

    for a in alumni_list:
        raw_id = str(a.get("_id", ""))
        raw_mobile = a.get("mobile", "") or ""
        raw_country_code = a.get("country_code", "") or "91"
        raw_adm_no = a.get("admission_number", "") or ""
        raw_roll_no = a.get("roll_no", "") or ""
        raw_college_reg = a.get("college_register_no") or a.get("register_number") or ""
        raw_whatsapp = a.get("whatsapp_number", "") or ""

        # Skills list or string
        skills_val = a.get("skills", "")
        if isinstance(skills_val, list):
            skills_str = ", ".join(str(s) for s in skills_val if s)
        else:
            skills_str = str(skills_val) if skills_val is not None else ""

        # Higher education flag
        no_high_ed = a.get("no_higher_education")
        if isinstance(no_high_ed, bool):
            no_high_ed_str = "YES" if no_high_ed else "NO"
        else:
            no_high_ed_str = str(no_high_ed).strip().upper() if no_high_ed else "NO"

        writer.writerow([
            excel_safe_text(raw_id),
            a.get("full_name", ""),
            a.get("name_ta") or a.get("full_name_ta", ""),
            excel_safe_text(raw_mobile) if raw_mobile else "",
            str(raw_country_code),
            a.get("gender", ""),
            a.get("date_of_birth") or a.get("dob", ""),
            a.get("email", ""),
            a.get("blood_group", ""),
            a.get("father_name", ""),
            a.get("mother_name", ""),
            a.get("current_city", ""),
            a.get("current_state") or a.get("state", ""),
            a.get("address", ""),
            a.get("country", "India"),
            a.get("school_name", ""),
            a.get("joining_year") or a.get("admission_year") or "",
            a.get("passing_year", ""),
            a.get("leaving_class", ""),
            excel_safe_text(raw_adm_no) if raw_adm_no else "",
            excel_safe_text(raw_roll_no) if raw_roll_no else "",
            a.get("section", ""),
            no_high_ed_str,
            a.get("college_name") or a.get("institution_name", ""),
            a.get("degree", ""),
            a.get("custom_degree") or a.get("other_degree", ""),
            a.get("department") or a.get("stream", ""),
            excel_safe_text(raw_college_reg) if raw_college_reg else "",
            a.get("college_joining_year") or "",
            a.get("college_passing_year") or "",
            a.get("employment_status", ""),
            a.get("company_name") or a.get("company", ""),
            a.get("profession") or a.get("designation") or a.get("position", ""),
            a.get("industry", ""),
            a.get("total_experience") or a.get("experience_years", ""),
            skills_str,
            a.get("linkedin_url", ""),
            a.get("instagram_url", ""),
            excel_safe_text(raw_whatsapp) if raw_whatsapp else "",
            a.get("website_url", ""),
            a.get("profile_photo_url", ""),
            a.get("is_volunteer", "NO"),
            a.get("willing_to_donate", "NO"),
            a.get("verification_status", "APPROVED")
        ])

    # Prepend UTF-8 BOM so Microsoft Excel detects UTF-8 and renders Tamil correctly
    csv_data = "\ufeff" + output.getvalue()

    return Response(
        content=csv_data.encode("utf-8"),
        media_type="text/csv; charset=utf-8",
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
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL, lineterminator="\r\n")

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

    # Prepend UTF-8 BOM for Excel compatibility
    csv_data = "\ufeff" + output.getvalue()

    return Response(
        content=csv_data.encode("utf-8"),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f"attachment; filename=event_{event_id}_attendance.csv"}
    )