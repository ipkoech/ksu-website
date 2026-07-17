"""Shared review and publication workflow endpoints."""

from __future__ import annotations

import uuid
from datetime import date, datetime, time, timedelta, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import selectinload

from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, permissions_for_user
from ...models import (
    Announcement,
    Blog,
    ClubActivity,
    ContentWorkflowLog,
    Event,
    Document,
    MediaLink,
    News,
    PageSection,
    PartnershipSpotlight,
    Slider,
    User,
)
from ...schemas.content_workflow import ContentWorkflowActionRequest
from ...security.scopes import can_access_scope
from ...services.content_workflow import ContentWorkflowService

router = APIRouter()

CONTENT_MODELS = {
    "news": News,
    "blogs": Blog,
    "announcements": Announcement,
    "events": Event,
    "club-events": ClubActivity,
    "club-media": MediaLink,
    "page-sections": PageSection,
    "partnership-spotlights": PartnershipSpotlight,
    "sliders": Slider,
    "documents": Document,
    "school-gallery": MediaLink,
}
CUSTOM_WORKFLOW_CONTENT_TYPES = {"page-sections", "partnership-spotlights"}
REVIEW_ACTIONS = {"start_review", "request_changes", "approve", "reject"}
PUBLISH_ACTIONS = {"schedule", "publish", "unpublish"}
QUEUE_ACCESS_PERMISSIONS = {"content.review", "content.publish", "content.manage", "homepage.manage"}
CLUB_EVENT_SUBMIT_PERMISSIONS = ("clubs.content_submit", "clubs.manage_own")
COCMS_WORKFLOW_PERMISSIONS = {"content.review", "content.publish", "content.manage"}
PORTAL_LABELS = {
    "admin": "University Administration",
    "alumni": "Alumni Portal",
    "cocms": "CoCMS",
    "library": "Library Portal",
    "main": "Main University Website",
    "research": "Research Portal",
    "schools": "Schools Portal",
    "student-clubs": "Student Clubs Portal",
}
CONTENT_TYPE_LABELS = {
    "news": "News",
    "blogs": "Blog",
    "announcements": "Announcement",
    "events": "Event",
    "club-events": "Club Event",
    "club-media": "Club Media",
    "page-sections": "Page Section",
    "partnership-spotlights": "Partnership Spotlight",
    "sliders": "Slider",
    "documents": "Document",
    "school-gallery": "School Gallery",
}
PREVIEW_PATH_PREFIXES = {
    "news": "/news",
    "blogs": "/blogs",
    "announcements": "/announcements",
    "events": "/events",
}
EDIT_PATHS = {
    "news": "/corporate-communication/newsroom/news",
    "blogs": "/corporate-communication/newsroom/press-releases",
    "announcements": "/corporate-communication/newsroom/notices",
    "events": "/corporate-communication/newsroom/events",
    "club-events": "/student-clubs/events",
    "club-media": "/cocms/review-queue",
    "page-sections": "/page-cms/sections/{id}",
    "partnership-spotlights": "/corporate-communication/page-cms/spotlights",
    "sliders": "/corporate-communication/media/sliders",
    "documents": "/corporate-communication/review-queue",
    "school-gallery": "/corporate-communication/review-queue",
}
WORKFLOW_ACTION_PATHS = {
    "page-sections": "/api/v1/page-sections/{id}/{action}",
    "partnership-spotlights": "/api/v1/partnership-spotlights/{id}/{action}",
}


def authorize_content_workflow_queue_access(permissions: set[str]) -> None:
    """Require a CoCMS role capable of reviewing or managing published content."""
    if not QUEUE_ACCESS_PERMISSIONS.intersection(permissions):
        raise HTTPException(status_code=403, detail="Insufficient privileges")


def authorize_cocms_workflow_permission(permissions: set[str]) -> None:
    """Require a CoCMS content workflow permission, excluding homepage-only access."""
    if not COCMS_WORKFLOW_PERMISSIONS.intersection(permissions):
        raise HTTPException(status_code=403, detail="Insufficient privileges")


def _portal_label(portal: str | None) -> str:
    if not portal:
        return "Main University Website"
    return PORTAL_LABELS.get(portal, portal.replace("-", " ").replace("_", " ").title())


def _matches_date(value: datetime | None, expected: date | None) -> bool:
    return expected is None or (value is not None and value.date() == expected)


def _date_bounds(value: date) -> tuple[datetime, datetime]:
    start = datetime.combine(value, time.min, tzinfo=timezone.utc)
    return start, start + timedelta(days=1)


def _preview_path(content_type: str, slug: str | None) -> str | None:
    prefix = PREVIEW_PATH_PREFIXES.get(content_type)
    return f"{prefix}/{slug}" if prefix and slug else None


def build_content_workflow_queue_items(
    records_by_type: dict[str, list[Any]],
    actor_labels: dict[uuid.UUID, str],
    *,
    source_portal: str | None = None,
    content_type: str | None = None,
    status_filter: str | None = None,
    submitted_date: date | None = None,
    scheduled_date: date | None = None,
    reviewer: str | None = None,
) -> list[dict[str, Any]]:
    """Normalize heterogeneous publishable records for the CoCMS review queue."""
    normalized_reviewer = reviewer.strip().casefold() if reviewer else None
    items: list[dict[str, Any]] = []
    for item_type, records in records_by_type.items():
        if content_type and item_type != content_type:
            continue
        for record in records:
            workflow_status = getattr(record, "workflow_status", None) or getattr(record, "status", "draft")
            owner_portal = getattr(record, "owner_portal", None)
            submitted_at = getattr(record, "submitted_at", None)
            scheduled_publish_at = getattr(record, "scheduled_publish_at", None)
            reviewer_label = actor_labels.get(getattr(record, "reviewed_by_id", None), "Unassigned")
            author_label = actor_labels.get(getattr(record, "author_user_id", None))
            source_label = _portal_label(owner_portal)
            owner_label = author_label or source_label
            media = getattr(record, "media", None)
            title = (
                getattr(record, "title", None)
                or getattr(record, "headline", None)
                or getattr(record, "section_key", None)
                or getattr(media, "title", None)
                or getattr(media, "original_filename", None)
                or getattr(media, "filename", None)
                or "Untitled content"
            )

            if source_portal == "main" and owner_portal not in (None, "main"):
                continue
            if source_portal and source_portal != "main" and owner_portal != source_portal:
                continue
            if status_filter and workflow_status != status_filter:
                continue
            if not _matches_date(submitted_at, submitted_date):
                continue
            if not _matches_date(scheduled_publish_at, scheduled_date):
                continue
            if normalized_reviewer and normalized_reviewer not in reviewer_label.casefold():
                continue

            items.append({
                "id": str(record.id),
                "content_type": item_type,
                "content_type_label": CONTENT_TYPE_LABELS[item_type],
                "title": title,
                "summary": (
                    getattr(record, "summary", None)
                    or getattr(record, "description", None)
                    or getattr(record, "plain_text", None)
                ),
                "status": workflow_status,
                "source_portal": owner_portal or "main",
                "source_label": source_label,
                "owner_label": owner_label,
                "submitted_by_label": actor_labels.get(getattr(record, "submitted_by_id", None), "Not submitted"),
                "submitted_at": submitted_at,
                "reviewer_label": reviewer_label,
                "scheduled_publish_at": scheduled_publish_at,
                "publication_target": source_label,
                "preview_path": _preview_path(item_type, getattr(record, "slug", None)),
                "edit_path": EDIT_PATHS[item_type].format(id=record.id),
                "workflow_action_path": WORKFLOW_ACTION_PATHS.get(
                    item_type,
                    f"/api/v1/content-workflow/{item_type}/{record.id}/{{action}}",
                ).format(id=record.id, action="{action}"),
                "preview": {
                    "rich_text": getattr(record, "rich_text", None),
                    "plain_text": getattr(record, "plain_text", None),
                    "structured_content": getattr(record, "structured_content", None),
                    "related_links": getattr(record, "related_links", None) or [],
                    "seo": {
                        "title": getattr(record, "meta_title", None),
                        "description": getattr(record, "meta_description", None),
                        "keywords": getattr(record, "keywords", None),
                    },
                },
            })

    return sorted(
        items,
        key=lambda item: item["submitted_at"].timestamp() if item["submitted_at"] else float("-inf"),
        reverse=True,
    )


async def _workflow_queue_actor_labels(db: DbSession, records_by_type: dict[str, list[Any]]) -> dict[uuid.UUID, str]:
    actor_ids = {
        actor_id
        for records in records_by_type.values()
        for record in records
        for actor_id in (
            getattr(record, "author_user_id", None),
            getattr(record, "submitted_by_id", None),
            getattr(record, "reviewed_by_id", None),
        )
        if actor_id is not None
    }
    if not actor_ids:
        return {}
    result = await db.execute(select(User.id, User.full_name).where(User.id.in_(actor_ids)))
    return {user_id: full_name for user_id, full_name in result.all()}


@router.get("/queue")
async def list_content_workflow_queue(
    db: DbSession,
    user: CurrentUser,
    source_portal: str | None = Query(default=None),
    content_type: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    submitted_date: date | None = Query(default=None),
    scheduled_date: date | None = Query(default=None),
    reviewer: str | None = Query(default=None),
):
    """Return reviewable public content in a single CoCMS-oriented queue."""
    authorize_content_workflow_queue_access(permissions_for_user(user))
    if content_type and content_type not in CONTENT_MODELS:
        raise HTTPException(status_code=400, detail="Unsupported content type")

    records_by_type: dict[str, list[Any]] = {}
    for item_type, model in CONTENT_MODELS.items():
        if content_type and item_type != content_type:
            continue
        query = model.active_query().order_by(model.submitted_at.desc().nullslast(), model.created_at.desc())
        if item_type == "club-media":
            query = query.options(selectinload(MediaLink.media)).where(
                MediaLink.owner_portal == "student-clubs",
                MediaLink.owner_scope_type == "club",
            )
        elif item_type == "school-gallery":
            query = query.options(selectinload(MediaLink.media)).where(
                MediaLink.owner_portal == "schools",
                MediaLink.owner_scope_type == "school",
                MediaLink.entity_type == "school",
            )
        if source_portal == "main":
            query = query.where(or_(model.owner_portal.is_(None), model.owner_portal == "main"))
        elif source_portal:
            query = query.where(model.owner_portal == source_portal)
        if status_filter:
            query = query.where(model.workflow_status == status_filter)
        if submitted_date:
            start, end = _date_bounds(submitted_date)
            query = query.where(model.submitted_at >= start, model.submitted_at < end)
        if scheduled_date:
            start, end = _date_bounds(scheduled_date)
            query = query.where(model.scheduled_publish_at >= start, model.scheduled_publish_at < end)
        result = await db.execute(query)
        records_by_type[item_type] = list(result.scalars().all())

    actor_labels = await _workflow_queue_actor_labels(db, records_by_type)
    items = build_content_workflow_queue_items(
        records_by_type,
        actor_labels,
        source_portal=source_portal,
        content_type=content_type,
        status_filter=status_filter,
        submitted_date=submitted_date,
        scheduled_date=scheduled_date,
        reviewer=reviewer,
    )
    return success(data=items, message="Content workflow queue retrieved")


def authorize_content_workflow_action(user, content, action: str, permissions: set[str]) -> None:
    owner_id = getattr(content, "author_user_id", None)
    if action == "edit":
        workflow_status = getattr(content, "workflow_status", None) or content.status
        if workflow_status in {"submitted", "in_review", "approved", "scheduled"}:
            if {"content.edit_submitted", "content.manage", "admin:*"}.intersection(permissions):
                return
            raise HTTPException(status_code=403, detail="Submitted content requires review edit privileges")
        if {"content.manage", "admin:*"}.intersection(permissions):
            return
        if owner_id == user.id and "content.edit" in permissions:
            return
        raise HTTPException(status_code=403, detail="Insufficient privileges")
    if action in PUBLISH_ACTIONS:
        if owner_id == user.id or "content.publish" not in permissions:
            raise HTTPException(status_code=403, detail="Content owners cannot publish")
        return
    if action == "submit" and owner_id == user.id:
        return
    required = "content.review" if action in REVIEW_ACTIONS else "content.submit" if action == "submit" else "content.archive"
    if required not in permissions and "content.manage" not in permissions:
        raise HTTPException(status_code=403, detail="Insufficient privileges")


async def authorize_club_event_workflow_action(
    db: DbSession,
    user: CurrentUser,
    content: ClubActivity,
    action: str,
    permissions: set[str],
) -> None:
    """Apply club scope checks to generic workflow routes for club events."""
    if action != "submit":
        authorize_cocms_workflow_permission(permissions)
        return

    for permission in CLUB_EVENT_SUBMIT_PERMISSIONS:
        if await can_access_scope(db, user, permission, "club", content.club_id):
            return
    raise HTTPException(status_code=403, detail="Insufficient privileges for this club event")


def authorize_club_media_workflow_action(action: str, permissions: set[str]) -> None:
    if action in {"start_review", "request_changes", "approve", "reject"}:
        required = "content.review"
    elif action in {"schedule", "publish", "unpublish"}:
        required = "content.publish"
    elif action == "archive":
        required = "content.manage"
    else:
        raise HTTPException(status_code=400, detail="Unsupported club media workflow action")
    if required not in permissions and "content.manage" not in permissions:
        raise HTTPException(status_code=403, detail="Insufficient privileges")


async def _get_content_or_404(db: DbSession, content_type: str, content_id: uuid.UUID):
    model = CONTENT_MODELS.get(content_type)
    if model is None:
        raise HTTPException(status_code=404, detail="Unsupported content type")
    item = await model.get_by_id(db, content_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Content not found")
    return item


@router.post("/{content_type}/{content_id}/{action}")
async def run_content_workflow_action(
    content_type: str,
    content_id: uuid.UUID,
    action: str,
    data: ContentWorkflowActionRequest,
    db: DbSession,
    user: CurrentUser,
):
    if content_type in CUSTOM_WORKFLOW_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Use the content-specific workflow endpoint")
    content = await _get_content_or_404(db, content_type, content_id)
    permissions = permissions_for_user(user)
    if content_type == "club-events":
        await authorize_club_event_workflow_action(db, user, content, action, permissions)
    elif content_type == "club-media":
        authorize_club_media_workflow_action(action, permissions)
    else:
        authorize_content_workflow_action(user, content, action, permissions)
    try:
        content = await ContentWorkflowService.transition(
            db, content, content_type, action, user.id,
            comments=data.comments, changed_fields=data.changed_fields, scheduled_for=data.scheduled_for,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if content_type == "club-media":
        media = getattr(content, "media", None)
        if media is not None:
            if action == "publish":
                media.is_public = True
            elif action in {"unpublish", "archive", "reject", "request_changes"}:
                content.is_public = False
                content.is_published = False
                media.is_public = False
    if getattr(content, "owner_portal", None) == "schools":
        from ...services.domain_events import enqueue_domain_event

        enqueue_domain_event(
            db,
            event_type="school.content.workflow_changed",
            scope_type="school",
            scope_id=getattr(content, "owner_scope_id", None),
            actor_id=user.id,
            resource_type=content_type,
            resource_id=content.id,
            data={"action": action, "workflow_status": content.workflow_status},
        )
    await db.flush()
    await db.refresh(content)
    return success(data=content, message="Content workflow updated")


@router.get("/{content_type}/{content_id}/logs")
async def list_content_workflow_logs(
    content_type: str,
    content_id: uuid.UUID,
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
):
    content = await _get_content_or_404(db, content_type, content_id)
    permissions = permissions_for_user(user)
    try:
        authorize_content_workflow_queue_access(permissions)
    except HTTPException:
        authorize_content_workflow_action(user, content, "edit", permissions)
    result = await db.execute(
        select(ContentWorkflowLog)
        .where(ContentWorkflowLog.content_type == content_type, ContentWorkflowLog.content_id == content_id)
        .order_by(ContentWorkflowLog.created_at.desc())
        .offset((page - 1) * per_page).limit(per_page)
    )
    return success(data=result.scalars().all())
