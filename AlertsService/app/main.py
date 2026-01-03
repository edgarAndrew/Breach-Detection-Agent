from fastapi import FastAPI
import asyncio
from app.worker import alert_worker

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(alert_worker())

@app.get("/health")
def health():
    return {"status": "ok"}