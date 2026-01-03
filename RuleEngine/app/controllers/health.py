import logging
import httpx

logger = logging.getLogger(__name__)

RULES_SERVICE_URL = "http://127.0.0.1:8080/api/rules"

async def evaluate_health(payload: dict):
    """
    Expects payload with:
    - rule_id: str
    - data: List[Dict] each with timestamp and attribute field
      (attribute name will be fetched from the rule)
    
    Returns overall health, slope, threshold, and trend.
    """
    rule_id = payload["rule_id"]
    data_points = payload["data"]

    logger.info(f"Health evaluation requested for rule_id={rule_id}, data_points={len(data_points)}")

    try:
        if not data_points or len(data_points) < 2:
            return {
                "rule_id": rule_id,
                "overall_health": "INSUFFICIENT_DATA",
                "slope": None,
                "threshold": None,
                "trend": data_points
            }

        # Fetch rules from endpoint
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

        # Sort data by timestamp
        data_points = sorted(data_points, key=lambda x: x["timestamp"])
        values = [d[attribute] for d in data_points]

        # Calculate slope
        slope = (values[-1] - values[0]) / (len(values) - 1)
        start = values[0]
        end = values[-1]

        # Health calculation
        if abs(end - start) < 0.01:
            overall_health = "STABLE"
        else:
            risky_direction = None
            if operator in ["gt", "gte"]:
                risky_direction = "increase"
            elif operator in ["lt", "lte"]:
                risky_direction = "decrease"
            elif operator == "eq":
                risky_direction = "deviation"

            if risky_direction == "increase":
                if end >= threshold:
                    overall_health = "MOVING_TOWARDS_THRESHOLD"
                elif end > start:
                    overall_health = "DETERIORATING"
                else:
                    overall_health = "MOVING_AWAY_FROM_THRESHOLD"
            elif risky_direction == "decrease":
                if end <= threshold:
                    overall_health = "MOVING_TOWARDS_THRESHOLD"
                elif end < start:
                    overall_health = "DETERIORATING"
                else:
                    overall_health = "MOVING_AWAY_FROM_THRESHOLD"
            elif risky_direction == "deviation":
                if abs(end - threshold) <= 0.01:
                    overall_health = "MOVING_TOWARDS_THRESHOLD"
                elif abs(end - start) > 0:
                    overall_health = "DETERIORATING"
                else:
                    overall_health = "MOVING_AWAY_FROM_THRESHOLD"

        # Build trend with threshold included
        trend = [
            {"timestamp": d["timestamp"], attribute: d[attribute], "threshold": threshold}
            for d in data_points
        ]

        return {
            "rule_id": rule_id,
            "overall_health": overall_health,
            "slope": slope,
            "threshold": threshold,
            "trend": trend
        }

    except Exception as e:
        logger.error(f"Unexpected error during health evaluation: {e}")
        raise e
