from contextlib import asynccontextmanager

import httpx
import pytest
from fastapi import HTTPException

from ksu_common.auth import TokenPayload
from ksu_common import identity_freshness


@pytest.mark.asyncio
@pytest.mark.parametrize("code,body,expected", [
    (200, {"sub": "user", "jti": "session", "scope_grants": []}, None),
    (200, {"sub": "user", "jti": "session", "scope_grants": [], "person_id": "00000000-0000-0000-0000-000000000001"}, None),
    (200, {"sub": "user", "jti": "session", "scope_grants": [], "person_id": "invalid"}, 503),
    (401, {}, 401),
    (403, {}, 503),
    (500, {}, 503),
    (200, {"sub": "other", "jti": "session", "scope_grants": []}, 503),
    (200, {"sub": "user", "jti": "session"}, 503),
])
async def test_current_identity_replaces_stale_authority(monkeypatch, code, body, expected):
    calls = []

    def handle(request):
        calls.append(request)
        assert request.headers["authorization"] == "Bearer signed-user-token"
        assert request.headers["x-internal-key"] == "test-service-key"
        return httpx.Response(code, json=body)

    @asynccontextmanager
    async def client(**kwargs):
        async with httpx.AsyncClient(base_url=kwargs["base_url"], transport=httpx.MockTransport(handle)) as value:
            yield value

    monkeypatch.setattr(identity_freshness, "outbound_client", client)
    validate = identity_freshness.build_identity_validator(base_url="http://identity", service_key="test-service-key")
    stale = TokenPayload("user", "session", ["web-master"], {"roles": ["web-master"], "permissions": ["*"],
                                                          "mfa_enabled": True, "mfa_verified_at": 9999999999, "person_id": "stale"})
    if expected:
        with pytest.raises(HTTPException) as error:
            await validate("signed-user-token", stale)
        assert error.value.status_code == expected
    else:
        current = await validate("signed-user-token", stale)
        assert current.sub == stale.sub
        assert current.raw["person_id"] == body.get("person_id")
        assert current.roles == []
        assert current.raw["permissions"] == []
        assert current.raw["scope_grants"] == []
        assert current.raw["mfa_enabled"] is False
        assert current.raw["mfa_verified_at"] is None
        await validate("signed-user-token", stale)
        assert len(calls) == 2  # No stale cached authorization.
