"""Versioned domain-event envelope shared by outbox delivery and realtime."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import Field

from .base import BaseSchema


class DomainEventScope(BaseSchema):
    type: str = Field(min_length=1, max_length=32)
    id: uuid.UUID | None = None


class DomainEventResource(BaseSchema):
    type: str = Field(min_length=1, max_length=64)
    id: uuid.UUID


class DomainEventEnvelope(BaseSchema):
    id: uuid.UUID
    type: str = Field(min_length=1, max_length=128)
    version: int = Field(ge=1)
    occurred_at: datetime
    scope: DomainEventScope
    actor_id: uuid.UUID | None = None
    resource: DomainEventResource
    data: dict[str, Any] = Field(default_factory=dict)


__all__ = [
    "DomainEventEnvelope",
    "DomainEventResource",
    "DomainEventScope",
]
