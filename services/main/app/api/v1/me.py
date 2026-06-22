"""Current-user self-service endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import selectinload

from ksu_common.schemas.responses import success

from ._person_media import with_person_photo_urls
from ...deps import CurrentUser, DbSession, require_scope
from ...models import Person
from ...schemas import MyProfileUpdate, PersonRead
from ...services import PersonService

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


@router.get("/profile", dependencies=[Depends(require_scope("profile.self_edit"))])
async def get_my_profile(db: DbSession, user: CurrentUser):
    """Return the authenticated user's linked public staff profile."""
    person = await _current_profile(db, user)
    return success(data=_profile_data(person))


@router.patch("/profile", dependencies=[Depends(require_scope("profile.self_edit"))])
async def update_my_profile(data: MyProfileUpdate, db: DbSession, user: CurrentUser):
    """Update editable fields on the authenticated user's linked public staff profile."""
    person = await _current_profile(db, user)
    await PersonService.update(db, person, **data.model_dump(exclude_unset=True))
    return success(data=_profile_data(person), message="Profile updated")
