from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
import pytest

from ksu_common.internal_client import internal_headers, internal_key_guard


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
