from __future__ import annotations

import pytest

from ksu_common.task_queue import (
    TaskQueueConfig,
    _task_failure,
    _task_postrun,
    _task_prerun,
    _task_rejected,
    _task_retry,
    close_worker_async_runtime,
    create_celery_app,
    run_worker_async,
)
from ksu_common.observability import Metrics, current_request_id


def test_create_celery_app_applies_shared_transport_policy() -> None:
    records: list[tuple[str, object, dict[str, str]]] = []

    class Sink:
        def increment(self, name: str, value: int, *, tags: dict[str, str]) -> None:
            records.append((name, value, tags))

        def observe_latency(
            self, name: str, duration_ms: float, *, tags: dict[str, str]
        ) -> None:
            records.append((name, duration_ms, tags))

    app = create_celery_app(
        TaskQueueConfig(
            name="test-service",
            broker_url="redis://localhost:6379/9",
            result_backend="redis://localhost:6379/9",
            default_queue="test.default",
            task_routes={"test.task": {"queue": "test.jobs"}},
            imports=("test.tasks",),
            metrics=Metrics(Sink()),
        )
    )

    assert app.main == "test-service"
    assert app.conf.task_serializer == "json"
    assert app.conf.result_serializer == "json"
    assert app.conf.accept_content == ["json"]
    assert app.conf.task_default_queue == "test.default"
    assert app.conf.task_routes["test.task"]["queue"] == "test.jobs"
    assert app.conf.imports == ("test.tasks",)
    assert app.conf.task_acks_late is True
    assert app.conf.task_reject_on_worker_lost is True
    assert app.conf.worker_prefetch_multiplier == 1


def test_task_lifecycle_emits_bounded_count_latency_failure_and_retry_metrics() -> None:
    records: list[tuple[str, object, dict[str, str]]] = []

    class Sink:
        def increment(self, name: str, value: int, *, tags: dict[str, str]) -> None:
            records.append((name, value, tags))

        def observe_latency(
            self, name: str, duration_ms: float, *, tags: dict[str, str]
        ) -> None:
            records.append((name, duration_ms, tags))

    app = create_celery_app(
        TaskQueueConfig(
            name="metrics-service",
            broker_url="redis://localhost:6379/9",
            metrics=Metrics(Sink()),
        )
    )
    def metrics_task() -> None:
        return None

    task = app.task(name="metrics-service.task." + ("x" * 300))(metrics_task)

    _task_prerun(task_id="task-1", task=task)
    _task_retry(task=task)
    _task_failure(task_id="task-1", task=task, exception=ValueError("secret"))
    _task_postrun(task_id="task-1", task=task, state="FAILURE")
    _task_rejected(task=task, requeue=False)

    count = next(record for record in records if record[0] == "celery.task.count")
    assert count[1:] == (
        1,
        {"task": "metrics-service.task." + ("x" * 107), "state": "started"},
    )
    assert any(record[0] == "celery.task.retry" for record in records)
    assert any(record[0] == "celery.task.failure" for record in records)
    assert any(record[0] == "celery.task.dead_letter" for record in records)
    latency = next(record for record in records if record[0] == "celery.task.latency_ms")
    assert latency[2]["task"] == count[2]["task"]
    assert latency[2]["state"] == "FAILURE"


def test_worker_async_runtime_reuses_one_loop_and_closes() -> None:
    loop_ids = [run_worker_async(_loop_id()) for _ in range(2)]

    assert loop_ids[0] == loop_ids[1]
    close_worker_async_runtime()


def test_worker_async_runtime_provides_request_id_and_runs_shutdown_hook() -> None:
    observed: list[str | None] = []
    run_worker_async(_capture_request_id(observed))

    async def hook() -> None:
        observed.append("shutdown")

    close_worker_async_runtime((hook,))
    assert observed[0].startswith("celery-")
    assert observed[-1] == "shutdown"


def test_worker_shutdown_runs_later_hooks_when_an_earlier_hook_fails() -> None:
    observed: list[str] = []
    run_worker_async(_loop_id())

    async def bad_hook() -> None:
        observed.append("bad")
        raise RuntimeError("boom")

    async def good_hook() -> None:
        observed.append("good")

    with pytest.raises(RuntimeError, match="shutdown hooks"):
        close_worker_async_runtime((bad_hook, good_hook))
    assert observed == ["bad", "good"]


async def _loop_id() -> int:
    import asyncio

    return id(asyncio.get_running_loop())


async def _capture_request_id(observed: list[str | None]) -> None:
    observed.append(current_request_id())
