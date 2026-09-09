import asyncio
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

async def seed_news():
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DATABASE]

    school = await db.schools.find_one({})
    school_id = str(school["_id"]) if school else "school_default"
    print(f"Using School ID: {school_id}")

    admin = await db.users.find_one({"role": "SCHOOL_ADMIN"})
    admin_id = str(admin["_id"]) if admin else "admin"

    # Check for relevant memory images to use as poster if available
    recent_mem = await db.memories.find_one({"status": "APPROVED"})
    poster_1 = recent_mem.get("image_url") if recent_mem else None
    
    # Or check past events
    past_event = await db.past_events.find_one({})
    poster_2 = past_event.get("cover_image_url") if past_event else None

    news_items = [
        {
            "school_id": school_id,
            "target": "SCHOOL",
            "category": "CELEBRATION",
            "title": "Natarajan Higher Secondary School Alumni Association Inauguration",
            "title_ta": "நடராஜன் மேல்நிலைப்பள்ளி முன்னாள் மாணவர் சங்க தொடக்க விழா",
            "content": "The Alumni Association Inauguration Ceremony of Natarajan Higher Secondary School, Kattunaickenpatti, Tuticorin District was held with great enthusiasm. The event was presided over by R. Raghunathan, and S. Jega Kumarasamy delivered the welcome address.\n\nMore than 250 alumni enthusiastically attended the event. Extensive discussions were held regarding the association's structure, roadmap, and future initiatives to actively support the institution and its students.",
            "content_ta": "தூத்துக்குடி மாவட்டம் காட்டுநாயக்கன்பட்டி நடராஜன் மேல்நிலைப்பள்ளியில் முன்னாள் மாணவர் சங்க தொடக்க விழா சிறப்பாக நடைபெற்றது. விழாவிற்கு R. ரகுநாதன் தலைமை வகித்தார். S. ஜெக குமாரசாமி கட்டடத் திறப்பு விழா வரவேற்புரையை வழங்கினார்.\n\nவிழாவில் பள்ளியின் முன்னாள் மாணவ–மாணவியர்கள் 250-க்கும் மேற்பட்டோர் ஆர்வத்துடன் கலந்து கொண்டனர். முன்னாள் மாணவர் சங்கத்தின் அமைப்பு திட்டம், நோக்கங்கள் மற்றும் எதிர்கால செயல்பாடுகள் குறித்து ஆலோசிக்கப்பட்டு, சங்கத்தின் செயல்பாடுகளை தொடர்ந்து முன்னெடுக்க பல்வேறு முடிவுகள் எடுக்கப்பட்டன.",
            "poster_url": poster_1,
            "created_by": admin_id,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "school_id": school_id,
            "target": "SCHOOL",
            "category": "ACHIEVEMENT",
            "title": "Alumni Unite to Foster School Development and Infrastructure",
            "title_ta": "பள்ளி வளர்ச்சிக்கு முன்னாள் மாணவர்கள் இணைந்து செயல்பட முடிவு",
            "content": "During the inauguration of the Natarajan Higher Secondary School Alumni Association, major discussions took place regarding alumni collaboration for the academic and infrastructural development of the school.\n\nKey resolutions passed include initiatives to enhance the educational standards of Tamil medium students, supporting English medium education in partnership with school administration, and providing educational aids. Furthermore, decisions were taken to improve campus sanitation, environment, and facilitate extracurricular talent development.",
            "content_ta": "நடராஜன் மேல்நிலைப்பள்ளி முன்னாள் மாணவர் சங்க தொடக்க விழாவில் பள்ளியின் கல்வி மற்றும் உள்கட்டமைப்பு மேம்பாட்டிற்கு முன்னாள் மாணவர்கள் இணைந்து செயல்படுவது குறித்து முக்கியமாக ஆலோசிக்கப்பட்டது.\n\nதமிழ் வழிக் கல்வியில் பயிலும் மாணவர்களின் கல்வித் தரம் மற்றும் அறிவுத்திறனை மேம்படுத்துவதற்கான நடவடிக்கைகள், ஆங்கில வழிக் கல்வியை பள்ளி நிர்வாகத்துடன் இணைந்து செயல்படுத்துதல், மாணவர்களுக்கு தேவையான கல்வி உதவிகளை வழங்குதல் உள்ளிட்ட பல்வேறு தீர்மானங்கள் நிறைவேற்றப்பட்டன.\n\nமேலும், பள்ளியின் சுற்றுப்புறச் சூழல், சுகாதாரம், பராமரிப்பு மற்றும் வளாக மேம்பாட்டுப் பணிகளை மேற்கொள்ளவும், மாணவர்களின் தனித்திறமைகளை கண்டறிந்து வளர்க்கும் வகையில் பல்வேறு செயல்பாடுகளை முன்னெடுக்கவும் முடிவு செய்யப்பட்டது.",
            "poster_url": poster_2 or poster_1,
            "created_by": admin_id,
            "created_at": datetime.now(timezone.utc)
        }
    ]

    for i, item in enumerate(news_items, 1):
        # Check if already exists with same Tamil title to avoid duplicate
        existing = await db.announcements.find_one({"title_ta": item["title_ta"]})
        if existing:
            await db.announcements.update_one({"_id": existing["_id"]}, {"$set": item})
            print(f"[{i}/2] Updated announcement: {item['title']}")
        else:
            res = await db.announcements.insert_one(item)
            print(f"[{i}/2] Inserted announcement ID {res.inserted_id}: {item['title']}")

    client.close()
    print("News seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_news())
