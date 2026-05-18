"""Research content services."""

from __future__ import annotations

from ..models import ResearchArticle, ResearchEvent, ResearchNews, ResearchSlider
from ._crud import build_simple_service

NewsService = build_simple_service(ResearchNews, "title", "summary", "content", "author_name", "category")
ArticleService = build_simple_service(ResearchArticle, "title", "summary", "content", "author_name", "category")
EventService = build_simple_service(ResearchEvent, "title", "summary", "description", "organizer_name", "event_type", default_order=("start_date", "display_order", "created_at"))
SliderService = build_simple_service(ResearchSlider, "title", "subtitle", "description", "placement", default_order=("display_order", "created_at"))

