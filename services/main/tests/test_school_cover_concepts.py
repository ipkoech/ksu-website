from dataclasses import FrozenInstanceError

import pytest

from app.seeders.school_cover_concepts import (
    SCHOOL_COVER_CONCEPTS,
    school_cover_prompt,
)


EXPECTED_SCHOOLS = {
    "SANRM": "school-of-agriculture-and-natural-resources-management",
    "SBE": "school-of-business-and-economics",
    "SEHRD": "school-of-education-and-human-resource-development",
    "SHS": "school-of-health-sciences",
    "SIST": "school-of-information-science-technology",
    "SPAS": "school-of-pure-and-applied-sciences",
    "SASS": "school-of-arts-and-social-sciences",
    "SOL": "school-of-law",
}


def test_registry_has_exact_immutable_eight_school_coverage() -> None:
    assert isinstance(SCHOOL_COVER_CONCEPTS, tuple)
    assert {
        concept.school_code: concept.school_slug for concept in SCHOOL_COVER_CONCEPTS
    } == (EXPECTED_SCHOOLS)

    with pytest.raises(FrozenInstanceError):
        SCHOOL_COVER_CONCEPTS[0].subject = "Changed"  # type: ignore[misc]


def test_registry_has_unique_complete_asset_metadata() -> None:
    filenames = [concept.filename for concept in SCHOOL_COVER_CONCEPTS]
    prompts = [school_cover_prompt(concept) for concept in SCHOOL_COVER_CONCEPTS]

    assert len(filenames) == len(set(filenames)) == 8
    assert len(prompts) == len(set(prompts)) == 8
    assert all(
        concept.filename == f"{concept.school_slug}.webp"
        for concept in SCHOOL_COVER_CONCEPTS
    )
    assert all(concept.subject.strip() for concept in SCHOOL_COVER_CONCEPTS)
    assert all(
        concept.alt_text.startswith("Academic panorama of ")
        for concept in SCHOOL_COVER_CONCEPTS
    )
    assert all(concept.distinctiveness.strip() for concept in SCHOOL_COVER_CONCEPTS)


def test_prompt_locks_approved_panorama_direction_and_constraints() -> None:
    for concept in SCHOOL_COVER_CONCEPTS:
        prompt = school_cover_prompt(concept)
        assert concept.school_name in prompt
        assert concept.subject in prompt
        assert concept.secondary_accent in prompt
        assert "16:9" in prompt
        assert "1600 by 900" in prompt
        assert "middle 70 percent" in prompt
        assert "royal-blue" in prompt
        assert "pale-blue" in prompt
        assert "gold" in prompt
        for prohibition in (
            "No text",
            "no letters",
            "no numbers",
            "no logos",
            "no university crest",
            "no people",
            "no faces",
            "no watermark",
            "no photorealism",
            "no dark background",
            "no decorative clutter",
        ):
            assert prohibition in prompt
