"""Field selection for FastAPI — GraphQL-like sparse fieldsets with relationship support.

Supports:
    ?fields=id,name                           # Select specific fields
    ?fields=campus:id,name                    # Select nested relationship fields (colon notation)
    ?fields=staff(id,name,role)               # Select nested fields (parenthesis notation)
    ?fields=campus(id,name,schools:id,name)   # Deep nesting
    ?include=campus;staff:id,name             # Include relationships with field selection

Usage in routes:
    from ksu_common.field_selection import FieldsQuery, apply_field_selection, build_load_options

    @router.get("/libraries")
    async def list_libraries(
        db: AsyncSession = Depends(get_db),
        fields: FieldSelection = Depends(FieldsQuery()),
    ):
        # Build eager-load options from field selection
        options = build_load_options(Library, fields)
        query = select(Library).options(*options)

        result = await db.execute(query)
        libraries = result.scalars().all()

        # Filter output to only requested fields
        return success(data=apply_field_selection(libraries, fields))
"""

from __future__ import annotations

from dataclasses import dataclass, field
from functools import lru_cache
from typing import Any, Callable, Mapping, Sequence, Type, TypeVar

from pydantic import BaseModel
from sqlalchemy import inspect as sa_inspect
from sqlalchemy.orm import RelationshipProperty, joinedload, load_only, selectinload
from sqlalchemy.orm.attributes import NO_VALUE

T = TypeVar("T", bound=BaseModel)


# Never serialized into an API response, whatever the caller requests. Matched on
# exact attribute name — substring matching would swallow innocent columns such as
# secretary_general, keywords, key_achievements and credits_required.
SENSITIVE_FIELD_NAMES: frozenset[str] = frozenset(
    {
        "password",
        "new_password",
        "old_password",
        "current_password",
        "password_confirmation",
        "confirm_password",
        "password_hash",
        "hashed_password",
        "salt",
        "token",
        "password_reset_token",
        "email_verification_token",
        "verification_token",
        "code_hash",
        "key_hash",
        "session_hash",
        "token_hash",
        "continuation_token_hash",
        "secret",
        "mfa_secret",
        "otp_secret",
        "totp_secret",
        "client_secret",
        "webhook_secret",
        "credentials",
        "access_token",
        "refresh_token",
        "push_tokens",
        "api_key",
        "private_key",
    }
)


def is_sensitive_field(name: str) -> bool:
    """True when a field must never reach an API response."""
    return name.lower() in SENSITIVE_FIELD_NAMES


def scrub_sensitive(value: Any) -> Any:
    """Recursively drop sensitive keys from already-serialized data."""
    if isinstance(value, dict):
        return {
            key: scrub_sensitive(item)
            for key, item in value.items()
            if not (isinstance(key, str) and is_sensitive_field(key))
        }
    if isinstance(value, list):
        return [scrub_sensitive(item) for item in value]
    return value


@dataclass(frozen=True)
class _ModelMetadata:
    column_names: frozenset[str]
    relationship_names: frozenset[str]
    relationships: Mapping[str, RelationshipProperty]


@lru_cache(maxsize=256)
def _get_model_metadata(model_class: Type) -> _ModelMetadata | None:
    """Cache SQLAlchemy mapper metadata per model class."""
    try:
        mapper = sa_inspect(model_class)
    except Exception:
        return None

    relationships = {rel.key: rel for rel in mapper.relationships}
    return _ModelMetadata(
        column_names=frozenset(attr.key for attr in mapper.column_attrs),
        relationship_names=frozenset(relationships),
        relationships=relationships,
    )


@dataclass(frozen=True)
class FieldSelection:
    """Represents requested fields and nested relationship selections."""

    fields: tuple[str, ...]
    nested: Mapping[str, "FieldSelection"] = field(default_factory=dict)

    @property
    def is_empty(self) -> bool:
        return not self.fields and not self.nested

    @property
    def all_fields(self) -> set[str]:
        """All top-level fields including nested relationship names."""
        result = set(self.fields)
        result.update(self.nested.keys())
        return result

    def get_nested(self, key: str) -> "FieldSelection":
        """Get nested selection for a relationship, or empty selection."""
        return self.nested.get(key, FieldSelection(fields=()))

    def has_field(self, name: str) -> bool:
        """Check if a field or relationship is requested."""
        return name in self.fields or name in self.nested

    def __bool__(self) -> bool:
        return not self.is_empty


class _SelectionNode:
    __slots__ = ("fields", "children")

    def __init__(self):
        self.fields: list[str] = []
        self.children: dict[str, _SelectionNode] = {}


def _unique(sequence: list[str]) -> tuple[str, ...]:
    seen: dict[str, None] = {}
    for value in sequence:
        normalized = value.strip()
        if normalized:
            seen.setdefault(normalized, None)
    return tuple(seen)


def _node_to_selection(node: _SelectionNode) -> FieldSelection:
    return FieldSelection(
        fields=_unique(node.fields),
        nested={name: _node_to_selection(child) for name, child in node.children.items()},
    )


def _default_nested_selection(always_include: set[str] | None = None) -> FieldSelection:
    """Use an ID-only projection for bare relationship includes."""
    fields = tuple(always_include or {"id"})
    return FieldSelection(fields=fields)


def _add_selection(node: _SelectionNode, path: Sequence[str], fields: Sequence[str]) -> None:
    current = node
    for segment in path:
        current = current.children.setdefault(segment, _SelectionNode())
    current.fields.extend(fields)


def _split_respecting_parens(text: str) -> list[str]:
    if not text:
        return []
    parts = []
    buffer = ""
    balance = 0
    for char in text:
        if char == "(":
            balance += 1
            buffer += char
        elif char == ")":
            balance -= 1
            buffer += char
        elif char in ",;" and balance == 0:
            if buffer.strip():
                parts.append(buffer.strip())
            buffer = ""
        else:
            buffer += char
    if buffer.strip():
        parts.append(buffer.strip())
    return parts


def _parse_colon_token(token: str) -> tuple[list[str], tuple[str, ...]] | None:
    if ":" not in token:
        return None
    relation_part, field_part = token.split(":", 1)
    relation_part = relation_part.strip()
    if not relation_part:
        return None
    fields = [f.strip() for f in field_part.split(",") if f.strip()]
    return relation_part.split("."), tuple(fields)


def _process_paren_token(node: _SelectionNode, token: str, base_path: list[str] | None = None) -> bool:
    if "(" not in token or not token.endswith(")"):
        return False

    name_part, content_part = token.split("(", 1)
    name = name_part.strip()
    content = content_part[:-1].strip()

    current_path = (base_path or []) + [name]
    sub_tokens = _split_respecting_parens(content)
    direct_fields = []

    for sub_token in sub_tokens:
        if "(" in sub_token and sub_token.endswith(")"):
            _process_paren_token(node, sub_token, current_path)
        else:
            colon = _parse_colon_token(sub_token)
            if colon:
                rel, fields = colon
                _add_selection(node, current_path + rel, fields)
            else:
                direct_fields.append(sub_token)

    if direct_fields:
        _add_selection(node, current_path, direct_fields)
    return True


def parse_field_selection(
    fields: str | list[str] | None = None,
    include: str | list[str] | None = None,
) -> FieldSelection:
    """Parse ?fields= and ?include= query params into a FieldSelection tree.

    Examples:
        parse_field_selection(fields="id,name,campus:id,name")
        parse_field_selection(fields="id,name", include="campus:id;staff")
        parse_field_selection(fields="id,name,campus(id,name,schools:id)")
    """
    root = _SelectionNode()

    field_list = [fields] if isinstance(fields, str) else (fields or [])
    for token_str in field_list:
        chunks = _split_respecting_parens(token_str)
        current_relation: list[str] | None = None
        current_fields: list[str] = []

        for chunk in chunks:
            chunk = chunk.strip()
            if not chunk:
                continue

            if _process_paren_token(root, chunk):
                if current_relation and current_fields:
                    _add_selection(root, current_relation, current_fields)
                    current_fields = []
                current_relation = None
                continue

            colon = _parse_colon_token(chunk)
            if colon:
                if current_relation and current_fields:
                    _add_selection(root, current_relation, current_fields)
                current_relation, current_fields = colon[0], list(colon[1])
                continue

            if current_relation is None:
                root.fields.append(chunk)
            else:
                current_fields.append(chunk)

        if current_relation and current_fields:
            _add_selection(root, current_relation, current_fields)

    include_list = [include] if isinstance(include, str) else (include or [])
    for inc_str in include_list:
        current_relation: list[str] | None = None
        current_fields: list[str] = []

        for segment in _split_respecting_parens(inc_str):
            segment = segment.strip()
            if not segment:
                continue

            if _process_paren_token(root, segment):
                if current_relation and current_fields:
                    _add_selection(root, current_relation, current_fields)
                    current_fields = []
                current_relation = None
                continue

            colon = _parse_colon_token(segment)
            if colon:
                if current_relation and current_fields:
                    _add_selection(root, current_relation, current_fields)
                current_relation, current_fields = colon[0], list(colon[1])
            else:
                if current_relation is None:
                    _add_selection(root, segment.split("."), ())
                else:
                    current_fields.append(segment)

        if current_relation and current_fields:
            _add_selection(root, current_relation, current_fields)

    return _node_to_selection(root)


def filter_dict(
    data: dict[str, Any],
    selection: FieldSelection,
    *,
    always_include: set[str] | None = None,
) -> dict[str, Any]:
    """Filter a dict to only include selected fields and nested relationships.

    Args:
        data: The dict to filter
        selection: Field selection specification
        always_include: Fields to always include (e.g., "id")
    """
    if selection.is_empty:
        return scrub_sensitive(data)

    always = always_include or set()
    result: dict[str, Any] = {}

    for key in selection.fields:
        if key in data and not is_sensitive_field(key):
            result[key] = data[key]

    for key in always:
        if key in data and key not in result and not is_sensitive_field(key):
            result[key] = data[key]

    for nested_key, nested_selection in selection.nested.items():
        if nested_key not in data:
            continue

        value = data[nested_key]

        effective_selection = (
            _default_nested_selection(always)
            if nested_selection.is_empty
            else nested_selection
        )

        if isinstance(value, dict):
            result[nested_key] = filter_dict(value, effective_selection, always_include=always)
        elif isinstance(value, list):
            result[nested_key] = [
                filter_dict(item, effective_selection, always_include=always)
                if isinstance(item, dict)
                else apply_field_selection(item, effective_selection, always_include=always)
                for item in value
            ]
        else:
            result[nested_key] = apply_field_selection(
                value,
                effective_selection,
                always_include=always,
            )

    return result


def _serialize_object_fields(
    data: Any,
    selection: FieldSelection,
    *,
    always_include: set[str] | None = None,
) -> dict[str, Any]:
    """Serialize an ORM/object instance using the requested field selection."""
    always = always_include or set()
    metadata = _get_model_metadata(type(data))
    column_names = metadata.column_names if metadata is not None else frozenset()
    relationship_names = metadata.relationship_names if metadata is not None else frozenset()
    state = None
    unloaded: set[str] = set()
    if metadata is not None:
        try:
            state = sa_inspect(data)
            unloaded = set(state.unloaded)
        except Exception:
            state = None
            unloaded = set()

    result: dict[str, Any] = {}
    requested_fields = set(selection.fields) | always

    if selection.is_empty:
        if metadata is not None:
            requested_fields = column_names | always
        else:
            requested_fields = {
                key for key in vars(data).keys()
                if not key.startswith("_")
            } | always

    for key in requested_fields:
        if is_sensitive_field(key):
            continue
        if metadata is not None and key not in column_names and key not in relationship_names:
            continue
        if key in unloaded:
            continue
        if state is not None and key in state.attrs and state.attrs[key].loaded_value is NO_VALUE:
            continue
        try:
            result[key] = getattr(data, key)
        except AttributeError:
            continue

    for nested_key, nested_selection in selection.nested.items():
        if metadata is not None and nested_key not in relationship_names:
            continue
        if nested_key in unloaded:
            continue
        if state is not None and nested_key in state.attrs and state.attrs[nested_key].loaded_value is NO_VALUE:
            continue
        try:
            nested_value = getattr(data, nested_key)
        except AttributeError:
            continue
        effective_selection = (
            _default_nested_selection(always)
            if nested_selection.is_empty
            else nested_selection
        )
        result[nested_key] = apply_field_selection(
            nested_value,
            effective_selection,
            always_include=always,
        )

    return result


def _get_load_only_attributes(
    model_class: Type,
    selection: FieldSelection,
    *,
    always_include: set[str] | None = None,
) -> tuple[Any, ...]:
    """Get class-bound attributes for the selected scalar fields."""
    metadata = _get_model_metadata(model_class)
    if metadata is None:
        return ()

    requested_columns = {
        field_name
        for field_name in (set(selection.fields) | (always_include or set()))
        if field_name in metadata.column_names
    }
    if not requested_columns:
        return ()

    return tuple(getattr(model_class, field_name) for field_name in requested_columns)


def apply_field_selection(
    data: Any,
    selection: FieldSelection,
    *,
    always_include: set[str] | None = None,
) -> dict | list[dict] | None:
    """Apply field selection to Pydantic model(s) or dict(s).

    Args:
        data: Single model/dict or list of models/dicts
        selection: Field selection specification
        always_include: Fields to always include even if not requested (e.g., {"id"})

    Examples:
        # Filter single model
        library_dict = apply_field_selection(library, selection)

        # Filter list of models
        libraries_list = apply_field_selection(libraries, selection)

        # Always include 'id' field
        result = apply_field_selection(data, selection, always_include={"id"})
    """
    if data is None:
        return None

    if selection.is_empty:
        if isinstance(data, BaseModel):
            return scrub_sensitive(data.model_dump())
        elif isinstance(data, list) and data and isinstance(data[0], BaseModel):
            return [scrub_sensitive(item.model_dump()) for item in data]
        elif isinstance(data, list) and data and not isinstance(data[0], dict):
            return [
                _serialize_object_fields(item, selection, always_include=always_include)
                for item in data
            ]
        elif not isinstance(data, dict) and hasattr(data, "__dict__"):
            return _serialize_object_fields(data, selection, always_include=always_include)
        return scrub_sensitive(data)  # type: ignore

    always = always_include or set()

    if isinstance(data, BaseModel):
        return filter_dict(data.model_dump(), selection, always_include=always)
    elif isinstance(data, list):
        return [
            (
                filter_dict(item.model_dump(), selection, always_include=always)
                if isinstance(item, BaseModel)
                else filter_dict(item, selection, always_include=always)
                if isinstance(item, dict)
                else _serialize_object_fields(item, selection, always_include=always)
            )
            for item in data
        ]
    elif not isinstance(data, dict) and hasattr(data, "__dict__"):
        return _serialize_object_fields(data, selection, always_include=always)
    elif not isinstance(data, dict):
        return data
    return filter_dict(data, selection, always_include=always)


def build_load_options(
    model_class: Type,
    selection: FieldSelection,
    *,
    use_selectin: bool = True,
    always_include: set[str] | None = None,
) -> list:
    """Build SQLAlchemy eager-load options from field selection.

    This ensures requested relationships are loaded in the query, avoiding N+1 queries.

    Args:
        model_class: The SQLAlchemy model class
        selection: Field selection with nested relationships
        use_selectin: Use selectinload (default) vs joinedload

    Returns:
        List of SQLAlchemy load options to pass to query.options()

    Example:
        options = build_load_options(Library, selection)
        query = select(Library).options(*options)
        result = await db.execute(query)
    """
    options = []
    loader = selectinload if use_selectin else joinedload
    metadata = _get_model_metadata(model_class)
    if metadata is None:
        return options
    relationships = metadata.relationships

    if not selection.is_empty:
        top_level_attrs = _get_load_only_attributes(
            model_class,
            selection,
            always_include=always_include,
        )
        if top_level_attrs:
            options.append(load_only(*top_level_attrs))

    for rel_name, nested_selection in selection.nested.items():
        if rel_name not in relationships:
            continue

        rel = relationships[rel_name]
        rel_attr = getattr(model_class, rel_name)
        load_opt = loader(rel_attr)

        if nested_selection.nested:
            related_model = rel.mapper.class_
            nested_options = build_load_options(
                related_model,
                nested_selection,
                use_selectin=use_selectin,
                always_include=always_include,
            )
            for nested_opt in nested_options:
                load_opt = load_opt.options(nested_opt)
        else:
            effective_selection = (
                _default_nested_selection(always_include)
                if nested_selection.is_empty
                else nested_selection
            )
            nested_attrs = _get_load_only_attributes(
                rel.mapper.class_,
                effective_selection,
                always_include=always_include,
            )
            if nested_attrs:
                load_opt = load_opt.load_only(*nested_attrs)

        options.append(load_opt)

    return options


def get_requested_relationships(selection: FieldSelection) -> set[str]:
    """Get set of relationship names that need to be loaded."""
    return set(selection.nested.keys())


class FieldsQuery:
    """FastAPI dependency for field selection.

    Usage:
        @router.get("/libraries")
        async def list_libraries(
            db: AsyncSession = Depends(get_db),
            fields: FieldSelection = Depends(FieldsQuery()),
        ):
            # Build query with eager loading
            options = build_load_options(Library, fields)
            query = Library.active_query().options(*options)
            result = await db.execute(query)
            libraries = result.scalars().all()

            # Filter output
            return success(data=apply_field_selection(libraries, fields))

        # Requests:
        # GET /libraries?fields=id,name
        # GET /libraries?fields=id,name,campus:id,name
        # GET /libraries?fields=id,name&include=campus:id,name;staff
        # GET /libraries?fields=id,name,campus(id,name,schools:id,name)
    """

    def __init__(self, always_include: set[str] | None = None):
        """
        Args:
            always_include: Fields to always include even if not requested
        """
        self.always_include = always_include or set()

    def __call__(
        self,
        fields: str | None = None,
        include: str | None = None,
    ) -> FieldSelection:
        selection = parse_field_selection(
            fields=[fields] if fields else None,
            include=[include] if include else None,
        )

        if self.always_include and selection.fields:
            new_fields = set(selection.fields) | self.always_include
            selection = FieldSelection(
                fields=tuple(new_fields),
                nested=selection.nested,
            )

        return selection


class FieldSelector:
    """Helper class for applying field selection in service layer.

    Usage:
        selector = FieldSelector(Library, selection)

        # Get eager load options for query
        query = select(Library).options(*selector.load_options)

        # After fetching, filter the output
        return selector.apply(libraries)
    """

    def __init__(
        self,
        model_class: Type,
        selection: FieldSelection,
        *,
        always_include: set[str] | None = None,
        use_selectin: bool = True,
    ):
        self.model_class = model_class
        self.selection = selection
        self.always_include = always_include or {"id"}
        self.use_selectin = use_selectin

    @property
    def load_options(self) -> list:
        """SQLAlchemy eager-load options for the query."""
        return build_load_options(
            self.model_class,
            self.selection,
            use_selectin=self.use_selectin,
            always_include=self.always_include,
        )

    @property
    def relationships(self) -> set[str]:
        """Set of relationship names to load."""
        return get_requested_relationships(self.selection)

    def apply(
        self,
        data: dict | list[dict] | BaseModel | list[BaseModel],
    ) -> dict | list[dict]:
        """Apply field selection to the data."""
        return apply_field_selection(
            data,
            self.selection,
            always_include=self.always_include,
        )

    @property
    def is_empty(self) -> bool:
        return self.selection.is_empty
