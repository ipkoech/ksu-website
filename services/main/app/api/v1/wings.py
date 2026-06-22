"""Wing endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession
from ...models import Wing
from ...security.scopes import can_access_scope
from ...schemas import WingCreate, WingUpdate
from ...services import WingService

router = APIRouter()

WING_VIEW_PERMISSIONS = ["administration.view", "office.view", "governance.view"]
WING_MANAGE_PERMISSIONS = [
    "administration.manage_units",
    "office.manage_content",
    "governance.manage_divisions",
    "organization.manage_divisions",
]


async def _can_access_wing_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
    wing_id: uuid.UUID | None,
) -> bool:
    for permission in permissions:
        if await can_access_scope(db, user, permission, "wing", wing_id):
            return True
    return False


async def _require_wing_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
    wing_id: uuid.UUID | None,
) -> None:
    if not await _can_access_wing_scope(db, user, permissions, wing_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges for this office scope",
        )


@router.get("/division/{division_id}")
@cached_public(timeout=300, vary_on=("is_active", "fields", "include"))
async def list_wings_by_division(division_id: uuid.UUID, db: DbSession, is_active: bool | None = True, fields: FieldSelection = FieldsDep):
    selector = build_selector(Wing, fields)
    items = await WingService.list_by_division(db, division_id, is_active=is_active, load_options=selector.load_options)
    return success(data=selector.apply(items))


@router.get("/admin")
async def list_admin_wings(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    division_id: uuid.UUID | None = None,
    is_active: bool | None = True,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Wing, fields)
    result = await WingService.list(
        db,
        page=page,
        per_page=per_page,
        division_id=division_id,
        is_active=is_active,
        load_options=selector.load_options,
    )
    items = []
    for item in result.items:
        if await _can_access_wing_scope(db, user, WING_VIEW_PERMISSIONS, item.id):
            items.append(item)
    meta = dict(result.meta)
    meta["total"] = len(items)
    return success(data=selector.apply(items), meta=meta)


@router.get("/slug/{slug}")
@cached_public(timeout=300, vary_on=("fields", "include"))
async def get_wing_by_slug(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Wing, fields)
    wing = await WingService.get_by_slug(db, slug, load_options=selector.load_options)
    if wing is None:
        raise HTTPException(status_code=404, detail="Wing not found")
    return success(data=selector.apply(wing))


@router.get("/{wing_id}")
@cached_public(timeout=300, vary_on=("fields", "include"))
async def get_wing(wing_id: uuid.UUID, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Wing, fields)
    wing = await WingService.get_by_id(db, wing_id, load_options=selector.load_options)
    if wing is None:
        raise HTTPException(status_code=404, detail="Wing not found")
    return success(data=selector.apply(wing))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_wing(data: WingCreate, db: DbSession, user: CurrentUser):
    if not await can_access_scope(db, user, "administration.manage_units", "division", data.division_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges to create offices under this division",
        )
    wing = await WingService.create(db, data.division_id, **data.model_dump(exclude={"division_id"}))
    return success(data=wing, message="Wing created")


@router.patch("/{wing_id}")
async def update_wing(wing_id: uuid.UUID, data: WingUpdate, db: DbSession, user: CurrentUser):
    wing = await WingService.get_by_id(db, wing_id)
    if wing is None:
        raise HTTPException(status_code=404, detail="Wing not found")
    await _require_wing_scope(db, user, WING_MANAGE_PERMISSIONS, wing.id)
    payload = data.model_dump(exclude_unset=True)
    next_division_id = payload.get("division_id", wing.division_id)
    if next_division_id != wing.division_id:
        if not await can_access_scope(db, user, "administration.manage_units", "division", next_division_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient privileges to move this office to the target division",
            )
    wing = await WingService.update(db, wing, **payload)
    return success(data=wing, message="Wing updated")
