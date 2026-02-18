from datetime import datetime, timedelta
from typing import Optional, Tuple

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import get_settings


async def compute_mean_latency(
    db: AsyncIOMotorDatabase,
    org_id,
    model_name: str,
    window_minutes: int = 5,
) -> Optional[Tuple[float, datetime, datetime]]:
    """Compute mean latency for recent ML events for a given model."""
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(minutes=window_minutes)

    pipeline = [
        {
            "$match": {
                "organization_id": org_id,
                "model_name": model_name,
                "timestamp": {"$gte": start_time, "$lte": end_time},
            }
        },
        {
            "$group": {
                "_id": None,
                "mean_latency_ms": {"$avg": "$latency_ms"},
            }
        },
    ]
    cursor = db["ml_events"].aggregate(pipeline)
    result = await cursor.to_list(length=1)
    if not result:
        return None
    mean_latency = result[0]["mean_latency_ms"]
    return mean_latency, start_time, end_time


async def compute_drift_score(
    db: AsyncIOMotorDatabase,
    org_id,
    model_name: str,
) -> Optional[float]:
    settings = get_settings()
    baseline = await db["model_profiles"].find_one(
        {"organization_id": org_id, "model_name": model_name}
    )
    if not baseline:
        return None
    baseline_latency = baseline["baseline_latency_ms"]
    mean_info = await compute_mean_latency(db, org_id, model_name)
    if not mean_info:
        return None
    mean_latency, _, _ = mean_info
    if baseline_latency <= 0:
        return 0.0
    ratio = mean_latency / baseline_latency
    drift_score = max(0.0, (ratio - 1.0) * 100.0)
    # Cap drift score
    return min(drift_score, 100.0)

