from fastapi import APIRouter, Depends
from app.models.organization import OrganizationCreate, OrganizationOut
from app.database.database import get_database
from app.controllers.organization import OrganizationController

router = APIRouter(tags=["Organizations"])

def get_controller(db=Depends(get_database)):
    return OrganizationController(db)

@router.post("", response_model=OrganizationOut, status_code=201)
async def create_org(payload: OrganizationCreate, c=Depends(get_controller)):
    return await c.create(payload)

@router.get("", response_model=list[OrganizationOut])
async def list_orgs(c=Depends(get_controller)):
    return await c.list()