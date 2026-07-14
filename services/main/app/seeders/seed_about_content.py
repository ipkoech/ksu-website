"""Seed verified About KSU history and institutional facts."""

from __future__ import annotations

from datetime import date, datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import AboutPageContent, FactEdition, FactGroup, FactItem, HistoryMilestone
from ._shared import SeedContext


SOURCE = "Kisii University Revised Students Handbook and institutional profile"
PUBLISHED_AT = datetime(2026, 7, 14, tzinfo=timezone.utc)

MILESTONES = (
    ("1965", "1965", date(1965, 1, 1), "The Beginning", "The institution began as a Primary Teachers Training College on land donated by the County Council of Gusii."),
    ("1983", "1983", date(1983, 1, 1), "A New Level of Training", "The college became a Secondary Teachers College, responding to Kenya's growing demand for qualified teachers."),
    ("1994", "1994", date(1994, 1, 1), "The University Transition", "Egerton University took over the college as a campus and established a foundation for university-level education."),
    ("1999", "1999", date(1999, 1, 1), "The First Degree Programme", "The Faculty of Commerce introduced the institution's first university degree programme."),
    ("2007", "2007", date(2007, 8, 23), "A Constituent College", "Kisii University College was established as a constituent college of Egerton University through Legal Notice No. 163 of 2007."),
    ("2013", "2013", date(2013, 2, 6), "A Chartered Public University", "Kisii University received its charter and became Kenya's 13th public university."),
    ("today", "Today", None, "Transforming Tomorrow", "Kisii University continues to advance teaching, research, innovation and community engagement in Kenya and beyond."),
)

EVERGREEN_FACTS = (
    ("institutional-profile", "Institutional Profile", 10, (
        ("established", "Established", "1965", "calendar", 10),
        ("chartered", "Chartered", "2013", "award", 20),
        ("legal-status", "Legal Status", "Public University", "landmark", 30),
        ("location", "Location", "Main Campus, Kisii County", "map-pin", 40),
    )),
    ("academic-organisation", "Academic Organisation", 20, (
        ("schools", "Schools", "8", "school", 10),
        ("governance", "Governance", "University Council & Management", "book-open", 20),
    )),
)


async def _get_one(db: AsyncSession, model, *filters):
    return (await db.execute(select(model).where(model.deleted_at.is_(None), *filters))).scalars().first()


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

    edition = await _get_one(db, FactEdition, FactEdition.reporting_year == 2026)
    if edition is None:
        edition = FactEdition(
            reporting_year=2026, title="KSU in Numbers & Facts — 2026",
            introduction="A verified institutional profile of Kisii University, presented with source and review context.",
            methodology_note="Evergreen institutional facts are composed with the current annual reporting edition.",
            verified_on=date(2026, 7, 14), is_current=True,
            status="published", workflow_status="published", published_at=PUBLISHED_AT,
        )
        db.add(edition)

    for group_slug, heading, group_order, items in EVERGREEN_FACTS:
        group = await _get_one(db, FactGroup, FactGroup.fact_edition_id.is_(None), FactGroup.slug == group_slug)
        if group is None:
            group = FactGroup(
                fact_edition_id=None, slug=group_slug, heading=heading, display_order=group_order,
                status="published", workflow_status="published", published_at=PUBLISHED_AT,
            )
            db.add(group)
            await db.flush()
        for item_slug, label, value, icon_key, item_order in items:
            existing = await _get_one(db, FactItem, FactItem.fact_group_id == group.id, FactItem.label == label)
            if existing is None:
                db.add(FactItem(
                    fact_group_id=group.id, fact_kind="evergreen", label=label,
                    display_value=value, icon_key=icon_key, source_title=SOURCE,
                    verified_on=date(2026, 7, 14), display_order=item_order,
                    status="published", workflow_status="published", published_at=PUBLISHED_AT,
                ))
    await db.flush()


__all__ = ["seed_about_content"]
