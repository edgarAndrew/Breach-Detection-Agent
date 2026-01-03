from pydantic import BaseModel
from app.models.base import MongoBaseModel

class RuleCreate(BaseModel):
    rule_name: str
    # rule_id: str
    data_src_id: str
    org_id: str
    attribute_name: str
    threshold: float
    near_thres: float = 0.0
    operator: str  # gt | lt | gte | lte | eq

class RuleOut(MongoBaseModel):
    rule_name: str
    # rule_id: str
    data_src_id: str
    org_id: str
    attribute_name:str
    threshold: float
    near_thres: float
    operator: str

class LLMRuleOut(BaseModel):
    rule_name: str
    attribute_name:str
    threshold: float
    near_thres: float
    operator: str
