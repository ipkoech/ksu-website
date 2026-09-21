"""PostgreSQL maintenance locking, bounded batches, and terminal-state checks."""

import asyncio
import os
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import pytest
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.models import Library, LibraryLoan, LibraryResource, LibraryResourceReservation
from app.services.circulation_maintenance import expire_reservations, mark_overdue_loans


@pytest.mark.asyncio
async def test_maintenance_skips_inflight_commands_and_preserves_completed_states(monkeypatch):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "maintenance_" + uuid4().hex
    engine = create_async_engine(url, execution_options={"schema_translate_map": {"library": schema}})
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    branch, resource, loan, reservation = (uuid4() for _ in range(4))
    past = datetime.now(timezone.utc) - timedelta(days=2)
    try:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
            for model in (Library, LibraryResource, LibraryLoan, LibraryResourceReservation):
                await conn.run_sync(model.__table__.create)
        async with sessions.begin() as db:
            await db.execute(sa.insert(Library).values(id=branch, name="Test", slug="test"))
            await db.execute(sa.insert(LibraryResource).values(id=resource, library_id=branch, title="Test"))
            await db.execute(sa.insert(LibraryLoan).values(
                id=loan, resource_id=resource, borrower_person_id=uuid4(),
                borrowed_at=past, due_at=past, status="active",
            ))
            await db.execute(sa.insert(LibraryResourceReservation).values(
                id=reservation, resource_id=resource, requester_person_id=uuid4(),
                status="ready", expires_at=past,
            ))
        async with sessions.begin() as command:
            held_loan = await command.scalar(sa.select(LibraryLoan).with_for_update())
            held_reservation = await command.scalar(sa.select(LibraryResourceReservation).with_for_update())
            async with sessions.begin() as maintenance:
                assert await asyncio.wait_for(mark_overdue_loans(maintenance), 2) == 0
                assert await asyncio.wait_for(expire_reservations(maintenance), 2) == 0
            held_loan.status = "returned"
            held_loan.returned_at = datetime.now(timezone.utc)
            held_reservation.status = "collected"
        async with sessions.begin() as db:
            assert await mark_overdue_loans(db) == 0
            assert await expire_reservations(db) == 0
            assert await db.scalar(sa.select(LibraryLoan.status)) == "returned"
            assert await db.scalar(sa.select(LibraryResourceReservation.status)) == "collected"
            for _ in range(3):
                await db.execute(sa.insert(LibraryLoan).values(
                    resource_id=resource, borrower_person_id=uuid4(),
                    borrowed_at=past, due_at=past, status="active",
                ))
                await db.execute(sa.insert(LibraryResourceReservation).values(
                    resource_id=resource, requester_person_id=uuid4(), status="pending", expires_at=past,
                ))
        async with sessions.begin() as db:
            assert await mark_overdue_loans(db, limit=2) == 2
            assert await expire_reservations(db, limit=2) == 2
        from app.tasks import maintenance
        monkeypatch.setattr(maintenance, "AsyncSessionLocal", sessions)
        assert await maintenance._mark_overdue_loans() == 1
        assert await maintenance._expire_reservations() == 1
        assert await maintenance._mark_overdue_loans() == 0
        assert await maintenance._expire_reservations() == 0
    finally:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"DROP SCHEMA {schema} CASCADE"))
        await engine.dispose()
