"""Bounded payloads for aggregated public search."""

from __future__ import annotations

from .academic import DepartmentSnapshot, SchoolSnapshot
from .base import BaseSchema
from .content import AnnouncementSnapshot, BlogSnapshot, EventSnapshot, NewsSnapshot
from .person import PersonSnapshot


class SearchResultsRead(BaseSchema):
    news: list[NewsSnapshot] = []
    blogs: list[BlogSnapshot] = []
    announcements: list[AnnouncementSnapshot] = []
    events: list[EventSnapshot] = []
    persons: list[PersonSnapshot] = []
    schools: list[SchoolSnapshot] = []
    departments: list[DepartmentSnapshot] = []


class SearchResponse(BaseSchema):
    query: str
    results: SearchResultsRead


__all__ = ["SearchResponse", "SearchResultsRead"]
