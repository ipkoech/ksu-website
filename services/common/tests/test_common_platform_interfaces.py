from __future__ import annotations

import pytest

from ksu_common.auth import TokenPayload
from ksu_common.authorization import (
    AuthorizationScope,
    authorize_exact_scope,
    authorize_permission,
)
from ksu_common.config import (
    validate_environment,
    validate_explicit_production_settings,
    validate_service_configuration,
)
from ksu_common.responses import ErrorResponse, SuccessResponse, error, success


def test_config_validation_delegates_to_existing_security_validators(monkeypatch: pytest.MonkeyPatch) -> None:
    import ksu_common.config as config

    calls: list[tuple[str, object]] = []

    monkeypatch.setattr(
        config.security,
        "validate_secret",
        lambda value, **kwargs: calls.append(("secret", kwargs)) or value,
    )
    monkeypatch.setattr(
        config.security,
        "validate_service_url",
        lambda value, **kwargs: calls.append(("url", kwargs)) or value,
    )
    monkeypatch.setattr(
        config.security,
        "validate_cors_origins",
        lambda value, **kwargs: calls.append(("cors", kwargs)) or value,
    )

    result = validate_service_configuration(
        app_env="production",
        secret="s" * 32,
        secret_field="JWT_SECRET_KEY",
        service_url="https://api.ksu.edu",
        service_url_field="SERVICE_URL",
        cors_origins=["https://ksu.edu"],
    )

    assert result == {"secret": "s" * 32, "service_url": "https://api.ksu.edu", "cors_origins": ["https://ksu.edu"]}
    assert [name for name, _ in calls] == ["secret", "url", "cors"]


def test_config_rejects_unknown_environment_and_requires_explicit_production_values() -> None:
    with pytest.raises(ValueError, match="APP_ENV"):
        validate_environment("staging")

    with pytest.raises(ValueError, match="DATABASE_URL"):
        validate_explicit_production_settings(
            configured_fields={"JWT_SECRET_KEY"},
            required_fields={"JWT_SECRET_KEY", "DATABASE_URL"},
            app_env="production",
        )


def test_authorization_interface_denies_unknown_permission_and_scope_mismatch() -> None:
    subject = TokenPayload(
        sub="user-1",
        jti="token-1",
        roles=[],
        raw={
            "scope_grants": [
                {
                    "scope_type": "library",
                    "scope_id": "library-a",
                    "permissions": ["library.write"],
                }
            ]
        },
    )

    assert authorize_permission(subject, "library.publish").reason == "unknown_permission"
    decision = authorize_exact_scope(
        subject,
        "library.write",
        AuthorizationScope(scope_type="library", scope_id="library-b"),
    )

    assert decision.allowed is False
    assert decision.reason == "scope_mismatch"


def test_response_interface_reuses_existing_envelope_shapes() -> None:
    assert SuccessResponse(data={"id": 1}).model_dump() == {
        "status": "success",
        "message": "ok",
        "data": {"id": 1},
        "meta": None,
    }
    assert ErrorResponse(message="Missing", code="not_found").model_dump() == {
        "status": "error",
        "message": "Missing",
        "code": "not_found",
        "details": None,
    }
    assert success({"id": 1}, meta={"page": 1}) == {
        "status": "success",
        "message": "ok",
        "data": {"id": 1},
        "meta": {"page": 1},
    }
    assert error("Missing", code="not_found") == {
        "status": "error",
        "message": "Missing",
        "code": "not_found",
    }
