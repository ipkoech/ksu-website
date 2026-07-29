"""Academic structure services."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ksu_common import PaginatedResult

from ..helpers.slug import unique_slug
from ..models import Campus, Department, DepartmentService as DepartmentServiceModel, Person, School, StaffAssignment
from ..models.staff import HIERARCHY_LEVEL_HEAD
from ._base import apply_updates, ilike_any, paginate_query


class CampusService:
    @staticmethod
    async def get_by_id(db: AsyncSession, campus_id: uuid.UUID, *, load_options: Sequence = ()) -> Campus | None:
        query = select(Campus).where(Campus.id == campus_id, Campus.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str, *, load_options: Sequence = ()) -> Campus | None:
        query = select(Campus).where(Campus.slug == slug, Campus.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> Campus:
        if not data.get("slug") and data.get("name"):
            data["slug"] = await unique_slug(db, Campus, data["name"])
        campus = Campus(**data)
        db.add(campus)
        await db.flush()
        return campus

    @staticmethod
    async def update(db: AsyncSession, campus: Campus, **data) -> Campus:
        if data.get("name") and not data.get("slug"):
            data["slug"] = await unique_slug(db, Campus, data["name"], exclude_id=campus.id)
        apply_updates(campus, **data)
        await db.flush()
        return campus

    @staticmethod
    async def list(db: AsyncSession, *, is_active: bool | None = True, load_options: Sequence = ()) -> list[Campus]:
        query = select(Campus).order_by(Campus.display_order.asc(), Campus.name.asc())
        if load_options:
            query = query.options(*load_options)
        if is_active is not None:
            query = query.where(Campus.is_active.is_(is_active))
        result = await db.execute(query)
        return list(result.scalars().all())


class SchoolService:
    @staticmethod
    async def get_by_id(db: AsyncSession, school_id: uuid.UUID, *, load_options: Sequence = ()) -> School | None:
        query = select(School).where(School.id == school_id, School.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str, *, load_options: Sequence = ()) -> School | None:
        query = select(School).where(School.slug == slug, School.is_active.is_(True), School.is_public.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> School:
        if not data.get("slug") and data.get("name"):
            data["slug"] = await unique_slug(db, School, data["name"])
        school = School(**data)
        db.add(school)
        await db.flush()
        return school

    @staticmethod
    async def update(db: AsyncSession, school: School, **data) -> School:
        if data.get("name") and not data.get("slug"):
            data["slug"] = await unique_slug(db, School, data["name"], exclude_id=school.id)
        apply_updates(school, **data)
        await db.flush()
        return school

    @staticmethod
    async def delete(db: AsyncSession, school: School) -> None:
        school.is_active = False
        await db.flush()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        campus_id: uuid.UUID | None = None,
        administrative_wing_id: uuid.UUID | None = None,
        search: str | None = None,
        is_active: bool | None = True,
        is_public: bool | None = True,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = select(School).order_by(School.display_order.asc(), School.name.asc())
        if load_options:
            query = query.options(*load_options)
        if campus_id:
            query = query.where(School.campus_id == campus_id)
        if administrative_wing_id:
            query = query.where(School.administrative_wing_id == administrative_wing_id)
        if search:
            query = query.where(ilike_any(search, School.name, School.code))
        if is_active is not None:
            query = query.where(School.is_active.is_(is_active))
        if is_public is not None:
            query = query.where(School.is_public.is_(is_public))
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def get_with_departments(db: AsyncSession, school_id: uuid.UUID, *, load_options: Sequence = ()) -> School | None:
        query = (
            select(School)
            .options(selectinload(School.departments).selectinload(Department.services))
            .where(School.id == school_id, School.is_active.is_(True))
        )
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_staff(db: AsyncSession, school_id: uuid.UUID) -> list[Person]:
        result = await db.execute(
            select(Person)
            .options(selectinload(Person.photo))
            .join(StaffAssignment, StaffAssignment.person_id == Person.id)
            .where(
                StaffAssignment.entity_type == "school",
                StaffAssignment.entity_id == school_id,
                StaffAssignment.status == "active",
                Person.is_active.is_(True),
                Person.is_public.is_(True),
            )
            .order_by(Person.full_name.asc())
        )
        return list(result.scalars().unique().all())


class DepartmentService:
    HEAD_ASSIGNMENT_ROLES = ("hod", "head", "cod")

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        dept_id: uuid.UUID,
        *,
        is_active: bool | None = True,
        load_options: Sequence = (),
    ) -> Department | None:
        query = select(Department).where(Department.id == dept_id)
        if is_active is not None:
            query = query.where(Department.is_active.is_(is_active))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_code(db: AsyncSession, code: str, *, load_options: Sequence = ()) -> Department | None:
        query = select(Department).where(Department.code == code, Department.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str, *, load_options: Sequence = ()) -> Department | None:
        query = select(Department).where(Department.slug == slug, Department.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> Department:
        head_id = data.get("head_id")
        if not data.get("slug") and data.get("name"):
            data["slug"] = await unique_slug(db, Department, data["name"])
        department = Department(**data)
        db.add(department)
        await db.flush()
        if head_id:
            await DepartmentService._sync_head_assignment(db, department, head_id)
            await db.flush()
        return department

    @staticmethod
    async def update(db: AsyncSession, department: Department, **data) -> Department:
        head_id_was_provided = "head_id" in data
        if data.get("name") and not data.get("slug"):
            data["slug"] = await unique_slug(db, Department, data["name"], exclude_id=department.id)
        apply_updates(department, **data)
        if head_id_was_provided:
            await DepartmentService._sync_head_assignment(db, department, data.get("head_id"))
        await db.flush()
        return department

    @staticmethod
    async def _sync_head_assignment(
        db: AsyncSession,
        department: Department,
        head_id: uuid.UUID | None,
    ) -> None:
        today = date.today()
        existing_result = await db.execute(
            select(StaffAssignment).where(
                StaffAssignment.entity_type == "department",
                StaffAssignment.entity_id == department.id,
                StaffAssignment.role.in_(DepartmentService.HEAD_ASSIGNMENT_ROLES),
                StaffAssignment.status == "active",
                StaffAssignment.deleted_at.is_(None),
            )
        )
        existing_assignments = list(existing_result.scalars().all())

        if head_id is None:
            for assignment in existing_assignments:
                assignment.status = "ended"
                assignment.is_primary = False
                assignment.end_date = assignment.end_date or today
            return

        person = await Person.get_by_id(db, head_id)
        if person is None or not person.is_active:
            raise ValueError("Selected HOD/COD was not found or is inactive")

        conflict_result = await db.execute(
            select(StaffAssignment)
            .options(selectinload(StaffAssignment.person))
            .where(
                StaffAssignment.entity_type == "department",
                StaffAssignment.entity_id != department.id,
                StaffAssignment.person_id == head_id,
                StaffAssignment.role.in_(DepartmentService.HEAD_ASSIGNMENT_ROLES),
                StaffAssignment.status == "active",
                StaffAssignment.deleted_at.is_(None),
            )
        )
        conflict = conflict_result.scalars().first()
        if conflict is not None:
            conflict_name = conflict.person.full_name if conflict.person else "This person"
            raise ValueError(f"{conflict_name} is already assigned as HOD/COD for another department")

        target_role = "cod" if department.department_type == "academic" else "head"
        target_title = "Coordinator of Department" if target_role == "cod" else "Head of Department"
        matched_assignment: StaffAssignment | None = None

        for assignment in existing_assignments:
            if assignment.person_id == head_id:
                matched_assignment = assignment
                assignment.role = target_role
                assignment.title = target_title
                assignment.hierarchy_level = HIERARCHY_LEVEL_HEAD
                assignment.is_primary = True
                assignment.is_public = True
                assignment.status = "active"
                assignment.end_date = None
            else:
                assignment.status = "ended"
                assignment.is_primary = False
                assignment.end_date = assignment.end_date or today

        if matched_assignment is None:
            db.add(
                StaffAssignment(
                    person_id=head_id,
                    user_id=person.user_id,
                    entity_type="department",
                    entity_id=department.id,
                    role=target_role,
                    title=target_title,
                    hierarchy_level=HIERARCHY_LEVEL_HEAD,
                    is_primary=True,
                    is_public=True,
                    status="active",
                    display_order=0,
                )
            )

    @staticmethod
    async def delete(db: AsyncSession, department: Department) -> None:
        department.is_active = False
        await db.flush()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        school_id: uuid.UUID | None = None,
        wing_id: uuid.UUID | None = None,
        department_type: str | None = None,
        search: str | None = None,
        is_active: bool | None = True,
        is_public: bool | None = True,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = select(Department).options(selectinload(Department.services)).order_by(Department.display_order.asc(), Department.name.asc())
        if load_options:
            query = query.options(*load_options)
        if school_id:
            query = query.where(Department.school_id == school_id)
        if wing_id:
            query = query.where(Department.wing_id == wing_id)
        if department_type:
            query = query.where(Department.department_type == department_type)
        if search:
            query = query.where(ilike_any(search, Department.name, Department.code))
        if is_active is not None:
            query = query.where(Department.is_active.is_(is_active))
        if is_public is not None:
            query = query.where(Department.is_public.is_(is_public))
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def get_staff(db: AsyncSession, dept_id: uuid.UUID) -> list[Person]:
        result = await db.execute(
            select(Person)
            .options(selectinload(Person.photo))
            .join(StaffAssignment, StaffAssignment.person_id == Person.id)
            .where(
                StaffAssignment.entity_type == "department",
                StaffAssignment.entity_id == dept_id,
                StaffAssignment.status == "active",
                Person.is_active.is_(True),
                Person.is_public.is_(True),
            )
            .order_by(Person.full_name.asc())
        )
        return list(result.scalars().unique().all())

    @staticmethod
    async def get_services(db: AsyncSession, dept_id: uuid.UUID) -> list[DepartmentServiceModel]:
        result = await db.execute(
            select(DepartmentServiceModel)
            .where(DepartmentServiceModel.department_id == dept_id, DepartmentServiceModel.is_active.is_(True))
            .order_by(DepartmentServiceModel.display_order.asc(), DepartmentServiceModel.name.asc())
        )
        return list(result.scalars().all())


class DepartmentServiceCatalogService:
    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        service_id: uuid.UUID,
        *,
        is_active: bool | None = None,
        load_options: Sequence = (),
    ) -> DepartmentServiceModel | None:
        query = select(DepartmentServiceModel).where(DepartmentServiceModel.id == service_id)
        if is_active is not None:
            query = query.where(DepartmentServiceModel.is_active.is_(is_active))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        department_id: uuid.UUID | None = None,
        search: str | None = None,
        is_active: bool | None = None,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = select(DepartmentServiceModel).order_by(
            DepartmentServiceModel.display_order.asc(),
            DepartmentServiceModel.name.asc(),
        )
        if load_options:
            query = query.options(*load_options)
        if department_id:
            query = query.where(DepartmentServiceModel.department_id == department_id)
        if search:
            query = query.where(ilike_any(search, DepartmentServiceModel.name, DepartmentServiceModel.description))
        if is_active is not None:
            query = query.where(DepartmentServiceModel.is_active.is_(is_active))
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def create(db: AsyncSession, **data) -> DepartmentServiceModel:
        if not data.get("slug") and data.get("name"):
            data["slug"] = await unique_slug(db, DepartmentServiceModel, data["name"])
        service = DepartmentServiceModel(**data)
        db.add(service)
        await db.flush()
        return service

    @staticmethod
    async def update(db: AsyncSession, service: DepartmentServiceModel, **data) -> DepartmentServiceModel:
        if data.get("name") and not data.get("slug"):
            data["slug"] = await unique_slug(db, DepartmentServiceModel, data["name"], exclude_id=service.id)
        apply_updates(service, **data)
        await db.flush()
        return service

    @staticmethod
    async def delete(db: AsyncSession, service: DepartmentServiceModel) -> None:
        service.is_active = False
        await db.flush()
