#!/usr/bin/env python3
"""Capture effective v1 routes and OpenAPI without importing service apps together.

This records transport declarations, not proof of endpoint authorization or
consumer compatibility. Consumer bindings and live checks are tracked separately.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

from ci_environment import REPO, SCHEMA_OF, service_environment

PROBE = r'''
import json
from app.main import create_app
from ksu_common.response_validation import _iter_route_inspections
app = create_app()
entries = []
for inspection in _iter_route_inspections(app.routes):
    route = inspection.route
    entries.append({
        "path": inspection.path,
        "methods": sorted(route.methods),
        "status_code": route.status_code,
        "endpoint": route.endpoint.__module__ + "." + route.endpoint.__name__,
        "response_model": str(route.response_model),
        "include_in_schema": route.include_in_schema,
    })
print(json.dumps({"redirect_slashes": app.router.redirect_slashes,
                  "routes": sorted(entries, key=lambda r: (r["path"], r["methods"])),
                  "openapi": app.openapi()}, sort_keys=True))
'''


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    # Captures are immutable evidence: do not overwrite an earlier baseline.
    args.output.mkdir(parents=True, exist_ok=False)
    for service in SCHEMA_OF:
        result = subprocess.run(
            [sys.executable, "-c", PROBE], cwd=REPO / "services" / service,
            env=service_environment(service), capture_output=True, text=True, check=True,
        )
        value = json.loads([line for line in result.stdout.splitlines() if line.startswith("{")][-1])
        (args.output / f"{service}.json").write_text(
            json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8",
        )
        print(f"{service}: {len(value['routes'])} effective route entries", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
