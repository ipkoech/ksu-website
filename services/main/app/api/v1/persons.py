"""Person endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import Person
from ...schemas import PersonCreate, PersonUpdate
from ...services import PersonService

router = APIRouter()


@router.get("")
async def list_persons(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str | None = None,
    department_id: uuid.UUID | None = None,
    academic_rank: str | None = None,
    employment_type: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Person, fields)
    result = await PersonService.list(
        db,
        page=page,
        per_page=per_page,
        search=search,
        department_id=department_id,
        academic_rank=academic_rank,
        employment_type=employment_type,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{person_id}")
async def get_person(person_id: uuid.UUID, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Person, fields)
    person = await PersonService.get_by_id(db, person_id, load_options=selector.load_options)
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    return success(data=selector.apply(person))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("staff:write"))])
async def create_person(data: PersonCreate, db: DbSession, _: CurrentUser):
    person = await PersonService.create(db, **data.model_dump())
    return success(data=person, message="Person created")


@router.patch("/{person_id}", dependencies=[Depends(require_scope("staff:write"))])
async def update_person(person_id: uuid.UUID, data: PersonUpdate, db: DbSession, _: CurrentUser):
    person = await PersonService.get_by_id(db, person_id)
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    updated = await PersonService.update(db, person, **data.model_dump(exclude_unset=True))
    return success(data=updated, message="Person updated")
