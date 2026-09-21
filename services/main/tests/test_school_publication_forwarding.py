from unittest.mock import AsyncMock

import httpx
import pytest
from fastapi import HTTPException

from app.clients import research


@pytest.mark.asyncio
@pytest.mark.parametrize("code", [201, 403, 409, 422])
async def test_forwarding_preserves_actor_idempotency_scope_and_errors(monkeypatch, code):
    body = {"data": {"id": "publication"}} if code == 201 else {"detail": "Canonical operation rejected"}
    pool = AsyncMock()
    pool.request_authenticated.return_value = httpx.Response(code, json=body,
                                                               request=httpx.Request("POST", "http://research"))
    monkeypatch.setattr(research, "get_integration_pool", lambda: pool)
    client = research.ResearchClient(base_url="http://research", authorization="Bearer actor",
                                     request_id="correlation", idempotency_key="stable-command", selected_school="school")
    if code == 201:
        assert await client.create_school_publication({"title": "Paper"}) == body
    else:
        with pytest.raises(HTTPException) as error:
            await client.create_school_publication({"title": "Paper"})
        assert error.value.status_code == code
        assert error.value.detail == body["detail"]
    kwargs = pool.request_authenticated.call_args.kwargs
    assert kwargs["auth_headers"] == {"Authorization": "Bearer actor"}
    assert kwargs["headers"] == {"Idempotency-Key": "stable-command", "X-School-ID": "school"}
    assert kwargs["request_id"] == "correlation"
