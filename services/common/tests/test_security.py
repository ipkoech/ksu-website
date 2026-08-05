import pytest

from ksu_common.security import LOCAL_ENVS, validate_cors_origins, validate_secret, validate_service_url


@pytest.mark.parametrize(
    "secret",
    [None, "", "short-secret", "change-me-local", "change-me-internal", "password", "secret"],
)
def test_production_rejects_missing_short_and_known_default_secrets(secret):
    with pytest.raises(ValueError, match="JWT_SECRET_KEY"):
        validate_secret(secret, field_name="JWT_SECRET_KEY", app_env="production")


def test_local_environments_allow_explicit_development_secrets():
    assert LOCAL_ENVS == {"development", "dev", "local", "test", "testing"}
    assert validate_secret("test-secret", field_name="JWT_SECRET_KEY", app_env="test") == "test-secret"


@pytest.mark.parametrize(
    "url",
    [
        "not-a-url",
        "https://service.example.edu:not-a-port",
        "https://[2001:db8::1",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://[::1]:8000",
    ],
)
def test_production_rejects_malformed_and_loopback_service_urls(url):
    with pytest.raises(ValueError, match="DATABASE_URL"):
        validate_service_url(url, field_name="DATABASE_URL", app_env="production")


@pytest.mark.parametrize(
    "origin",
    [
        "not-a-url",
        "https://example.edu/path",
        "https://example.edu:not-a-port",
        "https://[2001:db8::1",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://[::1]:3000",
    ],
)
def test_production_rejects_malformed_and_loopback_cors_origins(origin):
    with pytest.raises(ValueError, match="CORS_ORIGINS"):
        validate_cors_origins([origin], app_env="production")


@pytest.mark.parametrize("app_env", sorted(LOCAL_ENVS))
def test_local_environments_preserve_development_url_behavior(app_env):
    service_url = "not-a-url"
    origins = ["http://localhost:3000/path"]

    assert validate_service_url(service_url, field_name="DATABASE_URL", app_env=app_env) == service_url
    assert validate_cors_origins(origins, app_env=app_env) == origins
