"""Celery maintenance tasks for the library service."""

from __future__ import annotations

from collections.abc import Awaitable, Callable

from ksu_common.task_queue import run_worker_async
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import AsyncSessionLocal
from ..services import circulation_maintenance
from .celery_app import celery_app


async def _run_batches(command: Callable[[AsyncSession], Awaitable[int]]) -> int:
    total = 0
    # Commit each batch to release locks promptly; a later schedule drains any
    # backlog beyond this bounded run, including rows skipped while locked.
    for _ in range(20):
        async with AsyncSessionLocal.begin() as db:
            changed = await command(db)
        total += changed
        if changed < 100:
            break
    return total


async def _expire_reservations() -> int:
    return await _run_batches(circulation_maintenance.expire_reservations)


async def _mark_overdue_loans() -> int:
    return await _run_batches(circulation_maintenance.mark_overdue_loans)


@celery_app.task(name="library.maintenance.expire_reservations")
def expire_reservations() -> int:
    return run_worker_async(_expire_reservations())


@celery_app.task(name="library.maintenance.mark_overdue_loans")
def mark_overdue_loans() -> int:
    return run_worker_async(_mark_overdue_loans())
