from pydantic import BaseModel
from typing import List
from app.models.base import MongoBaseModel

class DatasourceCreate(BaseModel):
    data_src_name: str
    fields: List[str]
    org_id: str

class DatasourceOut(MongoBaseModel):
    data_src_name: str
    fields: List[str]
    org_id: str

class DatasourceFields(MongoBaseModel):
    fields: List[str]