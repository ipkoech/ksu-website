"""Research support services."""

from __future__ import annotations

from ..models import BoardMember, ResearchBoard, ResearchGuideline, ResearchResource, ResearchService
from ._crud import build_simple_service

ResourceService = build_simple_service(ResearchResource, "name", "code", "description", "category", "resource_type")
SupportService = build_simple_service(ResearchService, "name", "code", "summary", "description", "category", "service_type")
GuidelineService = build_simple_service(ResearchGuideline, "title", "code", "summary", "content", "category")
BoardService = build_simple_service(ResearchBoard, "name", "code", "about", "mandate", "board_type")
BoardMemberService = build_simple_service(BoardMember, "name", "affiliation", "role")

