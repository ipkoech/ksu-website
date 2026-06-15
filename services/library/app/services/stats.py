"""Public-safe aggregate stats for the library landing page."""

from __future__ import annotations

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import (
    ElectronicResource,
    ElectronicResourceGuide,
    Library,
    LibraryFile,
    LibraryInquiry,
    LibraryLoan,
    LibraryRegulation,
    LibraryResource,
    LibraryResourceReservation,
    LibraryService,
    LibraryStatistics,
    LibraryStaff,
    SavedPublication,
    SupportTicket,
)
from ..schemas.stats import PublicStatItem, PublicStatsResponse


async def _count(db: AsyncSession, model, *conditions) -> int:
    result = await db.execute(
        select(func.count(model.id)).where(model.deleted_at.is_(None), *conditions)
    )
    return int(result.scalar_one() or 0)


async def _sum(db: AsyncSession, column, *conditions) -> int:
    result = await db.execute(
        select(func.coalesce(func.sum(column), 0)).where(
            LibraryResource.deleted_at.is_(None),
            *conditions,
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


async def _latest_snapshot(db: AsyncSession) -> LibraryStatistics | None:
    return await db.scalar(
        select(LibraryStatistics)
        .where(LibraryStatistics.deleted_at.is_(None))
        .order_by(desc(LibraryStatistics.period_start), desc(LibraryStatistics.created_at))
        .limit(1)
    )


async def public_library_stats(db: AsyncSession) -> PublicStatsResponse:
    guides_and_files = sum(
        [
            await _count(
                db,
                ElectronicResourceGuide,
                ElectronicResourceGuide.is_active.is_(True),
            ),
            await _count(
                db,
                LibraryFile,
                LibraryFile.is_public.is_(True),
                LibraryFile.access_level == "public",
            ),
            await _count(
                db,
                LibraryRegulation,
                LibraryRegulation.status == "active",
            ),
        ]
    )
    stats = [
        _item(
            "branches",
            "Library Branches",
            await _count(
                db,
                Library,
                Library.is_active.is_(True),
                Library.is_public.is_(True),
            ),
            "Active public library branches",
            "/library/branches",
        ),
        _item(
            "library_resources",
            "Library Resources",
            await _count(
                db,
                LibraryResource,
                LibraryResource.is_active.is_(True),
                LibraryResource.status != "withdrawn",
            ),
            "Active library-facing catalogue resources",
            "/library/resources",
        ),
        _item(
            "available_copies",
            "Available Copies",
            await _sum(
                db,
                LibraryResource.available_copies,
                LibraryResource.is_active.is_(True),
                LibraryResource.status != "withdrawn",
            ),
            "Physical copies currently marked available",
            "/library/resources",
        ),
        _item(
            "electronic_resources",
            "Electronic Resources",
            await _count(
                db,
                ElectronicResource,
                ElectronicResource.is_active.is_(True),
            ),
            "Active electronic databases and platforms",
            "/library/e-resources",
        ),
        _item(
            "library_services",
            "Library Services",
            await _count(
                db,
                LibraryService,
                LibraryService.is_active.is_(True),
                LibraryService.is_public.is_(True),
            ),
            "Active public library services",
            "/library/services",
        ),
        _item(
            "public_guides",
            "Guides & Public Files",
            guides_and_files,
            "Public guides, files, and active regulations",
            "/library/guides",
        ),
    ]

    snapshot = await _latest_snapshot(db)
    if snapshot is not None:
        snapshot_fields = [
            ("snapshot_books", "Books", snapshot.total_books, "Books in the latest library snapshot"),
            ("snapshot_journals", "Journals", snapshot.total_journals, "Journals in the latest library snapshot"),
            ("snapshot_theses", "Theses", snapshot.total_theses, "Theses in the latest library snapshot"),
            ("snapshot_ebooks", "E-books", snapshot.total_ebooks, "E-books in the latest library snapshot"),
            ("snapshot_loans", "Loans", snapshot.total_loans, "Loans in the latest library snapshot"),
            ("snapshot_visits", "Visits", snapshot.total_visits, "Visits in the latest library snapshot"),
        ]
        stats.extend(
            _item(key, label, int(value), description, "/library/statistics")
            for key, label, value, description in snapshot_fields
            if value is not None
        )

    return PublicStatsResponse(
        scope="library",
        title="Library at a glance",
        stats=stats,
    )


async def admin_library_stats(db: AsyncSession) -> PublicStatsResponse:
    """Operational library stats for admin dashboards."""

    latest_snapshot = await _latest_snapshot(db)
    snapshot_books = int(latest_snapshot.total_books or 0) if latest_snapshot else 0
    snapshot_visits = int(latest_snapshot.total_visits or 0) if latest_snapshot else 0

    stats = [
        _item("branches", "Branches", await _count(db, Library), "Library branch records", "/library/branches"),
        _item("active_branches", "Active Branches", await _count(db, Library, Library.is_active.is_(True)), "Active library branch records", "/library/branches"),
        _item("catalogue_resources", "Catalogue Resources", await _count(db, LibraryResource), "Catalogue resource records", "/library/resources"),
        _item("available_resources", "Available Resources", await _count(db, LibraryResource, LibraryResource.status == "available"), "Catalogue resources marked available", "/library/resources"),
        _item("total_copies", "Total Copies", await _sum(db, LibraryResource.total_copies, LibraryResource.is_active.is_(True)), "Total catalogue copies", "/library/resources"),
        _item("available_copies", "Available Copies", await _sum(db, LibraryResource.available_copies, LibraryResource.is_active.is_(True)), "Available catalogue copies", "/library/resources"),
        _item("electronic_resources", "Electronic Resources", await _count(db, ElectronicResource), "Electronic resource records", "/library/electronic"),
        _item("active_electronic_resources", "Active E-resources", await _count(db, ElectronicResource, ElectronicResource.is_active.is_(True)), "Active electronic resources", "/library/electronic"),
        _item("guides", "Guides", await _count(db, ElectronicResourceGuide), "Electronic resource guide records", "/library/guides"),
        _item("services", "Services", await _count(db, LibraryService), "Library service records", "/library/services"),
        _item("staff", "Staff", await _count(db, LibraryStaff), "Library staff records", "/library/staff"),
        _item("public_files", "Public Files", await _count(db, LibraryFile, LibraryFile.is_public.is_(True)), "Public library file records", "/library/files"),
        _item("regulations", "Regulations", await _count(db, LibraryRegulation), "Library regulation records", "/library/regulations"),
        _item("active_regulations", "Active Regulations", await _count(db, LibraryRegulation, LibraryRegulation.status == "active"), "Active regulation records", "/library/regulations"),
        _item("loans", "Loans", await _count(db, LibraryLoan), "Loan records", "/library/circulation"),
        _item("active_loans", "Active Loans", await _count(db, LibraryLoan, LibraryLoan.status.in_(("active", "overdue"))), "Active and overdue loans", "/library/circulation"),
        _item("reservations", "Reservations", await _count(db, LibraryResourceReservation), "Reservation records", "/library/circulation"),
        _item("active_reservations", "Active Reservations", await _count(db, LibraryResourceReservation, LibraryResourceReservation.status.in_(("pending", "ready"))), "Pending and ready reservations", "/library/circulation"),
        _item("inquiries", "Inquiries", await _count(db, LibraryInquiry), "Ask-a-librarian inquiries", "/library/inquiries"),
        _item("open_inquiries", "Open Inquiries", await _count(db, LibraryInquiry, LibraryInquiry.status.in_(("open", "pending"))), "Inquiries awaiting response", "/library/inquiries"),
        _item("tickets", "Support Tickets", await _count(db, SupportTicket), "Library support tickets", "/library/tickets"),
        _item("open_tickets", "Open Tickets", await _count(db, SupportTicket, SupportTicket.status.in_(("open", "in_progress"))), "Library tickets still open", "/library/tickets"),
        _item("saved_publications", "Saved Publications", await _count(db, SavedPublication), "Saved publication records", "/library/publications"),
        _item("snapshot_books", "Snapshot Books", snapshot_books, "Books in the latest statistics snapshot", "/library/statistics"),
        _item("snapshot_visits", "Snapshot Visits", snapshot_visits, "Visits in the latest statistics snapshot", "/library/statistics"),
    ]

    return PublicStatsResponse(
        scope="admin",
        title="Library service operational statistics",
        stats=stats,
    )
