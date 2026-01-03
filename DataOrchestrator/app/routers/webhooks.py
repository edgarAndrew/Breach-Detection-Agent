from fastapi import APIRouter, Depends
from app.models.webhook import WebhookCreate, WebhookOut
from app.database.database import get_database
from app.controllers.webhook import WebhookController

router = APIRouter(tags=["Webhooks"])


def get_controller(db=Depends(get_database)) -> WebhookController:
    return WebhookController(db)


@router.post("", response_model=WebhookOut, status_code=201)
async def create_webhook(
    w: WebhookCreate,
    controller: WebhookController = Depends(get_controller),
):
    return await controller.create(w)


@router.get("", response_model=list[WebhookOut])
async def list_webhooks(
    controller: WebhookController = Depends(get_controller),
):
    return await controller.list()