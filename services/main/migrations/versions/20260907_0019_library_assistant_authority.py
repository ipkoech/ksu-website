"""Register separate assistant capabilities without assigning accounts."""

import uuid

import sqlalchemy as sa
from alembic import op

revision = "20260907_0019"
down_revision = "20260907_0018"
branch_labels = None
depends_on = None


def upgrade():
    for action in ("view", "manage", "publish", "unpublish"):
        op.get_bind().execute(sa.text(
            "INSERT INTO permissions (id, name, description, resource, action, is_active) "
            "VALUES (:id, :name, :description, 'library.assistant', :action, true) "
            "ON CONFLICT (name) DO NOTHING"
        ), {"id": uuid.uuid4(), "name": f"library.assistant.{action}",
            "description": f"Library assistant {action}", "action": action})


def downgrade():
    pass
