"""Page CMS endpoints for public composition and admin editing workflows."""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import selectinload

from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, require_scope, user_has_scope
from ...models import Event, News, PageSection, PartnershipSpotlight, Person, SectionItem
from ...schemas import (
    PageSectionCreate,
    PageSectionRead,
    PageSectionUpdate,
    PartnershipSpotlightCreate,
    PartnershipSpotlightUpdate,
    SectionItemBatchSave,
    SectionItemCreate,
    SectionItemRead,
    SectionItemUpdate,
)
from ...services import (
    ContentWorkflowService,
    HomepageCompositionService,
    PageSectionService,
    PageSectionWorkflowService,
    PartnershipSpotlightService,
    PartnershipSpotlightWorkflowService,
)
from ...services._base import apply_updates
from ._scoped import can_access_scoped_record, require_scoped_record

router = APIRouter()

PAGE_SECTION_FALLBACK_MANAGE = "page_sections.manage"
PARTNERSHIP_SPOTLIGHT_MANAGE_SCOPE = require_scope("partnership_spotlights.manage")
PAGE_SECTION_ADMIN_LIST_PERMISSIONS = (
    "page_sections.view",
    "page_sections.create",
    "page_sections.update",
    "page_sections.delete",
    "page_sections.review",
    "page_sections.publish",
    PAGE_SECTION_FALLBACK_MANAGE,
    "section_items.manage",
    "homepage.view",
    "homepage.manage",
    "homepage.publish",
    "school_homepage.manage",
    "research_homepage.manage",
    "library_homepage.manage",
)


def _person_payload(person: Person | None) -> dict[str, Any] | None:
    if person is None:
        return None
    return {
        "id": str(person.id),
        "title": person.title,
        "full_name": person.full_name,
        "display_name": person.display_name,
        "email": person.email,
        "institutional_role": person.institutional_role,
        "photo_id": str(person.photo_id) if person.photo_id else None,
        "photo_url": person.photo_url,
    }


def _content_payload(record: News | Event | None, content_type: str | None) -> dict[str, Any] | None:
    if record is None or content_type is None:
        return None
    return {
        "id": str(record.id),
        "type": content_type,
        "title": record.title,
        "slug": record.slug,
        "summary": getattr(record, "summary", None),
        "status": getattr(record, "status", None),
        "is_published": getattr(record, "is_published", None),
        "published_at": getattr(record, "published_at", None),
        "start_date": getattr(record, "start_date", None),
        "href": f"/{'news' if content_type == 'news' else 'events'}/{record.slug}",
    }


async def _leadership_settings_enrichment(db: DbSession, settings: dict[str, Any] | None) -> dict[str, Any] | None:
    if not settings:
        return None

    staff_profile_id = settings.get("staff_profile_id") or settings.get("leader_profile_id")
    if not staff_profile_id:
        return None
    person = await db.get(
        Person,
        uuid.UUID(str(staff_profile_id)),
        options=[selectinload(Person.photo)],
    )
    return {"staff_profile": _person_payload(person)}


async def _leadership_content_enrichment(db: DbSession, content: dict[str, Any] | None) -> dict[str, Any] | None:
    if not content:
        return None

    enriched: dict[str, Any] = {}
    linked_type = content.get("linked_content_type")
    linked_id = content.get("linked_content_id")
    if linked_type and linked_id:
        model = News if linked_type == "news" else Event if linked_type == "event" else None
        linked = await db.get(model, uuid.UUID(str(linked_id))) if model is not None else None
        enriched["linked_content"] = _content_payload(linked, str(linked_type))

    return enriched or None


async def _validate_leadership_settings_references(db: DbSession, settings: dict[str, Any] | None) -> None:
    if not settings:
        return
    staff_profile_id = settings.get("staff_profile_id") or settings.get("leader_profile_id")
    if staff_profile_id and await db.get(Person, uuid.UUID(str(staff_profile_id))) is None:
        raise HTTPException(status_code=422, detail="Selected staff profile was not found")


async def _validate_leadership_content_references(
    db: DbSession,
    content: dict[str, Any] | None,
    *,
    disallow_item_profile: bool = False,
) -> None:
    if not content:
        return
    if disallow_item_profile and content.get("staff_profile_id"):
        raise HTTPException(status_code=422, detail="Leadership profile belongs to the section, not individual activity items")

    linked_type = content.get("linked_content_type")
    linked_id = content.get("linked_content_id")
    if not linked_type and not linked_id:
        return
    model = News if linked_type == "news" else Event if linked_type == "event" else None
    if model is None:
        raise HTTPException(status_code=422, detail="Linked content type must be news or event")
    if not linked_id or await db.get(model, uuid.UUID(str(linked_id))) is None:
        raise HTTPException(status_code=422, detail="Selected linked news/event record was not found")


async def _validate_section_items_references(
    db: DbSession,
    items: list[dict[str, Any]],
    *,
    layout_variant: str | None = None,
) -> None:
    for item in items:
        await _validate_leadership_content_references(
            db,
            item.get("content"),
            disallow_item_profile=layout_variant == "leadership_activity",
        )


async def _serialize_admin_page_section(db: DbSession, section: PageSection) -> dict[str, Any]:
    payload = PageSectionRead.model_validate(section).model_dump(mode="json")
    payload["settings_enriched"] = await _leadership_settings_enrichment(db, section.settings)
    enriched_items: list[dict[str, Any]] = []
    for item_payload, item in zip(payload.get("items", []), section.items, strict=False):
        item_payload["content_enriched"] = await _leadership_content_enrichment(db, item.content)
        enriched_items.append(item_payload)
    payload["items"] = enriched_items
    return payload


async def _serialize_admin_section_item(db: DbSession, item: SectionItem) -> dict[str, Any]:
    payload = SectionItemRead.model_validate(item).model_dump(mode="json")
    payload["content_enriched"] = await _leadership_content_enrichment(db, item.content)
    return payload


def _require_page_authoring_edit(user: CurrentUser, record) -> None:
    workflow_status = getattr(record, "workflow_status", None) or record.status
    if workflow_status not in {"in_review", "approved"}:
        return
    if any(
        user_has_scope(user, permission)
        for permission in ("content.edit_submitted", "page_sections.review", "admin:*")
    ):
        return
    raise HTTPException(status_code=403, detail="Submitted content requires review edit privileges")


def _require_partnership_spotlight_workflow_action(user: CurrentUser, action: str) -> None:
    if action == "submit":
        allowed = ("partnership_spotlights.manage", "content.manage", "admin:*")
    elif action in {"approve", "request_changes"}:
        allowed = ("content.review", "content.manage", "admin:*")
    elif action in {"publish", "unpublish"}:
        allowed = ("content.publish", "content.manage", "admin:*")
    elif action == "archive":
        allowed = ("content.manage", "admin:*")
    else:
        allowed = ("partnership_spotlights.manage", "content.manage", "admin:*")
    if any(user_has_scope(user, permission) for permission in allowed):
        return
    raise HTTPException(status_code=403, detail="Insufficient privileges")


PAGE_SECTION_ADMIN_BROAD_ROW_ACTIONS = (
    "view",
    "create",
    "update",
    "delete",
    "item_manage",
)
PAGE_SECTION_ADMIN_WORKFLOW_ROW_ACTIONS = {
    "in_review": ("review",),
    "approved": ("publish",),
    "published": ("publish",),
}


def _page_specific_permissions(*, page_key: str, scope_type: str, action: str, section_key: str | None = None) -> list[str]:
    if page_key != "homepage":
        return []

    if section_key == "campus-life":
        life_permissions = {
            "view": "life_around_studies.view",
            "create": "life_around_studies.manage",
            "update": "life_around_studies.manage",
            "delete": "life_around_studies.manage",
            "item_manage": "life_around_studies.manage",
            "review": "life_around_studies.review",
            "publish": "life_around_studies.publish",
        }
        dedicated = life_permissions.get(action)
        if dedicated:
            permissions = [dedicated]
        else:
            permissions = []
    elif action == "view":
        permissions = ["homepage.view"]
    elif action in {"create", "update", "delete", "item_manage"}:
        permissions = ["homepage.manage"]
    elif action == "publish":
        permissions = ["homepage.publish"]
    else:
        permissions = []

    if action in {"create", "update", "delete", "item_manage"}:
        if scope_type == "school":
            permissions.append("school_homepage.manage")
        elif scope_type == "research":
            permissions.append("research_homepage.manage")
        elif scope_type == "library":
            permissions.append("library_homepage.manage")

    return permissions


def _page_section_permissions(*, page_key: str, scope_type: str, action: str, section_key: str | None = None) -> list[str]:
    permissions_by_action = {
        "view": ["page_sections.view", PAGE_SECTION_FALLBACK_MANAGE],
        "create": ["page_sections.create", PAGE_SECTION_FALLBACK_MANAGE],
        "update": ["page_sections.update", PAGE_SECTION_FALLBACK_MANAGE],
        "delete": ["page_sections.delete", PAGE_SECTION_FALLBACK_MANAGE],
        "review": ["page_sections.review", PAGE_SECTION_FALLBACK_MANAGE],
        "publish": ["page_sections.publish", PAGE_SECTION_FALLBACK_MANAGE],
        "item_manage": ["section_items.manage", PAGE_SECTION_FALLBACK_MANAGE],
    }
    permissions = list(permissions_by_action.get(action, [PAGE_SECTION_FALLBACK_MANAGE]))
    permissions.extend(_page_specific_permissions(page_key=page_key, scope_type=scope_type, action=action, section_key=section_key))
    return permissions


def _authorize_page_section_admin_list_access(user: CurrentUser) -> None:
    if any(user_has_scope(user, permission) for permission in PAGE_SECTION_ADMIN_LIST_PERMISSIONS):
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Insufficient privileges",
    )


async def _require_page_section_access(
    db: DbSession,
    user: CurrentUser,
    *,
    page_key: str,
    scope_type: str,
    scope_id: uuid.UUID | None,
    action: str,
    section_key: str | None = None,
) -> None:
    await require_scoped_record(
        db,
        user,
        _page_section_permissions(page_key=page_key, scope_type=scope_type, action=action, section_key=section_key),
        scope_type,
        scope_id,
        resource_name="page section",
    )


SECTION_ITEM_STATUS_PUBLISH_EXTRA_SCOPES = ("life_around_studies.publish", "homepage.manage")
SECTION_ITEM_STATUS_REVIEW_EXTRA_SCOPES = ("life_around_studies.review",)


async def _require_section_item_status_change(
    db: DbSession,
    user: CurrentUser,
    section: PageSection,
    requested_status: str | None,
    current_status: str | None = None,
) -> None:
    """Gate per-item workflow status changes against the caller's scopes.

    Publishing/archiving an item requires publish authority for the section's
    page scope (plus life_around_studies.publish for the campus-life feature);
    sending an item to review requires item-manage or review authority.
    Setting draft needs no authority beyond item_manage (already enforced).
    """
    if requested_status is None or requested_status == current_status:
        return
    if requested_status in {"published", "archived"}:
        permissions = _page_section_permissions(
            page_key=section.page_key,
            scope_type=section.scope_type,
            action="publish",
            section_key=section.section_key,
        )
        permissions.extend(SECTION_ITEM_STATUS_PUBLISH_EXTRA_SCOPES)
    elif requested_status == "in_review":
        permissions = _page_section_permissions(
            page_key=section.page_key,
            scope_type=section.scope_type,
            action="item_manage",
            section_key=section.section_key,
        )
        permissions.extend(SECTION_ITEM_STATUS_REVIEW_EXTRA_SCOPES)
    else:
        return
    await require_scoped_record(
        db,
        user,
        list(dict.fromkeys(permissions)),
        section.scope_type,
        section.scope_id,
        resource_name="section item status",
    )


async def _can_access_page_section_admin_row(db: DbSession, user: CurrentUser, section: PageSection) -> bool:
    for action in PAGE_SECTION_ADMIN_BROAD_ROW_ACTIONS:
        if await can_access_scoped_record(
            db,
            user,
            _page_section_permissions(
                page_key=section.page_key,
                scope_type=section.scope_type,
                action=action,
                section_key=section.section_key,
            ),
            section.scope_type,
            section.scope_id,
        ):
            return True

    for action in PAGE_SECTION_ADMIN_WORKFLOW_ROW_ACTIONS.get(section.status, ()):
        if await can_access_scoped_record(
            db,
            user,
            _page_section_permissions(
                page_key=section.page_key,
                scope_type=section.scope_type,
                action=action,
                section_key=section.section_key,
            ),
            section.scope_type,
            section.scope_id,
        ):
            return True
    return False


async def _get_page_section_or_404(db: DbSession, section_id: uuid.UUID) -> PageSection:
    item = await PageSection.get_by_id(db, section_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Page section not found")
    return item


async def _get_section_item_or_404(db: DbSession, item_id: uuid.UUID) -> SectionItem:
    item = await SectionItem.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Section item not found")
    return item


async def _get_partnership_spotlight_or_404(db: DbSession, spotlight_id: uuid.UUID) -> PartnershipSpotlight:
    item = await PartnershipSpotlight.get_by_id(db, spotlight_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Partnership spotlight not found")
    return item


def _workflow_action_scope(action: str) -> str:
    if action in {"approve", "request_changes"}:
        return "review"
    if action in {"publish", "unpublish"}:
        return "publish"
    if action == "archive":
        return "delete"
    return "update"


@router.get("/pages/{page_key}")
async def get_page_composition(
    page_key: str,
    db: DbSession,
    scope_type: str = Query("university"),
    scope_id: uuid.UUID | None = None,
):
    composition = await HomepageCompositionService.compose(db, page_key, scope_type, scope_id)
    return success(data=composition)


@router.get("/homepage")
async def get_homepage(
    db: DbSession,
    scope_type: str = Query("university"),
    scope_id: uuid.UUID | None = None,
):
    composition = await HomepageCompositionService.compose(db, "homepage", scope_type, scope_id)
    return success(data=composition)


@router.get("/page-sections/admin")
async def list_admin_page_sections(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    page_key: str | None = None,
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    search: str | None = None,
):
    _authorize_page_section_admin_list_access(user)
    result = await PageSectionService.list_admin_authorized(
        db,
        is_visible=lambda item: _can_access_page_section_admin_row(db, user, item),
        page=page,
        per_page=per_page,
        page_key=page_key,
        scope_type=scope_type,
        scope_id=scope_id,
        status=status_filter,
        search=search,
    )
    return success(data=[await _serialize_admin_page_section(db, item) for item in result.items], meta=result.meta)


@router.get("/page-sections/{section_id}")
async def get_admin_page_section(
    section_id: uuid.UUID,
    db: DbSession,
    user: CurrentUser,
):
    item = await _get_page_section_or_404(db, section_id)
    if not await _can_access_page_section_admin_row(db, user, item):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges for this page section scope",
        )
    return success(data=await _serialize_admin_page_section(db, item))


@router.post("/page-sections", status_code=status.HTTP_201_CREATED)
async def create_page_section(data: PageSectionCreate, db: DbSession, user: CurrentUser):
    payload = data.model_dump()
    await _require_page_section_access(
        db,
        user,
        page_key=payload["page_key"],
        scope_type=payload["scope_type"],
        scope_id=payload.get("scope_id"),
        action="create",
        section_key=payload.get("section_key"),
    )
    items = payload.pop("items", [])
    if payload.get("layout_variant") == "leadership_activity":
        await _validate_leadership_settings_references(db, payload.get("settings"))
    await _validate_section_items_references(db, items, layout_variant=payload.get("layout_variant"))
    item = PageSection(
        **payload,
        status="draft",
        workflow_status="draft",
        owner_portal={
            "university": "cocms",
            "school": "schools",
            "research": "research",
            "library": "library",
        }[data.scope_type],
        owner_scope_type=data.scope_type if data.scope_id is not None else None,
        owner_scope_id=data.scope_id,
        created_by_id=user.id,
        updated_by_id=user.id,
    )
    item.items = [SectionItem(**section_item) for section_item in items]
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return success(data=await _serialize_admin_page_section(db, item), message="Page section created")


@router.patch("/page-sections/{section_id}")
async def update_page_section(
    section_id: uuid.UUID,
    data: PageSectionUpdate,
    db: DbSession,
    user: CurrentUser,
):
    item = await _get_page_section_or_404(db, section_id)
    await _require_page_section_access(
        db,
        user,
        page_key=item.page_key,
        scope_type=item.scope_type,
        scope_id=item.scope_id,
        action="update",
        section_key=item.section_key,
    )
    payload = data.model_dump(exclude_unset=True)
    payload.pop("items", None)
    next_layout = payload.get("layout_variant", item.layout_variant)
    if next_layout == "leadership_activity":
        await _validate_leadership_settings_references(db, payload.get("settings", item.settings))
    await _require_page_section_access(
        db,
        user,
        page_key=payload.get("page_key", item.page_key),
        scope_type=payload.get("scope_type", item.scope_type),
        scope_id=payload.get("scope_id", item.scope_id),
        action="update",
        section_key=payload.get("section_key", item.section_key),
    )
    payload["updated_by_id"] = user.id
    _require_page_authoring_edit(user, item)
    await ContentWorkflowService.reset_after_authoring_edit(
        db, item, "page-sections", user.id, changed_fields=payload,
    )
    apply_updates(item, **payload)
    await db.flush()
    await db.refresh(item)
    return success(data=await _serialize_admin_page_section(db, item), message="Page section updated")


@router.post("/page-sections/{section_id}/items", status_code=status.HTTP_201_CREATED)
async def create_section_item(
    section_id: uuid.UUID,
    data: SectionItemCreate,
    db: DbSession,
    user: CurrentUser,
):
    section = await _get_page_section_or_404(db, section_id)
    await _require_page_section_access(
        db,
        user,
        page_key=section.page_key,
        scope_type=section.scope_type,
        scope_id=section.scope_id,
        action="item_manage",
        section_key=section.section_key,
    )
    _require_page_authoring_edit(user, section)
    await _require_section_item_status_change(db, user, section, data.status)
    await ContentWorkflowService.reset_after_authoring_edit(
        db,
        section,
        "page-sections",
        user.id,
        changed_fields={"section_item_create": data.model_dump(exclude={"page_section_id"})},
    )
    payload = data.model_dump(exclude={"page_section_id"})
    if payload.get("status") is None:
        payload.pop("status", None)
    item = SectionItem(page_section_id=section.id, **payload)
    await _validate_leadership_content_references(
        db,
        item.content,
        disallow_item_profile=section.layout_variant == "leadership_activity",
    )
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return success(data=await _serialize_admin_section_item(db, item), message="Section item created")


@router.put("/page-sections/{section_id}/items/batch")
async def batch_save_section_items(
    section_id: uuid.UUID,
    data: SectionItemBatchSave,
    db: DbSession,
    user: CurrentUser,
):
    """Transactionally upsert and soft-disable section items in one request.

    Items with an ``id`` are updated, items without are created, and every id
    in ``remove_ids`` is soft-disabled (``is_enabled=False``). All changes share
    the request's DB transaction, so any failure rolls back the whole batch.
    """
    section = await _get_page_section_or_404(db, section_id)
    await _require_page_section_access(
        db,
        user,
        page_key=section.page_key,
        scope_type=section.scope_type,
        scope_id=section.scope_id,
        action="item_manage",
        section_key=section.section_key,
    )
    _require_page_authoring_edit(user, section)

    existing = {item.id: item for item in section.items}
    invalid_ids = [str(entry.id) for entry in data.items if entry.id is not None and entry.id not in existing]
    invalid_ids.extend(str(remove_id) for remove_id in data.remove_ids if remove_id not in existing)
    if invalid_ids:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Some item ids do not belong to this section",
                "invalid_ids": invalid_ids,
            },
        )

    for entry in data.items:
        current_status = existing[entry.id].status if entry.id is not None else None
        await _require_section_item_status_change(db, user, section, entry.status, current_status)

    await ContentWorkflowService.reset_after_authoring_edit(
        db,
        section,
        "page-sections",
        user.id,
        changed_fields={
            "section_items_batch": {
                "upserted": len(data.items),
                "removed": [str(remove_id) for remove_id in data.remove_ids],
            }
        },
    )

    disallow_item_profile = section.layout_variant == "leadership_activity"
    for entry in data.items:
        if entry.id is not None:
            payload = entry.model_dump(exclude_unset=True, exclude={"id", "page_section_id"})
            if payload.get("status") is None:
                payload.pop("status", None)
            await _validate_leadership_content_references(
                db, payload.get("content"), disallow_item_profile=disallow_item_profile,
            )
            apply_updates(existing[entry.id], **payload)
        else:
            payload = entry.model_dump(exclude={"id", "page_section_id"})
            if payload.get("status") is None:
                payload.pop("status", None)
            await _validate_leadership_content_references(
                db, payload.get("content"), disallow_item_profile=disallow_item_profile,
            )
            section.items.append(SectionItem(page_section_id=section.id, **payload))

    for remove_id in data.remove_ids:
        existing[remove_id].is_enabled = False

    await db.flush()
    for item in section.items:
        await db.refresh(item)

    refreshed = sorted(
        section.items,
        key=lambda item: (item.display_order if item.display_order is not None else 100, str(item.id)),
    )
    return success(
        data=[await _serialize_admin_section_item(db, item) for item in refreshed],
        message="Section items saved",
    )


@router.post("/page-sections/{section_id}/{action}")
async def run_page_section_workflow_action(
    section_id: uuid.UUID,
    action: str,
    db: DbSession,
    user: CurrentUser,
):
    item = await _get_page_section_or_404(db, section_id)
    await _require_page_section_access(
        db,
        user,
        page_key=item.page_key,
        scope_type=item.scope_type,
        scope_id=item.scope_id,
        action=_workflow_action_scope(action),
        section_key=item.section_key,
    )
    item = await PageSectionWorkflowService.transition(item, action, user.id, db=db)
    await db.flush()
    await db.refresh(item)
    return success(data=await _serialize_admin_page_section(db, item), message="Page section updated")


@router.patch("/section-items/{item_id}")
async def update_section_item(
    item_id: uuid.UUID,
    data: SectionItemUpdate,
    db: DbSession,
    user: CurrentUser,
):
    item = await _get_section_item_or_404(db, item_id)
    section = await _get_page_section_or_404(db, item.page_section_id)
    await _require_page_section_access(
        db,
        user,
        page_key=section.page_key,
        scope_type=section.scope_type,
        scope_id=section.scope_id,
        action="item_manage",
        section_key=section.section_key,
    )
    payload = data.model_dump(exclude_unset=True)
    if payload.get("status") is None:
        payload.pop("status", None)
    await _require_section_item_status_change(db, user, section, payload.get("status"), item.status)
    await _validate_leadership_content_references(
        db,
        payload.get("content"),
        disallow_item_profile=section.layout_variant == "leadership_activity",
    )
    _require_page_authoring_edit(user, section)
    next_section_id = payload.pop("page_section_id", item.page_section_id)
    if next_section_id != item.page_section_id:
        next_section = await _get_page_section_or_404(db, next_section_id)
        await _require_page_section_access(
            db,
            user,
            page_key=next_section.page_key,
            scope_type=next_section.scope_type,
            scope_id=next_section.scope_id,
            action="item_manage",
            section_key=next_section.section_key,
        )
        _require_page_authoring_edit(user, next_section)
        await ContentWorkflowService.reset_after_authoring_edit(
            db,
            next_section,
            "page-sections",
            user.id,
            changed_fields={"section_item_move": str(item.id)},
        )
        item.page_section_id = next_section_id
    await ContentWorkflowService.reset_after_authoring_edit(
        db,
        section,
        "page-sections",
        user.id,
        changed_fields={"section_item_update": payload},
    )
    apply_updates(item, **payload)
    await db.flush()
    await db.refresh(item)
    return success(data=await _serialize_admin_section_item(db, item), message="Section item updated")


@router.post(
    "/partnership-spotlights",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(PARTNERSHIP_SPOTLIGHT_MANAGE_SCOPE)],
)
async def create_partnership_spotlight(
    data: PartnershipSpotlightCreate,
    db: DbSession,
    user: CurrentUser,
):
    item = PartnershipSpotlight(
        **data.model_dump(),
        status="draft",
        workflow_status="draft",
        owner_portal="cocms",
    )
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Partnership spotlight created")


@router.patch(
    "/partnership-spotlights/{spotlight_id}",
    dependencies=[Depends(PARTNERSHIP_SPOTLIGHT_MANAGE_SCOPE)],
)
async def update_partnership_spotlight(
    spotlight_id: uuid.UUID,
    data: PartnershipSpotlightUpdate,
    db: DbSession,
    user: CurrentUser,
):
    item = await _get_partnership_spotlight_or_404(db, spotlight_id)
    _require_page_authoring_edit(user, item)
    payload = data.model_dump(exclude_unset=True)
    await ContentWorkflowService.reset_after_authoring_edit(
        db, item, "partnership-spotlights", user.id, changed_fields=payload,
    )
    apply_updates(item, **payload)
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Partnership spotlight updated")


@router.post(
    "/partnership-spotlights/{spotlight_id}/{action}",
)
async def run_partnership_spotlight_workflow_action(
    spotlight_id: uuid.UUID,
    action: str,
    db: DbSession,
    user: CurrentUser,
):
    item = await _get_partnership_spotlight_or_404(db, spotlight_id)
    _require_partnership_spotlight_workflow_action(user, action)
    try:
        item = await PartnershipSpotlightWorkflowService.transition(item, action, user.id, db=db)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Partnership spotlight updated")


@router.get(
    "/partnership-spotlights/admin",
    dependencies=[Depends(PARTNERSHIP_SPOTLIGHT_MANAGE_SCOPE)],
)
async def list_admin_partnership_spotlights(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(default=None, alias="status"),
    search: str | None = None,
):
    result = await PartnershipSpotlightService.list_admin(
        db,
        page=page,
        per_page=per_page,
        status=status_filter,
        search=search,
    )
    return success(data=result.items, meta=result.meta)


@router.get(
    "/partnership-spotlights/{spotlight_id}",
    dependencies=[Depends(PARTNERSHIP_SPOTLIGHT_MANAGE_SCOPE)],
)
async def get_admin_partnership_spotlight(
    spotlight_id: uuid.UUID,
    db: DbSession,
):
    item = await _get_partnership_spotlight_or_404(db, spotlight_id)
    return success(data=item)
