import importlib.util
import os
from pathlib import Path
from uuid import uuid4

import pytest
import sqlalchemy as sa
from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy.ext.asyncio import create_async_engine


@pytest.mark.asyncio
async def test_editorial_state_migration_preserves_visibility_and_persists_submission(monkeypatch):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    path = Path(__file__).parents[1] / "migrations/versions/20260907_0015_editorial_state.py"
    spec = importlib.util.spec_from_file_location("editorial_migration", path)
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    engine = create_async_engine(url, pool_size=1, max_overflow=0)
    schema = "editorial_" + uuid4().hex
    try:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await conn.execute(sa.text(f"SET LOCAL search_path TO {schema}"))
            for table, visibility in migration.TABLES.items():
                await conn.execute(sa.text(f"CREATE TABLE {table} (id integer PRIMARY KEY, {visibility} boolean)"))
                await conn.execute(sa.text(f"INSERT INTO {table} VALUES (1, true), (2, false)"))

            def upgrade(sync):
                monkeypatch.setattr(migration, "op", Operations(MigrationContext.configure(sync)))
                migration.upgrade()

            await conn.run_sync(upgrade)
            for table in migration.TABLES:
                assert (await conn.execute(sa.text(f"SELECT editorial_state FROM {table} ORDER BY id"))).scalars().all() == ["published", "draft"]
                await conn.execute(sa.text(f"UPDATE {table} SET editorial_state='pending' WHERE id=2"))
                assert await conn.scalar(sa.text(f"SELECT editorial_state FROM {table} WHERE id=2")) == "pending"
                with pytest.raises(sa.exc.IntegrityError):
                    async with conn.begin_nested():
                        await conn.execute(sa.text(f"UPDATE {table} SET editorial_state='invalid' WHERE id=2"))
            await conn.execute(sa.text(f"DROP SCHEMA {schema} CASCADE"))
    finally:
        await engine.dispose()
