from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from app.models.common import MongoModel, PyObjectId


class Organization(MongoModel):
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class APIKey(MongoModel):
    organization_id: PyObjectId
    client_id: str
    client_secret_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True


class MLEvent(MongoModel):
    organization_id: PyObjectId
    model_name: str
    prediction: Any
    input_data: Dict[str, Any]
    latency_ms: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class LLMEvent(MongoModel):
    organization_id: PyObjectId
    model_name: str
    prompt: str
    response: str
    latency_ms: float
    token_count: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ModelProfile(MongoModel):
    organization_id: PyObjectId
    model_name: str
    baseline_latency_ms: float
    created_at: datetime = Field(default_factory=datetime.utcnow)


class DriftMetric(MongoModel):
    organization_id: PyObjectId
    model_name: str
    window_start: datetime
    window_end: datetime
    mean_latency_ms: float
    drift_score: float
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Alert(MongoModel):
    organization_id: PyObjectId
    model_name: Optional[str] = None
    type: str
    message: str
    severity: str = "warning"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved: bool = False


class HealthScore(MongoModel):
    organization_id: PyObjectId
    score: float
    details: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

