"""Seed initial Page CMS homepage sections and partnership spotlight content."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import News, PageSection, PartnershipSpotlight, SectionItem
from app.services.research_partners import ResearchPartnersProxyService

from ._shared import SeedContext


SEED_OWNER = "page-cms-homepage-v1"
SEED_VERSION = 3
PENDING_HERI_AFRICA_SOURCE_ID = uuid.UUID("8d724ec7-3b5b-54f8-b3f3-8770f627dd6a")
PENDING_HERI_AFRICA_HEADLINE = "Heri Africa partnership spotlight pending"


HOMEPAGE_SECTION_SPECS: tuple[dict[str, Any], ...] = (
    {
        "section_key": "hero-admissions",
        "layout_variant": "hero_admissions",
        "display_order": 10,
        "title": "Kisii University",
        "subtitle": "A world-class university in the advancement of academic excellence, research and social welfare.",
        "description": "Explore admissions, programmes and student life at Kisii University.",
        "settings": {
            "eyebrow": "Admissions open",
            "backgroundRole": "heroImage",
            "primaryCta": {"label": "Apply now", "href": "/admission/how-to-apply"},
            "secondaryCta": {"label": "Explore programmes", "href": "/programmes"},
        },
        "items": (
            {
                "item_type": "cta",
                "title": "Apply now",
                "body_text": "Start your application and review entry requirements.",
                "cta_label": "How to apply",
                "cta_url": "/admission/how-to-apply",
                "display_order": 10,
                "content": {"intent": "primary"},
            },
            {
                "item_type": "cta",
                "title": "Find a programme",
                "body_text": "Browse diploma, undergraduate and postgraduate study options.",
                "cta_label": "View programmes",
                "cta_url": "/programmes",
                "display_order": 20,
                "content": {"intent": "secondary"},
            },
        ),
    },
    {
        "section_key": "pulse",
        "layout_variant": "pulse_strip",
        "display_order": 20,
        "title": "University pulse",
        "description": "A compact, high-signal feed for admissions, graduation, research, partnerships and university events.",
        "settings": {
            "feeds": ["news", "events", "announcements"],
            "maxItems": 5,
            "cta": {"label": "View all updates", "href": "/news"},
        },
        "items": (
            {
                "item_type": "card",
                "title": "Admissions and reporting",
                "body_text": "Check active intakes, reporting dates and official application guidance.",
                "cta_label": "Admissions",
                "cta_url": "/admissions",
                "display_order": 10,
                "content": {"icon": "admissions"},
            },
            {
                "item_type": "card",
                "title": "Research and innovation",
                "body_text": "See grants, research launches and community-impact work from KSU.",
                "cta_label": "Research",
                "cta_url": "/research",
                "display_order": 20,
                "content": {"icon": "research"},
            },
            {
                "item_type": "card",
                "title": "Strategic partnerships",
                "body_text": "Track MoUs and collaborations advancing teaching, enterprise and impact.",
                "cta_label": "Partnership",
                "cta_url": "/research/partnerships",
                "display_order": 30,
                "content": {"icon": "partnership"},
            },
            {
                "item_type": "card",
                "title": "Public lectures and events",
                "body_text": "Find official lectures, conferences, student activities and university events.",
                "cta_label": "Events",
                "cta_url": "/events",
                "display_order": 40,
                "content": {"icon": "calendar"},
            },
            {
                "item_type": "card",
                "title": "Graduation updates",
                "body_text": "Follow graduation notices, ceremony dates and clearance information.",
                "cta_label": "View updates",
                "cta_url": "/news",
                "display_order": 50,
                "content": {"icon": "graduation"},
            },
        ),
    },
    {
        "section_key": "why-kisii",
        "layout_variant": "pillar_grid",
        "display_order": 40,
        "title": "Why Kisii University?",
        "subtitle": "Discover your place at Kisii University",
        "description": "Kisii University brings together public-service education, applied research and inclusive student support for learners and communities in Kenya and beyond.",
        "settings": {"presentation": "image_cards"},
        "items": (
            {"item_type": "card", "title": "A public university with academic depth", "body_text": "KSU combines accredited programmes, experienced faculty and practical learning for Kenya’s workforce needs.", "cta_label": "Explore academics", "cta_url": "/academics", "display_order": 10, "content": {"imageUrl": "/images/Home/OurKSU-82.jpg", "imageAlt": "Kisii University academic community", "icon": "academic"}},
            {"item_type": "card", "title": "Community-rooted impact", "body_text": "KSU connects learning and innovation to the needs of communities in Kenya and beyond.", "cta_label": "Explore impact", "cta_url": "/research", "display_order": 20, "content": {"imageUrl": "/images/landing-page/why-kisii/bg-3.jpg", "imageAlt": "Kisii University community impact", "icon": "research"}},
            {"item_type": "card", "title": "Future-ready pathways", "body_text": "Build practical skills through applied learning, enterprise, leadership and opportunities to progress.", "cta_label": "Explore academics", "cta_url": "/academics", "display_order": 30, "content": {"imageUrl": "/images/landing-page/why-kisii/pathway-2.jpg", "imageAlt": "Kisii University learning pathways", "icon": "innovation"}},
            {"item_type": "card", "title": "An inclusive student experience", "body_text": "Students find academic support, leadership, clubs, sports and campus services that help them belong and progress.", "cta_label": "Explore campus life", "cta_url": "/campus-life", "display_order": 40, "content": {"imageUrl": "/images/backgrounds/KSUB-RollPhotos2025-123.jpg", "imageAlt": "Kisii University students", "icon": "students"}},
        ),
    },
    {
        "section_key": "featured-partnership",
        "layout_variant": "featured_partnership",
        "display_order": 30,
        "title": "Kisii University & Heri Africa — Building Africa Together.",
        "subtitle": "Strategic partnership",
        "description": "Partnering to advance innovation, entrepreneurship, digital transformation and community impact across Africa.",
        "settings": {
            "spotlightKey": "heri-africa",
            "spotlightSourceType": "research_partner",
            "cta": {"label": "Explore research partnerships", "href": "/research/partnerships"},
        },
        "items": (
            {
                "item_type": "card",
                "title": "Heri Africa spotlight",
                "body_text": "Connect public-facing partnership content to the research partner source record.",
                "cta_label": "Research partnerships",
                "cta_url": "/research/partnerships",
                "display_order": 10,
                "content": {"spotlightSlug": "heri-africa"},
            },
        ),
    },
    {
        "section_key": "programme-finder",
        "layout_variant": "programme_finder",
        "display_order": 50,
        "title": "Find the right programme. Build your future.",
        "subtitle": "Programmes and academic pathways",
        "description": "Search programmes and follow the five steps from programme choice to campus reporting.",
        "settings": {
            "filters": ["level", "school", "studyMode"],
            "defaultQuery": "",
            "cta": {"label": "Browse all programmes", "href": "/programmes"},
        },
        "items": (
            {"item_type": "card", "title": "Health Sciences", "cta_url": "/academics/programmes", "display_order": 10, "content": {"group": "category", "icon": "health"}},
            {"item_type": "card", "title": "Business & Economics", "cta_url": "/academics/programmes", "display_order": 20, "content": {"group": "category", "icon": "business"}},
            {"item_type": "card", "title": "ICT & Computing", "cta_url": "/academics/programmes", "display_order": 30, "content": {"group": "category", "icon": "computing"}},
            {"item_type": "card", "title": "Engineering", "cta_url": "/academics/programmes", "display_order": 40, "content": {"group": "category", "icon": "engineering"}},
            {"item_type": "card", "title": "Law & Governance", "cta_url": "/academics/programmes", "display_order": 50, "content": {"group": "category", "icon": "law"}},
            {"item_type": "card", "title": "Choose programme", "body_text": "Find a programme that matches your goals.", "display_order": 110, "content": {"group": "journey", "step": 1}},
            {"item_type": "card", "title": "Check entry requirements", "body_text": "Review the academic and supporting requirements.", "display_order": 120, "content": {"group": "journey", "step": 2}},
            {"item_type": "card", "title": "Submit application", "body_text": "Apply online and upload the required documents.", "display_order": 130, "content": {"group": "journey", "step": 3}},
            {"item_type": "card", "title": "Receive offer", "body_text": "Successful applicants receive admission information.", "display_order": 140, "content": {"group": "journey", "step": 4}},
            {"item_type": "card", "title": "Report to campus", "body_text": "Join the university and begin your journey.", "display_order": 150, "content": {"group": "journey", "step": 5}},
        ),
    },
    {
        "section_key": "academic-dates",
        "layout_variant": "date_timeline",
        "display_order": 55,
        "title": "Key dates",
        "subtitle": "Admissions and reporting",
        "description": "Confirm official dates before completing an application or reporting to campus.",
        "settings": {"cta": {"label": "View academic calendar", "href": "/academics/calendar"}},
        "items": (
            {"item_type": "card", "title": "Next intake opens", "subtitle": "Admissions", "body_text": "Review the current intake announcement.", "cta_url": "/admissions", "display_order": 10, "content": {"date": "Published by Admissions"}},
            {"item_type": "card", "title": "Application period", "subtitle": "Applications", "body_text": "Check the active application window.", "cta_url": "/admissions/how-to-apply", "display_order": 20, "content": {"date": "See official notice"}},
            {"item_type": "card", "title": "Admission letters", "subtitle": "Applicants", "body_text": "Access admission information through the applicant portal.", "cta_url": "/admissions", "display_order": 30, "content": {"date": "When published"}},
            {"item_type": "card", "title": "Reporting date", "subtitle": "New students", "body_text": "Follow the reporting instructions for your intake.", "cta_url": "/admissions", "display_order": 40, "content": {"date": "See intake details"}},
        ),
    },
    {
        "section_key": "campus-life",
        "layout_variant": "media_mosaic",
        "display_order": 90,
        "title": "Life Around Studies",
        "subtitle": "Life around studies",
        "description": "From sport to innovation, clubs and culture, campus life creates room to grow.",
        "settings": {"cta": {"label": "Explore campus life", "href": "/campus-life"}},
        "items": (
            {"item_type": "media", "title": "Student Clubs", "cta_url": "/campus-life/clubs", "display_order": 10, "content": {"imageUrl": "/images/backgrounds/KSUB-RollPhotos2025-123.jpg", "imageAlt": "Kisii University students"}},
            {"item_type": "media", "title": "Sports & Recreation", "cta_url": "/campus-life/sports", "display_order": 20, "content": {"imageUrl": "/images/history/KSUGreenLandscapingMay2026-3810.jpg", "imageAlt": "Kisii University grounds"}},
            {"item_type": "media", "title": "Innovation Hub", "cta_url": "/research/innovation", "display_order": 30, "content": {"imageUrl": "/images/about/about-quality-assurance-branded.webp", "imageAlt": "Innovation at Kisii University"}},
            {"item_type": "media", "title": "Modern Hostels", "cta_url": "/campus-life/accommodation", "display_order": 40, "content": {"imageUrl": "/images/homepage/kisii-administration-campus.jpg", "imageAlt": "Kisii University campus"}},
            {"item_type": "media", "title": "Culture & Arts", "cta_url": "/campus-life", "display_order": 50, "content": {"imageUrl": "/images/about/about-history-branded.webp", "imageAlt": "Culture at Kisii University"}},
            {"item_type": "media", "title": "Health & Wellness", "cta_url": "/campus-life/health-services", "display_order": 60, "content": {"imageUrl": "/images/about/about-service-charter-branded.webp", "imageAlt": "Student support at Kisii University"}},
        ),
    },
    {
        "section_key": "leadership-activity",
        "layout_variant": "leadership_activity",
        "display_order": 60,
        "title": "Leadership in action",
        "subtitle": "Vice Chancellor",
        "description": "Our leadership advances knowledge, nurtures talent and transforms communities.",
        "settings": {"leaderName": "Prof. Charles O. Ong’ondo, PhD", "leaderTitle": "Vice Chancellor", "leaderImage": "/logos/vc3.jpg", "cta": {"label": "Meet our leadership", "href": "/about/vice-chancellor"}},
        "items": (
            {"item_type": "card", "title": "AI & Data Science Centre launched", "cta_url": "/news", "display_order": 10, "content": {"category": "Innovation", "date": "Latest activity", "imageUrl": "/images/about/about-quality-assurance-branded.webp"}},
            {"item_type": "card", "title": "MoU signed with the University of Pretoria", "cta_url": "/news", "display_order": 20, "content": {"category": "Partnership", "date": "Latest activity", "imageUrl": "/images/about/about-governance-branded.webp"}},
            {"item_type": "card", "title": "UNESCO delegation visits Kisii University", "cta_url": "/news", "display_order": 30, "content": {"category": "Global engagement", "date": "Latest activity", "imageUrl": "/images/about/about-management-branded.webp"}},
            {"item_type": "card", "title": "Student leaders engagement forum", "cta_url": "/news", "display_order": 40, "content": {"category": "Leadership", "date": "Latest activity", "imageUrl": "/images/backgrounds/KSUB-RollPhotos2025-123.jpg"}},
        ),
    },
    {
        "section_key": "research-impact",
        "layout_variant": "research_cards",
        "display_order": 70,
        "title": "Transforming Communities Through Research",
        "subtitle": "Research and innovation",
        "description": "Our research addresses real-world challenges and creates sustainable solutions for society.",
        "settings": {
            "backgroundImage": "/images/research/research-impact-bg.png",
            "cta": {"label": "Explore research", "href": "/research"},
        },
        "items": (
            {"item_type": "card", "title": "Climate-Resilient Agriculture", "body_text": "Improving food security through innovative farming.", "cta_url": "/research", "display_order": 10, "content": {"imageUrl": "/images/history/KSUGreenLandscapingMay2026-3885.jpg"}},
            {"item_type": "card", "title": "Healthcare Innovation", "body_text": "Advancing health solutions for better communities.", "cta_url": "/research", "display_order": 20, "content": {"imageUrl": "/images/about/about-service-charter-branded.webp"}},
            {"item_type": "card", "title": "AI & Digital Solutions", "body_text": "Developing intelligent systems for African futures.", "cta_url": "/research", "display_order": 30, "content": {"imageUrl": "/images/about/about-quality-assurance-branded.webp"}},
            {"item_type": "card", "title": "Renewable Energy Research", "body_text": "Building sustainable energy pathways.", "cta_url": "/research", "display_order": 40, "content": {"imageUrl": "/images/history/KSUGreenLandscapingMay2026-3810.jpg"}},
            {"item_type": "card", "title": "Law & Social Justice", "body_text": "Promoting justice, equity and good governance.", "cta_url": "/research", "display_order": 50, "content": {"imageUrl": "/images/about/about-governance-branded.webp"}},
        ),
    },
    {
        "section_key": "latest-news",
        "layout_variant": "news_grid",
        "display_order": 100,
        "title": "Latest News & Stories",
        "subtitle": "University news",
        "description": "Official stories from across Kisii University.",
        "settings": {"cta": {"label": "View all news", "href": "/news"}},
        "items": (
            {"item_type": "card", "title": "Kisii University celebrates graduation", "cta_url": "/news", "display_order": 10, "content": {"category": "Graduation", "date": "Latest", "imageUrl": "/images/backgrounds/KSUB-RollPhotos2025-123.jpg"}},
            {"item_type": "card", "title": "Climate resilience research advances", "cta_url": "/news", "display_order": 20, "content": {"category": "Research", "date": "Latest", "imageUrl": "/images/history/KSUGreenLandscapingMay2026-3885.jpg"}},
            {"item_type": "card", "title": "University expands strategic partnerships", "cta_url": "/news", "display_order": 30, "content": {"category": "Partnership", "date": "Latest", "imageUrl": "/images/about/about-governance-branded.webp"}},
            {"item_type": "card", "title": "Students excel in regional competition", "cta_url": "/news", "display_order": 40, "content": {"category": "Student life", "date": "Latest", "imageUrl": "/images/backgrounds/KSUB-RollPhotos2025-123.jpg"}},
        ),
    },
    {
        "section_key": "upcoming-events",
        "layout_variant": "events_list",
        "display_order": 110,
        "title": "Upcoming Events",
        "subtitle": "Save the date",
        "description": "Upcoming public lectures, research activities and ceremonies.",
        "settings": {"cta": {"label": "View all events", "href": "/events"}},
        "items": (
            {"item_type": "card", "title": "Public Lecture", "subtitle": "Main Campus", "cta_url": "/events", "display_order": 10, "content": {"date": "15 May", "time": "10:00 AM"}},
            {"item_type": "card", "title": "Research & Innovation Week", "subtitle": "Main Campus", "cta_url": "/events", "display_order": 20, "content": {"date": "24 May", "time": "All day"}},
            {"item_type": "card", "title": "Graduation Ceremony", "subtitle": "Main Campus", "cta_url": "/events", "display_order": 30, "content": {"date": "27 Jun", "time": "9:00 AM"}},
        ),
    },
    {
        "section_key": "partners",
        "layout_variant": "logo_carousel",
        "display_order": 80,
        "title": "A network advancing learning, research and community impact.",
        "subtitle": "Our partners",
        "description": "Kisii University works with academic, industry, government and development partners to expand opportunity and translate knowledge into public value.",
        "settings": {"presentation": "wordmarks", "source": "research_partners"},
        "items": tuple(
            {"item_type": "card", "title": name, "display_order": order, "content": {"label": name}}
            for order, name in enumerate(("UNESCO", "World Health Organization", "Google", "KEMRI", "JICA", "Microsoft", "USAID", "Safaricom"), start=10)
        ),
    },
    {
        "section_key": "alumni-impact",
        "layout_variant": "alumni_story",
        "display_order": 130,
        "title": "Alumni Making Impact",
        "subtitle": "Alumni success story",
        "description": "Our alumni carry Kisii University knowledge and service into communities around the world.",
        "settings": {"imageUrl": "/images/about/about-leadership.webp"},
        "items": (
            {"item_type": "card", "title": "Dr. Mercy Nyanchoka", "subtitle": "Medical Doctor and Kisii University alumna", "body_text": "Kisii University gave me the foundation and confidence to pursue my dreams and make a difference.", "cta_label": "View more alumni stories", "cta_url": "/alumni", "display_order": 10, "content": {"imageUrl": "/images/about/about-leadership.webp"}},
        ),
    },
    {
        "section_key": "facts",
        "layout_variant": "facts_strip",
        "display_order": 45,
        "title": "Kisii University at a glance",
        "subtitle": "Key institutional facts for the public homepage.",
        "description": "A concise facts strip for first-time visitors.",
        "settings": {
            "presentation": "strip",
            "source": "institutional_seed",
        },
        "items": (
            {"item_type": "stat", "title": "20,000+", "subtitle": "Students", "display_order": 10, "content": {"label": "Students"}},
            {"item_type": "stat", "title": "100+", "subtitle": "Programmes", "display_order": 20, "content": {"label": "Programmes"}},
            {"item_type": "stat", "title": "500+", "subtitle": "Academic Staff", "display_order": 30, "content": {"label": "Academic Staff"}},
            {"item_type": "stat", "title": "50+", "subtitle": "Student Clubs", "display_order": 40, "content": {"label": "Student Clubs"}},
            {"item_type": "stat", "title": "13+", "subtitle": "Research Centres", "display_order": 50, "content": {"label": "Research Centres"}},
            {"item_type": "stat", "title": "60+", "subtitle": "Years of Excellence", "display_order": 60, "content": {"label": "Years of Excellence"}},
            {"item_type": "stat", "title": "98%", "subtitle": "Graduate Employability", "display_order": 70, "content": {"label": "Graduate Employability"}},
        ),
    },
)


def _seed_settings(settings: dict[str, Any]) -> dict[str, Any]:
    merged = dict(settings)
    merged["seed"] = {
        "owner": SEED_OWNER,
        "version": SEED_VERSION,
    }
    return merged


def _is_seed_owned_section(section: PageSection) -> bool:
    settings = section.settings if isinstance(section.settings, dict) else {}
    seed = settings.get("seed") if isinstance(settings.get("seed"), dict) else {}
    return seed.get("owner") == SEED_OWNER


def _can_update_seeded_section(section: PageSection) -> bool:
    if not _is_seed_owned_section(section):
        return False
    if section.status == "draft":
        return True

    settings = section.settings if isinstance(section.settings, dict) else {}
    if settings.get("edited") is True:
        return False
    seed = settings.get("seed") if isinstance(settings.get("seed"), dict) else {}
    version = seed.get("version")
    return isinstance(version, int) and version < SEED_VERSION


def _section_identity(section: PageSection) -> tuple[str, str, uuid.UUID | None, str]:
    return (section.page_key, section.scope_type, section.scope_id, section.section_key)


def _replace_section_items(section: PageSection, item_specs: tuple[dict[str, Any], ...]) -> None:
    section.items = [
        SectionItem(
            item_type=spec["item_type"],
            title=spec.get("title"),
            subtitle=spec.get("subtitle"),
            body_text=spec.get("body_text"),
            content=spec.get("content"),
            cta_label=spec.get("cta_label"),
            cta_url=spec.get("cta_url"),
            cta_description=spec.get("cta_description"),
            display_order=spec["display_order"],
            is_enabled=True,
        )
        for spec in item_specs
    ]


async def _seed_leadership_activity_news(db: AsyncSession) -> dict[str, uuid.UUID]:
    now = datetime.now(timezone.utc)
    records = (
        ("AI & Data Science Centre launched", "ai-data-science-centre-launched", "Kisii University expands its capacity in artificial intelligence, data science and applied digital innovation."),
        ("MoU signed with the University of Pretoria", "mou-university-of-pretoria", "A strategic academic partnership supporting collaboration, mobility and shared research."),
        ("UNESCO delegation visits Kisii University", "unesco-delegation-visits-kisii-university", "University leadership welcomed UNESCO representatives for discussions on education, research and community impact."),
        ("Student leaders engagement forum", "student-leaders-engagement-forum", "The Vice Chancellor met student representatives to discuss student experience, leadership and institutional priorities."),
    )
    linked: dict[str, uuid.UUID] = {}
    for title, slug, summary in records:
        item = (await db.execute(select(News).where(News.slug == slug))).scalar_one_or_none()
        if item is None:
            item = News(
                title=title,
                slug=slug,
                summary=summary,
                plain_text=summary,
                rich_text=f"<p>{summary}</p>",
                is_featured=False,
                is_main=True,
                is_public=True,
                is_published=True,
                status="published",
                workflow_status="published",
                published_at=now,
                display_order=100,
            )
            db.add(item)
            await db.flush()
        linked[title] = item.id
    return linked


async def _seed_homepage_sections(db: AsyncSession) -> None:
    result = await db.execute(select(PageSection))
    existing = {
        _section_identity(section): section
        for section in result.scalars().all()
        if section.deleted_at is None
    }

    now = datetime.now(timezone.utc)
    leadership_news = await _seed_leadership_activity_news(db)
    for spec in HOMEPAGE_SECTION_SPECS:
        identity = ("homepage", "university", None, spec["section_key"])
        section = existing.get(identity)
        if section is not None and not _can_update_seeded_section(section):
            continue

        payload = {
            "page_key": "homepage",
            "scope_type": "university",
            "scope_id": None,
            "section_key": spec["section_key"],
            "title": spec["title"],
            "subtitle": spec["subtitle"],
            "description": spec["description"],
            "settings": _seed_settings(spec["settings"]),
            "display_order": spec["display_order"],
            "is_enabled": True,
            "layout_variant": spec["layout_variant"],
            "status": "published",
            "workflow_status": "published",
            "valid_from": None,
            "valid_to": None,
            "approved_at": now,
            "published_at": now,
        }

        if section is None:
            section = PageSection(**payload)
            db.add(section)
        else:
            for field_name, value in payload.items():
                setattr(section, field_name, value)

        item_specs = spec["items"]
        if spec["section_key"] == "leadership-activity":
            item_specs = tuple(
                {
                    **item_spec,
                    "cta_url": None,
                    "content": {
                        "linked_content_type": "news",
                        "linked_content_id": str(leadership_news[item_spec["title"]]),
                        "activity_context": "leadership-activity",
                    },
                }
                for item_spec in item_specs
            )
        _replace_section_items(section, item_specs)

    await db.flush()


def _partner_matches_heri_africa(partner: dict[str, Any]) -> bool:
    values = (
        partner.get("name"),
        partner.get("title"),
        partner.get("slug"),
    )
    return any(isinstance(value, str) and "heri" in value.lower() and "africa" in value.lower() for value in values)


async def _resolve_heri_africa_partner() -> dict[str, Any] | None:
    try:
        payload = await ResearchPartnersProxyService.list_partners(
            page=1,
            per_page=100,
            search="Heri Africa",
        )
    except Exception:
        return None

    partners = payload.get("data") if isinstance(payload, dict) else None
    if not isinstance(partners, list):
        return None
    for partner in partners:
        if isinstance(partner, dict) and _partner_matches_heri_africa(partner):
            return partner
    return None


def _coerce_partner_id(partner: dict[str, Any] | None) -> uuid.UUID | None:
    if not isinstance(partner, dict):
        return None
    partner_id = partner.get("id")
    if isinstance(partner_id, uuid.UUID):
        return partner_id
    if isinstance(partner_id, str):
        try:
            return uuid.UUID(partner_id)
        except ValueError:
            return None
    return None


def _spotlight_payload(partner: dict[str, Any] | None) -> dict[str, Any]:
    partner_id = _coerce_partner_id(partner)
    if partner_id is None:
        return {
            "source_type": "research_partner",
            "source_id": PENDING_HERI_AFRICA_SOURCE_ID,
            "primary_cta_source": "manual",
            "primary_cta_label": "Review partner record",
            "primary_cta_url": "/research/partnerships",
            "headline": PENDING_HERI_AFRICA_HEADLINE,
            "summary": (
                "Pending seed placeholder for the Heri Africa spotlight. Publish after the "
                "matching research partner source record is available."
            ),
            "pillars": [],
            "opportunities": [],
            "is_enabled": False,
            "status": "draft",
            "workflow_status": "draft",
            "valid_from": None,
            "valid_to": None,
            "approved_at": None,
            "published_at": None,
        }

    now = datetime.now(timezone.utc)
    return {
        "source_type": "research_partner",
        "source_id": partner_id,
        "primary_cta_source": "generated_detail_page",
        "primary_cta_label": "Explore the partnership",
        "primary_cta_url": None,
        "headline": "Heri Africa partnership spotlight",
        "summary": "A featured partnership spotlight connected to the Heri Africa research partner record.",
        "pillars": [
            {"label": "Research collaboration", "description": "Shared research and innovation activity."},
            {"label": "Community impact", "description": "Knowledge exchange with public value."},
        ],
        "opportunities": [
            {"label": "Partnership enquiries", "href": "/research/partnerships"},
        ],
        "is_enabled": True,
        "status": "published",
        "workflow_status": "published",
        "valid_from": None,
        "valid_to": None,
        "approved_at": now,
        "published_at": now,
    }


async def _seed_heri_africa_spotlight(db: AsyncSession) -> None:
    partner = await _resolve_heri_africa_partner()
    payload = _spotlight_payload(partner)

    result = await db.execute(select(PartnershipSpotlight))
    existing_spotlights = [
        spotlight for spotlight in result.scalars().all() if spotlight.deleted_at is None
    ]
    existing_for_source = any(
        (
            candidate
            for candidate in existing_spotlights
            if candidate.source_type == "research_partner" and candidate.source_id == payload["source_id"]
        )
    )

    if existing_for_source:
        return

    db.add(PartnershipSpotlight(**payload))
    await db.flush()


async def seed_page_cms(db: AsyncSession, ctx: SeedContext) -> None:
    del ctx

    await _seed_homepage_sections(db)
    await _seed_heri_africa_spotlight(db)


__all__ = [
    "HOMEPAGE_SECTION_SPECS",
    "PENDING_HERI_AFRICA_SOURCE_ID",
    "SEED_OWNER",
    "SEED_VERSION",
    "seed_page_cms",
]
