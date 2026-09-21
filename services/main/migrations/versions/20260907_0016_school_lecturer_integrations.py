"""Register scoped lecturer integration actions without granting accounts."""

import uuid
import sqlalchemy as sa
from alembic import op

revision = "20260907_0016"
down_revision = "20260907_0015"
branch_labels = None
depends_on = None


def upgrade():
    for action in ("preview", "sync"):
        name = f"school.integrations.lecturers.{action}"
        op.get_bind().execute(sa.text(
            "INSERT INTO permissions (id, name, description, resource, action, is_active) "
            "VALUES (:id, :name, :description, :resource, :action, true) ON CONFLICT (name) DO NOTHING"
        ), {"id": uuid.uuid4(), "name": name, "description": f"School-owned lecturer integration {action}",
            "resource": "school.integrations.lecturers", "action": action})


def downgrade():
    pass
