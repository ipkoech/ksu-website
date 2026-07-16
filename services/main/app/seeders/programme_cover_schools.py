"""Immutable school scopes derived from the canonical programme catalogue."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from types import MappingProxyType

from app.schemas.base import slugify

from ._shared import SCHOOL_SPECS
from .programme_catalogue import BROCHURE_PROGRAMMES


@dataclass(frozen=True, slots=True)
class SchoolCoverScope:
    code: str
    slug: str
    name: str
    department_codes: frozenset[str]


SCHOOL_COVER_SCOPES: Mapping[str, SchoolCoverScope] = MappingProxyType(
    {
        str(school["code"]): SchoolCoverScope(
            code=str(school["code"]),
            slug=slugify(str(school["name"])),
            name=str(school["name"]),
            department_codes=frozenset(str(item["code"]) for item in school["departments"]),
        )
        for school in SCHOOL_SPECS
    }
)


def school_programme_specs(school_code: str) -> tuple[Mapping[str, object], ...]:
    """Return the canonical catalogue entries belonging to one school."""

    scope = SCHOOL_COVER_SCOPES[school_code.upper()]
    return tuple(
        item
        for item in BROCHURE_PROGRAMMES
        if str(item["department_code"]) in scope.department_codes
    )
