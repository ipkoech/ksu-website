from unittest.mock import AsyncMock, Mock

from celery import Celery
import httpx
import pytest

from ksu_common.audit import build_audit_tasks


@pytest.mark.parametrize("status", [400, 401, 403, 404, 413, 422])
def test_permanent_receiver_errors_do_not_retry(status, monkeypatch):
    app = Celery("classification", broker="memory://")
    request = httpx.Request("POST", "https://audit.invalid/?key=secret")
    response = httpx.Response(status, request=request)
    persist = AsyncMock(side_effect=httpx.HTTPStatusError("secret", request=request, response=response))
    task, _ = build_audit_tasks(app, None, task_name="audit.classification", persist_payload=persist)
    retry = Mock()
    monkeypatch.setattr(task, "retry", retry)
    try:
        with pytest.raises(ValueError, match=f"audit receiver rejected payload \\(HTTP {status}\\)") as raised:
            task.run({"id": "stable"})
        retry.assert_not_called()
        assert "secret" not in str(raised.value)
    finally:
        app.close()
