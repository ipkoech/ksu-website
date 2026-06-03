"""Library v1 API router — all domain routers registered here."""

from fastapi import APIRouter

from .audit import router as audit_router
from .health import router as health_router
from .library import router as library_router
from .resources import router as resources_router
from .staff import router as staff_router
from .stats import router as stats_router
from .electronic import router as electronic_router
from .engagement import router as engagement_router

router = APIRouter()
router.include_router(health_router)
router.include_router(audit_router)
router.include_router(stats_router)
router.include_router(library_router)
router.include_router(resources_router)
router.include_router(staff_router)
router.include_router(electronic_router)
router.include_router(engagement_router)
