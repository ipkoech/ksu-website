"""Seed the current KUCCPS/transfer and upcoming admissions intake records."""

from __future__ import annotations

from datetime import date, datetime, time
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    AcademicCalendar,
    Intake,
    IntakeMilestone,
    IntakePublicAction,
    Programme,
    ProgrammeIntake,
)


NAIROBI = ZoneInfo("Africa/Nairobi")


def at_midnight(value: date) -> datetime:
    return datetime.combine(value, time.min, NAIROBI)


def at_end_of_day(value: date) -> datetime:
    return datetime.combine(value, time(23, 59, 59), NAIROBI)


async def _get_calendar(db: AsyncSession):
    result = await db.execute(
        select(Intake).where(Intake.code == "SEP2026")
    )
    intake = result.scalar_one_or_none()
    return (
        await db.get(AcademicCalendar, intake.academic_calendar_id)
        if intake is not None
        else None
    )


async def _upsert_intake(db: AsyncSession, code: str, payload: dict) -> Intake:
    result = await db.execute(select(Intake).where(Intake.code == code))
    intake = result.scalar_one_or_none()
    if intake is None:
        intake = Intake(code=code, **payload)
        db.add(intake)
    else:
        for field, value in payload.items():
            setattr(intake, field, value)
    await db.flush()
    return intake


async def _upsert_action(db: AsyncSession, intake: Intake, action_type: str, payload: dict) -> None:
    result = await db.execute(
        select(IntakePublicAction).where(
            IntakePublicAction.intake_id == intake.id,
            IntakePublicAction.action_type == action_type,
            IntakePublicAction.deleted_at.is_(None),
        )
    )
    action = result.scalar_one_or_none()
    if action is None:
        action = IntakePublicAction(
            intake_id=intake.id,
            action_type=action_type,
            **payload,
        )
        db.add(action)
    else:
        for field, value in payload.items():
            setattr(action, field, value)


async def _upsert_milestone(db: AsyncSession, intake: Intake, payload: dict) -> None:
    result = await db.execute(
        select(IntakeMilestone).where(
            IntakeMilestone.intake_id == intake.id,
            IntakeMilestone.milestone_type == payload["milestone_type"],
            IntakeMilestone.deleted_at.is_(None),
        )
    )
    milestone = result.scalar_one_or_none()
    if milestone is None:
        milestone = IntakeMilestone(intake_id=intake.id, **payload)
        db.add(milestone)
    else:
        for field, value in payload.items():
            setattr(milestone, field, value)


async def seed_homepage_admissions(db: AsyncSession, ctx) -> None:
    """Publish the current late route and schedule the next admissions intake."""
    calendar = await _get_calendar(db)
    if calendar is None:
        return

    late_start = date(2026, 7, 1)
    late_standard_end = date(2026, 7, 26)
    late_close = date(2026, 8, 19)
    late_intake = await _upsert_intake(
        db,
        "KUCCPS-TRANSFER-SEP2026",
        {
            "name": "Late KUCCPS & Transfer Applications",
            "slug": "late-kuccps-transfer-september-2026",
            "academic_calendar_id": calendar.id,
            "application_start": late_start,
            "application_end": late_standard_end,
            "late_application_end": late_close,
            "application_opens_at": at_midnight(late_start),
            "application_closes_at": at_end_of_day(late_standard_end),
            "late_application_closes_at": at_end_of_day(late_close),
            "application_override": "force_open",
            "override_expires_at": at_end_of_day(late_close),
            "late_applications_enabled": True,
            "is_featured_on_homepage": True,
            "homepage_priority": 10,
            "timezone": "Africa/Nairobi",
            "max_students": 5000,
            "is_active": True,
            "is_open": True,
        },
    )

    published_window = {
        "is_enabled": True,
        "status": "published",
        "workflow_status": "published",
        "published_at": at_midnight(date(2026, 7, 1)),
    }
    await _upsert_action(
        db,
        late_intake,
        "apply",
        {
            **published_window,
            "label": "Apply via KUCCPS",
            "description": "Complete the late KUCCPS route through the official admissions centre.",
            "target_url": "https://digital.kisiiuniversity.ac.ke/students/admissions/center",
            "open_in_new_tab": True,
            "priority": 10,
            "ends_at": at_end_of_day(late_close),
        },
    )
    await _upsert_action(
        db,
        late_intake,
        "contact_admissions",
        {
            **published_window,
            "label": "Transfer applications",
            "description": "Get guidance for transfer applications and document checks.",
            "target_url": "/admissions/transfer",
            "open_in_new_tab": False,
            "priority": 20,
            "ends_at": at_end_of_day(late_close),
        },
    )
    await _upsert_action(
        db,
        late_intake,
        "check_requirements",
        {
            **published_window,
            "label": "Check requirements",
            "description": "Review pathway and programme requirements before applying.",
            "target_url": "/admissions/requirements",
            "open_in_new_tab": False,
            "priority": 30,
            "ends_at": at_end_of_day(late_close),
        },
    )

    upcoming_result = await db.execute(select(Intake).where(Intake.code == "SEP2026"))
    upcoming = upcoming_result.scalar_one_or_none()
    if upcoming is not None:
        admissions_start = date(2026, 8, 20)
        admissions_end = date(2026, 9, 20)
        admissions_late_end = date(2026, 9, 30)
        for field, value in {
            "name": "September 2026 Admissions",
            "slug": "september-2026-admissions",
            "application_start": admissions_start,
            "application_end": admissions_end,
            "late_application_end": admissions_late_end,
            "application_opens_at": at_midnight(admissions_start),
            "application_closes_at": at_end_of_day(admissions_end),
            "late_application_closes_at": at_end_of_day(admissions_late_end),
            "application_override": "automatic",
            "override_expires_at": None,
            "late_applications_enabled": True,
            "is_featured_on_homepage": False,
            "homepage_priority": 20,
            "is_open": False,
        }.items():
            setattr(upcoming, field, value)

        await _upsert_milestone(
            db,
            upcoming,
            {
                "milestone_type": "applications_open",
                "title": "September 2026 admissions open",
                "description": "Applications for the September 2026 admissions intake open on 20 August 2026.",
                "starts_at": at_midnight(admissions_start),
                "ends_at": at_end_of_day(admissions_end),
                "is_public": True,
                "display_order": 10,
                "status": "published",
                "workflow_status": "published",
            },
        )

    # Keep the old May cycle out of public "currently open" queries.
    may_result = await db.execute(select(Intake).where(Intake.code == "MAY2026"))
    may_intake = may_result.scalar_one_or_none()
    if may_intake is not None:
        may_intake.is_open = False

    programmes = (
        await db.execute(select(Programme).where(Programme.is_active.is_(True)))
    ).scalars().all()
    for programme in programmes:
        existing = await db.execute(
            select(ProgrammeIntake).where(
                ProgrammeIntake.programme_id == programme.id,
                ProgrammeIntake.intake_id == late_intake.id,
            )
        )
        programme_intake = existing.scalar_one_or_none()
        if programme_intake is None:
            db.add(
                ProgrammeIntake(
                    programme_id=programme.id,
                    intake_id=late_intake.id,
                    application_deadline=late_close,
                    is_active=True,
                )
            )

    await db.flush()
