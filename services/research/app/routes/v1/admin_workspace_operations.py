"""Private association and attribution adapters over existing Research models."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from ksu_common.schemas.responses import success
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.auth import get_current_user
from ...core.database import get_db
from ...schemas.base import JsonObject, SuccessEnvelope, SuccessEnvelopeWithMeta
from ...services.admin_workspace import (
    read_filters,
    record_actions,
    resource_spec,
    serialize_record,
)
from ...services.admin_workspace_operations import (
    ASSOCIATIONS,
    CHILDREN,
    association,
    association_fields,
    child_collection,
    child_row,
    collection_module,
    linked_query,
    load_record,
    mutate_association,
    native_schema,
    native_service,
    relationship_attribute,
    validate_child_change,
    validate_values,
)
from ...services.admin_workspace_revision import require_workspace_revision
from .admin_workspace import private_response

router = APIRouter(prefix="/research-portal/operations", tags=["Research workspace operations"])

_DB_DEPENDENCY = _DB_DEPENDENCY
_USER_DEPENDENCY = _USER_DEPENDENCY


class ValuesBody(BaseModel):
    model_config = ConfigDict(extra="forbid")
    values: JsonObject = Field(default_factory=dict)


@router.get("/{resource}/{item_id}", response_model=SuccessEnvelope[JsonObject])
async def operations_catalog(resource: str, item_id: uuid.UUID, response: Response,
                             db: AsyncSession = _DB_DEPENDENCY, user=_USER_DEPENDENCY):
    private_response(response)
    parent = await load_record(db, user, resource, item_id)
    editable = record_actions(user, resource, parent)["edit"]
    links = []
    for item in ASSOCIATIONS:
        if item.source != resource:
            continue
        try:
            read_filters(user, item.target)
        except HTTPException as exc:
            if exc.status_code == 403:
                continue
            raise
        relationship_attribute(item)
        links.append({"target": item.target, "label": resource_spec(item.target).label,
                      "can_link": editable, "assignment": bool(item.assignment),
                      "fields": association_fields(item)})
    children = [{"key": item.key, "module": collection_module(item, editable=editable)}
                for item in CHILDREN if item.parent == resource]
    return success(data={"relationships": links, "children": children})


@router.get("/{resource}/{item_id}/relationships/{target}", response_model=SuccessEnvelopeWithMeta[list[JsonObject]])
async def list_links(resource: str, item_id: uuid.UUID, target: str, response: Response,
                     page: int = Query(1, ge=1, le=100000), per_page: int = Query(20, ge=1, le=100),
                     db: AsyncSession = _DB_DEPENDENCY, user=_USER_DEPENDENCY):
    private_response(response)
    item = association(resource, target)
    await load_record(db, user, resource, item_id)
    query = await linked_query(user, item, item_id)
    total = int(await db.scalar(select(func.count()).select_from(query.order_by(None).subquery())) or 0)
    model = resource_spec(target).service.model
    records = (await db.scalars(query.order_by(model.id).offset((page - 1) * per_page).limit(per_page))).all()
    return success(data=[serialize_record(user, target, record) for record in records],
                   meta={"page": page, "per_page": per_page, "total": total,
                         "total_pages": (total + per_page - 1) // per_page})


@router.put("/{resource}/{item_id}/relationships/{target}/{target_id}", response_model=SuccessEnvelope[JsonObject])
async def link_record(resource: str, item_id: uuid.UUID, target: str, target_id: uuid.UUID,
                      data: ValuesBody, db: AsyncSession = _DB_DEPENDENCY, user=_USER_DEPENDENCY):
    return success(data=await mutate_association(db, user, association(resource, target), item_id,
                                                 target_id, link=True, values=data.values))


@router.delete("/{resource}/{item_id}/relationships/{target}/{target_id}", response_model=SuccessEnvelope[JsonObject])
async def unlink_record(resource: str, item_id: uuid.UUID, target: str, target_id: uuid.UUID,
                        db: AsyncSession = _DB_DEPENDENCY, user=_USER_DEPENDENCY):
    return success(data=await mutate_association(db, user, association(resource, target), item_id,
                                                 target_id, link=False, values={}))


@router.get("/{resource}/{item_id}/children/{collection}", response_model=SuccessEnvelopeWithMeta[list[JsonObject]])
async def list_children(resource: str, item_id: uuid.UUID, collection: str, response: Response,
                        page: int = Query(1, ge=1, le=100000), per_page: int = Query(20, ge=1, le=100),
                        db: AsyncSession = _DB_DEPENDENCY, user=_USER_DEPENDENCY):
    private_response(response)
    item = child_collection(resource, collection)
    parent = await load_record(db, user, resource, item_id)
    editable = record_actions(user, resource, parent)["edit"]
    model = native_service(item.service).model
    query = model.active_query().where(getattr(model, item.parent_field) == item_id)
    total = int(await db.scalar(select(func.count()).select_from(query.order_by(None).subquery())) or 0)
    order = getattr(model, "author_order", None)
    order = getattr(model, "display_order", model.id) if order is None else order
    records = (await db.scalars(query.order_by(order, model.id).offset((page - 1) * per_page).limit(per_page))).all()
    return success(data=[child_row(item, record, editable=editable) for record in records],
                   meta={"page": page, "per_page": per_page, "total": total,
                         "total_pages": (total + per_page - 1) // per_page})


@router.post("/{resource}/{item_id}/children/{collection}", status_code=201, response_model=SuccessEnvelope[JsonObject])
async def create_child(resource: str, item_id: uuid.UUID, collection: str, data: ValuesBody,
                       db: AsyncSession = _DB_DEPENDENCY, user=_USER_DEPENDENCY):
    item = child_collection(resource, collection)
    parent = await load_record(db, user, resource, item_id, write=True, lock=True)
    service = native_service(item.service)
    parsed = validate_values(native_schema(item.create_schema), data.values,
                             forced={item.parent_field: item_id}, model=service.model)
    await validate_child_change(db, item, parent, parsed.model_dump(exclude_unset=True))
    record = await service.create(db, parsed, actor_id=user.sub)
    return success(data={"id": str(record.id)}, message="Child record created")


async def owned_child(db, item, parent_id, child_id):
    model = native_service(item.service).model
    record = await db.scalar(model.active_query().where(model.id == child_id,
        getattr(model, item.parent_field) == parent_id).with_for_update().execution_options(populate_existing=True))
    if record is None:
        raise HTTPException(404, "Child record not found under this parent")
    return record


@router.patch("/{resource}/{item_id}/children/{collection}/{child_id}", response_model=SuccessEnvelope[JsonObject])
async def update_child(resource: str, item_id: uuid.UUID, collection: str, child_id: uuid.UUID, request: Request,
                       data: ValuesBody, db: AsyncSession = _DB_DEPENDENCY, user=_USER_DEPENDENCY):
    item = child_collection(resource, collection)
    parent = await load_record(db, user, resource, item_id, write=True, lock=True)
    record = await owned_child(db, item, item_id, child_id)
    require_workspace_revision(record, request)
    service = native_service(item.service)
    if item.parent_field in data.values:
        raise HTTPException(422, "The parent relationship is server-owned")
    parsed = validate_values(native_schema(item.update_schema), data.values, model=service.model)
    await validate_child_change(db, item, parent, parsed.model_dump(exclude_unset=True), record=record)
    updated = await service.update(db, record, parsed, actor_id=user.sub)
    return success(data={"id": str(updated.id)}, message="Child record updated")


@router.delete("/{resource}/{item_id}/children/{collection}/{child_id}", response_model=SuccessEnvelope[JsonObject])
async def delete_child(resource: str, item_id: uuid.UUID, collection: str, child_id: uuid.UUID, request: Request,
                       db: AsyncSession = _DB_DEPENDENCY, user=_USER_DEPENDENCY):
    item = child_collection(resource, collection)
    parent = await load_record(db, user, resource, item_id, write=True, lock=True)
    record = await owned_child(db, item, item_id, child_id)
    require_workspace_revision(record, request)
    await validate_child_change(db, item, parent, {}, record=record, deleting=True)
    await native_service(item.service).soft_delete(db, record, actor_id=user.sub)
    return success(data={"id": str(child_id), "deleted": True}, message="Child record removed")
