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

from ..models import ContentWorkflowLog, Media, MediaLink, PageSection, PartnershipSpotlight, SectionItem
from ._base import ilike_any, paginate_query
from .content_workflow import ContentWorkflowService
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


class PageCmsReorderValidationError(ValueError):
    """Raised when a reorder batch does not exactly match its parent collection."""


class PageCmsReorderConflictError(ValueError):
    """Raised when a reorder request carries an outdated record revision."""


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


def _serialize_section(section: PageSection, media_groups: dict[str, list[dict[str, Any]]]) -> dict[str, Any]:
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

    @staticmethod
    async def reorder_sections(
        db: AsyncSession,
        *,
        page_key: str,
        scope_type: str,
        scope_id: uuid.UUID | None,
        entries: Sequence[Any],
        actor_id: uuid.UUID,
        authorize_edit: Callable[[PageSection], None] | None = None,
    ) -> list[PageSection]:
        query = PageSection.active_query().where(
            PageSection.page_key == page_key,
            PageSection.scope_type == scope_type,
            PageSection.scope_id.is_(None) if scope_id is None else PageSection.scope_id == scope_id,
        ).order_by(PageSection.display_order.asc(), PageSection.id.asc()).with_for_update()
        result = await db.execute(query)
        sections = list(result.scalars().all())
        PageSectionService._validate_reorder_entries(sections, entries)
        if authorize_edit is not None:
            for section in sections:
                authorize_edit(section)

        old_order, ordered_entries = PageSectionService._reorder_snapshots(sections, entries)
        new_order = [
            {"id": str(PageSectionService._entry_value(entry, "id")), "display_order": (index + 1) * 10}
            for index, entry in enumerate(ordered_entries)
        ]
        audit_fields = {"section_reorder": {"old_order": old_order, "new_order": new_order}}

        await ContentWorkflowService.reset_after_batch_reorder(
            db,
            sections,
            "page-sections",
            actor_id,
            changed_fields=audit_fields,
        )

        by_id = {section.id: section for section in sections}
        for index, entry in enumerate(ordered_entries, start=1):
            section = by_id[PageSectionService._entry_value(entry, "id")]
            section.display_order = index * 10
            section.revision += 1
            section.updated_by_id = actor_id

        await db.flush()
        return sorted(sections, key=lambda section: (section.display_order, section.id))

    @staticmethod
    async def reorder_section_items(
        db: AsyncSession,
        *,
        section_id: uuid.UUID,
        entries: Sequence[Any],
        actor_id: uuid.UUID,
        authorize_edit: Callable[[PageSection], None] | None = None,
    ) -> list[SectionItem]:
        section_query = PageSection.active_query().where(
            PageSection.id == section_id,
        ).with_for_update()
        section_result = await db.execute(section_query)
        section = section_result.scalars().all()
        if len(section) != 1:
            raise PageCmsReorderValidationError("Page section not found")

        item_query = SectionItem.active_query().where(
            SectionItem.page_section_id == section_id,
        ).order_by(SectionItem.display_order.asc(), SectionItem.id.asc()).with_for_update()
        item_result = await db.execute(item_query)
        items = list(item_result.scalars().all())
        PageSectionService._validate_reorder_entries(items, entries)
        if authorize_edit is not None:
            authorize_edit(section[0])

        old_order, ordered_entries = PageSectionService._reorder_snapshots(items, entries)
        new_order = [
            {"id": str(PageSectionService._entry_value(entry, "id")), "display_order": (index + 1) * 10}
            for index, entry in enumerate(ordered_entries)
        ]
        await ContentWorkflowService.reset_after_batch_reorder(
            db,
            section,
            "page-sections",
            actor_id,
            changed_fields={"section_item_reorder": {"old_order": old_order, "new_order": new_order}},
        )

        by_id = {item.id: item for item in items}
        for index, entry in enumerate(ordered_entries, start=1):
            item = by_id[PageSectionService._entry_value(entry, "id")]
            item.display_order = index * 10
            item.revision += 1

        await db.flush()
        return sorted(items, key=lambda item: (item.display_order, item.id))

    @staticmethod
    def _validate_reorder_entries(records: Sequence[Any], entries: Sequence[Any]) -> None:
        entry_ids = [PageSectionService._entry_value(entry, "id") for entry in entries]
        if not entry_ids:
            raise PageCmsReorderValidationError("Reorder entries are required")
        if len(entry_ids) != len(set(entry_ids)):
            raise PageCmsReorderValidationError("Reorder entries must not contain duplicate ids")

        records_by_id = {record.id: record for record in records}
        if set(entry_ids) != set(records_by_id):
            raise PageCmsReorderValidationError("Reorder entries must include every record in the requested parent")

        for entry in entries:
            record = records_by_id[PageSectionService._entry_value(entry, "id")]
            if record.revision != PageSectionService._entry_value(entry, "revision"):
                raise PageCmsReorderConflictError("Page composition changed; reload before saving order")

    @staticmethod
    def _reorder_snapshots(records: Sequence[Any], entries: Sequence[Any]) -> tuple[list[dict[str, Any]], list[Any]]:
        old_order = [
            {"id": str(record.id), "display_order": record.display_order}
            for record in sorted(records, key=lambda record: (record.display_order, record.id))
        ]
        ordered_entries = [
            entry
            for _, entry in sorted(
                enumerate(entries),
                key=lambda indexed_entry: (
                    PageSectionService._entry_value(indexed_entry[1], "display_order"),
                    indexed_entry[0],
                ),
            )
        ]
        return old_order, ordered_entries

    @staticmethod
    def _entry_value(entry: Any, field: str) -> Any:
        if isinstance(entry, dict):
            return entry[field]
        return getattr(entry, field)


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
            section_payloads.append(_serialize_section(section, section_media))

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
