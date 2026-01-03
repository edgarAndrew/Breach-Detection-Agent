from fastapi import HTTPException
from app.repositories.rule import RuleRepository
from app.routers.utils import normalize

class RuleController:
    def __init__(self, db):
        self.repo = RuleRepository(db)

    async def create(self, payload):
        if not await self.repo.datasource_exists(payload.data_src_id):
            raise HTTPException(404, "Datasource not found")
        return normalize(await self.repo.create(payload.dict()))

    async def list(self):
        return [normalize(r) for r in await self.repo.list()]

    async def getOrgRules(self, org_id: str):
        return [normalize(r) for r in await self.repo.getOrgRules(org_id)]
    
    async def delete(self, rule_id: str):
        res = await self.repo.delete(rule_id)
        if res.deleted_count == 0:
            raise HTTPException(404, "Rule not found")