from fastapi import APIRouter, HTTPException, status
import logging
from typing import Dict, Any, Set
from app.database import DataSource_collection
import re
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[2]))
from Redis.client import RedisPubSubClient
from Redis.queues import RAWEVENTS_QUEUE

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/validate")

TIME_STAMP_KEY = "time_stamp"

async def get_allowed_keys(org_id: str, payload: Dict[str, Any]) -> Set[str]:
    """
    Fetch required fields from 'datasource' collection for the given org_id,
    and validate that ALL of them are present in the payload.

    Document structure in 'datasource' collection:
      {
        "org_id": "acme-corp",
        "fields": ["user_id", "email", "timestamp"]  <-- list of REQUIRED keys
      }

    Raises:
      HTTPException(400) if org config not found or required fields missing.
    """

    org_config = await DataSource_collection.find_one({"org_id": org_id})
    
    if not org_config:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No data source configuration found for org_id: {org_id}"
        )
    
    required_fields = org_config.get("fields")
    
    if not isinstance(required_fields, list):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Invalid 'fields' configuration for org_id {org_id}: expected list"
        )
    
    required_fields = [f for f in required_fields if isinstance(f, str)]
    if not required_fields:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Empty or invalid 'fields' list for org_id {org_id}"
        )

    payload_keys_lower = {k.lower() for k in payload.keys()}
    required_fields_lower = [f.lower() for f in required_fields] + [TIME_STAMP_KEY]

    missing_fields = set(required_fields_lower) - payload_keys_lower

    if missing_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required fields in payload: {sorted(missing_fields)}"
        )

    return set(required_fields_lower)

def normalize_payload(payload: Dict[str, Any]) -> Dict[str, float]:
    """
    Normalize payload values to float.
    - Accepts: int, float, or string representations of real numbers.
    - Rejects: non-numeric strings, None, bool, lists, objects, etc.
    - Converts all valid numbers to float (as per return type hint).
    
    Valid examples:
      "42"      → 42.0
      "3.14"    → 3.14
      "-1e5"    → -100000.0
      "+2.5"    → 2.5
      100       → 100.0

    Raises:
        ValueError: with descriptive message if any field is invalid.
    """
    normalized = {}
    invalid_keys = []

    numeric_pattern = re.compile(r'^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$')

    payload_lower_map = {k.lower(): (k, v) for k, v in payload.items()}

    for k_lower, (orig_key, v) in payload_lower_map.items():
        try:
            if k_lower == TIME_STAMP_KEY:
                normalized[TIME_STAMP_KEY] = v
                continue

            if isinstance(v, (int, float)):
                if isinstance(v, bool):
                    raise ValueError
                normalized[k_lower] = float(v)

            elif isinstance(v, str):
                v_stripped = v.strip()
                if not v_stripped:
                    raise ValueError

                if numeric_pattern.match(v_stripped):
                    normalized[k_lower] = float(v_stripped)
                else:
                    raise ValueError

            else:
                raise ValueError

        except (ValueError, OverflowError):
            invalid_keys.append(orig_key)

    if invalid_keys:
        raise ValueError(
            f"Invalid values for fields: {sorted(set(invalid_keys))}"
        )

    return normalized


@router.post("/normalize")
async def validate_normalize(payload: Dict[str, Any]):
    """
    1. Fetch allowed keys from 'datasource' collection
    2. Validate payload keys against allowed list
    3. Normalize data
    4. Store in DB
    5. Send via WebSocket
    """
    if not isinstance(payload, dict) or not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payload must be a non-empty JSON object"
        )
    
    org_id = payload["org_id"]
    raw_event_data = payload["payload"]

    # Step 1: Get allowed keys
    allowed_keys = await get_allowed_keys(org_id, raw_event_data)
    if not allowed_keys:
        logger.warning("No allowed keys found in datasource collection!")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No allowed keys configured in datasource"
        )

    # Step 2: Normalize
    try:
        normalized = normalize_payload(raw_event_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Normalization/validation error: {str(e)}"
        )

    payload["payload"] = normalized

    try:
        redis_client = RedisPubSubClient()
        await redis_client.publish_json(RAWEVENTS_QUEUE, payload)
    except Exception as e:
        logger.error(f"Failed to publish to Redis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to enqueue event for processing"
        )
    
    return {
        "status": "success",
        "message": "Data validated, normalized, and enqueued for processing",
        "event_id": payload["event_id"]
    }