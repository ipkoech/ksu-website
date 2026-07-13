"""Search and resolution adapters for records referenced by Page CMS sections."""

from __future__ import annotations

import math
import uuid
from datetime import date, datetime, timezone
from typing import Any

from sqlalchemy import false, or_, select
from sqlalchemy.orm import selectinload

from ksu_common import PaginatedResult

from ..models import Department, Event, News, Person, Programme, School, StaffAssignment
from ..schemas.page_cms import PageCmsSourceSummary
from ._base import ilike_any, paginate_query
from .research_partners import ResearchPartnersProxyService
from .stats import public_stats

SUPPORTED_SOURCE_TYPES = frozenset(
    {"programme", "news", "event", "person", "research_partner", "public_stat"}
)
PUBLIC_STAT_NAMESPACE = uuid.UUID("64a394c9-9dab-4807-90ef-e05cbf3dde8e")


def _media_url(media: Any | None) -> str | None:
    if media is None:
        return None
    return getattr(media, "thumbnail_url", None) or getattr(media, "url", None)


def _public_content_filters(model, now: datetime):
    return (
        model.deleted_at.is_(None),
        model.archived_at.is_(None),
        model.is_public.is_(True),
        model.is_published.is_(True),
        model.status == "published",
        or_(model.published_at.is_(None), model.published_at <= now),
        or_(model.scheduled_publish_at.is_(None), model.scheduled_publish_at <= now),
        or_(model.valid_from.is_(None), model.valid_from <= now),
        or_(model.valid_to.is_(None), model.valid_to > now),
        or_(model.expires_at.is_(None), model.expires_at > now),
        model.unpublished_at.is_(None),
    )


def _content_is_selectable(item: Any, now: datetime) -> bool:
    return bool(
        item.deleted_at is None
        and item.archived_at is None
        and item.is_public
        and item.is_published
        and item.status == "published"
        and (item.published_at is None or item.published_at <= now)
        and (item.scheduled_publish_at is None or item.scheduled_publish_at <= now)
        and (item.valid_from is None or item.valid_from <= now)
        and (item.valid_to is None or item.valid_to > now)
        and (item.expires_at is None or item.expires_at > now)
        and item.unpublished_at is None
    )


def _apply_content_scope(query, model, scope_type: str, scope_id: uuid.UUID | None):
    if scope_type == "university":
        return query.where(or_(model.scope_type.is_(None), model.scope_type == "university"))
    return query.where(model.scope_type == scope_type, model.scope_id == scope_id)


def _format_level(value: str) -> str:
    return value.replace("_", " ").title()


def _programme_summary(item: Programme) -> PageCmsSourceSummary:
    secondary = " | ".join(part for part in (item.code, _format_level(item.level)) if part)
    return PageCmsSourceSummary(
        id=item.id,
        source_type="programme",
        label=item.name,
        secondary_label=secondary or None,
        status="active" if item.is_active else "inactive",
        thumbnail_url=_media_url(item.cover_image),
        metadata={
            "code": item.code,
            "level": item.level,
            "duration": item.duration,
            "department_id": str(item.department_id),
        },
        selectable=bool(item.is_active and item.deleted_at is None),
    )


def _news_summary(item: News, now: datetime) -> PageCmsSourceSummary:
    return PageCmsSourceSummary(
        id=item.id,
        source_type="news",
        label=item.title,
        secondary_label=item.summary,
        status=item.status,
        published_at=item.published_at,
        thumbnail_url=_media_url(item.featured_media),
        metadata={"slug": item.slug, "scope_type": item.scope_type, "scope_id": item.scope_id},
        selectable=_content_is_selectable(item, now),
    )


def _event_summary(item: Event, now: datetime) -> PageCmsSourceSummary:
    secondary = item.location or item.summary
    return PageCmsSourceSummary(
        id=item.id,
        source_type="event",
        label=item.title,
        secondary_label=secondary,
        status=item.status,
        published_at=item.published_at,
        thumbnail_url=_media_url(item.featured_media),
        metadata={
            "slug": item.slug,
            "start_date": item.start_date,
            "end_date": item.end_date,
            "location": item.location,
            "scope_type": item.scope_type,
            "scope_id": item.scope_id,
        },
        selectable=_content_is_selectable(item, now),
    )


def _current_assignment(person: Person) -> StaffAssignment | None:
    assignments = [
        assignment
        for assignment in person.assignments
        if assignment.deleted_at is None
        and assignment.status == "active"
        and assignment.is_public
        and (assignment.end_date is None or assignment.end_date >= datetime.now(timezone.utc).date())
    ]
    assignments.sort(key=lambda item: (not item.is_primary, item.hierarchy_level, item.display_order, str(item.id)))
    return assignments[0] if assignments else None


def _person_summary(item: Person) -> PageCmsSourceSummary:
    assignment = _current_assignment(item)
    secondary = (
        assignment.title if assignment and assignment.title
        else item.institutional_role or item.academic_rank
    )
    return PageCmsSourceSummary(
        id=item.id,
        source_type="person",
        label=item.full_name,
        secondary_label=secondary,
        status="active" if item.is_active else "inactive",
        thumbnail_url=_media_url(item.photo),
        metadata={
            "department_id": str(item.department_id) if item.department_id else None,
            "assignment_id": str(assignment.id) if assignment else None,
            "role": assignment.role if assignment else item.institutional_role,
        },
        selectable=bool(item.deleted_at is None and item.is_active and item.is_public),
    )


def _partner_date(value: Any) -> date | None:
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        try:
            return date.fromisoformat(value[:10])
        except ValueError:
            return None
    return None


def _partner_is_public(item: dict[str, Any]) -> bool:
    today = date.today()
    expiry_dates = [
        parsed
        for field in ("partnership_end", "mou_expiry_date")
        if (parsed := _partner_date(item.get(field))) is not None
    ]
    return bool(
        item.get("deleted_at") is None
        and item.get("is_active", True)
        and item.get("is_public", True)
        and item.get("status") == "active"
        and all(expiry >= today for expiry in expiry_dates)
    )


def _partner_summary(item: dict[str, Any]) -> PageCmsSourceSummary:
    status = str(item.get("status") or "inactive")
    secondary = item.get("acronym") or item.get("country") or item.get("partner_type")
    return PageCmsSourceSummary(
        id=uuid.UUID(str(item["id"])),
        source_type="research_partner",
        label=str(item.get("name") or item.get("title") or item["id"]),
        secondary_label=str(secondary) if secondary else None,
        status=status,
        thumbnail_url=item.get("logo_url") or item.get("cover_image_url"),
        metadata={
            key: item.get(key)
            for key in (
                "slug", "acronym", "partner_type", "partnership_level", "country", "website",
                "partnership_end", "mou_expiry_date",
            )
            if item.get(key) is not None
        },
        selectable=_partner_is_public(item),
    )


def _stat_id(key: str) -> uuid.UUID:
    return uuid.uuid5(PUBLIC_STAT_NAMESPACE, key)


def _stat_summary(item: Any, scope: str) -> PageCmsSourceSummary:
    value = f"{item.value:g}" if isinstance(item.value, float) else str(item.value)
    return PageCmsSourceSummary(
        id=_stat_id(item.key),
        source_type="public_stat",
        label=item.label,
        secondary_label=f"{value}{item.suffix}",
        status="verified",
        metadata={
            "key": item.key,
            "value": item.value,
            "suffix": item.suffix,
            "description": item.description,
            "href": item.href,
            "scope": scope,
            "verified": True,
        },
        selectable=True,
    )


def _map_page(result: PaginatedResult, mapper) -> PaginatedResult:
    return PaginatedResult(items=[mapper(item) for item in result.items], meta=result.meta)


class PageCmsSourceService:
    """Dispatch source searches and resolution through explicit source adapters."""

    @staticmethod
    def validate_source_type(source_type: str) -> str:
        if source_type not in SUPPORTED_SOURCE_TYPES:
            raise ValueError(f"Unsupported Page CMS source type: {source_type}")
        return source_type

    @staticmethod
    async def search(
        db,
        source_type: str,
        query: str,
        scope_type: str,
        scope_id: uuid.UUID | None,
        page: int,
        per_page: int,
    ) -> PaginatedResult:
        PageCmsSourceService.validate_source_type(source_type)
        page = max(1, page)
        per_page = max(1, min(50, per_page))
        query = query.strip()

        if source_type == "programme":
            statement = select(Programme).options(selectinload(Programme.cover_image)).where(
                Programme.deleted_at.is_(None), Programme.is_active.is_(True)
            )
            if scope_type == "school":
                statement = statement.join(Department).where(Department.school_id == scope_id)
            elif scope_type != "university":
                statement = statement.where(false())
            if query:
                statement = statement.where(ilike_any(query, Programme.name, Programme.code, Programme.level))
            statement = statement.order_by(Programme.display_order.asc(), Programme.name.asc(), Programme.id.asc())
            result = await paginate_query(db, statement, page=page, per_page=per_page)
            return _map_page(result, _programme_summary)

        if source_type in {"news", "event"}:
            model = News if source_type == "news" else Event
            media_relation = News.featured_media if model is News else Event.featured_media
            now = datetime.now(timezone.utc)
            statement = select(model).options(selectinload(media_relation)).where(*_public_content_filters(model, now))
            statement = _apply_content_scope(statement, model, scope_type, scope_id)
            if query:
                statement = statement.where(ilike_any(query, model.title, model.summary))
            if model is News:
                statement = statement.order_by(News.published_at.desc().nullslast(), News.title.asc(), News.id.asc())
                mapper = lambda item: _news_summary(item, now)
            else:
                statement = statement.order_by(Event.start_date.asc(), Event.title.asc(), Event.id.asc())
                mapper = lambda item: _event_summary(item, now)
            result = await paginate_query(db, statement, page=page, per_page=per_page)
            return _map_page(result, mapper)

        if source_type == "person":
            statement = select(Person).options(
                selectinload(Person.photo), selectinload(Person.assignments)
            ).where(Person.deleted_at.is_(None), Person.is_active.is_(True), Person.is_public.is_(True))
            if scope_type != "university":
                statement = statement.join(StaffAssignment).where(
                    StaffAssignment.deleted_at.is_(None),
                    StaffAssignment.entity_type == scope_type,
                    StaffAssignment.entity_id == scope_id,
                    StaffAssignment.status == "active",
                    StaffAssignment.is_public.is_(True),
                    or_(StaffAssignment.end_date.is_(None), StaffAssignment.end_date >= date.today()),
                ).distinct()
            if query:
                statement = statement.where(ilike_any(query, Person.full_name, Person.academic_rank))
            statement = statement.order_by(Person.full_name.asc(), Person.id.asc())
            result = await paginate_query(db, statement, page=page, per_page=per_page)
            return _map_page(result, _person_summary)

        if source_type == "research_partner":
            payload = await ResearchPartnersProxyService.list_partners(
                page=page,
                per_page=per_page,
                search=query or None,
                status="active",
                is_active=True,
            )
            return PaginatedResult(
                items=[
                    _partner_summary(item)
                    for item in payload.get("data") or []
                    if _partner_is_public(item)
                ],
                meta=payload.get("meta") or {"page": page, "per_page": per_page},
            )

        return await PageCmsSourceService._search_stats(db, query, scope_type, scope_id, page, per_page)

    @staticmethod
    async def resolve(
        db,
        source_type: str,
        source_id: uuid.UUID,
        preview: bool = False,
    ) -> PageCmsSourceSummary | None:
        PageCmsSourceService.validate_source_type(source_type)
        now = datetime.now(timezone.utc)

        if source_type == "programme":
            statement = select(Programme).options(selectinload(Programme.cover_image)).where(
                Programme.id == source_id, Programme.deleted_at.is_(None)
            )
            if not preview:
                statement = statement.where(Programme.is_active.is_(True))
            item = (await db.execute(statement)).scalar_one_or_none()
            return _programme_summary(item) if item else None

        if source_type in {"news", "event"}:
            model = News if source_type == "news" else Event
            media_relation = News.featured_media if model is News else Event.featured_media
            statement = select(model).options(selectinload(media_relation)).where(
                model.id == source_id, model.deleted_at.is_(None)
            )
            if not preview:
                statement = statement.where(*_public_content_filters(model, now))
            item = (await db.execute(statement)).scalar_one_or_none()
            if item is None:
                return None
            return _news_summary(item, now) if model is News else _event_summary(item, now)

        if source_type == "person":
            statement = select(Person).options(
                selectinload(Person.photo), selectinload(Person.assignments)
            ).where(Person.id == source_id, Person.deleted_at.is_(None))
            if not preview:
                statement = statement.where(Person.is_active.is_(True), Person.is_public.is_(True))
            item = (await db.execute(statement)).scalar_one_or_none()
            return _person_summary(item) if item else None

        if source_type == "research_partner":
            item = await ResearchPartnersProxyService.find_partner_by_id(source_id, per_page=50)
            return _partner_summary(item) if item and _partner_is_public(item) else None

        for scope_type in ("university", "homepage"):
            result = await PageCmsSourceService._search_stats(db, "", scope_type, None, 1, 50)
            match = next((item for item in result.items if item.id == source_id), None)
            if match:
                return match
        return None

    @staticmethod
    async def _search_stats(
        db,
        query: str,
        scope_type: str,
        scope_id: uuid.UUID | None,
        page: int,
        per_page: int,
    ) -> PaginatedResult:
        stats_scope = scope_type
        slug = None
        if scope_type == "school":
            school = (await db.execute(
                select(School).where(School.id == scope_id, School.deleted_at.is_(None), School.is_active.is_(True))
            )).scalar_one_or_none()
            if school is None:
                return PaginatedResult(items=[], meta={"page": page, "per_page": per_page, "total": 0, "pages": 0})
            slug = school.slug
        elif scope_type not in {"homepage", "university"}:
            return PaginatedResult(items=[], meta={"page": page, "per_page": per_page, "total": 0, "pages": 0})

        response = await public_stats(db, scope=stats_scope, slug=slug)
        summaries = [_stat_summary(item, response.scope) for item in response.stats] if response else []
        if query:
            term = query.casefold()
            summaries = [
                item for item in summaries
                if term in item.label.casefold()
                or term in str(item.metadata.get("description", "")).casefold()
            ]
        summaries.sort(key=lambda item: (item.label.casefold(), str(item.id)))
        total = len(summaries)
        start = (page - 1) * per_page
        return PaginatedResult(
            items=summaries[start:start + per_page],
            meta={
                "page": page,
                "per_page": per_page,
                "total": total,
                "pages": math.ceil(total / per_page) if total else 0,
            },
        )


__all__ = ["PageCmsSourceService", "SUPPORTED_SOURCE_TYPES"]
