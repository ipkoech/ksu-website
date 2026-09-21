import sqlalchemy as sa
import pytest
from sqlalchemy.orm import DeclarativeBase, Session, relationship, selectinload

from ksu_common.field_selection import apply_field_selection, build_load_options, parse_field_selection


class Base(DeclarativeBase):
    pass


class Child(Base):
    __tablename__ = "projection_child"
    id = sa.Column(sa.Integer, primary_key=True)
    name = sa.Column(sa.String)
    password_hash = sa.Column(sa.String)


class Parent(Base):
    __tablename__ = "projection_parent"
    id = sa.Column(sa.Integer, primary_key=True)
    child_id = sa.Column(sa.ForeignKey(Child.id))
    attributes = sa.Column(sa.JSON)
    child = relationship(Child)


def test_loaded_orm_relations_never_escape_as_raw_objects_or_trigger_lazy_queries():
    engine = sa.create_engine("sqlite://")
    statements = []
    try:
        Base.metadata.create_all(engine)
        with Session(engine) as db:
            db.add(Parent(id=1, child=Child(id=2, name="Public name", password_hash="private-hash"),
                          attributes={"label": "kept", "nested": {"api_key": "private-key"}}))
            db.commit()
        sa.event.listen(engine, "before_cursor_execute", lambda *args: statements.append(args[2]))
        with Session(engine) as db:
            parent = db.scalar(sa.select(Parent))
            statements.clear()
            # An unloaded relationship must be omitted without issuing SQL.
            assert apply_field_selection(parent, parse_field_selection(fields="id,child")) == {"id": 1}
            assert statements == []
            parent = db.scalar(sa.select(Parent).options(selectinload(Parent.child)))
            statements.clear()
            assert apply_field_selection(parent, parse_field_selection(fields="id,child,attributes")) == {
                "id": 1, "child": {"id": 2}, "attributes": {"label": "kept", "nested": {}},
            }
            assert apply_field_selection(parent, parse_field_selection(fields="child(id,name,password_hash)")) == {
                "child": {"id": 2, "name": "Public name"},
            }
            assert statements == []
    finally:
        engine.dispose()


@pytest.mark.parametrize("use_selectin", [True, False])
def test_nested_only_loader_fetches_required_columns_without_secrets(use_selectin):
    engine = sa.create_engine("sqlite://")
    statements = []
    try:
        Base.metadata.create_all(engine)
        with Session(engine) as db:
            db.add(Parent(id=1, child=Child(id=2, name="Visible", password_hash="private"),
                          attributes={"large": "unused content"}))
            db.commit()
        sa.event.listen(engine, "before_cursor_execute", lambda *args: statements.append(args[2]))
        selection = parse_field_selection(fields="child(id,name,password_hash)")
        with Session(engine) as db:
            parent = db.scalar(sa.select(Parent).options(
                *build_load_options(Parent, selection, use_selectin=use_selectin),
            ))
            assert "attributes" in sa.inspect(parent).unloaded
            assert "password_hash" in sa.inspect(parent.child).unloaded
            assert len(statements) == (2 if use_selectin else 1)
            statements.clear()
            assert apply_field_selection(parent, selection) == {"child": {"id": 2, "name": "Visible"}}
            assert statements == []
    finally:
        engine.dispose()
