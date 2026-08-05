"""Immutable visual concepts for the eight canonical school panoramas."""

from __future__ import annotations

from dataclasses import dataclass

from app.schemas.base import slugify


@dataclass(frozen=True, slots=True)
class SchoolCoverConcept:
    school_code: str
    school_name: str
    subject: str
    alt_text: str
    distinctiveness: str
    secondary_accent: str

    @property
    def school_slug(self) -> str:
        return slugify(self.school_name)

    @property
    def filename(self) -> str:
        return f"{self.school_slug}.webp"


SCHOOL_COVER_CONCEPTS: tuple[SchoolCoverConcept, ...] = (
    SchoolCoverConcept(
        school_code="SANRM",
        school_name="School of Agriculture and Natural Resources Management",
        subject=(
            "terraced crops and visible soil layers flowing into an irrigation channel, "
            "an aquatic ecosystem, a restrained livestock-science element, and a conservation canopy"
        ),
        alt_text=(
            "Academic panorama of terraced agriculture, soil, irrigation, aquatic life, "
            "livestock science, and natural-resource conservation"
        ),
        distinctiveness="Layered living landscape with a continuous water-and-soil pathway.",
        secondary_accent="subtle leaf green",
    ),
    SchoolCoverConcept(
        school_code="SBE",
        school_name="School of Business and Economics",
        subject=(
            "enterprise architecture linking an analytics dashboard, finance ledger, market "
            "network, hospitality setting, and strategic growth forms"
        ),
        alt_text=(
            "Academic panorama of enterprise strategy, analytics, finance, markets, "
            "hospitality, and economic growth"
        ),
        distinctiveness="Connected enterprise skyline and rising analytical pathway.",
        secondary_accent="subtle warm copper",
    ),
    SchoolCoverConcept(
        school_code="SEHRD",
        school_name="School of Education and Human Resource Development",
        subject=(
            "an open knowledge centre connecting curriculum design, educational psychology, "
            "inclusive learning tools, early-childhood materials, and leadership planning"
        ),
        alt_text=(
            "Academic panorama of an open knowledge centre connecting curriculum, psychology, "
            "inclusive learning, early-childhood education, and leadership"
        ),
        distinctiveness="Welcoming radial knowledge centre built around inclusive learning.",
        secondary_accent="subtle coral",
    ),
    SchoolCoverConcept(
        school_code="SHS",
        school_name="School of Health Sciences",
        subject=(
            "an anatomy volume, stethoscope, molecular model, pharmacy vessel, clinical "
            "monitor, and community-health network arranged as one accurate care-and-research environment"
        ),
        alt_text=(
            "Academic panorama of anatomy, clinical care, molecular research, pharmacy, "
            "monitoring, and community health"
        ),
        distinctiveness="Accurate care-and-research environment with a calm clinical flow.",
        secondary_accent="subtle clinical teal",
    ),
    SchoolCoverConcept(
        school_code="SIST",
        school_name="School of Information Science & Technology",
        subject=(
            "a processor and software pathways connecting cloud systems, digital archives, "
            "media production, data networks, and information discovery"
        ),
        alt_text=(
            "Academic panorama of computing pathways connecting cloud systems, digital "
            "archives, media production, data networks, and information discovery"
        ),
        distinctiveness="Luminous circuit pathway connecting computing and information systems.",
        secondary_accent="subtle cyan",
    ),
    SchoolCoverConcept(
        school_code="SPAS",
        school_name="School of Pure and Applied Sciences",
        subject=(
            "a microscope, molecular structure, mathematical geometry, physics orbit, "
            "biological forms, and laboratory inquiry integrated around one research platform"
        ),
        alt_text=(
            "Academic panorama of microscopy, molecules, mathematics, physics, biology, "
            "and laboratory research"
        ),
        distinctiveness="Unified scientific research platform with precise geometric motion.",
        secondary_accent="subtle violet",
    ),
    SchoolCoverConcept(
        school_code="SASS",
        school_name="School of Arts and Social Sciences",
        subject=(
            "a heritage archive, language and literature, geography, governance, peace "
            "studies, philosophy, and social-research pathways expressed through objects and maps"
        ),
        alt_text=(
            "Academic panorama of heritage, language, literature, geography, governance, "
            "peace studies, philosophy, and social research"
        ),
        distinctiveness="Layered cultural archive flowing into maps and civic inquiry.",
        secondary_accent="subtle terracotta",
    ),
    SchoolCoverConcept(
        school_code="SOL",
        school_name="School of Law",
        subject=(
            "courthouse architecture, balanced scales, legal volumes, precedent documents, "
            "and a clear justice pathway"
        ),
        alt_text=(
            "Academic panorama of courthouse architecture, balanced scales, legal volumes, "
            "precedent documents, and a pathway to justice"
        ),
        distinctiveness="Strong courthouse axis and balanced justice pathway.",
        secondary_accent="subtle burgundy",
    ),
)


def school_cover_prompt(concept: SchoolCoverConcept) -> str:
    """Build the approved, collection-wide Imagegen prompt for one school."""

    return f"""Use case: illustration-story
Asset type: school hero panorama for a public university website
Primary request: Create a discipline-defining academic panorama for {concept.school_name}.
Subject: Compose {concept.subject} into one coherent environment, not disconnected icon tiles.
Style/medium: refined institutional vector-like editorial illustration with layered depth, restrained lighting, precise geometry, and a subtle non-literal academic architectural anchor.
Composition/framing: 16:9 landscape at 1600 by 900 pixels; keep essential subjects within the middle 70 percent for safe hero and card crops; establish a clear hierarchy at thumbnail size with enough detail for a wide hero.
Color palette: royal-blue structure and linework, pale-blue supporting forms, white or near-white negative space, restrained Kisii University gold, and {concept.secondary_accent} as the only secondary accent.
Distinctive direction: {concept.distinctiveness}
Constraints: the disciplines must read as one connected academic environment; crisp edges; accessible contrast; accurate scientific and professional objects.
Avoid: No text, no letters, no numbers, no logos, no university crest, no people, no faces, no watermark, no photorealism, no dark background, and no decorative clutter."""
