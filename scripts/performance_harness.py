#!/usr/bin/env python3
"""Run a small, repeatable HTTP benchmark and safe PostgreSQL EXPLAIN ANALYZE.

The harness deliberately has a narrow safety boundary:

* HTTP scenarios are GET-only and must use relative paths.
* EXPLAIN queries run in a read-only transaction with statement and lock
  timeouts.  Only SELECT/WITH/VALUES statements are accepted.
* Remote environments require an explicit ``--allow-nonlocal`` opt-in.

The script uses only the Python standard library and the ``psql`` executable,
so it can run from a checkout without installing a load-testing framework.
It is a measurement helper, not a production traffic generator.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
import os
import re
import subprocess
import sys
import time
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen


DEFAULT_TIMEOUT_SECONDS = 5.0
DEFAULT_STATEMENT_TIMEOUT_MS = 5_000
DEFAULT_LOCK_TIMEOUT_MS = 1_000
_SAFE_QUERY = re.compile(r"^\s*(?:SELECT|WITH|VALUES)\b", re.IGNORECASE)
_FORBIDDEN_QUERY = re.compile(
    r"\b(?:ALTER|CALL|COMMENT|COPY|CREATE|DELETE|DO|DROP|GRANT|INSERT|MERGE|REFRESH|REINDEX|TRUNCATE|UPDATE)\b",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class Scenario:
    label: str
    path: str
    expected_statuses: frozenset[int]
    max_p95_ms: float | None = None
    max_error_rate: float | None = None
    min_cache_hit_ratio: float | None = None


def percentile(values: list[float], percentile_value: float) -> float | None:
    """Return a nearest-rank percentile in milliseconds, or None when empty."""

    if not values:
        return None
    ordered = sorted(values)
    index = max(0, min(len(ordered) - 1, int((percentile_value / 100) * len(ordered))))
    return round(ordered[index], 3)


def parse_statuses(value: Any) -> frozenset[int]:
    if value is None:
        return frozenset(range(200, 400))
    values = value if isinstance(value, list) else [value]
    try:
        statuses = frozenset(int(item) for item in values)
    except (TypeError, ValueError) as exc:
        raise ValueError("expected_status must contain integer HTTP status codes") from exc
    if not statuses or any(status < 100 or status > 599 for status in statuses):
        raise ValueError("expected_status must contain HTTP status codes from 100 to 599")
    return statuses


def validate_path(path: str) -> str:
    if not path.startswith("/") or path.startswith("//"):
        raise ValueError(f"scenario path must be a single-host relative path: {path!r}")
    if urlsplit(path).scheme or urlsplit(path).netloc:
        raise ValueError(f"scenario path must not be an absolute URL: {path!r}")
    return path


def load_scenarios(paths: list[str], scenario_file: str | None) -> list[Scenario]:
    entries: list[Any] = []
    for item in paths:
        if "=" in item:
            label, path = item.split("=", 1)
        else:
            path = item
            label = path
        entries.append({"label": label, "path": path})

    if scenario_file:
        payload = json.loads(Path(scenario_file).read_text(encoding="utf-8"))
        if isinstance(payload, dict):
            payload = payload.get("endpoints", [])
        if not isinstance(payload, list):
            raise ValueError("scenario file must contain a JSON list or an {endpoints: [...]} object")
        entries.extend(payload)

    if not entries:
        raise ValueError("provide at least one --endpoint or --scenario-file")

    scenarios: list[Scenario] = []
    for entry in entries:
        if isinstance(entry, str):
            entry = {"path": entry}
        if not isinstance(entry, dict) or "path" not in entry:
            raise ValueError("each scenario must be a path or an object containing path")
        method = str(entry.get("method", "GET")).upper()
        if method != "GET":
            raise ValueError("the harness only permits GET scenarios")
        path = validate_path(str(entry["path"]))
        label = str(entry.get("label", path))
        scenarios.append(
            Scenario(
                label,
                path,
                parse_statuses(entry.get("expected_status")),
                _optional_ratio_or_number(entry, "max_p95_ms", minimum=0),
                _optional_ratio_or_number(entry, "max_error_rate", minimum=0, maximum=1),
                _optional_ratio_or_number(entry, "min_cache_hit_ratio", minimum=0, maximum=1),
            )
        )
    return scenarios


def _optional_ratio_or_number(
    entry: dict[str, Any],
    key: str,
    *,
    minimum: float,
    maximum: float | None = None,
) -> float | None:
    if entry.get(key) is None:
        return None
    value = float(entry[key])
    if value < minimum or (maximum is not None and value > maximum):
        raise ValueError(f"{key} must be between {minimum} and {maximum}")
    return value


def headers_from_args(values: list[str]) -> dict[str, str]:
    headers: dict[str, str] = {"User-Agent": "ksu-performance-harness/1"}
    for value in values:
        name, separator, header_value = value.partition(":")
        if not separator or not name.strip() or not header_value.strip():
            raise ValueError("headers must use the form 'Name: value'")
        headers[name.strip()] = header_value.strip()
    return headers


def request_once(base_url: str, scenario: Scenario, headers: dict[str, str], timeout: float) -> dict[str, Any]:
    url = f"{base_url.rstrip('/')}{scenario.path}"
    request = Request(url, headers=headers, method="GET")
    started = time.perf_counter()
    status: int | None = None
    error: str | None = None
    edge_cache: str | None = None
    try:
        with urlopen(request, timeout=timeout) as response:
            status = response.status
            edge_cache = response.headers.get("X-Edge-Cache")
            response.read()
    except HTTPError as exc:
        status = exc.code
        error = f"http_{exc.code}"
    except (TimeoutError, URLError, OSError) as exc:
        error = type(exc).__name__
    elapsed_ms = (time.perf_counter() - started) * 1_000
    return {
        "label": scenario.label,
        "path": scenario.path,
        "status": status,
        "ok": status in scenario.expected_statuses,
        "error": error,
        "latency_ms": round(elapsed_ms, 3),
        "edge_cache": edge_cache,
    }


def run_http(
    base_url: str,
    scenarios: list[Scenario],
    requests: int,
    concurrency: int,
    warmup: int,
    headers: dict[str, str],
    timeout: float,
) -> dict[str, Any]:
    if requests < 1 or concurrency < 1 or warmup < 0:
        raise ValueError("requests and concurrency must be positive; warmup cannot be negative")
    parsed = urlsplit(base_url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError("base URL must be an http(s) URL")

    for scenario in scenarios:
        for _ in range(warmup):
            request_once(base_url, scenario, headers, timeout)

    jobs = [scenarios[index % len(scenarios)] for index in range(requests)]
    started = time.perf_counter()
    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as executor:
        results = list(executor.map(lambda scenario: request_once(base_url, scenario, headers, timeout), jobs))
    elapsed_seconds = max(time.perf_counter() - started, 1e-9)

    grouped: defaultdict[str, list[dict[str, Any]]] = defaultdict(list)
    for result in results:
        grouped[result["label"]].append(result)

    endpoint_reports = {}
    for label, endpoint_results in grouped.items():
        latencies = [item["latency_ms"] for item in endpoint_results]
        endpoint_reports[label] = summarize_results(endpoint_results, latencies, elapsed_seconds)

    violations = evaluate_budgets(scenarios, endpoint_reports)

    all_latencies = [item["latency_ms"] for item in results]
    return {
        "base_url": f"{parsed.scheme}://{parsed.netloc}",
        "requests": requests,
        "concurrency": concurrency,
        "warmup_per_endpoint": warmup,
        "elapsed_seconds": round(elapsed_seconds, 6),
        "throughput_rps": round(requests / elapsed_seconds, 3),
        "summary": summarize_results(results, all_latencies, elapsed_seconds),
        "endpoints": endpoint_reports,
        "violations": violations,
        "passed": not violations,
    }


def summarize_results(results: list[dict[str, Any]], latencies: list[float], elapsed_seconds: float) -> dict[str, Any]:
    successes = sum(1 for item in results if item["ok"])
    cache_observations = [str(item["edge_cache"]).upper() for item in results if item.get("edge_cache")]
    cache_hits = sum(1 for value in cache_observations if value in {"HIT", "STALE", "UPDATING"})
    return {
        "count": len(results),
        "successes": successes,
        "errors": len(results) - successes,
        "error_rate": round((len(results) - successes) / len(results), 6) if results else 0,
        "throughput_rps": round(len(results) / elapsed_seconds, 3) if results else 0,
        "latency_ms": {
            "min": round(min(latencies), 3) if latencies else None,
            "p50": percentile(latencies, 50),
            "p95": percentile(latencies, 95),
            "p99": percentile(latencies, 99),
            "max": round(max(latencies), 3) if latencies else None,
        },
        "edge_cache": {
            "observations": len(cache_observations),
            "hits": cache_hits,
            "hit_ratio": round(cache_hits / len(cache_observations), 6) if cache_observations else None,
        },
    }


def evaluate_budgets(scenarios: list[Scenario], reports: dict[str, dict[str, Any]]) -> list[str]:
    violations: list[str] = []
    for scenario in scenarios:
        report = reports[scenario.label]
        p95 = report["latency_ms"]["p95"]
        error_rate = report["error_rate"]
        hit_ratio = report["edge_cache"]["hit_ratio"]
        if scenario.max_p95_ms is not None and (p95 is None or p95 > scenario.max_p95_ms):
            violations.append(f"{scenario.label}: p95 {p95}ms exceeds {scenario.max_p95_ms}ms")
        if scenario.max_error_rate is not None and error_rate > scenario.max_error_rate:
            violations.append(f"{scenario.label}: error rate {error_rate} exceeds {scenario.max_error_rate}")
        if scenario.min_cache_hit_ratio is not None and (
            hit_ratio is None or hit_ratio < scenario.min_cache_hit_ratio
        ):
            violations.append(
                f"{scenario.label}: edge-cache hit ratio {hit_ratio} is below {scenario.min_cache_hit_ratio}"
            )
    return violations


def normalise_database_url(value: str) -> str:
    return re.sub(r"^(postgres(?:ql)?)(?:\+[^:]+)(://)", r"\1\2", value)


def validate_explain_query(query: str) -> str:
    query = query.strip()
    if query.endswith(";"):
        query = query[:-1].rstrip()
    if not query or ";" in query or "--" in query or "/*" in query or "*/" in query:
        raise ValueError("EXPLAIN input must be one comment-free SQL statement")
    if not _SAFE_QUERY.match(query) or _FORBIDDEN_QUERY.search(query):
        raise ValueError("EXPLAIN input must be a read-only SELECT, WITH, or VALUES query")
    return query


def explain_query(
    database_url: str,
    label: str,
    query_file: str,
    statement_timeout_ms: int,
    lock_timeout_ms: int,
    psql: str,
) -> dict[str, Any]:
    query = validate_explain_query(Path(query_file).read_text(encoding="utf-8"))
    sql = (
        "BEGIN; SET TRANSACTION READ ONLY; "
        f"SET LOCAL statement_timeout = '{statement_timeout_ms}ms'; "
        f"SET LOCAL lock_timeout = '{lock_timeout_ms}ms'; "
        "EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) "
        f"{query}; ROLLBACK;"
    )
    started = time.perf_counter()
    completed = subprocess.run(
        [psql, normalise_database_url(database_url), "--no-password", "-X", "-q", "-A", "-t", "-v", "ON_ERROR_STOP=1"],
        input=sql,
        text=True,
        capture_output=True,
        timeout=max(statement_timeout_ms / 1_000 + 5, 10),
        check=False,
    )
    elapsed_ms = (time.perf_counter() - started) * 1_000
    if completed.returncode:
        detail = completed.stderr.strip().splitlines()[-1:] or ["psql failed"]
        raise RuntimeError(f"EXPLAIN {label!r} failed: {detail[0]}")
    try:
        explain_payload = json.loads(completed.stdout.strip())
        summary = explain_payload[0] if isinstance(explain_payload, list) else explain_payload
    except (json.JSONDecodeError, IndexError, TypeError) as exc:
        raise RuntimeError("psql returned an invalid JSON EXPLAIN result") from exc
    return {
        "label": label,
        "query_file": query_file,
        "query_sha256": hashlib.sha256(query.encode()).hexdigest(),
        "wall_time_ms": round(elapsed_ms, 3),
        "planning_time_ms": summary.get("Planning Time"),
        "execution_time_ms": summary.get("Execution Time"),
        "plan": summary.get("Plan"),
    }


def parse_explain_files(values: list[str]) -> list[tuple[str, str]]:
    parsed = []
    for value in values:
        label, separator, path = value.partition("=")
        if not separator:
            path = label
            label = Path(path).stem
        if not label or not path:
            raise ValueError("EXPLAIN files must use 'label=path' or 'path'")
        parsed.append((label, path))
    return parsed


def reject_nonlocal(environment: str, allow_nonlocal: bool) -> None:
    known_local = {"local", "development", "dev", "test", "testing"}
    if environment.lower() not in known_local and not allow_nonlocal:
        raise ValueError(
            f"environment {environment!r} is not local; pass --allow-nonlocal only for an approved test/staging target"
        )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default=os.getenv("KSU_PERF_BASE_URL", "http://127.0.0.1:8000"))
    parser.add_argument("--endpoint", action="append", default=[], help="GET path, optionally label=/path")
    parser.add_argument("--scenario-file", help="JSON file containing an endpoint list")
    parser.add_argument("--requests", type=int, default=100)
    parser.add_argument("--concurrency", type=int, default=10)
    parser.add_argument("--warmup", type=int, default=2, help="warmup requests per endpoint")
    parser.add_argument("--timeout", type=float, default=DEFAULT_TIMEOUT_SECONDS)
    parser.add_argument("--header", action="append", default=[])
    parser.add_argument("--database-url", default=os.getenv("DATABASE_URL"))
    parser.add_argument("--explain-file", action="append", default=[], help="SQL file or label=SQL file")
    parser.add_argument("--statement-timeout-ms", type=int, default=DEFAULT_STATEMENT_TIMEOUT_MS)
    parser.add_argument("--lock-timeout-ms", type=int, default=DEFAULT_LOCK_TIMEOUT_MS)
    parser.add_argument("--psql", default=os.getenv("PSQL_BIN", "psql"))
    parser.add_argument("--environment", default=os.getenv("KSU_PERF_ENV", "local"))
    parser.add_argument("--allow-nonlocal", action="store_true")
    parser.add_argument("--output", type=Path, help="write the JSON report to this path")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        reject_nonlocal(args.environment, args.allow_nonlocal)
        scenarios = load_scenarios(args.endpoint, args.scenario_file)
        headers = headers_from_args(args.header)
        report: dict[str, Any] = {
            "tool": "ksu-performance-harness",
            "generated_at_epoch": time.time(),
            "environment": args.environment,
            "http": run_http(
                args.base_url,
                scenarios,
                args.requests,
                args.concurrency,
                args.warmup,
                headers,
                args.timeout,
            ),
        }
        explain_files = parse_explain_files(args.explain_file)
        if explain_files:
            if not args.database_url:
                raise ValueError("--database-url or DATABASE_URL is required when --explain-file is used")
            if args.statement_timeout_ms < 1 or args.lock_timeout_ms < 1:
                raise ValueError("database timeouts must be positive")
            report["explain"] = [
                explain_query(
                    args.database_url,
                    label,
                    path,
                    args.statement_timeout_ms,
                    args.lock_timeout_ms,
                    args.psql,
                )
                for label, path in explain_files
            ]
    except (OSError, ValueError, RuntimeError, subprocess.SubprocessError) as exc:
        print(f"performance harness error: {exc}", file=sys.stderr)
        return 2

    serialized = json.dumps(report, indent=2, sort_keys=True)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(serialized + "\n", encoding="utf-8")
        print(f"wrote performance report: {args.output}")
    else:
        print(serialized)
    return 0 if report["http"]["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
