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
    total_articles: int
    total_pages: int
    published_pages: int
    research_themes: int
    featured_projects: int
    upcoming_opportunities: int
    media_assets: int
    media_missing_alt_text: int
    visible_page_sections: int
    submissions_in_progress: int
