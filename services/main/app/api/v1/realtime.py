"""Authenticated, resumable realtime WebSocket hub."""

from __future__ import annotations

import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ksu_common import cached_public

from ...core.config import get_settings
from ...core.database import AsyncSessionLocal
from ...deps import CurrentUser
from ...helpers.jwt import create_socket_token, decode_token
from ...models import Notification, Person, Role, RolePermission, User, UserRole
from ...realtime.connection_manager import manager
from ...realtime.events import rooms_for_user
from ...realtime.redis_subscriber import subscriber
from ...services import NotificationService

router = APIRouter()
settings = get_settings()
HEARTBEAT_SECONDS = settings.REALTIME_HEARTBEAT_SECONDS


def _extract_websocket_token(websocket: WebSocket) -> str | None:
    authorization = websocket.headers.get("authorization")
    if authorization:
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() == "bearer" and token:
            return token.strip()
    if ticket := websocket.query_params.get("ticket"):
        return ticket
    return websocket.cookies.get("ksu_access")


def _notification_payload(notification: Notification) -> dict[str, Any]:
    return jsonable_encoder({
        key: getattr(notification, key, None)
        for key in (
            "id", "user_id", "template_id", "title", "subject", "message",
            "notification_type", "priority", "action_url", "scope_type",
            "scope_id", "channels", "payload", "is_read", "read_at",
            "expires_at", "created_at", "updated_at",
        )
    })


def _research_realtime_config() -> dict[str, Any]:
    return {
        "scope_type": "research",
        "websocket_path": "/api/v1/realtime",
        "ticket_path": "/api/v1/realtime/ticket",
        "heartbeat_seconds": HEARTBEAT_SECONDS,
        "max_message_bytes": settings.REALTIME_MAX_MESSAGE_BYTES,
        "events": ["connected", "ping", "event", "sync.required"],
        "channels": ["notifications", "research", "school", "cocms"],
    }


@router.get("/realtime/research/config")
@cached_public(timeout=300, vary_on=())
async def get_research_realtime_config():
    return {"data": _research_realtime_config()}


@router.post("/realtime/ticket")
async def create_realtime_ticket(user: CurrentUser):
    token = create_socket_token(
        str(user.id),
        ttl_seconds=settings.REALTIME_TICKET_TTL_SECONDS,
    )
    return {"data": {"ticket": token, "expires_in": settings.REALTIME_TICKET_TTL_SECONDS}}


@router.get("/realtime/metrics")
async def get_realtime_metrics(_: CurrentUser):
    return {"data": manager.metrics()}


async def _resolve_websocket_user(token: str, *, socket_ticket_only: bool = False) -> User | None:
    try:
        payload = decode_token(token)
        allowed_types = {"socket"} if socket_ticket_only else {"access", "socket"}
        if payload.get("type") not in allowed_types:
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
        result = await NotificationService.list_for_user(
            db, user_id, page=1, per_page=10, unread_only=True
        )
        return [_notification_payload(item) for item in result.items]


async def _handle_control(connection, raw: str):
    if len(raw.encode()) > settings.REALTIME_MAX_MESSAGE_BYTES:
        await connection.websocket.close(code=1009, reason="Message too large")
        return False
    try:
        message = json.loads(raw)
    except json.JSONDecodeError:
        await connection.websocket.close(code=1007, reason="Invalid JSON")
        return False
    message_type = message.get("type")
    if message_type == "pong":
        connection.last_pong = datetime.now(timezone.utc)
    elif message_type == "ack":
        connection.last_ack = str(message.get("cursor") or "")
    elif message_type == "resume" and message.get("last_event_id"):
        await subscriber.resume(connection, str(message["last_event_id"]))
    else:
        await connection.websocket.close(code=1008, reason="Control messages only")
        return False
    return True


@router.websocket("/realtime")
async def realtime(websocket: WebSocket):
    token = _extract_websocket_token(websocket)
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    user = await _resolve_websocket_user(
        token,
        socket_ticket_only=bool(websocket.query_params.get("ticket")),
    )
    if user is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    try:
        connection = await manager.connect(websocket, user.id, rooms_for_user(user))
    except PermissionError:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    try:
        await manager.send(connection, {
            "type": "connected",
            "user_id": str(user.id),
            "rooms": sorted(connection.rooms),
            "notifications": await _latest_unread_notifications(user.id),
        })
        if last_event_id := websocket.query_params.get("last_event_id"):
            await subscriber.resume(connection, last_event_id)
        while True:
            try:
                raw = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=HEARTBEAT_SECONDS,
                )
            except asyncio.TimeoutError:
                age = (datetime.now(timezone.utc) - connection.last_pong).total_seconds()
                if age > HEARTBEAT_SECONDS * 2:
                    await websocket.close(code=1001, reason="Heartbeat timeout")
                    break
                await manager.send(connection, {
                    "type": "ping",
                    "ts": datetime.now(timezone.utc).isoformat(),
                })
                continue
            if not await _handle_control(connection, raw):
                break
    except WebSocketDisconnect:
        pass
    finally:
        await manager.disconnect(connection)
