"""Celery maintenance tasks for the library service."""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from sqlalchemy import select

from ..core.database import AsyncSessionLocal
from ..models import LibraryLoan, LibraryResourceReservation
from .celery_app import celery_app


async def _expire_reservations() -> int:
    now = datetime.now(timezone.utc)
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(LibraryResourceReservation).where(
                LibraryResourceReservation.deleted_at.is_(None),
                LibraryResourceReservation.status.in_(["pending", "ready"]),
                LibraryResourceReservation.expires_at.is_not(None),
                LibraryResourceReservation.expires_at < now,
            )
        )
        reservations = list(result.scalars().all())
        for reservation in reservations:
            reservation.status = "expired"
        await db.commit()
        return len(reservations)


async def _mark_overdue_loans() -> int:
    now = datetime.now(timezone.utc)
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(LibraryLoan).where(
                LibraryLoan.deleted_at.is_(None),
                LibraryLoan.status == "active",
                LibraryLoan.due_at < now,
                LibraryLoan.returned_at.is_(None),
            )
        )
        loans = list(result.scalars().all())
        for loan in loans:
            loan.status = "overdue"
        await db.commit()
        return len(loans)


@celery_app.task(name="library.maintenance.expire_reservations")
def expire_reservations() -> int:
    return asyncio.run(_expire_reservations())


@celery_app.task(name="library.maintenance.mark_overdue_loans")
def mark_overdue_loans() -> int:
    return asyncio.run(_mark_overdue_loans())
