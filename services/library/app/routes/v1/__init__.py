"""Library v1 API router — all domain routers registered here."""

from fastapi import APIRouter
from ksu_common.response_validation import _iter_route_inspections

from .audit import router as audit_router
from .health import router as health_router
from .guides import router as guides_router
from .library import router as library_router
from .resources import router as resources_router
from .search import router as search_router
from .staff import router as staff_router
from .stats import router as stats_router
from .electronic import router as electronic_router
from .engagement import router as engagement_router
from .assistant_chat import router as assistant_chat_router
from .assistant_contexts import router as assistant_contexts_router
from .assistant_recovery import router as assistant_recovery_router
from .assistant_staff import router as assistant_staff_router
from .assistant_verification import router as assistant_verification_router

router = APIRouter()


def _include_unique_routes(parent: APIRouter, child: APIRouter) -> None:
    """Keep the first registered v1 handler for legacy duplicate paths.

    Library's discovery modules historically declared a few overlapping CRUD
    routes.  FastAPI dispatches the first matching route while OpenAPI keeps
    the last one, which made the documented handler differ from the runtime
    handler.  Preserve the existing dispatch order and retain only unique
    path/method pairs when adding the later compatibility router.
    """
    seen = {
        (inspection.path, frozenset(inspection.route.methods or ()))
        for inspection in _iter_route_inspections(parent.routes)
    }
    for inspection in _iter_route_inspections(child.routes):
        key = (inspection.path, frozenset(inspection.route.methods or ()))
        if key in seen:
            continue
        seen.add(key)
        # The inspection has already resolved nested router prefixes. Append
        # the concrete route so FastAPI cannot retain a stale wrapper cache.
        parent.routes.append(inspection.route)


router.include_router(health_router)
router.include_router(audit_router)
router.include_router(stats_router)
router.include_router(library_router)
router.include_router(resources_router)
router.include_router(search_router)
router.include_router(staff_router)
router.include_router(electronic_router)
router.include_router(engagement_router)
_include_unique_routes(router, guides_router)
router.include_router(assistant_chat_router)
router.include_router(assistant_contexts_router)
router.include_router(assistant_recovery_router)
router.include_router(assistant_staff_router)
router.include_router(assistant_verification_router)
