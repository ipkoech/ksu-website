"""Current-user self-service endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import selectinload

from ksu_common.schemas.responses import success

from ._person_media import with_person_photo_urls
from ...deps import CurrentUser, DbSession, require_scope
from ...models import Person
from ...schemas.access import PortalAccessResponse
from ...schemas import MyProfileUpdate, PersonRead
from ...services.portal_access import get_portal_access
from ...services import MediaService, PersonService

router = APIRouter()

PROFILE_LOAD_OPTIONS = (
    selectinload(Person.photo),
    selectinload(Person.cv_file),
    selectinload(Person.department),
    selectinload(Person.assignments),
    selectinload(Person.programme_tutorships),
    selectinload(Person.alumni_profile),
)


async def _current_profile(db: DbSession, user: CurrentUser) -> Person:
    person = await PersonService.get_by_user_id(db, user.id, load_options=PROFILE_LOAD_OPTIONS)
    if person is None:
        raise HTTPException(status_code=404, detail="No staff profile linked to this account")
    return person


def _profile_data(person: Person) -> dict:
    return with_person_photo_urls(PersonRead.model_validate(person).model_dump(), person)


async def _validate_profile_media(
    db: DbSession,
    user: CurrentUser,
    person: Person,
    payload: dict,
) -> None:
    if "photo_id" in payload:
        photo_id = payload["photo_id"]
        if photo_id is not None and photo_id != person.photo_id:
            photo = await MediaService.get_authorized_by_id(db, photo_id, user)
            if photo is None or photo.uploaded_by_id != user.id:
                raise HTTPException(
                    status_code=400,
                    detail="Choose a profile photo uploaded by your account.",
                )
            if photo.media_type != "image":
                raise HTTPException(status_code=400, detail="Profile photo must be an image.")

    if "cv_file_id" in payload:
        cv_file_id = payload["cv_file_id"]
        if cv_file_id is not None and cv_file_id != person.cv_file_id:
            cv_file = await MediaService.get_authorized_by_id(db, cv_file_id, user)
            if cv_file is None or cv_file.uploaded_by_id != user.id:
                raise HTTPException(
                    status_code=400,
                    detail="Choose a CV file uploaded by your account.",
                )
            if cv_file.media_type != "document":
                raise HTTPException(status_code=400, detail="CV file must be a document.")


@router.get("/profile", dependencies=[Depends(require_scope("profile.self_edit"))])
async def get_my_profile(db: DbSession, user: CurrentUser):
    """Return the authenticated user's linked public staff profile."""
    person = await _current_profile(db, user)
    return success(data=_profile_data(person))


@router.patch("/profile", dependencies=[Depends(require_scope("profile.self_edit"))])
async def update_my_profile(data: MyProfileUpdate, db: DbSession, user: CurrentUser):
    """Update editable fields on the authenticated user's linked public staff profile."""
    person = await _current_profile(db, user)
    payload = data.model_dump(exclude_unset=True)
    await _validate_profile_media(db, user, person, payload)
    await PersonService.update(db, person, **payload)
    return success(data=_profile_data(person), message="Profile updated")


@router.get("/portal-access")
async def get_my_portal_access(db: DbSession, user: CurrentUser):
    """Return backend-authoritative portal access records for the authenticated user."""
    portals = await get_portal_access(db, user)
    payload = PortalAccessResponse(portals=portals)
    return success(data=payload.model_dump(mode="json"))
