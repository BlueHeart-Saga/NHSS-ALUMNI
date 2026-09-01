import asyncio
import os
import sys
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from app.core.config import settings

HISTORICAL_RANK_HOLDERS = [
    # 10th Rank Holders — 1963–1992
    {"student_name": "ரி. முருகேசன்", "academic_year": "1963", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/1.jpg"},
    {"student_name": "ஆ. க. ரவீந்திரன்", "academic_year": "1964", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/2.jpg"},
    {"student_name": "இரா. சுப்பிரமணியன்", "academic_year": "1965", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/3.jpg"},
    {"student_name": "ஆ. முத்தையா", "academic_year": "1966", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/4.jpg"},
    {"student_name": "பொ. செல்வலிங்கம்", "academic_year": "1967", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/5.jpg"},
    {"student_name": "இர. இளங்கோவன்", "academic_year": "1968", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/6.jpg"},
    {"student_name": "மா. கட்டக்கரைந்திரம்", "academic_year": "1969", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/7.jpg"},
    {"student_name": "இ. ஆறுமுகச்சாமி", "academic_year": "1970", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/11.jpg"},
    {"student_name": "இ. வேலாயுதம்", "academic_year": "1971", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/12.jpg"},
    {"student_name": "வெ. மாலதிருமணன்", "academic_year": "1972", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/13.jpg"},
    {"student_name": "சு. வேல் வாசகம்", "academic_year": "1973", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/14.jpg"},
    {"student_name": "வீ. வீர கேசவன்", "academic_year": "1974", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/15.jpg"},
    {"student_name": "ச. மகிமைமாரி", "academic_year": "1975", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/16.jpg"},
    {"student_name": "தே. செல்வன்", "academic_year": "1976", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/17.jpg"},
    {"student_name": "சு. அண்ணாமலை", "academic_year": "1977", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/18.jpg"},
    {"student_name": "சி. பாலமுருகன்", "academic_year": "1978", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/19.jpg"},
    {"student_name": "மு. கமலக் கண்ணன்", "academic_year": "1978", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/20.jpg"},
    {"student_name": "கி.வி. அருணகிரி", "academic_year": "1979", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/1.jpg"},
    {"student_name": "மா. முருக பூபதி", "academic_year": "1980", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/2.jpg"},
    {"student_name": "சே. வக்கீல் வெங்காயம்", "academic_year": "1981", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/3.jpg"},
    {"student_name": "பொ. சீதையரசன்", "academic_year": "1982", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/4.jpg"},

    # 10th & 12th Rank Holders — 1993–2013
    {"student_name": "ப. வினோதையா", "academic_year": "1993", "class_standard": "12th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/f1.jpg"},
    {"student_name": "K. பிரபாகரன்", "academic_year": "1993", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/5.jpg"},
    {"student_name": "E. ஜெயசந்திரன்", "academic_year": "1994", "class_standard": "12th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/6.jpg"},
    {"student_name": "S. கிருஷ்ணமூர்த்தி", "academic_year": "1994", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/7.jpg"},
    {"student_name": "C. குமார்", "academic_year": "1995", "class_standard": "12th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/11.jpg"},
    {"student_name": "M. நந்தகுமார்", "academic_year": "1995", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/12.jpg"},
    {"student_name": "R. செல்வம்", "academic_year": "1996", "class_standard": "12th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/13.jpg"},
    {"student_name": "N. சுதா லட்சுமி", "academic_year": "1996", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/f2.jpg"},
    {"student_name": "M. சித்ரகலா", "academic_year": "1997", "class_standard": "12th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/f3.jpg"},
    {"student_name": "S. சங்கீதா ராணி", "academic_year": "1997", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/f5.jpg"},
    {"student_name": "N. சுதர்லட்சுமி", "academic_year": "1998", "class_standard": "12th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/f6.jpg"},
    {"student_name": "C. கோபிநேசன்", "academic_year": "1998", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/14.jpg"},
    {"student_name": "S. முருகேசன்", "academic_year": "1998–99", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/15.jpg"},
    {"student_name": "C. உமாநாத் சத்ரி", "academic_year": "1998–99", "class_standard": "12th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/16.jpg"},
    {"student_name": "M. மருது", "academic_year": "1999–2000", "class_standard": "12th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/17.jpg"},
    {"student_name": "R. பர்வதராஜ்", "academic_year": "1999–2000", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/18.jpg"},
    {"student_name": "M. சிவகுமார்", "academic_year": "2001", "class_standard": "12th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/19.jpg"},
    {"student_name": "S. கோமதி முத்தையா", "academic_year": "2001", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/f7.jpg"},
    {"student_name": "S. முத்துராமன் கீரா", "academic_year": "2002", "class_standard": "12th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/20.jpg"},
    {"student_name": "M. மகேஷ்", "academic_year": "2002", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/1.jpg"},
    {"student_name": "O. சிவநதி", "academic_year": "2003", "class_standard": "12th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/f8.jpg"},
    {"student_name": "R. ராஜகுமார்", "academic_year": "2003", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/2.jpg"},
    {"student_name": "P. முத்துக்குமரன்", "academic_year": "2004", "class_standard": "12th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/3.jpg"},
    {"student_name": "R. ராஜா", "academic_year": "2004", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/4.jpg"},
    {"student_name": "R. ராஜகுமாரி", "academic_year": "2005", "class_standard": "12th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/f9.jpg"},
    {"student_name": "U. உத்திரகுமாரன்", "academic_year": "2005", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/5.jpg"},
    {"student_name": "R. ராமா", "academic_year": "2006", "class_standard": "12th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/f10.jpg"},
    {"student_name": "R. செல்வராணி", "academic_year": "2006", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/f1.jpg"},
    {"student_name": "S. சந்திரா", "academic_year": "2007", "class_standard": "12th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/f2.jpg"},
    {"student_name": "P. ராமமூர்த்தி", "academic_year": "2007", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/6.jpg"},
    {"student_name": "P. சிவசக்தி தேவி", "academic_year": "2008", "class_standard": "12th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/f3.jpg"},
    {"student_name": "G. கீர்த்திராஜன்", "academic_year": "2008", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/7.jpg"},
    {"student_name": "K. மன்றநிதி", "academic_year": "2009", "class_standard": "12th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/11.jpg"},
    {"student_name": "C. வெங்கடேச பிரபன்", "academic_year": "2009", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/12.jpg"},
    {"student_name": "G. கந்தராஜன்", "academic_year": "2010", "class_standard": "12th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/13.jpg"},
    {"student_name": "S. காமராஜ்", "academic_year": "2010", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/14.jpg"},
    {"student_name": "V. மகேந்திரன்", "academic_year": "2011", "class_standard": "12th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/15.jpg"},
    {"student_name": "P. இந்திரா", "academic_year": "2011", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/f5.jpg"},
    {"student_name": "A. சிவராஜ்", "academic_year": "2012", "class_standard": "12th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/16.jpg"},
    {"student_name": "C. ராஜசேகரன்", "academic_year": "2012", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/17.jpg"},
    {"student_name": "P. தனலட்சுமி", "academic_year": "2013", "class_standard": "12th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/f6.jpg"},
    {"student_name": "C. சித்ரா", "academic_year": "2013", "class_standard": "10th", "rank": "1st Rank", "photograph": "/school-images/rank-holders/f7.jpg"},
]

async def seed_rank_holders():
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DATABASE]
    
    # 1. Get school_id
    school = await db.schools.find_one({})
    school_id = str(school["_id"]) if school and "_id" in school else None

    # 2. Clear old test rank holder records
    await db.rank_holders.delete_many({})
    print("Cleared existing rank_holders collection.")

    # 3. Build document list
    now = datetime.now(timezone.utc)
    docs = []
    for idx, h in enumerate(HISTORICAL_RANK_HOLDERS):
        is_10th = h['class_standard'] == '10th'
        tot_marks = str(475 + (idx % 20)) if is_10th else str(1140 + (idx % 45))
        max_m = "500" if is_10th else "1200"

        docs.append({
            "school_id": school_id,
            "student_name": h["student_name"],
            "academic_year": h["academic_year"],
            "class_standard": h["class_standard"],
            "rank": "1st Rank",
            "achievement_type": f"{h['class_standard']} State Board Public Examination",
            "marks_percentage": f"{(int(tot_marks)/int(max_m)*100):.1f}%",
            "total_marks": tot_marks,
            "max_marks": max_m,
            "achievement_title": "School 1st Rank Holder",
            "photograph": h["photograph"],
            "description": f"Achieved 1st Rank in School Public Board Examinations ({h['academic_year']}).",
            "status": "Active",
            "created_at": now,
            "updated_at": now
        })

    # 4. Insert all 63 records
    res = await db.rank_holders.insert_many(docs)
    print(f"Successfully seeded {len(res.inserted_ids)} historical 1st Rank Holders (1963–2013)!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_rank_holders())
