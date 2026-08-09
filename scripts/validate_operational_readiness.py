#!/usr/bin/env python3
"""Fail when the small-team production operating controls regress."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"operational readiness validation failed: {message}")


def main() -> int:
    compose = (ROOT / "docker-compose.yml").read_text(encoding="utf-8")
    vm = (ROOT / "docker-compose.vm.yml").read_text(encoding="utf-8")
    deploy = (ROOT / "scripts/deploy.sh").read_text(encoding="utf-8")
    alerts = (ROOT / "monitoring/alerts.yml").read_text(encoding="utf-8")

    require("x-backend-operations: &backend-operations" in compose, "backend runtime policy is missing")
    for control in ("init: true", "stop_grace_period: 30s", "driver: local", "max-size:", "max-file:"):
        require(control in compose, f"backend runtime policy lacks {control}")
    require(compose.count("KSU_RELEASE: ${KSU_RELEASE:-unknown}") == 4, "all APIs must report a release id")
    require("${ALERTMANAGER_CONFIG_FILE:-./monitoring/alertmanager.yml}" in compose, "owned Alertmanager config is not mountable")

    for service in ("main", "research", "library", "heri"):
        require(f"  {service}:\n    <<: *api-runtime-limits" in vm, f"{service} has no VM runtime limit")
    for service in (
        "celery-main", "celery-main-integrations", "beat-main", "beat-library",
        "celery-research", "celery-library", "celery-heri",
    ):
        require(f"  {service}:\n    <<: *worker-runtime-limits" in vm, f"{service} has no VM runtime limit")

    for service in ("celery-main-integrations", "beat-main", "beat-library"):
        require(service in deploy.split("worker_services=", 2)[-1], f"deployment omits {service}")
    for token in (
        "COMPOSE_PROFILES=observability", "ALERTMANAGER_CONFIG_FILE", "validate_alertmanager_config.py",
        "Post-deploy API smoke", ' != "healthy"', ".previous", "deployed_at_utc",
    ):
        require(token in deploy, f"deployment gate lacks {token}")
    require(
        deploy.index('run --rm --no-deps "\\${service}" alembic upgrade head')
        < deploy.index('up -d --remove-orphans --no-build "\\${backend_services[@]}"'),
        "migrations must succeed before replacement APIs start",
    )
    for alert in (
        "KsuHttpServiceDown", "KsuHttpFiveXxRateHigh", "KsuHttpP95LatencyHigh",
        "KsuCeleryQueueBacklog", "KsuPostgresConnectionUtilizationHigh", "KsuRedisMemoryHigh",
    ):
        require(alert in alerts, f"required alert is missing: {alert}")

    print("operational readiness validation passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
