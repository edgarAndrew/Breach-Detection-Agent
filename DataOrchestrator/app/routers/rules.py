from fastapi import APIRouter, Depends
from app.models.rule import RuleCreate, RuleOut
from app.database.database import get_database
from app.controllers.rule import RuleController

router = APIRouter(tags=["Rules"])

def get_controller(db=Depends(get_database)):
    return RuleController(db)

@router.post("", response_model=RuleOut, status_code=201)
async def create_rule(
    payload: RuleCreate,
    controller=Depends(get_controller),
):
    return await controller.create(payload)

@router.get("", response_model=list[RuleOut])
async def list_rules(controller=Depends(get_controller)):
    return await controller.list()
