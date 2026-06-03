"""Public partner endpoints backed by the Research service."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, Request
from httpx import HTTPError

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ...services.research_partners import ResearchPartnersProxyService

router = APIRouter()


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "search", "status", "is_active", "is_featured"))
async def list_partners(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str | None = None,
    status: str | None = "active",
    is_active: bool | None = True,
    is_featured: bool | None = None,
):
    if request.headers.get("x-ksu-proxy") == "main-partners":
        raise HTTPException(status_code=503, detail="Research partner proxy loop detected")

    try:
        payload = await ResearchPartnersProxyService.list_partners(
            page=page,
            per_page=per_page,
            search=search,
            status=status,
            is_active=is_active,
            is_featured=is_featured,
        )
    except HTTPError as exc:
        raise HTTPException(status_code=502, detail="Research partner service is unavailable") from exc

    return success(data=payload.get("data"), meta=payload.get("meta"))


@router.get("/{slug}")
@cached_public(timeout=300)
async def get_partner(slug: str, request: Request):
    if request.headers.get("x-ksu-proxy") == "main-partners":
        raise HTTPException(status_code=503, detail="Research partner proxy loop detected")

    try:
        payload = await ResearchPartnersProxyService.get_partner(slug)
    except HTTPError as exc:
        status_code = 404 if getattr(exc.response, "status_code", None) == 404 else 502
        detail = "Partner not found" if status_code == 404 else "Research partner service is unavailable"
        raise HTTPException(status_code=status_code, detail=detail) from exc

    return success(data=payload.get("data"))
