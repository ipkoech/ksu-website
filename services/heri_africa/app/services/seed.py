"""Idempotent, source-backed public seed data for HERI Africa."""

from __future__ import annotations

from datetime import datetime
from typing import Any, TypeVar
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.content import (
    Event,
    HeroSlide,
    ImpactMetric,
    NavigationItem,
    NewsArticle,
    Opportunity,
    PublicationStatus,
    ResearchProject,
    ResearchTheme,
    SiteSettings,
)
from ..models.chair import ChairProfile


ModelT = TypeVar("ModelT")
EAT = ZoneInfo("Africa/Nairobi")
KSU_LAUNCH_URL = "https://kisiiuniversity.ac.ke/blog/heri-africa-research-program-launch"
HERI_LAUNCH_URL = "https://www.heriafrica.org/a-new-era-for-african-education-research-begins-with-the-launch-of-heri-africa-in-kenya/"
LAUNCH_IMAGE_URL = "https://kisiiuniversity.ac.ke/storage/public/resources/xW9LcG9rcKrRGoOgIOhurepUJcOzuSZVO7m49bqB.jpg"


async def _upsert(db: AsyncSession, model: type[ModelT], where: Any, payload: dict[str, Any]) -> ModelT:
    record = (await db.execute(select(model).where(where))).scalars().first()
    if record is None:
        record = model(**payload)
        db.add(record)
    else:
        for field, value in payload.items():
            setattr(record, field, value)
    await db.flush()
    return record


async def seed_heri(db: AsyncSession) -> None:
    """Create missing public records and refresh existing seed records in place."""
    site = (await db.execute(select(SiteSettings).limit(1))).scalars().first()
    site_payload = {
        "name": "Harnessing Education Research for Impact in Africa",
        "tagline": "Africa-led education research for evidence-informed policy and practice",
        "contact": {
            "host": "Kisii University, Kenya",
            "website": "https://www.heriafrica.org/",
            "sources": [KSU_LAUNCH_URL, HERI_LAUNCH_URL],
            "verified_at": "2026-08-10",
        },
        "social_links": {},
        "seo_defaults": {
            "title": "HERI Africa | Africa-led Education Research",
            "description": "HERI Africa connects government, universities, civil society, and research organizations to increase the quality, productivity, and impact of African education research.",
        },
        "research_center_slug": "heri-africa",
    }
    if site is None:
        db.add(SiteSettings(**site_payload))
    else:
        for field, value in site_payload.items():
            setattr(site, field, value)

    await _upsert(
        db,
        ChairProfile,
        ChairProfile.name == "HERI Africa Language Education Research Chair",
        {
            "name": "HERI Africa Language Education Research Chair",
            "acronym": "HERI Africa",
            "host_institution": "Kisii University",
            "initiative_name": "HERI Africa",
            "about": "The Language Education Research Chair at Kisii University generates evidence that strengthens language teaching, foundational literacy, policy and practice across Africa.",
            "tagline": "Africa-led language education research for real-world impact",
            "vision": "An Africa where every learner can learn, read and thrive in their own languages.",
            "mission": "To advance relevant, Africa-led language education research and connect evidence with policy, practice and communities.",
            "mandate": "To strengthen language education research, communication and capacity across Africa.",
            "objectives": "Generate relevant evidence, support researchers and educators, communicate findings accessibly, and influence language education policy and practice.",
            "values": ["Integrity", "Inclusivity", "Collaboration", "Excellence", "Impact"],
            "why_it_matters": "Language is central to how learners understand, participate and succeed. Locally grounded research helps education systems respond to the realities of African classrooms and communities.",
            "logo_url": "/logos/heri-africa-logo.svg",
            "cover_image_url": LAUNCH_IMAGE_URL,
            "seo": {"title": "HERI Africa Language Education Research Chair", "description": "Africa-led language education and foundational literacy research hosted by Kisii University."},
            "is_active": True,
        },
    )

    theme = await _upsert(
        db,
        ResearchTheme,
        ResearchTheme.slug == "language-education-and-foundational-literacy",
        {
            "slug": "language-education-and-foundational-literacy",
            "name": "Language Education and Foundational Literacy",
            "description": "Research and capacity development focused on language education, foundational literacy, learning outcomes, student transitions, and lifelong opportunities across Africa.",
            "status": PublicationStatus.PUBLISHED,
        },
    )
    await _upsert(
        db,
        ResearchProject,
        ResearchProject.slug == "heri-africa-research-chairs",
        {
            "slug": "heri-africa-research-chairs",
            "title": "HERI Africa Research Chairs",
            "summary": "A university-based research leadership initiative designed to strengthen Africa-led education research, including the Languages Education Research Chair hosted at Kisii University.",
            "status": PublicationStatus.PUBLISHED,
            "scheduled_at": None,
            "theme_id": theme.id,
        },
    )
    await _upsert(
        db,
        NewsArticle,
        NewsArticle.slug == "heri-africa-launch-at-kisii-university",
        {
            "slug": "heri-africa-launch-at-kisii-university",
            "title": "HERI Africa Launches at Kisii University",
            "excerpt": "HERI Africa launched at Kisii University, bringing together government, higher education, civil society, development partners, and research organizations.",
            "body": "HERI Africa was officially launched at Kisii University on 19 February 2026 alongside its university offices and Kenya's National Education Research Agenda. The initiative seeks to strengthen locally led, relevant, and sustainable education research and its use in policy and practice.",
            "status": PublicationStatus.PUBLISHED,
            "published_at": datetime(2026, 2, 20, 12, 0, tzinfo=EAT),
            "scheduled_at": None,
            "featured_image_url": LAUNCH_IMAGE_URL,
            "seo": {"source_urls": [KSU_LAUNCH_URL, HERI_LAUNCH_URL], "verified_at": "2026-08-10"},
        },
    )
    await _upsert(
        db,
        Event,
        Event.slug == "heri-africa-official-launch-2026",
        {
            "slug": "heri-africa-official-launch-2026",
            "title": "HERI Africa Official Launch",
            "summary": "Official launch of HERI Africa, its Kisii University offices, and Kenya's National Education Research Agenda.",
            "description": "The launch convened government, universities, civil society, development partners, and research organizations at Kisii University.",
            "starts_at": datetime(2026, 2, 19, 9, 0, tzinfo=EAT),
            "ends_at": datetime(2026, 2, 19, 17, 0, tzinfo=EAT),
            "location": "Kisii University, Kenya",
            "registration_url": KSU_LAUNCH_URL,
            "status": PublicationStatus.PUBLISHED,
            "scheduled_at": None,
        },
    )
    await _upsert(
        db,
        Opportunity,
        Opportunity.slug == "language-education-postgraduate-scholarships-2026-2027",
        {
            "slug": "language-education-postgraduate-scholarships-2026-2027",
            "title": "2026/2027 Language Education Postgraduate Scholarships in Foundational Literacy",
            "summary": "Official Kisii University call for postgraduate scholarship applications in language education and foundational literacy.",
            "application_url": "https://kisiiuniversity.ac.ke/blog/call-for-applications-20262027-language-education-postgraduate-scholarships-in-foundational-literacy",
            "closing_at": None,
            "status": PublicationStatus.PUBLISHED,
            "scheduled_at": None,
        },
    )

    for position, (label, href) in enumerate(
        (("Home", "/"), ("Our Work", "/our-work"), ("News", "/news"), ("Opportunities", "/opportunities"), ("About", "/about")),
        start=1,
    ):
        await _upsert(
            db,
            NavigationItem,
            NavigationItem.href == href,
            {"label": label, "href": href, "position": position * 10, "is_visible": True},
        )

    await _upsert(
        db,
        HeroSlide,
        HeroSlide.title == "Africa-led education research with real-world impact",
        {
            "eyebrow": "Hosted at Kisii University",
            "title": "Africa-led education research with real-world impact",
            "description": "HERI Africa connects research, policy, and practice to improve education outcomes across the continent.",
            "image_url": LAUNCH_IMAGE_URL,
            "mobile_image_url": LAUNCH_IMAGE_URL,
            "button_label": "Explore our work",
            "button_href": "/our-work",
            "position": 10,
            "is_active": True,
        },
    )

    # The 3% baseline and 30% by 2050 ambition are stated by HERI Africa and
    # Kisii University's official Research Chair notice.
    for position, (label, value, unit, description) in enumerate(
        (
            ("Current African share of global education research", "3", "%", "Baseline reported by HERI Africa."),
            ("Target African share of global education research", "30", "% by 2050", "HERI Africa's long-term research productivity and impact ambition."),
        ),
        start=1,
    ):
        await _upsert(
            db,
            ImpactMetric,
            ImpactMetric.label == label,
            {"label": label, "value": value, "unit": unit, "description": description, "position": position * 10, "is_visible": True},
        )


__all__ = ["seed_heri"]
