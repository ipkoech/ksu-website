from app.schemas.base import slugify
from app.seeders.programme_catalogue import BROCHURE_PROGRAMMES
from app.seeders.programme_cover_concepts import (
    ICT_PROGRAMME_COVER_CONCEPTS,
    ict_programme_slugs,
    imagegen_prompt,
)


ICT_DEPARTMENT_CODES = {"CS", "COMLIS"}


def test_ict_cover_concepts_match_the_complete_catalogue_scope() -> None:
    expected = {
        slugify(str(programme["name"]))
        for programme in BROCHURE_PROGRAMMES
        if programme["department_code"] in ICT_DEPARTMENT_CODES
    }

    assert len(expected) == 22
    assert ict_programme_slugs() == expected
    assert len(ICT_PROGRAMME_COVER_CONCEPTS) == len(expected)


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
