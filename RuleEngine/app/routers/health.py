from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.controllers.health import evaluate_health

router = APIRouter(prefix="/health", tags=["Health"])


# ----------- Request Models -----------

class RawEvent(BaseModel):
    payload: Dict[str, Any]
    ingested_at: float


class HealthPayload(BaseModel):
    rule_id: str
    rawevents: List[RawEvent]


# ----------- Endpoint -----------

@router.post("/evaluate")
async def evaluate_health_endpoint(payload: HealthPayload):
    """
    Health evaluation for a rule based on raw events.

    Expected payload:
    {
      "rule_id": "6959673750d49d804ae16c5a",
      "rawevents": [
        {
          "payload": {
            "growth": 5.2,
            "time_stamp": "2026-01-01T17:29:02.376687+00:00"
          },
          "ingested_at": 1767447307.1481931
        }
      ]
    }
    """
    try:
        return await evaluate_health(payload.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
