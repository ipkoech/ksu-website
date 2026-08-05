from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from ksu_common.auth import TokenPayload

from ...core.auth import authorize_permission, get_current_user, require_permission
from ...core.database import get_db
from ...models.content import Event, NewsArticle, PublicationStatus
from ...schemas.admin_content import EventCreate, NewsAdminResponse, NewsCreate, NewsUpdate, TransitionRequest
from ...services.audit import record_audit
from ...services.workflow import WorkflowError, WorkflowService

router = APIRouter(prefix="/admin", tags=["HERI Admin Content"])


@router.get("/news")
async def list_news(page: int = Query(1, ge=1), per_page: int = Query(25, ge=1, le=100), search: str | None = Query(None, min_length=1, max_length=120), status_filter: str | None = Query(None, alias="status"), db: AsyncSession = Depends(get_db), _: TokenPayload = Depends(require_permission("heri.content.read"))):
    filters = [NewsArticle.deleted_at.is_(None)]
    if status_filter: filters.append(NewsArticle.status == status_filter)
    if search: filters.append(NewsArticle.title.ilike(f"%{search}%"))
    total = int((await db.execute(select(func.count()).select_from(NewsArticle).where(*filters))).scalar_one())
    records = (await db.execute(select(NewsArticle).where(*filters).order_by(NewsArticle.created_at.desc()).offset((page - 1) * per_page).limit(per_page))).scalars().all()
    return {"data": [NewsAdminResponse.model_validate(record) for record in records], "meta": {"page": page, "per_page": per_page, "total": total, "pages": max(1, (total + per_page - 1) // per_page)}}


@router.post("/news", response_model=NewsAdminResponse, status_code=status.HTTP_201_CREATED)
async def create_news(payload: NewsCreate, request: Request, db: AsyncSession = Depends(get_db), user: TokenPayload = Depends(require_permission("heri.content.write"))):
    existing = (await db.execute(select(NewsArticle).where(NewsArticle.slug == payload.slug))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="A news article with this slug already exists")
    record = NewsArticle(**payload.model_dump())
    db.add(record)
    await record_audit(db, action="create", entity_type="news_article", entity_id=str(record.id), actor_id=str(user.sub), new_value=payload.model_dump(), ip_address=request.client.host if request.client else None)
    return record


@router.patch("/news/{article_id}", response_model=NewsAdminResponse)
async def update_news(article_id: UUID, payload: NewsUpdate, request: Request, db: AsyncSession = Depends(get_db), user: TokenPayload = Depends(require_permission("heri.content.write"))):
    record = await db.get(NewsArticle, article_id)
    if record is None or record.deleted_at is not None:
        raise HTTPException(status_code=404, detail="News article not found")
    before = {"title": record.title, "excerpt": record.excerpt, "body": record.body}
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, key, value)
    await record_audit(db, action="update", entity_type="news_article", entity_id=str(record.id), actor_id=str(user.sub), previous_value=before, new_value=payload.model_dump(exclude_unset=True), ip_address=request.client.host if request.client else None)
    return record


@router.post("/news/{article_id}/transition", response_model=NewsAdminResponse)
async def transition_news(article_id: UUID, payload: TransitionRequest, request: Request, db: AsyncSession = Depends(get_db), user: TokenPayload = Depends(get_current_user)):
    record = await db.get(NewsArticle, article_id)
    if record is None or record.deleted_at is not None:
        raise HTTPException(status_code=404, detail="News article not found")
    workflow = WorkflowService()
    try:
        required_permission = workflow.transition_permission(record.status.value, payload.status)
    except WorkflowError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    if not authorize_permission(user, required_permission).allowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")
    target = payload.status
    previous = record.status.value
    record.status = PublicationStatus(target)
    await record_audit(db, action="transition", entity_type="news_article", entity_id=str(record.id), actor_id=str(user.sub), previous_value={"status": previous}, new_value={"status": target, "note": payload.note}, ip_address=request.client.host if request.client else None)
    return record


@router.get("/events")
async def list_events(page: int = Query(1, ge=1), per_page: int = Query(25, ge=1, le=100), search: str | None = Query(None, min_length=1, max_length=120), status_filter: str | None = Query(None, alias="status"), db: AsyncSession = Depends(get_db), _: TokenPayload = Depends(require_permission("heri.content.read"))):
    filters = [Event.deleted_at.is_(None)]
    if status_filter: filters.append(Event.status == status_filter)
    if search: filters.append(Event.title.ilike(f"%{search}%"))
    total = int((await db.execute(select(func.count()).select_from(Event).where(*filters))).scalar_one())
    records = (await db.execute(select(Event).where(*filters).order_by(Event.starts_at.asc()).offset((page - 1) * per_page).limit(per_page))).scalars().all()
    return {"data": records, "meta": {"page": page, "per_page": per_page, "total": total, "pages": max(1, (total + per_page - 1) // per_page)}}


@router.post("/events", status_code=status.HTTP_201_CREATED)
async def create_event(payload: EventCreate, db: AsyncSession = Depends(get_db), _: TokenPayload = Depends(require_permission("heri.content.write"))):
    event = Event(**payload.model_dump())
    db.add(event)
    return event
