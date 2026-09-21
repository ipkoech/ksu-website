#!/usr/bin/env python3
"""Verify service-owned Beat schedulers publish audit work to Redis."""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import redis

from celery_queue_smoke import _service_environment, _validate_redis_target

ROOT = Path(__file__).resolve().parents[1]

# Main drains every second; sibling relays run every five seconds. Service
# imports can take several seconds on a cold CI runner, so the observation
# windows include startup time as well as at least one due tick.
SCHEDULES: dict[str, tuple[str, float]] = {
    "main": ("main.audit", 25.0),
    "research": ("research.audit", 30.0),
    "library": ("library.audit", 30.0),
    "heri_africa": ("heri.audit", 30.0),
}


def _check_beat(service: str, queue: str, window: float, redis_url: str) -> None:
    service_dir = ROOT / "services" / service
    environment = _service_environment(service, redis_url, None)
    client = redis.Redis.from_url(redis_url)
    schedule_dir = Path(tempfile.mkdtemp(prefix=f"ksu-beat-{service}-"))
    schedule_file = schedule_dir / "celerybeat-schedule"
    command = [
        sys.executable,
        "-m",
        "celery",
        "-A",
        "app.tasks.celery_app.celery_app",
        "beat",
        "--loglevel=WARNING",
        f"--schedule={schedule_file}",
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
        client.delete(queue)
        deadline = time.monotonic() + window
        while time.monotonic() < deadline:
            if process.poll() is not None:
                output = process.stdout.read() if process.stdout else ""
                raise RuntimeError(
                    f"{service} Beat exited with {process.returncode}: {output[-2000:]}"
                )
            if client.llen(queue):
                print(f"{service}: published to {queue}")
                return
            time.sleep(0.25)
        raise RuntimeError(f"{service} Beat did not publish to {queue} within {window:g}s")
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)
        client.delete(queue)
        client.close()
        shutil.rmtree(schedule_dir, ignore_errors=True)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--redis-url", default=os.getenv("KSU_TEST_REDIS_URL"))
    parser.add_argument("--allow-external-redis", action="store_true", help=argparse.SUPPRESS)
    args = parser.parse_args()
    if not args.redis_url:
        print("celery Beat smoke skipped: --redis-url or KSU_TEST_REDIS_URL is required")
        return 0
    _validate_redis_target(
        args.redis_url,
        allow_external=args.allow_external_redis
        or os.getenv("KSU_ALLOW_CELERY_SMOKE_EXTERNAL") == "1",
    )
    for service, (queue, window) in SCHEDULES.items():
        _check_beat(service, queue, window, args.redis_url)
    print("celery Beat smoke passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
