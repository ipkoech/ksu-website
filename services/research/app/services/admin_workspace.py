"""Scoped reads for every registered Research CRUD resource.

Canonical native routes still authorize and execute mutations. The workspace
never calls public list endpoints to obtain private records or guessed totals.
"""
from __future__ import annotations

from decimal import Decimal
from functools import lru_cache

from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from ksu_contracts.rbac import authorize_permission

from ..core.auth import can_access_scoped_record
from .admin_workspace_policy import direct_read_decisions, editorial_actions, merge_read_filters
from .admin_workspace_registry import (RESOURCES, NativeResource, EDITORIAL_RESOURCES,
                                       PATHWAY_RESOURCES, group_for, singular_for)
from .admin_workspace_revision import record_revision
from .admin_workspace_schema import descriptors, stored_descriptors
from .research_actions import can_domain_action, domain_action_filters
from .research_domains import assert_record_in_domain
from .research_workflow import adapter_for, workflow_state

READ_PERMISSIONS = {
    "projects": ("research.view_projects",), "publications": ("publications.view",),
    "centers": ("research.view",), "programs": ("research_program.view",),
    "themes": ("research_theme.view",), "partners": ("partnerships.view",),
}


def resource_spec(key: str) -> NativeResource:
    spec = RESOURCES.get(key)
    if spec is None:
        raise HTTPException(404, "Unsupported Research workspace resource")
    return spec


def read_filters(actor, key: str) -> dict:
    spec = resource_spec(key)
    columns = {column.key for column in spec.service.model.__table__.columns}
    permissions = (*READ_PERMISSIONS.get(key, ()), spec.write_permission)
    decisions = direct_read_decisions(
        actor.raw.get("scope_grants", []) or [], permissions,
        lambda grant, permission: authorize_permission({"scope_grants": [grant]}, permission).allowed,
    )
    # A research-center record is owned by its own id, not a missing center_id.
    if key == "centers":
        decisions = [{"__domain_any__": [{"id": row["center_id"]} for row in decision.get("__domain_any__", [])]}
                     if decision else {} for decision in decisions]
    if key in EDITORIAL_RESOURCES:
        for action in ("view", "submit", "review", "publish"):
            try:
                decisions.append(domain_action_filters(actor, key, action))
            except HTTPException as exc:
                if exc.status_code != 403:
                    raise
    try:
        return merge_read_filters(decisions, columns)
    except PermissionError as exc:
        raise HTTPException(403, "No assigned access to this Research resource") from exc


@lru_cache(maxsize=256)
def field_specs(spec: NativeResource) -> list[dict]:
    adapter = adapter_for(spec.key) if spec.key in EDITORIAL_RESOURCES else None
    excluded = frozenset({adapter.boolean_field, adapter.status_field, "editorial_state"} - {None}) if adapter else frozenset()
    from .. import schemas
    read_name = spec.create_schema.__name__.removesuffix("Create") + "Read"
    read_schema = getattr(schemas, read_name, None)
    return stored_descriptors(spec.create_schema, spec.update_schema, spec.service.model,
                              resource=spec.key, excluded=excluded, read_schema=read_schema)


def title_key(spec: NativeResource) -> str:
    columns = {column.key for column in spec.service.model.__table__.columns}
    return next((key for key in ("title", "name", "project_title", "display_name", "application_number", "code") if key in columns), "id")


@lru_cache(maxsize=64)
def native_commands(key: str) -> list[dict]:
    if key not in PATHWAY_RESOURCES:
        return []
    from .. import schemas
    common = [
        ("approve", "Approve record", "The native innovation action changes this record to its approved state.", "PathwayActionNote"),
        ("publish", "Publish record", "This makes the record available under the service's public visibility rules.", "PathwayActionNote"),
        ("unpublish", "Unpublish record", "Remove this record from public visibility.", "PathwayActionNote"),
        ("archive", "Archive record", "Archive this record using the native innovation pathway action.", "PathwayActionNote"),
        ("feature", "Feature record", "Mark this record as featured.", "PathwayActionNote"),
        ("unfeature", "Remove featured status", "Remove the featured flag.", "PathwayActionNote"),
    ]
    special = {
        "startups": [("stage", "Update venture stage", "Update the native venture and registration fields.", "StartupStageAction")],
        "incubation-records": [("stage", "Update incubation stage", "Update the native incubation stage.", "IncubationStageAction"),
                              ("assign-mentors", "Assign mentors", "Replace the mentor assignment list with the supplied existing person IDs.", "MentorAssignmentAction")],
        "competition-entries": [("entry-status", "Update entry result", "Update entry status, award and position fields.", "CompetitionEntryStatusAction")],
        "technology-transfer-cases": [("transfer-status", "Update transfer status", "Update the native transfer status and case type.", "TechnologyTransferStatusAction")],
    }
    result = []
    for action, label, explanation, schema_name in [*common, *special[key]]:
        schema = getattr(schemas, schema_name)
        result.append({"key": action, "label": label, "description": explanation,
                       "destructive": action in {"archive", "unpublish"},
                       # Native pathway handlers accept but do not persist note.
                       "fields": descriptors(schema, schema, resource=key, excluded=frozenset({"note"}))})
    return result


@lru_cache(maxsize=256)
def filter_fields_for(spec: NativeResource) -> list[str]:
    keys = {field["key"] for field in field_specs(spec) if field["create"] or field["update"]}
    columns = {column.key for column in spec.service.model.__table__.columns}
    return sorted(name for name in keys & columns if name.endswith(("_id", "_type")) or name in {
        "category", "year", "is_active", "is_featured", "is_open_access", "venture_stage", "entry_status", "transfer_status"})


def catalog_for(actor) -> list[dict]:
    result = []
    for key, spec in RESOURCES.items():
        try:
            read_filters(actor, key)
        except HTTPException as exc:
            if exc.status_code == 403:
                continue
            raise
        fields = field_specs(spec)
        columns = {column.key for column in spec.service.model.__table__.columns}
        preferred = ["code", "project_type", "publication_type", "grant_type", "category", "venture_stage",
                     "entry_status", "transfer_status", "status", "deadline", "start_date", "year", "currency"]
        summary = [name for name in preferred if name in columns and name != title_key(spec)][:4]
        if not summary:
            summary = [field["key"] for field in fields if field["key"] in columns and field["key"] != title_key(spec)
                       and field["kind"] not in {"text", "json", "uuid"}][:3]
        adapter = adapter_for(key) if key in EDITORIAL_RESOURCES else None
        defaults = {name: value for name, value in (adapter.hidden_values() if adapter else {}).items()
                    if name in spec.create_schema.model_fields}
        result.append({
            "key": key, "label": spec.label, "singular": singular_for(key, spec.label),
            "group": group_for(key), "workflow": key in EDITORIAL_RESOURCES,
            "description": f"Maintain {spec.label.lower()} using the Research service's native fields and permissions.",
            "can_create": authorize_permission(actor, spec.write_permission).allowed and (
                key != "centers" or can_access_scoped_record(actor, spec.write_permission, "research", None)
            ) and not any(
                field.is_required() and name not in columns
                for name, field in spec.create_schema.model_fields.items()
            ),
            "fields": fields, "create_defaults": defaults, "title_key": title_key(spec),
            "columns": summary,
            "filter_fields": filter_fields_for(spec),
            "commands": native_commands(key),
        })
    return sorted(result, key=lambda item: (item["group"], item["label"]))


def record_actions(actor, key: str, record) -> dict[str, bool]:
    spec = resource_spec(key)
    state = workflow_state(key, record) if key in EDITORIAL_RESOURCES else None
    editable = authorize_permission(actor, spec.write_permission).allowed
    if hasattr(spec.service.model, "center_id"):
        editable = editable and can_access_scoped_record(actor, spec.write_permission, "research", getattr(record, "center_id", None))
    if key == "centers":
        editable = editable and can_access_scoped_record(actor, spec.write_permission, "research", record.id)
    try:
        assert_record_in_domain(actor, key, record)
    except HTTPException as exc:
        if exc.status_code != 403:
            raise
        editable = False
    permissions = {action: key in EDITORIAL_RESOURCES and can_domain_action(actor, key, action, record)
                   for action in ("view", "submit", "review", "publish")}
    actions = editorial_actions(state, edit=editable, submit=permissions["submit"], review=permissions["review"],
                                publish=permissions["publish"], history=any(permissions.values()))
    actions["delete"] = actions["edit"]  # Never offer delete as a publication-workflow bypass.
    return actions


def serialize_record(actor, key: str, record) -> dict:
    spec = resource_spec(key)
    keys = {field["key"] for field in field_specs(spec)}
    keys.update({"id", title_key(spec), "created_at", "updated_at", "status"})
    # Column-only extraction avoids triggering async ORM relationship IO.
    columns = {column.key for column in spec.service.model.__table__.columns}
    values = {name: getattr(record, name) for name in keys & columns}
    actions = record_actions(actor, key, record)
    commands = [item["key"] for item in native_commands(key)] if actions["edit"] else []
    if key in PATHWAY_RESOURCES:
        commands = [item for item in commands if item != ("feature" if getattr(record, "is_featured", False) else "unfeature")]
    return {"id": str(record.id), "revision": record_revision(record), "title": str(getattr(record, title_key(spec), None) or record.id),
            "workflow_state": workflow_state(key, record) if key in EDITORIAL_RESOURCES else None,
            "record": jsonable_encoder(values, custom_encoder={Decimal: str}),
            "actions": actions, "commands": commands}
