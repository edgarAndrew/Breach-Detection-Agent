from fastapi import APIRouter, Depends
from app.models.user_org import UserOrganizationCreate, UserOrganizationOut
from app.database.database import get_database
from app.controllers.user_org import UserOrganizationController

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