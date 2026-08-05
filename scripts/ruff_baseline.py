#!/usr/bin/env python3
"""Make legacy Ruff findings measurable without blocking their first cleanup.

``update`` records counts keyed by filename, rule code, and message. ``check``
reports all current findings but exits non-zero only when a key occurs more
often than it did in the baseline. This means fixing legacy findings is always
allowed, while a new finding or a new duplicate finding fails CI.
"""

from __future__ import annotations

import argparse
import collections
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any


SCHEMA_VERSION = 1
ROOT = Path(__file__).resolve().parents[1]


def finding_key(finding: dict[str, Any]) -> tuple[str, str, str]:
    filename = str(finding.get("filename", "")).replace("\\", "/")
    try:
        filename = Path(filename).resolve().relative_to(ROOT).as_posix()
    except ValueError:
        filename = Path(filename).as_posix()
    return filename, str(finding.get("code", "")), str(finding.get("message", ""))


def run_ruff(paths: list[str], ruff: str) -> tuple[list[dict[str, Any]], int]:
    command = [ruff, "check", *paths, "--output-format=json"]
    completed = subprocess.run(command, cwd=ROOT, text=True, capture_output=True, check=False)
    if completed.returncode not in (0, 1):
        detail = completed.stderr.strip() or completed.stdout.strip() or "ruff failed"
        raise RuntimeError(detail)
    if not completed.stdout.strip():
        return [], completed.returncode
    try:
        findings = json.loads(completed.stdout)
    except json.JSONDecodeError as exc:
        raise RuntimeError("Ruff did not return valid JSON") from exc
    if not isinstance(findings, list):
        raise RuntimeError("Ruff JSON output was not a finding list")
    return findings, completed.returncode


def make_baseline(findings: list[dict[str, Any]]) -> dict[str, Any]:
    counts = collections.Counter(finding_key(finding) for finding in findings)
    return {
        "schema_version": SCHEMA_VERSION,
        "description": "Legacy Ruff findings. New occurrences fail the baseline check.",
        "finding_counts": [
            {"filename": filename, "code": code, "message": message, "count": count}
            for (filename, code, message), count in sorted(counts.items())
        ],
        "total_findings": len(findings),
    }


def baseline_counts(payload: dict[str, Any]) -> collections.Counter[tuple[str, str, str]]:
    if payload.get("schema_version") != SCHEMA_VERSION:
        raise ValueError("unsupported Ruff baseline schema version")
    result: collections.Counter[tuple[str, str, str]] = collections.Counter()
    for item in payload.get("finding_counts", []):
        result[(str(item["filename"]), str(item["code"]), str(item["message"]))] = int(item["count"])
    return result


def write_baseline(path: Path, findings: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(make_baseline(findings), indent=2, sort_keys=True) + "\n", encoding="utf-8")


def check_baseline(path: Path, findings: list[dict[str, Any]]) -> int:
    if not path.exists():
        raise FileNotFoundError(f"baseline does not exist: {path}; run the update command first")
    payload = json.loads(path.read_text(encoding="utf-8"))
    allowed = baseline_counts(payload)
    current = collections.Counter(finding_key(finding) for finding in findings)
    new_count = current - allowed
    legacy_count = sum(min(current[key], allowed[key]) for key in current)
    print(f"Ruff baseline: current={len(findings)} legacy={legacy_count} new={sum(new_count.values())}")

    if not new_count:
        return 0

    remaining = dict(new_count)
    for finding in sorted(findings, key=lambda item: (str(item.get("filename")), int(item.get("location", {}).get("row", 0)))):
        key = finding_key(finding)
        if remaining.get(key, 0) <= 0:
            continue
        location = finding.get("location", {})
        print(
            f"NEW {key[0]}:{location.get('row', '?')}:{location.get('column', '?')} "
            f"{key[1]} {key[2]}"
        )
        remaining[key] -= 1
    return 1


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    for command in ("update", "check"):
        subparser = subparsers.add_parser(command)
        subparser.add_argument("--baseline", type=Path, default=ROOT / ".ruff-baseline.json")
        subparser.add_argument("--ruff", default=os.getenv("RUFF_BIN", "ruff"))
        subparser.add_argument("--paths", nargs="+", default=["."])
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    baseline = args.baseline if args.baseline.is_absolute() else ROOT / args.baseline
    try:
        findings, _ = run_ruff(args.paths, args.ruff)
        if args.command == "update":
            write_baseline(baseline, findings)
            print(f"wrote Ruff baseline: {baseline} ({len(findings)} findings)")
            return 0
        return check_baseline(baseline, findings)
    except (OSError, ValueError, RuntimeError, json.JSONDecodeError) as exc:
        print(f"ruff baseline error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
