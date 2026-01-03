from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

class DatasourceRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.datasources
        self.orgs = db.organizations
        self.uo = db.user_organizations

    async def org_exists(self, org_id: str) -> bool:
        return await self.orgs.find_one({"_id": ObjectId(org_id)}) is not None

    async def create(self, data: dict) -> dict:
        res = await self.collection.insert_one(data)
        return await self.collection.find_one({"_id": res.inserted_id})

    async def list(self) -> List[dict]:
        return [d async for d in self.collection.find()]
    
    async def get_fields(self, user_id) -> List[str]:
        user = await self.uo.find_one({"user_id": user_id})
        res = await self.collection.find_one({"org_id": user['org_id']})    
        return res.get("fields", [])
    
    async def get_datasource_id_by_org_id(self, org_id: str):
        datasource = await self.collection.find_one(
            {"org_id": org_id},
            {"_id": 1}
        )
        if not datasource:
            return None
        
        return str(datasource["_id"])