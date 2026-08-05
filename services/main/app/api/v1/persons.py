"""Person endpoints."""

import uuid
from types import SimpleNamespace

from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import selectinload

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._person_media import with_person_photo_urls
from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession
from ...models import Person
from ...security.scopes import can_access_scope
from ...schemas import PersonCreate, PersonUpdate
from ...services import MediaService, PersonService

router = APIRouter()

PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024
PERSON_VIEW_PERMISSIONS = [
    "persons.view",
    "persons.manage",
    "staff.view_assignments",
    "publications.view",
]
PERSON_MANAGE_PERMISSIONS = [
    "persons.manage",
    "staff.manage_profiles",
    "staff.manage_assignments",
    "publications.manage",
]
PERSON_MEDIA_LOAD_OPTIONS = (selectinload(Person.cv_file),)


def _person_scope(data) -> tuple[str, uuid.UUID | None]:
    department_id = getattr(data, "department_id", None)
    if department_id:
        return ("department", department_id)
    return ("university", None)


async def _can_access_person_scope(
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


async def _require_person_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
    scope_type: str,
    scope_id: uuid.UUID | None,
) -> None:
    if not await _can_access_person_scope(db, user, permissions, scope_type, scope_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges for this person scope",
        )


async def _validate_person_cv_media(
    db: DbSession,
    user: CurrentUser,
    person: Person,
    payload: dict,
) -> None:
    if "cv_file_id" not in payload:
        return

    cv_file_id = payload["cv_file_id"]
    if cv_file_id is None or cv_file_id == person.cv_file_id:
        return

    cv_file = await MediaService.get_authorized_by_id(db, cv_file_id, user)
    if cv_file is None:
        raise HTTPException(status_code=400, detail="Choose a CV file you can access.")
    try:
        MediaService.validate_cv_media(cv_file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "search", "department_id", "school_id", "academic_rank", "employment_type", "is_researcher", "status", "fields", "include"))
async def list_persons(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str | None = None,
    department_id: uuid.UUID | None = None,
    school_id: uuid.UUID | None = None,
    academic_rank: str | None = None,
    employment_type: str | None = None,
    is_researcher: bool | None = None,
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
        is_researcher=is_researcher,
        status=status,
        load_options=[*selector.load_options, *PERSON_MEDIA_LOAD_OPTIONS],
    )
    return success(data=with_person_photo_urls(selector.apply(result.items), result.items), meta=result.meta)


@router.get("/admin")
async def list_admin_persons(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str | None = None,
    department_id: uuid.UUID | None = None,
    school_id: uuid.UUID | None = None,
    academic_rank: str | None = None,
    employment_type: str | None = None,
    is_researcher: bool | None = None,
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
        is_researcher=is_researcher,
        status=status,
        load_options=[*selector.load_options, *PERSON_MEDIA_LOAD_OPTIONS],
    )
    items = []
    for item in result.items:
        scope_type, scope_id = _person_scope(item)
        if await _can_access_person_scope(
            db,
            user,
            PERSON_VIEW_PERMISSIONS,
            scope_type,
            scope_id,
        ):
            items.append(item)
    meta = dict(result.meta)
    meta["total"] = len(items)
    return success(data=with_person_photo_urls(selector.apply(items), items), meta=meta)


@router.get("/{person_id}")
@cached_public(timeout=300, vary_on=("person_id", "fields", "include"))
async def get_person(person_id: uuid.UUID, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Person, fields)
    person = await PersonService.get_by_id(
        db,
        person_id,
        load_options=[*selector.load_options, *PERSON_MEDIA_LOAD_OPTIONS],
    )
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    return success(data=with_person_photo_urls(selector.apply(person), person))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_person(data: PersonCreate, db: DbSession, user: CurrentUser):
    scope_type, scope_id = _person_scope(data)
    await _require_person_scope(db, user, PERSON_MANAGE_PERMISSIONS, scope_type, scope_id)
    person = await PersonService.create(db, **data.model_dump())
    created = await PersonService.get_by_id(db, person.id, load_options=PERSON_MEDIA_LOAD_OPTIONS)
    return success(data=with_person_photo_urls(build_selector(Person, FieldSelection(fields=())).apply(created), created), message="Person created")


@router.patch("/{person_id}")
async def update_person(person_id: uuid.UUID, data: PersonUpdate, db: DbSession, user: CurrentUser):
    person = await PersonService.get_by_id(db, person_id)
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    scope_type, scope_id = _person_scope(person)
    await _require_person_scope(db, user, PERSON_MANAGE_PERMISSIONS, scope_type, scope_id)
    payload = data.model_dump(exclude_unset=True)
    await _validate_person_cv_media(db, user, person, payload)
    next_scope_type, next_scope_id = _person_scope(
        SimpleNamespace(department_id=payload.get("department_id", person.department_id))
    )
    await _require_person_scope(db, user, PERSON_MANAGE_PERMISSIONS, next_scope_type, next_scope_id)
    updated = await PersonService.update(db, person, **payload)
    updated = await PersonService.get_by_id(db, updated.id, load_options=PERSON_MEDIA_LOAD_OPTIONS)
    return success(data=with_person_photo_urls(build_selector(Person, FieldSelection(fields=())).apply(updated), updated), message="Person updated")


@router.patch("/{person_id}/activate")
async def activate_person(person_id: uuid.UUID, db: DbSession, user: CurrentUser):
    person = await PersonService.get_by_id(db, person_id)
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    scope_type, scope_id = _person_scope(person)
    await _require_person_scope(db, user, PERSON_MANAGE_PERMISSIONS, scope_type, scope_id)
    updated = await PersonService.activate(db, person)
    return success(data=with_person_photo_urls(build_selector(Person, FieldSelection(fields=())).apply(updated), updated), message="Person activated")


@router.patch("/{person_id}/deactivate")
async def deactivate_person(person_id: uuid.UUID, db: DbSession, user: CurrentUser):
    person = await PersonService.get_by_id(db, person_id)
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    scope_type, scope_id = _person_scope(person)
    await _require_person_scope(db, user, PERSON_MANAGE_PERMISSIONS, scope_type, scope_id)
    updated = await PersonService.deactivate(db, person)
    return success(data=with_person_photo_urls(build_selector(Person, FieldSelection(fields=())).apply(updated), updated), message="Person deactivated")


@router.post("/{person_id}/photo")
async def upload_person_photo(
    person_id: uuid.UUID,
    db: DbSession,
    user: CurrentUser,
    file: UploadFile = File(...),
):
    person = await PersonService.get_by_id(db, person_id)
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    scope_type, scope_id = _person_scope(person)
    await _require_person_scope(db, user, PERSON_MANAGE_PERMISSIONS, scope_type, scope_id)
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
    updated = await PersonService.get_by_id(db, updated.id, load_options=PERSON_MEDIA_LOAD_OPTIONS)
    return success(data=with_person_photo_urls(build_selector(Person, FieldSelection(fields=())).apply(updated), updated), message="Profile photo updated")


@router.delete("/{person_id}/photo")
async def remove_person_photo(person_id: uuid.UUID, db: DbSession, user: CurrentUser):
    person = await PersonService.get_by_id(db, person_id)
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    scope_type, scope_id = _person_scope(person)
    await _require_person_scope(db, user, PERSON_MANAGE_PERMISSIONS, scope_type, scope_id)
    updated = await PersonService.update(db, person, photo_id=None)
    return success(data=with_person_photo_urls(build_selector(Person, FieldSelection(fields=())).apply(updated), updated), message="Profile photo removed")


@router.post("/{person_id}/cv")
async def upload_person_cv(
    person_id: uuid.UUID,
    db: DbSession,
    user: CurrentUser,
    file: UploadFile = File(...),
):
    person = await PersonService.get_by_id(db, person_id)
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    scope_type, scope_id = _person_scope(person)
    await _require_person_scope(db, user, PERSON_MANAGE_PERMISSIONS, scope_type, scope_id)
    try:
        MediaService.validate_cv_mime_type(file.content_type)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    media = await MediaService.upload(
        db,
        file=file,
        uploaded_by_id=user.id,
        is_public=person.is_public,
        entity_type="person",
        entity_id=person.id,
        role="cv",
    )
    updated = await PersonService.update(db, person, cv_file_id=media.id)
    updated = await PersonService.get_by_id(db, updated.id, load_options=PERSON_MEDIA_LOAD_OPTIONS)
    return success(
        data=with_person_photo_urls(build_selector(Person, FieldSelection(fields=())).apply(updated), updated),
        message="CV updated",
    )


@router.delete("/{person_id}/cv")
async def remove_person_cv(person_id: uuid.UUID, db: DbSession, user: CurrentUser):
    person = await PersonService.get_by_id(db, person_id)
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    scope_type, scope_id = _person_scope(person)
    await _require_person_scope(db, user, PERSON_MANAGE_PERMISSIONS, scope_type, scope_id)
    updated = await PersonService.update(db, person, cv_file_id=None)
    return success(
        data=with_person_photo_urls(build_selector(Person, FieldSelection(fields=())).apply(updated), updated),
        message="CV removed",
    )


@router.delete("/{person_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_person(person_id: uuid.UUID, db: DbSession, user: CurrentUser):
    person = await PersonService.get_by_id(db, person_id)
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    scope_type, scope_id = _person_scope(person)
    await _require_person_scope(db, user, PERSON_MANAGE_PERMISSIONS, scope_type, scope_id)
    await PersonService.delete(db, person)
