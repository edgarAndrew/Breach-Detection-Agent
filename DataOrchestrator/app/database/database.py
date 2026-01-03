from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

class MongoDB:
    client: Optional[AsyncIOMotorClient] = None

db = MongoDB()

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(MONGODB_URL)
    print("Connected to MongoDB")

async def close_mongo_connection():
    db.client.close()
    print("Closed MongoDB connection")

def get_database():
    return db.client[DATABASE_NAME]
