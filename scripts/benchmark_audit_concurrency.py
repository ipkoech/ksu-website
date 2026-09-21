"""Exercise concurrent audit capture/draining on explicit disposable PostgreSQL.

Creates and removes only a random schema. This is synthetic storage contention,
not an HTTP capacity estimate. Connection URLs are never included in results.
"""

import argparse
import asyncio
import json
import os
from pathlib import Path
import sys
from time import perf_counter
import uuid

from ci_environment import REPO, service_environment


async def benchmark(count):
    import sqlalchemy as sa
    from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
    from app.models import AuditLog, audit_outbox
    from ksu_common.audit_outbox import capture_audit, drain_audit_batch, limit_audit_transaction

    schema = "audit_concurrency_" + uuid.uuid4().hex
    engines = {}
    counters = {}
    for name, size in (("capture", 4), ("drain", 1)):
        engine = create_async_engine(
            os.environ["KSU_TEST_DATABASE_URL"], pool_size=size, max_overflow=0,
            pool_timeout=10,
            execution_options={"schema_translate_map": {"main": schema}},
        )
        engines[name] = engine
        stats = counters[name] = {"statements": 0, "checked_out": 0, "peak_connections": 0}

        def statement(*_args, stats=stats):
            stats["statements"] += 1

        def checkout(*_args, stats=stats):
            stats["checked_out"] += 1
            stats["peak_connections"] = max(stats["peak_connections"], stats["checked_out"])

        def checkin(*_args, stats=stats):
            stats["checked_out"] -= 1

        sa.event.listen(engine.sync_engine, "before_cursor_execute", statement)
        sa.event.listen(engine.sync_engine, "checkout", checkout)
        sa.event.listen(engine.sync_engine, "checkin", checkin)

    capture_factory = async_sessionmaker(engines["capture"])
    drain_factory = async_sessionmaker(engines["drain"])
    payloads = [{
        "id": str(uuid.uuid4()), "service_name": "main", "action": "benchmark.create",
        "request_method": "POST", "request_path": "/benchmark", "status_code": 200,
        "details": {"sample": "synthetic"},
    } for _ in range(count)]
    remaining = iter(payloads)
    latencies = []
    batches = []
    captured = transferred = peak_backlog = 0
    producers_done = asyncio.Event()
    started = perf_counter()

    async def producer():
        nonlocal captured, peak_backlog
        for payload in remaining:
            before = perf_counter()
            async with capture_factory.begin() as session:
                await capture_audit(session, audit_outbox, payload)
            latencies.append((perf_counter() - before) * 1000)
            captured += 1
            peak_backlog = max(peak_backlog, captured - transferred)

    async def producers():
        async with asyncio.TaskGroup() as group:
            for _ in range(20):
                group.create_task(producer())
        producers_done.set()

    async def drain():
        nonlocal transferred
        while True:
            async with drain_factory.begin() as session:
                assert await limit_audit_transaction(session, owner_key=schema + ".drain")
                amount = await drain_audit_batch(session, audit_outbox, AuditLog)
            transferred += amount
            batches.append(amount)
            if producers_done.is_set() and transferred == count:
                return
            await asyncio.sleep(1)

    try:
        async with engines["capture"].begin() as connection:
            await connection.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await connection.run_sync(AuditLog.__table__.create)
            await connection.run_sync(audit_outbox.create)
        for stats in counters.values():
            stats.update(statements=0, peak_connections=0)
        started = perf_counter()
        async with asyncio.timeout(300):
            async with asyncio.TaskGroup() as group:
                group.create_task(producers())
                group.create_task(drain())
        elapsed = perf_counter() - started
        measured = {name: dict(stats) for name, stats in counters.items()}
        async with capture_factory() as session:
            stored = set((await session.scalars(sa.select(AuditLog.id))).all())
            pending = await session.scalar(sa.select(sa.func.count()).select_from(audit_outbox))
        assert stored == {uuid.UUID(payload["id"]) for payload in payloads}
        assert pending == 0 and captured == transferred == count
        assert measured["capture"]["peak_connections"] <= 4
        assert measured["drain"]["peak_connections"] <= 1
        assert all(stats["checked_out"] == 0 for stats in measured.values())
        latencies.sort()
        return {
            "workload": "20 concurrent synthetic audit producers; separate 4/1 connection pools; one drain per second",
            "limitations": "No HTTP, broker, business queries or production traffic; sampled logical backlog uses client-observed commits",
            "events": count, "seconds": round(elapsed, 4),
            "stored_events": len(stored), "pending_events": pending,
            "peak_client_observed_backlog": peak_backlog,
            "capture_transaction_ms_including_pool_wait": {
                "p50": round(latencies[(len(latencies) - 1) // 2], 3),
                "p95": round(latencies[int((len(latencies) - 1) * .95)], 3),
                "max": round(latencies[-1], 3),
            },
            "drain_batch_sizes": batches,
            "pools_and_sql_excluding_driver_commits": measured,
        }
    finally:
        try:
            async with engines["capture"].begin() as connection:
                await connection.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
        finally:
            for engine in engines.values():
                await engine.dispose()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    parser.add_argument("--events", type=int, default=1000)
    args = parser.parse_args()
    if not os.environ.get("KSU_TEST_DATABASE_URL"):
        parser.error("KSU_TEST_DATABASE_URL must explicitly name disposable PostgreSQL")
    if not 100 <= args.events <= 10000:
        parser.error("--events must be between 100 and 10000")
    if args.output.exists():
        parser.error("output already exists; preserve earlier benchmark evidence")
    os.environ.update(service_environment("main"))
    sys.path.insert(0, str(REPO / "services/main"))
    result = asyncio.run(benchmark(args.events))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("x", encoding="utf-8") as output:
        output.write(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
