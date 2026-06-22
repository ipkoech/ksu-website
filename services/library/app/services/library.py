"""Service layer for Library, LibraryHours, LibraryExternalLink, and LibraryFile."""

from __future__ import annotations

import uuid
from datetime import datetime, time
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from typing import Sequence

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.pagination import PaginatedResult, paginate

from ..models import Library, LibraryExternalLink, LibraryFile, LibraryHours
from ..schemas import (
    LibraryCreate,
    LibraryExternalLinkCreate,
    LibraryExternalLinkUpdate,
    LibraryFileCreate,
    LibraryHoursCreate,
    LibraryHoursOut,
    LibraryExternalLinkOut,
    LibraryFileOut,
    LibraryUpdate,
)


# ── Library ───────────────────────────────────────────────────────────────────


def public_libraries_query():
    return Library.active_query().where(
        Library.is_active.is_(True),
        Library.is_public.is_(True),
    )


async def get_library(
    db: AsyncSession,
    library_id: uuid.UUID,
    *,
    load_options: Sequence = (),
) -> Library:
    """Get library by ID with optional eager loading."""
    query = Library.active_query().where(Library.id == library_id)
    if load_options:
        query = query.options(*load_options)
    result = await db.execute(query)
    library = result.scalar_one_or_none()
    if library is None:
        raise ValueError(f"Library {library_id} not found")
    return library


async def get_public_library(db: AsyncSession, library_id: uuid.UUID) -> Library:
    """Get a library only when it is active and public."""
    result = await db.execute(public_libraries_query().where(Library.id == library_id))
    library = result.scalar_one_or_none()
    if library is None:
        raise ValueError(f"Library {library_id} not found")
    return library


async def get_library_entity(db: AsyncSession, library_id: uuid.UUID) -> Library:
    """Get raw Library entity (for internal use)."""
    return await Library.get_or_raise(
        db, library_id, error_message=f"Library {library_id} not found"
    )


async def get_library_by_slug(db: AsyncSession, slug: str) -> Library:
    """Get library by slug."""
    query = Library.active_query().where(Library.slug == slug)
    result = await db.execute(query)
    library = result.scalar_one_or_none()
    if library is None:
        raise ValueError(f"Library with slug '{slug}' not found")
    return library


async def list_libraries(
    db: AsyncSession,
    *,
    active_only: bool = True,
    public_only: bool = True,
    page: int = 1,
    per_page: int = 20,
    include_total: bool = True,
    load_options: Sequence = (),
    library_ids: Sequence[uuid.UUID | str] = (),
) -> PaginatedResult:
    """List libraries with optional eager loading."""
    query = public_libraries_query() if public_only else Library.active_query()
    if active_only and not public_only:
        query = query.where(Library.is_active.is_(True))
    if library_ids:
        query = query.where(Library.id.in_([uuid.UUID(str(item)) for item in library_ids]))
    if load_options:
        query = query.options(*load_options)
    query = query.order_by(Library.sort_order, Library.name)
    result = await paginate(
        db,
        query,
        page=page,
        per_page=per_page,
        include_total=include_total,
    )
    return result


async def create_library(db: AsyncSession, data: LibraryCreate) -> Library:
    """Create a new library."""
    existing = await db.execute(
        sa.select(Library.id).where(Library.slug == data.slug).limit(1)
    )
    if existing.scalar_one_or_none() is not None:
        raise ValueError(f"Library with slug '{data.slug}' already exists")
    library = Library(**data.model_dump())
    db.add(library)
    await db.commit()
    await db.refresh(library)
    return library


async def update_library(
    db: AsyncSession, library_id: uuid.UUID, data: LibraryUpdate
) -> Library:
    """Update an existing library."""
    library = await get_library_entity(db, library_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(library, field, value)
    await db.commit()
    await db.refresh(library)
    return library


async def delete_library(db: AsyncSession, library_id: uuid.UUID) -> None:
    """Soft-delete a library."""
    library = await get_library_entity(db, library_id)
    library.soft_delete()
    await db.commit()


# ── LibraryHours ──────────────────────────────────────────────────────────────


async def set_library_hours(
    db: AsyncSession,
    library_id: uuid.UUID,
    hours_list: list[LibraryHoursCreate],
) -> list[LibraryHoursOut]:
    """Replace all hours for a library."""
    await get_library_entity(db, library_id)

    await db.execute(
        sa.delete(LibraryHours).where(LibraryHours.library_id == library_id)
    )

    new_hours = [
        LibraryHours(library_id=library_id, **entry.model_dump())
        for entry in hours_list
    ]
    db.add_all(new_hours)
    await db.commit()
    for h in new_hours:
        await db.refresh(h)
    return [LibraryHoursOut.model_validate(h) for h in new_hours]


async def get_library_hours(
    db: AsyncSession, library_id: uuid.UUID, *, public_only: bool = False
) -> list[LibraryHoursOut]:
    """Get all hours for a library."""
    if public_only:
        await get_public_library(db, library_id)
    else:
        await get_library_entity(db, library_id)
    result = await db.execute(
        sa.select(LibraryHours)
        .where(LibraryHours.library_id == library_id)
        .order_by(LibraryHours.day_type)
    )
    return [LibraryHoursOut.model_validate(h) for h in result.scalars().all()]


def _day_type_for_datetime(value: datetime) -> str:
    weekday = value.weekday()
    if weekday < 5:
        return "weekday"
    if weekday == 5:
        return "saturday"
    return "sunday"


def _parse_clock(value: str | None) -> time | None:
    if not value:
        return None
    try:
        return time.fromisoformat(value)
    except ValueError:
        return None


def library_open_status(
    library: Library,
    hours: LibraryHours | None,
    *,
    now: datetime,
) -> dict:
    opens_at = _parse_clock(hours.opens_at if hours else None)
    closes_at = _parse_clock(hours.closes_at if hours else None)
    is_closed = bool(hours.is_closed) if hours else True
    is_open = False

    if not is_closed and opens_at is not None and closes_at is not None:
        current = now.timetz().replace(tzinfo=None)
        if opens_at <= closes_at:
            is_open = opens_at <= current <= closes_at
        else:
            is_open = current >= opens_at or current <= closes_at

    return {
        "library_id": str(library.id),
        "library_name": library.name,
        "library_slug": library.slug,
        "day_type": _day_type_for_datetime(now),
        "is_open": is_open,
        "is_closed": is_closed,
        "opens_at": hours.opens_at if hours else None,
        "closes_at": hours.closes_at if hours else None,
        "note": hours.note if hours else "Hours are not published for today",
        "checked_at": now.isoformat(),
        "timezone": str(now.tzinfo),
    }


async def get_today_status(
    db: AsyncSession,
    *,
    library_id: uuid.UUID | None = None,
    timezone_name: str = "Africa/Nairobi",
) -> list[dict]:
    """Compute open-now status for one or all active public libraries."""
    try:
        now = datetime.now(ZoneInfo(timezone_name))
    except ZoneInfoNotFoundError:
        now = datetime.now(ZoneInfo("Africa/Nairobi"))
        timezone_name = "Africa/Nairobi"

    day_type = _day_type_for_datetime(now)
    libraries_query = Library.active_query().where(
        Library.is_active.is_(True),
        Library.is_public.is_(True),
    )
    if library_id is not None:
        libraries_query = libraries_query.where(Library.id == library_id)
    libraries_query = libraries_query.order_by(Library.sort_order, Library.name)
    libraries = list((await db.execute(libraries_query)).scalars().all())

    if not libraries:
        return []

    hours_result = await db.execute(
        sa.select(LibraryHours).where(
            LibraryHours.library_id.in_([library.id for library in libraries]),
            LibraryHours.day_type == day_type,
        )
    )
    hours_by_library = {row.library_id: row for row in hours_result.scalars().all()}
    return [
        library_open_status(
            library,
            hours_by_library.get(library.id),
            now=now,
        )
        for library in libraries
    ]


# ── LibraryExternalLink ───────────────────────────────────────────────────────


async def list_external_links(
    db: AsyncSession,
    library_id: uuid.UUID,
    *,
    active_only: bool = False,
) -> list[LibraryExternalLinkOut]:
    """List external links for a library."""
    query = (
        LibraryExternalLink.active_query()
        .where(LibraryExternalLink.library_id == library_id)
        .order_by(LibraryExternalLink.sort_order, LibraryExternalLink.label)
    )

    if active_only:
        query = query.where(LibraryExternalLink.is_active.is_(True))

    result = await db.execute(query)
    return [
        LibraryExternalLinkOut.model_validate(link) for link in result.scalars().all()
    ]


async def create_external_link(
    db: AsyncSession,
    library_id: uuid.UUID,
    data: LibraryExternalLinkCreate,
) -> LibraryExternalLinkOut:
    """Create an external link."""
    await get_library_entity(db, library_id)
    link = LibraryExternalLink(library_id=library_id, **data.model_dump())
    db.add(link)
    await db.commit()
    await db.refresh(link)
    return LibraryExternalLinkOut.model_validate(link)


async def update_external_link(
    db: AsyncSession,
    link_id: uuid.UUID,
    data: LibraryExternalLinkUpdate,
) -> LibraryExternalLinkOut:
    """Update an external link."""
    link = await LibraryExternalLink.get_or_raise(
        db, link_id, error_message=f"External link {link_id} not found"
    )
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(link, field, value)
    await db.commit()
    await db.refresh(link)
    return LibraryExternalLinkOut.model_validate(link)


async def get_external_link_library_id(db: AsyncSession, link_id: uuid.UUID) -> uuid.UUID:
    link = await LibraryExternalLink.get_or_raise(
        db, link_id, error_message=f"External link {link_id} not found"
    )
    return link.library_id


async def delete_external_link(db: AsyncSession, link_id: uuid.UUID) -> None:
    """Soft-delete an external link."""
    link = await LibraryExternalLink.get_or_raise(
        db, link_id, error_message=f"External link {link_id} not found"
    )
    link.soft_delete()
    await db.commit()


async def toggle_external_link(
    db: AsyncSession, link_id: uuid.UUID, is_active: bool
) -> LibraryExternalLinkOut:
    """Toggle active status of an external link."""
    link = await LibraryExternalLink.get_or_raise(
        db, link_id, error_message=f"External link {link_id} not found"
    )
    link.is_active = is_active
    await db.commit()
    await db.refresh(link)
    return LibraryExternalLinkOut.model_validate(link)


# ── LibraryFile ───────────────────────────────────────────────────────────────


async def list_library_files(
    db: AsyncSession,
    library_id: uuid.UUID,
    *,
    public_only: bool = False,
) -> list[LibraryFileOut]:
    """List files for a library."""
    query = (
        LibraryFile.active_query()
        .where(LibraryFile.library_id == library_id)
        .order_by(LibraryFile.sort_order, LibraryFile.title)
    )

    if public_only:
        query = query.where(LibraryFile.is_public.is_(True))

    result = await db.execute(query)
    return [LibraryFileOut.model_validate(f) for f in result.scalars().all()]


async def create_library_file(
    db: AsyncSession,
    library_id: uuid.UUID,
    data: LibraryFileCreate,
) -> LibraryFileOut:
    """Attach a file to a library."""
    await get_library_entity(db, library_id)
    file = LibraryFile(library_id=library_id, **data.model_dump())
    db.add(file)
    await db.commit()
    await db.refresh(file)
    return LibraryFileOut.model_validate(file)


async def delete_library_file(db: AsyncSession, file_id: uuid.UUID) -> None:
    """Soft-delete a library file."""
    file = await LibraryFile.get_or_raise(
        db, file_id, error_message=f"Library file {file_id} not found"
    )
    file.soft_delete()
    await db.commit()


async def get_library_file_library_id(db: AsyncSession, file_id: uuid.UUID) -> uuid.UUID:
    file = await LibraryFile.get_or_raise(
        db, file_id, error_message=f"Library file {file_id} not found"
    )
    return file.library_id
