"""Seed source-backed public content for the main website."""

from __future__ import annotations

import hashlib
import mimetypes
import re
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Blog, Event, Media, News, Slider, SliderGroup
from app.schemas.base import slugify

from ._shared import SeedContext
from .live_site_snapshot import LIVE_SITE_BLOG_ITEMS, LIVE_SITE_EVENT_ITEMS, LIVE_SITE_NEWS_ITEMS
from .live_site_snapshot import LIVE_SITE_PAGES
from .live_site_updates_20260810 import LIVE_SITE_BLOG_UPDATES, LIVE_SITE_EVENT_UPDATES, LIVE_SITE_NEWS_UPDATES
from .live_site_event_updates_20260914 import LIVE_SITE_EVENT_UPDATES_20260914
from .live_site_updates_20260908 import LIVE_SITE_EVENT_UPDATES_20260908, LIVE_SITE_NEWS_UPDATES_20260908
from .live_site_updates_20260914 import LIVE_SITE_NEWS_UPDATES_20260914


EAT = ZoneInfo("Africa/Nairobi")
ASSET_ROOT = Path(__file__).resolve().parent / "assets" / "content"
SEO_DESCRIPTION_MAX_LENGTH = 500


def _seo_description(value: object) -> str | None:
    if value is None:
        return None
    description = str(value).strip()
    if len(description) <= SEO_DESCRIPTION_MAX_LENGTH:
        return description
    return description[:SEO_DESCRIPTION_MAX_LENGTH].rstrip()


_BLOG_DATE_RE = re.compile(
    r"Posted\s+on\s+([A-Za-z]{3,9}\s+\d{1,2},?\s*\d{4})\s+by\s+([^\s]+)",
    re.IGNORECASE,
)


def _snapshot_blog_specs() -> list[dict[str, object]]:
    """Promote captured official blog pages into the typed Blog model.

    The crawl text is noisy because it includes the legacy site's shared
    chrome.  Only the segment after the page's published marker and before
    the support widget is used as article text.  Missing/ambiguous content is
    left empty instead of being replaced with generated prose.
    """
    specs: list[dict[str, object]] = []
    for page in LIVE_SITE_PAGES:
        if page.get("page_type") != "blog":
            continue
        raw_text = str(page.get("plain_text") or "").strip()
        match = _BLOG_DATE_RE.search(raw_text)
        if match is None:
            continue
        date_text = re.sub(r"\s+", " ", match.group(1).replace(",", ", ").strip())
        published_at = None
        for fmt in ("%b %d, %Y", "%B %d, %Y"):
            try:
                published_at = datetime.strptime(date_text, fmt).replace(tzinfo=EAT)
                break
            except ValueError:
                pass
        if published_at is None:
            continue

        body = raw_text[match.end():]
        body = re.split(r"\s+mode_comment\s+close\s+Kisii University Support\b", body, maxsplit=1)[0]
        body = re.sub(r"\s+", " ", body).strip()
        category = body.split(" ", 1)[0] if body and body.split(" ", 1)[0].isupper() else None
        if category:
            body = body[len(category):].strip()
        image_url = next(
            (
                str(image.get("url"))
                for image in (page.get("images") or [])
                if isinstance(image, dict)
                and str(image.get("url") or "").startswith("http")
                and "data:" not in str(image.get("url"))
                and "/logo/" not in str(image.get("url"))
            ),
            None,
        )
        specs.append(
            {
                "title": str(page["title"]).strip(),
                "summary": body[:SEO_DESCRIPTION_MAX_LENGTH] or None,
                "plain_text": body or None,
                "rich_text": f"<p>{body}</p>" if body else None,
                "excerpt": body[:SEO_DESCRIPTION_MAX_LENGTH] or None,
                "published_at": published_at,
                "source_url": page["source_url"],
                "source_image_url": image_url,
                "is_featured": False,
                "display_order": int(page.get("display_order") or 100),
                "category": category,
            }
        )
    return specs


def _snapshot_dated_event_specs() -> list[dict[str, object]]:
    """Promote only event pages whose source text gives an explicit date."""
    dated_events = {
        "/event/colloquium-on-climate-change-challenges": (
            datetime(2024, 5, 30, 8, 0, tzinfo=EAT),
            datetime(2024, 5, 30, 17, 0, tzinfo=EAT),
            "Kisii University Amphitheatre",
        ),
        "/event/multidisciplinary-conference": (
            datetime(2024, 9, 10, 8, 0, tzinfo=EAT),
            datetime(2024, 9, 12, 17, 0, tzinfo=EAT),
            "Kisii University",
        ),
        "/event/planting-3000-trees-nyosia-farm": (
            datetime(2024, 5, 31, 8, 0, tzinfo=EAT),
            datetime(2024, 5, 31, 17, 0, tzinfo=EAT),
            "Nyosia Farm",
        ),
    }
    specs: list[dict[str, object]] = []
    for page in LIVE_SITE_PAGES:
        path = str(page.get("path"))
        if page.get("page_type") != "event" or path not in dated_events:
            continue
        raw_text = str(page.get("plain_text") or "").strip()
        body = raw_text.split("Event Details:", 1)[-1]
        body = body.split("Log in", 1)[0]
        body = re.sub(r"\s+", " ", body).strip()
        image_url = next(
            (
                str(image.get("url"))
                for image in (page.get("images") or [])
                if isinstance(image, dict)
                and str(image.get("url") or "").startswith("http")
                and "data:" not in str(image.get("url"))
            ),
            None,
        )
        start_date, end_date, location = dated_events[path]
        specs.append(
            {
                "title": str(page["title"]).replace(" - Kisii University", "").strip(),
                "summary": body[:SEO_DESCRIPTION_MAX_LENGTH] or None,
                "plain_text": body or None,
                "rich_text": f"<p>{body}</p>" if body else None,
                "start_date": start_date,
                "end_date": end_date,
                "location": location,
                "source_url": page["source_url"],
                "source_image_url": image_url,
                "is_featured": False,
                "display_order": int(page.get("display_order") or 100),
            }
        )
    return specs


# The legacy hand-written content block was removed. All seeded public content is source-backed.


HOMEPAGE_SLIDER_GROUP = {
    "name": "Homepage Hero",
    "slug": "homepage-hero",
    "location": "home.hero",
    "is_main": True,
    "is_public": True,
    "is_active": True,
    "max_slides": 3,
    "auto_play": True,
    "auto_play_duration": 7000,
    "show_navigation_dots": True,
    "show_arrows": True,
    "transition_effect": "fade",
}



def _asset_metadata(asset_filename: str) -> tuple[Path, str, int, str]:
    path = ASSET_ROOT / asset_filename
    if not path.exists():
        raise FileNotFoundError(f"Missing content asset: {path}")

    mime_type, _ = mimetypes.guess_type(path.name)
    mime_type = mime_type or "application/octet-stream"
    file_size = path.stat().st_size
    file_hash = hashlib.sha256(path.read_bytes()).hexdigest()
    return path, mime_type, file_size, file_hash


async def _upsert_media(
    db: AsyncSession,
    *,
    asset_filename: str | None = None,
    title: str,
    alt_text: str,
    source_image_url: str,
    tags: list[str],
) -> Media:
    if asset_filename:
        path, mime_type, file_size, file_hash = _asset_metadata(asset_filename)
        storage_path = str(path.relative_to(Path.cwd()))
        filename = path.name
        storage_provider = "local"
    else:
        mime_type, _ = mimetypes.guess_type(source_image_url)
        mime_type = mime_type or "image/jpeg"
        file_size = 0
        file_hash = hashlib.sha256(source_image_url.encode("utf-8")).hexdigest()
        filename = source_image_url.rstrip("/").rsplit("/", 1)[-1] or f"{slugify(title)}.jpg"
        storage_path = source_image_url
        storage_provider = "remote"

    media = (
        await db.execute(select(Media).where(Media.storage_path == storage_path))
    ).scalar_one_or_none()

    payload = {
        "filename": filename,
        "original_filename": filename,
        "mime_type": mime_type,
        "file_size": file_size,
        "file_hash": file_hash,
        "storage_provider": storage_provider,
        "storage_path": storage_path,
        "public_url": source_image_url,
        "title": title,
        "alt_text": alt_text,
        "description": f"Downloaded source-backed content image for {title}.",
        "tags": tags,
        "credit": "Kisii University",
        "media_type": "image",
        "is_public": True,
        "is_processed": True,
        "extra_metadata": {
            "source": "kisiiuniversity.ac.ke",
            "seed_asset": asset_filename is not None,
        },
    }

    if media is None:
        media = Media(**payload)
        db.add(media)
    else:
        for field_name, value in payload.items():
            setattr(media, field_name, value)

    await db.flush()
    return media


async def _upsert_news(db: AsyncSession, spec: dict[str, object], media: Media | None) -> None:
    slug = slugify(spec["title"])
    item = (await db.execute(select(News).where(News.slug == slug))).scalar_one_or_none()
    payload = {
        "title": spec["title"],
        "slug": slug,
        "summary": spec["summary"],
        "plain_text": spec["plain_text"],
        "rich_text": spec.get("rich_text") or f"<p>{spec['plain_text']}</p>",
        "structured_content": {
            "source_url": spec["source_url"],
            "source_channel": "official_website",
            "gallery_image_urls": spec.get("gallery_image_urls", []),
            "official_category": spec.get("category"),
        },
        "related_links": spec.get("related_links") or [{"label": "Official Kisii University source", "url": spec["source_url"]}],
        "featured_media_id": media.id if media is not None else None,
        "author_user_id": None,
        "meta_title": spec["title"],
        "meta_description": _seo_description(spec["summary"]),
        "keywords": {"tags": ["kisii university", "news", "public website"]},
        "scope_type": "university",
        "scope_id": None,
        "is_main": True,
        "is_public": True,
        "is_published": True,
        "published_at": spec["published_at"],
        "valid_from": spec["published_at"],
        "valid_to": None,
        "archived_at": None,
        "status": "published",
        "display_order": spec["display_order"],
        "is_featured": spec.get("is_featured", False),
    }
    if item is None:
        item = News(**payload)
        db.add(item)
    else:
        for field_name, value in payload.items():
            setattr(item, field_name, value)
    await db.flush()


async def _upsert_blog(db: AsyncSession, spec: dict[str, object], media: Media | None) -> None:
    slug = slugify(spec["title"])
    source_url = str(spec["source_url"])
    item = (
        await db.execute(
            select(Blog).where(Blog.structured_content["source_url"].astext == source_url)
        )
    ).scalar_one_or_none()
    if item is None:
        item = (await db.execute(select(Blog).where(Blog.slug == slug))).scalar_one_or_none()
        if item is not None:
            existing_source = (item.structured_content or {}).get("source_url")
            if existing_source and str(existing_source) != source_url:
                item = None
    if item is None:
        slug_owner = (await db.execute(select(Blog).where(Blog.slug == slug))).scalar_one_or_none()
        if slug_owner is not None:
            slug = f"{slug}-{hashlib.sha1(source_url.encode('utf-8')).hexdigest()[:10]}"
    payload = {
        "title": spec["title"],
        "slug": slug,
        "summary": spec["summary"],
        "excerpt": spec.get("excerpt") or spec["summary"],
        "plain_text": spec["plain_text"],
        "rich_text": spec.get("rich_text") or f"<p>{spec['plain_text']}</p>",
        "structured_content": {
            "source_url": spec["source_url"],
            "source_channel": "official_website",
            "gallery_image_urls": spec.get("gallery_image_urls", []),
        },
        "related_links": spec.get("related_links") or [{"label": "Official Kisii University source", "url": spec["source_url"]}],
        "featured_media_id": media.id if media is not None else None,
        "author_user_id": None,
        "meta_title": spec["title"],
        "meta_description": _seo_description(spec["summary"]),
        "keywords": {"tags": ["kisii university", "blog", "research", "innovation"]},
        "scope_type": "university",
        "scope_id": None,
        "is_main": True,
        "is_public": True,
        "is_published": True,
        "published_at": spec["published_at"],
        "valid_from": spec["published_at"],
        "valid_to": None,
        "archived_at": None,
        "status": "published",
        "display_order": spec["display_order"],
        "is_featured": spec.get("is_featured", False),
    }
    if item is None:
        item = Blog(**payload)
        db.add(item)
    else:
        for field_name, value in payload.items():
            setattr(item, field_name, value)
    await db.flush()


async def _upsert_event(db: AsyncSession, spec: dict[str, object], media: Media | None) -> None:
    slug = slugify(spec["title"])
    source_url = str(spec["source_url"])
    item = (
        await db.execute(
            select(Event).where(Event.structured_content["source_url"].astext == source_url)
        )
    ).scalar_one_or_none()
    if item is None:
        item = (await db.execute(select(Event).where(Event.slug == slug))).scalar_one_or_none()
        if item is not None:
            existing_source = (item.structured_content or {}).get("source_url")
            if existing_source and str(existing_source) != source_url:
                item = None
    if item is None:
        slug_owner = (await db.execute(select(Event).where(Event.slug == slug))).scalar_one_or_none()
        if slug_owner is not None:
            slug = f"{slug}-{hashlib.sha1(source_url.encode('utf-8')).hexdigest()[:10]}"
    payload = {
        "title": spec["title"],
        "slug": slug,
        "summary": spec["summary"],
        "plain_text": spec["plain_text"],
        "rich_text": spec.get("rich_text") or f"<p>{spec['plain_text']}</p>",
        "structured_content": {
            "source_url": spec["source_url"],
            "source_channel": "official_website",
            "registration_url": spec.get("registration_url"),
        },
        "start_date": spec["start_date"],
        "end_date": spec["end_date"],
        "location": spec["location"],
        "is_virtual": False,
        "meeting_link": None,
        "is_featured": spec["is_featured"],
        "featured_media_id": media.id if media is not None else None,
        "author_user_id": None,
        "related_links": spec.get("related_links") or [
            {"label": "Official Kisii University source", "url": spec["source_url"]},
            *(
                [{"label": "Conference information", "url": spec["registration_url"]}]
                if spec.get("registration_url")
                else []
            ),
        ],
        "meta_title": spec["title"],
        "meta_description": _seo_description(spec["summary"]),
        "keywords": {"tags": ["kisii university", "event", "public website"]},
        "scope_type": "university",
        "scope_id": None,
        "is_main": True,
        "is_public": True,
        "is_published": True,
        "published_at": spec["start_date"],
        "valid_from": spec["start_date"],
        "valid_to": spec["end_date"],
        "archived_at": None,
        "status": "published",
        "display_order": spec["display_order"],
    }
    if item is None:
        item = Event(**payload)
        db.add(item)
    else:
        for field_name, value in payload.items():
            setattr(item, field_name, value)
    await db.flush()


async def _upsert_slider_group(db: AsyncSession) -> SliderGroup:
    group = (
        await db.execute(select(SliderGroup).where(SliderGroup.slug == HOMEPAGE_SLIDER_GROUP["slug"]))
    ).scalar_one_or_none()

    if group is None:
        group = SliderGroup(**HOMEPAGE_SLIDER_GROUP)
        db.add(group)
    else:
        for field_name, value in HOMEPAGE_SLIDER_GROUP.items():
            setattr(group, field_name, value)

    await db.flush()
    return group


async def _upsert_slider(db: AsyncSession, group: SliderGroup, spec: dict[str, object], media: Media) -> None:
    item = (
        await db.execute(
            select(Slider).where(
                Slider.slider_group_id == group.id,
                Slider.title == spec["title"],
            )
        )
    ).scalar_one_or_none()

    payload = {
        "slider_group_id": group.id,
        "title": spec["title"],
        "subtitle": spec.get("subtitle") or spec.get("category"),
        "plain_text": spec["plain_text"],
        "rich_text": spec.get("rich_text") or f"<p>{spec['plain_text']}</p>",
        "structured_content": {
            "source_url": spec["source_url"],
            "source_channel": "official_website",
        },
        "desktop_media_id": media.id,
        "mobile_media_id": media.id,
        "external_url": spec["source_url"],
        "link_text": spec.get("link_text") or "Read update",
        "open_in_new_tab": False,
        "scope_type": None,
        "scope_id": None,
        "is_main": True,
        "is_public": True,
        "is_active": True,
        "start_datetime": None,
        "end_datetime": None,
        "archived_at": None,
        "display_order": spec["display_order"],
    }

    if item is None:
        item = Slider(**payload)
        db.add(item)
    else:
        for field_name, value in payload.items():
            setattr(item, field_name, value)

    await db.flush()


def _dedupe_by_source(*groups: list[dict[str, object]]) -> list[dict[str, object]]:
    seen: set[str] = set()
    result: list[dict[str, object]] = []
    for group in groups:
        for spec in group:
            source_url = str(spec.get("source_url") or "").strip()
            if not source_url or source_url in seen:
                continue
            seen.add(source_url)
            result.append(spec)
    return result


async def seed_content(db: AsyncSession, ctx: SeedContext) -> None:
    del ctx

    current_news = _dedupe_by_source(
        LIVE_SITE_NEWS_UPDATES_20260914,
        LIVE_SITE_NEWS_UPDATES_20260908,
        LIVE_SITE_NEWS_UPDATES,
        LIVE_SITE_NEWS_ITEMS,
    )
    # The live site publishes its article archive at /blog even when the
    # navigation presents an item as News. Keep the exact current article
    # records available to both content APIs, then retain the historical
    # snapshot for older published pages.
    curated_blogs = _dedupe_by_source(
        LIVE_SITE_NEWS_UPDATES_20260914,
        LIVE_SITE_BLOG_UPDATES,
        LIVE_SITE_BLOG_ITEMS,
    )
    known_blog_sources = {str(spec["source_url"]) for spec in curated_blogs}
    current_blogs = [
        *curated_blogs,
        *[
            spec
            for spec in _snapshot_blog_specs()
            if str(spec["source_url"]) not in known_blog_sources
        ],
    ]

    for spec in current_news:
        media = None
        if spec.get("source_image_url"):
            media = await _upsert_media(
                db,
                asset_filename=spec.get("asset_filename"),
                title=spec["title"],
                alt_text=spec["title"],
                source_image_url=spec["source_image_url"],
                tags=["news", "kisii-university", "homepage"],
            )
        await _upsert_news(db, spec, media)

    for spec in current_blogs:
        media = None
        if spec.get("source_image_url"):
            media = await _upsert_media(
                db,
                asset_filename=spec.get("asset_filename"),
                title=spec["title"],
                alt_text=spec["title"],
                source_image_url=spec["source_image_url"],
                tags=["blog", "kisii-university", "research", "innovation"],
            )
        await _upsert_blog(db, spec, media)

    curated_events_raw = [
        *LIVE_SITE_EVENT_UPDATES_20260914,
        *LIVE_SITE_EVENT_UPDATES_20260908,
        *LIVE_SITE_EVENT_UPDATES,
        *LIVE_SITE_EVENT_ITEMS,
    ]
    # The legacy event index was once seeded as an event with the same title
    # as the canonical conference detail source. Keep the detail source only.
    curated_events_by_slug: dict[str, dict[str, object]] = {}
    for spec in curated_events_raw:
        curated_events_by_slug[slugify(spec["title"])] = spec
    curated_events = list(curated_events_by_slug.values())
    known_event_sources = {str(spec["source_url"]) for spec in curated_events}
    current_events = [
        *curated_events,
        *[
            spec
            for spec in _snapshot_dated_event_specs()
            if str(spec["source_url"]) not in known_event_sources
        ],
    ]

    # Remove the obsolete ampersand-slug variant before the canonical event is
    # upserted; doing this afterward can collide with the unique slug index.
    await db.execute(
        delete(Event).where(
            Event.structured_content["source_url"].astext == "https://kisiiuniversity.ac.ke/our_events",
        )
    )
    for spec in current_events:
        media = None
        if spec.get("source_image_url"):
            media = await _upsert_media(
                db,
                asset_filename=spec.get("asset_filename"),
                title=spec["title"],
                alt_text=spec["title"],
                source_image_url=spec["source_image_url"],
                tags=["event", "kisii-university", "homepage"],
            )
        await _upsert_event(db, spec, media)

    slider_group = await _upsert_slider_group(db)
    for spec in [item for item in current_news if item.get("source_image_url")][:3]:
        media = await _upsert_media(
            db,
            asset_filename=spec.get("asset_filename"),
            title=spec["title"],
            alt_text=spec["title"],
            source_image_url=spec["source_image_url"],
            tags=["slider", "kisii-university", "homepage"],
        )
        await _upsert_slider(db, slider_group, spec, media)
