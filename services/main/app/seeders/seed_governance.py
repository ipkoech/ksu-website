"""Seed University Council governance data."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from ._shared import LEADERSHIP_PEOPLE, SeedContext, get_or_create_person, upsert_board


async def seed_governance(db: AsyncSession, ctx: SeedContext) -> None:
    chair = await get_or_create_person(db, ctx, "council_chair", **LEADERSHIP_PEOPLE["council_chair"])
    secretary = await get_or_create_person(db, ctx, "vice_chancellor", **LEADERSHIP_PEOPLE["vice_chancellor"])
    for key in (
        "council_member_peter_mageto",
        "council_member_scholastica_ndambuki",
        "council_member_elizabeth_mwangi",
        "council_member_samson_muchelule",
        "council_member_mwenda_makathimo",
        "council_member_pamela_awuor_ochieng",
        "council_member_josphat_sawe",
    ):
        await get_or_create_person(db, ctx, key, **LEADERSHIP_PEOPLE[key])

    await upsert_board(
        db,
        ctx,
        "COUNCIL",
        name="University Council",
        slug="university-council",
        board_type="council",
        chairperson_id=chair.id,
        secretary_id=secretary.id,
        mandate="Supreme governing organ responsible for policy, oversight, and strategic stewardship of Kisii University.",
        meeting_schedule=None,
        description="University Council leadership and membership structure sourced from the Kisii University governance pages.",
        is_public=True,
        is_active=True,
        status="active",
        display_order=1,
    )
