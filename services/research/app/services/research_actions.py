"""Bind Research command capabilities to the same grant and owned record."""

from collections.abc import Mapping

from fastapi import HTTPException
from ksu_contracts.rbac import authorize_permission

from .research_domains import DOMAIN_DEFINITIONS, has_global_research_authority


def _value(record, name):
    return record.get(name) if isinstance(record, Mapping) else getattr(record, name, None)


def domain_action_filters(actor, resource: str, action: str) -> dict:
    """SQL ownership alternatives for one action, before counting or paging."""
    if actor is None:
        raise HTTPException(403, "Research assignment required")
    alternatives = []
    oversight = has_global_research_authority(actor)
    for grant in actor.raw.get("scope_grants", []) or []:
        if not isinstance(grant, Mapping):
            continue
        scope_type, scope_id = grant.get("scope_type"), grant.get("scope_id")
        if oversight and authorize_permission({"scope_grants": [grant]}, f"research.{action}").allowed:
            if scope_type in {"global", "university"}:
                return {}
            if scope_type == "research" and scope_id is not None:
                alternatives.append({"center_id": str(scope_id)})
        for domain in DOMAIN_DEFINITIONS.values():
            filters = domain.resource_filters.get(resource)
            if filters is None or not authorize_permission(grant.get("permissions", []), f"{domain.namespace}.{action}").allowed:
                continue
            same_scope = scope_type in {"global", "university"}
            same_scope |= scope_type == "research_domain" and scope_id == domain.key
            if same_scope:
                alternatives.append(dict(filters))
            elif scope_type == "research" and scope_id is not None:
                alternatives.append({**filters, "center_id": str(scope_id)})
    if not alternatives:
        raise HTTPException(403, f"{action} authority is required for this Research resource")
    if {} in alternatives:
        return {}
    return {"__domain_any__": alternatives}


def can_domain_action(actor, resource: str, action: str, record) -> bool:
    try:
        filters = domain_action_filters(actor, resource, action)
    except HTTPException:
        return False
    return not filters or any(all(str(_value(record, name)) == str(value)
                                  for name, value in alternative.items())
                              for alternative in filters["__domain_any__"])


def require_domain_action(actor, resource: str, action: str, record) -> None:
    if not can_domain_action(actor, resource, action, record):
        raise HTTPException(403, f"{action} authority is required for this Research record")
