# rule_cache.py
import asyncio
import logging
from typing import Dict, List
import aiohttp
from pydantic import BaseModel
from typing import Literal

logger = logging.getLogger(__name__)

RULE_SERVICE_URL = "http://localhost:8080/api/rules"
RULE_REFRESH_INTERVAL = 60  # seconds

# -------------------------
# Rule Model
# -------------------------
class Rule(BaseModel):
    rule_name: str
    rule_id: str
    data_src_id: str
    org_id: str
    attribute_name: str
    threshold: float
    near_thres: float = 0.0
    operator: Literal["gt", "lt", "gte", "lte", "eq"]

# -------------------------
# In-memory cache
# -------------------------
RULE_CACHE: Dict[str, List[Rule]] = {}

# -------------------------
# Fetch rules from service
# -------------------------
async def fetch_all_rules() -> Dict[str, List[Rule]]:
    async with aiohttp.ClientSession() as session:
        async with session.get(RULE_SERVICE_URL) as resp:
            if resp.status != 200:
                raise RuntimeError(f"Rule service returned {resp.status}")

            data = await resp.json()
            cache: Dict[str, List[Rule]] = {}

            for r in data:
                rule = Rule(
                    rule_name=r["rule_name"],
                    rule_id=r["rule_id"],
                    data_src_id=r["data_src_id"],
                    org_id=r["org_id"],
                    attribute_name=r["attribute_name"],
                    threshold=r["threshold"],
                    near_thres=r.get("near_thres", 0),
                    operator=r["operator"],
                )
                cache.setdefault(rule.org_id, []).append(rule)

            return cache

# -------------------------
# Background refresher
# -------------------------
async def rule_refresh_worker():
    """Continuously refresh RULE_CACHE in-place."""
    while True:
        try:
            logger.info("Refreshing rules from Rule Service...")
            new_cache = await fetch_all_rules()
            RULE_CACHE.clear()
            RULE_CACHE.update(new_cache)
            logger.info("Rules refreshed successfully. Orgs loaded: %s", list(RULE_CACHE.keys()))
        except Exception:
            logger.exception("Failed to refresh rules")

        await asyncio.sleep(RULE_REFRESH_INTERVAL)
