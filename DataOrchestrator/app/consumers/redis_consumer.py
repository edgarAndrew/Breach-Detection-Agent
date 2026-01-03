import json
import time
from pydantic import ValidationError
from app.models.rawevent import RawEventCreate
from app.models.alert import AlertCreate

def make_raw_event_handler(batch_writer):
    async def handler(msg: str):
        try:
            data = json.loads(msg)
            re = RawEventCreate(**data)
        except (json.JSONDecodeError, ValidationError):
            return  # drop invalid messages

        document = {
            "webhook_id": re.webhook_id,
            "payload": re.payload,
            "ingested_at": time.time(),
        }

        await batch_writer.add(document)

    return handler

def make_alert_handler(batch_writer):
    async def handler(msg: str):
        try:
            data = json.loads(msg)
            alert = AlertCreate(**data)
        except (json.JSONDecodeError, ValidationError):
            return  # drop invalid messages

        document = {
            "rule_id": alert.rule_id,
            "event_id": alert.event_id,
            "org_id": alert.org_id,
            "rule_name": alert.rule_name,
            "status": alert.status,
            "field_name": alert.field_name,
            "current_value": alert.current_value,
            "threshold": alert.threshold,
            "message": alert.message,
            "ingested_at": time.time(),
        }

        await batch_writer.add(document)

    return handler


async def start_alert_consumer(redis_client, batch_writer,queue):
    await redis_client.subscribe(queue,make_alert_handler(batch_writer))

async def start_raw_event_consumer(redis_client, batch_writer,queue):
    await redis_client.subscribe(queue,make_raw_event_handler(batch_writer))
