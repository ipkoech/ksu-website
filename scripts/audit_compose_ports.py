#!/usr/bin/env python3
"""Fail when internal services publish host ports in a production Compose model."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys

INTERNAL = {"main", "research", "library", "postgres", "redis", "celery-main", "celery-library", "celery-research", "web-prod", "admin-prod", "research-web-prod", "library-web-prod", "gateway", "research-gateway"}
ALLOWED = {"edge", "research-edge"}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("compose", nargs="+", help="Compose files, in overlay order")
    args = parser.parse_args()
    command = ["docker", "compose"]
    for path in args.compose:
        command.extend(("-f", path))
    command.extend(("config", "--format", "json"))
    try:
        model = json.loads(subprocess.check_output(command, text=True))
    except (FileNotFoundError, subprocess.CalledProcessError, json.JSONDecodeError) as error:
        print(f"error: unable to render Compose configuration: {error}", file=sys.stderr)
        return 2
    violations: list[str] = []
    for name, service in model.get("services", {}).items():
        if name not in INTERNAL or name in ALLOWED:
            continue
        for port in service.get("ports", []) or []:
            published = port.get("published") if isinstance(port, dict) else port
            violations.append(f"{name} publishes host port {published}")
    if violations:
        print("production Compose port audit failed", file=sys.stderr)
        print("\n".join(f"- {item}" for item in violations), file=sys.stderr)
        return 1
    print("production Compose port audit passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
