from datetime import datetime, timedelta

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import get_settings


async def compute_health_score(db: AsyncIOMotorDatabase, org_id) -> float:
    """Compute an overall AI health score based on recent drift and LLM latencies."""
    settings = get_settings()
    max_score = settings.health_max_score

    # Start from perfect score and subtract penalties
    score = max_score

    # Penalize for drift
    recent_drift = (
        await db["drift_metrics"]
        .find({"organization_id": org_id})
        .sort("created_at", -1)
        .limit(10)
        .to_list(length=10)
    )
    if recent_drift:
        avg_drift = sum(d["drift_score"] for d in recent_drift) / len(recent_drift)
        score -= min(avg_drift, 40.0)  # cap penalty

    # Penalize for high LLM latency in last 15 minutes
    now = datetime.utcnow()
    window_start = now - timedelta(minutes=15)
    pipeline = [
        {
            "$match": {
                "organization_id": org_id,
                "timestamp": {"$gte": window_start, "$lte": now},
            }
        },
        {"$group": {"_id": None, "mean_latency_ms": {"$avg": "$latency_ms"}}},
    ]
    llm_cursor = db["llm_events"].aggregate(pipeline)
    llm_results = await llm_cursor.to_list(length=1)
    if llm_results:
        mean_latency = llm_results[0]["mean_latency_ms"]
        if mean_latency > 1000:
            score -= min((mean_latency - 1000) / 50.0, 30.0)

    return float(max(settings.health_min_score, min(score, max_score)))

