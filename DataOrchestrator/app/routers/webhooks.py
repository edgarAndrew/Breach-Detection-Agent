from fastapi import APIRouter, Depends, HTTPException
from app.models.webhook import WebhookCreate, WebhookOut
from app.database.database import get_database
from app.routers.utils import normalize, oid

router = APIRouter(tags=["Webhooks"])

@router.post("", response_model=WebhookOut, status_code=201)
async def create_webhook(w: WebhookCreate, db=Depends(get_database)):
    if not await db.datasources.find_one({"_id": oid(w.data_src_id)}):
        raise HTTPException(404, "Datasource not found")

    res = await db.webhooks.insert_one(w.dict())
    doc = await db.webhooks.find_one({"_id": res.inserted_id})
    return normalize(doc)

@router.get("", response_model=list[WebhookOut])
async def list_webhooks(db=Depends(get_database)):
    return [normalize(w) async for w in db.webhooks.find()]
