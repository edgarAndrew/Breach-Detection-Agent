from fastapi import APIRouter, Depends, File, UploadFile,Query,Body
from app.models.rule import RuleCreate, RuleOut, LLMRuleOut
from app.database.database import get_database
from app.controllers.rule import RuleController
from app.controllers.user_org import UserOrganizationController
from app.utils.jwt import verify_token

router = APIRouter(tags=["Rules"])

def get_controller(db=Depends(get_database)):
    return RuleController(db)

@router.post("/create", status_code=201)
async def create_rule(
    payload=Body(...),
    controller=Depends(get_controller),
    user_id: str = Depends(verify_token)
):
    return await controller.create(payload, user_id)

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
    
@router.post("/pdf-to-json", response_model=list[LLMRuleOut])
async def pdf_to_json(file: UploadFile = File(...), controller=Depends(get_controller), user_id: str = Depends(verify_token)):
    return await controller.convert_to_config(file, user_id)

@router.get("/events")
async def get_events_by_rule_and_time_range(
    rule_id: str = Query(..., description="Rule ID"),
    start_ts: float = Query(..., description="Start timestamp (epoch)"),
    end_ts: float = Query(..., description="End timestamp (epoch)"),
    controller=Depends(get_controller),
):
    return await controller.get_events_by_rule_and_time_range(
        rule_id, start_ts, end_ts
    )

@router.get("/{rule_id}", response_model=RuleOut)
async def get_rule_by_id(rule_id: str, controller=Depends(get_controller)):
    """Get a rule by its ID."""
    return await controller.get_by_id(rule_id)
