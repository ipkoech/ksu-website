"""School Portal API facade."""

from fastapi import APIRouter

from .context import router as context_router
from .content import router as content_router
from .departments import router as departments_router
from .profile import router as profile_router
from .media import router as media_router
from .inquiries import router as inquiries_router
from .publications import router as publications_router
from .programmes import router as programmes_router
from .team import router as team_router

router = APIRouter()
router.include_router(content_router)
router.include_router(context_router)
router.include_router(departments_router)
router.include_router(profile_router)
router.include_router(media_router)
router.include_router(inquiries_router)
router.include_router(publications_router)
router.include_router(programmes_router)
router.include_router(team_router)

__all__ = ["router"]
