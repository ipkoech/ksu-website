"""Seed recent Vice Chancellor activities from the official university website."""

from __future__ import annotations

import hashlib
import html
import mimetypes
from pathlib import PurePosixPath
from typing import Any
from urllib.parse import urlparse

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Media, MediaLink, News, PageSection, SectionItem

from ._shared import SeedContext
from .live_site_snapshot import LIVE_SITE_NEWS_ITEMS, LIVE_SITE_PAGES


VC_ACTIVITY_SLUGS = (
    "kmfri-ceo-dr-paul-orina-pays-courtesy-call-to-vice-chancellor",
    "ksu-vice-chancellor-joins-nyamira-county-governor-to-celebrate-vocational-training-graduates",
    "ksu-top-achievers-dinner",
    "ksu-vc-presides-over-the-aicad-technical-committee-meeting-in-arusha-tanzania",
)


def _record_slug(record: dict[str, Any], key: str) -> str:
    value = str(record.get(key) or "").rstrip("/")
    return value.rsplit("/", 1)[-1]


def _activity_specs() -> list[dict[str, Any]]:
    news_by_slug = {
        _record_slug(record, "source_url"): record
        for record in LIVE_SITE_NEWS_ITEMS
        if record.get("source_url")
    }
    pages_by_slug = {
        _record_slug(record, "path"): record
        for record in LIVE_SITE_PAGES
        if record.get("path")
    }

    specs: list[dict[str, Any]] = []
    for slug in VC_ACTIVITY_SLUGS:
        news = news_by_slug.get(slug)
        if news is None:
            continue
        page = pages_by_slug.get(slug) or {}
        image_urls = [
            str(image["url"])
            for image in page.get("images", [])
            if isinstance(image, dict)
            and image.get("url")
            and "/logo/" not in str(image["url"])
        ]
        cover_url = str(news.get("source_image_url") or "")
        if cover_url and cover_url not in image_urls:
            image_urls.insert(0, cover_url)
        specs.append({**news, "slug": slug, "image_urls": image_urls})
    return specs


def _summary(value: str, limit: int = 300) -> str:
    text = " ".join(value.split())
    if len(text) <= limit:
        return text
    shortened = text[: max(1, limit - 1)].rsplit(" ", 1)[0].rstrip(" ,.;:")
    return f"{shortened}."[:limit]


def _rich_text(value: str) -> str:
    return f"<p>{html.escape(' '.join(value.split()))}</p>"


def _remote_filename(url: str) -> str:
    filename = PurePosixPath(urlparse(url).path).name
    return filename or f"ksu-vc-activity-{hashlib.sha256(url.encode()).hexdigest()[:12]}.jpg"


async def _upsert_remote_image(
    db: AsyncSession,
    *,
    url: str,
    title: str,
    source_url: str,
    image_number: int,
) -> Media:
    media = (
        await db.execute(
            select(Media)
            .where(or_(Media.storage_path == url, Media.public_url == url))
            .order_by(Media.created_at.asc())
        )
    ).scalars().first()
    filename = _remote_filename(url)
    mime_type = mimetypes.guess_type(filename)[0] or "image/jpeg"
    payload = {
        "filename": filename,
        "original_filename": filename,
        "mime_type": mime_type,
        "file_size": 0,
        "file_hash": hashlib.sha256(url.encode("utf-8")).hexdigest(),
        "storage_provider": "remote",
        "storage_path": url,
        "public_url": url,
        "cdn_url": None,
        "title": title,
        "alt_text": f"{title} — official Kisii University activity image {image_number}",
        "description": f"Official Kisii University image accompanying {title}.",
        "caption": None,
        "tags": ["kisii-university", "vice-chancellor", "leadership-activity"],
        "credit": "Kisii University",
        "media_type": "image",
        "thumbnail_url": url,
        "is_public": True,
        "is_processed": True,
        "extra_metadata": {
            "source": "kisiiuniversity.ac.ke",
            "source_url": source_url,
        },
    }
    if media is None:
        media = Media(**payload)
        db.add(media)
    else:
        existing_media_payload = {
            "public_url": url,
            "title": title,
            "alt_text": payload["alt_text"],
            "description": payload["description"],
            "tags": payload["tags"],
            "credit": payload["credit"],
            "media_type": "image",
            "thumbnail_url": media.thumbnail_url or url,
            "is_public": True,
            "is_processed": True,
            "extra_metadata": payload["extra_metadata"],
        }
        for field_name, value in existing_media_payload.items():
            setattr(media, field_name, value)
    await db.flush()
    return media


async def _upsert_media_link(
    db: AsyncSession,
    *,
    media: Media,
    news: News,
    role: str,
    display_order: int,
) -> None:
    link = (
        await db.execute(
            select(MediaLink).where(
                MediaLink.media_id == media.id,
                MediaLink.entity_type == "news",
                MediaLink.entity_id == news.id,
                MediaLink.role == role,
            )
        )
    ).scalar_one_or_none()
    payload = {
        "media_id": media.id,
        "entity_type": "news",
        "entity_id": news.id,
        "role": role,
        "display_order": display_order,
        "is_public": True,
        "is_published": True,
        "published_at": news.published_at,
        "status": "published",
        "workflow_status": "published",
    }
    if link is None:
        db.add(MediaLink(**payload))
    else:
        for field_name, value in payload.items():
            setattr(link, field_name, value)
    await db.flush()


async def _upsert_activity(db: AsyncSession, spec: dict[str, Any], display_order: int) -> News:
    title = str(spec["title"])
    slug = str(spec["slug"])
    body = str(spec.get("plain_text") or spec.get("summary") or "")
    source_url = str(spec["source_url"])
    published_at = spec["published_at"]
    image_urls = list(dict.fromkeys(str(url) for url in spec.get("image_urls", []) if url))
    if not image_urls:
        raise ValueError(f"Official VC activity has no source image: {slug}")

    cover = await _upsert_remote_image(
        db,
        url=image_urls[0],
        title=title,
        source_url=source_url,
        image_number=1,
    )
    news = (await db.execute(select(News).where(News.slug == slug))).scalar_one_or_none()
    payload = {
        "title": title,
        "slug": slug,
        "summary": _summary(body),
        "plain_text": body,
        "rich_text": _rich_text(body),
        "structured_content": {
            "source_url": source_url,
            "source_channel": "official_website",
            "activity_owner": "vice_chancellor",
        },
        "related_links": [{"label": "Original Kisii University story", "url": source_url}],
        "featured_media_id": cover.id,
        "meta_title": title,
        "meta_description": _summary(body, 500),
        "keywords": {"tags": ["kisii university", "vice chancellor", "leadership"]},
        "scope_type": "university",
        "scope_id": None,
        "is_main": True,
        "is_public": True,
        "is_published": True,
        "published_at": published_at,
        "valid_from": published_at,
        "status": "published",
        "workflow_status": "published",
        "approved_at": published_at,
        "is_featured": False,
        "display_order": display_order,
    }
    if news is None:
        news = News(**payload)
        db.add(news)
    else:
        for field_name, value in payload.items():
            setattr(news, field_name, value)
    await db.flush()

    await _upsert_media_link(db, media=cover, news=news, role="cover-image", display_order=1)
    for index, image_url in enumerate(image_urls[1:], start=2):
        image = await _upsert_remote_image(
            db,
            url=image_url,
            title=title,
            source_url=source_url,
            image_number=index,
        )
        await _upsert_media_link(
            db,
            media=image,
            news=news,
            role="gallery",
            display_order=index,
        )
    return news


async def seed_vc_activities(db: AsyncSession, ctx: SeedContext) -> None:
    """Create official VC stories and replace only unlinked homepage placeholders."""
    del ctx

    activities = [
        await _upsert_activity(db, spec, display_order=10 + index * 10)
        for index, spec in enumerate(_activity_specs())
    ]
    section = (
        await db.execute(
            select(PageSection)
            .options(selectinload(PageSection.items))
            .where(
                PageSection.page_key == "homepage",
                PageSection.section_key == "leadership-activity",
                PageSection.deleted_at.is_(None),
            )
        )
    ).scalars().first()
    if section is None or not activities:
        return

    section.title = "Leadership in action"
    has_curated_links = any(
        isinstance(item.content, dict)
        and item.content.get("linked_content_type")
        and item.content.get("linked_content_id")
        for item in section.items
    )
    if has_curated_links:
        for item in section.items:
            if not isinstance(item.content, dict):
                continue
            if not item.content.get("linked_content_type"):
                continue
            item.content = {
                **item.content,
                "activity_context": "leadership-activity",
            }
        await db.flush()
        return

    section.items = [
        SectionItem(
            item_type="card",
            title=activity.title,
            content={
                "linked_content_type": "news",
                "linked_content_id": str(activity.id),
                "activity_context": "leadership-activity",
            },
            media_alt_text=f"{activity.title} cover image",
            display_order=10 + index * 10,
            is_enabled=True,
        )
        for index, activity in enumerate(activities)
    ]
    await db.flush()


__all__ = ["VC_ACTIVITY_SLUGS", "seed_vc_activities"]
