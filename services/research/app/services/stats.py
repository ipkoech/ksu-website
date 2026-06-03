"""Public-safe aggregate stats for the research landing page."""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import (
    Grant,
    Innovation,
    Partner,
    Publication,
    ResearchArticle,
    ResearchCenter,
    ResearchEvent,
    ResearchNews,
    ResearchOutput,
    ResearchProject,
)
from ..schemas.stats import PublicStatItem, PublicStatsResponse


async def _count(db: AsyncSession, model, *conditions) -> int:
    result = await db.execute(
        select(func.count(model.id)).where(model.deleted_at.is_(None), *conditions)
    )
    return int(result.scalar_one() or 0)


def _item(
    key: str,
    label: str,
    value: int,
    description: str,
    href: str | None = None,
    suffix: str = "",
) -> PublicStatItem:
    return PublicStatItem(
        key=key,
        label=label,
        value=value,
        suffix=suffix,
        description=description,
        href=href,
    )


async def public_research_stats(db: AsyncSession) -> PublicStatsResponse:
    published_updates = sum(
        [
            await _count(
                db,
                ResearchNews,
                ResearchNews.is_active.is_(True),
                ResearchNews.status == "published",
            ),
            await _count(
                db,
                ResearchArticle,
                ResearchArticle.is_active.is_(True),
                ResearchArticle.status == "published",
            ),
            await _count(
                db,
                ResearchEvent,
                ResearchEvent.is_active.is_(True),
                ResearchEvent.status.in_(("upcoming", "ongoing", "completed")),
            ),
        ]
    )
    outputs = sum(
        [
            await _count(
                db,
                Innovation,
                Innovation.is_active.is_(True),
                Innovation.is_public.is_(True),
                Innovation.status == "active",
            ),
            await _count(
                db,
                ResearchOutput,
                ResearchOutput.is_active.is_(True),
                ResearchOutput.status == "published",
            ),
        ]
    )

    return PublicStatsResponse(
        scope="research",
        title="Research at a glance",
        stats=[
            _item(
                "research_centres",
                "Research Centres",
                await _count(db, ResearchCenter, ResearchCenter.is_active.is_(True)),
                "Active research centres and institutes",
                "/research/centres",
            ),
            _item(
                "research_projects",
                "Research Projects",
                await _count(
                    db,
                    ResearchProject,
                    ResearchProject.is_active.is_(True),
                    ResearchProject.is_public.is_(True),
                    ResearchProject.status.in_(("approved", "ongoing", "completed")),
                ),
                "Active public research projects",
                "/research/projects",
            ),
            _item(
                "publications",
                "Publications",
                await _count(
                    db,
                    Publication,
                    Publication.is_active.is_(True),
                    Publication.status == "published",
                ),
                "Published research publications",
                "/research/publications",
            ),
            _item(
                "open_access_publications",
                "Open Access",
                await _count(
                    db,
                    Publication,
                    Publication.is_active.is_(True),
                    Publication.status == "published",
                    Publication.is_open_access.is_(True),
                ),
                "Published open-access publications",
                "/research/publications?access=open",
            ),
            _item(
                "partners",
                "Research Partners",
                await _count(
                    db,
                    Partner,
                    Partner.is_active.is_(True),
                    Partner.status == "active",
                ),
                "Active research partners",
                "/research/partners",
            ),
            _item(
                "funding_opportunities",
                "Funding Opportunities",
                await _count(
                    db,
                    Grant,
                    Grant.is_active.is_(True),
                    Grant.status == "open",
                ),
                "Active public grant and funding opportunities",
                "/research/grants",
            ),
            _item(
                "research_outputs",
                "Research Outputs",
                outputs,
                "Public innovations and published research outputs",
                "/research/outputs",
            ),
            _item(
                "research_updates",
                "Research Updates",
                published_updates,
                "Published research news, articles, and events",
                "/research/news",
            ),
        ],
    )
