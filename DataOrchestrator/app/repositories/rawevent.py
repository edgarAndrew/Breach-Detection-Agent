from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

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
    
    async def get_by_webhook_and_time_range(self,webhook_id: str,start_ts: float,end_ts: float):
        """
        Get all raw events for a webhook within a time range.
        Timestamps are epoch seconds.
        """
        cursor = self.col.find(
            {
                "webhook_id": webhook_id,
                "ingested_at": {
                    "$gte": start_ts,
                    "$lte": end_ts,
                },
            }
        )

        return [doc async for doc in cursor]