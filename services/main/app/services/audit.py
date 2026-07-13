"""Audit log service."""

from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common import PaginatedResult
from ksu_common.models import AuditLog

from ._base import paginate_query


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
