from typing import List, Dict, Any


class TrendsRepository:
    def __init__(self, db):
        self.collection = db.alerts

    # -----------------------------
    # ORG-LEVEL TRENDS
    # -----------------------------
    async def get_org_trends(self, org_id: str) -> Dict[str, Any]:
        pipeline = [
            {"$match": {"org_id": org_id}},
            {
                "$facet": {
                    "total": [{"$count": "count"}],
                    "by_status": [
                        {
                            "$group": {
                                "_id": "$status",
                                "count": {"$sum": 1}
                            }
                        }
                    ],
                    "by_rule": [
                        {
                            "$group": {
                                "_id": {
                                    "rule_id": "$rule_id",
                                    "rule_name": "$rule_name"
                                },
                                "count": {"$sum": 1}
                            }
                        }
                    ],
                    "latest": [
                        {"$sort": {"created_at": -1}},
                        {"$limit": 1},
                        {"$project": {"_id": 0, "created_at": 1}}
                    ]
                }
            }
        ]

        result = await self.collection.aggregate(pipeline).to_list(length=1)
        if not result:
            return None

        data = result[0]

        return {
            "org_id": org_id,
            "total_alerts": data["total"][0]["count"] if data["total"] else 0,
            "by_status": {
                r["_id"]: r["count"] for r in data["by_status"]
            },
            "by_rule": [
                {
                    "rule_id": r["_id"]["rule_id"],
                    "rule_name": r["_id"]["rule_name"],
                    "count": r["count"]
                }
                for r in data["by_rule"]
            ],
            "latest_alert_at": (
                data["latest"][0]["created_at"]
                if data["latest"] else None
            )
        }

    # -----------------------------
    # ORG + RULE TRENDS
    # -----------------------------
    async def get_org_rule_trends(self, org_id: str, rule_id: str) -> Dict[str, Any]:
        cursor = self.collection.find(
            {"org_id": org_id, "rule_id": rule_id},
            {
                "_id": 0,
                "created_at": 1,
                "current_value": 1,
                "threshold": 1
            }
        ).sort("created_at", 1)

        rows = await cursor.to_list(length=None)
        if not rows:
            return None

        values = [r["current_value"] for r in rows]
        threshold = rows[0]["threshold"]

        return {
            "org_id": org_id,
            "rule_id": rule_id,
            "threshold": threshold,
            "trend": [
                {
                    "timestamp": r["created_at"],
                    "value": r["current_value"]
                }
                for r in rows
            ],
            "health": self._calculate_health(values, threshold)
        }

    # -----------------------------
    # HEALTH LOGIC
    # -----------------------------
    def _calculate_health(self, values: List[float], threshold: float) -> str:
        if len(values) < 2:
            return "INSUFFICIENT_DATA"

        start = values[0]
        end = values[-1]

        if abs(end - start) < 0.01:
            return "STABLE"

        if end > start:
            return (
                "MOVING_TOWARDS_THRESHOLD"
                if end >= threshold
                else "DETERIORATING"
            )
        else:
            return "MOVING_AWAY_FROM_THRESHOLD"
        
# INSUFFICIENT_DATA – Not enough data points to determine a trend.(less than 2 data points)

# STABLE – Metric value shows no significant change over time.

# DETERIORATING – Metric is moving in the risky direction but has not yet crossed the threshold.

# MOVING_TOWARDS_THRESHOLD – Metric is moving in the risky direction and has reached or crossed the threshold.

# MOVING_AWAY_FROM_THRESHOLD – Metric is moving away from the threshold, indicating improving health.
