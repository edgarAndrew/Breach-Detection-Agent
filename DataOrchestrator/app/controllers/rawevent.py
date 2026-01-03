from fastapi import HTTPException
from app.repositories.rawevent import RawEventRepository
from app.routers.utils import normalize

class RawEventController:
    def __init__(self, db):
        self.repo = RawEventRepository(db)

    async def create(self, payload):
        if not await self.repo.webhook_exists(payload.webhook_id):
            raise HTTPException(404, "Webhook not found")
        return normalize(await self.repo.create(payload.dict()))

    async def list(self):
        return [normalize(e) for e in await self.repo.list()]
