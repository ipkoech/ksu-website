"""Notification service."""

from __future__ import annotations

import uuid
from collections import defaultdict
from datetime import datetime, timezone
from string import Formatter
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ksu_common import PaginatedResult

from ..models import Notification, NotificationDelivery, NotificationTemplate, Person, Role, StaffAssignment, User, UserRole
from ..tasks.celery_app import celery_app
from ._base import paginate_query


def _normalize_channels(channels: list[str] | None) -> list[str]:
    values = list(dict.fromkeys(channels or ["in_app"]))
    allowed = {"in_app", "email", "sms", "push"}
    invalid = [channel for channel in values if channel not in allowed]
    if invalid:
        raise ValueError(f"Unsupported notification channels: {', '.join(invalid)}")
    return values


def _render_template(value: str | None, context: dict[str, Any]) -> str | None:
    if value is None:
        return None
    safe_context = defaultdict(str, context)
    return value.format_map(safe_context)


def _template_fields(template_text: str | None) -> set[str]:
    if not template_text:
        return set()
    formatter = Formatter()
    return {field_name for _, field_name, _, _ in formatter.parse(template_text) if field_name}


class NotificationService:
    @staticmethod
    async def create(db: AsyncSession, **data) -> Notification:
        data["channels"] = _normalize_channels(data.get("channels"))
        notification = Notification(**data)
        db.add(notification)
        await db.flush()
        return notification

    @staticmethod
    async def get_by_id(db: AsyncSession, notification_id: uuid.UUID) -> Notification | None:
        result = await db.execute(
            Notification.active_query()
            .options(selectinload(Notification.deliveries))
            .where(Notification.id == notification_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def list_for_user(
        db: AsyncSession,
        user_id: uuid.UUID,
        *,
        page: int = 1,
        per_page: int = 20,
        unread_only: bool = False,
        load_options=(),
    ) -> PaginatedResult:
        query = (
            Notification.active_query()
            .options(selectinload(Notification.deliveries))
            .where(Notification.user_id == user_id, Notification.archived_at.is_(None))
            .order_by(Notification.created_at.desc())
        )
        if load_options:
            query = query.options(*load_options)
        if unread_only:
            query = query.where(Notification.is_read.is_(False))
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def mark_as_read(db: AsyncSession, notification: Notification) -> Notification:
        notification.mark_as_read()
        await db.flush()
        return notification

    @staticmethod
    async def delete(db: AsyncSession, notification: Notification):
        notification.soft_delete()
        await db.flush()

    @staticmethod
    async def get_template_by_id(db: AsyncSession, template_id: uuid.UUID, *, load_options=()) -> NotificationTemplate | None:
        query = NotificationTemplate.active_query().where(NotificationTemplate.id == template_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_template_by_code(db: AsyncSession, code: str, *, load_options=()) -> NotificationTemplate | None:
        query = NotificationTemplate.active_query().where(NotificationTemplate.code == code, NotificationTemplate.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_templates(db: AsyncSession, *, load_options=()) -> list[NotificationTemplate]:
        query = NotificationTemplate.active_query().order_by(NotificationTemplate.name.asc())
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def create_template(db: AsyncSession, **data) -> NotificationTemplate:
        template = NotificationTemplate(**data)
        db.add(template)
        await db.flush()
        return template

    @staticmethod
    async def update_template(db: AsyncSession, template: NotificationTemplate, **data) -> NotificationTemplate:
        for key, value in data.items():
            if value is not None:
                setattr(template, key, value)
        await db.flush()
        return template

    @staticmethod
    async def delete_template(db: AsyncSession, template: NotificationTemplate) -> None:
        template.soft_delete()
        template.is_active = False
        await db.flush()

    @staticmethod
    async def list_deliveries(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        status: str | None = None,
        channel: str | None = None,
        load_options=(),
    ) -> PaginatedResult:
        query = NotificationDelivery.active_query().order_by(NotificationDelivery.created_at.desc())
        if load_options:
            query = query.options(*load_options)
        if status is not None:
            query = query.where(NotificationDelivery.status == status)
        if channel is not None:
            query = query.where(NotificationDelivery.channel == channel)
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def resolve_user_ids(
        db: AsyncSession,
        *,
        user_ids: list[uuid.UUID] | None = None,
        role_names: list[str] | None = None,
        audience_scope_type: str | None = None,
        audience_scope_id: uuid.UUID | None = None,
    ) -> list[uuid.UUID]:
        resolved: set[uuid.UUID] = set(user_ids or [])

        if role_names:
            role_query = (
                select(UserRole.user_id)
                .join(Role, UserRole.role_id == Role.id)
                .where(
                    Role.name.in_(role_names),
                    UserRole.is_active.is_(True),
                    UserRole.deleted_at.is_(None),
                )
            )
            if audience_scope_type and audience_scope_id:
                role_query = role_query.where(
                    UserRole.scope_type == audience_scope_type,
                    UserRole.scope_id == audience_scope_id,
                )
            result = await db.execute(role_query)
            resolved.update(result.scalars().all())

        if audience_scope_type and audience_scope_id:
            role_query = select(UserRole.user_id).where(
                UserRole.scope_type == audience_scope_type,
                UserRole.scope_id == audience_scope_id,
                UserRole.is_active.is_(True),
                UserRole.deleted_at.is_(None),
            )
            role_result = await db.execute(role_query)
            resolved.update(role_result.scalars().all())

            staff_query = (
                select(Person.user_id)
                .join(StaffAssignment, StaffAssignment.person_id == Person.id)
                .where(
                    StaffAssignment.entity_type == audience_scope_type,
                    StaffAssignment.entity_id == audience_scope_id,
                    StaffAssignment.status == "active",
                    Person.user_id.is_not(None),
                    Person.deleted_at.is_(None),
                    StaffAssignment.deleted_at.is_(None),
                )
            )
            staff_result = await db.execute(staff_query)
            resolved.update(user_id for user_id in staff_result.scalars().all() if user_id is not None)

        return sorted(resolved, key=str)

    @staticmethod
    async def create_from_template(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        template: NotificationTemplate,
        context: dict[str, Any] | None = None,
        **overrides,
    ) -> Notification:
        context = context or {}
        required = set(template.variables or [])
        used = (
            _template_fields(template.title_template)
            | _template_fields(template.subject_template)
            | _template_fields(template.message_template)
        )
        missing = sorted((required | used) - set(context))
        if missing:
            raise ValueError(f"Missing template context variables: {', '.join(missing)}")

        payload = {
            "user_id": user_id,
            "template_id": template.id,
            "title": _render_template(template.title_template, context),
            "subject": _render_template(template.subject_template, context),
            "message": _render_template(template.message_template, context),
            "channels": _normalize_channels(overrides.get("channels") or template.channels),
            "payload": context | (overrides.get("payload") or {}),
            "notification_type": overrides.get("notification_type", "info"),
            "priority": overrides.get("priority", "normal"),
            "action_url": overrides.get("action_url"),
            "scope_type": overrides.get("scope_type"),
            "scope_id": overrides.get("scope_id"),
            "expires_at": overrides.get("expires_at"),
        }
        return await NotificationService.create(db, **payload)

    @staticmethod
    async def queue_deliveries(db: AsyncSession, notification: Notification) -> list[NotificationDelivery]:
        result = await db.execute(select(User).where(User.id == notification.user_id, User.deleted_at.is_(None)))
        user = result.scalar_one_or_none()
        if user is None:
            raise ValueError("Notification user not found")

        deliveries: list[NotificationDelivery] = []
        now = datetime.now(timezone.utc)
        for channel in _normalize_channels(notification.channels):
            recipient = None
            if channel == "email":
                recipient = user.email
            elif channel == "sms":
                recipient = user.phone
            elif channel == "push":
                tokens = user.push_tokens or []
                recipient = tokens[0] if tokens else None
            elif channel == "in_app":
                recipient = str(user.id)

            delivery = NotificationDelivery(
                notification_id=notification.id,
                channel=channel,
                recipient=recipient,
                status="pending",
                scheduled_for=now,
                expires_at=notification.expires_at,
            )
            db.add(delivery)
            deliveries.append(delivery)

        notification.dispatched_at = now
        await db.flush()

        for delivery in deliveries:
            celery_app.send_task("main.notifications.dispatch_delivery", args=[str(delivery.id)])

        return deliveries

    @staticmethod
    async def send_to_user(db: AsyncSession, **data) -> Notification:
        notification = await NotificationService.create(db, **data)
        await NotificationService.queue_deliveries(db, notification)
        return notification

    @staticmethod
    async def send_broadcast(
        db: AsyncSession,
        *,
        user_ids: list[uuid.UUID] | None = None,
        role_names: list[str] | None = None,
        audience_scope_type: str | None = None,
        audience_scope_id: uuid.UUID | None = None,
        template_code: str | None = None,
        template_context: dict[str, Any] | None = None,
        **data,
        ) -> dict[str, Any]:
        recipients = await NotificationService.resolve_user_ids(
            db,
            user_ids=user_ids,
            role_names=role_names,
            audience_scope_type=audience_scope_type,
            audience_scope_id=audience_scope_id,
        )
        if not recipients:
            return {"recipient_count": 0, "notification_ids": []}

        template = None
        if template_code:
            template = await NotificationService.get_template_by_code(db, template_code)
            if template is None:
                raise ValueError("Notification template not found")

        notification_ids: list[uuid.UUID] = []
        for recipient_user_id in recipients:
            if template is not None:
                notification = await NotificationService.create_from_template(
                    db,
                    user_id=recipient_user_id,
                    template=template,
                    context=template_context,
                    **data,
                )
            else:
                payload = dict(data)
                payload["user_id"] = recipient_user_id
                notification = await NotificationService.send_to_user(db, **payload)
                notification_ids.append(notification.id)
                continue

            await NotificationService.queue_deliveries(db, notification)
            notification_ids.append(notification.id)

        return {"recipient_count": len(recipients), "notification_ids": notification_ids}

    @staticmethod
    async def preview_broadcast(
        db: AsyncSession,
        *,
        user_ids: list[uuid.UUID] | None = None,
        role_names: list[str] | None = None,
        audience_scope_type: str | None = None,
        audience_scope_id: uuid.UUID | None = None,
    ) -> dict[str, Any]:
        recipients = await NotificationService.resolve_user_ids(
            db,
            user_ids=user_ids,
            role_names=role_names,
            audience_scope_type=audience_scope_type,
            audience_scope_id=audience_scope_id,
        )
        sample = [str(user_id) for user_id in recipients[:20]]
        return {
            "recipient_count": len(recipients),
            "sample_user_ids": sample,
            "truncated": len(recipients) > len(sample),
        }

    @staticmethod
    async def archive_expired_notifications(db: AsyncSession) -> int:
        now = datetime.now(timezone.utc)
        result = await db.execute(
            select(Notification).where(
                Notification.deleted_at.is_(None),
                Notification.archived_at.is_(None),
                Notification.expires_at.is_not(None),
                Notification.expires_at < now,
            )
        )
        items = list(result.scalars().all())
        for item in items:
            item.mark_archived()
        await db.flush()
        return len(items)
