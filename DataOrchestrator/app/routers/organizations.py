from fastapi import APIRouter, Depends
from app.models.organization import OrganizationCreate, OrganizationOut
from app.models.user_org import UserOrganizationCreate
from app.database.database import get_database
from app.controllers.organization import OrganizationController
from app.controllers.user_org import UserOrganizationController
from app.utils.jwt import verify_token

router = APIRouter(tags=["Organizations"])

def get_controller(db=Depends(get_database)):
    return OrganizationController(db)

@router.post("", response_model=OrganizationOut, status_code=201)
async def create_org(payload: OrganizationCreate, user_id: str = Depends(verify_token), c=Depends(get_controller), db=Depends(get_database)):
    user_org = UserOrganizationController(db)
    org = await c.create(payload)
    if org:
        await user_org.create(UserOrganizationCreate(org_id=org["_id"], user_id=user_id, role_type="owner"))
    return org

@router.get("", response_model=list[OrganizationOut])
async def list_orgs(c=Depends(get_controller)):
    return await c.list()