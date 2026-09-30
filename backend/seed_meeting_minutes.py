import asyncio
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

async def seed_meeting_minutes():
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DATABASE]

    school = await db.schools.find_one({})
    school_id = str(school["_id"]) if school else "school_default"
    print(f"Using School ID: {school_id}")

    admin = await db.users.find_one({"role": "SCHOOL_ADMIN"})
    admin_id = str(admin["_id"]) if admin else "admin"

    title_en = "NHSS Alumni Association - First Online Executive Meeting & Resolutions"
    title_ta = "முன்னாள் மாணவர்கள் சங்கம் — நிர்வாகிகள் கூட்டம்: முதலாவது இணைய வழிக் கூட்டம் – தீர்மானங்கள்"

    notes_ta = """முன்னாள் மாணவர்கள் சங்கம் — நிர்வாகிகள் கூட்டம்
முதலாவது இணைய வழிக் கூட்டம் – தீர்மானங்கள்

கூட்டச் சுருக்கம்:
நடராஜன் மேல்நிலைப்பள்ளி (NHSS) முன்னாள் மாணவர்கள் சங்க நிர்வாகிகளின் முதலாவது இணைய வழிக் கூட்டம் 20-09-2026 ஞாயிற்றுக்கிழமை மதியம் 12.00 மணி முதல் 1.45 மணி வரை நடைபெற்றது. கூட்டத்தில் சங்கத்தின் அமைப்பு, பதிவு மற்றும் நிதி, மாணவர் நலன் மற்றும் பள்ளி மேம்பாடு தொடர்பான 18 தீர்மானங்கள் ஒருமனதாக நிறைவேற்றப்பட்டன.

நாள்: 20-09-2026 · ஞாயிறு | நேரம்: 12.00 – 1.45 மணி | தீர்மானங்கள்: 18 · இணைய வழி

பிரிவு வாரியான தீர்மானச் சுருக்கம்:
1. நிர்வாகம் & அமைப்பு (தீர்மான எண் 1 – 5): 5 தீர்மானங்கள்
2. பதிவு & நிதி (தீர்மான எண் 6 – 9): 4 தீர்மானங்கள்
3. மாணவர் நலன் & சமூக சேவை (தீர்மான எண் 10 – 13): 4 தீர்மானங்கள்
4. பள்ளி மேம்பாடு (தீர்மான எண் 14 – 18): 5 தீர்மானங்கள்
மொத்த தீர்மானங்கள்: 18

நிறைவேற்றப்பட்ட தீர்மானங்கள் விவரம்:

[நிர்வாகம் & அமைப்பு]
01. செயற்குழு உறுப்பினர்கள் 61 பேருக்கு 39 பேர் தேர்ந்தெடுக்கப்பட்டுள்ளார்கள்; மீதம் 21 பேர் தேர்ந்தெடுக்கப்பட வேண்டும்.
02. நிர்வாகக் குழு உறுப்பினர்கள் 15 பேருக்கு 12 பேர் தேர்ந்தெடுக்கப்பட்டுள்ளார்கள்; மீதம் 3 பேர் 2K BATCH-ல் உள்ள பெண்களைத் தேர்வு செய்வது என முடிவு செய்யப்பட்டது.
03. நமது சங்கத்தின் தகவல் தொடர்பு அலுவலராக துணைத் தலைவர் P.S. மணிகண்டன் அவர்கள் செயல்படுவார் என முடிவு செய்யப்பட்டது.
04. மூன்று மாதத்திற்கு ஒரு முறை நிர்வாகக் குழு உறுப்பினர்கள் கூட்டம் நடத்திட முடிவு செய்யப்பட்டது.
05. மாதம் ஒரு முறை, அவசியம் இருப்பின், நிர்வாகிகள் கூட்டத்தை இணைய வழிக் கூட்டமாக நடத்திட முடிவு செய்யப்பட்டது.

[பதிவு & நிதி]
06. சங்கம் பதிவு செய்வதற்கான செயல்பாடுகளைச் செய்திட முடிவு செய்யப்பட்டது.
07. சங்கம் பதிவு செய்த பின், சங்கத்தின் பெயரில் செயலாளர் மற்றும் பொருளாளர் இணைந்து கூட்டுக் கணக்காக தேசிய வங்கி ஒன்றில் வங்கிக் கணக்கு துவங்கிட முடிவு செய்யப்பட்டது.
08. சங்கத்தின் உறுப்பினர்களுக்கான வருட சந்தா தொகை ரூ.300/- என முடிவு செய்யப்பட்டது.
09. சங்கத்தின் வளர்ச்சி நிதியாக விருப்பமுள்ள உறுப்பினர்கள் நன்கொடைகளும் வழங்கலாம்.

[மாணவர் நலன் & சமூக சேவை]
10. நமது பள்ளி மாணவர்களும் கிராமப்புற மக்களும் பயன்பெறும் வகையில், நமது பள்ளியில் காலாண்டுக்கு ஒரு முறை கண் மருத்துவ முகாம், பல் மருத்துவ முகாம், பொது மருத்துவ முகாம் நடத்திட முடிவு செய்யப்பட்டது.
11. பள்ளி, கல்லூரி மாணவர்களின் மேற்படிப்பு மற்றும் வேலை வாய்ப்புகள் சம்பந்தமான ஆலோசனைகள், வழிகாட்டுதல் நிகழ்ச்சிகள் நடத்திட முடிவு செய்யப்பட்டது.
12. மாணவ மாணவியர்களின் தனித்திறன் மேம்பாட்டுப் பயிற்சிகளை நடத்திட ஏற்பாடு செய்வதென முடிவு செய்யப்பட்டது.
13. வருடந்தோறும் 1972-73 BATCH சகோதரர்கள் வழங்கி வந்த, பத்தாம் வகுப்பு மற்றும் பன்னிரண்டாம் வகுப்பில் முதல் இரண்டு இடம் பெறும் மாணவர்களுக்கான பரிசுத் தொகையைத் தொடர்ச்சியாக வழங்குவது என முடிவு செய்யப்பட்டது.

[பள்ளி மேம்பாடு]
14. பள்ளியின் சுற்றுப்புறச் சூழலை மேம்படுத்திட பசுமைப் பண்ணைத் திட்டத்தைச் செயல்படுத்த முடிவு செய்யப்பட்டது.
15. பள்ளியின் கல்வித் தரம், மாணவர்களின் ஒழுக்கம், ஆசிரியர் – மாணவர் உறவு மேம்படவும், பள்ளி ஆசிரியர்களின் கருத்துக்களை அறிந்திடவும், நமது நிர்வாகிகளும் ஆசிரியர்களும் கலந்து கொள்ளும் ஆலோசனைக் கூட்டம் ஒன்றை நடத்திட முடிவு செய்யப்பட்டது.
16. பள்ளி மாணவர்களின் வாசிப்புத் திறனை மேம்படுத்திட நமது பள்ளி வளாகத்தில் படிப்பறை ஒன்றை ஏற்படுத்திட முடிவு செய்யப்பட்டது.
17. பள்ளியின் கழிப்பறைகளை நவீன முறையில் அமைத்திட, அதற்கான நன்கொடையாளர்களை அணுகுவது என முடிவு செய்யப்பட்டது.
18. வகுப்பறையில் மாணவர்களின் இருக்கைகளான பழைய, பழுதான BENCH & DESK-களை மாற்றிப் புதிதாக வாங்கிட நன்கொடையாளர்களை அணுகுவது என முடிவு செய்யப்பட்டது.

நிர்வாகிகள் கையொப்பம்:
- D. செல்வின் (தலைவர்)
- A. ஜெயக்குமார் (செயலாளர்)
- S. ஆறுமுகச்சாமி (துணைத் தலைவர்)
- P.S. மணிகண்டன் (துணைத் தலைவர்)
- S. ஜெகவீரபாண்டியன் கட்டபொம்மன் (துணைச் செயலாளர்)
- R. தங்க மாரியப்பன் (துணைச் செயலாளர்)
- M. குமாரவேல் (பொருளாளர்)"""

    notes_en = """NHSS Alumni Association - First Online Executive Meeting & Resolutions

Meeting Summary:
The 1st Online Executive Committee Meeting of Natarajan Higher Secondary School (NHSS) Alumni Association was held on Sunday, 20th September 2026, from 12:00 PM to 1:45 PM. A total of 18 resolutions covering Association Governance, Registration & Funds, Student Welfare & Community Service, and School Infrastructure Development were unanimously passed.

Date: 20-09-2026 · Sunday | Time: 12.00 PM – 1.45 PM | Resolutions: 18 · Online Meeting

Category Summary:
1. Administration & Governance (Resolutions 1 – 5): 5 Resolutions
2. Registration & Finance (Resolutions 6 – 9): 4 Resolutions
3. Student Welfare & Community Service (Resolutions 10 – 13): 4 Resolutions
4. School Development (Resolutions 14 – 18): 5 Resolutions
Total Resolutions: 18

Passed Resolutions:

[Administration & Governance]
01. Out of 61 Executive Committee positions, 39 members have been selected; the remaining 21 members are to be elected.
02. Out of 15 Governing Body positions, 12 members have been selected; resolved to select 3 female alumni from the 2000 Batch for the remaining seats.
03. Resolved that Vice President P.S. Manikandan will serve as the Official Communications Officer of the Association.
04. Resolved to conduct Governing Body meetings once every three months.
05. Resolved to hold monthly online executive meetings as needed.

[Registration & Finance]
06. Resolved to initiate official registration procedures for the Alumni Association.
07. Resolved to open a joint bank account in a nationalized bank in the name of the Association, operated jointly by Secretary and Treasurer.
08. Resolved to set annual membership fee at Rs. 300/- per member.
09. Resolved that willing members may also contribute voluntary development donations.

[Student Welfare & Community Service]
10. Resolved to organize quarterly eye check-up, dental, and general medical camps at the school campus for students and rural community members.
11. Resolved to organize higher education counseling and career guidance seminars for school and college students.
12. Resolved to arrange skill development and talent enhancement training programs for students.
13. Resolved to continuously sponsor cash prizes for top 2 rank holders in 10th and 12th Board Exams, traditionally sponsored by the 1972-73 Batch brothers.

[School Development & Infrastructure]
14. Resolved to implement a Green Farm Initiative to enhance the school's environmental surroundings.
15. Resolved to conduct a joint consultative meeting between Association executives and school teachers to enhance academic standards, student discipline, and teacher-student relationships.
16. Resolved to establish a reading room inside the school campus to improve students' reading skills.
17. Resolved to approach donors to modernize school toilet facilities.
18. Resolved to approach donors to replace old and damaged classroom benches & desks with brand new furniture.

Association Office Bearers:
- D. Selvin (President)
- A. Jeyakumar (Secretary)
- S. Arumugachamy (Vice President)
- P.S. Manikandan (Vice President)
- S. Jega Veerapandian Kattabomman (Joint Secretary)
- R. Thanga Mariappan (Joint Secretary)
- M. Kumaravel (Treasurer)"""

    # 1. Seed into meeting_minutes collection
    meeting_doc = {
        "school_id": school_id,
        "title": title_en,
        "title_ta": title_ta,
        "meeting_date": "2026-09-20",
        "meeting_time": "12.00 PM – 1.45 PM",
        "meeting_type": "Online Meeting",
        "notes": notes_en,
        "notes_ta": notes_ta,
        "pdf_url": "", # Will be populated if file uploaded
        "pdf_file_name": "NHSS_Alumni_Meeting_Minutes_20-09-2026.pdf",
        "pdf_file_size": 154200,
        "is_published": True,
        "display_order": 1,
        "status": "ACTIVE",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    existing_meeting = await db.meeting_minutes.find_one({"meeting_date": "2026-09-20"})
    if existing_meeting:
        await db.meeting_minutes.update_one({"_id": existing_meeting["_id"]}, {"$set": meeting_doc})
        print(f"Updated meeting minute: {title_en}")
    else:
        res = await db.meeting_minutes.insert_one(meeting_doc)
        print(f"Inserted meeting minute ID {res.inserted_id}: {title_en}")

    # 2. Seed into announcements collection as an official circular/notice
    announcement_doc = {
        "school_id": school_id,
        "target": "SCHOOL",
        "category": "CIRCULAR",
        "title": title_en,
        "title_ta": title_ta,
        "content": notes_en,
        "content_ta": notes_ta,
        "pdf_file_name": "NHSS_Alumni_Meeting_Minutes_20-09-2026.pdf",
        "pdf_file_size": 154200,
        "created_by": admin_id,
        "created_at": datetime.now(timezone.utc),
    }

    existing_announcement = await db.announcements.find_one({"title_ta": title_ta})
    if existing_announcement:
        await db.announcements.update_one({"_id": existing_announcement["_id"]}, {"$set": announcement_doc})
        print(f"Updated announcement: {title_en}")
    else:
        res = await db.announcements.insert_one(announcement_doc)
        print(f"Inserted announcement ID {res.inserted_id}: {title_en}")

    client.close()
    print("Meeting minutes and announcement seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_meeting_minutes())
