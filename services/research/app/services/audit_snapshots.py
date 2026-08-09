"""Authenticated access to Main-owned audit records."""

from __future__ import annotations

from typing import Any

from ksu_common.internal_client import get_integration_pool

from ..core.config import get_settings


async def list_audit_snapshots(**filters: Any) -> dict[str, Any]:
    settings = get_settings()
    params = {"service_name": settings.SERVICE_NAME, **{key: value for key, value in filters.items() if value is not None}}
    response = await get_integration_pool().request_internal(
        "main-audit",
        settings.MAIN_SERVICE_URL,
        "GET",
        "/api/v1/internal/audit",
        api_key=settings.MAIN_SERVICE_API_KEY,
        timeout=settings.REFERENCE_VALIDATION_TIMEOUT_SECONDS,
        params=params,
    )
    response.raise_for_status()
    payload = response.json()
    return payload if isinstance(payload, dict) else {"status": "success", "data": [], "meta": {}}
