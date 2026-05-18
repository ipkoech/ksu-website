"""Seed administrative departments and ICT sections."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.base import slugify

from ._shared import (
    ADMIN_DEPARTMENTS,
    ICT_SECTION_DEPARTMENTS,
    LEADERSHIP_PEOPLE,
    SeedContext,
    get_or_create_person,
    upsert_department,
    upsert_department_service,
)


async def seed_admin_departments(db: AsyncSession, ctx: SeedContext) -> None:
    for spec in ADMIN_DEPARTMENTS:
        head_key = spec.get("head_key")
        head = None
        if head_key:
            head = await get_or_create_person(db, ctx, head_key, **LEADERSHIP_PEOPLE[head_key])
        wing_id = None
        wing_code = spec.get("wing_code")
        if wing_code:
            wing = ctx.wings[wing_code]
            wing_id = wing.id
        await upsert_department(
            db,
            ctx,
            name=spec["name"],
            slug=slugify(spec["name"]),
            code=spec["code"],
            department_type="administrative",
            school_id=None,
            wing_id=wing_id,
            parent_department_id=None,
            head_id=head.id if head else None,
            postgraduate_coordinator_id=None,
            about=spec["about"],
            is_active=True,
            is_public=True,
            allows_staff_management=True,
            display_order=100,
        )

    for key in (
        "ict_manager",
        "ict_cybersecurity_head",
        "ict_software_dev_head",
        "ict_installation_maintenance_head",
        "ict_networking_head",
        "ict_website_support_head",
    ):
        await get_or_create_person(db, ctx, key, **LEADERSHIP_PEOPLE[key])

    ict_department = ctx.departments["ICT"]
    for spec in ICT_SECTION_DEPARTMENTS:
        head = ctx.people[spec["head_key"]]
        await upsert_department(
            db,
            ctx,
            name=spec["name"],
            slug=slugify(spec["name"]),
            code=spec["code"],
            department_type="support",
            school_id=None,
            wing_id=ict_department.wing_id,
            parent_department_id=ict_department.id,
            head_id=head.id,
            postgraduate_coordinator_id=None,
            about=f"{spec['name']} section within the ICT Department.",
            is_active=True,
            is_public=True,
            allows_staff_management=True,
            display_order=110,
        )

    await upsert_department_service(
        db,
        ict_department,
        name="Website Support",
        slug="website-support",
        description="Support for Kisii University website administration, publishing, and user-facing issue resolution.",
        turnaround_time="1-3 working days",
        contact_phone="+254720875082",
        is_active=True,
        display_order=1,
    )
    await upsert_department_service(
        db,
        ict_department,
        name="Software Development",
        slug="software-development",
        description="Development and maintenance of internal applications, portals, and digital workflows.",
        turnaround_time="Varies by request scope",
        is_active=True,
        display_order=2,
    )
