"""Contact directory endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession
from ...models import ContactDirectory
from ...security.scopes import can_access_scope
from ...schemas import ContactDirectoryCreate, ContactDirectoryUpdate
from ...services import ContactService

router = APIRouter()

CONTACT_VIEW_PERMISSIONS = ["office.view", "support.view", "content.view"]
CONTACT_MANAGE_PERMISSIONS = [
    "office.manage_content",
    "support.manage_contacts",
    "content.manage_pages",
]


def _contact_scope(scope_type: str | None, scope_id: uuid.UUID | None) -> tuple[str, uuid.UUID | None]:
    return (scope_type or "global", scope_id)


async def _can_access_contact_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
    scope_type: str | None,
    scope_id: uuid.UUID | None,
) -> bool:
    target_scope_type, target_scope_id = _contact_scope(scope_type, scope_id)
    for permission in permissions:
        if await can_access_scope(db, user, permission, target_scope_type, target_scope_id):
            return True
    return False


async def _require_contact_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
    scope_type: str | None,
    scope_id: uuid.UUID | None,
) -> None:
    if not await _can_access_contact_scope(db, user, permissions, scope_type, scope_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges for this contact scope",
        )


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


@router.get("/admin")
async def list_admin_contacts(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    is_main: bool | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(ContactDirectory, fields)
    result = await ContactService.list(
        db,
        page=page,
        per_page=per_page,
        scope_type=scope_type,
        scope_id=scope_id,
        is_main=is_main,
        is_public=None,
        status=None,
        load_options=selector.load_options,
    )
    items = []
    for item in result.items:
        if await _can_access_contact_scope(
            db,
            user,
            CONTACT_VIEW_PERMISSIONS,
            item.scope_type,
            item.scope_id,
        ):
            items.append(item)
    meta = dict(result.meta)
    meta["total"] = len(items)
    return success(data=selector.apply(items), meta=meta)


@router.get("/admin/{contact_id}")
async def get_admin_contact(
    contact_id: uuid.UUID,
    db: DbSession,
    user: CurrentUser,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(ContactDirectory, fields)
    item = await ContactService.get_by_id(db, contact_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    await _require_contact_scope(
        db,
        user,
        CONTACT_VIEW_PERMISSIONS,
        item.scope_type,
        item.scope_id,
    )
    return success(data=selector.apply(item))


@router.get("/{contact_id}")
@cached_public(timeout=300, vary_on=("contact_id", "fields", "include"))
async def get_contact(contact_id: uuid.UUID, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(ContactDirectory, fields)
    item = await ContactService.get_by_id(db, contact_id, load_options=selector.load_options)
    if item is None or not item.is_public or item.status != "active":
        raise HTTPException(status_code=404, detail="Contact not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_contact(data: ContactDirectoryCreate, db: DbSession, user: CurrentUser):
    await _require_contact_scope(
        db,
        user,
        CONTACT_MANAGE_PERMISSIONS,
        data.scope_type,
        data.scope_id,
    )
    item = await ContactService.create(db, **data.model_dump())
    return success(data=item, message="Contact created")


@router.patch("/{contact_id}")
async def update_contact(contact_id: uuid.UUID, data: ContactDirectoryUpdate, db: DbSession, user: CurrentUser):
    item = await ContactService.get_by_id(db, contact_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    await _require_contact_scope(
        db,
        user,
        CONTACT_MANAGE_PERMISSIONS,
        item.scope_type,
        item.scope_id,
    )
    payload = data.model_dump(exclude_unset=True)
    await _require_contact_scope(
        db,
        user,
        CONTACT_MANAGE_PERMISSIONS,
        payload.get("scope_type", item.scope_type),
        payload.get("scope_id", item.scope_id),
    )
    item = await ContactService.update(db, item, **payload)
    return success(data=item, message="Contact updated")
