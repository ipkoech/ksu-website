import asyncio
from contextlib import asynccontextmanager
from unittest.mock import AsyncMock, Mock

import pytest
import httpx
from celery import Celery
from celery.exceptions import Retry

from ksu_common.audit import build_audit_tasks, persist_audit_payload
from ksu_common.task_queue import close_worker_async_runtime


def test_audit_tasks_reuse_worker_event_loop():
    loops = []
    delivered = []

    async def persist(_payload):
        loops.append(asyncio.get_running_loop())
        delivered.append(_payload)

    app = Celery("audit-loop-test", broker="memory://")
    task, _dispatch = build_audit_tasks(app, None, task_name="test.audit", persist_payload=persist)
    try:
        task.run({"id": "one"})
        task.run([{"id": "two"}, {"id": "three"}])
        assert delivered == [{"id": "one"}, [{"id": "two"}, {"id": "three"}]]
        assert len(loops) == 2 and loops[0] is loops[1]
        assert not loops[0].is_closed()
    finally:
        close_worker_async_runtime()
        app.close()
    assert loops[0].is_closed()


def test_worker_persistence_failure_is_not_acknowledged_as_success():
    session = AsyncMock()
    session.add = Mock()
    session.commit.side_effect = RuntimeError("test database failure")

    @asynccontextmanager
    async def factory():
        yield session

    with pytest.raises(RuntimeError, match="test database failure"):
        asyncio.run(persist_audit_payload(factory, {}, Mock(), strict=True))
    session.rollback.assert_awaited_once()


def test_audit_task_reschedules_using_receiver_retry_after(monkeypatch):
    received = []

    async def persist(payload):
        received.append(payload)
        response = httpx.Response(429, headers={"Retry-After": "60"},
                                  request=httpx.Request("POST", "https://main.example.edu/audit"))
        response.raise_for_status()

    app = Celery("audit-delay-test", broker="memory://")
    task, _dispatch = build_audit_tasks(app, None, task_name="test.audit.delay", persist_payload=persist)
    retry = Mock(side_effect=Retry())
    monkeypatch.setattr(task, "retry", retry)
    payload = [{"id": "stable-event"}]
    try:
        with pytest.raises(Retry):
            task.run(payload)
        assert received == [payload]
        retry.assert_called_once()
        assert retry.call_args.kwargs["countdown"] == 60
        assert retry.call_args.kwargs["max_retries"] == 5
        assert str(retry.call_args.kwargs["exc"]) == "audit delivery deferred by receiver"
    finally:
        close_worker_async_runtime()
        app.close()
