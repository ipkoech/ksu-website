"""Regression checks for the Compose PostgreSQL connection budget."""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).parents[2]
COMPOSE = (ROOT / "docker-compose.yml").read_text()


def _default(name: str) -> int:
    match = re.search(rf"\$\{{{name}:-([0-9]+)\}}", COMPOSE)
    assert match, f"{name} must have an explicit Compose default"
    return int(match.group(1))


def test_compose_default_database_capacity_stays_within_postgres_budget() -> None:
    postgres_max_connections = _default("POSTGRES_MAX_CONNECTIONS")
    reserved_connections = _default("POSTGRES_CONNECTION_RESERVE")
    pool_size = _default("DB_POOL_SIZE")
    max_overflow = _default("DB_MAX_OVERFLOW")
    api_workers = _default("API_WORKERS")
    celery_concurrency = _default("CELERY_CONCURRENCY")

    api_services = ("main", "research", "library", "heri")
    celery_services = tuple(f"celery-{service}" for service in api_services)
    for service in (*api_services, *celery_services):
        assert re.search(
            rf"^  {service}:.*?^    environment:\n      <<: \*backend-database-capacity",
            COMPOSE,
            re.MULTILINE | re.DOTALL,
        ), f"{service} must use the shared database pool configuration"

    for service in api_services:
        assert re.search(
            rf"^  {service}:.*?^    command:.*--workers.*\$\{{API_WORKERS:-",
            COMPOSE,
            re.MULTILINE | re.DOTALL,
        ), f"{service} must configure its Uvicorn worker count"

    for service in celery_services:
        assert re.search(
            rf"^  {service}:.*?^      CELERY_CONCURRENCY: \$\{{CELERY_CONCURRENCY:-",
            COMPOSE,
            re.MULTILINE | re.DOTALL,
        ), f"{service} must configure its Celery prefork concurrency"

    assert re.search(
        r"^  celery-heri:.*?^    command:(?:(?!^    env_file:).)*CELERY_CONCURRENCY",
        COMPOSE,
        re.MULTILINE | re.DOTALL,
    ), "HERI's worker command must apply the configured Celery concurrency"

    pool_capacity = pool_size + max_overflow
    total_possible_connections = (
        len(api_services) * api_workers + len(celery_services) * celery_concurrency
    ) * pool_capacity
    application_budget = postgres_max_connections - reserved_connections

    assert pool_capacity == 5
    assert total_possible_connections == 60
    assert total_possible_connections <= application_budget
    assert application_budget < postgres_max_connections


def test_gateway_has_a_stable_api_network_identity_trusted_by_all_apis() -> None:
    assert "subnet: 172.30.0.0/24" in COMPOSE
    assert "ipv4_address: 172.30.0.2" in COMPOSE
    assert COMPOSE.count('"--forwarded-allow-ips", "172.30.0.2"') == 4


def test_backend_services_use_distinct_database_roles_and_owned_schemas() -> None:
    expected = {
        "main": ("MAIN_DB_USER", "MAIN_DB_PASSWORD", "main"),
        "research": ("RESEARCH_DB_USER", "RESEARCH_DB_PASSWORD", "research"),
        "library": ("LIBRARY_DB_USER", "LIBRARY_DB_PASSWORD", "library"),
        "heri": ("HERI_DB_USER", "HERI_DB_PASSWORD", "heri"),
    }
    for service, (user, password, schema) in expected.items():
        block = re.search(
            rf"^  {service}:.*?(?=^  \S|\Z)",
            COMPOSE,
            re.MULTILINE | re.DOTALL,
        )
        assert block, f"missing Compose block for {service}"
        text = block.group(0)
        assert f"${{{user}:-ksu_{schema}}}" in text
        assert f"${{{password}:?{password} is required}}" in text
        assert f"DB_SCHEMA: {schema}" in text


def test_database_ownership_bootstrap_is_mounted_before_application_start() -> None:
    assert "./scripts/init-database-ownership.sh:/docker-entrypoint-initdb.d/10-database-ownership.sh:ro" in COMPOSE
