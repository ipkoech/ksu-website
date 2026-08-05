"""Research realtime configuration endpoints."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from ksu_common import cached_public
from ksu_common.schemas.responses import success

router = APIRouter(prefix="/realtime", tags=["Realtime"])
HEARTBEAT_SECONDS = 25


def research_realtime_config() -> dict[str, Any]:
    return {
        "scope_type": "research",
        "websocket_path": "/api/v1/realtime",
        "heartbeat_seconds": HEARTBEAT_SECONDS,
        "channels": [
            "notifications",
            "research",
            "research.projects",
            "research.grants",
            "research.farm",
            "research.sustainability",
            "research.content",
            "research.donations",
            "research.capacity",
            "research.settings",
        ],
        "events": [
            "connected",
            "heartbeat",
            "notification.created",
            "research.record.changed",
            "research.project.changed",
            "research.grant.changed",
            "research.farm.changed",
            "research.sustainability.changed",
            "research.content.changed",
            "research.donation.changed",
            "research.capacity.changed",
            "research.setting.changed",
        ],
    }


async def get_research_realtime_config():
    return success(data=research_realtime_config())


@router.get("/research/config")
@cached_public(timeout=300)
async def _cached_research_realtime_config():
    return await get_research_realtime_config()
