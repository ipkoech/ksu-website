"""Editorial image concepts for programme-specific public cover artwork."""

from __future__ import annotations

import json
from collections import Counter
from collections.abc import Mapping
from dataclasses import dataclass
from importlib import resources
from types import MappingProxyType
from typing import cast

from app.schemas.base import slugify

from .programme_cover_schools import SCHOOL_COVER_SCOPES, school_programme_specs


_CONCEPT_DATA_FILES: Mapping[str, str] = MappingProxyType(
    {
        "SEHRD": "education-human-resource-development.json",
        "SHS": "health-sciences.json",
        "SIST": "ict.json",
        "SOL": "law.json",
    }
)
_CONCEPT_KEYS = frozenset(
    {
        "programme_name",
        "department_code",
        "visual_family",
        "subject",
        "alt_text",
        "distinctiveness",
    }
)


@dataclass(frozen=True, slots=True)
class ProgrammeCoverConcept:
    school_code: str
    programme_name: str
    department_code: str
    visual_family: str
    subject: str
    alt_text: str
    distinctiveness: str

    @property
    def slug(self) -> str:
        return slugify(self.programme_name)

    @property
    def filename(self) -> str:
        return f"{self.slug}.webp"


class ConceptRegistryError(ValueError):
    """Raised when a school's concept JSON diverges from its catalogue scope."""

    def __init__(
        self,
        school_code: str,
        *,
        missing: tuple[str, ...] = (),
        unexpected: tuple[str, ...] = (),
        duplicates: tuple[str, ...] = (),
        department_mismatches: tuple[str, ...] = (),
    ) -> None:
        self.school_code = school_code
        self.missing = missing
        self.unexpected = unexpected
        self.duplicates = duplicates
        self.department_mismatches = department_mismatches
        super().__init__(
            f"Invalid {school_code} programme cover registry: "
            f"missing={list(missing)}, unexpected={list(unexpected)}, "
            f"duplicates={list(duplicates)}, "
            f"department_mismatches={list(department_mismatches)}"
        )


def _load_json_items(school_code: str) -> list[Mapping[str, object]]:
    filename = _CONCEPT_DATA_FILES[school_code]
    resource = resources.files(__package__).joinpath("programme_cover_concept_data", filename)
    raw_items = json.loads(resource.read_text(encoding="utf-8"))
    if not isinstance(raw_items, list):
        raise ValueError(f"Programme cover registry {filename} must contain a JSON list")

    items: list[Mapping[str, object]] = []
    for index, raw_item in enumerate(raw_items):
        if not isinstance(raw_item, dict) or set(raw_item) != _CONCEPT_KEYS:
            raise ValueError(
                f"Programme cover registry {filename} item {index} must have exactly "
                f"{sorted(_CONCEPT_KEYS)}"
            )
        if not all(isinstance(value, str) and value.strip() for value in raw_item.values()):
            raise ValueError(f"Programme cover registry {filename} item {index} values must be non-empty strings")
        items.append(cast(Mapping[str, object], raw_item))
    return items


def load_programme_cover_concepts(school_code: str) -> tuple[ProgrammeCoverConcept, ...]:
    """Load and validate one school's immutable programme cover concepts."""

    code = school_code.upper()
    SCHOOL_COVER_SCOPES[code]
    items = _load_json_items(code)
    expected_departments = {
        slugify(str(programme["name"])): str(programme["department_code"])
        for programme in school_programme_specs(code)
    }
    item_slugs = [slugify(str(item["programme_name"])) for item in items]
    actual_slugs = set(item_slugs)
    expected_slugs = set(expected_departments)
    duplicates = tuple(sorted(slug for slug, count in Counter(item_slugs).items() if count > 1))
    missing = tuple(sorted(expected_slugs - actual_slugs))
    unexpected = tuple(sorted(actual_slugs - expected_slugs))
    department_mismatches = tuple(
        sorted(
            slug
            for slug, item in zip(item_slugs, items, strict=True)
            if slug in expected_departments
            and str(item["department_code"]) != expected_departments[slug]
        )
    )
    if missing or unexpected or duplicates or department_mismatches:
        raise ConceptRegistryError(
            code,
            missing=missing,
            unexpected=unexpected,
            duplicates=duplicates,
            department_mismatches=department_mismatches,
        )

    return tuple(
        ProgrammeCoverConcept(
            school_code=code,
            programme_name=str(item["programme_name"]),
            department_code=str(item["department_code"]),
            visual_family=str(item["visual_family"]),
            subject=str(item["subject"]),
            alt_text=str(item["alt_text"]),
            distinctiveness=str(item["distinctiveness"]),
        )
        for item in items
    )


def programme_cover_concepts_by_school() -> Mapping[str, tuple[ProgrammeCoverConcept, ...]]:
    """Return every school registry currently available as packaged concept data."""

    return MappingProxyType(
        {school_code: load_programme_cover_concepts(school_code) for school_code in _CONCEPT_DATA_FILES}
    )


ICT_PROGRAMME_COVER_CONCEPTS = load_programme_cover_concepts("SIST")


def ict_programme_slugs() -> set[str]:
    return {concept.slug for concept in ICT_PROGRAMME_COVER_CONCEPTS}


def imagegen_prompt(concept: ProgrammeCoverConcept) -> str:
    return f"""Use case: illustration-story
Asset type: programme hero illustration for a public university website
Primary request: Create a programme-specific editorial illustration for {concept.programme_name}.
Subject: {concept.subject}.
Style/medium: refined institutional vector-like line illustration with precise geometry and restrained flat supporting forms.
Composition/framing: centered 16:9 landscape composition with generous clear space, designed for the right panel of a university programme hero.
Color palette: deep royal-blue linework, pale-blue supporting forms, white or near-white background, and one restrained gold accent.
Constraints: communicate the academic discipline immediately; keep line weight and visual density consistent with a university-wide illustration family; crisp edges; accessible contrast.
Avoid: No text, no letters, no numbers, no logos, no university crest, no people, no faces, no photorealism, no dark background, no watermark, no decorative clutter."""
