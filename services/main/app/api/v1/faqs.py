"""FAQ endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import FAQ
from ...schemas import FAQCreate, FAQUpdate
from ...services import FAQService

router = APIRouter()


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


@router.get("/{faq_id}")
@cached_public(timeout=300)
async def get_faq(faq_id: uuid.UUID, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(FAQ, fields)
    item = await FAQService.get_by_id(db, faq_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("admin:*"))])
async def create_faq(data: FAQCreate, db: DbSession, _: CurrentUser):
    item = await FAQService.create(db, **data.model_dump())
    return success(data=item, message="FAQ created")


@router.patch("/{faq_id}", dependencies=[Depends(require_scope("admin:*"))])
async def update_faq(faq_id: uuid.UUID, data: FAQUpdate, db: DbSession, _: CurrentUser):
    item = await FAQService.get_by_id(db, faq_id)
    if item is None:
        raise HTTPException(status_code=404, detail="FAQ not found")
    item = await FAQService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="FAQ updated")


@router.delete("/{faq_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("admin:*"))])
async def delete_faq(faq_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await FAQService.get_by_id(db, faq_id)
    if item is None:
        raise HTTPException(status_code=404, detail="FAQ not found")
    await FAQService.delete(db, item)
