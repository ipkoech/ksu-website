"""School Portal API facade."""

from fastapi import APIRouter

from .context import router as context_router

router = APIRouter()
router.include_router(context_router)

__all__ = ["router"]
