from fastapi import APIRouter, Depends
from app.models.user import UserCreate, UserOut
from app.database.database import get_database
from app.controllers.user import UserController

router = APIRouter(tags=["Users"])

def get_controller(db=Depends(get_database)) -> UserController:
    return UserController(db)

@router.post("/register", response_model=UserOut, status_code=201)
async def create_user(payload: UserCreate, c:UserController = Depends(get_controller)):
    return await c.register(payload)

@router.get("", response_model=list[UserOut])
async def list_users(c=Depends(get_controller)):
    return await c.list()
