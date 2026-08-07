"""Chart-ready analytics for the research admin dashboard."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Any

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from ksu_common.stats import count_active as _count

from ..core.config import get_settings
from ..models import (
    AuditLog,
    Donation,
    Grant,
    GrantApplication,
    ImpactMetric,
    Innovation,
    MentorshipApplication,
    Partner,
    Publication,
    ResearchOutput,
    ResearchProject,
    ScholarshipApplication,
    SuccessStory,
    Sustainability,
)
from ..schemas.analytics import (
    ResearchAnalyticsAttentionItem,
    ResearchAnalyticsChart,
    ResearchAnalyticsKpi,
    ResearchAnalyticsPoint,
    ResearchDashboardAnalytics,
)


class ResearchAnalyticsService:
    """Build operational dashboard analytics from aggregate database queries."""

    @staticmethod
    async def dashboard(db: AsyncSession) -> ResearchDashboardAnalytics:
        now = datetime.now(timezone.utc)
        settings = get_settings()

        active_projects = await _count(db, ResearchProject, ResearchProject.status.in_(("approved", "ongoing")))
        open_grants = await _count(db, Grant, Grant.status == "open")
        pending_applications = await _pending_application_count(db)
        published_publications = await _count(db, Publication, Publication.status == "published")
        partners = await _count(db, Partner)
        completed_donation_value = await _sum(db, Donation.amount, Donation, Donation.status == "completed")
        missing_pi = await _count(db, ResearchProject, ResearchProject.pi_id.is_(None))
        overdue_projects = await _count(db, ResearchProject, ResearchProject.end_date < now.date(), ResearchProject.status.in_(("approved", "ongoing")))
        grants_closing_soon = await _count(
            db,
            Grant,
            Grant.status == "open",
            Grant.deadline.is_not(None),
            Grant.deadline <= now + timedelta(days=30),
        )
        draft_publications = await _count(db, Publication, Publication.status.in_(("draft", "submitted", "under_review")))

        return ResearchDashboardAnalytics(
            kpis=[
                _kpi("active_projects", "Active Projects", active_projects, "Approved and ongoing research projects", "/research/projects"),
                _kpi("open_grants", "Open Grants", open_grants, "Grant opportunities currently open", "/research/grants"),
                _kpi("pending_applications", "Pending Applications", pending_applications, "Grant, scholarship, and mentorship applications awaiting review", "/research/reports"),
                _kpi("published_publications", "Publications", published_publications, "Published publication records", "/research/publications"),
                _kpi("partners", "Partners", partners, "Research partner records", "/research/partnerships"),
                _kpi("completed_donation_value", "Donation Value", completed_donation_value, "Completed donation amount", "/research/donations/records", "KES"),
            ],
            attention=[
                _attention("missing_pi", "Missing PI", missing_pi, "warning", "Projects without principal investigator assignment", "/research/projects"),
                _attention("overdue_projects", "Overdue Projects", overdue_projects, "danger", "Active projects past their end date", "/research/projects"),
                _attention("grants_closing_soon", "Grants Closing Soon", grants_closing_soon, "warning", "Open grants with deadlines in the next 30 days", "/research/grants"),
                _attention("pending_applications", "Pending Reviews", pending_applications, "warning", "Applications currently submitted or under review", "/research/reports"),
                _attention("draft_publications", "Publication Queue", draft_publications, "info", "Publications not yet published", "/research/publications"),
            ],
            portfolio_health=[
                await _chart_by_column(db, "project_status", "Project status", "bar", ResearchProject, ResearchProject.status, "/research/projects"),
                await _chart_by_column(db, "project_type", "Project type mix", "donut", ResearchProject, ResearchProject.project_type, "/research/projects"),
                await _project_progress_bands(db),
                ResearchAnalyticsChart(
                    key="project_ownership",
                    title="Project ownership",
                    chart_type="stacked",
                    description="Projects with and without PI assignment.",
                    data=[
                        ResearchAnalyticsPoint(key="assigned", label="Assigned PI", value=max(0, await _count(db, ResearchProject) - missing_pi), href="/research/projects"),
                        ResearchAnalyticsPoint(key="missing", label="Missing PI", value=missing_pi, href="/research/projects", description="Needs ownership review"),
                    ],
                ),
            ],
            funding_pipeline=[
                await _chart_by_column(db, "grant_status", "Grant status", "bar", Grant, Grant.status, "/research/grants"),
                await _chart_by_column(db, "grant_category", "Grant categories", "donut", Grant, Grant.category, "/research/grants"),
                await _chart_by_column(db, "grant_applications", "Grant applications", "stacked", GrantApplication, GrantApplication.status, "/research/grants/applications"),
                ResearchAnalyticsChart(
                    key="funding_value",
                    title="Funding value",
                    chart_type="bar",
                    description="Recorded funding and completed donation values.",
                    data=[
                        ResearchAnalyticsPoint(key="grant_budget", label="Grant Budget", value=await _sum(db, Grant.total_budget, Grant), suffix="KES", href="/research/grants"),
                        ResearchAnalyticsPoint(key="donations", label="Donations", value=completed_donation_value, suffix="KES", href="/research/donations/records"),
                    ],
                ),
            ],
            outputs_publications=[
                await _chart_by_column(db, "publication_status", "Publication status", "bar", Publication, Publication.status, "/research/publications"),
                await _chart_by_column(db, "publication_type", "Publication type", "donut", Publication, Publication.publication_type, "/research/publications"),
                ResearchAnalyticsChart(
                    key="open_access",
                    title="Open access coverage",
                    chart_type="stacked",
                    description="Open access against restricted or unspecified publication access.",
                    data=[
                        ResearchAnalyticsPoint(key="open", label="Open access", value=await _count(db, Publication, Publication.is_open_access.is_(True)), href="/research/publications"),
                        ResearchAnalyticsPoint(key="restricted", label="Restricted/Unknown", value=await _count(db, Publication, Publication.is_open_access.is_(False)), href="/research/publications"),
                    ],
                ),
                ResearchAnalyticsChart(
                    key="outputs_innovations",
                    title="Outputs and innovations",
                    chart_type="bar",
                    data=[
                        ResearchAnalyticsPoint(key="outputs", label="Outputs", value=await _count(db, ResearchOutput), href="/research/outputs"),
                        ResearchAnalyticsPoint(key="innovations", label="Innovations", value=await _count(db, Innovation), href="/research/innovations"),
                        ResearchAnalyticsPoint(key="stories", label="Impact Stories", value=await _count(db, SuccessStory), href="/research/stories"),
                    ],
                ),
            ],
            partnerships_sustainability=[
                await _chart_by_column(db, "partner_type", "Partner type", "donut", Partner, Partner.partner_type, "/research/partnerships"),
                await _chart_by_column(db, "partner_status", "Partner status", "stacked", Partner, Partner.status, "/research/partnerships"),
                await _chart_by_column(db, "sustainability_status", "Sustainability status", "bar", Sustainability, Sustainability.status, "/research/sustainability"),
                await _chart_by_column(db, "impact_category", "Impact metric categories", "bar", ImpactMetric, ImpactMetric.category, "/research/impact"),
            ],
            applications_reviews=[
                await _chart_by_column(db, "grant_review_queue", "Grant review queue", "stacked", GrantApplication, GrantApplication.status, "/research/grants/applications"),
                await _chart_by_column(db, "scholarship_review_queue", "Scholarship review queue", "stacked", ScholarshipApplication, ScholarshipApplication.status, "/research/scholarships/applications"),
                await _chart_by_column(db, "mentorship_review_queue", "Mentorship review queue", "stacked", MentorshipApplication, MentorshipApplication.status, "/research/mentorship/applications"),
                ResearchAnalyticsChart(
                    key="pending_review_mix",
                    title="Pending review mix",
                    chart_type="donut",
                    description="Submitted and under-review application queues by workflow.",
                    data=[
                        ResearchAnalyticsPoint(key="grants", label="Grants", value=await _count(db, GrantApplication, GrantApplication.status.in_(("submitted", "under_review"))), href="/research/grants/applications"),
                        ResearchAnalyticsPoint(key="scholarships", label="Scholarships", value=await _count(db, ScholarshipApplication, ScholarshipApplication.status.in_(("submitted", "under_review"))), href="/research/scholarships/applications"),
                        ResearchAnalyticsPoint(key="mentorship", label="Mentorship", value=await _count(db, MentorshipApplication, MentorshipApplication.status.in_(("submitted", "under_review"))), href="/research/mentorship/applications"),
                    ],
                ),
            ],
            admin_activity=[
                await _audit_chart(db, settings.SERVICE_NAME, now),
                await _audit_status_chart(db, settings.SERVICE_NAME, now),
            ],
        )


async def _sum(db: AsyncSession, column, model, *conditions) -> float:
    result = await db.execute(select(func.coalesce(func.sum(column), 0)).where(model.deleted_at.is_(None), *conditions))
    value = result.scalar_one() or 0
    if isinstance(value, Decimal):
        return float(value)
    return float(value)


async def _group_counts(db: AsyncSession, model, column, *conditions, limit: int = 8) -> list[ResearchAnalyticsPoint]:
    result = await db.execute(
        select(column, func.count(model.id))
        .where(model.deleted_at.is_(None), *conditions)
        .group_by(column)
        .order_by(func.count(model.id).desc())
        .limit(limit)
    )
    return [
        ResearchAnalyticsPoint(
            key=str(key or "unknown"),
            label=_label(key or "unknown"),
            value=int(value or 0),
        )
        for key, value in result.all()
    ]


async def _chart_by_column(db: AsyncSession, key: str, title: str, chart_type: str, model, column, href: str) -> ResearchAnalyticsChart:
    points = await _group_counts(db, model, column)
    return ResearchAnalyticsChart(
        key=key,
        title=title,
        chart_type=chart_type,
        data=[point.model_copy(update={"href": href}) for point in points],
    )


async def _project_progress_bands(db: AsyncSession) -> ResearchAnalyticsChart:
    bucket = case(
        (ResearchProject.progress_percentage <= 25, "0-25%"),
        (ResearchProject.progress_percentage <= 50, "26-50%"),
        (ResearchProject.progress_percentage <= 75, "51-75%"),
        else_="76-100%",
    )
    result = await db.execute(
        select(bucket.label("bucket"), func.count(ResearchProject.id))
        .where(ResearchProject.deleted_at.is_(None))
        .group_by(bucket)
        .order_by(bucket)
    )
    return ResearchAnalyticsChart(
        key="project_progress",
        title="Project progress bands",
        chart_type="bar",
        data=[
            ResearchAnalyticsPoint(key=str(label), label=str(label), value=int(value or 0), href="/research/projects")
            for label, value in result.all()
        ],
    )


async def _pending_application_count(db: AsyncSession) -> int:
    return sum(
        [
            await _count(db, GrantApplication, GrantApplication.status.in_(("submitted", "under_review"))),
            await _count(db, ScholarshipApplication, ScholarshipApplication.status.in_(("submitted", "under_review"))),
            await _count(db, MentorshipApplication, MentorshipApplication.status.in_(("submitted", "under_review"))),
        ]
    )


async def _audit_chart(db: AsyncSession, service_name: str, now: datetime) -> ResearchAnalyticsChart:
    result = await db.execute(
        select(AuditLog.action, func.count(AuditLog.id))
        .where(
            AuditLog.deleted_at.is_(None),
            AuditLog.service_name == service_name,
            AuditLog.happened_at >= now - timedelta(days=30),
        )
        .group_by(AuditLog.action)
        .order_by(func.count(AuditLog.id).desc())
        .limit(8)
    )
    return ResearchAnalyticsChart(
        key="audit_actions",
        title="Admin actions",
        chart_type="bar",
        description="Research service audit actions in the last 30 days.",
        data=[
            ResearchAnalyticsPoint(key=str(action), label=_label(action), value=int(value or 0), href="/research/reports")
            for action, value in result.all()
        ],
    )


async def _audit_status_chart(db: AsyncSession, service_name: str, now: datetime) -> ResearchAnalyticsChart:
    result = await db.execute(
        select(AuditLog.status, func.count(AuditLog.id))
        .where(
            AuditLog.deleted_at.is_(None),
            AuditLog.service_name == service_name,
            AuditLog.happened_at >= now - timedelta(days=30),
        )
        .group_by(AuditLog.status)
        .order_by(func.count(AuditLog.id).desc())
    )
    return ResearchAnalyticsChart(
        key="audit_status",
        title="Audit health",
        chart_type="stacked",
        description="Successful and failed research admin actions in the last 30 days.",
        data=[
            ResearchAnalyticsPoint(key=str(status), label=_label(status), value=int(value or 0), href="/research/reports")
            for status, value in result.all()
        ],
    )


def _kpi(key: str, label: str, value: int | float, description: str, href: str, suffix: str = "") -> ResearchAnalyticsKpi:
    return ResearchAnalyticsKpi(key=key, label=label, value=value, description=description, href=href, suffix=suffix)


def _attention(key: str, label: str, value: int | float, severity: str, description: str, href: str) -> ResearchAnalyticsAttentionItem:
    return ResearchAnalyticsAttentionItem(key=key, label=label, value=value, severity=severity, description=description, href=href)


def _label(value: Any) -> str:
    return str(value or "Unknown").replace("_", " ").replace("-", " ").title()
