import os
import asyncio
import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.models import User
from app.services import auth


@pytest.mark.asyncio
async def test_failed_login_accounting_commits_after_request_rollback(monkeypatch):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "main_failed_login_" + uuid.uuid4().hex
    engine = create_async_engine(
        url, pool_size=2, max_overflow=0,
        connect_args={"server_settings": {"search_path": f"{schema},public"}},
    )
    factory = async_sessionmaker(engine, expire_on_commit=False)
    monkeypatch.setattr(auth, "AsyncSessionLocal", factory)
    monkeypatch.setattr(auth._LOGIN_GLOBAL_RATE_LIMITER, "check", AsyncMock())
    monkeypatch.setattr(auth._LOGIN_RATE_LIMITER, "check", AsyncMock())
    user_id = uuid.uuid4()
    try:
        async with engine.begin() as connection:
            await connection.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await connection.run_sync(User.__table__.create)
        async with factory.begin() as db:
            await db.execute(sa.insert(User.__table__).values(
                id=user_id, email="accounting@example.test", password_hash="x", full_name="Test",
                failed_login_attempts=auth.settings.AUTH_LOGIN_MAX_ATTEMPTS - 1,
            ))
        async with factory() as request_db:
            user = SimpleNamespace(id=user_id, is_active=True, is_locked=False, password_hash="x")
            monkeypatch.setattr(auth.UserService, "get_by_email", AsyncMock(return_value=user))
            monkeypatch.setattr(auth, "verify_password", lambda *_args: False)
            with pytest.raises(PermissionError, match="Invalid credentials"):
                await auth.AuthService.login(request_db, "accounting@example.test", "wrong")
            assert engine.pool.checkedout() == 0
            await request_db.rollback()
        async with factory() as verify_db:
            row = (await verify_db.execute(sa.select(User.__table__.c.failed_login_attempts,
                                                     User.__table__.c.locked_until)
                                           .where(User.__table__.c.id == user_id))).one()
            assert row.failed_login_attempts == auth.settings.AUTH_LOGIN_MAX_ATTEMPTS
            assert row.locked_until is not None and row.locked_until > datetime.now(timezone.utc)
        # A second concurrent accounting update increments rather than loses a
        # count and keeps the lockout state durable.
        async with factory() as first, factory() as second:
            user_a = SimpleNamespace(id=user_id)
            user_b = SimpleNamespace(id=user_id)
            await asyncio.gather(
                auth.AuthService._record_failed_login(first, user_a),
                auth.AuthService._record_failed_login(second, user_b),
            )
        async with factory() as verify_db:
            assert await verify_db.scalar(sa.select(User.__table__.c.failed_login_attempts)
                                          .where(User.__table__.c.id == user_id)) == auth.settings.AUTH_LOGIN_MAX_ATTEMPTS + 2
    finally:
        async with engine.begin() as connection:
            await connection.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
        await engine.dispose()
