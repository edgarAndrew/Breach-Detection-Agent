from fastapi import HTTPException
from app.repositories.datasource import DatasourceRepository
from app.routers.utils import normalize

class DatasourceController:
    def __init__(self, db):
        self.repo = DatasourceRepository(db)

    async def create_datasource(self, payload):
        if not await self.repo.org_exists(payload.org_id):
            raise HTTPException(404, "Organization not found")

        doc = await self.repo.create(payload.dict())
        return normalize(doc)

    async def list_datasources(self):
        docs = await self.repo.list()
        return [normalize(d) for d in docs]

    async def get_fields(self, user_id):
        return await self.repo.get_fields(user_id)
    