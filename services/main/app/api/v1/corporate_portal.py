"""Corporate Communication portal bootstrap endpoint."""

from __future__ import annotations

from fastapi import APIRouter

from ksu_common.schemas.responses import success

from ...deps import CurrentUser
from ...schemas.corporate_portal import CorporatePortalContextResponse
from ...services.corporate_portal_context import (
    allowed_corporate_navigation,
    corporate_portal_capabilities,
)
from .corporate_portal_media import router as corporate_portal_media_router

router = APIRouter()
router.include_router(corporate_portal_media_router)


def context_response(user) -> CorporatePortalContextResponse:
    capabilities = corporate_portal_capabilities(user)
    return CorporatePortalContextResponse(
        capabilities=capabilities,
        allowed_navigation=allowed_corporate_navigation(capabilities),
    )


@router.get("/context")
async def get_context(user: CurrentUser):
    """Return server-derived capabilities and navigation for the portal."""
    return success(data=context_response(user).model_dump(mode="json"))


__all__ = ["context_response", "get_context", "router"]
