import asyncio
import logging
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logger = logging.getLogger("app.database")

class Database:
    client = None
    db = None

db_instance = Database()

def redact_uri(uri: str) -> str:
    if not uri:
        return "[REDACTED]"
    import re
    return re.sub(r"://([^:]+):([^@]+)@", "://[REDACTED]:[REDACTED]@", uri)

async def connect_to_mongo():
    if db_instance.client is not None and db_instance.db is not None:
        try:
            await db_instance.client.admin.command('ping')
            logger.info("Existing MongoDB client is active and healthy. Reusing singleton connection.")
            return
        except Exception:
            logger.warning("Existing MongoDB client unhealthy; closing and re-initializing...")
            try:
                db_instance.client.close()
            except Exception:
                pass
            db_instance.client = None
            db_instance.db = None

    logger.info(f"Connecting to MongoDB at {redact_uri(settings.MONGODB_URI)} (Environment: {settings.APP_ENV})...")

    # In production, validate configuration secrets first
    settings.validate_production_secrets()

    max_retries = 3
    connected = False
    last_error = None

    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"MongoDB connection attempt {attempt}/{max_retries}...")
            client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=10000,
                socketTimeoutMS=45000,
                maxIdleTimeMS=settings.MONGODB_MAX_IDLE_TIME_MS,
                maxPoolSize=settings.MONGODB_MAX_POOL_SIZE,
                minPoolSize=settings.MONGODB_MIN_POOL_SIZE,
                uuidRepresentation="standard"
            )
            # Verify connection
            await client.admin.command('ping')
            db_instance.client = client
            db_instance.db = client[settings.MONGODB_DATABASE]
            connected = True
            logger.info(f"Successfully connected to MongoDB database: {settings.MONGODB_DATABASE} (pool: min={settings.MONGODB_MIN_POOL_SIZE}, max={settings.MONGODB_MAX_POOL_SIZE})")
            break
        except Exception as e:
            last_error = e
            logger.warning(f"MongoDB connection attempt {attempt} failed: {e}")
            if attempt < max_retries:
                import asyncio
                await asyncio.sleep(1)

    if not connected:
        if settings.is_production:
            logger.critical(f"WARNING: Production database connection failed after {max_retries} attempts: {last_error}. Server booting in degraded state.")
            db_instance.client = client
            db_instance.db = client[settings.MONGODB_DATABASE] if client is not None else None
        else:
            logger.warning(f"Local MongoDB daemon not reachable ({last_error}). Falling back to in-memory mongomock engine for dev/test...")
            from mongomock_motor import AsyncMongoMockClient
            client = AsyncMongoMockClient()
            db_instance.client = client
            db_instance.db = client[settings.MONGODB_DATABASE]
            logger.info(f"Initialized in-memory MongoDB database: {settings.MONGODB_DATABASE}")

    if db_instance.db is not None:
        await create_indexes()

async def close_mongo_connection():
    if db_instance.client and hasattr(db_instance.client, "close"):
        logger.info("Closing MongoDB connection...")
        try:
            db_instance.client.close()
        except Exception:
            pass
        logger.info("MongoDB connection closed.")

def _get_index_name(keys, **kwargs):
    if "name" in kwargs:
        return kwargs["name"]
    if isinstance(keys, str):
        return f"{keys}_1"
    elif isinstance(keys, list):
        return "_".join(f"{k}_{v}" for k, v in keys)
    return None

async def safe_create_indexes_bulk(collection, index_specs):
    """
    Checks collection.index_information() first in 1 single network call.
    Only calls create_index for indexes that are genuinely missing.
    """
    try:
        existing = await collection.index_information()
    except Exception:
        existing = {}

    for spec in index_specs:
        if isinstance(spec, tuple):
            keys = spec[0]
            kwargs = spec[1] if len(spec) > 1 else {}
        else:
            keys = spec
            kwargs = {}

        name = _get_index_name(keys, **kwargs)
        if name and name in existing:
            continue
        try:
            await collection.create_index(keys, **kwargs)
            logger.info(f"Created index {name} on {collection.name}")
        except Exception as e:
            logger.debug(f"Index notice on {collection.name}: {e}")

_indexes_verified = False

async def create_indexes():
    global _indexes_verified
    if _indexes_verified:
        return

    db = db_instance.db
    if db is None:
        return

    try:
        # Check and ensure indexes collection by collection to avoid opening 11 concurrent sessions on Cosmos DB
        collections_specs = [
            (db.users, [
                ("mobile", {"unique": True, "sparse": True}),
                ("email", {"sparse": True}),
                "school_id"
            ]),
            (db.alumni, [
                ("user_id", {"unique": True, "sparse": True, "name": "user_id_1"}),
                [("school_id", 1), ("verification_status", 1), ("passing_year", 1)],
                [("school_id", 1), ("full_name", 1)],
                [("school_id", 1), ("account_status", 1)],
                [("school_id", 1), ("batch_id", 1)],
                [("passing_year", 1), ("verification_status", 1)],
                [("verification_status", 1), ("passing_year", -1)],
                "mobile",
                ("admission_number", {"sparse": True})
            ]),
            (db.batches, [
                ([("school_id", 1), ("passing_year", 1)], {"unique": True}),
                [("school_id", 1), ("status", 1)]
            ]),
            (db.events, [
                [("school_id", 1), ("event_date", 1)],
                [("school_id", 1), ("batch_id", 1)],
                [("status", 1), ("event_date", 1)],
                [("event_date", -1)]
            ]),
            (db.event_attendance, [
                ([("event_id", 1), ("alumni_id", 1)], {"unique": True}),
                [("event_id", 1), ("rsvp_status", 1)]
            ]),
            (db.checkins, [
                ([("event_id", 1), ("alumni_id", 1)], {"unique": True})
            ]),
            (db.announcements, [
                [("school_id", 1), ("target", 1)]
            ]),
            (db.memories, [
                [("school_id", 1), ("batch_id", 1)],
                [("school_id", 1), ("event_id", 1)]
            ]),
            (db.account_invitations, [
                ("token_hash", {"unique": True, "sparse": True}),
                [("alumni_id", 1), ("used", 1)],
                ("expires_at", {"expireAfterSeconds": 0})
            ]),
            (db.schools, [
                ("code", {"sparse": True})
            ]),
            (db.audit_logs, [
                [("school_id", 1), ("timestamp", -1)]
            ])
        ]
        for col, specs in collections_specs:
            await safe_create_indexes_bulk(col, specs)
        _indexes_verified = True
        logger.info("MongoDB indexes verified and ensured successfully.")
    except Exception as e:
        logger.warning(f"Index verification notice: {e}")


def get_db():
    return db_instance.db

async def resolve_school_target_ids(school_id: str) -> list:
    """
    Resolves school IDs matching a string, ObjectId, or school code.
    Caches the result in in-memory TTL cache and uses strict projection
    to avoid downloading multi-megabyte base64 logo/cover fields.
    """
    if not school_id or str(school_id).strip() in ["None", "undefined", "null", ""]:
        return []
    s_str = str(school_id).strip()
    cache_key = f"school_target_ids:{s_str}"
    
    from app.core.cache import ttl_cache
    cached = ttl_cache.get(cache_key)
    if cached is not None:
        return cached

    db = get_db()
    if db is None:
        return [s_str]

    target_ids = [s_str]
    try:
        target_ids.append(ObjectId(s_str))
    except Exception:
        pass

    school_or = [{"code": s_str}]
    if ObjectId.is_valid(s_str):
        school_or.append({"_id": ObjectId(s_str)})
    else:
        school_or.append({"_id": s_str})

    # STRICT PROJECTION: Only fetch _id and code, NEVER raw 4MB base64 images
    school = await db.schools.find_one({"$or": school_or}, {"_id": 1, "code": 1})
    if school:
        s_id_str = str(school["_id"])
        s_id_obj = school["_id"]
        s_code = school.get("code")
        for val in [s_id_str, s_id_obj, s_code]:
            if val and val not in target_ids:
                target_ids.append(val)

    ttl_cache.set(cache_key, target_ids, ttl=300)
    return target_ids

async def build_school_filter(school_id: str = None) -> dict:
    """Builds an indexed query filter for school_id with cached target resolution."""
    target_ids = await resolve_school_target_ids(school_id)
    if not target_ids:
        return {}
    return {"school_id": {"$in": target_ids}}