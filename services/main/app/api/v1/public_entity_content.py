"""Public entity content endpoint."""

from __future__ import annotations

import uuid
from typing import Literal

from fastapi import APIRouter, HTTPException, Query, Request

from ksu_common import apply_field_selection, cached_public
from ksu_common.schemas.responses import success

from ...deps import DbSession
from ...services import PublicEntityContentService
from ._fields import FieldSelection, FieldsDep

router = APIRouter()


@router.get("/{entity_type}/{entity_id}")
@cached_public(
    timeout=300,
    vary_on=("entity_type", "entity_id", "content_type", "page", "per_page", "search", "fields", "include"),
)
async def get_public_entity_content(
    request: Request,
    entity_type: Literal["school", "department"],
    entity_id: uuid.UUID,
    db: DbSession,
    content_type: Literal["all", "news", "events", "gallery", "downloads"] = "all",
    page: int = Query(1, ge=1),
    per_page: int = Query(18, ge=1, le=100),
    search: str | None = Query(default=None, max_length=200),
    fields: FieldSelection = FieldsDep,
):
    scope = await PublicEntityContentService.resolve_scope(db, entity_type, entity_id)
    if scope is None:
        raise HTTPException(status_code=404, detail=f"{entity_type.title()} not found")

    records, meta = await PublicEntityContentService.list(
        db,
        scope,
        content_type=content_type,
        page=page,
        per_page=per_page,
        search=search,
    )
    payload = {
        "entity": {
            "id": str(scope.entity.id),
            "type": scope.entity_type,
            "name": scope.entity.name,
            "slug": scope.entity.slug,
        },
        "content_type": content_type,
        "records": records,
        "meta": meta,
    }
    return success(data=apply_field_selection(payload, fields, always_include={"id"}), meta=meta)


__all__ = ["router"]
