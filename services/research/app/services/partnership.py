"""Partnership services."""

from __future__ import annotations

from ..models import Consultancy, Partner
from ._crud import build_simple_service

PartnerService = build_simple_service(Partner, "name", "acronym", "about", "country", "partner_type")
ConsultancyService = build_simple_service(Consultancy, "title", "code", "client_name", "summary", "consultancy_type")

