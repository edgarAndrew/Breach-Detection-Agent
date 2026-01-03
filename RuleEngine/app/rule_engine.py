# rule_engine.py
import json
from datetime import datetime
from typing import Literal
from pydantic import BaseModel
import asyncio
import logging
import sys
from pathlib import Path

from app.rule_cache import RULE_CACHE, Rule

sys.path.append(str(Path(__file__).resolve().parents[2]))
from Redis.client import RedisPubSubClient
from Redis.queues import ALERTS_QUEUE

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# -------------------------
# Pydantic models
# -------------------------
class RawEvent(BaseModel):
    event_id: str
    webhook_id: str
    org_id: str
    payload: dict
    send_at: str

# -------------------------
# Evaluation function
# -------------------------
def evaluate(value: float, rule: Rule) -> str:
    t = rule.threshold
    n = rule.near_thres

    if rule.operator == "gt":
        if value <= t:
            return "BREACH"
        elif value <= t + n:
            return "NEAR_BREACH"

    elif rule.operator == "gte":
        if value < t:
            return "BREACH"
        elif value < t + n:
            return "NEAR_BREACH"

    elif rule.operator == "lt":
        if value >= t:
            return "BREACH"
        elif value >= t - n:
            return "NEAR_BREACH"

    elif rule.operator == "lte":
        if value > t:
            return "BREACH"
        elif value > t - n:
            return "NEAR_BREACH"

    elif rule.operator == "eq":
        if value != t:
            if abs(value - t) <= n:
                return "NEAR_BREACH"
            return "BREACH"

    return "SAFE"

# -------------------------
# Rule engine handler
# -------------------------
async def process_event(message: str):
    """Consume Redis message, evaluate rules, publish alerts."""
    try:
        event = RawEvent.parse_raw(message)
        client = RedisPubSubClient()

        matched_rules = RULE_CACHE.get(event.org_id, [])

        if not matched_rules:
            logger.info("No rules for org_id: %s", event.org_id)
            await client.close()
            return

        for rule in matched_rules:
            if rule.attribute_name not in event.payload:
                logger.warning(
                    "Attribute %s not present in payload for event %s",
                    rule.attribute_name,
                    event.event_id
                )
                continue

            value = event.payload[rule.attribute_name]
            status = evaluate(value, rule)

            if status != "SAFE":
                alert = {
                    "event_id": event.event_id,
                    "org_id": event.org_id,
                    "rule_id": rule.rule_id,
                    "rule_name": rule.rule_name,
                    "status": status,
                    "field_name": rule.attribute_name,
                    "current_value": value,
                    "threshold": rule.threshold,
                    "timestamp": datetime.utcnow().isoformat(),
                    "message": (
                        f"Rule '{rule.rule_name}' evaluated attribute "
                        f"'{rule.attribute_name}'. Current value = {value}, "
                        f"threshold = {rule.threshold}, status = {status}."
                    )
                }

                await client.publish_json(ALERTS_QUEUE, alert)
                logger.info("Alert published: %s", alert)

        await client.close()

    except Exception:
        logger.exception("Error processing event")
