from fastapi import APIRouter, Depends
from app.models.datasource import DatasourceCreate, DatasourceOut
from app.database.database import get_database
from app.controllers.datasource import DatasourceController

router = APIRouter(tags=["Datasources"])

@router.post("", response_model=DatasourceOut, status_code=201)
async def create_datasource(
    payload: DatasourceCreate,
    db=Depends(get_database),
):
    controller = DatasourceController(db)
    return await controller.create_datasource(payload)

@router.get("", response_model=list[DatasourceOut])
async def list_datasources(db=Depends(get_database)):
    controller = DatasourceController(db)
    return await controller.list_datasources()
