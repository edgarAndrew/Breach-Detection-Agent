from fastapi import HTTPException
from app.repositories.user import UserRepository
from app.repositories.user_orgs import UserOrganizationRepository
from app.repositories.datasource import DatasourceRepository
from app.routers.utils import normalize
from passlib.context import CryptContext
from app.models.user import UserCreate
from app.utils.jwt import create_access_token

class UserController:
    def __init__(self, db):
        self.repo = UserRepository(db)
        self.uoRepo = UserOrganizationRepository(db)
        self.dsRepo = DatasourceRepository(db)
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

    async def get_email(self, user_id: str):
        email = await self.repo.get_email_by_id(user_id)
        if not email:
            raise HTTPException(status_code=404, detail="User not found")
        return {"email": email}
    
    async def get_data_src(self, user_id: str):
        if not await self.repo.user_exists(user_id):
            raise HTTPException(status_code=404, detail="User not found")
        
        membership = await self.uoRepo.get_membership_by_user(user_id)
        
        if not membership:
            raise HTTPException(404, "User organization not found")
        
        org_id = membership["org_id"]

        datasource_id = await self.dsRepo.get_datasource_id_by_org_id(org_id)
        if not datasource_id:
            raise HTTPException(status_code=404, detail="Datasource not found")
        
        return {"datasource_id": datasource_id}