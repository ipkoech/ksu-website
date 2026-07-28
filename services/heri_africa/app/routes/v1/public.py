from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...models.content import FooterLink, HeroSlide, NavigationItem, NewsArticle, SiteSettings
from ...schemas.public import NewsSummary, SiteResponse
from ...schemas.site import FooterLinkResponse, NavigationItemResponse
from ...services.public import PublicService

router = APIRouter(tags=["HERI Public"])


@router.get("/site", response_model=SiteResponse)
async def site(db: AsyncSession = Depends(get_db)) -> SiteResponse:
    settings = (await db.execute(select(SiteSettings).order_by(SiteSettings.created_at.asc()))).scalars().first()
    if settings is None:
        return SiteResponse(name="HERI Africa", tagline=None, contact={}, social_links={}, seo_defaults={})
    return SiteResponse.model_validate(settings)


@router.get("/navigation", response_model=list[NavigationItemResponse])
async def navigation(db: AsyncSession = Depends(get_db)):
    records = (await db.execute(select(NavigationItem).where(NavigationItem.is_visible.is_(True)).order_by(NavigationItem.position.asc()))).scalars().all()
    return [NavigationItemResponse.model_validate(item) for item in records]


@router.get("/hero-slides")
async def hero_slides(db: AsyncSession = Depends(get_db)):
    records = (await db.execute(select(HeroSlide).where(HeroSlide.is_active.is_(True)).order_by(HeroSlide.position.asc(), HeroSlide.created_at.asc()))).scalars().all()
    return records


@router.get("/footer", response_model=list[FooterLinkResponse])
async def footer(db: AsyncSession = Depends(get_db)):
    records = (await db.execute(select(FooterLink).where(FooterLink.is_visible.is_(True)).order_by(FooterLink.column.asc(), FooterLink.position.asc()))).scalars().all()
    return [FooterLinkResponse.model_validate(item) for item in records]


@router.get("/news", response_model=list[NewsSummary])
async def news(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> list[NewsSummary]:
    records = await PublicService().list(db, NewsArticle, limit=limit, offset=offset)
    return [NewsSummary.model_validate(record) for record in records]


@router.get("/news/{slug}", response_model=NewsSummary)
async def news_detail(slug: str, db: AsyncSession = Depends(get_db)) -> NewsSummary:
    from fastapi import HTTPException

    record = await PublicService().by_slug(db, NewsArticle, slug)
    if record is None:
        raise HTTPException(status_code=404, detail="News article not found")
    return NewsSummary.model_validate(record)
