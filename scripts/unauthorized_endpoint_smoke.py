#!/usr/bin/env python3
"""Exercise representative unauthenticated and internal-key route guards.

The selected requests must be rejected before domain work. They are deliberately
small and use isolated app subprocesses so the smoke cannot create business rows
or consume database capacity from a seeded endpoint run.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

from ci_environment import REPO, SCHEMA_OF, service_environment

CASES: dict[str, tuple[tuple[str, str, tuple[int, ...]], ...]] = {
    "main": (
        ("GET", "/api/v1/me/profile", (401,)),
        ("GET", "/api/v1/admin/system/settings", (401,)),
        ("POST", "/api/v1/internal/audit", (403,)),
    ),
    "research": (
        ("GET", "/api/v1/analytics/dashboard", (401,)),
        ("GET", "/api/v1/audit", (403,)),
    ),
    "library": (
        ("GET", "/api/v1/library/stats/admin", (401,)),
        ("GET", "/api/v1/audit", (403,)),
    ),
    "heri_africa": (
        ("GET", "/api/v1/heri/admin/dashboard", (401,)),
    ),
}

PROBE = r'''
import json
from fastapi.testclient import TestClient
from app.main import create_app

app = create_app()
client = TestClient(app)
cases = json.loads(__import__("os").environ["KSU_UNAUTH_CASES"])
results = []
for method, path, expected in cases:
    response = client.request(method, path)
    results.append({
        "method": method,
        "path": path,
        "status": response.status_code,
        "expected": expected,
        "ok": response.status_code in expected,
    })
print(json.dumps(results, sort_keys=True))
'''


def probe_service(service: str, environment: dict[str, str]) -> tuple[str, dict[str, Any]]:
    child_env = dict(environment)
    child_env["KSU_UNAUTH_CASES"] = json.dumps(CASES[service])
    completed = subprocess.run(
        [sys.executable, "-c", PROBE],
        cwd=REPO / "services" / service,
        env=child_env,
        capture_output=True,
        text=True,
        check=True,
        timeout=120,
    )
    lines = [line for line in completed.stdout.splitlines() if line.lstrip().startswith("[")]
    if not lines:
        raise RuntimeError(f"{service}: unauthorized probe emitted no JSON")
    results = json.loads(lines[-1])
    if not all(item["ok"] for item in results):
        raise AssertionError(f"{service}: route guard mismatch: {results}")
    return service, {"cases": results, "passed": len(results)}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    parser.add_argument("--max-workers", type=int, default=2)
    args = parser.parse_args()
    if args.max_workers < 1 or args.max_workers > 2:
        parser.error("--max-workers must be between 1 and 2")
    if args.output.exists():
        raise SystemExit(f"refusing to overwrite existing evidence: {args.output}")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    environments = {service: service_environment(service) for service in SCHEMA_OF}
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.max_workers) as executor:
        results = dict(
            executor.map(
                lambda service: probe_service(service, environments[service]),
                SCHEMA_OF,
            )
        )
    artifact = {
        "captured_at": "2026-09-06",
        "command": f"python scripts/unauthorized_endpoint_smoke.py {args.output.as_posix()} --max-workers {args.max_workers}",
        "services": dict(sorted(results.items())),
        "limitations": [
            "This covers representative missing-identity and missing-internal-key requests only; it does not prove valid authenticated, forbidden-scope, missing-resource or ownership behavior.",
            "The app subprocesses make no successful domain requests and no intentional database writes; rejected requests may still emit security-audit dispatch attempts when configured.",
        ],
        "result": "passed",
    }
    args.output.write_text(json.dumps(artifact, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    for service, report in sorted(results.items()):
        print(service, report["passed"], "guard cases passed", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
