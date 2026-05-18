"""Admissions services."""

from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ksu_common import PaginatedResult

from ..helpers.slug import unique_slug
from ..models import AcademicCalendar, AdmissionInfo, Department, Intake, Person, Programme, ProgrammeIntake, ProgrammeTutor, School
from ._base import apply_updates, ilike_any, paginate_query


class ProgrammeService:
    @staticmethod
    async def get_by_id(db: AsyncSession, programme_id: uuid.UUID, *, load_options: Sequence = ()) -> Programme | None:
        query = (
            select(Programme)
            .options(
                selectinload(Programme.tutors).selectinload(ProgrammeTutor.person),
                selectinload(Programme.intakes).selectinload(ProgrammeIntake.intake),
                selectinload(Programme.department),
            )
            .where(Programme.id == programme_id, Programme.is_active.is_(True))
        )
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str, *, load_options: Sequence = ()) -> Programme | None:
        query = (
            select(Programme)
            .options(
                selectinload(Programme.tutors).selectinload(ProgrammeTutor.person),
                selectinload(Programme.intakes).selectinload(ProgrammeIntake.intake),
                selectinload(Programme.department),
            )
            .where(Programme.slug == slug, Programme.is_active.is_(True))
        )
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_code(db: AsyncSession, code: str, *, load_options: Sequence = ()) -> Programme | None:
        query = select(Programme).where(Programme.code == code, Programme.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> Programme:
        if not data.get("slug") and data.get("name"):
            data["slug"] = await unique_slug(db, Programme, data["name"])
        programme = Programme(**data)
        db.add(programme)
        await db.flush()
        return programme

    @staticmethod
    async def update(db: AsyncSession, programme: Programme, **data) -> Programme:
        if data.get("name") and not data.get("slug"):
            data["slug"] = await unique_slug(db, Programme, data["name"], exclude_id=programme.id)
        apply_updates(programme, **data)
        await db.flush()
        return programme

    @staticmethod
    async def delete(db: AsyncSession, programme: Programme) -> None:
        programme.is_active = False
        await db.flush()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        q: str | None = None,
        department_id: uuid.UUID | None = None,
        school_id: uuid.UUID | None = None,
        level: str | None = None,
        mode_of_study: str | None = None,
        is_active: bool | None = True,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = (
            select(Programme)
            .options(selectinload(Programme.tutors), selectinload(Programme.intakes), selectinload(Programme.department))
            .order_by(Programme.display_order.asc(), Programme.name.asc())
        )
        if load_options:
            query = query.options(*load_options)
        if school_id:
            query = query.join(Department, Programme.department_id == Department.id).where(Department.school_id == school_id)
        if department_id:
            query = query.where(Programme.department_id == department_id)
        if level:
            query = query.where(Programme.level == level)
        if mode_of_study:
            query = query.where(Programme.mode_of_study == mode_of_study)
        if is_active is not None:
            query = query.where(Programme.is_active.is_(is_active))
        if q:
            query = query.where(ilike_any(q, Programme.name, Programme.code, Programme.about, Programme.career_prospects))
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def add_tutor(
        db: AsyncSession,
        programme_id: uuid.UUID,
        person_id: uuid.UUID,
        *,
        role: str,
        is_lead: bool = False,
    ) -> ProgrammeTutor:
        result = await db.execute(
            select(ProgrammeTutor).where(
                ProgrammeTutor.programme_id == programme_id,
                ProgrammeTutor.person_id == person_id,
            )
        )
        tutor = result.scalar_one_or_none()
        if tutor is None:
            tutor = ProgrammeTutor(programme_id=programme_id, person_id=person_id, role=role, is_lead=is_lead)
            db.add(tutor)
        else:
            tutor.role = role
            tutor.is_lead = is_lead
        await db.flush()
        return tutor

    @staticmethod
    async def remove_tutor(db: AsyncSession, programme_id: uuid.UUID, person_id: uuid.UUID) -> None:
        result = await db.execute(
            select(ProgrammeTutor).where(
                ProgrammeTutor.programme_id == programme_id,
                ProgrammeTutor.person_id == person_id,
            )
        )
        tutor = result.scalar_one_or_none()
        if tutor is not None:
            await db.delete(tutor)
            await db.flush()

    @staticmethod
    async def attach_intake(
        db: AsyncSession,
        programme_id: uuid.UUID,
        intake_id: uuid.UUID,
        *,
        slots_available: int | None = None,
        application_deadline: object | None = None,
        is_active: bool = True,
    ) -> ProgrammeIntake:
        result = await db.execute(
            select(ProgrammeIntake).where(
                ProgrammeIntake.programme_id == programme_id,
                ProgrammeIntake.intake_id == intake_id,
            )
        )
        item = result.scalar_one_or_none()
        if item is None:
            item = ProgrammeIntake(
                programme_id=programme_id,
                intake_id=intake_id,
                slots_available=slots_available,
                application_deadline=application_deadline,
                is_active=is_active,
            )
            db.add(item)
        else:
            item.slots_available = slots_available
            item.application_deadline = application_deadline
            item.is_active = is_active
        await db.flush()
        return item

    @staticmethod
    async def get_staff(db: AsyncSession, programme_id: uuid.UUID) -> list[Person]:
        result = await db.execute(
            select(Person)
            .join(ProgrammeTutor, ProgrammeTutor.person_id == Person.id)
            .where(ProgrammeTutor.programme_id == programme_id, Person.is_active.is_(True), Person.is_public.is_(True))
            .order_by(ProgrammeTutor.is_lead.desc(), Person.full_name.asc())
        )
        return list(result.scalars().unique().all())


class IntakeService:
    @staticmethod
    async def get_by_id(db: AsyncSession, intake_id: uuid.UUID, *, load_options: Sequence = ()) -> Intake | None:
        query = (
            select(Intake)
            .options(selectinload(Intake.programmes).selectinload(ProgrammeIntake.programme))
            .where(Intake.id == intake_id, Intake.is_active.is_(True))
        )
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str, *, load_options: Sequence = ()) -> Intake | None:
        query = (
            select(Intake)
            .options(selectinload(Intake.programmes).selectinload(ProgrammeIntake.programme))
            .where(Intake.slug == slug, Intake.is_active.is_(True))
        )
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> Intake:
        if not data.get("slug") and data.get("name"):
            data["slug"] = await unique_slug(db, Intake, data["name"])
        intake = Intake(**data)
        db.add(intake)
        await db.flush()
        return intake

    @staticmethod
    async def update(db: AsyncSession, intake: Intake, **data) -> Intake:
        if data.get("name") and not data.get("slug"):
            data["slug"] = await unique_slug(db, Intake, data["name"], exclude_id=intake.id)
        apply_updates(intake, **data)
        await db.flush()
        return intake

    @staticmethod
    async def delete(db: AsyncSession, intake: Intake) -> None:
        intake.is_active = False
        intake.is_open = False
        await db.flush()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        academic_calendar_id: uuid.UUID | None = None,
        is_active: bool | None = True,
        is_open: bool | None = None,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = (
            select(Intake)
            .options(selectinload(Intake.programmes))
            .order_by(Intake.application_start.desc(), Intake.name.asc())
        )
        if load_options:
            query = query.options(*load_options)
        if academic_calendar_id:
            query = query.where(Intake.academic_calendar_id == academic_calendar_id)
        if is_active is not None:
            query = query.where(Intake.is_active.is_(is_active))
        if is_open is not None:
            query = query.where(Intake.is_open.is_(is_open))
        return await paginate_query(db, query, page=page, per_page=per_page)


class AdmissionInfoService:
    @staticmethod
    async def get_by_id(db: AsyncSession, item_id: uuid.UUID, *, load_options: Sequence = ()) -> AdmissionInfo | None:
        query = select(AdmissionInfo).where(AdmissionInfo.id == item_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str, *, published_only: bool = True, load_options: Sequence = ()) -> AdmissionInfo | None:
        query = select(AdmissionInfo).where(AdmissionInfo.slug == slug)
        if load_options:
            query = query.options(*load_options)
        if published_only:
            query = query.where(AdmissionInfo.is_published.is_(True))
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> AdmissionInfo:
        if not data.get("slug") and data.get("title"):
            data["slug"] = await unique_slug(db, AdmissionInfo, data["title"])
        item = AdmissionInfo(**data)
        db.add(item)
        await db.flush()
        return item

    @staticmethod
    async def update(db: AsyncSession, item: AdmissionInfo, **data) -> AdmissionInfo:
        if data.get("title") and not data.get("slug"):
            data["slug"] = await unique_slug(db, AdmissionInfo, data["title"], exclude_id=item.id)
        apply_updates(item, **data)
        await db.flush()
        return item

    @staticmethod
    async def delete(db: AsyncSession, item: AdmissionInfo) -> None:
        item.is_published = False
        await db.flush()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        content_type: str | None = None,
        audience_level: str | None = None,
        school_id: uuid.UUID | None = None,
        is_published: bool | None = True,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = select(AdmissionInfo).order_by(AdmissionInfo.display_order.asc(), AdmissionInfo.title.asc())
        if load_options:
            query = query.options(*load_options)
        if content_type:
            query = query.where(AdmissionInfo.content_type == content_type)
        if audience_level:
            query = query.where(AdmissionInfo.audience_levels.contains([audience_level]))
        if school_id:
            query = query.where(AdmissionInfo.school_id == school_id)
        if is_published is not None:
            query = query.where(AdmissionInfo.is_published.is_(is_published))
        return await paginate_query(db, query, page=page, per_page=per_page)


__all__ = ["ProgrammeService", "IntakeService", "AdmissionInfoService"]
