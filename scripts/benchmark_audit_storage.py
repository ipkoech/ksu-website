"""Measure audit storage on opt-in disposable PostgreSQL in a generated schema.

This is a sequential storage microbenchmark, not a production throughput test.
No application schemas are modified. Connection URLs are never printed.
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
    from ksu_common.audit import persist_audit_batch, persist_audit_payload
    from ksu_common.audit_outbox import capture_audit, drain_audit_batch

    schema = "audit_benchmark_" + uuid.uuid4().hex
    engine = create_async_engine(
        os.environ["KSU_TEST_DATABASE_URL"], pool_size=1, max_overflow=0,
        execution_options={"schema_translate_map": {"main": schema}},
    )
    factory = async_sessionmaker(engine, expire_on_commit=False)
    counters = {"statements": 0, "checked_out": 0, "peak_connections": 0}

    @sa.event.listens_for(engine.sync_engine, "before_cursor_execute")
    def statement(*_args):
        counters["statements"] += 1

    @sa.event.listens_for(engine.sync_engine, "checkout")
    def checkout(*_args):
        counters["checked_out"] += 1
        counters["peak_connections"] = max(counters["peak_connections"], counters["checked_out"])

    @sa.event.listens_for(engine.sync_engine, "checkin")
    def checkin(*_args):
        counters["checked_out"] -= 1

    results = {}
    try:
        async with engine.begin() as connection:
            await connection.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await connection.run_sync(AuditLog.__table__.create)
            await connection.run_sync(audit_outbox.create)
        for mode in ("single_event", "preassembled_batches", "durable_capture_and_drain"):
            async with engine.begin() as connection:
                await connection.execute(sa.delete(AuditLog))
            payloads = [{
                "id": str(uuid.uuid4()), "service_name": "main", "action": "benchmark.create",
                "request_method": "POST", "request_path": "/benchmark", "status_code": 200,
                "details": {"request_id": str(uuid.uuid4()), "sample": "synthetic"},
            } for _ in range(count)]
            counters.update(statements=0, peak_connections=0)
            started = perf_counter()
            if mode == "single_event":
                for payload in payloads:
                    await persist_audit_payload(factory, payload, AuditLog, strict=True)
            elif mode == "preassembled_batches":
                for offset in range(0, count, 100):
                    await persist_audit_batch(factory, payloads[offset:offset + 100], AuditLog)
            else:
                for payload in payloads:
                    async with factory.begin() as session:
                        await capture_audit(session, audit_outbox, payload)
                while True:
                    async with factory.begin() as session:
                        drained = await drain_audit_batch(session, audit_outbox, AuditLog)
                    if not drained:
                        break
            measured = {
                "seconds": round(perf_counter() - started, 4),
                "sql_statements_excluding_driver_commits": counters["statements"],
                "peak_connections": counters["peak_connections"],
            }
            async with factory() as session:
                stored = await session.scalar(sa.select(sa.func.count()).select_from(AuditLog))
                pending = await session.scalar(sa.select(sa.func.count()).select_from(audit_outbox))
            assert stored == count and pending == 0, (mode, stored, pending)
            measured.update(stored_events=stored, pending_events=pending)
            results[mode] = measured
    finally:
        async with engine.begin() as connection:
            await connection.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
        await engine.dispose()
    return {"events_per_case": count, "pool_size": 1, "max_overflow": 0,
            "workload": "sequential synthetic audit-only; no HTTP, broker or concurrent business traffic",
            "results": results}


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
    args.output.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
