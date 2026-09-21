"""Measure the actual shared relay claim statement in a disposable schema."""

import argparse
import asyncio
import json
import os
from pathlib import Path
from types import SimpleNamespace
import uuid

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import create_async_engine

from ksu_common.audit_relay import audit_relay_table, claim_audit_relay


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
            f"relay claim plan scans {relation} sequentially: "
            f"{sequential[0].get('Actual Rows')} rows"
        )
    if not any(node.get("Node Type") == "Tid Scan" for node in nodes):
        raise RuntimeError("relay claim plan lost its bounded Tid Scan update")


async def inspect(rows=10000):
    schema = "relay_plan_" + uuid.uuid4().hex
    table = audit_relay_table(sa.MetaData(), schema=schema)
    engine = create_async_engine(os.environ["KSU_TEST_DATABASE_URL"], pool_size=1, max_overflow=0)
    statements = []

    async def capture(statement):
        statements.append(statement)
        return SimpleNamespace(all=lambda: [])

    await claim_audit_relay(SimpleNamespace(execute=capture), table)
    assert len(statements) == 1
    compiled = statements[0].compile(dialect=engine.dialect)
    sql = str(compiled)
    parameters = tuple(compiled.params[name] for name in compiled.positiontup)
    plans = {}
    try:
        async with engine.begin() as connection:
            await connection.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await connection.run_sync(table.create)
            await connection.execute(sa.text(f"""
                INSERT INTO {schema}.audit_relay (id, payload, available_at)
                SELECT md5(i::text)::uuid,
                       jsonb_build_object('id', md5(i::text), 'action', 'synthetic'),
                       CASE WHEN i <= 1000 THEN now() - interval '10 minutes'
                            ELSE now() + interval '10 minutes' END
                FROM generate_series(1, {rows}) AS i
            """))
            await connection.execute(sa.text(f"ANALYZE {schema}.audit_relay"))
        for name in ("small_metadata", "large_metadata_with_oversized_event"):
            if name != "small_metadata":
                async with engine.begin() as connection:
                    await connection.execute(sa.text(f"""
                        UPDATE {schema}.audit_relay
                        SET payload = payload || jsonb_build_object('details', repeat('x', 60000), 'changes', repeat('y', 60000))
                        WHERE available_at < now()
                    """))
                    await connection.execute(sa.text(f"""
                        UPDATE {schema}.audit_relay
                        SET payload = payload || jsonb_build_object('unexpected', repeat('z', 2097152)),
                            available_at = now() - interval '20 minutes'
                        WHERE id = md5('1')::uuid
                    """))
                    await connection.execute(sa.text(f"ANALYZE {schema}.audit_relay"))
            async with engine.connect() as connection:
                result = await connection.exec_driver_sql("EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) " + sql, parameters)
                plans[name] = result.scalar_one()
                _assert_bounded_plan(plans[name], relation="audit_relay")
                await connection.rollback()
        return {
            "workload": f"{rows} synthetic relay rows: 1000 eligible, {rows - 1000} deferred; claim limit 100",
            "limitations": "single warm-cache connection; compressible metadata; no concurrent HTTP/broker traffic; no production capacity claim",
            "plans": plans,
        }
    finally:
        try:
            async with engine.begin() as connection:
                await connection.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
        finally:
            await engine.dispose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    parser.add_argument("--rows", type=int, default=10000)
    args = parser.parse_args()
    if not os.environ.get("KSU_TEST_DATABASE_URL"):
        parser.error("KSU_TEST_DATABASE_URL must name disposable PostgreSQL")
    if args.output.exists():
        parser.error("output exists; preserve prior evidence")
    if not 10000 <= args.rows <= 100000:
        parser.error("--rows must be between 10000 and 100000")
    result = asyncio.run(inspect(args.rows))
    with args.output.open("x", encoding="utf-8") as output:
        json.dump(result, output, indent=2)
    print("Relay plans captured; disposable schema removed.")
