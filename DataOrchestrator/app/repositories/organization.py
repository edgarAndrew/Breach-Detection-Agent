from motor.motor_asyncio import AsyncIOMotorDatabase

class OrganizationRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.col = db.organizations

    async def create(self, data):
        res = await self.col.insert_one(data)
        return await self.col.find_one({"_id": res.inserted_id})

    async def list(self):
        return [o async for o in self.col.find()]
