import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logger = logging.getLogger("app.database")

class Database:
    client = None
    db = None

db_instance = Database()

async def connect_to_mongo():
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI} (Environment: {settings.APP_ENV})...")
    
    # In production, validate configuration secrets first
    settings.validate_production_secrets()

    try:
        # Try real MongoDB connection with short server selection timeout
        client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
        # Verify connection
        await client.admin.command('ping')
        db_instance.client = client
        db_instance.db = client[settings.MONGODB_DATABASE]
        logger.info(f"Successfully connected to MongoDB database: {settings.MONGODB_DATABASE}")
    except Exception as e:
        if settings.is_production:
            logger.critical(f"FATAL: Production database connection failed: {e}")
            raise RuntimeError(f"Database connection failed in production environment: {e}")
        
        logger.warning(f"Local MongoDB daemon not reachable ({e}). Falling back to in-memory mongomock engine for dev/test...")
        from mongomock_motor import AsyncMongoMockClient
        client = AsyncMongoMockClient()
        db_instance.client = client
        db_instance.db = client[settings.MONGODB_DATABASE]
        logger.info(f"Initialized in-memory MongoDB database: {settings.MONGODB_DATABASE}")

    await create_indexes()

async def close_mongo_connection():
    if db_instance.client and hasattr(db_instance.client, "close"):
        logger.info("Closing MongoDB connection...")
        try:
            db_instance.client.close()
        except Exception:
            pass
        logger.info("MongoDB connection closed.")

async def create_indexes():
    db = db_instance.db
    if db is None:
        return

    try:
        # Users
        try:
            await db.users.drop_index("mobile_1")
        except Exception:
            pass
        await db.users.create_index("mobile", unique=True, sparse=True)
        await db.users.create_index("email", sparse=True)
        await db.users.create_index("school_id")

        # Alumni
        await db.alumni.create_index([("school_id", 1), ("batch_id", 1)])
        await db.alumni.create_index([("school_id", 1), ("verification_status", 1)])
        await db.alumni.create_index("mobile")
        await db.alumni.create_index("user_id", unique=True)

        # Batches
        await db.batches.create_index([("school_id", 1), ("passing_year", 1)], unique=True)

        # Events
        await db.events.create_index([("school_id", 1), ("event_date", 1)])
        await db.events.create_index([("school_id", 1), ("batch_id", 1)])

        # Event Attendance
        await db.event_attendance.create_index([("event_id", 1), ("alumni_id", 1)], unique=True)

        # Checkins
        await db.checkins.create_index([("event_id", 1), ("alumni_id", 1)], unique=True)

        # Announcements
        await db.announcements.create_index([("school_id", 1), ("target", 1)])

        # Memories
        await db.memories.create_index([("school_id", 1), ("batch_id", 1)])
        await db.memories.create_index([("school_id", 1), ("event_id", 1)])

        logger.info("MongoDB indexes created successfully.")
    except Exception as e:
        logger.warning(f"Index creation notice: {e}")

def get_db():
    return db_instance.db
