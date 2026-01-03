from pydantic import BaseModel
from typing import Dict, Any
from app.models.base import MongoBaseModel

class RawEventCreate(BaseModel):
    event_id: str
    webhook_id: str
    org_id: str
    send_at: str
    payload: Dict[str, Any]

class RawEventOut(MongoBaseModel):
    webhook_id: str
    org_id: str
    payload: Dict[str, Any]