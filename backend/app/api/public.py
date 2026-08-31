from fastapi import APIRouter
from datetime import datetime, timezone
from app.schemas.models import SchoolAdminEnquiryRequest, ContactEnquiryRequest
from app.core.database import get_db
from app.services.email import send_contact_thank_you_email, send_contact_admin_notification_email

router = APIRouter(prefix="/public", tags=["Public Portal"])

@router.get("/stats")
async def get_public_stats():
    db = get_db()

    school = await db.schools.find_one({}) or {}
    total_alumni = await db.alumni.count_documents({"verification_status": "APPROVED"})
    total_batches = await db.batches.count_documents({})
    total_events = await db.events.count_documents({})

    est_year = school.get("established_year") or 2005
    years_connected = max(1, 2026 - est_year)

    return {
        "school_name": school.get("name") or "NHSS SCHOOL",
        "school_code": school.get("code") or "NHSS",
        "logo_url": school.get("logo_url") or "/assets/logo/logo_tamil.png",
        "cover_url": school.get("cover_url") or "/school-images/school-door.png",
        "description": school.get("description") or "Stay Connected. Stay Part of the Story.",
        "address": school.get("address") or "Main Campus, School Alumni Building, Tamil Nadu",
        "contact_phone": school.get("contact_phone") or school.get("phone") or "+91 98765 43210",
        "contact_email": school.get("contact_email") or school.get("email") or "info@nhssalumni.com",
        "email": school.get("contact_email") or school.get("email") or "info@nhssalumni.com",
        "total_alumni": total_alumni,
        "total_batches": total_batches,
        "total_events": total_events,
        "years_connected": years_connected
    }

@router.get("/events")
async def get_public_events():
    db = get_db()
    events = await db.events.find({"status": {"$in": ["PUBLISHED", "UPCOMING"]}}).sort("event_date", 1).to_list(length=10)
    
    res = []
    for ev in events:
        att_count = await db.event_attendance.count_documents({
            "event_id": str(ev["_id"]),
            "rsvp_status": "ATTENDING"
        })
        batch_name = "School-wide"
        if ev.get("batch_id"):
            b = await db.batches.find_one({"_id": ev["batch_id"]})
            if b:
                batch_name = b.get("name", "Batch")

        res.append({
            "id": str(ev["_id"]),
            "title": ev.get("title"),
            "batch_name": batch_name,
            "description": ev.get("description"),
            "event_date": ev.get("event_date"),
            "start_time": ev.get("start_time"),
            "venue": ev.get("venue"),
            "attending_count": att_count,
            "cover_image_url": ev.get("cover_image_url") or "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80",
            "registration_url": ev.get("registration_url")
        })
    return res

@router.get("/batches")
async def get_public_batches():
    db = get_db()
    from bson import ObjectId
    batches = await db.batches.find({}).sort("passing_year", -1).to_list(length=100)

    # 1. Aggregate member counts and distinct cities per passing_year
    pipeline = [
        {"$match": {"verification_status": "APPROVED"}},
        {"$group": {
            "_id": "$passing_year",
            "count": {"$sum": 1},
            "cities": {"$addToSet": "$current_city"}
        }}
    ]
    counts_cursor = db.alumni.aggregate(pipeline)
    counts_list = await counts_cursor.to_list(length=1000)
    counts_map = {}
    for c in counts_list:
        if c.get("_id"):
            cities = [ct for ct in c.get("cities", []) if ct]
            counts_map[c["_id"]] = {
                "count": c.get("count", 0),
                "cities_count": len(cities)
            }

    # 2. Aggregate upcoming events per batch_id
    events_pipeline = [
        {"$match": {"status": {"$in": ["PUBLISHED", "UPCOMING"]}}},
        {"$group": {"_id": "$batch_id", "count": {"$sum": 1}}}
    ]
    events_cursor = db.events.aggregate(events_pipeline)
    events_list = await events_cursor.to_list(length=1000)
    events_map = {str(e["_id"]): e.get("count", 0) for e in events_list if e.get("_id")}

    # 3. Collect all coordinator alumni IDs
    all_coord_ids = []
    for b in batches:
        for c in b.get("coordinators", []):
            if isinstance(c, str):
                try:
                    all_coord_ids.append(ObjectId(c))
                except Exception:
                    all_coord_ids.append(c)

    coords_map = {}
    if all_coord_ids:
        coord_alumni = await db.alumni.find({"_id": {"$in": all_coord_ids}}).to_list(length=len(all_coord_ids))
        for ca in coord_alumni:
            coords_map[str(ca["_id"])] = {
                "id": str(ca["_id"]),
                "full_name": ca.get("full_name", "Coordinator"),
                "profile_photo_url": ca.get("profile_photo_url"),
                "profession": ca.get("profession"),
                "current_city": ca.get("current_city")
            }

    res = []
    for b in batches:
        b_id = str(b["_id"])
        yr = b.get("passing_year")
        stats = counts_map.get(yr, {"count": 0, "cities_count": 0})

        c_profiles = []
        for c in b.get("coordinators", []):
            cid = str(c)
            if cid in coords_map:
                c_profiles.append(coords_map[cid])

        res.append({
            "id": b_id,
            "name": b.get("name"),
            "passing_year": yr,
            "description": b.get("description"),
            "total_members": stats["count"],
            "cities_count": stats["cities_count"],
            "upcoming_events_count": events_map.get(b_id, 0),
            "coordinator_profiles": c_profiles
        })
    return res

@router.get("/highlights")
async def get_public_highlights():
    db = get_db()
    alumni = await db.alumni.find({"verification_status": "APPROVED"}).to_list(length=8)

    res = []
    for a in alumni:
        res.append({
            "id": str(a["_id"]),
            "full_name": a.get("full_name"),
            "passing_year": a.get("passing_year"),
            "profession": a.get("profession") or "Alumnus",
            "current_city": a.get("current_city") or "N/A",
            "profile_photo_url": a.get("profile_photo_url") or f"https://ui-avatars.com/api/?name={a.get('full_name')}&background=111111&color=ffffff"
        })
    return res

@router.get("/memories")
async def get_public_memories():
    db = get_db()
    memories = await db.memories.find({}).to_list(length=12)

    res = []
    for m in memories:
        res.append({
            "id": str(m["_id"]),
            "title": m.get("title", "Memory"),
            "image_url": m.get("image_url"),
            "uploader_name": m.get("uploader_name", "Alumnus")
        })
    return res

@router.get("/announcements")
async def get_public_announcements():
    db = get_db()
    announcements = await db.announcements.find({"target": "SCHOOL"}).sort("created_at", -1).to_list(length=6)

    res = []
    for a in announcements:
        res.append({
            "id": str(a["_id"]),
            "title": a.get("title"),
            "content": a.get("content"),
            "created_at": str(a.get("created_at"))
        })
    return res

@router.post("/school-admin-enquiry")
async def submit_school_admin_enquiry(request: SchoolAdminEnquiryRequest):
    """Public endpoint to submit School Admin Access Enquiry."""
    db = get_db()
    now = datetime.now(timezone.utc)
    
    enquiry_doc = {
        "full_name": request.full_name.strip(),
        "email": request.email.strip().lower(),
        "mobile": request.mobile.strip(),
        "responsibility": request.responsibility.strip(),
        "school_name": request.school_name.strip(),
        "city": request.city.strip() if request.city else None,
        "state": request.state.strip() if request.state else None,
        "country": request.country.strip() if request.country else "India",
        "message": request.message.strip() if request.message else None,
        "status": "PENDING",
        "notes": "",
        "created_at": now
    }

    res = await db.school_admin_enquiries.insert_one(enquiry_doc)
    
    return {
        "success": True,
        "message": "Your School Admin access request has been submitted successfully! Our platform team will review your details and contact you shortly.",
        "enquiry_id": str(res.inserted_id)
    }

@router.post("/contact-enquiry")
async def submit_contact_enquiry(request: ContactEnquiryRequest):
    """Public endpoint to submit general contact us inquiry with SMTP emails."""
    db = get_db()
    now = datetime.now(timezone.utc)

    enquiry_doc = {
        "full_name": request.full_name.strip(),
        "email": request.email.strip().lower(),
        "mobile": request.mobile.strip() if request.mobile else None,
        "message": request.message.strip(),
        "status": "UNREAD",
        "created_at": now
    }

    res = await db.contact_enquiries.insert_one(enquiry_doc)

    # 1. Dispatch Auto Thank-You email via SMTP to visitor
    send_contact_thank_you_email(
        to_email=request.email.strip().lower(),
        sender_name=request.full_name.strip(),
        message_text=request.message.strip()
    )

    # 2. Dispatch Admin Notification email via SMTP to admin
    send_contact_admin_notification_email(
        sender_name=request.full_name.strip(),
        sender_email=request.email.strip().lower(),
        sender_mobile=request.mobile.strip() if request.mobile else "N/A",
        message_text=request.message.strip()
    )

    return {
        "success": True,
        "message": "Thank you for reaching out! Your message has been received and a confirmation email was sent to your inbox.",
        "inquiry_id": str(res.inserted_id)
    }
