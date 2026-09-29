"""Complete matching exports, scoped by the same predicate as workspace lists."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from ksu_common.response_validation import allow_response_model_exemption
from ksu_contracts.rbac import authorize_permission
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import lazyload

from ...core.auth import get_current_user
from ...core.database import get_db
from ...services.admin_workspace import field_specs, resource_spec, serialize_record
from ...services.admin_workspace_export import ExportBuffer, ExportTooLarge
from .admin_workspace import WorkflowState, matching_query, private_response

router = APIRouter(prefix="/research-portal/export", tags=["Research workspace exports"])


@router.get("/{resource}", response_class=StreamingResponse, responses={200: {"content": {
    "text/csv": {"schema": {"type": "string", "format": "binary"}},
    "application/json": {"schema": {"type": "array", "items": {"type": "object"}}},
}}})
@allow_response_model_exemption("stream", path="/api/v1/research-portal/export/{resource}")
async def export_records(
    resource: str, format: Literal["csv", "json"] = "csv",
    search: str | None = Query(None, max_length=255), state: WorkflowState | None = None,
    status: str | None = Query(None, max_length=32), center_id: uuid.UUID | None = None,
    filter_field: str | None = Query(None, max_length=64), filter_value: str | None = Query(None, max_length=255),
    sort: Literal["updated_at", "created_at", "title", "name", "deadline", "display_order"] = "updated_at",
    order: Literal["asc", "desc"] = "desc", db: AsyncSession = Depends(get_db), user=Depends(get_current_user),
) -> Response:
    if not authorize_permission(user, "research.manage_reports").allowed:
        raise HTTPException(403, "Research report export authority is required")
    query, _ = matching_query(user, resource, search=search, state=state, status=status,
                              center_id=center_id, filter_field=filter_field,
                              filter_value=filter_value, sort=sort, order=order)
    keys = list(dict.fromkeys(["id", *[field["key"] for field in field_specs(resource_spec(resource))],
                               "status", "created_at", "updated_at"]))
    output = ExportBuffer(keys, format)
    # One statement's snapshot: no page-by-page skipped/duplicated records.
    stream = await db.stream_scalars(query.options(lazyload("*")).execution_options(yield_per=100))
    try:
        async for record in stream:
            output.add(serialize_record(user, resource, record)["record"])
        content = output.finish()
    except ExportTooLarge as exc:
        raise HTTPException(413, str(exc)) from exc
    finally:
        await stream.close()
        output.output.close()
    response = StreamingResponse(iter([content]), media_type="text/csv" if format == "csv" else "application/json")
    private_response(response)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    response.headers["Content-Disposition"] = f'attachment; filename="{resource}-{stamp}.{format}"'
    response.headers["X-Export-Rows"] = str(output.count)
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response
