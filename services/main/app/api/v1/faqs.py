"""FAQ endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ._scoped import can_access_scoped_record, require_scoped_record
from ...deps import CurrentUser, DbSession
from ...models import FAQ
from ...schemas import FAQCreate, FAQUpdate
from ...services import FAQService

router = APIRouter()

FAQ_VIEW_PERMISSIONS = ["office.view", "support.view", "content.view"]
FAQ_MANAGE_PERMISSIONS = [
    "office.manage_content",
    "support.manage_faqs",
    "content.manage_pages",
]


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "scope_type", "scope_id", "is_main", "fields", "include"))
async def list_faqs(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    is_main: bool | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(FAQ, fields)
    result = await FAQService.list(db, page=page, per_page=per_page, scope_type=scope_type, scope_id=scope_id, is_main=is_main, load_options=selector.load_options)
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/admin")
async def list_admin_faqs(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    is_main: bool | None = None,
    search: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(FAQ, fields)
    result = await FAQService.list(
        db,
        page=page,
        per_page=per_page,
        scope_type=scope_type,
        scope_id=scope_id,
        is_main=is_main,
        is_public=None,
        status=None,
        search=search,
        load_options=selector.load_options,
    )
    items = []
    for item in result.items:
        if await can_access_scoped_record(
            db,
            user,
            FAQ_VIEW_PERMISSIONS,
            item.scope_type,
            item.scope_id,
        ):
            items.append(item)
    meta = dict(result.meta)
    meta["total"] = len(items)
    return success(data=selector.apply(items), meta=meta)


@router.get("/admin/{faq_id}")
async def get_admin_faq(
    faq_id: uuid.UUID,
    db: DbSession,
    user: CurrentUser,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(FAQ, fields)
    item = await FAQService.get_by_id(db, faq_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="FAQ not found")
    await require_scoped_record(
        db,
        user,
        FAQ_VIEW_PERMISSIONS,
        item.scope_type,
        item.scope_id,
        resource_name="FAQ",
    )
    return success(data=selector.apply(item))


@router.get("/{faq_id}")
@cached_public(timeout=300, vary_on=("faq_id", "fields", "include"))
async def get_faq(faq_id: uuid.UUID, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(FAQ, fields)
    item = await FAQService.get_by_id(db, faq_id, load_options=selector.load_options)
    if item is None or not item.is_public or item.status != "published":
        raise HTTPException(status_code=404, detail="FAQ not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_faq(data: FAQCreate, db: DbSession, user: CurrentUser):
    await require_scoped_record(
        db,
        user,
        FAQ_MANAGE_PERMISSIONS,
        data.scope_type,
        data.scope_id,
        resource_name="FAQ",
    )
    item = await FAQService.create(db, **data.model_dump())
    return success(data=item, message="FAQ created")


@router.patch("/{faq_id}")
async def update_faq(faq_id: uuid.UUID, data: FAQUpdate, db: DbSession, user: CurrentUser):
    item = await FAQService.get_by_id(db, faq_id)
    if item is None:
        raise HTTPException(status_code=404, detail="FAQ not found")
    await require_scoped_record(
        db,
        user,
        FAQ_MANAGE_PERMISSIONS,
        item.scope_type,
        item.scope_id,
        resource_name="FAQ",
    )
    payload = data.model_dump(exclude_unset=True)
    await require_scoped_record(
        db,
        user,
        FAQ_MANAGE_PERMISSIONS,
        payload.get("scope_type", item.scope_type),
        payload.get("scope_id", item.scope_id),
        resource_name="FAQ",
    )
    item = await FAQService.update(db, item, **payload)
    return success(data=item, message="FAQ updated")


@router.delete("/{faq_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_faq(faq_id: uuid.UUID, db: DbSession, user: CurrentUser):
    item = await FAQService.get_by_id(db, faq_id)
    if item is None:
        raise HTTPException(status_code=404, detail="FAQ not found")
    await require_scoped_record(
        db,
        user,
        FAQ_MANAGE_PERMISSIONS,
        item.scope_type,
        item.scope_id,
        resource_name="FAQ",
    )
    await FAQService.delete(db, item)
