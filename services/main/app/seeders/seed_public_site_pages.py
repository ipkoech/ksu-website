"""Seed source-backed official-site pages crawled from kisiiuniversity.ac.ke."""

from __future__ import annotations

import hashlib
import uuid
from urllib.parse import urlparse

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import PublicSitePage

from ._shared import SeedContext
from .live_site_page_updates_20260914 import (
    LIVE_SITE_PAGE_UPDATES_20260914,
    LIVE_SITE_UNAVAILABLE_SOURCE_URLS_20260914,
)
from .live_site_snapshot import LIVE_SITE_PAGES
from .live_site_page_updates_20260908 import LIVE_SITE_PAGE_UPDATES_20260908
from .live_site_event_updates_20260914 import LIVE_SITE_EVENT_UPDATES_20260914
from .live_staff_profile_updates_20260810 import LIVE_STAFF_PROFILE_UPDATES
from .live_site_updates_20260810 import LIVE_SITE_NEWS_UPDATES
from .live_site_updates_20260908 import LIVE_SITE_EVENT_UPDATES_20260908, LIVE_SITE_NEWS_UPDATES_20260908
from .live_site_updates_20260914 import LIVE_SITE_NEWS_UPDATES_20260914


TITLE_MAX_LENGTH = 255
SLUG_MAX_LENGTH = 255


def _bounded_text(value: object, max_length: int) -> str:
    text = str(value).strip()
    if len(text) <= max_length:
        return text
    return text[:max_length].rstrip()


def _bounded_slug(value: object, source_url: object) -> str:
    slug = str(value).strip()
    if len(slug) <= SLUG_MAX_LENGTH:
        return slug
    digest = hashlib.sha1(str(source_url).encode("utf-8")).hexdigest()[:12]
    suffix = f"-{digest}"
    return f"{slug[: SLUG_MAX_LENGTH - len(suffix)].rstrip('-')}{suffix}"


def _current_content_pages() -> list[dict[str, object]]:
    """Expose current typed content updates in the source-page archive too."""
    pages: list[dict[str, object]] = []
    current_news_updates = [
        *LIVE_SITE_NEWS_UPDATES_20260914,
        *LIVE_SITE_NEWS_UPDATES_20260908,
        *LIVE_SITE_NEWS_UPDATES,
    ]
    for index, spec in enumerate(current_news_updates, start=2000):
        source_url = str(spec["source_url"])
        path = urlparse(source_url).path or "/"
        text = str(spec.get("plain_text") or spec.get("summary") or "").strip()
        pages.append(
            {
                "title": spec["title"],
                "slug": path.strip("/").replace("/", "-") or "home",
                "path": path,
                "page_type": "blog",
                "summary": spec.get("summary"),
                "plain_text": text,
                "headings": [spec["title"]],
                "links": spec.get("related_links") or [],
                "images": [
                    *(
                        [{"url": spec["source_image_url"], "alt": spec["title"]}]
                        if spec.get("source_image_url")
                        else []
                    ),
                    *[
                        {"url": image_url, "alt": spec["title"]}
                        for image_url in spec.get("gallery_image_urls", [])
                        if image_url and image_url != spec.get("source_image_url")
                    ],
                ],
                "source_url": source_url,
                "source_hash": hashlib.sha256(text.encode("utf-8")).hexdigest(),
                "display_order": index,
            }
        )
    current_event_updates = [
        *LIVE_SITE_EVENT_UPDATES_20260914,
        *LIVE_SITE_EVENT_UPDATES_20260908,
    ]
    for index, spec in enumerate(current_event_updates, start=2100):
        source_url = str(spec["source_url"])
        path = urlparse(source_url).path or "/"
        text = str(spec.get("plain_text") or spec.get("summary") or "").strip()
        pages.append(
            {
                "title": spec["title"],
                "slug": path.strip("/").replace("/", "-") or "home",
                "path": path,
                "page_type": "event",
                "summary": spec.get("summary"),
                "plain_text": text,
                "headings": [spec["title"]],
                "links": spec.get("related_links") or [],
                "images": (
                    [{"url": spec["source_image_url"], "alt": spec["title"]}]
                    if spec.get("source_image_url")
                    else []
                ),
                "source_url": source_url,
                "source_hash": hashlib.sha256(text.encode("utf-8")).hexdigest(),
                "display_order": index,
            }
        )
    for index, spec in enumerate(LIVE_STAFF_PROFILE_UPDATES, start=2200):
        source_url = str(spec["source_url"])
        path = str(spec["path"])
        text = str(spec.get("plain_text") or "").strip()
        pages.append(
            {
                "title": spec["title"],
                "slug": path.strip("/").replace("/", "-") or "home",
                "path": path,
                "page_type": spec.get("page_type", "profile"),
                "summary": None,
                "plain_text": text,
                "headings": spec.get("headings") or [],
                "links": spec.get("links") or [],
                "images": spec.get("images") or [],
                "source_url": source_url,
                "source_hash": hashlib.sha256(text.encode("utf-8")).hexdigest(),
                "display_order": index,
            }
        )
    pages.extend(LIVE_SITE_PAGE_UPDATES_20260914)
    return pages


async def seed_public_site_pages(db: AsyncSession, ctx: SeedContext) -> None:
    del ctx

    active_source_urls: set[str] = set()
    source_pages = [
        *_current_content_pages(),
        *LIVE_SITE_PAGE_UPDATES_20260908,
        *LIVE_SITE_PAGES,
    ]
    seen_source_urls: set[str] = set()
    for spec in source_pages:
        if str(spec["source_url"]) in seen_source_urls:
            continue
        seen_source_urls.add(str(spec["source_url"]))
        source_url = str(spec["source_url"])
        if source_url in LIVE_SITE_UNAVAILABLE_SOURCE_URLS_20260914:
            continue
        active_source_urls.add(source_url)
        page = (
            await db.execute(select(PublicSitePage).where(PublicSitePage.source_url == source_url))
        ).scalar_one_or_none()
        payload = {
            "title": _bounded_text(spec["title"], TITLE_MAX_LENGTH),
            "slug": _bounded_slug(spec["slug"], spec["source_url"]),
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
