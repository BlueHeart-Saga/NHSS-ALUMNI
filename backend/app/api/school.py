from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_db
from app.schemas.models import SchoolProfileResponse, UpdateSchoolRequest
from app.middleware.auth import get_current_user, require_roles

router = APIRouter(prefix="/school", tags=["School Profile"])

@router.get("/profile", response_model=SchoolProfileResponse)
async def get_school_profile(current_user: dict = Depends(get_current_user)):
    db = get_db()
    school_id = current_user.get("school_id")
    from bson import ObjectId

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

    return SchoolProfileResponse(
        id=str(school["_id"]),
        name=school.get("name", "School"),
        code=school.get("code", "SCHOOL"),
        logo_url=school.get("logo_url"),
        cover_url=school.get("cover_url"),
        description=school.get("description"),
        address=school.get("address"),
        website=school.get("website"),
        contact_phone=school.get("contact_phone"),
        contact_email=school.get("contact_email"),
        established_year=school.get("established_year")
    )

@router.put("/profile", response_model=SchoolProfileResponse)
async def update_school_profile(
    request: UpdateSchoolRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    db = get_db()
    school_id = current_user.get("school_id")
    from bson import ObjectId

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
    return SchoolProfileResponse(
        id=str(school["_id"]),
        name=school.get("name", "School"),
        code=school.get("code", "SCHOOL"),
        logo_url=school.get("logo_url"),
        cover_url=school.get("cover_url"),
        description=school.get("description"),
        address=school.get("address"),
        website=school.get("website"),
        contact_phone=school.get("contact_phone"),
        contact_email=school.get("contact_email"),
        established_year=school.get("established_year")
    )

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
