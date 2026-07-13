"""Page CMS endpoints for public composition and admin editing workflows."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, require_scope, user_has_scope
from ...models import PageSection, PartnershipSpotlight, SectionItem
from ...schemas import (
    PageSectionCreate,
    PageSectionUpdate,
    PartnershipSpotlightCreate,
    PartnershipSpotlightUpdate,
    SectionItemCreate,
    SectionItemUpdate,
)
from ...schemas.page_cms import (
    PageSectionReorderRequest,
    SectionItemReorderRequest,
    validate_section_item_state,
)
from ...services import (
    ContentWorkflowService,
    HomepageCompositionService,
    PageSectionService,
    PageSectionWorkflowService,
    PartnershipSpotlightService,
    PartnershipSpotlightWorkflowService,
)
from ...services.page_cms_definitions import SECTION_DEFINITIONS, serialize_section_definitions
from ...services.page_cms_sources import PageCmsSourceProviderError, PageCmsSourceService
from ...services.page_cms import PageCmsReorderConflictError, PageCmsReorderValidationError
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


def _page_specific_permissions(*, page_key: str, scope_type: str, action: str) -> list[str]:
    if page_key != "homepage":
        return []

    if action == "view":
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


def _page_section_permissions(*, page_key: str, scope_type: str, action: str) -> list[str]:
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
    permissions.extend(_page_specific_permissions(page_key=page_key, scope_type=scope_type, action=action))
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
) -> None:
    await require_scoped_record(
        db,
        user,
        _page_section_permissions(page_key=page_key, scope_type=scope_type, action=action),
        scope_type,
        scope_id,
        resource_name="page section",
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


@router.get("/page-section-definitions")
async def list_page_cms_definitions(user: CurrentUser):
    _authorize_page_section_admin_list_access(user)
    return success(data=serialize_section_definitions())


@router.get("/page-section-sources/{source_type}")
async def search_page_cms_sources(
    source_type: str,
    db: DbSession,
    user: CurrentUser,
    q: str = Query("", max_length=120),
    scope_type: str = Query("university", pattern="^(university|school|research|library)$"),
    scope_id: uuid.UUID | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    layout_variant: str = Query(..., min_length=1, max_length=64),
):
    try:
        PageCmsSourceService.validate_source_type(source_type)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(exc)) from exc

    definition = SECTION_DEFINITIONS.get(layout_variant)
    if definition is None or source_type not in definition.allowed_source_types:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Source type {source_type} is not allowed for layout variant {layout_variant}",
        )
    if scope_type not in definition.allowed_scopes:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Layout variant {layout_variant} is not allowed for scope {scope_type}",
        )
    if scope_type == "university" and scope_id is not None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="scope_id must be null when scope_type is university",
        )
    if scope_type != "university" and scope_id is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"scope_id is required when scope_type is {scope_type}",
        )

    await _require_page_section_access(
        db,
        user,
        page_key="homepage",
        scope_type=scope_type,
        scope_id=scope_id,
        action="item_manage",
    )
    try:
        result = await PageCmsSourceService.search(
            db,
            source_type,
            query=q,
            scope_type=scope_type,
            scope_id=scope_id,
            page=page,
            per_page=per_page,
        )
    except PageCmsSourceProviderError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
    return success(data=result.items, meta=result.meta)


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
    return success(data=result.items, meta=result.meta)


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
    return success(data=item)


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
    )
    items = payload.pop("items", [])
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
    return success(data=item, message="Page section created")


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
    )
    payload = data.model_dump(exclude_unset=True)
    payload.pop("items", None)
    await _require_page_section_access(
        db,
        user,
        page_key=payload.get("page_key", item.page_key),
        scope_type=payload.get("scope_type", item.scope_type),
        scope_id=payload.get("scope_id", item.scope_id),
        action="update",
    )
    payload["updated_by_id"] = user.id
    _require_page_authoring_edit(user, item)
    await ContentWorkflowService.reset_after_authoring_edit(
        db, item, "page-sections", user.id, changed_fields=payload,
    )
    apply_updates(item, **payload)
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Page section updated")


@router.patch("/pages/{page_key}/sections/reorder")
async def reorder_page_sections(
    page_key: str,
    data: PageSectionReorderRequest,
    db: DbSession,
    user: CurrentUser,
):
    await _require_page_section_access(
        db,
        user,
        page_key=page_key,
        scope_type=data.scope_type,
        scope_id=data.scope_id,
        action="update",
    )
    try:
        sections = await PageSectionService.reorder_sections(
            db,
            page_key=page_key,
            scope_type=data.scope_type,
            scope_id=data.scope_id,
            entries=data.items,
            actor_id=user.id,
            authorize_edit=lambda section: _require_page_authoring_edit(user, section),
        )
    except PageCmsReorderConflictError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Page composition changed; reload before saving order",
        ) from exc
    except PageCmsReorderValidationError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(exc)) from exc
    return success(data=sections, message="Page sections reordered")


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
    )
    _require_page_authoring_edit(user, section)
    await ContentWorkflowService.reset_after_authoring_edit(
        db,
        section,
        "page-sections",
        user.id,
        changed_fields={"section_item_create": data.model_dump(exclude={"page_section_id"})},
    )
    item = SectionItem(page_section_id=section.id, **data.model_dump(exclude={"page_section_id"}))
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Section item created")


@router.patch("/page-sections/{section_id}/items/reorder")
async def reorder_section_items(
    section_id: uuid.UUID,
    data: SectionItemReorderRequest,
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
    )

    async def authorize_locked_parent(locked_section: PageSection) -> None:
        await _require_page_section_access(
            db,
            user,
            page_key=locked_section.page_key,
            scope_type=locked_section.scope_type,
            scope_id=locked_section.scope_id,
            action="item_manage",
        )
        _require_page_authoring_edit(user, locked_section)

    try:
        items = await PageSectionService.reorder_section_items(
            db,
            section_id=section_id,
            entries=data.items,
            actor_id=user.id,
            authorize_parent=authorize_locked_parent,
        )
    except PageCmsReorderConflictError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Page composition changed; reload before saving order",
        ) from exc
    except PageCmsReorderValidationError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(exc)) from exc
    return success(data=items, message="Section items reordered")


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
    )
    item = await PageSectionWorkflowService.transition(item, action, user.id, db=db)
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Page section updated")


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
    )
    payload = data.model_dump(exclude_unset=True)
    _require_page_authoring_edit(user, section)
    merged_state = {
        field: getattr(item, field, None)
        for field in (
            "item_type",
            "source_type",
            "source_id",
            "title",
            "subtitle",
            "body_text",
            "content",
            "cta_label",
            "cta_url",
            "cta_description",
            "media_caption",
            "media_alt_text",
            "video_provider",
            "video_url",
            "video_duration_seconds",
        )
    }
    merged_state.update(payload)
    try:
        validate_section_item_state(merged_state)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(exc)) from exc
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
    return success(data=item, message="Section item updated")


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
