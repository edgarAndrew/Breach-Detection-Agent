from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.routers.utils import normalize

class WebhookRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.col = db.webhooks
        self.ds = db.datasources
        self.uo = db.user_organizations

    async def datasource_exists(self, id: str):
        return await self.ds.find_one({"_id": ObjectId(id)})

    async def get_ids_from_user_id(self, user_id: str):
        org = await self.uo.find_one({"user_id": user_id})
        if not org:
            raise ValueError(f"No organization found for user_id: {user_id}")
        
        org_id = org.get("org_id")
        if not org_id:
            raise ValueError(f"User {user_id} has no org_id assigned")

        ds = await self.ds.find_one({"org_id": org_id})
        if not ds:
            raise ValueError(f"No data source found for org_id: {org_id}")
        
        ds_id = ds.get("_id")
        if not ds_id:
            raise ValueError("Data source document missing _id")

        return {
            "org_id": str(org_id), 
            "ds_id": str(ds_id)
        }

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
    
    async def regenerate_webhook_api(self, webhook_id: str, data_src_id, hashed_api: str):
        result = await self.col.update_one(
            {"_id": ObjectId(webhook_id), "data_src_id": data_src_id},
            {"$set": {"api_key": hashed_api}}
        )

        if result.matched_count == 0:
            return None

        return webhook_id
