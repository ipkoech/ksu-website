from __future__ import annotations

from pydantic import BaseModel


class DashboardSummary(BaseModel):
    published_articles: int
    drafts_awaiting_review: int
    scheduled_content: int
    upcoming_events: int
    new_submissions: int
    publications: int
    active_projects: int
    team_members: int
    partners: int
    social_failures: int
