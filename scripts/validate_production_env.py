#!/usr/bin/env python3
"""Validate deployment configuration without printing secret values."""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path
from urllib.parse import urlparse

PLACEHOLDERS = {
    "change-me", "change-me-internal", "password", "secret",
    "replace_with_strong_random_secret", "replace_with_strong_internal_api_key",
    "replace_local_postgres_password", "replace_with_gemini_api_key",
    "replace_smtp_host", "replace_smtp_username", "replace_smtp_app_password",
    "replace_from_email",
}
REQUIRED = (
    "APP_ENV", "DATABASE_URL", "REDIS_URL", "JWT_PUBLIC_KEY_B64",
    "JWT_KEY_ID", "JWT_ALGORITHM", "JWT_ISSUER", "JWT_AUDIENCE", "INTERNAL_API_KEY", "CORS_ORIGINS",
)
SERVICE_REQUIRED = {
    "main": ("JWT_PRIVATE_KEY_B64", "SMTP_HOST", "SMTP_PASSWORD", "EMAIL_FROM"),
    "research": (),
    "library": (),
    "heri_africa": (),
}


def read_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    for number, raw in enumerate(path.read_text().splitlines(), 1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            raise ValueError(f"{path}:{number}: expected KEY=VALUE")
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def is_placeholder(value: str) -> bool:
    normalized = value.strip().lower()
    return (
        normalized in PLACEHOLDERS
        or normalized.startswith(("replace_", "generate_", "url_encoded_"))
        or "example.invalid" in normalized
        or normalized.startswith("approved-off-server-")
    )


def validate(values: dict[str, str], environment: str, service: str | None) -> list[str]:
    if environment in {"development", "dev", "test", "testing"}:
        return []
    errors: list[str] = []
    for key in (*REQUIRED, *SERVICE_REQUIRED.get(service or "", ())):
        value = values.get(key, "")
        if not value:
            errors.append(f"{key} is required")
        elif is_placeholder(value):
            errors.append(f"{key} contains a placeholder value")
    for key in ("INTERNAL_API_KEY",):
        if values.get(key) and len(values[key]) < 32:
            errors.append(f"{key} must be at least 32 characters")
    database_url = values.get("DATABASE_URL", "")
    if database_url and not database_url.startswith("postgresql+asyncpg://"):
        errors.append("DATABASE_URL must use the postgresql+asyncpg scheme")
    for key in ("DATABASE_URL", "REDIS_URL"):
        parsed = urlparse(values.get(key, ""))
        if environment == "production" and parsed.scheme in {"http", "redis"}:
            errors.append(f"{key} must use an encrypted scheme in production")
    if "*" in values.get("CORS_ORIGINS", ""):
        errors.append("CORS_ORIGINS must not contain '*' outside development")
    if values.get("DEBUG", "").lower() in {"1", "true", "yes", "on"}:
        errors.append("DEBUG must be disabled outside development")
    if values.get("JWT_ALGORITHM") != "RS256":
        errors.append("JWT_ALGORITHM must be RS256 outside development")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--env", default=os.getenv("APP_ENV", "development"))
    parser.add_argument("--service", choices=sorted(SERVICE_REQUIRED))
    parser.add_argument("--file", action="append", type=Path, default=[])
    args = parser.parse_args()
    values = dict(os.environ)
    for path in args.file:
        if not path.is_file():
            print(f"error: configuration file is missing: {path}", file=sys.stderr)
            return 2
        try:
            file_values = read_env_file(path)
        except ValueError as error:
            print(f"error: invalid configuration syntax ({error})", file=sys.stderr)
            return 2
        for key, value in file_values.items():
            values.setdefault(key, value)
    values["APP_ENV"] = args.env
    errors = validate(values, args.env.lower(), args.service)
    if errors:
        print(f"production configuration validation failed for {args.env}", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"configuration validation passed for {args.env}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
