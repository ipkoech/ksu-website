"""Research portal domain scoping.

The Research Portal is divided into domains (farm, sustainability, core) that
map onto *shared* tables rather than dedicated ones. A "farm project" is a row
in ``research_projects`` whose ``project_type`` is ``action``; a "farm partner"
is a row in ``partners`` whose ``partner_type`` is ``community``.

That convention previously lived only in frontend query parameters, which meant
a farm manager holding ``farm.manage`` could reach every project in the service
by simply omitting the filter. This module moves the convention server-side:

* :data:`DOMAIN_DEFINITIONS` is the one place the filters are declared.
* :func:`resolve_domain_filters` turns a caller's permissions into the filters
  the service must apply, so a domain-only caller can never widen their view.
* :func:`assert_record_in_domain` refuses writes that would move a record out of
  the caller's domain (e.g. flipping ``project_type`` away from ``action``).

Callers holding a global research permission are unrestricted; the filters only
bind users whose authority comes solely from a domain namespace.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Mapping

from fastapi import HTTPException, status
from ksu_common.auth import TokenPayload
from ksu_contracts.rbac import AuthorizationScope, authorize_permission

FARM_DOMAIN = "farm"
SUSTAINABILITY_DOMAIN = "sustainability"
INNOVATION_DOMAIN = "innovation"

#: Permissions that grant unrestricted, cross-domain research authority. A
#: caller holding any of these is never narrowed by a domain filter.
GLOBAL_RESEARCH_PERMISSIONS: tuple[str, ...] = (
    "research.oversight",
)


@dataclass(frozen=True)
class DomainDefinition:
    """How one portal domain narrows the shared research tables."""

    key: str
    #: Permission prefix owned by this domain (``farm`` -> ``farm.view`` ...).
    namespace: str
    #: ``{resource_key: {column: value}}`` filters applied to list queries and
    #: enforced on writes. A resource absent from this map is not reachable by
    #: a domain-only caller.
    resource_filters: Mapping[str, Mapping[str, Any]] = field(default_factory=dict)

    def view_permission(self) -> str:
        return f"{self.namespace}.view"

    def manage_permission(self) -> str:
        return f"{self.namespace}.manage"

    def publish_permission(self) -> str:
        return f"{self.namespace}.publish"


#: The canonical definition of every portal domain. These filters MUST stay in
#: step with the public research site's data layer
#: (``apps/research/src/lib/research-public-data.ts``) — a record the portal
#: files under a domain but the public site filters out is invisible to the
#: very manager who created it.
#:
#: An empty mapping means "this resource is wholly owned by the domain" (its
#: table serves no other portal section), so no narrowing column is needed.
DOMAIN_DEFINITIONS: Mapping[str, DomainDefinition] = {
    INNOVATION_DOMAIN: DomainDefinition(
        key=INNOVATION_DOMAIN, namespace="innovation",
        resource_filters={"innovations": {}, "startups": {},
                          "incubation": {}, "competitions": {}, "transfers": {}},
    ),
    FARM_DOMAIN: DomainDefinition(
        key=FARM_DOMAIN,
        namespace="farm",
        resource_filters={
            # research_farms is farm-only; no discriminating column needed.
            "farms": {},
            "projects": {"project_type": "action"},
            "partners": {"partner_type": "community"},
            "events": {"event_type": "workshop"},
            "stories": {"story_type": "farm"},
            # focus_areas is currently unfiltered on both admin and public
            # sides; it stays open until a farm discriminator is agreed.
            "focus-areas": {},
        },
    ),
    SUSTAINABILITY_DOMAIN: DomainDefinition(
        key=SUSTAINABILITY_DOMAIN,
        namespace="sustainability",
        resource_filters={
            # sustainabilities is sustainability-only.
            "sustainability": {},
            "partners": {"partner_type": "sustainability"},
            "events": {"event_type": "sustainability"},
            "stories": {"story_type": "sustainability"},
            "impact-metrics": {},
        },
    ),
}


def _has(user: TokenPayload | None, permission: str) -> bool:
    if user is None:
        return False
    return authorize_permission(user, permission).allowed


def has_global_research_authority(user: TokenPayload | None) -> bool:
    """Return True when the caller may act across every research domain."""
    return user is not None and any(
        authorize_permission(user, permission, AuthorizationScope("research")).allowed
        for permission in GLOBAL_RESEARCH_PERMISSIONS
    )


def caller_domains(user: TokenPayload | None) -> list[str]:
    """Return the domains whose namespace this caller holds view rights in."""
    return [
        definition.key
        for definition in DOMAIN_DEFINITIONS.values()
        if any(_has(user, permission) for permission in (
            definition.view_permission(), definition.manage_permission(),
            definition.publish_permission(), f"{definition.namespace}.review",
            f"{definition.namespace}.submit",
            *(["innovation.manage_startups", "innovation.manage_competitions",
               "innovation.manage_transfers", "innovation.review_disclosure"]
              if definition.key == INNOVATION_DOMAIN else []),
        ))
    ]


def resolve_domain_filters(
    user: TokenPayload | None,
    resource_key: str,
) -> dict[str, Any]:
    """Return filters that must be applied to ``resource_key`` for this caller.

    An empty dict means explicit oversight or a table wholly owned by an
    assigned domain. Missing authority denies. Multiple slices use SQL OR.
    """
    if has_global_research_authority(user):
        return {}

    # Export identifiers use the public ``research-*`` prefix while domain
    # ownership definitions use the underlying resource key.
    resource_key = resource_key.removeprefix("research-")

    # A Research-wide assignment is distinct from domain assignments. Preserve
    # an explicitly selected center when the grant is center-scoped; never infer
    # this authority from an unrelated management permission.
    for grant in (user.raw.get("scope_grants", []) if user is not None else []) or []:
        if not isinstance(grant, Mapping) or grant.get("scope_type") != "research":
            continue
        if not any(authorize_permission(grant.get("permissions", []), permission).allowed
                   for permission in ("research.view", "research.manage_reports", "research.manage_projects")):
            continue
        if grant.get("scope_id"):
            return {"center_id": str(grant["scope_id"])}
        return {}

    domains = caller_domains(user)
    if not domains:
        raise HTTPException(status_code=403, detail="An explicit Research domain or oversight assignment is required")

    definitions = [DOMAIN_DEFINITIONS[key] for key in domains]
    owning = [
        definition
        for definition in definitions
        if resource_key in definition.resource_filters
    ]
    if not owning:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "This resource is outside your "
                f"{' / '.join(definition.key for definition in definitions)} workspace"
            ),
        )

    # Preserve each complete ownership predicate as an alternative. Intersecting
    # discriminator dictionaries would remove every restriction when values differ.
    if len(owning) == 1:
        return dict(owning[0].resource_filters[resource_key])

    return {"__domain_any__": [dict(definition.resource_filters[resource_key])
                               for definition in owning]}


def assert_record_in_domain(
    user: TokenPayload | None,
    resource_key: str,
    payload: Mapping[str, Any] | Any,
) -> None:
    """Reject a write that would place a record outside the caller's domain.

    ``payload`` may be a mapping or a Pydantic model; only fields explicitly
    supplied are checked, so a partial update that leaves the discriminating
    column untouched is allowed through.
    """
    filters = resolve_domain_filters(user, resource_key)
    if not filters:
        return

    if hasattr(payload, "model_dump"):
        values = payload.model_dump(exclude_unset=True)
    elif isinstance(payload, Mapping):
        values = dict(payload)
    else:
        values = {
            key: getattr(payload, key)
            for key in filters
            if hasattr(payload, key)
        }

    alternatives = filters.get("__domain_any__", [filters])
    if not isinstance(payload, Mapping) and not hasattr(payload, "model_dump"):
        values = {key: getattr(payload, key)
                  for alternative in alternatives for key in alternative if hasattr(payload, key)}
    if not any(all(key not in values or values[key] == required
                   for key, required in alternative.items())
               for alternative in alternatives):
        raise HTTPException(403, "Record is outside your assigned Research domains")


def stamp_domain_defaults(
    user: TokenPayload | None,
    resource_key: str,
    payload: Any,
) -> Any:
    """Apply the domain's discriminating columns to a create payload.

    A farm manager creating a project should not have to know that "farm
    project" means ``project_type='action'`` — the server stamps it, which also
    guarantees the record shows up in their own list afterwards.
    """
    filters = resolve_domain_filters(user, resource_key)
    if not filters:
        return payload

    if "__domain_any__" in filters:
        # The client must identify which authorized domain owns a new record.
        return payload

    for column, value in filters.items():
        if hasattr(payload, column) and getattr(payload, column, None) is None:
            try:
                setattr(payload, column, value)
            except (AttributeError, ValueError):  # frozen or validated models
                continue
    return payload


__all__ = [
    "DOMAIN_DEFINITIONS",
    "FARM_DOMAIN",
    "GLOBAL_RESEARCH_PERMISSIONS",
    "SUSTAINABILITY_DOMAIN",
    "DomainDefinition",
    "assert_record_in_domain",
    "caller_domains",
    "has_global_research_authority",
    "resolve_domain_filters",
    "stamp_domain_defaults",
]
