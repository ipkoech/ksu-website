from __future__ import annotations

import pytest

from ksu_common.task_queue import (
    TaskQueueConfig,
    close_worker_async_runtime,
    create_celery_app,
    run_worker_async,
)
from ksu_common.observability import current_request_id


def test_create_celery_app_applies_shared_transport_policy() -> None:
    app = create_celery_app(
        TaskQueueConfig(
            name="test-service",
            broker_url="redis://localhost:6379/9",
            result_backend="redis://localhost:6379/9",
            default_queue="test.default",
            task_routes={"test.task": {"queue": "test.jobs"}},
            imports=("test.tasks",),
        )
    )

    assert app.main == "test-service"
    assert app.conf.task_serializer == "json"
    assert app.conf.result_serializer == "json"
    assert app.conf.accept_content == ["json"]
    assert app.conf.task_default_queue == "test.default"
    assert app.conf.task_routes["test.task"]["queue"] == "test.jobs"
    assert app.conf.imports == ("test.tasks",)


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
