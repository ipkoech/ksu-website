"""Public leadership endpoints - no authentication required."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ksu_common.schemas.responses import success

from ...deps import DbSession
from ...models import StaffAssignment, Person
from ._fields import FieldSelection, FieldsDep, build_selector
from ._person_media import with_person_photo_urls

router = APIRouter()


async def get_leader_by_role(
    db: DbSession,
    entity_type: str,
    entity_id: uuid.UUID | None,
    roles: list[str],
    fields: FieldSelection,
) -> StaffAssignment | None:
    """Find active leader assignment by role(s) for an entity."""
    selector = build_selector(StaffAssignment, fields)

    query = (
        select(StaffAssignment)
        .options(selectinload(StaffAssignment.person).selectinload(Person.photo))
        .where(
            StaffAssignment.entity_type == entity_type,
            StaffAssignment.role.in_(roles),
            StaffAssignment.status == "active",
            StaffAssignment.is_public == True,
        )
    )

    if entity_id:
        query = query.where(StaffAssignment.entity_id == entity_id)

    if selector.load_options:
        query = query.options(*selector.load_options)

    query = query.order_by(
        StaffAssignment.is_acting.asc(),  # Non-acting first
        StaffAssignment.hierarchy_level.asc(),
    )

    result = await db.execute(query)
    return result.scalars().first()


@router.get("/vice-chancellor")
async def get_vice_chancellor(
    db: DbSession,
    fields: FieldSelection = FieldsDep,
):
    """Get the current Vice Chancellor."""
    assignment = await get_leader_by_role(
        db,
        entity_type="university",
        entity_id=None,
        roles=["vc", "vice_chancellor"],
        fields=fields,
    )

    if assignment is None:
        return success(data=None)

    selector = build_selector(StaffAssignment, fields)
    return success(data=with_person_photo_urls(selector.apply(assignment), assignment))


@router.get("/chancellor")
async def get_chancellor(
    db: DbSession,
    fields: FieldSelection = FieldsDep,
):
    """Get the current Chancellor."""
    assignment = await get_leader_by_role(
        db,
        entity_type="university",
        entity_id=None,
        roles=["chancellor"],
        fields=fields,
    )

    if assignment is None:
        return success(data=None)

    selector = build_selector(StaffAssignment, fields)
    return success(data=with_person_photo_urls(selector.apply(assignment), assignment))


@router.get("/dean/{school_id}")
async def get_dean(
    school_id: uuid.UUID,
    db: DbSession,
    fields: FieldSelection = FieldsDep,
):
    """Get the Dean of a school."""
    assignment = await get_leader_by_role(
        db,
        entity_type="school",
        entity_id=school_id,
        roles=["dean"],
        fields=fields,
    )

    if assignment is None:
        return success(data=None)

    selector = build_selector(StaffAssignment, fields)
    return success(data=with_person_photo_urls(selector.apply(assignment), assignment))


@router.get("/hod/{department_id}")
async def get_hod(
    department_id: uuid.UUID,
    db: DbSession,
    fields: FieldSelection = FieldsDep,
):
    """Get the Head of Department."""
    assignment = await get_leader_by_role(
        db,
        entity_type="department",
        entity_id=department_id,
        roles=["hod", "head", "cod"],
        fields=fields,
    )

    if assignment is None:
        return success(data=None)

    selector = build_selector(StaffAssignment, fields)
    return success(data=with_person_photo_urls(selector.apply(assignment), assignment))


@router.get("/director/{division_id}")
async def get_director(
    division_id: uuid.UUID,
    db: DbSession,
    fields: FieldSelection = FieldsDep,
):
    """Get the Director of a division/directorate."""
    assignment = await get_leader_by_role(
        db,
        entity_type="directorate",
        entity_id=division_id,
        roles=["director"],
        fields=fields,
    )

    # Also check division entity type
    if assignment is None:
        assignment = await get_leader_by_role(
            db,
            entity_type="division",
            entity_id=division_id,
            roles=["director", "dvc", "deputy_vice_chancellor"],
            fields=fields,
        )

    if assignment is None:
        return success(data=None)

    selector = build_selector(StaffAssignment, fields)
    return success(data=with_person_photo_urls(selector.apply(assignment), assignment))


@router.get("/")
async def get_leader(
    db: DbSession,
    role: str = Query(..., description="Role to search for (e.g., dean, hod, director)"),
    entity_type: str = Query(..., description="Entity type (university, school, department, etc.)"),
    entity_id: uuid.UUID | None = Query(None, description="Entity ID (required for non-university entities)"),
    fields: FieldSelection = FieldsDep,
):
    """Get a leader by role and entity."""
    assignment = await get_leader_by_role(
        db,
        entity_type=entity_type,
        entity_id=entity_id,
        roles=[role],
        fields=fields,
    )

    if assignment is None:
        return success(data=None)

    selector = build_selector(StaffAssignment, fields)
    return success(data=with_person_photo_urls(selector.apply(assignment), assignment))


@router.get("/list")
async def list_leaders(
    db: DbSession,
    entity_type: str = Query(..., description="Entity type"),
    entity_id: uuid.UUID | None = Query(None, description="Entity ID"),
    fields: FieldSelection = FieldsDep,
):
    """List all public leadership assignments for an entity."""
    selector = build_selector(StaffAssignment, fields)

    query = (
        select(StaffAssignment)
        .options(selectinload(StaffAssignment.person).selectinload(Person.photo))
        .where(
            StaffAssignment.entity_type == entity_type,
            StaffAssignment.status == "active",
            StaffAssignment.is_public == True,
        )
    )

    if entity_id:
        query = query.where(StaffAssignment.entity_id == entity_id)

    if selector.load_options:
        query = query.options(*selector.load_options)

    query = query.order_by(
        StaffAssignment.hierarchy_level.asc(),
        StaffAssignment.display_order.asc(),
    )

    result = await db.execute(query)
    items = list(result.scalars().all())

    return success(data=with_person_photo_urls(selector.apply(items), items))
