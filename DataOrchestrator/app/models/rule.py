from pydantic import BaseModel
from typing import Optional
from app.models.base import MongoBaseModel

class RuleCreate(BaseModel):
    rule_name: str
    rule_id: str
    data_src_id: str
    org_id: str
    threshold: float
    near_thres: float = 0.0
    operator: str  # gt | lt | gte | lte | eq

class RuleOut(MongoBaseModel):
    rule_name: str
    rule_id: str
    data_src_id: str
    org_id: str
    threshold: float
    near_thres: float
    operator: str