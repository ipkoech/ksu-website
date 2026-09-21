#!/usr/bin/env python3
"""Fail CI when a service route has no concrete response contract."""

from __future__ import annotations

import json
import os
import pathlib
import subprocess
import sys

from ci_environment import service_environment

REPO = pathlib.Path(__file__).resolve().parents[1]
SERVICES = ("main", "research", "library", "heri_africa")
PROBE = """
import json
from collections import Counter
from app.main import create_app
from ksu_common.response_validation import _iter_route_inspections

app = create_app()
coverage = app.state.response_model_coverage
route_keys = [
    (inspection.path, tuple(sorted(inspection.route.methods or ())))
    for inspection in _iter_route_inspections(app.routes)
]
duplicates = sum(count - 1 for count in Counter(route_keys).values() if count > 1)
print(json.dumps({
    "missing": len(coverage.missing),
    "nonconcrete": len(coverage.nonconcrete),
    "invalid_exemptions": len(coverage.invalid_exemptions),
    "duplicate_routes": duplicates,
}))
"""


def main() -> int:
    python_bin = os.getenv("PYTHON_BIN", sys.executable)
    failures: list[str] = []
    for service in SERVICES:
        process = subprocess.run(
            [python_bin, "-c", PROBE],
            cwd=REPO / "services" / service,
            env=service_environment(service),
            capture_output=True,
            text=True,
            check=False,
        )
        if process.returncode:
            failures.append(f"{service}: probe failed\n{process.stderr.strip()}")
            continue
        try:
            result = json.loads(process.stdout.strip().splitlines()[-1])
        except (IndexError, json.JSONDecodeError) as exc:
            failures.append(f"{service}: invalid probe output ({exc})")
            continue
        if any(result.values()):
            failures.append(f"{service}: {result}")
        else:
            print(f"{service}: response-model coverage passed")
    if failures:
        print("\n".join(failures), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
