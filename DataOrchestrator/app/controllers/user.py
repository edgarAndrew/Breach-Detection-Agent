from fastapi import HTTPException
from app.repositories.user import UserRepository
from app.routers.utils import normalize
from passlib.context import CryptContext
from app.models.user import UserCreate
from app.utils.jwt import create_access_token

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
        
        user = await self.repo.create(user_data)
        if not user:
            raise HTTPException(500, "Failed to create user")
        access_token = create_access_token(data={"sub": str(user["_id"])})
        return {"access_token": access_token, "token_type": "bearer"}
        

    async def list(self):
        return [normalize(u) for u in await self.repo.list()]
    
    async def login(self, email: str, password: str):
        user = await self.repo.email_exists(email)
        if not user:
            raise HTTPException(401, "Invalid email")
        
        if not self.pwd_context.verify(password, user["password"]):
            raise HTTPException(401, "Invalid password")
        
        access_token = create_access_token(data={"sub": str(user["_id"])})
        return {"access_token": access_token, "token_type": "bearer"}
