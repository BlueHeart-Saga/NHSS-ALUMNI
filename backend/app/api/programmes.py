# NHSS Alumni Platform - Standalone Programmes Management Module
import re
import csv
import io
import secrets
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from bson import ObjectId

from app.core.database import get_db
from app.middleware.auth import get_current_user, get_current_user_optional

router = APIRouter(prefix="/programmes", tags=["Programmes Management"])

def serialize_doc(doc: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if not doc:
        return {}
    res = dict(doc)
    if "_id" in res:
        res["id"] = str(res["_id"])
        del res["_id"]
    for k, v in list(res.items()):
        if isinstance(v, datetime):
            res[k] = v.isoformat()
        elif isinstance(v, ObjectId):
            res[k] = str(v)
    return res

def generate_slug(title: str) -> str:
    clean = re.sub(r"[^\w\s-]", "", title.lower())
    slug = re.sub(r"[\s_-]+", "-", clean).strip("-")
    return slug or "programme"

# --- Pydantic Schemas ---
class FamilyMemberSchema(BaseModel):
    name: str = Field(..., example="Ananya")
    relationship: str = Field(..., example="DAUGHTER") # SPOUSE, SON, DAUGHTER, PARENT, SIBLING, OTHER
    age: Optional[int] = Field(None, example=12)
    gender: Optional[str] = Field(None, example="Female")
    notes: Optional[str] = None

class CreateProgrammeRequest(BaseModel):
    title: str = Field(..., example="Microsoft, Google & Zoho Orientation Programme")
    title_ta: Optional[str] = Field(None, example="உலகளாவிய கல்வி மற்றும் தொழில்நுட்ப வாய்ப்புகள்")
    description: str = Field(..., example="Orientation on tech and educational opportunities for alumni and family.")
    description_ta: Optional[str] = None
    category: str = Field("Career Guidance & Tech", example="Career Guidance & Tech")
    image_url: Optional[str] = None
    mode: str = Field("HYBRID", example="HYBRID") # ONLINE, IN_PERSON, HYBRID
    venue: Optional[str] = Field(None, example="NHSS Main Auditorium, Chennai")
    online_link: Optional[str] = Field(None, example="https://meet.google.com/xyz-abc-def")
    schedule_text: Optional[str] = Field(None, example="Saturday, 10:00 AM - 1:00 PM IST")
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    registration_deadline: Optional[str] = None
    capacity_limit: Optional[int] = Field(None, example=200)
    allow_family: bool = True
    allowed_family_types: List[str] = Field(default_factory=lambda: ["SPOUSE", "SON", "DAUGHTER", "PARENT", "SIBLING"])
    visibility: str = Field("PUBLIC", example="PUBLIC") # PUBLIC, UNLISTED, INVITATION_ONLY
    is_featured: bool = False
    status: str = Field("PUBLISHED", example="PUBLISHED") # DRAFT, PUBLISHED, REGISTRATION_OPEN, REGISTRATION_CLOSED, COMPLETED, ARCHIVED

class RegisterProgrammeRequest(BaseModel):
    notes: Optional[str] = None
    family_members: List[FamilyMemberSchema] = Field(default_factory=list)

class CreateInviteRequest(BaseModel):
    max_uses: Optional[int] = Field(None, example=50)
    expires_at: Optional[str] = None # ISO format string

# --- PUBLIC ENDPOINTS ---

@router.get("/public")
async def get_public_programmes(
    is_featured: Optional[bool] = Query(None),
    limit: int = Query(20, ge=1, le=100)
):
    """Retrieve published public programmes for visitors and homepage highlights"""
    db = get_db()
    query: Dict[str, Any] = {
        "visibility": "PUBLIC",
        "status": {"$in": ["PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "COMPLETED"]}
    }
    if is_featured is not None:
        query["is_featured"] = is_featured

    cursor = db.programmes.find(query).sort("created_at", -1).limit(limit)
    items = await cursor.to_list(length=limit)
    return [serialize_doc(i) for i in items]

@router.get("/public/{slug_or_id}")
async def get_public_programme_detail(slug_or_id: str):
    """Retrieve public programme details by slug or ID"""
    db = get_db()
    query = {"$or": [{"slug": slug_or_id}, {"visibility": "PUBLIC"}]}
    if ObjectId.is_valid(slug_or_id):
        query["$or"].append({"_id": ObjectId(slug_or_id)})
    
    prog = await db.programmes.find_one({"$or": [{"slug": slug_or_id}] if not ObjectId.is_valid(slug_or_id) else [{"slug": slug_or_id}, {"_id": ObjectId(slug_or_id)}]})
    if not prog:
        raise HTTPException(status_code=404, detail="Programme not found")
    
    if prog.get("visibility") == "INVITATION_ONLY":
        # Allow viewing minimal details if unlisted or return public profile
        pass

    return serialize_doc(prog)

@router.get("/invite/{token}")
async def resolve_programme_invite(token: str):
    """Resolve invitation token to programme details for invitees"""
    db = get_db()
    invite = await db.programme_invites.find_one({"token": token, "is_revoked": False})
    if not invite:
        raise HTTPException(status_code=404, detail="Invalid or expired invitation link.")
    
    # Check expiry
    if invite.get("expires_at"):
        exp = invite["expires_at"]
        if isinstance(exp, str):
            exp = datetime.fromisoformat(exp.replace("Z", "+00:00"))
        if exp and datetime.now(timezone.utc) > exp:
            raise HTTPException(status_code=400, detail="This invitation link has expired.")

    # Check max uses
    if invite.get("max_uses") and invite.get("use_count", 0) >= invite["max_uses"]:
        raise HTTPException(status_code=400, detail="This invitation link has reached its maximum usage limit.")

    prog = await db.programmes.find_one({"_id": ObjectId(invite["programme_id"])})
    if not prog:
        raise HTTPException(status_code=404, detail="Associated programme no longer exists.")

    res = serialize_doc(prog)
    res["invite_token"] = token
    return res

# --- ALUMNI ENDPOINTS ---

@router.get("/alumni")
async def get_alumni_programmes(current_user: dict = Depends(get_current_user)):
    """Retrieve all active programmes available to alumni"""
    db = get_db()
    query = {
        "status": {"$ne": "DRAFT"},
        "visibility": {"$in": ["PUBLIC", "UNLISTED"]}
    }
    cursor = db.programmes.find(query).sort("created_at", -1)
    items = await cursor.to_list(length=100)
    
    # Check user registration status for each
    user_id = current_user["user_id"]
    res_list = []
    for p in items:
        p_doc = serialize_doc(p)
        reg = await db.programme_registrations.find_one({
            "programme_id": str(p["_id"]),
            "user_id": user_id,
            "registration_status": {"$ne": "CANCELLED"}
        })
        p_doc["is_registered"] = bool(reg)
        p_doc["user_registration"] = serialize_doc(reg) if reg else None
        res_list.append(p_doc)

    return res_list

@router.get("/alumni/{slug_or_id}")
async def get_alumni_programme_detail(slug_or_id: str, current_user: dict = Depends(get_current_user)):
    """Retrieve programme details and user registration status"""
    db = get_db()
    query = []
    if ObjectId.is_valid(slug_or_id):
        query.append({"_id": ObjectId(slug_or_id)})
    query.append({"slug": slug_or_id})

    prog = await db.programmes.find_one({"$or": query})
    if not prog:
        raise HTTPException(status_code=404, detail="Programme not found")
    
    p_doc = serialize_doc(prog)
    user_id = current_user["user_id"]
    reg = await db.programme_registrations.find_one({
        "programme_id": str(prog["_id"]),
        "user_id": user_id,
        "registration_status": {"$ne": "CANCELLED"}
    })
    p_doc["is_registered"] = bool(reg)
    p_doc["user_registration"] = serialize_doc(reg) if reg else None
    return p_doc

@router.post("/{programme_id}/register")
async def register_for_programme(
    programme_id: str,
    req: RegisterProgrammeRequest,
    invite_token: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Register alumni and optional family members for a programme"""
    db = get_db()
    if not ObjectId.is_valid(programme_id):
        raise HTTPException(status_code=400, detail="Invalid programme ID")
    
    prog = await db.programmes.find_one({"_id": ObjectId(programme_id)})
    if not prog:
        raise HTTPException(status_code=404, detail="Programme not found")
    
    if prog.get("status") in ["DRAFT", "ARCHIVED", "REGISTRATION_CLOSED"]:
        raise HTTPException(status_code=400, detail="Registration for this programme is currently closed.")

    # Check invitation token if invitation only
    if prog.get("visibility") == "INVITATION_ONLY" or invite_token:
        if invite_token:
            inv = await db.programme_invites.find_one({"token": invite_token, "is_revoked": False})
            if not inv or str(inv.get("programme_id")) != programme_id:
                raise HTTPException(status_code=400, detail="Invalid invitation token for this programme.")
            # Increment invite use
            await db.programme_invites.update_one({"_id": inv["_id"]}, {"$inc": {"use_count": 1}})

    user_id = current_user["user_id"]
    alumni = await db.alumni.find_one({"user_id": user_id})
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})

    # Prevent duplicate active registration
    existing = await db.programme_registrations.find_one({
        "programme_id": programme_id,
        "user_id": user_id,
        "registration_status": {"$ne": "CANCELLED"}
    })
    if existing:
        raise HTTPException(status_code=400, detail="You are already registered for this programme.")

    # Capacity check
    capacity = prog.get("capacity_limit")
    if capacity:
        active_count = await db.programme_registrations.count_documents({
            "programme_id": programme_id,
            "registration_status": {"$in": ["REGISTERED", "APPROVED"]}
        })
        if active_count >= capacity:
            raise HTTPException(status_code=400, detail="Programme has reached maximum participant capacity.")

    full_name = (alumni.get("full_name") if alumni else None) or (user_doc.get("full_name") if user_doc else None) or "Alumni Member"
    email = (alumni.get("email") if alumni else None) or (user_doc.get("email") if user_doc else None) or ""
    mobile = (alumni.get("mobile") if alumni else None) or (user_doc.get("mobile") if user_doc else None) or ""
    batch_year = alumni.get("passing_year") if alumni else None

    family_list = [f.model_dump() for f in req.family_members]

    reg_doc = {
        "programme_id": programme_id,
        "user_id": user_id,
        "alumni_id": str(alumni["_id"]) if alumni else None,
        "school_id": str(prog.get("school_id") or ""),
        "registration_status": "REGISTERED", # REGISTERED, APPROVED, CANCELLED
        "primary_participant": {
            "full_name": full_name,
            "email": email,
            "mobile": mobile,
            "batch_year": batch_year
        },
        "family_members": family_list,
        "total_participants_count": 1 + len(family_list),
        "notes": req.notes,
        "registered_at": datetime.now(timezone.utc)
    }

    res = await db.programme_registrations.insert_one(reg_doc)
    reg_doc["_id"] = res.inserted_id

    # Update programme registration count
    await db.programmes.update_one({"_id": prog["_id"]}, {"$inc": {"registered_count": 1}})

    return serialize_doc(reg_doc)

@router.get("/my-registrations")
async def get_my_programme_registrations(current_user: dict = Depends(get_current_user)):
    """List all programme registrations for the current alumni"""
    db = get_db()
    user_id = current_user["user_id"]
    cursor = db.programme_registrations.find({"user_id": user_id}).sort("registered_at", -1)
    regs = await cursor.to_list(length=100)

    results = []
    for r in regs:
        r_doc = serialize_doc(r)
        prog = await db.programmes.find_one({"_id": ObjectId(r["programme_id"])})
        r_doc["programme"] = serialize_doc(prog) if prog else None
        results.append(r_doc)

    return results

@router.delete("/my-registrations/{registration_id}")
async def cancel_my_programme_registration(
    registration_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Cancel an active programme registration"""
    db = get_db()
    if not ObjectId.is_valid(registration_id):
        raise HTTPException(status_code=400, detail="Invalid registration ID")

    reg = await db.programme_registrations.find_one({
        "_id": ObjectId(registration_id),
        "user_id": current_user["user_id"]
    })
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")

    await db.programme_registrations.update_one(
        {"_id": ObjectId(registration_id)},
        {"$set": {"registration_status": "CANCELLED", "cancelled_at": datetime.now(timezone.utc)}}
    )
    return {"message": "Programme registration cancelled successfully."}

# --- ADMIN ENDPOINTS ---

@router.post("/upload-image")
async def upload_programme_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload poster/banner image for a programme."""
    user_roles = current_user.get("roles", [])
    if not any(role in user_roles for role in ["SCHOOL_ADMIN", "SUPER_ADMIN", "PRIMARY_DEVELOPER", "DEVELOPER"]):
        raise HTTPException(status_code=403, detail="Permission denied")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file provided")

    from app.services.azure_blob import blob_service
    main_url, thumb_url, _ = await blob_service.upload_image(
        file_content=content,
        filename=file.filename or "programme_image.jpg",
        content_type=file.content_type or "image/jpeg",
        school_id="programmes",
        event_id="poster"
    )
    return {"image_url": main_url, "thumb_url": thumb_url}


@router.get("/admin")
async def admin_get_programmes(
    status_filter: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Admin endpoint to list all programmes"""
    db = get_db()
    query = {}
    if status_filter:
        query["status"] = status_filter

    cursor = db.programmes.find(query).sort("created_at", -1)
    items = await cursor.to_list(length=200)

    results = []
    for p in items:
        p_doc = serialize_doc(p)
        reg_count = await db.programme_registrations.count_documents({
            "programme_id": str(p["_id"]),
            "registration_status": {"$ne": "CANCELLED"}
        })
        p_doc["total_registrations"] = reg_count
        results.append(p_doc)

    return results

@router.post("/admin", status_code=status.HTTP_201_CREATED)
async def admin_create_programme(
    req: CreateProgrammeRequest,
    current_user: dict = Depends(get_current_user)
):
    """Admin endpoint to create a new programme"""
    db = get_db()
    base_slug = generate_slug(req.title)
    slug = base_slug
    counter = 1
    while await db.programmes.find_one({"slug": slug}):
        slug = f"{base_slug}-{counter}"
        counter += 1

    now = datetime.now(timezone.utc)
    prog_doc = {
        "school_id": current_user.get("school_id"),
        "title": req.title.strip(),
        "title_ta": req.title_ta.strip() if req.title_ta else None,
        "slug": slug,
        "description": req.description.strip(),
        "description_ta": req.description_ta.strip() if req.description_ta else None,
        "category": req.category,
        "image_url": req.image_url,
        "mode": req.mode,
        "venue": req.venue,
        "online_link": req.online_link,
        "schedule_text": req.schedule_text,
        "start_date": req.start_date,
        "end_date": req.end_date,
        "registration_deadline": req.registration_deadline,
        "capacity_limit": req.capacity_limit,
        "allow_family": req.allow_family,
        "allowed_family_types": req.allowed_family_types,
        "visibility": req.visibility,
        "is_featured": req.is_featured,
        "status": req.status,
        "created_by": current_user["user_id"],
        "created_at": now,
        "updated_at": now
    }

    res = await db.programmes.insert_one(prog_doc)
    prog_doc["_id"] = res.inserted_id
    return serialize_doc(prog_doc)

@router.get("/admin/{programme_id}")
async def admin_get_programme_detail(
    programme_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Admin endpoint to view single programme details with stats"""
    db = get_db()
    if not ObjectId.is_valid(programme_id):
        raise HTTPException(status_code=400, detail="Invalid programme ID")

    prog = await db.programmes.find_one({"_id": ObjectId(programme_id)})
    if not prog:
        raise HTTPException(status_code=404, detail="Programme not found")

    p_doc = serialize_doc(prog)
    p_doc["total_registrations"] = await db.programme_registrations.count_documents({
        "programme_id": programme_id,
        "registration_status": {"$ne": "CANCELLED"}
    })
    return p_doc

@router.put("/admin/{programme_id}")
async def admin_update_programme(
    programme_id: str,
    req: CreateProgrammeRequest,
    current_user: dict = Depends(get_current_user)
):
    """Admin endpoint to update an existing programme"""
    db = get_db()
    if not ObjectId.is_valid(programme_id):
        raise HTTPException(status_code=400, detail="Invalid programme ID")

    existing = await db.programmes.find_one({"_id": ObjectId(programme_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Programme not found")

    update_doc = {
        "title": req.title.strip(),
        "title_ta": req.title_ta.strip() if req.title_ta else None,
        "description": req.description.strip(),
        "description_ta": req.description_ta.strip() if req.description_ta else None,
        "category": req.category,
        "image_url": req.image_url,
        "mode": req.mode,
        "venue": req.venue,
        "online_link": req.online_link,
        "schedule_text": req.schedule_text,
        "start_date": req.start_date,
        "end_date": req.end_date,
        "registration_deadline": req.registration_deadline,
        "capacity_limit": req.capacity_limit,
        "allow_family": req.allow_family,
        "allowed_family_types": req.allowed_family_types,
        "visibility": req.visibility,
        "is_featured": req.is_featured,
        "status": req.status,
        "updated_at": datetime.now(timezone.utc)
    }

    await db.programmes.update_one({"_id": ObjectId(programme_id)}, {"$set": update_doc})
    updated = await db.programmes.find_one({"_id": ObjectId(programme_id)})
    return serialize_doc(updated)

@router.delete("/admin/{programme_id}")
async def admin_delete_programme(
    programme_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Admin endpoint to archive/delete a programme"""
    db = get_db()
    if not ObjectId.is_valid(programme_id):
        raise HTTPException(status_code=400, detail="Invalid programme ID")

    await db.programmes.update_one({"_id": ObjectId(programme_id)}, {"$set": {"status": "ARCHIVED", "archived_at": datetime.now(timezone.utc)}})
    return {"message": "Programme archived successfully."}

@router.post("/admin/{programme_id}/invites")
async def admin_create_programme_invite(
    programme_id: str,
    req: CreateInviteRequest,
    current_user: dict = Depends(get_current_user)
):
    """Admin endpoint to generate a secure, unique invitation token for a programme"""
    db = get_db()
    if not ObjectId.is_valid(programme_id):
        raise HTTPException(status_code=400, detail="Invalid programme ID")

    prog = await db.programmes.find_one({"_id": ObjectId(programme_id)})
    if not prog:
        raise HTTPException(status_code=404, detail="Programme not found")

    token = secrets.token_urlsafe(16)
    invite_doc = {
        "programme_id": programme_id,
        "token": token,
        "created_by": current_user["user_id"],
        "max_uses": req.max_uses,
        "use_count": 0,
        "expires_at": req.expires_at,
        "is_revoked": False,
        "created_at": datetime.now(timezone.utc)
    }

    res = await db.programme_invites.insert_one(invite_doc)
    invite_doc["_id"] = res.inserted_id
    return serialize_doc(invite_doc)

@router.get("/admin/{programme_id}/invites")
async def admin_list_programme_invites(
    programme_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Admin endpoint to list invitation links generated for a programme"""
    db = get_db()
    cursor = db.programme_invites.find({"programme_id": programme_id}).sort("created_at", -1)
    items = await cursor.to_list(length=100)
    return [serialize_doc(i) for i in items]

@router.post("/admin/invites/{invite_id}/revoke")
async def admin_revoke_programme_invite(
    invite_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Admin endpoint to revoke an active invitation token"""
    db = get_db()
    if not ObjectId.is_valid(invite_id):
        raise HTTPException(status_code=400, detail="Invalid invite ID")

    await db.programme_invites.update_one({"_id": ObjectId(invite_id)}, {"$set": {"is_revoked": True, "revoked_at": datetime.now(timezone.utc)}})
    return {"message": "Invitation link revoked successfully."}

@router.get("/admin/{programme_id}/registrations")
async def admin_get_programme_registrations(
    programme_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Admin endpoint to view all participants registered for a programme"""
    db = get_db()
    if not ObjectId.is_valid(programme_id):
        raise HTTPException(status_code=400, detail="Invalid programme ID")

    prog = await db.programmes.find_one({"_id": ObjectId(programme_id)})
    if not prog:
        raise HTTPException(status_code=404, detail="Programme not found")

    cursor = db.programme_registrations.find({"programme_id": programme_id}).sort("registered_at", -1)
    items = await cursor.to_list(length=500)
    return [serialize_doc(i) for i in items]

@router.get("/admin/{programme_id}/export-registrations")
async def admin_export_programme_registrations(
    programme_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Admin endpoint to download CSV report of all registered participants"""
    db = get_db()
    if not ObjectId.is_valid(programme_id):
        raise HTTPException(status_code=400, detail="Invalid programme ID")

    prog = await db.programmes.find_one({"_id": ObjectId(programme_id)})
    if not prog:
        raise HTTPException(status_code=404, detail="Programme not found")

    cursor = db.programme_registrations.find({
        "programme_id": programme_id,
        "registration_status": {"$ne": "CANCELLED"}
    }).sort("registered_at", -1)
    regs = await cursor.to_list(length=1000)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Registration ID", "Alumni Name", "Mobile", "Email", "Batch Year",
        "Participant Type", "Participant Name", "Relationship", "Age", "Gender",
        "Registration Date", "Status"
    ])

    for r in regs:
        pri = r.get("primary_participant", {})
        reg_date = r.get("registered_at", "").isoformat() if isinstance(r.get("registered_at"), datetime) else str(r.get("registered_at", ""))
        
        # Primary Alumni row
        writer.writerow([
            str(r["_id"]),
            pri.get("full_name", ""),
            pri.get("mobile", ""),
            pri.get("email", ""),
            pri.get("batch_year", ""),
            "Primary Alumni",
            pri.get("full_name", ""),
            "Self",
            "",
            "",
            reg_date,
            r.get("registration_status", "REGISTERED")
        ])

        # Family Member rows
        for fam in r.get("family_members", []):
            writer.writerow([
                str(r["_id"]),
                pri.get("full_name", ""),
                pri.get("mobile", ""),
                pri.get("email", ""),
                pri.get("batch_year", ""),
                "Family Member",
                fam.get("name", ""),
                fam.get("relationship", ""),
                fam.get("age", ""),
                fam.get("gender", ""),
                reg_date,
                r.get("registration_status", "REGISTERED")
            ])

    output.seek(0)
    filename = f"programme_registrations_{prog.get('slug', 'export')}.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8-sig")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

