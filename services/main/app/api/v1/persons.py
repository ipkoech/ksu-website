"""Person endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status

from ksu_common.schemas.responses import success

from ._person_media import with_person_photo_urls
from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import Person
from ...schemas import PersonCreate, PersonUpdate
from ...services import MediaService, PersonService

router = APIRouter()

PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024


@router.get("")
async def list_persons(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str | None = None,
    department_id: uuid.UUID | None = None,
    school_id: uuid.UUID | None = None,
    academic_rank: str | None = None,
    employment_type: str | None = None,
    status: str = Query("active", pattern="^(active|inactive|deleted|all)$"),
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Person, fields)
    result = await PersonService.list(
        db,
        page=page,
        per_page=per_page,
        search=search,
        department_id=department_id,
        school_id=school_id,
        academic_rank=academic_rank,
        employment_type=employment_type,
        status=status,
        load_options=selector.load_options,
    )
    return success(data=with_person_photo_urls(selector.apply(result.items), result.items), meta=result.meta)


@router.get("/{person_id}")
async def get_person(person_id: uuid.UUID, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Person, fields)
    person = await PersonService.get_by_id(db, person_id, load_options=selector.load_options)
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    return success(data=with_person_photo_urls(selector.apply(person), person))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("staff:write"))])
async def create_person(data: PersonCreate, db: DbSession, _: CurrentUser):
    person = await PersonService.create(db, **data.model_dump())
    created = await PersonService.get_by_id(db, person.id)
    return success(data=with_person_photo_urls(build_selector(Person, FieldSelection(fields=())).apply(created), created), message="Person created")


@router.patch("/{person_id}", dependencies=[Depends(require_scope("staff:write"))])
async def update_person(person_id: uuid.UUID, data: PersonUpdate, db: DbSession, _: CurrentUser):
    person = await PersonService.get_by_id(db, person_id)
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    updated = await PersonService.update(db, person, **data.model_dump(exclude_unset=True))
    updated = await PersonService.get_by_id(db, updated.id)
    return success(data=with_person_photo_urls(build_selector(Person, FieldSelection(fields=())).apply(updated), updated), message="Person updated")


@router.patch("/{person_id}/activate", dependencies=[Depends(require_scope("staff:write"))])
async def activate_person(person_id: uuid.UUID, db: DbSession, _: CurrentUser):
    person = await PersonService.get_by_id(db, person_id)
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    updated = await PersonService.activate(db, person)
    return success(data=with_person_photo_urls(build_selector(Person, FieldSelection(fields=())).apply(updated), updated), message="Person activated")


@router.patch("/{person_id}/deactivate", dependencies=[Depends(require_scope("staff:write"))])
async def deactivate_person(person_id: uuid.UUID, db: DbSession, _: CurrentUser):
    person = await PersonService.get_by_id(db, person_id)
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    updated = await PersonService.deactivate(db, person)
    return success(data=with_person_photo_urls(build_selector(Person, FieldSelection(fields=())).apply(updated), updated), message="Person deactivated")


@router.post(
    "/{person_id}/photo",
    dependencies=[Depends(require_scope("staff:write")), Depends(require_scope("media:upload"))],
)
async def upload_person_photo(
    person_id: uuid.UUID,
    db: DbSession,
    user: CurrentUser,
    file: UploadFile = File(...),
):
    person = await PersonService.get_by_id(db, person_id)
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Profile photo must be an image")
    content = await file.read(PROFILE_IMAGE_MAX_BYTES + 1)
    if len(content) > PROFILE_IMAGE_MAX_BYTES:
        raise HTTPException(status_code=413, detail="Profile photo must be 5MB or smaller")
    await file.seek(0)
    media = await MediaService.upload(
        db,
        file=file,
        uploaded_by_id=user.id,
        is_public=person.is_public,
        entity_type="person",
        entity_id=person.id,
        role="profile-photo",
    )
    updated = await PersonService.update(db, person, photo_id=media.id)
    updated = await PersonService.get_by_id(db, updated.id)
    return success(data=with_person_photo_urls(build_selector(Person, FieldSelection(fields=())).apply(updated), updated), message="Profile photo updated")


@router.delete("/{person_id}/photo", dependencies=[Depends(require_scope("staff:write"))])
async def remove_person_photo(person_id: uuid.UUID, db: DbSession, _: CurrentUser):
    person = await PersonService.get_by_id(db, person_id)
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    updated = await PersonService.update(db, person, photo_id=None)
    return success(data=with_person_photo_urls(build_selector(Person, FieldSelection(fields=())).apply(updated), updated), message="Profile photo removed")


@router.delete("/{person_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("staff:delete"))])
async def delete_person(person_id: uuid.UUID, db: DbSession, _: CurrentUser):
    person = await PersonService.get_by_id(db, person_id)
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    await PersonService.delete(db, person)
