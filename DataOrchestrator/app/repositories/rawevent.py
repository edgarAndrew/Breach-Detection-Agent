from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict, Any

class RawEventRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.col = db.rawevents
        self.webhooks = db.webhooks

    async def webhook_exists(self, id: str):
        return await self.webhooks.find_one({"_id": ObjectId(id)})

    async def create(self, data):
        res = await self.col.insert_one(data)
        return await self.col.find_one({"_id": res.inserted_id})

    async def list(self):
        return [e async for e in self.col.find()]
    
    async def create_many(self, docs):
        if not docs:
            return []
        res = await self.col.insert_many(docs)
        return res.inserted_ids