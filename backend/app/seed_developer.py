import asyncio
import logging
import sys
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

from app.core.database import get_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_developer")

async def seed_developer_account(mobile: str = "+917550375037", email: str = "developer@justgathernow.com", db=None):
    if db is None:
        db = get_db()
    if db is None:
        logger.warning("Database connection not ready. Skipping developer seed.")
        return

    clean_mobile = mobile.strip()
    clean_email = email.strip().lower()

    existing_user = await db.users.find_one({"mobile": clean_mobile})
    now = datetime.now(timezone.utc)

    if existing_user:
        logger.info(f"User with mobile {clean_mobile} exists. Updating roles to [SUPER_ADMIN, DEVELOPER]...")
        await db.users.update_one(
            {"_id": existing_user["_id"]},
            {"$set": {
                "email": clean_email,
                "roles": ["SUPER_ADMIN", "DEVELOPER"],
                "is_active": True
            }}
        )
        logger.info(f"Developer Account {clean_mobile} updated successfully in production!")
    else:
        logger.info(f"Creating new Developer Account for {clean_mobile}...")
        dev_user = {
            "school_id": None,
            "mobile": clean_mobile,
            "email": clean_email,
            "roles": ["SUPER_ADMIN", "DEVELOPER"],
            "is_active": True,
            "created_at": now
        }
        await db.users.insert_one(dev_user)
        logger.info(f"Developer Account {clean_mobile} inserted successfully in production!")

if __name__ == "__main__":
    async def _standalone():
        from app.core.database import connect_to_mongo, close_mongo_connection
        await connect_to_mongo()
        try:
            mobile_input = sys.argv[1] if len(sys.argv) > 1 else "+917550375037"
            email_input = sys.argv[2] if len(sys.argv) > 2 else "developer@justgathernow.com"
            await seed_developer_account(mobile_input, email_input)
        finally:
            await close_mongo_connection()
    asyncio.run(_standalone())
