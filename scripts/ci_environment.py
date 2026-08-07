#!/usr/bin/env python3
"""Run a command with deterministic service settings derived from its template."""

from __future__ import annotations

import argparse
import os
import subprocess
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
SCHEMA_OF = {"main": "main", "research": "research", "library": "library", "heri_africa": "heri"}


def service_environment(service: str) -> dict[str, str]:
    values = dict(os.environ)
    template = REPO / "services" / service / ".env.example"
    for raw in template.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        if key.endswith("_DIR") or key in {"UPLOAD_DIR", "LOG_DIR"}:
            value = f"/tmp/ksu-structural/{service}/{key.lower()}"
        values[key] = value or placeholder_setting(key, service)
    return values


def placeholder_setting(key: str, service: str) -> str:
    if key == "APP_ENV":
        return "development"
    if key == "APP_VERSION":
        return "0.0.0-ci"
    if key == "SERVICE_NAME":
        return service
    if key == "DB_SCHEMA":
        return SCHEMA_OF[service]
    if key in {"DATABASE_URL", "READ_DATABASE_URL"}:
        return "postgresql+asyncpg://ci:ci@127.0.0.1:5432/ci"
    if "REDIS" in key or key in {"CELERY_BROKER_URL", "CELERY_RESULT_BACKEND"}:
        return "redis://127.0.0.1:6379/0"
    if key.endswith("_URL"):
        return "http://localhost"
    if key in {"CORS_ORIGINS", "ALLOWED_DOCUMENT_TYPES", "ALLOWED_IMAGE_TYPES", "DB_ROUTE_BUDGETS"}:
        return "[]"
    if key in {"SMS_PROVIDER", "PUSH_PROVIDER"}:
        return "disabled"
    if key in {"DEBUG", "SMTP_USE_TLS"} or key.endswith("_ENABLED"):
        return "false"
    if key.endswith(("_COUNT", "_DAYS", "_HOURS", "_MB", "_MINUTES", "_PORT", "_SECONDS", "_SIZE")):
        return "1"
    if key in {"DB_MAX_OVERFLOW", "DB_POOL_SIZE", "CELERY_CONCURRENCY"}:
        return "1"
    if key == "JWT_ALGORITHM":
        return "HS256"
    if key == "LOG_FORMAT":
        return "json"
    if key == "LOG_LEVEL":
        return "INFO"
    if key.endswith(("_SECRET_KEY", "_API_KEY", "_PASSWORD", "_TOKEN")):
        return "ci-only-placeholder-value-at-least-32-characters"
    return "ci-placeholder"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("service", choices=sorted(SCHEMA_OF))
    parser.add_argument("command", nargs=argparse.REMAINDER)
    args = parser.parse_args()
    command = args.command[1:] if args.command[:1] == ["--"] else args.command
    if not command:
        parser.error("a command is required after the service name")
    return subprocess.run(command, cwd=REPO, env=service_environment(args.service), check=False).returncode


if __name__ == "__main__":
    raise SystemExit(main())
