"""Research v1 API router."""

from fastapi import APIRouter

from .audit import router as audit_router
from .analytics import router as analytics_router
from .ask_ai import router as ask_ai_router
from .centers import router as centers_router
from .content import router as content_router
from .donations import router as donations_router
from .exports import router as exports_router
from .grants import router as grants_router
from .health import router as health_router
from .innovations import router as innovations_router
from .innovation_partnership import router as innovation_partnership_router
from .partners import router as partners_router
from .projects import router as projects_router
from .publications import router as publications_router
from .realtime import router as realtime_router
from .scholarships import router as scholarships_router
from .search import router as search_router
from .stats import router as stats_router
from .stories import router as stories_router
from .training import router as training_router

router = APIRouter()
router.include_router(health_router)
router.include_router(audit_router)
router.include_router(analytics_router)
router.include_router(ask_ai_router)
router.include_router(stats_router)
router.include_router(search_router)
router.include_router(exports_router)
router.include_router(realtime_router)
router.include_router(centers_router)
router.include_router(projects_router)
router.include_router(grants_router)
router.include_router(publications_router)
router.include_router(innovations_router)
router.include_router(innovation_partnership_router)
router.include_router(training_router)
router.include_router(scholarships_router)
router.include_router(partners_router)
router.include_router(donations_router)
router.include_router(stories_router)
router.include_router(content_router)
