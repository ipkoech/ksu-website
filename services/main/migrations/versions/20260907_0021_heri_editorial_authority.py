"""Register separate HERI editorial actions without changing assignments."""

import uuid

import sqlalchemy as sa
from alembic import op

revision = "20260907_0021"
down_revision = "20260907_0020"
branch_labels = None
depends_on = None


def upgrade():
    for action in ("approve", "schedule", "unpublish"):
        op.get_bind().execute(sa.text(
            "INSERT INTO permissions (id, name, description, resource, action, is_active) "
            "VALUES (:id, :name, :description, 'heri.content', :action, true) "
            "ON CONFLICT (name) DO NOTHING"
        ), {"id": uuid.uuid4(), "name": f"heri.content.{action}",
            "description": f"HERI editorial {action}", "action": action})


def downgrade():
    # Retain catalog entries: deleting them could destroy legitimate assignments.
    pass
