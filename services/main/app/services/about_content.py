"""Composition and management services for About KSU and institutional facts."""

from __future__ import annotations

import uuid
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


class AboutContentAdminService:
    """Authorised editorial operations with explicit lifecycle transitions."""

    @staticmethod
    async def get(db: AsyncSession, model: type, item_id: uuid.UUID):
        item = await db.get(model, item_id)
        return item if item is not None and getattr(item, "deleted_at", None) is None else None

    @staticmethod
    async def list(db: AsyncSession, model: type, *filters):
        result = await db.execute(
            select(model).where(model.deleted_at.is_(None), *filters).order_by(
                getattr(model, "display_order", model.created_at).asc(), model.created_at.asc()
            )
        )
        return list(result.scalars().all())

    @staticmethod
    async def create(db: AsyncSession, model: type, payload: dict, actor_id: uuid.UUID):
        item = model(**payload, created_by_id=actor_id, updated_by_id=actor_id, status="draft", workflow_status="draft")
        db.add(item)
        await db.flush()
        await db.refresh(item)
        return item

    @staticmethod
    async def update(db: AsyncSession, item: Any, payload: dict, actor_id: uuid.UUID):
        for key, value in payload.items():
            if key not in {"status", "workflow_status", "published_at"} and hasattr(item, key):
                setattr(item, key, value)
        item.updated_by_id = actor_id
        if item.workflow_status == "published":
            item.status = "draft"
            item.workflow_status = "draft"
            item.published_at = None
        await db.flush()
        await db.refresh(item)
        return item

    @staticmethod
    async def soft_delete(db: AsyncSession, item: Any):
        if item.workflow_status == "published":
            raise ValueError("Published content must be unpublished before deletion")
        item.soft_delete()
        await db.flush()

    @staticmethod
    def _validate_publish(item: Any):
        if isinstance(item, AboutPageContent):
            required = (item.hero_headline, item.hero_introduction, item.identity_narrative)
            if not all(value and str(value).strip() for value in required):
                raise ValueError("Hero headline, introduction and identity narrative are required")
            if bool(item.old_campus_media_id) != bool(item.modern_campus_media_id):
                raise ValueError("Transformation requires old and modern campus media")
            if item.video_url and not item.video_transcript_url:
                raise ValueError("Video transcript URL is required")
        elif isinstance(item, HistoryMilestone):
            if not item.source_title and not item.source_document_id:
                raise ValueError("Milestone source is required")
        elif isinstance(item, FactEdition):
            if item.verified_on is None:
                raise ValueError("Edition verification date is required")
        elif isinstance(item, FactItem):
            if not item.source_title or item.verified_on is None:
                raise ValueError("Fact source and verification date are required")

    @staticmethod
    async def transition(db: AsyncSession, item: Any, action: str, actor_id: uuid.UUID, reason: str | None = None):
        now = datetime.now(timezone.utc)
        current = item.workflow_status
        if action == "submit" and current in {"draft", "changes_requested"}:
            item.status = item.workflow_status = "in_review"
            item.submitted_by_id, item.submitted_at = actor_id, now
        elif action == "request_changes" and current == "in_review":
            item.status = item.workflow_status = "changes_requested"
            item.reviewed_by_id, item.reviewed_at, item.rejection_reason = actor_id, now, reason
        elif action == "approve" and current == "in_review":
            item.status = item.workflow_status = "approved"
            item.approved_by_id, item.approved_at = actor_id, now
        elif action == "publish" and current == "approved":
            AboutContentAdminService._validate_publish(item)
            if isinstance(item, FactEdition) and item.is_current:
                result = await db.execute(
                    select(FactEdition).where(
                        FactEdition.id != item.id, FactEdition.is_current.is_(True),
                        FactEdition.workflow_status == "published", FactEdition.deleted_at.is_(None),
                    ).with_for_update()
                )
                for previous in result.scalars().all():
                    previous.is_current = False
            item.status = item.workflow_status = "published"
            item.published_by_id, item.published_at = actor_id, now
        elif action == "unpublish" and current == "published":
            item.status = item.workflow_status = "approved"
            item.unpublished_by_id, item.unpublished_at = actor_id, now
        elif action == "archive" and current != "published":
            item.status = item.workflow_status = "archived"
        else:
            raise ValueError(f"Invalid workflow transition from {current} using {action}")
        await db.flush()
        return item

    @staticmethod
    async def reorder(db: AsyncSession, model: type, parent_field: str, parent_id: uuid.UUID, ordered: list[tuple[uuid.UUID, int]]):
        records = await AboutContentAdminService.list(db, model, getattr(model, parent_field) == parent_id)
        by_id = {record.id: record for record in records}
        if set(by_id) != {item_id for item_id, _ in ordered}:
            raise ValueError("Reorder request must contain every record exactly once")
        for item_id, display_order in ordered:
            by_id[item_id].display_order = display_order
        await db.flush()
        return sorted(records, key=lambda record: record.display_order)

    @staticmethod
    async def clone_edition(db: AsyncSession, source: FactEdition, reporting_year: int, actor_id: uuid.UUID):
        exists = (await db.execute(select(FactEdition.id).where(FactEdition.reporting_year == reporting_year))).scalar_one_or_none()
        if exists:
            raise ValueError("A facts edition already exists for that year")
        target = FactEdition(
            reporting_year=reporting_year, title=source.title.replace(str(source.reporting_year), str(reporting_year)),
            introduction=source.introduction, methodology_note=source.methodology_note,
            is_current=False, status="draft", workflow_status="draft", created_by_id=actor_id, updated_by_id=actor_id,
        )
        db.add(target)
        await db.flush()
        for group in source.groups:
            cloned_group = FactGroup(
                fact_edition_id=target.id, slug=group.slug, heading=group.heading, summary=group.summary,
                image_id=group.image_id, image_alt_text=group.image_alt_text, display_order=group.display_order,
                status="draft", workflow_status="draft", created_by_id=actor_id, updated_by_id=actor_id,
            )
            db.add(cloned_group)
            await db.flush()
            for item in group.items:
                values = {
                    column.name: getattr(item, column.name)
                    for column in FactItem.__table__.columns
                    if column.name not in {"id", "fact_group_id", "created_at", "updated_at", "deleted_at", "status", "workflow_status", "published_at"}
                    and not column.name.endswith("_by_id")
                }
                db.add(FactItem(
                    **values, fact_group_id=cloned_group.id, status="draft", workflow_status="draft",
                    created_by_id=actor_id, updated_by_id=actor_id,
                ))
        await db.flush()
        await db.refresh(target)
        return target


__all__ = ["AboutContentService", "FactsService", "AboutContentAdminService", "is_publicly_publishable"]
