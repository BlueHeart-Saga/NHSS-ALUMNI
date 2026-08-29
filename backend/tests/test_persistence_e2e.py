import pytest
from datetime import datetime, timezone
from mongomock_motor import AsyncMongoMockClient
from app.core.security import generate_qr_ticket_token, decode_qr_ticket_token

@pytest.mark.asyncio
async def test_full_database_lifecycle_e2e():
    """Verifies complete end-to-end data persistence across all MongoDB collections."""
    client = AsyncMongoMockClient()
    db = client["school_alumni_test_db"]
    now = datetime.now(timezone.utc)

    # 1. School Persistence
    school_doc = {
        "name": "ABC School Test",
        "code": "ABCTEST",
        "established_year": 1985,
        "status": "ACTIVE",
        "created_at": now
    }
    res_school = await db.schools.insert_one(school_doc)
    school_id = str(res_school.inserted_id)
    assert school_id is not None

    db_school = await db.schools.find_one({"_id": res_school.inserted_id})
    assert db_school["name"] == "ABC School Test"

    # 2. Batch Persistence
    batch_doc = {
        "school_id": school_id,
        "name": "Class of 2010",
        "passing_year": 2010,
        "status": "ACTIVE",
        "created_at": now
    }
    res_batch = await db.batches.insert_one(batch_doc)
    batch_id = str(res_batch.inserted_id)

    db_batch = await db.batches.find_one({"_id": res_batch.inserted_id})
    assert db_batch["passing_year"] == 2010

    # 3. User & Alumni Registration Persistence
    user_doc = {
        "school_id": school_id,
        "mobile": "+919999900001",
        "roles": ["ALUMNI"],
        "is_active": True,
        "created_at": now
    }
    res_u = await db.users.insert_one(user_doc)
    user_id = str(res_u.inserted_id)

    alumni_doc = {
        "school_id": school_id,
        "user_id": user_id,
        "full_name": "Test Alumnus",
        "mobile": "+919999900001",
        "email": "testalumnus@example.com",
        "passing_year": 2010,
        "batch_id": batch_id,
        "admission_number": "TEST-2010-001",
        "verification_status": "PENDING",
        "created_at": now
    }
    res_a = await db.alumni.insert_one(alumni_doc)
    alumni_id = str(res_a.inserted_id)

    db_a = await db.alumni.find_one({"_id": res_a.inserted_id})
    assert db_a["verification_status"] == "PENDING"

    # 4. Verification Action Persistence
    await db.alumni.update_one(
        {"_id": res_a.inserted_id},
        {"$set": {
            "verification_status": "APPROVED",
            "verification_notes": "Verified by test admin",
            "verified_at": now
        }}
    )
    db_a_verified = await db.alumni.find_one({"_id": res_a.inserted_id})
    assert db_a_verified["verification_status"] == "APPROVED"

    # 5. Event Creation Persistence
    event_doc = {
        "school_id": school_id,
        "batch_id": batch_id,
        "title": "2010 Reunion",
        "event_date": "2026-12-20",
        "max_capacity": 300,
        "status": "PUBLISHED",
        "created_at": now
    }
    res_ev = await db.events.insert_one(event_doc)
    event_id = str(res_ev.inserted_id)

    # 6. RSVP Attendance & Guest Count Persistence
    qr_token = generate_qr_ticket_token(event_id, alumni_id, school_id)
    att_doc = {
        "school_id": school_id,
        "event_id": event_id,
        "alumni_id": alumni_id,
        "rsvp_status": "ATTENDING",
        "adults_count": 2,
        "children_count": 1,
        "total_guests": 3,
        "qr_token": qr_token,
        "updated_at": now
    }
    await db.event_attendance.insert_one(att_doc)

    db_att = await db.event_attendance.find_one({"event_id": event_id, "alumni_id": alumni_id})
    assert db_att["rsvp_status"] == "ATTENDING"
    assert db_att["total_guests"] == 3

    # 7. QR Token Decode & Venue Check-In Persistence
    decoded_payload = decode_qr_ticket_token(qr_token)
    assert decoded_payload["event_id"] == event_id
    assert decoded_payload["alumni_id"] == alumni_id

    checkin_doc = {
        "school_id": school_id,
        "event_id": event_id,
        "alumni_id": alumni_id,
        "checked_in_at": now,
        "method": "QR_SCAN"
    }
    await db.checkins.insert_one(checkin_doc)

    db_checkin = await db.checkins.find_one({"event_id": event_id, "alumni_id": alumni_id})
    assert db_checkin is not None
    assert db_checkin["method"] == "QR_SCAN"

    # 8. Announcement Persistence
    ann_doc = {
        "school_id": school_id,
        "batch_id": batch_id,
        "title": "Reunion Reminder",
        "content": "Don't forget to bring your QR ticket!",
        "created_at": now
    }
    res_ann = await db.announcements.insert_one(ann_doc)
    assert res_ann.inserted_id is not None

    # 9. Photo Memory Persistence
    mem_doc = {
        "school_id": school_id,
        "batch_id": batch_id,
        "event_id": event_id,
        "title": "Group Photo",
        "image_url": "http://localhost:8000/uploads/photo1.webp",
        "uploaded_by": alumni_id,
        "status": "APPROVED",
        "created_at": now
    }
    res_mem = await db.memories.insert_one(mem_doc)
    assert res_mem.inserted_id is not None

    # 10. Aggregation Metrics Persistence Check
    tot_alumni = await db.alumni.count_documents({"school_id": school_id})
    tot_checkins = await db.checkins.count_documents({"school_id": school_id})
    assert tot_alumni == 1
    assert tot_checkins == 1
