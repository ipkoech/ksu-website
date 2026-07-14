"""Seed University Council governance data."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import GovernancePageContent, GovernanceRole

from ._shared import LEADERSHIP_PEOPLE, SeedContext, get_or_create_person, upsert_board


GOVERNANCE_ROLE_SPECS = (
    ("Chairperson", "chairperson", "chairperson", "chairperson", 1, 1),
    ("Council Member", "council-member", "member", "member", 2, 10),
    ("Government Representative", "government-representative", "representative", "member", 2, 20),
    ("Senate Representative", "senate-representative", "representative", "member", 2, 30),
    ("Student Representative", "student-representative", "representative", "member", 2, 40),
    ("Industry Representative", "industry-representative", "representative", "member", 2, 50),
    ("External Representative", "external-representative", "representative", "member", 2, 60),
    ("Secretary to Council", "secretary-to-council", "secretary", "secretary", 3, 1000),
)


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

    board = await upsert_board(
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

    for name, slug, category, display_group, hierarchy_level, display_order in GOVERNANCE_ROLE_SPECS:
        result = await db.execute(select(GovernanceRole).where(GovernanceRole.slug == slug))
        role = result.scalar_one_or_none()
        payload = {
            "name": name,
            "slug": slug,
            "category": category,
            "display_group": display_group,
            "public_label": name,
            "default_hierarchy_level": hierarchy_level,
            "default_display_order": display_order,
            "is_active": True,
        }
        if role is None:
            db.add(GovernanceRole(id=uuid.uuid4(), **payload))

    result = await db.execute(
        select(GovernancePageContent).where(
            GovernancePageContent.board_id == board.id,
            GovernancePageContent.page_key == "overview",
        )
    )
    page_content = result.scalar_one_or_none()
    payload = {
        "board_id": board.id,
        "page_key": "overview",
        "title": "University Council",
        "intro": "University Council leadership, membership, and mandate.",
        "breadcrumb_label": "University Council",
        "mandate_label": "Mandate",
        "mandate_heading": "University Council Mandate",
        "mandate_body": board.mandate,
        "status": "published",
        "workflow_status": "published",
        "published_at": datetime.now(timezone.utc),
    }
    if page_content is None:
        db.add(GovernancePageContent(id=uuid.uuid4(), **payload))
    else:
        for field_name, value in payload.items():
            setattr(page_content, field_name, value)
