#!/usr/bin/env python3
"""Apply every service migration against one disposable PostgreSQL database."""

from __future__ import annotations

import argparse
import os
import subprocess
import sys

from ci_environment import REPO, SCHEMA_OF, service_environment


ROLE_ENV = {
    "main": ("MAIN_DB_USER", "MAIN_DB_PASSWORD", "ksu_main"),
    "research": ("RESEARCH_DB_USER", "RESEARCH_DB_PASSWORD", "ksu_research"),
    "library": ("LIBRARY_DB_USER", "LIBRARY_DB_PASSWORD", "ksu_library"),
    "heri_africa": ("HERI_DB_USER", "HERI_DB_PASSWORD", "ksu_heri"),
}


def _database_url(service: str, args: argparse.Namespace) -> str:
    user_key, password_key, default_user = ROLE_ENV[service]
    user = os.getenv(user_key, default_user)
    password = os.getenv(password_key)
    if not password:
        raise RuntimeError(f"{password_key} is required")
    return f"postgresql+asyncpg://{user}:{password}@{args.host}:{args.port}/{args.database}"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("services", nargs="*", choices=sorted(SCHEMA_OF))
    parser.add_argument("--host", default=os.getenv("MIGRATION_DATABASE_HOST", "127.0.0.1"))
    parser.add_argument("--port", default=os.getenv("MIGRATION_DATABASE_PORT", "5432"))
    parser.add_argument("--database", default=os.getenv("MIGRATION_DATABASE_NAME", "ksu_migrations_ci"))
    args = parser.parse_args()
    services = args.services or list(SCHEMA_OF)

    for service in services:
        environment = service_environment(service)
        environment["DATABASE_URL"] = _database_url(service, args)
        environment["PYTHONPATH"] = str(REPO / "services" / service)
        print(f"Applying {service} migrations", flush=True)
        result = subprocess.run(
            [sys.executable, "-m", "alembic", "upgrade", "head"],
            cwd=REPO / "services" / service,
            env=environment,
            check=False,
        )
        if result.returncode:
            return result.returncode
    print("all service migrations applied", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
