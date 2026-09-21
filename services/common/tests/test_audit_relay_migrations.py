import importlib.util
import os
from pathlib import Path
import uuid

from alembic.migration import MigrationContext
from alembic.operations import Operations
import pytest
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import create_async_engine

from ksu_common.audit_relay import audit_relay_table


@pytest.mark.asyncio
@pytest.mark.parametrize("service,filename", [
    ("research", "20260906_0013_add_audit_relay.py"),
    ("library", "20260906_0011_add_audit_relay.py"),
    ("heri_africa", "0010_audit_relay.py"),
])
async def test_audit_relay_migration_preserves_pending_and_retained_events(service, filename):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = service + "_relay_migration_" + uuid.uuid4().hex
    path = Path(__file__).parents[2] / service / "migrations/versions" / filename
    spec = importlib.util.spec_from_file_location("relay_migration_probe", path)
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    migration.SCHEMA = schema
    engine = create_async_engine(url, pool_size=1, max_overflow=0)
    table = audit_relay_table(sa.MetaData(), schema=schema)

    def migrate(connection, action):
        with Operations.context(MigrationContext.configure(connection)):
            getattr(migration, action)()

    try:
        async with engine.begin() as connection:
            await connection.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await connection.run_sync(migrate, "upgrade")
            columns = await connection.run_sync(lambda c: sa.inspect(c).get_columns("audit_relay", schema=schema))
            assert {column["name"] for column in columns} == set(table.c.keys())
            indexes = await connection.run_sync(lambda c: sa.inspect(c).get_indexes("audit_relay", schema=schema))
            assert {index["name"] for index in indexes} == {index.name for index in table.indexes}
            await connection.execute(table.insert().values(id=uuid.uuid4(), payload={"sample": "synthetic"}))
        for retained in (False, True):
            if retained:
                async with engine.begin() as connection:
                    await connection.execute(table.update().values(failed_at=sa.func.now(), failure_code="probe"))
            with pytest.raises(RuntimeError, match="drain or repair"):
                async with engine.begin() as connection:
                    await connection.run_sync(migrate, "downgrade")
        async with engine.begin() as connection:
            await connection.execute(table.delete())
            await connection.run_sync(migrate, "downgrade")
            assert not await connection.run_sync(lambda c: sa.inspect(c).has_table("audit_relay", schema=schema))
    finally:
        try:
            async with engine.begin() as connection:
                await connection.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
        finally:
            await engine.dispose()
