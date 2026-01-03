from fastapi import HTTPException
from app.repositories.alert import AlertRepository
from app.routers.utils import normalize

class AlertController:
    def __init__(self, db):
        self.repo = AlertRepository(db)

    async def create(self, payload):
        if not await self.repo.rule_exists(payload.rule_id):
            raise HTTPException(404, "Rule not found")
        return normalize(await self.repo.create(payload.dict()))

    async def list(self):
        return [normalize(a) for a in await self.repo.list()]
