"""SQL ownership predicates for Library operational aggregates."""

from uuid import UUID

from sqlalchemy import and_, false, or_, select, true

from ..models import ElectronicResource, ElectronicResourceGuide, Library, LibraryLoan, LibraryResource, LibraryResourceReservation, SupportTicket


def report_scope(model, scope_ids):
    if scope_ids is None:
        return true()
    ids = []
    for value in scope_ids:
        try:
            ids.append(UUID(str(value)))
        except (ValueError, TypeError):
            continue
    if not ids:
        return false()
    if model is Library:
        return Library.id.in_(ids)
    if hasattr(model, "library_id"):
        return model.library_id.in_(ids)
    resources = select(LibraryResource.id).where(
        LibraryResource.library_id.in_(ids), LibraryResource.deleted_at.is_(None),
    )
    if model in {LibraryLoan, LibraryResourceReservation}:
        return model.resource_id.in_(resources)
    electronic = select(ElectronicResource.id).where(
        ElectronicResource.library_id.in_(ids), ElectronicResource.deleted_at.is_(None),
    )
    if model is ElectronicResourceGuide:
        return model.electronic_resource_id.in_(electronic)
    if model is SupportTicket:
        loans = select(LibraryLoan.id).where(
            LibraryLoan.resource_id.in_(resources), LibraryLoan.deleted_at.is_(None),
        )
        return or_(
            and_(model.target_entity_type == "library", model.target_entity_id.in_(ids)),
            and_(model.target_entity_type == "electronic_resource", model.target_entity_id.in_(electronic)),
            and_(model.target_entity_type == "loan", model.target_entity_id.in_(loans)),
        )
    # Personal bookmarks and records without a branch ownership mapping cannot
    # be attributed to a branch merely because the actor can read that branch.
    return false()
