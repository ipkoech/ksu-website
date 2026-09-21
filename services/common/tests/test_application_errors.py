import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from ksu_common.errors import (
    AccessDenied,
    AuthenticationRequired,
    Conflict,
    InvalidInput,
    ResourceNotFound,
    TemporarilyUnavailable,
)
from ksu_common.runtime import CorsConfig, ServiceAppConfig, create_service_app


@pytest.mark.parametrize("error,status,code", [
    (InvalidInput, 400, "bad_request"),
    (AuthenticationRequired, 401, "unauthorized"),
    (AccessDenied, 403, "forbidden"),
    (ResourceNotFound, 404, "not_found"),
    (Conflict, 409, "conflict"),
    (TemporarilyUnavailable, 503, "unavailable"),
    (ValueError, 400, "bad_request"),
    (PermissionError, 403, "forbidden"),
])
def test_application_and_legacy_errors_over_http(error, status, code):
    def routes(app):
        @app.get("/failure")
        async def failure() -> str:
            raise error("Public message")

    app = create_service_app(
        ServiceAppConfig(service_name="test", title="Test", version="1", environment="development"),
        cors=CorsConfig(origins=()), register_routes=routes,
    )
    with TestClient(app) as client:
        response = client.get("/failure")
    assert response.status_code == status
    assert response.json() == {"status": "error", "message": "Public message", "code": code}
    if status == 401:
        assert response.headers["www-authenticate"] == "Bearer"


def test_fastapi_error_and_request_validation_contracts_remain_intact():
    def routes(app):
        @app.get("/item")
        async def item(count: int) -> str:
            raise HTTPException(404, "Missing item", headers={"X-Legacy": "retained"})

    app = create_service_app(
        ServiceAppConfig(service_name="test", title="Test", version="1", environment="development"),
        cors=CorsConfig(origins=()), register_routes=routes,
    )
    with TestClient(app) as client:
        missing = client.get("/item?count=1")
        invalid = client.get("/item?count=invalid")
    assert missing.status_code == 404
    assert missing.json() == {"detail": "Missing item"}
    assert missing.headers["x-legacy"] == "retained"
    assert invalid.status_code == 422
    assert invalid.json()["detail"][0]["loc"] == ["query", "count"]


def test_sensitive_validation_input_is_omitted_but_location_is_retained():
    from fastapi import Body

    def routes(app):
        @app.post("/credentials")
        async def credentials(password: int = Body(), count: int = Body()) -> int:
            return count

    app = create_service_app(
        ServiceAppConfig(service_name="test", title="Test", version="1", environment="development"),
        cors=CorsConfig(origins=()), register_routes=routes,
    )
    with TestClient(app) as client:
        response = client.post("/credentials", json={"password": "never-echo", "count": "invalid"})
    assert response.status_code == 422
    errors = {error["loc"][-1]: error for error in response.json()["detail"]}
    assert "input" not in errors["password"]
    assert errors["count"]["input"] == "invalid"
    assert "never-echo" not in response.text


@pytest.mark.parametrize("echo_value", [False, True])
def test_sensitive_custom_validator_cannot_echo_value_in_message_or_context(echo_value):
    from pydantic import BaseModel, field_validator

    class Credentials(BaseModel):
        password: str

        @field_validator("password")
        @classmethod
        def reject(cls, value):
            raise ValueError(f"Rejected credential: {value}" if echo_value else "Password must contain a number")

    def routes(app):
        @app.post("/credentials")
        async def credentials(body: Credentials) -> int:
            return 1

    app = create_service_app(
        ServiceAppConfig(service_name="test", title="Test", version="1", environment="development"),
        cors=CorsConfig(origins=()), register_routes=routes,
    )
    with TestClient(app) as client:
        response = client.post("/credentials", json={"password": "never-echo"})
    assert response.status_code == 422
    error = response.json()["detail"][0]
    assert error["loc"] == ["body", "password"]
    assert error["msg"] == ("Invalid value for sensitive field" if echo_value
                            else "Value error, Password must contain a number")
    assert "ctx" not in error and "input" not in error
    assert "never-echo" not in response.text
