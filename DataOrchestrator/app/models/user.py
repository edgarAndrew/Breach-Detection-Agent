from pydantic import BaseModel, EmailStr
from app.models.base import MongoBaseModel

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(MongoBaseModel):
    email: EmailStr