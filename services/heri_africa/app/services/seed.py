from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.content import NewsArticle, PublicationStatus, SiteSettings


async def seed_heri(db: AsyncSession) -> None:
    site = (await db.execute(select(SiteSettings).limit(1))).scalars().first()
    if site is None:
        db.add(
            SiteSettings(
                name="HERI Africa",
                tagline="Advancing language education and foundational literacy across Africa",
                contact={"email": "heri-language@kisiiuniversity.ac.ke", "phone": "+254 796 123 456"},
                social_links={},
                seo_defaults={"title": "HERI Africa", "description": "Africa-led language education research."},
            )
        )

    article = (await db.execute(select(NewsArticle).where(NewsArticle.slug == "heri-africa-launch"))).scalars().first()
    if article is None:
        db.add(
            NewsArticle(
                slug="heri-africa-launch",
                title="HERI Africa launches an Africa-led language education research platform",
                excerpt="Research, partnerships, and practical evidence for language education across Africa.",
                body="HERI Africa is hosted by Kisii University and connects researchers, educators, and partners.",
                status=PublicationStatus.PUBLISHED,
            )
        )
