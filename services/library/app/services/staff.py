"""Services for LibraryStaff, LibraryService, and LibraryStatistics."""

from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

try:
    from ksu_common.leadership import LIBRARY_LEADERSHIP_ROLES
except ModuleNotFoundError:  # Local venvs may have an older installed common package.
    LIBRARY_LEADERSHIP_ROLES = frozenset(
        {
            "university_librarian",
            "chief_librarian",
            "deputy_librarian",
            "head_librarian",
            "senior_librarian",
            "branch_librarian",
            "head",
            "manager",
            "coordinator",
        }
    )

from ..models import Library, LibraryService, LibraryStaff, LibraryStatistics
from ..schemas import (
    LibraryServiceCreate,
    LibraryServiceOut,
    LibraryServiceUpdate,
    LibraryStaffCreate,
    LibraryStaffOut,
    LibraryStaffUpdate,
    LibraryStatisticsCreate,
    LibraryStatisticsOut,
)


# ── LibraryStaff ──────────────────────────────────────────────────────────────


async def list_staff(
    db: AsyncSession,
    library_id: uuid.UUID,
    *,
    public_only: bool = False,
) -> list[LibraryStaffOut]:
    """List library staff members."""
    query = LibraryStaff.active_query().where(
        LibraryStaff.library_id == library_id,
        LibraryStaff.is_active.is_(True),
    )
    if public_only:
        query = query.join(Library, Library.id == LibraryStaff.library_id).where(
            LibraryStaff.is_public.is_(True),
            Library.is_active.is_(True),
            Library.is_public.is_(True),
        )
    query = query.order_by(LibraryStaff.sort_order, LibraryStaff.created_at)
    result = await db.execute(query)
    return [LibraryStaffOut.model_validate(s) for s in result.scalars().all()]


async def list_leadership(
    db: AsyncSession,
    *,
    library_id: uuid.UUID | None = None,
    public_only: bool = True,
) -> list[LibraryStaffOut]:
    """List public library leadership using the shared leadership role vocabulary."""
    query = LibraryStaff.active_query().where(
        LibraryStaff.is_active.is_(True),
        LibraryStaff.role.in_(LIBRARY_LEADERSHIP_ROLES),
    )
    if library_id is not None:
        query = query.where(LibraryStaff.library_id == library_id)
    if public_only:
        query = query.join(Library, Library.id == LibraryStaff.library_id).where(
            LibraryStaff.is_public.is_(True),
            Library.is_active.is_(True),
            Library.is_public.is_(True),
        )
    query = query.order_by(LibraryStaff.sort_order, LibraryStaff.created_at)
    result = await db.execute(query)
    return [LibraryStaffOut.model_validate(s) for s in result.scalars().all()]


async def get_staff_entity(db: AsyncSession, staff_id: uuid.UUID) -> LibraryStaff:
    """Get raw LibraryStaff entity (for internal use)."""
    return await LibraryStaff.get_or_raise(
        db, staff_id, error_message="Library staff member not found"
    )


async def create_staff(db: AsyncSession, data: LibraryStaffCreate) -> LibraryStaffOut:
    """Create a new library staff member."""
    member = LibraryStaff(**data.model_dump())
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return LibraryStaffOut.model_validate(member)


async def update_staff(
    db: AsyncSession, staff_id: uuid.UUID, data: LibraryStaffUpdate
) -> LibraryStaffOut:
    """Update a library staff member."""
    member = await get_staff_entity(db, staff_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(member, field, value)
    await db.commit()
    await db.refresh(member)
    return LibraryStaffOut.model_validate(member)


async def delete_staff(db: AsyncSession, staff_id: uuid.UUID) -> None:
    """Soft-delete a library staff member."""
    member = await get_staff_entity(db, staff_id)
    member.soft_delete()
    await db.commit()


# ── LibraryService ────────────────────────────────────────────────────────────


async def list_services(
    db: AsyncSession,
    library_id: uuid.UUID,
    *,
    public_only: bool = True,
) -> list[LibraryServiceOut]:
    """List library services."""
    query = LibraryService.active_query().where(
        LibraryService.library_id == library_id,
        LibraryService.is_active.is_(True),
    )
    if public_only:
        query = query.join(Library, Library.id == LibraryService.library_id).where(
            LibraryService.is_public.is_(True),
            Library.is_active.is_(True),
            Library.is_public.is_(True),
        )
    query = query.order_by(LibraryService.sort_order, LibraryService.name)
    result = await db.execute(query)
    return [LibraryServiceOut.model_validate(s) for s in result.scalars().all()]


async def get_service_entity(db: AsyncSession, service_id: uuid.UUID) -> LibraryService:
    """Get raw LibraryService entity (for internal use)."""
    return await LibraryService.get_or_raise(
        db, service_id, error_message="Library service not found"
    )


async def create_service(
    db: AsyncSession, data: LibraryServiceCreate
) -> LibraryServiceOut:
    """Create a new library service."""
    service = LibraryService(**data.model_dump())
    db.add(service)
    await db.commit()
    await db.refresh(service)
    return LibraryServiceOut.model_validate(service)


async def update_service(
    db: AsyncSession, service_id: uuid.UUID, data: LibraryServiceUpdate
) -> LibraryServiceOut:
    """Update a library service."""
    service = await get_service_entity(db, service_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(service, field, value)
    await db.commit()
    await db.refresh(service)
    return LibraryServiceOut.model_validate(service)


async def delete_service(db: AsyncSession, service_id: uuid.UUID) -> None:
    """Soft-delete a library service."""
    service = await get_service_entity(db, service_id)
    service.soft_delete()
    await db.commit()


# ── LibraryStatistics ─────────────────────────────────────────────────────────


async def list_statistics(
    db: AsyncSession,
    library_id: uuid.UUID,
    *,
    period_type: Optional[str] = None,
) -> list[LibraryStatisticsOut]:
    """List library statistics snapshots."""
    query = (
        LibraryStatistics.active_query()
        .where(LibraryStatistics.library_id == library_id)
        .order_by(LibraryStatistics.period_start.desc())
    )
    if period_type is not None:
        query = query.where(LibraryStatistics.period_type == period_type)
    result = await db.execute(query)
    return [LibraryStatisticsOut.model_validate(s) for s in result.scalars().all()]


async def create_statistics(
    db: AsyncSession, data: LibraryStatisticsCreate
) -> LibraryStatisticsOut:
    """Create a library statistics snapshot."""
    stats = LibraryStatistics(**data.model_dump())
    db.add(stats)
    await db.commit()
    await db.refresh(stats)
    return LibraryStatisticsOut.model_validate(stats)
