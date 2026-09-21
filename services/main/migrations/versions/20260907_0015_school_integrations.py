"""Register separate School programme integration capabilities; no grants."""

import uuid
import sqlalchemy as sa
from alembic import op

revision = "20260907_0015"
down_revision = "20260907_0014"
branch_labels = None
depends_on = None


def upgrade():
    for action in ("preview", "sync"):
        name = f"school.integrations.programmes.{action}"
        op.get_bind().execute(sa.text(
            "INSERT INTO permissions (id, name, description, resource, action, is_active) "
            "VALUES (:id, :name, :description, :resource, :action, true) ON CONFLICT (name) DO NOTHING"
        ), {"id": uuid.uuid4(), "name": name, "description": f"School-owned programme integration {action}",
            "resource": "school.integrations.programmes", "action": action})


def downgrade():
    # Retain reviewed assignments; older code does not recognize this catalog.
    pass
