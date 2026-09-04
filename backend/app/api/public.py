import asyncio
import logging
import time
from fastapi import APIRouter, BackgroundTasks, Response
from datetime import datetime, timezone
from bson import ObjectId

from app.schemas.models import SchoolAdminEnquiryRequest, ContactEnquiryRequest
from app.core.database import get_db
from app.services.email import send_contact_thank_you_email, send_contact_admin_notification_email

logger = logging.getLogger("app.public")

router = APIRouter(prefix="/public", tags=["Public Portal"])

@router.get("/stats")
async def get_public_stats(response: Response):
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=120"
    start_time = time.perf_counter()

    cached_res = ttl_cache.get("public:stats")
    if cached_res is not None:
        total_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.info(f"endpoint=public_stats cache=HIT db_queries=0 total_time_ms={total_time_ms}")
        return cached_res

    db = get_db()

    school = await db.schools.find_one({}) or {}
    total_alumni = await db.alumni.count_documents({"verification_status": "APPROVED"})
    total_batches = await db.batches.count_documents({})
    total_events = await db.events.count_documents({})

    est_year = school.get("established_year") or 2005
    years_connected = max(1, 2026 - est_year)

    res = {
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

    ttl_cache.set("public:stats", res, ttl=60)
    total_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
    return res

@router.get("/events")
async def get_public_events(response: Response):
    """Fetch upcoming events (event_date >= today or status=PUBLISHED/UPCOMING). Batch attendance and batch name lookups in 3 queries total."""
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=120"
    start_time = time.perf_counter()
    db = get_db()
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Query 1: Fetch events list
    events = await db.events.find({
        "status": {"$in": ["PUBLISHED", "UPCOMING"]},
        "event_date": {"$gte": today_str}
    }).sort("event_date", 1).to_list(length=10)
    
    if not events:
        total_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.info(f"endpoint=public_events db_queries=1 db_time_ms={total_time_ms} total_time_ms={total_time_ms}")
        return []

    event_ids = [str(ev["_id"]) for ev in events]
    batch_ids = []
    for ev in events:
        if ev.get("batch_id"):
            b_id = ev["batch_id"]
            try:
                batch_ids.append(ObjectId(b_id) if isinstance(b_id, str) else b_id)
            except Exception:
                batch_ids.append(b_id)

    # Query 2: Single aggregation for attendance counts
    att_map = {}
    if event_ids:
        att_pipeline = [
            {"$match": {"event_id": {"$in": event_ids}, "rsvp_status": "ATTENDING"}},
            {"$group": {"_id": "$event_id", "count": {"$sum": 1}}}
        ]
        att_docs = await db.event_attendance.aggregate(att_pipeline).to_list(length=len(event_ids))
        att_map = {str(doc["_id"]): doc.get("count", 0) for doc in att_docs}

    # Query 3: Single query for batch details
    batch_map = {}
    if batch_ids:
        batch_docs = await db.batches.find({"_id": {"$in": batch_ids}}).to_list(length=len(batch_ids))
        for b in batch_docs:
            batch_map[str(b["_id"])] = b.get("name", "Batch")

    res = []
    for ev in events:
        ev_id = str(ev["_id"])
        att_count = att_map.get(ev_id, 0)
        batch_name = "School-wide"
        if ev.get("batch_id"):
            batch_name = batch_map.get(str(ev["batch_id"]), "Batch")

        res.append({
            "id": ev_id,
            "title": ev.get("title"),
            "title_ta": ev.get("title_ta"),
            "batch_name": batch_name,
            "description": ev.get("description"),
            "description_ta": ev.get("description_ta"),
            "event_date": ev.get("event_date"),
            "start_time": ev.get("start_time"),
            "venue": ev.get("venue"),
            "attending_count": att_count,
            "cover_image_url": ev.get("cover_image_url") or "/school-images/banner.png",
            "cover_image_url_ta": ev.get("cover_image_url_ta"),
            "registration_url": ev.get("registration_url")
        })

    total_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
    logger.info(f"endpoint=public_events db_queries=3 db_time_ms={total_time_ms} total_time_ms={total_time_ms}")
    return res

@router.get("/past-events")
async def get_public_past_events(response: Response):
    """Fetch past/expired events (event_date < today) for Memories & Past Event Recaps. Batch attendance counts in 2 queries total."""
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=120"
    start_time = time.perf_counter()
    db = get_db()
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Query 1: Fetch past events
    events = await db.events.find({
        "event_date": {"$lt": today_str}
    }).sort("event_date", -1).to_list(length=50)

    if not events:
        total_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.info(f"endpoint=public_past_events db_queries=1 db_time_ms={total_time_ms} total_time_ms={total_time_ms}")
        return []

    event_ids = [str(ev["_id"]) for ev in events]

    # Query 2: Single aggregation for attendance counts across all past events
    att_map = {}
    if event_ids:
        att_pipeline = [
            {"$match": {"event_id": {"$in": event_ids}, "rsvp_status": "ATTENDING"}},
            {"$group": {"_id": "$event_id", "count": {"$sum": 1}}}
        ]
        att_docs = await db.event_attendance.aggregate(att_pipeline).to_list(length=len(event_ids))
        att_map = {str(doc["_id"]): doc.get("count", 0) for doc in att_docs}

    res = []
    for ev in events:
        ev_id = str(ev["_id"])
        att_count = att_map.get(ev_id, 0)
        res.append({
            "id": ev_id,
            "title": ev.get("title"),
            "title_ta": ev.get("title_ta"),
            "description": ev.get("description"),
            "description_ta": ev.get("description_ta"),
            "event_date": ev.get("event_date"),
            "start_time": ev.get("start_time"),
            "end_time": ev.get("end_time"),
            "venue": ev.get("venue"),
            "cover_image_url": ev.get("cover_image_url"),
            "cover_image_url_ta": ev.get("cover_image_url_ta"),
            "attending_count": att_count,
            "status": "PAST"
        })

    total_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
    logger.info(f"endpoint=public_past_events db_queries=2 db_time_ms={total_time_ms} total_time_ms={total_time_ms}")
    return res

@router.get("/school-events")
async def get_public_school_events(response: Response):
    """Fetch public official school events and celebrations."""
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=120"

    db = get_db()
    cursor = db.school_events.find({}).sort("event_date", -1)
    events_list = await cursor.to_list(length=100)
    res = []
    for doc in events_list:
        res.append({
            "id": str(doc["_id"]),
            "title": doc.get("title", ""),
            "title_ta": doc.get("title_ta"),
            "category": doc.get("category", "ANNUAL_DAY"),
            "event_date": doc.get("event_date", ""),
            "end_date": doc.get("end_date"),
            "start_time": doc.get("start_time", "09:00 AM"),
            "end_time": doc.get("end_time", "04:00 PM"),
            "venue": doc.get("venue", "School Campus"),
            "chief_guest": doc.get("chief_guest"),
            "target_audience": doc.get("target_audience", "ALL_STUDENTS"),
            "description": doc.get("description", ""),
            "description_ta": doc.get("description_ta"),
            "cover_image_url": doc.get("cover_image_url"),
            "cover_image_url_ta": doc.get("cover_image_url_ta"),
            "gallery_urls": doc.get("gallery_urls", []),
            "status": doc.get("status", "UPCOMING")
        })
    return res

from app.core.cache import ttl_cache

@router.get("/batches")
async def get_public_batches(response: Response):
    """Fetch public batches. Serves warm responses from safe in-memory TTL cache or runs concurrent queries."""
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=120"
    start_time = time.perf_counter()

    cached_res = ttl_cache.get("public:batches")
    if cached_res is not None:
        total_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.info(f"endpoint=public_batches cache=HIT db_queries=0 total_time_ms={total_time_ms}")
        return cached_res

    db = get_db()


    # Strict Projections: Fetch only required fields to minimize network payload from Cosmos DB
    batch_projection = {"name": 1, "passing_year": 1, "description": 1, "coordinators": 1}
    sample_projection = {"full_name": 1, "profile_photo_url": 1, "profession": 1, "current_city": 1, "passing_year": 1}

    # Define tasks for concurrent parallel execution
    batches_task = db.batches.find({}, batch_projection).sort("passing_year", -1).to_list(length=100)
    
    counts_pipeline = [
        {"$match": {"verification_status": "APPROVED"}},
        {"$group": {
            "_id": "$passing_year",
            "count": {"$sum": 1},
            "cities": {"$addToSet": "$current_city"}
        }}
    ]
    counts_task = db.alumni.aggregate(counts_pipeline).to_list(length=1000)

    events_pipeline = [
        {"$match": {"status": {"$in": ["PUBLISHED", "UPCOMING"]}}},
        {"$group": {"_id": "$batch_id", "count": {"$sum": 1}}}
    ]
    events_task = db.events.aggregate(events_pipeline).to_list(length=1000)

    samples_task = db.alumni.find(
        {"verification_status": "APPROVED"},
        sample_projection
    ).sort("passing_year", -1).to_list(length=1000)

    # Run all 4 independent database queries concurrently in parallel
    batches, counts_list, events_list, all_samples = await asyncio.gather(
        batches_task, counts_task, events_task, samples_task
    )

    # Collect coordinator IDs
    all_coord_ids = []
    for b in batches:
        for c in b.get("coordinators", []):
            if c:
                try:
                    all_coord_ids.append(ObjectId(c) if isinstance(c, str) else c)
                except Exception:
                    all_coord_ids.append(c)

    coords_map = {}
    if all_coord_ids:
        coord_alumni = await db.alumni.find({"_id": {"$in": all_coord_ids}}, sample_projection).to_list(length=len(all_coord_ids))
        for ca in coord_alumni:
            coords_map[str(ca["_id"])] = {
                "id": str(ca["_id"]),
                "full_name": ca.get("full_name", "Coordinator"),
                "profile_photo_url": ca.get("profile_photo_url"),
                "profession": ca.get("profession"),
                "current_city": ca.get("current_city")
            }

    # In-memory mapping & formatting
    counts_map = {}
    for c in counts_list:
        if c.get("_id"):
            cities = [ct for ct in c.get("cities", []) if ct]
            counts_map[c["_id"]] = {
                "count": c.get("count", 0),
                "cities_count": len(cities)
            }

    events_map = {str(e["_id"]): e.get("count", 0) for e in events_list if e.get("_id")}

    sample_members_map = {}
    for m in all_samples:
        yr = m.get("passing_year")
        if yr not in sample_members_map:
            sample_members_map[yr] = []
        if len(sample_members_map[yr]) < 6:
            sample_members_map[yr].append({
                "id": str(m["_id"]),
                "full_name": m.get("full_name", "Alumnus"),
                "profile_photo_url": m.get("profile_photo_url"),
                "profession": m.get("profession") or "Alumnus",
                "current_city": m.get("current_city") or "Thoothukudi",
                "passing_year": yr
            })

    res = []
    for b in batches:
        b_id = str(b["_id"])
        yr = b.get("passing_year")
        stats = counts_map.get(yr, {"count": 0, "cities_count": 0})
        c_profiles = [coords_map[str(c)] for c in b.get("coordinators", []) if str(c) in coords_map]
        s_members = sample_members_map.get(yr, []) if yr else []

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

    ttl_cache.set("public:batches", res, ttl=60)
    total_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
    logger.info(f"endpoint=public_batches db_queries=5 db_time_ms={total_time_ms} total_time_ms={total_time_ms}")
    return res




@router.get("/highlights")
async def get_public_highlights(response: Response):
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=120"
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
async def get_public_memories(response: Response):
    """Fetch approved photo memories for public photo wall."""
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=120"
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
async def get_public_announcements(response: Response):
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=120"
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
async def submit_contact_enquiry(request: ContactEnquiryRequest, background_tasks: BackgroundTasks):
    """Public endpoint to submit general contact us inquiry with SMTP emails scheduled in background tasks."""
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

    # 1. Dispatch Auto Thank-You email via SMTP to visitor in background
    background_tasks.add_task(
        send_contact_thank_you_email,
        to_email=request.email.strip().lower(),
        sender_name=request.full_name.strip(),
        message_text=request.message.strip()
    )

    # 2. Dispatch Admin Notification email via SMTP to admin in background
    background_tasks.add_task(
        send_contact_admin_notification_email,
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

@router.get("/school-staff")
async def get_public_school_staff():
    """Public endpoint to fetch active current school staff and management hierarchy."""
    db = get_db()
    cursor = db.school_staff.find({
        "$or": [
            {"staff_type": "CURRENT"},
            {"is_former": False},
            {"staff_type": {"$exists": False}}
        ],
        "status": {"$ne": "INACTIVE"}
    }).sort("created_at", -1)
    docs = await cursor.to_list(length=200)

    res = []
    for s in docs:
        res.append({
            "id": str(s["_id"]),
            "full_name": s.get("full_name"),
            "full_name_ta": s.get("full_name_ta"),
            "school_position": s.get("school_position", "Teacher"),
            "school_position_ta": s.get("school_position_ta"),
            "department": s.get("department"),
            "department_ta": s.get("department_ta"),
            "designation": s.get("designation"),
            "designation_ta": s.get("designation_ta"),
            "staff_id": s.get("staff_id"),
            "profile_photo_url": s.get("profile_photo_url"),
            "staff_type": "CURRENT",
            "service_start_year": s.get("service_start_year"),
            "service_end_year": s.get("service_end_year"),
            "achievements": s.get("achievements"),
            "achievements_ta": s.get("achievements_ta"),
            "notes": s.get("notes"),
            "notes_ta": s.get("notes_ta")
        })
    return res

@router.get("/old-staff")
async def get_public_old_staff():
    """Public endpoint to fetch honoured former/old school staff & legendary teachers."""
    db = get_db()
    cursor = db.school_staff.find({
        "$or": [
            {"staff_type": "PAST"},
            {"is_former": True}
        ]
    }).sort([("service_end_year", -1), ("created_at", -1)])
    docs = await cursor.to_list(length=200)

    res = []
    for s in docs:
        res.append({
            "id": str(s["_id"]),
            "full_name": s.get("full_name"),
            "full_name_ta": s.get("full_name_ta"),
            "school_position": s.get("school_position", "Former Teacher"),
            "school_position_ta": s.get("school_position_ta"),
            "department": s.get("department"),
            "department_ta": s.get("department_ta"),
            "designation": s.get("designation"),
            "designation_ta": s.get("designation_ta"),
            "staff_id": s.get("staff_id"),
            "profile_photo_url": s.get("profile_photo_url"),
            "staff_type": "PAST",
            "service_start_year": s.get("service_start_year"),
            "service_end_year": s.get("service_end_year"),
            "achievements": s.get("achievements"),
            "achievements_ta": s.get("achievements_ta"),
            "notes": s.get("notes"),
            "notes_ta": s.get("notes_ta")
        })
    return res
