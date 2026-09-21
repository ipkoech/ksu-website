#!/usr/bin/env python3
"""Exercise forbidden-scope behavior without creating users or domain rows.

Research, Library and HERI evaluate a decoded token's permission claims in their
service guard. The smoke overrides only the token decoder with an empty-scope
payload, so the selected requests stop at authorization before domain queries.
Main's role/session-backed scope guard remains covered by its database-focused
authorization tests and is intentionally not bypassed here.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

from ci_environment import REPO, service_environment

CASES: dict[str, tuple[tuple[str, str, tuple[int, ...]], ...]] = {
    "research": (
        ("GET", "/api/v1/analytics/dashboard", (403,)),
        ("GET", "/api/v1/ask-ai/conversations", (403,)),
    ),
    "library": (("GET", "/api/v1/library/stats/admin", (403,)),),
    "heri_africa": (("GET", "/api/v1/heri/admin/dashboard", (403,)),),
}

PROBE = r'''
import json
import os
from fastapi.testclient import TestClient
from ksu_common.auth import TokenPayload
from app.main import create_app
from app.core.auth import get_current_user

app = create_app()
empty_scope_payload = TokenPayload(
    sub="018f18a0-7b54-7d8c-8a13-0d8f7f190001",
    jti="018f18a0-7b54-7d8c-8a13-0d8f7f190002",
    roles=[],
    raw={"sub": "018f18a0-7b54-7d8c-8a13-0d8f7f190001", "scope_grants": []},
)
app.dependency_overrides[get_current_user] = lambda: empty_scope_payload
client = TestClient(app)
cases = json.loads(os.environ["KSU_FORBIDDEN_CASES"])
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
    child_env["KSU_FORBIDDEN_CASES"] = json.dumps(CASES[service])
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
        raise RuntimeError(f"{service}: forbidden-scope probe emitted no JSON")
    results = json.loads(lines[-1])
    if not all(item["ok"] for item in results):
        raise AssertionError(f"{service}: forbidden-scope mismatch: {results}")
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
    environments = {service: service_environment(service) for service in CASES}
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.max_workers) as executor:
        results = dict(
            executor.map(
                lambda service: probe_service(service, environments[service]),
                CASES,
            )
        )
    artifact = {
        "captured_at": "2026-09-06",
        "command": f"python scripts/forbidden_scope_smoke.py {args.output.as_posix()} --max-workers {args.max_workers}",
        "services": dict(sorted(results.items())),
        "limitations": [
            "Main's session/role-backed scope guard is not bypassed by this smoke; Main scope outcomes remain covered by database-backed authorization tests.",
            "This covers empty-scope forbidden responses for selected Research, Library and HERI routes only; it does not prove record ownership or every permission name.",
        ],
        "result": "passed",
    }
    args.output.write_text(json.dumps(artifact, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    for service, report in sorted(results.items()):
        print(service, report["passed"], "forbidden-scope cases passed", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
