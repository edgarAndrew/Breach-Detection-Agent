from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict

class AlertRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.col = db.alerts
        self.rules = db.rules

    async def rule_exists(self, id: str):
        return True
        # return await self.rules.find_one({"_id": ObjectId(id)})

    async def create(self, data):
        res = await self.col.insert_one(data)
        return await self.col.find_one({"_id": res.inserted_id})
    
    async def create_many(self, docs):
        if not docs:
            return []
        res = await self.col.insert_many(docs)
        return res.inserted_ids
    
    async def list(self):
        return [a async for a in self.col.find()]
