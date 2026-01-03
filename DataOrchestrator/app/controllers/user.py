from fastapi import HTTPException
from app.repositories.user import UserRepository
from app.routers.utils import normalize
from passlib.context import CryptContext
from app.models.user import UserCreate

class UserController:
    def __init__(self, db):
        self.repo = UserRepository(db)
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    async def register(self, payload:UserCreate):
        if await self.repo.email_exists(payload.email):
            raise HTTPException(400, "Email already exists")
        
        hashed_password =self.pwd_context.hash(payload.password)
        user_data = payload.dict()
        user_data["password"] = hashed_password
        
        return normalize(await self.repo.create(user_data))

    async def list(self):
        return [normalize(u) for u in await self.repo.list()]
    
    async def login(self, email: str, password: str):
        user = await self.repo.email_exists(email)
        if not user:
            raise HTTPException(401, "Invalid email")
        
        if not self.pwd_context.verify(password, user["password"]):
            raise HTTPException(401, "Invalid password")
        
        return normalize(user)
