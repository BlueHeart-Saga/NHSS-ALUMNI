import csv
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from app.core.database import get_db
from app.schemas.models import (
    UserProfileResponse, VerificationDecisionRequest, CSVImportResult, UpdateProfileRequest
)
from app.middleware.auth import get_current_user, require_roles

router = APIRouter(prefix="/alumni", tags=["Alumni Directory & Verification"])

@router.get("/pending", response_model=List[UserProfileResponse])
async def list_pending_verifications(
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "BATCH_COORDINATOR"]))
):
    db = get_db()
    cursor = db.alumni.find({"verification_status": "PENDING"}).sort("created_at", -1)
    pending = await cursor.to_list(length=200)

    res = []
    for a in pending:
        u_id = a.get("user_id")
        user = None
        if u_id:
            user = await db.users.find_one({"_id": u_id})
            if not user:
                try:
                    user = await db.users.find_one({"_id": ObjectId(u_id)})
                except Exception:
                    pass

        roles = user.get("roles", ["ALUMNI"]) if user else ["ALUMNI"]
        res.append(UserProfileResponse(
            id=str(a["_id"]),
            user_id=str(u_id) if u_id else "",
            school_id=str(a.get("school_id") or current_user.get("school_id") or ""),
            full_name=a.get("full_name") or "Alumni Applicant",
            mobile=a.get("mobile") or (user.get("mobile") if user else ""),
            email=a.get("email") or (user.get("email") if user else ""),
            profile_photo_url=a.get("profile_photo_url"),
            passing_year=a.get("passing_year", 2010),
            batch_id=str(a["batch_id"]) if a.get("batch_id") else None,
            admission_number=a.get("admission_number") or "N/A",
            section=a.get("section"),
            current_city=a.get("current_city"),
            profession=a.get("profession"),
            verification_status=a.get("verification_status", "PENDING"),
            verification_notes=a.get("verification_notes"),
            roles=roles,
            email_visible=a.get("email_visible", False),
            created_at=a.get("created_at", datetime.now(timezone.utc))
        ))
    return res

@router.post("/{alumni_id}/verify")
async def verify_alumni(
    alumni_id: str,
    request: VerificationDecisionRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    db = get_db()
    school_id = current_user.get("school_id")

    query = {}
    try:
        query = {"_id": ObjectId(alumni_id)}
    except Exception:
        query = {"_id": alumni_id}

    alumni = await db.alumni.find_one(query)
    if not alumni:
        raise HTTPException(status_code=404, detail="Alumni application not found")

    now = datetime.now(timezone.utc)
    update_data = {
        "verification_status": request.status,
        "verification_notes": request.notes or f"Marked {request.status} by admin",
        "verified_by": current_user["user_id"],
        "verified_at": now
    }

    await db.alumni.update_one({"_id": ObjectId(alumni_id)}, {"$set": update_data})

    # Log audit
    await db.audit_logs.insert_one({
        "school_id": school_id,
        "user_id": current_user["user_id"],
        "action": f"ALUMNI_{request.status}",
        "resource_type": "alumni",
        "resource_id": alumni_id,
        "metadata": {"previous": alumni.get("verification_status"), "new": request.status},
        "timestamp": now
    })

    return {"success": True, "message": f"Alumni application status updated to {request.status}"}

@router.post("/{alumni_id}/suspend")
async def suspend_alumni(
    alumni_id: str,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    db = get_db()
    school_id = current_user["school_id"]

    await db.alumni.update_one(
        {"_id": ObjectId(alumni_id), "school_id": school_id},
        {"$set": {"verification_status": "SUSPENDED"}}
    )

    return {"success": True, "message": "Alumni profile has been suspended"}

# Global in-memory storage for last CSV import error details
LAST_CSV_ERRORS: List[dict] = []

@router.post("/import-csv", response_model=CSVImportResult)
async def import_alumni_csv(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    global LAST_CSV_ERRORS
    LAST_CSV_ERRORS = []

    db = get_db()
    school_id = current_user["school_id"]

    content = await file.read()
    decoded = content.decode("utf-8-sig", errors="ignore")
    reader = csv.DictReader(io.StringIO(decoded))

    total = 0
    imported = 0
    matched = 0
    duplicates_flagged = 0
    errors = []
    error_details = []

    for row in reader:
        total += 1
        name = (row.get("Name") or row.get("full_name") or "").strip()
        batch_year = (row.get("Batch") or row.get("passing_year") or "").strip()
        admission = (row.get("Admission Number") or row.get("admission_number") or "").strip()
        mobile = (row.get("Mobile") or row.get("mobile") or "").strip()
        email = (row.get("Email") or row.get("email") or "").strip()
        section = (row.get("Section") or row.get("section") or "A").strip()
        city = (row.get("City") or row.get("city") or "").strip()
        profession = (row.get("Profession") or row.get("profession") or "").strip()

        if not name or not batch_year:
            err_msg = "Missing required Name or Batch"
            errors.append(f"Row {total}: {err_msg}")
            error_details.append({"row": total, "data": dict(row), "reason": err_msg})
            continue

        try:
            year_int = int(batch_year)
            
            # Check for existing duplicate records by mobile, email, or admission_number
            dup_query = []
            if mobile: dup_query.append({"mobile": mobile})
            if email: dup_query.append({"email": email})
            if admission: dup_query.append({"admission_number": admission})

            existing = await db.alumni.find_one({
                "school_id": school_id,
                "$or": dup_query
            }) if dup_query else None

            if existing:
                if existing.get("verification_status") == "PENDING":
                    # Auto-verify existing pending application
                    await db.alumni.update_one(
                        {"_id": existing["_id"]},
                        {"$set": {
                            "verification_status": "APPROVED",
                            "verification_notes": "Auto-verified via school roster CSV import",
                            "verified_at": datetime.now(timezone.utc)
                        }}
                    )
                    matched += 1
                else:
                    # Flag as duplicate for admin review
                    duplicates_flagged += 1
                    errors.append(f"Row {total}: Flagged duplicate record for {name} ({mobile or admission})")
                    error_details.append({"row": total, "data": dict(row), "reason": "Duplicate record matched existing verified alumnus"})
            else:
                # Insert pre-approved alumnus record
                await db.alumni.insert_one({
                    "school_id": school_id,
                    "user_id": None,
                    "full_name": name,
                    "mobile": mobile or f"+9190000{total:05d}",
                    "email": email or f"alumni_{total}@abcschool.edu",
                    "passing_year": year_int,
                    "admission_number": admission or f"CSV-{year_int}-{total:03d}",
                    "section": section,
                    "current_city": city,
                    "profession": profession,
                    "verification_status": "APPROVED",
                    "verification_notes": "Uploaded via CSV school roster",
                    "created_at": datetime.now(timezone.utc)
                })
                imported += 1
        except Exception as e:
            err_msg = str(e)
            errors.append(f"Row {total}: {err_msg}")
            error_details.append({"row": total, "data": dict(row), "reason": err_msg})

    LAST_CSV_ERRORS = error_details

    return CSVImportResult(
        total_rows=total,
        imported=imported,
        matched_and_approved=matched,
        duplicates_flagged=duplicates_flagged,
        skipped=len(error_details),
        errors=errors[:15],
        error_details=error_details[:15]
    )

@router.get("/export-import-errors")
async def export_import_errors_csv(
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["Row Number", "Name", "Batch", "Admission Number", "Mobile", "Email", "Error Reason"])

    for item in LAST_CSV_ERRORS:
        data = item.get("data", {})
        writer.writerow([
            item.get("row"),
            data.get("Name") or data.get("full_name", ""),
            data.get("Batch") or data.get("passing_year", ""),
            data.get("Admission Number") or data.get("admission_number", ""),
            data.get("Mobile") or data.get("mobile", ""),
            data.get("Email") or data.get("email", ""),
            item.get("reason", "")
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=csv_import_errors.csv"}
    )

@router.get("/directory", response_model=List[UserProfileResponse])
async def search_directory(
    search: Optional[str] = Query(None),
    batch_year: Optional[int] = Query(None),
    status: Optional[str] = Query("APPROVED"),
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    school_id = current_user["school_id"]

    query = {"school_id": school_id}

    if status and status != "ALL":
        query["verification_status"] = status

    if batch_year:
        query["passing_year"] = batch_year

    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"admission_number": {"$regex": search, "$options": "i"}},
            {"current_city": {"$regex": search, "$options": "i"}},
            {"profession": {"$regex": search, "$options": "i"}}
        ]

    cursor = db.alumni.find(query).sort("full_name", 1)
    alumni_list = await cursor.to_list(length=300)

    is_admin = "SCHOOL_ADMIN" in current_user["roles"]

    res = []
    for a in alumni_list:
        res.append(UserProfileResponse(
            id=str(a["_id"]),
            user_id=str(a.get("user_id", "")),
            school_id=school_id,
            full_name=a["full_name"],
            mobile=a["mobile"] if a.get("email_visible") or is_admin else "***",
            email=a["email"] if a.get("email_visible") or is_admin else "***",
            profile_photo_url=a.get("profile_photo_url"),
            passing_year=a["passing_year"],
            batch_id=str(a["batch_id"]) if a.get("batch_id") else None,
            admission_number=a.get("admission_number", ""),
            section=a.get("section"),
            current_city=a.get("current_city"),
            profession=a.get("profession"),
            verification_status=a.get("verification_status", "APPROVED"),
            roles=["ALUMNI"],
            email_visible=a.get("email_visible", False),
            created_at=a.get("created_at", datetime.now(timezone.utc))
        ))
    return res

@router.put("/profile", response_model=UserProfileResponse)
async def update_own_profile(
    request: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    school_id = current_user["school_id"]
    user_id = current_user["user_id"]

    update_fields = {k: v for k, v in request.model_dump().items() if v is not None}
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    await db.alumni.update_one({"user_id": user_id, "school_id": school_id}, {"$set": update_fields})
    alumni = await db.alumni.find_one({"user_id": user_id})

    return UserProfileResponse(
        id=str(alumni["_id"]),
        user_id=user_id,
        school_id=school_id,
        full_name=alumni["full_name"],
        mobile=alumni["mobile"],
        email=alumni["email"],
        profile_photo_url=alumni.get("profile_photo_url"),
        passing_year=alumni["passing_year"],
        batch_id=str(alumni["batch_id"]) if alumni.get("batch_id") else None,
        admission_number=alumni.get("admission_number", ""),
        section=alumni.get("section"),
        current_city=alumni.get("current_city"),
        profession=alumni.get("profession"),
        verification_status=alumni.get("verification_status", "APPROVED"),
        roles=current_user["roles"],
        email_visible=alumni.get("email_visible", False),
        created_at=alumni.get("created_at", datetime.now(timezone.utc))
    )
