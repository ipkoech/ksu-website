"""Scope-checked adapters for native Research associations and child records.

No new business tables. The allowlist names existing relationship services and
schemas; visibility and signed grants are checked again inside every command.
"""
from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Any
from uuid import UUID

from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from ksu_contracts.assurance import require_operation_assurance
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import lazyload

from .admin_workspace import read_filters, record_actions, resource_spec
from .admin_workspace_revision import record_revision
from .admin_workspace_schema import apply_column_constraints, descriptors


@dataclass(frozen=True)
class Association:
    source: str
    target: str
    service: str
    action: str
    # Only this native relation accepts link attributes.
    schema: str | None = None
    # A collection backed by a target FK also changes the target record.
    assignment: str | None = None


ASSOCIATIONS = (
    Association("projects", "partners", "ProjectRelationshipService", "partner"),
    Association("projects", "funders", "ProjectRelationshipService", "funder"),
    Association("projects", "focus-areas", "ProjectRelationshipService", "focus_area"),
    Association("themes", "projects", "ThemeRelationshipService", "project"),
    Association("themes", "programs", "ThemeRelationshipService", "program"),
    Association("themes", "publications", "ThemeRelationshipService", "publication"),
    Association("themes", "grants", "ThemeRelationshipService", "grant"),
    Association("grants", "themes", "GrantRelationshipService", "theme"),
    Association("programs", "themes", "ProgramRelationshipService", "theme"),
    Association("centers", "partners", "CenterRelationshipService", "partner", "CenterPartnerLink"),
    Association("centers", "focus-areas", "CenterRelationshipService", "focus_area"),
    Association("farms", "projects", "FarmRelationshipService", "project", assignment="farm_id"),
    Association("sustainability", "projects", "SustainabilityRelationshipService", "project"),
    Association("sustainability", "partners", "SustainabilityRelationshipService", "partner"),
    Association("sustainability", "training", "SustainabilityRelationshipService", "training"),
    Association("sustainability", "stories", "SustainabilityRelationshipService", "story"),
)


@dataclass(frozen=True)
class ChildCollection:
    parent: str
    key: str
    label: str
    service: str
    create_schema: str
    update_schema: str
    parent_field: str


CHILDREN = (
    ChildCollection("projects", "team", "Project team", "ProjectTeamMemberService",
                    "ProjectTeamMemberCreate", "ProjectTeamMemberUpdate", "project_id"),
    ChildCollection("centers", "team", "Center team", "CenterTeamMemberService",
                    "CenterTeamMemberCreate", "CenterTeamMemberUpdate", "center_id"),
    ChildCollection("publications", "authors", "Publication authors", "PublicationAuthorService",
                    "PublicationAuthorCreate", "PublicationAuthorUpdate", "publication_id"),
    ChildCollection("journals", "editorial-board", "Editorial board members", "EditorialBoardService",
                    "EditorialBoardMemberCreate", "EditorialBoardMemberUpdate", "journal_id"),
)


def association(source: str, target: str) -> Association:
    result = next((item for item in ASSOCIATIONS if (item.source, item.target) == (source, target)), None)
    if result is None:
        raise HTTPException(404, "Unsupported research relationship")
    return result


def child_collection(parent: str, key: str) -> ChildCollection:
    result = next((item for item in CHILDREN if (item.parent, item.key) == (parent, key)), None)
    if result is None:
        raise HTTPException(404, "Unsupported child collection")
    return result


def native_service(name: str):
    # Lazy import avoids the existing service barrel's registration cycle.
    from .. import services
    result = getattr(services, name, None)
    if result is None:
        raise HTTPException(503, "The native relationship service is unavailable")
    return result


def native_schema(name: str):
    from .. import schemas
    result = getattr(schemas, name, None)
    if result is None:
        raise HTTPException(503, "The native child schema is unavailable")
    return result


def relationship_attribute(item: Association):
    """Resolve native association/FK columns even without an ORM relationship.

    Only allowlisted native actions can use this metadata lookup. An ambiguous
    table is an integration error, never a reason to pick a likely column.
    """
    source = resource_spec(item.source).service.model.__table__
    target = resource_spec(item.target).service.model.__table__
    if item.assignment:
        column = target.c.get(item.assignment)
        if column is None or not any(fk.column.table is source and fk.column.key == "id"
                                     for fk in column.foreign_keys):
            raise HTTPException(503, "The native parent assignment is unavailable")
        return None, column, target.c.id
    from .. import models
    table_names = {
        ("projects", "partners"): "project_partners", ("projects", "funders"): "project_funders",
        ("projects", "focus-areas"): "project_focus_areas", ("themes", "projects"): "project_themes",
        ("themes", "programs"): "program_themes", ("themes", "publications"): "publication_themes",
        ("themes", "grants"): "grant_themes", ("grants", "themes"): "grant_themes",
        ("programs", "themes"): "program_themes", ("centers", "partners"): "center_partners",
        ("centers", "focus-areas"): "center_focus_areas",
        ("sustainability", "projects"): "sustainability_projects", ("sustainability", "partners"): "sustainability_partners",
        ("sustainability", "training"): "sustainability_training", ("sustainability", "stories"): "sustainability_stories",
    }
    name = table_names.get((item.source, item.target))
    native_table = getattr(models, name, None) if name else None
    if native_table is None:
        raise HTTPException(503, "The registered native association table is unavailable")
    candidates = []
    for table in (native_table,):
        if table is source or table is target:
            continue
        source_keys = [fk.parent for fk in table.foreign_keys
                       if fk.column.table is source and fk.column.key == "id"]
        target_keys = [fk.parent for fk in table.foreign_keys
                       if fk.column.table is target and fk.column.key == "id"]
        if len(source_keys) == len(target_keys) == 1 and source_keys[0] is not target_keys[0]:
            candidates.append((table, source_keys[0], target_keys[0]))
    if len(candidates) != 1:
        raise HTTPException(503, "The native association table is ambiguous or unavailable")
    return candidates[0]


async def load_record(db, user, resource: str, item_id: UUID, *, write: bool = False,
                      lock: bool = False):
    spec = resource_spec(resource)
    query = spec.service._apply_filters(spec.service.model.active_query().options(lazyload("*")), read_filters(user, resource))
    query = query.where(spec.service.model.id == item_id)
    if lock:
        query = query.with_for_update().execution_options(populate_existing=True)
    record = await db.scalar(query)
    if record is None:
        raise HTTPException(404, "Record not found in your assigned workspace")
    if write:
        if not record_actions(user, resource, record)["edit"]:
            raise HTTPException(403, "Editing this record is not permitted in its current state and assignment")
        require_operation_assurance(user, spec.write_permission)
    return record


async def lock_pair(db, user, item: Association, source_id: UUID, target_id: UUID):
    # Reciprocal routes acquire rows in the same order to avoid lock inversion.
    pairs = [(item.source, source_id, True), (item.target, target_id, bool(item.assignment))]
    records = {}
    for resource, identifier, editable in sorted(pairs, key=lambda pair: (pair[0], str(pair[1]))):
        records[resource] = await load_record(db, user, resource, identifier, write=editable, lock=True)
    return records[item.source], records[item.target]


def validate_values(schema, values: dict, *, forced: dict | None = None, model=None):
    """Keep legacy Pydantic extra='ignore' from silently discarding form input."""
    forced = forced or {}
    unknown = set(values) - (set(schema.model_fields) - set(forced))
    if unknown:
        raise HTTPException(422, "Unsupported or server-owned input fields")
    try:
        parsed = schema.model_validate({**values, **forced})
    except ValidationError as exc:
        # Do not echo sensitive input values into error responses.
        errors = [{"loc": ["body", "values", *error["loc"]], "msg": error["msg"], "type": error["type"]}
                  for error in exc.errors(include_input=False, include_context=False)]
        raise HTTPException(422, detail=errors) from exc
    if model is not None:
        columns = {column.key: column for column in getattr(model, "__table__", model).columns}
        for name, value in parsed.model_dump(exclude_unset=True).items():
            column = columns.get(name)
            if column is None:
                continue
            if value is None and not column.nullable:
                raise HTTPException(422, detail=[{"loc": ["body", "values", name], "msg": "This stored field cannot be empty", "type": "value_error"}])
            length = getattr(column.type, "length", None)
            if isinstance(value, str) and isinstance(length, int) and len(value) > length:
                raise HTTPException(422, detail=[{"loc": ["body", "values", name], "msg": f"Use at most {length} characters", "type": "value_error"}])
    return parsed


def association_fields(item: Association) -> list[dict]:
    if not item.schema:
        return []
    schema = native_schema(item.schema)
    fields = descriptors(schema, schema, resource=item.source)
    table, _, _ = relationship_attribute(item)
    for field in fields:
        column = table.c.get(field["key"])
        if column is not None:
            apply_column_constraints(field, column)
    return fields


def collection_module(item: ChildCollection, *, editable: bool) -> dict:
    service = native_service(item.service)
    fields = descriptors(native_schema(item.create_schema), native_schema(item.update_schema),
                         resource=item.parent, excluded=frozenset({item.parent_field}))
    columns = {column.key: column for column in service.model.__table__.columns}
    for field in fields:
        column = columns.get(field["key"])
        if column is not None:
            apply_column_constraints(field, column)
    return {"key": f"{item.parent}-{item.key}", "label": item.label,
            "singular": "team member" if item.key == "team" else "author" if item.key == "authors" else "editorial board member",
            "workflow": False, "can_create": editable, "fields": fields,
            "title_key": "title" if item.key == "team" else "name", "columns": ["role", "person_id"] if item.key == "team" else ["affiliation"], "filter_fields": [],
            "create_defaults": {}, "commands": [], "group": "People and attribution"}


def child_row(item: ChildCollection, record, *, editable: bool) -> dict:
    module = collection_module(item, editable=editable)
    columns = {column.key for column in native_service(item.service).model.__table__.columns}
    keys = {field["key"] for field in module["fields"]} | {"id", "created_at", "updated_at"}
    values = jsonable_encoder({name: getattr(record, name) for name in keys & columns}, custom_encoder={Decimal: str})
    return {"id": str(record.id), "revision": record_revision(record), "title": str(getattr(record, "name", None) or getattr(record, "title", None) or getattr(record, "person_id", None) or record.id),
            "workflow_state": None, "record": values,
            "actions": {key: editable if key in {"edit", "delete"} else False
                        for key in ("edit", "delete", "submit", "approve", "reject", "unpublish", "history")},
            "commands": []}


async def linked_query(user, item: Association, source_id: UUID):
    target_spec = resource_spec(item.target)
    target = target_spec.service.model
    _, source_column, target_column = relationship_attribute(item)
    ids = select(target_column).where(source_column == source_id)
    return target_spec.service._apply_filters(target.active_query().options(lazyload("*")), read_filters(user, item.target)).where(target.id.in_(ids))


async def mutate_association(db, user, item: Association, source_id: UUID, target_id: UUID,
                             *, link: bool, values: dict):
    source, target = await lock_pair(db, user, item, source_id, target_id)
    relationship_attribute(item)  # Refuse drift before running any command.
    if item.assignment:
        assigned = getattr(target, item.assignment, None)
        if assigned is not None and str(assigned) != str(source.id):
            raise HTTPException(409, "Unlink the record from its current parent before assigning it here")
        if not link and str(assigned) != str(source.id):
            raise HTTPException(409, "The target is no longer assigned to this parent")
    method = getattr(native_service(item.service), f"{'add' if link else 'remove'}_{item.action}", None)
    if method is None:
        raise HTTPException(503, "The native relationship command is unavailable")
    if values and (not link or not item.schema):
        raise HTTPException(422, "This relationship does not accept link attributes")
    args: list[Any] = [db, source_id, target_id]
    if link and item.schema:
        parsed = validate_values(native_schema(item.schema), values, model=relationship_attribute(item)[0])
        args.append(parsed.model_dump(exclude_unset=True))
    await method(*args)
    await db.flush()
    return {"source_id": str(source_id), "target_id": str(target_id), "linked": link}


async def validate_child_change(db, item: ChildCollection, parent, values: dict, *, record=None, deleting=False):
    """Keep team membership consistent with the canonical project PI field.

    Parent rows are locked by the caller. This also serializes duplicate-member
    checks within these adapters; database constraints remain authoritative.
    """
    if item.key != "team":
        return
    if item.parent == "projects":
        is_pi = record is not None and getattr(parent, "pi_id", None) is not None and str(record.person_id) == str(parent.pi_id)
        if is_pi and (deleting or ("role" in values and values["role"] != "pi") or values.get("is_active") is False):
            raise HTTPException(409, "Change the project's principal investigator on the project form before changing this assignment")
        if str(values.get("role") or "").lower() == "pi" and not is_pi:
            raise HTTPException(409, "Assign the principal investigator through the project's principal investigator field")
    if record is None and values.get("person_id") is not None:
        model = native_service(item.service).model
        existing = await db.scalar(model.active_query().where(getattr(model, item.parent_field) == parent.id,
                                                              model.person_id == values["person_id"]))
        if existing is not None:
            raise HTTPException(409, "This person already has a team assignment; edit the existing membership")
