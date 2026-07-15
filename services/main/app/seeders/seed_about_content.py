"""Seed verified About KSU history and institutional facts."""

from __future__ import annotations

from datetime import date, datetime, timezone
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import AboutPageContent, FactEdition, FactGroup, FactItem, HistoryMilestone
from ._shared import SeedContext


SOURCE = "Kisii University Revised Students Handbook and institutional profile"
STRATEGIC_PLAN_SOURCE = "Kisii University Strategic Plan 2024–2028"
STRATEGIC_PLAN_URL = (
    "https://kisiiuniversity.ac.ke/storage/public/downloads/"
    "KISII%20UNIVERSITY%20%20STRATEGIC%20%20PLAN%202024%20-%202028-6.pdf"
)
ACADEMIC_STRUCTURE_SOURCE = "Kisii University Schools and Departments"
ACADEMIC_STRUCTURE_URL = "https://kisiiuniversity.ac.ke/schools_departments"
PUBLISHED_AT = datetime(2026, 7, 14, tzinfo=timezone.utc)
VERIFIED_ON = date(2026, 7, 14)

MILESTONES = (
    ("1965", "1965", date(1965, 1, 1), "The Beginning", "The institution began as a Primary Teachers Training College on land donated by the County Council of Gusii."),
    ("1983", "1983", date(1983, 1, 1), "A New Level of Training", "The college became a Secondary Teachers College, responding to Kenya's growing demand for qualified teachers."),
    ("1994", "1994", date(1994, 1, 1), "The University Transition", "Egerton University took over the college as a campus and established a foundation for university-level education."),
    ("1999", "1999", date(1999, 1, 1), "The First Degree Programme", "The Faculty of Commerce introduced the institution's first university degree programme."),
    ("2007", "2007", date(2007, 8, 23), "A Constituent College", "Kisii University College was established as a constituent college of Egerton University through Legal Notice No. 163 of 2007."),
    ("2013", "2013", date(2013, 2, 6), "A Chartered Public University", "Kisii University received its charter and became Kenya's 13th public university."),
    ("today", "Today", None, "Transforming Tomorrow", "Kisii University continues to advance teaching, research, innovation and community engagement in Kenya and beyond."),
)

EVERGREEN_FACT_GROUPS = (
    {
        "slug": "institutional-profile",
        "heading": "University at a Glance",
        "summary": "The defining facts behind Kisii University's public mandate and identity.",
        "display_order": 10,
        "items": (
            {"label": "Established", "display_value": "1965", "numeric_value": 1965, "icon_key": "calendar"},
            {"label": "Chartered", "display_value": "2013", "numeric_value": 2013, "icon_key": "award"},
            {"label": "Legal status", "display_value": "Public University", "icon_key": "landmark"},
            {"label": "Main campus", "display_value": "Kisii County, Kenya", "icon_key": "map-pin"},
        ),
    },
    {
        "slug": "academic-organisation",
        "heading": "Academic Organisation",
        "summary": "The University's current teaching structure across its schools and departments.",
        "display_order": 20,
        "source_title": ACADEMIC_STRUCTURE_SOURCE,
        "source_url": ACADEMIC_STRUCTURE_URL,
        "items": (
            {"label": "Academic schools", "display_value": "8", "numeric_value": 8, "icon_key": "school"},
            {
                "label": "Teaching departments",
                "display_value": "50",
                "numeric_value": 50,
                "icon_key": "book-open",
                "explanation": "Departments listed across the University's eight academic schools.",
            },
        ),
    },
)

ANNUAL_FACT_GROUPS = (
    {
        "slug": "student-community",
        "heading": "Our Student Community",
        "summary": "Enrolment reported for the 2023/24 academic year.",
        "display_order": 30,
        "items": (
            {"label": "Total student enrolment", "display_value": "30,825", "numeric_value": 30825, "icon_key": "users"},
            {"label": "Undergraduate students", "display_value": "30,338", "numeric_value": 30338, "icon_key": "graduation-cap"},
            {"label": "Postgraduate students", "display_value": "487", "numeric_value": 487, "icon_key": "microscope"},
            {"label": "Postgraduate share", "display_value": "1.6", "numeric_value": "1.6", "suffix": "%", "icon_key": "pie-chart"},
        ),
    },
    {
        "slug": "access-and-growth",
        "heading": "Access and Growth",
        "summary": "New-student admissions and placement figures reported in the Strategic Plan.",
        "display_order": 40,
        "items": (
            {"label": "New students in 2023/24", "display_value": "10,172", "numeric_value": 10172, "icon_key": "user-plus"},
            {
                "label": "New-enrolment growth since 2019/20",
                "display_value": "139",
                "numeric_value": 139,
                "suffix": "%",
                "icon_key": "trending-up",
            },
            {
                "label": "New students admitted, 2019/20–2023/24",
                "display_value": "33,210",
                "numeric_value": 33210,
                "icon_key": "users",
            },
            {"label": "KUCCPS allocation for 2024/25", "display_value": "7,772", "numeric_value": 7772, "icon_key": "clipboard-list"},
        ),
    },
    {
        "slug": "graduate-impact",
        "heading": "Graduate Impact",
        "summary": "Qualifications awarded over the five-year period from 2019 to 2023.",
        "display_order": 50,
        "items": (
            {"label": "Graduates", "display_value": "17,905", "numeric_value": 17905, "icon_key": "graduation-cap"},
            {"label": "Bachelor's degrees", "display_value": "13,965", "numeric_value": 13965, "icon_key": "award"},
            {"label": "Diplomas", "display_value": "2,851", "numeric_value": 2851, "icon_key": "scroll-text"},
            {"label": "Certificates", "display_value": "676", "numeric_value": 676, "icon_key": "badge-check"},
            {"label": "Master's degrees", "display_value": "300", "numeric_value": 300, "icon_key": "book-open"},
            {"label": "Doctorates", "display_value": "113", "numeric_value": 113, "icon_key": "microscope"},
        ),
    },
    {
        "slug": "research-and-knowledge",
        "heading": "Research and Knowledge",
        "summary": "Research and scholarly engagement reported for the 2019–2023 plan period.",
        "display_order": 60,
        "items": (
            {"label": "Peer-reviewed journal articles", "display_value": "750", "numeric_value": 750, "icon_key": "file-text"},
            {"label": "International research conferences", "display_value": "6", "numeric_value": 6, "icon_key": "globe"},
            {"label": "Public lectures", "display_value": "40", "numeric_value": 40, "icon_key": "presentation"},
            {"label": "Academic and postgraduate workshops", "display_value": "12", "numeric_value": 12, "icon_key": "users"},
        ),
    },
)


async def _get_one(db: AsyncSession, model, *filters):
    return (await db.execute(select(model).where(model.deleted_at.is_(None), *filters))).scalars().first()


def _publish(record, **values) -> None:
    for field_name, value in values.items():
        setattr(record, field_name, value)
    record.status = "published"
    record.workflow_status = "published"
    record.published_at = PUBLISHED_AT
    record.is_enabled = True


async def _seed_fact_group(
    db: AsyncSession,
    *,
    edition: FactEdition | None,
    fact_kind: str,
    spec: dict,
) -> None:
    edition_filter = (
        FactGroup.fact_edition_id.is_(None)
        if edition is None
        else FactGroup.fact_edition_id == edition.id
    )
    group = await _get_one(db, FactGroup, edition_filter, FactGroup.slug == spec["slug"])
    if group is None:
        group = FactGroup(fact_edition_id=None if edition is None else edition.id, slug=spec["slug"])
        db.add(group)

    _publish(
        group,
        heading=spec["heading"],
        summary=spec["summary"],
        display_order=spec["display_order"],
    )
    await db.flush()

    expected_labels = {item["label"] for item in spec["items"]}
    source_title = spec.get("source_title", STRATEGIC_PLAN_SOURCE)
    source_url = spec.get("source_url", STRATEGIC_PLAN_URL)
    for item_order, item_spec in enumerate(spec["items"], start=1):
        item = await _get_one(
            db,
            FactItem,
            FactItem.fact_group_id == group.id,
            FactItem.label == item_spec["label"],
        )
        if item is None:
            item = FactItem(fact_group_id=group.id, label=item_spec["label"], fact_kind=fact_kind)
            db.add(item)

        numeric_value = item_spec.get("numeric_value")
        _publish(
            item,
            fact_kind=fact_kind,
            display_value=item_spec["display_value"],
            numeric_value=Decimal(str(numeric_value)) if numeric_value is not None else None,
            prefix=item_spec.get("prefix"),
            suffix=item_spec.get("suffix"),
            unit=item_spec.get("unit"),
            explanation=item_spec.get("explanation"),
            icon_key=item_spec.get("icon_key"),
            source_title=source_title,
            source_url=source_url,
            verified_on=VERIFIED_ON,
            display_order=item_order * 10,
            is_featured=item_order == 1,
        )

    existing_items = (
        await db.execute(
            select(FactItem).where(
                FactItem.deleted_at.is_(None),
                FactItem.fact_group_id == group.id,
            )
        )
    ).scalars().all()
    for item in existing_items:
        if item.label not in expected_labels:
            item.is_enabled = False


async def seed_about_content(db: AsyncSession, ctx: SeedContext) -> None:
    university = ctx.university_info
    if university is None:
        raise ValueError("University info must be seeded before About content")

    about = await _get_one(db, AboutPageContent, AboutPageContent.university_info_id == university.id)
    if about is None:
        about = AboutPageContent(
            university_info_id=university.id,
            hero_eyebrow="About Kisii University",
            hero_headline="A Legacy of Excellence. A Future of Impact.",
            hero_introduction=(
                "Kisii University is a premier public institution of higher learning in Kenya, rooted in a "
                "six-decade tradition of expanding opportunity through education. From Kisii County, the "
                "University brings together learners, scholars and partners in a community shaped by academic "
                "freedom, integrity and service.\n\n"
                "Today, Kisii University advances transformative teaching, research and innovation across "
                "disciplines that matter to Kenya and the wider region. Its work connects knowledge to real "
                "human needs—preparing capable graduates, strengthening communities and creating solutions "
                "for a more inclusive and sustainable future."
            ),
            identity_heading="More Than a University, A Force for Good.",
            identity_narrative=(
                "Kisii University is a chartered public university committed to accessible, high-quality "
                "education; purposeful research and innovation; professional training; and community engagement. "
                "It serves Kenya by developing talent, preserving and sharing knowledge, and translating ideas "
                "into social and economic impact."
            ),
            mandate_introduction="The University fulfils its public mandate through teaching and training, research and innovation, knowledge preservation, community engagement, and national and regional development.",
            section_settings={"seed_owned": True, "version": 1},
            status="published", workflow_status="published", published_at=PUBLISHED_AT,
        )
        db.add(about)
        await db.flush()

    for order, (slug, year_label, event_date, title, summary) in enumerate(MILESTONES, start=1):
        existing = await _get_one(db, HistoryMilestone, HistoryMilestone.about_page_content_id == about.id, HistoryMilestone.slug == slug)
        if existing is None:
            db.add(HistoryMilestone(
                about_page_content_id=about.id, slug=slug, year_label=year_label,
                event_date=event_date, title=title, summary=summary,
                source_title=SOURCE, display_order=order * 10, is_public=True,
                status="published", workflow_status="published", published_at=PUBLISHED_AT,
            ))

    editions = (
        await db.execute(select(FactEdition).where(FactEdition.deleted_at.is_(None)))
    ).scalars().all()
    for other_edition in editions:
        if other_edition.reporting_year != 2026:
            other_edition.is_current = False
    await db.flush()

    edition = next((item for item in editions if item.reporting_year == 2026), None)
    if edition is None:
        edition = FactEdition(reporting_year=2026, title="KSU in Numbers & Facts — 2026")
        db.add(edition)
    _publish(
        edition,
        title="KSU in Numbers & Facts — 2026",
        introduction=(
            "A concise view of Kisii University through its institutional profile and the latest "
            "figures published in official University records. Each figure states its reporting period."
        ),
        methodology_note=(
            "Evergreen institutional facts are combined with the most recently published figures in "
            "the Kisii University Strategic Plan 2024–2028. Reporting periods are retained because "
            "these figures are not live operational totals."
        ),
        verified_on=VERIFIED_ON,
        is_current=True,
    )
    await db.flush()

    for group_spec in EVERGREEN_FACT_GROUPS:
        await _seed_fact_group(db, edition=None, fact_kind="evergreen", spec=group_spec)
    for group_spec in ANNUAL_FACT_GROUPS:
        await _seed_fact_group(db, edition=edition, fact_kind="annual", spec=group_spec)
    await db.flush()


__all__ = ["seed_about_content"]
