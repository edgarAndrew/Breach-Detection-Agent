from fastapi import APIRouter, Depends
from app.database.database import get_database
from app.controllers.trends import TrendsController

router = APIRouter(tags=["Trends"])


def get_controller(db=Depends(get_database)):
    return TrendsController(db)


@router.get("/org/{org_id}")
async def get_org_trends(
    org_id: str,
    controller=Depends(get_controller)
):
    return await controller.org_trends(org_id)


@router.get("/org/{org_id}/rule/{rule_id}")
async def get_org_rule_trends(
    org_id: str,
    rule_id: str,
    controller=Depends(get_controller)
):
    return await controller.org_rule_trends(org_id, rule_id)
