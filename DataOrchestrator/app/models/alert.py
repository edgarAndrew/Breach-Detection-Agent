from pydantic import BaseModel, Field
from typing import Dict, Any, Literal
from datetime import datetime
from app.models.base import MongoBaseModel


class AlertCreate(BaseModel):
    event_id: str
    org_id: str

    rule_id: str
    rule_name: str

    status: Literal["SAFE", "NEAR_BREACH", "BREACH"]

    field_name: str
    current_value: float
    threshold: float

    message: str

    insights: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AlertOut(MongoBaseModel):
    event_id: str
    org_id: str

    rule_id: str
    rule_name: str

    status: Literal["SAFE", "NEAR_BREACH", "BREACH"]

    field_name: str
    current_value: float
    threshold: float

    message: str

    insights: Dict[str, Any]
    created_at: datetime
