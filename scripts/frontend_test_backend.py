"""Run the real Main service against explicitly labelled, disposable local stores.

No production data is copied. Existing service configuration supplies non-secret
defaults; stores, signing keys, uploads, queues and outbound networking are isolated.
Run with the repository backend dependencies installed. Stop with Ctrl+C.
"""
from __future__ import annotations

import asyncio
import base64
from datetime import datetime, timezone
import ipaddress
import json
import os
from pathlib import Path
import secrets
import socket
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / ".tmp" / "frontend-backend"
DATABASE_URL = "postgresql+asyncpg://ksu_frontend_test:frontend-test-only@127.0.0.1:55440/ksu_frontend_test"
PASSWORD = "FrontendTestOnly!2026"


def verify_container(name: str, port: str, published: str) -> None:
    result = subprocess.run(
        ["docker", "inspect", name, "--format", '{{json .Config.Labels}}\n{{json .NetworkSettings.Ports}}'],
        capture_output=True, text=True, check=True,
    )
    labels, ports = map(json.loads, result.stdout.strip().splitlines())
    if labels.get("ksu.purpose") != "frontend-transformation-test":
        raise RuntimeError(f"{name} is not the frontend disposable fixture")
    if ports.get(port) != [{"HostIp": "127.0.0.1", "HostPort": published}]:
        raise RuntimeError(f"{name} has an unexpected published address")


def configure() -> None:
    verify_container("ksu-frontend-test-pg", "5432/tcp", "55440")
    verify_container("ksu-frontend-test-redis", "6379/tcp", "56380")
    from dotenv import dotenv_values
    from cryptography.fernet import Fernet
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric import rsa

    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    os.environ.update({key: value for key, value in dotenv_values(ROOT / "services/main/.env.example").items() if value is not None})
    for name in list(os.environ):
        if name.endswith(("_PASSWORD", "_SECRET", "_TOKEN", "_KEY", "_KEY_B64")):
            os.environ[name] = ""
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    private = key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption())
    public = key.public_key().public_bytes(serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo)
    os.environ.update({
        "APP_ENV": "test", "APP_VERSION": "frontend-test", "DEBUG": "false", "SERVICE_NAME": "main",
        "DATABASE_URL": DATABASE_URL, "READ_DATABASE_URL": DATABASE_URL,
        "READ_REPLICA_ENABLED": "false", "READ_REPLICA_APPROVED": "false",
        "DB_SCHEMA": "main", "DB_POOL_SIZE": "3", "DB_MAX_OVERFLOW": "2",
        "REDIS_URL": "redis://127.0.0.1:56380/0", "CACHE_REDIS_URL": "redis://127.0.0.1:56380/1",
        "CELERY_BROKER_URL": "redis://127.0.0.1:56380/2", "CELERY_RESULT_BACKEND": "redis://127.0.0.1:56380/3",
        "JWT_PRIVATE_KEY_B64": base64.b64encode(private).decode(), "JWT_PUBLIC_KEY_B64": base64.b64encode(public).decode(),
        "JWT_SIGNING_ENABLED": "true", "JWT_KEY_ID": "frontend-disposable-test",
        "JWT_ALGORITHM": "RS256",
        "JWT_ISSUER": "ksu-frontend-test", "JWT_AUDIENCE": "ksu-frontend-test",
        "JWT_ACCESS_TTL_MINUTES": "5", "JWT_REFRESH_TTL_DAYS": "1",
        "MFA_ENCRYPTION_KEY": Fernet.generate_key().decode(),
        "PASSWORD_RESET_TOKEN_TTL_HOURS": "1", "PASSWORD_RESET_RATE_LIMIT_COUNT": "5",
        "PASSWORD_RESET_RATE_LIMIT_WINDOW_SECONDS": "60",
        "INTERNAL_API_KEY": secrets.token_urlsafe(48),
        "FRONTEND_BASE_URL": "http://127.0.0.1:3000", "FRONTEND_ADMIN_URL": "http://127.0.0.1:3001",
        "FRONTEND_RESEARCH_URL": "http://127.0.0.1:3002", "FRONTEND_LIBRARY_URL": "http://127.0.0.1:3003",
        "PUBLIC_API_BASE_URL": "http://127.0.0.1:18080",
        "RESEARCH_SERVICE_URL": "http://127.0.0.1:18081", "LIBRARY_SERVICE_URL": "http://127.0.0.1:18082",
        "CORS_ORIGINS": json.dumps(["http://127.0.0.1:3001", "http://localhost:3001"]),
        "UPLOAD_DIR": str(ARTIFACTS / "uploads"), "LOG_DIR": str(ARTIFACTS / "logs"),
        "LOG_LEVEL": "WARNING", "LOG_FORMAT": "json", "SMTP_HOST": "127.0.0.1", "SMTP_PORT": "18025", "SMTP_USE_TLS": "false",
        "MAX_UPLOAD_MB": "10", "MEDIA_URL": "http://127.0.0.1:18080/uploads",
        "ALLOWED_IMAGE_TYPES": "image/jpeg,image/png,image/webp", "ALLOWED_DOCUMENT_TYPES": "application/pdf,text/plain",
        "SMS_PROVIDER": "disabled", "PUSH_PROVIDER": "disabled",
    })
    for name in ["HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "http_proxy", "https_proxy", "all_proxy"]:
        os.environ.pop(name, None)
    sys.path[:0] = [str(ROOT / "services/main"), str(ROOT / "services/common")]

    original_connect = socket.socket.connect

    def local_connect(sock, address):
        if isinstance(address, tuple):
            try:
                local = ipaddress.ip_address(address[0]).is_loopback
            except ValueError:
                local = address[0] == "localhost"
            if not local:
                raise RuntimeError("Frontend fixture blocks non-loopback outbound connections")
        return original_connect(sock, address)

    socket.socket.connect = local_connect


async def seed() -> None:
    import sqlalchemy as sa
    from ksu_common.models.base import Base
    from app.core.database import AsyncSessionLocal, engine
    from app.helpers.password import hash_password
    from app.models import Permission, Role, RolePermission, Story, User, UserRole

    async with engine.begin() as connection:
        await connection.execute(sa.text("CREATE SCHEMA IF NOT EXISTS main"))
        await connection.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as db:
        existing = await db.scalar(sa.select(sa.func.count()).select_from(User))
        if existing:
            raise RuntimeError("Disposable database already has users; refusing to overwrite them")
        names = [
            "platform.admin",
            "users.read",
            "users.create",
            "users.edit",
            "users.write",
            "users.delete",
            "roles.read",
            "roles.manage",
            "roles.write",
            "roles.delete",
        ]
        permissions = {
            name: Permission(name=name, resource=name.split(".", 1)[0], action=name.split(".", 1)[1])
            for name in names
        }
        db.add_all(permissions.values())
        admin = Role(name="system-admin", display_name="Frontend test administrator")
        viewer = Role(name="system-viewer", display_name="Frontend test viewer")
        db.add_all([admin, viewer])
        await db.flush()
        for permission in permissions.values():
            db.add(RolePermission(role_id=admin.id, permission_id=permission.id))
        db.add(RolePermission(role_id=viewer.id, permission_id=permissions["users.read"].id))
        for name, role, temporary in [
            ("admin", admin, False),
            ("mutation-admin", admin, False),
            ("viewer", viewer, False),
            ("temporary", viewer, True),
        ]:
            user = User(email=f"{name}@frontend.example.com", full_name=f"Frontend Test {name.title()}", password_hash=hash_password(PASSWORD), is_active=True, is_verified=True, service_memberships=["system"], must_change_password=temporary)
            db.add(user)
            await db.flush()
            db.add(UserRole(user_id=user.id, role_id=role.id))
        published_at = datetime.now(timezone.utc)
        db.add(
            Story(
                title="Frontend disposable backend story",
                slug="frontend-disposable-backend-story",
                summary="A published story used only by the guarded frontend integration journey.",
                plain_text="A published story used only by the guarded frontend integration journey.",
                rich_text="<p>A published story used only by the guarded frontend integration journey.</p>",
                related_links=[],
                story_type="article",
                category="University",
                source_type="editorial",
                show_contributor_name=False,
                consent_to_publish=True,
                is_featured=True,
                homepage_priority=1,
                scope_type="global",
                is_main=True,
                is_public=True,
                is_published=True,
                published_at=published_at,
                status="published",
                workflow_status="published",
                display_order=1,
            )
        )
        await db.commit()
    await engine.dispose()


if __name__ == "__main__":
    configure()
    asyncio.run(seed())
    # The disposable suite runs several independent browser logins from one
    # loopback address. Keep production auth limits unchanged while avoiding
    # cross-test interference in this explicitly local fixture.
    from app.services import auth as auth_service
    auth_service._LOGIN_RATE_LIMITER.requests = 100
    auth_service._LOGIN_GLOBAL_RATE_LIMITER.requests = 200
    import uvicorn
    from app.main import create_app
    print("Disposable Main backend listening on http://127.0.0.1:18080", flush=True)
    uvicorn.run(create_app(), host="127.0.0.1", port=18080, log_level="warning")
