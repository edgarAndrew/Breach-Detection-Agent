from pydantic import BaseModel
from app.models.base import MongoBaseModel

class UserOrganizationCreate(BaseModel):
    user_id: str
    org_id: str
    role_type: str = "member"  # member | admin | owner

class UserOrganizationOut(MongoBaseModel):
    user_id: str
    org_id: str
    role_type: str
