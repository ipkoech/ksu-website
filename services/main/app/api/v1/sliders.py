"""Slider endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, require_scope
from ...models import Slider, SliderGroup
from ...schemas import SliderCreate, SliderGroupCreate, SliderGroupUpdate, SliderUpdate
from ...services import SliderGroupService, SliderService
from ._fields import FieldSelection, FieldsDep, build_selector

router = APIRouter()


@router.get("/groups")
@cached_public(timeout=300, vary_on=("scope_type", "scope_id", "is_main", "fields", "include"))
async def list_slider_groups(
    db: DbSession,
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    is_main: bool | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(SliderGroup, fields)
    items = await SliderGroupService.list(db, scope_type=scope_type, scope_id=scope_id, is_main=is_main)
    return success(data=selector.apply(items))


@router.get("/groups/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_slider_group(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(SliderGroup, fields)
    item = await SliderGroupService.get_by_slug(db, slug, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Slider group not found")
    return success(data=selector.apply(item))


@router.get("/groups/id/{group_id}")
async def get_slider_group_by_id(group_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(SliderGroup, fields)
    item = await SliderGroupService.get_by_id(db, group_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Slider group not found")
    return success(data=selector.apply(item))


@router.get("")
@cached_public(timeout=300, vary_on=("slider_group_id", "scope_type", "scope_id", "is_main", "fields", "include"))
async def list_sliders(
    db: DbSession,
    slider_group_id: uuid.UUID | None = None,
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    is_main: bool | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Slider, fields)
    items = await SliderService.list(
        db,
        slider_group_id=slider_group_id,
        scope_type=scope_type,
        scope_id=scope_id,
        is_main=is_main,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(items))


@router.get("/admin", dependencies=[Depends(require_scope("admin:*"))])
async def list_admin_sliders(
    db: DbSession,
    _: CurrentUser,
    slider_group_id: uuid.UUID | None = None,
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    is_main: bool | None = None,
    status: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Slider, fields)
    items = await SliderService.list_admin(
        db,
        slider_group_id=slider_group_id,
        scope_type=scope_type,
        scope_id=scope_id,
        is_main=is_main,
        status=status,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(items))


@router.post("/groups", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("admin:*"))])
async def create_slider_group(data: SliderGroupCreate, db: DbSession, _: CurrentUser):
    item = await SliderGroupService.create(db, **data.model_dump())
    return success(data=item, message="Slider group created")


@router.patch("/groups/{group_id}", dependencies=[Depends(require_scope("admin:*"))])
async def update_slider_group(group_id: uuid.UUID, data: SliderGroupUpdate, db: DbSession, _: CurrentUser):
    item = await SliderGroupService.get_by_id(db, group_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Slider group not found")
    item = await SliderGroupService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Slider group updated")


@router.delete("/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("admin:*"))])
async def delete_slider_group(group_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await SliderGroupService.get_by_id(db, group_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Slider group not found")
    await SliderGroupService.delete(db, item)


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("admin:*"))])
async def create_slider(data: SliderCreate, db: DbSession, _: CurrentUser):
    item = await SliderService.create(db, **data.model_dump())
    return success(data=item, message="Slider created")


@router.get("/{slider_id}")
async def get_slider(slider_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(Slider, fields)
    item = await SliderService.get_by_id(db, slider_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Slider not found")
    return success(data=selector.apply(item))


@router.patch("/{slider_id}", dependencies=[Depends(require_scope("admin:*"))])
async def update_slider(slider_id: uuid.UUID, data: SliderUpdate, db: DbSession, _: CurrentUser):
    item = await SliderService.get_by_id(db, slider_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Slider not found")
    item = await SliderService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Slider updated")


@router.delete("/{slider_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("admin:*"))])
async def delete_slider(slider_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await SliderService.get_by_id(db, slider_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Slider not found")
    await SliderService.delete(db, item)
