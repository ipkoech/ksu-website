from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

from fastapi import FastAPI
from fastapi.testclient import TestClient
from ksu_common.auth import TokenPayload
from app.api.v1 import me, workspaces
from app.deps import get_current_active_user, get_db, get_token_payload
from app.services import workspace_access


def test_discovery_activation_exit_and_legacy_portal_contract(monkeypatch):
    actor = TokenPayload(str(uuid4()), "login", raw={"scope_grants": [
        {"scope_type": "global", "permissions": ["platform.admin"]},
    ]})
    db = Mock(execute=AsyncMock(), scalar=AsyncMock(return_value=None))
    monkeypatch.setattr(workspace_access, "capture_request_audit", AsyncMock())
    monkeypatch.setattr(me, "get_portal_access", AsyncMock(return_value=[]))
    app = FastAPI()
    app.include_router(workspaces.router, prefix="/api/v1/workspaces")
    app.include_router(me.router, prefix="/api/v1/me")
    app.dependency_overrides[get_token_payload] = lambda: actor
    app.dependency_overrides[get_current_active_user] = lambda: SimpleNamespace(id=actor.sub)
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as client:
        discovery = client.get("/api/v1/me/portal-access")
        assert discovery.status_code == 200
        assert discovery.headers["cache-control"] == "no-store"
        assert discovery.json()["data"]["portals"] == []
        assert len(discovery.json()["data"]["workspaces"]) == 9
        for workspace in ("library-admin", "research-admin"):
            response = client.post(f"/api/v1/workspaces/{workspace}/activate", json={})
            assert response.status_code == 200
            data = response.json()["data"]
            assert data["context"]["actor_id"] == actor.sub
            assert data["context"]["selected_scope"] == {"scope_type": "global", "scope_id": None}
            assert "set-cookie" not in response.headers
            exited = client.post(f"/api/v1/workspaces/{workspace}/exit", json={"visit_id": data["visit_id"]})
            assert exited.status_code == 200
        assert actor.jti == "login"
