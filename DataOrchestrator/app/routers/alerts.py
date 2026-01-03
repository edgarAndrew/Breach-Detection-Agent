from fastapi import APIRouter, Depends
from app.models.alert import AlertCreate, AlertOut
from app.database.database import get_database
from app.controllers.alert import AlertController

router = APIRouter(tags=["Alerts"])

def get_controller(db=Depends(get_database)):
    return AlertController(db)

@router.post("", response_model=AlertOut, status_code=201)
async def create_alert(
    payload: AlertCreate,
    controller=Depends(get_controller),
):
    return await controller.create(payload)

@router.get("", response_model=list[AlertOut])
async def list_alerts(controller=Depends(get_controller)):
    return await controller.list()
