from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

class RuleRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.col = db.rules
        self.ds = db.datasources
        self.uo = db.user_organizations

    async def datasource_exists(self, id: str):
        return await self.ds.find_one({"_id": ObjectId(id)})

    async def create(self, data):
        if isinstance(data, dict):
            res = await self.col.insert_one(data)
            return await self.col.find_one({"_id": res.inserted_id})

        if isinstance(data, list):
            res = await self.col.insert_many(data)
            cursor = self.col.find({"_id": {"$in": res.inserted_ids}})
            return await cursor.to_list(length=len(res.inserted_ids))

    async def list(self):
        return [r async for r in self.col.find()]

    async def getOrgRules(self, org_id: str):
        return [r async for r in self.col.find({"org_id": org_id})]
    
    async def delete(self, rule_id: str):
        res = await self.col.delete_one({"_id": ObjectId(rule_id)})
        return res
    
    async def getOrgFieldsFromUserID(self, user_id: str):
        user = await self.uo.find_one({"user_id": user_id})
        res = await self.ds.find_one({"org_id": user['org_id']})    
        return res.get("fields", [])
    
    async def get_data_source_id_from_rule_id(self, rule_id: str):
        rule = await self.col.find_one({"_id": ObjectId(rule_id)})
        
        if not rule:
            return None
        return rule.get("data_src_id")

    async def get_by_id(self, rule_id: str):
        return await self.col.find_one({"_id": ObjectId(rule_id)})