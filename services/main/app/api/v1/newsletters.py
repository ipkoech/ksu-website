"""Newsletter endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import select

from ksu_common import cached_public, rate_limit
from ksu_common.schemas.responses import success

from ...core.config import get_settings
from ...deps import CurrentUser, DbSession, require_scope
from ...models import Newsletter, NewsletterSubscriber
from ...schemas import (
    NewsletterCreate,
    NewsletterScheduleRequest,
    NewsletterSubscriberCreate,
    NewsletterUpdate,
)
from ...services import NewsletterService, NewsletterSubscriberService
from ...services.domain_events import enqueue_celery_after_commit
from ._fields import FieldSelection, FieldsDep, build_selector

router = APIRouter()
settings = get_settings()
NEWSLETTER_ADMIN_SCOPE = "marketing.manage_newsletters"
NEWSLETTER_SEND_TASK = "main.newsletters.send"

# Send states a newsletter may transition to "scheduled" from. "sending" and
# "sent" are terminal for the send workflow and must be rejected server-side.
SENDABLE_SEND_STATUSES = frozenset({"draft", "failed", "scheduled"})


async def _get_newsletter_for_update(db: DbSession, item_id: uuid.UUID) -> Newsletter | None:
    """Load a newsletter with a row lock so send-state transitions are atomic."""
    result = await db.execute(
        select(Newsletter)
        .where(Newsletter.id == item_id, Newsletter.deleted_at.is_(None))
        .with_for_update()
    )
    return result.scalar_one_or_none()


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "q", "fields", "include"))
async def list_newsletters(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    q: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Newsletter, fields)
    result = await NewsletterService.list(db, page=page, per_page=per_page, q=q, load_options=selector.load_options)
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/admin", dependencies=[Depends(require_scope(NEWSLETTER_ADMIN_SCOPE))])
async def list_newsletters_admin(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    q: str | None = None,
    search: str | None = None,
    status: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Newsletter, fields)
    result = await NewsletterService.list(
        db,
        page=page,
        per_page=per_page,
        q=q or search,
        status=status,
        public_only=False,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/subscribers", dependencies=[Depends(require_scope(NEWSLETTER_ADMIN_SCOPE))])
async def list_newsletter_subscribers(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: str | None = None,
    q: str | None = None,
    is_verified: bool | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(NewsletterSubscriber, fields)
    result = await NewsletterSubscriberService.list(
        db,
        page=page,
        per_page=per_page,
        status=status,
        q=q,
        is_verified=is_verified,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.post(
    "/subscribers/{item_id}/unsubscribe",
    dependencies=[Depends(require_scope(NEWSLETTER_ADMIN_SCOPE))],
)
async def unsubscribe_newsletter_subscriber_admin(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    """Honor unsubscribe requests received out-of-band (phone or email)."""
    item = await NewsletterSubscriberService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    if item.status != "unsubscribed":
        item = await NewsletterSubscriberService.unsubscribe(db, item.email)
    return success(data=item, message="Subscriber unsubscribed")


@router.get("/admin/{item_id}", dependencies=[Depends(require_scope(NEWSLETTER_ADMIN_SCOPE))])
async def get_newsletter_admin(item_id: uuid.UUID, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Newsletter, fields)
    item = await NewsletterService.get_by_id(db, item_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    return success(data=selector.apply(item))


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_newsletter(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Newsletter, fields)
    item = await NewsletterService.get_by_slug(db, slug, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    return success(data=selector.apply(item))


@router.post("/subscribe", status_code=status.HTTP_201_CREATED)
@rate_limit(
    requests=settings.NEWSLETTER_RATE_LIMIT_COUNT,
    window=settings.NEWSLETTER_RATE_LIMIT_WINDOW_SECONDS,
    prefix="main:newsletter",
)
async def subscribe_newsletter(request: Request, data: NewsletterSubscriberCreate, db: DbSession):
    item = await NewsletterSubscriberService.subscribe(db, **data.model_dump())
    return success(data=item, message="Subscription created")


@router.post("/unsubscribe")
@rate_limit(
    requests=settings.NEWSLETTER_RATE_LIMIT_COUNT,
    window=settings.NEWSLETTER_RATE_LIMIT_WINDOW_SECONDS,
    prefix="main:newsletter",
)
async def unsubscribe_newsletter(request: Request, email: str, db: DbSession):
    item = await NewsletterSubscriberService.unsubscribe(db, email)
    if item is None:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    return success(data=item, message="Subscription cancelled")


@router.get("/unsubscribe/{token}")
@rate_limit(
    requests=settings.NEWSLETTER_RATE_LIMIT_COUNT,
    window=settings.NEWSLETTER_RATE_LIMIT_WINDOW_SECONDS,
    prefix="main:newsletter",
)
async def unsubscribe_newsletter_by_token(request: Request, token: str, db: DbSession):
    """One-click unsubscribe used by the link embedded in every newsletter email."""
    item = await NewsletterSubscriberService.get_by_token(db, token)
    if item is None:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    if item.status != "unsubscribed":
        item = await NewsletterSubscriberService.unsubscribe(db, item.email)
    return success(data=item, message="You have been unsubscribed from Kisii University updates")


@router.post("/{item_id}/send", dependencies=[Depends(require_scope(NEWSLETTER_ADMIN_SCOPE))])
async def send_newsletter_now(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await _get_newsletter_for_update(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    if item.send_status not in SENDABLE_SEND_STATUSES:
        raise HTTPException(
            status_code=409,
            detail=f"Newsletter cannot be sent while in the '{item.send_status}' state",
        )
    item.send_status = "scheduled"
    item.scheduled_send_at = datetime.now(timezone.utc)
    item.send_error = None
    await db.flush()
    enqueue_celery_after_commit(db, NEWSLETTER_SEND_TASK, args=[str(item.id)])
    return success(data=item, message="Newsletter queued for sending")


@router.post("/{item_id}/schedule", dependencies=[Depends(require_scope(NEWSLETTER_ADMIN_SCOPE))])
async def schedule_newsletter_send(
    item_id: uuid.UUID,
    data: NewsletterScheduleRequest,
    db: DbSession,
    _: CurrentUser,
):
    scheduled_at = data.scheduled_send_at
    if scheduled_at.tzinfo is None:
        scheduled_at = scheduled_at.replace(tzinfo=timezone.utc)
    if scheduled_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="scheduled_send_at must be in the future")
    item = await _get_newsletter_for_update(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    if item.send_status not in SENDABLE_SEND_STATUSES:
        raise HTTPException(
            status_code=409,
            detail=f"Newsletter cannot be scheduled while in the '{item.send_status}' state",
        )
    item.send_status = "scheduled"
    item.scheduled_send_at = scheduled_at
    item.send_error = None
    await db.flush()
    return success(data=item, message="Newsletter send scheduled")


@router.post("/{item_id}/cancel-schedule", dependencies=[Depends(require_scope(NEWSLETTER_ADMIN_SCOPE))])
async def cancel_newsletter_schedule(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await _get_newsletter_for_update(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    if item.send_status != "scheduled":
        raise HTTPException(
            status_code=409,
            detail=f"Only scheduled newsletters can be cancelled (current state: '{item.send_status}')",
        )
    item.send_status = "draft"
    item.scheduled_send_at = None
    await db.flush()
    return success(data=item, message="Scheduled send cancelled")


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope(NEWSLETTER_ADMIN_SCOPE))])
async def create_newsletter(data: NewsletterCreate, db: DbSession, _: CurrentUser):
    item = await NewsletterService.create(db, **data.model_dump())
    return success(data=item, message="Newsletter created")


@router.patch("/{item_id}", dependencies=[Depends(require_scope(NEWSLETTER_ADMIN_SCOPE))])
async def update_newsletter(item_id: uuid.UUID, data: NewsletterUpdate, db: DbSession, _: CurrentUser):
    item = await NewsletterService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    item = await NewsletterService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Newsletter updated")


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope(NEWSLETTER_ADMIN_SCOPE))])
async def delete_newsletter(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await NewsletterService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    await NewsletterService.delete(db, item)
