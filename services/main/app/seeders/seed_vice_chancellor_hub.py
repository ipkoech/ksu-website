"""Seed the initial Meet the Vice Chancellor hub and activity placements."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import News, StaffAssignment, VC_SECTIONS, VcHub, VcHubPlacement

from ._shared import SeedContext
from .seed_vc_activities import VC_ACTIVITY_SLUGS


async def seed_vice_chancellor_hub(db: AsyncSession, ctx: SeedContext) -> None:
    del ctx
    hub = (await db.execute(select(VcHub).where(
        VcHub.scope_type == "university",
        VcHub.scope_id.is_(None),
        VcHub.deleted_at.is_(None),
    ))).scalar_one_or_none()
    if hub is None:
        hub = VcHub(
            scope_type="university",
            scope_id=None,
            eyebrow="Leadership in motion",
            title="Meet the Vice Chancellor",
            professional_profile_url="/about/vice-chancellor/profile",
            section_order=list(VC_SECTIONS),
            section_visibility={section: True for section in VC_SECTIONS},
        )
        db.add(hub)
        await db.flush()

    assignment = (await db.execute(
        select(StaffAssignment).where(
            StaffAssignment.entity_type == "university",
            StaffAssignment.role.in_(("vc", "vice_chancellor")),
            StaffAssignment.status == "active",
            StaffAssignment.is_public.is_(True),
            StaffAssignment.deleted_at.is_(None),
        ).order_by(StaffAssignment.hierarchy_level, StaffAssignment.start_date.desc().nullslast())
    )).scalars().first()
    if assignment is not None:
        hub.staff_assignment_id = assignment.id

    news_items = (await db.execute(select(News).where(
        News.slug.in_(VC_ACTIVITY_SLUGS),
        News.deleted_at.is_(None),
    ))).scalars().all()
    existing_news_ids = set((await db.execute(select(VcHubPlacement.news_id).where(
        VcHubPlacement.hub_id == hub.id,
        VcHubPlacement.news_id.is_not(None),
        VcHubPlacement.deleted_at.is_(None),
    ))).scalars().all())
    for order, news in enumerate(news_items, start=1):
        if news.id not in existing_news_ids:
            db.add(VcHubPlacement(
                hub_id=hub.id,
                section="activities",
                news_id=news.id,
                display_order=order * 10,
                is_enabled=True,
            ))
    await db.flush()


__all__ = ["seed_vice_chancellor_hub"]
