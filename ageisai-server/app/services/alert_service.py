from datetime import datetime, timedelta
from typing import List, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import get_settings


async def create_drift_alert_if_needed(
    db: AsyncIOMotorDatabase,
    org_id,
    model_name: str,
    drift_score: float,
) -> Optional[str]:
    settings = get_settings()
    if drift_score < settings.drift_latency_threshold_ms / 10:  # simple mapping
        return None

    alert_doc = {
        "organization_id": org_id,
        "model_name": model_name,
        "type": "drift",
        "message": f"High latency drift detected for model {model_name}: score={drift_score:.2f}",
        "severity": "warning" if drift_score < 50 else "critical",
        "created_at": datetime.utcnow(),
        "resolved": False,
    }
    result = await db["alerts"].insert_one(alert_doc)
    return str(result.inserted_id)


async def create_health_alert_if_needed(
    db: AsyncIOMotorDatabase,
    org_id,
    health_score: float,
) -> Optional[str]:
    if health_score >= 60:
        return None

    alert_doc = {
        "organization_id": org_id,
        "model_name": None,
        "type": "health",
        "message": f"Overall AI health degraded: score={health_score:.2f}",
        "severity": "warning" if health_score >= 40 else "critical",
        "created_at": datetime.utcnow(),
        "resolved": False,
    }
    result = await db["alerts"].insert_one(alert_doc)
    return str(result.inserted_id)


async def create_risk_alert_if_needed(
    db: AsyncIOMotorDatabase,
    org_id,
    source: str,
    model_name: Optional[str],
    risk_score: float,
    flags: Optional[List[str]] = None,
) -> Optional[str]:
    """Create an alert when risk classification is 'risky'. Called from ingest background tasks."""
    alert_doc = {
        "organization_id": org_id,
        "model_name": model_name,
        "type": "risk",
        "message": f"Risky {source} event (score={risk_score:.2f})" + (
            f" — {', '.join(flags)}" if flags else ""
        ),
        "severity": "critical",
        "created_at": datetime.utcnow(),
        "resolved": False,
    }
    result = await db["alerts"].insert_one(alert_doc)
    return str(result.inserted_id)

