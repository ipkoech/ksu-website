"""Services for FAQ, contacts, and tickets."""

from __future__ import annotations

import uuid
from collections.abc import Awaitable, Callable
from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy import and_, false, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common import PaginatedResult

from ..models import ContactDirectory, Department, Division, FAQ, Person, School, SupportTicket, Wing
from ._base import apply_updates, ilike_any, paginate_query


class ContactReferenceError(ValueError):
    """Raised when a contact owner or person reference is invalid."""


CONTACT_OWNER_MODELS = {
    "division": Division,
    "directorate": Division,
    "wing": Wing,
    "school": School,
    "department": Department,
}


def _apply_scope(query, model, *, scope_type=None, scope_id=None, is_public=None, is_main=None):
    if scope_type is not None:
        query = query.where(model.scope_type == scope_type)
    if scope_id is not None:
        query = query.where(model.scope_id == scope_id)
    if is_public is not None and hasattr(model, "is_public"):
        query = query.where(model.is_public.is_(is_public))
    if is_main is not None and hasattr(model, "is_main"):
        query = query.where(model.is_main.is_(is_main))
    return query


class FAQService:
    @staticmethod
    async def get_by_id(db: AsyncSession, faq_id: uuid.UUID, *, load_options: Sequence = ()) -> FAQ | None:
        query = FAQ.active_query().where(FAQ.id == faq_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> FAQ:
        faq = FAQ(**data)
        db.add(faq)
        await db.flush()
        return faq

    @staticmethod
    async def update(db: AsyncSession, faq: FAQ, **data) -> FAQ:
        apply_updates(faq, **data)
        await db.flush()
        return faq

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
        is_public: bool | None = True,
        is_main: bool | None = None,
        status: str | None = "published",
        search: str | None = None,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = FAQ.active_query().order_by(FAQ.display_order.asc(), FAQ.created_at.desc())
        if load_options:
            query = query.options(*load_options)
        query = _apply_scope(query, FAQ, scope_type=scope_type, scope_id=scope_id, is_public=is_public, is_main=is_main)
        if status is not None:
            query = query.where(FAQ.status == status)
        if search:
            query = query.where(ilike_any(search, FAQ.question, FAQ.answer_plain_text))
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def delete(db: AsyncSession, faq: FAQ):
        faq.soft_delete()
        await db.flush()


class ContactService:
    @staticmethod
    async def get_by_id(db: AsyncSession, contact_id: uuid.UUID, *, load_options: Sequence = ()) -> ContactDirectory | None:
        query = ContactDirectory.active_query().where(ContactDirectory.id == contact_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> ContactDirectory:
        await ContactService.validate_references(
            db,
            scope_type=data.get("scope_type"),
            scope_id=data.get("scope_id"),
            contact_person_id=data.get("contact_person_id"),
        )
        contact = ContactDirectory(**data)
        db.add(contact)
        await db.flush()
        return contact

    @staticmethod
    async def update(db: AsyncSession, contact: ContactDirectory, **data) -> ContactDirectory:
        if "scope_type" in data or "scope_id" in data:
            await ContactService.validate_references(
                db,
                scope_type=data.get("scope_type", contact.scope_type),
                scope_id=data.get("scope_id", contact.scope_id),
                contact_person_id=data.get("contact_person_id", contact.contact_person_id),
            )
        elif "contact_person_id" in data:
            await ContactService._validate_contact_person(db, data["contact_person_id"])
        apply_updates(contact, **data)
        await db.flush()
        return contact

    @staticmethod
    async def validate_references(
        db: AsyncSession,
        *,
        scope_type: str | None,
        scope_id: uuid.UUID | None,
        contact_person_id: uuid.UUID | None = None,
    ) -> None:
        if scope_type is None:
            raise ContactReferenceError("Contact owner scope_type is required")
        if scope_type == "university":
            if scope_id is not None:
                raise ContactReferenceError("scope_id must not be set for university contacts")
        else:
            owner_model = CONTACT_OWNER_MODELS.get(scope_type)
            if owner_model is None:
                raise ContactReferenceError(f"Unsupported contact owner type: {scope_type}")
            if scope_id is None:
                raise ContactReferenceError(f"scope_id is required for {scope_type} contacts")
            owner_conditions = [
                owner_model.id == scope_id,
                owner_model.deleted_at.is_(None),
            ]
            if scope_type == "directorate":
                owner_conditions.append(Division.division_type == "directorate")
            result = await db.execute(
                select(owner_model.id).where(*owner_conditions)
            )
            if result.scalar_one_or_none() is None:
                raise ContactReferenceError(f"{scope_type.title()} not found")

        await ContactService._validate_contact_person(db, contact_person_id)

    @staticmethod
    async def _validate_contact_person(db: AsyncSession, contact_person_id: uuid.UUID | None) -> None:
        if contact_person_id is None:
            return
        result = await db.execute(
            select(Person.id).where(
                Person.id == contact_person_id,
                Person.deleted_at.is_(None),
            )
        )
        if result.scalar_one_or_none() is None:
            raise ContactReferenceError("Contact person not found")

    @staticmethod
    def _list_query(
        *,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
        is_public: bool | None = True,
        is_main: bool | None = None,
        status: str | None = "active",
        search: str | None = None,
        contact_type: str | None = None,
        sort: str = "name_asc",
        load_options: Sequence = (),
    ):
        query = ContactDirectory.active_query()
        if load_options:
            query = query.options(*load_options)
        query = _apply_scope(query, ContactDirectory, scope_type=scope_type, scope_id=scope_id, is_public=is_public, is_main=is_main)
        if status is not None:
            query = query.where(ContactDirectory.status == status)
        search_value = search.strip() if search else None
        if search_value:
            pattern = f"%{search_value}%"
            query = query.where(
                or_(
                    ContactDirectory.name.ilike(pattern),
                    ContactDirectory.contact_type.ilike(pattern),
                    ContactDirectory.email.ilike(pattern),
                    ContactDirectory.extension.ilike(pattern),
                    ContactDirectory.physical_address.ilike(pattern),
                    ContactDirectory.building.ilike(pattern),
                    ContactDirectory.room_number.ilike(pattern),
                )
            )
        if contact_type:
            query = query.where(ContactDirectory.contact_type == contact_type)
        if sort == "name_desc":
            query = query.order_by(ContactDirectory.name.desc(), ContactDirectory.id.asc())
        elif sort == "name_asc":
            query = query.order_by(ContactDirectory.name.asc(), ContactDirectory.id.asc())
        else:
            raise ValueError("Unsupported contact sort")
        return query

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
        is_public: bool | None = True,
        is_main: bool | None = None,
        status: str | None = "active",
        search: str | None = None,
        contact_type: str | None = None,
        sort: str = "name_asc",
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = ContactService._list_query(
            scope_type=scope_type,
            scope_id=scope_id,
            is_public=is_public,
            is_main=is_main,
            status=status,
            search=search,
            contact_type=contact_type,
            sort=sort,
            load_options=load_options,
        )
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def list_admin_authorized(
        db: AsyncSession,
        *,
        is_visible: Callable[[str | None, uuid.UUID | None], Awaitable[bool]],
        page: int = 1,
        per_page: int = 20,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
        is_public: bool | None = None,
        is_main: bool | None = None,
        status: str | None = None,
        search: str | None = None,
        contact_type: str | None = None,
        sort: str = "name_asc",
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = ContactService._list_query(
            scope_type=scope_type,
            scope_id=scope_id,
            is_public=is_public,
            is_main=is_main,
            status=status,
            search=search,
            contact_type=contact_type,
            sort=sort,
            load_options=load_options,
        )
        scope_query = query.with_only_columns(
            ContactDirectory.scope_type,
            ContactDirectory.scope_id,
        ).order_by(None).distinct()
        scope_result = await db.execute(scope_query)
        allowed_scopes = [
            (candidate_scope_type, candidate_scope_id)
            for candidate_scope_type, candidate_scope_id in scope_result.all()
            if await is_visible(candidate_scope_type, candidate_scope_id)
        ]

        allowed_predicates = []
        for allowed_scope_type, allowed_scope_id in allowed_scopes:
            type_predicate = (
                ContactDirectory.scope_type.is_(None)
                if allowed_scope_type is None
                else ContactDirectory.scope_type == allowed_scope_type
            )
            id_predicate = (
                ContactDirectory.scope_id.is_(None)
                if allowed_scope_id is None
                else ContactDirectory.scope_id == allowed_scope_id
            )
            allowed_predicates.append(and_(type_predicate, id_predicate))

        query = query.where(or_(*allowed_predicates) if allowed_predicates else false())
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def delete(db: AsyncSession, contact: ContactDirectory):
        contact.soft_delete()
        await db.flush()


class SupportTicketService:
    @staticmethod
    async def get_by_id(db: AsyncSession, ticket_id: uuid.UUID, *, load_options: Sequence = ()) -> SupportTicket | None:
        query = SupportTicket.active_query().where(SupportTicket.id == ticket_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> SupportTicket:
        ticket = SupportTicket(**data)
        db.add(ticket)
        await db.flush()
        return ticket

    @staticmethod
    async def update(db: AsyncSession, ticket: SupportTicket, **data) -> SupportTicket:
        apply_updates(ticket, **data)
        if ticket.status in {"resolved", "closed"} and ticket.resolved_at is None:
            ticket.resolved_at = datetime.now(timezone.utc)
        await db.flush()
        return ticket

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        requester_user_id: uuid.UUID | None = None,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
        status: str | None = None,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = SupportTicket.active_query().order_by(SupportTicket.created_at.desc())
        if load_options:
            query = query.options(*load_options)
        if requester_user_id:
            query = query.where(SupportTicket.requester_user_id == requester_user_id)
        query = _apply_scope(query, SupportTicket, scope_type=scope_type, scope_id=scope_id)
        if status:
            query = query.where(SupportTicket.status == status)
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def delete(db: AsyncSession, ticket: SupportTicket):
        ticket.soft_delete()
        await db.flush()
