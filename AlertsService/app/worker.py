import asyncio
import requests
import os
from datetime import datetime
from collections import defaultdict
from app.mailgun import send_email

DATA_ORCHESTRATOR_SERVICE_URL = os.getenv("DATA_ORCHESTRATOR_SERVICE_URL", "http://localhost:8080")
GET_UNSENT_ALERTS = f"{DATA_ORCHESTRATOR_SERVICE_URL}/api/alerts/unsent"
GET_ORGANIZATION_EMAIL = "{base_url}/api/memberships/{org_id}/user"
MAIL_WORKER_INTERVAL = float(os.getenv("MAIL_WORKER_INTERVAL", 15))


def get_org_email(org_id: str) -> str | None:
    """Fetch email for an organization"""
    try:
        resp = requests.get(
            GET_ORGANIZATION_EMAIL.format(org_id=org_id, base_url=DATA_ORCHESTRATOR_SERVICE_URL),
            timeout=5
        )
        resp.raise_for_status()
        return resp.json().get("email")
    except Exception as e:
        print(f"Failed to fetch email for org {org_id}: {e}")
        return None


async def alert_worker():
    while True:
        await asyncio.sleep(MAIL_WORKER_INTERVAL)

        try:
            response = requests.get(GET_UNSENT_ALERTS, timeout=10)
            response.raise_for_status()
            alerts_by_org = response.json()
        except Exception as e:
            print("Failed to fetch alerts:", e)
            continue
        
        # Log if no unsent alerts
        if not alerts_by_org or not any(alerts_by_org.values()):
            print(f"[{datetime.utcnow()}] No unsent alerts found")
            continue

        batched_alerts = defaultdict(list)

        for org_id, alerts in alerts_by_org.items():

            recipient = get_org_email(org_id)

            #testing (remove this later)
            if org_id == "os-comp" and recipient is None:
                recipient = "edgarcamelo03@aol.com"

            if not recipient:
                print(f"No email found for org {org_id}")
                continue

            batched_alerts[recipient].extend(alerts)

        for recipient, items in batched_alerts.items():
            subject = f"Alert Digest ({len(items)} alerts)"
            body = "\n".join(
                f"- [{a['status']}] {a['message']}"
                for a in items
            )

            try:
                send_email(recipient, subject, body)
                print(f"[{datetime.utcnow()}] Sent {len(items)} alerts to {recipient}")
            except Exception as e:
                print(f"Failed to send email to {recipient}: {e}")