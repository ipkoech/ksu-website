"""Seed Management Board data."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from ._shared import LEADERSHIP_PEOPLE, SeedContext, get_or_create_person, upsert_board


async def seed_management(db: AsyncSession, ctx: SeedContext) -> None:
    for key in (
        "vice_chancellor",
        "dvc_apf",
        "dvc_arsa",
        "registrar_admin",
        "registrar_academic",
        "research_director",
        "finance_officer",
    ):
        await get_or_create_person(db, ctx, key, **LEADERSHIP_PEOPLE[key])

    vc = ctx.people["vice_chancellor"]

    await upsert_board(
        db,
        ctx,
        "MANAGEMENT",
        name="Management Board",
        slug="management-board",
        board_type="management_board",
        chairperson_id=vc.id,
        secretary_id=vc.id,
        mandate="Executive management forum coordinating university administration, academic affairs, finance, student affairs, research, and institutional operations.",
        meeting_schedule=None,
        description="Management Board leadership structure sourced from Kisii University public management pages.",
        is_public=True,
        is_active=True,
        status="active",
        display_order=2,
    )
