# import asyncio
# import os
# import sys
# from datetime import datetime, timezone
# from bson import ObjectId
# from motor.motor_asyncio import AsyncIOMotorClient

# # Load backend config
# sys.path.append(os.path.dirname(os.path.abspath(__file__)))
# from app.core.config import settings

# SCHOOL_ID_STR = "6a911868ce252b2a8047455d"
# SCHOOL_OBJ_ID = ObjectId(SCHOOL_ID_STR)

# async def reset_database():
#     print(f"Connecting to MongoDB at {settings.MONGODB_URI} (DB: {settings.MONGODB_DATABASE})...")
#     client = AsyncIOMotorClient(settings.MONGODB_URI)
#     db = client[settings.MONGODB_DATABASE]

#     now = datetime.now(timezone.utc)

#     # 1. Clean & Set Schools Collection
#     print("\n1. Resetting 'schools' collection...")
#     await db.schools.delete_many({})
#     school_doc = {
#         "_id": SCHOOL_OBJ_ID,
#         "name": "NHS SCHOOL",
#         "code": "NHSS",
#         "school_type": "Higher Secondary School",
#         "portal_name": "NHSS Alumni Network",
#         "tagline": "Connecting Generations of Alumni",
#         "address": "School Road, Nagapattinam",
#         "city": "Nagapattinam",
#         "district": "Nagapattinam",
#         "state": "Tamil Nadu",
#         "country": "India",
#         "created_at": now,
#         "updated_at": now
#     }
#     await db.schools.insert_one(school_doc)
#     print(f"[OK] Preserved single target school: NHS SCHOOL (_id: {SCHOOL_ID_STR})")

#     # 2. Clean & Set Users Collection
#     print("\n2. Resetting 'users' collection...")
#     dev_users = await db.users.find({
#         "roles": {"$in": ["DEVELOPER", "SUPER_ADMIN", "PLATFORM_DEVELOPER"]}
#     }).to_list(length=10)

#     await db.users.delete_many({})

#     # Ensure default developer user if none exist
#     if not dev_users:
#         dev_users = [{
#             "email": "dev@justgathernow.com",
#             "full_name": "Platform Developer",
#             "mobile": "9999999999",
#             "school_id": SCHOOL_ID_STR,
#             "roles": ["DEVELOPER", "SUPER_ADMIN", "PLATFORM_DEVELOPER"],
#             "status": "ACTIVE",
#             "created_at": now,
#             "updated_at": now
#         }]

#     inserted_dev_count = 0
#     for dev in dev_users:
#         dev.pop("_id", None)
#         dev["school_id"] = SCHOOL_ID_STR
#         dev["updated_at"] = now
#         await db.users.insert_one(dev)
#         inserted_dev_count += 1
#         print(f"  - Preserved Developer User: {dev.get('email')} (roles: {dev.get('roles')})")

#     # Insert / Restore School Admin user admin@nhss.com
#     school_admin_user = {
#         "email": "admin@nhss.com",
#         "full_name": "NHS School Admin",
#         "mobile": "9876543210",
#         "school_id": SCHOOL_ID_STR,
#         "roles": ["SCHOOL_ADMIN"],
#         "status": "ACTIVE",
#         "registration_completed": True,
#         "created_at": now,
#         "updated_at": now
#     }
#     await db.users.insert_one(school_admin_user)
#     print("  - Preserved School Admin User: admin@nhss.com (role: SCHOOL_ADMIN)")

#     # 3. Clean & Recreate Batches Collection (1966 to 2025)
#     print("\n3. Resetting 'batches' collection (1966 to 2025)...")
#     await db.batches.delete_many({})

#     batch_docs = []
#     for year in range(1966, 2026):  # 1966 to 2025 inclusive
#         batch_docs.append({
#             "school_id": SCHOOL_ID_STR,
#             "name": f"Batch of {year}",
#             "passing_year": year,
#             "title": f"Batch of {year}",
#             "academic_year": f"{year-1}-{year}",
#             "status": "ACTIVE",
#             "alumni_count": 0,
#             "created_at": now,
#             "updated_at": now
#         })

#     await db.batches.insert_many(batch_docs)
#     print(f"[OK] Recreated {len(batch_docs)} batches from 1966 to 2025 for school {SCHOOL_ID_STR}.")

#     # 4. Clear all other database collections completely
#     other_collections = [
#         "alumni",
#         "events",
#         "school_events",
#         "event_attendance",
#         "checkins",
#         "memories",
#         "rank_holders",
#         "staff",
#         "association_team",
#         "announcements"
#     ]

#     print("\n4. Clearing all other collections...")
#     for coll_name in other_collections:
#         res = await db[coll_name].delete_many({})
#         print(f"  - Cleared '{coll_name}': {res.deleted_count} records removed.")

#     print("\n=======================================================")
#     print("DATABASE RESET AND RE-SEEDING COMPLETED SUCCESSFULLY!")
#     print("=======================================================")

# if __name__ == "__main__":
#     asyncio.run(reset_database())
