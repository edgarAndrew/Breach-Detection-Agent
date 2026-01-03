from app.repositories.organization import OrganizationRepository
from app.routers.utils import normalize

class OrganizationController:
    def __init__(self, db):
        self.repo = OrganizationRepository(db)

    async def create(self, payload):
        return normalize(await self.repo.create(payload.dict()))

    async def list(self):
        return [normalize(o) for o in await self.repo.list()]