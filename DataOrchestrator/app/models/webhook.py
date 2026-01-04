from pydantic import BaseModel
from typing import Optional
from app.models.base import MongoBaseModel

# class WebhookCreate(BaseModel):
    # data_src_id: str
    # endpoint: str
    # api_key: Optional[str] = None
    # active: bool = True

class WebhookOut(MongoBaseModel):
    url: str
    api_key: str

class WebhookUrl(BaseModel):
    webhook_id: str
    url: str