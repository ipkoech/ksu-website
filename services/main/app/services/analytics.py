"""Analytics ingestion and reporting services."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Iterable

from sqlalchemy import desc, distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import AnalyticsEvent
from ..schemas import AnalyticsEventCreate


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _range(days: int = 30, date_from: datetime | None = None, date_to: datetime | None = None) -> tuple[datetime, datetime]:
    end = date_to or _utc_now()
    start = date_from or end - timedelta(days=days)
    return start, end


def _event_filters(start: datetime, end: datetime, source_app: str | None = None):
    filters = [
        AnalyticsEvent.deleted_at.is_(None),
        AnalyticsEvent.occurred_at >= start,
        AnalyticsEvent.occurred_at <= end,
    ]
    if source_app:
        filters.append(AnalyticsEvent.source_app == source_app)
    return filters


def _dimension(key: str | None, fallback: str = "Unknown") -> str:
    return key or fallback


class AnalyticsService:
    """Persist and aggregate first-party analytics events."""

    @staticmethod
    async def ingest(
        db: AsyncSession,
        events: Iterable[AnalyticsEventCreate],
        *,
        user_id: uuid.UUID | None = None,
    ) -> list[AnalyticsEvent]:
        created: list[AnalyticsEvent] = []
        now = _utc_now()
        for event in events:
            payload = event.model_dump()
            payload["occurred_at"] = payload["occurred_at"] or now
            payload["user_id"] = user_id if event.source_app == "admin" else None
            item = AnalyticsEvent(**payload)
            db.add(item)
            created.append(item)
        await db.flush()
        return created

    @staticmethod
    async def count(
        db: AsyncSession,
        *,
        start: datetime,
        end: datetime,
        source_app: str | None = None,
        event_type: str | None = None,
    ) -> int:
        query = select(func.count(AnalyticsEvent.id)).where(*_event_filters(start, end, source_app))
        if event_type:
            query = query.where(AnalyticsEvent.event_type == event_type)
        result = await db.execute(query)
        return int(result.scalar() or 0)

    @staticmethod
    async def unique_sessions(db: AsyncSession, *, start: datetime, end: datetime, source_app: str | None = None) -> int:
        result = await db.execute(
            select(func.count(distinct(AnalyticsEvent.session_hash))).where(
                *_event_filters(start, end, source_app),
                AnalyticsEvent.session_hash.is_not(None),
            )
        )
        return int(result.scalar() or 0)

    @staticmethod
    async def series_by_day(
        db: AsyncSession,
        *,
        start: datetime,
        end: datetime,
        source_app: str | None = None,
        event_type: str | None = None,
    ) -> list[dict[str, int | str]]:
        day = func.date(AnalyticsEvent.occurred_at)
        query = select(day.label("day"), func.count(AnalyticsEvent.id).label("total")).where(
            *_event_filters(start, end, source_app)
        )
        if event_type:
            query = query.where(AnalyticsEvent.event_type == event_type)
        query = query.group_by(day).order_by(day.asc())
        rows = (await db.execute(query)).all()
        return [{"date": str(row.day), "value": int(row.total or 0)} for row in rows]

    @staticmethod
    async def school_page_views(
        db: AsyncSession,
        *,
        school_id: uuid.UUID,
        school_slug: str,
        start: datetime,
        end: datetime,
    ) -> int:
        """Count first-party views explicitly associated with one school."""
        result = await db.execute(
            select(func.count(AnalyticsEvent.id)).where(
                *_event_filters(start, end, "web"),
                AnalyticsEvent.event_type == "page_view",
                (
                    (AnalyticsEvent.entity_type == "school")
                    & (AnalyticsEvent.entity_id == school_id)
                )
                | AnalyticsEvent.path.like(f"%/schools/{school_slug}%"),
            )
        )
        return int(result.scalar() or 0)

    @staticmethod
    async def top_dimension(
        db: AsyncSession,
        column,
        *,
        start: datetime,
        end: datetime,
        source_app: str | None = None,
        event_type: str | None = None,
        limit: int = 10,
        fallback: str = "Unknown",
    ) -> list[dict[str, int | str]]:
        query = select(column.label("key"), func.count(AnalyticsEvent.id).label("total")).where(
            *_event_filters(start, end, source_app)
        )
        if event_type:
            query = query.where(AnalyticsEvent.event_type == event_type)
        query = query.group_by(column).order_by(desc("total")).limit(limit)
        rows = (await db.execute(query)).all()
        return [
            {"key": _dimension(row.key, fallback), "label": _dimension(row.key, fallback), "value": int(row.total or 0)}
            for row in rows
        ]

    @staticmethod
    async def overview(db: AsyncSession, *, days: int = 30) -> dict:
        start, end = _range(days=days)
        return {
            "total_events": await AnalyticsService.count(db, start=start, end=end),
            "page_views": await AnalyticsService.count(db, start=start, end=end, event_type="page_view"),
            "content_views": await AnalyticsService.count(db, start=start, end=end, event_type="content_view"),
            "admin_events": await AnalyticsService.count(db, start=start, end=end, source_app="admin"),
            "unique_sessions": await AnalyticsService.unique_sessions(db, start=start, end=end),
            "traffic_by_day": await AnalyticsService.series_by_day(db, start=start, end=end, event_type="page_view"),
            "top_content": await AnalyticsService.top_dimension(
                db,
                AnalyticsEvent.entity_title,
                start=start,
                end=end,
                event_type="content_view",
                fallback="Untitled content",
            ),
        }

    @staticmethod
    async def traffic(db: AsyncSession, *, days: int = 30) -> dict:
        start, end = _range(days=days)
        return {
            "page_views": await AnalyticsService.count(db, start=start, end=end, event_type="page_view"),
            "unique_sessions": await AnalyticsService.unique_sessions(db, start=start, end=end),
            "by_day": await AnalyticsService.series_by_day(db, start=start, end=end, event_type="page_view"),
            "top_paths": await AnalyticsService.top_dimension(db, AnalyticsEvent.path, start=start, end=end, event_type="page_view"),
            "referrers": await AnalyticsService.top_dimension(
                db,
                AnalyticsEvent.referrer_host,
                start=start,
                end=end,
                event_type="page_view",
                fallback="Direct",
            ),
        }

    @staticmethod
    async def content(db: AsyncSession, *, days: int = 30) -> dict:
        start, end = _range(days=days)
        return {
            "content_views": await AnalyticsService.count(db, start=start, end=end, event_type="content_view"),
            "interactions": await AnalyticsService.count(db, start=start, end=end) - await AnalyticsService.count(
                db,
                start=start,
                end=end,
                event_type="page_view",
            ),
            "top_content": await AnalyticsService.top_dimension(
                db,
                AnalyticsEvent.entity_title,
                start=start,
                end=end,
                source_app="web",
                fallback="Untitled content",
            ),
            "event_types": await AnalyticsService.top_dimension(db, AnalyticsEvent.event_type, start=start, end=end, source_app="web"),
        }

    @staticmethod
    async def admin_activity(db: AsyncSession, *, days: int = 30) -> dict:
        start, end = _range(days=days)
        active_admins_result = await db.execute(
            select(func.count(distinct(AnalyticsEvent.user_id))).where(
                *_event_filters(start, end, "admin"),
                AnalyticsEvent.user_id.is_not(None),
            )
        )
        return {
            "admin_events": await AnalyticsService.count(db, start=start, end=end, source_app="admin"),
            "active_admins": int(active_admins_result.scalar() or 0),
            "by_day": await AnalyticsService.series_by_day(db, start=start, end=end, source_app="admin"),
            "top_paths": await AnalyticsService.top_dimension(db, AnalyticsEvent.path, start=start, end=end, source_app="admin"),
        }


__all__ = ["AnalyticsService"]
