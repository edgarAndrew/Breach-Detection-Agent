from fastapi import APIRouter, Request, HTTPException, status, Header, Depends, Path
import httpx
import logging
import os
import hmac
import hashlib
from uuid import uuid4
from app.database import Webhook_collection
from datetime import datetime, timezone

SECRET_KEY = os.environ["API_SECRET_KEY"].encode()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhook")

VALIDATION_SERVICE_URL = os.getenv("VALIDATION_SERVICE_URL", "http://localhost:8001/validate/normalize")

def hash_api_key(api_key: str) -> str:
    return hmac.new(
        SECRET_KEY,
        api_key.encode(),
        hashlib.sha256
    ).hexdigest()

async def verify_webhook_access(org_id: str, webhook_id: str, x_api_key: str = Header(...)):
    """
    Verify that:
    1. API key is valid and active
    2. The webhook_id belongs to the owner of this API key
    """
    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API key"
        )
    
    hashed_api_key = hash_api_key(x_api_key)

    webhook_doc = await Webhook_collection.find_one({
        "api_key": hashed_api_key,
        "webhook_id": webhook_id,
        "active": True
    })
    
    # if not webhook_doc:
    #     logger.warning(f"Access denied: webhook_id={webhook_id}, api_key={x_api_key[:8]}...")
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Invalid webhook ID or API key"
    #     )
    
    logger.info(f"Access granted: org_id={org_id}, webhook={webhook_id}")
    return webhook_doc


@router.post("/receive/{org_id}/{webhook_id}")
async def receive_webhook(
    org_id: str = Path(..., description="Organization ID"),
    webhook_id: str = Path(..., description="Unique webhook ID"),
    request: Request = None,
    webhook_doc: dict = Depends(verify_webhook_access)
):
    """Receive webhook and forward to validation service"""
    try:
        payload = await request.json()
        logger.info(f"Received webhook payload for {webhook_id}: {payload}")

        # Generate a unique event ID for this ingestion
        event_id = str(uuid4())
        send_at = datetime.now(timezone.utc).isoformat()

        validation_payload = {
            "event_id": event_id,
            "webhook_id": webhook_id,
            "org_id": org_id,
            "payload": payload, 
            "send_at": send_at
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                VALIDATION_SERVICE_URL,
                json=validation_payload,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            
        return {
            "status": "forwarded",
            "event_id": event_id,
            "validation_response": response.json()
        }
        
    except httpx.HTTPStatusError as e:
        logger.error(f"Validation service returned error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Validation service error. {e.response.json().get('detail')}"
        )
    except ValueError as e:
        logger.error(f"Invalid JSON payload: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload"
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal processing error"
        )