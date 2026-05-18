"""Person service."""

from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ksu_common import PaginatedResult

from ..models import Person, User
from ._base import apply_updates, ilike_any, paginate_query


class PersonService:
    """Person profile operations."""

    @staticmethod
    async def get_by_id(db: AsyncSession, person_id: uuid.UUID, *, load_options: Sequence = ()) -> Person | None:
        query = select(Person).options(selectinload(Person.assignments)).where(Person.id == person_id)
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
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        search: str | None = None,
        department_id: uuid.UUID | None = None,
        academic_rank: str | None = None,
        employment_type: str | None = None,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = select(Person).where(Person.is_active.is_(True)).order_by(Person.full_name.asc())
        if load_options:
            query = query.options(*load_options)
        if search:
            query = query.where(ilike_any(search, Person.full_name, Person.email))
        if department_id:
            query = query.where(Person.department_id == department_id)
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
