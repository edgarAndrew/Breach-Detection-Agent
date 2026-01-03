from fastapi import HTTPException
from app.repositories.trends import TrendsRepository


class TrendsController:
    def __init__(self, db):
        self.repo = TrendsRepository(db)

    async def org_trends(self, org_id: str):
        data = await self.repo.get_org_trends(org_id)
        if not data:
            raise HTTPException(status_code=404, detail="No alerts found for org")
        return data

    async def org_rule_trends(self, org_id: str, rule_id: str):
        data = await self.repo.get_org_rule_trends(org_id, rule_id)
        if not data:
            raise HTTPException(
                status_code=404,
                detail="No alerts found for org and rule"
            )
        return data
