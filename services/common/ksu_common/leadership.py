"""Shared leadership role vocabulary across KSU services."""

from __future__ import annotations

LEADERSHIP_ROLES: frozenset[str] = frozenset(
    {
        "chancellor",
        "chairperson",
        "vice_chairperson",
        "vc",
        "vice_chancellor",
        "dvc",
        "deputy_vice_chancellor",
        "registrar",
        "dean",
        "director",
        "deputy_director",
        "university_librarian",
        "chief_librarian",
        "deputy_librarian",
        "head_librarian",
        "hod",
        "cod",
        "head",
        "manager",
        "coordinator",
    }
)

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

RESEARCH_LEADERSHIP_ROLES: frozenset[str] = frozenset(
    {
        "director",
        "deputy_director",
        "manager",
        "coordinator",
        "principal_investigator",
        "project_lead",
        "chairperson",
    }
)

LEADERSHIP_STAFF_TYPES: frozenset[str] = frozenset(
    {"leadership", "staff", "committee", "liaison"}
)


def is_leadership_role(role: str | None) -> bool:
    return bool(role and role in LEADERSHIP_ROLES)


def is_library_leadership_role(role: str | None) -> bool:
    return bool(role and role in LIBRARY_LEADERSHIP_ROLES)


def is_research_leadership_role(role: str | None) -> bool:
    return bool(role and role in RESEARCH_LEADERSHIP_ROLES)
