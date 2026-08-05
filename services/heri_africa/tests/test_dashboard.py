from __future__ import annotations

from app.schemas.admin import DashboardSummary


def test_dashboard_summary_has_operational_kpis() -> None:
    summary = DashboardSummary(
        published_articles=3,
        drafts_awaiting_review=1,
        scheduled_content=2,
        upcoming_events=4,
        new_submissions=5,
        publications=6,
        active_projects=7,
        team_members=8,
        partners=9,
        social_failures=0,
    )
    assert summary.model_dump()["published_articles"] == 3
