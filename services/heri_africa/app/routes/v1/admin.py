from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.auth import require_permission
from ...core.database import get_db
from ...models.content import NewsArticle, PublicationStatus, ResearchProject, ResearchPublication
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
        upcoming_events=0,
        new_submissions=await _count(db, Submission, Submission.status == SubmissionStatus.NEW),
        publications=await _count(db, ResearchPublication, ResearchPublication.status == PublicationStatus.PUBLISHED),
        active_projects=await _count(db, ResearchProject, ResearchProject.status == PublicationStatus.PUBLISHED),
        team_members=await _count(db, TeamMember, TeamMember.is_active.is_(True)),
        partners=await _count(db, Partner, Partner.is_active.is_(True)),
        social_failures=await _count(db, SocialPublication, SocialPublication.status == "failed"),
    )
