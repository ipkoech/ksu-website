from fastapi import APIRouter

from .health import router as health_router
from .public import router as public_router

router = APIRouter()
router.include_router(health_router)
router.include_router(public_router)
