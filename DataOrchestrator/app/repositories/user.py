from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

class UserRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.col = db.users

    async def user_exists(self, user_id: str):
        return await self.col.find_one({"_id": ObjectId(user_id)})
    
    async def email_exists(self, email: str):
        return await self.col.find_one({"email": email})

    async def create(self, data: dict):
        res = await self.col.insert_one(data)
        return await self.col.find_one({"_id": res.inserted_id})

    async def list(self):
        return [u async for u in self.col.find()]
    
    async def get_email_by_id(self, user_id: str):
        user = await self.col.find_one(
            {"_id": ObjectId(user_id)},
            {"email": 1}  # projection
        )
        return user["email"] if user else None