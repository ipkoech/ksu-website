"""Academic calendar endpoints."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Literal

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession
from ...models import AcademicCalendar, AcademicCalendarDocument, AcademicCalendarEvent, Document
from ...security.scopes import can_access_scope
from ...schemas import (
    AcademicCalendarCreate,
    AcademicCalendarDocumentCreate,
    AcademicCalendarEventCreate,
    AcademicCalendarEventUpdate,
    AcademicCalendarUpdate,
    ContentWorkflowActionRequest,
)
from ...services.content_workflow import ContentWorkflowService
from ...services._base import apply_updates, paginate_query

router = APIRouter()

ACADEMIC_CALENDAR_VIEW_PERMISSIONS = ["academic.view", "academic.manage_calendars"]
ACADEMIC_CALENDAR_MANAGE_PERMISSIONS = ["academic.manage_calendars"]


def _validate_date_range(start_date: date, end_date: date | None) -> None:
    if end_date is not None and end_date < start_date:
        raise HTTPException(status_code=422, detail="end_date must be on or after start_date")


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
    status: Literal["published", "current"] | None = None,
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
    else:
        # This is the unauthenticated endpoint. Draft, superseded, and archived
        # calendars must never become public merely because the caller omitted
        # a status filter.
        query = query.where(AcademicCalendar.status.in_(("published", "current")))
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


@router.get("/composition/current")
@cached_public(timeout=300, vary_on=("academic_year", "semester"))
async def get_current_calendar_composition(
    db: DbSession,
    academic_year: str | None = None,
    semester: int | None = Query(default=None, ge=1, le=3),
):
    query = (
        AcademicCalendar.active_query()
        .where(AcademicCalendar.status.in_(("published", "current")))
        .options(
            selectinload(AcademicCalendar.normalized_events).selectinload(AcademicCalendarEvent.document),
            selectinload(AcademicCalendar.document_links).selectinload(AcademicCalendarDocument.document),
        )
        .order_by(AcademicCalendar.status.desc(), AcademicCalendar.start_date.desc())
    )
    if academic_year:
        query = query.where(AcademicCalendar.academic_year == academic_year)
    if semester:
        query = query.where(AcademicCalendar.semester == semester)
    calendar = (await db.execute(query)).scalars().first()
    if calendar is None:
        raise HTTPException(status_code=404, detail="Published academic calendar not found")
    events = [
        event for event in calendar.normalized_events
        if event.is_public and event.is_published and event.workflow_status == "published"
    ]
    events.sort(key=lambda item: (item.start_date, item.display_order, item.title))
    documents = [
        link for link in calendar.document_links
        if link.document.is_active and link.document.is_public and link.document.is_published
    ]
    documents.sort(key=lambda item: (item.display_order, item.relationship_type))
    calendar_summary = {
        "id": calendar.id,
        "academic_year": calendar.academic_year,
        "semester": calendar.semester,
        "start_date": calendar.start_date,
        "end_date": calendar.end_date,
        "registration_start": calendar.registration_start,
        "registration_end": calendar.registration_end,
        "late_registration_end": calendar.late_registration_end,
        "teaching_start": calendar.teaching_start,
        "teaching_end": calendar.teaching_end,
        "exam_start": calendar.exam_start,
        "exam_end": calendar.exam_end,
        "results_release": calendar.results_release,
        "status": calendar.status,
        "published_at": calendar.published_at,
    }
    return success(data={"calendar": calendar_summary, "events": events, "documents": documents})


@router.get("/{calendar_id}/events")
@cached_public(timeout=300, vary_on=("event_type", "date_from", "date_to"))
async def list_public_calendar_events(
    calendar_id: uuid.UUID,
    db: DbSession,
    event_type: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
):
    query = select(AcademicCalendarEvent).where(
        AcademicCalendarEvent.calendar_id == calendar_id,
        AcademicCalendarEvent.is_public.is_(True),
        AcademicCalendarEvent.is_published.is_(True),
        AcademicCalendarEvent.workflow_status == "published",
        AcademicCalendarEvent.deleted_at.is_(None),
    )
    if event_type:
        query = query.where(AcademicCalendarEvent.event_type == event_type)
    if date_from:
        query = query.where(AcademicCalendarEvent.start_date >= date_from)
    if date_to:
        query = query.where(AcademicCalendarEvent.start_date <= date_to)
    events = (await db.execute(query.order_by(AcademicCalendarEvent.start_date, AcademicCalendarEvent.display_order))).scalars().all()
    return success(data=events)


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
    payload = data.model_dump(exclude={"status"})
    calendar = AcademicCalendar(**payload, status="draft", workflow_status="draft", updated_by_id=user.id)
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
    payload = data.model_dump(exclude_unset=True, exclude={"status"})
    await ContentWorkflowService.reset_after_authoring_edit(db, calendar, "academic_calendars", user.id, changed_fields=payload)
    apply_updates(calendar, updated_by_id=user.id, **payload)
    await db.flush()
    return success(data=calendar, message="Academic calendar updated")


@router.post("/{calendar_id}/events", status_code=status.HTTP_201_CREATED)
async def create_calendar_event(calendar_id: uuid.UUID, data: AcademicCalendarEventCreate, db: DbSession, user: CurrentUser):
    await _require_academic_calendar_scope(db, user, ACADEMIC_CALENDAR_MANAGE_PERMISSIONS)
    calendar = (await db.execute(AcademicCalendar.active_query().where(AcademicCalendar.id == calendar_id))).scalar_one_or_none()
    if calendar is None:
        raise HTTPException(status_code=404, detail="Academic calendar not found")
    _validate_date_range(data.start_date, data.end_date)
    event = AcademicCalendarEvent(
        calendar_id=calendar_id, **data.model_dump(), status="draft", workflow_status="draft", updated_by_id=user.id
    )
    db.add(event)
    await db.flush()
    return success(data=event, message="Calendar event created")


@router.patch("/{calendar_id}/events/{event_id}")
async def update_calendar_event(calendar_id: uuid.UUID, event_id: uuid.UUID, data: AcademicCalendarEventUpdate, db: DbSession, user: CurrentUser):
    await _require_academic_calendar_scope(db, user, ACADEMIC_CALENDAR_MANAGE_PERMISSIONS)
    event = (await db.execute(AcademicCalendarEvent.active_query().where(
        AcademicCalendarEvent.id == event_id, AcademicCalendarEvent.calendar_id == calendar_id
    ))).scalar_one_or_none()
    if event is None:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    payload = data.model_dump(exclude_unset=True)
    _validate_date_range(payload.get("start_date", event.start_date), payload.get("end_date", event.end_date))
    await ContentWorkflowService.reset_after_authoring_edit(db, event, "academic_calendar_events", user.id, changed_fields=payload)
    apply_updates(event, updated_by_id=user.id, **payload)
    await db.flush()
    return success(data=event, message="Calendar event updated")


@router.post("/{calendar_id}/documents", status_code=status.HTTP_201_CREATED)
async def attach_calendar_document(calendar_id: uuid.UUID, data: AcademicCalendarDocumentCreate, db: DbSession, user: CurrentUser):
    await _require_academic_calendar_scope(db, user, ACADEMIC_CALENDAR_MANAGE_PERMISSIONS)
    calendar = (await db.execute(AcademicCalendar.active_query().where(AcademicCalendar.id == calendar_id))).scalar_one_or_none()
    document = (await db.execute(Document.active_query().where(Document.id == data.document_id))).scalar_one_or_none()
    if calendar is None:
        raise HTTPException(status_code=404, detail="Academic calendar not found")
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    link = AcademicCalendarDocument(calendar_id=calendar_id, **data.model_dump())
    db.add(link)
    await db.flush()
    return success(data=link, message="Document attached to calendar")


@router.post("/{calendar_id}/workflow/{action}")
async def transition_academic_calendar(
    calendar_id: uuid.UUID,
    action: str,
    data: ContentWorkflowActionRequest,
    db: DbSession,
    user: CurrentUser,
):
    await _require_academic_calendar_scope(db, user, ACADEMIC_CALENDAR_MANAGE_PERMISSIONS)
    calendar = (await db.execute(AcademicCalendar.active_query().where(AcademicCalendar.id == calendar_id))).scalar_one_or_none()
    if calendar is None:
        raise HTTPException(status_code=404, detail="Academic calendar not found")
    try:
        await ContentWorkflowService.transition(
            db, calendar, "academic_calendars", action, user.id,
            comments=data.comments, changed_fields=data.changed_fields, scheduled_for=data.scheduled_for,
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    if action == "publish":
        calendar.status = "current"
        previous = (await db.execute(
            select(AcademicCalendar).where(
                AcademicCalendar.id != calendar.id,
                AcademicCalendar.status == "current",
                AcademicCalendar.deleted_at.is_(None),
            )
        )).scalars().all()
        for prior in previous:
            prior.status = "published"
    await db.flush()
    return success(data=calendar, message=f"Academic calendar workflow action '{action}' completed")


@router.post("/{calendar_id}/events/{event_id}/workflow/{action}")
async def transition_calendar_event(
    calendar_id: uuid.UUID,
    event_id: uuid.UUID,
    action: str,
    data: ContentWorkflowActionRequest,
    db: DbSession,
    user: CurrentUser,
):
    await _require_academic_calendar_scope(db, user, ACADEMIC_CALENDAR_MANAGE_PERMISSIONS)
    event = (await db.execute(AcademicCalendarEvent.active_query().where(
        AcademicCalendarEvent.id == event_id, AcademicCalendarEvent.calendar_id == calendar_id
    ))).scalar_one_or_none()
    if event is None:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    try:
        await ContentWorkflowService.transition(
            db, event, "academic_calendar_events", action, user.id,
            comments=data.comments, changed_fields=data.changed_fields, scheduled_for=data.scheduled_for,
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    await db.flush()
    return success(data=event, message=f"Calendar event workflow action '{action}' completed")


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
