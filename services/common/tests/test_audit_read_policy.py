from unittest.mock import AsyncMock, Mock

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from ksu_common.runtime import AuditOptions, CorsConfig, ServiceAppConfig, create_service_app


@pytest.mark.parametrize("status_code,audited", [(200, False), (404, False), (401, True), (403, True)])
def test_anonymous_read_sampling_preserves_authentication_failures(status_code, audited):
    dispatch = AsyncMock()
    begin, finish = Mock(), Mock()

    def register(app):
        @app.get("/resource", response_model=int)
        async def resource():
            if status_code != 200:
                raise HTTPException(status_code, "request rejected")
            return 1

    app = create_service_app(
        ServiceAppConfig(service_name="test", title="Test", version="1", environment="development"),
        cors=CorsConfig(origins=()), register_routes=register,
        audit=AuditOptions(
            session_factory=None, service_name="test", token_key="test", token_algorithm="HS256",
            token_issuer="test", token_audience="test", token_key_id="test",
            dispatch=dispatch, skip_anonymous_reads=True, begin_request=begin, finish_request=finish,
        ),
    )
    with TestClient(app) as client:
        assert client.get("/resource").status_code == status_code
    begin.assert_not_called()
    finish.assert_not_called()
    if audited:
        dispatch.assert_awaited_once()
        assert dispatch.call_args.args[0]["status_code"] == status_code
        assert dispatch.call_args.args[0]["status"] == "failure"
    else:
        dispatch.assert_not_awaited()
