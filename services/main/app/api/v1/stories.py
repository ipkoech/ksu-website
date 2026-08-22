"""Story and public contributor submission endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import select

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from .content_workflow import authorize_content_workflow_action
from ...deps import CurrentUser, DbSession, permissions_for_user, require_scope
from ...models import ContentWorkflowLog, Story
from ...schemas import (
    StoryContributorAccountRequestCreate,
    StoryContributorAccountRequestReview,
    StoryCreate,
    StorySubmissionCreate,
    StoryUpdate,
)
from ...services import ContentWorkflowService, StoryContributorAccountRequestService, StoryService

router = APIRouter()

STORY_MANAGE_PERMISSIONS = {"content.manage", "content.manage_stories"}
STORY_CONTRIBUTOR_PERMISSIONS = {"stories.submit", "content.submit", "content.manage"}

# Fields a contributor may change on their own story. Everything else on
# StoryUpdate (is_featured, homepage_priority, source_type, contributor
# identity snapshots, SEO/publication metadata, ...) is editorial and stays
# reviewer/manager-only.
CONTRIBUTOR_EDITABLE_FIELDS = frozenset({
    "title",
    "summary",
    "plain_text",
    "rich_text",
    "structured_content",
    "related_links",
    "featured_media_id",
    "story_type",
    "category",
    "contributor_affiliation_snapshot",
    "show_contributor_name",
    "consent_to_publish",
    "reading_minutes",
})


def _can_manage_stories(permissions: set[str]) -> bool:
    return bool(STORY_MANAGE_PERMISSIONS.intersection(permissions))


def _can_submit_stories(permissions: set[str]) -> bool:
    return bool(STORY_CONTRIBUTOR_PERMISSIONS.intersection(permissions))


def reject_non_contributor_fields(payload: dict) -> None:
    """Block contributors from writing editorial or identity-snapshot fields."""
    disallowed = sorted(set(payload) - CONTRIBUTOR_EDITABLE_FIELDS)
    if disallowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Contributors cannot modify: {', '.join(disallowed)}",
        )


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "story_type", "category", "is_featured", "search", "fields", "include"))
async def list_stories(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=100),
    story_type: str | None = None,
    category: str | None = None,
    is_featured: bool | None = None,
    search: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Story, fields)
    result = await StoryService.list(
        db,
        page=page,
        per_page=per_page,
        story_type=story_type,
        category=category,
        is_featured=is_featured,
        search=search,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.post("/account-requests", status_code=status.HTTP_201_CREATED)
async def request_story_contributor_account(
    data: StoryContributorAccountRequestCreate,
    request: Request,
    db: DbSession,
):
    payload = data.model_dump()
    payload["ip_address"] = request.client.host if request.client else None
    payload["user_agent"] = request.headers.get("user-agent")
    try:
        item = await StoryContributorAccountRequestService.create(db, **payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return success(data=item, message="Contributor account request submitted")


@router.get("/account-requests/admin", dependencies=[Depends(require_scope("content.manage_stories"))])
async def list_story_contributor_account_requests(
    db: DbSession,
    _: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(default=None, alias="status"),
    search: str | None = None,
):
    result = await StoryContributorAccountRequestService.list_admin(
        db,
        page=page,
        per_page=per_page,
        status=status_filter,
        search=search,
    )
    return success(data=result.items, meta=result.meta)


@router.post("/account-requests/admin/{request_id}/approve", dependencies=[Depends(require_scope("content.manage_stories"))])
async def approve_story_contributor_account_request(
    request_id: uuid.UUID,
    db: DbSession,
    user: CurrentUser,
):
    item = await StoryContributorAccountRequestService.get_by_id(db, request_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Contributor request not found")
    try:
        item = await StoryContributorAccountRequestService.approve(db, item, user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return success(data=item, message="Contributor request approved")


@router.post("/account-requests/admin/{request_id}/reject", dependencies=[Depends(require_scope("content.manage_stories"))])
async def reject_story_contributor_account_request(
    request_id: uuid.UUID,
    data: StoryContributorAccountRequestReview,
    db: DbSession,
    user: CurrentUser,
):
    item = await StoryContributorAccountRequestService.get_by_id(db, request_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Contributor request not found")
    try:
        item = await StoryContributorAccountRequestService.reject(
            db,
            item,
            user.id,
            rejection_reason=data.rejection_reason,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return success(data=item, message="Contributor request rejected")


@router.get("/admin", dependencies=[Depends(require_scope("content.manage_stories"))])
async def list_admin_stories(
    db: DbSession,
    _: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    is_published: bool | None = None,
    status: str | None = None,
    workflow_status: str | None = None,
    story_type: str | None = None,
    category: str | None = None,
    contributor_user_id: uuid.UUID | None = None,
    scheduled_from: datetime | None = None,
    scheduled_to: datetime | None = None,
    search: str | None = None,
    record_state: Literal["active", "archived", "deleted"] = "active",
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Story, fields)
    result = await StoryService.list_admin(
        db,
        page=page,
        per_page=per_page,
        is_published=is_published,
        status=status,
        workflow_status=workflow_status,
        owner_portal="cocms",
        story_type=story_type,
        category=category,
        contributor_user_id=contributor_user_id,
        scheduled_from=scheduled_from,
        scheduled_to=scheduled_to,
        search=search,
        record_state=record_state,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/mine")
async def list_my_stories(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    workflow_status: str | None = None,
    search: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    permissions = permissions_for_user(user)
    if not _can_submit_stories(permissions):
        raise HTTPException(status_code=403, detail="Insufficient privileges")
    selector = build_selector(Story, fields)
    result = await StoryService.list_admin(
        db,
        page=page,
        per_page=per_page,
        workflow_status=workflow_status,
        contributor_user_id=user.id,
        search=search,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/id/{story_id}")
async def get_story_by_id(story_id: uuid.UUID, db: DbSession, user: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(Story, fields)
    item = await StoryService.get_by_id(db, story_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Story not found")
    permissions = permissions_for_user(user)
    if not _can_manage_stories(permissions) and item.contributor_user_id != user.id:
        raise HTTPException(status_code=403, detail="Insufficient privileges")
    return success(data=selector.apply(item))


@router.get("/id/{story_id}/feedback")
async def list_story_feedback(
    story_id: uuid.UUID,
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
):
    """Workflow history for a story, readable by its contributor.

    Contributors cannot use the generic content-workflow logs route (it
    requires reviewer/edit permissions), so this surfaces reviewer feedback
    (request_changes / reject comments and transitions) for their own story.
    """
    item = await StoryService.get_by_id(db, story_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Story not found")
    permissions = permissions_for_user(user)
    if not _can_manage_stories(permissions) and item.contributor_user_id != user.id:
        raise HTTPException(status_code=403, detail="Insufficient privileges")
    result = await db.execute(
        select(ContentWorkflowLog)
        .where(
            ContentWorkflowLog.content_type == "stories",
            ContentWorkflowLog.content_id == story_id,
        )
        .order_by(ContentWorkflowLog.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    return success(data=result.scalars().all())


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_story(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Story, fields)
    item = await StoryService.get_by_slug(db, slug, public_only=True, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Story not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_story(data: StoryCreate, db: DbSession, user: CurrentUser):
    permissions = permissions_for_user(user)
    if not _can_manage_stories(permissions):
        raise HTTPException(status_code=403, detail="Insufficient privileges")
    payload = ContentWorkflowService.authoring_create_payload(
        data.model_dump(),
        actor_id=user.id,
        owner_portal="cocms",
        owner_scope_type="university",
        owner_scope_id=None,
    )
    payload["author_user_id"] = user.id
    item = await StoryService.create(db, **payload)
    return success(data=item, message="Story created")


@router.post("/submissions", status_code=status.HTTP_201_CREATED)
async def submit_story(data: StorySubmissionCreate, db: DbSession, user: CurrentUser):
    permissions = permissions_for_user(user)
    if not _can_submit_stories(permissions):
        raise HTTPException(status_code=403, detail="Insufficient privileges")
    payload = ContentWorkflowService.authoring_create_payload(
        data.model_dump(),
        actor_id=user.id,
        owner_portal="cocms",
        owner_scope_type="university",
        owner_scope_id=None,
    )
    payload.update({
        "author_user_id": user.id,
        "contributor_user_id": user.id,
        "contributor_name_snapshot": user.full_name,
        "contributor_email_snapshot": user.email,
        "source_type": "external",
    })
    item = await StoryService.create(db, **payload)
    return success(data=item, message="Story draft created")


@router.patch("/id/{story_id}")
async def update_story(story_id: uuid.UUID, data: StoryUpdate, db: DbSession, user: CurrentUser):
    item = await StoryService.get_by_id(db, story_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Story not found")
    permissions = permissions_for_user(user)
    if not _can_manage_stories(permissions) and item.contributor_user_id != user.id:
        raise HTTPException(status_code=403, detail="Insufficient privileges")
    payload = data.model_dump(exclude_unset=True)
    if not _can_manage_stories(permissions):
        reject_non_contributor_fields(payload)
    current_status = item.workflow_status or item.status
    if current_status in {"submitted", "in_review", "approved", "scheduled"}:
        authorize_content_workflow_action(user, item, "edit", permissions)
    try:
        await ContentWorkflowService.apply_edit_policy(
            db,
            item,
            "stories",
            user.id,
            actor_kind=(
                "reviewer"
                if current_status == "in_review"
                and {"content.review", "content.manage", "content.manage_stories"}.intersection(permissions)
                else "author"
            ),
            changed_fields=payload,
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    item = await StoryService.update(db, item, **payload)
    return success(data=item, message="Story updated")


@router.delete("/id/{story_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("content.manage_stories"))])
async def delete_story(story_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await StoryService.get_by_id(db, story_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Story not found")
    await StoryService.delete(db, item)
