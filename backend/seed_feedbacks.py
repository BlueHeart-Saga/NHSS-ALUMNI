import asyncio
import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import connect_to_mongo, close_mongo_connection, get_db

INITIAL_FEEDBACKS = [
    {
        "alumni_name": "R. Kumar",
        "alumni_name_ta": "ஆர். குமார்",
        "batch_year": "1998",
        "location": "Chennai, India",
        "feedback_type": "MEMORIES",
        "feedback_text": "எங்கள் பள்ளி நாட்களை மீண்டும் நினைவுபடுத்த இந்த தளம் ஒரு சிறந்த வாய்ப்பு.",
        "feedback_text_ta": "எங்கள் பள்ளி நாட்களை மீண்டும் நினைவுபடுத்த இந்த தளம் ஒரு சிறந்த வாய்ப்பு.",
        "rating": 5,
        "status": "APPROVED",
        "is_featured": True,
    },
    {
        "alumni_name": "Priya Sundaram",
        "alumni_name_ta": "பிரியா சுந்தரம்",
        "batch_year": "2002",
        "location": "Bengaluru, India",
        "feedback_type": "WEBSITE",
        "feedback_text": "The new alumni portal design is modern, smooth, and very intuitive to connect with batchmates.",
        "feedback_text_ta": "புதிய பழைய மாணவர்கள் தளம் மிகவும் நவீனமானது மற்றும் எளிமையானது.",
        "rating": 5,
        "status": "APPROVED",
        "is_featured": True,
    },
    {
        "alumni_name": "K. Rajesh",
        "alumni_name_ta": "கே. ராஜேஷ்",
        "batch_year": "1995",
        "location": "Singapore",
        "feedback_type": "ASSOCIATION",
        "feedback_text": "Proud to see our alumni association growing globally and offering scholarships for young students.",
        "feedback_text_ta": "நமது பழைய மாணவர்கள் சங்கம் உலகளவில் வளர்ந்து வருவதை கண்டு பெருமிதம் கொள்கிறேன்.",
        "rating": 5,
        "status": "APPROVED",
        "is_featured": True,
    },
    {
        "alumni_name": "S. Murugan",
        "alumni_name_ta": "எஸ். முருகன்",
        "batch_year": "2010",
        "location": "Coimbatore, India",
        "feedback_type": "EVENTS",
        "feedback_text": "Annual sports day reunion memory videos brought tears of joy. Keep hosting more batch meetups!",
        "feedback_text_ta": "ஆண்டு விளையாட்டு விழா நினைவுகள் மகிழ்ச்சியளித்தன. மேலும் சந்திப்புகளை நடத்துங்கள்!",
        "rating": 4,
        "status": "APPROVED",
        "is_featured": False,
    },
    {
        "alumni_name": "Ananya Ramesh",
        "alumni_name_ta": "அனன்யா ரமேஷ்",
        "batch_year": "2018",
        "location": "London, UK",
        "feedback_type": "SUGGESTIONS",
        "feedback_text": "Suggesting a virtual global alumni mentoring session for final year school students every term.",
        "feedback_text_ta": "மாணவர்களுக்கான ஆன்லைன் வழிகாட்டுதல் வகுப்புகளை நடத்த பரிந்துரைக்கிறேன்.",
        "rating": 5,
        "status": "PENDING",
        "is_featured": False,
    },
    {
        "alumni_name": "V. Subramanian",
        "alumni_name_ta": "வி. சுப்ரமணியன்",
        "batch_year": "1988",
        "location": "Madurai, India",
        "feedback_type": "APPRECIATION",
        "feedback_text": "Golden jubilee celebration photos are outstanding! Heartfelt thanks to school admin team.",
        "feedback_text_ta": "பொன்விழா புகைப்படங்கள் அருமை! பள்ளி நிர்வாகத்திற்கு மனமார்ந்த நன்றிகள்.",
        "rating": 5,
        "status": "APPROVED",
        "is_featured": True,
    },
    {
        "alumni_name": "Deepak Nathan",
        "alumni_name_ta": "தீபக் நாதன்",
        "batch_year": "2015",
        "location": "Hyderabad, India",
        "feedback_type": "MEMORIES",
        "feedback_text": "Looking forward to adding our 2015 batch reunion album next month.",
        "feedback_text_ta": "எங்கள் 2015 பேட்ச் புகைப்படங்களை விரைவில் பதிவேற்ற உள்ளோம்.",
        "rating": 5,
        "status": "PENDING",
        "is_featured": False,
    }
]

async def main():
    await connect_to_mongo()
    db = get_db()
    
    count = await db.feedbacks.count_documents({})
    if count == 0:
        now = datetime.now(timezone.utc)
        docs = []
        for f in INITIAL_FEEDBACKS:
            f["user_id"] = ""
            f["admin_remarks"] = ""
            f["created_at"] = now
            f["updated_at"] = now
            docs.append(f)
        
        res = await db.feedbacks.insert_many(docs)
        print(f"Seeded {len(res.inserted_ids)} initial alumni feedback records.")
    else:
        print(f"Feedbacks collection already has {count} documents.")

    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(main())
