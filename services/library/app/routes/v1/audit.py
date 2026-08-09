"""Internal audit endpoints for the library service."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query

from ksu_common.internal_client import get_integration_pool, internal_key_guard

from ...core.config import get_settings

router = APIRouter(prefix="/audit", tags=["Audit"])
settings = get_settings()


require_internal_api_key = internal_key_guard(
    lambda: get_settings().INTERNAL_API_KEY,
    allow_legacy_header=False,
)


@router.get("", dependencies=[Depends(require_internal_api_key)])
async def list_audit_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user_id: uuid.UUID | None = None,
    resource_type: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
):
    response = await get_integration_pool().request_internal(
        "main-audit", settings.MAIN_SERVICE_URL, "GET", "/api/v1/internal/audit",
        api_key=settings.MAIN_SERVICE_API_KEY,
        params={key: value for key, value in {
            "service_name": settings.SERVICE_NAME, "page": page, "per_page": per_page,
            "user_id": user_id, "resource_type": resource_type, "status": status_filter,
        }.items() if value is not None},
    )
    response.raise_for_status()
    return response.json()
