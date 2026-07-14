"""Services for page CMS sections, workflow, and homepage composition."""

from __future__ import annotations

import uuid
from collections.abc import Awaitable, Callable
from datetime import datetime, timezone
from typing import Any, Sequence

from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ksu_common import PaginatedResult

from ..models import ContentWorkflowLog, Event, Media, MediaLink, News, PageSection, PartnershipSpotlight, Person
from ._base import ilike_any, paginate_query
from .research_partners import ResearchPartnersProxyService

ALLOWED_TRANSITIONS = {
    "draft": {"submit": "in_review", "archive": "archived"},
    "changes_requested": {"submit": "in_review", "archive": "archived"},
    "in_review": {"approve": "approved", "request_changes": "changes_requested", "archive": "archived"},
    "approved": {"publish": "published", "archive": "archived"},
    "published": {"archive": "archived", "unpublish": "approved"},
    "archived": set(),
}

MEDIA_ROLE_BUCKETS = {
    "hero": "heroImage",
    "heroimage": "heroImage",
    "hero-image": "heroImage",
    "hero_image": "heroImage",
    "mobile": "mobileImage",
    "mobileimage": "mobileImage",
    "mobile-image": "mobileImage",
    "mobile_image": "mobileImage",
    "logo": "logos",
    "logos": "logos",
    "gallery": "gallery",
    "video": "video",
    "background": "background",
    "poster": "poster",
}

MEDIA_GROUP_KEYS = ("heroImage", "mobileImage", "logos", "gallery", "video", "background", "poster")


def _active_window_filter(model, now: datetime):
    return (
        or_(model.valid_from.is_(None), model.valid_from <= now),
        or_(model.valid_to.is_(None), model.valid_to >= now),
    )


def _published_workflow_filter(model, now: datetime):
    return (
        model.status == "published",
        model.workflow_status == "published",
        *_active_window_filter(model, now),
        or_(model.scheduled_publish_at.is_(None), model.scheduled_publish_at <= now),
        or_(model.expires_at.is_(None), model.expires_at >= now),
    )


def _published_media_link_filter(now: datetime):
    return (
        MediaLink.is_public.is_(True),
        or_(
            MediaLink.owner_scope_type != "club",
            MediaLink.owner_scope_type.is_(None),
            and_(
                MediaLink.is_published.is_(True),
                MediaLink.workflow_status == "published",
                MediaLink.archived_at.is_(None),
                or_(MediaLink.scheduled_publish_at.is_(None), MediaLink.scheduled_publish_at <= now),
                or_(MediaLink.expires_at.is_(None), MediaLink.expires_at >= now),
            ),
        ),
    )


def _normalize_role(role: str) -> str | None:
    key = role.strip()
    if key in MEDIA_GROUP_KEYS:
        return key
    return MEDIA_ROLE_BUCKETS.get(key.lower())


def _default_media_groups() -> dict[str, list[dict[str, Any]]]:
    return {key: [] for key in MEDIA_GROUP_KEYS}


def _serialize_media(media: Media | None) -> dict[str, Any] | None:
    if media is None:
        return None
    return {
        "id": media.id,
        "filename": media.filename,
        "original_filename": media.original_filename,
        "mime_type": media.mime_type,
        "media_type": media.media_type,
        "url": media.url,
        "public_url": media.public_url,
        "cdn_url": media.cdn_url,
        "thumbnail_url": media.thumbnail_url,
        "alt_text": media.alt_text,
        "title": media.title,
        "caption": media.caption,
        "width": media.width,
        "height": media.height,
        "duration": media.duration,
    }


def _serialize_media_link(link: MediaLink) -> dict[str, Any]:
    return {
        "id": link.id,
        "media_id": link.media_id,
        "entity_type": link.entity_type,
        "entity_id": link.entity_id,
        "role": link.role,
        "display_order": link.display_order,
        "media": _serialize_media(link.media),
    }


def _serialize_person(person: Person | None) -> dict[str, Any] | None:
    if person is None:
        return None
    return {
        "id": str(person.id),
        "title": person.title,
        "full_name": person.full_name,
        "display_name": person.display_name,
        "email": person.email,
        "institutional_role": person.institutional_role,
        "photo_id": str(person.photo_id) if person.photo_id else None,
        "photo_url": person.photo_url,
    }


def _serialize_linked_content(record: News | Event | None, content_type: str | None) -> dict[str, Any] | None:
    if record is None or content_type is None:
        return None
    return {
        "id": str(record.id),
        "type": content_type,
        "title": record.title,
        "slug": record.slug,
        "summary": getattr(record, "summary", None),
        "status": getattr(record, "status", None),
        "is_published": getattr(record, "is_published", None),
        "published_at": getattr(record, "published_at", None),
        "start_date": getattr(record, "start_date", None),
        "href": f"/{'news' if content_type == 'news' else 'events'}/{record.slug}",
    }


async def _enrich_section_item_content(db: AsyncSession, content: dict[str, Any] | None) -> dict[str, Any] | None:
    if not content:
        return None

    enriched: dict[str, Any] = {}
    staff_profile_id = content.get("staff_profile_id")
    if staff_profile_id:
        person = await db.get(Person, uuid.UUID(str(staff_profile_id)), options=[selectinload(Person.photo)])
        enriched["staff_profile"] = _serialize_person(person)

    linked_type = content.get("linked_content_type")
    linked_id = content.get("linked_content_id")
    if linked_type and linked_id:
        model = News if linked_type == "news" else Event if linked_type == "event" else None
        linked = await db.get(model, uuid.UUID(str(linked_id))) if model is not None else None
        enriched["linked_content"] = _serialize_linked_content(linked, str(linked_type))

    return enriched or None


async def _serialize_section(
    db: AsyncSession,
    section: PageSection,
    media_groups: dict[str, list[dict[str, Any]]],
) -> dict[str, Any]:
    public_items = sorted(
        (
            item
            for item in section.items
            if item.is_enabled and getattr(item, "deleted_at", None) is None
        ),
        key=lambda item: (item.display_order, item.created_at or datetime.min.replace(tzinfo=timezone.utc)),
    )
    return {
        "id": section.id,
        "page_key": section.page_key,
        "scope_type": section.scope_type,
        "scope_id": section.scope_id,
        "section_key": section.section_key,
        "title": section.title,
        "subtitle": section.subtitle,
        "description": section.description,
        "settings": section.settings,
        "is_enabled": section.is_enabled,
        "layout_variant": section.layout_variant,
        "status": section.status,
        "valid_from": section.valid_from,
        "valid_to": section.valid_to,
        "approved_at": section.approved_at,
        "published_at": section.published_at,
        "display_order": _section_display_order(section),
        "items": [
            {
                "id": item.id,
                "page_section_id": item.page_section_id,
                "item_type": item.item_type,
                "title": item.title,
                "subtitle": item.subtitle,
                "body_text": item.body_text,
                "content": item.content,
                "cta_label": item.cta_label,
                "cta_url": item.cta_url,
                "cta_description": item.cta_description,
                "media_caption": item.media_caption,
                "media_alt_text": item.media_alt_text,
                "video_provider": item.video_provider,
                "video_url": item.video_url,
                "video_duration_seconds": item.video_duration_seconds,
                "display_order": item.display_order,
                "is_enabled": item.is_enabled,
                "content_enriched": await _enrich_section_item_content(db, item.content),
            }
            for item in public_items
        ],
        "media": media_groups,
    }


def _serialize_spotlight(
    spotlight: PartnershipSpotlight,
    media_groups: dict[str, list[dict[str, Any]]],
    primary_cta: dict[str, str | None],
) -> dict[str, Any]:
    return {
        "id": spotlight.id,
        "source_type": spotlight.source_type,
        "source_id": spotlight.source_id,
        "primary_cta_source": spotlight.primary_cta_source,
        "primary_cta_label": spotlight.primary_cta_label,
        "primary_cta_url": spotlight.primary_cta_url,
        "headline": spotlight.headline,
        "summary": spotlight.summary,
        "pillars": spotlight.pillars,
        "opportunities": spotlight.opportunities,
        "is_enabled": spotlight.is_enabled,
        "status": spotlight.status,
        "valid_from": spotlight.valid_from,
        "valid_to": spotlight.valid_to,
        "approved_at": spotlight.approved_at,
        "published_at": spotlight.published_at,
        "primary_cta": primary_cta,
        "media": media_groups,
    }


def _section_display_order(section: PageSection) -> int:
    explicit_order = getattr(section, "display_order", None)
    return explicit_order if explicit_order is not None else 100


def _scope_filter(
    model,
    *,
    page_key: str | None = None,
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    match_null_scope_id: bool = False,
):
    filters = []
    if page_key is not None:
        filters.append(model.page_key == page_key)
    if scope_type is not None:
        filters.append(model.scope_type == scope_type)
    if scope_id is not None:
        filters.append(model.scope_id == scope_id)
    elif match_null_scope_id:
        filters.append(model.scope_id.is_(None))
    return filters


def _coerce_items(result: PaginatedResult | list[PageSection]) -> list[PageSection]:
    if isinstance(result, list):
        return result
    return list(result.items)


async def _list_active_partnership_spotlights(db: AsyncSession) -> list[PartnershipSpotlight]:
    now = datetime.now(timezone.utc)
    query = (
        PartnershipSpotlight.active_query()
        .where(
            PartnershipSpotlight.is_enabled.is_(True),
            *_published_workflow_filter(PartnershipSpotlight, now),
        )
        .order_by(
            PartnershipSpotlight.published_at.desc().nullslast(),
            PartnershipSpotlight.created_at.desc(),
        )
    )
    result = await db.execute(query)
    return list(result.scalars().all())


async def _get_research_partner_payload(source_id: uuid.UUID) -> dict[str, Any] | None:
    return await ResearchPartnersProxyService.find_partner_by_id(source_id, per_page=100)


def _resolve_partner_website(partner_payload: dict[str, Any] | None) -> str | None:
    if not isinstance(partner_payload, dict):
        return None
    website = partner_payload.get("website") or partner_payload.get("partner_website")
    return website if isinstance(website, str) and website else None


def _resolve_partner_slug(partner_payload: dict[str, Any] | None) -> str | None:
    if not isinstance(partner_payload, dict):
        return None
    slug = partner_payload.get("slug")
    return slug if isinstance(slug, str) and slug else None


async def _resolve_primary_cta(spotlight: PartnershipSpotlight, partner_payload: dict[str, Any] | None) -> dict[str, str | None]:
    label = spotlight.primary_cta_label
    href = spotlight.primary_cta_url

    if spotlight.primary_cta_source == "partner_website":
        href = _resolve_partner_website(partner_payload)
    elif spotlight.primary_cta_source == "generated_detail_page":
        slug = _resolve_partner_slug(partner_payload)
        href = f"/partnerships/{slug}" if slug else None

    return {
        "label": label,
        "href": href,
    }


class PageSectionService:
    """Query helpers for page sections."""

    @staticmethod
    def _admin_query(
        *,
        page_key: str | None = None,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
        status: str | None = None,
        search: str | None = None,
        load_options: Sequence = (),
    ):
        query = PageSection.active_query().options(selectinload(PageSection.items))
        if load_options:
            query = query.options(*load_options)
        for filter_clause in _scope_filter(
            PageSection,
            page_key=page_key,
            scope_type=scope_type,
            scope_id=scope_id,
        ):
            query = query.where(filter_clause)
        if status:
            query = query.where(PageSection.status == status)
        if search:
            query = query.where(ilike_any(search, PageSection.title, PageSection.section_key, PageSection.page_key))
        query = query.order_by(PageSection.display_order.asc(), PageSection.created_at.desc())
        return query

    @staticmethod
    async def list_admin(
        db: AsyncSession,
        *,
        page_key: str | None = None,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
        status: str | None = None,
        search: str | None = None,
        page: int = 1,
        per_page: int = 20,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = PageSectionService._admin_query(
            page_key=page_key,
            scope_type=scope_type,
            scope_id=scope_id,
            status=status,
            search=search,
            load_options=load_options,
        )
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def list_admin_authorized(
        db: AsyncSession,
        *,
        is_visible: Callable[[PageSection], Awaitable[bool]],
        page_key: str | None = None,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
        status: str | None = None,
        search: str | None = None,
        page: int = 1,
        per_page: int = 20,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = PageSectionService._admin_query(
            page_key=page_key,
            scope_type=scope_type,
            scope_id=scope_id,
            status=status,
            search=search,
            load_options=load_options,
        )
        result = await db.execute(query)
        page = max(1, page)
        per_page = max(1, min(100, per_page))

        visible_items: list[PageSection] = []
        for item in result.scalars().all():
            if await is_visible(item):
                visible_items.append(item)

        total = len(visible_items)
        pages = (total + per_page - 1) // per_page if per_page else 0
        start = (page - 1) * per_page
        end = start + per_page
        return PaginatedResult(
            items=visible_items[start:end],
            meta={
                "page": page,
                "per_page": per_page,
                "total": total,
                "pages": pages,
            },
        )

    @staticmethod
    async def list_public(
        db: AsyncSession,
        *,
        page_key: str,
        scope_type: str,
        scope_id: uuid.UUID | None = None,
        page: int = 1,
        per_page: int = 20,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        now = datetime.now(timezone.utc)
        query = PageSection.active_query().options(selectinload(PageSection.items))
        if load_options:
            query = query.options(*load_options)
        for filter_clause in _scope_filter(
            PageSection,
            page_key=page_key,
            scope_type=scope_type,
            scope_id=scope_id,
            match_null_scope_id=True,
        ):
            query = query.where(filter_clause)
        query = (
            query.where(
                PageSection.is_enabled.is_(True),
                *_published_workflow_filter(PageSection, now),
            )
            .order_by(
                PageSection.display_order.asc(),
                PageSection.published_at.desc().nullslast(),
                PageSection.created_at.desc(),
            )
        )
        return await paginate_query(db, query, page=page, per_page=per_page)


class PartnershipSpotlightService:
    """Query helpers for admin spotlight management."""

    @staticmethod
    def _admin_query(
        *,
        status: str | None = None,
        search: str | None = None,
    ):
        query = PartnershipSpotlight.active_query()
        if status:
            query = query.where(PartnershipSpotlight.status == status)
        if search:
            query = query.where(
                ilike_any(
                    search,
                    PartnershipSpotlight.headline,
                    PartnershipSpotlight.summary,
                )
            )
        return query.order_by(
            PartnershipSpotlight.updated_at.desc(),
            PartnershipSpotlight.created_at.desc(),
        )

    @staticmethod
    async def list_admin(
        db: AsyncSession,
        *,
        status: str | None = None,
        search: str | None = None,
        page: int = 1,
        per_page: int = 20,
    ) -> PaginatedResult:
        query = PartnershipSpotlightService._admin_query(
            status=status,
            search=search,
        )
        return await paginate_query(db, query, page=page, per_page=per_page)


class PageSectionWorkflowService:
    """Apply the approved editorial workflow map to page sections."""

    @staticmethod
    async def transition(
        section: PageSection,
        action: str,
        user_id: uuid.UUID,
        note: str | None = None,
        *,
        db: AsyncSession | None = None,
    ) -> PageSection:
        previous_status = section.status
        transitions = ALLOWED_TRANSITIONS.get(section.status, set())
        next_status = transitions.get(action) if isinstance(transitions, dict) else None
        if next_status is None:
            raise ValueError(f"Invalid workflow transition: {section.status} -> {action}")

        now = datetime.now(timezone.utc)
        section.status = next_status
        section.workflow_status = next_status
        section.updated_by_id = user_id

        if action == "submit":
            section.submitted_by_id = user_id
            section.submitted_at = now
        elif action == "approve":
            section.reviewed_by_id = user_id
            section.reviewed_at = now
            section.approved_at = now
            section.approved_by_id = user_id
        elif action == "publish":
            section.published_at = now
            section.published_by_id = user_id
        elif action == "request_changes":
            section.reviewed_by_id = user_id
            section.reviewed_at = now
            section.revision_notes = note
        elif action == "unpublish":
            section.unpublished_by_id = user_id
            section.unpublished_at = now
        elif action == "archive":
            section.unpublished_by_id = user_id
            section.unpublished_at = now

        if db is not None:
            db.add(ContentWorkflowLog(
                content_type="page-sections",
                content_id=section.id,
                from_status=previous_status,
                to_status=next_status,
                action=action,
                actor_id=user_id,
                comments=note,
            ))

        return section


class PartnershipSpotlightWorkflowService:
    """Apply the approved editorial workflow map to partnership spotlights."""

    @staticmethod
    async def transition(
        spotlight: PartnershipSpotlight,
        action: str,
        user_id: uuid.UUID,
        note: str | None = None,
        *,
        db: AsyncSession | None = None,
    ) -> PartnershipSpotlight:
        previous_status = spotlight.status
        transitions = ALLOWED_TRANSITIONS.get(spotlight.status, set())
        next_status = transitions.get(action) if isinstance(transitions, dict) else None
        if next_status is None:
            raise ValueError(f"Invalid workflow transition: {spotlight.status} -> {action}")

        now = datetime.now(timezone.utc)
        spotlight.status = next_status
        spotlight.workflow_status = next_status

        if action == "submit":
            spotlight.submitted_by_id = user_id
            spotlight.submitted_at = now
        elif action == "approve":
            spotlight.reviewed_by_id = user_id
            spotlight.reviewed_at = now
            spotlight.approved_at = now
            spotlight.approved_by_id = user_id
        elif action == "publish":
            spotlight.published_at = now
            spotlight.published_by_id = user_id
        elif action == "request_changes":
            spotlight.reviewed_by_id = user_id
            spotlight.reviewed_at = now
            spotlight.revision_notes = note
        elif action == "unpublish":
            spotlight.unpublished_by_id = user_id
            spotlight.unpublished_at = now
        elif action == "archive":
            spotlight.unpublished_by_id = user_id
            spotlight.unpublished_at = now

        if db is not None:
            db.add(ContentWorkflowLog(
                content_type="partnership-spotlights",
                content_id=spotlight.id,
                from_status=previous_status,
                to_status=next_status,
                action=action,
                actor_id=user_id,
                comments=note,
            ))

        return spotlight


async def group_media_links(
    db: AsyncSession,
    entity_type: str,
    entity_id: uuid.UUID,
) -> dict[str, list[dict[str, Any]]]:
    now = datetime.now(timezone.utc)
    query = (
        select(MediaLink)
        .options(selectinload(MediaLink.media))
        .join(Media, MediaLink.media_id == Media.id)
        .where(
            MediaLink.deleted_at.is_(None),
            *_published_media_link_filter(now),
            Media.deleted_at.is_(None),
            Media.is_public.is_(True),
            MediaLink.entity_type == entity_type,
            MediaLink.entity_id == entity_id,
        )
        .order_by(MediaLink.display_order.asc(), MediaLink.created_at.asc())
    )
    result = await db.execute(query)
    grouped = _default_media_groups()
    for link in result.scalars().all():
        bucket = _normalize_role(link.role)
        if bucket is None:
            continue
        grouped[bucket].append(_serialize_media_link(link))
    return grouped


class HomepageCompositionService:
    """Compose page sections and partnership spotlights for public rendering."""

    @staticmethod
    async def compose(
        db: AsyncSession,
        page_key: str,
        scope_type: str,
        scope_id: uuid.UUID | None = None,
    ) -> dict[str, Any]:
        sections_result = await PageSectionService.list_public(
            db,
            page_key=page_key,
            scope_type=scope_type,
            scope_id=scope_id,
            per_page=100,
        )
        sections = sorted(_coerce_items(sections_result), key=_section_display_order)
        section_payloads = []
        for section in sections:
            section_media = await group_media_links(db, "page_section", section.id)
            section_payloads.append(await _serialize_section(db, section, section_media))

        spotlights = await _list_active_partnership_spotlights(db)
        spotlight_payloads = []
        partner_cache: dict[uuid.UUID, dict[str, Any] | None] = {}
        for spotlight in spotlights:
            partner_payload = partner_cache.get(spotlight.source_id)
            if spotlight.source_id not in partner_cache:
                partner_payload = await _get_research_partner_payload(spotlight.source_id)
                partner_cache[spotlight.source_id] = partner_payload
            spotlight_media = await group_media_links(db, "partnership_spotlight", spotlight.id)
            primary_cta = await _resolve_primary_cta(spotlight, partner_payload)
            spotlight_payloads.append(_serialize_spotlight(spotlight, spotlight_media, primary_cta))

        return {
            "page_key": page_key,
            "scope_type": scope_type,
            "scope_id": scope_id,
            "sections": section_payloads,
            "partnership_spotlights": spotlight_payloads,
        }


__all__ = [
    "ALLOWED_TRANSITIONS",
    "PageSectionService",
    "PageSectionWorkflowService",
    "PartnershipSpotlightService",
    "PartnershipSpotlightWorkflowService",
    "HomepageCompositionService",
    "group_media_links",
]
