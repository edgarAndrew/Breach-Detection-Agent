from fastapi import APIRouter, Depends
from app.models.user_org import UserOrganizationCreate, UserOrganizationOut
from app.database.database import get_database
from app.controllers.user_org import UserOrganizationController
from app.utils.jwt import verify_token

router = APIRouter(tags=["UserOrganizations"])

def get_controller(db=Depends(get_database)):
    return UserOrganizationController(db)

@router.post("", response_model=UserOrganizationOut, status_code=201)
async def add_user_to_org(
    payload: UserOrganizationCreate,
    controller=Depends(get_controller),
):
    return await controller.create(payload)

@router.get("", response_model=list[UserOrganizationOut])
async def list_memberships(controller=Depends(get_controller)):
    return await controller.list()

@router.get("/{org_id}/user")
async def get_user_from_org(org_id: str,controller=Depends(get_controller)):
    """
    Returns email of the owner (preferred) or first user of the organization.
    """
    return await controller.getUserFromOrg(org_id)

@router.get("/get-org-details")
async def get_org(user_id = Depends(verify_token), c=Depends(get_controller)):
    org_id = await c.getUserOrgId(user_id)
    return {"org_id": org_id}