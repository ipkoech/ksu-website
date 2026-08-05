"""Process-local WebSocket connections with bounded backpressure queues."""

from __future__ import annotations

import asyncio
import logging
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone

from fastapi import WebSocket

from ..core.config import get_settings

logger = logging.getLogger("main.realtime")
settings = get_settings()


@dataclass(eq=False)
class RealtimeConnection:
    websocket: WebSocket
    user_id: uuid.UUID
    ip: str
    rooms: set[str]
    queue: asyncio.Queue = field(default_factory=lambda: asyncio.Queue(maxsize=100))
    last_pong: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    last_ack: str | None = None
    sender_task: asyncio.Task | None = None


class ConnectionManager:
    def __init__(self, *, max_per_user: int = 5, max_per_ip: int = 20, queue_size: int = 100):
        self.max_per_user = max_per_user
        self.max_per_ip = max_per_ip
        self.queue_size = queue_size
        self.connections: set[RealtimeConnection] = set()
        self.rooms: dict[str, set[RealtimeConnection]] = {}
        self.dropped_events = 0

    async def connect(self, websocket: WebSocket, user_id: uuid.UUID, rooms: set[str]):
        ip = websocket.client.host if websocket.client else "unknown"
        if sum(item.user_id == user_id for item in self.connections) >= self.max_per_user:
            raise PermissionError("Too many connections for user")
        if sum(item.ip == ip for item in self.connections) >= self.max_per_ip:
            raise PermissionError("Too many connections from address")
        await websocket.accept()
        connection = RealtimeConnection(websocket, user_id, ip, rooms)
        connection.queue = asyncio.Queue(maxsize=self.queue_size)
        connection.sender_task = asyncio.create_task(self._sender(connection))
        self.connections.add(connection)
        for room in rooms:
            self.rooms.setdefault(room, set()).add(connection)
        logger.info(
            "realtime connected user_id=%s ip=%s rooms=%d connections=%d",
            user_id,
            ip,
            len(rooms),
            len(self.connections),
        )
        return connection

    async def _sender(self, connection: RealtimeConnection):
        while True:
            payload = await connection.queue.get()
            await connection.websocket.send_json(payload)

    async def send(self, connection: RealtimeConnection, payload: dict) -> bool:
        try:
            connection.queue.put_nowait(payload)
            return True
        except asyncio.QueueFull:
            self.dropped_events += 1
            logger.warning(
                "realtime slow consumer user_id=%s ip=%s queue_depth=%d",
                connection.user_id,
                connection.ip,
                connection.queue.qsize(),
            )
            await connection.websocket.close(code=1013, reason="Slow consumer")
            await self.disconnect(connection)
            return False

    async def broadcast(self, rooms: set[str], payload: dict) -> int:
        targets = {item for room in rooms for item in self.rooms.get(room, ())}
        delivered = 0
        for connection in targets:
            delivered += int(await self.send(connection, payload))
        logger.info(
            "realtime event cursor=%s target_rooms=%d delivered=%d",
            payload.get("cursor"),
            len(rooms),
            delivered,
        )
        return delivered

    async def disconnect(self, connection: RealtimeConnection):
        self.connections.discard(connection)
        for room in connection.rooms:
            members = self.rooms.get(room)
            if members:
                members.discard(connection)
                if not members:
                    self.rooms.pop(room, None)
        if connection.sender_task and connection.sender_task is not asyncio.current_task():
            connection.sender_task.cancel()
        logger.info(
            "realtime disconnected user_id=%s ip=%s connections=%d",
            connection.user_id,
            connection.ip,
            len(self.connections),
        )

    async def close_all(self):
        for connection in list(self.connections):
            await connection.websocket.close(code=1001, reason="Server shutdown")
            await self.disconnect(connection)

    def metrics(self) -> dict:
        return {
            "connections": len(self.connections),
            "rooms": len(self.rooms),
            "dropped_events": self.dropped_events,
            "queue_depth": sum(item.queue.qsize() for item in self.connections),
        }


manager = ConnectionManager(
    max_per_user=settings.REALTIME_MAX_CONNECTIONS_PER_USER,
    max_per_ip=settings.REALTIME_MAX_CONNECTIONS_PER_IP,
    queue_size=settings.REALTIME_QUEUE_SIZE,
)
