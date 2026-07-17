"""School Portal API facade."""

from fastapi import APIRouter

from .context import router as context_router
from .profile import router as profile_router

router = APIRouter()
router.include_router(context_router)
router.include_router(profile_router)

__all__ = ["router"]
