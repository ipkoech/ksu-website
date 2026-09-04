"""Seed schools and academic departments."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.base import slugify

from ._shared import LEADERSHIP_PEOPLE, SCHOOL_SPECS, SeedContext, get_or_create_person, upsert_campus, upsert_department, upsert_school


async def seed_schools(db: AsyncSession, ctx: SeedContext) -> None:
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
            )
