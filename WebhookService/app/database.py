from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://mongo:2701??7")
MONGODB_DB_NAME = os.getenv("DATABASE_NAME", "webhook_db")

client = AsyncIOMotorClient(MONGODB_URL)
database = client[MONGODB_DB_NAME]

Webhook_collection = database["webhook"]

async def connect():
    await client.admin.command("ping")
    print("Connected to MongoDB")

async def disconnect():
    client.close()
    print("MongoDB connection closed")