"""Staff assignment service."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models import HierarchyLevel, Person, StaffAssignment


class StaffService:
    """Staff assignment operations with reporting chains."""

    @staticmethod
    async def assign(
        db: AsyncSession,
        *,
        person_id: uuid.UUID,
        entity_type: str,
        entity_id: uuid.UUID | None,
        role: str,
        reports_to_id: uuid.UUID | None = None,
        is_primary: bool = True,
        start_date: date | None = None,
        title: str | None = None,
        hierarchy_level: int | None = None,
        user_id: uuid.UUID | None = None,
    ) -> StaffAssignment:
        person = await Person.get_by_id(db, person_id)
        if person is None:
            raise ValueError("Person not found")
        if is_primary:
            result = await db.execute(select(StaffAssignment).where(StaffAssignment.person_id == person_id, StaffAssignment.is_primary.is_(True), StaffAssignment.status == "active"))
            for existing in result.scalars().all():
                existing.is_primary = False

        assignment = StaffAssignment(
            person_id=person_id,
            user_id=user_id or person.user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            role=role,
            title=title,
            hierarchy_level=hierarchy_level or int(StaffAssignment.computed_hierarchy_level.fget.__globals__["ROLE_HIERARCHY"].get(role, HierarchyLevel.STAFF)),
            reports_to_id=reports_to_id,
            is_primary=is_primary,
            start_date=start_date,
            status="active",
        )
        db.add(assignment)
        await db.flush()
        await db.refresh(assignment)
        return assignment

    @staticmethod
    async def get_by_id(db: AsyncSession, assignment_id: uuid.UUID, *, load_options: Sequence = ()) -> StaffAssignment | None:
        query = select(StaffAssignment).where(StaffAssignment.id == assignment_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def update(db: AsyncSession, assignment: StaffAssignment, **data) -> StaffAssignment:
        for key, value in data.items():
            if hasattr(assignment, key):
                setattr(assignment, key, value)
        await db.flush()
        await db.refresh(assignment)
        return assignment

    @staticmethod
    async def check_position_conflict(
        db: AsyncSession,
        entity_type: str,
        entity_id: uuid.UUID | None,
        role: str,
        exclude_assignment_id: uuid.UUID | None = None,
    ) -> StaffAssignment | None:
        """Check if a unique position is already filled (e.g., only one Dean per School)."""
        unique_roles = {"vc", "dean", "hod", "cod", "director", "librarian", "registrar", "chairperson"}
        if role not in unique_roles:
            return None
        query = select(StaffAssignment).where(
            StaffAssignment.entity_type == entity_type,
            StaffAssignment.entity_id == entity_id,
            StaffAssignment.role == role,
            StaffAssignment.status == "active",
            StaffAssignment.is_acting.is_(False),
        )
        if exclude_assignment_id:
            query = query.where(StaffAssignment.id != exclude_assignment_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def end_assignment(
        db: AsyncSession,
        assignment_id: uuid.UUID,
        end_date: date | None = None,
    ) -> StaffAssignment:
        assignment = await StaffAssignment.get_by_id(db, assignment_id)
        if assignment is None:
            raise ValueError("Assignment not found")
        assignment.end_date = end_date or date.today()
        assignment.status = "ended"
        assignment.is_primary = False
        await db.flush()
        return assignment

    @staticmethod
    async def get_assignments_for_person(
        db: AsyncSession,
        person_id: uuid.UUID,
        active_only: bool = True,
        load_options: Sequence = (),
    ) -> list[StaffAssignment]:
        query = select(StaffAssignment).options(selectinload(StaffAssignment.person)).where(StaffAssignment.person_id == person_id)
        if load_options:
            query = query.options(*load_options)
        if active_only:
            query = query.where(StaffAssignment.status == "active")
        result = await db.execute(query.order_by(StaffAssignment.hierarchy_level.asc(), StaffAssignment.display_order.asc()))
        return list(result.scalars().all())

    @staticmethod
    async def get_assignments_for_entity(
        db: AsyncSession,
        entity_type: str,
        entity_id: uuid.UUID,
        role: str | None = None,
        load_options: Sequence = (),
    ) -> list[StaffAssignment]:
        query = select(StaffAssignment).options(selectinload(StaffAssignment.person)).where(
            StaffAssignment.entity_type == entity_type,
            StaffAssignment.entity_id == entity_id,
            StaffAssignment.status == "active",
        )
        if load_options:
            query = query.options(*load_options)
        if role:
            query = query.where(StaffAssignment.role == role)
        result = await db.execute(query.order_by(StaffAssignment.hierarchy_level.asc(), StaffAssignment.display_order.asc()))
        return list(result.scalars().all())

    @staticmethod
    async def get_reporting_chain(
        db: AsyncSession,
        assignment_id: uuid.UUID,
        load_options: Sequence = (),
    ) -> list[StaffAssignment]:
        query = select(StaffAssignment).options(selectinload(StaffAssignment.person)).where(StaffAssignment.id == assignment_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        assignment = result.scalar_one_or_none()
        if assignment is None:
            raise ValueError("Assignment not found")
        chain = [assignment]
        current = assignment
        while current.reports_to_id:
            next_query = select(StaffAssignment).options(selectinload(StaffAssignment.person)).where(StaffAssignment.id == current.reports_to_id)
            if load_options:
                next_query = next_query.options(*load_options)
            next_result = await db.execute(next_query)
            current = next_result.scalar_one_or_none()
            if current is None:
                break
            chain.append(current)
        return chain

    @staticmethod
    async def get_direct_reports(
        db: AsyncSession,
        assignment_id: uuid.UUID,
        load_options: Sequence = (),
    ) -> list[StaffAssignment]:
        query = (
            select(StaffAssignment).options(selectinload(StaffAssignment.person)).where(
                StaffAssignment.reports_to_id == assignment_id,
                StaffAssignment.status == "active",
            ).order_by(StaffAssignment.hierarchy_level.asc(), StaffAssignment.display_order.asc())
        )
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return list(result.scalars().all())
