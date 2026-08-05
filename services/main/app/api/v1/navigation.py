"""Aggregated public navigation endpoint for the main-site mega menu.

Replaces five separate public list calls (schools, divisions, departments,
clubs, wings) with a single cached payload shaped for the frontend nav.
"""

from __future__ import annotations

from typing import Any, Sequence

from fastapi import APIRouter
from sqlalchemy import Select, select

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ...deps import DbSession
from ...models import Division, Wing
from ...services import ClubService, DepartmentService, DivisionService, SchoolService

router = APIRouter()

NAV_SCHOOLS_LIMIT = 50
NAV_DIVISIONS_LIMIT = 50
NAV_DEPARTMENTS_LIMIT = 100
NAV_CLUBS_LIMIT = 12


def _wings_statement() -> Select:
    """Active wings that belong to active divisions of type ``division``.

    Mirrors the frontend's per-division ``/api/v1/wings/division/{id}`` fan-out.
    """
    return (
        select(Wing)
        .join(Division, Wing.division_id == Division.id)
        .where(
            Wing.is_active.is_(True),
            Division.is_active.is_(True),
            Division.division_type == "division",
        )
        .order_by(Wing.display_order.asc(), Wing.name.asc())
    )


def _navigation_payload(
    *,
    schools: Sequence[Any],
    divisions: Sequence[Any],
    departments: Sequence[Any],
    clubs: Sequence[Any],
    wings: Sequence[Any],
) -> dict[str, list[dict[str, Any]]]:
    """Shape records into the exact field sets the mega menu consumes."""
    return {
        "schools": [
            {"id": school.id, "name": school.name, "slug": school.slug}
            for school in schools
        ],
        "divisions": [
            {
                "id": division.id,
                "name": division.name,
                "slug": division.slug,
                "division_type": division.division_type,
            }
            for division in divisions
        ],
        "departments": [
            {
                "id": department.id,
                "name": department.name,
                "slug": department.slug,
                "code": department.code,
                "school_id": department.school_id,
                "department_type": department.department_type,
            }
            for department in departments
        ],
        "clubs": [
            {"id": club.id, "name": club.name, "slug": club.slug} for club in clubs
        ],
        "wings": [
            {"id": wing.id, "name": wing.name, "slug": wing.slug, "code": wing.code}
            for wing in wings
        ],
    }


async def _load_navigation_data(db) -> dict[str, list[dict[str, Any]]]:
    """Fetch public/active nav records via the same services the public list
    endpoints use (their defaults already apply is_active/is_public filters)."""
    schools = (await SchoolService.list(db, page=1, per_page=NAV_SCHOOLS_LIMIT)).items
    divisions = (
        await DivisionService.list(db, page=1, per_page=NAV_DIVISIONS_LIMIT)
    ).items
    departments = (
        await DepartmentService.list(
            db,
            page=1,
            per_page=NAV_DEPARTMENTS_LIMIT,
            department_type="administrative",
        )
    ).items
    clubs = (await ClubService.list(db, page=1, per_page=NAV_CLUBS_LIMIT)).items
    wings = list((await db.execute(_wings_statement())).scalars().all())
    return _navigation_payload(
        schools=schools,
        divisions=divisions,
        departments=departments,
        clubs=clubs,
        wings=wings,
    )


@router.get("")
@cached_public(timeout=300, vary_on=())
async def get_navigation(db: DbSession):
    """Single public payload backing the main-site mega menu."""
    return success(data=await _load_navigation_data(db))
