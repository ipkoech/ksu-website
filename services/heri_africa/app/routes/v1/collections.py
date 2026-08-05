from fastapi import APIRouter, Depends, HTTPException, Query, Request
from ksu_common.cache import cached_public
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...models.content import Event, ImpactMetric, Opportunity, Page, PageSection, PublicationStatus, ResearchProject, ResearchPublication, ResearchTheme
from ...models.people import TeamMember
from ...models.partners import Partner
from ...schemas.collections import EventSummary, ImpactMetricSummary, OpportunitySummary, PageSectionSummary, PaginatedCollection, PartnerSummary, PublicPageResponse, ResearchSummary, TeamSummary
from ...services.public import PublicService
from ._rate_limits import public_content_rate_limit

router = APIRouter(tags=["HERI Collections"])


async def _paged(db: AsyncSession, model: type, schema: type, page: int, per_page: int):
    query = PublicService.public_query(model)
    total = int((await db.execute(select(func.count()).select_from(query.subquery()))).scalar_one())
    records = (await db.execute(query.order_by(model.created_at.desc()).offset((page - 1) * per_page).limit(per_page))).scalars().all()
    return {"items": [schema.model_validate(item) if hasattr(schema, "model_validate") else schema(item) for item in records], "page": page, "per_page": per_page, "total": total, "pages": max(1, (total + per_page - 1) // per_page)}


@router.get("/team", response_model=list[TeamSummary])
@public_content_rate_limit
@cached_public(timeout=300, vary_on=("limit",))
async def team(request: Request, limit: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    return [TeamSummary.model_validate(item) for item in await PublicService().list(db, TeamMember, limit=limit)]


@router.get("/team/{slug}", response_model=TeamSummary)
@public_content_rate_limit
@cached_public(timeout=300, vary_on=("slug",))
async def team_detail(request: Request, slug: str, db: AsyncSession = Depends(get_db)):
    item = await PublicService().by_slug(db, TeamMember, slug)
    if item is None:
        raise HTTPException(status_code=404, detail="Team member not found")
    return TeamSummary.model_validate(item)


@router.get("/partners", response_model=list[PartnerSummary])
@public_content_rate_limit
@cached_public(timeout=300, vary_on=("limit", "center_id", "center_slug"))
async def partners(request: Request, limit: int = Query(50, ge=1, le=100), center_id: str | None = Query(None), center_slug: str | None = Query(None), db: AsyncSession = Depends(get_db)):
    query = PublicService.public_query(Partner).order_by(Partner.display_order.asc(), Partner.name.asc()).limit(limit)
    if center_id:
        query = query.where(Partner.research_center_id == center_id)
    if center_slug:
        query = query.where(Partner.research_center_slug == center_slug)
    records = (await db.execute(query)).scalars().all()
    return [PartnerSummary.model_validate(item) for item in records]


@router.get("/centers/{center_id}/partners", response_model=list[PartnerSummary])
@public_content_rate_limit
@cached_public(timeout=300, vary_on=("center_id", "limit"))
async def center_partners(request: Request, center_id: str, limit: int = Query(50, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    return await partners(request=request, limit=limit, center_id=center_id, db=db)


@router.get("/research/projects", response_model=list[ResearchSummary])
@public_content_rate_limit
@cached_public(timeout=300, vary_on=("limit",))
async def projects(request: Request, limit: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    return [ResearchSummary.model_validate(item) for item in await PublicService().list(db, ResearchProject, limit=limit)]


@router.get("/research/projects/paginated", response_model=PaginatedCollection)
@public_content_rate_limit
@cached_public(timeout=300, vary_on=("page", "per_page"))
async def projects_paginated(request: Request, page: int = Query(1, ge=1), per_page: int = Query(12, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    return await _paged(db, ResearchProject, ResearchSummary, page, per_page)


@router.get("/research/projects/{slug}", response_model=ResearchSummary)
@public_content_rate_limit
@cached_public(timeout=300, vary_on=("slug",))
async def project_detail(request: Request, slug: str, db: AsyncSession = Depends(get_db)):
    item = await PublicService().by_slug(db, ResearchProject, slug)
    if item is None:
        raise HTTPException(status_code=404, detail="Research project not found")
    return ResearchSummary.model_validate(item)


@router.get("/research/publications", response_model=list[ResearchSummary])
@public_content_rate_limit
@cached_public(timeout=300, vary_on=("limit",))
async def publications(request: Request, limit: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    records = await PublicService().list(db, ResearchPublication, limit=limit)
    return [ResearchSummary(id=item.id, slug=item.slug, title=item.title, summary=item.abstract or "") for item in records]


@router.get("/research/publications/paginated", response_model=PaginatedCollection)
@public_content_rate_limit
@cached_public(timeout=300, vary_on=("page", "per_page"))
async def publications_paginated(request: Request, page: int = Query(1, ge=1), per_page: int = Query(12, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    return await _paged(db, ResearchPublication, lambda item: ResearchSummary(id=item.id, slug=item.slug, title=item.title, summary=item.abstract or ""), page, per_page)


@router.get("/research/publications/{slug}", response_model=ResearchSummary)
@public_content_rate_limit
@cached_public(timeout=300, vary_on=("slug",))
async def publication_detail(request: Request, slug: str, db: AsyncSession = Depends(get_db)):
    item = await PublicService().by_slug(db, ResearchPublication, slug)
    if item is None:
        raise HTTPException(status_code=404, detail="Research publication not found")
    return ResearchSummary(id=item.id, slug=item.slug, title=item.title, summary=item.abstract or "")


@router.get("/research/themes", response_model=list[ResearchSummary])
@public_content_rate_limit
@cached_public(timeout=300, vary_on=("limit",))
async def themes(request: Request, limit: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    return [ResearchSummary(id=item.id, slug=item.slug, title=item.name, summary=item.description) for item in await PublicService().list(db, ResearchTheme, limit=limit)]


@router.get("/research/themes/{slug}", response_model=ResearchSummary)
@public_content_rate_limit
@cached_public(timeout=300, vary_on=("slug",))
async def theme_detail(request: Request, slug: str, db: AsyncSession = Depends(get_db)):
    item = await PublicService().by_slug(db, ResearchTheme, slug)
    if item is None:
        raise HTTPException(status_code=404, detail="Research theme not found")
    return ResearchSummary(id=item.id, slug=item.slug, title=item.name, summary=item.description)


@router.get("/pages/{slug}", response_model=PublicPageResponse)
@public_content_rate_limit
@cached_public(timeout=300, vary_on=("slug",))
async def public_page(request: Request, slug: str, db: AsyncSession = Depends(get_db)):
    page = (await db.execute(select(Page).where(Page.slug == slug, Page.status == PublicationStatus.PUBLISHED, Page.deleted_at.is_(None)))).scalar_one_or_none()
    if page is None:
        raise HTTPException(status_code=404, detail="Public page not found")
    sections = (await db.execute(select(PageSection).where(PageSection.page_id == page.id, PageSection.is_visible.is_(True), PageSection.deleted_at.is_(None)).order_by(PageSection.position.asc()))).scalars().all()
    return PublicPageResponse(slug=page.slug, title=page.title, seo_title=page.seo_title, seo_description=page.seo_description, sections=[PageSectionSummary.model_validate(section) for section in sections])


@router.get("/impact-metrics", response_model=list[ImpactMetricSummary])
@public_content_rate_limit
@cached_public(timeout=300)
async def impact_metrics(request: Request, db: AsyncSession = Depends(get_db)):
    records = (await db.execute(select(ImpactMetric).where(ImpactMetric.is_visible.is_(True), ImpactMetric.deleted_at.is_(None)).order_by(ImpactMetric.position.asc(), ImpactMetric.created_at.asc()))).scalars().all()
    return [ImpactMetricSummary.model_validate(item) for item in records]


@router.get("/events", response_model=list[EventSummary])
@public_content_rate_limit
@cached_public(timeout=300, vary_on=("limit",))
async def events(request: Request, limit: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    return [EventSummary.model_validate(item) for item in await PublicService().list(db, Event, limit=limit)]


@router.get("/opportunities", response_model=list[OpportunitySummary])
@public_content_rate_limit
@cached_public(timeout=300, vary_on=("limit",))
async def opportunities(request: Request, limit: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    return [OpportunitySummary.model_validate(item) for item in await PublicService().list(db, Opportunity, limit=limit)]
