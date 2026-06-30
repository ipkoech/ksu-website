"""Read-only section advisor for the research admin portal."""

from __future__ import annotations

from dataclasses import dataclass

from ..schemas.ask_ai import (
    ResearchAskAIContext,
    ResearchAskAIPrompt,
    ResearchAskAIReference,
    ResearchAskAIResponse,
)


@dataclass(frozen=True)
class SectionAdvisorConfig:
    key: str
    label: str
    href: str
    resource_key: str | None
    focus: str
    prompts: tuple[ResearchAskAIPrompt, ...]
    related: tuple[ResearchAskAIReference, ...] = ()


def _prompt(id: str, label: str, text: str, intent: str) -> ResearchAskAIPrompt:
    return ResearchAskAIPrompt(id=id, label=label, text=text, intent=intent)


def _reference(label: str, href: str, resource_key: str | None = None, type: str = "page") -> ResearchAskAIReference:
    return ResearchAskAIReference(label=label, href=href, resource_key=resource_key, type=type)


SECTION_CONFIGS: dict[str, SectionAdvisorConfig] = {
    "overview": SectionAdvisorConfig(
        key="overview",
        label="Research Overview",
        href="/research",
        resource_key=None,
        focus="research portfolio navigation, operational priorities, and cross-section summaries",
        prompts=(
            _prompt("overview-health", "Portfolio health", "Summarize the current research portfolio and the areas that need attention.", "summarize"),
            _prompt("overview-gaps", "Data gaps", "Which research records should I review for incomplete metadata before reporting?", "find_gaps"),
            _prompt("overview-next", "Next actions", "Suggest the next read-only checks for improving the research portfolio quality.", "recommend"),
            _prompt("overview-pages", "Where to go", "Which research admin pages should I open for projects, grants, publications, and reports?", "navigate"),
        ),
        related=(
            _reference("Projects", "/research/projects", "research-projects"),
            _reference("Grants", "/research/grants", "research-grants"),
            _reference("Reports", "/research/reports"),
        ),
    ),
    "projects": SectionAdvisorConfig(
        key="projects",
        label="Research Projects",
        href="/research/projects",
        resource_key="research-projects",
        focus="project status, PI assignment, funding links, timelines, and publication/output relationships",
        prompts=(
            _prompt("projects-missing-pi", "Missing PIs", "Which projects appear to be missing PI assignments or ownership metadata?", "find_gaps"),
            _prompt("projects-progress", "Progress review", "Summarize project progress risks by status, dates, and completion percentage.", "summarize"),
            _prompt("projects-funding", "Funding links", "Which projects should I review for missing grant, funder, or budget links?", "find_gaps"),
            _prompt("projects-export", "Export readiness", "What should I check before exporting project data for a report?", "prepare_export"),
        ),
        related=(
            _reference("Projects", "/research/projects", "research-projects", "resource"),
            _reference("Grants", "/research/grants", "research-grants", "resource"),
            _reference("Outputs", "/research/outputs", "research-outputs", "resource"),
        ),
    ),
    "grants": SectionAdvisorConfig(
        key="grants",
        label="Research Grants",
        href="/research/grants",
        resource_key="research-grants",
        focus="grant calls, budgets, deadlines, eligibility, guidelines, applications, and linked projects",
        prompts=(
            _prompt("grants-deadlines", "Deadline review", "Which grant deadlines or opening dates should I pay attention to?", "summarize"),
            _prompt("grants-guidelines", "Guideline gaps", "Which grant records may need clearer guidelines or eligibility details?", "find_gaps"),
            _prompt("grants-project-links", "Project links", "Which grants should I review for missing linked projects or funders?", "find_gaps"),
            _prompt("grants-report", "Grant report", "Help me outline a read-only grant funding status report.", "draft_outline"),
        ),
        related=(
            _reference("Grants", "/research/grants", "research-grants", "resource"),
            _reference("Funders", "/research/fundings/funders", "research-funders", "resource"),
            _reference("Guidelines", "/research/fundings/guidelines", "research-grant-guidelines", "resource"),
        ),
    ),
    "publications": SectionAdvisorConfig(
        key="publications",
        label="Research Publications",
        href="/research/publications",
        resource_key="research-publications",
        focus="publication metadata, DOI quality, open-access status, journals, citations, and project links",
        prompts=(
            _prompt("publications-open-access", "Open access", "Summarize open-access coverage and records that may need access review.", "summarize"),
            _prompt("publications-doi", "DOI gaps", "Which publications should I review for missing DOI, journal, or publication date metadata?", "find_gaps"),
            _prompt("publications-projects", "Project links", "Which publications appear disconnected from projects or centers?", "find_gaps"),
            _prompt("publications-export", "Export readiness", "What checks should I run before exporting publications for reporting?", "prepare_export"),
        ),
        related=(
            _reference("Publications", "/research/publications", "research-publications", "resource"),
            _reference("Journals", "/research/publications/journals", "research-journals", "resource"),
            _reference("Projects", "/research/projects", "research-projects", "resource"),
        ),
    ),
    "reports": SectionAdvisorConfig(
        key="reports",
        label="Research Reports",
        href="/research/reports",
        resource_key=None,
        focus="read-only exports, report preparation, auditability, and dataset quality checks",
        prompts=(
            _prompt("reports-dataset", "Dataset choice", "Which export dataset should I use for a research performance report?", "recommend"),
            _prompt("reports-quality", "Quality checks", "What data quality checks should I run before generating a report?", "prepare_export"),
            _prompt("reports-outline", "Report outline", "Draft a structured outline for a research portfolio report using available datasets.", "draft_outline"),
            _prompt("reports-compare", "Compare areas", "How should I compare projects, grants, publications, and impact metrics?", "explain"),
        ),
        related=(
            _reference("Reports", "/research/reports"),
            _reference("Projects export", "/research/projects", "research-projects", "resource"),
            _reference("Impact metrics", "/research/impact", "research-impact-metrics", "resource"),
        ),
    ),
    "sustainability": SectionAdvisorConfig(
        key="sustainability",
        label="Sustainability",
        href="/research/sustainability",
        resource_key="research-sustainability",
        focus="sustainability initiatives, community outcomes, partners, activities, and environmental impact metrics",
        prompts=(
            _prompt("sustainability-impact", "Impact summary", "Summarize sustainability initiatives and the impact metrics that support them.", "summarize"),
            _prompt("sustainability-links", "Relationship gaps", "Which sustainability records need linked projects, partners, training, or stories?", "find_gaps"),
            _prompt("sustainability-report", "Narrative outline", "Help me outline a community and sustainability impact narrative.", "draft_outline"),
            _prompt("sustainability-export", "Export readiness", "What should I verify before exporting sustainability records?", "prepare_export"),
        ),
        related=(
            _reference("Sustainability", "/research/sustainability", "research-sustainability", "resource"),
            _reference("Impact", "/research/impact", "research-impact-metrics", "resource"),
            _reference("Partners", "/research/sustainability/partners", "research-partners", "resource"),
        ),
    ),
}

SECTION_ALIASES = {
    "": "overview",
    "main": "overview",
    "centers": "projects",
    "programs": "projects",
    "outputs": "publications",
    "innovations": "publications",
    "fundings": "grants",
    "impact": "sustainability",
    "farm": "sustainability",
    "capacity": "overview",
    "partnerships": "overview",
    "donations": "overview",
    "settings": "overview",
    "content": "overview",
}


class ResearchAskAIService:
    """Build safe, read-only advisor context for the research portal."""

    @staticmethod
    def resolve_context(path: str, section: str | None, resource_key: str | None, record_id: str | None = None) -> ResearchAskAIContext:
        section_key = _normalize_section(section) or _section_from_path(path)
        config = SECTION_CONFIGS.get(section_key) or SECTION_CONFIGS["overview"]
        resolved_resource_key = resource_key or config.resource_key
        references = (
            _reference(config.label, config.href, resolved_resource_key, "section"),
            *config.related,
        )

        return ResearchAskAIContext(
            section_key=config.key,
            section_label=config.label,
            path=path or config.href,
            resource_key=resolved_resource_key,
            record_id=record_id,
            capabilities=[
                "answer read-only research admin questions",
                "summarize section context and data quality checks",
                "suggest relevant pages, exports, and report preparation steps",
                "refuse create, update, delete, approval, or publishing actions",
            ],
            guided_prompts=list(config.prompts),
            references=list(references),
        )

    @staticmethod
    def respond(message: str, path: str, section: str | None, resource_key: str | None, record_id: str | None = None) -> ResearchAskAIResponse:
        context = ResearchAskAIService.resolve_context(path, section, resource_key, record_id)
        answer = (
            f"I can help as a read-only research advisor for {context.section_label}. "
            "I can explain records, identify review areas, suggest relevant exports, and help structure reports. "
            "I cannot create, update, delete, approve, publish, or otherwise modify research data. "
            f"For this section, focus on {SECTION_CONFIGS[context.section_key].focus}."
        )
        if message.strip():
            answer = f"{answer} Your question was: {message.strip()}"

        return ResearchAskAIResponse(
            answer=answer,
            context=context,
            references=context.references,
            suggested_prompts=context.guided_prompts,
        )


def _normalize_section(section: str | None) -> str | None:
    if section is None:
        return None
    normalized = section.strip().lower().replace("_", "-")
    return SECTION_ALIASES.get(normalized, normalized)


def _section_from_path(path: str) -> str:
    parts = [part for part in (path or "").split("/") if part]
    if not parts or parts[0] != "research":
        return "overview"
    raw = parts[1] if len(parts) > 1 else "overview"
    return SECTION_ALIASES.get(raw, raw if raw in SECTION_CONFIGS else "overview")
