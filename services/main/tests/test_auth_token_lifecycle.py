import os
import uuid
from unittest.mock import AsyncMock, Mock

import pytest
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import noload
from pydantic import ValidationError

from app.core.config import Settings
from app.models import OutboxEvent, User
from app.services import auth
from app.services import domain_events
from app.security.scopes import ScopedGrant


def test_access_token_ttl_is_bounded_for_downstream_revocation_window():
    with pytest.raises(ValidationError):
        Settings(JWT_ACCESS_TTL_MINUTES=16)


def test_auth_claims_preserve_global_and_local_scope_grants(monkeypatch):
    grants = [
        ScopedGrant(frozenset({"users.view"}), "global", None, "role"),
        ScopedGrant(frozenset({"library.write"}), "library", uuid.uuid4(), "role"),
    ]
    monkeypatch.setattr(auth, "user_scoped_grants", lambda _user: grants)
    claims = auth._active_scope_grants(object())
    assert {claim["scope_type"] for claim in claims} == {"global", "library"}


@pytest.mark.asyncio
async def test_one_time_auth_tokens_are_digested_and_consumed_once(monkeypatch):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "main_auth_tokens_" + uuid.uuid4().hex
    engine = create_async_engine(
        url,
        pool_size=2,
        max_overflow=0,
        connect_args={"server_settings": {"search_path": f"{schema},public"}},
    )
    factory = async_sessionmaker(engine, expire_on_commit=False)
    user_id = uuid.uuid4()
    monkeypatch.setattr(domain_events, "enqueue_celery_after_commit", Mock())
    monkeypatch.setattr(auth._PASSWORD_RESET_GLOBAL_RATE_LIMITER, "check", AsyncMock())
    monkeypatch.setattr(auth._PASSWORD_RESET_EMAIL_RATE_LIMITER, "check", AsyncMock())
    monkeypatch.setattr(auth._PASSWORD_RESET_TOKEN_RATE_LIMITER, "check", AsyncMock())
    monkeypatch.setattr(auth, "hash_password", lambda _password: "new-hash")
    monkeypatch.setattr(auth.AuthService, "logout_all", AsyncMock(return_value=0))

    async def get_user(db, _email):
        return await db.get(User, user_id, options=(noload("*"),))

    monkeypatch.setattr(auth.UserService, "get_by_email", get_user)
    try:
        async with engine.begin() as connection:
            await connection.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await connection.run_sync(User.__table__.create)
            await connection.run_sync(OutboxEvent.__table__.create)
        async with factory.begin() as db:
            await db.execute(sa.insert(User.__table__).values(
                id=user_id,
                email="tokens@example.test",
                password_hash="old-hash",
                full_name="Token Test",
            ))

        async with factory.begin() as db:
            await auth.AuthService.request_password_reset(
                db, "tokens@example.test", frontend_service="web"
            )
        async with factory() as db:
            event = (await db.execute(
                sa.select(OutboxEvent.__table__.c.event_type, OutboxEvent.__table__.c.payload)
                .where(OutboxEvent.__table__.c.event_type == "auth.password_reset_email")
            )).one()
            stored = await db.scalar(sa.select(User.__table__.c.password_reset_token)
                                     .where(User.__table__.c.id == user_id))
        assert event.event_type == "auth.password_reset_email"
        raw_reset_token = event.payload["args"][1]
        assert len(raw_reset_token) > 20
        assert stored == auth._token_digest(raw_reset_token)
        assert stored != raw_reset_token

        async with factory.begin() as db:
            await auth.AuthService.reset_password(db, raw_reset_token, "NewPass1")
        async with factory.begin() as db:
            with pytest.raises(ValueError, match="Invalid or expired"):
                await auth.AuthService.reset_password(db, raw_reset_token, "NewPass1")

        verification_token = "verification-token-value"
        async with factory.begin() as db:
            user = await db.get(User, user_id, options=(noload("*"),))
            user.email_verification_token = auth._token_digest(verification_token)
        async with factory.begin() as db:
            verified = await auth.AuthService.verify_email(db, verification_token)
            assert verified.id == user_id
        async with factory() as db:
            row = (await db.execute(sa.select(User.__table__.c.is_verified,
                                              User.__table__.c.email_verification_token)
                                    .where(User.__table__.c.id == user_id))).one()
            assert row.is_verified is True
            assert row.email_verification_token is None
    finally:
        async with engine.begin() as connection:
            await connection.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
        await engine.dispose()
