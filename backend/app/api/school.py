from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from app.core.database import get_db
from app.schemas.models import (
    SchoolProfileResponse, UpdateSchoolRequest,
    CreateSchoolStaffRequest, UpdateSchoolStaffRequest, SchoolStaffResponse
)
from app.middleware.auth import get_current_user, require_roles
from app.services.azure_blob import blob_service

router = APIRouter(prefix="/school", tags=["School Profile & Staff"])

@router.post("/upload-image")
async def upload_school_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files (JPG, PNG, WebP, GIF) are allowed")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size exceeds maximum limit of 10MB")

    school_id = current_user.get("school_id", "school")
    image_url, _, _ = await blob_service.upload_image(contents, file.filename, file.content_type, school_id=school_id)
    return {"url": image_url, "filename": file.filename}

def format_school_response(school: dict) -> SchoolProfileResponse:
    return SchoolProfileResponse(
        id=str(school["_id"]),
        name=school.get("name", "School"),
        code=school.get("code", "SCHOOL"),
        school_type=school.get("school_type", "Higher Secondary School"),
        logo_url=school.get("logo_url"),
        cover_url=school.get("cover_url"),
        description=school.get("description"),
        portal_name=school.get("portal_name"),
        tagline=school.get("tagline"),
        address=school.get("address"),
        city=school.get("city"),
        district=school.get("district"),
        state=school.get("state"),
        country=school.get("country", "India"),
        pin_code=school.get("pin_code"),
        website=school.get("website"),
        contact_phone=school.get("contact_phone"),
        contact_email=school.get("contact_email"),
        established_year=school.get("established_year"),
        status=school.get("status", "ACTIVE"),
        alumni_registration_enabled=school.get("alumni_registration_enabled", True),
        manual_approval_enabled=school.get("manual_approval_enabled", True),
        public_directory_enabled=school.get("public_directory_enabled", True),
        event_registration_enabled=school.get("event_registration_enabled", True),
        announcement_notifications_enabled=school.get("announcement_notifications_enabled", True)
    )

@router.get("/profile", response_model=SchoolProfileResponse)
async def get_school_profile(current_user: dict = Depends(get_current_user)):
    db = get_db()
    school_id = current_user.get("school_id")

    school = None
    if school_id and school_id != "None":
        try:
            school = await db.schools.find_one({"_id": ObjectId(school_id)})
        except Exception:
            school = await db.schools.find_one({"_id": school_id})

    if not school:
        school = await db.schools.find_one({})

    if not school:
        raise HTTPException(status_code=404, detail="No active school profile found. Please create a school via Developer Portal.")

    return format_school_response(school)

@router.put("/profile", response_model=SchoolProfileResponse)
async def update_school_profile(
    request: UpdateSchoolRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    db = get_db()
    school_id = current_user.get("school_id")

    school_query = {}
    if school_id and school_id != "None":
        try:
            school_query = {"_id": ObjectId(school_id)}
        except Exception:
            school_query = {"_id": school_id}
    else:
        school_doc = await db.schools.find_one({})
        if school_doc:
            school_query = {"_id": school_doc["_id"]}

    if not school_query:
        raise HTTPException(status_code=404, detail="School profile not found.")

    update_fields = {k: v for k, v in request.model_dump().items() if v is not None}
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    await db.schools.update_one(school_query, {"$set": update_fields})

    school = await db.schools.find_one(school_query)
    return format_school_response(school)

# --- School Staff / Person Management ---
@router.get("/staff", response_model=List[SchoolStaffResponse])
async def list_school_staff(
    staff_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    school_id = current_user.get("school_id")

    query = {}
    if school_id:
        query["school_id"] = school_id

    if staff_type:
        query["staff_type"] = staff_type.upper()

    staff_cursor = db.school_staff.find(query).sort("created_at", -1)
    staff_list = await staff_cursor.to_list(length=300)

    res = []
    for s in staff_list:
        sType = s.get("staff_type") or ("PAST" if s.get("is_former") else "CURRENT")
        res.append(SchoolStaffResponse(
            id=str(s["_id"]),
            school_id=s.get("school_id", school_id or ""),
            full_name=s["full_name"],
            full_name_ta=s.get("full_name_ta"),
            email=s.get("email"),
            mobile=s.get("mobile"),
            school_position=s.get("school_position", "Teacher"),
            school_position_ta=s.get("school_position_ta"),
            department=s.get("department"),
            department_ta=s.get("department_ta"),
            designation=s.get("designation"),
            designation_ta=s.get("designation_ta"),
            staff_id=s.get("staff_id"),
            profile_photo_url=s.get("profile_photo_url"),
            staff_type=sType,
            service_start_year=s.get("service_start_year"),
            service_end_year=s.get("service_end_year"),
            achievements=s.get("achievements"),
            achievements_ta=s.get("achievements_ta"),
            is_former=bool(s.get("is_former") or sType == "PAST"),
            status=s.get("status", "ACTIVE"),
            notes=s.get("notes"),
            notes_ta=s.get("notes_ta"),
            created_at=s.get("created_at", datetime.now(timezone.utc))
        ))
    return res

@router.post("/staff", response_model=SchoolStaffResponse)
async def create_school_staff(
    request: CreateSchoolStaffRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    db = get_db()
    school_id = current_user.get("school_id")
    now = datetime.now(timezone.utc)

    s_type = (request.staff_type or ("PAST" if request.is_former else "CURRENT")).upper()

    doc = {
        "school_id": school_id,
        "full_name": request.full_name,
        "full_name_ta": request.full_name_ta,
        "email": request.email,
        "mobile": request.mobile,
        "school_position": request.school_position,
        "school_position_ta": request.school_position_ta,
        "department": request.department,
        "department_ta": request.department_ta,
        "designation": request.designation,
        "designation_ta": request.designation_ta,
        "staff_id": request.staff_id,
        "profile_photo_url": request.profile_photo_url or f"https://ui-avatars.com/api/?name={request.full_name}&background=FFF7D6&color=854D0E",
        "staff_type": s_type,
        "service_start_year": request.service_start_year,
        "service_end_year": request.service_end_year,
        "achievements": request.achievements,
        "achievements_ta": request.achievements_ta,
        "is_former": bool(request.is_former or s_type == "PAST"),
        "status": request.status or "ACTIVE",
        "notes": request.notes,
        "notes_ta": request.notes_ta,
        "created_at": now
    }

    res = await db.school_staff.insert_one(doc)
    s_id = str(res.inserted_id)

    return SchoolStaffResponse(
        id=s_id,
        school_id=school_id or "",
        full_name=doc["full_name"],
        full_name_ta=doc.get("full_name_ta"),
        email=doc["email"],
        mobile=doc["mobile"],
        school_position=doc["school_position"],
        school_position_ta=doc.get("school_position_ta"),
        department=doc["department"],
        department_ta=doc.get("department_ta"),
        designation=doc["designation"],
        designation_ta=doc.get("designation_ta"),
        staff_id=doc["staff_id"],
        profile_photo_url=doc["profile_photo_url"],
        staff_type=doc["staff_type"],
        service_start_year=doc["service_start_year"],
        service_end_year=doc["service_end_year"],
        achievements=doc["achievements"],
        achievements_ta=doc.get("achievements_ta"),
        is_former=doc["is_former"],
        status=doc["status"],
        notes=doc["notes"],
        notes_ta=doc.get("notes_ta"),
        created_at=now
    )

@router.put("/staff/{staff_id}", response_model=SchoolStaffResponse)
async def update_school_staff(
    staff_id: str,
    request: UpdateSchoolStaffRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    db = get_db()
    school_id = current_user.get("school_id")

    staff = await db.school_staff.find_one({"_id": ObjectId(staff_id)})
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")

    update_fields = {k: v for k, v in request.model_dump().items() if v is not None}
    if "staff_type" in update_fields and update_fields["staff_type"]:
        update_fields["staff_type"] = update_fields["staff_type"].upper()
        if update_fields["staff_type"] == "PAST":
            update_fields["is_former"] = True
        elif update_fields["staff_type"] == "CURRENT":
            update_fields["is_former"] = False

    if update_fields:
        await db.school_staff.update_one({"_id": ObjectId(staff_id)}, {"$set": update_fields})

    updated = await db.school_staff.find_one({"_id": ObjectId(staff_id)})
    sType = updated.get("staff_type") or ("PAST" if updated.get("is_former") else "CURRENT")

    return SchoolStaffResponse(
        id=str(updated["_id"]),
        school_id=updated.get("school_id", school_id or ""),
        full_name=updated["full_name"],
        full_name_ta=updated.get("full_name_ta"),
        email=updated.get("email"),
        mobile=updated.get("mobile"),
        school_position=updated.get("school_position", "Teacher"),
        school_position_ta=updated.get("school_position_ta"),
        department=updated.get("department"),
        department_ta=updated.get("department_ta"),
        designation=updated.get("designation"),
        designation_ta=updated.get("designation_ta"),
        staff_id=updated.get("staff_id"),
        profile_photo_url=updated.get("profile_photo_url"),
        staff_type=sType,
        service_start_year=updated.get("service_start_year"),
        service_end_year=updated.get("service_end_year"),
        achievements=updated.get("achievements"),
        achievements_ta=updated.get("achievements_ta"),
        is_former=bool(updated.get("is_former") or sType == "PAST"),
        status=updated.get("status", "ACTIVE"),
        notes=updated.get("notes"),
        notes_ta=updated.get("notes_ta"),
        created_at=updated.get("created_at", datetime.now(timezone.utc))
    )

@router.delete("/staff/{staff_id}")
async def delete_school_staff(
    staff_id: str,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    db = get_db()
    await db.school_staff.delete_one({"_id": ObjectId(staff_id)})
    return {"success": True, "message": "Staff member removed successfully"}

@router.get("/admins")
async def list_school_admins(current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))):
    db = get_db()
    school_id = current_user.get("school_id")

    # Find users with SCHOOL_ADMIN or SUPER_ADMIN role
    admin_users = await db.users.find({
        "roles": {"$in": ["SCHOOL_ADMIN", "SUPER_ADMIN"]}
    }).to_list(length=100)

    user_ids = [str(u["_id"]) for u in admin_users]
    alumni_list = await db.alumni.find({"user_id": {"$in": user_ids}}).to_list(length=len(user_ids))
    alumni_map = {str(a["user_id"]): a for a in alumni_list if a.get("user_id")}

    res = []
    for u in admin_users:
        u_id = str(u["_id"])
        alumni = alumni_map.get(u_id)
        res.append({
            "id": str(alumni["_id"]) if alumni else u_id,
            "user_id": u_id,
            "school_id": school_id,
            "full_name": alumni.get("full_name") if alumni else "Administrator",
            "mobile": u.get("mobile"),
            "email": u.get("email") or (alumni.get("email") if alumni else ""),
            "roles": u.get("roles", ["SCHOOL_ADMIN"]),
            "verification_status": "APPROVED",
            "created_at": u.get("created_at")
        })
    return res

from app.schemas.models import CreateAdminRequest, UserProfileResponse
from datetime import datetime, timezone

@router.post("/admins", response_model=UserProfileResponse)
async def create_school_admin(
    request: CreateAdminRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    db = get_db()
    school_id = current_user.get("school_id")
    mobile = request.mobile.strip()
    if not mobile.startswith("+"):
        mobile = f"+91{mobile.lstrip('0')}"

    now = datetime.now(timezone.utc)
    assigned_roles = request.roles if request.roles else ([request.role.upper()] if request.role else ["SCHOOL_ADMIN"])
    assigned_roles = list(dict.fromkeys([r.upper() for r in assigned_roles if r]))

    # 1. Find or create user
    user = await db.users.find_one({"mobile": mobile})
    if user:
        user_id = str(user["_id"])
        existing_roles = user.get("roles", [])
        combined_roles = list(dict.fromkeys(existing_roles + assigned_roles))
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"roles": combined_roles, "school_id": school_id}}
        )
    else:
        new_u = {
            "school_id": school_id,
            "mobile": mobile,
            "email": str(request.email) if request.email else None,
            "roles": assigned_roles,
            "is_active": True,
            "created_at": now
        }
        res_u = await db.users.insert_one(new_u)
        user_id = str(res_u.inserted_id)

    # 2. Find or create alumni record
    alumni = await db.alumni.find_one({"user_id": user_id})
    batch = await db.batches.find_one({"passing_year": request.passing_year or 2005})
    batch_id = str(batch["_id"]) if batch else None

    school_obj = await db.schools.find_one({"_id": ObjectId(school_id)}) if school_id else None
    school_code = school_obj.get("code", "ADMIN") if school_obj else "ADMIN"

    alumni_doc = {
        "school_id": school_id,
        "user_id": user_id,
        "full_name": request.full_name,
        "mobile": mobile,
        "email": str(request.email) if request.email else None,
        "profile_photo_url": f"https://ui-avatars.com/api/?name={request.full_name}&background=111111&color=F4C542",
        "passing_year": request.passing_year or 2005,
        "batch_id": batch_id,
        "admission_number": f"{school_code}-ADMIN-{mobile[-4:]}",
        "section": "A",
        "current_city": "Chennai",
        "profession": "Administrator",
        "verification_status": "APPROVED",
        "verification_notes": "Administrator Created via Developer Portal",
        "verified_at": now,
        "email_visible": True,
        "created_at": now
    }

    if alumni:
        await db.alumni.update_one({"_id": alumni["_id"]}, {"$set": alumni_doc})
    else:
        await db.alumni.insert_one(alumni_doc)

    alumni_res = await db.alumni.find_one({"user_id": user_id})

    # Audit log
    await db.audit_logs.insert_one({
        "school_id": school_id,
        "user_id": current_user["user_id"],
        "action": "ADMIN_CREATED",
        "resource_type": "user",
        "resource_id": user_id,
        "timestamp": now
    })

    return UserProfileResponse(
        id=str(alumni_res["_id"]),
        user_id=user_id,
        school_id=school_id or "",
        full_name=alumni_res["full_name"],
        mobile=alumni_res["mobile"],
        email=alumni_res.get("email"),
        profile_photo_url=alumni_res.get("profile_photo_url"),
        passing_year=alumni_res.get("passing_year", 2005),
        batch_id=str(alumni_res["batch_id"]) if alumni_res.get("batch_id") else None,
        admission_number=alumni_res.get("admission_number", "ADMIN"),
        section=alumni_res.get("section"),
        current_city=alumni_res.get("current_city"),
        profession=alumni_res.get("profession"),
        verification_status="APPROVED",
        verification_notes="Administrator",
        roles=[request.role or "SCHOOL_ADMIN"],
        email_visible=True,
        created_at=now
    )
