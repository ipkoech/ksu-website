from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from ..models.audit import AuditLog


async def record_audit(
    db: AsyncSession,
    *,
    action: str,
    entity_type: str,
    entity_id: str,
    actor_id: str | None,
    previous_value: dict[str, Any] | None = None,
    new_value: dict[str, Any] | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> AuditLog:
    entry = AuditLog(action=action, entity_type=entity_type, entity_id=entity_id, actor_id=actor_id, previous_value=previous_value, new_value=new_value, ip_address=ip_address, user_agent=user_agent)
    db.add(entry)
    return entry
