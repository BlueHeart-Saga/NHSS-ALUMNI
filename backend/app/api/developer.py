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

    res = []
    for s in schools_list:
        s_id = str(s["_id"])
        admin_count = await db.users.count_documents({
            "school_id": s_id,
            "roles": "SCHOOL_ADMIN"
        })
        alumni_count = await db.alumni.count_documents({"school_id": s_id})
        batches_count = await db.batches.count_documents({"school_id": s_id})
        events_count = await db.events.count_documents({"school_id": s_id})

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
        admin_mobile = request.admin_mobile.strip()
        if not admin_mobile.startswith("+"):
            admin_mobile = f"+91{admin_mobile.lstrip('0')}"

        admin_user = await db.users.find_one({"mobile": admin_mobile})
        if admin_user:
            admin_user_id = str(admin_user["_id"])
            await db.users.update_one(
                {"_id": admin_user["_id"]},
                {"$set": {"school_id": school_id, "roles": ["SCHOOL_ADMIN"]}}
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
    mobile = request.mobile.strip()
    if not mobile.startswith("+"):
        mobile = f"+91{mobile.lstrip('0')}"

    now = datetime.now(timezone.utc)
    # Find or create user
    user = await db.users.find_one({"mobile": mobile})
    if user:
        user_id = str(user["_id"])
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"school_id": target_school_id, "roles": ["SCHOOL_ADMIN"]}}
        )
    else:
        new_u = {
            "school_id": target_school_id,
            "mobile": mobile,
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
