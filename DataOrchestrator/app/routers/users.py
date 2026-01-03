from fastapi import APIRouter, Depends
from app.models.user import UserCreate, UserOut
from app.database.database import get_database
from app.controllers.user import UserController
from app.models.token import Token

router = APIRouter(tags=["Users"])

def get_controller(db=Depends(get_database)) -> UserController:
    return UserController(db)

@router.post("/register", response_model=Token, status_code=201)
async def create_user(payload: UserCreate, c:UserController = Depends(get_controller)):
    return await c.register(payload)

@router.get("", response_model=list[UserOut])
async def list_users(c=Depends(get_controller)):
    return await c.list()


@router.post("/login", response_model=Token)
async def login_user(payload: UserCreate, c:UserController = Depends(get_controller)):
    return await c.login(payload.email, payload.password)

@router.get("/{user_id}")
async def get_user_email(user_id: str,c: UserController = Depends(get_controller)):
    return await c.get_email(user_id)