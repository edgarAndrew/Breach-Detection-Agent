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

    async def list_unsent_grouped(self):
        """
        Return alerts with email_sent == False, grouped by org_id.
        """
        alerts = await self.repo.list_unsent()
        grouped = {}

        for raw in alerts:
            org_id = raw.get("org_id", "unknown")
            normalized = normalize(raw)
            grouped.setdefault(org_id, []).append(normalized)

        return grouped
    
    async def list_unsent_by_org(self, org_id: str):
        alerts = await self.repo.list_unsent_by_org(org_id)

        normalized_alerts = []
        for raw in alerts:
            alert = normalize(raw)

            # Ensure required fields exist (prevents 500s)
            alert.setdefault("insights", {})
            alert.setdefault("email_sent", False)

            normalized_alerts.append(alert)

        return normalized_alerts

    async def list_by_org(self, org_id: str):
        return [normalize(a) for a in await self.repo.list_by_org(org_id)]