from __future__ import annotations

import os
import subprocess
import sys

from prometheus_client import CollectorRegistry, generate_latest

from ksu_common.worker_metrics import (
    QueueDepthCollector,
    WorkerMetricsConfig,
    worker_metrics_config_from_environment,
)


class _Redis:
    def __init__(self, depths: dict[str, int], *, fail: bool = False) -> None:
        self.depths = depths
        self.fail = fail

    def llen(self, queue: str) -> int:
        if self.fail:
            raise RuntimeError("redis unavailable")
        return self.depths.get(queue, 0)


def test_worker_metrics_config_reads_explicit_port_and_queues(monkeypatch) -> None:
    monkeypatch.setenv("KSU_WORKER_METRICS_PORT", "9107")
    monkeypatch.setenv("KSU_WORKER_METRICS_HOST", "127.0.0.1")
    monkeypatch.setenv("PROMETHEUS_MULTIPROC_DIR", "/tmp/ksu-prometheus")
    monkeypatch.setenv("CELERY_QUEUES", "main.default,main.email")

    config = worker_metrics_config_from_environment(
        broker_url="redis://redis:6379/0",
        default_queue="main.default",
        task_routes={"task": {"queue": "main.notifications"}},
    )

    assert config == WorkerMetricsConfig(
        port=9107,
        host="127.0.0.1",
        redis_url="redis://redis:6379/0",
        queues=("main.default", "main.email"),
        multiprocess_dir="/tmp/ksu-prometheus",
    )


def test_queue_depth_collector_is_scrape_time_and_reports_redis_failures() -> None:
    registry = CollectorRegistry()
    registry.register(
        QueueDepthCollector(
            redis_url="redis://unused",
            queues=("main.default", "main.email"),
            redis_client=_Redis({"main.default": 4, "main.email": 0}),
        )
    )

    body = generate_latest(registry).decode()

    assert 'ksu_celery_queue_depth{queue="main.default"} 4.0' in body
    assert 'ksu_celery_queue_depth{queue="main.email"} 0.0' in body
    assert "ksu_celery_queue_depth_scrape_success 1.0" in body

    failed_registry = CollectorRegistry()
    failed_registry.register(
        QueueDepthCollector(
            redis_url="redis://unused",
            queues=("main.default",),
            redis_client=_Redis({}, fail=True),
        )
    )
    failed_body = generate_latest(failed_registry).decode()

    assert 'ksu_celery_queue_depth{queue="main.default"} 0.0' in failed_body
    assert "ksu_celery_queue_depth_scrape_success 0.0" in failed_body


def test_task_metrics_are_aggregated_from_prometheus_multiprocess_files(
    monkeypatch, tmp_path
) -> None:
    script = """
from prometheus_client import CollectorRegistry, generate_latest
from prometheus_client.multiprocess import MultiProcessCollector
from ksu_common.worker_metrics import MultiprocessMetricsSink

sink = MultiprocessMetricsSink()
sink.increment("celery.task.count", 1, tags={"task": "main.email", "state": "started"})
sink.observe_latency("celery.task.latency_ms", 125, tags={"task": "main.email", "state": "SUCCESS"})
registry = CollectorRegistry()
MultiProcessCollector(registry)
print(generate_latest(registry).decode())
"""
    environment = os.environ | {"PROMETHEUS_MULTIPROC_DIR": str(tmp_path)}
    result = subprocess.run(
        [sys.executable, "-c", script],
        check=True,
        capture_output=True,
        text=True,
        env=environment,
    )
    body = result.stdout

    assert (
        'ksu_celery_task_count_total{state="started",task="main.email"} 1.0' in body
    )
    assert 'ksu_celery_task_latency_ms_count{state="SUCCESS",task="main.email"} 1.0' in body
