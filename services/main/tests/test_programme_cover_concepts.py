import json
from dataclasses import FrozenInstanceError
from pathlib import Path

import pytest

from app.schemas.base import slugify
from app.seeders.programme_catalogue import BROCHURE_PROGRAMMES
from app.seeders import programme_cover_concepts as concept_registry
from app.seeders.programme_cover_concepts import (
    ConceptRegistryError,
    ICT_PROGRAMME_COVER_CONCEPTS,
    ict_programme_slugs,
    imagegen_prompt,
    load_programme_cover_concepts,
    programme_cover_concepts_by_school,
)
from app.seeders.programme_cover_schools import (
    SCHOOL_COVER_SCOPES,
    school_programme_specs,
)


EXPECTED_COUNTS = {
    "SANRM": 43,
    "SASS": 62,
    "SBE": 60,
    "SEHRD": 25,
    "SHS": 21,
    "SIST": 22,
    "SOL": 2,
    "SPAS": 50,
}
ICT_DEPARTMENT_CODES = {"CS", "COMLIS"}
CONCEPT_KEYS = {
    "programme_name",
    "department_code",
    "visual_family",
    "subject",
    "alt_text",
    "distinctiveness",
}
CONCEPT_FILENAMES = {
    "SANRM": "agriculture-natural-resources-management.json",
    "SASS": "arts-social-sciences.json",
    "SBE": "business-economics.json",
    "SEHRD": "education-human-resource-development.json",
    "SHS": "health-sciences.json",
    "SIST": "ict.json",
    "SOL": "law.json",
    "SPAS": "pure-applied-sciences.json",
}


def _concept_dicts(school_code: str) -> list[dict[str, str]]:
    return [
        {
            "programme_name": concept.programme_name,
            "department_code": concept.department_code,
            "visual_family": concept.visual_family,
            "subject": concept.subject,
            "alt_text": concept.alt_text,
            "distinctiveness": concept.distinctiveness,
        }
        for concept in load_programme_cover_concepts(school_code)
    ]


def _use_registry(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
    school_code: str,
    items: list[dict[str, str]],
) -> None:
    data_dir = tmp_path / "programme_cover_concept_data"
    data_dir.mkdir(exist_ok=True)
    (data_dir / CONCEPT_FILENAMES[school_code]).write_text(json.dumps(items), encoding="utf-8")
    monkeypatch.setattr(concept_registry.resources, "files", lambda _package: tmp_path)


def test_school_scopes_partition_the_complete_catalogue() -> None:
    actual = {code: len(school_programme_specs(code)) for code in EXPECTED_COUNTS}
    assert actual == EXPECTED_COUNTS
    assert sum(actual.values()) == 285
    assert sum(count for code, count in actual.items() if code != "SIST") == 263

    slugs = [
        slugify(str(programme["name"]))
        for code in EXPECTED_COUNTS
        for programme in school_programme_specs(code)
    ]
    assert len(slugs) == len(set(slugs)) == 285


def test_school_scopes_are_immutable_and_case_insensitive() -> None:
    assert school_programme_specs("sist") == school_programme_specs("SIST")
    with pytest.raises(TypeError):
        SCHOOL_COVER_SCOPES["NEW"] = SCHOOL_COVER_SCOPES["SIST"]  # type: ignore[index]
    with pytest.raises(FrozenInstanceError):
        SCHOOL_COVER_SCOPES["SIST"].name = "Changed"  # type: ignore[misc]


def test_ict_cover_concepts_match_the_complete_catalogue_scope() -> None:
    expected = {
        slugify(str(programme["name"]))
        for programme in BROCHURE_PROGRAMMES
        if programme["department_code"] in ICT_DEPARTMENT_CODES
    }

    assert len(expected) == 22
    assert ict_programme_slugs() == expected
    assert len(ICT_PROGRAMME_COVER_CONCEPTS) == len(expected)
    assert ICT_PROGRAMME_COVER_CONCEPTS == load_programme_cover_concepts("sist")


def test_available_school_registries_load_complete_typed_concepts() -> None:
    registries = programme_cover_concepts_by_school()

    assert set(registries) == {
        "SANRM",
        "SASS",
        "SBE",
        "SEHRD",
        "SHS",
        "SIST",
        "SOL",
        "SPAS",
    }
    assert {code: len(concepts) for code, concepts in registries.items()} == {
        "SANRM": 43,
        "SASS": 62,
        "SBE": 60,
        "SEHRD": 25,
        "SHS": 21,
        "SIST": 22,
        "SOL": 2,
        "SPAS": 50,
    }
    for school_code, concepts in registries.items():
        scope_slugs = {
            slugify(str(programme["name"]))
            for programme in school_programme_specs(school_code)
        }
        assert {concept.slug for concept in concepts} == scope_slugs
        assert all(concept.school_code == school_code for concept in concepts)
        assert all(concept.distinctiveness.strip() for concept in concepts)


def test_registry_json_items_have_exact_schema() -> None:
    data_dir = Path(concept_registry.__file__).with_name("programme_cover_concept_data")
    for filename in CONCEPT_FILENAMES.values():
        items = json.loads((data_dir / filename).read_text(encoding="utf-8"))
        assert items
        assert all(set(item) == CONCEPT_KEYS for item in items)


def test_loader_rejects_missing_concepts(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    items = _concept_dicts("SOL")
    missing_slug = slugify(items.pop()["programme_name"])
    _use_registry(monkeypatch, tmp_path, "SOL", items)

    with pytest.raises(ConceptRegistryError) as error:
        load_programme_cover_concepts("SOL")

    assert error.value.missing == (missing_slug,)
    assert error.value.unexpected == ()
    assert error.value.duplicates == ()
    assert error.value.department_mismatches == ()


def test_loader_rejects_unexpected_concepts(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    items = _concept_dicts("SOL")
    items.append({**items[0], "programme_name": "Unexpected Law Programme"})
    _use_registry(monkeypatch, tmp_path, "SOL", items)

    with pytest.raises(ConceptRegistryError) as error:
        load_programme_cover_concepts("SOL")

    assert error.value.unexpected == ("unexpected-law-programme",)
    assert error.value.missing == ()


def test_loader_rejects_duplicate_concepts(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    items = _concept_dicts("SOL")
    duplicate_slug = slugify(items[0]["programme_name"])
    items.append(items[0].copy())
    _use_registry(monkeypatch, tmp_path, "SOL", items)

    with pytest.raises(ConceptRegistryError) as error:
        load_programme_cover_concepts("SOL")

    assert error.value.duplicates == (duplicate_slug,)
    assert error.value.missing == ()
    assert error.value.unexpected == ()


def test_loader_rejects_department_mismatches(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    items = _concept_dicts("SOL")
    mismatched_slug = slugify(items[0]["programme_name"])
    items[0]["department_code"] = "CS"
    _use_registry(monkeypatch, tmp_path, "SOL", items)

    with pytest.raises(ConceptRegistryError) as error:
        load_programme_cover_concepts("SOL")

    assert error.value.department_mismatches == (mismatched_slug,)
    assert error.value.missing == ()
    assert error.value.unexpected == ()


def test_ict_cover_concepts_have_unique_complete_asset_metadata() -> None:
    slugs = [concept.slug for concept in ICT_PROGRAMME_COVER_CONCEPTS]
    filenames = [concept.filename for concept in ICT_PROGRAMME_COVER_CONCEPTS]

    assert len(slugs) == len(set(slugs))
    assert len(filenames) == len(set(filenames))
    assert all(concept.department_code in ICT_DEPARTMENT_CODES for concept in ICT_PROGRAMME_COVER_CONCEPTS)
    assert all(concept.visual_family.strip() for concept in ICT_PROGRAMME_COVER_CONCEPTS)
    assert all(len(concept.subject.strip()) >= 24 for concept in ICT_PROGRAMME_COVER_CONCEPTS)
    assert all(concept.alt_text.startswith("Illustration of ") for concept in ICT_PROGRAMME_COVER_CONCEPTS)
    assert all(concept.filename == f"{concept.slug}.webp" for concept in ICT_PROGRAMME_COVER_CONCEPTS)


def test_imagegen_prompt_locks_the_shared_art_direction_and_subject() -> None:
    concept = next(item for item in ICT_PROGRAMME_COVER_CONCEPTS if item.slug == "bachelor-of-science-in-computer-science")

    prompt = imagegen_prompt(concept)

    assert concept.programme_name in prompt
    assert concept.subject in prompt
    assert "16:9" in prompt
    assert "royal-blue" in prompt
    assert "pale-blue" in prompt
    assert "gold accent" in prompt
    assert "No text" in prompt
    assert "no logos" in prompt
    assert "no people" in prompt
    assert "no watermark" in prompt
