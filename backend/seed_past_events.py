import asyncio
import os
import sys
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from app.core.config import settings

# 15 HISTORICAL PAST EVENTS (Strictly event_date < today for Past Events & Memories Feeds)
PAST_SCHOOL_EVENTS = [
    {
        "title": "National Flag Hoisting & Heritage Independence Day",
        "description": "Grand national flag hoisting, NCC parade, and student patriotic song competition.",
        "event_date": "2024-08-15",
        "start_time": "08:30 AM",
        "venue": "School Main Assembly Quadrangle",
        "cover_image_url": "/school-images/flag-inaguration.png",
        "category": "ANNUAL_DAY",
        "status": "PUBLISHED"
    },
    {
        "title": "Government Free Bicycle Distribution Program",
        "description": "State welfare bicycle distribution scheme for 10th and 12th standard students.",
        "event_date": "2024-11-14",
        "start_time": "10:00 AM",
        "venue": "School Auditorium",
        "cover_image_url": "/school-images/give-cycle.png",
        "category": "SCHOOL_CELEBRATIONS",
        "status": "PUBLISHED"
    },
    {
        "title": "Alumni Executive Board & Reunion Planning Meet",
        "description": "Executive committee gathering to finalize annual alumni development projects.",
        "event_date": "2024-12-25",
        "start_time": "05:00 PM",
        "venue": "Alumni Conference Hall",
        "cover_image_url": "/school-images/meeting.png",
        "category": "CULTURAL_FEST",
        "status": "PUBLISHED"
    },
    {
        "title": "Former Principals & Veteran Teachers Honor Ceremony",
        "description": "Felicitation ceremony honoring former principals and retired teaching staff.",
        "event_date": "2024-09-05",
        "start_time": "11:00 AM",
        "venue": "Main School Auditorium",
        "cover_image_url": "/school-images/old-pricipal.png",
        "category": "GRADUATION_DAY",
        "status": "PUBLISHED"
    },
    {
        "title": "Grand Alumni Reunion & Nostalgia Meetup",
        "description": "Batch gathering of alumni sharing school memories, networking, and photo sessions.",
        "event_date": "2023-10-02",
        "start_time": "04:00 PM",
        "venue": "School Open Grounds",
        "cover_image_url": "/school-images/old-students-selfie.png",
        "category": "CULTURAL_FEST",
        "status": "PUBLISHED"
    },
    {
        "title": "Student Career Guidance & Mentorship Conclave",
        "description": "Career counseling session by alumni experts for high school students.",
        "event_date": "2023-07-20",
        "start_time": "10:30 AM",
        "venue": "Smart Classroom Complex",
        "cover_image_url": "/school-images/our-students.png",
        "category": "EXHIBITIONS_SCIENCE",
        "status": "PUBLISHED"
    },
    {
        "title": "Republic Day Heritage Parade & NCC Festival 2024",
        "description": "Republic day parade, march past, and student patriotic achievements showcase.",
        "event_date": "2024-01-26",
        "start_time": "08:30 AM",
        "venue": "School Playground & Quadrangle",
        "cover_image_url": "/school-images/Republic-Day.png",
        "category": "ANNUAL_DAY",
        "status": "PUBLISHED"
    },
    {
        "title": "Centenary Heritage Building & Campus Walk",
        "description": "Guided walkthrough of the historic school building and renovated digital labs.",
        "event_date": "2023-06-12",
        "start_time": "09:00 AM",
        "venue": "NHS School Main Entrance",
        "cover_image_url": "/school-images/school-door.png",
        "category": "SCHOOL_CELEBRATIONS",
        "status": "PUBLISHED"
    },
    {
        "title": "Teachers Day Keynote Address & Staff Felicitation",
        "description": "Inspiring address by senior staff members celebrating excellence in education.",
        "event_date": "2023-09-06",
        "start_time": "02:00 PM",
        "venue": "Audio-Visual Hall",
        "cover_image_url": "/school-images/staff-speech.png",
        "category": "SCHOOL_CELEBRATIONS",
        "status": "PUBLISHED"
    },
    {
        "title": "Annual School Sports & Athletic Excellence Awards",
        "description": "District-level sports championship and trophy presentation to student athletes.",
        "event_date": "2023-03-10",
        "start_time": "09:00 AM",
        "venue": "Sports Pavilion",
        "cover_image_url": "/school-images/studentaward.png",
        "category": "SPORTS_DAY",
        "status": "PUBLISHED"
    },
    {
        "title": "Inter-School Science Exhibition & Innovation Fair",
        "description": "Student science projects, robotics demonstrations, and environmental models exhibition.",
        "event_date": "2022-08-22",
        "start_time": "09:30 AM",
        "venue": "Science Block Hall",
        "cover_image_url": "/school-images/students-events.png",
        "category": "EXHIBITIONS_SCIENCE",
        "status": "PUBLISHED"
    },
    {
        "title": "Annual Prize Distribution & Merit Scholarship Ceremony",
        "description": "Merit scholarships and academic excellence awards distribution to top rankers.",
        "event_date": "2022-02-28",
        "start_time": "04:30 PM",
        "venue": "Open Air Theatre",
        "cover_image_url": "/school-images/sudentgetprize.png",
        "category": "GRADUATION_DAY",
        "status": "PUBLISHED"
    },
    {
        "title": "Centenary Silver Jubilee Alumni Conclave",
        "description": "Historical centenary reunion gathering for past batch graduates.",
        "event_date": "2021-10-15",
        "start_time": "09:00 AM",
        "venue": "School Main Auditorium",
        "cover_image_url": "/school-images/meeting.png",
        "category": "CULTURAL_FEST",
        "status": "PUBLISHED"
    },
    {
        "title": "Annual Science Innovation & Tech Expo",
        "description": "State-level student science projects and environmental models exhibition.",
        "event_date": "2021-11-20",
        "start_time": "10:00 AM",
        "venue": "Science Complex & Digital Labs",
        "cover_image_url": "/school-images/students-events.png",
        "category": "EXHIBITIONS_SCIENCE",
        "status": "PUBLISHED"
    },
    {
        "title": "Alumni Silver Jubilee Gala Evening",
        "description": "Special silver jubilee celebration dinner and alumni honor presentations.",
        "event_date": "2020-12-25",
        "start_time": "06:00 PM",
        "venue": "School Open Pavilion",
        "cover_image_url": "/school-images/old-students-selfie.png",
        "category": "SCHOOL_CELEBRATIONS",
        "status": "PUBLISHED"
    }
]

# THE ONLY SOLE UPCOMING FUTURE EVENT (06/09/2026 @ 09:30 AM)
THE_UPCOMING_EVENT = [
    {
        "title": "Natarajan Higher Secondary School – Alumni Association Inauguration Ceremony",
        "description": "நடராஜன் மேல்நிலைப் பள்ளி முன்னாள் மாணவர் சங்கம் – துவக்க விழா. முன்னாள் மாணவர்கள் அனைவரையும் அன்புடன் வரவேற்கிறோம். இந்த விழா முன்னாள் மாணவர்களை ஒன்றிணைத்து, பள்ளியுடன் நீடித்த தொடர்பை உருவாக்கவும், எதிர்கால alumni activities-க்கு ஒரு வலுவான அமைப்பை உருவாக்கவும் ஏற்பாடு செய்யப்பட்டுள்ளது. Agenda: Welcome & Registration → School Introduction → Alumni Association Introduction → Inauguration Ceremony → Alumni Interaction → Future Activities & Plans → Vote of Thanks.",
        "event_date": "2026-09-06",
        "start_time": "09:30 AM",
        "end_time": "01:30 PM",
        "venue": "Natarajan Higher Secondary School",
        "address": "Natarajan Higher Secondary School, Kaattunayakkanpatti, Kovilpatti, Tamil Nadu, India",
        "cover_image_url": "/school-images/meeting.png",
        "registration_url": "https://nhssalumni.com/",
        "category": "SCHOOL_CELEBRATIONS",
        "status": "UPCOMING",
        "allow_guests": True
    }
]

async def seed_all_events():
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DATABASE]

    school = await db.schools.find_one({})
    school_id = str(school["_id"]) if school and "_id" in school else None
    now = datetime.now(timezone.utc)

    all_events = PAST_SCHOOL_EVENTS + THE_UPCOMING_EVENT

    # 1. Seed into db.events
    await db.events.delete_many({})
    event_docs = []
    for ev in all_events:
        event_docs.append({
            "school_id": school_id,
            "title": ev["title"],
            "description": ev["description"],
            "event_date": ev["event_date"],
            "start_time": ev["start_time"],
            "end_time": ev.get("end_time"),
            "venue": ev["venue"],
            "address": ev.get("address"),
            "cover_image_url": ev["cover_image_url"],
            "category": ev["category"],
            "status": ev["status"],
            "registration_url": ev.get("registration_url", "https://nhssalumni.com/"),
            "allow_guests": ev.get("allow_guests", False),
            "created_at": now,
            "updated_at": now
        })
    res_events = await db.events.insert_many(event_docs)
    print(f"Successfully seeded {len(res_events.inserted_ids)} events into MongoDB 'db.events' (15 past + 1 SOLE UPCOMING EVENT on 06/09/2026)!")

    # 2. Seed into db.school_events
    await db.school_events.delete_many({})
    se_docs = []
    for ev in all_events:
        se_docs.append({
            "school_id": school_id,
            "title": ev["title"],
            "description": ev["description"],
            "category": ev["category"],
            "event_date": ev["event_date"],
            "cover_image_url": ev["cover_image_url"],
            "is_active": True,
            "created_at": now,
            "updated_at": now
        })
    res_se = await db.school_events.insert_many(se_docs)
    print(f"Successfully seeded {len(res_se.inserted_ids)} school events into MongoDB 'db.school_events'!")

    client.close()

if __name__ == "__main__":
    asyncio.run(seed_all_events())
