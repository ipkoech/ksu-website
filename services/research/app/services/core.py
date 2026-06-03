"""Core research services."""

from __future__ import annotations

from ..models import CenterTeamMember, ProjectTeamMember, ResearchCenter, ResearchFarm, ResearchProgram, ResearchProject
from ._crud import build_simple_service

CenterService = build_simple_service(
    ResearchCenter,
    "name",
    "code",
    "acronym",
    "about",
    "location",
    reference_fields={"school_id": "schools", "department_id": "departments", "director_id": "persons"},
)
FarmService = build_simple_service(ResearchFarm, "name", "code", "about", "location", "county")
ProgramService = build_simple_service(
    ResearchProgram,
    "name",
    "code",
    "summary",
    "description",
    "status",
    reference_fields={"lead_id": "persons"},
)
ProjectService = build_simple_service(
    ResearchProject,
    "title",
    "code",
    "summary",
    "abstract",
    "status",
    reference_fields={"pi_id": "persons"},
)
ProjectTeamMemberService = build_simple_service(ProjectTeamMember, "role", reference_fields={"person_id": "persons"})
CenterTeamMemberService = build_simple_service(CenterTeamMember, "role", reference_fields={"person_id": "persons"})
