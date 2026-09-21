#!/usr/bin/env python3
"""Dry-run-first conversion of legacy access assignments.

The tool is deliberately database-independent: export assignments to JSON,
review the classification, then feed the approved equivalent rows to the
existing provisioning command. No account is changed unless ``--apply`` is
explicitly supplied to an integration wrapper.
"""

from __future__ import annotations

import argparse
import copy
import json
from pathlib import Path
from typing import Any

LEGACY_WORKSPACES = {
    "admin": "communications",
    "content-admin": "communications",
    "school-admin": "school",
    "dept-admin": "department",
    "library-admin": "library",
    "research-admin": "research",
    "heri-admin": "heri",
    "club-admin": "club",
    "story-contributor": "story-contributor",
}

def classify_assignment(row: dict[str, Any]) -> dict[str, Any]:
    role = str(row.get("role") or row.get("role_name") or "").strip().lower()
    workspace = LEGACY_WORKSPACES.get(role)
    scope_type = row.get("scope_type") or "global"
    scope_id = row.get("scope_id")
    active = bool(row.get("is_active", True)) and not row.get("deleted_at")
    expires_at = row.get("expires_at")
    classification = "ambiguous" if workspace is None else "equivalent"
    if workspace in {"research", "communications"} and scope_type not in {"global", "university"}:
        classification = "narrowed"
    if role in {"admin", "super-admin", "web-master"}:
        classification = "expanded"
    if not active or expires_at:
        classification = "expired_or_inactive" if not active else classification
    return {
        "source": copy.deepcopy(row), "user_id": row.get("user_id"), "role": role,
        "workspace": workspace, "scope_type": scope_type, "scope_id": scope_id,
        "expires_at": expires_at, "active": active, "classification": classification,
        "migratable": classification == "equivalent" and active,
    }

def plan(rows: list[dict[str, Any]]) -> dict[str, Any]:
    mapped = [classify_assignment(row) for row in rows]
    return {"version": 1, "dry_run": True, "assignments": mapped,
            "summary": {kind: sum(item["classification"] == kind for item in mapped)
                        for kind in {item["classification"] for item in mapped}}}

def rollback_snapshot(plan_data: dict[str, Any]) -> list[dict[str, Any]]:
    return [copy.deepcopy(item["source"]) for item in plan_data.get("assignments", [])]

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("-o", "--output", type=Path, required=True)
    parser.add_argument("--apply", action="store_true", help="reserved for a reviewed integration wrapper")
    args = parser.parse_args()
    if args.apply:
        parser.error("assignment conversion is intentionally offline; review the dry-run plan first")
    rows = json.loads(args.input.read_text(encoding="utf-8"))
    if not isinstance(rows, list) or not all(isinstance(row, dict) for row in rows):
        parser.error("input must be a JSON array of assignment objects")
    args.output.write_text(json.dumps(plan(rows), indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
