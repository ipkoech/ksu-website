#!/usr/bin/env python3
"""Fail when the small-team production operating controls regress."""

from __future__ import annotations

import re
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
    prometheus = (ROOT / "monitoring/prometheus.yml").read_text(encoding="utf-8")
    quality_workflow = (ROOT / ".github/workflows/quality.yml").read_text(encoding="utf-8")
    main_worker_script = (ROOT / "services/main/scripts/start-celery-worker.sh").read_text(
        encoding="utf-8"
    )
    research_worker_script = (ROOT / "services/research/scripts/start-celery-worker.sh").read_text(
        encoding="utf-8"
    )
    library_worker_script = (ROOT / "services/library/scripts/start-celery-worker.sh").read_text(
        encoding="utf-8"
    )
    heri_worker_script = (ROOT / "services/heri_africa/scripts/start-celery-worker.sh").read_text(
        encoding="utf-8"
    )

    require("x-backend-operations: &backend-operations" in compose, "backend runtime policy is missing")
    for control in ("init: true", "stop_grace_period: 30s", "driver: local", "max-size:", "max-file:"):
        require(control in compose, f"backend runtime policy lacks {control}")
    require(compose.count("KSU_RELEASE: ${KSU_RELEASE:-unknown}") == 4, "all APIs must report a release id")
    require("${ALERTMANAGER_CONFIG_FILE:-./monitoring/alertmanager.yml}" in compose, "owned Alertmanager config is not mountable")
    for control in (
        "archive_mode=${POSTGRES_ARCHIVE_MODE:-off}",
        "archive_command=${POSTGRES_ARCHIVE_COMMAND:-/bin/sh /usr/local/bin/ksu-archive-wal.sh %p %f}",
        "./scripts/postgres-archive-wal.sh:/usr/local/bin/ksu-archive-wal.sh:ro",
        "POSTGRES_WAL_ARCHIVE_HOST_DIR",
    ):
        require(control in compose, f"PostgreSQL WAL archive control is missing: {control}")

    for service in ("main", "research", "library", "heri"):
        require(f"  {service}:\n    <<: *api-runtime-limits" in vm, f"{service} has no VM runtime limit")
    worker_services = (
        "celery-main",
        "celery-main-audit",
        "celery-main-integrations",
        "beat-main",
        "celery-research",
        "celery-research-audit",
        "beat-research",
        "celery-library",
        "celery-library-audit",
        "beat-library",
        "celery-heri",
        "celery-heri-audit",
        "beat-heri",
    )
    for service in worker_services:
        require(f"  {service}:\n    <<: *worker-runtime-limits" in vm, f"{service} has no VM runtime limit")

    local_services_start = deploy.index("local services=(")
    local_services_end = deploy.index("\n  )", local_services_start)
    local_services = deploy[local_services_start:local_services_end]
    for service in worker_services:
        require(service in local_services, f"local deployment omits {service}")

    worker_lists = re.findall(r"worker_services=\((.*?)\)", deploy, flags=re.DOTALL)
    require(len(worker_lists) >= 2, "deployment does not define research and full worker lists")
    for service in worker_services:
        require(service in worker_lists[-1], f"deployment omits {service}")
    for service in (
        "celery-main",
        "celery-main-audit",
        "celery-main-integrations",
        "beat-main",
        "celery-research",
        "celery-research-audit",
        "beat-research",
        "celery-library",
        "celery-library-audit",
        "beat-library",
    ):
        require(service in worker_lists[0], f"research deployment omits {service}")

    require(
        "CELERY_QUEUES=main.default,main.email,main.notifications,main.maintenance,main.social,main.imports,main.media,main.events"
        in compose,
        "Main general worker must exclude main.audit and main.integrations",
    )
    require(
        "CELERY_QUEUES=research.default,research.exports,research.donations" in compose,
        "Research general worker must exclude research.audit",
    )
    require(
        "CELERY_QUEUES=library.default,library.maintenance" in compose,
        "Library general worker must exclude library.audit",
    )
    require("--queues=main.audit" in compose, "Main audit worker queue is missing")
    require("CELERY_QUEUES=research.audit" in compose, "Research audit worker queue is missing")
    require("CELERY_QUEUES=library.audit" in compose, "Library audit worker queue is missing")
    require("--queues=heri.audit" in compose, "HERI audit worker queue is missing")
    require(
        "main.audit" not in main_worker_script,
        "Main standalone worker default includes main.audit",
    )
    require(
        "main.integrations" not in main_worker_script,
        "Main standalone worker default includes main.integrations",
    )
    require(
        "research.audit" not in research_worker_script,
        "Research standalone worker default includes research.audit",
    )
    require(
        "library.audit" not in library_worker_script,
        "Library standalone worker default includes library.audit",
    )
    require(
        'heri.default,heri.publication' in heri_worker_script,
        "HERI standalone worker must default to ordinary queues",
    )
    require(
        "heri.audit" not in heri_worker_script,
        "HERI standalone worker default includes heri.audit",
    )
    require(
        "python scripts/celery_queue_smoke.py" in quality_workflow
        and "KSU_TEST_REDIS_URL: redis://127.0.0.1:6379/0" in quality_workflow,
        "CI does not run the live Celery queue-isolation smoke",
    )
    require(
        "python scripts/celery_beat_smoke.py" in quality_workflow,
        "CI does not run the live Beat scheduler smoke",
    )
    require(
        "python scripts/validate_celery_schedules.py" in quality_workflow,
        "CI does not validate Celery audit schedules",
    )
    require(
        "python scripts/generate_api_contracts.py main library research heri_africa" in quality_workflow,
        "CI does not verify generated v1 frontend contracts for every service",
    )
    for query_plan_script in (
        "python scripts/inspect_audit_query_plan.py",
        "python scripts/inspect_audit_relay_plan.py",
    ):
        require(query_plan_script in quality_workflow, f"CI does not capture {query_plan_script}")
    for target in (
        "celery-main-audit:9100",
        "celery-research-audit:9102",
        "celery-library-audit:9101",
        "celery-heri-audit:9103",
    ):
        require(target in prometheus, f"Prometheus discovery omits {target}")
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
