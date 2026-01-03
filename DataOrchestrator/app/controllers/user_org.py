from fastapi import HTTPException
from app.repositories.user_orgs import UserOrganizationRepository
from app.routers.utils import normalize

class UserOrganizationController:
    def __init__(self, db):
        self.repo = UserOrganizationRepository(db)

    async def create(self, payload):
        if not await self.repo.user_exists(payload.user_id):
            raise HTTPException(404, "User not found")

        if not await self.repo.org_exists(payload.org_id):
            raise HTTPException(404, "Organization not found")

        if await self.repo.membership_exists(payload.user_id, payload.org_id):
            raise HTTPException(400, "User already belongs to organization")

        doc = await self.repo.create(payload.dict())
        return normalize(doc)

    async def list(self):
        docs = await self.repo.list()
        return [normalize(d) for d in docs]
