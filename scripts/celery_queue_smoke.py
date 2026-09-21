#!/usr/bin/env python3
"""Verify live Celery workers advertise only their assigned queues.

The check is intentionally separate from application tests: it starts each
worker with the same queue arguments used by deployment, inspects the worker
through Celery's control channel, delivers one in-memory-only probe task, and
terminates it before starting the next one.  The task never opens PostgreSQL,
so the probe cannot create application writes.
"""

from __future__ import annotations

import argparse
import os
import socket
import subprocess
import sys
import time
import uuid
from pathlib import Path
from urllib.parse import urlparse

from celery import Celery

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = Path(__file__).resolve()
LOCAL_REDIS_HOSTS = {"127.0.0.1", "localhost", "::1"}

SERVICE_QUEUES: dict[str, tuple[tuple[str, ...], tuple[str, ...]]] = {
    "main": (
        (
            "main.default",
            "main.email",
            "main.notifications",
            "main.maintenance",
            "main.social",
            "main.imports",
            "main.media",
            "main.events",
        ),
        ("main.audit",),
    ),
    "research": (
        ("research.default", "research.exports", "research.donations"),
        ("research.audit",),
    ),
    "library": (("library.default", "library.maintenance"), ("library.audit",)),
    "heri_africa": (("heri.default", "heri.publication"), ("heri.audit",)),
}


def _validate_redis_target(redis_url: str, *, allow_external: bool = False) -> None:
    parsed = urlparse(redis_url)
    if parsed.scheme not in {"redis", "rediss"} or not parsed.hostname:
        raise SystemExit("Celery smoke requires a redis:// or rediss:// URL with a host")
    if parsed.hostname not in LOCAL_REDIS_HOSTS and not allow_external:
        raise SystemExit(
            "Celery smoke refuses non-local Redis by default; use --allow-external-redis "
            "only for an explicitly isolated test endpoint"
        )


def _service_environment(service: str, redis_url: str, database_url: str | None) -> dict[str, str]:
    from ci_environment import service_environment

    environment = service_environment(service)
    environment.update(
        {
            "REDIS_URL": redis_url,
            "CELERY_BROKER_URL": redis_url,
            "CELERY_RESULT_BACKEND": redis_url,
            "PYTHONPATH": str(ROOT / "services" / service),
            # CI templates fill blank numeric settings with placeholders. Keep
            # the worker-local exporter disabled so this probe tests Celery
            # queues without binding an arbitrary metrics socket.
            "KSU_WORKER_METRICS_PORT": "0",
        }
    )
    if database_url:
        environment["DATABASE_URL"] = database_url
    return environment


def _active_queues(celery: Celery, node: str) -> set[str] | None:
    response = celery.control.inspect(destination=[node]).active_queues() or {}
    worker = response.get(node)
    if not worker:
        return None
    return {str(queue["name"]) for queue in worker}


def _run_worker(
    service: str,
    queues: tuple[str, ...],
    hostname: str,
    task_name: str,
) -> int:
    """Run the child worker with a task that has no application side effects."""

    from app.tasks.celery_app import celery_app

    @celery_app.task(name=task_name)
    def queue_probe() -> str:
        return task_name

    del queue_probe
    return celery_app.worker_main(
        argv=[
            "worker",
            "--loglevel=WARNING",
            "--pool=solo",
            "--concurrency=1",
            f"--queues={','.join(queues)}",
            f"--hostname={hostname}",
        ]
    )


def _check_worker(
    service: str,
    queues: tuple[str, ...],
    redis_url: str,
    database_url: str | None,
) -> None:
    node = f"queue-smoke-{service}-{uuid.uuid4().hex[:10]}@{socket.gethostname()}"
    task_name = f"ksu.queue_smoke.{uuid.uuid4().hex}"
    service_dir = ROOT / "services" / service
    environment = _service_environment(service, redis_url, database_url)
    command = [
        sys.executable,
        str(SCRIPT),
        "--worker-service",
        service,
        "--worker-queues",
        ",".join(queues),
        "--worker-hostname",
        node,
        "--worker-task",
        task_name,
    ]
    process = subprocess.Popen(
        command,
        cwd=service_dir,
        env=environment,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    try:
        control = Celery(f"queue-smoke-{service}", broker=redis_url, backend=redis_url)
        deadline = time.monotonic() + 20
        observed: set[str] | None = None
        while time.monotonic() < deadline:
            if process.poll() is not None:
                output = process.stdout.read() if process.stdout else ""
                raise RuntimeError(
                    f"{service} worker exited with {process.returncode}: {output[-2000:]}"
                )
            try:
                observed = _active_queues(control, node)
            except Exception:
                observed = None
            if observed is not None:
                break
            time.sleep(0.25)
        if observed is None:
            raise RuntimeError(
                f"{service} worker did not answer inspect before the 20-second deadline"
            )
        result = control.send_task(task_name, queue=queues[0])
        try:
            if result.get(timeout=10) != task_name:
                raise RuntimeError(f"{service} worker returned an unexpected probe result")
        except Exception as exc:  # noqa: BLE001 - avoid leaking broker details.
            raise RuntimeError(f"{service} worker did not complete the Redis probe task") from exc
        expected = set(queues)
        if observed != expected:
            raise RuntimeError(
                f"{service} worker queues mismatch: expected {sorted(expected)}, "
                f"observed {sorted(observed)}"
            )
        print(f"{service}: {','.join(queues)}")
    finally:
        if "control" in locals():
            control.close()
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--redis-url", default=os.getenv("KSU_TEST_REDIS_URL"))
    parser.add_argument("--database-url", default=os.getenv("KSU_TEST_DATABASE_URL"))
    parser.add_argument("--worker-service", choices=tuple(SERVICE_QUEUES), help=argparse.SUPPRESS)
    parser.add_argument("--worker-queues", help=argparse.SUPPRESS)
    parser.add_argument("--worker-hostname", help=argparse.SUPPRESS)
    parser.add_argument("--worker-task", help=argparse.SUPPRESS)
    parser.add_argument("--allow-external-redis", action="store_true", help=argparse.SUPPRESS)
    args = parser.parse_args()
    if args.worker_service:
        if not args.worker_queues or not args.worker_hostname or not args.worker_task:
            parser.error("worker mode requires queue, hostname, and task arguments")
        return _run_worker(
            args.worker_service,
            tuple(filter(None, args.worker_queues.split(","))),
            args.worker_hostname,
            args.worker_task,
        )
    if not args.redis_url:
        print("celery queue smoke skipped: --redis-url or KSU_TEST_REDIS_URL is required")
        return 0
    _validate_redis_target(
        args.redis_url,
        allow_external=args.allow_external_redis
        or os.getenv("KSU_ALLOW_CELERY_SMOKE_EXTERNAL") == "1",
    )
    for service, (ordinary, audit) in SERVICE_QUEUES.items():
        _check_worker(service, ordinary, args.redis_url, args.database_url)
        _check_worker(service, audit, args.redis_url, args.database_url)
    print("celery queue smoke passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
