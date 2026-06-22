"""Academic calendar endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession
from ...models import AcademicCalendar
from ...security.scopes import can_access_scope
from ...schemas import AcademicCalendarCreate, AcademicCalendarUpdate
from ...services._base import apply_updates, paginate_query

router = APIRouter()

ACADEMIC_CALENDAR_VIEW_PERMISSIONS = ["academic.view", "academic.manage_calendars"]
ACADEMIC_CALENDAR_MANAGE_PERMISSIONS = ["academic.manage_calendars"]


async def _can_access_academic_calendar_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
) -> bool:
    for permission in permissions:
        if await can_access_scope(db, user, permission, "university", None):
            return True
    return False


async def _require_academic_calendar_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
) -> None:
    if not await _can_access_academic_calendar_scope(db, user, permissions):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges for academic calendar management",
        )


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "academic_year", "status", "fields", "include"))
async def list_academic_calendars(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    academic_year: str | None = None,
    status: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(AcademicCalendar, fields)
    query = AcademicCalendar.active_query().order_by(
        AcademicCalendar.start_date.desc(),
        AcademicCalendar.semester.desc(),
    )
    if selector.load_options:
        query = query.options(*selector.load_options)
    if academic_year:
        query = query.where(AcademicCalendar.academic_year == academic_year)
    if status:
        query = query.where(AcademicCalendar.status == status)
    result = await paginate_query(db, query, page=page, per_page=per_page)
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/admin")
async def list_admin_academic_calendars(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    academic_year: str | None = None,
    status: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    await _require_academic_calendar_scope(
        db,
        user,
        ACADEMIC_CALENDAR_VIEW_PERMISSIONS,
    )
    selector = build_selector(AcademicCalendar, fields)
    query = AcademicCalendar.active_query().order_by(
        AcademicCalendar.start_date.desc(),
        AcademicCalendar.semester.desc(),
    )
    if selector.load_options:
        query = query.options(*selector.load_options)
    if academic_year:
        query = query.where(AcademicCalendar.academic_year == academic_year)
    if status:
        query = query.where(AcademicCalendar.status == status)
    result = await paginate_query(db, query, page=page, per_page=per_page)
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/id/{calendar_id}")
async def get_academic_calendar(calendar_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(AcademicCalendar, fields)
    query = AcademicCalendar.active_query().where(AcademicCalendar.id == calendar_id)
    if selector.load_options:
        query = query.options(*selector.load_options)
    result = await db.execute(query)
    calendar = result.scalar_one_or_none()
    if calendar is None:
        raise HTTPException(status_code=404, detail="Academic calendar not found")
    return success(data=selector.apply(calendar))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_academic_calendar(data: AcademicCalendarCreate, db: DbSession, user: CurrentUser):
    await _require_academic_calendar_scope(
        db,
        user,
        ACADEMIC_CALENDAR_MANAGE_PERMISSIONS,
    )
    calendar = AcademicCalendar(**data.model_dump())
    db.add(calendar)
    await db.flush()
    return success(data=calendar, message="Academic calendar created")


@router.patch("/{calendar_id}")
async def update_academic_calendar(calendar_id: uuid.UUID, data: AcademicCalendarUpdate, db: DbSession, user: CurrentUser):
    result = await db.execute(AcademicCalendar.active_query().where(AcademicCalendar.id == calendar_id))
    calendar = result.scalar_one_or_none()
    if calendar is None:
        raise HTTPException(status_code=404, detail="Academic calendar not found")
    await _require_academic_calendar_scope(
        db,
        user,
        ACADEMIC_CALENDAR_MANAGE_PERMISSIONS,
    )
    apply_updates(calendar, **data.model_dump(exclude_unset=True))
    await db.flush()
    return success(data=calendar, message="Academic calendar updated")


@router.delete("/{calendar_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_academic_calendar(calendar_id: uuid.UUID, db: DbSession, user: CurrentUser):
    result = await db.execute(AcademicCalendar.active_query().where(AcademicCalendar.id == calendar_id))
    calendar = result.scalar_one_or_none()
    if calendar is None:
        raise HTTPException(status_code=404, detail="Academic calendar not found")
    await _require_academic_calendar_scope(
        db,
        user,
        ACADEMIC_CALENDAR_MANAGE_PERMISSIONS,
    )
    calendar.soft_delete()
    await db.flush()
