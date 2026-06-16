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
from ...schemas import BoardCreate, BoardMemberCreate, BoardUpdate
from ...services import GovernanceService

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
    selector = build_selector(Board, fields)
    board = await GovernanceService.get_board_by_slug(db, "university-council", load_options=selector.load_options)
    if board is None:
        raise HTTPException(status_code=404, detail="Council not found")
    return success(data=selector.apply(board))


@router.get("/management-board")
@cached_public(timeout=3600, vary_on=("fields", "include"))
async def get_management_board(db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Board, fields)
    board = await GovernanceService.get_board_by_slug(db, "management-board", load_options=selector.load_options)
    if board is None:
        raise HTTPException(status_code=404, detail="Management Board not found")
    return success(data=selector.apply(board))


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
