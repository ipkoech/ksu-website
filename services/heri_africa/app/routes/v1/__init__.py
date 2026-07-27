from fastapi import APIRouter

from .health import router as health_router
from .analytics import router as analytics_router
from .public import router as public_router
from .submissions import router as submissions_router

router = APIRouter()
router.include_router(health_router)
router.include_router(analytics_router)
router.include_router(public_router)
router.include_router(submissions_router)
