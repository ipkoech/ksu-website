"""Seed schools and academic departments."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Department
from app.schemas.base import slugify

from ._shared import LEADERSHIP_PEOPLE, SCHOOL_SPECS, SeedContext, get_or_create_person, upsert_campus, upsert_department, upsert_school


UNDERGRADUATE_STUDENTS = 27_000
POSTGRADUATE_STUDENTS = 1_000


def _distribute_total(total: int, count: int) -> list[int]:
    """Distribute an aggregate across departments without losing any units."""
    if count <= 0:
        return []
    base, remainder = divmod(total, count)
    return [base + int(index < remainder) for index in range(count)]


async def seed_schools(db: AsyncSession, ctx: SeedContext) -> None:
    academic_department_specs = [
        department_spec
        for school_spec in SCHOOL_SPECS
        for department_spec in school_spec["departments"]
    ]
    undergraduate_counts = _distribute_total(
        UNDERGRADUATE_STUDENTS,
        len(academic_department_specs),
    )
    postgraduate_counts = _distribute_total(
        POSTGRADUATE_STUDENTS,
        len(academic_department_specs),
    )
    department_index = 0

    campus = await upsert_campus(
        db,
        ctx,
        name="Main Campus",
        slug="main-campus",
        code="MAIN",
        campus_type="main",
        address="Kisii University Main Campus, Kisii",
        city="Kisii",
        county="Kisii",
        description="Primary Kisii University campus and institutional headquarters in Kisii.",
        is_active=True,
        display_order=1,
    )

    for spec in SCHOOL_SPECS:
        dean = await get_or_create_person(db, ctx, spec["dean_key"], **LEADERSHIP_PEOPLE[spec["dean_key"]])
        school = await upsert_school(
            db,
            ctx,
            campus_id=campus.id,
            name=spec["name"],
            slug=slugify(spec["name"]),
            code=spec["code"],
            school_type="school",
            dean_id=dean.id,
            about=spec["about"],
            mission=spec["mission"],
            vision=spec["vision"],
            mandate=spec.get("mandate"),
            core_values=spec.get("core_values"),
            email=spec.get("email"),
            website=spec.get("website"),
            office_location=spec.get("office_location"),
            is_active=True,
            is_public=True,
            display_order=50,
        )
        active_department_codes = {str(item["code"]) for item in spec["departments"]}
        existing_departments = (
            await db.execute(select(Department).where(Department.school_id == school.id))
        ).scalars().all()
        for department in existing_departments:
            if department.code not in active_department_codes:
                department.is_active = False
                department.is_public = False
        for department_spec in spec["departments"]:
            await upsert_department(
                db,
                ctx,
                name=department_spec["name"],
                slug=slugify(department_spec["name"]),
                code=department_spec["code"],
                external_source="kisii_main_website",
                external_source_id=slugify(department_spec["name"]),
                external_name=department_spec["name"],
                department_type="academic",
                school_id=school.id,
                wing_id=None,
                parent_department_id=None,
                head_id=None,
                postgraduate_coordinator_id=None,
                about=department_spec.get("about", f"{department_spec['name']} under {school.name}."),
                mandate=department_spec.get("mandate"),
                guidelines=spec.get("handbook_source_url"),
                is_active=True,
                is_public=True,
                allows_staff_management=True,
                display_order=100,
                student_count=undergraduate_counts[department_index],
                postgraduate_student_count=postgraduate_counts[department_index],
            )
            department_index += 1
