"""Public-safe aggregate stats for the public website."""

from __future__ import annotations

import uuid

import sqlalchemy as sa
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import (
    Announcement,
    ArtsCulture,
    Blog,
    Club,
    Department,
    DepartmentService,
    Document,
    Event,
    Intake,
    News,
    Person,
    Programme,
    School,
    SportsFacility,
    StaffAssignment,
)
from ..schemas.stats import PublicStatItem, PublicStatsResponse


async def _count(db: AsyncSession, model, *conditions) -> int:
    result = await db.execute(
        select(func.count(model.id)).where(model.deleted_at.is_(None), *conditions)
    )
    return int(result.scalar_one() or 0)


async def _sum_publications_for_people(
    db: AsyncSession,
    person_ids_query,
) -> int:
    result = await db.execute(
        select(func.coalesce(func.sum(Person.publications_count), 0)).where(
            Person.deleted_at.is_(None),
            Person.id.in_(person_ids_query),
        )
    )
    return int(result.scalar_one() or 0)


def _item(
    key: str,
    label: str,
    value: int,
    description: str,
    href: str | None = None,
    suffix: str = "",
) -> PublicStatItem:
    return PublicStatItem(
        key=key,
        label=label,
        value=value,
        suffix=suffix,
        description=description,
        href=href,
    )


async def homepage_stats(db: AsyncSession) -> PublicStatsResponse:
    public_content = (
        lambda model: (
            model.is_public.is_(True),
            model.is_published.is_(True),
            model.status == "published",
            model.archived_at.is_(None),
            model.deleted_at.is_(None),
        )
    )

    students_result = await db.execute(
        select(
            func.coalesce(
                func.sum(Department.student_count + Department.postgraduate_student_count),
                0,
            )
        ).where(
            Department.deleted_at.is_(None),
            Department.is_active.is_(True),
            Department.is_public.is_(True),
            Department.department_type == "academic",
        )
    )
    students = int(students_result.scalar_one() or 0)

    stats = [
        _item(
            "schools",
            "Schools",
            await _count(db, School, School.is_active.is_(True), School.is_public.is_(True)),
            "Active public schools",
            "/academics/schools",
        ),
        _item(
            "departments",
            "Departments",
            await _count(
                db,
                Department,
                Department.is_active.is_(True),
                Department.is_public.is_(True),
                Department.department_type == "academic",
            ),
            "Active public academic departments",
            "/academics/departments",
        ),
        _item(
            "students",
            "Students",
            students,
            "Students recorded across public academic departments",
            "/academics",
        ),
        _item(
            "programmes",
            "Programmes",
            await _count(db, Programme, Programme.is_active.is_(True)),
            "Active academic programmes",
            "/academics/programmes",
        ),
        _item(
            "published_updates",
            "Published Updates",
            sum(
                [
                    await _count(db, News, *public_content(News)),
                    await _count(db, Event, *public_content(Event)),
                    await _count(db, Blog, *public_content(Blog)),
                    await _count(db, Announcement, *public_content(Announcement)),
                ]
            ),
            "Published news, events, blogs, and announcements",
            "/news",
        ),
        _item(
            "public_staff",
            "Public Staff Records",
            await _count(
                db,
                StaffAssignment,
                StaffAssignment.is_public.is_(True),
                StaffAssignment.status == "active",
            ),
            "Published staff assignments",
            "/people",
        ),
        _item(
            "student_life",
            "Student Life Records",
            sum(
                [
                    await _count(db, Club, Club.is_active.is_(True), Club.is_public.is_(True)),
                    await _count(db, ArtsCulture, ArtsCulture.is_active.is_(True)),
                    await _count(db, SportsFacility, SportsFacility.is_active.is_(True)),
                ]
            ),
            "Active clubs, arts, culture, and sports records",
            "/campus-life",
        ),
        _item(
            "downloads",
            "Public Downloads",
            await _count(
                db,
                Document,
                Document.is_active.is_(True),
                Document.is_public.is_(True),
                Document.requires_login.is_(False),
            ),
            "Public documents and downloads",
            "/downloads",
        ),
    ]

    return PublicStatsResponse(
        scope="homepage",
        title="Kisii University at a glance",
        stats=stats,
    )


async def school_stats(db: AsyncSession, slug: str) -> PublicStatsResponse | None:
    school = await db.scalar(
        select(School).where(
            School.slug == slug,
            School.deleted_at.is_(None),
            School.is_active.is_(True),
            School.is_public.is_(True),
        )
    )
    if school is None:
        return None

    department_ids = select(Department.id).where(
        Department.deleted_at.is_(None),
        Department.school_id == school.id,
        Department.is_active.is_(True),
        Department.is_public.is_(True),
    )
    staff_filter = or_(
        and_(StaffAssignment.entity_type == "school", StaffAssignment.entity_id == school.id),
        and_(StaffAssignment.entity_type == "department", StaffAssignment.entity_id.in_(department_ids)),
    )
    staff_people = (
        select(StaffAssignment.person_id)
        .where(
            StaffAssignment.deleted_at.is_(None),
            StaffAssignment.is_public.is_(True),
            StaffAssignment.status == "active",
            staff_filter,
        )
        .distinct()
    )

    stats = [
        _item(
            "departments",
            "Departments",
            await _count(
                db,
                Department,
                Department.school_id == school.id,
                Department.is_active.is_(True),
                Department.is_public.is_(True),
            ),
            "Active public departments in this school",
            f"/academics/schools/{school.slug}/departments",
        ),
        _item(
            "programmes",
            "Programmes",
            await _count(
                db,
                Programme,
                Programme.is_active.is_(True),
                Programme.department_id.in_(department_ids),
            ),
            "Active programmes offered through this school",
            f"/academics/schools/{school.slug}/programmes",
        ),
        _item(
            "staff",
            "Staff Records",
            await _count(
                db,
                StaffAssignment,
                StaffAssignment.is_public.is_(True),
                StaffAssignment.status == "active",
                staff_filter,
            ),
            "Published school and department staff assignments",
            f"/academics/schools/{school.slug}/team",
        ),
        _item(
            "publications",
            "Publication Records",
            await _sum_publications_for_people(db, staff_people),
            "Publication counts linked to published staff profiles",
            f"/academics/schools/{school.slug}/publications",
        ),
        _item(
            "news",
            "News Records",
            await _count(
                db,
                News,
                News.is_public.is_(True),
                News.is_published.is_(True),
                News.status == "published",
                News.archived_at.is_(None),
                News.scope_type == "school",
                News.scope_id == school.id,
            ),
            "Published news connected to this school",
            f"/academics/schools/{school.slug}/news",
        ),
        _item(
            "downloads",
            "Downloads",
            await _count(
                db,
                Document,
                Document.is_active.is_(True),
                Document.is_public.is_(True),
                Document.requires_login.is_(False),
                Document.scope_type == "school",
                Document.scope_id == school.id,
            ),
            "Public documents connected to this school",
            f"/academics/schools/{school.slug}/downloads",
        ),
        _item(
            "clubs",
            "Clubs",
            await _count(
                db,
                Club,
                Club.is_active.is_(True),
                Club.is_public.is_(True),
                Club.school_id == school.id,
            ),
            "Active public clubs connected to this school",
            f"/academics/schools/{school.slug}/clubs",
        ),
    ]

    return PublicStatsResponse(scope="school", title=f"{school.name} at a glance", stats=stats)


async def department_stats(db: AsyncSession, slug: str) -> PublicStatsResponse | None:
    department = await db.scalar(
        select(Department).where(
            Department.slug == slug,
            Department.deleted_at.is_(None),
            Department.is_active.is_(True),
            Department.is_public.is_(True),
        )
    )
    if department is None:
        return None

    staff_people = (
        select(StaffAssignment.person_id)
        .where(
            StaffAssignment.deleted_at.is_(None),
            StaffAssignment.is_public.is_(True),
            StaffAssignment.status == "active",
            StaffAssignment.entity_type == "department",
            StaffAssignment.entity_id == department.id,
        )
        .distinct()
    )

    base_href = (
        f"/academics/departments/{department.slug}"
        if department.department_type == "academic"
        else f"/administration/{department.slug}"
    )

    stats = [
        _item(
            "programmes",
            "Programmes",
            await _count(
                db,
                Programme,
                Programme.is_active.is_(True),
                Programme.department_id == department.id,
            ),
            "Active programmes in this department",
            f"{base_href}/programmes",
        ),
        _item(
            "staff",
            "Staff Records",
            await _count(
                db,
                StaffAssignment,
                StaffAssignment.is_public.is_(True),
                StaffAssignment.status == "active",
                StaffAssignment.entity_type == "department",
                StaffAssignment.entity_id == department.id,
            ),
            "Published department staff assignments",
            f"{base_href}/team",
        ),
        _item(
            "services",
            "Services",
            await _count(
                db,
                DepartmentService,
                DepartmentService.is_active.is_(True),
                DepartmentService.department_id == department.id,
            ),
            "Active services connected to this department",
            f"{base_href}/services",
        ),
        _item(
            "publications",
            "Publication Records",
            await _sum_publications_for_people(db, staff_people),
            "Publication counts linked to published staff profiles",
            f"{base_href}/publications",
        ),
        _item(
            "news",
            "News Records",
            await _count(
                db,
                News,
                News.is_public.is_(True),
                News.is_published.is_(True),
                News.status == "published",
                News.archived_at.is_(None),
                News.scope_type == "department",
                News.scope_id == department.id,
            ),
            "Published news connected to this department",
            f"{base_href}/news",
        ),
        _item(
            "downloads",
            "Downloads",
            await _count(
                db,
                Document,
                Document.is_active.is_(True),
                Document.is_public.is_(True),
                Document.requires_login.is_(False),
                Document.scope_type == "department",
                Document.scope_id == department.id,
            ),
            "Public documents connected to this department",
            f"{base_href}/downloads",
        ),
    ]

    return PublicStatsResponse(
        scope="department",
        title=f"{department.name} at a glance",
        stats=stats,
    )


async def public_stats(
    db: AsyncSession,
    *,
    scope: str = "homepage",
    slug: str | None = None,
) -> PublicStatsResponse | None:
    if scope == "homepage":
        return await homepage_stats(db)
    if scope == "school" and slug:
        return await school_stats(db, slug)
    if scope == "department" and slug:
        return await department_stats(db, slug)
    return None
