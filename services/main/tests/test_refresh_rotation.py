import asyncio
import os
import uuid
from types import SimpleNamespace

import pytest
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.models import Session, User
from app.services import auth


@pytest.mark.asyncio
async def test_refresh_token_rotates_session_and_rejects_replay(monkeypatch):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "main_refresh_rotation_" + uuid.uuid4().hex
    engine = create_async_engine(
        url,
        pool_size=3,
        max_overflow=0,
        connect_args={"server_settings": {"search_path": f"{schema},public"}},
    )
    factory = async_sessionmaker(engine, expire_on_commit=False)
    user_id = uuid.uuid4()
    old_jti = str(uuid.uuid4())
    concurrent_jti = str(uuid.uuid4())
    issued_jtis: list[str] = []

    async def get_user(_db, _user_id):
        return SimpleNamespace(id=user_id, is_active=True)

    def issue(_user_id, _roles, jti, **_kwargs):
        issued_jtis.append(jti)
        return "access-" + jti, "refresh-" + jti

    monkeypatch.setattr(auth.UserService, "get_by_id", get_user)
    monkeypatch.setattr(auth, "decode_token", lambda token: {
        "type": "refresh", "sub": str(user_id),
        "jti": old_jti if token == "old-token" else concurrent_jti,
    })
    monkeypatch.setattr(auth, "issue_refreshed_tokens", issue)
    monkeypatch.setattr(auth, "_active_roles", lambda _user: ["student"])
    monkeypatch.setattr(auth, "_active_permissions", lambda _user: [])
    monkeypatch.setattr(auth, "_active_scope_grants", lambda _user: [])

    try:
        async with engine.begin() as connection:
            await connection.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await connection.run_sync(User.__table__.create)
            await connection.run_sync(Session.__table__.create)
        async with factory.begin() as db:
            await db.execute(sa.insert(User.__table__).values(
                id=user_id,
                email="refresh@example.test",
                password_hash="x",
                full_name="Refresh Test",
            ))
            await db.execute(sa.insert(Session.__table__).values(
                user_id=user_id,
                jti=old_jti,
                token_type="refresh",
                is_active=True,
            ))
            await db.execute(sa.insert(Session.__table__).values(
                user_id=user_id,
                jti=concurrent_jti,
                token_type="refresh",
                is_active=True,
            ))

        async with factory.begin() as db:
            access, refreshed = await auth.AuthService.refresh_token(db, "old-token")
            assert access.startswith("access-")
            assert refreshed.startswith("refresh-")

        async with factory() as db:
            rows = (await db.execute(
                sa.select(Session.__table__.c.jti, Session.__table__.c.is_active,
                          Session.__table__.c.revoked_reason)
                .where(Session.__table__.c.user_id == user_id)
                .order_by(Session.__table__.c.jti)
            )).all()
            assert len(rows) == 3
            assert any(row.jti == old_jti and not row.is_active
                       and row.revoked_reason == "refresh_rotation" for row in rows)
            assert any(row.jti != old_jti and row.is_active for row in rows)

        async with factory.begin() as db:
            with pytest.raises(PermissionError, match="Session is invalid"):
                await auth.AuthService.refresh_token(db, "old-token")

        # A row lock makes concurrent use of the same refresh token single-use.
        async def concurrent_refresh():
            async with factory.begin() as db:
                return await auth.AuthService.refresh_token(db, "old-token-2")

        results = await asyncio.gather(
            concurrent_refresh(),
            concurrent_refresh(),
            return_exceptions=True,
        )
        assert sum(isinstance(result, tuple) for result in results) == 1
        assert sum(isinstance(result, PermissionError) for result in results) == 1
    finally:
        async with engine.begin() as connection:
            await connection.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
        await engine.dispose()
