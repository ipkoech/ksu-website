"""Authenticated realtime websocket endpoints."""

from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ...core.database import AsyncSessionLocal
from ...helpers.jwt import decode_token
from ...models import Notification, Person, Role, RolePermission, User, UserRole
from ...services import NotificationService

router = APIRouter()
HEARTBEAT_SECONDS = 25


def _extract_websocket_token(websocket: WebSocket) -> str | None:
    authorization = websocket.headers.get("authorization")
    if authorization:
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() == "bearer" and token:
            return token.strip()

    query_token = websocket.query_params.get("access_token") or websocket.query_params.get("token")
    if query_token:
        return query_token

    return websocket.cookies.get("ksu_access")


def _notification_payload(notification: Notification) -> dict[str, Any]:
    return jsonable_encoder(
        {
            "id": notification.id,
            "user_id": notification.user_id,
            "template_id": getattr(notification, "template_id", None),
            "title": notification.title,
            "subject": notification.subject,
            "message": notification.message,
            "notification_type": notification.notification_type,
            "priority": notification.priority,
            "action_url": notification.action_url,
            "scope_type": notification.scope_type,
            "scope_id": notification.scope_id,
            "channels": notification.channels,
            "payload": notification.payload,
            "is_read": notification.is_read,
            "read_at": notification.read_at,
            "expires_at": notification.expires_at,
            "created_at": notification.created_at,
            "updated_at": notification.updated_at,
        }
    )


def _research_realtime_config() -> dict[str, Any]:
    return {
        "scope_type": "research",
        "websocket_path": "/api/v1/realtime",
        "heartbeat_seconds": HEARTBEAT_SECONDS,
        "channels": [
            "notifications",
            "research",
            "research.projects",
            "research.farm",
            "research.sustainability",
            "research.content",
        ],
        "events": [
            "connected",
            "heartbeat",
            "notification.created",
            "research.record.changed",
        ],
    }


@router.get("/realtime/research/config")
async def get_research_realtime_config():
    return {"data": _research_realtime_config()}


async def _resolve_websocket_user(token: str) -> User | None:
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            return None
        user_id = uuid.UUID(str(payload.get("sub")))
    except Exception:
        return None

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(User)
            .options(
                selectinload(User.person).selectinload(Person.assignments),
                selectinload(User.role_assignments)
                .selectinload(UserRole.role)
                .selectinload(Role.role_permissions)
                .selectinload(RolePermission.permission),
            )
            .where(User.id == user_id, User.deleted_at.is_(None), User.is_active.is_(True))
        )
        return result.scalar_one_or_none()


async def _latest_unread_notifications(user_id: uuid.UUID) -> list[dict[str, Any]]:
    async with AsyncSessionLocal() as db:
        result = await NotificationService.list_for_user(db, user_id, page=1, per_page=10, unread_only=True)
        return [_notification_payload(notification) for notification in result.items]


@router.websocket("/realtime")
async def realtime(websocket: WebSocket):
    token = _extract_websocket_token(websocket)
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user = await _resolve_websocket_user(token)
    if user is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    await websocket.send_json(
        {
            "type": "connected",
            "user_id": str(user.id),
            "notifications": await _latest_unread_notifications(user.id),
        }
    )

    try:
        while True:
            await asyncio.sleep(HEARTBEAT_SECONDS)
            await websocket.send_json(
                {
                    "type": "heartbeat",
                    "ts": datetime.now(timezone.utc).isoformat(),
                    "unread_notifications": await _latest_unread_notifications(user.id),
                }
            )
    except WebSocketDisconnect:
        return
