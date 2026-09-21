import base64
import time

import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from ksu_common.auth import build_user_dependencies
from ksu_common.security import encode_token


@pytest.fixture(scope="module")
def auth_boundary():
    private = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    public = private.public_key().public_bytes(serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo)
    dependencies = build_user_dependencies(public_key_b64=base64.b64encode(public).decode(),
                                           issuer="test", audience="test", key_id="active")
    app = FastAPI()

    @app.get("/required")
    async def required(user=Depends(dependencies.current_user)):
        return {"sub": user.sub}

    @app.get("/optional")
    async def optional(user=Depends(dependencies.optional_user)):
        return {"sub": user.sub if user else None}

    def token(**overrides):
        now = int(time.time())
        return encode_token({"sub": "user", "jti": "session", "iat": now, "nbf": now,
                             "exp": now + 300, "type": "access", **overrides},
                            private_key=private, issuer="test", audience="test", key_id="active")

    return app, token


@pytest.mark.parametrize("mode", ["missing", "expired", "refresh", "bearer", "cookie", "invalid_bearer_with_cookie"])
def test_required_auth_transport_and_precedence(auth_boundary, mode):
    app, token = auth_boundary
    headers = {}
    with TestClient(app) as client:
        if mode in {"cookie", "invalid_bearer_with_cookie"}:
            client.cookies.set("ksu_access", token())
        if mode == "bearer":
            headers["Authorization"] = "Bearer " + token()
        elif mode == "expired":
            headers["Authorization"] = "Bearer " + token(exp=1)
        elif mode == "refresh":
            headers["Authorization"] = "Bearer " + token(type="refresh")
        elif mode == "invalid_bearer_with_cookie":
            headers["Authorization"] = "Bearer invalid"
        response = client.get("/required", headers=headers)
    if mode in {"cookie", "bearer"}:
        assert response.status_code == 200 and response.json() == {"sub": "user"}
    else:
        assert response.status_code == 401
        assert response.headers["WWW-Authenticate"] == "Bearer"
        assert response.json() == {"detail": "Invalid or missing token"}


def test_optional_auth_preserves_public_read_behavior(auth_boundary):
    app, token = auth_boundary
    with TestClient(app) as client:
        assert client.get("/optional").json() == {"sub": None}
        assert client.get("/optional", headers={"Authorization": "Bearer invalid"}).json() == {"sub": None}
        assert client.get("/optional", headers={"Authorization": "Bearer " + token()}).json() == {"sub": "user"}
