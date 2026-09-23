from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from pydantic import BaseModel, Field, EmailStr
import asyncio
from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.schemas.models import UserProfileResponse, SchoolProfileResponse
from app.services.email import send_school_admin_invite_email
from app.services.sms import normalize_indian_mobile, is_valid_indian_mobile, build_mobile_query_filter

router = APIRouter(prefix="/developer", tags=["Platform Developer Portal"])

class CreateSchoolRequest(BaseModel):
    name: str = Field(..., example="Our School")
    code: str = Field(..., example="SCHOOL")
    description: Optional[str] = "Nurturing excellence and integrity"
    address: Optional[str] = "Campus Road"
    city: Optional[str] = "Chennai"
    state: Optional[str] = "Tamil Nadu"
    country: Optional[str] = "India"
    website: Optional[str] = "https://school.edu"
    contact_phone: Optional[str] = "+919876543210"
    contact_email: Optional[str] = "admin@school.edu"
    established_year: Optional[int] = 1985
    logo_url: Optional[str] = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=300&q=80"
    cover_url: Optional[str] = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80"
    status: Optional[str] = "ACTIVE"
    admin_full_name: Optional[str] = "School Administrator"
    admin_mobile: Optional[str] = Field(None, example="+919876543210")
    admin_email: Optional[str] = None

class ProvisionSchoolAdminRequest(BaseModel):
    school_id: str
    full_name: str
    mobile: str = Field(..., example="+919876543210")
    email: Optional[EmailStr] = None

@router.get("/info")
async def get_developer_info(current_user: dict = Depends(get_current_user)):
    """Get active platform developer account info directly from MongoDB database."""
    db = get_db()
    dev_user = await db.users.find_one({"roles": {"$in": ["DEVELOPER", "SUPER_ADMIN"]}})
    
    mobile = dev_user.get("mobile") if dev_user else current_user.get("mobile")
    email = dev_user.get("email") if dev_user else current_user.get("email")
    roles = dev_user.get("roles") if dev_user else current_user.get("roles", [])

    return {
        "user_id": str(dev_user["_id"]) if dev_user else current_user.get("user_id"),
        "mobile": mobile,
        "email": email,
        "roles": roles
    }

@router.get("/schools")
async def list_all_schools():
    """Platform Developer: List all registered schools across MongoDB with admin and alumni statistics."""
    db = get_db()
    schools_cursor = db.schools.find({}).sort("created_at", -1)
    schools_list = await schools_cursor.to_list(length=100)

    if not schools_list:
        return []

    tasks = [
        asyncio.gather(
            db.users.count_documents({"school_id": str(s["_id"]), "roles": "SCHOOL_ADMIN"}),
            db.alumni.count_documents({"school_id": str(s["_id"])}),
            db.batches.count_documents({"school_id": str(s["_id"])}),
            db.events.count_documents({"school_id": str(s["_id"])})
        )
        for s in schools_list
    ]

    counts_results = await asyncio.gather(*tasks)

    res = []
    for s, (admin_count, alumni_count, batches_count, events_count) in zip(schools_list, counts_results):
        s_id = str(s["_id"])
        res.append({
            "id": s_id,
            "name": s.get("name"),
            "code": s.get("code"),
            "description": s.get("description"),
            "address": s.get("address"),
            "city": s.get("city"),
            "state": s.get("state"),
            "country": s.get("country", "India"),
            "website": s.get("website"),
            "contact_phone": s.get("contact_phone"),
            "contact_email": s.get("contact_email"),
            "established_year": s.get("established_year", 1985),
            "logo_url": s.get("logo_url"),
            "cover_url": s.get("cover_url"),
            "status": s.get("status", "ACTIVE"),
            "admin_count": admin_count,
            "alumni_count": alumni_count,
            "batches_count": batches_count,
            "events_count": events_count,
            "created_at": s.get("created_at")
        })
    return res

@router.post("/schools", response_model=SchoolProfileResponse)
async def create_new_school(request: CreateSchoolRequest):
    """Platform Developer: Create a new school entity in MongoDB."""
    db = get_db()
    code_upper = request.code.strip().upper()

    # Check if school code exists
    existing = await db.schools.find_one({"code": code_upper})
    if existing:
        raise HTTPException(status_code=400, detail=f"School code '{code_upper}' already exists.")

    now = datetime.now(timezone.utc)
    school_doc = {
        "name": request.name.strip(),
        "code": code_upper,
        "description": request.description,
        "address": request.address,
        "city": request.city,
        "state": request.state,
        "country": request.country or "India",
        "website": request.website,
        "contact_phone": request.contact_phone,
        "contact_email": request.contact_email,
        "established_year": request.established_year or 1985,
        "logo_url": request.logo_url or "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=300&q=80",
        "cover_url": request.cover_url or "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80",
        "status": request.status or "ACTIVE",
        "created_at": now
    }
    res = await db.schools.insert_one(school_doc)
    school_id = str(res.inserted_id)

    # Initialize Batch Cohorts from established_year (or 1985) up to 2026 for the new school
    est_yr = request.established_year or 1985
    start_year = max(1950, min(est_yr, 2026))
    for year in range(start_year, 2027):
        await db.batches.insert_one({
            "school_id": school_id,
            "name": f"Class of {year}",
            "passing_year": year,
            "description": f"The Class of {year} cohort",
            "coordinators": [],
            "status": "ACTIVE",
            "created_at": now
        })

    # Auto-provision primary School Admin if admin_mobile is specified
    if request.admin_mobile and request.admin_mobile.strip():
        admin_mobile = normalize_indian_mobile(request.admin_mobile) if is_valid_indian_mobile(request.admin_mobile) else request.admin_mobile.strip()

        admin_user = await db.users.find_one({"$or": build_mobile_query_filter(request.admin_mobile)})
        if admin_user:
            admin_user_id = str(admin_user["_id"])
            await db.users.update_one(
                {"_id": admin_user["_id"]},
                {"$set": {"school_id": school_id, "roles": ["SCHOOL_ADMIN"], "mobile": admin_mobile}}
            )
        else:
            new_u = {
                "school_id": school_id,
                "mobile": admin_mobile,
                "email": request.admin_email,
                "roles": ["SCHOOL_ADMIN"],
                "is_active": True,
                "created_at": now
            }
            res_u = await db.users.insert_one(new_u)
            admin_user_id = str(res_u.inserted_id)

        # School Admin exists strictly in db.users (NOT in db.alumni collection)

    school = await db.schools.find_one({"_id": res.inserted_id})
    return SchoolProfileResponse(
        id=school_id,
        name=school["name"],
        code=school["code"],
        logo_url=school.get("logo_url"),
        cover_url=school.get("cover_url"),
        description=school.get("description"),
        address=school.get("address"),
        city=school.get("city"),
        state=school.get("state"),
        country=school.get("country", "India"),
        website=school.get("website"),
        contact_phone=school.get("contact_phone"),
        contact_email=school.get("contact_email"),
        established_year=school.get("established_year"),
        status=school.get("status", "ACTIVE")
    )

@router.put("/schools/{school_id}", response_model=SchoolProfileResponse)
async def update_school(school_id: str, request: CreateSchoolRequest):
    """Platform Developer: Update an existing school entity."""
    db = get_db()
    
    if not ObjectId.is_valid(school_id):
        raise HTTPException(status_code=400, detail="Invalid school ID format")
        
    code_upper = request.code.strip().upper()

    # Check if school code exists on another school
    existing = await db.schools.find_one({"code": code_upper, "_id": {"$ne": ObjectId(school_id)}})
    if existing:
        raise HTTPException(status_code=400, detail=f"School code '{code_upper}' already exists.")

    school_doc = {
        "name": request.name.strip(),
        "code": code_upper,
        "description": request.description,
        "address": request.address,
        "city": request.city,
        "state": request.state,
        "country": request.country or "India",
        "website": request.website,
        "contact_phone": request.contact_phone,
        "contact_email": request.contact_email,
        "established_year": request.established_year or 1985,
        "logo_url": request.logo_url,
        "cover_url": request.cover_url,
        "status": request.status or "ACTIVE",
        "updated_at": datetime.now(timezone.utc)
    }
    
    res = await db.schools.update_one({"_id": ObjectId(school_id)}, {"$set": school_doc})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="School not found")

    # Fetch updated
    school = await db.schools.find_one({"_id": ObjectId(school_id)})
    return SchoolProfileResponse(
        id=school_id,
        name=school["name"],
        code=school["code"],
        logo_url=school.get("logo_url"),
        cover_url=school.get("cover_url"),
        description=school.get("description"),
        address=school.get("address"),
        city=school.get("city"),
        state=school.get("state"),
        country=school.get("country", "India"),
        website=school.get("website"),
        contact_phone=school.get("contact_phone"),
        contact_email=school.get("contact_email"),
        established_year=school.get("established_year"),
        status=school.get("status", "ACTIVE")
    )

@router.delete("/schools/{school_id}")
async def delete_school(school_id: str):
    """Platform Developer: Delete a school and cascade delete all its linked records."""
    db = get_db()
    
    if not ObjectId.is_valid(school_id):
        raise HTTPException(status_code=400, detail="Invalid school ID format")
        
    obj_id = ObjectId(school_id)
    str_id = school_id
    
    school = await db.schools.find_one({"_id": obj_id})
    if not school:
        raise HTTPException(status_code=404, detail="School not found")

    # Cascade deletion across all multi-tenant collections
    await db.batches.delete_many({"school_id": str_id})
    await db.users.delete_many({"school_id": str_id})
    await db.alumni.delete_many({"school_id": str_id})
    await db.events.delete_many({"school_id": str_id})
    await db.rank_holders.delete_many({"school_id": str_id})
    await db.announcements.delete_many({"school_id": str_id})
    await db.memories.delete_many({"school_id": str_id})
    
    # Delete the school entity
    await db.schools.delete_one({"_id": obj_id})

    return {"success": True, "message": "School and all associated records deleted successfully."}


@router.post("/schools/{school_id}/admin", response_model=UserProfileResponse)
async def provision_admin_for_school(school_id: str, request: ProvisionSchoolAdminRequest):
    """Platform Developer: Provision a dedicated School Admin account for a specific school."""
    db = get_db()
    from bson import ObjectId

    school_query = {}
    try:
        school_query = {"_id": ObjectId(school_id)}
    except Exception:
        school_query = {"_id": school_id}

    school = await db.schools.find_one(school_query)
    if not school:
        raise HTTPException(status_code=404, detail="Target school not found.")

    target_school_id = str(school["_id"])
    norm_mob = normalize_indian_mobile(request.mobile) if is_valid_indian_mobile(request.mobile) else request.mobile.strip()

    now = datetime.now(timezone.utc)
    # Find or create user
    user = await db.users.find_one({"$or": build_mobile_query_filter(request.mobile)})
    if user:
        user_id = str(user["_id"])
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"school_id": target_school_id, "roles": ["SCHOOL_ADMIN"], "mobile": norm_mob}}
        )
    else:
        new_u = {
            "school_id": target_school_id,
            "mobile": norm_mob,
            "email": str(request.email) if request.email else None,
            "roles": ["SCHOOL_ADMIN"],
            "is_active": True,
            "created_at": now
        }
        res_u = await db.users.insert_one(new_u)
        user_id = str(res_u.inserted_id)

    # Audit log
    await db.audit_logs.insert_one({
        "school_id": target_school_id,
        "user_id": user_id,
        "action": "DEVELOPER_ADMIN_PROVISIONED",
        "resource_type": "user",
        "resource_id": user_id,
        "timestamp": now
    })

    # Dispatch Invitation Email with Account Setup & Password Link via Gmail SMTP
    if request.email:
        admin_email = str(request.email).strip()
        school_name = school.get("name", "School Platform")
        asyncio.create_task(
            asyncio.to_thread(send_school_admin_invite_email, admin_email, request.full_name, school_name)
        )

    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})

    return UserProfileResponse(
        id=user_id,
        user_id=user_id,
        school_id=target_school_id,
        full_name=request.full_name,
        mobile=mobile,
        email=str(request.email) if request.email else None,
        profile_photo_url=f"https://ui-avatars.com/api/?name={request.full_name}&background=111111&color=ffffff",
        passing_year=2005,
        batch_id=None,
        admission_number="ADMIN",
        section=None,
        current_city=None,
        profession="School Administrator",
        verification_status="APPROVED",
        verification_notes="School Administrator",
        roles=["SCHOOL_ADMIN"],
        email_visible=True,
        created_at=now
    )

@router.get("/enquiries")
async def get_school_admin_enquiries(
    status_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Developer endpoint to list all School Admin Enquiries with status metrics."""
    db = get_db()
    
    query = {}
    if status_filter and status_filter.upper() != "ALL":
        query["status"] = status_filter.upper()

    cursor = db.school_admin_enquiries.find(query).sort("created_at", -1)
    enquiries_list = await cursor.to_list(length=100)

    # Metrics aggregation
    pending_cnt = await db.school_admin_enquiries.count_documents({"status": "PENDING"})
    contacted_cnt = await db.school_admin_enquiries.count_documents({"status": "CONTACTED"})
    approved_cnt = await db.school_admin_enquiries.count_documents({"status": "APPROVED"})
    rejected_cnt = await db.school_admin_enquiries.count_documents({"status": "REJECTED"})
    total_cnt = await db.school_admin_enquiries.count_documents({})

    res = []
    for eq in enquiries_list:
        res.append({
            "id": str(eq["_id"]),
            "full_name": eq.get("full_name"),
            "email": eq.get("email"),
            "mobile": eq.get("mobile"),
            "responsibility": eq.get("responsibility"),
            "school_name": eq.get("school_name"),
            "city": eq.get("city"),
            "state": eq.get("state"),
            "country": eq.get("country", "India"),
            "message": eq.get("message"),
            "status": eq.get("status", "PENDING"),
            "notes": eq.get("notes", ""),
            "created_at": eq.get("created_at").isoformat() if isinstance(eq.get("created_at"), datetime) else str(eq.get("created_at"))
        })

    return {
        "metrics": {
            "pending": pending_cnt,
            "contacted": contacted_cnt,
            "approved": approved_cnt,
            "rejected": rejected_cnt,
            "total": total_cnt
        },
        "enquiries": res
    }

@router.get("/enquiries/{id}")
async def get_enquiry_details(id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid enquiry ID format")

    eq = await db.school_admin_enquiries.find_one({"_id": ObjectId(id)})
    if not eq:
        raise HTTPException(status_code=404, detail="School admin enquiry not found")

    return {
        "id": str(eq["_id"]),
        "full_name": eq.get("full_name"),
        "email": eq.get("email"),
        "mobile": eq.get("mobile"),
        "responsibility": eq.get("responsibility"),
        "school_name": eq.get("school_name"),
        "city": eq.get("city"),
        "state": eq.get("state"),
        "country": eq.get("country", "India"),
        "message": eq.get("message"),
        "status": eq.get("status", "PENDING"),
        "notes": eq.get("notes", ""),
        "created_at": eq.get("created_at").isoformat() if isinstance(eq.get("created_at"), datetime) else str(eq.get("created_at"))
    }

@router.put("/enquiries/{id}/status")
async def update_enquiry_status(
    id: str,
    payload: dict,
    current_user: dict = Depends(get_current_user)
):
    """Developer endpoint to change status of a School Admin enquiry (CONTACTED, APPROVED, REJECTED)."""
    db = get_db()
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid enquiry ID format")

    new_status = payload.get("status", "").upper()
    notes = payload.get("notes", "")

    if new_status not in ["PENDING", "CONTACTED", "APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be PENDING, CONTACTED, APPROVED, or REJECTED.")

    eq = await db.school_admin_enquiries.find_one({"_id": ObjectId(id)})
    if not eq:
        raise HTTPException(status_code=404, detail="Enquiry not found")

    now = datetime.now(timezone.utc)
    await db.school_admin_enquiries.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"status": new_status, "notes": notes, "updated_at": now}}
    )

    # If APPROVED: provision School Admin user for selected school
    if new_status == "APPROVED":
        school_id = payload.get("school_id")
        if not school_id:
            raise HTTPException(status_code=400, detail="school_id is required when approving an enquiry.")
        
        school = await db.schools.find_one({"_id": ObjectId(school_id)})
        if not school:
            raise HTTPException(status_code=404, detail="Selected school not found")
        
        school_name = school.get("name")

        admin_email = eq.get("email")
        admin_user = await db.users.find_one({"email": admin_email})
        if not admin_user:
            # Create school admin user
            new_u = {
                "school_id": school_id,
                "full_name": eq.get("full_name"),
                "mobile": eq.get("mobile"),
                "email": admin_email,
                "roles": ["SCHOOL_ADMIN"],
                "is_active": True,
                "status": "APPROVED_PENDING_SETUP",
                "created_at": now
            }
            await db.users.insert_one(new_u)

        if admin_email:
            asyncio.create_task(
                asyncio.to_thread(send_school_admin_invite_email, admin_email, eq.get("full_name", "School Admin"), school_name)
            )

    return {
        "success": True,
        "message": f"Enquiry status updated to {new_status} successfully!",
        "status": new_status
    }

class UpdateSchoolAdminRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    school_id: Optional[str] = None
    is_active: Optional[bool] = None

class CreateUpdateUserRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    mobile: str
    roles: Optional[List[str]] = ["ALUMNI"]
    school_id: Optional[str] = None
    is_active: Optional[bool] = True

@router.get("/school-admins")
async def list_school_admins(school_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """List all provisioned school admins with their assigned school info and active status."""
    db = get_db()
    query = {"roles": "SCHOOL_ADMIN"}
    if school_id:
        query["school_id"] = school_id

    cursor = db.users.find(query).sort("created_at", -1)
    admin_users = await cursor.to_list(length=200)

    # Collect school IDs for batch fetching
    school_ids = []
    for u in admin_users:
        if u.get("school_id"):
            try:
                school_ids.append(ObjectId(u["school_id"]))
            except Exception:
                school_ids.append(u["school_id"])

    schools_map = {}
    if school_ids:
        schools_docs = await db.schools.find({"_id": {"$in": school_ids}}).to_list(length=len(school_ids))
        for s in schools_docs:
            schools_map[str(s["_id"])] = s

    res = []
    for u in admin_users:
        s_id = str(u.get("school_id", ""))
        school = schools_map.get(s_id)
        
        full_name = u.get("full_name") or u.get("name")
        if not full_name and u.get("_id"):
            alumni = await db.alumni.find_one({"user_id": str(u["_id"])})
            if alumni:
                full_name = alumni.get("full_name")

        res.append({
            "id": str(u["_id"]),
            "user_id": str(u["_id"]),
            "full_name": full_name or "School Administrator",
            "email": u.get("email"),
            "mobile": u.get("mobile"),
            "school_id": s_id,
            "school_name": school.get("name") if school else "Unassigned School",
            "school_code": school.get("code") if school else "N/A",
            "is_active": u.get("is_active", True),
            "roles": u.get("roles", ["SCHOOL_ADMIN"]),
            "created_at": u.get("created_at").isoformat() if isinstance(u.get("created_at"), datetime) else str(u.get("created_at", ""))
        })
    return res

@router.put("/school-admins/{admin_id}")
async def update_school_admin(
    admin_id: str,
    request: UpdateSchoolAdminRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update a provisioned School Admin details or active status."""
    db = get_db()
    if not ObjectId.is_valid(admin_id):
        raise HTTPException(status_code=400, detail="Invalid admin ID format")

    update_fields = {}
    if request.full_name is not None:
        update_fields["full_name"] = request.full_name.strip()
    if request.email is not None:
        update_fields["email"] = request.email.strip()
    if request.mobile is not None:
        mobile = request.mobile.strip()
        if not mobile.startswith("+"):
            mobile = f"+91{mobile.lstrip('0')}"
        update_fields["mobile"] = mobile
    if request.school_id is not None:
        update_fields["school_id"] = request.school_id
    if request.is_active is not None:
        update_fields["is_active"] = request.is_active

    if not update_fields:
        raise HTTPException(status_code=400, detail="No valid fields provided to update.")

    update_fields["updated_at"] = datetime.now(timezone.utc)
    res = await db.users.update_one({"_id": ObjectId(admin_id)}, {"$set": update_fields})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="School Admin account not found.")

    return {"success": True, "message": "School Admin profile updated successfully."}

@router.delete("/school-admins/{admin_id}")
async def delete_school_admin(admin_id: str, current_user: dict = Depends(get_current_user)):
    """Revoke and delete a School Admin account."""
    db = get_db()
    if not ObjectId.is_valid(admin_id):
        raise HTTPException(status_code=400, detail="Invalid admin ID format")

    res = await db.users.delete_one({"_id": ObjectId(admin_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="School Admin account not found.")

    return {"success": True, "message": "School Admin account removed successfully."}

@router.get("/users")
async def list_all_users(
    role: Optional[str] = None,
    school_id: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List all platform users with role, school, and active status filters."""
    db = get_db()
    query = {}
    if role and role.upper() != "ALL":
        query["roles"] = role.upper()
    if school_id and school_id.upper() != "ALL":
        query["school_id"] = school_id
    if search:
        s_regex = {"$regex": search, "$options": "i"}
        query["$or"] = [{"full_name": s_regex}, {"email": s_regex}, {"mobile": s_regex}]

    cursor = db.users.find(query).sort("created_at", -1)
    users_list = await cursor.to_list(length=300)

    # Batch fetch schools & alumni profiles to resolve accurate names and school details
    school_ids = []
    user_ids = [str(u["_id"]) for u in users_list]
    mobiles = [u.get("mobile") for u in users_list if u.get("mobile")]
    emails = [u.get("email") for u in users_list if u.get("email")]

    for u in users_list:
        if u.get("school_id"):
            try:
                school_ids.append(ObjectId(u["school_id"]))
            except Exception:
                school_ids.append(u["school_id"])

    schools_map = {}
    if school_ids:
        schools_docs = await db.schools.find({"_id": {"$in": school_ids}}).to_list(length=len(school_ids))
        for s in schools_docs:
            schools_map[str(s["_id"])] = s

    # Batch query alumni profiles for missing names
    alumni_query = []
    if user_ids:
        alumni_query.append({"user_id": {"$in": user_ids}})
    if mobiles:
        alumni_query.append({"mobile": {"$in": mobiles}})
    if emails:
        alumni_query.append({"email": {"$in": emails}})

    alumni_docs = []
    if alumni_query:
        alumni_cursor = db.alumni.find({"$or": alumni_query})
        alumni_docs = await alumni_cursor.to_list(length=len(users_list) * 2)

    alumni_by_user_id = {}
    alumni_by_mobile = {}
    alumni_by_email = {}
    for a in alumni_docs:
        if a.get("user_id"):
            alumni_by_user_id[str(a["user_id"])] = a
        if a.get("mobile"):
            alumni_by_mobile[str(a["mobile"])] = a
            clean_m = str(a["mobile"]).replace("+91", "").strip()
            alumni_by_mobile[clean_m] = a
        if a.get("email"):
            alumni_by_email[str(a["email"]).lower()] = a

    import re
    res = []
    for u in users_list:
        u_id = str(u["_id"])
        s_id = str(u.get("school_id", ""))
        school = schools_map.get(s_id)

        alumni = alumni_by_user_id.get(u_id)
        if not alumni and u.get("mobile"):
            alumni = alumni_by_mobile.get(str(u["mobile"])) or alumni_by_mobile.get(str(u["mobile"]).replace("+91", "").strip())
        if not alumni and u.get("email"):
            alumni = alumni_by_email.get(str(u["email"]).lower())

        # Candidates in priority order: alumni full_name/name first, then user doc full_name/name/display_name
        candidates = []
        if alumni:
            if alumni.get("full_name"): candidates.append(str(alumni["full_name"]))
            if alumni.get("name"): candidates.append(str(alumni["name"]))
        if u.get("full_name"): candidates.append(str(u["full_name"]))
        if u.get("name"): candidates.append(str(u["name"]))
        if u.get("display_name"): candidates.append(str(u["display_name"]))

        name = None
        for cand in candidates:
            cand_clean = cand.strip()
            if cand_clean and cand_clean != "Platform User" and cand_clean != "User":
                name = cand_clean
                break

        if not name:
            if u.get("email"):
                email_user = u["email"].split("@")[0]
                cleaned = " ".join([part.capitalize() for part in re.split(r"[._-]", email_user) if part])
                name = cleaned or u["email"]
            elif u.get("mobile"):
                mob_display = u["mobile"]
                name = f"User ({mob_display})"
            else:
                name = "Alumni Member"

        # Auto-heal db.users document if full_name is missing or "Platform User"
        if u.get("full_name") != name and name != "Platform User":
            try:
                await db.users.update_one({"_id": u["_id"]}, {"$set": {"full_name": name}})
            except Exception:
                pass

        email_val = u.get("email") or (alumni.get("email") if alumni else None) or ""
        mobile_val = u.get("mobile") or u.get("phone") or (alumni.get("mobile") if alumni else None) or (alumni.get("phone") if alumni else None) or (alumni.get("whatsapp_number") if alumni else None) or ""
        has_password = bool(u.get("password") or u.get("password_hash"))

        res.append({
            "id": u_id,
            "user_id": u_id,
            "full_name": name,
            "email": email_val,
            "mobile": mobile_val,
            "roles": u.get("roles", ["ALUMNI"]),
            "school_id": s_id,
            "school_name": school.get("name") if school else (alumni.get("school_name") if alumni else "Unassigned"),
            "is_active": u.get("is_active", True),
            "has_password": has_password,
            "created_at": u.get("created_at").isoformat() if isinstance(u.get("created_at"), datetime) else str(u.get("created_at", ""))
        })
    return res

@router.post("/users")
async def create_user_developer(
    request: CreateUpdateUserRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a new platform user directly as Developer."""
    db = get_db()
    norm_mob = normalize_indian_mobile(request.mobile) if is_valid_indian_mobile(request.mobile) else request.mobile.strip()

    existing = await db.users.find_one({"$or": build_mobile_query_filter(request.mobile)})
    if existing:
        raise HTTPException(status_code=400, detail=f"User with mobile '{request.mobile}' already exists.")

    now = datetime.now(timezone.utc)
    user_doc = {
        "full_name": request.full_name,
        "email": request.email,
        "mobile": norm_mob,
        "roles": [r.upper() for r in (request.roles or ["ALUMNI"])],
        "school_id": request.school_id,
        "is_active": request.is_active if request.is_active is not None else True,
        "created_at": now
    }
    res = await db.users.insert_one(user_doc)
    return {"success": True, "user_id": str(res.inserted_id), "message": "User created successfully."}

@router.put("/users/{user_id}")
async def update_user_developer(
    user_id: str,
    request: CreateUpdateUserRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update an existing user's details, roles, school, or status."""
    db = get_db()
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    update_fields = {}
    if request.full_name is not None:
        update_fields["full_name"] = request.full_name.strip()
    if request.email is not None:
        update_fields["email"] = request.email.strip()
    if request.mobile:
        mobile = request.mobile.strip()
        if not mobile.startswith("+"):
            mobile = f"+91{mobile.lstrip('0')}"
        update_fields["mobile"] = mobile
    if request.roles is not None:
        update_fields["roles"] = [r.upper() for r in request.roles]
    if request.school_id is not None:
        update_fields["school_id"] = request.school_id
    if request.is_active is not None:
        update_fields["is_active"] = request.is_active

    update_fields["updated_at"] = datetime.now(timezone.utc)
    res = await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_fields})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="User account not found.")

    # Keep db.alumni in sync if full_name, email, or mobile was changed
    alumni_update = {}
    if "full_name" in update_fields: alumni_update["full_name"] = update_fields["full_name"]
    if "email" in update_fields: alumni_update["email"] = update_fields["email"]
    if "mobile" in update_fields: alumni_update["mobile"] = update_fields["mobile"]
    if alumni_update:
        await db.alumni.update_many({"user_id": user_id}, {"$set": alumni_update})

    return {"success": True, "message": "User account updated successfully."}

@router.delete("/users/{user_id}")
async def delete_user_developer(user_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a user account."""
    db = get_db()
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    res = await db.users.delete_one({"_id": ObjectId(user_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User account not found.")

    # Also delete associated alumni profile if present
    await db.alumni.delete_many({"user_id": user_id})

    return {"success": True, "message": "User account deleted successfully."}

class BulkDeleteUsersRequest(BaseModel):
    user_ids: List[str]

@router.post("/users/bulk-delete")
async def bulk_delete_users_developer(
    request: BulkDeleteUsersRequest,
    current_user: dict = Depends(get_current_user)
):
    """Bulk delete multiple user accounts across the platform."""
    db = get_db()
    valid_ids = [ObjectId(uid) for uid in request.user_ids if ObjectId.is_valid(uid)]
    str_ids = [str(uid) for uid in request.user_ids]

    if not valid_ids:
        raise HTTPException(status_code=400, detail="No valid user IDs provided for deletion.")

    res = await db.users.delete_many({"_id": {"$in": valid_ids}})
    await db.alumni.delete_many({"user_id": {"$in": str_ids}})

    return {
        "success": True,
        "message": f"Successfully deleted {res.deleted_count} user accounts.",
        "deleted_count": res.deleted_count
    }

@router.get("/audit-logs")
async def list_audit_logs(current_user: dict = Depends(get_current_user)):
    """List recent developer portal audit logs."""
    db = get_db()
    cursor = db.audit_logs.find({}).sort("timestamp", -1)
    logs = await cursor.to_list(length=100)

    res = []
    for l in logs:
        res.append({
            "id": str(l["_id"]),
            "action": l.get("action", "PLATFORM_ACTION"),
            "user_id": str(l.get("user_id", "")),
            "school_id": str(l.get("school_id", "")),
            "resource_type": l.get("resource_type"),
            "resource_id": str(l.get("resource_id", "")),
            "timestamp": l.get("timestamp").isoformat() if isinstance(l.get("timestamp"), datetime) else str(l.get("timestamp", ""))
        })
    return res
