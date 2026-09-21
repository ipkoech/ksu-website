"""Newsletter endpoints."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, status
from fastapi.responses import JSONResponse
from ksu_common import cached_public, rate_limit
from ksu_common.rate_limit import RateLimiter
from ksu_common.schemas.responses import SuccessResponse, success

from ...core.config import get_settings
from ...deps import CurrentUser, DbSession, require_scope
from ...models import Newsletter, NewsletterSubscriber
from ...schemas import (
    NewsletterCreate,
    NewsletterSnapshot,
    NewsletterSubscriberCreate,
    NewsletterSubscriberSnapshot,
    NewsletterScheduleRequest,
    NewsletterUpdate,
)
from ...services import NewsletterService, NewsletterSubscriberService
from ...services.domain_events import enqueue_celery_after_commit
from ...services.idempotency import (
    acquire_json_command,
    complete_json_command,
    fail_json_command,
)
from ._fields import FieldsDep, FieldSelection, build_selector

router = APIRouter()
settings = get_settings()
NEWSLETTER_ADMIN_SCOPE = "marketing.manage_newsletters"
_NEWSLETTER_EMAIL_LIMITER = RateLimiter(requests=5, window=3600, prefix="main:newsletter:email")
IdempotencyKey = Annotated[str, Header(alias="Idempotency-Key", min_length=8, max_length=255)]


@router.get("", response_model_exclude_unset=True, response_model=SuccessResponse[list[NewsletterSnapshot]])
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


@router.get("/admin", response_model_exclude_unset=True, response_model=SuccessResponse[list[NewsletterSnapshot]], dependencies=[Depends(require_scope(NEWSLETTER_ADMIN_SCOPE))])
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


@router.get("/subscribers", response_model_exclude_unset=True, response_model=SuccessResponse[list[NewsletterSubscriberSnapshot]], dependencies=[Depends(require_scope(NEWSLETTER_ADMIN_SCOPE))])
async def list_newsletter_subscribers(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(NewsletterSubscriber, fields)
    result = await NewsletterSubscriberService.list(
        db,
        page=page,
        per_page=per_page,
        status=status,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/admin/{item_id}", response_model_exclude_unset=True, response_model=SuccessResponse[NewsletterSnapshot], dependencies=[Depends(require_scope(NEWSLETTER_ADMIN_SCOPE))])
async def get_newsletter_admin(item_id: uuid.UUID, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Newsletter, fields)
    item = await NewsletterService.get_by_id(db, item_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    return success(data=selector.apply(item))


@router.get("/{slug}", response_model_exclude_unset=True, response_model=SuccessResponse[NewsletterSnapshot])
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_newsletter(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Newsletter, fields)
    item = await NewsletterService.get_by_slug(db, slug, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    return success(data=selector.apply(item))


def _newsletter_in_progress(detail: str) -> dict[str, str]:
    return {"detail": detail}


@router.post("/subscribe", status_code=status.HTTP_201_CREATED, response_model_exclude_unset=True, response_model=SuccessResponse[NewsletterSubscriberSnapshot])
@rate_limit(
    requests=settings.NEWSLETTER_RATE_LIMIT_COUNT,
    window=settings.NEWSLETTER_RATE_LIMIT_WINDOW_SECONDS,
    prefix="main:newsletter:subscribe:ip",
    max_body_bytes=8 * 1024,
)
async def subscribe_newsletter(
    request: Request,
    data: NewsletterSubscriberCreate,
    db: DbSession,
    idempotency_key: IdempotencyKey,
):
    email = data.email.strip().lower()
    claim = await acquire_json_command(
        db,
        command_name="public.newsletter.subscribe",
        scope=f"public:newsletter:{email}",
        idempotency_key=idempotency_key.strip(),
        request_payload=data.model_dump(mode="json"),
        in_progress_body=_newsletter_in_progress(
            "A subscription request with this Idempotency-Key is still being processed"
        ),
        key_reuse_body={"detail": "This Idempotency-Key was already used for a different subscription request"},
    )
    if isinstance(claim, JSONResponse):
        return claim
    if claim.kind == "replay":
        return claim.record.response_body or {}
    await _NEWSLETTER_EMAIL_LIMITER.check(email, f"{request.method}:{request.url.path}:email")
    item = await NewsletterSubscriberService.subscribe(db, **data.model_dump())
    return complete_json_command(
        claim.record,
        status_code=status.HTTP_201_CREATED,
        response_body=success(data=item, message="Subscription created"),
    )


@router.post("/unsubscribe", response_model_exclude_unset=True, response_model=SuccessResponse[NewsletterSubscriberSnapshot])
@rate_limit(
    requests=settings.NEWSLETTER_RATE_LIMIT_COUNT,
    window=settings.NEWSLETTER_RATE_LIMIT_WINDOW_SECONDS,
    prefix="main:newsletter:unsubscribe:ip",
    max_body_bytes=4 * 1024,
)
async def unsubscribe_newsletter(
    request: Request,
    email: str,
    db: DbSession,
    idempotency_key: IdempotencyKey,
):
    normalized_email = email.strip().lower()
    claim = await acquire_json_command(
        db,
        command_name="public.newsletter.unsubscribe",
        scope=f"public:newsletter:{normalized_email}",
        idempotency_key=idempotency_key.strip(),
        request_payload={"email": normalized_email},
        in_progress_body=_newsletter_in_progress(
            "An unsubscribe request with this Idempotency-Key is still being processed"
        ),
        key_reuse_body={"detail": "This Idempotency-Key was already used for a different unsubscribe request"},
    )
    if isinstance(claim, JSONResponse):
        return claim
    if claim.kind == "replay":
        return claim.record.response_body or {}
    await _NEWSLETTER_EMAIL_LIMITER.check(normalized_email, f"{request.method}:{request.url.path}:email")
    item = await NewsletterSubscriberService.unsubscribe(db, email)
    if item is None:
        return fail_json_command(
            claim.record,
            status_code=status.HTTP_404_NOT_FOUND,
            response_body={"detail": "Subscriber not found"},
        )
    return complete_json_command(
        claim.record,
        status_code=status.HTTP_200_OK,
        response_body=success(data=item, message="Subscription cancelled"),
    )


@router.post("", status_code=status.HTTP_201_CREATED, response_model_exclude_unset=True, response_model=SuccessResponse[NewsletterSnapshot], dependencies=[Depends(require_scope(NEWSLETTER_ADMIN_SCOPE))])
async def create_newsletter(data: NewsletterCreate, db: DbSession, _: CurrentUser):
    item = await NewsletterService.create(db, **data.model_dump())
    return success(data=item, message="Newsletter created")


@router.post("/{item_id}/send", response_model_exclude_unset=True, response_model=SuccessResponse[NewsletterSnapshot], dependencies=[Depends(require_scope(NEWSLETTER_ADMIN_SCOPE))])
async def send_newsletter(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    try:
        item = await NewsletterService.queue_send(db, item_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    if item is None:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    enqueue_celery_after_commit(db, "main.newsletters.send", args=[str(item.id)], recoverable=True)
    return success(data=item, message="Newsletter queued for sending")


@router.post("/{item_id}/schedule", response_model_exclude_unset=True, response_model=SuccessResponse[NewsletterSnapshot], dependencies=[Depends(require_scope(NEWSLETTER_ADMIN_SCOPE))])
async def schedule_newsletter(
    item_id: uuid.UUID,
    data: NewsletterScheduleRequest,
    db: DbSession,
    _: CurrentUser,
):
    try:
        item = await NewsletterService.schedule_send(db, item_id, data.scheduled_send_at)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    if item is None:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    return success(data=item, message="Newsletter scheduled for sending")


@router.post("/{item_id}/cancel-schedule", response_model_exclude_unset=True, response_model=SuccessResponse[NewsletterSnapshot], dependencies=[Depends(require_scope(NEWSLETTER_ADMIN_SCOPE))])
async def cancel_newsletter_schedule(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    try:
        item = await NewsletterService.cancel_schedule(db, item_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    if item is None:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    return success(data=item, message="Newsletter schedule cancelled")


@router.post("/subscribers/{item_id}/unsubscribe", response_model_exclude_unset=True, response_model=SuccessResponse[NewsletterSubscriberSnapshot], dependencies=[Depends(require_scope(NEWSLETTER_ADMIN_SCOPE))])
async def unsubscribe_newsletter_subscriber(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await NewsletterSubscriberService.unsubscribe_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    return success(data=item, message="Subscription cancelled")


@router.patch("/{item_id}", response_model_exclude_unset=True, response_model=SuccessResponse[NewsletterSnapshot], dependencies=[Depends(require_scope(NEWSLETTER_ADMIN_SCOPE))])
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
