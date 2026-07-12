"""Club endpoints with club-scoped authoring and CoCMS publication workflow."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from .content_workflow import authorize_content_workflow_action
from ...deps import CurrentUser, DbSession, permissions_for_user, require_scope
from ...models import Club, ClubActivity
from ...schemas import (
    AnnouncementCreate,
    AnnouncementUpdate,
    BlogCreate,
    BlogUpdate,
    ClubActivityCreate,
    ClubActivityUpdate,
    ClubCreate,
    ClubMediaCreate,
    ClubMediaPublicationUpdate,
    ClubMediaUpdate,
    ClubUpdate,
)
from ...schemas.content_workflow import ContentWorkflowActionRequest
from ...security.scopes import can_access_scope
from ...services import AnnouncementService, BlogService, ClubService, ContentWorkflowService, MediaService

router = APIRouter()

CLUB_VIEW_PERMISSIONS = ["clubs.view", "clubs.manage_own"]
CLUB_MANAGE_PERMISSIONS = ["clubs.manage_own"]
CLUB_EVENT_PERMISSIONS = ["clubs.events_manage", "clubs.manage_own"]
CLUB_STORY_PERMISSIONS = ["clubs.stories_manage", "clubs.manage_own"]
CLUB_SUBMIT_PERMISSIONS = ["clubs.content_submit", "clubs.manage_own"]
CLUB_PROFILE_OWNER_MUTABLE_FIELDS = {
    "name",
    "slug",
    "club_type",
    "about",
    "mission",
    "objectives",
    "email",
    "phone",
    "social_media",
    "membership_fee",
    "meeting_schedule",
    "logo_id",
    "cover_image_id",
}


async def require_club_scope(
    db: DbSession,
    user: CurrentUser,
    club_id: uuid.UUID,
    permissions: list[str],
    *,
    resource_name: str,
) -> None:
    """Require a permission grant attached to this specific club, or a global admin grant."""
    for permission in permissions:
        if await can_access_scope(db, user, permission, "club", club_id):
            return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=f"Insufficient privileges for this {resource_name} club",
    )


def club_activity_create_payload(data: ClubActivityCreate, *, club_id: uuid.UUID, user_id: uuid.UUID) -> dict:
    """Prevent an official from bypassing CoCMS by posting a public event directly."""
    payload = data.model_dump()
    payload.update(
        author_user_id=user_id,
        is_public=False,
        is_published=False,
        status="draft",
        workflow_status="draft",
        owner_portal="student-clubs",
        owner_scope_type="club",
        owner_scope_id=club_id,
    )
    return payload


def _club_content_create_payload(data, *, club_id: uuid.UUID, user_id: uuid.UUID) -> dict:
    payload = data.model_dump()
    payload.update(
        scope_type="club",
        scope_id=club_id,
        owner_portal="student-clubs",
        owner_scope_type="club",
        owner_scope_id=club_id,
        author_user_id=user_id,
        is_public=False,
        is_published=False,
        status="draft",
        workflow_status="draft",
    )
    return payload


def _club_content_update_payload(data) -> dict:
    payload = data.model_dump(exclude_unset=True)
    for field in {
        "scope_type", "scope_id", "is_main", "is_public", "is_published", "published_at",
        "archived_at", "status", "workflow_status", "owner_portal", "owner_scope_type",
        "owner_scope_id", "author_user_id", "scheduled_publish_at", "expires_at",
        "rejection_reason", "revision_notes",
    }:
        payload.pop(field, None)
    return payload


def _club_profile_update_payload(data, user: CurrentUser) -> dict:
    payload = data.model_dump(exclude_unset=True)
    if any(permission in permissions_for_user(user) for permission in {"admin:*", "clubs.admin"}):
        return payload
    return {
        key: value
        for key, value in payload.items()
        if key in CLUB_PROFILE_OWNER_MUTABLE_FIELDS
    }


def _authorize_club_media_workflow_action(action: str, permissions: set[str]) -> None:
    if action in {"start_review", "request_changes", "approve", "reject"}:
        required = "content.review"
    elif action in {"schedule", "publish", "unpublish"}:
        required = "content.publish"
    elif action == "archive":
        required = "content.manage"
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported club media workflow action")
    if required not in permissions and "content.manage" not in permissions:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")


async def _club_or_404(db: DbSession, club_id: uuid.UUID) -> Club:
    club = await ClubService.get_by_id(db, club_id)
    if club is None:
        raise HTTPException(status_code=404, detail="Club not found")
    return club


async def _club_workflow_transition(
    db: DbSession,
    user: CurrentUser,
    *,
    content,
    content_type: str,
    club_id: uuid.UUID,
    action: str,
    data: ContentWorkflowActionRequest,
):
    if action == "submit":
        await require_club_scope(
            db, user, club_id, CLUB_SUBMIT_PERMISSIONS, resource_name="club content",
        )
    else:
        authorize_content_workflow_action(user, content, action, permissions_for_user(user))
    try:
        return await ContentWorkflowService.transition(
            db,
            content,
            content_type,
            action,
            user.id,
            comments=data.comments,
            changed_fields=data.changed_fields,
            scheduled_for=data.scheduled_for,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "q", "club_type", "school_id", "department_id", "is_active", "fields", "include"))
async def list_clubs(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    q: str | None = None,
    club_type: str | None = None,
    school_id: uuid.UUID | None = None,
    department_id: uuid.UUID | None = None,
    is_active: bool | None = True,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Club, fields)
    result = await ClubService.list(
        db, page=page, per_page=per_page, q=q, club_type=club_type,
        school_id=school_id, department_id=department_id, is_active=is_active,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/managed")
async def list_managed_clubs(
    db: DbSession,
    user: CurrentUser,
    club_id: uuid.UUID | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Club, fields)
    result = await ClubService.list(
        db, page=page, per_page=per_page, is_public=None, load_options=selector.load_options,
    )
    clubs = [club for club in result.items if club_id is None or club.id == club_id]
    authorized = []
    for club in clubs:
        try:
            await require_club_scope(db, user, club.id, CLUB_VIEW_PERMISSIONS, resource_name="club")
            authorized.append(club)
        except HTTPException:
            continue
    meta = dict(result.meta)
    meta["total"] = len(authorized)
    return success(data=selector.apply(authorized), meta=meta)


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_club(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Club, fields)
    item = await ClubService.get_by_slug(db, slug, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Club not found")
    return success(data=selector.apply(item))


@router.get("/{slug}/activities")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_club_activities(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    item = await ClubService.get_by_slug(db, slug)
    if item is None:
        raise HTTPException(status_code=404, detail="Club not found")
    selector = build_selector(ClubActivity, fields)
    items = await ClubService.list_activities(db, item.id)
    return success(data=selector.apply(items))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("admin:*"))])
async def create_club(data: ClubCreate, db: DbSession, _: CurrentUser):
    item = await ClubService.create(db, **data.model_dump())
    return success(data=item, message="Club created")


@router.patch("/{club_id}")
async def update_club(club_id: uuid.UUID, data: ClubUpdate, db: DbSession, user: CurrentUser):
    item = await _club_or_404(db, club_id)
    await require_club_scope(db, user, item.id, CLUB_MANAGE_PERMISSIONS, resource_name="club")
    item = await ClubService.update(db, item, **_club_profile_update_payload(data, user))
    return success(data=item, message="Club updated")


@router.get("/id/{club_id}/activities")
async def list_managed_club_activities(club_id: uuid.UUID, db: DbSession, user: CurrentUser):
    await _club_or_404(db, club_id)
    await require_club_scope(db, user, club_id, CLUB_VIEW_PERMISSIONS, resource_name="club event")
    return success(data=await ClubService.list_activities(db, club_id, public_only=False))


@router.post("/id/{club_id}/activities", status_code=status.HTTP_201_CREATED)
async def create_club_activity(club_id: uuid.UUID, data: ClubActivityCreate, db: DbSession, user: CurrentUser):
    await _club_or_404(db, club_id)
    await require_club_scope(db, user, club_id, CLUB_EVENT_PERMISSIONS, resource_name="club event")
    item = await ClubService.add_activity(
        db, club_id, **club_activity_create_payload(data, club_id=club_id, user_id=user.id),
    )
    return success(data=item, message="Club event created as draft")


@router.patch("/activities/{activity_id}")
async def update_club_activity(activity_id: uuid.UUID, data: ClubActivityUpdate, db: DbSession, user: CurrentUser):
    item = await ClubService.get_activity(db, activity_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Club event not found")
    await require_club_scope(db, user, item.club_id, CLUB_EVENT_PERMISSIONS, resource_name="club event")
    payload = data.model_dump(exclude_unset=True)
    current_status = item.workflow_status or item.status
    if current_status in {"submitted", "in_review", "approved", "scheduled"}:
        authorize_content_workflow_action(user, item, "edit", permissions_for_user(user))
    await ContentWorkflowService.reset_after_authoring_edit(
        db, item, "club-events", user.id, changed_fields=payload,
    )
    item = await ClubService.update_activity(db, item, **payload)
    return success(data=item, message="Club event updated")


@router.post("/activities/{activity_id}/workflow/{action}")
async def transition_club_activity(
    activity_id: uuid.UUID,
    action: str,
    data: ContentWorkflowActionRequest,
    db: DbSession,
    user: CurrentUser,
):
    item = await ClubService.get_activity(db, activity_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Club event not found")
    item = await _club_workflow_transition(
        db, user, content=item, content_type="club-events", club_id=item.club_id, action=action, data=data,
    )
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Club event workflow updated")


@router.delete("/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_club_activity(activity_id: uuid.UUID, db: DbSession, user: CurrentUser):
    item = await ClubService.get_activity(db, activity_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Club event not found")
    await require_club_scope(db, user, item.club_id, CLUB_EVENT_PERMISSIONS, resource_name="club event")
    await ClubService.delete_activity(db, item)


@router.get("/id/{club_id}/stories")
async def list_club_stories(club_id: uuid.UUID, db: DbSession, user: CurrentUser):
    await _club_or_404(db, club_id)
    await require_club_scope(db, user, club_id, CLUB_VIEW_PERMISSIONS, resource_name="club story")
    result = await BlogService.list_admin(db, scope_type="club", scope_id=club_id, page=1, per_page=100)
    return success(data=result.items, meta=result.meta)


@router.post("/id/{club_id}/stories", status_code=status.HTTP_201_CREATED)
async def create_club_story(club_id: uuid.UUID, data: BlogCreate, db: DbSession, user: CurrentUser):
    await _club_or_404(db, club_id)
    await require_club_scope(db, user, club_id, CLUB_STORY_PERMISSIONS, resource_name="club story")
    item = await BlogService.create(db, **_club_content_create_payload(data, club_id=club_id, user_id=user.id))
    return success(data=item, message="Club story created as draft")


@router.patch("/stories/{story_id}")
async def update_club_story(story_id: uuid.UUID, data: BlogUpdate, db: DbSession, user: CurrentUser):
    item = await BlogService.get_by_id(db, story_id)
    if item is None or item.scope_type != "club" or item.scope_id is None:
        raise HTTPException(status_code=404, detail="Club story not found")
    await require_club_scope(db, user, item.scope_id, CLUB_STORY_PERMISSIONS, resource_name="club story")
    payload = _club_content_update_payload(data)
    current_status = item.workflow_status or item.status
    if current_status in {"submitted", "in_review", "approved", "scheduled"}:
        authorize_content_workflow_action(user, item, "edit", permissions_for_user(user))
    await ContentWorkflowService.reset_after_authoring_edit(
        db, item, "blogs", user.id, changed_fields=payload,
    )
    item = await BlogService.update(db, item, **payload)
    return success(data=item, message="Club story updated")


@router.post("/stories/{story_id}/workflow/{action}")
async def transition_club_story(
    story_id: uuid.UUID,
    action: str,
    data: ContentWorkflowActionRequest,
    db: DbSession,
    user: CurrentUser,
):
    item = await BlogService.get_by_id(db, story_id)
    if item is None or item.scope_type != "club" or item.scope_id is None:
        raise HTTPException(status_code=404, detail="Club story not found")
    item = await _club_workflow_transition(
        db, user, content=item, content_type="blogs", club_id=item.scope_id, action=action, data=data,
    )
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Club story workflow updated")


@router.delete("/stories/{story_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_club_story(story_id: uuid.UUID, db: DbSession, user: CurrentUser):
    item = await BlogService.get_by_id(db, story_id)
    if item is None or item.scope_type != "club" or item.scope_id is None:
        raise HTTPException(status_code=404, detail="Club story not found")
    await require_club_scope(db, user, item.scope_id, CLUB_STORY_PERMISSIONS, resource_name="club story")
    await BlogService.delete(db, item)


@router.get("/id/{club_id}/announcements")
async def list_club_announcements(club_id: uuid.UUID, db: DbSession, user: CurrentUser):
    await _club_or_404(db, club_id)
    await require_club_scope(db, user, club_id, CLUB_VIEW_PERMISSIONS, resource_name="club announcement")
    result = await AnnouncementService.list_admin(db, scope_type="club", scope_id=club_id, page=1, per_page=100)
    return success(data=result.items, meta=result.meta)


@router.post("/id/{club_id}/announcements", status_code=status.HTTP_201_CREATED)
async def create_club_announcement(club_id: uuid.UUID, data: AnnouncementCreate, db: DbSession, user: CurrentUser):
    await _club_or_404(db, club_id)
    await require_club_scope(db, user, club_id, CLUB_STORY_PERMISSIONS, resource_name="club announcement")
    item = await AnnouncementService.create(db, **_club_content_create_payload(data, club_id=club_id, user_id=user.id))
    return success(data=item, message="Club announcement created as draft")


@router.patch("/announcements/{announcement_id}")
async def update_club_announcement(announcement_id: uuid.UUID, data: AnnouncementUpdate, db: DbSession, user: CurrentUser):
    item = await AnnouncementService.get_by_id(db, announcement_id)
    if item is None or item.scope_type != "club" or item.scope_id is None:
        raise HTTPException(status_code=404, detail="Club announcement not found")
    await require_club_scope(db, user, item.scope_id, CLUB_STORY_PERMISSIONS, resource_name="club announcement")
    payload = _club_content_update_payload(data)
    current_status = item.workflow_status or item.status
    if current_status in {"submitted", "in_review", "approved", "scheduled"}:
        authorize_content_workflow_action(user, item, "edit", permissions_for_user(user))
    await ContentWorkflowService.reset_after_authoring_edit(
        db, item, "announcements", user.id, changed_fields=payload,
    )
    item = await AnnouncementService.update(db, item, **payload)
    return success(data=item, message="Club announcement updated")


@router.post("/announcements/{announcement_id}/workflow/{action}")
async def transition_club_announcement(
    announcement_id: uuid.UUID,
    action: str,
    data: ContentWorkflowActionRequest,
    db: DbSession,
    user: CurrentUser,
):
    item = await AnnouncementService.get_by_id(db, announcement_id)
    if item is None or item.scope_type != "club" or item.scope_id is None:
        raise HTTPException(status_code=404, detail="Club announcement not found")
    item = await _club_workflow_transition(
        db, user, content=item, content_type="announcements", club_id=item.scope_id, action=action, data=data,
    )
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Club announcement workflow updated")


@router.delete("/announcements/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_club_announcement(announcement_id: uuid.UUID, db: DbSession, user: CurrentUser):
    item = await AnnouncementService.get_by_id(db, announcement_id)
    if item is None or item.scope_type != "club" or item.scope_id is None:
        raise HTTPException(status_code=404, detail="Club announcement not found")
    await require_club_scope(db, user, item.scope_id, CLUB_STORY_PERMISSIONS, resource_name="club announcement")
    await AnnouncementService.delete(db, item)


@router.get("/id/{club_id}/leaders")
async def list_club_leaders(club_id: uuid.UUID, db: DbSession, user: CurrentUser):
    await _club_or_404(db, club_id)
    await require_club_scope(db, user, club_id, CLUB_VIEW_PERMISSIONS, resource_name="club leader")
    leaders = await ClubService.list_leaders(db, club_id)
    return success(data=[
        {
            "id": leader.id,
            "person_id": leader.person_id,
            "name": leader.person.full_name if leader.person else None,
            "role": leader.role,
            "title": leader.title,
            "hierarchy_level": leader.hierarchy_level,
        }
        for leader in leaders
    ])


@router.get("/id/{club_id}/media")
async def list_club_media(club_id: uuid.UUID, db: DbSession, user: CurrentUser):
    await _club_or_404(db, club_id)
    await require_club_scope(db, user, club_id, CLUB_VIEW_PERMISSIONS, resource_name="club media")
    links = await MediaService.list_links(db, user=user, entity_type="club", entity_id=club_id)
    return success(data=[MediaService.serialize_link(link) for link in links])


@router.post("/id/{club_id}/media", status_code=status.HTTP_201_CREATED)
async def attach_club_media(club_id: uuid.UUID, data: ClubMediaCreate, db: DbSession, user: CurrentUser):
    await _club_or_404(db, club_id)
    await require_club_scope(db, user, club_id, CLUB_MANAGE_PERMISSIONS, resource_name="club media")
    media = await MediaService.get_authorized_by_id(db, data.media_id, user)
    if media is None:
        raise HTTPException(status_code=404, detail="Media not found")
    metadata = dict(
        is_public=False,
        status="draft",
        workflow_status="draft",
        owner_portal="student-clubs",
        owner_scope_type="club",
        owner_scope_id=club_id,
        author_user_id=user.id,
    )
    link = await MediaService.get_link_for_media(
        db,
        media_id=data.media_id,
        entity_type="club",
        entity_id=club_id,
        role=data.role,
    )
    if link is None:
        link = await MediaService.link_media(
            db,
            media_id=data.media_id,
            entity_type="club",
            entity_id=club_id,
            role=data.role,
            display_order=data.display_order,
            **metadata,
        )
    else:
        link = await MediaService.update_link(db, link, display_order=data.display_order, **metadata)
    link.media = media
    return success(data=MediaService.serialize_link(link), message="Club media attached")


@router.patch("/id/{club_id}/media/{link_id}")
async def update_club_media(link_id: uuid.UUID, club_id: uuid.UUID, data: ClubMediaUpdate, db: DbSession, user: CurrentUser):
    await _club_or_404(db, club_id)
    await require_club_scope(db, user, club_id, CLUB_MANAGE_PERMISSIONS, resource_name="club media")
    link = await MediaService.get_link_by_id(db, link_id)
    if link is None or link.entity_type != "club" or link.entity_id != club_id:
        raise HTTPException(status_code=404, detail="Club media not found")
    payload = data.model_dump(exclude_unset=True)
    current_status = link.workflow_status or link.status
    if current_status in {"submitted", "in_review", "approved", "scheduled"}:
        authorize_content_workflow_action(user, link, "edit", permissions_for_user(user))
    await ContentWorkflowService.reset_after_authoring_edit(
        db, link, "club-media", user.id, changed_fields=payload,
    )
    if link.media is not None:
        link.media.is_public = False
    link = await MediaService.update_link(db, link, **payload)
    return success(data=MediaService.serialize_link(link), message="Club media updated")


@router.post("/id/{club_id}/media/{link_id}/workflow/{action}")
async def transition_club_media(
    link_id: uuid.UUID,
    club_id: uuid.UUID,
    action: str,
    data: ContentWorkflowActionRequest,
    db: DbSession,
    user: CurrentUser,
):
    link = await MediaService.get_link_by_id(db, link_id)
    if link is None or link.entity_type != "club" or link.entity_id != club_id:
        raise HTTPException(status_code=404, detail="Club media not found")
    if link.media is None:
        raise HTTPException(status_code=404, detail="Media not found")
    if action == "submit":
        await require_club_scope(db, user, club_id, CLUB_SUBMIT_PERMISSIONS, resource_name="club media")
    else:
        _authorize_club_media_workflow_action(action, permissions_for_user(user))
    try:
        link = await ContentWorkflowService.transition(
            db,
            link,
            "club-media",
            action,
            user.id,
            comments=data.comments,
            changed_fields=data.changed_fields,
            scheduled_for=data.scheduled_for,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if action == "publish":
        link.media.is_public = True
    elif action in {"unpublish", "archive", "reject", "request_changes"}:
        link.is_public = False
        link.is_published = False
        link.media.is_public = False
    await db.flush()
    await db.refresh(link)
    return success(data=MediaService.serialize_link(link), message="Club media workflow updated")


@router.patch("/id/{club_id}/media/{link_id}/publication")
async def set_club_media_publication(
    link_id: uuid.UUID,
    club_id: uuid.UUID,
    data: ClubMediaPublicationUpdate,
    db: DbSession,
    user: CurrentUser,
):
    """Compatibility wrapper that records publication changes through workflow logs."""
    return await transition_club_media(
        link_id=link_id,
        club_id=club_id,
        action="publish" if data.is_public else "unpublish",
        data=ContentWorkflowActionRequest(),
        db=db,
        user=user,
    )


@router.delete("/{club_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("admin:*"))])
async def delete_club(club_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await _club_or_404(db, club_id)
    await ClubService.delete(db, item)
