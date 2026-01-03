from fastapi import APIRouter, Depends
from app.models.rawevent import RawEventCreate, RawEventOut
from app.database.database import get_database
from app.controllers.rawevent import RawEventController

router = APIRouter(tags=["RawEvents"])

def get_controller(db=Depends(get_database)):
    return RawEventController(db)

@router.post("", response_model=RawEventOut, status_code=201)
async def create_event(
    payload: RawEventCreate,
    controller=Depends(get_controller),
):
    return await controller.create(payload)

@router.get("", response_model=list[RawEventOut])
async def list_events(controller=Depends(get_controller)):
    return await controller.list()
