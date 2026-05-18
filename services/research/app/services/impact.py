"""Impact services."""

from __future__ import annotations

from ..models import ImpactMetric, SuccessStory, Sustainability
from ._crud import build_simple_service

StoryService = build_simple_service(SuccessStory, "title", "summary", "impact", "story_type", "location")
MetricService = build_simple_service(ImpactMetric, "name", "code", "description", "category", "metric_type")
SustainabilityService = build_simple_service(Sustainability, "name", "code", "summary", "description", "initiative_type")

