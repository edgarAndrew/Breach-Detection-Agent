from pydantic import BaseModel
from app.models.base import MongoBaseModel

class OrganizationCreate(BaseModel):
    org_name: str

class OrganizationOut(MongoBaseModel):
    org_name: str