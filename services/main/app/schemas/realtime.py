"""HTTP payloads for the realtime hub control endpoints."""

from __future__ import annotations

from .base import BaseSchema


class RealtimeConfigData(BaseSchema):
    scope_type: str
    websocket_path: str
    ticket_path: str
    heartbeat_seconds: int
    max_message_bytes: int
    events: list[str]
    channels: list[str]


class RealtimeConfigResponse(BaseSchema):
    data: RealtimeConfigData


class RealtimeTicketData(BaseSchema):
    ticket: str
    expires_in: int


class RealtimeTicketResponse(BaseSchema):
    data: RealtimeTicketData


class RealtimeMetricsData(BaseSchema):
    connections: int
    rooms: int
    dropped_events: int
    queue_depth: int


class RealtimeMetricsResponse(BaseSchema):
    data: RealtimeMetricsData


__all__ = [
    "RealtimeConfigResponse",
    "RealtimeMetricsResponse",
    "RealtimeTicketResponse",
]
