"""Governance service."""

from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models import Board, Person, StaffAssignment
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
    async def get_members(
        db: AsyncSession,
        board_id: uuid.UUID,
        *,
        public_only: bool = False,
    ) -> list[StaffAssignment]:
        query = (
            select(StaffAssignment)
            .join(StaffAssignment.person)
            .options(
                selectinload(StaffAssignment.person).selectinload(Person.photo),
                selectinload(StaffAssignment.reports_to).selectinload(StaffAssignment.person),
            )
            .where(
                StaffAssignment.entity_type == "board",
                StaffAssignment.entity_id == board_id,
                StaffAssignment.deleted_at.is_(None),
                StaffAssignment.status == "active",
            )
            .order_by(
                StaffAssignment.hierarchy_level.asc(),
                StaffAssignment.display_order.asc(),
                Person.full_name.asc(),
            )
        )
        if public_only:
            query = query.where(StaffAssignment.is_public.is_(True))
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    def member_display_data(member: StaffAssignment) -> dict:
        """Return the stable, nested member shape used by public governance pages."""
        reports_to = member.reports_to
        return {
            "id": member.id,
            "display_label": member.person.display_name,
            "role": member.role,
            "role_label": StaffService.role_label(member.role),
            "title": member.title,
            "hierarchy_level": member.hierarchy_level,
            "reports_to": (
                {
                    "id": reports_to.id,
                    "display_label": reports_to.person.display_name,
                    "role_label": StaffService.role_label(reports_to.role),
                }
                if reports_to is not None
                else None
            ),
            "display_order": member.display_order,
            "is_acting": member.is_acting,
        }

    @staticmethod
    def public_board_data(board: Board, members: Sequence[StaffAssignment]) -> dict:
        """Return board and member display data without UUID-only relationships."""
        return {
            "id": board.id,
            "display_label": board.name,
            "name": board.name,
            "slug": board.slug,
            "board_type": board.board_type,
            "description": board.description,
            "mandate": board.mandate,
            "mission": board.mission,
            "vision": board.vision,
            "meeting_schedule": board.meeting_schedule,
            "display_order": board.display_order,
            "members": [GovernanceService.member_display_data(member) for member in members],
        }

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
