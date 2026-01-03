import asyncio
from datetime import datetime, timezone
import uuid
from Redis.client import RedisPubSubClient
from Redis.queues import RAWEVENTS_QUEUE

ORG_EVENTS = [
    {
        "org_id": "os-comp",
        "payload": {
            "open_price": 152.3,
            "close_price": 156.0,   # triggers gte close_price rule
            "volume": 900000.0,
            "day_high": 158.75,
            "growth": 150.0
        }
    },
    {
        "org_id": "os-comp",
        "payload": {
            "open_price": 140.0,
            "close_price": 145.0,
            "volume": 1_200_000.0,  # triggers high volume rule
            "day_high": 148.0,
            "growth": 138.5
        }
    },
    {
        "org_id": "os-comp",
        "payload": {
            "open_price": 140.0,
            "close_price": 145.0,
            "volume": 1_200_000.0,  # triggers high volume rule
            "day_high": 148.0,
            "growth": 138.5
        }
    },
    {
        "org_id": "os-comp",
        "payload": {
            "open_price": 140.0,
            "close_price": 145.0,
            "volume": 1_200_000.0,  # triggers high volume rule
            "day_high": 148.0,
            "growth": 138.5
        }
    },
    {
        "org_id": "os-comp",
        "payload": {
            "open_price": 140.0,
            "close_price": 145.0,
            "volume": 1_200_000.0,  # triggers high volume rule
            "day_high": 148.0,
            "growth": 138.5
        }
    }
]

async def main():
    client = RedisPubSubClient()

    for i in range(6):
        org_event = ORG_EVENTS[i % len(ORG_EVENTS)]

        event = {
            "event_id": f"evt-{uuid.uuid4().hex[:8]}",
            "webhook_id": f"whk-{uuid.uuid4().hex[:8]}",
            "rule_id": "rule_001",
            "org_id": org_event["org_id"],
            "payload": {
                **org_event["payload"],
                "time_stamp": datetime.now(timezone.utc).isoformat()
            },
            "send_at": datetime.now(timezone.utc).isoformat()
        }

        await client.publish_json(RAWEVENTS_QUEUE, event)
        print("Published event:", event)

        await asyncio.sleep(1)

    await client.close()

if __name__ == "__main__":
    asyncio.run(main())
