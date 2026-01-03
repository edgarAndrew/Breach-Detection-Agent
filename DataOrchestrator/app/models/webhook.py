from pydantic import BaseModel
from typing import Optional
from app.models.base import MongoBaseModel

class WebhookCreate(BaseModel):
    data_src_id: str
    endpoint: str
    api_key: Optional[str] = None

class WebhookOut(MongoBaseModel):
    data_src_id: str
    endpoint: str
    api_key: Optional[str]