import importlib
from typing import Self

import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
from ksu_common.internal_client import (
    authenticated_client,
    internal_headers,
    internal_key_guard,
    outbound_client,
)


def test_internal_headers_fail_closed_when_key_is_missing():
    with pytest.raises(RuntimeError):
        internal_headers(None)


def test_internal_guard_accepts_only_the_canonical_header():
    app = FastAPI()
    guard = internal_key_guard(lambda: "r" * 32, allow_legacy_header=False)

    @app.get("/internal", dependencies=[Depends(guard)])
    async def internal_endpoint():
        return {"ok": True}

    client = TestClient(app)
    assert client.get("/internal").status_code == 403
    assert client.get("/internal", headers={"X-Internal-Key": "wrong"}).status_code == 403
    assert client.get("/internal", headers={"X-Internal-API-Key": "r" * 32}).status_code == 403
    assert client.get("/internal", headers={"X-Internal-Key": "r" * 32}).status_code == 200


class _ClientContext:
    def __init__(self, **options: object) -> None:
        self.options = options

    async def __aenter__(self) -> Self:
        return self

    async def __aexit__(self, *_args: object) -> None:
        return None


@pytest.mark.asyncio
async def test_outbound_client_applies_bounded_timeouts_and_correlation(monkeypatch):
    clients: list[_ClientContext] = []

    def build_client(**options: object) -> _ClientContext:
        client = _ClientContext(**options)
        clients.append(client)
        return client

    client_module = importlib.import_module("ksu_common.internal_client")
    monkeypatch.setattr(client_module.httpx, "AsyncClient", build_client)

    async with outbound_client(
        base_url="https://service.example/",
        timeout=10.0,
        connect_timeout=2.0,
        headers={"X-Provider": "local-payload"},
        request_id="request-123",
        correlation_id="correlation-456",
    ):
        pass

    options = clients[0].options
    assert options["base_url"] == "https://service.example"
    assert options["timeout"].read == 10.0
    assert options["timeout"].connect == 2.0
    assert options["headers"] == {
        "X-Request-ID": "request-123",
        "X-Correlation-ID": "correlation-456",
        "X-Provider": "local-payload",
    }


@pytest.mark.asyncio
async def test_authenticated_client_fails_closed_without_authentication():
    with pytest.raises(RuntimeError, match="authentication headers"):
        async with authenticated_client("https://service.example", auth_headers={}):
            pass


@pytest.mark.asyncio
async def test_authenticated_client_fails_closed_for_empty_authentication_values():
    with pytest.raises(RuntimeError, match="authentication headers"):
        async with authenticated_client(
            "https://service.example", auth_headers={"Authorization": ""}
        ):
            pass
