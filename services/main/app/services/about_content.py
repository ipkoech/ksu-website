"""Composition and management services for About KSU and institutional facts."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models import AboutPageContent, Document, FactEdition, FactGroup, FactItem, HistoryMilestone
from .university import UniversityInfoService


def is_publicly_publishable(item: Any, *, now: datetime | None = None) -> bool:
    instant = now or datetime.now(timezone.utc)
    if getattr(item, "deleted_at", None) is not None:
        return False
    if getattr(item, "is_enabled", True) is not True:
        return False
    if hasattr(item, "is_public") and getattr(item, "is_public") is not True:
        return False
    if getattr(item, "status", None) != "published" or getattr(item, "workflow_status", None) != "published":
        return False
    published_at = getattr(item, "published_at", None)
    if published_at is None or published_at > instant:
        return False
    scheduled = getattr(item, "scheduled_publish_at", None)
    expires = getattr(item, "expires_at", None)
    return not ((scheduled and scheduled > instant) or (expires and expires <= instant))


def _media(media: Any) -> dict[str, Any] | None:
    if media is None:
        return None
    return {"id": str(media.id), "url": media.url, "alt_text": media.alt_text, "caption": media.caption}


def _document(document: Any) -> dict[str, Any] | None:
    if document is None:
        return None
    return {
        "id": str(document.id), "title": document.title, "slug": document.slug,
        "description": document.description, "file": _media(getattr(document, "file", None)),
    }


def _milestone(item: HistoryMilestone) -> dict[str, Any]:
    return {
        "id": str(item.id), "slug": item.slug, "year_label": item.year_label,
        "event_date": item.event_date, "title": item.title, "summary": item.summary,
        "expanded_body": item.expanded_body, "image": _media(item.image),
        "image_alt_text": item.image_alt_text, "source_title": item.source_title,
        "source_url": item.source_url, "source_document": _document(item.source_document),
        "display_order": item.display_order,
    }


def _fact(item: FactItem) -> dict[str, Any]:
    return {
        "id": str(item.id), "kind": item.fact_kind, "label": item.label,
        "display_value": item.display_value, "numeric_value": item.numeric_value,
        "prefix": item.prefix, "suffix": item.suffix, "unit": item.unit,
        "explanation": item.explanation, "icon_key": item.icon_key,
        "link_url": item.link_url, "link_label": item.link_label,
        "source_title": item.source_title, "source_url": item.source_url,
        "verified_on": item.verified_on, "is_featured": item.is_featured,
        "display_order": item.display_order,
    }


def _group(group: FactGroup, now: datetime) -> dict[str, Any]:
    items = sorted(
        (item for item in group.items if is_publicly_publishable(item, now=now)),
        key=lambda item: (item.display_order, str(item.id)),
    )
    return {
        "id": str(group.id), "slug": group.slug, "heading": group.heading,
        "summary": group.summary, "image": _media(group.image),
        "image_alt_text": group.image_alt_text, "display_order": group.display_order,
        "items": [_fact(item) for item in items],
    }


class AboutContentService:
    @staticmethod
    async def get_published_content(db: AsyncSession, *, now: datetime | None = None) -> AboutPageContent | None:
        instant = now or datetime.now(timezone.utc)
        result = await db.execute(
            select(AboutPageContent)
            .options(
                selectinload(AboutPageContent.hero_media), selectinload(AboutPageContent.identity_media),
                selectinload(AboutPageContent.video_poster_media), selectinload(AboutPageContent.old_campus_media),
                selectinload(AboutPageContent.modern_campus_media),
                selectinload(AboutPageContent.history_document).selectinload(Document.file),
                selectinload(AboutPageContent.milestones).selectinload(HistoryMilestone.image),
                selectinload(AboutPageContent.milestones).selectinload(HistoryMilestone.source_document).selectinload(Document.file),
            )
            .where(AboutPageContent.deleted_at.is_(None))
        )
        content = result.scalars().first()
        return content if content and is_publicly_publishable(content, now=instant) else None

    @staticmethod
    async def get_public_history(db: AsyncSession, *, now: datetime | None = None) -> dict[str, Any]:
        instant = now or datetime.now(timezone.utc)
        content = await AboutContentService.get_published_content(db, now=instant)
        if content is None:
            return {"milestones": [], "document": None}
        milestones = sorted(
            (item for item in content.milestones if is_publicly_publishable(item, now=instant)),
            key=lambda item: (item.display_order, item.event_date or datetime.max.date(), str(item.id)),
        )
        return {"milestones": [_milestone(item) for item in milestones], "document": _document(content.history_document)}

    @staticmethod
    async def get_public_about(db: AsyncSession, *, now: datetime | None = None) -> dict[str, Any] | None:
        university = await UniversityInfoService.get_current(db)
        if university is None:
            return None
        content = await AboutContentService.get_published_content(db, now=now)
        content_payload = None
        if content:
            content_payload = {
                "id": str(content.id), "hero_eyebrow": content.hero_eyebrow,
                "hero_headline": content.hero_headline, "hero_introduction": content.hero_introduction,
                "identity_heading": content.identity_heading, "identity_narrative": content.identity_narrative,
                "mandate_introduction": content.mandate_introduction, "video_title": content.video_title,
                "video_url": content.video_url, "video_transcript_url": content.video_transcript_url,
                "hero_media": _media(content.hero_media), "identity_media": _media(content.identity_media),
                "video_poster_media": _media(content.video_poster_media),
                "old_campus_media": _media(content.old_campus_media),
                "modern_campus_media": _media(content.modern_campus_media),
                "section_settings": content.section_settings,
            }
        university_payload = {
            key: getattr(university, key, None) for key in (
                "name", "short_name", "acronym", "motto", "overview", "mission", "vision",
                "philosophy", "strategic_plan_summary", "core_values", "founding_year",
                "institution_type", "charter_summary", "history_summary", "quick_facts",
                "physical_address", "city", "county", "country",
            )
        }
        return {"university": university_payload, "content": content_payload, "history": await AboutContentService.get_public_history(db, now=now)}


class FactsService:
    @staticmethod
    async def get_public_facts(db: AsyncSession, *, year: int | None = None, now: datetime | None = None) -> dict[str, Any] | None:
        instant = now or datetime.now(timezone.utc)
        edition_query = select(FactEdition).options(
            selectinload(FactEdition.source_document).selectinload(Document.file),
            selectinload(FactEdition.groups).selectinload(FactGroup.image),
            selectinload(FactEdition.groups).selectinload(FactGroup.items),
        ).where(FactEdition.deleted_at.is_(None))
        edition_query = edition_query.where(FactEdition.reporting_year == year) if year else edition_query.where(FactEdition.is_current.is_(True))
        edition = (await db.execute(edition_query)).scalars().first()
        if edition is None or not is_publicly_publishable(edition, now=instant):
            return None
        evergreen = (await db.execute(
            select(FactGroup).options(selectinload(FactGroup.image), selectinload(FactGroup.items))
            .where(FactGroup.fact_edition_id.is_(None), FactGroup.deleted_at.is_(None))
        )).scalars().all()
        groups = [*evergreen, *edition.groups]
        groups = sorted((g for g in groups if is_publicly_publishable(g, now=instant)), key=lambda g: (g.display_order, g.slug))
        years = (await db.execute(
            select(FactEdition.reporting_year).where(
                FactEdition.deleted_at.is_(None), FactEdition.workflow_status == "published", FactEdition.status == "published"
            ).order_by(FactEdition.reporting_year.desc())
        )).scalars().all()
        return {
            "edition": {"id": str(edition.id), "reporting_year": edition.reporting_year, "title": edition.title,
                        "introduction": edition.introduction, "methodology_note": edition.methodology_note,
                        "verified_on": edition.verified_on, "source_document": _document(edition.source_document)},
            "groups": [_group(group, instant) for group in groups], "available_years": list(years),
        }


__all__ = ["AboutContentService", "FactsService", "is_publicly_publishable"]
