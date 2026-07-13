"""Services for page CMS sections, workflow, and homepage composition."""

from __future__ import annotations

import uuid
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Sequence

from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ksu_common import PaginatedResult

from ..models import ContentWorkflowLog, Media, MediaLink, PageSection, PartnershipSpotlight, SectionItem
from ..schemas.page_cms import (
    PageCmsSourceSummary,
    PagePreviewResponse,
    PagePreviewSection,
    PageValidationIssue,
)
from ._base import ilike_any, paginate_query
from .content_workflow import ContentWorkflowService
from .page_cms_definitions import SECTION_DEFINITIONS
from .page_cms_sources import (
    PAGE_CMS_BULK_CHUNK_SIZE,
    PageCmsPreviewCapability,
    PageCmsSourceResolution,
    PageCmsSourceResolutionCache,
    PageCmsSourceResolutionState,
    PageCmsSourceService,
)
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
    "signingphoto": "signingPhoto",
    "signing-photo": "signingPhoto",
    "signing_photo": "signingPhoto",
}

MEDIA_GROUP_KEYS = (
    "heroImage",
    "mobileImage",
    "logos",
    "gallery",
    "video",
    "background",
    "poster",
    "signingPhoto",
)


class PageCmsReorderValidationError(ValueError):
    """Raised when a reorder batch does not exactly match its parent collection."""


class PageCmsReorderConflictError(ValueError):
    """Raised when a reorder request carries an outdated record revision."""


class PageCmsValidationError(ValueError):
    """Raised when completeness blockers prevent a forward workflow transition."""

    def __init__(self, issues: Sequence[PageValidationIssue]):
        super().__init__("Page section has blocking validation issues")
        self.issues = list(issues)


class PageCmsMixedScopeError(ValueError):
    """Raised when one source-resolution set crosses a page or scope boundary."""


@dataclass(frozen=True)
class ResolvedSectionItem:
    item: SectionItem
    source: PageCmsSourceSummary | None = None
    failure: PageCmsSourceResolutionState | str | None = None
    message: str | None = None

    @classmethod
    def from_resolution(
        cls,
        item: SectionItem,
        resolution: PageCmsSourceResolution,
    ) -> "ResolvedSectionItem":
        return cls(
            item=item,
            source=resolution.source,
            failure=None if resolution.state is PageCmsSourceResolutionState.RESOLVED else resolution.state,
            message=resolution.message,
        )


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
        MediaLink.archived_at.is_(None),
        or_(
            MediaLink.owner_scope_type != "club",
            MediaLink.owner_scope_type.is_(None),
            and_(
                MediaLink.is_published.is_(True),
                MediaLink.workflow_status == "published",
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


def _active_section_items(section: PageSection) -> list[SectionItem]:
    return sorted(
        (
            item
            for item in section.items
            if item.is_enabled and getattr(item, "deleted_at", None) is None
        ),
        key=lambda item: (item.display_order, str(item.id)),
    )


def _serialize_preview_section(
    section: PageSection,
    media_groups: dict[str, list[dict[str, Any]]],
    resolved_items: Sequence[ResolvedSectionItem],
) -> PagePreviewSection:
    payload = _serialize_section(section, media_groups)
    payload["workflow_status"] = section.workflow_status
    payload["revision"] = section.revision or 1
    payload["is_enabled"] = section.is_enabled if section.is_enabled is not None else True
    resolved_by_id = {entry.item.id: entry for entry in resolved_items}
    items_by_id = {item.id: item for item in _active_section_items(section)}
    for item_payload in payload["items"]:
        item = items_by_id[item_payload["id"]]
        resolution = resolved_by_id.get(item.id)
        item_payload.update({
            "source_type": item.source_type,
            "source_id": item.source_id,
            "editorial_overrides": item.editorial_overrides,
            "source": (
                resolution.source.model_dump()
                if resolution is not None and resolution.source is not None
                else None
            ),
        })
    return PagePreviewSection.model_validate(payload)


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
    async def list_preview(
        db: AsyncSession,
        *,
        page_key: str,
        scope_type: str,
        scope_id: uuid.UUID | None,
    ) -> list[PageSection]:
        query = PageSectionService._admin_query(
            page_key=page_key,
            scope_type=scope_type,
            scope_id=scope_id,
        ).where(
            PageSection.scope_id.is_(None) if scope_id is None else PageSection.scope_id == scope_id,
            PageSection.status != "archived",
        )
        result = await db.execute(query)
        return list(result.scalars().all())

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
        query = (
            PageSection.active_query()
            .where(
                PageSection.page_key == page_key,
                PageSection.scope_type == scope_type,
                PageSection.scope_id.is_(None) if scope_id is None else PageSection.scope_id == scope_id,
            )
            .order_by(PageSection.display_order.asc(), PageSection.id.asc())
            .with_for_update()
            .execution_options(populate_existing=True)
        )
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
        authorize_parent: Callable[[PageSection], Awaitable[None]] | None = None,
    ) -> list[SectionItem]:
        section_query = (
            PageSection.active_query()
            .where(PageSection.id == section_id)
            .with_for_update()
            .execution_options(populate_existing=True)
        )
        section_result = await db.execute(section_query)
        section = section_result.scalars().all()
        if len(section) != 1:
            raise PageCmsReorderValidationError("Page section not found")
        if authorize_parent is not None:
            await authorize_parent(section[0])

        item_query = (
            SectionItem.active_query()
            .where(SectionItem.page_section_id == section_id)
            .order_by(SectionItem.display_order.asc(), SectionItem.id.asc())
            .with_for_update()
            .execution_options(populate_existing=True)
        )
        item_result = await db.execute(item_query)
        items = list(item_result.scalars().all())
        PageSectionService._validate_reorder_entries(items, entries)

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


class PageSectionValidationService:
    """Validate section completeness against canonical section definitions."""

    SOURCE_FAILURE_CODES = {
        "unavailable": "source_unavailable",
        "expired": "source_expired",
        "inaccessible": "source_inaccessible",
        "provider_error": "source_provider_error",
        "unsupported_type": "source_unsupported_type",
        "preview_unsupported": "source_preview_unsupported",
    }

    SOURCE_ISSUE_MESSAGES = {
        "source_unavailable": "Source is unavailable.",
        "source_expired": "Source has expired.",
        "source_inaccessible": "Source is inaccessible.",
        "source_provider_error": "Source provider is unavailable.",
        "source_unsupported_type": "Source type is unsupported.",
        "source_preview_unsupported": "Draft preview is unsupported for this source type.",
    }

    @staticmethod
    def _issue(
        section: PageSection,
        code: str,
        message: str,
        *,
        item: SectionItem | None = None,
        field: str | None = None,
        blocking: bool = True,
    ) -> PageValidationIssue:
        return PageValidationIssue(
            code=code,
            severity="error" if blocking else "warning",
            section_id=section.id,
            item_id=item.id if item is not None else None,
            field=field,
            message=message,
            blocking=blocking,
        )

    @staticmethod
    def _valid_cta(label: Any, target: Any) -> bool:
        return bool(
            isinstance(label, str)
            and label.strip()
            and isinstance(target, str)
            and target.strip().startswith(("/", "https://", "http://"))
        )

    @staticmethod
    def _summary_is_expired(source: PageCmsSourceSummary) -> bool:
        if source.status.casefold() in {"expired", "inactive", "archived"}:
            return True
        now = datetime.now(timezone.utc)
        for field in ("expires_at", "valid_to", "partnership_end", "mou_expiry_date"):
            value = source.metadata.get(field)
            if value is None:
                continue
            if isinstance(value, datetime):
                parsed = value if value.tzinfo is not None else value.replace(tzinfo=timezone.utc)
            elif isinstance(value, str):
                try:
                    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
                except ValueError:
                    continue
                if parsed.tzinfo is None:
                    parsed = parsed.replace(tzinfo=timezone.utc)
            else:
                continue
            if parsed < now:
                return True
        return False

    @staticmethod
    def _setting_type_matches(value: Any, expected_type: str) -> bool:
        if expected_type == "string":
            return isinstance(value, str)
        if expected_type == "integer":
            return isinstance(value, int) and not isinstance(value, bool)
        if expected_type == "number":
            return isinstance(value, (int, float)) and not isinstance(value, bool)
        if expected_type == "boolean":
            return isinstance(value, bool)
        if expected_type in {"repeatable", "list"}:
            return isinstance(value, list)
        if expected_type == "string_list":
            return isinstance(value, list) and all(isinstance(item, str) for item in value)
        if expected_type == "cta":
            return isinstance(value, dict)
        if expected_type == "datetime":
            if isinstance(value, datetime):
                return True
            if not isinstance(value, str):
                return False
            try:
                datetime.fromisoformat(value.replace("Z", "+00:00"))
            except ValueError:
                return False
            return True
        return False

    @staticmethod
    def _validate_settings(section: PageSection, definition) -> list[PageValidationIssue]:
        issues: list[PageValidationIssue] = []
        if section.settings is not None and not isinstance(section.settings, dict):
            return [PageSectionValidationService._issue(
                section,
                "invalid_setting_type",
                "Section settings must be an object.",
                field="settings",
            )]
        settings = section.settings or {}
        for key in sorted(set(settings) - set(definition.settings_schema)):
            issues.append(PageSectionValidationService._issue(
                section,
                "unknown_setting",
                "Setting is not supported by this section layout.",
                field=f"settings.{key}",
            ))

        for key, rules in definition.settings_schema.items():
            field = f"settings.{key}"
            if key not in settings:
                if rules.get("required"):
                    issues.append(PageSectionValidationService._issue(
                        section,
                        "missing_required_setting",
                        "Required setting is missing.",
                        field=field,
                    ))
                continue
            value = settings[key]
            expected_type = rules.get("type")
            if not isinstance(expected_type, str) or not PageSectionValidationService._setting_type_matches(
                value,
                expected_type,
            ):
                issues.append(PageSectionValidationService._issue(
                    section,
                    "invalid_setting_type",
                    "Setting has an invalid value type.",
                    field=field,
                ))
                continue
            enum_values = rules.get("enum")
            if enum_values is not None and value not in enum_values:
                issues.append(PageSectionValidationService._issue(
                    section,
                    "invalid_setting_value",
                    "Setting value is not one of the allowed options.",
                    field=field,
                ))
            if isinstance(value, (int, float)) and not isinstance(value, bool):
                minimum = rules.get("minimum")
                maximum = rules.get("maximum")
                if (minimum is not None and value < minimum) or (maximum is not None and value > maximum):
                    issues.append(PageSectionValidationService._issue(
                        section,
                        "setting_out_of_range",
                        "Setting value is outside the allowed range.",
                        field=field,
                    ))
            if isinstance(value, (list, str)):
                min_items = rules.get("min_items")
                max_items = rules.get("max_items")
                min_length = rules.get("min_length")
                max_length = rules.get("max_length")
                if (
                    (min_items is not None and len(value) < min_items)
                    or (max_items is not None and len(value) > max_items)
                    or (min_length is not None and len(value) < min_length)
                    or (max_length is not None and len(value) > max_length)
                ):
                    issues.append(PageSectionValidationService._issue(
                        section,
                        "setting_limit_exceeded",
                        "Setting exceeds the allowed size.",
                        field=field,
                    ))
            if expected_type == "cta":
                allowed_cta_keys = {"label", "href"}
                if set(value) - allowed_cta_keys or not PageSectionValidationService._valid_cta(
                    value.get("label"),
                    value.get("href"),
                ):
                    issues.append(PageSectionValidationService._issue(
                        section,
                        "invalid_cta",
                        "CTA setting requires only a label and valid URL.",
                        field=field,
                    ))
        return issues

    @staticmethod
    def validate(
        section: PageSection,
        resolved_items: Sequence[ResolvedSectionItem],
        media_groups: dict[str, list[dict[str, Any]]],
    ) -> list[PageValidationIssue]:
        definition = SECTION_DEFINITIONS.get(section.layout_variant)
        if definition is None:
            return [PageSectionValidationService._issue(
                section,
                "unknown_layout_variant",
                f"Layout variant {section.layout_variant} has no canonical definition.",
                field="layout_variant",
            )]

        issues: list[PageValidationIssue] = []
        items = _active_section_items(section)
        if section.scope_type not in definition.allowed_scopes:
            issues.append(PageSectionValidationService._issue(
                section,
                "layout_scope_not_allowed",
                "Section layout is not allowed for this page scope.",
                field="scope_type",
            ))
        for field in definition.required_fields:
            value = getattr(section, field, None)
            if value is None or (isinstance(value, str) and not value.strip()):
                issues.append(PageSectionValidationService._issue(
                    section,
                    "missing_required_field",
                    f"{field.replace('_', ' ').title()} is required.",
                    field=field,
                ))

        if len(items) < definition.min_items:
            issues.append(PageSectionValidationService._issue(
                section,
                "empty_required_section",
                f"This section requires at least {definition.min_items} item(s).",
                field="items",
            ))
        if len(items) > definition.max_items:
            issues.append(PageSectionValidationService._issue(
                section,
                "too_many_items",
                f"This section allows at most {definition.max_items} item(s).",
                field="items",
            ))

        for item in items:
            if item.item_type == "reference":
                if item.source_type not in definition.allowed_source_types:
                    issues.append(PageSectionValidationService._issue(
                        section,
                        "source_type_not_allowed",
                        "Source type is not allowed for this section layout.",
                        item=item,
                        field="source_type",
                    ))
            elif item.item_type not in definition.allowed_item_types:
                issues.append(PageSectionValidationService._issue(
                    section,
                    "item_type_not_allowed",
                    "Item type is not allowed for this section layout.",
                    item=item,
                    field="item_type",
                ))

        allowed_media_buckets = {
            _normalize_role(role) or role
            for role in definition.media_roles
        }
        for bucket, linked_media in media_groups.items():
            if linked_media and bucket not in allowed_media_buckets:
                issues.append(PageSectionValidationService._issue(
                    section,
                    "unknown_media_role",
                    "Media role is not allowed for this section layout.",
                    field=bucket,
                ))
        for role, media_definition in definition.media_roles.items():
            bucket = _normalize_role(role) or role
            linked_media = media_groups.get(bucket, [])
            if media_definition.required and not linked_media:
                issues.append(PageSectionValidationService._issue(
                    section,
                    f"missing_{role}",
                    f"{media_definition.label} is required.",
                    field=role,
                ))
            if not media_definition.multiple and len(linked_media) > 1:
                issues.append(PageSectionValidationService._issue(
                    section,
                    "too_many_media",
                    f"{media_definition.label} accepts only one attachment.",
                    field=role,
                ))
            if media_definition.media_type != "image":
                mime_prefix = f"{media_definition.media_type}/"
            else:
                mime_prefix = "image/"
            for linked in linked_media:
                media = linked.get("media") if isinstance(linked, dict) else None
                actual_type = media.get("media_type") if isinstance(media, dict) else None
                mime_type = media.get("mime_type") if isinstance(media, dict) else None
                if actual_type != media_definition.media_type or not (
                    isinstance(mime_type, str) and mime_type.startswith(mime_prefix)
                ):
                    issues.append(PageSectionValidationService._issue(
                        section,
                        "invalid_media_type",
                        "Media type is not allowed for this role.",
                        field=role,
                    ))
                    continue
                if media_definition.media_type != "image":
                    continue
                alt_text = media.get("alt_text") if isinstance(media, dict) else None
                if not isinstance(alt_text, str) or not alt_text.strip():
                    issues.append(PageSectionValidationService._issue(
                        section,
                        "missing_media_alt",
                        f"{media_definition.label} is missing alt text.",
                        field=f"{role}.alt_text",
                        blocking=False,
                    ))

        for item in items:
            if item.item_type == "cta" and not PageSectionValidationService._valid_cta(item.cta_label, item.cta_url):
                issues.append(PageSectionValidationService._issue(
                    section,
                    "invalid_cta",
                    "CTA items require a label and a root-relative or HTTP(S) URL.",
                    item=item,
                    field="cta_url",
                ))

        issues.extend(PageSectionValidationService._validate_settings(section, definition))

        resolved_by_item_id = {entry.item.id: entry for entry in resolved_items}
        seen_sources: set[tuple[str, uuid.UUID]] = set()
        for item in items:
            if item.source_type is None or item.source_id is None:
                continue
            if item.source_type not in definition.allowed_source_types:
                continue
            source_key = (item.source_type, item.source_id)
            if source_key in seen_sources:
                issues.append(PageSectionValidationService._issue(
                    section,
                    "duplicate_source",
                    "The same source record cannot be selected more than once.",
                    item=item,
                    field="source_id",
                ))
            seen_sources.add(source_key)

            resolution = resolved_by_item_id.get(item.id)
            failure = resolution.failure if resolution is not None else "unavailable"
            if isinstance(failure, PageCmsSourceResolutionState):
                failure = failure.value
            source = resolution.source if resolution is not None else None
            if failure is None and source is None:
                failure = "unavailable"
            if failure is None and source is not None and PageSectionValidationService._summary_is_expired(source):
                failure = "expired"
            if failure is None and source is not None and not source.selectable and source.status == "published":
                failure = "expired"
            if failure is None and source is not None and not source.selectable:
                failure = "unavailable"
            if failure is not None:
                code = PageSectionValidationService.SOURCE_FAILURE_CODES.get(failure, "source_unavailable")
                issues.append(PageSectionValidationService._issue(
                    section,
                    code,
                    PageSectionValidationService.SOURCE_ISSUE_MESSAGES[code],
                    item=item,
                    field="source_id",
                ))

            if item.source_type == "public_stat" and (
                source is None or source.metadata.get("verified") is not True
            ):
                issues.append(PageSectionValidationService._issue(
                    section,
                    "unverified_fact",
                    "Institutional facts must come from a verified source.",
                    item=item,
                    field="source_id",
                ))

        return issues

    @staticmethod
    async def resolve_items(
        db: AsyncSession,
        section: PageSection,
        preview_capability: PageCmsPreviewCapability | None,
    ) -> list[ResolvedSectionItem]:
        resolved_by_section = await PageSectionValidationService.resolve_items_for_sections(
            db,
            [section],
            preview_capability,
        )
        return resolved_by_section.get(section.id, [])

    @staticmethod
    async def resolve_items_for_sections(
        db: AsyncSession,
        sections: Sequence[PageSection],
        preview_capability: PageCmsPreviewCapability | None,
        resolution_cache: PageCmsSourceResolutionCache | None = None,
    ) -> dict[uuid.UUID, list[ResolvedSectionItem]]:
        if not sections:
            return {}
        expected_destination = (
            sections[0].page_key,
            sections[0].scope_type,
            sections[0].scope_id,
        )
        if any(
            (section.page_key, section.scope_type, section.scope_id) != expected_destination
            for section in sections[1:]
        ):
            raise PageCmsMixedScopeError(
                "Page CMS source resolution requires one page key and destination scope"
            )
        references = [
            (item.source_type, item.source_id)
            for section in sections
            for item in _active_section_items(section)
            if item.source_type is not None and item.source_id is not None
        ]
        destination_scope_type = sections[0].scope_type
        destination_scope_id = sections[0].scope_id
        resolve_kwargs = {
            "destination_scope_type": destination_scope_type,
            "destination_scope_id": destination_scope_id,
            "preview_capability": preview_capability,
        }
        if resolution_cache is not None:
            resolve_kwargs["resolution_cache"] = resolution_cache
        resolutions = await PageCmsSourceService.resolve_many(
            db,
            references,
            **resolve_kwargs,
        ) if references else {}
        return {
            section.id: [
                ResolvedSectionItem.from_resolution(
                    item,
                    resolutions[(item.source_type, item.source_id)],
                )
                for item in _active_section_items(section)
                if item.source_type is not None and item.source_id is not None
            ]
            for section in sections
        }

    @staticmethod
    async def validate_for_section(
        db: AsyncSession,
        section: PageSection,
        preview_capability: PageCmsPreviewCapability | None,
    ) -> list[PageValidationIssue]:
        resolved_items = await PageSectionValidationService.resolve_items(db, section, preview_capability)
        media_groups = await group_preview_media_links(db, "page_section", section.id)
        return PageSectionValidationService.validate(section, resolved_items, media_groups)


class PageSectionWorkflowService:
    """Apply the approved editorial workflow map to page sections."""

    @staticmethod
    async def transition(
        section: PageSection,
        action: str,
        user_id: uuid.UUID,
        note: str | None = None,
        *,
        db: AsyncSession,
        preview_capability: PageCmsPreviewCapability | None = None,
    ) -> PageSection:
        previous_status = section.status
        transitions = ALLOWED_TRANSITIONS.get(section.status, set())
        next_status = transitions.get(action) if isinstance(transitions, dict) else None
        if next_status is None:
            raise ValueError(f"Invalid workflow transition: {section.status} -> {action}")

        if action in {"submit", "approve", "publish"}:
            issues = await PageSectionValidationService.validate_for_section(
                db,
                section,
                preview_capability,
            )
            if any(issue.blocking for issue in issues):
                raise PageCmsValidationError(issues)

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
        bucket = _normalize_role(link.role) or link.role
        grouped.setdefault(bucket, []).append(_serialize_media_link(link))
    return grouped


async def group_preview_media_links(
    db: AsyncSession,
    entity_type: str,
    entity_id: uuid.UUID,
) -> dict[str, list[dict[str, Any]]]:
    grouped = await group_preview_media_links_many(db, entity_type, [entity_id])
    return grouped.get(entity_id, _default_media_groups())


async def group_preview_media_links_many(
    db: AsyncSession,
    entity_type: str,
    entity_ids: Sequence[uuid.UUID],
) -> dict[uuid.UUID, dict[str, list[dict[str, Any]]]]:
    if not entity_ids:
        return {}
    unique_entity_ids = list(dict.fromkeys(entity_ids))
    grouped = {entity_id: _default_media_groups() for entity_id in unique_entity_ids}
    for start in range(0, len(unique_entity_ids), PAGE_CMS_BULK_CHUNK_SIZE):
        entity_id_chunk = unique_entity_ids[start:start + PAGE_CMS_BULK_CHUNK_SIZE]
        query = (
            select(MediaLink)
            .options(selectinload(MediaLink.media))
            .join(Media, MediaLink.media_id == Media.id)
            .where(
                MediaLink.deleted_at.is_(None),
                MediaLink.archived_at.is_(None),
                Media.deleted_at.is_(None),
                MediaLink.entity_type == entity_type,
                MediaLink.entity_id.in_(entity_id_chunk),
            )
            .order_by(MediaLink.entity_id.asc(), MediaLink.display_order.asc(), MediaLink.created_at.asc())
        )
        result = await db.execute(query)
        for link in result.scalars().all():
            bucket = _normalize_role(link.role) or link.role
            grouped.setdefault(link.entity_id, _default_media_groups()).setdefault(bucket, []).append(
                _serialize_media_link(link)
            )
    return grouped


class PagePreviewCompositionService:
    """Compose an authorised draft page without changing public publication filters."""

    @staticmethod
    async def compose(
        db: AsyncSession,
        page_key: str,
        scope_type: str,
        scope_id: uuid.UUID | None,
        *,
        preview_capability: PageCmsPreviewCapability,
    ) -> PagePreviewResponse:
        sections = await PageSectionService.list_preview(
            db,
            page_key=page_key,
            scope_type=scope_type,
            scope_id=scope_id,
        )
        sections = sorted(sections, key=_section_display_order)
        resolved_by_section = await PageSectionValidationService.resolve_items_for_sections(
            db,
            sections,
            preview_capability,
        )
        media_by_section = await group_preview_media_links_many(
            db,
            "page_section",
            [section.id for section in sections],
        )
        section_payloads: list[PagePreviewSection] = []
        issues: list[PageValidationIssue] = []
        for section in sections:
            resolved_items = resolved_by_section.get(section.id, [])
            media_groups = media_by_section.get(section.id, _default_media_groups())
            section_issues = PageSectionValidationService.validate(section, resolved_items, media_groups)
            issues.extend(section_issues)
            section_payloads.append(_serialize_preview_section(section, media_groups, resolved_items))

        return PagePreviewResponse(
            page_key=page_key,
            scope_type=scope_type,
            scope_id=scope_id,
            sections=section_payloads,
            issues=issues,
        )


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
    "ResolvedSectionItem",
    "PageCmsValidationError",
    "PageCmsMixedScopeError",
    "PageSectionValidationService",
    "PagePreviewCompositionService",
    "PageSectionWorkflowService",
    "PartnershipSpotlightService",
    "PartnershipSpotlightWorkflowService",
    "HomepageCompositionService",
    "group_media_links",
    "group_preview_media_links",
    "group_preview_media_links_many",
]
