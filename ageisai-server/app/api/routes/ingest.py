from fastapi import APIRouter, BackgroundTasks, Depends

from app.auth.dependencies import get_current_org_id
from app.db.mongo import get_db
from app.schemas.ingest import LLMEventBatch, MLEventBatch
from app.services.drift_detector import compute_drift_score
from app.services.health_service import compute_health_score
from app.services.alert_service import (
    create_drift_alert_if_needed,
    create_health_alert_if_needed,
    create_risk_alert_if_needed,
)
from app.services.ml_risk_classifier import compute_ml_risk
from app.services.llm_risk_classifier import compute_llm_risk


router = APIRouter()


def approximate_token_count(text: str) -> int:
    # Simple heuristic: 1 token ~ 4 chars
    return max(1, int(len(text) / 4))


@router.post("/ml")
async def ingest_ml_events(
    payload: MLEventBatch,
    background_tasks: BackgroundTasks,
    org_id=Depends(get_current_org_id),
    db=Depends(get_db),
):
    docs = []
    for event in payload.events:
        docs.append(
            {
                "organization_id": org_id,
                "model_name": event.model_name,
                "prediction": event.prediction,
                "input_data": event.input_data,
                "latency_ms": event.latency_ms,
                "timestamp": event.timestamp,
            }
        )
    if docs:
        result = await db["ml_events"].insert_many(docs)
        inserted_ids = result.inserted_ids
        model_names = list({e.model_name for e in payload.events})

        async def drift_task():
            for model_name in model_names:
                drift_score = await compute_drift_score(db, org_id, model_name)
                if drift_score is None:
                    continue
                from datetime import datetime

                now = datetime.utcnow()
                drift_doc = {
                    "organization_id": org_id,
                    "model_name": model_name,
                    "window_start": now,
                    "window_end": now,
                    "mean_latency_ms": 0.0,
                    "drift_score": drift_score,
                    "created_at": now,
                }
                await db["drift_metrics"].insert_one(drift_doc)
                await create_drift_alert_if_needed(db, org_id, model_name, drift_score)

        async def ml_risk_task():
            drift_by_model = {}
            profile_by_model = {}
            for oid, doc in zip(inserted_ids, docs):
                model_name = doc["model_name"]
                if model_name not in drift_by_model:
                    latest = await db["drift_metrics"].find_one(
                        {"organization_id": org_id, "model_name": model_name},
                        sort=[("created_at", -1)],
                        projection={"drift_score": 1},
                    )
                    drift_by_model[model_name] = (
                        latest["drift_score"] if latest else 0.0
                    )
                if model_name not in profile_by_model:
                    profile_by_model[model_name] = await db["model_profiles"].find_one(
                        {"organization_id": org_id, "model_name": model_name}
                    )
                profile = profile_by_model[model_name]
                input_data = doc.get("input_data") or {}
                probabilities = input_data.get("probabilities")
                features = input_data.get("features", input_data)
                feature_stats = None
                if profile and "feature_stats" in profile:
                    feature_stats = profile.get("feature_stats")
                risk_result = compute_ml_risk(
                    prediction=doc["prediction"],
                    probabilities=probabilities,
                    drift_score=drift_by_model[model_name],
                    feature_stats=feature_stats,
                    features=features if isinstance(features, dict) else None,
                )
                await db["ml_events"].update_one(
                    {"_id": oid},
                    {
                        "$set": {
                            "riskScore": risk_result["riskScore"],
                            "riskLabel": risk_result["riskLabel"],
                        }
                    },
                )
                if risk_result["riskLabel"] == "risky":
                    await create_risk_alert_if_needed(
                        db,
                        org_id,
                        source="ml",
                        model_name=model_name,
                        risk_score=risk_result["riskScore"],
                        flags=None,
                    )

        background_tasks.add_task(drift_task)
        background_tasks.add_task(ml_risk_task)

    return {"ingested": len(docs)}


@router.post("/llm")
async def ingest_llm_events(
    payload: LLMEventBatch,
    background_tasks: BackgroundTasks,
    org_id=Depends(get_current_org_id),
    db=Depends(get_db),
):
    docs = []
    for event in payload.events:
        token_count = approximate_token_count(event.prompt + event.response)
        docs.append(
            {
                "organization_id": org_id,
                "model_name": event.model_name,
                "prompt": event.prompt,
                "response": event.response,
                "latency_ms": event.latency_ms,
                "token_count": token_count,
                "timestamp": event.timestamp,
            }
        )

    if docs:
        result = await db["llm_events"].insert_many(docs)
        inserted_ids = result.inserted_ids

        async def llm_risk_task():
            for oid, doc in zip(inserted_ids, docs):
                risk_result = compute_llm_risk(
                    prompt=doc["prompt"],
                    response=doc.get("response", ""),
                )
                await db["llm_events"].update_one(
                    {"_id": oid},
                    {
                        "$set": {
                            "riskScore": risk_result["riskScore"],
                            "riskLabel": risk_result["riskLabel"],
                            "flags": risk_result.get("flags", []),
                        }
                    },
                )
                if risk_result["riskLabel"] == "risky":
                    await create_risk_alert_if_needed(
                        db,
                        org_id,
                        source="llm",
                        model_name=doc.get("model_name"),
                        risk_score=risk_result["riskScore"],
                        flags=risk_result.get("flags"),
                    )

        async def health_task():
            score = await compute_health_score(db, org_id)
            from datetime import datetime

            now = datetime.utcnow()
            await db["health_scores"].update_one(
                {"organization_id": org_id},
                {
                    "$set": {
                        "score": score,
                        "updated_at": now,
                    },
                    "$setOnInsert": {
                        "details": {},
                        "created_at": now,
                        "organization_id": org_id,
                    },
                },
                upsert=True,
            )
            await create_health_alert_if_needed(db, org_id, score)

        background_tasks.add_task(llm_risk_task)
        background_tasks.add_task(health_task)

    return {"ingested": len(docs)}

