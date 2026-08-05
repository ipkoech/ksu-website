"""Audit log service."""

from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common import PaginatedResult
from ksu_common.models import AuditLog

from ..schemas.school_portal_audit import SchoolPortalAuditCreate
from ._base import paginate_query


async def record_school_portal_audit(
    db: AsyncSession,
    data: SchoolPortalAuditCreate,
) -> AuditLog:
    """Persist one mutation audit event with its server-derived school scope."""
    details = {
        **data.details,
        "school_id": str(data.school_id),
        "request_id": data.request_id,
    }
    record = AuditLog(
        service_name="main",
        action=data.action,
        resource_type=data.resource_type,
        resource_id=str(data.resource_id),
        request_method=data.request_method.upper(),
        request_path=data.request_path,
        status_code=200,
        status="success",
        user_id=data.actor_id,
        ip_address=data.ip_address,
        user_agent=data.user_agent,
        details=details,
        changes=data.changed_fields,
    )
    db.add(record)
    await db.flush()
    return record


class AuditService:
    @staticmethod
    def _default_load_options():
        return ()

    @staticmethod
    async def get_by_id(db: AsyncSession, audit_id: uuid.UUID, load_options: Sequence = ()) -> AuditLog | None:
        options = load_options if load_options else AuditService._default_load_options()
        query = select(AuditLog).options(*options).where(AuditLog.id == audit_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        service_name: str | None = None,
        user_id: uuid.UUID | None = None,
        resource_type: str | None = None,
        request_path_prefix: str | None = None,
        status: str | None = None,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        options = load_options if load_options else AuditService._default_load_options()
        query = select(AuditLog).options(*options).order_by(AuditLog.happened_at.desc(), AuditLog.created_at.desc())
        if service_name is not None:
            query = query.where(AuditLog.service_name == service_name)
        if user_id is not None:
            query = query.where(AuditLog.user_id == user_id)
        if resource_type is not None:
            query = query.where(AuditLog.resource_type == resource_type)
        if request_path_prefix is not None:
            query = query.where(
                or_(
                    AuditLog.request_path == request_path_prefix,
                    AuditLog.request_path.startswith(f"{request_path_prefix}/"),
                )
            )
        if status is not None:
            query = query.where(AuditLog.status == status)
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def list_for_school(
        db: AsyncSession,
        *,
        school_id: uuid.UUID,
        page: int = 1,
        per_page: int = 20,
        action: str | None = None,
        resource_type: str | None = None,
        status: str | None = None,
    ) -> PaginatedResult:
        query = (
            select(AuditLog)
            .where(
                AuditLog.service_name == "main",
                AuditLog.details["school_id"].as_string() == str(school_id),
            )
            .order_by(AuditLog.happened_at.desc(), AuditLog.created_at.desc())
        )
        if action is not None:
            query = query.where(AuditLog.action == action)
        if resource_type is not None:
            query = query.where(AuditLog.resource_type == resource_type)
        if status is not None:
            query = query.where(AuditLog.status == status)
        return await paginate_query(db, query, page=page, per_page=per_page)
