"""Public-safe aggregate stats for the research landing page."""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import (
    Consultancy,
    Donation,
    DonationImpact,
    Donor,
    EndowmentFund,
    Grant,
    GrantApplication,
    GrantGuideline,
    Innovation,
    MentorshipApplication,
    MentorshipProgram,
    Partner,
    Publication,
    ResearchBoard,
    ResearchCenter,
    ResearchFarm,
    ResearchGuideline,
    ResearchOffice,
    ResearchOfficeStaff,
    ResearchOutput,
    ResearchProgram,
    ResearchProject,
    ResearchResource,
    ResearchService,
    Scholarship,
    ScholarshipApplication,
    SuccessStory,
    Sustainability,
    TrainingProgram,
)
from ..schemas.stats import PublicStatItem, PublicStatsResponse


async def _count(db: AsyncSession, model, *conditions) -> int:
    result = await db.execute(
        select(func.count(model.id)).where(model.deleted_at.is_(None), *conditions)
    )
    return int(result.scalar_one() or 0)


async def _sum(db: AsyncSession, column, model, *conditions) -> float:
    result = await db.execute(
        select(func.coalesce(func.sum(column), 0)).where(
            model.deleted_at.is_(None),
            *conditions,
        )
    )
    return float(result.scalar_one() or 0)


def _item(
    key: str,
    label: str,
    value: int,
    description: str,
    href: str | None = None,
    suffix: str = "",
) -> PublicStatItem:
    return PublicStatItem(
        key=key,
        label=label,
        value=value,
        suffix=suffix,
        description=description,
        href=href,
    )


async def public_research_stats(db: AsyncSession) -> PublicStatsResponse:
    published_updates = await _count(
        db, Publication, Publication.is_active.is_(True), Publication.is_public.is_(True),
    )
    outputs = sum(
        [
            await _count(
                db,
                Innovation,
                Innovation.is_active.is_(True),
                Innovation.is_public.is_(True),
                Innovation.status == "active",
            ),
            await _count(
                db,
                ResearchOutput,
                ResearchOutput.is_active.is_(True),
                ResearchOutput.status == "published",
            ),
        ]
    )

    return PublicStatsResponse(
        scope="research",
        title="Research at a glance",
        stats=[
            _item(
                "research_centres",
                "Research Centres",
                await _count(db, ResearchCenter, ResearchCenter.is_active.is_(True)),
                "Active research centres and institutes",
                "/research/centres",
            ),
            _item(
                "research_projects",
                "Research Projects",
                await _count(
                    db,
                    ResearchProject,
                    ResearchProject.is_active.is_(True),
                    ResearchProject.is_public.is_(True),
                    ResearchProject.status.in_(("approved", "ongoing", "completed")),
                ),
                "Active public research projects",
                "/research/projects",
            ),
            _item(
                "publications",
                "Publications",
                await _count(
                    db,
                    Publication,
                    Publication.is_active.is_(True),
                    Publication.status == "published",
                ),
                "Published research publications",
                "/research/publications",
            ),
            _item(
                "open_access_publications",
                "Open Access",
                await _count(
                    db,
                    Publication,
                    Publication.is_active.is_(True),
                    Publication.status == "published",
                    Publication.is_open_access.is_(True),
                ),
                "Published open-access publications",
                "/research/publications?access=open",
            ),
            _item(
                "partners",
                "Research Partners",
                await _count(
                    db,
                    Partner,
                    Partner.is_active.is_(True),
                    Partner.status == "active",
                ),
                "Active research partners",
                "/research/partners",
            ),
            _item(
                "funding_opportunities",
                "Funding Opportunities",
                await _count(
                    db,
                    Grant,
                    Grant.is_active.is_(True),
                    Grant.status == "open",
                ),
                "Active public grant and funding opportunities",
                "/research/grants",
            ),
            _item(
                "research_outputs",
                "Research Outputs",
                outputs,
                "Public innovations and published research outputs",
                "/research/outputs",
            ),
            _item(
                "research_updates",
                "Research Updates",
                published_updates,
                "Published research news, articles, and events",
                "/research/news",
            ),
        ],
    )


async def admin_research_stats(db: AsyncSession) -> PublicStatsResponse:
    """Operational research-office stats for admin dashboards."""

    pending_applications = sum(
        [
            await _count(db, GrantApplication, GrantApplication.status.in_(("submitted", "under_review"))),
            await _count(db, ScholarshipApplication, ScholarshipApplication.status.in_(("submitted", "under_review"))),
            await _count(db, MentorshipApplication, MentorshipApplication.status.in_(("submitted", "under_review"))),
        ]
    )
    published_updates = await _count(db, Publication, Publication.is_public.is_(True))

    stats = [
        _item("centres", "Research Centres", await _count(db, ResearchCenter), "Research centre records", "/research/centers"),
        _item("farms", "Research Farms", await _count(db, ResearchFarm), "Research farm and facility records", "/research/farms"),
        _item("programs", "Research Programs", await _count(db, ResearchProgram), "Research program records", "/research/programs"),
        _item("projects", "Projects", await _count(db, ResearchProject), "Research project records", "/research/projects"),
        _item("active_projects", "Active Projects", await _count(db, ResearchProject, ResearchProject.status.in_(("approved", "ongoing"))), "Approved and ongoing research projects", "/research/projects"),
        _item("publications", "Publications", await _count(db, Publication), "Publication records", "/research/publications"),
        _item("published_publications", "Published Publications", await _count(db, Publication, Publication.status == "published"), "Published publication records", "/research/publications"),
        _item("outputs", "Outputs", await _count(db, ResearchOutput), "Research output records", "/research/outputs"),
        _item("innovations", "Innovations", await _count(db, Innovation), "Innovation records", "/research/innovations"),
        _item("partners", "Partners", await _count(db, Partner), "Research partner records", "/research/partners"),
        _item("consultancies", "Consultancies", await _count(db, Consultancy), "Consultancy records", "/research/consultancies"),
        _item("grants", "Grants", await _count(db, Grant), "Grant and funding opportunity records", "/research/grants"),
        _item("open_grants", "Open Grants", await _count(db, Grant, Grant.status == "open"), "Open grant opportunities", "/research/grants"),
        _item("grant_applications", "Grant Applications", await _count(db, GrantApplication), "Grant application records", "/research/grants/applications"),
        _item("scholarships", "Scholarships", await _count(db, Scholarship), "Scholarship records", "/research/scholarships"),
        _item("pending_applications", "Pending Applications", pending_applications, "Grant, scholarship, and mentorship applications awaiting action", "/research/reports"),
        _item("training_programs", "Training Programs", await _count(db, TrainingProgram), "Training program records", "/research/training"),
        _item("mentorship_programs", "Mentorship Programs", await _count(db, MentorshipProgram), "Mentorship program records", "/research/mentorship"),
        _item("endowments", "Endowments", await _count(db, EndowmentFund), "Endowment fund records", "/research/endowments"),
        _item("donors", "Donors", await _count(db, Donor), "Research donor records", "/research/donations/donors"),
        _item("donations", "Donations", await _count(db, Donation), "Donation records", "/research/donations/records"),
        _item("completed_donations", "Completed Donations", await _count(db, Donation, Donation.status == "completed"), "Completed donation records", "/research/donations/records"),
        _item("donation_value", "Donation Value", await _sum(db, Donation.amount, Donation, Donation.status == "completed"), "Completed donation amount recorded in source currencies", "/research/donations/records"),
        _item("impact_stories", "Impact Stories", await _count(db, SuccessStory), "Research impact story records", "/research/stories"),
        _item("sustainability_records", "Sustainability Records", await _count(db, Sustainability), "Sustainability initiative records", "/research/sustainability"),
        _item("resources", "Resources", await _count(db, ResearchResource), "Research resource records", "/research/resources-tools"),
        _item("services", "Services", await _count(db, ResearchService), "Research service records", "/research/services"),
        _item("guidelines", "Guidelines", await _count(db, ResearchGuideline) + await _count(db, GrantGuideline), "Research and grant guideline records", "/research/guidelines"),
        _item("offices", "Offices", await _count(db, ResearchOffice), "Research office records", "/research/offices"),
        _item("office_staff", "Office Staff", await _count(db, ResearchOfficeStaff), "Research office staff records", "/research/team"),
        _item("boards", "Boards", await _count(db, ResearchBoard), "Research governance board records", "/research/boards"),
        _item("published_updates", "Published Updates", published_updates, "Published research news, articles, and events", "/research/news"),
        _item("donation_impacts", "Donation Impacts", await _count(db, DonationImpact), "Donation impact records", "/research/donations/impacts"),
    ]

    return PublicStatsResponse(
        scope="admin",
        title="Research service operational statistics",
        stats=stats,
    )
