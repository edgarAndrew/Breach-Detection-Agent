from fastapi import APIRouter, Depends
from app.models.alert import AlertCreate, AlertOut
from app.database.database import get_database
from app.controllers.alert import AlertController
from typing import Dict, List
from app.controllers.user_org import UserOrganizationController
from app.utils.jwt import verify_token

router = APIRouter(tags=["Alerts"])

def get_controller(db=Depends(get_database)):
    return AlertController(db)

@router.post("", response_model=AlertOut, status_code=201)
async def create_alert(
    payload: AlertCreate,
    controller=Depends(get_controller),
):
    return await controller.create(payload)

@router.get("")
async def list_alerts(controller=Depends(get_controller)):
    return await controller.list()

@router.get("/unsent")
async def list_unsent_alerts_grouped(controller=Depends(get_controller)):
    """
    Get all alerts where email_sent == false, grouped by org_id
    """
    return await controller.list_unsent_grouped()

@router.get("/unsent/{org_id}")
async def list_unsent_alerts_for_org(org_id,controller=Depends(get_controller)):
    """
    Get all unsent alerts (email_sent = false) for a specific organization
    """
    return await controller.list_unsent_by_org(org_id)

@router.get("/org", response_model=list[AlertOut])
async def list_org_alerts(
    user_id: str = Depends(verify_token),
    controller=Depends(get_controller),
    db = Depends(get_database)
):
    user_org_controller = UserOrganizationController(db)
    org_id = await user_org_controller.getUserOrgId(user_id)
    return await controller.list_by_org(org_id)