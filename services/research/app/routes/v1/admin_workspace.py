"""Private, uncached Research workspace reads. Existing routes own mutations."""
from __future__ import annotations

import uuid
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from ksu_common.schemas.responses import success
from pydantic import TypeAdapter, ValidationError
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import lazyload

from ...core.auth import get_current_user
from ...core.database import get_db
from ...schemas.base import JsonObject, SuccessEnvelope, SuccessEnvelopeWithMeta
from ...services.admin_workspace import (
    catalog_for,
    filter_fields_for,
    read_filters,
    resource_spec,
    serialize_record,
)
from ...services.admin_workspace_query import editorial_state_expression
from ...services.admin_workspace_registry import (
    EDITORIAL_RESOURCES,
    workspace_navigation,
)
from ...services.research_portal_context import build_research_portal_context
from ...services.research_workflow import adapter_for

router = APIRouter(prefix="/research-portal/workspace", tags=["Research workspace"])

_DB_DEPENDENCY = _DB_DEPENDENCY
_USER_DEPENDENCY = _USER_DEPENDENCY
WorkflowState = Literal["draft", "pending", "published", "rejected"]


def private_response(response: Response) -> None:
    response.headers["Cache-Control"] = "private, no-store"
    response.headers["Vary"] = "Cookie, Authorization"


@router.get("/context", response_model=SuccessEnvelope[JsonObject])
async def workspace_context(response: Response, actor=_USER_DEPENDENCY):
    private_response(response)
    context = build_research_portal_context(actor)
    modules = catalog_for(actor)
    # Training/giving permissions omitted by the old portal navigation are
    # resolved using the registered route's own signed permission, not aliases.
    return success(data={"subject": str(actor.sub), "capabilities": context.capabilities,
                         "allowed_navigation": workspace_navigation([item["key"] for item in modules], context.allowed_navigation),
                         "domains": context.domains, "is_global": context.is_global,
                         "can_review": context.can_review, "can_publish": context.can_publish})


@router.get("/catalog", response_model=SuccessEnvelope[list[JsonObject]])
async def catalog(response: Response, actor=_USER_DEPENDENCY):
    private_response(response)
    return success(data=catalog_for(actor))



def matching_query(actor, resource: str, *, search=None, state=None, status=None,
                   center_id=None, filter_field=None, filter_value=None,
                   sort="updated_at", order="desc"):
    """One authorized predicate for both interactive lists and matching exports."""
    spec = resource_spec(resource)
    service, model = spec.service, spec.service.model
    filters = read_filters(actor, resource)
    if status is not None:
        if not hasattr(model, "status"):
            raise HTTPException(422, "This resource has no status field")
        filters["status"] = status
    if center_id is not None:
        if not hasattr(model, "center_id"):
            raise HTTPException(422, "This resource has no center ownership filter")
        filters["center_id"] = center_id
    if (filter_field is None) != (filter_value is None):
        raise HTTPException(422, "A filter requires both a field and a value")
    if filter_field is not None:
        # Only native scalar columns may be narrowed. Never replace the signed
        # ownership alternatives, and never pass a relationship to SQL ordering.
        allowed = filter_fields_for(spec)
        if filter_field not in allowed:
            raise HTTPException(422, "Unsupported filter field")
        field = spec.create_schema.model_fields.get(filter_field) or spec.update_schema.model_fields[filter_field]
        annotation = Annotated[field.annotation, *field.metadata] if field.metadata else field.annotation
        try:
            filters[filter_field] = TypeAdapter(annotation).validate_python(filter_value)
        except ValidationError as exc:
            raise HTTPException(422, "Invalid value for the selected filter") from exc
    if state is not None and resource not in EDITORIAL_RESOURCES:
        raise HTTPException(422, "Editorial filtering is unavailable for this resource")
    # The workspace serializes columns only. Suppress native eager collections
    # here so both list and export predicates avoid unrelated relationship IO.
    query = service._apply_filters(model.active_query().options(lazyload("*")), filters)
    if state is not None:
        query = query.where(editorial_state_expression(model, adapter_for(resource)) == state)
    query = service._apply_search(query, search)
    columns = {column.key for column in model.__table__.columns}
    if sort not in columns:
        raise HTTPException(422, "This resource does not support the requested sort")
    column = getattr(model, sort)
    query = query.order_by(None).order_by(column.asc() if order == "asc" else column.desc(), model.id.desc())
    return query, model

@router.get("/{resource}", response_model=SuccessEnvelopeWithMeta[list[JsonObject]])
async def list_records(
    resource: str, response: Response,
    page: int = Query(1, ge=1, le=100000),
    per_page: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, max_length=255),
    state: WorkflowState | None = None,
    status: str | None = Query(None, max_length=32),
    center_id: uuid.UUID | None = None,
    filter_field: str | None = Query(None, max_length=64),
    filter_value: str | None = Query(None, max_length=255),
    sort: Literal["updated_at", "created_at", "title", "name", "deadline", "display_order"] = "updated_at",
    order: Literal["asc", "desc"] = "desc",
    db: AsyncSession = _DB_DEPENDENCY, actor=_USER_DEPENDENCY,
):
    private_response(response)
    query, model = matching_query(actor, resource, search=search, state=state, status=status,
                                  center_id=center_id, filter_field=filter_field,
                                  filter_value=filter_value, sort=sort, order=order)
    total = int(await db.scalar(select(func.count()).select_from(query.order_by(None).subquery())) or 0)
    items = (await db.scalars(query.offset((page - 1) * per_page).limit(per_page))).all()
    return success(data=[serialize_record(actor, resource, item) for item in items], meta={
        "page": page, "per_page": per_page, "total": total,
        "total_pages": (total + per_page - 1) // per_page,
    })


@router.get("/{resource}/{item_id}", response_model=SuccessEnvelope[JsonObject])
async def get_record(resource: str, item_id: uuid.UUID, response: Response,
                     db: AsyncSession = _DB_DEPENDENCY, actor=_USER_DEPENDENCY):
    private_response(response)
    spec = resource_spec(resource)
    query = spec.service._apply_filters(spec.service.model.active_query().options(lazyload("*")), read_filters(actor, resource))
    item = await db.scalar(query.where(spec.service.model.id == item_id))
    if item is None:
        raise HTTPException(404, "Record not found in your assigned workspace")
    return success(data=serialize_record(actor, resource, item))
