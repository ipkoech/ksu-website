"""Division endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession
from ...models import Division
from ...security.scopes import can_access_scope
from ...schemas import DivisionCreate, DivisionUpdate
from ...services import DivisionService

router = APIRouter()

DIVISION_VIEW_PERMISSIONS = ["administration.view", "office.view", "governance.view"]
DIVISION_MANAGE_PERMISSIONS = [
    "administration.manage_units",
    "governance.manage_divisions",
    "organization.manage_divisions",
]


async def _can_access_division_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
    division_id: uuid.UUID | None,
) -> bool:
    for permission in permissions:
        if await can_access_scope(db, user, permission, "division", division_id):
            return True
    return False


async def _require_division_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
    division_id: uuid.UUID | None,
) -> None:
    if not await _can_access_division_scope(db, user, permissions, division_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges for this division scope",
        )


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "is_active", "fields", "include"))
async def list_divisions(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    is_active: bool | None = True,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Division, fields)
    result = await DivisionService.list(db, page=page, per_page=per_page, is_active=is_active, load_options=selector.load_options)
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/admin")
async def list_admin_divisions(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    is_active: bool | None = True,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Division, fields)
    result = await DivisionService.list(
        db,
        page=page,
        per_page=per_page,
        is_active=is_active,
        load_options=selector.load_options,
    )
    items = []
    for item in result.items:
        if await _can_access_division_scope(db, user, DIVISION_VIEW_PERMISSIONS, item.id):
            items.append(item)
    meta = dict(result.meta)
    meta["total"] = len(items)
    return success(data=selector.apply(items), meta=meta)


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("fields", "include"))
async def get_division(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Division, fields)
    division = await DivisionService.get_by_slug(db, slug, load_options=selector.load_options)
    if division is None:
        raise HTTPException(status_code=404, detail="Division not found")
    return success(data=selector.apply(division))


@router.get("/id/{division_id}")
async def get_division_by_id(division_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(Division, fields)
    division = await DivisionService.get_by_id(db, division_id, load_options=selector.load_options)
    if division is None:
        raise HTTPException(status_code=404, detail="Division not found")
    return success(data=selector.apply(division))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_division(data: DivisionCreate, db: DbSession, user: CurrentUser):
    if not await can_access_scope(db, user, "administration.manage_units", "university", None):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges to create divisions",
        )
    division = await DivisionService.create(db, **data.model_dump())
    return success(data=division, message="Division created")


@router.patch("/id/{division_id}")
async def update_division(division_id: uuid.UUID, data: DivisionUpdate, db: DbSession, user: CurrentUser):
    division = await DivisionService.get_by_id(db, division_id)
    if division is None:
        raise HTTPException(status_code=404, detail="Division not found")
    await _require_division_scope(db, user, DIVISION_MANAGE_PERMISSIONS, division.id)
    division = await DivisionService.update(db, division, **data.model_dump(exclude_unset=True))
    return success(data=division, message="Division updated")


@router.delete("/id/{division_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_division(division_id: uuid.UUID, db: DbSession, user: CurrentUser):
    division = await DivisionService.get_by_id(db, division_id)
    if division is None:
        raise HTTPException(status_code=404, detail="Division not found")
    await _require_division_scope(db, user, DIVISION_MANAGE_PERMISSIONS, division.id)
    await DivisionService.soft_delete(db, division)
