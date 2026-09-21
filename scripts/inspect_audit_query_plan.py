"""Capture pending-audit query plans using synthetic, isolated PostgreSQL data."""

import argparse
import asyncio
import json
import os
from pathlib import Path
import uuid

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import create_async_engine

from ksu_common.audit_outbox import audit_outbox_table


def _plan_nodes(value):
    """Yield every PostgreSQL plan node from FORMAT JSON output."""
    if isinstance(value, str):
        value = json.loads(value)
    root = value[0]["Plan"] if isinstance(value, list) else value["Plan"]
    stack = [root]
    while stack:
        node = stack.pop()
        yield node
        stack.extend(node.get("Plans", ()))


def _assert_bounded_plan(value, *, relation: str) -> None:
    nodes = list(_plan_nodes(value))
    sequential = [
        node for node in nodes
        if node.get("Node Type") in {"Seq Scan", "Parallel Seq Scan"}
        and node.get("Relation Name") == relation
    ]
    if sequential:
        raise RuntimeError(
            f"audit query plan scans {relation} sequentially: "
            f"{sequential[0].get('Actual Rows')} rows"
        )
    if not any(node.get("Node Type") in {"Index Scan", "Index Only Scan"} for node in nodes):
        raise RuntimeError(f"audit query plan lost an indexed access path for {relation}")


async def inspect():
    schema = "audit_plan_" + uuid.uuid4().hex
    table = audit_outbox_table(sa.MetaData(), schema=schema)
    engine = create_async_engine(os.environ["KSU_TEST_DATABASE_URL"], pool_size=1, max_overflow=0)
    try:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await conn.run_sync(table.create)
            await conn.execute(sa.text(f"""
                INSERT INTO {schema}.audit_outbox (id, payload, captured_at, failed_at)
                SELECT md5(i::text)::uuid, '{{"action":"synthetic"}}'::jsonb,
                       now() - i * interval '1 second',
                       CASE WHEN i % 10 = 0 THEN NULL ELSE now() END
                FROM generate_series(1, 10000) AS i
            """))
            await conn.execute(sa.text(f"ANALYZE {schema}.audit_outbox"))
        plans = {}
        async with engine.connect() as conn:
            for name, query in {
                "drain_claim": sa.select(table.c.id, table.c.payload)
                    .where(table.c.failed_at.is_(None)).order_by(table.c.captured_at, table.c.id)
                    .limit(100).with_for_update(skip_locked=True),
                "oldest_pending": sa.select(table.c.captured_at)
                    .where(table.c.failed_at.is_(None)).order_by(table.c.captured_at).limit(1),
                }.items():
                sql = str(query.compile(dialect=engine.dialect, compile_kwargs={"literal_binds": True}))
                plans[name] = await conn.scalar(sa.text("EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) " + sql))
                _assert_bounded_plan(plans[name], relation="audit_outbox")
            await conn.rollback()
        return {"workload": "10000 synthetic staging rows: 1000 pending, 9000 retained failures",
                "limitations": "single connection; small metadata; no concurrent load or production distribution",
                "plans": plans}
    finally:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
        await engine.dispose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    if not os.environ.get("KSU_TEST_DATABASE_URL"):
        parser.error("KSU_TEST_DATABASE_URL must name a disposable PostgreSQL database")
    if args.output.exists():
        parser.error("output already exists; preserve prior evidence")
    result = asyncio.run(inspect())
    with args.output.open("x", encoding="utf-8") as output:
        json.dump(result, output, indent=2)
    print("Audit query plans captured; isolated schema removed.")
