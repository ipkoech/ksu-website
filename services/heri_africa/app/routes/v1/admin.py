from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.auth import require_permission
from ...core.database import get_db
from ...models.content import Event, NewsArticle, Opportunity, Page, PageSection, PublicationStatus, ResearchProject, ResearchPublication, ResearchTheme
from ...models.media import MediaAsset
from ...models.people import TeamMember
from ...models.partners import Partner
from ...models.social import SocialPublication
from ...models.submissions import Submission, SubmissionStatus
from ...schemas.admin import DashboardSummary

router = APIRouter(prefix="/admin", tags=["HERI Admin"])


async def _count(db: AsyncSession, model: type[object], *conditions: object) -> int:
    query = select(func.count()).select_from(model)
    if conditions:
        query = query.where(*conditions)
    return int((await db.execute(query)).scalar_one())


@router.get("/dashboard", response_model=DashboardSummary)
async def dashboard(
    db: AsyncSession = Depends(get_db),
    _: object = Depends(require_permission("heri.view")),
) -> DashboardSummary:
    return DashboardSummary(
        published_articles=await _count(db, NewsArticle, NewsArticle.status == PublicationStatus.PUBLISHED),
        drafts_awaiting_review=await _count(db, NewsArticle, NewsArticle.status == PublicationStatus.IN_REVIEW),
        scheduled_content=await _count(db, NewsArticle, NewsArticle.status == PublicationStatus.SCHEDULED),
        upcoming_events=await _count(
            db,
            Event,
            Event.status == PublicationStatus.PUBLISHED,
            Event.starts_at >= datetime.now(timezone.utc),
            Event.deleted_at.is_(None),
        ),
        new_submissions=await _count(db, Submission, Submission.status == SubmissionStatus.NEW),
        publications=await _count(db, ResearchPublication, ResearchPublication.status == PublicationStatus.PUBLISHED),
        active_projects=await _count(db, ResearchProject, ResearchProject.status == PublicationStatus.PUBLISHED),
        team_members=await _count(db, TeamMember, TeamMember.is_active.is_(True)),
        partners=await _count(db, Partner, Partner.is_active.is_(True)),
        social_failures=await _count(db, SocialPublication, SocialPublication.status == "failed"),
        total_articles=await _count(db, NewsArticle, NewsArticle.deleted_at.is_(None)),
        total_pages=await _count(db, Page, Page.deleted_at.is_(None)),
        published_pages=await _count(db, Page, Page.status == PublicationStatus.PUBLISHED, Page.deleted_at.is_(None)),
        research_themes=await _count(db, ResearchTheme, ResearchTheme.status == PublicationStatus.PUBLISHED, ResearchTheme.deleted_at.is_(None)),
        featured_projects=await _count(db, ResearchProject, ResearchProject.status == PublicationStatus.PUBLISHED, ResearchProject.is_featured.is_(True), ResearchProject.deleted_at.is_(None)),
        upcoming_opportunities=await _count(
            db,
            Opportunity,
            Opportunity.status == PublicationStatus.PUBLISHED,
            or_(Opportunity.closing_at.is_(None), Opportunity.closing_at >= datetime.now(timezone.utc)),
            Opportunity.deleted_at.is_(None),
        ),
        media_assets=await _count(db, MediaAsset, MediaAsset.deleted_at.is_(None)),
        media_missing_alt_text=await _count(db, MediaAsset, MediaAsset.deleted_at.is_(None), or_(MediaAsset.alt_text.is_(None), MediaAsset.alt_text == "")),
        visible_page_sections=await _count(db, PageSection, PageSection.is_visible.is_(True), PageSection.deleted_at.is_(None)),
        submissions_in_progress=await _count(db, Submission, Submission.status.in_([SubmissionStatus.REVIEWING, SubmissionStatus.ASSIGNED, SubmissionStatus.IN_PROGRESS])),
    )
