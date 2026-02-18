from datetime import datetime
from typing import Any, Dict, List

from pydantic import BaseModel, Field


class MLEventIn(BaseModel):
    model_name: str
    prediction: Any
    input_data: Dict[str, Any]
    latency_ms: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class LLMEventIn(BaseModel):
    model_name: str
    prompt: str
    response: str
    latency_ms: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class MLEventBatch(BaseModel):
    events: List[MLEventIn]


class LLMEventBatch(BaseModel):
    events: List[LLMEventIn]

