from motor.motor_asyncio import AsyncIOMotorDatabase

class UserRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.col = db.users

    async def email_exists(self, email: str):
        return await self.col.find_one({"email": email})

    async def create(self, data: dict):
        res = await self.col.insert_one(data)
        return await self.col.find_one({"_id": res.inserted_id})

    async def list(self):
        return [u async for u in self.col.find()]