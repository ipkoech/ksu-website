"""Batch validation of canonical Library assistant source references."""

from collections import defaultdict

from sqlalchemy import select

from ..models import ElectronicResource, Library, LibraryExternalLink, LibraryFile, LibraryGuide, LibraryPolicyPage, LibraryRegulation, LibraryResource, LibraryService, LibrarySpecialist, LibraryStaff, LibraryWorkflow
from .search import _public_library_parent_filter

SOURCE_MODELS = {
    "branch": Library, "catalog": LibraryResource, "database": ElectronicResource,
    "download": LibraryFile, "external_link": LibraryExternalLink, "guide": LibraryGuide,
    "policy": LibraryPolicyPage, "regulation": LibraryRegulation, "service": LibraryService,
    "specialist": LibrarySpecialist, "staff": LibraryStaff, "workflow": LibraryWorkflow,
}


async def valid_sources(db, library_id, sources, *, public_only=False, with_owners=False):
    grouped = defaultdict(set)
    for source in sources:
        grouped[source.source_type].add(source.source_id)
    valid = {}
    for source_type, ids in grouped.items():
        model = SOURCE_MODELS.get(source_type)
        if model is None:
            continue
        owner = model.id if model is Library else model.library_id
        query = select(model.id, owner).where(model.id.in_(ids), model.deleted_at.is_(None))
        if library_id is not None:
            query = query.where((model.id if model is Library else model.library_id) == library_id)
        if public_only:
            if hasattr(model, "is_active"):
                query = query.where(model.is_active.is_(True))
            if hasattr(model, "is_public"):
                query = query.where(model.is_public.is_(True))
            if model is not Library:
                query = query.where(_public_library_parent_filter(model, allow_global=True))
            if model in {LibraryPolicyPage, LibraryRegulation}:
                query = query.where(model.status == "active")
            if model is LibraryResource:
                query = query.where(model.status != "withdrawn")
            if model is LibraryFile:
                query = query.where(model.access_level == "public")
        valid.update(((source_type, row[0]), row[1]) for row in (await db.execute(query)).all())
    return valid if with_owners else set(valid)


async def validate_sources(db, library_id, sources, *, public_only=False):
    expected = {(source.source_type, source.source_id) for source in sources}
    if len(expected) != len(sources):
        raise ValueError("Assistant sources must not contain duplicate references")
    if await valid_sources(db, library_id, sources, public_only=public_only) != expected:
        raise ValueError("Assistant sources must exist in the authorized branch and satisfy publication visibility")
