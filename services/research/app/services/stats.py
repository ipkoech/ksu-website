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
    ResearchCenter,
    ResearchFarm,
    ResearchGuideline,
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
    value: int | float,
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
    # Pre-compute all aggregates
    centre_count = await _count(db, ResearchCenter, ResearchCenter.is_active.is_(True))
    farm_hectares_val = await _sum(db, ResearchFarm.size_hectares, ResearchFarm, ResearchFarm.is_active.is_(True), ResearchFarm.is_public.is_(True))
    project_count = await _count(db, ResearchProject, ResearchProject.is_active.is_(True), ResearchProject.is_public.is_(True), ResearchProject.status.in_(("approved", "ongoing", "completed")))
    project_budget_total = await _sum(db, ResearchProject.budget, ResearchProject, ResearchProject.is_active.is_(True), ResearchProject.is_public.is_(True))
    published_updates = await _count(db, Publication, Publication.is_active.is_(True), Publication.is_public.is_(True))
    citation_total = await _sum(db, Publication.citation_count, Publication, Publication.is_active.is_(True), Publication.is_public.is_(True))
    outputs = sum(
        [
            await _count(db, Innovation, Innovation.is_active.is_(True), Innovation.is_public.is_(True), Innovation.status == "active"),
            await _count(db, ResearchOutput, ResearchOutput.is_active.is_(True), ResearchOutput.status == "published"),
        ]
    )
    patent_count = await _count(db, Innovation, Innovation.is_active.is_(True), Innovation.is_public.is_(True), Innovation.ip_status.in_(("filed", "granted")))
    commercialized_count = await _count(db, Innovation, Innovation.is_active.is_(True), Innovation.is_public.is_(True), Innovation.commercialization_status == "commercialized")
    grant_total = await _sum(db, Grant.total_budget, Grant, Grant.is_active.is_(True))
    open_grant_count = await _count(db, Grant, Grant.is_active.is_(True), Grant.status == "open")
    scholarship_count = await _count(db, Scholarship, Scholarship.is_active.is_(True))
    scholarship_value_total = await _sum(db, Scholarship.value, Scholarship, Scholarship.is_active.is_(True))
    consultancy_income = await _sum(db, Consultancy.contract_value, Consultancy, Consultancy.is_active.is_(True), Consultancy.is_public.is_(True))
    endowment_value_total = await _sum(db, EndowmentFund.current_value, EndowmentFund, EndowmentFund.is_active.is_(True))
    donation_total = await _sum(db, Donation.amount, Donation, Donation.status == "completed", Donation.is_public.is_(True))
    industry_partners = await _count(db, Partner, Partner.is_active.is_(True), Partner.partner_type == "industry")
    academic_partners = await _count(db, Partner, Partner.is_active.is_(True), Partner.partner_type == "academic")
    partner_count = await _count(db, Partner, Partner.is_active.is_(True))
    training_participants = await _sum(db, TrainingProgram.current_registrations, TrainingProgram, TrainingProgram.is_active.is_(True))
    impact_story_count = await _count(db, SuccessStory, SuccessStory.is_active.is_(True), SuccessStory.status == "published")

    return PublicStatsResponse(
        scope="research",
        title="Research at a glance",
        stats=[
            _item(
                key="research_centres",
                label="Research Centres",
                value=centre_count,
                description="Active research centres and institutes",
                href="/research/centres",
            ),
            _item(
                key="farm_hectares",
                label="Research Land",
                value=farm_hectares_val,
                suffix="Ha",
                description="Active public research farm acreage",
                href="/research/farms",
            ),
            _item(
                key="research_projects",
                label="Research Projects",
                value=project_count,
                description="Active public research projects",
                href="/research/projects",
            ),
            _item(
                key="project_budget",
                label="Project Funding",
                value=int(project_budget_total),
                suffix="KES",
                description="Total budget of active public research projects",
                href="/research/projects",
            ),
            _item(
                key="publications",
                label="Publications",
                value=published_updates,
                description="Published research publications",
                href="/research/publications",
            ),
            _item(
                key="citations",
                label="Citations",
                value=citation_total,
                description="Total citations of published research",
                href="/research/publications",
            ),
            _item(
                key="outputs",
                label="Outputs",
                value=outputs,
                description="Public innovations and published research outputs",
                href="/research/innovations",
            ),
            _item(
                key="patents",
                label="Patents & IP",
                value=patent_count,
                description="Innovations with filed or granted intellectual property rights",
                href="/research/innovations",
            ),
            _item(
                key="commercialized",
                label="Commercialized",
                value=commercialized_count,
                description="Innovations that have reached market",
                href="/research/innovations",
            ),
            _item(
                key="grant_funding",
                label="Grant Funding",
                value=int(grant_total),
                suffix="KES",
                description="Total value of active research grants",
                href="/research/grants",
            ),
            _item(
                key="open_grants",
                label="Open Grants",
                value=open_grant_count,
                description="Open grant opportunities accepting applications",
                href="/research/grants",
            ),
            _item(
                key="scholarships",
                label="Scholarships",
                value=scholarship_count,
                description="Active research scholarships",
                href="/research/scholarships",
            ),
            _item(
                key="scholarship_value",
                label="Scholarship Value",
                value=int(scholarship_value_total),
                suffix="KES",
                description="Total value of active research scholarships",
                href="/research/scholarships",
            ),
            _item(
                key="consultancy_income",
                label="Consultancy Income",
                value=int(consultancy_income),
                suffix="KES",
                description="Contract value of active public consultancies",
                href="/research/consultancies",
            ),
            _item(
                key="endowment_value",
                label="Endowment Assets",
                value=int(endowment_value_total),
                suffix="KES",
                description="Current value of active endowment funds",
                href="/research/endowments",
            ),
            _item(
                key="donation_total",
                label="Donations",
                value=int(donation_total),
                suffix="KES",
                description="Total completed public donations",
                href="/research/donations",
            ),
            _item(
                key="industry_partners",
                label="Industry Partners",
                value=industry_partners,
                description="Active industry and corporate partners",
                href="/research/partners",
            ),
            _item(
                key="academic_partners",
                label="Academic Partners",
                value=academic_partners,
                description="Active academic and institutional partners",
                href="/research/partners",
            ),
            _item(
                key="partner_count",
                label="Total Partners",
                value=partner_count,
                description="All active institutional and industry partners",
                href="/research/partners",
            ),
            _item(
                key="training_participants",
                label="Trained",
                value=training_participants,
                description="Researchers registered in active training programs",
                href="/research/training",
            ),
            _item(
                key="impact_stories",
                label="Impact Stories",
                value=impact_story_count,
                description="Published research impact and success stories",
                href="/research/stories",
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
        _item("published_updates", "Published Updates", published_updates, "Published research records", "/research/publications"),
        _item("donation_impacts", "Donation Impacts", await _count(db, DonationImpact), "Donation impact records", "/research/donations/impacts"),
    ]

    return PublicStatsResponse(
        scope="admin",
        title="Research service operational statistics",
        stats=stats,
    )
