from fastapi import APIRouter
from app.api.complaints import router as complaints_router
from app.api.health import router as health_router

api_router = APIRouter(prefix="/api")
api_router.include_router(health_router)
api_router.include_router(complaints_router)
