from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...models.content import Event, ImpactMetric, Opportunity, Page, PageSection, PublicationStatus, ResearchProject, ResearchPublication, ResearchTheme
from ...models.people import TeamMember
from ...models.partners import Partner
from ...schemas.collections import EventSummary, ImpactMetricSummary, OpportunitySummary, PageSectionSummary, PaginatedCollection, PartnerSummary, PublicPageResponse, ResearchSummary, TeamSummary
from ...services.public import PublicService

router = APIRouter(tags=["HERI Collections"])


async def _paged(db: AsyncSession, model: type, schema: type, page: int, per_page: int):
    query = PublicService.public_query(model)
    total = int((await db.execute(select(func.count()).select_from(query.subquery()))).scalar_one())
    records = (await db.execute(query.order_by(model.created_at.desc()).offset((page - 1) * per_page).limit(per_page))).scalars().all()
    return {"items": [schema.model_validate(item) if hasattr(schema, "model_validate") else schema(item) for item in records], "page": page, "per_page": per_page, "total": total, "pages": max(1, (total + per_page - 1) // per_page)}


@router.get("/team", response_model=list[TeamSummary])
async def team(limit: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    return [TeamSummary.model_validate(item) for item in await PublicService().list(db, TeamMember, limit=limit)]


@router.get("/team/{slug}", response_model=TeamSummary)
async def team_detail(slug: str, db: AsyncSession = Depends(get_db)):
    item = await PublicService().by_slug(db, TeamMember, slug)
    if item is None:
        raise HTTPException(status_code=404, detail="Team member not found")
    return TeamSummary.model_validate(item)


@router.get("/partners", response_model=list[PartnerSummary])
async def partners(limit: int = Query(50, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    return [PartnerSummary.model_validate(item) for item in await PublicService().list(db, Partner, limit=limit)]


@router.get("/research/projects", response_model=list[ResearchSummary])
async def projects(limit: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    return [ResearchSummary.model_validate(item) for item in await PublicService().list(db, ResearchProject, limit=limit)]


@router.get("/research/projects/paginated", response_model=PaginatedCollection)
async def projects_paginated(page: int = Query(1, ge=1), per_page: int = Query(12, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    return await _paged(db, ResearchProject, ResearchSummary, page, per_page)


@router.get("/research/projects/{slug}", response_model=ResearchSummary)
async def project_detail(slug: str, db: AsyncSession = Depends(get_db)):
    item = await PublicService().by_slug(db, ResearchProject, slug)
    if item is None:
        raise HTTPException(status_code=404, detail="Research project not found")
    return ResearchSummary.model_validate(item)


@router.get("/research/publications", response_model=list[ResearchSummary])
async def publications(limit: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    records = await PublicService().list(db, ResearchPublication, limit=limit)
    return [ResearchSummary(id=item.id, slug=item.slug, title=item.title, summary=item.abstract or "") for item in records]


@router.get("/research/publications/paginated", response_model=PaginatedCollection)
async def publications_paginated(page: int = Query(1, ge=1), per_page: int = Query(12, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    return await _paged(db, ResearchPublication, lambda item: ResearchSummary(id=item.id, slug=item.slug, title=item.title, summary=item.abstract or ""), page, per_page)


@router.get("/research/publications/{slug}", response_model=ResearchSummary)
async def publication_detail(slug: str, db: AsyncSession = Depends(get_db)):
    item = await PublicService().by_slug(db, ResearchPublication, slug)
    if item is None:
        raise HTTPException(status_code=404, detail="Research publication not found")
    return ResearchSummary(id=item.id, slug=item.slug, title=item.title, summary=item.abstract or "")


@router.get("/research/themes", response_model=list[ResearchSummary])
async def themes(limit: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    return [ResearchSummary(id=item.id, slug=item.slug, title=item.name, summary=item.description) for item in await PublicService().list(db, ResearchTheme, limit=limit)]


@router.get("/research/themes/{slug}", response_model=ResearchSummary)
async def theme_detail(slug: str, db: AsyncSession = Depends(get_db)):
    item = await PublicService().by_slug(db, ResearchTheme, slug)
    if item is None:
        raise HTTPException(status_code=404, detail="Research theme not found")
    return ResearchSummary(id=item.id, slug=item.slug, title=item.name, summary=item.description)


@router.get("/pages/{slug}", response_model=PublicPageResponse)
async def public_page(slug: str, db: AsyncSession = Depends(get_db)):
    page = (await db.execute(select(Page).where(Page.slug == slug, Page.status == PublicationStatus.PUBLISHED, Page.deleted_at.is_(None)))).scalar_one_or_none()
    if page is None:
        raise HTTPException(status_code=404, detail="Public page not found")
    sections = (await db.execute(select(PageSection).where(PageSection.page_id == page.id, PageSection.is_visible.is_(True), PageSection.deleted_at.is_(None)).order_by(PageSection.position.asc()))).scalars().all()
    return PublicPageResponse(slug=page.slug, title=page.title, seo_title=page.seo_title, seo_description=page.seo_description, sections=[PageSectionSummary.model_validate(section) for section in sections])


@router.get("/impact-metrics", response_model=list[ImpactMetricSummary])
async def impact_metrics(db: AsyncSession = Depends(get_db)):
    records = (await db.execute(select(ImpactMetric).where(ImpactMetric.is_visible.is_(True), ImpactMetric.deleted_at.is_(None)).order_by(ImpactMetric.position.asc(), ImpactMetric.created_at.asc()))).scalars().all()
    return [ImpactMetricSummary.model_validate(item) for item in records]


@router.get("/events", response_model=list[EventSummary])
async def events(limit: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    return [EventSummary.model_validate(item) for item in await PublicService().list(db, Event, limit=limit)]


@router.get("/opportunities", response_model=list[OpportunitySummary])
async def opportunities(limit: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    return [OpportunitySummary.model_validate(item) for item in await PublicService().list(db, Opportunity, limit=limit)]
