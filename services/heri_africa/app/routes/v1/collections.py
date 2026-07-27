from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...models.content import Event, Opportunity, ResearchProject, ResearchPublication, ResearchTheme
from ...models.people import TeamMember
from ...models.partners import Partner
from ...schemas.collections import EventSummary, OpportunitySummary, PartnerSummary, ResearchSummary, TeamSummary
from ...services.public import PublicService

router = APIRouter(tags=["HERI Collections"])


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


@router.get("/research/publications", response_model=list[ResearchSummary])
async def publications(limit: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    records = await PublicService().list(db, ResearchPublication, limit=limit)
    return [ResearchSummary(id=item.id, slug=item.slug, title=item.title, summary=item.abstract or "") for item in records]


@router.get("/events", response_model=list[EventSummary])
async def events(limit: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    return [EventSummary.model_validate(item) for item in await PublicService().list(db, Event, limit=limit)]


@router.get("/opportunities", response_model=list[OpportunitySummary])
async def opportunities(limit: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    return [OpportunitySummary.model_validate(item) for item in await PublicService().list(db, Opportunity, limit=limit)]
