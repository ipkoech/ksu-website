"""Seed admissions calendars, intakes, and programmes."""

from __future__ import annotations

import hashlib
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.base import slugify
from app.models import Programme

from ._shared import (
    SeedContext,
    upsert_academic_calendar,
    upsert_intake,
    upsert_programme,
    upsert_programme_intake,
)
from .programme_catalogue import BROCHURE_PROGRAMMES


def programme_code(name: str, level: str) -> str:
    prefix_map = {
        "phd": "PHD",
        "masters": "MSC",
        "undergraduate": "UG",
        "diploma": "DIP",
        "certificate": "CERT",
        "postgraduate_diploma": "PGD",
    }
    prefix = prefix_map.get(level, "PRG")
    slug = slugify(name).replace("-", "").upper()
    digest = hashlib.md5(f"{level}:{name}".encode("utf-8")).hexdigest()[:6].upper()
    return f"{prefix}-{slug[:18]}-{digest}"[:32]


async def seed_programmes(db: AsyncSession, ctx: SeedContext) -> None:
    may_calendar = await upsert_academic_calendar(
        db,
        ctx,
        academic_year="2025/2026",
        semester=2,
        start_date=date(2026, 1, 5),
        end_date=date(2026, 4, 30),
        registration_start=date(2025, 12, 15),
        registration_end=date(2026, 1, 16),
        teaching_start=date(2026, 1, 12),
        teaching_end=date(2026, 4, 10),
        exam_start=date(2026, 4, 13),
        exam_end=date(2026, 4, 30),
        status="published",
    )
    september_calendar = await upsert_academic_calendar(
        db,
        ctx,
        academic_year="2026/2027",
        semester=1,
        start_date=date(2026, 9, 1),
        end_date=date(2026, 12, 20),
        registration_start=date(2026, 8, 10),
        registration_end=date(2026, 9, 12),
        teaching_start=date(2026, 9, 7),
        teaching_end=date(2026, 11, 27),
        exam_start=date(2026, 12, 1),
        exam_end=date(2026, 12, 20),
        status="published",
    )
    january_calendar = await upsert_academic_calendar(
        db,
        ctx,
        academic_year="2026/2027",
        semester=2,
        start_date=date(2027, 1, 4),
        end_date=date(2027, 4, 30),
        registration_start=date(2026, 12, 14),
        registration_end=date(2027, 1, 15),
        teaching_start=date(2027, 1, 11),
        teaching_end=date(2027, 4, 9),
        exam_start=date(2027, 4, 12),
        exam_end=date(2027, 4, 30),
        status="draft",
    )

    intakes = {
        "May": await upsert_intake(
            db,
            ctx,
            name="May 2026 Intake",
            code="MAY2026",
            slug="may-2026-intake",
            academic_calendar_id=may_calendar.id,
            application_start=date(2026, 2, 1),
            application_end=date(2026, 4, 15),
            late_application_end=date(2026, 4, 30),
            max_students=3000,
            is_active=True,
            is_open=False,
        ),
        "September": await upsert_intake(
            db,
            ctx,
            name="September 2026 Intake",
            code="SEP2026",
            slug="september-2026-intake",
            academic_calendar_id=september_calendar.id,
            application_start=date(2026, 5, 1),
            application_end=date(2026, 8, 20),
            late_application_end=date(2026, 8, 31),
            max_students=5000,
            is_active=True,
            is_open=False,
        ),
        "January": await upsert_intake(
            db,
            ctx,
            name="January 2027 Intake",
            code="JAN2027",
            slug="january-2027-intake",
            academic_calendar_id=january_calendar.id,
            application_start=date(2026, 10, 1),
            application_end=date(2026, 12, 10),
            late_application_end=date(2026, 12, 20),
            max_students=2500,
            is_active=True,
            is_open=False,
        ),
    }

    active_slugs: set[str] = set()

    for display_order, spec in enumerate(BROCHURE_PROGRAMMES, start=10):
        department = ctx.departments[str(spec["department_code"])]
        programme_slug = slugify(str(spec["name"]))
        active_slugs.add(programme_slug)
        programme = await upsert_programme(
            db,
            ctx,
            name=str(spec["name"]),
            code=str(spec.get("code") or programme_code(str(spec["name"]), str(spec["level"]))),
            slug=programme_slug,
            level=str(spec["level"]),
            mode_of_study=str(spec.get("mode_of_study", "full_time")),
            duration=str(spec["duration"]),
            credits_required=spec.get("credits_required"),
            department_id=department.id,
            about=spec.get("about") or (
                f"{spec['name']} provides structured study in the subject area of {department.name}, "
                "with coursework and assessment suited to the qualification level."
            ),
            objectives=spec.get("objectives"),
            career_prospects=spec.get("career_prospects"),
            curriculum_overview=spec.get("curriculum_overview") or (
                f"The curriculum covers foundational and advanced units in {department.name}, together with "
                "applied learning, assessment, and research or project work where required."
            ),
            entry_requirements=str(spec["entry_requirements"]),
            cluster_subjects=spec.get("cluster_subjects"),
            fees_structure=spec.get("fees_structure"),
            intake_months=spec.get("intake_months"),
            min_students=spec.get("min_students"),
            max_students=spec.get("max_students"),
            accreditation_status=spec.get("accreditation_status", "To be confirmed from current University and regulator records"),
            accrediting_body=spec.get("accrediting_body", "Commission for University Education"),
            is_active=True,
            display_order=display_order,
        )
        for intake_name in spec.get("intake_months", []):
            intake = intakes[intake_name]
            await upsert_programme_intake(
                db,
                programme,
                intake,
                slots_available=spec.get("slots_available"),
                application_deadline=intake.application_end,
                is_active=True,
            )

    existing_programmes = (await db.execute(select(Programme))).scalars().all()
    for programme in existing_programmes:
        if programme.slug not in active_slugs and programme.external_source is None:
            programme.is_active = False
