from fastapi import APIRouter

from .health import router as health_router
from .analytics import router as analytics_router
from .admin import router as admin_router
from .collections import router as collections_router
from .admin_content import router as admin_content_router
from .admin_media import router as admin_media_router
from .analytics_report import router as analytics_report_router
from .admin_resources import router as admin_resources_router
from .public import router as public_router
from .submissions import router as submissions_router

router = APIRouter()
router.include_router(health_router)
router.include_router(analytics_router)
router.include_router(admin_router)
router.include_router(collections_router)
router.include_router(admin_content_router)
router.include_router(admin_media_router)
router.include_router(analytics_report_router)
router.include_router(admin_resources_router)
router.include_router(public_router)
router.include_router(submissions_router)
