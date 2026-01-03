import logging
import httpx
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

RULES_SERVICE_URL = "http://127.0.0.1:8080/api/rules"


def iso_to_epoch(ts: str) -> float:
    """Convert ISO timestamp to epoch seconds"""
    return datetime.fromisoformat(ts.replace("Z", "+00:00")).timestamp()


async def evaluate_health(payload: dict):
    """
    Expects payload with:
    - rule_id: str
    - rawevents: List[{
        payload: { <metrics>, time_stamp }
      }]

    Returns overall health, slope, threshold, and trend.
    """
    rule_id = payload["rule_id"]
    rawevents = payload.get("rawevents", [])

    logger.info(
        f"Health evaluation requested for rule_id={rule_id}, rawevents={len(rawevents)}"
    )

    try:
        if len(rawevents) < 2:
            return {
                "rule_id": rule_id,
                "overall_health": "INSUFFICIENT_DATA",
                "slope": None,
                "threshold": None,
                "trend": []
            }

        # Fetch rules
        async with httpx.AsyncClient() as client:
            resp = await client.get(RULES_SERVICE_URL)
            resp.raise_for_status()
            rules = resp.json()

        matched_rule = next((r for r in rules if r["_id"] == rule_id), None)
        if not matched_rule:
            raise ValueError(f"No rule found with rule_id={rule_id}")

        threshold = matched_rule["threshold"]
        operator = matched_rule["operator"]
        attribute = matched_rule["attribute_name"]

        # Extract (timestamp, value)
        extracted = []
        for event in rawevents:
            p = event.get("payload", {})
            if attribute not in p or "time_stamp" not in p:
                continue

            extracted.append({
                "timestamp": iso_to_epoch(p["time_stamp"]),
                "value": float(p[attribute])
            })

        if len(extracted) < 2:
            return {
                "rule_id": rule_id,
                "overall_health": "INSUFFICIENT_DATA",
                "slope": None,
                "threshold": threshold,
                "trend": []
            }

        # Sort by timestamp
        extracted.sort(key=lambda x: x["timestamp"])

        values = [e["value"] for e in extracted]
        start, end = values[0], values[-1]

        slope = (end - start) / (len(values) - 1)

        # Health logic
        if abs(end - start) < 0.01:
            overall_health = "STABLE"
        else:
            if operator in ("gt", "gte"):
                if end >= threshold:
                    overall_health = "MOVING_TOWARDS_THRESHOLD"
                elif end > start:
                    overall_health = "DETERIORATING"
                else:
                    overall_health = "MOVING_AWAY_FROM_THRESHOLD"

            elif operator in ("lt", "lte"):
                if end <= threshold:
                    overall_health = "MOVING_TOWARDS_THRESHOLD"
                elif end < start:
                    overall_health = "DETERIORATING"
                else:
                    overall_health = "MOVING_AWAY_FROM_THRESHOLD"

            elif operator == "eq":
                if abs(end - threshold) <= 0.01:
                    overall_health = "MOVING_TOWARDS_THRESHOLD"
                elif abs(end - start) > 0:
                    overall_health = "DETERIORATING"
                else:
                    overall_health = "MOVING_AWAY_FROM_THRESHOLD"

        trend = [
            {
                "timestamp": e["timestamp"],
                "value": e["value"],
                "threshold": threshold
            }
            for e in extracted
        ]

        return {
            "rule_id": rule_id,
            "overall_health": overall_health,
            "slope": slope,
            "threshold": threshold,
            "trend": trend
        }

    except Exception as e:
        logger.exception("Unexpected error during health evaluation")
        raise
