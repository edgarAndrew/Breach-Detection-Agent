from fastapi import FastAPI
from app.validation import router
from app.database import connect, disconnect

app = FastAPI(title="Validation Service")
app.include_router(router)

@app.on_event("startup")
async def startup_event():
    await connect()

@app.on_event("shutdown")
async def shutdown_event():
    await disconnect()