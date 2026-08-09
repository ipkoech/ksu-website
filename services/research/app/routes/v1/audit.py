"""Internal audit endpoints for the research service."""

import uuid

from fastapi import APIRouter, Depends, Query
from ksu_common.internal_client import internal_key_guard

from ...core.config import get_settings
from ...schemas.base import JsonObject, SuccessEnvelopeWithMeta
from ...services.audit_snapshots import list_audit_snapshots

router = APIRouter(prefix="/audit", tags=["Audit"])


require_internal_api_key = internal_key_guard(
    lambda: get_settings().INTERNAL_API_KEY,
    allow_legacy_header=False,
)
settings = get_settings()


@router.get("", dependencies=[Depends(require_internal_api_key)], response_model=SuccessEnvelopeWithMeta[list[JsonObject]])
async def list_audit_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user_id: uuid.UUID | None = None,
    resource_type: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
):
    return await list_audit_snapshots(page=page, per_page=per_page, user_id=user_id, resource_type=resource_type, status=status_filter)
