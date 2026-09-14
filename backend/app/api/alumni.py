import csv
import io
import asyncio
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import Response
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime, timezone
from bson import ObjectId
from app.core.database import get_db
from app.core.config import settings
from app.services.email import send_alumni_verified_email
from app.schemas.models import (
    UserProfileResponse, VerificationDecisionRequest, CSVImportResult, UpdateProfileRequest
)
from app.middleware.auth import get_current_user, require_roles

router = APIRouter(prefix="/alumni", tags=["Alumni Directory & Verification"])

@router.get("/pending", response_model=List[UserProfileResponse])
async def list_pending_verifications(
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "BATCH_COORDINATOR", "SUPER_ADMIN", "DEVELOPER", "PLATFORM_DEVELOPER"]))
):
    db = get_db()
    query = {"verification_status": "PENDING"}
    school_id = current_user.get("school_id")
    if school_id and str(school_id).strip() not in ["None", "undefined", "null", ""]:
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

        query["school_id"] = {"$in": target_ids}

    cursor = db.alumni.find(query).sort("created_at", -1)
    pending = await cursor.to_list(length=200)

    # Batch fetch all matching users in 1 single DB query (Fix N+1 query loop)
    user_ids = []
    for a in pending:
        u_id = a.get("user_id")
        if u_id:
            try:
                user_ids.append(ObjectId(u_id))
            except Exception:
                user_ids.append(u_id)

    users_map = {}
    if user_ids:
        users_list = await db.users.find({"_id": {"$in": user_ids}}).to_list(length=len(user_ids))
        for u in users_list:
            users_map[str(u["_id"])] = u

    res = []
    for a in pending:
        u_id = str(a.get("user_id", ""))
        user = users_map.get(u_id)

        roles = user.get("roles", ["ALUMNI"]) if user else ["ALUMNI"]
        res.append(UserProfileResponse(
            id=str(a["_id"]),
            user_id=u_id,
            school_id=str(a.get("school_id") or current_user.get("school_id") or ""),
            full_name=a.get("full_name") or (user.get("full_name") if user else "Alumni Applicant"),
            mobile=a.get("mobile") or (user.get("mobile") if user else ""),
            email=a.get("email") or (user.get("email") if user else ""),
            profile_photo_url=a.get("profile_photo_url") or (user.get("profile_photo_url") if user else None),
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

    try:
        await db.alumni.update_one({"_id": ObjectId(alumni_id)}, {"$set": update_data})
    except Exception:
        await db.alumni.update_one({"_id": alumni_id}, {"$set": update_data})

    # Dispatch Email Notification asynchronously on Approval
    if request.status == "APPROVED" and alumni.get("email"):
        alumni_email = alumni["email"]
        alumni_name = alumni.get("full_name", "Alumnus")
        school_name = getattr(settings, "INITIAL_SCHOOL_NAME", "NHS SCHOOL")

        if school_id:
            try:
                s_doc = await db.schools.find_one({"_id": ObjectId(school_id)}) or await db.schools.find_one({"_id": school_id})
                if s_doc and s_doc.get("name"):
                    school_name = s_doc["name"]
            except Exception:
                pass

        asyncio.create_task(asyncio.to_thread(send_alumni_verified_email, alumni_email, alumni_name, school_name))

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
    school_id = current_user.get("school_id")

    filter_q = {"school_id": school_id} if school_id else {}
    try:
        filter_q["_id"] = ObjectId(alumni_id)
    except Exception:
        filter_q["_id"] = alumni_id

    await db.alumni.update_one(
        filter_q,
        {"$set": {"verification_status": "SUSPENDED"}}
    )

    return {"success": True, "message": "Alumni profile has been suspended"}

# Global in-memory storage for last CSV import error details
LAST_CSV_ERRORS: List[dict] = []

# --- CSV Import Configuration ---
EMPTY_CELL_MEANS_UNCHANGED = True
CLEAR_TOKEN = "__CLEAR__"

# Header alias map — case-insensitive. Values are canonical field names.
CSV_HEADER_ALIASES = {
    "alumni_id": ["alumni id", "alumni_id", "id", "alumniid", "_id"],
    "name": ["name", "full name", "full_name", "alumnus name", "alumni name"],
    "name_ta": ["name in tamil", "name_ta", "full_name_ta", "tamil name", "tamil_name"],
    "batch_year": ["batch", "batch year", "passing_year", "passing year", "year"],
    "admission_number": ["admission number", "admission_number", "admission no", "adm no"],
    "roll_no": ["roll no", "roll_no", "roll number", "roll_number"],
    "section": ["section", "sec"],
    "mobile": ["mobile", "mobile number", "mobile_number", "phone", "phone number", "contact"],
    "country_code": ["country code", "country_code", "countrycode"],
    "email": ["email", "email address", "email_address", "e-mail"],
    "gender": ["gender", "sex"],
    "date_of_birth": ["date of birth", "date_of_birth", "dob", "birth date"],
    "blood_group": ["blood group", "blood_group", "bloodgroup", "blood"],
    "father_name": ["father name", "father_name", "father's name"],
    "mother_name": ["mother name", "mother_name", "mother's name"],
    "is_volunteer": ["is volunteer", "is_volunteer", "volunteer"],
    "willing_to_donate": ["willing to donate", "willing_to_donate", "donor", "willing donor"],
    "address": ["address", "full address", "full_address", "residential address", "residential_address"],
    "current_city": ["current city", "current_city", "city", "town"],
    "current_state": ["current state", "current_state", "state", "province"],
    "country": ["country", "nation"],
    "school_name": ["school name", "school_name", "school"],
    "joining_year": ["joining year", "joining_year", "joining yr", "admission year", "admission_year"],
    "leaving_class": ["leaving class", "leaving_class", "class", "std", "standard"],
    "no_higher_education": ["no higher ed", "no_higher_education", "no higher education", "no_higher_ed"],
    "college_name": ["college name", "college_name", "college", "institution name", "institution_name", "university"],
    "degree": ["degree", "degree / course", "course", "qualification"],
    "custom_degree": ["custom degree", "custom_degree", "other degree", "other_degree"],
    "department": ["department", "stream", "dept", "branch"],
    "college_register_no": ["college reg no", "college_register_no", "college reg", "register number", "register_number"],
    "college_joining_year": ["college joining yr", "college joining year", "college_joining_year"],
    "college_passing_year": ["college passing yr", "college passing year", "college_passing_year"],
    "employment_status": ["employment status", "employment_status", "employment"],
    "company_name": ["company name", "company_name", "company", "employer", "organization"],
    "profession": ["designation", "profession", "designation / position", "position", "occupation", "job title", "title"],
    "industry": ["industry", "sector"],
    "total_experience": ["total experience", "total_experience", "experience", "experience_years"],
    "skills": ["skills", "skills & expertise", "skills and expertise"],
    "linkedin_url": ["linkedin url", "linkedin_url", "linkedin"],
    "instagram_url": ["instagram url", "instagram_url", "instagram"],
    "whatsapp_number": ["whatsapp number", "whatsapp_number", "whatsapp"],
    "website_url": ["website url", "website_url", "website", "portfolio"],
    "profile_photo_url": ["profile photo url", "profile_photo_url", "photo url", "photo", "avatar"],
    "verification_status": ["verification status", "verification_status", "status"],
}

# Fields that must NEVER be overwritten on an existing record (protected fields).
PROTECTED_FIELDS = {
    "_id", "user_id", "password", "password_hash",
    "created_at", "verified_by", "verified_at",
}


def _clean_cell(value) -> str:
    """Strip Excel '=\"...\"' text-forcing wrapper, BOM, and whitespace from a cell value."""
    if value is None:
        return ""
    s = str(value)
    if s.startswith('="') and s.endswith('"'):
        s = s[2:-1]
        s = s.replace('""', '"')
    if s.startswith("\ufeff"):
        s = s[1:]
    return s.strip()


def _normalize_row(raw_row: dict) -> dict:
    """Map CSV header names (case-insensitive, alias-aware) to canonical field names."""
    normalized = {}
    for k, v in raw_row.items():
        if k is None:
            continue
        key = str(k).lstrip("\ufeff").strip().lower()
        normalized[key] = _clean_cell(v)

    result = {}
    for canonical, aliases in CSV_HEADER_ALIASES.items():
        for alias in aliases:
            if alias in normalized:
                result[canonical] = normalized[alias]
                break
        else:
            result[canonical] = ""
    return result


def _resolve_cell_value(canonical_field: str, csv_value: str, existing_db_value):
    """
    Apply empty-cell policy.
    Returns the value to write, or None if the field should be left unchanged.
    """
    raw = (csv_value or "").strip()

    if raw == CLEAR_TOKEN:
        return ""

    if raw == "":
        if EMPTY_CELL_MEANS_UNCHANGED:
            return None
        else:
            return ""

    return raw


def _compute_field_updates(csv_row: dict, existing_doc: dict, batch_id) -> dict:
    """
    Given a normalized CSV row and the existing DB doc, return the dict of
    only the fields that actually changed across all 44 fields. Never touches PROTECTED_FIELDS.
    """
    updates = {}

    field_map = {
        "name":                 "full_name",
        "name_ta":              "name_ta",
        "batch_year":           "passing_year",
        "admission_number":     "admission_number",
        "roll_no":              "roll_no",
        "section":              "section",
        "mobile":               "mobile",
        "country_code":         "country_code",
        "email":                "email",
        "gender":               "gender",
        "date_of_birth":        "date_of_birth",
        "blood_group":          "blood_group",
        "father_name":          "father_name",
        "mother_name":          "mother_name",
        "is_volunteer":         "is_volunteer",
        "willing_to_donate":    "willing_to_donate",
        "address":              "address",
        "current_city":         "current_city",
        "current_state":        "current_state",
        "country":              "country",
        "school_name":          "school_name",
        "joining_year":         "joining_year",
        "leaving_class":        "leaving_class",
        "no_higher_education":  "no_higher_education",
        "college_name":         "college_name",
        "degree":               "degree",
        "custom_degree":        "custom_degree",
        "department":           "department",
        "college_register_no":  "college_register_no",
        "college_joining_year": "college_joining_year",
        "college_passing_year": "college_passing_year",
        "employment_status":    "employment_status",
        "company_name":         "company_name",
        "profession":           "profession",
        "industry":             "industry",
        "total_experience":     "total_experience",
        "skills":               "skills",
        "linkedin_url":         "linkedin_url",
        "instagram_url":        "instagram_url",
        "whatsapp_number":      "whatsapp_number",
        "website_url":          "website_url",
        "profile_photo_url":    "profile_photo_url",
        "verification_status":  "verification_status",
    }

    for csv_key, db_field in field_map.items():
        if db_field in PROTECTED_FIELDS:
            continue
        raw = (csv_row.get(csv_key) or "").strip()

        new_val = _resolve_cell_value(csv_key, raw, existing_doc.get(db_field))
        if new_val is None:
            continue

        if db_field in ("passing_year", "joining_year", "college_joining_year", "college_passing_year"):
            try:
                new_val = int(float(new_val))
            except (ValueError, TypeError):
                continue
        elif db_field in ("is_volunteer", "willing_to_donate"):
            new_val = "YES" if str(new_val).strip().upper() in ("YES", "TRUE", "1") else "NO"
        elif db_field == "no_higher_education":
            new_val = "YES" if str(new_val).strip().upper() in ("YES", "TRUE", "1") else "NO"
        elif db_field == "verification_status":
            new_val = str(new_val).strip().upper()
            if new_val not in ("APPROVED", "PENDING", "SUSPENDED", "REJECTED"):
                continue

        existing_val = existing_doc.get(db_field)
        if existing_val is None:
            existing_val = ""
        if isinstance(existing_val, (int, float)) and isinstance(new_val, (int, float)):
            if existing_val == new_val:
                continue
        elif db_field == "skills":
            existing_skills_str = ", ".join(existing_val) if isinstance(existing_val, list) else str(existing_val or "")
            if existing_skills_str.strip() == str(new_val).strip():
                continue
        else:
            if str(existing_val).strip() == str(new_val).strip():
                continue

        updates[db_field] = new_val

        # Companion field syncs to ensure full compatibility across web, admin, and mobile views
        if db_field == "name_ta":
            updates["full_name_ta"] = new_val
        elif db_field == "date_of_birth":
            updates["dob"] = new_val
        elif db_field == "current_state":
            updates["state"] = new_val
        elif db_field == "joining_year":
            updates["admission_year"] = new_val
        elif db_field == "college_name":
            updates["institution_name"] = new_val
        elif db_field == "department":
            updates["stream"] = new_val
        elif db_field == "custom_degree":
            updates["other_degree"] = new_val
        elif db_field == "college_register_no":
            updates["register_number"] = new_val
        elif db_field == "company_name":
            updates["company"] = new_val
        elif db_field == "profession":
            updates["designation"] = new_val
            updates["position"] = new_val
        elif db_field == "total_experience":
            updates["experience_years"] = new_val
        elif db_field == "skills":
            if isinstance(new_val, str):
                updates["skills"] = [s.strip() for s in new_val.split(",") if s.strip()]

    if batch_id is not None and existing_doc.get("batch_id") != batch_id:
        updates["batch_id"] = batch_id

    return updates


def _build_alumni_doc(row: dict, school_id: str, batch_id, oid: ObjectId) -> dict:
    """Build a complete alumni document containing all 44 fields for CSV creation."""
    name = (row.get("name") or "").strip()
    batch_year_raw = (row.get("batch_year") or "").strip()
    try:
        passing_year = int(float(batch_year_raw))
    except (ValueError, TypeError):
        passing_year = datetime.now(timezone.utc).year

    def to_int_or_none(val):
        if not val:
            return None
        try:
            return int(float(val))
        except (ValueError, TypeError):
            return None

    skills_raw = (row.get("skills") or "").strip()
    skills_list = [s.strip() for s in skills_raw.split(",") if s.strip()] if skills_raw else []

    name_ta = (row.get("name_ta") or "").strip()
    dob = (row.get("date_of_birth") or "").strip()
    state = (row.get("current_state") or "").strip()
    college_name = (row.get("college_name") or "").strip()
    dept = (row.get("department") or "").strip()
    custom_degree = (row.get("custom_degree") or "").strip()
    college_reg = (row.get("college_register_no") or "").strip()
    company = (row.get("company_name") or "").strip()
    profession = (row.get("profession") or "").strip()
    exp = (row.get("total_experience") or "").strip()
    no_higher = "YES" if (row.get("no_higher_education") or "").strip().upper() in ("YES", "TRUE", "1") else "NO"

    status_raw = (row.get("verification_status") or "").strip().upper()
    verification_status = status_raw if status_raw in ("APPROVED", "PENDING", "SUSPENDED", "REJECTED") else "APPROVED"

    adm_no = (row.get("admission_number") or "").strip()
    roll_no = (row.get("roll_no") or "").strip()

    return {
        "_id": oid,
        "school_id": school_id,
        "batch_id": batch_id,
        "full_name": name,
        "name_ta": name_ta,
        "full_name_ta": name_ta,
        "mobile": (row.get("mobile") or "").strip(),
        "country_code": (row.get("country_code") or "91").strip(),
        "gender": (row.get("gender") or "Male").strip(),
        "date_of_birth": dob,
        "dob": dob,
        "email": (row.get("email") or "").strip(),
        "blood_group": (row.get("blood_group") or "").strip(),
        "father_name": (row.get("father_name") or "").strip(),
        "mother_name": (row.get("mother_name") or "").strip(),
        "current_city": (row.get("current_city") or "").strip(),
        "current_state": state,
        "state": state,
        "address": (row.get("address") or "").strip(),
        "country": (row.get("country") or "India").strip(),
        "school_name": (row.get("school_name") or "Natarajan Higher Secondary School").strip(),
        "joining_year": to_int_or_none(row.get("joining_year")),
        "admission_year": to_int_or_none(row.get("joining_year")),
        "passing_year": passing_year,
        "leaving_class": (row.get("leaving_class") or "").strip(),
        "admission_number": adm_no,
        "roll_no": roll_no,
        "section": (row.get("section") or "A").strip(),
        "no_higher_education": no_higher,
        "college_name": college_name,
        "institution_name": college_name,
        "degree": (row.get("degree") or "").strip(),
        "custom_degree": custom_degree,
        "other_degree": custom_degree,
        "department": dept,
        "stream": dept,
        "college_register_no": college_reg,
        "register_number": college_reg,
        "college_joining_year": to_int_or_none(row.get("college_joining_year")),
        "college_passing_year": to_int_or_none(row.get("college_passing_year")),
        "employment_status": (row.get("employment_status") or "").strip(),
        "company_name": company,
        "company": company,
        "profession": profession,
        "designation": profession,
        "position": profession,
        "industry": (row.get("industry") or "").strip(),
        "total_experience": exp,
        "experience_years": exp,
        "skills": skills_list,
        "linkedin_url": (row.get("linkedin_url") or "").strip(),
        "instagram_url": (row.get("instagram_url") or "").strip(),
        "whatsapp_number": (row.get("whatsapp_number") or "").strip(),
        "website_url": (row.get("website_url") or "").strip(),
        "profile_photo_url": (row.get("profile_photo_url") or "").strip(),
        "is_volunteer": "YES" if (row.get("is_volunteer") or "").strip().upper() in ("YES", "TRUE", "1") else "NO",
        "willing_to_donate": "YES" if (row.get("willing_to_donate") or "").strip().upper() in ("YES", "TRUE", "1") else "NO",
        "verification_status": verification_status,
        "created_at": datetime.now(timezone.utc)
    }


def _is_valid_objectid_hex(s: str) -> bool:
    """A valid MongoDB ObjectId hex string is exactly 24 hex characters."""
    if not s or len(s) != 24:
        return False
    return all(c in "0123456789abcdefABCDEF" for c in s)


def _looks_like_excel_corruption(s: str) -> bool:
    """Detect values that Excel's autoformat has clearly mangled."""
    if not s:
        return False
    upper = s.upper()
    # Scientific notation, e.g. "6.6E+23", "9.18E+11"
    if "E+" in upper or "E-" in upper:
        return True
    # Decimal point in a value that should be a hex integer
    if "." in s:
        return True
    return False


@router.post("/import-csv", response_model=CSVImportResult)
async def import_alumni_csv(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    global LAST_CSV_ERRORS
    LAST_CSV_ERRORS = []

    db = get_db()
    school_id = current_user.get("school_id") or "PLATFORM"

    content = await file.read()
    decoded = content.decode("utf-8-sig", errors="ignore")
    reader = csv.DictReader(io.StringIO(decoded))

    total = 0
    created = 0
    updated = 0
    unchanged = 0
    matched = 0
    duplicates_flagged = 0
    failed = 0
    errors = []
    error_details = []

    for raw_row in reader:
        total += 1
        row = _normalize_row(raw_row)

        alumni_id_raw = (row.get("alumni_id") or "").strip()
        name = (row.get("name") or "").strip()
        batch_year = (row.get("batch_year") or "").strip()

        # -------- CASE A: Alumni ID present --------
        if alumni_id_raw:
            # --- Excel-corruption guard ---
            # Excel silently converts hex IDs into scientific notation (e.g. "6.6E+23")
            # or truncated decimal strings. A valid MongoDB ObjectId is exactly
            # 24 hex characters. If the value looks mangled, refuse the row rather
            # than creating a duplicate that bypasses the intended UPDATE path.
            if _looks_like_excel_corruption(alumni_id_raw) or not _is_valid_objectid_hex(alumni_id_raw):
                err_msg = (
                    f"Alumni ID appears corrupted by Excel: '{alumni_id_raw}'. "
                    f"Re-export the CSV and do NOT open it in Excel before importing. "
                    f"(Expected 24-character hex string.)"
                )
                errors.append(f"Row {total}: {err_msg}")
                error_details.append({"row": total, "data": dict(raw_row), "reason": err_msg})
                failed += 1
                continue

            try:
                oid = ObjectId(alumni_id_raw)
            except Exception:
                err_msg = f"Invalid Alumni ID format: {alumni_id_raw}"
                errors.append(f"Row {total}: {err_msg}")
                error_details.append({"row": total, "data": dict(raw_row), "reason": err_msg})
                failed += 1
                continue

            existing = await db.alumni.find_one({
                "_id": oid,
                "school_id": school_id
            })
            if existing is None:
                # ID provided but not found in this school — create with that exact ID.
                if not name or not batch_year:
                    err_msg = f"Alumni ID {alumni_id_raw} not found; also missing Name/Batch to create."
                    errors.append(f"Row {total}: {err_msg}")
                    error_details.append({"row": total, "data": dict(raw_row), "reason": err_msg})
                    failed += 1
                    continue
                try:
                    year_int = int(float(batch_year))
                except (ValueError, TypeError):
                    err_msg = f"Invalid Batch year: {batch_year}"
                    errors.append(f"Row {total}: {err_msg}")
                    error_details.append({"row": total, "data": dict(raw_row), "reason": err_msg})
                    failed += 1
                    continue

                batch = await db.batches.find_one({"school_id": school_id, "passing_year": year_int})
                if not batch:
                    b_res = await db.batches.insert_one({
                        "school_id": school_id,
                        "name": f"Batch of {year_int}",
                        "passing_year": year_int,
                        "created_at": datetime.now(timezone.utc)
                    })
                    batch_id = b_res.inserted_id
                else:
                    batch_id = batch["_id"]

                # user_id intentionally OMITTED for pre-imported roster records.
                # The unique index on user_id is sparse, so multiple alumni
                # without a linked user account are allowed.
                new_doc = _build_alumni_doc(row, school_id, batch_id, oid)
                new_doc["verification_notes"] = "Uploaded via CSV (with explicit Alumni ID)"
                await db.alumni.insert_one(new_doc)
                created += 1
                continue
            else:
                # UPDATE path
                batch_id_for_update = None
                if batch_year:
                    try:
                        year_int = int(float(batch_year))
                        batch = await db.batches.find_one({"school_id": school_id, "passing_year": year_int})
                        if not batch:
                            b_res = await db.batches.insert_one({
                                "school_id": school_id,
                                "name": f"Batch of {year_int}",
                                "passing_year": year_int,
                                "created_at": datetime.now(timezone.utc)
                            })
                            batch_id_for_update = b_res.inserted_id
                        else:
                            batch_id_for_update = batch["_id"]
                    except (ValueError, TypeError):
                        batch_id_for_update = None

                field_updates = _compute_field_updates(row, existing, batch_id_for_update)

                if existing.get("verification_status") == "PENDING" and "verification_status" not in field_updates:
                    field_updates["verification_status"] = "APPROVED"
                    field_updates["verification_notes"] = "Auto-verified via CSV import (existing ID)"
                    field_updates["verified_at"] = datetime.now(timezone.utc)
                    matched += 1

                if not field_updates:
                    unchanged += 1
                    continue

                field_updates["updated_at"] = datetime.now(timezone.utc)
                await db.alumni.update_one({"_id": oid}, {"$set": field_updates})
                updated += 1
                continue

        # -------- CASE B: No Alumni ID, but Name + Batch present --------
        if not name or not batch_year:
            err_msg = "Missing required Name or Batch (and no Alumni ID provided)"
            errors.append(f"Row {total}: {err_msg}")
            error_details.append({"row": total, "data": dict(raw_row), "reason": err_msg})
            failed += 1
            continue

        try:
            year_int = int(float(batch_year))
        except (ValueError, TypeError):
            err_msg = f"Invalid Batch year: {batch_year}"
            errors.append(f"Row {total}: {err_msg}")
            error_details.append({"row": total, "data": dict(raw_row), "reason": err_msg})
            failed += 1
            continue

        try:
            batch = await db.batches.find_one({"school_id": school_id, "passing_year": year_int})
            if not batch:
                b_res = await db.batches.insert_one({
                    "school_id": school_id,
                    "name": f"Batch of {year_int}",
                    "passing_year": year_int,
                    "created_at": datetime.now(timezone.utc)
                })
                batch_id = b_res.inserted_id
            else:
                batch_id = batch["_id"]

            new_oid = ObjectId()
            # user_id intentionally OMITTED — sparse unique index allows it.
            new_doc = _build_alumni_doc(row, school_id, batch_id, new_oid)
            if not new_doc["admission_number"]:
                new_doc["admission_number"] = f"CSV-{year_int}-{total:03d}"
            new_doc["verification_notes"] = "Uploaded via CSV (no Alumni ID provided)"
            await db.alumni.insert_one(new_doc)
            created += 1
        except Exception as e:
            err_msg = str(e)
            errors.append(f"Row {total}: {err_msg}")
            error_details.append({"row": total, "data": dict(raw_row), "reason": err_msg})
            failed += 1

    LAST_CSV_ERRORS = error_details

    return CSVImportResult(
        total_rows=total,
        imported=created,
        matched_and_approved=matched,
        duplicates_flagged=duplicates_flagged,
        skipped=failed,
        updated=updated,
        unchanged=unchanged,
        created=created,
        failed=failed,
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
    school_id = current_user.get("school_id")

    query = {}
    if school_id:
        query["school_id"] = school_id

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

    cursor = db.alumni.find(
    query,
    {
        # Exclude the giant base64 photo from the listing response.
        # The photo will be fetched separately via /alumni/{id}/photo.
        "profile_photo_url": 0,
    }
).sort("full_name", 1)
    alumni_list = await cursor.to_list(length=5000)

    is_admin = any(r in current_user.get("roles", []) for r in ["SCHOOL_ADMIN", "PRIMARY_DEVELOPER", "SUPER_ADMIN"])

    res = []
    for a in alumni_list:
        res.append(UserProfileResponse(
            id=str(a["_id"]),
            user_id=str(a.get("user_id", "")),
            school_id=str(a.get("school_id") or school_id or ""),
            full_name=a.get("full_name", "Alumnus"),
            name_ta=a.get("name_ta") or a.get("full_name_ta"),
            full_name_ta=a.get("full_name_ta") or a.get("name_ta"),
            mobile=a.get("mobile", "") if a.get("email_visible") or is_admin else "***",
            country_code=a.get("country_code") or "91",
            gender=a.get("gender"),
            date_of_birth=a.get("date_of_birth") or a.get("dob"),
            dob=a.get("dob") or a.get("date_of_birth"),
            blood_group=a.get("blood_group"),
            father_name=a.get("father_name"),
            mother_name=a.get("mother_name"),
            address=a.get("address"),
            current_city=a.get("current_city") or a.get("city"),
            state=a.get("state") or a.get("current_state"),
            current_state=a.get("current_state") or a.get("state"),
            country=a.get("country") or "India",
            school_name=a.get("school_name"),
            joining_year=a.get("joining_year") or a.get("admission_year"),
            admission_year=a.get("admission_year") or a.get("joining_year"),
            passing_year=int(a["passing_year"]) if a.get("passing_year") and str(a["passing_year"]).isdigit() else (a.get("passing_year") or 2010),
            leaving_class=str(a["leaving_class"]) if a.get("leaving_class") is not None else None,
            admission_number=str(a.get("admission_number") or a.get("roll_no") or ""),
            roll_no=str(a.get("roll_no") or a.get("admission_number") or "") if (a.get("roll_no") or a.get("admission_number")) is not None else None,
            section=str(a["section"]) if a.get("section") is not None else None,
            no_higher_education=(
                "YES" if a.get("no_higher_education") in [True, "YES", "yes", "true", "True"]
                else ("NO" if a.get("no_higher_education") in [False, "NO", "no", "false", "False"]
                else (str(a.get("no_higher_education")) if a.get("no_higher_education") is not None else "NO"))
            ),
            college_name=a.get("college_name") or a.get("institution_name"),
            institution_name=a.get("institution_name") or a.get("college_name"),
            degree=a.get("degree"),
            custom_degree=a.get("custom_degree"),
            department=a.get("department") or a.get("stream"),
            stream=a.get("stream") or a.get("department"),
            college_register_no=str(a["college_register_no"]) if a.get("college_register_no") is not None else None,
            college_joining_year=a.get("college_joining_year"),
            college_passing_year=a.get("college_passing_year"),
            employment_status=a.get("employment_status"),
            company=a.get("company") or a.get("company_name"),
            company_name=a.get("company_name") or a.get("company"),
            profession=a.get("profession") or a.get("designation"),
            designation=a.get("designation") or a.get("profession"),
            industry=a.get("industry"),
            experience_years=a.get("experience_years"),
            total_experience=a.get("total_experience") or (str(a.get("experience_years")) if a.get("experience_years") is not None else None),
            skills=a.get("skills") or [],
            linkedin_url=a.get("linkedin_url"),
            instagram_url=a.get("instagram_url"),
            whatsapp_number=str(a["whatsapp_number"]) if a.get("whatsapp_number") is not None else None,
            website_url=a.get("website_url"),
            profile_photo_url=a.get("profile_photo_url"),
            is_volunteer="YES" if a.get("is_volunteer") in [True, "YES", "yes", "true", "True"] else "NO",
            willing_to_donate="YES" if a.get("willing_to_donate") in [True, "YES", "yes", "true", "True"] else "NO",
            verification_status=a.get("verification_status", "APPROVED"),
            roles=a.get("roles", ["ALUMNI"]),
            email=a.get("email", "") if a.get("email_visible") or is_admin else "***",
            batch_id=str(a["batch_id"]) if a.get("batch_id") else None,
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
    school_id = current_user.get("school_id") or "PLATFORM"
    user_id = current_user["user_id"]

    update_fields = {k: v for k, v in request.model_dump().items() if v is not None}
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    existing = await db.alumni.find_one({"user_id": user_id})
    if not existing:
        user_doc = await db.users.find_one({"_id": user_id}) or {}
        new_doc = {
            "school_id": school_id,
            "user_id": user_id,
            "full_name": current_user.get("full_name") or user_doc.get("full_name") or "Alumnus",
            "mobile": current_user.get("mobile") or user_doc.get("mobile") or "",
            "email": current_user.get("email") or user_doc.get("email") or "",
            "passing_year": 2010,
            "verification_status": "APPROVED",
            "created_at": datetime.now(timezone.utc)
        }
        new_doc.update(update_fields)
        res = await db.alumni.insert_one(new_doc)
        alumni = await db.alumni.find_one({"_id": res.inserted_id})
    else:
        await db.alumni.update_one({"user_id": user_id}, {"$set": update_fields})
        alumni = await db.alumni.find_one({"user_id": user_id})

    user_updates = {}
    if "full_name" in update_fields: user_updates["full_name"] = update_fields["full_name"]
    if "email" in update_fields: user_updates["email"] = update_fields["email"]
    if "mobile" in update_fields: user_updates["mobile"] = update_fields["mobile"]
    if "profile_photo_url" in update_fields: user_updates["profile_photo_url"] = update_fields["profile_photo_url"]
    if user_updates:
        try:
            await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": user_updates})
        except Exception:
            await db.users.update_one({"_id": user_id}, {"$set": user_updates})

    return UserProfileResponse(
        id=str(alumni["_id"]),
        user_id=user_id,
        school_id=str(alumni.get("school_id") or school_id),
        full_name=alumni.get("full_name", "Alumnus"),
        mobile=alumni.get("mobile", ""),
        email=alumni.get("email", ""),
        profile_photo_url=alumni.get("profile_photo_url"),
        blood_group=alumni.get("blood_group"),
        father_name=alumni.get("father_name"),
        mother_name=alumni.get("mother_name"),
        passing_year=alumni.get("passing_year", 2010),
        batch_id=str(alumni["batch_id"]) if alumni.get("batch_id") else None,
        admission_number=alumni.get("admission_number", ""),
        section=alumni.get("section"),
        address=alumni.get("address"),
        current_city=alumni.get("current_city"),
        state=alumni.get("state"),
        country=alumni.get("country"),
        profession=alumni.get("profession"),
        company=alumni.get("company"),
        industry=alumni.get("industry"),
        experience_years=alumni.get("experience_years"),
        bio=alumni.get("bio"),
        house=alumni.get("house"),
        stream=alumni.get("stream"),
        linkedin_url=alumni.get("linkedin_url"),
        instagram_url=alumni.get("instagram_url"),
        whatsapp_number=alumni.get("whatsapp_number"),
        github_url=alumni.get("github_url"),
        twitter_url=alumni.get("twitter_url"),
        website_url=alumni.get("website_url"),
        skills=alumni.get("skills") or [],
        phone_visible=alumni.get("phone_visible", False),
        directory_visible=alumni.get("directory_visible", True),
        verification_status=alumni.get("verification_status", "APPROVED"),
        is_volunteer=alumni.get("is_volunteer", "NO"),
        willing_to_donate=alumni.get("willing_to_donate", "NO"),
        roles=current_user.get("roles", ["ALUMNI"]),
        email_visible=alumni.get("email_visible", False),
        created_at=alumni.get("created_at", datetime.now(timezone.utc))
    )

class AdminUpdateAlumniRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    
    full_name: Optional[str] = None
    name_ta: Optional[str] = None
    full_name_ta: Optional[str] = None
    mobile: Optional[str] = None
    country_code: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    dob: Optional[str] = None
    blood_group: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    relative_students_name: Optional[str] = None
    address: Optional[str] = None
    current_city: Optional[str] = None
    state: Optional[str] = None
    current_state: Optional[str] = None
    country: Optional[str] = None
    school_name: Optional[str] = None
    joining_year: Optional[Any] = None
    admission_year: Optional[Any] = None
    passing_year: Optional[Any] = None
    leaving_class: Optional[Any] = None
    admission_number: Optional[Any] = None
    roll_no: Optional[Any] = None
    section: Optional[Any] = None
    no_higher_education: Optional[Any] = None
    college_name: Optional[str] = None
    institution_name: Optional[str] = None
    degree: Optional[str] = None
    custom_degree: Optional[str] = None
    department: Optional[str] = None
    stream: Optional[str] = None
    college_register_no: Optional[Any] = None
    college_joining_year: Optional[Any] = None
    college_passing_year: Optional[Any] = None
    employment_status: Optional[str] = None
    company: Optional[str] = None
    company_name: Optional[str] = None
    profession: Optional[str] = None
    designation: Optional[str] = None
    industry: Optional[str] = None
    experience_years: Optional[Any] = None
    total_experience: Optional[Any] = None
    skills: Optional[Any] = None
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    whatsapp_number: Optional[Any] = None
    website_url: Optional[str] = None
    profile_photo_url: Optional[str] = None
    email: Optional[str] = None
    is_volunteer: Optional[Any] = None
    willing_to_donate: Optional[Any] = None
    verification_status: Optional[str] = None

class BulkUpdateAlumniRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    alumni_ids: List[str]
    verification_status: Optional[str] = None
    passing_year: Optional[int] = None
    section: Optional[str] = None
    blood_group: Optional[str] = None
    is_volunteer: Optional[str] = None
    willing_to_donate: Optional[str] = None

class BulkDeleteAlumniRequest(BaseModel):
    alumni_ids: List[str]

@router.put("/{alumni_id}")
async def admin_update_alumni(
    alumni_id: str,
    request: AdminUpdateAlumniRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "PRIMARY_DEVELOPER", "SUPER_ADMIN"]))
):
    db = get_db()
    
    id_or = []
    try:
        id_or.append({"_id": ObjectId(alumni_id)})
    except Exception:
        pass
    id_or.append({"_id": alumni_id})
    filter_q = {"$or": id_or}

    update_fields = {k: v for k, v in request.model_dump().items() if v is not None}
    if not update_fields:
        return {"success": True, "message": "No fields to update"}

    if "name_ta" in update_fields:
        update_fields["full_name_ta"] = update_fields["name_ta"]
    elif "full_name_ta" in update_fields:
        update_fields["name_ta"] = update_fields["full_name_ta"]

    if "date_of_birth" in update_fields:
        update_fields["dob"] = update_fields["date_of_birth"]
    elif "dob" in update_fields:
        update_fields["date_of_birth"] = update_fields["dob"]

    if "current_state" in update_fields:
        update_fields["state"] = update_fields["current_state"]
    elif "state" in update_fields:
        update_fields["current_state"] = update_fields["state"]

    if "college_name" in update_fields:
        update_fields["institution_name"] = update_fields["college_name"]
    elif "institution_name" in update_fields:
        update_fields["college_name"] = update_fields["institution_name"]

    if "department" in update_fields:
        update_fields["stream"] = update_fields["department"]
    elif "stream" in update_fields:
        update_fields["department"] = update_fields["stream"]

    if "admission_number" in update_fields:
        update_fields["roll_no"] = update_fields["admission_number"]
    elif "roll_no" in update_fields:
        update_fields["admission_number"] = update_fields["roll_no"]

    if "company_name" in update_fields:
        update_fields["company"] = update_fields["company_name"]
    elif "company" in update_fields:
        update_fields["company_name"] = update_fields["company"]

    if "profession" in update_fields:
        update_fields["designation"] = update_fields["profession"]
    elif "designation" in update_fields:
        update_fields["profession"] = update_fields["designation"]

    if "joining_year" in update_fields:
        update_fields["admission_year"] = update_fields["joining_year"]
    elif "admission_year" in update_fields:
        update_fields["joining_year"] = update_fields["admission_year"]

    update_fields["updated_at"] = datetime.now(timezone.utc)

    await db.alumni.update_one(filter_q, {"$set": update_fields})
    return {"success": True, "message": "Alumni updated successfully"}

@router.delete("/{alumni_id}")
async def admin_delete_alumni(
    alumni_id: str,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "PRIMARY_DEVELOPER", "SUPER_ADMIN"]))
):
    db = get_db()
    school_id = current_user.get("school_id")

    filter_q = {"school_id": school_id} if school_id else {}
    try:
        filter_q["_id"] = ObjectId(alumni_id)
    except Exception:
        filter_q["_id"] = alumni_id

    await db.alumni.delete_one(filter_q)
    return {"success": True, "message": "Alumni record deleted successfully"}

@router.post("/bulk-update")
async def bulk_update_alumni(
    request: BulkUpdateAlumniRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "PRIMARY_DEVELOPER", "SUPER_ADMIN"]))
):
    db = get_db()
    school_id = current_user.get("school_id")

    update_fields = {k: v for k, v in request.model_dump().items() if k != "alumni_ids" and v is not None}
    if not update_fields or not request.alumni_ids:
        return {"success": True, "message": "Nothing to update", "updated": 0}

    obj_ids = []
    str_ids = []
    for aid in request.alumni_ids:
        try:
            obj_ids.append(ObjectId(aid))
        except Exception:
            str_ids.append(aid)

    query = {"$or": [{"_id": {"$in": obj_ids}}, {"_id": {"$in": str_ids}}]}
    if school_id:
        query["school_id"] = school_id

    res = await db.alumni.update_many(query, {"$set": update_fields})
    return {"success": True, "message": f"Updated {res.modified_count} alumni records", "updated": res.modified_count}

@router.post("/bulk-delete")
async def bulk_delete_alumni(
    request: BulkDeleteAlumniRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "PRIMARY_DEVELOPER", "SUPER_ADMIN"]))
):
    db = get_db()
    school_id = current_user.get("school_id")

    if not request.alumni_ids:
        return {"success": True, "message": "No IDs provided", "deleted": 0}

    obj_ids = []
    str_ids = []
    for aid in request.alumni_ids:
        try:
            obj_ids.append(ObjectId(aid))
        except Exception:
            str_ids.append(aid)

    query = {"$or": [{"_id": {"$in": obj_ids}}, {"_id": {"$in": str_ids}}]}
    if school_id:
        query["school_id"] = school_id

    res = await db.alumni.delete_many(query)
    return {"success": True, "message": f"Deleted {res.deleted_count} alumni records", "deleted": res.deleted_count}