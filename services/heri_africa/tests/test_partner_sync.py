from __future__ import annotations

import asyncio
import inspect
import time
from types import SimpleNamespace
from unittest.mock import AsyncMock

import httpx
import pytest
from fastapi import HTTPException
from ksu_common.auth import TokenPayload

from app.services.partner_sync import _resolve_partner_center_links


def _sync_actor():
    return TokenPayload("actor", "session", raw={
        "scope_grants": [{"scope_type": "heri", "scope_id": "heri", "permissions": ["heri.integrations.sync"]}],
        "mfa_enabled": True, "mfa_verified_at": time.time(),
    })


@pytest.mark.asyncio
@pytest.mark.parametrize("failure", ["permission", "mfa"])
async def test_canonical_sync_authority_is_checked_before_fetch(monkeypatch, failure):
    from app.services import partner_sync
    actor = _sync_actor()
    if failure == "permission":
        actor.raw["scope_grants"] = []
    else:
        actor.raw["mfa_verified_at"] = 0
    fetch = AsyncMock()
    monkeypatch.setattr(partner_sync, "_fetch_partner_snapshot", fetch)
    with pytest.raises(HTTPException) as denied:
        await partner_sync.sync_partners(SimpleNamespace(), actor=actor)
    assert denied.value.status_code == 403
    fetch.assert_not_awaited()


@pytest.mark.asyncio
async def test_mfa_expiring_during_fetch_prevents_apply(monkeypatch):
    from app.services import partner_sync
    actor = _sync_actor()
    monkeypatch.setattr(partner_sync, "get_settings", lambda: SimpleNamespace(RESEARCH_SERVICE_API_KEY="test"))
    async def fetch(_):
        actor.raw["mfa_verified_at"] = 0
        return [], {}
    monkeypatch.setattr(partner_sync, "_fetch_partner_snapshot", fetch)
    db = SimpleNamespace(execute=AsyncMock())
    with pytest.raises(HTTPException) as denied:
        await partner_sync.sync_partners(db, actor=actor)
    assert denied.value.status_code == 403
    db.execute.assert_not_awaited()


@pytest.mark.asyncio
async def test_http_sync_adapter_preserves_actor_and_response(monkeypatch):
    from app.routes.v1 import admin_resources
    actor = _sync_actor()
    db = SimpleNamespace()
    command = AsyncMock(return_value={"created": 1, "updated": 0, "total": 1, "deactivated": 0})
    monkeypatch.setattr(admin_resources.partner_sync, "sync_partners", command)
    result = await admin_resources.sync_partners_from_research(SimpleNamespace(client=None), db, actor)
    assert result["created"] == 1
    command.assert_awaited_once_with(db, actor=actor, ip_address=None)


def test_multi_center_projection_requires_reconciliation():
    from app.services.partner_sync import _merge_center_links
    links = {"partner": ("center-a", "a")}
    with pytest.raises(ValueError, match="multiple centers"):
        _merge_center_links(links, {"partner": ("center-b", "b")})
    assert links == {"partner": ("center-a", "a")}


@pytest.mark.asyncio
@pytest.mark.parametrize("failure,expected", [("timeout", 504), ("upstream", 502), ("cancel", None)])
async def test_sync_fetch_failure_never_starts_local_writes(monkeypatch, failure, expected):
    from app.services import partner_sync as routes
    settings = SimpleNamespace(RESEARCH_SERVICE_API_KEY="test", RESEARCH_SERVICE_URL="https://research.invalid")
    monkeypatch.setattr(routes, "get_settings", lambda: settings)
    monkeypatch.setattr(routes, "SYNC_FETCH_DEADLINE_SECONDS", 0.01)
    async def fetch(_):
        if failure == "cancel":
            raise asyncio.CancelledError
        if failure == "upstream":
            raise httpx.ConnectError("synthetic failure")
        await asyncio.Event().wait()
    monkeypatch.setattr(routes, "_fetch_partner_snapshot", fetch)
    db = SimpleNamespace(execute=AsyncMock(), add=AsyncMock())
    if expected:
        with pytest.raises(HTTPException) as denied:
            await routes.sync_partners(db, actor=_sync_actor())
        assert denied.value.status_code == expected
    else:
        with pytest.raises(asyncio.CancelledError):
            await routes.sync_partners(db, actor=_sync_actor())
    db.execute.assert_not_called()
    db.add.assert_not_called()


@pytest.mark.asyncio
async def test_center_fetch_error_is_not_an_empty_relationship_snapshot(monkeypatch):
    from app.services import partner_sync as routes
    pool = SimpleNamespace(request_internal=AsyncMock(side_effect=[
        _response({"data": []}), _response({"detail": "unavailable"}, 503),
    ]))
    monkeypatch.setattr(routes, "get_integration_pool", lambda: pool)
    with pytest.raises(httpx.HTTPStatusError):
        await routes._fetch_partner_snapshot(SimpleNamespace(
            RESEARCH_SERVICE_URL="https://research.invalid", RESEARCH_SERVICE_API_KEY="test",
        ))


@pytest.mark.asyncio
async def test_snapshot_collects_all_pages_and_all_center_batches(monkeypatch):
    from app.services import partner_sync as routes
    calls = []
    async def request(_integration, _base, _method, path, **options):
        page = options["params"]["page"]
        calls.append((path, page))
        if path.endswith("/partners"):
            return _response({"data": [{"id": f"partner-{page}"}], "meta": {"pages": 2}})
        values = [{"id": f"center-{number}"} for number in (range(100) if page == 1 else [100])]
        return _response({"data": values, "meta": {"pages": 2}})
    pool = SimpleNamespace(request_internal=request)
    monkeypatch.setattr(routes, "get_integration_pool", lambda: pool)
    resolver = AsyncMock(return_value={})
    monkeypatch.setattr(routes, "_resolve_partner_center_links", resolver)
    partners, _ = await routes._fetch_partner_snapshot(SimpleNamespace(
        RESEARCH_SERVICE_URL="https://research.invalid", RESEARCH_SERVICE_API_KEY="test",
    ))
    assert [record["id"] for record in partners] == ["partner-1", "partner-2"]
    assert [len(call.args[3]) for call in resolver.call_args_list] == [100, 1]
    assert calls == [("/api/v1/internal/partners", 1), ("/api/v1/internal/partners", 2),
                     ("/api/v1/internal/centers", 1), ("/api/v1/internal/centers", 2)]


@pytest.mark.asyncio
@pytest.mark.parametrize("payload", [
    {"data": [], "meta": {"pages": 2}},
    {"data": [{"id": "repeat"}], "meta": {"pages": 2}},
    {"data": [], "meta": {"pages": 101}},
    {"data": [], "meta": {"pages": 1, "total": 5}},
    {"data": [], "meta": {"pages": 1, "page": 2}},
])
async def test_incomplete_or_repeated_pagination_is_rejected(payload):
    from app.services import partner_sync as routes
    pool = SimpleNamespace(request_internal=AsyncMock(return_value=_response(payload)))
    with pytest.raises(ValueError):
        await routes._fetch_snapshot_pages(pool, SimpleNamespace(
            RESEARCH_SERVICE_URL="https://research.invalid", RESEARCH_SERVICE_API_KEY="test",
        ), "/api/v1/internal/partners")


@pytest.mark.asyncio
@pytest.mark.parametrize("permission,scope,fresh,allowed", [
    ("heri.content.write", "heri", True, False),
    ("heri.integrations.sync", "heri", False, False),
    ("heri.integrations.sync", "school", True, False),
    ("heri.integrations.sync", "heri", True, True),
])
async def test_partner_sync_route_requires_explicit_scoped_authority_and_mfa(permission, scope, fresh, allowed):
    from app.routes.v1.admin_resources import sync_partners_from_research
    dependency = inspect.signature(sync_partners_from_research).parameters["user"].default.dependency
    actor = TokenPayload("real-actor", "session", raw={
        "scope_grants": [{"scope_type": scope, "scope_id": "heri", "permissions": [permission]}],
        "mfa_enabled": True, "mfa_verified_at": time.time() if fresh else 0,
    })
    if allowed:
        assert await dependency(actor) is actor
    else:
        with pytest.raises(HTTPException) as denied:
            await dependency(actor)
        assert denied.value.status_code == 403


def _response(body: object, status_code: int = 200) -> httpx.Response:
    return httpx.Response(
        status_code,
        json=body,
        request=httpx.Request("POST", "https://research.example.edu"),
    )


def test_partner_sync_resolves_center_links_in_one_bounded_batch() -> None:
    calls: list[tuple[str, str, dict[str, object]]] = []

    async def request_internal(_integration, _base_url, method, path, **options):
        calls.append((method, path, options))
        return _response(
            {
                "status": "success",
                "data": [
                    {
                        "id": "partner-1",
                        "center_id": "center-1",
                        "center_slug": "climate-center",
                    }
                ],
            }
        )

    pool = SimpleNamespace(request_internal=request_internal)
    links = asyncio.run(
        _resolve_partner_center_links(
            pool,
            "https://research.example.edu",
            "key",
            [{"id": "center-1", "slug": "climate-center"}],
        )
    )

    assert links == {"partner-1": ("center-1", "climate-center")}
    assert len(calls) == 1
    assert calls[0][0:2] == ("POST", "/api/v1/internal/center-partners")
    assert calls[0][2]["json"] == {"center_ids": ["center-1"]}


def test_partner_sync_keeps_legacy_center_fallback_during_rollout() -> None:
    calls: list[tuple[str, str]] = []

    async def request_internal(_integration, _base_url, method, path, **options):
        calls.append((method, path))
        if method == "POST":
            return _response({"detail": "batch route unavailable"}, status_code=404)
        return _response(
            {
                "status": "success",
                "data": [{"id": "partner-1"}],
            }
        )

    pool = SimpleNamespace(request_internal=request_internal)
    links = asyncio.run(
        _resolve_partner_center_links(
            pool,
            "https://research.example.edu",
            "key",
            [{"id": "center-1", "slug": "climate-center"}],
        )
    )

    assert links == {"partner-1": ("center-1", "climate-center")}
    assert calls == [
        ("POST", "/api/v1/internal/center-partners"),
        ("GET", "/api/v1/internal/centers/center-1/partners"),
    ]
