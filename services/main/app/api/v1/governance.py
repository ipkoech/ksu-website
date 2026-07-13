"""Governance endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ._person_media import with_person_photo_urls
from ...deps import CurrentUser, DbSession, require_scope
from ...models import Board, StaffAssignment
from ...schemas import (
    BoardCreate,
    BoardMemberCreate,
    BoardUpdate,
    CouncilMemberCreate,
    CouncilMemberUpdate,
    CouncilOrderUpdate,
    GovernancePageContentUpdate,
    GovernanceRoleCreate,
    GovernanceRoleUpdate,
)
from ...services import AuditService, GovernanceService

router = APIRouter()


def _member_error(error: ValueError) -> HTTPException:
    message = str(error) or "Board member could not be added"
    if "already" in message:
        return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=message)
    if "not found" in message.lower():
        return HTTPException(status_code=404, detail=message)
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


@router.get("/boards")
@cached_public(timeout=3600, vary_on=("board_type", "parent_entity_type", "parent_entity_id", "fields", "include"))
async def list_boards(
    db: DbSession,
    board_type: str | None = None,
    parent_entity_type: str | None = None,
    parent_entity_id: uuid.UUID | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Board, fields)
    boards = await GovernanceService.list_boards(
        db,
        board_type=board_type,
        parent_entity_type=parent_entity_type,
        parent_entity_id=parent_entity_id,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(boards))


@router.get("/boards/{slug}")
@cached_public(timeout=3600, vary_on=("slug", "fields", "include"))
async def get_board(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Board, fields)
    board = await GovernanceService.get_board_by_slug(db, slug, load_options=selector.load_options)
    if board is None:
        raise HTTPException(status_code=404, detail="Board not found")
    return success(data=selector.apply(board))


@router.get("/boards/id/{board_id}")
async def get_board_by_id(board_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(Board, fields)
    board = await GovernanceService.get_board(db, board_id, load_options=selector.load_options)
    if board is None:
        raise HTTPException(status_code=404, detail="Board not found")
    return success(data=selector.apply(board))


@router.get("/boards/{slug}/members")
@cached_public(timeout=3600, vary_on=("slug", "fields", "include"))
async def get_board_members(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    board = await GovernanceService.get_board_by_slug(db, slug)
    if board is None:
        raise HTTPException(status_code=404, detail="Board not found")
    members = await GovernanceService.get_members(db, board.id)
    selector = build_selector(StaffAssignment, fields)
    return success(data=with_person_photo_urls(selector.apply(members), members))


@router.get("/boards/id/{board_id}/members")
async def get_board_members_by_id(board_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    board = await GovernanceService.get_board(db, board_id)
    if board is None:
        raise HTTPException(status_code=404, detail="Board not found")
    members = await GovernanceService.get_members(db, board.id)
    selector = build_selector(StaffAssignment, fields)
    return success(data=with_person_photo_urls(selector.apply(members), members))


@router.get("/council")
@cached_public(timeout=3600, vary_on=("fields", "include"))
async def get_council(db: DbSession, fields: FieldSelection = FieldsDep):
    board = await GovernanceService.get_board_by_slug(db, "university-council")
    if board is None:
        raise HTTPException(status_code=404, detail="Council not found")
    members = await GovernanceService.get_members(db, board.id, public_only=True)
    return success(data=GovernanceService.public_board_data(board, members))


@router.get("/management-board")
@cached_public(timeout=3600, vary_on=("fields", "include"))
async def get_management_board(db: DbSession, fields: FieldSelection = FieldsDep):
    board = await GovernanceService.get_board_by_slug(db, "management-board")
    if board is None:
        raise HTTPException(status_code=404, detail="Management Board not found")
    members = await GovernanceService.get_members(db, board.id, public_only=True)
    return success(data=GovernanceService.public_board_data(board, members))


@router.get("/senate")
@cached_public(timeout=3600, vary_on=("fields", "include"))
async def get_senate(db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Board, fields)
    board = await GovernanceService.get_board_by_slug(db, "senate", load_options=selector.load_options)
    if board is None:
        raise HTTPException(status_code=404, detail="Senate not found")
    return success(data=selector.apply(board))


@router.post("/boards", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("governance.manage_boards"))])
async def create_board(data: BoardCreate, db: DbSession, _: CurrentUser):
    board = await GovernanceService.create_board(db, **data.model_dump())
    return success(data=board, message="Board created")


@router.patch("/boards/id/{board_id}", dependencies=[Depends(require_scope("governance.manage_boards"))])
async def update_board(board_id: uuid.UUID, data: BoardUpdate, db: DbSession, _: CurrentUser):
    board = await GovernanceService.get_board(db, board_id)
    if board is None:
        raise HTTPException(status_code=404, detail="Board not found")
    board = await GovernanceService.update_board(db, board, **data.model_dump(exclude_unset=True))
    return success(data=board, message="Board updated")


@router.delete("/boards/id/{board_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("governance.manage_boards"))])
async def delete_board(board_id: uuid.UUID, db: DbSession, _: CurrentUser):
    board = await GovernanceService.get_board(db, board_id)
    if board is None:
        raise HTTPException(status_code=404, detail="Board not found")
    await GovernanceService.soft_delete_board(db, board)


@router.post("/boards/{slug}/members", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("governance.manage_boards"))])
async def add_board_member(slug: str, data: BoardMemberCreate, db: DbSession, _: CurrentUser):
    board = await GovernanceService.get_board_by_slug(db, slug)
    if board is None:
        raise HTTPException(status_code=404, detail="Board not found")
    payload = data.model_dump()
    person_id = payload.pop("person_id")
    role = payload.pop("role")
    try:
        assignment = await GovernanceService.add_member(db, board.id, person_id, role, **payload)
    except ValueError as error:
        raise _member_error(error) from error
    return success(data=assignment, message="Member added")


@router.post("/boards/id/{board_id}/members", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("governance.manage_boards"))])
async def add_board_member_by_id(board_id: uuid.UUID, data: BoardMemberCreate, db: DbSession, _: CurrentUser):
    board = await GovernanceService.get_board(db, board_id)
    if board is None:
        raise HTTPException(status_code=404, detail="Board not found")
    payload = data.model_dump()
    person_id = payload.pop("person_id")
    role = payload.pop("role")
    try:
        assignment = await GovernanceService.add_member(db, board.id, person_id, role, **payload)
    except ValueError as error:
        raise _member_error(error) from error
    return success(data=assignment, message="Member added")


@router.delete("/boards/{slug}/members/{person_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("governance.manage_boards"))])
async def remove_board_member(slug: str, person_id: uuid.UUID, db: DbSession, _: CurrentUser):
    board = await GovernanceService.get_board_by_slug(db, slug)
    if board is None:
        raise HTTPException(status_code=404, detail="Board not found")
    await GovernanceService.remove_member(db, board.id, person_id)


@router.delete("/boards/id/{board_id}/members/{person_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("governance.manage_boards"))])
async def remove_board_member_by_id(board_id: uuid.UUID, person_id: uuid.UUID, db: DbSession, _: CurrentUser):
    board = await GovernanceService.get_board(db, board_id)
    if board is None:
        raise HTTPException(status_code=404, detail="Board not found")
    await GovernanceService.remove_member(db, board.id, person_id)


async def _council_member_or_404(db: DbSession, assignment_id: uuid.UUID) -> StaffAssignment:
    assignment = await GovernanceService.get_council_member(db, assignment_id)
    if assignment is None:
        raise HTTPException(status_code=404, detail="Council member not found")
    return assignment


@router.get("/admin/council/dashboard", dependencies=[Depends(require_scope("governance.view"))])
async def council_dashboard(db: DbSession, _: CurrentUser):
    try:
        data = await GovernanceService.council_dashboard(db)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    return success(data=data)


@router.get("/admin/roles", dependencies=[Depends(require_scope("governance.manage_roles"))])
async def list_governance_roles(db: DbSession, _: CurrentUser, active_only: bool = True):
    return success(data=await GovernanceService.list_governance_roles(db, active_only=active_only))


@router.post(
    "/admin/roles",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_scope("governance.manage_roles"))],
)
async def create_governance_role(data: GovernanceRoleCreate, db: DbSession, user: CurrentUser):
    role = await GovernanceService.create_governance_role(db, data.model_dump(), user.id)
    return success(data=role, message="Governance role created")


@router.patch("/admin/roles/{role_id}", dependencies=[Depends(require_scope("governance.manage_roles"))])
async def update_governance_role(role_id: uuid.UUID, data: GovernanceRoleUpdate, db: DbSession, user: CurrentUser):
    role = await GovernanceService.get_governance_role(db, role_id)
    if role is None:
        raise HTTPException(status_code=404, detail="Governance role not found")
    role = await GovernanceService.update_governance_role(db, role, data.model_dump(exclude_unset=True), user.id)
    return success(data=role, message="Governance role updated")


@router.get("/admin/council/members", dependencies=[Depends(require_scope("governance.view"))])
async def list_council_members(db: DbSession, _: CurrentUser, workflow_status: str | None = None):
    try:
        members = await GovernanceService.list_council_members(db, workflow_status=workflow_status)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    return success(data=members)


@router.post(
    "/admin/council/members",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_scope("governance.manage_members"))],
)
async def create_council_member(data: CouncilMemberCreate, db: DbSession, user: CurrentUser):
    try:
        assignment = await GovernanceService.create_council_member(db, data.model_dump(), user.id)
    except ValueError as error:
        raise _member_error(error) from error
    return success(data=assignment, message="Council member created")


@router.get("/admin/council/members/{assignment_id}", dependencies=[Depends(require_scope("governance.view"))])
async def get_council_member(assignment_id: uuid.UUID, db: DbSession, _: CurrentUser):
    return success(data=await _council_member_or_404(db, assignment_id))


@router.patch(
    "/admin/council/members/{assignment_id}",
    dependencies=[Depends(require_scope("governance.manage_members"))],
)
async def update_council_member(
    assignment_id: uuid.UUID, data: CouncilMemberUpdate, db: DbSession, user: CurrentUser
):
    assignment = await _council_member_or_404(db, assignment_id)
    try:
        assignment = await GovernanceService.update_council_member(
            db, assignment, data.model_dump(exclude_unset=True), user.id
        )
    except ValueError as error:
        raise _member_error(error) from error
    return success(data=assignment, message="Council member updated")


@router.delete(
    "/admin/council/members/{assignment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_scope("governance.manage_members"))],
)
async def delete_council_member(assignment_id: uuid.UUID, db: DbSession, _: CurrentUser):
    assignment = await _council_member_or_404(db, assignment_id)
    assignment.status = "ended"
    await db.flush()


@router.get("/admin/council/order", dependencies=[Depends(require_scope("governance.view"))])
async def get_council_order(db: DbSession, _: CurrentUser):
    members = await GovernanceService.list_council_members(db)
    return success(
        data=[
            {
                "assignment_id": member.id,
                "display_group": GovernanceService._role_group(member),
                "display_order": member.display_order,
                "hierarchy_level": member.hierarchy_level,
                "reports_to_id": member.reports_to_id,
            }
            for member in members
        ]
    )


@router.put("/admin/council/order", dependencies=[Depends(require_scope("governance.manage_order"))])
async def update_council_order(data: CouncilOrderUpdate, db: DbSession, user: CurrentUser):
    try:
        members = await GovernanceService.update_council_order(db, data.nodes, user.id)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error
    return success(data=members, message="Council order updated")


@router.get("/admin/council/page-content", dependencies=[Depends(require_scope("governance.view"))])
async def get_council_page_content(db: DbSession, _: CurrentUser):
    board = await GovernanceService.get_university_council_board(db)
    if board is None:
        raise HTTPException(status_code=404, detail="University Council not found")
    return success(data=await GovernanceService.get_council_page_content(db, board.id))


@router.patch("/admin/council/page-content", dependencies=[Depends(require_scope("governance.manage_members"))])
async def update_council_page_content(data: GovernancePageContentUpdate, db: DbSession, user: CurrentUser):
    board = await GovernanceService.get_university_council_board(db)
    if board is None:
        raise HTTPException(status_code=404, detail="University Council not found")
    page = await GovernanceService.upsert_council_page_content(db, board.id, data.model_dump(exclude_unset=True), user.id)
    return success(data=page, message="Council page content updated")


@router.get("/admin/council/preview", dependencies=[Depends(require_scope("governance.view"))])
async def preview_council(db: DbSession, _: CurrentUser):
    try:
        return success(data=await GovernanceService.public_university_council(db))
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


async def _transition_council_member(
    assignment_id: uuid.UUID, action: str, db: DbSession, user: CurrentUser, comment: str | None = None
):
    assignment = await _council_member_or_404(db, assignment_id)
    try:
        assignment = await GovernanceService.transition_council_member(db, assignment, action, user.id, comment)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error
    return success(data=assignment, message=f"Council member {action}")


@router.post(
    "/admin/council/members/{assignment_id}/submit-review",
    dependencies=[Depends(require_scope("governance.manage_members"))],
)
async def submit_council_member_for_review(assignment_id: uuid.UUID, db: DbSession, user: CurrentUser, comment: str | None = None):
    return await _transition_council_member(assignment_id, "submit-review", db, user, comment)


@router.post(
    "/admin/council/members/{assignment_id}/approve",
    dependencies=[Depends(require_scope("governance.approve"))],
)
async def approve_council_member(assignment_id: uuid.UUID, db: DbSession, user: CurrentUser, comment: str | None = None):
    return await _transition_council_member(assignment_id, "approve", db, user, comment)


@router.post(
    "/admin/council/members/{assignment_id}/publish",
    dependencies=[Depends(require_scope("governance.publish"))],
)
async def publish_council_member(assignment_id: uuid.UUID, db: DbSession, user: CurrentUser, comment: str | None = None):
    return await _transition_council_member(assignment_id, "publish", db, user, comment)


@router.post(
    "/admin/council/members/{assignment_id}/unpublish",
    dependencies=[Depends(require_scope("governance.publish"))],
)
async def unpublish_council_member(assignment_id: uuid.UUID, db: DbSession, user: CurrentUser, comment: str | None = None):
    return await _transition_council_member(assignment_id, "unpublish", db, user, comment)


@router.post(
    "/admin/council/members/{assignment_id}/archive",
    dependencies=[Depends(require_scope("governance.archive"))],
)
async def archive_council_member(assignment_id: uuid.UUID, db: DbSession, user: CurrentUser, comment: str | None = None):
    return await _transition_council_member(assignment_id, "archive", db, user, comment)


@router.get("/admin/council/audit-log", dependencies=[Depends(require_scope("governance.view"))])
async def list_council_audit_log(db: DbSession, _: CurrentUser, page: int = 1, per_page: int = 20):
    result = await AuditService.list(
        db, page=page, per_page=per_page, service_name="main", resource_type="staff_assignment"
    )
    return success(data=result.items, meta=result.meta)


@router.get("/public/university-council")
@cached_public(timeout=3600)
async def public_university_council(db: DbSession):
    try:
        return success(data=await GovernanceService.public_university_council(db))
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.get("/public/university-council/{slug}")
@cached_public(timeout=3600, vary_on=("slug",))
async def public_university_council_profile(slug: str, db: DbSession):
    profile = await GovernanceService.public_university_council_profile(db, slug)
    if profile is None:
        raise HTTPException(status_code=404, detail="Council member profile not found")
    return success(data=profile)
