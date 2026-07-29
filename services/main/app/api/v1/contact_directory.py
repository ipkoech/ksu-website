"""Public contact-directory aggregate endpoint."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Query

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ...deps import DbSession
from ...services import PublicContactDirectoryService

router = APIRouter()


@router.get("")
@cached_public(
    timeout=300,
    vary_on=("q", "contact_type", "scope_type", "scope_id", "page", "per_page"),
)
async def get_public_contact_directory(
    db: DbSession,
    q: str | None = Query(default=None, max_length=120),
    contact_type: str | None = Query(default=None, max_length=64),
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    data = await PublicContactDirectoryService.compose(
        db,
        search=q,
        contact_type=contact_type,
        scope_type=scope_type,
        scope_id=scope_id,
        page=page,
        per_page=per_page,
    )
    return success(data=data)
