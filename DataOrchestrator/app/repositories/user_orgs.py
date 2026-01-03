from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

class UserOrganizationRepository:
    def __init__(self, db:AsyncIOMotorDatabase):
        self.col = db.user_organizations
        self.users = db.users
        self.orgs = db.organizations

    async def user_exists(self, user_id: str) -> bool:
        return await self.users.find_one({"_id": ObjectId(user_id)}) is not None

    async def org_exists(self, org_id: str) -> bool:
        return await self.orgs.find_one({"_id": ObjectId(org_id)}) is not None

    async def membership_exists(self, user_id: str, org_id: str) -> bool:
        return await self.col.find_one(
            {"user_id": user_id, "org_id": org_id}
        ) is not None

    async def create(self, data: dict) -> dict:
        res = await self.col.insert_one(data)
        return await self.col.find_one({"_id": res.inserted_id})

    async def list(self) -> list[dict]:
        return [m async for m in self.col.find()]

    async def get_membership_by_user(self, user_id) -> dict | None:
        return await self.col.find_one({"user_id": user_id})
    
    async def get_user_id_by_org(self, org_id: str) -> str | None:
        """
        Returns user_id for a given org_id.
        If multiple users exist, owner is preferred.
        """

        owner = await self.col.find_one(
            {"org_id": org_id, "role_type": "owner"}
        )
        if owner:
            return owner["user_id"]

        return None