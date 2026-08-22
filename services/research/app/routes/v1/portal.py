"""Research Portal bootstrap endpoints.

The admin app calls ``/research-portal/context`` once on entry and renders the
whole portal from the response: which sidebar sections exist, which buttons are
enabled, and which domain workspace the caller belongs to. Deciding this on the
server keeps navigation and authority in one place instead of duplicating the
rules in the browser.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from ksu_common.schemas.responses import success

from ...core.auth import get_current_user, require_scope
from ...schemas.base import JsonObject, SuccessEnvelope
from ...services.research_domains import DOMAIN_DEFINITIONS
from ...services.research_portal_context import build_research_portal_context

router = APIRouter(prefix="/research-portal", tags=["Research Portal"])


def _serialize(context) -> dict:
    return {
        "capabilities": context.capabilities,
        "allowed_navigation": context.allowed_navigation,
        "domains": context.domains,
        "is_global": context.is_global,
        "can_review": context.can_review,
        "can_publish": context.can_publish,
        # The filters the server will apply to this caller's list queries.
        # Exposed so the portal can label a scoped workspace honestly rather
        # than implying the manager sees everything.
        "domain_filters": {
            definition.key: {
                resource: dict(filters)
                for resource, filters in definition.resource_filters.items()
            }
            for definition in DOMAIN_DEFINITIONS.values()
            if definition.key in context.domains
        },
    }


@router.get(
    "/context",
    response_model=SuccessEnvelope[JsonObject],
    dependencies=[Depends(require_scope("research.view"))],
)
async def get_research_portal_context(user=Depends(get_current_user)):
    """Return the caller's capabilities, navigation, and domain workspace."""
    context = build_research_portal_context(user)
    return success(data=_serialize(context))


@router.get(
    "/capabilities",
    response_model=SuccessEnvelope[JsonObject],
    dependencies=[Depends(require_scope("research.view"))],
)
async def get_research_portal_capabilities(user=Depends(get_current_user)):
    """Return just the capability map, for cheap re-checks after a role change."""
    context = build_research_portal_context(user)
    return success(
        data={
            "capabilities": context.capabilities,
            "allowed_navigation": context.allowed_navigation,
        }
    )


__all__ = ["get_research_portal_capabilities", "get_research_portal_context", "router"]
