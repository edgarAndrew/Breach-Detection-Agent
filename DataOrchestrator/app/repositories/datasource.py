from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

class DatasourceRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.datasources
        self.orgs = db.organizations

    async def org_exists(self, org_id: str) -> bool:
        return await self.orgs.find_one({"_id": ObjectId(org_id)}) is not None

    async def create(self, data: dict) -> dict:
        res = await self.collection.insert_one(data)
        return await self.collection.find_one({"_id": res.inserted_id})

    async def list(self) -> list[dict]:
        return [d async for d in self.collection.find()]