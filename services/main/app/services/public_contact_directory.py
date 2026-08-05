"""Composition service for the public contact directory."""

from __future__ import annotations

import uuid
from collections.abc import Awaitable, Callable
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from ..schemas import (
    ContactDirectoryPaginationMeta,
    FAQRead,
    PublicCampusContactSummary,
    PublicContactDirectoryEntry,
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
    async def _list_all_pages(
        list_page: Callable[..., Awaitable[Any]],
        db: AsyncSession,
        **filters: Any,
    ) -> list[Any]:
        first_page = await list_page(db, page=1, per_page=100, **filters)
        items = list(first_page.items)

        for next_page in range(2, first_page.meta["pages"] + 1):
            result = await list_page(
                db,
                page=next_page,
                per_page=100,
                **filters,
            )
            items.extend(result.items)

        return items

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
        main_contacts = await PublicContactDirectoryService._list_all_pages(
            ContactService.list,
            db,
            is_main=True,
        )
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
        faqs = await PublicContactDirectoryService._list_all_pages(
            FAQService.list,
            db,
            is_main=True,
        )

        return PublicContactDirectoryRead(
            institution=(
                PublicUniversityContactSummary.model_validate(institution)
                if institution
                else None
            ),
            main_contacts=[
                PublicContactDirectoryEntry.model_validate(item)
                for item in main_contacts
            ],
            contacts=PublicContactDirectoryPage(
                items=[
                    PublicContactDirectoryEntry.model_validate(item)
                    for item in contact_result.items
                ],
                meta=ContactDirectoryPaginationMeta(**contact_result.meta),
            ),
            campuses=[
                PublicCampusContactSummary.model_validate(item) for item in campuses
            ],
            faqs=[FAQRead.model_validate(item) for item in faqs],
        )


__all__ = ["PublicContactDirectoryService"]
