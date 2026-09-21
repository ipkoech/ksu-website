from __future__ import annotations

import uuid

import pytest
from sqlalchemy.dialects import postgresql

from ksu_common.auth import TokenPayload

from app.core.auth import allowed_library_scope_ids, has_library_permission
from app.services import library as library_service


def _user(*, grants: list[dict] | None, permissions: list[str] | None = None) -> TokenPayload:
    raw = {"permissions": permissions or ["library.read"]}
    if grants is not None:
        raw["scope_grants"] = grants
    return TokenPayload(
        sub="user-1",
        jti="token-1",
        roles=[],
        raw=raw,
    )


def test_library_scope_ids_distinguish_global_from_empty_assignment() -> None:
    branch_id = uuid.uuid4()
    scoped = _user(
        grants=[
            {
                "scope_type": "library",
                "scope_id": str(branch_id),
                "permissions": ["library.read"],
            }
        ]
    )
    denied = _user(
        grants=[
            {
                "scope_type": "library",
                "scope_id": str(uuid.uuid4()),
                "permissions": ["library.write"],
            }
        ]
    )
    global_user = _user(grants=[{"scope_type": "global", "permissions": ["library.read"]}])

    assert allowed_library_scope_ids(scoped, "library.read") == {str(branch_id)}
    assert allowed_library_scope_ids(denied, "library.read") == set()
    assert allowed_library_scope_ids(global_user, "library.read") is None
    assert allowed_library_scope_ids(_user(grants=None), "library.read") == set()
    assert allowed_library_scope_ids(_user(grants=[]), "library.read") == set()
    assert has_library_permission(scoped, "library.read")


@pytest.mark.asyncio
async def test_empty_library_scope_compiles_to_deny_all(monkeypatch: pytest.MonkeyPatch) -> None:
    captured = {}

    async def fake_paginate(db, query, **kwargs):
        captured["query"] = query
        return object()

    monkeypatch.setattr(library_service, "paginate", fake_paginate)
    result = await library_service.list_libraries(object(), public_only=False, library_ids=[])

    assert result is not None
    sql = str(
        captured["query"].compile(
            dialect=postgresql.dialect(), compile_kwargs={"literal_binds": True}
        )
    )
    assert "1 != 1" in sql
