"""Publication services."""

from __future__ import annotations

from typing import Any

from ..models import EditorialBoardMember, Journal, Publication, PublicationAuthor
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
