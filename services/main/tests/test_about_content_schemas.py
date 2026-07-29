from datetime import date

import pytest
from pydantic import ValidationError

from app.schemas import (
    AboutPageContentCreate,
    FactEditionCreate,
    FactItemCreate,
    HistoryMilestoneCreate,
    UniversityInfoCreate,
)


def test_university_info_accepts_first_class_about_statements():
    value = UniversityInfoCreate(
        name="Kisii University",
        philosophy="Knowledge in service of humanity.",
        strategic_plan_summary="Advance teaching, research, innovation and service.",
    )
    assert value.philosophy.startswith("Knowledge")
    assert value.strategic_plan_summary.startswith("Advance")


def test_about_page_requires_transformation_images_as_a_pair():
    with pytest.raises(ValidationError):
        AboutPageContentCreate(
            university_info_id="0a5a9545-0196-4c90-bbce-3bc70ec3b389",
            old_campus_media_id="64b326d0-d107-4695-8eac-c8c7100a3ed1",
        )


def test_about_page_video_requires_accessible_transcript():
    with pytest.raises(ValidationError):
        AboutPageContentCreate(
            university_info_id="0a5a9545-0196-4c90-bbce-3bc70ec3b389",
            video_url="https://example.edu/story",
        )


def test_history_milestone_supports_today_label():
    value = HistoryMilestoneCreate(
        about_page_content_id="0a5a9545-0196-4c90-bbce-3bc70ec3b389",
        slug="today",
        year_label="Today",
        title="Transforming Tomorrow",
        summary="Kisii University continues to advance knowledge and service.",
    )
    assert value.year_label == "Today"


def test_fact_edition_rejects_year_before_university_foundation():
    with pytest.raises(ValidationError):
        FactEditionCreate(reporting_year=1964, title="KSU in numbers")


def test_fact_item_supports_non_numeric_values_and_validates_links():
    value = FactItemCreate(
        fact_group_id="0a5a9545-0196-4c90-bbce-3bc70ec3b389",
        fact_kind="evergreen",
        label="Campus",
        display_value="Main Campus, Kisii County",
        source_title="Kisii University institutional profile",
        verified_on=date(2026, 7, 14),
    )
    assert value.numeric_value is None

    with pytest.raises(ValidationError):
        FactItemCreate(
            fact_group_id="0a5a9545-0196-4c90-bbce-3bc70ec3b389",
            fact_kind="annual",
            label="Schools",
            display_value="8",
            link_url="www.example.edu",
        )

