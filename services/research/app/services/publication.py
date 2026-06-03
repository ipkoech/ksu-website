"""Publication services."""

from __future__ import annotations

from ..models import EditorialBoardMember, Journal, Publication, PublicationAuthor
from ._crud import build_simple_service

PublicationService = build_simple_service(
    Publication,
    "title",
    "journal_name",
    "publisher",
    "doi",
    "abstract",
)
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
