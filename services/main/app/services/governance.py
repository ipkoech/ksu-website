"""Governance service."""

from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Board, StaffAssignment
from .staff import StaffService


class GovernanceService:
    """Board operations."""

    @staticmethod
    async def get_board(db: AsyncSession, board_id: uuid.UUID, *, load_options: Sequence = ()) -> Board | None:
        query = select(Board).where(Board.id == board_id, Board.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_board_by_slug(db: AsyncSession, slug: str, *, load_options: Sequence = ()) -> Board | None:
        query = select(Board).where(Board.slug == slug, Board.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_boards(
        db: AsyncSession,
        *,
        board_type: str | None = None,
        parent_entity_type: str | None = None,
        parent_entity_id: uuid.UUID | None = None,
        is_active: bool | None = True,
        load_options: Sequence = (),
    ) -> list[Board]:
        query = select(Board).order_by(Board.display_order.asc(), Board.name.asc())
        if load_options:
            query = query.options(*load_options)
        if board_type:
            query = query.where(Board.board_type == board_type)
        if parent_entity_type:
            query = query.where(Board.parent_entity_type == parent_entity_type)
        if parent_entity_id:
            query = query.where(Board.parent_entity_id == parent_entity_id)
        if is_active is not None:
            query = query.where(Board.is_active.is_(is_active))
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def create_board(db: AsyncSession, **data) -> Board:
        board = Board(**data)
        db.add(board)
        await db.flush()
        await db.refresh(board)
        return board

    @staticmethod
    async def update_board(db: AsyncSession, board: Board, **data) -> Board:
        for key, value in data.items():
            if hasattr(board, key):
                setattr(board, key, value)
        await db.flush()
        await db.refresh(board)
        return board

    @staticmethod
    async def soft_delete_board(db: AsyncSession, board: Board) -> None:
        board.is_active = False
        board.status = "dissolved"
        await db.flush()

    @staticmethod
    async def get_members(db: AsyncSession, board_id: uuid.UUID) -> list[StaffAssignment]:
        return await StaffService.get_assignments_for_entity(db, "board", board_id)

    @staticmethod
    async def add_member(
        db: AsyncSession,
        board_id: uuid.UUID,
        person_id: uuid.UUID,
        role: str,
        **data,
    ) -> StaffAssignment:
        board = await GovernanceService.get_board(db, board_id)
        if board is None:
            raise ValueError("Board not found")

        duplicate = await db.execute(
            select(StaffAssignment).where(
                StaffAssignment.entity_type == "board",
                StaffAssignment.entity_id == board_id,
                StaffAssignment.person_id == person_id,
                StaffAssignment.status == "active",
                StaffAssignment.deleted_at.is_(None),
            )
        )
        if duplicate.scalars().first() is not None:
            raise ValueError("Person is already an active member of this board")

        conflict = await StaffService.check_position_conflict(db, "board", board_id, role)
        if conflict is not None:
            raise ValueError(f"{StaffService.role_label(role)} is already assigned on this board")

        assignment = await StaffService.assign(
            db,
            person_id=person_id,
            entity_type="board",
            entity_id=board_id,
            role=role,
            **data,
        )
        if role in {"chairperson", "council_chair"}:
            board.chairperson_id = person_id
        elif role == "vice_chairperson":
            board.vice_chairperson_id = person_id
        elif role in {"secretary", "board_secretary"}:
            board.secretary_id = person_id
        await db.flush()
        await db.refresh(assignment)
        return assignment

    @staticmethod
    async def remove_member(
        db: AsyncSession,
        board_id: uuid.UUID,
        person_id: uuid.UUID,
    ) -> None:
        result = await db.execute(
            select(StaffAssignment).where(
                StaffAssignment.entity_type == "board",
                StaffAssignment.entity_id == board_id,
                StaffAssignment.person_id == person_id,
                StaffAssignment.status == "active",
            )
        )
        assignment = result.scalar_one_or_none()
        if assignment is None:
            raise ValueError("Board member assignment not found")
        assignment.status = "ended"
        await db.flush()
