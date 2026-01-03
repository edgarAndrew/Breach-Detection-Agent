from bson import ObjectId
from pydantic import BaseModel, Field
from typing import Optional

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

class MongoBaseModel(BaseModel):
    id: Optional[str] = Field(alias="_id")

    model_config = {
        "populate_by_name": True,   # <-- replaces allow_population_by_field_name
        "arbitrary_types_allowed": True,
    }