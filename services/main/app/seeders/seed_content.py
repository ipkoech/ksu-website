"""Seed source-backed public content for the main website."""

from __future__ import annotations

import hashlib
import mimetypes
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Blog, Event, Media, News, Slider, SliderGroup
from app.schemas.base import slugify

from ._shared import SeedContext
from .live_site_snapshot import LIVE_SITE_BLOG_ITEMS, LIVE_SITE_EVENT_ITEMS, LIVE_SITE_NEWS_ITEMS


EAT = ZoneInfo("Africa/Nairobi")
ASSET_ROOT = Path(__file__).resolve().parent / "assets" / "content"


NEWS_ITEMS = [
    {
        "title": "H.E. the President officially laid the foundation stone for Nyamira University College",
        "summary": "Kisii University highlighted the foundation-stone ceremony for Nyamira University College and described the project as a fast-track expansion of higher-education access under its stewardship.",
        "plain_text": (
            "The university announced that the President officially laid the foundation stone for Nyamira "
            "University College and linked the project to expanded access, innovation, and the planned admission "
            "of the first student cohort."
        ),
        "rich_text": (
            "<p>Kisii University reported that H.E. the President officially laid the foundation stone for Nyamira "
            "University College, marking a major expansion milestone in higher-education access in the region.</p>"
            "<p>The article states that the college is under Kisii University stewardship and targets its first "
            "student intake in September 2026.</p>"
        ),
        "published_at": datetime(2026, 4, 13, 12, 0, tzinfo=EAT),
        "asset_filename": "news-nyamira-foundation-stone.jpg",
        "source_url": "https://kisiiuniversity.ac.ke/blog/he-the-president-officially-laid-the-foundation-stone-for-nyamira-university-college",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/lFm7NWhlo6DOsJ65krhiNUSJgVD9T4OXjz4RubpD.jpg",
        "related_links": [
            {"label": "Original Kisii University post", "url": "https://kisiiuniversity.ac.ke/blog/he-the-president-officially-laid-the-foundation-stone-for-nyamira-university-college"}
        ],
        "is_featured": True,
        "display_order": 10,
    },
    {
        "title": "Day 4 of Kisii University Innovation Week",
        "summary": "Kisii University closed the inaugural Innovation Week by framing it as a benchmark event for creativity, shared learning, and future-facing problem solving.",
        "plain_text": (
            "The university said the inaugural Innovation Week concluded after several days of learning, "
            "networking, and showcasing ideas, and positioned the event as a new benchmark for institutional innovation."
        ),
        "rich_text": (
            "<p>Kisii University presented the closing of its inaugural Innovation Week as a milestone for "
            "creativity, curiosity, and collaborative problem solving.</p>"
            "<p>The coverage emphasized shared learning, self-discovery, and meaningful connections between "
            "students, staff, and innovation stakeholders.</p>"
        ),
        "published_at": datetime(2026, 4, 11, 18, 0, tzinfo=EAT),
        "asset_filename": "news-day-4-innovation-week.jpg",
        "source_url": "https://kisiiuniversity.ac.ke/blog/day-4-of-kisii-university-innovation-week",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/Ltfd9S8AWmh3ZkGIBLIecukN6QeBDgaEP7mqYBhS.jpg",
        "related_links": [
            {"label": "Original Kisii University post", "url": "https://kisiiuniversity.ac.ke/blog/day-4-of-kisii-university-innovation-week"},
            {"label": "Innovation Week livestream", "url": "https://www.youtube.com/watch?v=uLXWUSqegL4"},
        ],
        "is_featured": True,
        "display_order": 20,
    },
    {
        "title": "KUCCPS Portal is now open for Undergraduate Programmes",
        "summary": "Kisii University urged prospective students to use the open KUCCPS portal to select undergraduate programmes and make Kisii University their next academic home.",
        "plain_text": (
            "The university announced that the KUCCPS portal is open for undergraduate applications and invited "
            "prospective students to begin the placement process."
        ),
        "rich_text": (
            "<p>Kisii University announced the opening of the KUCCPS portal for undergraduate programme selection.</p>"
            "<p>The post directs prospective students to begin their placement process and consider Kisii University "
            "for their next academic step.</p>"
        ),
        "published_at": datetime(2026, 4, 8, 9, 30, tzinfo=EAT),
        "asset_filename": "news-kuccps-portal-open.jpg",
        "source_url": "https://kisiiuniversity.ac.ke/blog/kuccps-portal-is-now-open-for-undergraduate-programmes",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/svEwOjYPYKfwbPl37N6ELQKVoZFhR4t7Wp0noFDf.jpg",
        "related_links": [
            {"label": "Original Kisii University post", "url": "https://kisiiuniversity.ac.ke/blog/kuccps-portal-is-now-open-for-undergraduate-programmes"}
        ],
        "is_featured": False,
        "display_order": 30,
    },
    {
        "title": "15th Graduation Ceremony 2026",
        "summary": "Kisii University celebrated the 15th congregation and positioned the graduation ceremony as a milestone for achievement, resilience, and a new cohort of graduates.",
        "plain_text": (
            "The university marked its 15th graduation ceremony and congratulated a new cohort of graduates "
            "while linking the event to Kisii University's inclusive and globally oriented vision."
        ),
        "rich_text": (
            "<p>Kisii University published coverage of its 15th graduation ceremony and congratulated the newest "
            "cohort of graduates.</p>"
            "<p>The coverage tied the event to institutional values of inclusivity, innovation, and borderless education.</p>"
        ),
        "published_at": datetime(2026, 3, 12, 13, 0, tzinfo=EAT),
        "asset_filename": "news-15th-graduation-2026.jpg",
        "source_url": "https://kisiiuniversity.ac.ke/blog/15th-graduation-ceremony-2026",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/a5w1emerTvjapXL0TLJwpk2h09mP8RtL4sGbmuue.jpg",
        "related_links": [
            {"label": "Original Kisii University post", "url": "https://kisiiuniversity.ac.ke/blog/15th-graduation-ceremony-2026"},
            {"label": "Graduation livestream", "url": "https://www.youtube.com/watch?v=_krrQWU98b4"},
            {"label": "15th Graduation Booklet 2026", "url": "https://kisiiuniversity.ac.ke/admission/kisii-university-15th-graduation-booklet-2026"},
        ],
        "is_featured": False,
        "display_order": 40,
    },
]


BLOG_ITEMS = [
    {
        "title": "Partnering University of Minnesota",
        "summary": "Kisii University said its partnership with the University of Minnesota will support staff and student development and channel more than USD 660,000 in research funding over three years.",
        "plain_text": (
            "The Vice Chancellor hosted a delegation from the University of Minnesota and the university said "
            "the partnership will support development programmes and more than USD 660,000 in research funding."
        ),
        "rich_text": (
            "<p>Kisii University said its long-running partnership with the University of Minnesota continues to "
            "support staff and student development across both institutions.</p>"
            "<p>The university reported that the latest phase includes more than USD 660,000 in research support "
            "over three years.</p>"
        ),
        "excerpt": "A partnership update on Kisii University's long-running collaboration with the University of Minnesota.",
        "published_at": datetime(2024, 9, 10, 12, 30, tzinfo=EAT),
        "asset_filename": "blog-partnering-university-of-minnesota.jpg",
        "source_url": "https://kisiiuniversity.ac.ke/blog/partnering-university-of-minnesota",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/fLeMmBlmXHF4Z10N5YQr15s8ZfwCCJOXGrdSHPzM.jpg",
        "related_links": [
            {"label": "Original Kisii University post", "url": "https://kisiiuniversity.ac.ke/blog/partnering-university-of-minnesota"}
        ],
        "is_featured": True,
        "display_order": 10,
    },
    {
        "title": "Mozilla Foundation Responsible Computing Challenge",
        "summary": "Kisii University documented student engagement with responsible-computing and ethics concepts delivered through its Mozilla Foundation collaboration.",
        "plain_text": (
            "The university said students in the School of Information Science and Technology integrated ethics "
            "and responsible computing ideas into fourth-year project work through the Mozilla Foundation collaboration."
        ),
        "rich_text": (
            "<p>Kisii University reported that students in the School of Information Science and Technology "
            "adopted responsible-computing and ethics concepts in their final-year project work.</p>"
            "<p>The article attributes that momentum to training and collaboration delivered through the "
            "Mozilla Foundation partnership.</p>"
        ),
        "excerpt": "A research and ethics partnership update from the Mozilla Foundation Responsible Computing Challenge.",
        "published_at": datetime(2025, 1, 29, 16, 30, tzinfo=EAT),
        "asset_filename": "blog-mozilla-foundation-rcc.jpg",
        "source_url": "https://kisiiuniversity.ac.ke/blog/mozilla-foundation-responsible-computing-challenge",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/OYYviaxMG7P0lNXUCHGSe4hlvrkIHHNZeg0AkMVc.jpg",
        "related_links": [
            {"label": "Original Kisii University post", "url": "https://kisiiuniversity.ac.ke/blog/mozilla-foundation-responsible-computing-challenge"}
        ],
        "is_featured": True,
        "display_order": 20,
    },
    {
        "title": "Innovation Week 2026 Website",
        "summary": "Kisii University described Innovation Week as the flagship event of the Directorate of Research, Extension, Innovation and Resource Mobilization and launched a dedicated event website.",
        "plain_text": (
            "The university introduced a dedicated Innovation Week website and described the annual event as "
            "a bridge between academic research, entrepreneurship, commercialization, and SDG-aligned innovation."
        ),
        "rich_text": (
            "<p>Kisii University launched the Innovation Week 2026 website and described the event as the "
            "flagship platform of the Directorate of Research, Extension, Innovation and Resource Mobilization.</p>"
            "<p>The article frames the week as a bridge between academic research, industry, entrepreneurship, "
            "and real-world SDG-aligned problem solving.</p>"
        ),
        "excerpt": "An overview of the official Innovation Week 2026 website and the role of the event in Kisii University's innovation ecosystem.",
        "published_at": datetime(2026, 3, 31, 15, 30, tzinfo=EAT),
        "asset_filename": "blog-innovation-week-2026-website.jpg",
        "source_url": "https://kisiiuniversity.ac.ke/blog/innovation-week-2026-website",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/1hJScctHNTPJgj4YcxPPRnsDDddQ5U1PQXXnHszo.jpg",
        "related_links": [
            {"label": "Original Kisii University post", "url": "https://kisiiuniversity.ac.ke/blog/innovation-week-2026-website"},
            {"label": "Innovation Week website", "url": "https://innovationweek.kisiiuniversity.ac.ke/"},
        ],
        "is_featured": False,
        "display_order": 30,
    },
]


EVENT_ITEMS = [
    {
        "title": "KSU 15th Graduation Ceremony",
        "summary": "Kisii University's 15th congregation ceremony for the 2026 graduating class.",
        "plain_text": (
            "Kisii University scheduled its 15th graduation ceremony for March 2026 and published official "
            "event and booklet details for graduates and guests."
        ),
        "rich_text": (
            "<p>Kisii University scheduled its 15th graduation ceremony as the main congregation event for the "
            "2026 graduating cohort.</p>"
            "<p>Attendees were directed to the official event notice, graduation booklet, and live ceremony stream.</p>"
        ),
        "start_date": datetime(2026, 3, 12, 8, 0, tzinfo=EAT),
        "end_date": datetime(2026, 3, 12, 14, 0, tzinfo=EAT),
        "location": "Kisii University Auditorium",
        "asset_filename": "event-ksu-15th-graduation.jpg",
        "source_url": "https://kisiiuniversity.ac.ke/event/ksu-15th-graduation-ceremony",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/events/images/EPeqUBm2zhkHjGRNIiYz080OUJhDvoVKDvwYytL0.jpg",
        "related_links": [
            {"label": "Official event page", "url": "https://kisiiuniversity.ac.ke/event/ksu-15th-graduation-ceremony"},
            {"label": "15th Graduation Booklet 2026", "url": "https://kisiiuniversity.ac.ke/admission/kisii-university-15th-graduation-booklet-2026"},
            {"label": "Graduation livestream", "url": "https://www.youtube.com/watch?v=_krrQWU98b4"},
        ],
        "is_featured": True,
        "display_order": 10,
    },
    {
        "title": "Innovation Week 2026",
        "summary": "A four-day innovation showcase bringing together students, researchers, industry, government, and development partners.",
        "plain_text": (
            "Innovation Week 2026 was promoted as a multi-day institutional showcase for exhibitions, keynote "
            "sessions, pitching, workshops, and SDG-aligned innovation."
        ),
        "rich_text": (
            "<p>Kisii University promoted Innovation Week 2026 as a multi-day gathering for exhibitions, keynote "
            "lectures, pitching competitions, workshops, and awards.</p>"
            "<p>The event connected students, researchers, industry leaders, government, and development partners "
            "around innovation with practical impact.</p>"
        ),
        "start_date": datetime(2026, 4, 7, 8, 0, tzinfo=EAT),
        "end_date": datetime(2026, 4, 10, 17, 0, tzinfo=EAT),
        "location": "Kisii University New Auditorium",
        "asset_filename": "event-innovation-week-2026.jpg",
        "source_url": "https://kisiiuniversity.ac.ke/event/innovation-week-2026",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/events/images/fdd9CvE5kfDLHt7kfKZOzvdJxGD0LU8sGehI9QDT.jpg",
        "related_links": [
            {"label": "Official event page", "url": "https://kisiiuniversity.ac.ke/event/innovation-week-2026"},
            {"label": "Innovation Week website", "url": "https://innovationweek.kisiiuniversity.ac.ke/"},
        ],
        "is_featured": True,
        "display_order": 20,
    },
    {
        "title": "3rd Multidisciplinary Kisii University Conference",
        "summary": "A June 2026 multidisciplinary conference covering abstracts, paper submission, payment, and full-paper deadlines.",
        "plain_text": (
            "Kisii University promoted its third multidisciplinary conference and published the abstract, "
            "acceptance, payment, and full-paper submission timeline."
        ),
        "rich_text": (
            "<p>Kisii University announced the third multidisciplinary conference and published a sequence of "
            "academic deadlines covering abstract submission, acceptance notification, payment, and full-paper submission.</p>"
            "<p>The conference was positioned as a main-campus research forum bringing together multidisciplinary scholarship.</p>"
        ),
        "start_date": datetime(2026, 6, 9, 8, 0, tzinfo=EAT),
        "end_date": datetime(2026, 6, 11, 17, 0, tzinfo=EAT),
        "location": "Kisii University Main Campus",
        "asset_filename": "event-3rd-multidisciplinary-conference.jpg",
        "source_url": "https://kisiiuniversity.ac.ke/event/3rd-multidisciplinary-kisii-university-conference-abstract-submission",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/events/images/nz2lIFC7I6FtMkGCiZVyrPfexvVb0HN48F0ql0Rv.jpg",
        "related_links": [
            {"label": "Official event page", "url": "https://kisiiuniversity.ac.ke/event/3rd-multidisciplinary-kisii-university-conference-abstract-submission"},
            {"label": "Conference portal", "url": "https://digital.kisiiuniversity.ac.ke/conferences/"},
        ],
        "is_featured": False,
        "display_order": 30,
    },
]


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


HOMEPAGE_SLIDER_ITEMS = [
    {
        "title": "KSU Vice Chancellor Joins Nyamira County Governor to Celebrate Vocational Training Graduates",
        "subtitle": "Vocational Training Graduates",
        "plain_text": (
            "The Vice Chancellor joined Nyamira County leadership to celebrate vocational training "
            "graduates and encouraged them to use their skills with confidence, resilience, and purpose."
        ),
        "rich_text": (
            "<p>The Vice Chancellor joined Nyamira County leadership to celebrate vocational training "
            "graduates and encouraged them to use their hard-earned skills with confidence, resilience, "
            "and purpose.</p>"
        ),
        "asset_filename": "slider-vocational-training-graduates.jpg",
        "source_url": "https://kisiiuniversity.ac.ke/blog/ksu-vice-chancellor-joins-nyamira-county-governor-to-celebrate-vocational-training-graduates",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/CL8DOu0Kt4REaFZhYzLcil31wOk3NfGODGep95lF.jpg",
        "link_text": "Read story",
        "display_order": 10,
    },
    {
        "title": "School of Health Sciences receives 50million worth of Equipment",
        "subtitle": "Health Sciences Equipment",
        "plain_text": (
            "Kisii University received equipment worth over KSh 50 million from Seeding Labs, Boston, "
            "strengthening infectious disease research, teaching, learning, and molecular diagnostics capacity."
        ),
        "rich_text": (
            "<p>Kisii University received equipment worth over KSh 50 million from Seeding Labs, Boston, "
            "strengthening infectious disease research, teaching, learning, and emerging molecular diagnostics capacity.</p>"
        ),
        "asset_filename": "slider-health-sciences-equipment.jpg",
        "source_url": "https://kisiiuniversity.ac.ke/blog/school-of-health-sciences-receives-50million-worth-of-equipment",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/jM6e7rjGSW9rRaGpqH0UCgRnwXLpuhOyFzEqy5c9.jpg",
        "link_text": "View equipment update",
        "display_order": 20,
    },
    {
        "title": "KSU Top Achievers Dinner",
        "subtitle": "Student Excellence",
        "plain_text": (
            "The Vice Chancellor hosted a Top Achievers Dinner recognizing students whose academic, "
            "leadership, innovation, service, sports, and creative achievements reflect the breadth of Kisii University talent."
        ),
        "rich_text": (
            "<p>The Vice Chancellor hosted a Top Achievers Dinner recognizing students whose academic, "
            "leadership, innovation, service, sports, and creative achievements reflect the breadth of Kisii University talent.</p>"
        ),
        "asset_filename": "slider-top-achievers-dinner.jpg",
        "source_url": "https://kisiiuniversity.ac.ke/blog/ksu-top-achievers-dinner",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/X5W42j4UtCHBvwnZbsxcPwKFshwqMiE2BR6MEtRf.jpg",
        "link_text": "See achievers",
        "display_order": 30,
    },
]


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


async def _upsert_news(db: AsyncSession, spec: dict[str, object], media: Media) -> None:
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
        },
        "related_links": spec.get("related_links") or [{"label": "Official Kisii University source", "url": spec["source_url"]}],
        "featured_media_id": media.id,
        "author_user_id": None,
        "meta_title": spec["title"],
        "meta_description": spec["summary"],
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
        "is_featured": spec["is_featured"],
    }
    if item is None:
        item = News(**payload)
        db.add(item)
    else:
        for field_name, value in payload.items():
            setattr(item, field_name, value)
    await db.flush()


async def _upsert_blog(db: AsyncSession, spec: dict[str, object], media: Media) -> None:
    slug = slugify(spec["title"])
    item = (await db.execute(select(Blog).where(Blog.slug == slug))).scalar_one_or_none()
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
        },
        "related_links": spec.get("related_links") or [{"label": "Official Kisii University source", "url": spec["source_url"]}],
        "featured_media_id": media.id,
        "author_user_id": None,
        "meta_title": spec["title"],
        "meta_description": spec["summary"],
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
        "is_featured": spec["is_featured"],
    }
    if item is None:
        item = Blog(**payload)
        db.add(item)
    else:
        for field_name, value in payload.items():
            setattr(item, field_name, value)
    await db.flush()


async def _upsert_event(db: AsyncSession, spec: dict[str, object], media: Media) -> None:
    slug = slugify(spec["title"])
    item = (await db.execute(select(Event).where(Event.slug == slug))).scalar_one_or_none()
    payload = {
        "title": spec["title"],
        "slug": slug,
        "summary": spec["summary"],
        "plain_text": spec["plain_text"],
        "rich_text": spec.get("rich_text") or f"<p>{spec['plain_text']}</p>",
        "structured_content": {
            "source_url": spec["source_url"],
            "source_channel": "official_website",
        },
        "start_date": spec["start_date"],
        "end_date": spec["end_date"],
        "location": spec["location"],
        "is_virtual": False,
        "meeting_link": None,
        "is_featured": spec["is_featured"],
        "featured_media_id": media.id,
        "author_user_id": None,
        "related_links": spec.get("related_links") or [{"label": "Official Kisii University source", "url": spec["source_url"]}],
        "meta_title": spec["title"],
        "meta_description": spec["summary"],
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


async def seed_content(db: AsyncSession, ctx: SeedContext) -> None:
    del ctx

    for spec in LIVE_SITE_NEWS_ITEMS:
        media = await _upsert_media(
            db,
            asset_filename=spec.get("asset_filename"),
            title=spec["title"],
            alt_text=spec["title"],
            source_image_url=spec["source_image_url"],
            tags=["news", "kisii-university", "homepage"],
        )
        await _upsert_news(db, spec, media)

    for spec in LIVE_SITE_BLOG_ITEMS:
        media = await _upsert_media(
            db,
            asset_filename=spec.get("asset_filename"),
            title=spec["title"],
            alt_text=spec["title"],
            source_image_url=spec["source_image_url"],
            tags=["blog", "kisii-university", "research", "innovation"],
        )
        await _upsert_blog(db, spec, media)

    for spec in LIVE_SITE_EVENT_ITEMS:
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
    for spec in LIVE_SITE_NEWS_ITEMS[:3]:
        media = await _upsert_media(
            db,
            asset_filename=spec.get("asset_filename"),
            title=spec["title"],
            alt_text=spec["title"],
            source_image_url=spec["source_image_url"],
            tags=["slider", "kisii-university", "homepage"],
        )
        await _upsert_slider(db, slider_group, spec, media)
