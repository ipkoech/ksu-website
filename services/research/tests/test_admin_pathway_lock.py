"""Native-import regression: run with the repository's real Research setup.

The database is an explicit fixture; PostgreSQL two-session races remain an
integration acceptance gate. This file was authored, not executed in the bundle.
"""
import asyncio
from types import SimpleNamespace
from uuid import UUID

import pytest
from app.routes.v1 import innovation_partnership as routes
from app.services import StartupVentureService
from fastapi import HTTPException
from sqlalchemy.dialects import postgresql


def test_pathway_scope_uses_locked_fresh_ownership(monkeypatch):
    old_center = UUID("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")
    new_center = UUID("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb")
    identifier = UUID("cccccccc-cccc-4ccc-8ccc-cccccccccccc")
    events = []
    initial = SimpleNamespace(id=identifier, center_id=old_center)
    current = SimpleNamespace(id=identifier, center_id=new_center)

    async def get_by_id(db, item_id):
        events.append("read")
        return initial

    class DB:
        async def scalar(self, query):
            assert "FOR UPDATE" in str(query.compile(dialect=postgresql.dialect()))
            assert query.get_execution_options()["populate_existing"] is True
            events.append("lock")
            return current

    def require_scope(actor, permission, scope_type, center):
        assert center == new_center
        events.append("authorize")
        raise HTTPException(403, "Scope changed")

    monkeypatch.setattr(StartupVentureService, "get_by_id", get_by_id)
    monkeypatch.setattr(routes, "require_scoped_record", require_scope)
    with pytest.raises(HTTPException) as caught:
        asyncio.run(routes._get_authorized_action_item(StartupVentureService, identifier, "innovation.manage_startups", DB(), SimpleNamespace()))
    assert caught.value.status_code == 403
    assert events == ["read", "lock", "authorize"]
