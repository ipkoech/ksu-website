"""Structured academic timetable endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import selectinload

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession
from ...models import (
    AcademicCalendar, AcademicTimetable, Document, Programme, TimetableSitting,
    TimetableSittingProgramme, TimetableVenue,
)
from ...schemas import (
    AcademicTimetableCreate, AcademicTimetableUpdate, ContentWorkflowActionRequest,
    TimetableSittingCreate, TimetableSittingUpdate, TimetableVenueCreate,
)
from ...security.scopes import can_access_scope
from ...services._base import apply_updates
from ...services.content_workflow import ContentWorkflowService
from ...services.timetable import find_sitting_conflicts, validate_venue_capacity

router = APIRouter()


async def _require_manage(db: DbSession, user: CurrentUser) -> None:
    if not await can_access_scope(db, user, "academic.manage_calendars", "university", None):
        raise HTTPException(status_code=403, detail="Insufficient privileges for timetable management")


def _load_timetable():
    return (
        select(AcademicTimetable)
        .options(
            selectinload(AcademicTimetable.sittings).selectinload(TimetableSitting.venue),
            selectinload(AcademicTimetable.sittings).selectinload(TimetableSitting.programmes),
            selectinload(AcademicTimetable.fallback_document),
        )
        .where(AcademicTimetable.deleted_at.is_(None))
    )


@router.get("")
@cached_public(timeout=300, vary_on=("calendar_id", "programme_id", "timetable_type"))
async def list_public_timetables(
    db: DbSession,
    calendar_id: uuid.UUID | None = None,
    programme_id: uuid.UUID | None = None,
    timetable_type: str = "examination",
):
    query = _load_timetable().where(
        AcademicTimetable.is_public.is_(True), AcademicTimetable.is_published.is_(True),
        AcademicTimetable.workflow_status == "published", AcademicTimetable.timetable_type == timetable_type,
    )
    if calendar_id:
        query = query.where(AcademicTimetable.calendar_id == calendar_id)
    records = (await db.execute(query.order_by(AcademicTimetable.published_at.desc()))).scalars().unique().all()
    data = []
    for timetable in records:
        sittings = [s for s in timetable.sittings if s.status != "cancelled" and (not programme_id or any(p.id == programme_id for p in s.programmes))]
        if programme_id and not sittings:
            continue
        sittings.sort(key=lambda s: (s.sitting_date, s.start_time, s.course_code))
        data.append({"timetable": timetable, "sittings": sittings})
    return success(data=data)


@router.get("/venues")
@cached_public(timeout=600)
async def list_venues(db: DbSession):
    venues = (await db.execute(TimetableVenue.active_query().where(TimetableVenue.is_active.is_(True)).order_by(TimetableVenue.name))).scalars().all()
    return success(data=venues)


@router.post("/venues", status_code=status.HTTP_201_CREATED)
async def create_venue(data: TimetableVenueCreate, db: DbSession, user: CurrentUser):
    await _require_manage(db, user)
    venue = TimetableVenue(**data.model_dump())
    db.add(venue)
    await db.flush()
    return success(data=venue, message="Timetable venue created")


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_timetable(data: AcademicTimetableCreate, db: DbSession, user: CurrentUser):
    await _require_manage(db, user)
    if await AcademicCalendar.get_by_id(db, data.calendar_id) is None:
        raise HTTPException(status_code=404, detail="Academic calendar not found")
    if data.fallback_document_id and await Document.get_by_id(db, data.fallback_document_id) is None:
        raise HTTPException(status_code=404, detail="Fallback document not found")
    record = AcademicTimetable(
        **data.model_dump(), status="draft", workflow_status="draft", updated_by_id=user.id,
        owner_portal="main", owner_scope_type="university",
    )
    db.add(record)
    await db.flush()
    return success(data=record, message="Timetable created")


@router.patch("/{timetable_id}")
async def update_timetable(timetable_id: uuid.UUID, data: AcademicTimetableUpdate, db: DbSession, user: CurrentUser):
    await _require_manage(db, user)
    record = await AcademicTimetable.get_by_id(db, timetable_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Timetable not found")
    payload = data.model_dump(exclude_unset=True)
    await ContentWorkflowService.reset_after_authoring_edit(db, record, "academic_timetables", user.id, changed_fields=payload)
    apply_updates(record, updated_by_id=user.id, **payload)
    await db.flush()
    return success(data=record, message="Timetable updated")


@router.post("/{timetable_id}/sittings", status_code=status.HTTP_201_CREATED)
async def create_sitting(timetable_id: uuid.UUID, data: TimetableSittingCreate, db: DbSession, user: CurrentUser):
    await _require_manage(db, user)
    timetable = await AcademicTimetable.get_by_id(db, timetable_id)
    if timetable is None:
        raise HTTPException(status_code=404, detail="Timetable not found")
    programme_ids = list(dict.fromkeys(data.programme_ids))
    found = (await db.execute(select(Programme.id).where(Programme.id.in_(programme_ids), Programme.deleted_at.is_(None)))).scalars().all()
    if len(found) != len(programme_ids):
        raise HTTPException(status_code=422, detail="One or more programmes do not exist")
    await validate_venue_capacity(db, data.venue_id, data.candidate_count)
    conflicts = await find_sitting_conflicts(
        db, timetable_id=timetable_id, sitting_date=data.sitting_date, start_time=data.start_time,
        end_time=data.end_time, venue_id=data.venue_id, programme_ids=programme_ids,
    )
    if conflicts:
        raise HTTPException(status_code=409, detail={"message": "Timetable conflict", "conflicts": conflicts})
    payload = data.model_dump(exclude={"programme_ids"})
    sitting = TimetableSitting(timetable_id=timetable_id, **payload)
    db.add(sitting)
    await db.flush()
    db.add_all([TimetableSittingProgramme(sitting_id=sitting.id, programme_id=item) for item in programme_ids])
    await ContentWorkflowService.reset_after_authoring_edit(db, timetable, "academic_timetables", user.id, changed_fields={"sitting_added": str(sitting.id)})
    await db.flush()
    return success(data=sitting, message="Timetable sitting created")


@router.patch("/{timetable_id}/sittings/{sitting_id}")
async def update_sitting(
    timetable_id: uuid.UUID,
    sitting_id: uuid.UUID,
    data: TimetableSittingUpdate,
    db: DbSession,
    user: CurrentUser,
):
    await _require_manage(db, user)
    timetable = await AcademicTimetable.get_by_id(db, timetable_id)
    sitting = (await db.execute(TimetableSitting.active_query().where(
        TimetableSitting.id == sitting_id, TimetableSitting.timetable_id == timetable_id,
    ))).scalar_one_or_none()
    if timetable is None or sitting is None:
        raise HTTPException(status_code=404, detail="Timetable sitting not found")
    payload = data.model_dump(exclude_unset=True)
    programme_ids = payload.pop("programme_ids", None)
    effective_programmes = programme_ids or [programme.id for programme in sitting.programmes]
    effective_start = payload.get("start_time", sitting.start_time)
    effective_end = payload.get("end_time", sitting.end_time)
    if effective_end <= effective_start:
        raise HTTPException(status_code=422, detail="end_time must be after start_time")
    if programme_ids is not None:
        programme_ids = list(dict.fromkeys(programme_ids))
        if not programme_ids:
            raise HTTPException(status_code=422, detail="At least one programme is required")
        found = (await db.execute(select(Programme.id).where(
            Programme.id.in_(programme_ids), Programme.deleted_at.is_(None),
        ))).scalars().all()
        if len(found) != len(programme_ids):
            raise HTTPException(status_code=422, detail="One or more programmes do not exist")
        effective_programmes = programme_ids
    await validate_venue_capacity(
        db, payload.get("venue_id", sitting.venue_id), payload.get("candidate_count", sitting.candidate_count)
    )
    conflicts = await find_sitting_conflicts(
        db, timetable_id=timetable_id,
        sitting_date=payload.get("sitting_date", sitting.sitting_date),
        start_time=effective_start, end_time=effective_end,
        venue_id=payload.get("venue_id", sitting.venue_id),
        programme_ids=effective_programmes, exclude_sitting_id=sitting_id,
    )
    if conflicts:
        raise HTTPException(status_code=409, detail={"message": "Timetable conflict", "conflicts": conflicts})
    apply_updates(sitting, **payload)
    if programme_ids is not None:
        await db.execute(delete(TimetableSittingProgramme).where(TimetableSittingProgramme.sitting_id == sitting_id))
        db.add_all([TimetableSittingProgramme(sitting_id=sitting_id, programme_id=item) for item in programme_ids])
    await ContentWorkflowService.reset_after_authoring_edit(
        db, timetable, "academic_timetables", user.id,
        changed_fields={"sitting_updated": str(sitting_id), **payload},
    )
    await db.flush()
    return success(data=sitting, message="Timetable sitting updated")


@router.post("/{timetable_id}/workflow/{action}")
async def transition_timetable(timetable_id: uuid.UUID, action: str, data: ContentWorkflowActionRequest, db: DbSession, user: CurrentUser):
    await _require_manage(db, user)
    timetable = await AcademicTimetable.get_by_id(db, timetable_id)
    if timetable is None:
        raise HTTPException(status_code=404, detail="Timetable not found")
    if action == "publish" and not timetable.sittings:
        raise HTTPException(status_code=409, detail="A timetable must contain at least one sitting before publication")
    try:
        await ContentWorkflowService.transition(db, timetable, "academic_timetables", action, user.id, comments=data.comments, scheduled_for=data.scheduled_for)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    await db.flush()
    return success(data=timetable, message=f"Timetable workflow action '{action}' completed")
