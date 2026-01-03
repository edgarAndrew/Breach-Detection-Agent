import json
from datetime import datetime
from typing import Literal, List
from pydantic import BaseModel
import asyncio
import logging
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[2]))
from Redis.client import RedisPubSubClient
from Redis.queues import RAWEVENTS_QUEUE,ALERTS_QUEUE

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# -------------------------
# Pydantic models
# -------------------------
class RawEvent(BaseModel):
    event_id: str
    webhook_id: str
    org_id: str
    payload: dict  # dynamic payload, any fields
    send_at: str

class Rule(BaseModel):
    rule_name: str
    rule_id: str
    data_src_id: str
    org_id: str
    field_name: str  # field in payload to check
    threshold: float
    near_thres: float = 0.0
    operator: Literal["gt", "lt", "gte", "lte", "eq"]

# -------------------------
# Hardcoded rules for testing
# -------------------------
RULES: List[Rule] = [
    Rule(
        rule_name="High Close Price",
        rule_id="rule_001",
        data_src_id="src_1",
        org_id="os-comp",
        field_name="growth",
        threshold=5,
        near_thres=1,
        operator="lte"
    )
    # ,
    # Rule(
    #     rule_name="Low Open Price",
    #     data_src_id="src_2",
    #     org_id="org_name",
    #     field_name="open_price",
    #     threshold=150.0,
    #     near_thres=2.0,
    #     operator="lte"
    # ),
    # Rule(
    #     rule_name="High Volume",
    #     data_src_id="src_3",
    #     org_id="org_name2",
    #     field_name="volume",
    #     threshold=1000000.0,
    #     near_thres=50000.0,
    #     operator="gte"
    # )
]

# -------------------------
# Commented-out future URL fetching
# -------------------------
# import aiohttp
# from cachetools import TTLCache
# RULE_CACHE = TTLCache(maxsize=100, ttl=300)
#
# async def fetch_rules_from_url(org_id: str) -> List[Rule]:
#     if org_id in RULE_CACHE:
#         return RULE_CACHE[org_id]
#     async with aiohttp.ClientSession() as session:
#         async with session.get(f"http://rule-service/rules?org_id={org_id}") as resp:
#             data = await resp.json()
#             rules = [Rule(**r) for r in data]
#             RULE_CACHE[org_id] = rules
#             return rules

# -------------------------
# Evaluation function
# -------------------------
def evaluate(value: float, rule: Rule) -> str:
    t = rule.threshold
    n = rule.near_thres

    if rule.operator == "gt":
        # Rule: value > threshold
        if value <= t:
            return "BREACH"
        elif value <= t + n:
            return "NEAR_BREACH"

    elif rule.operator == "gte":
        # Rule: value >= threshold
        if value < t:
            return "BREACH"
        elif value < t + n:
            return "NEAR_BREACH"

    elif rule.operator == "lt":
        # Rule: value < threshold
        if value >= t:
            return "BREACH"
        elif value >= t - n:
            return "NEAR_BREACH"

    elif rule.operator == "lte":
        # Rule: value <= threshold
        if value > t:
            return "BREACH"
        elif value > t - n:
            return "NEAR_BREACH"

    elif rule.operator == "eq":
        # Rule: value == threshold
        if value != t:
            if abs(value - t) <= n:
                return "NEAR_BREACH"
            return "BREACH"

    return "SAFE"

# -------------------------
# Rule engine handler 
# -------------------------
async def process_event(message: str):
    """
    Processes a single raw event, checks it against matching rules for the org,
    and publishes alerts to ALERTS_QUEUE if BREACH or NEAR_BREACH occurs.
    """
    try:
        event = RawEvent.parse_raw(message)
        client = RedisPubSubClient()

        # Match rules by org_id
        matched_rules = [r for r in RULES if r.org_id == event.org_id]

        if not matched_rules:
            logger.info("No rules for org_id: %s", event.org_id)
            await client.close()
            return

        alerts_to_publish = []

        for rule in matched_rules:
            if rule.field_name not in event.payload:
                logger.warning(
                    "Field %s not present in payload for event %s",
                    rule.field_name,
                    event.event_id
                )
                continue

            value = event.payload[rule.field_name]
            status = evaluate(value, rule)

            if status != "SAFE":
                alert = {
                    "event_id": event.event_id,
                    "org_id": event.org_id,
                    "rule_id": rule.rule_id,   
                    "rule_name": rule.rule_name,
                    "status": status,
                    "field_name": rule.field_name,
                    "current_value": value,
                    "threshold": rule.threshold,
                    "timestamp": datetime.utcnow().isoformat(),
                    "message": (
                        f"Rule '{rule.rule_name}' evaluated field '{rule.field_name}'. "
                        f"Current value = {value}, "
                        f"threshold = {rule.threshold}, "
                        f"status = {status}."
                    )
                }
                alerts_to_publish.append(alert)

        # Publish all alerts at once
        for alert in alerts_to_publish:
            await client.publish_json(ALERTS_QUEUE, alert)
            logger.info("Alert published: %s", alert)

        await client.close()
    except Exception as e:
        logger.exception("Error processing event: %s", e)
