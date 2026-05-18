"""Core research services."""

from __future__ import annotations

from ..models import CenterTeamMember, ProjectTeamMember, ResearchCenter, ResearchFarm, ResearchProgram, ResearchProject
from ._crud import build_simple_service

CenterService = build_simple_service(ResearchCenter, "name", "code", "acronym", "about", "location")
FarmService = build_simple_service(ResearchFarm, "name", "code", "about", "location", "county")
ProgramService = build_simple_service(ResearchProgram, "name", "code", "summary", "description", "status")
ProjectService = build_simple_service(ResearchProject, "title", "code", "summary", "abstract", "status")
ProjectTeamMemberService = build_simple_service(ProjectTeamMember, "role")
CenterTeamMemberService = build_simple_service(CenterTeamMember, "role")

