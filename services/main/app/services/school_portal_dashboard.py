"""School-scoped operational dashboard aggregation."""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy import and_, func, or_, select, union_all
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import (
    AnalyticsEvent,
    Announcement,
    Blog,
    ContactInquiry,
    Department,
    Document,
    Event,
    News,
    OutboxEvent,
    Programme,
    StaffAssignment,
    UploadBatch,
    User,
)
from ..schemas.school_portal_dashboard import (
    DashboardActivityItem,
    DashboardActivitySummary,
    DashboardAttentionItem,
    DashboardDistributionItem,
    DashboardProfileCompleteness,
    DashboardQuickLink,
    DashboardQuickAction,
    DashboardRange,
    DashboardSummaryCard,
    DashboardTrendPoint,
    SchoolPortalDashboardResponse,
)
from .school_portal_scope import school_owned_query


@dataclass(frozen=True, slots=True)
class DashboardWindow:
    start: datetime
    end: datetime
    previous_start: datetime
    bucket: str


RANGE_DAYS: dict[DashboardRange, int] = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "12m": 365,
}

PROFILE_FIELDS = (
    ("about", "about"),
    ("head_message", "head_message"),
    ("mission", "mission"),
    ("vision", "vision"),
    ("mandate", "mandate"),
    ("core_values", "core_values"),
    ("email", "email"),
    ("phone", "phone"),
    ("office_location", "office_location"),
    ("website", "website"),
    ("dean_id", "dean"),
    ("logo_image_id", "logo_image"),
    ("cover_image_id", "cover_image"),
    ("brochure_id", "brochure"),
)

QUICK_LINKS = (
    ("departments", "Departments", "school.departments.view", "/schools/departments"),
    ("programmes", "Programmes", "school.programmes.view", "/schools/programmes"),
    ("content", "Content", "school.content.view", "/schools/content"),
    ("publications", "Publications", "school.publications.view", "/schools/publications"),
    ("inquiries", "Inquiries", "school.inquiries.view", "/schools/inquiries"),
    ("media", "Uploads", "school.media.view", "/schools/media"),
)

QUICK_ACTIONS = (
    ("add_staff", "Add staff", "Create a staff profile", "school.team.manage", "/schools/team?action=create"),
    ("new_content", "New content", "Create a school story", "school.content.manage", "/schools/content?action=create"),
    ("upload_media", "Upload media", "Add images or documents", "school.media.manage", "/schools/media?action=upload"),
    ("add_programme", "Add programme", "Create an academic offering", "school.programmes.manage", "/schools/programmes?action=create"),
    ("edit_profile", "Edit profile", "Complete the public profile", "school.profile.manage", "/schools/profile?edit=true"),
)


def dashboard_window(
    range_value: DashboardRange,
    *,
    now: datetime | None = None,
) -> DashboardWindow:
    end = now or datetime.now(timezone.utc)
    if end.tzinfo is None:
        end = end.replace(tzinfo=timezone.utc)
    duration = timedelta(days=RANGE_DAYS[range_value])
    return DashboardWindow(
        start=end - duration,
        end=end,
        previous_start=end - duration - duration,
        bucket="month" if range_value == "12m" else "day",
    )


def profile_completeness(school) -> DashboardProfileCompleteness:
    missing = [
        label
        for attribute, label in PROFILE_FIELDS
        if not getattr(school, attribute, None)
    ]
    total = len(PROFILE_FIELDS)
    completed = total - len(missing)
    return DashboardProfileCompleteness(
        percent=round(completed / total * 100),
        completed_fields=completed,
        total_fields=total,
        missing_fields=missing,
    )


def permission_quick_links(
    permissions: set[str] | tuple[str, ...],
    counts: dict[str, int],
) -> list[DashboardQuickLink]:
    allowed = set(permissions)
    return [
        DashboardQuickLink(key=key, label=label, count=counts.get(key, 0), href=href)
        for key, label, permission, href in QUICK_LINKS
        if permission in allowed
    ]


def permission_quick_actions(
    permissions: set[str] | tuple[str, ...],
) -> list[DashboardQuickAction]:
    allowed = set(permissions)
    return [
        DashboardQuickAction(key=key, label=label, description=description, href=href)
        for key, label, description, permission, href in QUICK_ACTIONS
        if permission in allowed
    ]


async def _grouped(db: AsyncSession, statement) -> dict[str, int]:
    rows = (await db.execute(statement)).all()
    return {str(row[0] or "unknown"): int(row[1] or 0) for row in rows}


def _items(values: dict[str, int]) -> list[DashboardDistributionItem]:
    return [
        DashboardDistributionItem(
            key=key,
            label=key.replace("_", " ").title(),
            value=value,
        )
        for key, value in sorted(values.items())
    ]


def _content_status_query(school_id: uuid.UUID):
    status_queries = [
        school_owned_query(model, school_id)
        .with_only_columns(model.workflow_status.label("workflow_status"))
        .order_by(None)
        for model in (News, Event, Blog, Announcement, Document)
    ]
    statuses = union_all(*status_queries).subquery()
    return select(statuses.c.workflow_status, func.count()).group_by(
        statuses.c.workflow_status
    )


def _school_analytics_filter(school_id: uuid.UUID, school_slug: str):
    return or_(
        and_(
            AnalyticsEvent.entity_type == "school",
            AnalyticsEvent.entity_id == school_id,
        ),
        AnalyticsEvent.path.like(f"%/schools/{school_slug}%"),
    )


def _change(current: int, previous: int) -> float | None:
    if previous == 0:
        return None if current == 0 else 100.0
    return round((current - previous) / previous * 100, 1)


class SchoolPortalDashboardService:
    @staticmethod
    async def build(
        db: AsyncSession,
        *,
        school,
        permissions: tuple[str, ...],
        range_value: DashboardRange,
        publication_statuses: dict[str, int] | None = None,
    ) -> SchoolPortalDashboardResponse:
        school_id = school.id
        window = dashboard_window(range_value)
        department_ids = select(Department.id).where(
            Department.school_id == school_id,
            Department.deleted_at.is_(None),
        )
        assignment_filter = and_(
            StaffAssignment.deleted_at.is_(None),
            StaffAssignment.status == "active",
            or_(
                and_(
                    StaffAssignment.entity_type == "school",
                    StaffAssignment.entity_id == school_id,
                ),
                and_(
                    StaffAssignment.entity_type == "department",
                    StaffAssignment.entity_id.in_(department_ids),
                ),
            ),
        )
        team_by_role = await _grouped(
            db,
            select(StaffAssignment.role, func.count())
            .where(assignment_filter)
            .group_by(StaffAssignment.role),
        )
        departments = int(
            (
                await db.execute(
                    select(func.count(Department.id)).where(
                        Department.school_id == school_id,
                        Department.deleted_at.is_(None),
                        Department.is_active.is_(True),
                    )
                )
            ).scalar()
            or 0
        )
        programmes_by_level = await _grouped(
            db,
            select(Programme.level, func.count())
            .join(Department, Programme.department_id == Department.id)
            .where(
                Department.school_id == school_id,
                Department.deleted_at.is_(None),
                Programme.deleted_at.is_(None),
                Programme.is_active.is_(True),
            )
            .group_by(Programme.level),
        )
        content_by_status = await _grouped(db, _content_status_query(school_id))
        inquiries_by_status = await _grouped(
            db,
            select(ContactInquiry.status, func.count())
            .where(
                ContactInquiry.school_id == school_id,
                ContactInquiry.deleted_at.is_(None),
            )
            .group_by(ContactInquiry.status),
        )
        uploads_by_status = await _grouped(
            db,
            select(UploadBatch.status, func.count())
            .where(
                UploadBatch.school_id == school_id,
                UploadBatch.deleted_at.is_(None),
            )
            .group_by(UploadBatch.status),
        )
        downloads = int(
            (
                await db.execute(
                    school_owned_query(Document, school_id)
                    .with_only_columns(
                        func.coalesce(func.sum(Document.download_count), 0)
                    )
                    .order_by(None)
                )
            ).scalar()
            or 0
        )

        analytics_scope = _school_analytics_filter(school_id, school.slug)
        current_views, current_visitors = await _analytics_totals(
            db, analytics_scope, window.start, window.end
        )
        previous_views, previous_visitors = await _analytics_totals(
            db, analytics_scope, window.previous_start, window.start
        )
        bucket = func.date_trunc(window.bucket, AnalyticsEvent.occurred_at)
        trend_rows = (
            await db.execute(
                select(
                    bucket.label("bucket"),
                    func.count(AnalyticsEvent.id),
                    func.count(func.distinct(AnalyticsEvent.session_hash)),
                )
                .where(
                    AnalyticsEvent.deleted_at.is_(None),
                    AnalyticsEvent.event_type == "page_view",
                    AnalyticsEvent.occurred_at >= window.start,
                    AnalyticsEvent.occurred_at < window.end,
                    analytics_scope,
                )
                .group_by(bucket)
                .order_by(bucket)
            )
        ).all()
        activity_rows = (
            await db.execute(
                select(OutboxEvent)
                .where(
                    OutboxEvent.scope_type == "school",
                    OutboxEvent.scope_id == school_id,
                    OutboxEvent.deleted_at.is_(None),
                )
                .order_by(OutboxEvent.occurred_at.desc())
                .limit(10)
            )
        ).scalars().all()
        actor_ids = {item.actor_id for item in activity_rows if item.actor_id}
        actors: dict[uuid.UUID, str] = {}
        if actor_ids:
            actor_rows = (
                await db.execute(
                    select(User.id, User.full_name).where(User.id.in_(actor_ids))
                )
            ).all()
            actors = {actor_id: full_name for actor_id, full_name in actor_rows}
        imports_completed = int(
            (
                await db.execute(
                    select(func.count(OutboxEvent.id)).where(
                        OutboxEvent.scope_type == "school",
                        OutboxEvent.scope_id == school_id,
                        OutboxEvent.event_type == "school.import.completed",
                        OutboxEvent.occurred_at >= window.start,
                        OutboxEvent.occurred_at < window.end,
                        OutboxEvent.deleted_at.is_(None),
                    )
                )
            ).scalar()
            or 0
        )
        overdue_inquiries = int(
            (
                await db.execute(
                    select(func.count(ContactInquiry.id)).where(
                        ContactInquiry.school_id == school_id,
                        ContactInquiry.deleted_at.is_(None),
                        ContactInquiry.status.in_(("new", "open")),
                        ContactInquiry.first_response_at.is_(None),
                        ContactInquiry.created_at
                        < window.end - timedelta(hours=24),
                    )
                )
            ).scalar()
            or 0
        )

        publication_statuses = publication_statuses or {}
        total_team = sum(team_by_role.values())
        total_programmes = sum(programmes_by_level.values())
        total_content = sum(content_by_status.values())
        total_publications = sum(publication_statuses.values())
        total_inquiries = sum(inquiries_by_status.values())
        total_uploads = sum(uploads_by_status.values())
        completeness = profile_completeness(school)
        counts = {
            "departments": departments,
            "programmes": total_programmes,
            "content": total_content,
            "publications": total_publications,
            "inquiries": total_inquiries,
            "media": total_uploads,
        }
        attention = _attention_items(
            permissions=set(permissions),
            overdue_inquiries=overdue_inquiries,
            content_in_review=sum(
                content_by_status.get(key, 0)
                for key in ("submitted", "in_review")
            ),
            changes_requested=content_by_status.get("changes_requested", 0),
            failed_uploads=uploads_by_status.get("failed", 0),
            completeness=completeness,
        )

        cards = [
            ("team", "Active team", total_team, "/schools/team"),
            ("departments", "Departments", departments, "/schools/departments"),
            ("programmes", "Programmes", total_programmes, "/schools/programmes"),
            ("content", "Draft content", content_by_status.get("draft", 0), "/schools/content?status=draft"),
            (
                "inquiries",
                "Pending inquiries",
                sum(
                    inquiries_by_status.get(key, 0)
                    for key in ("new", "open", "in_progress", "waiting_for_requester")
                ),
                "/schools/inquiries?status=open",
            ),
            ("publications", "Publications", total_publications, "/schools/publications"),
        ]
        summary_cards = [
            DashboardSummaryCard(key=key, label=label, value=value, href=href)
            for key, label, value, href in cards
        ]
        return SchoolPortalDashboardResponse(
            school_id=school_id,
            range=range_value,
            generated_at=window.end,
            summary_cards=summary_cards,
            activity_summary=DashboardActivitySummary(
                page_views=current_views,
                previous_page_views=previous_views,
                page_views_change_percent=_change(current_views, previous_views),
                visitors=current_visitors,
                previous_visitors=previous_visitors,
                visitors_change_percent=_change(current_visitors, previous_visitors),
            ),
            trends=[
                DashboardTrendPoint(
                    bucket=(
                        row[0].isoformat()
                        if hasattr(row[0], "isoformat")
                        else str(row[0])
                    ),
                    value=int(row[1] or 0),
                    visitors=int(row[2] or 0),
                )
                for row in trend_rows
            ],
            distributions={
                "team_by_role": _items(team_by_role),
                "programmes_by_level": _items(programmes_by_level),
                "content_by_status": _items(content_by_status),
                "publications_by_status": _items(publication_statuses),
                "inquiries_by_status": _items(inquiries_by_status),
                "uploads_by_status": _items(uploads_by_status),
            },
            attention_items=attention,
            recent_activity=[
                DashboardActivityItem(
                    id=item.id,
                    event_type=item.event_type,
                    resource_type=item.resource_type,
                    resource_id=item.resource_id,
                    occurred_at=item.occurred_at,
                    summary=str(
                        (item.payload or {}).get("summary")
                        or (item.payload or {}).get("title")
                        or item.event_type.replace(".", " ")
                    ),
                    actor_name=actors.get(item.actor_id),
                )
                for item in activity_rows
            ],
            quick_links=permission_quick_links(permissions, counts),
            quick_actions=permission_quick_actions(permissions),
            profile_completeness=completeness,
            collection_notes={
                "traffic": "Collected from first-party analytics after deployment.",
                "downloads": "Current cumulative document download totals.",
                "imports": f"{imports_completed} imports completed in the selected period.",
                "uploads": f"{total_uploads} upload batches currently belong to this school.",
                "documents": f"{downloads} cumulative document downloads.",
                "inquiry_sla": "An inquiry needs attention after 24 hours without a first response.",
            },
        )


async def _analytics_totals(
    db: AsyncSession,
    scope_filter,
    start: datetime,
    end: datetime,
) -> tuple[int, int]:
    result = await db.execute(
        select(
            func.count(AnalyticsEvent.id),
            func.count(func.distinct(AnalyticsEvent.session_hash)),
        ).where(
            AnalyticsEvent.deleted_at.is_(None),
            AnalyticsEvent.event_type == "page_view",
            AnalyticsEvent.occurred_at >= start,
            AnalyticsEvent.occurred_at < end,
            scope_filter,
        )
    )
    page_views, visitors = result.one()
    return int(page_views or 0), int(visitors or 0)


def _attention_items(
    *,
    permissions: set[str],
    overdue_inquiries: int,
    content_in_review: int,
    changes_requested: int,
    failed_uploads: int,
    completeness: DashboardProfileCompleteness,
) -> list[DashboardAttentionItem]:
    candidates = (
        (
            overdue_inquiries,
            "school.inquiries.view",
            "inquiry_sla",
            "Inquiries awaiting a first response for over 24 hours",
            "critical",
            "/schools/inquiries?attention=sla",
        ),
        (
            content_in_review,
            "school.content.view",
            "content_in_review",
            "Content awaiting review",
            "warning",
            "/schools/content?status=in_review",
        ),
        (
            changes_requested,
            "school.content.view",
            "changes_requested",
            "Content with changes requested",
            "critical",
            "/schools/content?status=changes_requested",
        ),
        (
            failed_uploads,
            "school.media.view",
            "failed_uploads",
            "Failed upload batches",
            "warning",
            "/schools/media?status=failed",
        ),
        (
            len(completeness.missing_fields) if completeness.percent < 100 else 0,
            "school.profile.view",
            "profile_incomplete",
            "School profile fields are incomplete",
            "info",
            "/schools/profile",
        ),
    )
    return [
        DashboardAttentionItem(
            key=key,
            label=label,
            count=count,
            severity=severity,
            href=href,
        )
        for count, permission, key, label, severity, href in candidates
        if count and permission in permissions
    ]


__all__ = [
    "DashboardWindow",
    "SchoolPortalDashboardService",
    "dashboard_window",
    "permission_quick_links",
    "permission_quick_actions",
    "profile_completeness",
]
