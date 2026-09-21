"""Official navigation pages discovered during the 2026-09-14 rescan.

These are page-level records for successful live routes that were not present
in the July source snapshot or the earlier typed-content deltas.  The text
and related-programme links below preserve the visible programme-page content
published by Kisii University at the time of the rescan.
"""

from __future__ import annotations

import hashlib


_BASE_URL = "https://kisiiuniversity.ac.ke"


def _programme_page(
    *,
    title: str,
    department: str,
    level: str,
    path: str,
    related_programmes: tuple[tuple[str, str], ...],
) -> dict[str, object]:
    related_text = " ".join(label for label, _ in related_programmes)
    plain_text = f"{title} {level} Related Programmes {related_text}"
    return {
        "title": title,
        "slug": path.strip("/").replace("/", "-"),
        "path": path,
        "page_type": "programme",
        "summary": f"{title} ({level}) in {department}.",
        "plain_text": plain_text,
        "headings": [
            {"level": "h5", "text": f"| {department}"},
            {"level": "h5", "text": title},
            {"level": "h4", "text": "Related Programmes"},
        ],
        "links": [{"label": label, "url": f"{_BASE_URL}{related_path}"} for label, related_path in related_programmes],
        "images": [],
        "source_url": f"{_BASE_URL}{path}",
        "source_hash": hashlib.sha256(plain_text.encode("utf-8")).hexdigest(),
        "display_order": 2300,
    }


LIVE_SITE_PAGE_UPDATES_20260914 = [
    _programme_page(
        title="Master of Education (Planning and Economics)",
        department="Department of Educational Foundations & Educational Administration, Planning and Economics (EDFO & EAPE)",
        level="Masters .",
        path=(
            "/departments_management/department_programmes/programmes/"
            "master-of-education-planning-and-economics/update"
        ),
        related_programmes=(
            (
                "PhD in Educational Foundations ( Sociology OR Philosophy OR Comparative Education OR History of Education)",
                "/departments_management/department_programmes/programmes/"
                "phd-in-educational-foundations-sociology-or-philosophy-or-comparative-education-or-history-of-education/update",
            ),
            (
                "Bachelor of Education (Arts)",
                "/departments_management/department_programmes/programmes/bachelor-of-education-arts/update",
            ),
            (
                "Diploma in Education Arts (Secondary Option)",
                "/departments_management/department_programmes/programmes/"
                "diploma-in-education-arts-secondary-option/update",
            ),
        ),
    ),
    _programme_page(
        title="PhD in Curriculum (Curriculum & Instruction)",
        department="Department of Curriculum Instruction and Media (CIM)",
        level="PhD .",
        path=(
            "/departments_management/department_programmes/programmes/"
            "phd-in-curriculum-curriculum-instruction/update"
        ),
        related_programmes=(
            (
                "Master of Education in (Curriculum and Instruction)",
                "/departments_management/department_programmes/programmes/"
                "master-of-education-in-curriculum-and-instruction/update",
            ),
            (
                "Bachelor of Education (Arts) in any of the following two subjects (English, Literature, Mathematics, Geography, History, Business, Kiswahili, Religion)",
                "/departments_management/department_programmes/programmes/"
                "bachelor-of-education-arts-in-any-of-the-following-two-subjects-english-literature-mathematics-geography-history-business-kiswahili-religion/update",
            ),
            (
                "Bachelor of Education (Primary Option)",
                "/departments_management/department_programmes/programmes/bachelor-of-education-primary-option/update",
            ),
            (
                "Bachelor of Education (Special Needs Education)",
                "/departments_management/department_programmes/programmes/bachelor-of-education-special-needs-education/update",
            ),
            (
                "Diploma in Education Arts (Secondary Option)",
                "/departments_management/department_programmes/programmes/"
                "diploma-in-education-arts-secondary-option/update",
            ),
        ),
    ),
]


# These URLs were present in the historical snapshot but returned an error in
# the 2026-09-14 live check.  They must not remain published from stale data.
LIVE_SITE_UNAVAILABLE_SOURCE_URLS_20260914 = frozenset(
    {
        f"{_BASE_URL}/blog/library-rules-and-regulationspdf",
        f"{_BASE_URL}/departments_management/department_programmes/programmes/bsc-surgery/update",
        f"{_BASE_URL}/departments_management/department_programmes/programmes/"
        "master-of-education-planning-and-economics-or-sociology-or-philosophy/update",
        f"{_BASE_URL}/departments_management/department_programmes/programmes/"
        "phd-in-curriculum-curriculum-instruction-or-instruction-media/update",
        f"{_BASE_URL}/profile_view/dr-gladys-osoro",
        f"{_BASE_URL}/profile_view/jane-cherono-maina",
    }
)


__all__ = [
    "LIVE_SITE_PAGE_UPDATES_20260914",
    "LIVE_SITE_UNAVAILABLE_SOURCE_URLS_20260914",
]
