"""Composition service for the public contact directory."""

from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from ..schemas import (
    CampusRead,
    ContactDirectoryPaginationMeta,
    ContactDirectoryRead,
    FAQRead,
    PublicContactDirectoryPage,
    PublicContactDirectoryRead,
    PublicUniversityContactSummary,
)
from .academic import CampusService
from .support import ContactService, FAQService
from .university import UniversityInfoService


class PublicContactDirectoryService:
    """Build a public-safe contact-directory read model."""

    @staticmethod
    async def compose(
        db: AsyncSession,
        *,
        search: str | None = None,
        contact_type: str | None = None,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
        page: int = 1,
        per_page: int = 20,
    ) -> PublicContactDirectoryRead:
        institution = await UniversityInfoService.get_current(db, public_only=True)
        main_result = await ContactService.list(db, page=1, per_page=100, is_main=True)
        contact_result = await ContactService.list(
            db,
            page=page,
            per_page=per_page,
            search=search,
            contact_type=contact_type,
            scope_type=scope_type,
            scope_id=scope_id,
        )
        campuses = await CampusService.list(db, is_active=True)
        faq_result = await FAQService.list(db, page=1, per_page=100, is_main=True)

        return PublicContactDirectoryRead(
            institution=(
                PublicUniversityContactSummary.model_validate(institution)
                if institution
                else None
            ),
            main_contacts=[
                ContactDirectoryRead.model_validate(item) for item in main_result.items
            ],
            contacts=PublicContactDirectoryPage(
                items=[
                    ContactDirectoryRead.model_validate(item)
                    for item in contact_result.items
                ],
                meta=ContactDirectoryPaginationMeta(**contact_result.meta),
            ),
            campuses=[CampusRead.model_validate(item) for item in campuses],
            faqs=[FAQRead.model_validate(item) for item in faq_result.items],
        )


__all__ = ["PublicContactDirectoryService"]
