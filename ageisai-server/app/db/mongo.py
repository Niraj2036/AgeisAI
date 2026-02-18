from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import get_settings


mongo_client: Optional[AsyncIOMotorClient] = None
mongo_db: Optional[AsyncIOMotorDatabase] = None


async def connect_to_mongo() -> None:
    global mongo_client, mongo_db
    settings = get_settings()
    mongo_client = AsyncIOMotorClient(settings.mongo_uri)
    mongo_db = mongo_client[settings.mongo_db_name]
    await _ensure_risk_indexes(mongo_db)


async def _ensure_risk_indexes(db: AsyncIOMotorDatabase) -> None:
    """Create indexes for risk classification queries."""
    await db["ml_events"].create_index([("riskLabel", 1), ("timestamp", -1)])
    await db["ml_events"].create_index([("organization_id", 1), ("riskLabel", 1)])
    await db["llm_events"].create_index([("riskLabel", 1), ("timestamp", -1)])
    await db["llm_events"].create_index([("organization_id", 1), ("riskLabel", 1)])


async def close_mongo_connection() -> None:
    global mongo_client, mongo_db
    if mongo_client is not None:
        mongo_client.close()
    mongo_client = None
    mongo_db = None


def get_db() -> AsyncIOMotorDatabase:
    if mongo_db is None:
        raise RuntimeError("MongoDB is not initialized")
    return mongo_db

