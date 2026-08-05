"""Research support services."""

from __future__ import annotations

from ..models import ResearchGuideline, ResearchResource, ResearchService
from ._crud import build_simple_service

ResourceService = build_simple_service(
    ResearchResource,
    "name",
    "code",
    "description",
    "category",
    "resource_type",
    reference_fields={"department_id": "departments", "manager_id": "persons"},
)
SupportService = build_simple_service(
    ResearchService,
    "name",
    "code",
    "summary",
    "description",
    "category",
    "service_type",
    reference_fields={"department_id": "departments"},
)
GuidelineService = build_simple_service(ResearchGuideline, "title", "code", "summary", "content", "category")
