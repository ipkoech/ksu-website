"""Real PostgreSQL checks for conflicting canonical circulation commands."""

import asyncio
import os
import uuid
from datetime import datetime, timedelta, timezone

import pytest
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.models import Library, LibraryLoan, LibraryResource, LibraryResourceReservation
from app.schemas import LibraryLoanCreate, LibraryLoanUpdate, LibraryReservationCreate, LibraryReservationUpdate
from app.services.resources import (
    cancel_reservation, create_reservation, issue_loan, renew_loan, return_loan, update_reservation,
)


@pytest.mark.asyncio
async def test_conflicting_issue_renew_and_return_preserve_copy_and_renewal_counts():
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "circulation_" + uuid.uuid4().hex
    engine = create_async_engine(url, pool_size=3, max_overflow=0,
                                 execution_options={"schema_translate_map": {"library": schema}})
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    branch_id, resource_id = uuid.uuid4(), uuid.uuid4()
    now = datetime.now(timezone.utc)

    async def concurrent(command):
        ready = asyncio.Event()
        count = 0

        async def invoke():
            nonlocal count
            async with sessions.begin() as db:
                count += 1
                if count == 2:
                    ready.set()
                await ready.wait()
                return await command(db)

        results = await asyncio.wait_for(asyncio.gather(invoke(), invoke(), return_exceptions=True), 10)
        assert sum(isinstance(result, ValueError) for result in results) == 1, results
        assert not any(isinstance(result, Exception) and not isinstance(result, ValueError) for result in results), results
        return next(result for result in results if not isinstance(result, Exception))

    try:
        async with engine.begin() as connection:
            await connection.execute(sa.text(f"CREATE SCHEMA {schema}"))
            for model in (Library, LibraryResource, LibraryLoan, LibraryResourceReservation):
                await connection.run_sync(model.__table__.create)
        async with sessions.begin() as db:
            await db.execute(sa.insert(Library).values(id=branch_id, name="Test branch", slug="test"))
            await db.execute(sa.insert(LibraryResource).values(
                id=resource_id, library_id=branch_id, title="One copy", total_copies=1, available_copies=1,
            ))
        data = LibraryLoanCreate(resource_id=resource_id, borrower_person_id=uuid.uuid4(),
                                 borrowed_at=now, due_at=now + timedelta(days=7), max_renewals=1)
        loan = await concurrent(lambda db: issue_loan(db, data))
        await concurrent(lambda db: renew_loan(db, loan.id))
        await concurrent(lambda db: return_loan(db, loan.id, LibraryLoanUpdate()))
        async with sessions() as db:
            assert await db.scalar(sa.select(LibraryResource.available_copies)) == 1
            assert await db.scalar(sa.select(LibraryLoan.renewals_count)) == 1
            assert await db.scalar(sa.select(sa.func.count()).select_from(LibraryLoan)) == 1
        person_id = uuid.uuid4()
        async def reserve():
            async with sessions.begin() as db:
                return await create_reservation(db, LibraryReservationCreate(
                    resource_id=resource_id, requester_person_id=person_id,
                ))
        holds = await asyncio.wait_for(asyncio.gather(reserve(), reserve()), 10)
        assert sorted(hold.queue_position for hold in holds) == [1, 2]
        async with sessions.begin() as db:
            with pytest.raises(ValueError, match="occupied"):
                await update_reservation(db, holds[0].id, LibraryReservationUpdate(queue_position=holds[1].queue_position))
            await update_reservation(db, holds[0].id, LibraryReservationUpdate(status="ready"))
        async def finish(status):
            try:
                async with sessions.begin() as db:
                    if status == "cancelled":
                        await cancel_reservation(db, holds[0].id, person_id)
                    else:
                        await update_reservation(db, holds[0].id, LibraryReservationUpdate(status=status))
                return status
            except ValueError:
                return "conflict"
        results = await asyncio.wait_for(asyncio.gather(finish("cancelled"), finish("collected")), 10)
        assert results.count("conflict") == 1
        async with sessions.begin() as db:
            with pytest.raises(ValueError, match="Cannot change"):
                await update_reservation(db, holds[0].id, LibraryReservationUpdate(status="pending"))
            with pytest.raises(PermissionError, match="own reservations"):
                await cancel_reservation(db, holds[1].id, uuid.uuid4())
    finally:
        async with engine.begin() as connection:
            await connection.execute(sa.text(f"DROP SCHEMA {schema} CASCADE"))
        await engine.dispose()
