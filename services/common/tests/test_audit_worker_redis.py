import os
import asyncio
from threading import Event
from time import monotonic
import uuid
from unittest.mock import Mock

import pytest
from celery.contrib.testing.worker import start_worker
from celery.signals import before_task_publish

from ksu_common.audit import build_audit_tasks
from ksu_common.task_queue import TaskQueueConfig, create_celery_app
from ksu_common.observability import Metrics


@pytest.mark.parametrize("receiver_cooldown,exhausts,permanent", [
    (False, False, False), (True, False, False), (True, True, False), (False, False, True),
])
def test_live_audit_worker_retries_transient_delivery_with_stable_payload(receiver_cooldown, exhausts, permanent):
    url = os.environ.get("KSU_TEST_REDIS_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_REDIS_URL required")
    queue = "audit_worker_probe_" + uuid.uuid4().hex
    sink = Mock()
    app = create_celery_app(TaskQueueConfig(name=queue, broker_url=url, default_queue=queue, metrics=Metrics(sink)))
    # Keep all transport keys in the test's namespace, including unacked state.
    app.conf.broker_transport_options = {"global_keyprefix": queue + ":"}
    app.conf.worker_enable_remote_control = False
    received = []
    delivered = Event()
    attempted = Event()
    other_completed = Event()
    attempts = []
    other_times = []

    @app.task(name=queue + ".other", ignore_result=True)
    def other_work():
        other_times.append(monotonic())
        other_completed.set()

    async def persist(payload):
        received.append(payload)
        attempts.append(monotonic())
        if permanent:
            import httpx
            delivered.set()
            request = httpx.Request("POST", "https://audit.invalid/ingest")
            response = httpx.Response(422, request=request)
            raise httpx.HTTPStatusError("invalid event", request=request, response=response)
        if len(received) == 1 or exhausts:
            attempted.set()
            if exhausts and len(received) == 6:
                delivered.set()
            if receiver_cooldown:
                import httpx
                request = httpx.Request("POST", "https://audit.invalid/ingest")
                response = httpx.Response(429, headers={"Retry-After": "1" if exhausts else "2"}, request=request)
                raise httpx.HTTPStatusError("receiver busy", request=request, response=response)
            raise ConnectionError("synthetic transient delivery failure")
        delivered.set()

    task, dispatch = build_audit_tasks(app, None, task_name=queue + ".persist", persist_payload=persist)
    published_headers = []

    def published(headers=None, **kwargs):
        published_headers.append(dict(headers))

    before_task_publish.connect(published, sender=task.name, weak=False)
    payload = {"id": str(uuid.uuid4()), "action": "test"}
    try:
        with start_worker(app, pool="solo", concurrency=1, perform_ping_check=False,
                          queues=[queue], shutdown_timeout=15, without_heartbeat=True):
            asyncio.run(dispatch(payload))
            if receiver_cooldown:
                assert attempted.wait(10)
                other_work.apply_async(queue=queue)
                assert other_completed.wait(10)
            assert delivered.wait(15), "audit delivery did not recover within timeout"
        assert received == [payload] * (1 if permanent else 6 if exhausts else 2)
        assert len(published_headers) == len(received)
        assert all(headers["argsrepr"] == "(<audit payload>,)" for headers in published_headers)
        assert task.acks_late and task.reject_on_worker_lost
        emitted = [call.args[0] for call in sink.increment.call_args_list]
        assert emitted.count("celery.task.retry") == (0 if permanent else 5 if exhausts else 1)
        assert emitted.count("celery.task.failure") == (1 if exhausts or permanent else 0)
        failures = [call for call in sink.gauge.call_args_list if call.args[0] == "celery.task.last_failure_at"]
        assert len(failures) == (1 if exhausts or permanent else 0)
        if exhausts or permanent:
            assert failures[0].args[1] > 0
            assert failures[0].kwargs["tags"] == {"task": task.name}
        if receiver_cooldown:
            assert attempts[1] - attempts[0] >= (0.9 if exhausts else 1.9)
            assert attempts[0] < other_times[0] < attempts[1]
    finally:
        before_task_publish.disconnect(published, sender=task.name)
        app.close()
        from redis import Redis
        with Redis.from_url(url) as client:
            keys = list(client.scan_iter(match=queue + ":*"))
            if keys:
                client.delete(*keys)
