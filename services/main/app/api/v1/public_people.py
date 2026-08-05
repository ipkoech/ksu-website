"""Public-safe person profile endpoints."""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ...deps import DbSession
from ...helpers.storage import get_media_public_url
from ...models import (
    Board,
    Department,
    Division,
    Media,
    Person,
    School,
    UniversityInfo,
    Wing,
)
from ...services import PersonService

router = APIRouter()


PUBLIC_PERSON_FIELDS = (
    "id",
    "slug",
    "title",
    "first_name",
    "middle_name",
    "last_name",
    "full_name",
    "email",
    "phone",
    "photo_id",
    "bio",
    "full_bio",
    "qualifications",
    "department_id",
    "academic_rank",
    "specialization",
    "research_interests",
    "teaching_areas",
    "publications_count",
    "publication_records",
    "research_grants_won",
    "h_index",
    "office_location",
    "office_hours",
    "office_phone",
    "courses_taught",
    "institutional_role",
    "leadership_message",
    "is_researcher",
    "website_url",
    "linkedin_url",
    "google_scholar_id",
    "google_scholar_url",
    "orcid",
    "researchgate_url",
    "scopus_id",
    "education_background",
    "professional_memberships",
    "awards_honors",
    "cv_file_id",
)


def _public_email(value: str | None) -> str | None:
    if not value:
        return None
    lowered = value.lower()
    if lowered.endswith("@internal.local") or "@internal." in lowered:
        return None
    return value


async def _assignment_entity_payload(
    db: DbSession, assignment: Any
) -> dict[str, Any] | None:
    entity_type = assignment.entity_type
    entity_id = assignment.entity_id

    if entity_type == "university":
        result = await db.execute(
            select(UniversityInfo)
            .where(UniversityInfo.is_active.is_(True))
            .order_by(UniversityInfo.created_at.asc())
        )
        entity = result.scalars().first()
        return {
            "entity_type": "university",
            "id": None,
            "name": getattr(entity, "name", "University"),
            "slug": None,
            "kind": None,
        }

    model = {
        "school": School,
        "department": Department,
        "division": Division,
        "wing": Wing,
        "board": Board,
        "directorate": Division,
    }.get(entity_type)
    if model is None or entity_id is None:
        return None

    entity = await db.get(model, entity_id)
    if entity is None:
        return None

    return {
        "entity_type": entity_type,
        "id": getattr(entity, "id", entity_id),
        "name": getattr(entity, "name", None),
        "slug": getattr(entity, "slug", None),
        "kind": getattr(entity, "department_type", None)
        or getattr(entity, "division_type", None)
        or getattr(entity, "board_type", None),
    }


async def _safe_assignment_payload(db: DbSession, assignment: Any) -> dict[str, Any]:
    payload = {
        "id": assignment.id,
        "entity_type": assignment.entity_type,
        "entity_id": assignment.entity_id,
        "role": assignment.role,
        "title": assignment.title,
        "hierarchy_level": assignment.hierarchy_level,
        "reports_to_id": assignment.reports_to_id,
        "is_primary": assignment.is_primary,
        "is_acting": assignment.is_acting,
        "role_display": assignment.role_display,
        "is_current": assignment.is_current,
        "entity": await _assignment_entity_payload(db, assignment),
    }
    if assignment.show_term_dates:
        payload["start_date"] = assignment.start_date
        payload["end_date"] = assignment.end_date
        payload["term_display"] = assignment.term_display
    return payload


async def _person_photo_url(db: DbSession, person: Person) -> str | None:
    photo = getattr(person, "photo", None)
    if photo is None and person.photo_id:
        result = await db.execute(select(Media).where(Media.id == person.photo_id))
        photo = result.scalar_one_or_none()
    if photo is None:
        return None
    return get_media_public_url(photo)


async def _person_cv_url(db: DbSession, person: Person) -> str | None:
    cv_file = getattr(person, "cv_file", None)
    if cv_file is None and person.cv_file_id:
        result = await db.execute(select(Media).where(Media.id == person.cv_file_id))
        cv_file = result.scalar_one_or_none()
    if cv_file is None:
        return None
    return get_media_public_url(cv_file)


async def _safe_person_payload(db: DbSession, person: Person) -> dict[str, Any]:
    payload = {field: getattr(person, field, None) for field in PUBLIC_PERSON_FIELDS}
    payload["email"] = _public_email(payload.get("email"))
    payload["slug"] = payload.get("slug") or str(person.id)
    payload["photo_url"] = await _person_photo_url(db, person)
    payload["cv_file_url"] = await _person_cv_url(db, person)
    payload["publications"] = payload.pop("publication_records", None)
    payload["assignments"] = [
        await _safe_assignment_payload(db, assignment)
        for assignment in person.assignments
        if assignment.status == "active"
        and assignment.is_public
        and assignment.deleted_at is None
    ]
    return payload


@router.get("/{person_id}")
@cached_public(timeout=300, vary_on=("person_id",))
async def get_public_person(person_id: uuid.UUID, db: DbSession):
    person = await PersonService.get_by_id(db, person_id)
    if (
        person is None
        or person.deleted_at is not None
        or not person.is_active
        or not person.is_public
        or not person.show_on_directory
    ):
        raise HTTPException(status_code=404, detail="Person not found")

    return success(data=await _safe_person_payload(db, person))
