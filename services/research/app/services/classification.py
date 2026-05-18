"""Classification services."""

from __future__ import annotations

from ..models import ExpertiseTag, FocusArea, ResearchTheme
from ._crud import build_simple_service

ThemeService = build_simple_service(ResearchTheme, "name", "code", "description", "objectives")
FocusAreaService = build_simple_service(FocusArea, "name", "code", "description", "key_questions")
TagService = build_simple_service(ExpertiseTag, "name", "category", "description")

