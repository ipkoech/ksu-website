#!/usr/bin/env python3
"""Exercise request binding, mutation context, and native response serialization."""

from __future__ import annotations

import argparse
import asyncio
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import AsyncMock, patch
from uuid import UUID

REPO = Path(__file__).resolve().parents[1]


def _run_probe(service: str) -> None:
    from ci_environment import service_environment

    environment = service_environment(service)
    environment["PYTHONPATH"] = os.pathsep.join(
        (str(REPO / "services" / service), str(REPO / "services" / "common"))
    )
    subprocess.run(
        [sys.executable, str(Path(__file__).resolve()), "--probe", service],
        cwd=REPO,
        env=environment,
        check=True,
    )


def _main_probe() -> None:
    from fastapi import FastAPI
    from fastapi.testclient import TestClient
    from starlette.requests import Request

    from ksu_common.audit import build_audit_payload
    from ksu_common.response_validation import (
        ResponseModelCoverageError,
        enforce_response_model_coverage,
    )
    from ksu_common.security import generate_access_token
    from app.api.v1._idempotency import install_main_idempotency
    from app.deps import get_db
    from app.main import create_app

    async def fake_db():
        yield object()

    app = create_app()
    app.dependency_overrides[get_db] = fake_db
    login = AsyncMock(return_value=(object(), "access-token", "refresh-token"))
    with patch("app.api.v1.auth.AuthService.login", login):
        client = TestClient(app)
        test_password = "correct horse battery staple"  # pragma: allowlist secret
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "reader@example.edu", "password": test_password},
        )

    if response.status_code != 200:
        raise AssertionError(f"Main login did not bind a JSON body and dependencies: {response.text}")
    login.assert_awaited_once()
    call = login.await_args
    assert call.args[1:] == ("reader@example.edu", test_password)
    assert call.kwargs["ip_address"] == "testclient"
    assert response.cookies["ksu_access"] == "access-token"
    assert response.cookies["ksu_refresh"] == "refresh-token"

    invalid = client.post("/api/v1/auth/login", json={})
    assert invalid.status_code == 422
    locations = [tuple(item["loc"]) for item in invalid.json()["detail"]]
    assert ("body", "email") in locations and ("body", "password") in locations
    assert not any(location[:1] == ("query",) for location in locations)

    command_app = FastAPI()

    @command_app.post("/commands")
    async def command(payload: dict[str, str]):
        return payload

    install_main_idempotency(command_app.routes)
    command_response = TestClient(command_app).post("/commands", json={"action": "publish"})
    assert command_response.status_code == 400, command_response.text
    assert "Idempotency-Key" in command_response.json()["detail"]

    actor_id = UUID("018f18a0-7b54-7d8c-8a13-0d8f7f190002")
    audit_secret = "phase-two-audit-verification-secret-value"  # pragma: allowlist secret
    token = generate_access_token(str(actor_id), secret=audit_secret)
    os.environ["JWT_SECRET_KEY"] = "deliberately-wrong-process-global-secret"  # pragma: allowlist secret
    audit_request = Request(
        {
            "type": "http",
            "http_version": "1.1",
            "method": "GET",
            "scheme": "https",
            "path": "/api/v1/profile",
            "raw_path": b"/api/v1/profile",
            "query_string": b"",
            "headers": [(b"authorization", f"Bearer {token}".encode())],
            "client": ("203.0.113.10", 443),
            "server": ("testserver", 443),
        }
    )
    audit_payload = asyncio.run(
        build_audit_payload(
            service_name="main",
            request=audit_request,
            status_code=200,
            token_secret=audit_secret,
            token_algorithm="HS256",
        )
    )
    assert audit_payload["user_id"] == str(actor_id)

    coverage_app = FastAPI()

    @coverage_app.get("/legacy")
    async def legacy_response():
        return {"legacy": True}

    coverage = enforce_response_model_coverage(
        coverage_app.routes,
        production=True,
        baseline_missing=1,
    )
    assert coverage.baseline_delta == 0
    try:
        enforce_response_model_coverage(
            coverage_app.routes,
            production=True,
            baseline_missing=0,
        )
    except ResponseModelCoverageError:
        pass
    else:
        raise AssertionError("response-model coverage regression did not fail closed")

    print("main request correctness: ok")


def _research_probe() -> None:
    from fastapi import FastAPI
    from fastapi.testclient import TestClient

    from app.schemas.base import JsonObject, SuccessEnvelope

    identifier = UUID("018f18a0-7b54-7d8c-8a13-0d8f7f190001")
    timestamp = datetime(2026, 8, 7, 9, 30, tzinfo=timezone.utc)
    app = FastAPI()

    @app.get("/native", response_model=SuccessEnvelope[JsonObject])
    async def native_values():
        return {"status": "success", "data": {"id": identifier, "created_at": timestamp}}

    response = TestClient(app).get("/native")
    if response.status_code != 200:
        raise AssertionError(f"Research rejected native UUID/datetime values: {response.text}")
    data = response.json()["data"]
    assert data == {"id": str(identifier), "created_at": timestamp.isoformat().replace("+00:00", "Z")}

    print("research response serialization: ok")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--probe", choices=("main", "research"))
    args = parser.parse_args()
    if args.probe == "main":
        _main_probe()
    elif args.probe == "research":
        _research_probe()
    else:
        _run_probe("main")
        _run_probe("research")
        print("request correctness smoke suite: ok")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
