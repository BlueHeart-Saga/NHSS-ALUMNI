# import asyncio
# import logging
# from datetime import datetime, timezone
# from motor.motor_asyncio import AsyncIOMotorClient
# from app.core.config import settings

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger("reset_db")

# async def reset_database():
#     logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
#     try:
#         client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
#         await client.admin.command('ping')
#         db = client[settings.MONGODB_DATABASE]
#         logger.info("Connected to MongoDB.")
#     except Exception as e:
#         logger.warning(f"Local MongoDB daemon not running ({e}). Clearing in-memory mongomock engine...")
#         from mongomock_motor import AsyncMongoMockClient
#         client = AsyncMongoMockClient()
#         db = client[settings.MONGODB_DATABASE]

#     # Clear all collections completely
#     await db.schools.delete_many({})
#     await db.users.delete_many({})
#     await db.alumni.delete_many({})
#     await db.batches.delete_many({})
#     await db.events.delete_many({})
#     await db.event_attendance.delete_many({})
#     await db.checkins.delete_many({})
#     await db.announcements.delete_many({})
#     await db.memories.delete_many({})
#     await db.notifications.delete_many({})
#     await db.audit_logs.delete_many({})

#     logger.info("All existing database collections have been completely cleared.")

#     now = datetime.now(timezone.utc)

#     # Create ONLY the Primary Platform Developer User (+917550375037) in db.users
#     dev_user = {
#         "school_id": None,
#         "mobile": "+917550375037",
#         "email": "developer@justgathernow.com",
#         "roles": ["SUPER_ADMIN", "DEVELOPER"],
#         "is_active": True,
#         "created_at": now
#     }
#     await db.users.insert_one(dev_user)

#     logger.info("Created Primary Platform Developer Account (+917550375037) in db.users with DEVELOPER & SUPER_ADMIN roles.")
#     logger.info("DATABASE PURGE COMPLETE! All dummy data removed.")

# if __name__ == "__main__":
#     asyncio.run(reset_database())
