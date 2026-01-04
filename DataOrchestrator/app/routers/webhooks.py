from fastapi import APIRouter, Depends
from app.models.webhook import WebhookOut, WebhookUrl
from app.database.database import get_database
from app.controllers.webhook import WebhookController
from app.utils.jwt import verify_token

router = APIRouter(tags=["Webhooks"])


def get_controller(db=Depends(get_database)) -> WebhookController:
    return WebhookController(db)


@router.post("", status_code=201)
async def create_webhook(
    controller: WebhookController = Depends(get_controller), user_id: str = Depends(verify_token)
):
    return await controller.create(user_id)


@router.get("")
async def get_webhook(
    controller: WebhookController = Depends(get_controller), user_id: str = Depends(verify_token)
):
    return await controller.get_webhook(user_id)

@router.post("/regenerate-key")
async def regenerate_webhook_api(
    controller: WebhookController = Depends(get_controller), user_id: str = Depends(verify_token)
):
    return await controller.regenerate_webhook_api(user_id)