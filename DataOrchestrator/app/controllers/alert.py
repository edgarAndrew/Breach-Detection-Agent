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
        """ Return all alerts where email_sent == False. Sends them and sets mark_sent == True. """
        alerts = await self.repo.list_unsent()

        if alerts:
            ids = [a["_id"] for a in alerts]
            await self.repo.mark_sent(ids)

        grouped = {}
        for raw in alerts:
            org_id = raw.get("org_id", "unknown")
            normalized = normalize(raw)
            normalized["email_sent"] = True
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