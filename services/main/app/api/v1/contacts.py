"""Contact directory endpoints."""

from __future__ import annotations

import uuid
from typing import Literal

from fastapi import APIRouter, HTTPException, Query, status as http_status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ._scoped import can_access_scoped_record, require_scoped_record
from ...deps import CurrentUser, DbSession
from ...models import ContactDirectory
from ...schemas import ContactDirectoryCreate, ContactDirectoryUpdate
from ...services import ContactReferenceError, ContactService, StaffService

router = APIRouter()

CONTACT_VIEW_PERMISSIONS = ["office.view", "support.view", "content.view"]
CONTACT_MANAGE_PERMISSIONS = [
    "office.manage_content",
    "support.manage_contacts",
    "content.manage_pages",
]
CONTACT_OWNER_PERMISSIONS = [*CONTACT_VIEW_PERMISSIONS, *CONTACT_MANAGE_PERMISSIONS]


@router.get("")
@cached_public(
    timeout=300,
    vary_on=("page", "per_page", "scope_type", "scope_id", "is_main", "q", "contact_type", "sort", "fields", "include"),
)
async def list_contacts(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    is_main: bool | None = None,
    q: str | None = Query(default=None, max_length=120),
    contact_type: str | None = Query(default=None, max_length=64),
    sort: Literal["name_asc", "name_desc"] = "name_asc",
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
        search=q,
        contact_type=contact_type,
        sort=sort,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/admin")
async def list_admin_contacts(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    is_public: bool | None = None,
    is_main: bool | None = None,
    status: str | None = Query(default=None, max_length=32),
    q: str | None = Query(default=None, max_length=120),
    contact_type: str | None = Query(default=None, max_length=64),
    sort: Literal["name_asc", "name_desc"] = "name_asc",
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(ContactDirectory, fields)

    async def is_visible(candidate_scope_type, candidate_scope_id):
        return await can_access_scoped_record(
            db,
            user,
            CONTACT_VIEW_PERMISSIONS,
            candidate_scope_type,
            candidate_scope_id,
        )

    result = await ContactService.list_admin_authorized(
        db,
        is_visible=is_visible,
        page=page,
        per_page=per_page,
        scope_type=scope_type,
        scope_id=scope_id,
        is_public=is_public,
        is_main=is_main,
        status=status,
        search=q,
        contact_type=contact_type,
        sort=sort,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


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
    await require_scoped_record(
        db,
        user,
        CONTACT_VIEW_PERMISSIONS,
        item.scope_type,
        item.scope_id,
        resource_name="contact",
    )
    return success(data=selector.apply(item))


@router.get("/owners")
async def list_contact_owners(
    db: DbSession,
    user: CurrentUser,
    scope_type: Literal["division", "directorate", "wing", "school", "department"],
    q: str | None = Query(default=None, max_length=120),
    limit: int = Query(default=20, ge=1, le=100),
):
    items = await StaffService.search_entities(
        db,
        entity_type=scope_type,
        search=q,
        limit=limit,
    )
    authorized_items = []
    for item in items:
        if await can_access_scoped_record(
            db,
            user,
            CONTACT_OWNER_PERMISSIONS,
            item["entity_type"],
            item["id"],
        ):
            authorized_items.append(item)
    return success(data=authorized_items)


@router.get("/{contact_id}")
@cached_public(timeout=300, vary_on=("contact_id", "fields", "include"))
async def get_contact(contact_id: uuid.UUID, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(ContactDirectory, fields)
    item = await ContactService.get_by_id(db, contact_id, load_options=selector.load_options)
    if item is None or not item.is_public or item.status != "active":
        raise HTTPException(status_code=404, detail="Contact not found")
    return success(data=selector.apply(item))


@router.post("", status_code=http_status.HTTP_201_CREATED)
async def create_contact(data: ContactDirectoryCreate, db: DbSession, user: CurrentUser):
    await require_scoped_record(
        db,
        user,
        CONTACT_MANAGE_PERMISSIONS,
        data.scope_type,
        data.scope_id,
        resource_name="contact",
    )
    try:
        item = await ContactService.create(db, **data.model_dump())
    except ContactReferenceError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return success(data=item, message="Contact created")


@router.patch("/{contact_id}")
async def update_contact(contact_id: uuid.UUID, data: ContactDirectoryUpdate, db: DbSession, user: CurrentUser):
    item = await ContactService.get_by_id(db, contact_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    await require_scoped_record(
        db,
        user,
        CONTACT_MANAGE_PERMISSIONS,
        item.scope_type,
        item.scope_id,
        resource_name="contact",
    )
    payload = data.model_dump(exclude_unset=True)
    await require_scoped_record(
        db,
        user,
        CONTACT_MANAGE_PERMISSIONS,
        payload.get("scope_type", item.scope_type),
        payload.get("scope_id", item.scope_id),
        resource_name="contact",
    )
    try:
        item = await ContactService.update(db, item, **payload)
    except ContactReferenceError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return success(data=item, message="Contact updated")
