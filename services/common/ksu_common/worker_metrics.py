"""Prometheus metrics and queue-depth exporter for Celery workers.

Task counters and histograms use the Prometheus client's multiprocess files so
Celery prefork children are aggregated by one worker-local scrape endpoint.
Queue depth is collected directly from Redis at scrape time; it is shared
state and must not be represented as a per-process gauge.
"""

from __future__ import annotations

import logging
import os
import re
from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path
from socketserver import ThreadingMixIn
from threading import Lock, Thread
from typing import Any
from wsgiref.simple_server import WSGIRequestHandler, WSGIServer, make_server

logger = logging.getLogger("ksu.worker_metrics")

_METRIC_NAME = re.compile(r"[^a-zA-Z0-9_:]")
_DEFAULT_PORT = 0
_DEFAULT_HOST = "0.0.0.0"
_DEFAULT_REDIS_TIMEOUT = 0.5
_worker_metrics_server: _WorkerMetricsServer | None = None
_worker_metrics_server_lock = Lock()


@dataclass(frozen=True, slots=True)
class WorkerMetricsConfig:
    """Configuration for the worker-local Prometheus endpoint."""

    port: int
    host: str
    redis_url: str
    queues: tuple[str, ...]
    multiprocess_dir: str


def _parse_port(value: str | None) -> int:
    if value is None or not value.strip():
        return _DEFAULT_PORT
    try:
        port = int(value)
    except ValueError as exc:
        raise ValueError("KSU_WORKER_METRICS_PORT must be an integer") from exc
    if port < 0 or port > 65535:
        raise ValueError("KSU_WORKER_METRICS_PORT must be between 0 and 65535")
    return port


def _unique_queues(values: list[str]) -> tuple[str, ...]:
    queues: list[str] = []
    for value in values:
        queue = value.strip()
        if queue and queue not in queues:
            queues.append(queue)
    return tuple(queues)


def worker_metrics_config_from_environment(
    *,
    broker_url: str,
    default_queue: str,
    task_routes: Mapping[str, Mapping[str, str]],
) -> WorkerMetricsConfig | None:
    """Build worker exporter settings without enabling it in HTTP processes."""

    port = _parse_port(os.getenv("KSU_WORKER_METRICS_PORT"))
    if port == 0:
        return None

    multiprocess_dir = os.getenv("PROMETHEUS_MULTIPROC_DIR", "").strip()
    if not multiprocess_dir:
        raise RuntimeError(
            "PROMETHEUS_MULTIPROC_DIR is required when worker metrics are enabled"
        )

    configured_queues = os.getenv("CELERY_QUEUES", "")
    queues = _unique_queues(
        configured_queues.split(",")
        if configured_queues.strip()
        else [
            default_queue,
            *[
                route.get("queue", "")
                for route in task_routes.values()
                if isinstance(route, Mapping)
            ],
        ]
    )
    if not queues:
        raise RuntimeError("at least one Celery queue is required for worker metrics")

    return WorkerMetricsConfig(
        port=port,
        host=os.getenv("KSU_WORKER_METRICS_HOST", _DEFAULT_HOST).strip() or _DEFAULT_HOST,
        redis_url=os.getenv("KSU_WORKER_METRICS_REDIS_URL", broker_url),
        queues=queues,
        multiprocess_dir=multiprocess_dir,
    )


def _prometheus_base_name(name: str) -> str:
    normalized = _METRIC_NAME.sub("_", str(name).strip()).strip("_").lower()
    if not normalized or not (normalized[0].isalpha() or normalized[0] == "_"):
        normalized = f"metric_{normalized}"
    normalized = normalized.removesuffix("_total")
    return f"ksu_{normalized}"


class MultiprocessMetricsSink:
    """Metrics sink backed by prometheus-client's multiprocess storage."""

    def __init__(self) -> None:
        self._counters: dict[str, tuple[Any, tuple[str, ...]]] = {}
        self._histograms: dict[str, tuple[Any, tuple[str, ...]]] = {}
        self._lock = Lock()

    @staticmethod
    def _labels(tags: Mapping[str, str]) -> tuple[str, ...]:
        return tuple(sorted(str(key) for key in tags))

    def _counter(self, name: str, tags: Mapping[str, str]) -> tuple[Any, tuple[str, ...]]:
        from prometheus_client import Counter

        base_name = _prometheus_base_name(name)
        with self._lock:
            current = self._counters.get(base_name)
            if current is None:
                label_names = self._labels(tags)
                current = (Counter(base_name, f"KSU {base_name} total", label_names), label_names)
                self._counters[base_name] = current
            return current

    def _histogram(self, name: str, tags: Mapping[str, str]) -> tuple[Any, tuple[str, ...]]:
        from prometheus_client import Histogram

        base_name = _prometheus_base_name(name)
        with self._lock:
            current = self._histograms.get(base_name)
            if current is None:
                label_names = self._labels(tags)
                current = (
                    Histogram(base_name, f"KSU {base_name} latency", label_names),
                    label_names,
                )
                self._histograms[base_name] = current
            return current

    def increment(self, name: str, value: int, *, tags: dict[str, str]) -> None:
        metric, label_names = self._counter(name, tags)
        metric.labels(**{label: tags.get(label, "") for label in label_names}).inc(value)

    def observe_latency(self, name: str, duration_ms: float, *, tags: dict[str, str]) -> None:
        metric, label_names = self._histogram(name, tags)
        metric.labels(**{label: tags.get(label, "") for label in label_names}).observe(
            max(0.0, float(duration_ms)) / 1000
        )


class QueueDepthCollector:
    """Collect Redis list lengths for configured Celery queues at scrape time."""

    def __init__(
        self,
        *,
        redis_url: str,
        queues: tuple[str, ...],
        redis_client: Any | None = None,
    ) -> None:
        self.redis_url = redis_url
        self.queues = queues
        self._redis_client = redis_client

    def _client(self) -> Any:
        if self._redis_client is None:
            from redis import Redis

            self._redis_client = Redis.from_url(
                self.redis_url,
                socket_connect_timeout=_DEFAULT_REDIS_TIMEOUT,
                socket_timeout=_DEFAULT_REDIS_TIMEOUT,
            )
        return self._redis_client

    def collect(self):
        from prometheus_client.core import GaugeMetricFamily

        depth = GaugeMetricFamily(
            "ksu_celery_queue_depth",
            "Number of messages waiting in a Celery Redis queue",
            labels=["queue"],
        )
        success = 1.0
        try:
            redis_client = self._client()
            for queue in self.queues:
                try:
                    value = float(redis_client.llen(queue))
                except Exception:
                    logger.exception("celery queue depth collection failed", extra={"queue": queue})
                    value = 0.0
                    success = 0.0
                depth.add_metric([queue], value)
        except Exception:
            logger.exception("celery queue depth Redis connection failed")
            for queue in self.queues:
                depth.add_metric([queue], 0.0)
            success = 0.0

        scrape_success = GaugeMetricFamily(
            "ksu_celery_queue_depth_scrape_success",
            "Whether the most recent Celery queue depth scrape succeeded",
        )
        scrape_success.add_metric([], success)
        yield depth
        yield scrape_success


class _ThreadedWSGIServer(ThreadingMixIn, WSGIServer):
    daemon_threads = True
    allow_reuse_address = True


class _NoAccessLogHandler(WSGIRequestHandler):
    def log_message(self, _format: str, *_args: Any) -> None:
        return


class _WorkerMetricsServer:
    def __init__(self, config: WorkerMetricsConfig) -> None:
        from prometheus_client import CollectorRegistry, make_wsgi_app
        from prometheus_client.multiprocess import MultiProcessCollector

        registry = CollectorRegistry()
        MultiProcessCollector(registry)
        registry.register(QueueDepthCollector(redis_url=config.redis_url, queues=config.queues))
        self._server = make_server(
            config.host,
            config.port,
            make_wsgi_app(registry),
            server_class=_ThreadedWSGIServer,
            handler_class=_NoAccessLogHandler,
        )
        self.port = self._server.server_port
        self._thread = Thread(target=self._server.serve_forever, name="ksu-worker-metrics", daemon=True)

    def start(self) -> None:
        self._thread.start()

    def close(self) -> None:
        self._server.shutdown()
        self._server.server_close()
        self._thread.join(timeout=2)


def start_worker_metrics_server(config: WorkerMetricsConfig) -> int:
    """Start one exporter in the Celery worker parent process."""

    global _worker_metrics_server
    Path(config.multiprocess_dir).mkdir(parents=True, exist_ok=True)
    os.environ["PROMETHEUS_MULTIPROC_DIR"] = config.multiprocess_dir
    with _worker_metrics_server_lock:
        if _worker_metrics_server is None:
            _worker_metrics_server = _WorkerMetricsServer(config)
            _worker_metrics_server.start()
        return _worker_metrics_server.port


def stop_worker_metrics_server() -> None:
    global _worker_metrics_server
    with _worker_metrics_server_lock:
        server = _worker_metrics_server
        _worker_metrics_server = None
    if server is not None:
        server.close()


def mark_worker_process_dead() -> None:
    """Remove dead-child gauge files without touching counters or histograms."""

    if not os.getenv("PROMETHEUS_MULTIPROC_DIR"):
        return
    from prometheus_client import multiprocess

    multiprocess.mark_process_dead(os.getpid())


__all__ = [
    "MultiprocessMetricsSink",
    "QueueDepthCollector",
    "WorkerMetricsConfig",
    "mark_worker_process_dead",
    "start_worker_metrics_server",
    "stop_worker_metrics_server",
    "worker_metrics_config_from_environment",
]
