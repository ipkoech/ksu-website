"""Contact directory endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import ContactDirectory
from ...schemas import ContactDirectoryCreate, ContactDirectoryUpdate
from ...services import ContactService

router = APIRouter()


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "scope_type", "scope_id", "is_main", "fields", "include"))
async def list_contacts(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    is_main: bool | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(ContactDirectory, fields)
    result = await ContactService.list(db, page=page, per_page=per_page, scope_type=scope_type, scope_id=scope_id, is_main=is_main, load_options=selector.load_options)
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{contact_id}")
@cached_public(timeout=300, vary_on=("contact_id", "fields", "include"))
async def get_contact(contact_id: uuid.UUID, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(ContactDirectory, fields)
    item = await ContactService.get_by_id(db, contact_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("admin:*"))])
async def create_contact(data: ContactDirectoryCreate, db: DbSession, _: CurrentUser):
    item = await ContactService.create(db, **data.model_dump())
    return success(data=item, message="Contact created")


@router.patch("/{contact_id}", dependencies=[Depends(require_scope("admin:*"))])
async def update_contact(contact_id: uuid.UUID, data: ContactDirectoryUpdate, db: DbSession, _: CurrentUser):
    item = await ContactService.get_by_id(db, contact_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    item = await ContactService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Contact updated")
