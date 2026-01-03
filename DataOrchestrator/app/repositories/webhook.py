from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

class WebhookRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.col = db.webhooks
        self.ds = db.datasources

    async def datasource_exists(self, id: str):
        return await self.ds.find_one({"_id": ObjectId(id)})

    async def create(self, data):
        res = await self.col.insert_one(data)
        return await self.col.find_one({"_id": res.inserted_id})

    async def list(self):
        return [w async for w in self.col.find()]
    
    async def get_webhook_id_from_data_source_id(self, data_src_id: str):
        webhook = await self.col.find_one(
            {"data_src_id": data_src_id},
            {"_id": 1}  # projection
        )
        if not webhook:
            return None
        return str(webhook["_id"])
