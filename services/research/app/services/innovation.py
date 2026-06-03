"""Innovation services."""

from __future__ import annotations

from ..models import Innovation, ResearchOutput
from ._crud import build_simple_service

InnovationService = build_simple_service(
    Innovation,
    "title",
    "code",
    "summary",
    "description",
    "innovation_type",
    "category",
    reference_fields={"lead_inventor_id": "persons"},
)
OutputService = build_simple_service(
    ResearchOutput,
    "title",
    "summary",
    "description",
    "output_type",
    "doi",
)
