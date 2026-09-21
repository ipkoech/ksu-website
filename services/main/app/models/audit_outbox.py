"""Main-owned staging for transactionally captured request audit events."""

from ksu_common.audit_outbox import audit_outbox_table
from ksu_common.models.base import Base

audit_outbox = audit_outbox_table(Base.metadata, schema="main")
