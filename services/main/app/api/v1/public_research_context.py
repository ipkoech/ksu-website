"""Public research office context endpoint."""

from __future__ import annotations

import uuid
from collections import defaultdict
from typing import Any

from fastapi import APIRouter, Request
from sqlalchemy import or_, select, tuple_
from sqlalchemy.orm import selectinload

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from .public_team import _assignment_payload, _build_groups, _build_hierarchy, _photo_urls, _person_payload
from ...deps import DbSession
from ...models import Department, Division, Person, StaffAssignment, Wing

router = APIRouter()

RESEARCH_NAME = "Research, Extension, Innovation and Resource Mobilization"
RESEARCH_CODE = "REIRM"

DEFAULT_DIVISION_FIELDS = FieldSelection(
    fields=("id", "name", "slug", "code", "division_type", "description", "head_message", "mission", "vision", "core_values", "email", "phone", "office_location", "operating_hours", "cover_image_id"),
)
DEFAULT_WING_FIELDS = FieldSelection(
    fields=("id", "division_id", "name", "slug", "code", "wing_type", "description", "head_message", "mandate", "service_charter", "email", "phone", "office_location", "operating_hours", "cover_image_id"),
    nested={"division": FieldSelection(fields=("id", "name", "slug", "code", "division_type"))},
)
DEFAULT_DEPARTMENT_FIELDS = FieldSelection(
    fields=("id", "name", "slug", "code", "department_type", "wing_id", "about", "head_message", "mission", "vision", "mandate", "core_values", "service_charter", "guidelines", "email", "phone", "office_location", "cover_image_id", "is_public"),
    nested={"wing": FieldSelection(fields=("id", "name", "slug", "code", "wing_type"))},
)


@router.get("")
@cached_public(timeout=300, vary_on=("fields", "include"))
async def get_public_research_context(
    request: Request,
    db: DbSession,
    fields: FieldSelection = FieldsDep,
):
    """Return the merged public context for the research portal.

    REIRM has a public wing used for navigation and a hidden administrative
    department used for richer editable content. This endpoint intentionally
    merges both into one public-safe research context.
    """

    division_selector = build_selector(Division, selection_for(fields, "division", DEFAULT_DIVISION_FIELDS))
    wing_selector = build_selector(Wing, selection_for(fields, "wing", DEFAULT_WING_FIELDS))
    department_selector = build_selector(Department, selection_for(fields, "department", DEFAULT_DEPARTMENT_FIELDS))

    division = await get_research_division(db, division_selector.load_options)
    wing = await get_research_wing(db, division, wing_selector.load_options)
    department = await get_research_department(db, wing, department_selector.load_options)
    resolved = resolve_research_entity(department, wing, division)
    team = await get_research_team_payload(db, resolved, wing, department, division)
    leadership = build_leadership_payload(team, department, wing, division)

    payload = {
        "resolved_entity": resolved,
        "entity": merge_research_entity_payload(department, wing, division, resolved),
        "division": division_selector.apply(division) if division else None,
        "wing": wing_selector.apply(wing) if wing else None,
        "department": department_selector.apply(department) if department else None,
        "team": team,
        "leadership": leadership,
        "relationships": {
            "division_id": getattr(division, "id", None),
            "wing_id": getattr(wing, "id", None),
            "department_id": getattr(department, "id", None),
        },
    }

    return success(data=apply_context_selection(payload, fields))


def selection_for(fields: FieldSelection, key: str, default: FieldSelection) -> FieldSelection:
    nested = fields.get_nested(key)
    return nested if nested else default


async def get_research_division(db: DbSession, load_options: list[Any]) -> Division | None:
    query = (
        select(Division)
        .where(
            Division.is_active.is_(True),
            Division.is_public.is_(True),
            or_(
                Division.code == "ARSA",
                Division.name.ilike("%research%"),
            ),
        )
        .order_by(Division.code.desc(), Division.display_order.asc())
    )
    if load_options:
        query = query.options(*load_options)
    result = await db.execute(query)
    return result.scalars().first()


async def get_research_wing(db: DbSession, division: Division | None, load_options: list[Any]) -> Wing | None:
    query = (
        select(Wing)
        .where(
            Wing.is_active.is_(True),
            Wing.is_public.is_(True),
            or_(
                Wing.code == RESEARCH_CODE,
                Wing.name == RESEARCH_NAME,
                Wing.name.ilike("%research%extension%innovation%resource mobilization%"),
            ),
        )
        .order_by(Wing.display_order.asc(), Wing.name.asc())
    )
    if division is not None:
        query = query.where(Wing.division_id == division.id)
    if load_options:
        query = query.options(*load_options)
    result = await db.execute(query)
    return result.scalars().first()


async def get_research_department(db: DbSession, wing: Wing | None, load_options: list[Any]) -> Department | None:
    query = (
        select(Department)
        .where(
            Department.is_active.is_(True),
            or_(
                Department.code == "REIRM",
                Department.name == RESEARCH_NAME,
                Department.name.ilike("%research%extension%innovation%resource mobilization%"),
            ),
        )
        .order_by(Department.display_order.asc(), Department.name.asc())
    )
    if wing is not None:
        query = query.where(or_(Department.wing_id == wing.id, Department.code == "REIRM"))
    if load_options:
        query = query.options(*load_options)
    result = await db.execute(query)
    return result.scalars().first()


def resolve_research_entity(
    department: Department | None,
    wing: Wing | None,
    division: Division | None,
) -> dict[str, Any]:
    if department is not None and department.is_public:
        return {"entity_type": "department", "entity_id": department.id, "source": "public_department"}
    if wing is not None:
        return {"entity_type": "wing", "entity_id": wing.id, "source": "public_wing"}
    if department is not None:
        return {"entity_type": "department", "entity_id": department.id, "source": "hidden_department"}
    if division is not None:
        return {"entity_type": "division", "entity_id": division.id, "source": "division"}
    return {"entity_type": "university", "entity_id": None, "source": "fallback"}


def merge_research_entity_payload(
    department: Department | None,
    wing: Wing | None,
    division: Division | None,
    resolved: dict[str, Any],
) -> dict[str, Any]:
    return {
        "id": resolved.get("entity_id"),
        "entity_type": resolved["entity_type"],
        "source": resolved["source"],
        "name": first_text(getattr(department, "name", None), getattr(wing, "name", None), getattr(division, "name", None), RESEARCH_NAME),
        "slug": first_text(getattr(department, "slug", None), getattr(wing, "slug", None), getattr(division, "slug", None)),
        "code": first_text(getattr(department, "code", None), getattr(wing, "code", None), getattr(division, "code", None), RESEARCH_CODE),
        "about": first_text(getattr(department, "about", None), getattr(wing, "description", None), getattr(division, "description", None)),
        "description": first_text(getattr(wing, "description", None), getattr(department, "about", None), getattr(division, "description", None)),
        "mission": first_text(getattr(department, "mission", None), getattr(division, "mission", None)),
        "vision": first_text(getattr(department, "vision", None), getattr(division, "vision", None)),
        "mandate": first_text(getattr(department, "mandate", None), getattr(wing, "mandate", None)),
        "core_values": first_text(getattr(department, "core_values", None), getattr(division, "core_values", None)),
        "service_charter": first_text(getattr(department, "service_charter", None), getattr(wing, "service_charter", None)),
        "guidelines": getattr(department, "guidelines", None),
        "head_message": first_text(getattr(department, "head_message", None), getattr(wing, "head_message", None), getattr(division, "head_message", None)),
        "email": first_text(getattr(department, "email", None), getattr(wing, "email", None), getattr(division, "email", None)),
        "phone": first_text(getattr(department, "phone", None), getattr(wing, "phone", None), getattr(division, "phone", None)),
        "office_location": first_text(getattr(department, "office_location", None), getattr(wing, "office_location", None), getattr(division, "office_location", None)),
        "operating_hours": getattr(wing, "operating_hours", None) or getattr(division, "operating_hours", None),
        "cover_image_id": first_text(getattr(department, "cover_image_id", None), getattr(wing, "cover_image_id", None), getattr(division, "cover_image_id", None)),
    }


async def get_research_team_payload(
    db: DbSession,
    resolved: dict[str, Any],
    wing: Wing | None,
    department: Department | None,
    division: Division | None,
) -> dict[str, Any]:
    keys = entity_keys(resolved, wing, department, division)
    if not keys:
        return empty_team_payload()

    query = (
        select(StaffAssignment)
        .join(Person, StaffAssignment.person_id == Person.id)
        .options(selectinload(StaffAssignment.person))
        .where(
            tuple_(StaffAssignment.entity_type, StaffAssignment.entity_id).in_(keys),
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
    result = await db.execute(query)
    assignment_models = list(result.scalars().unique().all())
    people = [assignment.person for assignment in assignment_models if assignment.person is not None]
    photo_by_person = await _photo_urls(db, people)
    persons = {str(person.id): research_person_payload(person, photo_by_person.get(person.id)) for person in people}
    assignments = [
        _assignment_payload(assignment, assignment.person)
        for assignment in assignment_models
        if assignment.person is not None
    ]
    return {
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


def build_leadership_payload(
    team: dict[str, Any],
    department: Department | None,
    wing: Wing | None,
    division: Division | None,
) -> dict[str, Any]:
    assignments = team.get("assignments", [])
    persons = team.get("persons", {})
    lead_assignment = next((item for item in assignments if item.get("group") == "leadership"), assignments[0] if assignments else None)
    lead_person = persons.get(str(lead_assignment["person_id"])) if lead_assignment else None
    return {
        "assignment": lead_assignment,
        "person": lead_person,
        "message": first_text(
            lead_person.get("leadership_message") if isinstance(lead_person, dict) else None,
            getattr(department, "head_message", None),
            getattr(wing, "head_message", None),
            getattr(division, "head_message", None),
        ),
    }


def entity_keys(
    resolved: dict[str, Any],
    wing: Wing | None,
    department: Department | None,
    division: Division | None,
) -> list[tuple[str, uuid.UUID]]:
    keys: dict[tuple[str, uuid.UUID], None] = {}
    for entity_type, entity_id in (
        (resolved.get("entity_type"), resolved.get("entity_id")),
        ("wing", getattr(wing, "id", None)),
        ("department", getattr(department, "id", None)),
        ("division", getattr(division, "id", None)),
    ):
        if entity_type and entity_id:
            keys[(str(entity_type), entity_id)] = None
    return list(keys)


def empty_team_payload() -> dict[str, Any]:
    return {
        "assignments": [],
        "persons": {},
        "groups": [],
        "hierarchy": [],
        "counts": {"assignments": 0, "persons": 0, "leadership": 0},
    }


def research_person_payload(person: Person, photo_url: str | None) -> dict[str, Any]:
    payload = _person_payload(person, photo_url)
    payload["leadership_message"] = person.leadership_message
    payload["bio"] = person.bio
    return payload


def apply_context_selection(payload: dict[str, Any], fields: FieldSelection) -> dict[str, Any]:
    if not fields:
        return payload
    requested = fields.all_fields
    if not requested:
        return payload
    return {key: value for key, value in payload.items() if key in requested or key == "resolved_entity"}


def first_text(*values: Any) -> Any:
    for value in values:
        if value is None:
            continue
        if isinstance(value, str) and not value.strip():
            continue
        return value
    return None
