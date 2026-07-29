"""Seed notification templates used by School Portal event policies."""

from __future__ import annotations

from sqlalchemy import select

from app.models import NotificationTemplate
from app.services.notification import NOTIFICATION_EVENT_POLICIES


async def seed_school_notification_templates(db) -> int:
    """Idempotently seed one template per stable event policy."""
    count = 0
    for event_type, policy in NOTIFICATION_EVENT_POLICIES.items():
        code = event_type.replace(".", "_")
        result = await db.execute(
            select(NotificationTemplate).where(NotificationTemplate.code == code)
        )
        template = result.scalar_one_or_none()
        values = {
            "name": policy["title"],
            "description": f"Generated from {event_type}",
            "title_template": policy["title"],
            "subject_template": policy["title"],
            "message_template": policy["message"],
            "channels": policy["channels"],
            "variables": [],
            "is_active": True,
        }
        if template is None:
            db.add(NotificationTemplate(code=code, **values))
            count += 1
        else:
            for key, value in values.items():
                setattr(template, key, value)
    await db.flush()
    return count


__all__ = ["seed_school_notification_templates"]
