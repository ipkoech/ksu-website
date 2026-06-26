"""Research support services."""

from __future__ import annotations

from ..models import BoardMember, ResearchBoard, ResearchGuideline, ResearchOffice, ResearchResource, ResearchService
from ._crud import build_simple_service

OfficeService = build_simple_service(
    ResearchOffice,
    "name",
    "code",
    "about",
    "mandate",
    "objectives",
    "services_summary",
    reference_fields={"department_id": "departments", "director_id": "persons"},
)
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
BoardService = build_simple_service(
    ResearchBoard,
    "name",
    "code",
    "about",
    "mandate",
    "board_type",
    reference_fields={"chair_id": "persons"},
)
BoardMemberService = build_simple_service(BoardMember, "name", "affiliation", "role", reference_fields={"person_id": "persons"})
