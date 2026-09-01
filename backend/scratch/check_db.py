import asyncio
from app.core.database import connect_to_mongo, get_db

async def check():
    await connect_to_mongo()
    db = get_db()
    
    # 1. Sample Alumni Document
    doc = await db.alumni.find_one({})
    if doc:
        print("Sample Alumni Doc keys:", list(doc.keys()))
        print("full_name:", doc.get("full_name"))
        print("passing_year:", repr(doc.get("passing_year")), type(doc.get("passing_year")))
        print("verification_status:", doc.get("verification_status"))
        print("profile_photo_url:", doc.get("profile_photo_url"))
    
    # 2. Count alumni with passing_year integer vs string
    count_int = await db.alumni.count_documents({"passing_year": {"$type": "int"}})
    count_str = await db.alumni.count_documents({"passing_year": {"$type": "string"}})
    print(f"Alumni passing_year counts: int={count_int}, str={count_str}")
    
    # 3. Check sample alumni by passing_year=2010 (int & str)
    sample_int = await db.alumni.find({"passing_year": 2010}).to_list(length=5)
    sample_str = await db.alumni.find({"passing_year": "2010"}).to_list(length=5)
    print(f"Year 2010 int count: {len(sample_int)}, str count: {len(sample_str)}")
    
    # 4. Check profile photo URLs in alumni collection
    photo_docs = await db.alumni.find({"profile_photo_url": {"$ne": None}}).to_list(length=5)
    print("Sample profile_photo_urls:")
    for p in photo_docs:
        print(" -", p.get("full_name"), ":", p.get("profile_photo_url"))

asyncio.run(check())
