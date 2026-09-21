from types import SimpleNamespace

import pytest
from fastapi import Response
from ksu_common.auth import TokenPayload

from app.api.v1.auth_mfa import mfa_status


@pytest.mark.asyncio
async def test_account_mfa_status_exposes_no_credentials_and_is_not_cached():
    response = Response()
    user = SimpleNamespace(mfa_enabled=True, mfa_recovery_hashes=["private-digest"], mfa_secret="ciphertext")
    token = TokenPayload("user", "session", raw={"mfa_verified_at": 1000.0})
    result = await mfa_status(user, token, response)
    data = result["data"].model_dump(mode="json")
    assert set(data) == {"enabled", "verified_at", "recovery_codes_remaining"}
    assert data["enabled"] is True and data["recovery_codes_remaining"] == 1
    assert "private-digest" not in str(data) and "ciphertext" not in str(data)
    assert response.headers["Cache-Control"] == "no-store"
