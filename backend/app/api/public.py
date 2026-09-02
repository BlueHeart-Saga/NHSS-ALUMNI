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
        "established_year": est_year,
        "logo_url": school.get("logo_url") or "/assets/logo/logo_tamil.png",
        "cover_url": school.get("cover_url") or "/school-images/school-door.png",
        "description": school.get("description") or "1924 ஆம் ஆண்டு இந்து நாடார் துவக்கப்பள்ளி தொடங்கப்பட்டது முதல் நடராஜன் மேல்நிலைப்பள்ளி வரை நூற்றாண்டு கண்டது நமது பள்ளி. 23/07/1956 ல் கர்மவீரர் காமராஜர் அவர்களால் இலவச மதிய உணவு திட்டம் தொடங்கப்பட்ட பெருமைமிக்க பள்ளி.",
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
    """Fetch upcoming events (event_date >= today or status=PUBLISHED/UPCOMING)."""
    db = get_db()
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    events = await db.events.find({
        "status": {"$in": ["PUBLISHED", "UPCOMING"]},
        "event_date": {"$gte": today_str}
    }).sort("event_date", 1).to_list(length=10)
    
    res = []
    for ev in events:
        att_count = await db.event_attendance.count_documents({
            "event_id": str(ev["_id"]),
            "rsvp_status": "ATTENDING"
        })
        batch_name = "School-wide"
        if ev.get("batch_id"):
            from bson import ObjectId
            try:
                b = await db.batches.find_one({"_id": ObjectId(ev["batch_id"]) if isinstance(ev["batch_id"], str) else ev["batch_id"]})
                if b:
                    batch_name = b.get("name", "Batch")
            except Exception:
                pass

        res.append({
            "id": str(ev["_id"]),
            "title": ev.get("title"),
            "batch_name": batch_name,
            "description": ev.get("description"),
            "event_date": ev.get("event_date"),
            "start_time": ev.get("start_time"),
            "venue": ev.get("venue"),
            "attending_count": att_count,
            "cover_image_url": ev.get("cover_image_url") or "/school-images/banner.png",
            "registration_url": ev.get("registration_url")
        })
    return res

@router.get("/past-events")
async def get_public_past_events():
    """Fetch past/expired events (event_date < today) for Memories & Past Event Recaps."""
    db = get_db()
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    events = await db.events.find({
        "event_date": {"$lt": today_str}
    }).sort("event_date", -1).to_list(length=50)

    res = []
    for ev in events:
        att_count = await db.event_attendance.count_documents({
            "event_id": str(ev["_id"]),
            "rsvp_status": "ATTENDING"
        })
        res.append({
            "id": str(ev["_id"]),
            "title": ev.get("title"),
            "description": ev.get("description"),
            "event_date": ev.get("event_date"),
            "start_time": ev.get("start_time"),
            "end_time": ev.get("end_time"),
            "venue": ev.get("venue"),
            "cover_image_url": ev.get("cover_image_url"),
            "attending_count": att_count,
            "status": "PAST"
        })
    return res

@router.get("/school-events")
async def get_public_school_events():
    """Fetch public official school events and celebrations."""
    db = get_db()
    cursor = db.school_events.find({}).sort("event_date", -1)
    events_list = await cursor.to_list(length=100)
    res = []
    for doc in events_list:
        res.append({
            "id": str(doc["_id"]),
            "title": doc.get("title", ""),
            "category": doc.get("category", "ANNUAL_DAY"),
            "event_date": doc.get("event_date", ""),
            "end_date": doc.get("end_date"),
            "start_time": doc.get("start_time", "09:00 AM"),
            "end_time": doc.get("end_time", "04:00 PM"),
            "venue": doc.get("venue", "School Campus"),
            "chief_guest": doc.get("chief_guest"),
            "target_audience": doc.get("target_audience", "ALL_STUDENTS"),
            "description": doc.get("description", ""),
            "cover_image_url": doc.get("cover_image_url"),
            "gallery_urls": doc.get("gallery_urls", []),
            "status": doc.get("status", "UPCOMING")
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

        # Fetch min 5-6 sample alumni members for this batch
        s_members = []
        if yr:
            m_list = await db.alumni.find({"passing_year": yr, "verification_status": "APPROVED"}).to_list(length=6)
            for m in m_list:
                s_members.append({
                    "id": str(m["_id"]),
                    "full_name": m.get("full_name", "Alumnus"),
                    "profile_photo_url": m.get("profile_photo_url"),
                    "profession": m.get("profession") or "Alumnus",
                    "current_city": m.get("current_city") or "Kovilpatti",
                    "passing_year": m.get("passing_year")
                })

        res.append({
            "id": b_id,
            "name": b.get("name"),
            "passing_year": yr,
            "description": b.get("description"),
            "total_members": stats["count"],
            "cities_count": stats["cities_count"],
            "upcoming_events_count": events_map.get(b_id, 0),
            "coordinator_profiles": c_profiles,
            "sample_members": s_members
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
            "profile_photo_url": a.get("profile_photo_url")
        })
    return res

@router.get("/memories")
async def get_public_memories():
    """Fetch approved photo memories for public photo wall."""
    db = get_db()
    memories = await db.memories.find({
        "status": {"$in": ["APPROVED", "PUBLISHED"]}
    }).sort("created_at", -1).to_list(length=50)

    res = []
    for m in memories:
        cover = m.get("cover_image_url") or m.get("image_url") or ""
        urls = m.get("media_urls") or []
        if not urls and cover:
            urls = [cover]

        res.append({
            "id": str(m["_id"]),
            "title": m.get("title", "School Memory"),
            "album_name": m.get("album_name", "Campus Memories"),
            "media_type": m.get("media_type", "IMAGE"),
            "description": m.get("description", ""),
            "batch_year": str(m.get("batch_year", m.get("batch_id", ""))),
            "image_url": cover,
            "cover_image_url": cover,
            "media_urls": urls,
            "video_url": m.get("video_url"),
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

@router.get("/association-team")
async def get_public_association_team():
    """Public endpoint to fetch active Alumni Association Team leadership members."""
    db = get_db()
    school = await db.schools.find_one({}) or {}
    school_id = str(school["_id"]) if school and "_id" in school else None

    query = {"status": "ACTIVE"}
    if school_id:
        query["school_id"] = school_id

    cursor = db.association_team.find(query).sort([("display_order", 1), ("created_at", 1)])
    members = await cursor.to_list(length=100)

    res = []
    for m in members:
        res.append({
            "id": str(m["_id"]),
            "school_id": m.get("school_id"),
            "profile_type": m.get("profile_type", "common"),
            "alumni_id": str(m.get("alumni_id")) if m.get("alumni_id") else None,
            "full_name": m.get("full_name", "Association Leader"),
            "photo_url": m.get("photo_url"),
            "email": m.get("email"),
            "mobile": m.get("mobile"),
            "location": m.get("location"),
            "occupation": m.get("occupation"),
            "batch_year": m.get("batch_year"),
            "position": m.get("position", "Committee Member"),
            "responsibility": m.get("responsibility"),
            "term_start": m.get("term_start", "2024"),
            "term_end": m.get("term_end", "2026"),
            "display_order": m.get("display_order", 1),
            "bio": m.get("bio"),
            "status": m.get("status", "ACTIVE"),
            "created_at": m.get("created_at", datetime.now(timezone.utc))
        })
    return res

@router.get("/rank-holders")
async def get_public_rank_holders():
    """Public endpoint to fetch active School Rank Holders / Achievers."""
    db = get_db()

    cursor = db.rank_holders.find({"status": "Active"}).sort([("academic_year", -1), ("class_standard", -1)])
    docs = await cursor.to_list(length=200)

    res = []
    for d in docs:
        res.append({
            "id": str(d["_id"]),
            "student_name": d.get("student_name"),
            "student_name_ta": d.get("student_name_ta"),
            "academic_year": d.get("academic_year"),
            "class_standard": d.get("class_standard"),
            "rank": d.get("rank"),
            "achievement_type": d.get("achievement_type"),
            "marks_percentage": d.get("marks_percentage"),
            "total_marks": d.get("total_marks"),
            "max_marks": d.get("max_marks"),
            "subject_stream": d.get("subject_stream"),
            "achievement_title": d.get("achievement_title"),
            "photograph": d.get("photograph"),
            "description": d.get("description"),
            "status": d.get("status", "Active")
        })
    return res
