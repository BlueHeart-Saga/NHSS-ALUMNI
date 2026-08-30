import asyncio
import logging
import sys
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_developer")

async def seed_developer_account(mobile: str = "+917550375037", email: str = "developer@justgathernow.com"):
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DATABASE]

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
    mobile_input = sys.argv[1] if len(sys.argv) > 1 else "+917550375037"
    email_input = sys.argv[2] if len(sys.argv) > 2 else "developer@justgathernow.com"
    asyncio.run(seed_developer_account(mobile_input, email_input))
