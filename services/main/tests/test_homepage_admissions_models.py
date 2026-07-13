from pathlib import Path

import sqlalchemy as sa

from app.models.admissions import Intake, IntakeMilestone, IntakePublicAction


def _constraint_sql(model: type) -> str:
    return " ".join(str(constraint.sqltext) for constraint in model.__table__.constraints if isinstance(constraint, sa.CheckConstraint))


def test_intake_public_action_types_are_constrained():
    sql = _constraint_sql(IntakePublicAction)
    assert "download_admission_letter" in sql
    assert "apply" in sql


def test_intake_milestone_types_are_constrained():
    sql = _constraint_sql(IntakeMilestone)
    assert "admission_letters_release" in sql
    assert "reporting" in sql


def test_intake_has_timezone_aware_homepage_fields():
    assert Intake.__table__.c.application_opens_at.type.timezone is True
    assert Intake.__table__.c.application_closes_at.type.timezone is True
    assert Intake.__table__.c.late_application_closes_at.type.timezone is True
    assert Intake.__table__.c.override_expires_at.type.timezone is True
    assert Intake.__table__.c.timezone.server_default.arg == "Africa/Nairobi"


def test_public_action_has_current_action_partial_unique_index():
    index = next(index for index in IntakePublicAction.__table__.indexes if index.name == "uq_intake_public_actions_current_type")
    assert index.unique is True
    assert [column.name for column in index.columns] == ["intake_id", "action_type"]
    predicate = str(index.dialect_options["postgresql"]["where"])
    assert "deleted_at IS NULL" in predicate
    assert "archived" in predicate


def test_intake_relationships_delete_orphan_actions_and_milestones():
    assert "delete-orphan" in Intake.public_actions.property.cascade
    assert "delete-orphan" in Intake.milestones.property.cascade


def test_homepage_admissions_migration_has_expected_revision_chain():
    migration = Path(__file__).parents[1] / "migrations/versions/20260713_0022_add_homepage_admissions_actions.py"
    source = migration.read_text()
    assert 'revision = "20260713_0022"' in source
    assert 'down_revision = "20260713_0021"' in source
    assert '"intake_public_actions"' in source
    assert '"intake_milestones"' in source
    assert "AT TIME ZONE 'Africa/Nairobi'" in source

