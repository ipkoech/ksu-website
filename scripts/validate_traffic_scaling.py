#!/usr/bin/env python3
"""Fail when production traffic controls lose their safe scaling properties."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"traffic scaling validation failed: {message}")


def main() -> int:
    nginx = (ROOT / "gateway/nginx.conf").read_text(encoding="utf-8")
    cache = (ROOT / "gateway/public-api-cache.inc").read_text(encoding="utf-8")
    compose = (ROOT / "docker-compose.yml").read_text(encoding="utf-8")
    scenarios = json.loads(
        (ROOT / "docs/operations/performance-scenarios.json").read_text(encoding="utf-8")
    )["endpoints"]

    require("resolver 127.0.0.11" in nginx, "gateway must re-resolve Docker service replicas")
    require(nginx.count(" resolve;") == 4, "every API upstream must use dynamic DNS resolution")
    require(nginx.count("/etc/nginx/snippets/public-api-cache.inc") == 4, "every public API service must use edge caching")
    require(
        "$http_authorization:$http_cookie:$http_x_api_key:$http_x_internal_key:$http_x_internal_api_key"
        in nginx,
        "cache bypass must include user and integration credentials",
    )
    require("proxy_cache_bypass $skip_public_api_cache" in cache, "authenticated cache bypass is missing")
    require("proxy_no_cache $skip_public_api_cache $upstream_http_set_cookie" in cache, "private responses could enter edge cache")
    require(re.search(r"proxy_cache_valid\s+200\s+(?:[1-5]?\d)s;", cache) is not None, "public cache TTL must be at most 59 seconds")
    require(re.search(r"proxy_cache_valid\s+(?:4\d\d|5\d\d)", cache) is None, "error responses must not be cached")
    require("proxy_cache_lock on" in cache, "edge cache must collapse concurrent misses")
    require("KSU_CACHE_REDIS_FAILURE_MODE: ${KSU_CACHE_REDIS_FAILURE_MODE:-fallback}" in compose, "cache outage fallback is not configured")

    for service in ("MAIN", "RESEARCH", "LIBRARY", "HERI"):
        require(f"{service}_CACHE_REDIS_URL" in compose, f"{service} cache URL is not independently configurable")
        require(f"{service}_CELERY_BROKER_URL" in compose, f"{service} broker URL is not independently configurable")

    budgeted = {entry["label"] for entry in scenarios if "max_p95_ms" in entry and "max_error_rate" in entry}
    require(len(budgeted) >= 5, "staging scenarios must cover the gateway and all four services")
    cached = {entry["label"] for entry in scenarios if "min_cache_hit_ratio" in entry}
    require(len(cached) >= 4, "each service needs an edge-cache hit-ratio gate")
    print("traffic scaling validation passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
