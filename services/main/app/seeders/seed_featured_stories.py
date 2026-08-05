"""Seed homepage featured stories from official published news records."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import News, Story

from ._shared import SeedContext
from .seed_vice_chancellor_hub import (
    VC_SEED_NOTE,
    VC_SEED_OWNER,
    VC_SEED_VERSION,
    _is_seed_owned,
)


FEATURED_STORY_SPECS = (
    {
        "source_news_slug": "he-the-president-officially-laid-the-foundation-stone-for-nyamira-university-college",
        "slug": "expanding-access-through-nyamira-university-college",
        "title": "Expanding access through Nyamira University College",
        "story_type": "impact",
        "category": "Institutional growth",
        "homepage_priority": 10,
    },
    {
        "source_news_slug": "day-4-of-kisii-university-innovation-week",
        "slug": "ideas-in-action-at-kisii-university-innovation-week",
        "title": "Ideas in action at Kisii University Innovation Week",
        "story_type": "innovation",
        "category": "Research and innovation",
        "homepage_priority": 20,
    },
    {
        "source_news_slug": "15th-graduation-ceremony-2026",
        "slug": "celebrating-kisii-universitys-class-of-2026",
        "title": "Celebrating Kisii University's Class of 2026",
        "story_type": "community",
        "category": "Graduation",
        "homepage_priority": 30,
    },
    {
        "source_news_slug": "kuccps-portal-is-now-open-for-undergraduate-programmes",
        "slug": "your-next-chapter-at-kisii-university",
        "title": "Your next chapter at Kisii University",
        "story_type": "student",
        "category": "Admissions",
        "homepage_priority": 40,
    },
)


async def seed_featured_stories(db: AsyncSession, ctx: SeedContext) -> None:
    """Create seed-owned homepage stories from official published news."""
    del ctx
    now = datetime.now(timezone.utc)
    source_slugs = [str(spec["source_news_slug"]) for spec in FEATURED_STORY_SPECS]
    source_news = (
        await db.execute(
            select(News).where(
                News.slug.in_(source_slugs),
                News.deleted_at.is_(None),
                News.is_public.is_(True),
                News.is_published.is_(True),
            )
        )
    ).scalars().all()
    news_by_slug = {item.slug: item for item in source_news}

    for spec in FEATURED_STORY_SPECS:
        news = news_by_slug.get(str(spec["source_news_slug"]))
        if news is None:
            continue
        story = (
            await db.execute(select(Story).where(Story.slug == spec["slug"]))
        ).scalar_one_or_none()
        if story is not None and not _is_seed_owned(story.structured_content):
            continue
        if story is None:
            story = Story(title=spec["title"], slug=spec["slug"])
            db.add(story)

        source_metadata = news.structured_content or {}
        story.title = str(spec["title"])
        story.summary = news.summary
        story.plain_text = news.plain_text
        story.rich_text = news.rich_text
        story.structured_content = {
            "seed": {"owner": VC_SEED_OWNER, "version": VC_SEED_VERSION},
            "source_type": "official_news",
            "source_news_id": str(news.id),
            "source_news_slug": news.slug,
            "source_url": source_metadata.get("source_url"),
        }
        story.related_links = news.related_links
        story.featured_media_id = news.featured_media_id
        story.story_type = str(spec["story_type"])
        story.category = str(spec["category"])
        story.source_type = "official_news"
        story.contributor_name_snapshot = "Kisii University"
        story.show_contributor_name = True
        story.consent_to_publish = True
        story.is_featured = True
        story.featured_until = None
        story.homepage_priority = int(spec["homepage_priority"])
        story.reading_minutes = 2
        story.meta_title = str(spec["title"])
        story.meta_description = news.summary
        story.scope_type = "university"
        story.scope_id = None
        story.is_main = True
        story.is_public = True
        story.is_published = True
        story.status = "published"
        story.workflow_status = "published"
        story.owner_portal = "cocms"
        story.published_at = news.published_at or now
        story.valid_from = news.valid_from or news.published_at or now
        story.valid_to = None
        story.approved_at = story.approved_at or now
        story.revision_notes = VC_SEED_NOTE
        await db.flush()


__all__ = ["FEATURED_STORY_SPECS", "seed_featured_stories"]
