"""Current-user self-service endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ksu_common.schemas.responses import success

from ._person_media import with_person_photo_urls
from ...deps import CurrentUser, DbSession, require_scope
from ...models import Person, UserPreference
from ...schemas.access import PortalAccessResponse
from ...schemas import MyProfileUpdate, PersonRead, UserPreferencesUpdate
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
    nested_fields = {
        "user",
        "photo",
        "cv_file",
        "department",
        "assignments",
        "programme_tutorships",
        "alumni_profile",
    }
    payload = {
        field_name: getattr(person, field_name, None)
        for field_name in PersonRead.model_fields
        if field_name not in nested_fields
    }
    return with_person_photo_urls(
        PersonRead.model_validate(payload).model_dump(exclude=nested_fields),
        person,
    )


def _preference_data(preference: UserPreference) -> dict:
    return {
        "id": getattr(preference, "id", None),
        "created_at": getattr(preference, "created_at", None),
        "updated_at": getattr(preference, "updated_at", None),
        "user_id": preference.user_id,
        "namespace": preference.namespace,
        "key": preference.key,
        "value": preference.value,
    }


async def _load_user_preferences(db: DbSession, user: CurrentUser) -> list[UserPreference]:
    result = await db.execute(
        select(UserPreference)
        .where(UserPreference.user_id == user.id)
        .where(UserPreference.deleted_at.is_(None))
        .order_by(UserPreference.namespace, UserPreference.key)
    )
    records = result.scalars().all()
    return [
        record
        for record in records
        if record.user_id == user.id and getattr(record, "deleted_at", None) is None
    ]


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


@router.get("/preferences")
async def get_my_preferences(db: DbSession, user: CurrentUser):
    """Return generic preferences owned by the authenticated user."""
    preferences = await _load_user_preferences(db, user)
    return success(data={"preferences": [_preference_data(record) for record in preferences]})


@router.patch("/preferences")
async def update_my_preferences(data: UserPreferencesUpdate, db: DbSession, user: CurrentUser):
    """Upsert generic preferences owned by the authenticated user."""
    preferences = await _load_user_preferences(db, user)
    by_key = {(record.namespace, record.key): record for record in preferences}

    for item in data.preferences:
        lookup = (item.namespace, item.key)
        record = by_key.get(lookup)
        if record is None:
            record = UserPreference(
                user_id=user.id,
                namespace=item.namespace,
                key=item.key,
                value=item.value,
            )
            db.add(record)
            preferences.append(record)
            by_key[lookup] = record
        else:
            record.value = item.value

    await db.flush()
    for record in preferences:
        await db.refresh(record)

    preferences.sort(key=lambda record: (record.namespace, record.key))
    return success(
        data={"preferences": [_preference_data(record) for record in preferences]},
        message="Preferences updated",
    )


@router.get("/portal-access")
async def get_my_portal_access(db: DbSession, user: CurrentUser):
    """Return backend-authoritative portal access records for the authenticated user."""
    portals = await get_portal_access(db, user)
    payload = PortalAccessResponse(portals=portals)
    return success(data=payload.model_dump(mode="json"))
