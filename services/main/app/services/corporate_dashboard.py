"""Operational analytics for the Corporate Communication portal."""

from __future__ import annotations

import calendar
import statistics
import uuid
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta, timezone
from typing import Any, Iterable

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models import (
    Announcement,
    Blog,
    ClubActivity,
    ContentWorkflowLog,
    Event,
    Media,
    MediaLink,
    News,
    PageSection,
    PartnershipSpotlight,
    Slider,
)
from ..schemas.corporate_dashboard import CorporateDashboardResponse, DashboardPeriod


CONTENT_MODELS: dict[str, type] = {
    "news": News,
    "press-releases": Blog,
    "notices": Announcement,
    "events": Event,
    "club-events": ClubActivity,
    "club-media": MediaLink,
    "page-sections": PageSection,
    "partnership-spotlights": PartnershipSpotlight,
    "sliders": Slider,
}

CONTENT_LABELS = {
    "news": "News",
    "press-releases": "Press releases",
    "notices": "Public notices",
    "events": "Events",
    "club-events": "Club events",
    "club-media": "Club media",
    "page-sections": "Page sections",
    "partnership-spotlights": "Partnership spotlights",
    "sliders": "Slider items",
}

LOG_CONTENT_ALIASES = {
    "blogs": "press-releases",
    "announcements": "notices",
}

OWNER_LABELS = {
    "main": "Main site",
    "corporate-communication": "Corporate Communication",
    "schools": "Schools",
    "departments": "Departments",
    "research": "Research",
    "library": "Library",
    "student-clubs": "Student clubs",
}

SUPPORTED_OWNER_PORTALS = frozenset(OWNER_LABELS)
DECISION_ACTIONS = frozenset({"approve", "request_changes", "reject"})
PERIOD_ACTIONS = (
    "submit",
    "start_review",
    "approve",
    "request_changes",
    "reject",
    "schedule",
    "publish",
    "unpublish",
    "archive",
)

CONTENT_HREFS = {
    "news": "/corporate-communication/news",
    "press-releases": "/corporate-communication/press-releases",
    "notices": "/corporate-communication/notices",
    "events": "/corporate-communication/events",
    "club-events": "/corporate-communication/review-queue?content_type=club-events",
    "club-media": "/corporate-communication/review-queue?content_type=club-media",
    "page-sections": "/corporate-communication/page-cms/sections",
    "partnership-spotlights": "/corporate-communication/page-cms/spotlights",
    "sliders": "/corporate-communication/sliders",
}


@dataclass(frozen=True)
class DashboardRange:
    date_from: date
    date_to: date
    start: datetime
    end: datetime
    bucket: str


@dataclass
class ContentRecord:
    content_type: str
    record: Any
    owner_portal: str

    @property
    def ref(self) -> tuple[str, uuid.UUID]:
        return self.content_type, self.record.id

    @property
    def status(self) -> str:
        return str(
            getattr(self.record, "workflow_status", None)
            or getattr(self.record, "status", "draft")
        )

    @property
    def title(self) -> str:
        media = getattr(self.record, "media", None)
        return str(
            getattr(self.record, "title", None)
            or getattr(self.record, "headline", None)
            or getattr(self.record, "section_key", None)
            or getattr(media, "title", None)
            or getattr(media, "original_filename", None)
            or "Untitled content"
        )


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def build_dashboard_range(date_from: date, date_to: date, bucket: str = "auto") -> DashboardRange:
    inclusive_days = (date_to - date_from).days + 1
    if bucket == "auto":
        bucket = "day" if inclusive_days <= 45 else "week" if inclusive_days <= 180 else "month"
    return DashboardRange(
        date_from=date_from,
        date_to=date_to,
        start=datetime.combine(date_from, time.min, tzinfo=timezone.utc),
        end=datetime.combine(date_to + timedelta(days=1), time.min, tzinfo=timezone.utc),
        bucket=bucket,
    )


def previous_dashboard_range(current: DashboardRange) -> DashboardRange:
    days = (current.date_to - current.date_from).days + 1
    previous_to = current.date_from - timedelta(days=1)
    previous_from = previous_to - timedelta(days=days - 1)
    return build_dashboard_range(previous_from, previous_to, current.bucket)


def _normalise_content_type(value: str) -> str:
    return LOG_CONTENT_ALIASES.get(value, value)


def _normalise_owner(value: str | None) -> str:
    if not value or value in {"cocms", "corporate", "university"}:
        return "main"
    return value


def _record_owner(content_type: str, record: Any) -> str:
    if content_type == "club-media":
        return "student-clubs"
    return _normalise_owner(getattr(record, "owner_portal", None))


def _in_range(value: datetime | None, period: DashboardRange) -> bool:
    if value is None:
        return False
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return period.start <= value < period.end


def _hours_between(start: datetime, end: datetime) -> float:
    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)
    if end.tzinfo is None:
        end = end.replace(tzinfo=timezone.utc)
    return max(0.0, (end - start).total_seconds() / 3600)


def _bucket_key(value: datetime, bucket: str) -> str:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    if bucket == "month":
        return value.strftime("%Y-%m")
    if bucket == "week":
        monday = value.date() - timedelta(days=value.weekday())
        return monday.isoformat()
    return value.date().isoformat()


def _bucket_keys(period: DashboardRange) -> list[str]:
    keys: list[str] = []
    cursor = period.date_from
    while cursor <= period.date_to:
        key = _bucket_key(datetime.combine(cursor, time.min, tzinfo=timezone.utc), period.bucket)
        if not keys or keys[-1] != key:
            keys.append(key)
        if period.bucket == "month":
            days_in_month = calendar.monthrange(cursor.year, cursor.month)[1]
            cursor = cursor.replace(day=days_in_month) + timedelta(days=1)
        elif period.bucket == "week":
            cursor += timedelta(days=7)
        else:
            cursor += timedelta(days=1)
    return keys


def _round_metric(value: float | int) -> float | int:
    if isinstance(value, int):
        return value
    return round(value, 1)


def _metric(
    key: str,
    label: str,
    value: float | int,
    previous_value: float | int | None,
    *,
    unit: str = "items",
    lower_is_better: bool = False,
) -> dict[str, Any]:
    change = None if previous_value is None else value - previous_value
    if previous_value is None:
        trend = "unavailable"
        change_percent = None
    elif change > 0:
        trend = "up"
        change_percent = None if previous_value == 0 else round((change / previous_value) * 100, 2)
    elif change < 0:
        trend = "down"
        change_percent = None if previous_value == 0 else round((change / previous_value) * 100, 2)
    else:
        trend = "flat"
        change_percent = 0.0

    if trend in {"flat", "unavailable"}:
        favourability = "neutral"
    elif (trend == "down") == lower_is_better:
        favourability = "positive"
    else:
        favourability = "negative"
    return {
        "key": key,
        "label": label,
        "value": _round_metric(value),
        "unit": unit,
        "previous_value": None if previous_value is None else _round_metric(previous_value),
        "change": None if change is None else _round_metric(change),
        "change_percent": change_percent,
        "trend": trend,
        "favourability": favourability,
    }


def _median(values: Iterable[float]) -> float:
    rows = list(values)
    return round(float(statistics.median(rows)), 1) if rows else 0.0


def _rate(numerator: int, denominator: int) -> float:
    return round((numerator / denominator) * 100, 1) if denominator else 0.0


async def _load_content_records(
    db: AsyncSession,
    *,
    content_type: str | None,
    owner_portal: str | None,
) -> list[ContentRecord]:
    records: list[ContentRecord] = []
    for key, model in CONTENT_MODELS.items():
        if content_type and key != content_type:
            continue
        query = model.active_query()
        if key == "club-media":
            query = query.options(selectinload(MediaLink.media)).where(
                MediaLink.owner_portal == "student-clubs",
                MediaLink.owner_scope_type == "club",
            )
        result = await db.execute(query)
        for record in result.scalars().all():
            owner = _record_owner(key, record)
            if owner_portal and owner != owner_portal:
                continue
            records.append(ContentRecord(key, record, owner))
    return records


async def _load_workflow_logs(
    db: AsyncSession,
    allowed_refs: set[tuple[str, uuid.UUID]],
    start: datetime,
    end: datetime,
) -> list[ContentWorkflowLog]:
    if not allowed_refs:
        return []
    allowed_ids = {content_id for _, content_id in allowed_refs}
    result = await db.execute(
        ContentWorkflowLog.active_query()
        .where(
            ContentWorkflowLog.content_id.in_(allowed_ids),
            ContentWorkflowLog.created_at >= start,
            ContentWorkflowLog.created_at < end,
        )
        .order_by(ContentWorkflowLog.content_type, ContentWorkflowLog.content_id, ContentWorkflowLog.created_at)
    )
    logs: list[ContentWorkflowLog] = []
    for log in result.scalars().all():
        key = _normalise_content_type(log.content_type)
        if (key, log.content_id) in allowed_refs:
            logs.append(log)
    return logs


def _period_logs(logs: list[ContentWorkflowLog], period: DashboardRange) -> list[ContentWorkflowLog]:
    return [log for log in logs if _in_range(log.created_at, period)]


def _action_counts(logs: list[ContentWorkflowLog]) -> Counter[str]:
    return Counter(log.action for log in logs)


def _cycle_durations(
    logs: list[ContentWorkflowLog],
    period: DashboardRange,
) -> tuple[list[float], list[float]]:
    grouped: dict[tuple[str, uuid.UUID], list[ContentWorkflowLog]] = defaultdict(list)
    for log in logs:
        grouped[(_normalise_content_type(log.content_type), log.content_id)].append(log)

    decision_hours: list[float] = []
    publication_hours: list[float] = []
    for record_logs in grouped.values():
        last_submit: datetime | None = None
        last_approve: datetime | None = None
        for log in sorted(record_logs, key=lambda item: item.created_at):
            if log.action == "submit":
                last_submit = log.created_at
                last_approve = None
            elif log.action in DECISION_ACTIONS and last_submit and _in_range(log.created_at, period):
                decision_hours.append(_hours_between(last_submit, log.created_at))
                if log.action == "approve":
                    last_approve = log.created_at
            elif log.action == "approve":
                last_approve = log.created_at
            elif log.action == "publish" and last_approve and _in_range(log.created_at, period):
                publication_hours.append(_hours_between(last_approve, log.created_at))
    return decision_hours, publication_hours


def _activity_metrics(
    logs: list[ContentWorkflowLog],
    current: DashboardRange,
    previous: DashboardRange | None,
) -> tuple[list[dict[str, Any]], dict[str, Any], dict[str, Any]]:
    current_logs = _period_logs(logs, current)
    previous_logs = _period_logs(logs, previous) if previous else []
    current_counts = _action_counts(current_logs)
    previous_counts = _action_counts(previous_logs)
    current_decisions = sum(current_counts[action] for action in DECISION_ACTIONS)
    previous_decisions = sum(previous_counts[action] for action in DECISION_ACTIONS)
    current_decision_hours, current_publication_hours = _cycle_durations(logs, current)
    previous_decision_hours, previous_publication_hours = (
        _cycle_durations(logs, previous) if previous else ([], [])
    )

    values = {
        "submitted": current_counts["submit"],
        "decisions": current_decisions,
        "approved": current_counts["approve"],
        "changes_requested": current_counts["request_changes"],
        "rejected": current_counts["reject"],
        "published": current_counts["publish"],
        "unpublished": current_counts["unpublish"],
        "archived": current_counts["archive"],
        "median_decision_hours": _median(current_decision_hours),
        "median_publication_hours": _median(current_publication_hours),
        "approval_rate": _rate(current_counts["approve"], current_decisions),
        "rework_rate": _rate(current_counts["request_changes"], current_decisions),
        "rejection_rate": _rate(current_counts["reject"], current_decisions),
    }
    previous_values = {
        "submitted": previous_counts["submit"],
        "decisions": previous_decisions,
        "approved": previous_counts["approve"],
        "changes_requested": previous_counts["request_changes"],
        "rejected": previous_counts["reject"],
        "published": previous_counts["publish"],
        "unpublished": previous_counts["unpublish"],
        "archived": previous_counts["archive"],
        "median_decision_hours": _median(previous_decision_hours),
        "median_publication_hours": _median(previous_publication_hours),
        "approval_rate": _rate(previous_counts["approve"], previous_decisions),
        "rework_rate": _rate(previous_counts["request_changes"], previous_decisions),
        "rejection_rate": _rate(previous_counts["reject"], previous_decisions),
    } if previous else {}

    labels = {
        "submitted": "Submitted",
        "decisions": "Review decisions",
        "approved": "Approved",
        "changes_requested": "Changes requested",
        "rejected": "Rejected",
        "published": "Published output",
        "unpublished": "Unpublished",
        "archived": "Archived",
        "median_decision_hours": "Median decision time",
        "median_publication_hours": "Approval to publication",
        "approval_rate": "Approval rate",
        "rework_rate": "Rework rate",
        "rejection_rate": "Rejection rate",
    }
    lower_is_better = {
        "median_decision_hours",
        "median_publication_hours",
        "rework_rate",
        "rejection_rate",
        "changes_requested",
        "rejected",
    }
    metrics = [
        _metric(
            key,
            labels[key],
            value,
            previous_values.get(key),
            unit="hours" if key.endswith("_hours") else "percent" if key.endswith("_rate") else "items",
            lower_is_better=key in lower_is_better,
        )
        for key, value in values.items()
    ]
    return metrics, values, previous_values


def _snapshot(records: list[ContentRecord], now: datetime) -> dict[str, Any]:
    status_counts = Counter(item.status for item in records)
    type_counts = Counter(item.content_type for item in records)
    backlog = [item for item in records if item.status in {"submitted", "in_review"}]
    overdue = [
        item for item in backlog
        if getattr(item.record, "submitted_at", None)
        and _hours_between(item.record.submitted_at, now) > 48
    ]
    drafts = [item for item in records if item.status == "draft"]
    stale_drafts = [
        item for item in drafts
        if getattr(item.record, "updated_at", now) < now - timedelta(days=14)
    ]
    scheduled_7 = 0
    scheduled_30 = 0
    for item in records:
        scheduled_at = getattr(item.record, "scheduled_publish_at", None)
        if not scheduled_at:
            continue
        if scheduled_at.tzinfo is None:
            scheduled_at = scheduled_at.replace(tzinfo=timezone.utc)
        if now <= scheduled_at <= now + timedelta(days=7):
            scheduled_7 += 1
        if now <= scheduled_at <= now + timedelta(days=30):
            scheduled_30 += 1
    return {
        "review_backlog": {
            "total": len(backlog),
            "submitted": status_counts["submitted"],
            "in_review": status_counts["in_review"],
            "overdue": len(overdue),
        },
        "scheduled": {"next_7_days": scheduled_7, "next_30_days": scheduled_30},
        "drafts": {"total": len(drafts), "stale": len(stale_drafts)},
        "status_distribution": [
            {"key": key, "label": key.replace("_", " ").title(), "value": value}
            for key, value in sorted(status_counts.items())
        ],
        "content_type_distribution": [
            {"key": key, "label": CONTENT_LABELS[key], "value": value}
            for key, value in sorted(type_counts.items())
        ],
    }


def _series(
    logs: list[ContentWorkflowLog],
    period: DashboardRange,
) -> dict[str, list[dict[str, Any]]]:
    keys = _bucket_keys(period)
    action_rows: dict[str, Counter[str]] = {key: Counter() for key in keys}
    published_rows: dict[str, Counter[str]] = {key: Counter() for key in keys}
    for log in _period_logs(logs, period):
        key = _bucket_key(log.created_at, period.bucket)
        action_rows.setdefault(key, Counter())[log.action] += 1
        if log.action == "publish":
            published_rows.setdefault(key, Counter())[_normalise_content_type(log.content_type)] += 1
    return {
        "workflow_actions": [
            {
                "period": key,
                "total": sum(action_rows[key].values()),
                "values": {action: action_rows[key][action] for action in PERIOD_ACTIONS},
            }
            for key in keys
        ],
        "publishing": [
            {
                "period": key,
                "total": sum(published_rows[key].values()),
                "values": {content_type: published_rows[key][content_type] for content_type in CONTENT_MODELS},
            }
            for key in keys
        ],
    }


def _backlog_aging(records: list[ContentRecord], now: datetime) -> list[dict[str, Any]]:
    buckets = Counter({"under_24h": 0, "24h_48h": 0, "2d_7d": 0, "over_7d": 0})
    for item in records:
        if item.status not in {"submitted", "in_review"}:
            continue
        submitted_at = getattr(item.record, "submitted_at", None)
        if not submitted_at:
            continue
        hours = _hours_between(submitted_at, now)
        key = "under_24h" if hours < 24 else "24h_48h" if hours < 48 else "2d_7d" if hours < 168 else "over_7d"
        buckets[key] += 1
    labels = {
        "under_24h": "Under 24 hours",
        "24h_48h": "24–48 hours",
        "2d_7d": "2–7 days",
        "over_7d": "Over 7 days",
    }
    return [{"key": key, "label": labels[key], "value": buckets[key]} for key in labels]


def _breakdowns(
    logs: list[ContentWorkflowLog],
    records_by_ref: dict[tuple[str, uuid.UUID], ContentRecord],
    period: DashboardRange,
    dimension: str,
) -> list[dict[str, Any]]:
    grouped_logs: dict[str, list[ContentWorkflowLog]] = defaultdict(list)
    grouped_refs: dict[str, set[tuple[str, uuid.UUID]]] = defaultdict(set)
    for log in _period_logs(logs, period):
        content_type = _normalise_content_type(log.content_type)
        record = records_by_ref.get((content_type, log.content_id))
        if not record:
            continue
        key = content_type if dimension == "content_type" else record.owner_portal
        grouped_logs[key].append(log)
        grouped_refs[key].add((content_type, log.content_id))

    rows = []
    for key, group in grouped_logs.items():
        counts = _action_counts(group)
        decisions = sum(counts[action] for action in DECISION_ACTIONS)
        dimension_logs = [
            log for log in logs
            if (_normalise_content_type(log.content_type), log.content_id) in grouped_refs[key]
        ]
        decision_hours, _ = _cycle_durations(dimension_logs, period)
        rows.append({
            "key": key,
            "label": CONTENT_LABELS.get(key) if dimension == "content_type" else OWNER_LABELS.get(key, key.replace("-", " ").title()),
            "value": len(group),
            "submitted": counts["submit"],
            "approved": counts["approve"],
            "published": counts["publish"],
            "changes_requested": counts["request_changes"],
            "rejected": counts["reject"],
            "approval_rate": _rate(counts["approve"], decisions),
            "median_decision_hours": _median(decision_hours),
        })
    return sorted(rows, key=lambda row: (row["published"], row["submitted"], row["value"]), reverse=True)


def _record_missing_media(item: ContentRecord) -> bool:
    if item.content_type in {"news", "press-releases", "notices", "events"}:
        return not getattr(item.record, "featured_media_id", None)
    if item.content_type == "club-events":
        return not getattr(item.record, "cover_image_id", None)
    if item.content_type == "sliders":
        return not getattr(item.record, "desktop_media_id", None)
    return False


async def _readiness(
    db: AsyncSession,
    records: list[ContentRecord],
    now: datetime,
) -> tuple[dict[str, Any], dict[str, list[ContentRecord]]]:
    issues: dict[str, list[ContentRecord]] = defaultdict(list)
    for item in records:
        record = item.record
        if item.content_type in {"news", "press-releases", "notices", "events", "club-events"}:
            summary = getattr(record, "summary", None) or getattr(record, "description", None)
            body = getattr(record, "plain_text", None) or getattr(record, "rich_text", None)
            if not summary:
                issues["missing_summary"].append(item)
            if item.content_type != "club-events" and not body:
                issues["missing_body"].append(item)
            if _record_missing_media(item):
                issues["missing_featured_media"].append(item)
        if item.content_type in {"news", "press-releases", "notices", "events"}:
            if not getattr(record, "meta_title", None):
                issues["missing_seo_title"].append(item)
            if not getattr(record, "meta_description", None):
                issues["missing_seo_description"].append(item)
        scheduled_at = getattr(record, "scheduled_publish_at", None)
        if scheduled_at and _record_missing_media(item):
            issues["scheduled_missing_media"].append(item)
        expires_at = getattr(record, "expires_at", None) or getattr(record, "valid_to", None)
        if expires_at:
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if item.status == "published" and expires_at < now:
                issues["published_expired"].append(item)
            elif now <= expires_at <= now + timedelta(days=7):
                issues["expiring_soon"].append(item)
        if item.status == "draft" and getattr(record, "updated_at", now) < now - timedelta(days=14):
            issues["stale_draft"].append(item)

    media_result = await db.execute(Media.active_query())
    media = list(media_result.scalars().all())
    missing_alt = [item for item in media if item.media_type == "image" and not item.alt_text]
    unprocessed = [item for item in media if not item.is_processed]
    link_result = await db.execute(select(MediaLink.media_id).where(MediaLink.deleted_at.is_(None)))
    linked_ids = set(link_result.scalars().all())
    for item in records:
        for field in ("featured_media_id", "cover_image_id", "desktop_media_id", "mobile_media_id"):
            media_id = getattr(item.record, field, None)
            if media_id:
                linked_ids.add(media_id)
    unlinked = [item for item in media if item.id not in linked_ids]

    labels = {
        "missing_summary": "Missing summary",
        "missing_body": "Missing body content",
        "missing_featured_media": "Missing required media",
        "missing_seo_title": "Missing SEO title",
        "missing_seo_description": "Missing SEO description",
        "scheduled_missing_media": "Scheduled without required media",
        "published_expired": "Published but expired",
        "expiring_soon": "Expiring within seven days",
        "stale_draft": "Stale drafts",
    }
    checks = [
        {
            "key": key,
            "label": label,
            "value": len(issues[key]),
            "href": CONTENT_HREFS.get(issues[key][0].content_type) if issues[key] else None,
        }
        for key, label in labels.items()
    ]
    checks.extend([
        {"key": "images_missing_alt", "label": "Images missing alt text", "value": len(missing_alt), "href": "/corporate-communication/media-assets"},
        {"key": "unprocessed_media", "label": "Unprocessed media", "value": len(unprocessed), "href": "/corporate-communication/media-assets"},
        {"key": "unlinked_media", "label": "Unlinked media assets", "value": len(unlinked), "href": "/corporate-communication/media-assets"},
    ])
    return {
        "checks": checks,
        "issue_total": sum(check["value"] for check in checks),
        "media": {
            "total": len(media),
            "images_missing_alt": len(missing_alt),
            "unprocessed": len(unprocessed),
            "unlinked": len(unlinked),
        },
    }, issues


def _attention_items(
    records: list[ContentRecord],
    issues: dict[str, list[ContentRecord]],
    now: datetime,
) -> list[dict[str, Any]]:
    issue_map: dict[tuple[str, uuid.UUID], set[str]] = defaultdict(set)
    for code, items in issues.items():
        for item in items:
            issue_map[item.ref].add(code)
    for item in records:
        if item.status in {"submitted", "in_review"}:
            submitted_at = getattr(item.record, "submitted_at", None)
            if submitted_at and _hours_between(submitted_at, now) > 48:
                issue_map[item.ref].add("overdue_review")

    candidates = []
    for item in records:
        codes = issue_map.get(item.ref)
        if not codes:
            continue
        critical = bool({"overdue_review", "scheduled_missing_media", "published_expired"} & codes)
        timestamp = getattr(item.record, "submitted_at", None) or getattr(item.record, "updated_at", None)
        age_hours = _hours_between(timestamp, now) if timestamp else None
        href = CONTENT_HREFS.get(item.content_type, "/corporate-communication")
        if item.content_type == "page-sections":
            href = f"/corporate-communication/page-cms/sections/{item.record.id}"
        candidates.append({
            "id": str(item.record.id),
            "title": item.title,
            "content_type": item.content_type,
            "content_type_label": CONTENT_LABELS[item.content_type],
            "status": item.status,
            "age_hours": round(age_hours, 1) if age_hours is not None else None,
            "issue_codes": sorted(codes),
            "severity": "critical" if critical else "warning",
            "source_label": OWNER_LABELS.get(item.owner_portal, item.owner_portal.replace("-", " ").title()),
            "href": href,
        })
    return sorted(
        candidates,
        key=lambda row: (row["severity"] == "critical", row["age_hours"] or 0),
        reverse=True,
    )[:20]


def _publishing_calendar(records: list[ContentRecord], now: datetime) -> dict[str, Any]:
    scheduled = []
    for item in records:
        value = getattr(item.record, "scheduled_publish_at", None)
        if not value:
            continue
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        if now <= value <= now + timedelta(days=30):
            scheduled.append({
                "id": str(item.record.id),
                "title": item.title,
                "content_type": item.content_type,
                "scheduled_at": value.isoformat(),
                "href": CONTENT_HREFS.get(item.content_type, "/corporate-communication"),
            })
    covered_dates = {datetime.fromisoformat(item["scheduled_at"]).date() for item in scheduled}
    longest_gap = 0
    current_gap = 0
    for offset in range(30):
        day = now.date() + timedelta(days=offset)
        if day in covered_dates:
            longest_gap = max(longest_gap, current_gap)
            current_gap = 0
        else:
            current_gap += 1
    longest_gap = max(longest_gap, current_gap)
    return {
        "upcoming": sorted(scheduled, key=lambda item: item["scheduled_at"]),
        "covered_days": len(covered_dates),
        "longest_gap_days": longest_gap,
    }


def _insights(
    snapshot: dict[str, Any],
    activity: dict[str, Any],
    previous_activity: dict[str, Any],
    readiness: dict[str, Any],
    attention: list[dict[str, Any]],
    by_owner: list[dict[str, Any]],
    publishing_calendar: dict[str, Any],
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    overdue = snapshot["review_backlog"]["overdue"]
    if overdue:
        rows.append({
            "code": "OVERDUE_REVIEWS",
            "severity": "critical" if overdue >= 10 else "warning",
            "title": "Reviews are waiting beyond 48 hours",
            "description": f"{overdue} review item{'s' if overdue != 1 else ''} need attention.",
            "value": overdue,
            "total": snapshot["review_backlog"]["total"],
            "href": "/corporate-communication/review-queue",
        })
    if activity.get("median_decision_hours", 0) > previous_activity.get("median_decision_hours", 0) > 0:
        rows.append({
            "code": "DECISION_TIME_INCREASED",
            "severity": "warning",
            "title": "Editorial decisions are taking longer",
            "description": f"Median decision time rose from {previous_activity['median_decision_hours']} to {activity['median_decision_hours']} hours.",
            "value": activity["median_decision_hours"],
            "total": previous_activity["median_decision_hours"],
            "href": "/corporate-communication/review-queue",
        })
    if activity.get("published", 0) > previous_activity.get("published", 0):
        rows.append({
            "code": "PUBLISHING_OUTPUT_UP",
            "severity": "success",
            "title": "Publishing output improved",
            "description": f"The team published {activity['published']} items, up from {previous_activity.get('published', 0)} in the previous period.",
            "value": activity["published"],
            "total": previous_activity.get("published", 0),
            "href": "/corporate-communication/news",
        })
    if activity.get("rework_rate", 0) >= 25:
        rows.append({
            "code": "HIGH_REWORK_RATE",
            "severity": "warning",
            "title": "A high share of decisions requested changes",
            "description": f"{activity['rework_rate']}% of review decisions sent content back for revision.",
            "value": activity["rework_rate"],
            "total": 100,
            "href": "/corporate-communication/review-queue?status=changes_requested",
        })
    missing_media = next((item["value"] for item in readiness["checks"] if item["key"] == "missing_featured_media"), 0)
    if missing_media:
        rows.append({
            "code": "MISSING_REQUIRED_MEDIA",
            "severity": "warning",
            "title": "Content readiness is blocked by missing media",
            "description": f"{missing_media} content item{'s' if missing_media != 1 else ''} lack required featured media.",
            "value": missing_media,
            "total": len(attention),
            "href": "/corporate-communication/media-assets",
        })
    if publishing_calendar["longest_gap_days"] >= 7:
        rows.append({
            "code": "PUBLISHING_CALENDAR_GAP",
            "severity": "info",
            "title": "The publishing calendar has an extended gap",
            "description": f"The next 30 days contain a gap of {publishing_calendar['longest_gap_days']} consecutive days without scheduled content.",
            "value": publishing_calendar["longest_gap_days"],
            "total": 30,
            "href": "/corporate-communication/events",
        })
    if overdue and by_owner:
        largest = max(by_owner, key=lambda row: row["submitted"])
        if largest["submitted"]:
            rows.append({
                "code": "SUBMISSION_SOURCE_CONCENTRATION",
                "severity": "info",
                "title": f"{largest['label']} supplied the most workflow activity",
                "description": f"{largest['label']} recorded {largest['submitted']} submissions in the selected period.",
                "value": largest["submitted"],
                "total": activity.get("submitted", 0),
                "href": f"/corporate-communication/review-queue?source_portal={largest['key']}",
            })
    return rows[:6]


class CorporateCommunicationDashboardService:
    """Build a chart-ready dashboard response from authoritative portal records."""

    @staticmethod
    async def build(
        db: AsyncSession,
        *,
        period: DashboardRange,
        compare: bool = True,
        content_type: str | None = None,
        owner_portal: str | None = None,
    ) -> CorporateDashboardResponse:
        now = _utc_now()
        previous = previous_dashboard_range(period) if compare else None
        records = await _load_content_records(
            db,
            content_type=content_type,
            owner_portal=owner_portal,
        )
        records_by_ref = {item.ref: item for item in records}
        history_start = (previous.start if previous else period.start) - timedelta(days=366)
        logs = await _load_workflow_logs(db, set(records_by_ref), history_start, period.end)
        metrics, activity_values, previous_activity_values = _activity_metrics(logs, period, previous)
        snapshot = _snapshot(records, now)
        current_series = _series(logs, period)
        previous_series = _series(logs, previous) if previous else {"workflow_actions": [], "publishing": []}
        by_content_type = _breakdowns(logs, records_by_ref, period, "content_type")
        by_owner = _breakdowns(logs, records_by_ref, period, "owner_portal")
        readiness, issue_records = await _readiness(db, records, now)
        attention = _attention_items(records, issue_records, now)
        publishing_calendar = _publishing_calendar(records, now)
        insights = _insights(
            snapshot,
            activity_values,
            previous_activity_values,
            readiness,
            attention,
            by_owner,
            publishing_calendar,
        )

        return CorporateDashboardResponse(
            generated_at=now,
            period=DashboardPeriod(
                date_from=period.date_from,
                date_to=period.date_to,
                bucket=period.bucket,
            ),
            comparison_period=DashboardPeriod(
                date_from=previous.date_from,
                date_to=previous.date_to,
                bucket=previous.bucket,
            ) if previous else None,
            filters={"content_type": content_type, "owner_portal": owner_portal},
            snapshot=snapshot,
            activity={"metrics": metrics, "values": activity_values},
            workflow={
                "series": current_series["workflow_actions"],
                "previous_series": previous_series["workflow_actions"],
                "backlog_aging": _backlog_aging(records, now),
                "by_content_type": by_content_type,
                "by_owner_portal": by_owner,
            },
            publishing={
                "series": current_series["publishing"],
                "previous_series": previous_series["publishing"],
                "calendar": publishing_calendar,
            },
            readiness=readiness,
            insights=insights,
            attention_items=attention,
            data_quality={
                "workflow_logs_available": bool(logs),
                "audience_analytics_available": False,
                "excluded_metrics": [
                    "page_views",
                    "unique_visitors",
                    "click_through_rate",
                    "public_engagement",
                    "sentiment",
                ],
                "warnings": [] if logs else ["No workflow transition history is available for the selected content scope."],
            },
        )


__all__ = [
    "CONTENT_MODELS",
    "SUPPORTED_OWNER_PORTALS",
    "CorporateCommunicationDashboardService",
    "DashboardRange",
    "build_dashboard_range",
]
