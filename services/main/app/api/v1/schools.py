"""School endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import Department, Person, Programme, School
from ...schemas import SchoolCreate, SchoolUpdate
from ...services import ProgrammeService, SchoolService

router = APIRouter()


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "campus_id", "administrative_wing_id", "search", "fields", "include"))
async def list_schools(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    campus_id: uuid.UUID | None = None,
    administrative_wing_id: uuid.UUID | None = None,
    search: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(School, fields)
    result = await SchoolService.list(
        db,
        page=page,
        per_page=per_page,
        campus_id=campus_id,
        administrative_wing_id=administrative_wing_id,
        search=search,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_school(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(School, fields)
    school = await SchoolService.get_by_slug(db, slug, load_options=selector.load_options)
    if school is None:
        raise HTTPException(status_code=404, detail="School not found")
    return success(data=selector.apply(school))


@router.get("/id/{school_id}")
async def get_school_by_id(school_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(School, fields)
    school = await SchoolService.get_by_id(db, school_id, load_options=selector.load_options)
    if school is None:
        raise HTTPException(status_code=404, detail="School not found")
    return success(data=selector.apply(school))


@router.get("/{slug}/departments")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_school_departments(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    school = await SchoolService.get_by_slug(db, slug)
    if school is None:
        raise HTTPException(status_code=404, detail="School not found")
    selector = build_selector(Department, fields)
    school = await SchoolService.get_with_departments(db, school.id, load_options=selector.load_options)
    return success(data=selector.apply(school.departments if school else []))


@router.get("/{slug}/staff")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_school_staff(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    school = await SchoolService.get_by_slug(db, slug)
    if school is None:
        raise HTTPException(status_code=404, detail="School not found")
    selector = build_selector(Person, fields)
    staff = await SchoolService.get_staff(db, school.id)
    return success(data=selector.apply(staff))


@router.get("/{slug}/programmes")
@cached_public(timeout=300, vary_on=("slug", "page", "per_page", "fields", "include"))
async def get_school_programmes(
    slug: str,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    fields: FieldSelection = FieldsDep,
):
    school = await SchoolService.get_by_slug(db, slug)
    if school is None:
        raise HTTPException(status_code=404, detail="School not found")
    selector = build_selector(Programme, fields)
    result = await ProgrammeService.list(db, page=page, per_page=per_page, school_id=school.id, load_options=selector.load_options)
    return success(data=selector.apply(result.items), meta=result.meta)


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("academic:write"))])
async def create_school(data: SchoolCreate, db: DbSession, _: CurrentUser):
    school = await SchoolService.create(db, **data.model_dump())
    return success(data=school, message="School created")


@router.patch("/{school_id}", dependencies=[Depends(require_scope("academic:write"))])
async def update_school(school_id: uuid.UUID, data: SchoolUpdate, db: DbSession, _: CurrentUser):
    school = await SchoolService.get_by_id(db, school_id)
    if school is None:
        raise HTTPException(status_code=404, detail="School not found")
    school = await SchoolService.update(db, school, **data.model_dump(exclude_unset=True))
    return success(data=school, message="School updated")


@router.delete("/{school_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("academic:delete"))])
async def delete_school(school_id: uuid.UUID, db: DbSession, _: CurrentUser):
    school = await SchoolService.get_by_id(db, school_id)
    if school is None:
        raise HTTPException(status_code=404, detail="School not found")
    await SchoolService.delete(db, school)
