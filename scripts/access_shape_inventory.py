#!/usr/bin/env python3
"""Capture route access-shape metadata without making application requests.

Each service is imported in an isolated subprocess. The report classifies routes by
whether the FastAPI dependency graph contains the repository's identity, scope,
API-key or internal-key guards. It is a static access-shape inventory, not proof of
runtime authorization outcomes.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import subprocess
import sys
from collections import Counter
from pathlib import Path
from typing import Any

from ci_environment import REPO, SCHEMA_OF, service_environment

PROBE = r'''
import json
from ksu_common.response_validation import _iter_route_inspections
from app.main import create_app

def walk(dep):
    yield dep
    for child in getattr(dep, "dependencies", ()):
        yield from walk(child)

app = create_app()
entries = []
for inspection in _iter_route_inspections(app.routes):
    route = inspection.route
    calls = []
    for dep in walk(route.dependant):
        call = getattr(dep, "call", None)
        if call is not None:
            calls.append(getattr(call, "__qualname__", getattr(call, "__name__", str(call))))
    entries.append({
        "path": inspection.path,
        "methods": sorted(route.methods or ()),
        "dependencies": sorted(set(calls)),
    })
print(json.dumps({"redirect_slashes": app.router.redirect_slashes, "routes": entries}, sort_keys=True))
'''

AUTH_MARKERS = (
    "httpbearer",
    "get_current_",
    "require_scope",
    "get_token_payload",
    "get_api_key_user",
    "require_permission",
)


def classify(route: dict[str, Any]) -> str:
    lower = " ".join(route["dependencies"]).lower()
    if "internal_key_guard" in lower or route["path"].startswith("/api/v1/internal"):
        return "internal_key"
    if any(marker in lower for marker in AUTH_MARKERS):
        return "identity_or_scope"
    return "public_or_unclassified"


def stable_dependency_name(dependency: str) -> str:
    """Remove process-specific repr addresses from security marker evidence."""

    if dependency.startswith("<fastapi.security.http.HTTPBearer object at "):
        return "HTTPBearer"
    return dependency


def inspect_service(service: str, environment: dict[str, str]) -> tuple[str, dict[str, Any]]:
    result = subprocess.run(
        [sys.executable, "-c", PROBE],
        cwd=REPO / "services" / service,
        env=environment,
        capture_output=True,
        text=True,
        check=True,
        timeout=120,
    )
    lines = [line for line in result.stdout.splitlines() if line.lstrip().startswith("{")]
    if not lines:
        raise RuntimeError(f"{service}: app probe emitted no JSON")
    payload = json.loads(lines[-1])
    routes = payload["routes"]
    access = Counter(classify(route) for route in routes)
    methods = Counter(method for route in routes for method in route["methods"])
    dependency_markers = Counter(
        stable_dependency_name(dependency)
        for route in routes
        for dependency in route["dependencies"]
        if any(marker in dependency.lower() for marker in AUTH_MARKERS + ("internal_key_guard",))
    )
    examples: dict[str, dict[str, Any]] = {}
    for route in routes:
        bucket = classify(route)
        examples.setdefault(bucket, {"path": route["path"], "methods": route["methods"]})
    return service, {
        "effective_routes": len(routes),
        "redirect_slashes": bool(payload["redirect_slashes"]),
        "access_shape": dict(sorted(access.items())),
        "methods": dict(sorted(methods.items())),
        "guard_dependency_markers": dict(sorted(dependency_markers.items())),
        "examples": examples,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    parser.add_argument("--max-workers", type=int, default=2)
    args = parser.parse_args()
    if args.max_workers < 1 or args.max_workers > 2:
        parser.error("--max-workers must be between 1 and 2 to keep imports bounded")
    if args.output.exists():
        raise SystemExit(f"refusing to overwrite existing evidence: {args.output}")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    environments = {service: service_environment(service) for service in SCHEMA_OF}
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.max_workers) as executor:
        results = dict(
            executor.map(
                lambda service: inspect_service(service, environments[service]),
                SCHEMA_OF,
            )
        )
    artifact = {
        "captured_at": "2026-09-06",
        "command": f"python scripts/access_shape_inventory.py {args.output.as_posix()} --max-workers {args.max_workers}",
        "services": dict(sorted(results.items())),
        "limitations": [
            "Dependency markers classify declared access shape only; they do not prove anonymous, forbidden, missing-resource or record-ownership outcomes.",
            "The probe imports each app in an isolated subprocess and makes no HTTP requests or database mutations.",
        ],
        "result": "passed",
    }
    args.output.write_text(json.dumps(artifact, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    for service, report in sorted(results.items()):
        print(service, report["effective_routes"], report["access_shape"], flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
