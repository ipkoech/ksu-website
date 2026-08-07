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
import pathlib
import re
import subprocess
import sys

REPO = pathlib.Path("/home/egric/WP/ksu-website")
VENV = "/tmp/claude-1000/-home-egric-WP-ksu-website/fff908d7-8c68-4b9a-9e67-c3c4be6b7a06/scratchpad/venv/bin/python"
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

snap = {}
for svc in SERVICES:
    d = REPO / "services" / svc
    p = subprocess.run([VENV, "-c", PROBE, SCHEMA_OF[svc]], cwd=d, capture_output=True, text=True, check=False)
    line = [l for l in p.stdout.splitlines() if l.startswith("{")]
    snap[svc] = json.loads(line[-1]) if line else {"constructs": False, "error": p.stderr[-300:]}
    # alembic heads
    h = subprocess.run([VENV, "-m", "alembic", "heads"], cwd=d, capture_output=True, text=True, check=False)
    snap[svc]["alembic_heads"] = sorted(re.findall(r"^(\w+)\s*\(head\)", h.stdout, re.MULTILINE)) or ["<error>"]

# kernel state
KERNEL_PROBE = (
    "import ksu_common as k; from ksu_common.models.base import Base; import json; "
    "print(json.dumps({'exports': len(k.__all__), "
    "'base_metadata': sorted(Base.metadata.tables)}))"
)
K = subprocess.run(
    [VENV, "-c", KERNEL_PROBE], cwd=REPO, capture_output=True, text=True, check=False
)
kline = [l for l in K.stdout.splitlines() if l.startswith("{")]
snap["_kernel"] = json.loads(kline[-1]) if kline else {"error": K.stderr[-300:]}
snap["_kernel"]["modules"] = len(list((REPO / "services/common/ksu_common").rglob("*.py")))

with open(sys.argv[1], "w") as fh:
    json.dump(snap, fh, indent=1, sort_keys=True)
for svc in SERVICES:
    s = snap[svc]
    print(f"{svc:12s} constructs={s.get('constructs')!s:5s} routes={s.get('route_count','-'):>4} "
          f"tables={s.get('table_count','-'):>4} foreign={s.get('foreign_schema_tables')!r} heads={s.get('alembic_heads')!r}")
k = snap["_kernel"]
print(f"{'ksu_common':12s} modules={k.get('modules')} exports={k.get('exports')} Base.metadata={k.get('base_metadata')}")
