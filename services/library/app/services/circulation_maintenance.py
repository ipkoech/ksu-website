"""Bounded state transitions shared by scheduled circulation maintenance."""

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import LibraryLoan, LibraryResourceReservation


async def expire_reservations(db: AsyncSession, *, limit: int = 100) -> int:
    now = datetime.now(timezone.utc)
    rows = await db.scalars(
        select(LibraryResourceReservation)
        .where(
            LibraryResourceReservation.deleted_at.is_(None),
            LibraryResourceReservation.status.in_(["pending", "ready"]),
            LibraryResourceReservation.expires_at < now,
        )
        .order_by(LibraryResourceReservation.expires_at, LibraryResourceReservation.id)
        .limit(max(1, min(limit, 500)))
        .with_for_update(skip_locked=True)
        .execution_options(populate_existing=True)
    )
    reservations = list(rows)
    for reservation in reservations:
        reservation.status = "expired"
    await db.flush()
    return len(reservations)


async def mark_overdue_loans(db: AsyncSession, *, limit: int = 100) -> int:
    now = datetime.now(timezone.utc)
    rows = await db.scalars(
        select(LibraryLoan)
        .where(
            LibraryLoan.deleted_at.is_(None),
            LibraryLoan.status == "active",
            LibraryLoan.due_at < now,
            LibraryLoan.returned_at.is_(None),
        )
        .order_by(LibraryLoan.due_at, LibraryLoan.id)
        .limit(max(1, min(limit, 500)))
        .with_for_update(skip_locked=True)
        .execution_options(populate_existing=True)
    )
    loans = list(rows)
    for loan in loans:
        loan.status = "overdue"
    await db.flush()
    return len(loans)
