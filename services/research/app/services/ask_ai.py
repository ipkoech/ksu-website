"""Read-only section advisor for the research admin portal."""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
import json
import re
import uuid
from typing import Any

from ksu_common.gemini import get_gemini_transport

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import get_settings
from ..models import ResearchAIConversation, ResearchAIMessage
from ..schemas.ask_ai import (
    ResearchAIConversationRead,
    ResearchAskAIContext,
    ResearchAskAIPrompt,
    ResearchAskAIReference,
    ResearchAskAIResponse,
    ResearchAIMessageRead,
)
from .exports import EXPORT_RESOURCE_CONFIGS, ResearchExportService
from .search import RESEARCH_SEARCH_AREAS
from .stats import admin_research_stats


@dataclass(frozen=True)
class SectionAdvisorConfig:
    key: str
    label: str
    href: str
    resource_key: str | None
    focus: str
    prompts: tuple[ResearchAskAIPrompt, ...]
    related: tuple[ResearchAskAIReference, ...] = ()


class GeminiResearchAIProvider:
    """Gemini-backed read-only research advisor provider."""

    def __init__(self, api_key: str | None, model: str, timeout_seconds: float = 30.0) -> None:
        self.api_key = api_key or ""
        self.model = model
        self.timeout_seconds = timeout_seconds

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key.strip())

    async def generate_markdown(
        self,
        *,
        message: str,
        context: ResearchAskAIContext,
        service_exposure: dict,
    ) -> str | None:
        if not self.is_configured:
            return None

        prompt = self.build_prompt(message=message, context=context, service_exposure=service_exposure)
        transport = get_gemini_transport(
            api_key=self.api_key,
            model=self.model,
            timeout_seconds=self.timeout_seconds,
        )

        try:
            answer = await transport.generate(
                prompt,
                temperature=0.2,
                max_output_tokens=1200,
                response_mime_type="text/plain",
            )
            return answer or None
        except Exception:
            return None

    def build_prompt(
        self,
        *,
        message: str,
        context: ResearchAskAIContext,
        service_exposure: dict,
    ) -> str:
        safe_exposure = _sanitize_service_exposure(service_exposure)
        compact_exposure = {
            "mode": safe_exposure.get("mode", "read_only"),
            "section": context.model_dump(mode="json"),
            "resources": safe_exposure.get("resources", [])[:30],
            "exports": safe_exposure.get("exports", [])[:30],
            "admin_stats": safe_exposure.get("admin_stats", [])[:40],
            "record_samples": safe_exposure.get("record_samples", [])[:30],
        }
        return "\n".join(
            [
                "You are the Kisii University Research admin Ask AI assistant.",
                "You must answer as a read-only advisor. Never claim that you created, updated, deleted, approved, published, imported, exported, or queued anything.",
                "Use Markdown. Keep the answer practical, section-aware, and grounded in the provided research backend context.",
                "Answer research-domain questions directly from the provided stats, resources, exports, and record samples when possible. Do not merely point to pages if relevant data is present.",
                "Do not repeat or quote the user question back in the answer.",
                "If the question asks for a write action, refuse that action and suggest a read-only review path.",
                "",
                f"Current section: {context.section_label} ({context.section_key})",
                f"Current path: {context.path}",
                f"Resource key: {context.resource_key or 'none'}",
                f"Scope: {context.scope}",
                f"Intent mode: {context.intent_mode}",
                "",
                "Research service exposure:",
                json.dumps(compact_exposure, ensure_ascii=False, default=str),
                "",
                "User question:",
                message.strip(),
            ]
        )


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

SLASH_REFERENCE_CONFIGS: dict[str, tuple[str, str, str, str]] = {
    "/projects": ("Projects", "/research/projects", "research-projects", "projects"),
    "/grants": ("Grants", "/research/grants", "research-grants", "grants"),
    "/publications": ("Publications", "/research/publications", "research-publications", "publications"),
    "/centers": ("Centers", "/research/centers", "research-centers", "projects"),
    "/reports": ("Reports", "/research/reports", "research-reports", "reports"),
    "/sustainability": ("Sustainability", "/research/sustainability", "research-sustainability", "sustainability"),
}


class ResearchAskAIService:
    """Build safe, read-only advisor context for the research portal."""

    @staticmethod
    async def ask(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        message: str,
        path: str,
        section: str | None,
        resource_key: str | None,
        record_id: str | None = None,
        scope: str = "page",
        intent_mode: str = "summarize",
        request_references: list[dict[str, Any]] | None = None,
        conversation_id: uuid.UUID | None = None,
    ) -> ResearchAskAIResponse:
        effective_references = _merge_reference_payloads(request_references, _slash_reference_payloads(message))
        context = ResearchAskAIService.resolve_context(path, section, resource_key, record_id, scope, intent_mode, effective_references)
        exposure = await ResearchAskAIService.build_service_exposure(db)
        provider_answer = await ResearchAskAIService._generate_provider_answer(
            message=message,
            context=context,
            service_exposure=exposure,
        )
        response = ResearchAskAIService.respond(
            message=message,
            path=path,
            section=section,
            resource_key=resource_key,
            record_id=record_id,
            scope=scope,
            intent_mode=intent_mode,
            request_references=effective_references,
            service_exposure=exposure,
            provider_answer=provider_answer,
        )
        conversation = await ResearchAskAIService._get_or_create_conversation(
            db,
            user_id=user_id,
            conversation_id=conversation_id,
            context=context,
            message=message,
        )
        user_message = ResearchAIMessage(
            conversation_id=conversation.id,
            role="user",
            content=message,
            content_format="markdown",
            context_snapshot=context.model_dump(mode="json"),
            references=[reference.model_dump(mode="json") for reference in context.references],
            message_metadata={"mode": "read_only"},
        )
        assistant_message = ResearchAIMessage(
            conversation_id=conversation.id,
            role="assistant",
            content=response.answer,
            content_format="markdown",
            context_snapshot=context.model_dump(mode="json"),
            references=[reference.model_dump(mode="json") for reference in response.references],
            message_metadata={
                "mode": "read_only",
                "service_exposure_keys": list(exposure.keys()),
                "provider": "gemini" if provider_answer else "deterministic",
            },
        )
        db.add_all([user_message, assistant_message])
        await db.flush()

        response.conversation_id = conversation.id
        response.user_message_id = user_message.id
        response.assistant_message_id = assistant_message.id
        return response

    @staticmethod
    def resolve_context(
        path: str,
        section: str | None,
        resource_key: str | None,
        record_id: str | None = None,
        scope: str = "page",
        intent_mode: str = "summarize",
        request_references: list[dict[str, Any]] | None = None,
    ) -> ResearchAskAIContext:
        normalized_scope = _normalize_scope(scope)
        explicit_references = _request_references(request_references)
        referenced_section = _section_from_reference(explicit_references[0]) if normalized_scope == "page" and len(explicit_references) == 1 else None
        section_key = referenced_section or _normalize_section(section) or _section_from_path(path)
        config = SECTION_CONFIGS.get(section_key) or SECTION_CONFIGS["overview"]
        resolved_resource_key = explicit_references[0].resource_key if referenced_section and explicit_references else resource_key or config.resource_key
        references = _dedupe_references(
            _reference(config.label, config.href, resolved_resource_key, "section"),
            *config.related,
            *explicit_references,
        )

        return ResearchAskAIContext(
            section_key=config.key,
            section_label=config.label,
            path=path or config.href,
            resource_key=resolved_resource_key,
            record_id=record_id,
            scope=normalized_scope,
            intent_mode=_normalize_intent_mode(intent_mode),
            capabilities=[
                "answer read-only research admin questions",
                "answer globally across the research domain while prioritizing page context",
                "ground answers in slash references such as /projects, /grants, and /publications",
                "summarize section context and data quality checks",
                "suggest relevant pages, exports, and report preparation steps",
                "refuse create, update, delete, approval, or publishing actions",
            ],
            guided_prompts=list(config.prompts),
            references=references,
        )

    @staticmethod
    def respond(
        message: str,
        path: str,
        section: str | None,
        resource_key: str | None,
        record_id: str | None = None,
        scope: str = "page",
        intent_mode: str = "summarize",
        request_references: list[dict[str, Any]] | None = None,
        service_exposure: dict | None = None,
        provider_answer: str | None = None,
    ) -> ResearchAskAIResponse:
        effective_references = _merge_reference_payloads(request_references, _slash_reference_payloads(message))
        context = ResearchAskAIService.resolve_context(path, section, resource_key, record_id, scope, intent_mode, effective_references)
        exposure = _sanitize_service_exposure(service_exposure or ResearchAskAIService.service_exposure_catalog())
        answer = provider_answer or ResearchAskAIService._deterministic_answer(
            message=message,
            context=context,
            service_exposure=exposure,
        )

        return ResearchAskAIResponse(
            answer=answer,
            service_exposure=exposure,
            context=context,
            references=context.references,
            suggested_prompts=context.guided_prompts,
        )

    @staticmethod
    def _deterministic_answer(
        *,
        message: str,
        context: ResearchAskAIContext,
        service_exposure: dict,
    ) -> str:
        record_answer = ResearchAskAIService._answer_from_record_samples(message, service_exposure)
        if record_answer:
            return record_answer

        return "\n".join(
            [
                f"## {context.section_label} advisor",
                "",
                "I can help as a **read-only** research advisor across projects, grants, publications, centers, outputs, partners, impact, sustainability, capacity, donations, and research settings.",
                "",
                "### Active grounding",
                f"- Scope: {_scope_description(context.scope)}.",
                f"- Mode: {context.intent_mode.replace('_', ' ')}.",
                f"- References: {_reference_summary(context.references)}.",
                "",
                "### What I can answer from the backend context",
                "- Summaries of research records, portfolio health, funding, publications, outputs, impact, and admin reporting readiness.",
                "- Data-quality gaps such as missing PI, status, dates, public visibility, metadata, or relationship links.",
                "- Which read-only page, export, or record set supports a research question.",
                "",
                "### Section focus",
                f"- {SECTION_CONFIGS[context.section_key].focus}.",
                "",
                "### Backend context available",
                f"- Search/resource areas exposed: {len(service_exposure.get('resources', []))}.",
                f"- Export datasets exposed: {len(service_exposure.get('exports', []))}.",
                f"- Guided prompts available: {len(context.guided_prompts)}.",
                f"- Record sample groups available: {len(service_exposure.get('record_samples', []))}.",
            ]
        )

    @staticmethod
    def _answer_from_record_samples(message: str, service_exposure: dict) -> str | None:
        normalized = message.lower()
        if not any(term in normalized for term in ("project", "projects")):
            return None

        project_group = _record_sample_group(service_exposure, "research-projects")
        records = project_group.get("records", []) if project_group else []
        if not records:
            return None

        index = min(_requested_ordinal_index(normalized), len(records) - 1)
        record = records[index]
        title = _record_title(record, fallback="Selected research project")
        details = _project_detail_lines(record)
        summary = _first_non_empty(record, "summary", "abstract", "description", "objectives")

        lines = [
            f"## {title}",
            "",
            f"This is the {index + 1}{_ordinal_suffix(index + 1)} project in the current research project sample.",
        ]
        if summary:
            lines.extend(["", summary])
        if details:
            lines.extend(["", "### Key details", *details])
        lines.extend(
            [
                "",
                "### Where to review it",
                "- Open **Projects** to inspect the full record, relationships, audit activity, and public visibility.",
            ]
        )
        return "\n".join(lines)

    @staticmethod
    def markdown_chunks(answer: str, chunk_size: int = 96):
        normalized_size = max(1, chunk_size)
        for index in range(0, len(answer), normalized_size):
            yield answer[index : index + normalized_size]

    @staticmethod
    async def _generate_provider_answer(
        *,
        message: str,
        context: ResearchAskAIContext,
        service_exposure: dict,
    ) -> str | None:
        settings = get_settings()
        if settings.ASK_AI_PROVIDER != "gemini":
            return None
        provider = GeminiResearchAIProvider(
            api_key=settings.GEMINI_API_KEY or settings.GOOGLE_API_KEY,
            model=settings.GEMINI_MODEL,
            timeout_seconds=settings.GEMINI_TIMEOUT_SECONDS,
        )
        return await provider.generate_markdown(
            message=message,
            context=context,
            service_exposure=service_exposure,
        )

    @staticmethod
    def service_exposure_catalog() -> dict:
        export_keys = set(EXPORT_RESOURCE_CONFIGS)
        resources = [
            {
                "key": area.key,
                "label": area.label,
                "route": area.route,
                "search_fields": list(area.search_fields),
                "metadata_fields": list(area.metadata_fields),
                "exportable": f"research-{area.key.replace('_', '-')}" in export_keys,
            }
            for area in RESEARCH_SEARCH_AREAS
        ]
        return {
            "mode": "read_only",
            "resources": resources,
            "exports": [
                {
                    "key": config.key,
                    "label": config.label,
                    "columns": list(config.columns),
                    "filename": config.filename,
                }
                for config in EXPORT_RESOURCE_CONFIGS.values()
            ],
            "sections": [
                {
                    "key": config.key,
                    "label": config.label,
                    "href": config.href,
                    "resource_key": config.resource_key,
                    "focus": config.focus,
                }
                for config in SECTION_CONFIGS.values()
            ],
        }

    @staticmethod
    async def build_service_exposure(db: AsyncSession) -> dict:
        exposure = ResearchAskAIService.service_exposure_catalog()
        stats = await admin_research_stats(db)
        exposure["admin_stats"] = [
            {
                "key": item.key,
                "label": item.label,
                "value": item.value,
                "suffix": item.suffix,
                "description": item.description,
                "href": item.href,
            }
            for item in stats.stats
        ]
        exposure["record_samples"] = await ResearchAskAIService._record_samples(db)
        return exposure

    @staticmethod
    async def _record_samples(db: AsyncSession) -> list[dict[str, Any]]:
        priority_keys = (
            "research-projects",
            "research-grants",
            "research-publications",
            "research-centers",
            "research-outputs",
            "research-partners",
            "research-impact-metrics",
            "research-sustainability",
        )
        samples: list[dict[str, Any]] = []
        for key in priority_keys:
            config = EXPORT_RESOURCE_CONFIGS.get(key)
            if config is None:
                continue
            try:
                rows = await ResearchExportService.rows(db, config, limit=5)
            except Exception:
                rows = []
            samples.append(
                {
                    "key": config.key,
                    "label": config.label,
                    "href": _admin_href_for_resource(config.key),
                    "columns": list(config.columns),
                    "records": [_compact_record(row) for row in rows],
                }
            )
        return samples

    @staticmethod
    async def list_conversations(db: AsyncSession, user_id: uuid.UUID) -> list[ResearchAIConversationRead]:
        result = await db.execute(
            select(ResearchAIConversation)
            .where(
                ResearchAIConversation.user_id == user_id,
                ResearchAIConversation.deleted_at.is_(None),
                ResearchAIConversation.is_archived.is_(False),
            )
            .order_by(ResearchAIConversation.updated_at.desc())
        )
        return [ResearchAIConversationRead.model_validate(item) for item in result.scalars().all()]

    @staticmethod
    async def list_messages(db: AsyncSession, user_id: uuid.UUID, conversation_id: uuid.UUID) -> list[ResearchAIMessageRead]:
        conversation = await ResearchAskAIService._get_owned_conversation(db, user_id, conversation_id)
        if conversation is None:
            return []
        result = await db.execute(
            select(ResearchAIMessage)
            .where(
                ResearchAIMessage.conversation_id == conversation.id,
                ResearchAIMessage.deleted_at.is_(None),
            )
            .order_by(ResearchAIMessage.created_at.asc())
        )
        return [
            ResearchAIMessageRead(
                id=item.id,
                conversation_id=item.conversation_id,
                role=item.role,
                content=item.content,
                content_format=item.content_format,
                context_snapshot=item.context_snapshot,
                references=item.references,
                metadata=item.message_metadata,
                created_at=item.created_at,
            )
            for item in result.scalars().all()
        ]

    @staticmethod
    async def _get_or_create_conversation(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        conversation_id: uuid.UUID | None,
        context: ResearchAskAIContext,
        message: str,
    ) -> ResearchAIConversation:
        if conversation_id is not None:
            conversation = await ResearchAskAIService._get_owned_conversation(db, user_id, conversation_id)
            if conversation is not None:
                conversation.context = context.model_dump(mode="json")
                conversation.section_key = context.section_key
                conversation.resource_key = context.resource_key
                conversation.record_id = context.record_id
                return conversation

        title = _conversation_title(message, context.section_label)
        conversation = ResearchAIConversation(
            user_id=user_id,
            title=title,
            section_key=context.section_key,
            resource_key=context.resource_key,
            record_id=context.record_id,
            context=context.model_dump(mode="json"),
        )
        db.add(conversation)
        await db.flush()
        return conversation

    @staticmethod
    async def _get_owned_conversation(db: AsyncSession, user_id: uuid.UUID, conversation_id: uuid.UUID) -> ResearchAIConversation | None:
        result = await db.execute(
            select(ResearchAIConversation).where(
                ResearchAIConversation.id == conversation_id,
                ResearchAIConversation.user_id == user_id,
                ResearchAIConversation.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none()


def _normalize_section(section: str | None) -> str | None:
    if section is None:
        return None
    normalized = section.strip().lower().replace("_", "-")
    return SECTION_ALIASES.get(normalized, normalized)


def _normalize_scope(scope: str | None) -> str:
    normalized = (scope or "page").strip().lower().replace("_", "-")
    if normalized in {"global", "all", "all-research"}:
        return "global"
    if normalized in {"mixed", "page-global", "page-and-global"}:
        return "mixed"
    return "page"


def _normalize_intent_mode(intent_mode: str | None) -> str:
    normalized = (intent_mode or "summarize").strip().lower().replace("-", "_")
    allowed = {"summarize", "find_gaps", "compare", "report", "explain", "navigate", "next_actions"}
    return normalized if normalized in allowed else "summarize"


def _request_references(references: list[dict[str, Any]] | None) -> list[ResearchAskAIReference]:
    normalized: list[ResearchAskAIReference] = []
    for reference in references or []:
        label = str(reference.get("label") or "").strip()
        href = str(reference.get("href") or "").strip()
        if not label or not href.startswith("/research"):
            continue
        normalized.append(
            _reference(
                label=label,
                href=href,
                resource_key=reference.get("resource_key"),
                type=str(reference.get("type") or "resource"),
            )
        )
    return normalized


def _slash_reference_payloads(message: str) -> list[dict[str, Any]]:
    tokens = {match.group(0).lower() for match in re.finditer(r"/[a-z][a-z-]*", message or "")}
    payloads: list[dict[str, Any]] = []
    for token in sorted(tokens):
        config = SLASH_REFERENCE_CONFIGS.get(token)
        if config is None:
            continue
        label, href, resource_key, _section_key = config
        payloads.append(
            {
                "label": label,
                "type": "resource",
                "href": href,
                "resource_key": resource_key,
            }
        )
    return payloads


def _merge_reference_payloads(*groups: list[dict[str, Any]] | None) -> list[dict[str, Any]]:
    seen: set[tuple[Any, Any]] = set()
    merged: list[dict[str, Any]] = []
    for group in groups:
        for reference in group or []:
            key = (reference.get("resource_key"), reference.get("href"))
            if key in seen:
                continue
            seen.add(key)
            merged.append(reference)
    return merged


def _section_from_reference(reference: ResearchAskAIReference) -> str | None:
    for _token, (_label, href, resource_key, section_key) in SLASH_REFERENCE_CONFIGS.items():
        if reference.href == href or (reference.resource_key and reference.resource_key == resource_key):
            return section_key
    return None


def _dedupe_references(*references: ResearchAskAIReference) -> list[ResearchAskAIReference]:
    seen: set[tuple[str | None, str]] = set()
    deduped: list[ResearchAskAIReference] = []
    for reference in references:
        key = (reference.resource_key, reference.href)
        if key in seen:
            continue
        seen.add(key)
        deduped.append(reference)
    return deduped


def _scope_description(scope: str) -> str:
    if scope == "global":
        return "all research domain context"
    if scope == "mixed":
        return "page context and explicit references"
    return "current page context first"


def _reference_summary(references: list[ResearchAskAIReference]) -> str:
    labels = [reference.label for reference in references[:5]]
    return ", ".join(labels) if labels else "current research workspace"


def _section_from_path(path: str) -> str:
    parts = [part for part in (path or "").split("/") if part]
    if not parts or parts[0] != "research":
        return "overview"
    raw = parts[1] if len(parts) > 1 else "overview"
    return SECTION_ALIASES.get(raw, raw if raw in SECTION_CONFIGS else "overview")


def _conversation_title(message: str, section_label: str) -> str:
    normalized = " ".join(message.strip().split())
    if not normalized:
        return f"{section_label} Ask AI"
    return normalized[:80]


def _record_sample_group(service_exposure: dict, key: str) -> dict | None:
    for group in service_exposure.get("record_samples", []):
        if group.get("key") == key:
            return group
    return None


def _requested_ordinal_index(message: str) -> int:
    ordinal_markers = {
        "1st": 0,
        "first": 0,
        "top": 0,
        "2nd": 1,
        "second": 1,
        "3rd": 2,
        "third": 2,
        "4th": 3,
        "fourth": 3,
        "5th": 4,
        "fifth": 4,
    }
    for marker, index in ordinal_markers.items():
        if marker in message:
            return index
    return 0


def _ordinal_suffix(value: int) -> str:
    if 10 <= value % 100 <= 20:
        return "th"
    return {1: "st", 2: "nd", 3: "rd"}.get(value % 10, "th")


def _record_title(record: dict, fallback: str) -> str:
    return str(record.get("title") or record.get("name") or fallback)


def _first_non_empty(record: dict, *keys: str) -> str | None:
    for key in keys:
        value = record.get(key)
        if value not in (None, ""):
            return str(value)
    return None


def _project_detail_lines(record: dict) -> list[str]:
    fields = (
        ("Status", "status"),
        ("Type", "project_type"),
        ("Progress", "progress_percentage"),
        ("Start date", "start_date"),
        ("End date", "end_date"),
        ("Budget", "budget"),
    )
    lines: list[str] = []
    for label, key in fields:
        value = record.get(key)
        if value in (None, ""):
            continue
        if key == "progress_percentage":
            value = f"{value}%"
        if key == "budget":
            value = _format_budget(value, record.get("currency"))
        lines.append(f"- **{label}:** {value}")
    return lines


def _format_budget(value: Any, currency: Any) -> str:
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return str(value)
    prefix = f"{currency} " if currency else ""
    return f"{prefix}{numeric:,.0f}"


def _compact_record(row: dict[str, Any]) -> dict[str, Any]:
    return {
        key: _jsonable_value(value)
        for key, value in row.items()
        if value not in (None, "") and not _is_internal_record_field(key)
    }


def _jsonable_value(value: Any) -> Any:
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, uuid.UUID):
        return str(value)
    return value


def _sanitize_service_exposure(service_exposure: dict) -> dict:
    normalized_exposure = _service_exposure_dict(service_exposure)
    safe_exposure = dict(normalized_exposure)
    safe_exposure["record_samples"] = [
        _sanitize_record_sample_group(group)
        for group in normalized_exposure.get("record_samples", [])
        if isinstance(group, dict)
    ]
    return safe_exposure


def _sanitize_record_sample_group(group: dict[str, Any]) -> dict[str, Any]:
    safe_group = {
        key: value
        for key, value in group.items()
        if key != "records" and not _is_internal_record_field(key)
    }
    safe_group["columns"] = [
        column
        for column in group.get("columns", [])
        if isinstance(column, str) and not _is_internal_record_field(column)
    ]
    safe_group["records"] = [
        _compact_record(record)
        for record in group.get("records", [])
        if isinstance(record, dict)
    ]
    return safe_group


def _service_exposure_dict(service_exposure: Any) -> dict[str, Any]:
    if isinstance(service_exposure, dict):
        return service_exposure
    model_dump = getattr(service_exposure, "model_dump", None)
    if callable(model_dump):
        dumped = model_dump(mode="python")
        if isinstance(dumped, dict):
            return dumped
    return {}


def _is_internal_record_field(key: str) -> bool:
    normalized = key.lower()
    return (
        normalized == "id"
        or normalized.endswith("_id")
        or normalized in {"created_at", "updated_at", "deleted_at", "created_by", "updated_by"}
    )


def _admin_href_for_resource(key: str) -> str:
    mappings = {
        "research-projects": "/research/projects",
        "research-grants": "/research/grants",
        "research-publications": "/research/publications",
        "research-centers": "/research/centers",
        "research-outputs": "/research/outputs",
        "research-partners": "/research/partnerships",
        "research-impact-metrics": "/research/impact",
        "research-sustainability": "/research/sustainability",
    }
    return mappings.get(key, "/research")
