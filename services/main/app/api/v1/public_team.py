"""Public-safe team structure endpoint."""

from __future__ import annotations

import uuid
from collections import defaultdict
from typing import Any

from fastapi import APIRouter, HTTPException, Query, Request, status
import sqlalchemy as sa
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ksu_common import apply_field_selection, cached_public
from ksu_common.schemas.responses import success

from ...deps import DbSession
from ...helpers.storage import get_media_public_url
from ...models import Board, Department, Division, Media, Person, School, StaffAssignment, UniversityInfo, Wing
from ._fields import FieldSelection, FieldsDep

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


@router.get("/team")
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


ACADEMIC_TEAM_ROLES = {
    "professor",
    "associate_professor",
    "senior_lecturer",
    "lecturer",
    "assistant_lecturer",
    "tutorial_fellow",
    "graduate_assistant",
}
DEPARTMENT_HEAD_ROLES = {"cod", "hod", "head"}
ADMIN_ASSISTANT_ROLES = {"admin_assistant", "assistant", "admin"}
DEPUTY_ROLES = {"deputy_director", "deputy_hod", "deputy_registrar", "deputy_dean"}


def _display_name(person: Person) -> str:
    full_name = (person.full_name or "").strip()
    title = (person.title or "").strip()
    if title and full_name and not full_name.lower().startswith(title.lower()):
        return f"{title} {full_name}"
    return full_name or title or "Staff profile"


def _member_payload(
    assignment: StaffAssignment,
    person: Person,
    photo_url: str | None,
    *,
    position: str | None = None,
) -> dict[str, Any]:
    return {
        "id": str(assignment.id),
        "person_id": str(person.id),
        "profile_slug": getattr(person, "slug", None) or str(person.id),
        "name": _display_name(person),
        "title": person.title,
        "position": position or assignment.role_display,
        "photo_url": photo_url,
        "hierarchy_level": assignment.hierarchy_level,
        "display_order": assignment.display_order,
    }


def _assignment_rank(assignment: StaffAssignment) -> tuple[int, int, str]:
    return (assignment.hierarchy_level, assignment.display_order, str(assignment.id))


def _deduplicate_assignments(assignments: list[StaffAssignment]) -> list[StaffAssignment]:
    winners: dict[uuid.UUID, StaffAssignment] = {}
    for assignment in assignments:
        current = winners.get(assignment.person_id)
        if current is None or _assignment_rank(assignment) < _assignment_rank(current):
            winners[assignment.person_id] = assignment
    return sorted(winners.values(), key=_assignment_rank)


async def _load_entity_assignments(
    db: DbSession,
    scope_pairs: list[tuple[str, uuid.UUID]],
) -> list[StaffAssignment]:
    if not scope_pairs:
        return []
    scope_filter = sa.or_(
        *(
            sa.and_(StaffAssignment.entity_type == entity_type, StaffAssignment.entity_id == entity_id)
            for entity_type, entity_id in scope_pairs
        )
    )
    query = (
        select(StaffAssignment)
        .join(Person, StaffAssignment.person_id == Person.id)
        .options(selectinload(StaffAssignment.person))
        .where(
            scope_filter,
            StaffAssignment.status == "active",
            StaffAssignment.is_public.is_(True),
            StaffAssignment.deleted_at.is_(None),
            Person.deleted_at.is_(None),
            Person.is_active.is_(True),
            Person.is_public.is_(True),
            Person.show_on_directory.is_(True),
        )
        .order_by(StaffAssignment.hierarchy_level, StaffAssignment.display_order, Person.full_name)
    )
    result = await db.execute(query)
    return list(result.scalars().unique().all())


def _tier(key: str, label: str, assignments: list[StaffAssignment], photos: dict[uuid.UUID, str | None]):
    return {
        "key": key,
        "label": label,
        "members": [
            _member_payload(item, item.person, photos.get(item.person_id))
            for item in assignments
            if item.person is not None
        ],
    }


async def _school_team_payload(db: DbSession, school_id: uuid.UUID) -> dict[str, Any]:
    school_result = await db.execute(
        select(School).where(
            School.id == school_id,
            School.deleted_at.is_(None),
            School.is_active.is_(True),
            School.is_public.is_(True),
        )
    )
    school = school_result.scalar_one_or_none()
    if school is None:
        raise HTTPException(status_code=404, detail="School not found")

    department_result = await db.execute(
        select(Department).where(
            Department.school_id == school.id,
            Department.deleted_at.is_(None),
            Department.is_active.is_(True),
            Department.is_public.is_(True),
        )
    )
    departments = list(department_result.scalars().all())
    assignments = await _load_entity_assignments(
        db,
        [("school", school.id), *(("department", item.id) for item in departments)],
    )
    eligible = [
        item
        for item in assignments
        if item.role == "dean"
        or item.role in DEPARTMENT_HEAD_ROLES
        or item.role == "postgraduate_coordinator"
    ]

    canonical_people = {item.person_id for item in eligible}
    legacy_department_by_person = {
        item.postgraduate_coordinator_id: item.id
        for item in departments
        if item.postgraduate_coordinator_id and item.postgraduate_coordinator_id not in canonical_people
    }
    legacy_ids = set(legacy_department_by_person)
    if legacy_ids:
        people_result = await db.execute(
            select(Person).where(
                Person.id.in_(legacy_ids),
                Person.deleted_at.is_(None),
                Person.is_active.is_(True),
                Person.is_public.is_(True),
                Person.show_on_directory.is_(True),
            )
        )
        for index, person in enumerate(people_result.scalars().all(), start=1):
            legacy = StaffAssignment(
                id=uuid.uuid5(uuid.NAMESPACE_URL, f"legacy-postgraduate-coordinator:{school.id}:{person.id}"),
                person_id=person.id,
                entity_type="department",
                entity_id=legacy_department_by_person[person.id],
                role="postgraduate_coordinator",
                title="Postgraduate Coordinator",
                hierarchy_level=8,
                display_order=900 + index,
                status="active",
                is_public=True,
            )
            legacy.person = person
            eligible.append(legacy)

    winners = _deduplicate_assignments(eligible)
    people = [item.person for item in winners if item.person is not None]
    photos = await _photo_urls(db, people)
    tier_specs = [
        ("dean", "Dean", [item for item in winners if item.role == "dean"]),
        ("cod", "Chairpersons of Department", [item for item in winners if item.role in DEPARTMENT_HEAD_ROLES]),
        (
            "postgraduate_coordinator",
            "Postgraduate Coordinators",
            [item for item in winners if item.role == "postgraduate_coordinator"],
        ),
    ]
    tiers = [_tier(key, label, members, photos) for key, label, members in tier_specs if members]
    return {
        "entity": {"id": str(school.id), "type": "school", "name": school.name, "slug": school.slug},
        "tiers": tiers,
        "counts": {"members": len(winners), "tiers": len(tiers)},
    }


async def _department_team_payload(db: DbSession, department_id: uuid.UUID) -> dict[str, Any]:
    department_result = await db.execute(
        select(Department).where(
            Department.id == department_id,
            Department.deleted_at.is_(None),
            Department.is_active.is_(True),
            Department.is_public.is_(True),
        )
    )
    department = department_result.scalar_one_or_none()
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")

    winners = _deduplicate_assignments(
        await _load_entity_assignments(db, [("department", department.id)])
    )
    people = [item.person for item in winners if item.person is not None]
    photos = await _photo_urls(db, people)
    if department.department_type == "academic":
        head = [item for item in winners if item.role in DEPARTMENT_HEAD_ROLES]
        academic = [
            item
            for item in winners
            if item not in head and (item.role in ACADEMIC_TEAM_ROLES or bool(item.person and item.person.academic_rank))
        ]
        assistants = [item for item in winners if item not in head and item not in academic and item.role in ADMIN_ASSISTANT_ROLES]
        tier_specs = [
            ("head", "Chairperson of Department", head),
            ("academic", "Academic Staff", academic),
            ("administrative_assistants", "Administrative Assistants", assistants),
        ]
    else:
        head_roles = DEPARTMENT_HEAD_ROLES | {"director", "manager", "librarian", "university_librarian"}
        head = [item for item in winners if item.role in head_roles and item.role not in DEPUTY_ROLES]
        deputies = [item for item in winners if item.role in DEPUTY_ROLES or item.role.startswith("deputy_")]
        staff = [item for item in winners if item not in head and item not in deputies]
        tier_specs = [("head", "Head of Department", head), ("deputies", "Deputies", deputies), ("staff", "Staff", staff)]

    tiers = [_tier(key, label, members, photos) for key, label, members in tier_specs if members]
    return {
        "entity": {
            "id": str(department.id),
            "type": "department",
            "name": department.name,
            "slug": department.slug,
            "department_type": department.department_type,
        },
        "tiers": tiers,
        "counts": {"members": sum(len(item[2]) for item in tier_specs), "tiers": len(tiers)},
    }


@router.get("/schools/{school_id}/team")
@cached_public(timeout=300, vary_on=("school_id", "fields", "include"))
async def get_public_school_team(
    request: Request,
    school_id: uuid.UUID,
    db: DbSession,
    fields: FieldSelection = FieldsDep,
):
    payload = await _school_team_payload(db, school_id)
    return success(data=apply_field_selection(payload, fields, always_include={"id"}))


@router.get("/departments/{department_id}/team")
@cached_public(timeout=300, vary_on=("department_id", "fields", "include"))
async def get_public_department_team(
    request: Request,
    department_id: uuid.UUID,
    db: DbSession,
    fields: FieldSelection = FieldsDep,
):
    payload = await _department_team_payload(db, department_id)
    return success(data=apply_field_selection(payload, fields, always_include={"id"}))
