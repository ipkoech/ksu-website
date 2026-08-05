#!/usr/bin/env python3
"""Validate the resolved application connection budget before deployment."""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path


def read_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def _integer(values: dict[str, str], name: str, default: int) -> int:
    raw = values.get(name, str(default))
    try:
        value = int(raw)
    except ValueError as exc:
        raise ValueError(f"{name} must be an integer") from exc
    if value < 0:
        raise ValueError(f"{name} must not be negative")
    return value


def validate(values: dict[str, str]) -> tuple[int, int, int]:
    postgres_max = _integer(values, "POSTGRES_MAX_CONNECTIONS", 100)
    reserve = _integer(values, "POSTGRES_CONNECTION_RESERVE", 20)
    pool_size = _integer(values, "DB_POOL_SIZE", 5)
    max_overflow = _integer(values, "DB_MAX_OVERFLOW", 0)
    api_workers = _integer(values, "API_WORKERS", 2)
    celery_concurrency = _integer(values, "CELERY_CONCURRENCY", 1)
    api_replicas = _integer(values, "API_REPLICAS", 1)
    celery_replicas = _integer(values, "CELERY_REPLICAS", 1)

    if pool_size < 1:
        raise ValueError("DB_POOL_SIZE must be at least 1")
    if api_workers < 1 or celery_concurrency < 1:
        raise ValueError("API_WORKERS and CELERY_CONCURRENCY must be at least 1")
    if api_replicas < 1 or celery_replicas < 1:
        raise ValueError("API_REPLICAS and CELERY_REPLICAS must be at least 1")
    if reserve >= postgres_max:
        raise ValueError("POSTGRES_CONNECTION_RESERVE must be below POSTGRES_MAX_CONNECTIONS")

    pool_capacity = pool_size + max_overflow
    possible = (
        (4 * api_replicas * api_workers) + (4 * celery_replicas * celery_concurrency)
    ) * pool_capacity
    budget = postgres_max - reserve
    if possible > budget:
        raise ValueError(
            "database connection budget exceeded: "
            f"possible={possible}, budget={budget}"
        )
    return possible, budget, pool_capacity


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--file", action="append", type=Path, default=[])
    args = parser.parse_args()

    values = dict(os.environ)
    for path in args.file:
        if not path.is_file():
            print(f"error: configuration file is missing: {path}", file=sys.stderr)
            return 2
        values.update(read_env_file(path))
    try:
        possible, budget, pool_capacity = validate(values)
    except ValueError as exc:
        print(f"database capacity validation failed: {exc}", file=sys.stderr)
        return 1
    print(f"database capacity validation passed: possible={possible} budget={budget} pool={pool_capacity}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
