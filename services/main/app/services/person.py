"""Person service."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ksu_common import PaginatedResult

from ..models import Department, Person, School, StaffAssignment, User
from ._base import apply_updates, ilike_any, paginate_query


class PersonService:
    """Person profile operations."""

    @staticmethod
    async def get_by_id(db: AsyncSession, person_id: uuid.UUID, *, load_options: Sequence = ()) -> Person | None:
        query = select(Person).options(selectinload(Person.assignments), selectinload(Person.photo)).where(Person.id == person_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_user_id(db: AsyncSession, user_id: uuid.UUID, *, load_options: Sequence = ()) -> Person | None:
        query = select(Person).where(Person.user_id == user_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> Person:
        person = Person(**data)
        db.add(person)
        await db.flush()
        await db.refresh(person)
        return person

    @staticmethod
    async def update(db: AsyncSession, person: Person, **data) -> Person:
        apply_updates(person, **data)
        await db.flush()
        await db.refresh(person)
        return person

    @staticmethod
    async def delete(db: AsyncSession, person: Person) -> None:
        await PersonService.deactivate(db, person, end_assignments=True)
        person.soft_delete()
        await db.flush()

    @staticmethod
    async def activate(db: AsyncSession, person: Person) -> Person:
        person.restore()
        person.is_active = True
        await db.flush()
        await db.refresh(person)
        return person

    @staticmethod
    async def deactivate(db: AsyncSession, person: Person, *, end_assignments: bool = True) -> Person:
        person.is_active = False
        if end_assignments:
            result = await db.execute(
                select(StaffAssignment).where(
                    StaffAssignment.person_id == person.id,
                    StaffAssignment.status == "active",
                    StaffAssignment.deleted_at.is_(None),
                )
            )
            for assignment in result.scalars().all():
                assignment.status = "ended"
                assignment.is_primary = False
                assignment.end_date = assignment.end_date or date.today()
        await db.flush()
        await db.refresh(person)
        return person

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        search: str | None = None,
        department_id: uuid.UUID | None = None,
        school_id: uuid.UUID | None = None,
        academic_rank: str | None = None,
        employment_type: str | None = None,
        status: str = "active",
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = select(Person).options(selectinload(Person.photo)).order_by(Person.full_name.asc())
        if load_options:
            query = query.options(*load_options)
        if status == "active":
            query = query.where(Person.deleted_at.is_(None), Person.is_active.is_(True))
        elif status == "inactive":
            query = query.where(Person.deleted_at.is_(None), Person.is_active.is_(False))
        elif status == "deleted":
            query = query.where(Person.deleted_at.is_not(None))
        elif status != "all":
            query = query.where(Person.deleted_at.is_(None), Person.is_active.is_(True))
        if search or school_id:
            query = query.outerjoin(Department, Person.department_id == Department.id).outerjoin(School, Department.school_id == School.id)
        if search:
            query = query.where(
                ilike_any(
                    search,
                    Person.full_name,
                    Person.first_name,
                    Person.middle_name,
                    Person.last_name,
                    Person.email,
                    Person.employee_number,
                    Person.phone,
                    Department.name,
                    Department.code,
                    School.name,
                    School.code,
                )
            )
        if department_id:
            query = query.where(Person.department_id == department_id)
        if school_id:
            query = query.where(Department.school_id == school_id)
        if academic_rank:
            query = query.where(Person.academic_rank == academic_rank)
        if employment_type:
            query = query.where(Person.employment_type == employment_type)
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def link_to_user(db: AsyncSession, person: Person, user: User) -> Person:
        person.user_id = user.id
        await db.flush()
        await db.refresh(person)
        return person
