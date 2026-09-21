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
async def test_mfa_migration_preserves_legacy_credentials_without_granting_assurance(monkeypatch):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "mfa_migration_" + uuid4().hex
    engine = create_async_engine(url, pool_size=1, max_overflow=0)
    path = Path(__file__).parents[1] / "migrations/versions/20260907_0012_mfa_assurance.py"
    spec = importlib.util.spec_from_file_location("mfa_migration", path)
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    try:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await conn.execute(sa.text(f"SET LOCAL search_path TO {schema}"))
            await conn.execute(sa.text("CREATE TABLE users (id integer PRIMARY KEY, mfa_enabled boolean, mfa_secret text)"))
            await conn.execute(sa.text("CREATE TABLE sessions (id integer PRIMARY KEY)"))
            await conn.execute(sa.text("INSERT INTO users VALUES (1, true, 'synthetic-legacy-value')"))
            await conn.execute(sa.text("INSERT INTO sessions VALUES (1)"))

            def upgrade(sync):
                monkeypatch.setattr(migration, "op", Operations(MigrationContext.configure(sync)))
                migration.upgrade()

            await conn.run_sync(upgrade)
            row = (await conn.execute(sa.text("SELECT mfa_enabled, mfa_secret, mfa_recovery_hashes, mfa_pending_secret FROM users"))).one()
            assert tuple(row) == (True, "synthetic-legacy-value", None, None)
            assert await conn.scalar(sa.text("SELECT mfa_verified_at FROM sessions")) is None
            await conn.run_sync(lambda _: migration.downgrade())
            assert await conn.scalar(sa.text("SELECT mfa_secret FROM users")) == "synthetic-legacy-value"
            await conn.execute(sa.text(f"DROP SCHEMA {schema} CASCADE"))
    finally:
        await engine.dispose()
