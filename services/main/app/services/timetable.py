"""Conflict and capacity validation for structured timetables."""

from __future__ import annotations

import uuid
from datetime import date, time

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import TimetableSitting, TimetableSittingProgramme, TimetableVenue


async def find_sitting_conflicts(
    db: AsyncSession,
    *,
    timetable_id: uuid.UUID,
    sitting_date: date,
    start_time: time,
    end_time: time,
    venue_id: uuid.UUID | None,
    programme_ids: list[uuid.UUID],
    exclude_sitting_id: uuid.UUID | None = None,
) -> list[dict[str, str]]:
    overlapping = select(TimetableSitting).where(
        TimetableSitting.timetable_id == timetable_id,
        TimetableSitting.sitting_date == sitting_date,
        TimetableSitting.start_time < end_time,
        TimetableSitting.end_time > start_time,
        TimetableSitting.status != "cancelled",
        TimetableSitting.deleted_at.is_(None),
    )
    if exclude_sitting_id:
        overlapping = overlapping.where(TimetableSitting.id != exclude_sitting_id)
    conflicts: list[dict[str, str]] = []
    for sitting in (await db.execute(overlapping)).scalars().all():
        if venue_id and sitting.venue_id == venue_id:
            conflicts.append({"type": "venue", "sitting_id": str(sitting.id), "course_code": sitting.course_code})
        shared = (await db.execute(select(TimetableSittingProgramme.programme_id).where(
            TimetableSittingProgramme.sitting_id == sitting.id,
            TimetableSittingProgramme.programme_id.in_(programme_ids),
        ))).scalars().all()
        for programme_id in shared:
            conflicts.append({
                "type": "programme", "sitting_id": str(sitting.id),
                "course_code": sitting.course_code, "programme_id": str(programme_id),
            })
    return conflicts


async def validate_venue_capacity(
    db: AsyncSession, venue_id: uuid.UUID | None, candidate_count: int | None
) -> None:
    if not venue_id or candidate_count is None:
        return
    venue = (await db.execute(TimetableVenue.active_query().where(TimetableVenue.id == venue_id))).scalar_one_or_none()
    if venue is None or not venue.is_active:
        raise ValueError("Timetable venue not found or inactive")
    if venue.capacity is not None and candidate_count > venue.capacity:
        raise ValueError(f"Candidate count exceeds venue capacity of {venue.capacity}")
