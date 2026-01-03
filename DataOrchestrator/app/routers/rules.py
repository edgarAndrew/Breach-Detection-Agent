from fastapi import APIRouter, Depends
from app.models.rule import RuleCreate, RuleOut
from app.database.database import get_database
from app.controllers.rule import RuleController
from app.controllers.user_org import UserOrganizationController
from app.utils.jwt import verify_token

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

@router.get("/org", response_model=list[RuleOut])
async def get_org_rules(user_id: str = Depends(verify_token), controller=Depends(get_controller), db=Depends(get_database)):
    user_org = UserOrganizationController(db)
    org_id = await user_org.getUserOrgId(user_id)
    return await controller.getOrgRules(org_id)

@router.delete("/{rule_id}", status_code=204)
async def delete_rule(rule_id: str, controller=Depends(get_controller)):
    await controller.delete(rule_id)