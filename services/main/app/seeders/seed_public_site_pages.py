"""Seed generic official-site pages crawled from kisiiuniversity.ac.ke."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import PublicSitePage

from ._shared import SeedContext
from .live_site_snapshot import LIVE_SITE_PAGES


async def seed_public_site_pages(db: AsyncSession, ctx: SeedContext) -> None:
    del ctx

    active_source_urls: set[str] = set()
    for spec in LIVE_SITE_PAGES:
        active_source_urls.add(str(spec["source_url"]))
        page = (
            await db.execute(select(PublicSitePage).where(PublicSitePage.source_url == spec["source_url"]))
        ).scalar_one_or_none()
        payload = {
            "title": spec["title"],
            "slug": spec["slug"],
            "path": spec["path"],
            "page_type": spec["page_type"],
            "summary": spec.get("summary"),
            "plain_text": spec.get("plain_text"),
            "headings": spec.get("headings"),
            "links": spec.get("links"),
            "images": spec.get("images"),
            "source_url": spec["source_url"],
            "source_hash": spec["source_hash"],
            "is_public": True,
            "status": "published",
            "display_order": spec["display_order"],
        }
        if page is None:
            page = PublicSitePage(id=uuid.uuid4(), **payload)
            db.add(page)
        else:
            for field_name, value in payload.items():
                setattr(page, field_name, value)
        await db.flush()

    existing_pages = (await db.execute(select(PublicSitePage))).scalars().all()
    for page in existing_pages:
        if page.source_url not in active_source_urls:
            page.status = "archived"
            page.is_public = False
