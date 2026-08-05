"""Unified public search across library-owned records."""

from __future__ import annotations

import uuid
from collections import Counter
from typing import Iterable

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import (
    ElectronicResource,
    Library,
    LibraryExternalLink,
    LibraryFile,
    LibraryGuide,
    LibraryPolicyPage,
    LibraryRegulation,
    LibraryResource,
    LibraryService,
    LibrarySpecialist,
    LibraryStaff,
    LibraryWorkflow,
)
from .guides import (
    public_guides_query,
    public_policy_pages_query,
    public_specialists_query,
    public_workflows_query,
)

SEARCH_TYPES = {
    "branch",
    "catalog",
    "database",
    "download",
    "external_link",
    "regulation",
    "service",
    "staff",
    "guide",
    "specialist",
    "workflow",
    "policy",
}

WORKFLOW_URLS = {
    "borrowing": "/borrowing",
    "borrowing_access": "/borrowing",
    "remote_access": "/remote-access",
    "repository_deposit": "/repositories",
    "digital_scholarship": "/digital-scholarship",
}


def _term(query: str) -> str:
    return f"%{query.strip()}%"


def _snippet(*values: object | None) -> str | None:
    for value in values:
        if value:
            text = str(value).strip()
            if text:
                return text[:240]
    return None


def _joined(values: list[str] | None) -> str | None:
    if not values:
        return None
    text = ", ".join(value for value in values if value)
    return text or None


def _guide_url(slug: str) -> str:
    return f"/guides/{slug}"


def _workflow_url(workflow_type: str, slug: str) -> str:
    return WORKFLOW_URLS.get(workflow_type, f"/guides/{slug}")


def _policy_url(slug: str) -> str:
    return f"/policies/{slug}"


def _selected_types(types: str | None) -> set[str]:
    if not types:
        return set(SEARCH_TYPES)
    selected = {item.strip() for item in types.split(",") if item.strip()}
    return selected & SEARCH_TYPES


def _public_library_parent_filter(model: type, *, allow_global: bool = False):
    parent_is_public = (
        sa.select(Library.id)
        .where(
            Library.id == model.library_id,
            Library.is_active.is_(True),
            Library.is_public.is_(True),
            Library.deleted_at.is_(None),
        )
        .exists()
    )
    if allow_global:
        return sa.or_(model.library_id.is_(None), parent_is_public)
    return parent_is_public


def _per_type_limit(types: set[str], limit: int) -> int:
    count = len(types)
    return max(3, min(12, limit // max(1, count) + 1))


async def _library_names(db: AsyncSession, library_ids: Iterable[uuid.UUID]) -> dict[uuid.UUID, str]:
    ids = list(dict.fromkeys(library_ids))
    if not ids:
        return {}
    result = await db.execute(sa.select(Library.id, Library.name).where(Library.id.in_(ids)))
    return dict(result.all())


async def unified_search(
    db: AsyncSession,
    *,
    query: str,
    types: str | None = None,
    library_id: uuid.UUID | None = None,
    limit: int = 40,
) -> dict:
    selected = _selected_types(types)
    if not query.strip() or not selected:
        return {"query": query, "total": 0, "results": [], "by_type": {}}

    term = _term(query)
    per_type = _per_type_limit(selected, limit)
    results: list[dict] = []

    if "branch" in selected:
        rows = (
            await db.execute(
                Library.active_query()
                .where(
                    Library.is_active.is_(True),
                    Library.is_public.is_(True),
                    sa.or_(
                        Library.name.ilike(term),
                        Library.short_name.ilike(term),
                        Library.description.ilike(term),
                        Library.address.ilike(term),
                    ),
                )
                .order_by(Library.sort_order, Library.name)
                .limit(per_type)
            )
        ).scalars()
        results.extend(
            {
                "id": str(row.id),
                "type": "branch",
                "title": row.name,
                "description": _snippet(row.description, row.address),
                "url": f"/services#branch-{row.slug}",
                "library_id": str(row.id),
                "library_name": row.name,
                "metadata": {"slug": row.slug, "library_type": row.library_type},
            }
            for row in rows
        )

    library_names: dict[uuid.UUID, str] = {}

    if "catalog" in selected:
        statement = LibraryResource.active_query().where(
            LibraryResource.is_active.is_(True),
            _public_library_parent_filter(LibraryResource),
            sa.or_(
                LibraryResource.title.ilike(term),
                LibraryResource.subtitle.ilike(term),
                LibraryResource.authors.ilike(term),
                LibraryResource.publisher.ilike(term),
                LibraryResource.isbn.ilike(term),
                LibraryResource.issn.ilike(term),
                LibraryResource.call_number.ilike(term),
                LibraryResource.description.ilike(term),
            ),
        )
        if library_id:
            statement = statement.where(LibraryResource.library_id == library_id)
        rows = (await db.execute(statement.order_by(LibraryResource.title).limit(per_type))).scalars().all()
        library_names.update(await _library_names(db, [row.library_id for row in rows]))
        results.extend(
            {
                "id": str(row.id),
                "type": "catalog",
                "title": row.title,
                "description": _snippet(row.authors, row.description, row.publisher),
                "url": f"/catalog?resource={row.id}",
                "library_id": str(row.library_id),
                "library_name": library_names.get(row.library_id),
                "metadata": {
                    "resource_type": row.resource_type,
                    "status": row.status,
                    "call_number": row.call_number,
                    "available_copies": row.available_copies,
                },
            }
            for row in rows
        )

    if "database" in selected:
        statement = ElectronicResource.active_query().where(
            ElectronicResource.is_active.is_(True),
            _public_library_parent_filter(ElectronicResource, allow_global=True),
            sa.or_(
                ElectronicResource.name.ilike(term),
                ElectronicResource.provider.ilike(term),
                ElectronicResource.description.ilike(term),
            ),
        )
        if library_id:
            statement = statement.where(ElectronicResource.library_id == library_id)
        rows = (
            await db.execute(
                statement.order_by(
                    ElectronicResource.sort_order, ElectronicResource.name
                ).limit(per_type)
            )
        ).scalars().all()
        library_names.update(
            await _library_names(db, [row.library_id for row in rows if row.library_id])
        )
        results.extend(
            {
                "id": str(row.id),
                "type": "database",
                "title": row.name,
                "description": _snippet(row.description, row.provider),
                "url": f"/electronic?resource={row.slug}",
                "library_id": str(row.library_id) if row.library_id else None,
                "library_name": library_names.get(row.library_id) if row.library_id else None,
                "metadata": {
                    "provider": row.provider,
                    "resource_type": row.resource_type,
                    "access_level": row.access_level,
                    "access_type": row.access_type,
                    "access_url": row.access_url,
                },
            }
            for row in rows
        )

    if "service" in selected:
        statement = LibraryService.active_query().where(
            LibraryService.is_active.is_(True),
            LibraryService.is_public.is_(True),
            _public_library_parent_filter(LibraryService),
            sa.or_(
                LibraryService.name.ilike(term),
                LibraryService.description.ilike(term),
                LibraryService.eligibility.ilike(term),
                LibraryService.how_to_access.ilike(term),
            ),
        )
        if library_id:
            statement = statement.where(LibraryService.library_id == library_id)
        rows = (await db.execute(statement.order_by(LibraryService.sort_order, LibraryService.name).limit(per_type))).scalars().all()
        library_names.update(await _library_names(db, [row.library_id for row in rows]))
        results.extend(
            {
                "id": str(row.id),
                "type": "service",
                "title": row.name,
                "description": _snippet(row.description, row.how_to_access),
                "url": f"/services#{row.slug}",
                "library_id": str(row.library_id),
                "library_name": library_names.get(row.library_id),
                "metadata": {"service_type": row.service_type, "contact_info": row.contact_info},
            }
            for row in rows
        )

    if "download" in selected:
        statement = LibraryFile.active_query().where(
            LibraryFile.is_public.is_(True),
            _public_library_parent_filter(LibraryFile),
            sa.or_(
                LibraryFile.title.ilike(term),
                LibraryFile.description.ilike(term),
                LibraryFile.file_category.ilike(term),
            ),
        )
        if library_id:
            statement = statement.where(LibraryFile.library_id == library_id)
        rows = (await db.execute(statement.order_by(LibraryFile.sort_order, LibraryFile.title).limit(per_type))).scalars().all()
        library_names.update(await _library_names(db, [row.library_id for row in rows]))
        results.extend(
            {
                "id": str(row.id),
                "type": "download",
                "title": row.title,
                "description": _snippet(row.description, row.file_category),
                "url": f"/downloads?file={row.id}",
                "library_id": str(row.library_id),
                "library_name": library_names.get(row.library_id),
                "metadata": {
                    "media_id": str(row.media_id),
                    "file_category": row.file_category,
                    "access_level": row.access_level,
                },
            }
            for row in rows
        )

    if "staff" in selected:
        statement = LibraryStaff.active_query().where(
            LibraryStaff.is_active.is_(True),
            LibraryStaff.is_public.is_(True),
            _public_library_parent_filter(LibraryStaff),
            sa.or_(
                LibraryStaff.job_title.ilike(term),
                LibraryStaff.department.ilike(term),
                LibraryStaff.role.ilike(term),
                LibraryStaff.bio.ilike(term),
                LibraryStaff.specialization.ilike(term),
            ),
        )
        if library_id:
            statement = statement.where(LibraryStaff.library_id == library_id)
        rows = (await db.execute(statement.order_by(LibraryStaff.sort_order, LibraryStaff.created_at).limit(per_type))).scalars().all()
        library_names.update(await _library_names(db, [row.library_id for row in rows]))
        results.extend(
            {
                "id": str(row.id),
                "type": "staff",
                "title": row.job_title or row.role.replace("_", " ").title(),
                "description": _snippet(row.specialization, row.bio, row.department),
                "url": f"/staff?member={row.id}",
                "library_id": str(row.library_id),
                "library_name": library_names.get(row.library_id),
                "metadata": {
                    "person_id": str(row.person_id),
                    "role": row.role,
                    "department": row.department,
                    "specialization": row.specialization,
                },
            }
            for row in rows
        )

    if "guide" in selected:
        statement = public_guides_query().where(
            sa.or_(
                LibraryGuide.title.ilike(term),
                LibraryGuide.summary.ilike(term),
                LibraryGuide.subject.ilike(term),
                LibraryGuide.course_code.ilike(term),
                LibraryGuide.audience.ilike(term),
            )
        )
        if library_id:
            statement = statement.where(LibraryGuide.library_id == library_id)
        rows = (
            await db.execute(
                statement.order_by(LibraryGuide.sort_order, LibraryGuide.title).limit(per_type)
            )
        ).scalars().all()
        library_names.update(
            await _library_names(db, [row.library_id for row in rows if row.library_id])
        )
        results.extend(
            {
                "id": str(row.id),
                "type": "guide",
                "title": row.title,
                "description": _snippet(
                    row.summary, row.subject, row.course_code, row.audience
                ),
                "url": _guide_url(row.slug),
                "library_id": str(row.library_id) if row.library_id else None,
                "library_name": library_names.get(row.library_id) if row.library_id else None,
                "metadata": {
                    "slug": row.slug,
                    "guide_type": row.guide_type,
                    "subject": row.subject,
                    "course_code": row.course_code,
                    "audience": row.audience,
                },
            }
            for row in rows
        )

    if "specialist" in selected:
        statement = public_specialists_query().where(
            sa.or_(
                sa.cast(LibrarySpecialist.subjects, sa.String).ilike(term),
                sa.cast(LibrarySpecialist.support_areas, sa.String).ilike(term),
            )
        )
        if library_id:
            statement = statement.where(LibrarySpecialist.library_id == library_id)
        rows = (
            await db.execute(
                statement.order_by(
                    LibrarySpecialist.sort_order, LibrarySpecialist.created_at
                ).limit(per_type)
            )
        ).scalars().all()
        library_names.update(
            await _library_names(db, [row.library_id for row in rows if row.library_id])
        )
        results.extend(
            {
                "id": str(row.id),
                "type": "specialist",
                "title": _snippet(
                    _joined(row.subjects),
                    _joined(row.support_areas),
                    "Library Specialist",
                ),
                "description": _snippet(_joined(row.support_areas), _joined(row.subjects)),
                "url": "/specialists",
                "library_id": str(row.library_id) if row.library_id else None,
                "library_name": library_names.get(row.library_id) if row.library_id else None,
                "metadata": {
                    "staff_id": str(row.staff_id),
                    "subjects": row.subjects or [],
                    "support_areas": row.support_areas or [],
                    "booking_url": row.booking_url,
                },
            }
            for row in rows
        )

    if "workflow" in selected:
        statement = public_workflows_query().where(
            sa.or_(
                LibraryWorkflow.title.ilike(term),
                LibraryWorkflow.summary.ilike(term),
                LibraryWorkflow.workflow_type.ilike(term),
            )
        )
        if library_id:
            statement = statement.where(LibraryWorkflow.library_id == library_id)
        rows = (
            await db.execute(
                statement.order_by(LibraryWorkflow.sort_order, LibraryWorkflow.title).limit(
                    per_type
                )
            )
        ).scalars().all()
        library_names.update(
            await _library_names(db, [row.library_id for row in rows if row.library_id])
        )
        results.extend(
            {
                "id": str(row.id),
                "type": "workflow",
                "title": row.title,
                "description": _snippet(row.summary, row.workflow_type, row.audience),
                "url": _workflow_url(row.workflow_type, row.slug),
                "library_id": str(row.library_id) if row.library_id else None,
                "library_name": library_names.get(row.library_id) if row.library_id else None,
                "metadata": {
                    "slug": row.slug,
                    "workflow_type": row.workflow_type,
                    "audience": row.audience,
                },
            }
            for row in rows
        )

    if "policy" in selected:
        statement = public_policy_pages_query().where(
            sa.or_(
                LibraryPolicyPage.title.ilike(term),
                LibraryPolicyPage.content.ilike(term),
                LibraryPolicyPage.policy_type.ilike(term),
            )
        )
        if library_id:
            statement = statement.where(LibraryPolicyPage.library_id == library_id)
        rows = (
            await db.execute(
                statement.order_by(
                    LibraryPolicyPage.sort_order, LibraryPolicyPage.title
                ).limit(per_type)
            )
        ).scalars().all()
        library_names.update(
            await _library_names(db, [row.library_id for row in rows if row.library_id])
        )
        results.extend(
            {
                "id": str(row.id),
                "type": "policy",
                "title": row.title,
                "description": _snippet(row.content, row.policy_type),
                "url": _policy_url(row.slug),
                "library_id": str(row.library_id) if row.library_id else None,
                "library_name": library_names.get(row.library_id) if row.library_id else None,
                "metadata": {
                    "slug": row.slug,
                    "policy_type": row.policy_type,
                    "status": row.status,
                },
            }
            for row in rows
        )

    if "regulation" in selected:
        statement = LibraryRegulation.active_query().where(
            LibraryRegulation.is_public.is_(True),
            LibraryRegulation.status == "active",
            _public_library_parent_filter(LibraryRegulation, allow_global=True),
            sa.or_(
                LibraryRegulation.title.ilike(term),
                LibraryRegulation.content.ilike(term),
                LibraryRegulation.category.ilike(term),
            ),
        )
        if library_id:
            statement = statement.where(LibraryRegulation.library_id == library_id)
        rows = (await db.execute(statement.order_by(LibraryRegulation.sort_order, LibraryRegulation.title).limit(per_type))).scalars().all()
        library_names.update(await _library_names(db, [row.library_id for row in rows if row.library_id]))
        results.extend(
            {
                "id": str(row.id),
                "type": "regulation",
                "title": row.title,
                "description": _snippet(row.content, row.category),
                "url": f"/services#regulation-{row.slug}",
                "library_id": str(row.library_id) if row.library_id else None,
                "library_name": library_names.get(row.library_id) if row.library_id else None,
                "metadata": {"category": row.category, "status": row.status},
            }
            for row in rows
        )

    if "external_link" in selected:
        statement = LibraryExternalLink.active_query().where(
            LibraryExternalLink.is_active.is_(True),
            _public_library_parent_filter(LibraryExternalLink),
            sa.or_(
                LibraryExternalLink.label.ilike(term),
                LibraryExternalLink.description.ilike(term),
                LibraryExternalLink.link_type.ilike(term),
            ),
        )
        if library_id:
            statement = statement.where(LibraryExternalLink.library_id == library_id)
        rows = (await db.execute(statement.order_by(LibraryExternalLink.sort_order, LibraryExternalLink.label).limit(per_type))).scalars().all()
        library_names.update(await _library_names(db, [row.library_id for row in rows]))
        results.extend(
            {
                "id": str(row.id),
                "type": "external_link",
                "title": row.label,
                "description": _snippet(row.description, row.link_type),
                "url": row.url,
                "library_id": str(row.library_id),
                "library_name": library_names.get(row.library_id),
                "metadata": {"link_type": row.link_type, "opens_in_new_tab": row.opens_in_new_tab},
            }
            for row in rows
        )

    results = results[:limit]
    by_type = dict(Counter(result["type"] for result in results))
    return {
        "query": query,
        "total": len(results),
        "results": results,
        "by_type": by_type,
    }
