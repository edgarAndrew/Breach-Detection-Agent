from fastapi import HTTPException
from app.repositories.user_orgs import UserOrganizationRepository
from app.repositories.user import UserRepository
from app.routers.utils import normalize

class UserOrganizationController:
    def __init__(self, db):
        self.repo = UserOrganizationRepository(db)
        self.userRepo = UserRepository(db)

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

    async def getUserOrgId(self, user_id):
        membership = await self.repo.get_membership_by_user(user_id)
        if not membership:
            raise HTTPException(404, "User organization not found")
        return membership["org_id"]
    
    async def getUserFromOrg(self, org_id):
        user_id = await self.repo.get_user_id_by_org(org_id)
        if not user_id:
            raise HTTPException(404, "Organization not found")
        
        email = await self.userRepo.get_email_by_id(user_id)
        if not email:
            raise HTTPException(404, "User not found")
        
        return {"email": email}