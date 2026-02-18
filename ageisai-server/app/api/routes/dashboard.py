from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_org_id
from app.db.mongo import get_db
from app.schemas.dashboard import (
    AlertOut,
    HealthScoreOut,
    ModelsResponse,
    ModelSummary,
    RiskDistributionOut,
)


router = APIRouter()


@router.get("/health", response_model=HealthScoreOut)
async def get_health(org_id=Depends(get_current_org_id), db=Depends(get_db)):
    doc = await db["health_scores"].find_one({"organization_id": org_id})
    if not doc:
        return HealthScoreOut(score=100.0, details={}, updated_at=None)  # type: ignore[arg-type]
    return HealthScoreOut(
        score=doc["score"],
        details=doc.get("details", {}),
        updated_at=doc["updated_at"],
    )


@router.get("/alerts", response_model=list[AlertOut])
async def get_alerts(org_id=Depends(get_current_org_id), db=Depends(get_db)):
    cursor = (
        db["alerts"]
        .find({"organization_id": org_id})
        .sort("created_at", -1)
        .limit(100)
    )
    docs = await cursor.to_list(length=100)
    alerts: list[AlertOut] = []
    for doc in docs:
        alerts.append(
            AlertOut(
                id=str(doc["_id"]),
                model_name=doc.get("model_name"),
                type=doc["type"],
                message=doc["message"],
                severity=doc["severity"],
                created_at=doc["created_at"],
                resolved=doc.get("resolved", False),
            )
        )
    return alerts


@router.get("/models", response_model=ModelsResponse)
async def get_models(org_id=Depends(get_current_org_id), db=Depends(get_db)):
    pipeline = [
        {"$match": {"organization_id": org_id}},
        {
            "$group": {
                "_id": "$model_name",
                "mean_latency_ms": {"$avg": "$latency_ms"},
            }
        },
    ]
    cursor = db["ml_events"].aggregate(pipeline)
    ml_stats = await cursor.to_list(length=100)

    drift_by_model = {}
    drift_cursor = (
        db["drift_metrics"]
        .find({"organization_id": org_id})
        .sort("created_at", -1)
        .limit(100)
    )
    for d in await drift_cursor.to_list(length=100):
        drift_by_model.setdefault(d["model_name"], d["drift_score"])

    models: list[ModelSummary] = []
    for stat in ml_stats:
        model_name = stat["_id"]
        models.append(
            ModelSummary(
                model_name=model_name,
                mean_latency_ms=stat["mean_latency_ms"],
                drift_score=drift_by_model.get(model_name, 0.0),
            )
        )
    return ModelsResponse(models=models)


@router.get("/risk-distribution", response_model=RiskDistributionOut)
async def get_risk_distribution(org_id=Depends(get_current_org_id), db=Depends(get_db)):
    """Aggregate risk labels from both ML and LLM events for the org."""
    pipeline = [
        {"$match": {"organization_id": org_id, "riskLabel": {"$exists": True, "$in": ["normal", "suspicious", "risky"]}}},
        {"$group": {"_id": "$riskLabel", "count": {"$sum": 1}}},
    ]
    ml_cursor = db["ml_events"].aggregate(pipeline)
    llm_cursor = db["llm_events"].aggregate(pipeline)
    ml_counts = await ml_cursor.to_list(length=10)
    llm_counts = await llm_cursor.to_list(length=10)
    counts = {"normal": 0, "suspicious": 0, "risky": 0}
    for row in ml_counts + llm_counts:
        label = row["_id"]
        if label in counts:
            counts[label] += row["count"]
    return RiskDistributionOut(
        normalCount=counts["normal"],
        suspiciousCount=counts["suspicious"],
        riskyCount=counts["risky"],
    )

