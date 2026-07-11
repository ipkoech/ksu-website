"""Seed initial Page CMS homepage sections and partnership spotlight content."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import PageSection, PartnershipSpotlight, SectionItem
from app.services.research_partners import ResearchPartnersProxyService

from ._shared import SeedContext


SEED_OWNER = "page-cms-homepage-v1"
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
        "subtitle": "Latest public updates from Kisii University.",
        "description": "A compact feed for news, events and announcements.",
        "settings": {
            "feeds": ["news", "events", "announcements"],
            "maxItems": 6,
            "cta": {"label": "View all updates", "href": "/news"},
        },
        "items": (
            {
                "item_type": "card",
                "title": "News",
                "body_text": "Current university stories and notices.",
                "cta_label": "Read news",
                "cta_url": "/news",
                "display_order": 10,
                "content": {"source": "news", "limit": 2},
            },
            {
                "item_type": "card",
                "title": "Events",
                "body_text": "Upcoming ceremonies, conferences and campus activities.",
                "cta_label": "View events",
                "cta_url": "/events",
                "display_order": 20,
                "content": {"source": "events", "limit": 2},
            },
        ),
    },
    {
        "section_key": "featured-partnership",
        "layout_variant": "featured_partnership",
        "display_order": 30,
        "title": "Featured partnership",
        "subtitle": "Research, innovation and external collaboration.",
        "description": "A spotlight area for Heri Africa and future research partner stories.",
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
        "display_order": 40,
        "title": "Find your programme",
        "subtitle": "Search study options by level, school and mode of study.",
        "description": "Guide prospective students into the programme catalogue.",
        "settings": {
            "filters": ["level", "school", "studyMode"],
            "defaultQuery": "",
            "cta": {"label": "Browse all programmes", "href": "/programmes"},
        },
        "items": (
            {
                "item_type": "cta",
                "title": "Programme catalogue",
                "body_text": "Use the programme finder to compare academic pathways.",
                "cta_label": "Browse programmes",
                "cta_url": "/programmes",
                "display_order": 10,
                "content": {"searchPath": "/programmes", "placeholder": "Search programmes"},
            },
        ),
    },
    {
        "section_key": "facts",
        "layout_variant": "facts_strip",
        "display_order": 50,
        "title": "Kisii University at a glance",
        "subtitle": "Key institutional facts for the public homepage.",
        "description": "A concise facts strip for first-time visitors.",
        "settings": {
            "presentation": "strip",
            "source": "institutional_seed",
        },
        "items": (
            {
                "item_type": "stat",
                "title": "13th",
                "subtitle": "Public university in Kenya",
                "display_order": 10,
                "content": {"label": "Public university"},
            },
            {
                "item_type": "stat",
                "title": "8+",
                "subtitle": "Schools and academic pathways",
                "display_order": 20,
                "content": {"label": "Academic breadth"},
            },
            {
                "item_type": "stat",
                "title": "Research",
                "subtitle": "Innovation, extension and partnerships",
                "display_order": 30,
                "content": {"label": "Research focus"},
            },
        ),
    },
)


def _seed_settings(settings: dict[str, Any]) -> dict[str, Any]:
    merged = dict(settings)
    merged["seed"] = {
        "owner": SEED_OWNER,
        "version": 1,
    }
    return merged


def _is_seed_owned_section(section: PageSection) -> bool:
    settings = section.settings if isinstance(section.settings, dict) else {}
    seed = settings.get("seed") if isinstance(settings.get("seed"), dict) else {}
    return seed.get("owner") == SEED_OWNER


def _can_update_seeded_section(section: PageSection) -> bool:
    return section.status == "draft" and _is_seed_owned_section(section)


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


async def _seed_homepage_sections(db: AsyncSession) -> None:
    result = await db.execute(select(PageSection))
    existing = {
        _section_identity(section): section
        for section in result.scalars().all()
        if section.deleted_at is None
    }

    now = datetime.now(timezone.utc)
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

        _replace_section_items(section, spec["items"])

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
    existing_for_source = next(
        (
            candidate
            for candidate in existing_spotlights
            if candidate.source_type == "research_partner" and candidate.source_id == payload["source_id"]
        ),
        None,
    )

    if existing_for_source is not None:
        if existing_for_source.source_id != PENDING_HERI_AFRICA_SOURCE_ID:
            return
        if existing_for_source.headline != PENDING_HERI_AFRICA_HEADLINE:
            return
        if existing_for_source.status != "draft":
            return
        spotlight = existing_for_source
    else:
        spotlight = next(
            (
                candidate
                for candidate in existing_spotlights
                if candidate.source_type == "research_partner"
                and candidate.source_id == PENDING_HERI_AFRICA_SOURCE_ID
                and candidate.headline == PENDING_HERI_AFRICA_HEADLINE
                and candidate.status == "draft"
            ),
            None,
        )

    if spotlight is not None and spotlight.status != "draft":
        return

    if spotlight is None:
        db.add(PartnershipSpotlight(**payload))
    else:
        for field_name, value in payload.items():
            setattr(spotlight, field_name, value)

    await db.flush()


async def seed_page_cms(db: AsyncSession, ctx: SeedContext) -> None:
    del ctx

    await _seed_homepage_sections(db)
    await _seed_heri_africa_spotlight(db)


__all__ = [
    "HOMEPAGE_SECTION_SPECS",
    "PENDING_HERI_AFRICA_SOURCE_ID",
    "SEED_OWNER",
    "seed_page_cms",
]
