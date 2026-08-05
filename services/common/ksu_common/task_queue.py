"""Common Celery application configuration for service-owned task queues."""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from dataclasses import dataclass, field
import asyncio
import threading
import uuid
from collections.abc import Awaitable, Callable
from typing import Any

from .observability import (
    current_correlation_id,
    current_request_id,
    request_context,
)

_task_context = threading.local()


@dataclass(frozen=True, slots=True)
class TaskQueueConfig:
    """Transport and policy settings; services provide routes and schedules."""

    name: str
    broker_url: str
    result_backend: str | None = None
    default_queue: str = "default"
    task_routes: Mapping[str, Mapping[str, str]] = field(default_factory=dict)
    beat_schedule: Mapping[str, Mapping[str, Any]] = field(default_factory=dict)
    imports: tuple[str, ...] = ()
    timezone: str = "Africa/Nairobi"
    shutdown_hooks: tuple[Callable[[], Awaitable[None]], ...] = ()


class _WorkerAsyncRuntime:
    """Keep async engines and HTTP pools on one event loop per worker process."""

    def __init__(self) -> None:
        self._ready = threading.Event()
        self._thread = threading.Thread(
            target=self._run_loop,
            name="ksu-celery-async-runtime",
            daemon=True,
        )
        self._loop: asyncio.AbstractEventLoop | None = None
        self._thread.start()
        self._ready.wait()

    def _run_loop(self) -> None:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        self._loop = loop
        self._ready.set()
        try:
            loop.run_forever()
        finally:
            pending = asyncio.all_tasks(loop)
            for task in pending:
                task.cancel()
            if pending:
                loop.run_until_complete(asyncio.gather(*pending, return_exceptions=True))
            loop.run_until_complete(loop.shutdown_asyncgens())
            loop.run_until_complete(loop.shutdown_default_executor())
            loop.close()

    def run(self, coroutine: Any) -> Any:
        loop = self._loop
        if loop is None or loop.is_closed():
            coroutine.close()
            raise RuntimeError("Celery async runtime is not available")
        future = asyncio.run_coroutine_threadsafe(coroutine, loop)
        return future.result()

    def close(self) -> None:
        loop = self._loop
        if loop is None or loop.is_closed():
            return
        loop.call_soon_threadsafe(loop.stop)
        self._thread.join(timeout=10)
        self._loop = None


_worker_async_runtime: _WorkerAsyncRuntime | None = None
_worker_async_runtime_lock = threading.Lock()


def run_worker_async(coroutine: Any) -> Any:
    """Run a Celery task coroutine on the worker's persistent async loop."""

    global _worker_async_runtime
    with _worker_async_runtime_lock:
        if _worker_async_runtime is None:
            _worker_async_runtime = _WorkerAsyncRuntime()
        runtime = _worker_async_runtime
    request_id = current_request_id() or f"celery-{uuid.uuid4()}"
    correlation_id = current_correlation_id() or request_id
    with request_context(request_id, correlation_id):
        return runtime.run(coroutine)


async def _close_common_worker_resources() -> None:
    from .cache import close_redis
    from .gemini import close_gemini_transports
    from .internal_client import close_integration_pool

    results = await asyncio.gather(
        close_integration_pool(),
        close_gemini_transports(),
        close_redis(),
        return_exceptions=True,
    )
    errors = [result for result in results if isinstance(result, BaseException)]
    if errors:
        raise RuntimeError("one or more common worker resources failed to close") from errors[0]


def close_worker_async_runtime(
    shutdown_hooks: tuple[Callable[[], Awaitable[None]], ...] = (),
) -> None:
    """Close worker-local async resources during Celery worker shutdown."""

    global _worker_async_runtime
    with _worker_async_runtime_lock:
        runtime = _worker_async_runtime
        _worker_async_runtime = None
    if runtime is not None:
        async def _shutdown() -> None:
            async def run_hook(hook: Callable[[], Awaitable[None]]) -> None:
                await hook()

            operations = [
                _close_common_worker_resources(),
                *(run_hook(hook) for hook in shutdown_hooks),
            ]
            results = await asyncio.gather(*operations, return_exceptions=True)
            errors = [result for result in results if isinstance(result, BaseException)]
            if errors:
                raise RuntimeError("one or more worker shutdown hooks failed") from errors[0]

        try:
            runtime.run(_shutdown())
        finally:
            runtime.close()


def _task_prerun(task_id: str | None = None, **_kwargs: Any) -> None:
    context = request_context(f"celery-{task_id or uuid.uuid4()}")
    context.__enter__()
    _task_context.context = context


def _task_postrun(**_kwargs: Any) -> None:
    context = getattr(_task_context, "context", None)
    if context is not None:
        context.__exit__(None, None, None)
        del _task_context.context


def create_celery_app(
    config: TaskQueueConfig,
    *,
    task_packages: Iterable[str] = (),
):
    """Create a consistently configured Celery app without owning task logic.

    Celery is imported lazily so ``ksu_common`` remains usable by HTTP-only
    processes that do not install the worker dependency.
    """

    from celery import Celery
    from celery.signals import task_postrun, task_prerun, worker_process_shutdown, worker_shutdown

    app = Celery(
        config.name,
        broker=config.broker_url,
        backend=config.result_backend,
    )
    app.conf.update(
        task_serializer="json",
        result_serializer="json",
        accept_content=["json"],
        timezone=config.timezone,
        enable_utc=True,
        task_track_started=True,
        broker_connection_retry_on_startup=True,
        task_default_queue=config.default_queue,
        task_routes=dict(config.task_routes),
        beat_schedule=dict(config.beat_schedule),
    )
    packages = tuple(task_packages)
    if packages:
        app.autodiscover_tasks(list(packages))
    if config.imports:
        app.conf.imports = tuple(config.imports)
    worker_process_shutdown.connect(
        lambda **_kwargs: close_worker_async_runtime(config.shutdown_hooks),
        weak=False,
        dispatch_uid="ksu_common.worker_process_shutdown",
    )
    worker_shutdown.connect(
        lambda **_kwargs: close_worker_async_runtime(config.shutdown_hooks),
        weak=False,
        dispatch_uid="ksu_common.worker_shutdown",
    )
    task_prerun.connect(_task_prerun, weak=False, dispatch_uid="ksu_common.task_prerun")
    task_postrun.connect(_task_postrun, weak=False, dispatch_uid="ksu_common.task_postrun")
    return app


__all__ = [
    "TaskQueueConfig",
    "close_worker_async_runtime",
    "create_celery_app",
    "run_worker_async",
]
