"""Convert native Pydantic fields into accessible form descriptors.

Both create and update constraints travel to the browser. JSON, enum, nullable
boolean and decimal fields are kept distinct. Nested validation remains native
Pydantic's responsibility; no arbitrary JSON is cast into a scalar input.
"""
from __future__ import annotations

from decimal import Decimal
from typing import Any, get_args

from fastapi.encoders import jsonable_encoder

from .admin_workspace_registry import reference_for

IDENTITY = {"title", "name", "display_name", "project_title", "slug", "code", "acronym", "abbreviation"}
LONG_TEXT = {"summary", "abstract", "about", "description", "background", "objectives", "methodology",
             "expected_outcomes", "impact", "deliverables", "eligibility", "requirements", "focus_areas",
             "funding_acknowledgment", "mission", "vision", "mandate", "research_areas", "content", "notes",
             "comments", "strengths", "weaknesses", "work_plan", "timeline", "achievements", "activities",
             "challenges", "lessons_learned", "next_steps", "purpose", "use_guidelines", "bio"}
MONEY_WORDS = {"budget", "amount", "award", "value", "balance", "expenditure", "distribution", "fee", "cost"}
LABELS = {"pi_id": "Principal investigator", "doi": "DOI", "pmid": "PubMed ID", "arxiv_id": "arXiv ID",
          "issn": "ISSN", "isbn": "ISBN", "url": "Website URL", "pdf_url": "PDF URL",
          "progress_percentage": "Progress (%)", "is_open_access": "Open access"}


def section_for(key: str) -> str:
    if key in IDENTITY or key.endswith("_type") or key in {"category", "status", "stage", "venture_stage"}:
        return "Identity and classification"
    if key.endswith("_id") and not any(word in key for word in ("image", "logo", "document", "media")):
        return "Ownership and research links"
    if any(word in key for word in ("media", "gallery", "document", "attachment", "cover_image", "logo")):
        return "Documents and media"
    if key.startswith("meta_") or key in {"keywords", "display_order", "is_featured", "is_active", "is_public"}:
        return "Discovery and visibility"
    if any(word in key.split("_") for word in MONEY_WORDS) or key == "currency":
        return "Funding and resources"
    if any(word in key for word in ("date", "deadline", "duration", "period", "_at")):
        return "Dates and schedule"
    if any(word in key for word in ("email", "phone", "address", "location", "website", "contact", "country")):
        return "Contact and location"
    return "Details and narrative"


def _resolve(prop: dict, schema: dict) -> dict:
    ref = prop.get("$ref", "")
    if ref.startswith("#/$defs/"):
        return {**schema.get("$defs", {}).get(ref.rsplit("/", 1)[1], {}), **{k: v for k, v in prop.items() if k != "$ref"}}
    return prop


def _variants(prop: dict, schema: dict) -> list[dict]:
    return [_resolve(item, schema) for item in prop.get("anyOf", prop.get("oneOf", [prop]))]


def _decimal(annotation: Any) -> bool:
    return annotation is Decimal or any(_decimal(part) for part in get_args(annotation))


def descriptors(create_schema: Any, update_schema: Any, *, resource: str,
                excluded: frozenset[str] = frozenset()) -> list[dict]:
    create, update = create_schema.model_json_schema(), update_schema.model_json_schema()
    cp, up = create.get("properties", {}), update.get("properties", {})
    result = []
    for key in dict.fromkeys([*cp, *up]):
        if key in excluded:
            continue
        prop = _resolve(cp.get(key, up.get(key, {})), create if key in cp else update)
        variants = _variants(prop, create if key in cp else update)
        scalar = next((item for item in variants if item.get("type") != "null"), {})
        annotation = (create_schema.model_fields.get(key) or update_schema.model_fields[key]).annotation
        kind = scalar.get("format") or scalar.get("type", "string")
        types = {item.get("type") for item in variants if item.get("type") != "null"}
        if _decimal(annotation):
            kind = "decimal"
        elif types & {"object", "array"}:
            kind = "json"
        elif key in LONG_TEXT:
            kind = "text"
        elif key.endswith(("_url", "_website")) or key in {"url", "website"}:
            kind = "uri"
        elif key.endswith("email"):
            kind = "email"
        if kind not in {"string", "text", "uuid", "uri", "email", "date", "date-time", "integer", "number", "boolean", "decimal", "json"}:
            kind = "json"
        update_prop = _resolve(up.get(key, {}), update)
        update_variants = _variants(update_prop, update)
        update_scalar = next((item for item in update_variants if item.get("type") != "null"), {})
        def constraints(p, s, vs):
            return {
                "nullable": any(item.get("type") == "null" for item in vs),
                "max_length": s.get("maxLength", p.get("maxLength")),
                "min_length": s.get("minLength", p.get("minLength")),
                "minimum": s.get("minimum"), "maximum": s.get("maximum"),
                "pattern": s.get("pattern", p.get("pattern")),
            }
        limits = constraints(prop, scalar, variants)
        update_limits = constraints(update_prop, update_scalar, update_variants)
        enums = scalar.get("enum", prop.get("enum", []))
        item = scalar.get("items", {})
        result.append({
            "key": key, "label": LABELS.get(key, key.replace("_", " ").removesuffix(" id").title()),
            "section": section_for(key), "kind": kind,
            "required": key in create.get("required", []),
            "create": key in cp, "update": key in up,
            **limits, "update_constraints": update_limits,
            "default": jsonable_encoder(prop.get("default"), custom_encoder={Decimal: str}),
            "enum_values": enums,
            "json_shape": scalar.get("type") if len(types) == 1 and kind == "json" else None,
            "item_kind": item.get("format", item.get("type")),
            "reference_resource": reference_for(resource, key),
            "help": prop.get("description", ""),
        })
    priority = ["Identity and classification", "Details and narrative", "Ownership and research links",
                "Funding and resources", "Dates and schedule", "Contact and location", "Documents and media", "Discovery and visibility"]
    return sorted(result, key=lambda field: (priority.index(field["section"]), not field["required"]))


def apply_column_constraints(field: dict, column: Any) -> None:
    """Bound native schema inputs by the existing storage contract as well.

    Some legacy PATCH schemas allow null/unbounded strings despite NOT NULL or
    VARCHAR columns. This adapter prevents submitting those database-invalid
    values without widening permissions or changing the persisted schema.
    """
    from sqlalchemy.types import BigInteger, Integer, SmallInteger
    modes = [field, field["update_constraints"]]
    for limits in modes:
        if not column.nullable:
            limits["nullable"] = False
        length = getattr(column.type, "length", None)
        if isinstance(length, int) and field["kind"] in {"string", "text", "uri", "email"}:
            current = limits.get("max_length")
            limits["max_length"] = length if current is None else min(current, length)
        if field["kind"] == "integer" and isinstance(column.type, Integer):
            bits = 64 if isinstance(column.type, BigInteger) else 16 if isinstance(column.type, SmallInteger) else 32
            low, high = -(2 ** (bits - 1)), 2 ** (bits - 1) - 1
            # The browser cannot faithfully represent integers outside its safe
            # range; fields requiring larger integers need a decimal-string API.
            low, high = max(low, -(2**53 - 1)), min(high, 2**53 - 1)
            limits["minimum"] = low if limits.get("minimum") is None else max(low, limits["minimum"])
            limits["maximum"] = high if limits.get("maximum") is None else min(high, limits["maximum"])
        if field["kind"] == "decimal":
            precision, scale = getattr(column.type, "precision", None), getattr(column.type, "scale", None)
            if isinstance(precision, int) and isinstance(scale, int) and 0 <= scale <= precision:
                limits["max_digits"], limits["decimal_places"] = precision, scale


def stored_descriptors(create_schema, update_schema, model, *, resource: str,
                       excluded: frozenset[str] = frozenset(), read_schema=None) -> list[dict]:
    """Expose only known stored fields; read DTOs add non-editable native values.

    Legacy schemas still contain removed gallery/URL kwargs on some models.
    Passing those through generic CRUD would fail the model constructor. No
    unverified service-side transforms are inferred here. Relationship DTOs
    also stay out: their nested rows need their own ownership boundary.
    """
    columns = {column.key: column for column in model.__table__.columns}
    fields = [field for field in descriptors(create_schema, update_schema, resource=resource, excluded=excluded)
              if field["key"] in columns]
    covered = {field["key"] for field in fields}
    if read_schema is not None:
        reserved = {"id", "created_at", "updated_at", "deleted_at"}
        for field in descriptors(read_schema, read_schema, resource=resource):
            if field["key"] in covered or field["key"] not in columns or field["key"] in reserved:
                continue
            field.update(create=False, update=False, required=False,
                         help="Read-only; maintained by the native service.")
            fields.append(field)
    for field in fields:
        apply_column_constraints(field, columns[field["key"]])
    return fields
