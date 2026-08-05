"""Research data export helpers."""

from __future__ import annotations

import csv
import io
import json
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from .capacity import MentorshipService, ScholarshipService, TrainingService
from .classification import FocusAreaService, TagService, ThemeService
from .core import CenterService, FarmService, ProgramService, ProjectService
from .donation import DonationService, DonationStoryService, DonorService
from .funding import EndowmentFundService, FundingService, GrantGuidelineService, GrantService
from .impact import MetricService, StoryService, SustainabilityService
from .innovation import InnovationService, OutputService
from .innovation_partnership import (
    CompetitionEntryService,
    IncubationRecordService,
    StartupVentureService,
    TechnologyTransferCaseService,
)
from .partnership import ConsultancyService, PartnerService
from .publication import JournalService, PublicationService


@dataclass(frozen=True)
class ExportResourceConfig:
    key: str
    label: str
    service: type
    columns: tuple[str, ...]
    filename: str


COMMON_COLUMNS = ("id", "created_at", "updated_at")
TITLE_COLUMNS = ("id", "title", "slug", "status", "is_active", "is_featured", "created_at", "updated_at")
NAME_COLUMNS = ("id", "name", "slug", "code", "status", "is_active", "is_featured", "created_at", "updated_at")


EXPORT_RESOURCE_CONFIGS: dict[str, ExportResourceConfig] = {
    "research-projects": ExportResourceConfig(
        key="research-projects",
        label="Research Projects",
        service=ProjectService,
        columns=(
            "id",
            "title",
            "slug",
            "code",
            "project_type",
            "status",
            "center_id",
            "program_id",
            "pi_id",
            "grant_id",
            "start_date",
            "end_date",
            "budget",
            "currency",
            "progress_percentage",
            "is_active",
            "is_featured",
            "is_public",
            "created_at",
            "updated_at",
        ),
        filename="research-projects",
    ),
    "research-publications": ExportResourceConfig(
        key="research-publications",
        label="Research Publications",
        service=PublicationService,
        columns=(
            "id",
            "title",
            "slug",
            "publication_type",
            "status",
            "project_id",
            "center_id",
            "journal_id",
            "journal_name",
            "publisher",
            "publication_date",
            "year",
            "doi",
            "is_open_access",
            "access_type",
            "citation_count",
            "created_at",
            "updated_at",
        ),
        filename="research-publications",
    ),
    "research-grants": ExportResourceConfig(
        key="research-grants",
        label="Research Grants",
        service=GrantService,
        columns=(
            "id",
            "title",
            "slug",
            "code",
            "grant_type",
            "category",
            "status",
            "funder_id",
            "funder_name",
            "total_budget",
            "min_award",
            "max_award",
            "currency",
            "open_date",
            "deadline",
            "is_active",
            "is_featured",
            "created_at",
            "updated_at",
        ),
        filename="research-grants",
    ),
    "research-innovations": ExportResourceConfig("research-innovations", "Research Innovations", InnovationService, TITLE_COLUMNS + ("code", "innovation_type", "category", "development_stage", "ip_status", "commercialization_status", "center_id", "project_id"), "research-innovations"),
    "research-startups": ExportResourceConfig("research-startups", "Research Startup Ventures", StartupVentureService, NAME_COLUMNS + ("innovation_id", "partner_id", "center_id", "venture_stage", "registration_status", "sector", "funding_raised", "currency"), "research-startups"),
    "research-incubation-records": ExportResourceConfig("research-incubation-records", "Research Incubation Records", IncubationRecordService, TITLE_COLUMNS + ("code", "innovation_id", "startup_id", "partner_id", "center_id", "program_name", "cohort", "incubation_type", "stage", "start_date", "end_date"), "research-incubation-records"),
    "research-competition-entries": ExportResourceConfig("research-competition-entries", "Research Competition Entries", CompetitionEntryService, TITLE_COLUMNS + ("code", "innovation_id", "startup_id", "partner_id", "entry_type", "competition_name", "entry_status", "event_date", "award", "prize_value", "currency"), "research-competition-entries"),
    "research-technology-transfer-cases": ExportResourceConfig("research-technology-transfer-cases", "Technology Transfer Cases", TechnologyTransferCaseService, TITLE_COLUMNS + ("code", "innovation_id", "partner_id", "center_id", "case_type", "transfer_status", "agreement_date", "ip_reference", "agreement_reference", "revenue_generated", "currency"), "research-technology-transfer-cases"),
    "research-partners": ExportResourceConfig("research-partners", "Research Partners", PartnerService, NAME_COLUMNS + ("partner_type", "partnership_level", "country", "website", "email"), "research-partners"),
    "research-centers": ExportResourceConfig("research-centers", "Research Centers", CenterService, NAME_COLUMNS + ("acronym", "center_type", "school_id", "department_id", "location"), "research-centers"),
    "research-outputs": ExportResourceConfig("research-outputs", "Research Outputs", OutputService, TITLE_COLUMNS + ("output_type", "project_id", "center_id", "access_type", "doi", "download_count", "citation_count"), "research-outputs"),
    "research-training": ExportResourceConfig("research-training", "Research Training", TrainingService, TITLE_COLUMNS + ("code", "program_type", "category", "center_id", "delivery_mode", "start_date", "end_date", "max_participants", "current_registrations"), "research-training"),
    "research-scholarships": ExportResourceConfig("research-scholarships", "Research Scholarships", ScholarshipService, NAME_COLUMNS + ("scholarship_type", "funder_name", "value", "currency", "application_deadline", "number_available"), "research-scholarships"),
    "research-mentorship": ExportResourceConfig("research-mentorship", "Research Mentorship", MentorshipService, NAME_COLUMNS + ("program_type", "center_id", "coordinator_id", "max_mentees", "current_mentees"), "research-mentorship"),
    "research-consultancies": ExportResourceConfig("research-consultancies", "Research Consultancies", ConsultancyService, TITLE_COLUMNS + ("code", "consultancy_type", "client_name", "client_type", "partner_id", "center_id", "start_date", "end_date", "contract_value", "currency"), "research-consultancies"),
    "research-endowments": ExportResourceConfig("research-endowments", "Research Endowments", EndowmentFundService, NAME_COLUMNS + ("fund_type", "principal_amount", "current_value", "annual_distribution", "currency", "established_date", "donor_name", "is_accepting_contributions"), "research-endowments"),
    "research-programs": ExportResourceConfig("research-programs", "Research Programs", ProgramService, NAME_COLUMNS + ("program_type", "center_id", "lead_id", "start_date", "end_date", "budget", "currency"), "research-programs"),
    "research-farms": ExportResourceConfig("research-farms", "Research Farms", FarmService, NAME_COLUMNS + ("farm_type", "location", "county", "center_id"), "research-farms"),
    "research-sustainability": ExportResourceConfig("research-sustainability", "Sustainability Initiatives", SustainabilityService, NAME_COLUMNS + ("initiative_type", "center_id", "start_date", "end_date", "budget", "currency"), "research-sustainability"),
    "research-donors": ExportResourceConfig("research-donors", "Research Donors", DonorService, COMMON_COLUMNS + ("donor_type", "display_name", "organization_name", "email", "tier", "total_donated", "donation_count", "is_anonymous", "is_active"), "research-donors"),
    "research-funders": ExportResourceConfig("research-funders", "Research Funders", FundingService, NAME_COLUMNS + ("acronym", "funder_type", "country", "website", "email"), "research-funders"),
    "research-impact-metrics": ExportResourceConfig("research-impact-metrics", "Research Impact Metrics", MetricService, NAME_COLUMNS + ("metric_type", "category", "value", "unit", "reporting_period", "project_id", "center_id"), "research-impact-metrics"),
    "research-themes": ExportResourceConfig("research-themes", "Research Themes", ThemeService, NAME_COLUMNS + ("theme_type", "category"), "research-themes"),
    "research-focus-areas": ExportResourceConfig("research-focus-areas", "Research Focus Areas", FocusAreaService, NAME_COLUMNS + ("category",), "research-focus-areas"),
    "research-expertise-tags": ExportResourceConfig("research-expertise-tags", "Research Expertise Tags", TagService, COMMON_COLUMNS + ("name", "category", "usage_count", "is_active", "is_featured"), "research-expertise-tags"),
    "research-journals": ExportResourceConfig("research-journals", "Research Journals", JournalService, COMMON_COLUMNS + ("name", "abbreviation", "issn", "eissn", "publisher", "is_open_access", "is_university_journal", "quartile", "h_index", "is_active"), "research-journals"),
    "research-grant-guidelines": ExportResourceConfig("research-grant-guidelines", "Research Grant Guidelines", GrantGuidelineService, TITLE_COLUMNS + ("guideline_type", "category", "grant_id", "is_required"), "research-grant-guidelines"),
    "research-donations": ExportResourceConfig("research-donations", "Research Donations", DonationService, COMMON_COLUMNS + ("donor_id", "donation_number", "amount", "currency", "donation_type", "designation", "purpose", "project_id", "center_id", "scholarship_id", "donation_date", "status", "is_public"), "research-donations"),
    "research-stories": ExportResourceConfig("research-stories", "Research Success Stories", StoryService, TITLE_COLUMNS + ("story_type", "location", "story_date", "project_id", "center_id"), "research-stories"),
    "research-donation-stories": ExportResourceConfig("research-donation-stories", "Research Donation Stories", DonationStoryService, TITLE_COLUMNS + ("donor_id", "donor_name", "donor_organization"), "research-donation-stories"),
}


class ResearchExportService:
    """Build filtered export payloads for research admin resources."""

    @staticmethod
    def get_config(resource_key: str) -> ExportResourceConfig | None:
        return EXPORT_RESOURCE_CONFIGS.get(resource_key)

    @staticmethod
    async def rows(
        db: AsyncSession,
        config: ExportResourceConfig,
        *,
        search: str | None = None,
        filters: dict[str, Any] | None = None,
        year: int | None = None,
        sort: str | None = None,
        order: str | None = None,
        limit: int = 5000,
    ) -> list[dict[str, Any]]:
        result = await config.service.list(
            db,
            page=1,
            per_page=limit,
            search=search,
            filters=filters,
            year=year,
            sort=sort,
            order=order,
        )
        return [ResearchExportService.serialize_item(item, config.columns) for item in result.items]

    @staticmethod
    def serialize_item(item: Any, columns: tuple[str, ...]) -> dict[str, Any]:
        return {
            column: ResearchExportService.serialize_value(getattr(item, column, None))
            for column in columns
        }

    @staticmethod
    def serialize_value(value: Any) -> Any:
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        if isinstance(value, Decimal):
            return float(value)
        if isinstance(value, UUID):
            return str(value)
        if isinstance(value, (dict, list)):
            return json.dumps(value, ensure_ascii=False)
        return value

    @staticmethod
    def to_csv(config: ExportResourceConfig, rows: list[dict[str, Any]]) -> str:
        buffer = io.StringIO()
        writer = csv.DictWriter(buffer, fieldnames=list(config.columns), extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
        return buffer.getvalue()
