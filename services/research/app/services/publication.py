"""Publication services."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from ksu_common import PaginatedResult, paginate
from ksu_common.auth import TokenPayload
from sqlalchemy import func, select

from ..core.auth import resolve_exact_school_grant
from ..models import EditorialBoardMember, Journal, Publication, PublicationAuthor
from .references import MainReferenceValidator
from ._crud import CRUDService, build_simple_service


class PublicationService(CRUDService[Publication]):
    model = Publication
    search_fields = ("title", "journal_name", "publisher", "doi", "abstract")

    @classmethod
    def _apply_filters(cls, query, filters: dict[str, Any] | None = None):
        query = super()._apply_filters(query, filters)
        author_id = (filters or {}).get("author_id")
        if author_id is not None:
            query = query.where(Publication.authors.any(PublicationAuthor.person_id == author_id))
        return query

    @classmethod
    async def list_for_school(
        cls,
        db,
        user: TokenPayload,
        *,
        page: int = 1,
        per_page: int = 20,
        status_filter: str | None = None,
    ) -> PaginatedResult:
        school_id = resolve_exact_school_grant(user, "school.publications.view")
        query = select(Publication).where(Publication.school_id == school_id)
        if status_filter:
            query = query.where(Publication.status == status_filter)
        query = query.order_by(Publication.updated_at.desc())
        return await paginate(db, query, page=page, per_page=per_page)

    @classmethod
    async def status_summary_for_school(
        cls,
        db,
        user: TokenPayload,
    ) -> dict[str, int]:
        school_id = resolve_exact_school_grant(
            user,
            "school.publications.view",
        )
        rows = (
            await db.execute(
                select(Publication.status, func.count(Publication.id))
                .where(
                    Publication.school_id == school_id,
                    Publication.deleted_at.is_(None),
                )
                .group_by(Publication.status)
            )
        ).all()
        return {str(status_value): int(total) for status_value, total in rows}

    @classmethod
    async def get_for_school(
        cls,
        db,
        publication_id: uuid.UUID,
        user: TokenPayload,
        permission: str = "school.publications.view",
    ) -> Publication:
        school_id = resolve_exact_school_grant(user, permission)
        item = await cls.get_by_id(db, publication_id)
        if item is None or item.school_id != school_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publication not found")
        return item

    @classmethod
    async def create_for_school(cls, db, data, user: TokenPayload) -> Publication:
        school_id = resolve_exact_school_grant(user, "school.publications.manage")
        payload = data.model_dump(exclude_unset=True)
        await MainReferenceValidator.validate_department_school(
            school_id,
            payload.get("department_id"),
        )
        item = Publication(
            **payload,
            school_id=school_id,
            submitted_by_user_id=uuid.UUID(user.sub),
            status="draft",
        )
        db.add(item)
        await db.flush()
        await db.refresh(item)
        return item

    @classmethod
    async def update_for_school(cls, db, item: Publication, data, user: TokenPayload) -> Publication:
        school_id = resolve_exact_school_grant(user, "school.publications.manage")
        if item.school_id != school_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publication not found")
        if item.status != "draft":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Only draft publications can be edited",
            )
        payload = data.model_dump(exclude_unset=True)
        if "department_id" in payload:
            await MainReferenceValidator.validate_department_school(
                school_id,
                payload["department_id"],
            )
        for key, value in payload.items():
            setattr(item, key, value)
        await db.flush()
        if hasattr(db, "refresh"):
            await db.refresh(item)
        return item

    @classmethod
    async def submit_for_school(cls, db, item: Publication, user: TokenPayload) -> Publication:
        school_id = resolve_exact_school_grant(user, "school.publications.submit")
        if item.school_id != school_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publication not found")
        if item.status != "draft":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Only draft publications can be submitted",
            )
        item.status = "submitted"
        item.submitted_at = datetime.now(timezone.utc)
        item.submitted_by_user_id = uuid.UUID(user.sub)
        await db.flush()
        return item

    @classmethod
    async def withdraw_for_school(cls, db, item: Publication, user: TokenPayload) -> Publication:
        school_id = resolve_exact_school_grant(user, "school.publications.submit")
        if item.school_id != school_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publication not found")
        if item.status != "submitted":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Only submitted publications can be withdrawn",
            )
        item.status = "draft"
        item.withdrawn_at = datetime.now(timezone.utc)
        await db.flush()
        return item


PublicationAuthorService = build_simple_service(
    PublicationAuthor,
    "name",
    "affiliation",
    "orcid",
    reference_fields={"person_id": "persons"},
)
JournalService = build_simple_service(
    Journal,
    "name",
    "abbreviation",
    "publisher",
    "issn",
)
EditorialBoardService = build_simple_service(
    EditorialBoardMember,
    "name",
    "affiliation",
    "role",
    reference_fields={"person_id": "persons"},
)
