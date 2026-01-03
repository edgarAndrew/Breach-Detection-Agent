from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.controllers.health import evaluate_health

router = APIRouter(prefix="/health", tags=["Health"])

class HealthPayload(BaseModel):
    rule_id: str
    data: List[Dict[str, Any]]  # dynamic attribute names allowed

@router.post("/evaluate")
async def evaluate_health_endpoint(payload: HealthPayload):
    """
    Health evaluation for a rule based on JSON input.

    Example payload:
    {
      "rule_id": "6959673750d49d804ae16c5a",
      "data": [
        {"timestamp": 1767459125.7205746, "growth": 4.8},
        {"timestamp": 1767459125.800922, "growth": 5.2},
        {"timestamp": 1767459126, "growth": 5.5}
      ]
    }
    """
    try:
        return await evaluate_health(payload.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
