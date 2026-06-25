"""Seed Kisii University divisions and wings."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from ._shared import LEADERSHIP_PEOPLE, SeedContext, get_or_create_person, upsert_division, upsert_wing
from app.schemas.base import slugify


DIVISION_SPECS = [
    {
        "name": "Office of the Vice-Chancellor",
        "code": "OVC",
        "division_type": "office",
        "head_key": "vice_chancellor",
        "description": "Executive leadership office responsible for institutional direction and public representation.",
    },
    {
        "name": "Division of Administration, Planning & Finance",
        "code": "APF",
        "division_type": "division",
        "head_key": "dvc_apf",
        "description": "Parent division for administration, planning, finance, and support services.",
        "source_url": "https://kisiiuniversity.ac.ke/admin_departments/administrative-division",
    },
    {
        "name": "Division of Academic, Research & Student Affairs",
        "code": "ARSA",
        "division_type": "division",
        "head_key": "dvc_arsa",
        "description": "Parent division for academic affairs, research, and student-facing university functions.",
        "source_url": "https://kisiiuniversity.ac.ke/admin_departments/academic-division",
    },
]


WING_SPECS = [
    ("APF", "Administration, Human Resource and Central Services", "AHRCS", "wing", "registrar_admin"),
    ("APF", "Finance", "FIN", "wing", "finance_officer"),
    ("APF", "Information Communication and Technology", "ICT", "wing", "ict_manager"),
    ("APF", "Planning", "PLANNING", "wing", "dvc_apf"),
    ("APF", "Medical Services", "MEDICAL", "wing", "dvc_apf"),
    ("APF", "Internal Audit", "AUDIT", "wing", "dvc_apf"),
    ("APF", "Legal", "LEGAL", "wing", "dvc_apf"),
    ("APF", "Procurement and Supplies", "PROC", "wing", "dvc_apf"),
    ("APF", "Corporate Communication", "CORPCOMM", "wing", "dvc_apf"),
    ("ARSA", "Academic Affairs", "RAA", "wing", "registrar_academic"),
    ("ARSA", "Research, Extension, Innovation and Resource Mobilization", "REIRM", "wing", None),
    ("ARSA", "E-Learning", "ELEARN", "wing", "director_elearning"),
    ("ARSA", "Student Affairs", "STUAFFAIRS", "wing", "dean_students"),
]


async def seed_divisions(db: AsyncSession, ctx: SeedContext) -> None:
    for key in (
        "vice_chancellor",
        "dvc_apf",
        "dvc_arsa",
        "registrar_admin",
        "registrar_academic",
        "finance_officer",
        "dean_students",
        "director_elearning",
        "ict_manager",
    ):
        await get_or_create_person(db, ctx, key, **LEADERSHIP_PEOPLE[key])

    for spec in DIVISION_SPECS:
        head = ctx.people[spec["head_key"]]
        await upsert_division(
            db,
            ctx,
            name=spec["name"],
            slug=slugify(spec["name"]),
            code=spec["code"],
            division_type=spec["division_type"],
            head_id=head.id,
            description=spec["description"],
            settings={"source_url": spec["source_url"]} if spec.get("source_url") else None,
            is_public=True,
            is_active=True,
            display_order=10,
        )

    for division_code, name, code, wing_type, head_key in WING_SPECS:
        division = ctx.divisions[division_code]
        head = ctx.people[head_key] if head_key else None
        await upsert_wing(
            db,
            ctx,
            division_id=division.id,
            name=name,
            slug=slugify(name),
            code=code,
            wing_type=wing_type,
            head_id=head.id if head else None,
            description=f"{name} wing under {division.name}.",
            is_public=True,
            is_active=True,
            display_order=20,
        )
