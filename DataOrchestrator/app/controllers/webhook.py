from fastapi import HTTPException
from app.repositories.webhook import WebhookRepository
from app.routers.utils import normalize

class WebhookController:
    def __init__(self, db):
        self.repo = WebhookRepository(db)

    async def create(self, payload):
        if not await self.repo.datasource_exists(payload.data_src_id):
            raise HTTPException(404, "Datasource not found")
        return normalize(await self.repo.create(payload.dict()))

    async def list(self):
        return [normalize(w) for w in await self.repo.list()]
