"""Public-safe team structure endpoint."""

from __future__ import annotations

import uuid
from collections import defaultdict
from typing import Any

from fastapi import APIRouter, HTTPException, Query, Request, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ...deps import DbSession
from ...helpers.storage import get_media_public_url
from ...models import Board, Department, Division, Media, Person, School, StaffAssignment, UniversityInfo, Wing

router = APIRouter()

SUPPORTED_ENTITY_TYPES = {"university", "school", "department", "division", "wing", "directorate", "board"}
ACADEMIC_ROLES = {
    "professor",
    "associate_professor",
    "senior_lecturer",
    "lecturer",
    "assistant_lecturer",
    "tutorial_fellow",
    "graduate_assistant",
    "researcher",
    "senior_researcher",
}
ADMIN_ROLES = {
    "admin",
    "senior_admin",
    "officer",
    "senior_officer",
    "principal_officer",
    "registrar",
    "registrar_academic",
    "registrar_admin",
    "finance_officer",
    "manager",
    "admin_assistant",
}
TECHNICAL_ROLES = {"technician", "assistant", "staff"}

ENTITY_MODELS = {
    "school": School,
    "department": Department,
    "division": Division,
    "directorate": Division,
    "wing": Wing,
    "board": Board,
}


def _entity_name(entity_type: str) -> str:
    return entity_type.replace("_", " ").title()


def _role_label(role: str) -> str:
    return role.replace("_", " ").title()


def _group_key(assignment: StaffAssignment, person: Person) -> str:
    role = assignment.role
    if assignment.hierarchy_level <= 7 or role in {"coordinator", "program_coordinator"}:
        return "leadership"
    if role in ACADEMIC_ROLES or person.academic_rank:
        return "academic"
    if role in ADMIN_ROLES:
        return "administrative"
    if role in TECHNICAL_ROLES:
        return "technical"
    return "other"


def _group_label(key: str) -> str:
    return {
        "leadership": "Leadership",
        "academic": "Academic Staff",
        "administrative": "Administrative Staff",
        "technical": "Technical Staff",
        "other": "Other Team Members",
    }.get(key, key.replace("_", " ").title())


def _public_email(value: str | None) -> str | None:
    if not value:
        return None
    lowered = value.lower()
    if lowered.endswith("@internal.local") or "@internal." in lowered:
        return None
    return value


async def _get_entity(db: DbSession, entity_type: str, entity_id: uuid.UUID | None) -> Any:
    if entity_type == "university":
        result = await db.execute(select(UniversityInfo).where(UniversityInfo.is_active.is_(True)).order_by(UniversityInfo.created_at.asc()))
        return result.scalars().first()
    if entity_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="entity_id is required")

    model = ENTITY_MODELS.get(entity_type)
    if model is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported entity_type")

    query = select(model).where(model.id == entity_id)
    if hasattr(model, "deleted_at"):
        query = query.where(model.deleted_at.is_(None))
    if hasattr(model, "is_active"):
        query = query.where(model.is_active.is_(True))
    if hasattr(model, "is_public"):
        query = query.where(model.is_public.is_(True))
    if entity_type == "directorate" and hasattr(model, "division_type"):
        query = query.where(model.division_type == "directorate")
    result = await db.execute(query)
    return result.scalar_one_or_none()


def _entity_payload(entity_type: str, entity: Any, entity_id: uuid.UUID | None) -> dict[str, Any]:
    return {
        "id": getattr(entity, "id", entity_id),
        "entity_type": entity_type,
        "name": getattr(entity, "name", "University"),
        "slug": getattr(entity, "slug", None),
        "code": getattr(entity, "code", None),
        "description": getattr(entity, "about", None) or getattr(entity, "description", None),
        "head_message": getattr(entity, "head_message", None),
        "email": getattr(entity, "email", None),
        "phone": getattr(entity, "phone", None),
        "office_location": getattr(entity, "office_location", None),
    }


async def _photo_urls(db: DbSession, people: list[Person]) -> dict[uuid.UUID, str | None]:
    photo_ids = [person.photo_id for person in people if person.photo_id]
    if not photo_ids:
        return {}
    result = await db.execute(select(Media).where(Media.id.in_(photo_ids)))
    media_by_id = {media.id: media for media in result.scalars().all()}
    urls: dict[uuid.UUID, str | None] = {}
    for person in people:
        media = media_by_id.get(person.photo_id)
        urls[person.id] = get_media_public_url(media)
    return urls


def _person_payload(person: Person, photo_url: str | None) -> dict[str, Any]:
    return {
        "id": person.id,
        "slug": getattr(person, "slug", None) or str(person.id),
        "title": person.title,
        "full_name": person.full_name,
        "email": _public_email(person.email),
        "photo_id": person.photo_id,
        "photo_url": photo_url,
        "academic_rank": person.academic_rank,
        "institutional_role": person.institutional_role,
        "office_location": person.office_location,
        "specialization": person.specialization,
        "research_interests": person.research_interests,
    }


def _assignment_payload(assignment: StaffAssignment, person: Person) -> dict[str, Any]:
    payload = {
        "id": assignment.id,
        "person_id": assignment.person_id,
        "entity_type": assignment.entity_type,
        "entity_id": assignment.entity_id,
        "role": assignment.role,
        "role_label": _role_label(assignment.role),
        "role_display": assignment.role_display,
        "group": _group_key(assignment, person),
        "title": assignment.title,
        "hierarchy_level": assignment.hierarchy_level,
        "reports_to_id": assignment.reports_to_id,
        "is_primary": assignment.is_primary,
        "is_acting": assignment.is_acting,
        "is_current": assignment.is_current,
        "display_order": assignment.display_order,
    }
    if assignment.show_term_dates:
        payload["start_date"] = assignment.start_date
        payload["end_date"] = assignment.end_date
        payload["term_display"] = assignment.term_display
    return payload


def _build_groups(assignments: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[str, list[str]] = defaultdict(list)
    for assignment in assignments:
        grouped[assignment["group"]].append(str(assignment["id"]))
    order = ["leadership", "academic", "administrative", "technical", "other"]
    return [
        {
            "key": key,
            "label": _group_label(key),
            "count": len(grouped[key]),
            "assignment_ids": grouped[key],
        }
        for key in order
        if grouped.get(key)
    ]


def _build_hierarchy(assignments: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[int, list[str]] = defaultdict(list)
    for assignment in assignments:
        grouped[int(assignment["hierarchy_level"])].append(str(assignment["id"]))
    return [
        {
            "level": level,
            "label": f"Level {level}",
            "assignment_ids": grouped[level],
        }
        for level in sorted(grouped)
    ]


@router.get("")
@cached_public(timeout=300, vary_on=("entity_type", "entity_id"))
async def get_public_team(
    request: Request,
    db: DbSession,
    entity_type: str = Query(..., description="school, department, division, wing, directorate, board, or university"),
    entity_id: uuid.UUID | None = Query(default=None),
):
    normalized_type = entity_type.strip().lower()
    if normalized_type not in SUPPORTED_ENTITY_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported entity_type")

    entity = await _get_entity(db, normalized_type, entity_id)
    if entity is None:
        raise HTTPException(status_code=404, detail=f"{_entity_name(normalized_type)} not found")

    query = (
        select(StaffAssignment)
        .join(Person, StaffAssignment.person_id == Person.id)
        .options(selectinload(StaffAssignment.person))
        .where(
            StaffAssignment.entity_type == normalized_type,
            StaffAssignment.status == "active",
            StaffAssignment.is_public.is_(True),
            StaffAssignment.deleted_at.is_(None),
            Person.deleted_at.is_(None),
            Person.is_active.is_(True),
            Person.is_public.is_(True),
            Person.show_on_directory.is_(True),
        )
        .order_by(StaffAssignment.hierarchy_level.asc(), StaffAssignment.display_order.asc(), Person.full_name.asc())
    )
    if normalized_type != "university":
        query = query.where(StaffAssignment.entity_id == entity_id)
    else:
        query = query.where(StaffAssignment.entity_id.is_(None))

    result = await db.execute(query)
    assignment_models = list(result.scalars().unique().all())
    people = [assignment.person for assignment in assignment_models if assignment.person is not None]
    photo_by_person = await _photo_urls(db, people)
    persons = {
        str(person.id): _person_payload(person, photo_by_person.get(person.id))
        for person in people
    }
    assignments = [
        _assignment_payload(assignment, assignment.person)
        for assignment in assignment_models
        if assignment.person is not None
    ]

    return success(
        data={
            "entity": _entity_payload(normalized_type, entity, entity_id),
            "assignments": assignments,
            "persons": persons,
            "groups": _build_groups(assignments),
            "hierarchy": _build_hierarchy(assignments),
            "counts": {
                "assignments": len(assignments),
                "persons": len(persons),
                "leadership": sum(1 for item in assignments if item["group"] == "leadership"),
            },
        }
    )
