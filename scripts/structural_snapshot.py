#!/usr/bin/env python3
"""Structural snapshot of the backend, used as refactor regression signal.

The backend test suites were removed at 43308d60, so this is the available
check that a refactor did not change the shape of the system. Capture before a
change, capture after, diff the JSON:

    python scripts/structural_snapshot.py before.json
    ...refactor...
    python scripts/structural_snapshot.py after.json
    diff <(jq -S . before.json) <(jq -S . after.json)

Records per service: whether the app constructs, the full route table, the full
table list plus any table outside the service's own schema, the settings field
count, and the Alembic heads. Plus the kernel's export count and Base.metadata.

It detects structural regressions only. It cannot detect a behaviour change
inside a function body — use ast_identical.py for that.
"""
import json
import os
import pathlib
import re
import subprocess
import sys
from difflib import unified_diff

REPO = pathlib.Path(__file__).resolve().parents[1]
PYTHON_BIN = os.getenv("PYTHON_BIN", sys.executable)
SERVICES = ["main", "research", "library", "heri_africa"]

PROBE = r'''
import json, re, sys
from fastapi.routing import APIRoute
out = {}
try:
    from app.main import create_app
    app = create_app()
    out["constructs"] = True
except Exception as e:
    print(json.dumps({"constructs": False, "error": f"{type(e).__name__}: {e}"}))
    sys.exit(0)

routes = []
def walk(rs):
    for r in rs:
        if type(r).__name__ == "_IncludedRouter":
            walk(r.original_router.routes)
        elif isinstance(r, APIRoute):
            for m in sorted(r.methods):
                routes.append(f"{m} {r.path}")
walk(app.routes)
out["route_count"] = len(routes)
out["routes"] = sorted(set(routes))

from app.models import Base as _B
tables = sorted(_B.metadata.tables)
out["table_count"] = len(tables)
out["foreign_schema_tables"] = [t for t in tables if "." in t and not t.startswith(sys.argv[1] + ".")]
out["tables"] = tables

from app.core.config import get_settings
s = get_settings()
out["settings_fields"] = len(type(s).model_fields)
print(json.dumps(out))
'''

SCHEMA_OF = {"main": "main", "research": "research", "library": "library", "heri_africa": "heri"}


def probe_environment(service: str) -> dict[str, str]:
    """Build deterministic development settings from the complete env template."""

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
    if key == "DATABASE_URL" or key == "READ_DATABASE_URL":
        return "postgresql+asyncpg://ci:ci@127.0.0.1:5432/ci"
    if "REDIS" in key or key in {"CELERY_BROKER_URL", "CELERY_RESULT_BACKEND"}:
        return "redis://127.0.0.1:6379/0"
    if key.endswith("_URL"):
        return "http://localhost"
    if key in {"CORS_ORIGINS", "ALLOWED_DOCUMENT_TYPES", "ALLOWED_IMAGE_TYPES"}:
        return "[]"
    if key == "DB_ROUTE_BUDGETS":
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

snap = {}
for svc in SERVICES:
    d = REPO / "services" / svc
    environment = probe_environment(svc)
    p = subprocess.run(
        [PYTHON_BIN, "-c", PROBE, SCHEMA_OF[svc]],
        cwd=d,
        env=environment,
        capture_output=True,
        text=True,
        check=False,
    )
    line = [output_line for output_line in p.stdout.splitlines() if output_line.startswith("{")]
    snap[svc] = json.loads(line[-1]) if line else {"constructs": False, "error": p.stderr[-300:]}
    # alembic heads
    h = subprocess.run(
        [PYTHON_BIN, "-m", "alembic", "heads"],
        cwd=d,
        env=environment,
        capture_output=True,
        text=True,
        check=False,
    )
    snap[svc]["alembic_heads"] = sorted(re.findall(r"^(\w+)\s*\(head\)", h.stdout, re.MULTILINE)) or ["<error>"]

# kernel state
KERNEL_PROBE = (
    "import ksu_common as k; from ksu_common.models.base import Base; import json; "
    "print(json.dumps({'exports': len(k.__all__), "
    "'base_metadata': sorted(Base.metadata.tables)}))"
)
K = subprocess.run(
    [PYTHON_BIN, "-c", KERNEL_PROBE], cwd=REPO, capture_output=True, text=True, check=False
)
kline = [output_line for output_line in K.stdout.splitlines() if output_line.startswith("{")]
snap["_kernel"] = json.loads(kline[-1]) if kline else {"error": K.stderr[-300:]}
snap["_kernel"]["modules"] = len(list((REPO / "services/common/ksu_common").rglob("*.py")))

if len(sys.argv) not in (2, 4) or (len(sys.argv) == 4 and sys.argv[2] != "--expect"):
    raise SystemExit("usage: structural_snapshot.py OUTPUT [--expect BASELINE]")

with open(sys.argv[1], "w", encoding="utf-8") as fh:
    json.dump(snap, fh, indent=1, sort_keys=True)
for svc in SERVICES:
    s = snap[svc]
    print(f"{svc:12s} constructs={s.get('constructs')!s:5s} routes={s.get('route_count','-'):>4} "
          f"tables={s.get('table_count','-'):>4} foreign={s.get('foreign_schema_tables')!r} heads={s.get('alembic_heads')!r}")
k = snap["_kernel"]
print(f"{'ksu_common':12s} modules={k.get('modules')} exports={k.get('exports')} Base.metadata={k.get('base_metadata')}")

failed = any(not snap[svc].get("constructs") for svc in SERVICES)
failed = failed or any(snap[svc].get("alembic_heads") == ["<error>"] for svc in SERVICES)
failed = failed or "error" in snap["_kernel"]

if len(sys.argv) == 4:
    expected_path = pathlib.Path(sys.argv[3])
    expected = json.loads(expected_path.read_text(encoding="utf-8"))
    if snap != expected:
        before = json.dumps(expected, indent=1, sort_keys=True).splitlines(keepends=True)
        after = json.dumps(snap, indent=1, sort_keys=True).splitlines(keepends=True)
        sys.stdout.writelines(
            unified_diff(before, after, fromfile=str(expected_path), tofile=sys.argv[1])
        )
        failed = True

raise SystemExit(1 if failed else 0)
