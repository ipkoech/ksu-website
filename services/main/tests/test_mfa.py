import asyncio
import base64
import os
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest
import sqlalchemy as sa
from cryptography.fernet import Fernet
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.models import Session, User
from app.services import mfa
from app.services import auth


@pytest.mark.asyncio
@pytest.mark.parametrize("code", [None, "123456"])
async def test_enrolled_login_requires_proof_before_issuing_session(monkeypatch, code):
    user = SimpleNamespace(id=uuid4(), is_active=True, is_locked=False, password_hash="password", mfa_enabled=True)
    monkeypatch.setattr(auth.UserService, "get_by_email", AsyncMock(return_value=user))
    monkeypatch.setattr(auth, "verify_password", lambda *_: True)
    monkeypatch.setattr(auth._LOGIN_GLOBAL_RATE_LIMITER, "check", AsyncMock())
    monkeypatch.setattr(auth._LOGIN_RATE_LIMITER, "check", AsyncMock())
    for name in ("_active_roles", "_active_permissions", "_active_scope_grants"):
        monkeypatch.setattr(auth, name, lambda _: [])
    issued = Mock(return_value=("access", "refresh", "session"))
    monkeypatch.setattr(auth, "create_token", issued)
    verified = datetime.now(timezone.utc)
    proof = AsyncMock(return_value=verified)
    monkeypatch.setattr(mfa, "verify_factor", proof)
    db = AsyncMock()
    db.add = Mock()
    if code is None:
        with pytest.raises(HTTPException) as denied:
            await auth.AuthService.login(db, "mfa@example.test", "password")
        assert denied.value.status_code == 401
        issued.assert_not_called()
        db.add.assert_not_called()
    else:
        await auth.AuthService.login(db, "mfa@example.test", "password", mfa_code=code)
        proof.assert_awaited_once_with(db, user.id, code)
        assert db.add.call_args.args[0].mfa_verified_at == verified


@pytest.mark.parametrize("timestamp,expected", [
    (59, "94287082"), (1111111109, "07081804"), (1111111111, "14050471"),
    (1234567890, "89005924"), (2000000000, "69279037"), (20000000000, "65353130"),
])
def test_rfc6238_sha1_vectors(timestamp, expected):
    secret = base64.b32encode(b"12345678901234567890").decode()
    assert mfa.totp(secret, timestamp // 30, digits=8) == expected


def test_totp_rejects_replay_and_outside_drift_window():
    secret = base64.b32encode(b"12345678901234567890").decode()
    now = datetime.fromtimestamp(1234567890, timezone.utc)
    counter = int(now.timestamp()) // 30
    code = mfa.totp(secret, counter)
    assert mfa.matching_counter(secret, code, now) == counter
    assert mfa.matching_counter(secret, code, now, counter) is None
    assert mfa.matching_counter(secret, mfa.totp(secret, counter - 2), now) is None


@pytest.mark.asyncio
async def test_enrollment_recovery_and_concurrent_proof_consumption(monkeypatch):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "mfa_" + uuid4().hex
    engine = create_async_engine(url, pool_size=2, max_overflow=0,
                                 connect_args={"server_settings": {"search_path": f"{schema},public"}})
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    user_id = uuid4()
    key = Fernet.generate_key().decode()
    monkeypatch.setattr(mfa, "get_settings", lambda: SimpleNamespace(MFA_ENCRYPTION_KEY=key))
    monkeypatch.setattr(mfa._LIMITER, "check", AsyncMock())
    monkeypatch.setattr(mfa, "verify_password", lambda password, stored: password == stored)
    try:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await conn.run_sync(User.__table__.create)
            await conn.run_sync(Session.__table__.create)
            await conn.execute(sa.insert(User).values(id=user_id, email="mfa@example.test", password_hash="password",
                                                     full_name="MFA Test"))
            await conn.execute(sa.insert(Session), [
                {"id": uuid4(), "user_id": user_id, "jti": "current", "token_type": "refresh", "is_active": True},
                {"id": uuid4(), "user_id": user_id, "jti": "other", "token_type": "refresh", "is_active": True},
            ])
        async with sessions.begin() as db:
            enrollment = await mfa.begin_enrollment(db, user_id, "password")
            encrypted = await db.scalar(sa.select(User.mfa_pending_secret))
            assert encrypted != enrollment["secret"]
        now = datetime.now(timezone.utc)
        counter = int(now.timestamp()) // 30
        async with sessions.begin() as db:
            codes = await mfa.confirm_enrollment(db, user_id, mfa.totp(enrollment["secret"], counter))
            hashes = await db.scalar(sa.select(User.mfa_recovery_hashes))
            assert len(codes) == 10 and all(value not in hashes for value in codes)
        async with sessions.begin() as db:
            await mfa.verify_factor(db, user_id, codes[0])
        with pytest.raises(HTTPException) as replay:
            async with sessions.begin() as db:
                await mfa.verify_factor(db, user_id, codes[0])
        assert replay.value.status_code == 401
        # The next counter is within allowed clock drift and was not consumed
        # by enrollment. Two independent transactions must not both accept it.
        async def attempt():
            try:
                async with sessions.begin() as db:
                    await mfa.verify_factor(db, user_id, mfa.totp(enrollment["secret"], counter + 1))
                return "accepted"
            except HTTPException as exc:
                return exc.status_code
        results = await asyncio.gather(attempt(), attempt())
        assert results.count("accepted") == 1 and results.count(401) == 1
        async with sessions.begin() as db:
            previous_secret = await db.scalar(sa.select(User.mfa_secret))
            replacement = await mfa.begin_enrollment(db, user_id, "password", current_code=codes[1])
            assert await db.scalar(sa.select(User.mfa_secret)) == previous_secret
            assert await db.scalar(sa.select(User.mfa_enabled)) is True
        async with sessions.begin() as db:
            new_codes = await mfa.confirm_session_enrollment(
                db, user_id, "current", mfa.totp(replacement["secret"], int(datetime.now(timezone.utc).timestamp()) // 30))
        async with sessions() as db:
            assert await db.scalar(sa.select(Session.is_active).where(Session.jti == "other")) is False
            assert await db.scalar(sa.select(Session.mfa_verified_at).where(Session.jti == "current")) is not None
        with pytest.raises(HTTPException):
            async with sessions.begin() as db:
                await mfa.verify_factor(db, user_id, codes[3])
        # A revoked session must not consume a recovery code on rollback.
        with pytest.raises(HTTPException):
            async with sessions.begin() as db:
                await mfa.step_up_session(db, user_id, "other", "password", new_codes[0])
        async with sessions.begin() as db:
            await mfa.step_up_session(db, user_id, "current", "password", new_codes[0])
        with pytest.raises(HTTPException):
            async with sessions.begin() as db:
                await mfa.step_up_session(db, user_id, "current", "password", new_codes[0])
    finally:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"DROP SCHEMA {schema} CASCADE"))
        await engine.dispose()
