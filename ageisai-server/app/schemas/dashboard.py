from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class HealthScoreOut(BaseModel):
    score: float
    details: Dict[str, Any]
    updated_at: datetime


class AlertOut(BaseModel):
    id: str
    model_name: Optional[str]
    type: str
    message: str
    severity: str
    created_at: datetime
    resolved: bool


class ModelSummary(BaseModel):
    model_name: str
    mean_latency_ms: float
    drift_score: float


class ModelsResponse(BaseModel):
    models: List[ModelSummary]


class RiskDistributionOut(BaseModel):
    normalCount: int
    suspiciousCount: int
    riskyCount: int

