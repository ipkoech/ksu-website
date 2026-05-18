"""Main site v1 API router."""

from fastapi import APIRouter
from .health import router as health_router
from .internal import router as internal_router

router = APIRouter()
router.include_router(health_router)
router.include_router(internal_router, prefix="/internal")

# Domain routers added in Phase 3 (grouped by migration wave):
# Wave 1 — Auth + Person
# from .auth import router as auth_router
# from .person import router as person_router
# Wave 2 — Academic
# from .academic import router as academic_router
# from .programme import router as programme_router
# ...
