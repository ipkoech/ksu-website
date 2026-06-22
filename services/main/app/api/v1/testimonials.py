"""Testimonial endpoints."""

from __future__ import annotations

import uuid
from types import SimpleNamespace

from fastapi import APIRouter, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession
from ...models import Testimonial
from ...security.scopes import can_access_scope
from ...schemas import TestimonialCreate, TestimonialUpdate
from ...services import TestimonialService
from ._fields import FieldSelection, FieldsDep, build_selector

router = APIRouter()

TESTIMONIAL_VIEW_PERMISSIONS = [
    "content.view",
    "content.manage",
    "content.publish",
    "academic.view",
]
TESTIMONIAL_MANAGE_PERMISSIONS = [
    "content.manage",
    "content.publish",
    "academic.manage_schools",
    "academic.manage_departments",
]


def _testimonial_scope(data) -> tuple[str, uuid.UUID | None]:
    programme_id = getattr(data, "programme_id", None)
    department_id = getattr(data, "department_id", None)
    school_id = getattr(data, "school_id", None)
    if programme_id:
        return ("programme", programme_id)
    if department_id:
        return ("department", department_id)
    if school_id:
        return ("school", school_id)
    return ("global", None)


async def _can_access_testimonial_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
    scope_type: str,
    scope_id: uuid.UUID | None,
) -> bool:
    for permission in permissions:
        if await can_access_scope(db, user, permission, scope_type, scope_id):
            return True
    return False


async def _require_testimonial_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
    scope_type: str,
    scope_id: uuid.UUID | None,
) -> None:
    if not await _can_access_testimonial_scope(db, user, permissions, scope_type, scope_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges for this testimonial scope",
        )


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "testimonial_type", "school_id", "department_id", "programme_id", "featured_only", "fields", "include"))
async def list_testimonials(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    testimonial_type: str | None = None,
    school_id: uuid.UUID | None = None,
    department_id: uuid.UUID | None = None,
    programme_id: uuid.UUID | None = None,
    featured_only: bool = False,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Testimonial, fields)
    result = await TestimonialService.list(
        db,
        page=page,
        per_page=per_page,
        testimonial_type=testimonial_type,
        school_id=school_id,
        department_id=department_id,
        programme_id=programme_id,
        featured_only=featured_only,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/admin")
async def list_admin_testimonials(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    testimonial_type: str | None = None,
    school_id: uuid.UUID | None = None,
    department_id: uuid.UUID | None = None,
    programme_id: uuid.UUID | None = None,
    featured_only: bool = False,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Testimonial, fields)
    result = await TestimonialService.list(
        db,
        page=page,
        per_page=per_page,
        testimonial_type=testimonial_type,
        school_id=school_id,
        department_id=department_id,
        programme_id=programme_id,
        featured_only=featured_only,
        public_only=False,
        load_options=selector.load_options,
    )
    items = []
    for item in result.items:
        scope_type, scope_id = _testimonial_scope(item)
        if await _can_access_testimonial_scope(
            db,
            user,
            TESTIMONIAL_VIEW_PERMISSIONS,
            scope_type,
            scope_id,
        ):
            items.append(item)
    meta = dict(result.meta)
    meta["total"] = len(items)
    return success(data=selector.apply(items), meta=meta)


@router.get("/{item_id}")
@cached_public(timeout=300, vary_on=("item_id", "fields", "include"))
async def get_testimonial(item_id: uuid.UUID, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Testimonial, fields)
    item = await TestimonialService.get_by_id(db, item_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_testimonial(data: TestimonialCreate, db: DbSession, user: CurrentUser):
    scope_type, scope_id = _testimonial_scope(data)
    await _require_testimonial_scope(
        db,
        user,
        TESTIMONIAL_MANAGE_PERMISSIONS,
        scope_type,
        scope_id,
    )
    item = await TestimonialService.create(db, **data.model_dump())
    return success(data=item, message="Testimonial created")


@router.patch("/{item_id}")
async def update_testimonial(item_id: uuid.UUID, data: TestimonialUpdate, db: DbSession, user: CurrentUser):
    item = await TestimonialService.get_by_id(db, item_id, public_only=False)
    if item is None:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    scope_type, scope_id = _testimonial_scope(item)
    await _require_testimonial_scope(
        db,
        user,
        TESTIMONIAL_MANAGE_PERMISSIONS,
        scope_type,
        scope_id,
    )
    payload = data.model_dump(exclude_unset=True)
    next_scope_type, next_scope_id = _testimonial_scope(
        SimpleNamespace(
            programme_id=payload.get("programme_id", item.programme_id),
            department_id=payload.get("department_id", item.department_id),
            school_id=payload.get("school_id", item.school_id),
        )
    )
    await _require_testimonial_scope(
        db,
        user,
        TESTIMONIAL_MANAGE_PERMISSIONS,
        next_scope_type,
        next_scope_id,
    )
    item = await TestimonialService.update(db, item, **payload)
    return success(data=item, message="Testimonial updated")


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_testimonial(item_id: uuid.UUID, db: DbSession, user: CurrentUser):
    item = await TestimonialService.get_by_id(db, item_id, public_only=False)
    if item is None:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    scope_type, scope_id = _testimonial_scope(item)
    await _require_testimonial_scope(
        db,
        user,
        TESTIMONIAL_MANAGE_PERMISSIONS,
        scope_type,
        scope_id,
    )
    await TestimonialService.delete(db, item)
