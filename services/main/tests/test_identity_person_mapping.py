"""Exercise introspection's person lookup through HTTP and real PostgreSQL."""

import os
from types import SimpleNamespace
from uuid import uuid4

import httpx
import pytest
import sqlalchemy as sa
from fastapi import FastAPI
from ksu_common.auth import TokenPayload
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.api.v1 import internal_router  # noqa: F401 - initialize the application router package
from app.routes.v1 import internal


@pytest.mark.asyncio
async def test_introspection_only_returns_current_active_linked_person(monkeypatch):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "identity_person_" + uuid4().hex
    engine = create_async_engine(url, connect_args={"server_settings": {"search_path": f"{schema},public"}})
    sessions = async_sessionmaker(engine)
    account, person = uuid4(), uuid4()
    from app.services import auth
    monkeypatch.setattr(auth, "_active_scope_grants", lambda user: [])
    app = FastAPI()
    app.include_router(internal.router, prefix="/internal")
    app.dependency_overrides[internal.verify_internal_key] = lambda: None
    app.dependency_overrides[internal.get_current_active_user] = lambda: SimpleNamespace(id=account)
    app.dependency_overrides[internal.get_token_payload] = lambda: TokenPayload(str(account), "session", raw={})

    async def database():
        async with sessions.begin() as db:
            yield db
    app.dependency_overrides[internal.get_db] = database
    try:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
            # Only the lookup projection is needed; full migration integrity is
            # verified separately. Keep the real unique account-link constraint.
            await conn.execute(sa.text("CREATE TABLE persons (id uuid PRIMARY KEY, user_id uuid UNIQUE, "
                                       "is_active boolean NOT NULL, deleted_at timestamptz)"))
            await conn.execute(sa.text("INSERT INTO persons VALUES (:id, :user_id, true, NULL)"),
                               {"id": person, "user_id": account})
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            async def lookup():
                response = await client.post("/internal/auth/introspect")
                assert response.status_code == 200, response.text
                assert response.json()["sub"] == str(account)
                return response.json()["person_id"]
            assert await lookup() == str(person)
            for change in ("is_active = false", "is_active = true, deleted_at = now()", "deleted_at = NULL, user_id = NULL"):
                async with engine.begin() as conn:
                    await conn.execute(sa.text(f"UPDATE persons SET {change}"))
                assert await lookup() is None
    finally:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"DROP SCHEMA {schema} CASCADE"))
        await engine.dispose()
