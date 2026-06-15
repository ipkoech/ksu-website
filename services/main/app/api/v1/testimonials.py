"""Testimonial endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, require_scope
from ...models import Testimonial
from ...schemas import TestimonialCreate, TestimonialUpdate
from ...services import TestimonialService
from ._fields import FieldSelection, FieldsDep, build_selector

router = APIRouter()


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


@router.get("/{item_id}")
@cached_public(timeout=300)
async def get_testimonial(item_id: uuid.UUID, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Testimonial, fields)
    item = await TestimonialService.get_by_id(db, item_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("admin:*"))])
async def create_testimonial(data: TestimonialCreate, db: DbSession, _: CurrentUser):
    item = await TestimonialService.create(db, **data.model_dump())
    return success(data=item, message="Testimonial created")


@router.patch("/{item_id}", dependencies=[Depends(require_scope("admin:*"))])
async def update_testimonial(item_id: uuid.UUID, data: TestimonialUpdate, db: DbSession, _: CurrentUser):
    item = await TestimonialService.get_by_id(db, item_id, public_only=False)
    if item is None:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    item = await TestimonialService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Testimonial updated")


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("admin:*"))])
async def delete_testimonial(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await TestimonialService.get_by_id(db, item_id, public_only=False)
    if item is None:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    await TestimonialService.delete(db, item)
