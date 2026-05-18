"""Admin audit endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query

from ksu_common.schemas.responses import success
from ksu_common.models import AuditLog

from ....deps import CurrentUser, DbSession, require_scope
from ....services import AuditService
from .._fields import FieldSelection, FieldsDep, build_selector

router = APIRouter()


@router.get("", dependencies=[Depends(require_scope("audit:read"))])
async def list_audit_logs(
    db: DbSession,
    _: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    service_name: str | None = None,
    user_id: uuid.UUID | None = None,
    resource_type: str | None = None,
    status: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(AuditLog, fields)
    result = await AuditService.list(
        db,
        page=page,
        per_page=per_page,
        service_name=service_name,
        user_id=user_id,
        resource_type=resource_type,
        status=status,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{audit_id}", dependencies=[Depends(require_scope("audit:read"))])
async def get_audit_log(audit_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(AuditLog, fields)
    item = await AuditService.get_by_id(db, audit_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Audit log not found")
    return success(data=selector.apply(item))
