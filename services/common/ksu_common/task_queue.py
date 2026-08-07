"""Common Celery application configuration for service-owned task queues."""

from __future__ import annotations

import asyncio
import threading
import uuid
from collections.abc import Awaitable, Callable, Iterable, Mapping
from dataclasses import dataclass, field
from time import perf_counter
from typing import Any

from .observability import (
    CompositeMetricsSink,
    Metrics,
    current_correlation_id,
    current_request_id,
    get_prometheus_registry,
    request_context,
)
from .worker_metrics import (
    MultiprocessMetricsSink,
    mark_worker_process_dead,
    start_worker_metrics_server,
    stop_worker_metrics_server,
    worker_metrics_config_from_environment,
)

_task_context = threading.local()
_MAX_TASK_LABEL_LENGTH = 128
_MAX_TASK_LATENCY_MS = 3_600_000.0


@dataclass
class _TaskObservation:
    metrics: Metrics
    task_name: str
    started_at: float
    request_context: Any


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
    metrics: Metrics | None = None
    task_acks_late: bool = True
    task_reject_on_worker_lost: bool = True
    worker_prefetch_multiplier: int = 1


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


def _bounded_task_name(task: Any = None, *, sender: Any = None) -> str:
    source = task if task is not None else sender
    candidate = getattr(source, "name", None) or str(source or "unknown")
    return str(candidate).replace("\r", " ").replace("\n", " ").strip()[:_MAX_TASK_LABEL_LENGTH]


def _task_metrics(task: Any = None, *, sender: Any = None) -> Metrics:
    source = task if task is not None else sender
    app = getattr(source, "app", None)
    return getattr(app, "_ksu_metrics", None) or Metrics()


def _task_tags(task_name: str, state: str) -> dict[str, str]:
    return {"task": task_name[:_MAX_TASK_LABEL_LENGTH], "state": state[:64]}


def _task_prerun(
    task_id: str | None = None,
    task: Any = None,
    sender: Any = None,
    **_kwargs: Any,
) -> None:
    task_name = _bounded_task_name(task, sender=sender)
    metrics = _task_metrics(task, sender=sender)
    metrics.increment("celery.task.count", tags=_task_tags(task_name, "started"))
    context = request_context(f"celery-{task_id or uuid.uuid4()}")
    context.__enter__()
    _task_context.observation = _TaskObservation(
        metrics=metrics,
        task_name=task_name,
        started_at=perf_counter(),
        request_context=context,
    )


def _task_retry(task: Any = None, sender: Any = None, **_kwargs: Any) -> None:
    observation = getattr(_task_context, "observation", None)
    metrics = observation.metrics if observation else _task_metrics(task, sender=sender)
    task_name = observation.task_name if observation else _bounded_task_name(task, sender=sender)
    metrics.increment("celery.task.retry", tags=_task_tags(task_name, "retry"))


def _task_failure(
    task: Any = None,
    sender: Any = None,
    exception: BaseException | None = None,
    **_kwargs: Any,
) -> None:
    observation = getattr(_task_context, "observation", None)
    metrics = observation.metrics if observation else _task_metrics(task, sender=sender)
    task_name = observation.task_name if observation else _bounded_task_name(task, sender=sender)
    tags = _task_tags(task_name, "failure")
    tags["exception"] = type(exception).__name__[:64] if exception is not None else "unknown"
    metrics.increment("celery.task.failure", tags=tags)


def _task_rejected(
    request: Any = None,
    message: Any = None,
    reason: Any = None,
    requeue: bool | None = None,
    task: Any = None,
    sender: Any = None,
    **_kwargs: Any,
) -> None:
    if requeue is True:
        return
    metrics = _task_metrics(task, sender=sender)
    request_task = getattr(request, "task", None)
    message_headers = getattr(message, "headers", None) or {}
    if isinstance(message, Mapping):
        message_headers = message.get("headers") or message
    message_task = message_headers.get("task") if isinstance(message_headers, Mapping) else None
    source = task if task is not None else (request_task or message_task)
    task_name = _bounded_task_name(source, sender=sender)
    metrics.increment("celery.task.dead_letter", tags=_task_tags(task_name, "dead_letter"))


def _task_postrun(**_kwargs: Any) -> None:
    observation = getattr(_task_context, "observation", None)
    if observation is not None:
        duration_ms = min(
            max(0.0, (perf_counter() - observation.started_at) * 1000),
            _MAX_TASK_LATENCY_MS,
        )
        state = str(_kwargs.get("state") or "complete")
        observation.metrics.observe_latency(
            "celery.task.latency_ms",
            duration_ms,
            tags=_task_tags(observation.task_name, state),
        )
        observation.request_context.__exit__(None, None, None)
        del _task_context.observation


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
    from celery.signals import (
        task_failure,
        task_postrun,
        task_prerun,
        task_rejected,
        task_retry,
        worker_process_shutdown,
        worker_ready,
        worker_shutdown,
    )

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
        task_acks_late=config.task_acks_late,
        task_reject_on_worker_lost=config.task_reject_on_worker_lost,
        worker_prefetch_multiplier=config.worker_prefetch_multiplier,
        task_default_queue=config.default_queue,
        task_routes=dict(config.task_routes),
        beat_schedule=dict(config.beat_schedule),
    )
    worker_metrics_config = worker_metrics_config_from_environment(
        broker_url=config.broker_url,
        default_queue=config.default_queue,
        task_routes=config.task_routes,
    )
    if config.metrics is not None:
        app._ksu_metrics = config.metrics
    else:
        sinks = [get_prometheus_registry()]
        if worker_metrics_config is not None:
            sinks.append(MultiprocessMetricsSink())
        app._ksu_metrics = Metrics(CompositeMetricsSink(*sinks))
    packages = tuple(task_packages)
    if packages:
        app.autodiscover_tasks(list(packages))
    if config.imports:
        app.conf.imports = tuple(config.imports)
    worker_process_shutdown.connect(
        lambda **_kwargs: close_worker_async_runtime(config.shutdown_hooks),
        weak=False,
        dispatch_uid=f"ksu_common.worker_process_shutdown.{config.name}",
    )
    worker_shutdown.connect(
        lambda **_kwargs: close_worker_async_runtime(config.shutdown_hooks),
        weak=False,
        dispatch_uid=f"ksu_common.worker_shutdown.{config.name}",
    )
    worker_process_shutdown.connect(
        lambda **_kwargs: mark_worker_process_dead(),
        weak=False,
        dispatch_uid=f"ksu_common.worker_process_shutdown_metrics.{config.name}",
    )
    worker_shutdown.connect(
        lambda **_kwargs: stop_worker_metrics_server(),
        weak=False,
        dispatch_uid=f"ksu_common.worker_shutdown_metrics.{config.name}",
    )
    if worker_metrics_config is not None:
        worker_ready.connect(
            lambda **_kwargs: start_worker_metrics_server(worker_metrics_config),
            weak=False,
            dispatch_uid=f"ksu_common.worker_ready_metrics.{config.name}",
        )
    task_prerun.connect(_task_prerun, weak=False, dispatch_uid="ksu_common.task_prerun")
    task_postrun.connect(_task_postrun, weak=False, dispatch_uid="ksu_common.task_postrun")
    task_retry.connect(_task_retry, weak=False, dispatch_uid="ksu_common.task_retry")
    task_failure.connect(_task_failure, weak=False, dispatch_uid="ksu_common.task_failure")
    task_rejected.connect(_task_rejected, weak=False, dispatch_uid="ksu_common.task_rejected")
    return app


__all__ = [
    "TaskQueueConfig",
    "close_worker_async_runtime",
    "create_celery_app",
    "run_worker_async",
]
