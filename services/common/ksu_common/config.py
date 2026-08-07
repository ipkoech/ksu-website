"""Framework-neutral configuration validation interfaces.

Services retain ownership of their settings classes and defaults.  This module
only provides a stable common entry point to the shared security validators.
"""

from __future__ import annotations

from collections.abc import Collection, Mapping
from typing import Protocol

from . import security

PRODUCTION_ENVIRONMENT = "production"
KNOWN_ENVIRONMENTS = frozenset({*security.LOCAL_ENVS, PRODUCTION_ENVIRONMENT})


class EnvironmentSettings(Protocol):
    """Minimum settings surface accepted by common configuration checks."""

    APP_ENV: str


def validate_environment(app_env: str | None) -> str:
    """Normalize and validate a supported application environment name."""
    normalized = (app_env or "").strip().lower()
    if normalized not in KNOWN_ENVIRONMENTS:
        supported = ", ".join(sorted(KNOWN_ENVIRONMENTS))
        raise ValueError(f"APP_ENV must be one of: {supported}")
    return normalized


def is_production_environment(app_env: str | None) -> bool:
    """Return whether strict production validation is required."""
    return validate_environment(app_env) == PRODUCTION_ENVIRONMENT


def validate_explicit_production_settings(
    *,
    configured_fields: Collection[str],
    required_fields: Collection[str],
    app_env: str | None,
) -> None:
    """Delegate explicit-setting validation to the shared security policy."""
    normalized_env = validate_environment(app_env)
    security.require_explicit_production_values(
        configured_fields,
        field_names=required_fields,
        app_env=normalized_env,
    )


def validate_secret(
    secret: str | None,
    *,
    field_name: str,
    app_env: str | None,
) -> str | None:
    """Validate a secret through the shared policy using a normalized environment."""
    return security.validate_secret(
        secret,
        field_name=field_name,
        app_env=validate_environment(app_env),
    )


def validate_service_url(
    url: str | None,
    *,
    field_name: str,
    app_env: str | None,
) -> str | None:
    """Validate a service URL through the shared policy using a normalized environment."""
    return security.validate_service_url(
        url,
        field_name=field_name,
        app_env=validate_environment(app_env),
    )


def validate_read_replica_settings(
    *,
    enabled: bool,
    approved: bool,
    url: str | None,
    app_env: str | None,
) -> str | None:
    """Gate replicas on measured query-plan and pool-saturation evidence."""
    if not enabled:
        return url
    if not approved:
        raise ValueError(
            "READ_REPLICA_ENABLED requires READ_REPLICA_APPROVED after query-plan "
            "and pool-saturation review"
        )
    if not url:
        raise ValueError("READ_DATABASE_URL is required when READ_REPLICA_ENABLED=true")
    return validate_service_url(url, field_name="READ_DATABASE_URL", app_env=app_env)


def validate_cors_origins(
    origins: Collection[str],
    *,
    app_env: str | None,
) -> Collection[str]:
    """Validate CORS origins through the shared policy using a normalized environment."""
    return security.validate_cors_origins(origins, app_env=validate_environment(app_env))


def validate_service_configuration(
    *,
    app_env: str | None,
    secret: str | None = None,
    secret_field: str = "SECRET",
    service_url: str | None = None,
    service_url_field: str = "SERVICE_URL",
    cors_origins: Collection[str] = (),
) -> Mapping[str, object]:
    """Validate reusable service values through the established validators.

    The returned values let a service apply the checks from a settings model
    without coupling this module to Pydantic or any service-specific fields.
    """
    return {
        "secret": validate_secret(secret, field_name=secret_field, app_env=app_env),
        "service_url": validate_service_url(
            service_url, field_name=service_url_field, app_env=app_env
        ),
        "cors_origins": validate_cors_origins(cors_origins, app_env=app_env),
    }


__all__ = [
    "KNOWN_ENVIRONMENTS",
    "PRODUCTION_ENVIRONMENT",
    "EnvironmentSettings",
    "is_production_environment",
    "validate_cors_origins",
    "validate_environment",
    "validate_explicit_production_settings",
    "validate_read_replica_settings",
    "validate_secret",
    "validate_service_configuration",
    "validate_service_url",
]
