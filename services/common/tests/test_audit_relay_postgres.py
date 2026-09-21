import os
import json
import httpx
import uuid

import pytest
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from ksu_common.audit_outbox import capture_audit, limit_audit_transaction
from ksu_common.audit_relay import (
    acknowledge_audit_relay, audit_relay_table, claim_audit_relay, release_audit_relay,
    relay_audit_batch,
)


@pytest.mark.asyncio
async def test_relay_claims_release_connections_and_fence_stale_workers():
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "audit_relay_probe_" + uuid.uuid4().hex
    engine = create_async_engine(url, pool_size=2, max_overflow=0)
    factory = async_sessionmaker(engine)
    table = audit_relay_table(sa.MetaData(), schema=schema)
    try:
        async with engine.begin() as connection:
            await connection.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await connection.run_sync(table.create)
        async with factory.begin() as db:
            for _ in range(3):
                await capture_audit(db, table, {"id": str(uuid.uuid4()), "action": "probe"})
        async with factory() as owner:
            owner_key = "audit-relay-probe." + schema
            assert await limit_audit_transaction(owner, owner_key=owner_key)
            sent = False

            async def should_not_send(_batch):
                nonlocal sent
                sent = True

            # A duplicate scheduler tick exits before claiming or sending,
            # while the first short ownership transaction is still open.
            assert await relay_audit_batch(factory, table, should_not_send, owner_key=owner_key) == 0
            assert not sent
            await owner.rollback()
        async with factory() as first, factory() as second:
            old = await claim_audit_relay(first, table, limit=2)
            other = await claim_audit_relay(second, table, limit=2)
            assert len(old) == 2 and len(other) == 1
            assert {claim.id for claim in old}.isdisjoint(claim.id for claim in other)
            await first.commit()
            await second.commit()
        # Network delivery can occur here with no checked-out connection.
        assert engine.pool.checkedout() == 0
        async with factory.begin() as db:
            assert await claim_audit_relay(db, table) == []
            await db.execute(sa.update(table).where(table.c.id.in_([claim.id for claim in old]))
                             .values(available_at=sa.func.now()))
        async with factory.begin() as db:
            fresh = await claim_audit_relay(db, table)
            assert {claim.id for claim in fresh} == {claim.id for claim in old}
            assert all(claim.attempt == 2 for claim in fresh)
            assert await acknowledge_audit_relay(db, table, old) == 0
            assert await release_audit_relay(db, table, old, permanent=True) == 0
            assert await acknowledge_audit_relay(db, table, fresh) == 2
            assert await release_audit_relay(db, table, other, retry_seconds=60) == 1
            assert await claim_audit_relay(db, table) == []
            await db.execute(sa.update(table).values(available_at=sa.func.now()))
        async with factory() as db:
            final = await claim_audit_relay(db, table)
            await db.rollback()
        async with factory.begin() as db:
            reclaimed = await claim_audit_relay(db, table)
            assert reclaimed[0].attempt == final[0].attempt
            assert await release_audit_relay(db, table, reclaimed, permanent=True) == 1
            assert await claim_audit_relay(db, table) == []
            retained = (await db.execute(sa.select(table))).one()
            assert retained.failed_at is not None and retained.payload["id"] == str(retained.id)
            # Simulate repeated worker loss through committed claims whose
            # leases expire, without invoking the normal failure handler.
            await db.execute(sa.update(table).values(failed_at=None, failure_code=None,
                                                     attempts=0, available_at=sa.func.now()))
        for attempt in range(1, 7):
            async with factory.begin() as db:
                lost = await claim_audit_relay(db, table)
                assert len(lost) == 1 and lost[0].attempt == attempt
                await db.execute(sa.update(table).values(available_at=sa.func.now()))
        async with factory.begin() as db:
            assert await claim_audit_relay(db, table) == []
            assert await acknowledge_audit_relay(db, table, lost) == 0
            exhausted = (await db.execute(sa.select(table))).one()
            assert exhausted.attempts == 6
            assert exhausted.failure_code == "attempts_exhausted"
            assert exhausted.failed_at is not None and exhausted.claim_token is None
            assert exhausted.payload == retained.payload
        huge_id = uuid.uuid4()
        healthy_id = uuid.uuid4()
        async with factory.begin() as db:
            await db.execute(table.insert(), [
                {"id": huge_id, "payload": {"id": str(huge_id), "unexpected": "x" * (2 * 1024 * 1024)}},
                {"id": healthy_id, "payload": {"id": str(healthy_id)}},
            ])
        async with factory.begin() as db:
            bounded = await claim_audit_relay(db, table)
            assert [claim.id for claim in bounded] == [healthy_id]
            oversized = (await db.execute(sa.select(table.c.failure_code, table.c.attempts,
                                                    sa.func.length(table.c.payload["unexpected"].astext))
                                          .where(table.c.id == huge_id))).one()
            assert tuple(oversized) == ("payload_too_large", 0, 2 * 1024 * 1024)
    finally:
        try:
            async with engine.begin() as connection:
                await connection.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
        finally:
            await engine.dispose()


@pytest.mark.asyncio
@pytest.mark.parametrize("failure_status,cooldown", [(None, 120), (429, 120), (422, 120), (429, 86401)])
async def test_relay_delivers_byte_bounded_batches_without_database_connections(failure_status, cooldown):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "audit_relay_delivery_" + uuid.uuid4().hex
    engine = create_async_engine(url, pool_size=1, max_overflow=0)
    factory = async_sessionmaker(engine)
    table = audit_relay_table(sa.MetaData(), schema=schema)
    received = []
    payloads = [{"id": str(uuid.uuid4()), "details": "x" * 60000, "changes": "y" * 60000}
                for _ in range(5)]

    async def send(batch):
        assert engine.pool.checkedout() == 0
        assert len(json.dumps({"events": batch}, sort_keys=True, separators=(",", ":")).encode()) <= 256 * 1024
        received.extend(event["id"] for event in batch)

    async def unavailable(batch):
        assert engine.pool.checkedout() == 0
        if failure_status:
            response = httpx.Response(failure_status, headers={"Retry-After": str(cooldown)},
                                      request=httpx.Request("POST", "https://main.example.edu/audit/batch"))
            response.raise_for_status()
        raise ConnectionError("receiver unavailable")

    try:
        async with engine.begin() as connection:
            await connection.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await connection.run_sync(table.create)
        async with factory.begin() as db:
            for payload in payloads:
                await capture_audit(db, table, payload)
            await db.execute(sa.insert(table).values(id=uuid.uuid4(), payload=[]))
        with pytest.raises(httpx.HTTPStatusError if failure_status else ConnectionError):
            await relay_audit_batch(factory, table, unavailable)
        async with factory.begin() as db:
            assert await db.scalar(sa.select(sa.func.count()).select_from(table)) == 6
            live = (
                await db.execute(sa.select(table).where(table.c.id.in_([uuid.UUID(p["id"]) for p in payloads])))
            ).all()
            assert sorted(row.attempts for row in live) == [0, 0, 0, 1, 1]
            assert all(row.claim_token is None for row in live)
            expected_retained = 5 if cooldown > 86400 else (2 if failure_status == 422 else 0)
            assert sum(row.failed_at is not None for row in live) == expected_retained
            if failure_status == 429 and cooldown <= 86400:
                assert await db.scalar(sa.select(sa.func.min(sa.func.extract("epoch", table.c.available_at - sa.func.now())))
                                       .where(table.c.failed_at.is_(None))) > 115
            # Explicit operator repair of receiver-rejected records for replay.
            await db.execute(sa.update(table).where(table.c.id.in_([uuid.UUID(p["id"]) for p in payloads]))
                             .values(failed_at=None, failure_code=None))
            await db.execute(sa.update(table).values(available_at=sa.func.now()))
        assert await relay_audit_batch(factory, table, send) == 5
        assert sorted(received) == sorted(payload["id"] for payload in payloads)
        async with factory() as db:
            retained = (await db.execute(sa.select(table))).one()
            assert retained.payload == [] and retained.failed_at is not None
    finally:
        try:
            async with engine.begin() as connection:
                await connection.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
        finally:
            await engine.dispose()
