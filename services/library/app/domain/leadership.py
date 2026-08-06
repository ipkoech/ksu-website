"""Library leadership job titles.

Previously ksu_common.leadership, which also carried university-wide and research
vocabularies. Only this frozenset was ever read, and only by the library service,
so it moved here with the rest deleted.
"""

from __future__ import annotations

#: Staff roles that appear on the public library leadership listing.
LIBRARY_LEADERSHIP_ROLES: frozenset[str] = frozenset(
    {
        "university_librarian",
        "chief_librarian",
        "deputy_librarian",
        "head_librarian",
        "senior_librarian",
        "branch_librarian",
        "head",
        "manager",
        "coordinator",
    }
)
