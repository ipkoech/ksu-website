"""Internal audit endpoints for the library service."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query

from ksu_common import paginate
from ksu_common.internal_client import internal_key_guard
from ksu_common.models import AuditLog
from ksu_common.schemas.responses import success
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.config import get_settings
from ...core.database import get_db

router = APIRouter(prefix="/audit", tags=["Audit"])
settings = get_settings()


require_internal_api_key = internal_key_guard(
    lambda: get_settings().INTERNAL_API_KEY,
    allow_legacy_header=False,
)


@router.get("", dependencies=[Depends(require_internal_api_key)])
async def list_audit_logs(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user_id: uuid.UUID | None = None,
    resource_type: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
):
    query = AuditLog.active_query().where(AuditLog.service_name == settings.SERVICE_NAME).order_by(AuditLog.happened_at.desc())
    if user_id is not None:
        query = query.where(AuditLog.user_id == user_id)
    if resource_type is not None:
        query = query.where(AuditLog.resource_type == resource_type)
    if status_filter is not None:
        query = query.where(AuditLog.status == status_filter)
    result = await paginate(db, query, page=page, per_page=per_page)
    return success(data=result.items, meta=result.meta)
