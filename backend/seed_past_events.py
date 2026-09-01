import asyncio
import os
import sys
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from app.core.config import settings

REAL_PAST_EVENTS = [
    {
        "title": "Republic Day Celebrations & Heritage Parade 2025",
        "description": "Grand Republic Day flag hoisting ceremony, NCC parade, and student cultural performances.",
        "event_date": "2025-01-26",
        "start_time": "08:30 AM",
        "venue": "School Main Playground & Auditorium",
        "cover_image_url": "/school-images/Republic-Day.png",
        "status": "PUBLISHED"
    },
    {
        "title": "Free Bicycle Distribution Welfare Ceremony",
        "description": "Government welfare bicycle distribution program honoring 10th and 12th standard students.",
        "event_date": "2024-11-14",
        "start_time": "10:00 AM",
        "venue": "School Assembly Hall",
        "cover_image_url": "/school-images/give-cycle.png",
        "status": "PUBLISHED"
    },
    {
        "title": "Silver Jubilee Alumni Reunion Executive Meetup",
        "description": "Special alumni reunion executive committee meeting planning annual development projects.",
        "event_date": "2024-12-25",
        "start_time": "05:00 PM",
        "venue": "Alumni Conference Hall",
        "cover_image_url": "/school-images/meeting.png",
        "status": "PUBLISHED"
    },
    {
        "title": "Former Principals & Senior Staff Honor Ceremony",
        "description": "Felicitation ceremony honoring former principals and veteran teaching staff for dedicated service.",
        "event_date": "2024-09-05",
        "start_time": "11:00 AM",
        "venue": "School Auditorium",
        "cover_image_url": "/school-images/old-pricipal.png",
        "status": "PUBLISHED"
    },
    {
        "title": "Annual School Sports & Student Excellence Awards",
        "description": "Annual sports day championships and student academic excellence award distribution.",
        "event_date": "2024-03-10",
        "start_time": "09:00 AM",
        "venue": "School Sports Pavilion",
        "cover_image_url": "/school-images/studentaward.png",
        "status": "PUBLISHED"
    },
    {
        "title": "Annual Prize Distribution & Cultural Festival",
        "description": "Annual cultural festival featuring drama, music, dance, and merit prize distribution.",
        "event_date": "2024-02-28",
        "start_time": "04:30 PM",
        "venue": "Open Air Theatre",
        "cover_image_url": "/school-images/sudentgetprize.png",
        "status": "PUBLISHED"
    }
]

async def seed_past_events():
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DATABASE]

    # Get school_id
    school = await db.schools.find_one({})
    school_id = str(school["_id"]) if school and "_id" in school else None

    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Clear old past events
    await db.events.delete_many({"event_date": {"$lt": today_str}})
    print("Cleared existing past events.")

    now = datetime.now(timezone.utc)
    docs = []
    for ev in REAL_PAST_EVENTS:
        docs.append({
            "school_id": school_id,
            "title": ev["title"],
            "description": ev["description"],
            "event_date": ev["event_date"],
            "start_time": ev["start_time"],
            "venue": ev["venue"],
            "cover_image_url": ev["cover_image_url"],
            "status": ev["status"],
            "registration_url": "https://nhssalumni.com/login",
            "created_at": now,
            "updated_at": now
        })

    res = await db.events.insert_many(docs)
    print(f"Successfully seeded {len(res.inserted_ids)} real past events into MongoDB!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_past_events())
