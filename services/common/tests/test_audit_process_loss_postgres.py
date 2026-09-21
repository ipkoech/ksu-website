"""Verify audit relay recovery after a worker process disappears."""

from __future__ import annotations

import asyncio
import multiprocessing
import os
import uuid

import pytest
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from ksu_common.audit_relay import audit_relay_table, claim_audit_relay


def _claim_then_exit(database_url: str, schema: str) -> None:
    """Claim one row and exit without releasing it, like a lost worker."""

    async def run() -> None:
        engine = create_async_engine(database_url, pool_size=1, max_overflow=0)
        factory = async_sessionmaker(engine)
        table = audit_relay_table(sa.MetaData(), schema=schema)
        async with factory.begin() as db:
            claims = await claim_audit_relay(db, table, lease_seconds=1)
            if len(claims) != 1:
                raise RuntimeError(f"expected one claim, got {len(claims)}")
        await engine.dispose()

    asyncio.run(run())
    os._exit(0)  # noqa: S606 - deliberate process-loss simulation


@pytest.mark.asyncio
async def test_reclaims_audit_lease_after_worker_process_loss():
    database_url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not database_url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")

    schema = "audit_process_loss_" + uuid.uuid4().hex
    engine = create_async_engine(database_url, pool_size=1, max_overflow=0)
    factory = async_sessionmaker(engine)
    table = audit_relay_table(sa.MetaData(), schema=schema)
    event_id = uuid.uuid4()
    try:
        async with engine.begin() as connection:
            await connection.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await connection.run_sync(table.create)
        async with factory.begin() as db:
            await db.execute(table.insert().values(id=event_id, payload={"id": str(event_id)}))

        process = multiprocessing.get_context("spawn").Process(
            target=_claim_then_exit,
            args=(database_url, schema),
        )
        process.start()
        await asyncio.to_thread(process.join, 10)
        assert process.exitcode == 0

        # The one-second lease is database-time based. Leave enough margin for
        # process startup and scheduling before attempting reclamation.
        await asyncio.sleep(1.25)
        async with factory.begin() as db:
            reclaimed = await claim_audit_relay(db, table, lease_seconds=1)
            assert [claim.id for claim in reclaimed] == [event_id]
            assert reclaimed[0].attempt == 2
    finally:
        async with engine.begin() as connection:
            await connection.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
        await engine.dispose()
