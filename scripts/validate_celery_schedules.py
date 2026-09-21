#!/usr/bin/env python3
"""Validate service-owned Celery audit schedules and worker policies."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from ci_environment import REPO, SCHEMA_OF, service_environment

SERVICE_EXPECTATIONS: dict[str, dict[str, object]] = {
    "main": {
        "scheduled": {
            "drain-pending-audits": ("main.audit.drain", 1.0, 1.0),
            "observe-pending-audits": ("main.audit.observe", 30.0, 30.0),
        },
        "routed": (
            "main.audit.persist",
            "main.audit.drain",
            "main.audit.observe",
            "main.audit.prune",
        ),
    },
    "research": {
        "scheduled": {
            "relay-pending-audits": ("research.audit.relay", 5.0, 5.0),
            "observe-pending-audits": ("research.audit.observe", 30.0, 30.0),
        },
        "routed": ("research.audit.persist", "research.audit.relay", "research.audit.observe"),
    },
    "library": {
        "scheduled": {
            "relay-pending-audits": ("library.audit.relay", 5.0, 5.0),
            "observe-pending-audits": ("library.audit.observe", 30.0, 30.0),
        },
        "routed": ("library.audit.persist", "library.audit.relay", "library.audit.observe"),
    },
    "heri_africa": {
        "scheduled": {
            "relay-pending-audits": ("heri.audit.relay", 5.0, 5.0),
            "observe-pending-audits": ("heri.audit.observe", 30.0, 30.0),
        },
        "routed": ("heri.audit.persist", "heri.audit.relay", "heri.audit.observe"),
    },
}

PROBE = r'''
import json
from datetime import timedelta
from app.tasks.celery_app import celery_app

def seconds(value):
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, timedelta):
        return value.total_seconds()
    run_every = getattr(value, "run_every", None)
    return run_every.total_seconds() if run_every is not None else None

schedule = {}
for key, entry in celery_app.conf.beat_schedule.items():
    schedule[key] = {
        "task": entry.get("task"),
        "seconds": seconds(entry.get("schedule")),
        "expires": seconds((entry.get("options") or {}).get("expires")),
    }
routes = {}
for task, route in celery_app.conf.task_routes.items():
    if isinstance(route, dict):
        routes[task] = route.get("queue")
print(json.dumps({
    "timezone": celery_app.conf.timezone,
    "enable_utc": bool(celery_app.conf.enable_utc),
    "worker_prefetch_multiplier": celery_app.conf.worker_prefetch_multiplier,
    "task_acks_late": bool(celery_app.conf.task_acks_late),
    "task_reject_on_worker_lost": bool(celery_app.conf.task_reject_on_worker_lost),
    "schedule": schedule,
    "routes": routes,
}))
'''


def _probe(service: str) -> dict[str, object]:
    directory = REPO / "services" / service
    result = subprocess.run(
        [sys.executable, "-c", PROBE],
        cwd=directory,
        env=service_environment(service),
        capture_output=True,
        text=True,
        check=False,
    )
    lines = [line for line in result.stdout.splitlines() if line.startswith("{")]
    if result.returncode or not lines:
        detail = result.stderr.strip()[-1000:] or result.stdout.strip()[-1000:]
        raise RuntimeError(f"{service} Celery app probe failed: {detail}")
    return json.loads(lines[-1])


def _require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"Celery schedule validation failed: {message}")


def main() -> int:
    for service, expected in SERVICE_EXPECTATIONS.items():
        payload = _probe(service)
        _require(
            payload["timezone"] == "Africa/Nairobi",
            f"{service} timezone is not Africa/Nairobi",
        )
        _require(payload["enable_utc"] is True, f"{service} does not enable UTC")
        _require(
            payload["worker_prefetch_multiplier"] == 1,
            f"{service} prefetch multiplier is not one",
        )
        _require(payload["task_acks_late"] is True, f"{service} does not acknowledge tasks late")
        _require(
            payload["task_reject_on_worker_lost"] is True,
            f"{service} does not requeue tasks when a worker is lost",
        )
        schedule = payload["schedule"]
        routes = payload["routes"]
        for key, (task, interval, expires) in expected["scheduled"].items():
            entry = schedule.get(key)
            _require(entry is not None, f"{service} is missing schedule {key}")
            _require(entry["task"] == task, f"{service} schedule {key} targets {entry['task']!r}")
            _require(
                entry["seconds"] == interval,
                f"{service} schedule {key} interval is not {interval:g}s",
            )
            _require(
                entry["expires"] is not None and entry["expires"] <= expires,
                f"{service} schedule {key} has no bounded expiry",
            )
        for task in expected["routed"]:
            _require(
                routes.get(task) == f"{task.split('.')[0]}.audit",
                f"{service} task {task} is not routed to its audit queue",
            )
        print(f"{service}: audit schedules and worker policy passed")
    print("Celery schedule validation passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
