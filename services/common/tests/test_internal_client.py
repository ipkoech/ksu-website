import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from ksu_common.internal_client import (
    INTERNAL_KEY_HEADER,
    LEGACY_INTERNAL_KEY_HEADER,
    internal_headers,
    internal_key_guard,
)

KEY = "internal-key-under-test"


def _app(expected: str | None = KEY, *, allow_legacy: bool = True) -> TestClient:
    app = FastAPI()
    guard = internal_key_guard(lambda: expected, allow_legacy_header=allow_legacy)

    @app.get("/internal/ping", dependencies=[Depends(guard)])
    async def ping():
        return {"ok": True}

    return TestClient(app)


def test_canonical_header_is_accepted():
    response = _app().get("/internal/ping", headers={INTERNAL_KEY_HEADER: KEY})

    assert response.status_code == 200


def test_legacy_header_is_accepted_during_migration():
    response = _app().get("/internal/ping", headers={LEGACY_INTERNAL_KEY_HEADER: KEY})

    assert response.status_code == 200


def test_legacy_header_can_be_rejected_once_migration_completes():
    client = _app(allow_legacy=False)

    assert client.get("/internal/ping", headers={LEGACY_INTERNAL_KEY_HEADER: KEY}).status_code == 403
    assert client.get("/internal/ping", headers={INTERNAL_KEY_HEADER: KEY}).status_code == 200


def test_missing_header_is_denied():
    assert _app().get("/internal/ping").status_code == 403


@pytest.mark.parametrize("value", ["", "wrong-key", KEY + "x", KEY[:-1]])
def test_wrong_key_is_denied(value):
    response = _app().get("/internal/ping", headers={INTERNAL_KEY_HEADER: value})

    assert response.status_code == 403


@pytest.mark.parametrize("expected", [None, ""])
def test_unconfigured_expected_key_denies_every_request(expected):
    """A service with no key configured must not accept an empty client key."""
    client = _app(expected)

    assert client.get("/internal/ping").status_code == 403
    assert client.get("/internal/ping", headers={INTERNAL_KEY_HEADER: ""}).status_code == 403


def test_internal_headers_uses_the_canonical_header():
    assert internal_headers(KEY) == {INTERNAL_KEY_HEADER: KEY}


@pytest.mark.parametrize("missing", [None, ""])
def test_internal_headers_refuses_to_build_unauthenticated_requests(missing):
    with pytest.raises(RuntimeError, match="INTERNAL_API_KEY"):
        internal_headers(missing)
