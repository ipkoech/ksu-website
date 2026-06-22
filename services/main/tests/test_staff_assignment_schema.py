import uuid
import unittest
from datetime import datetime, timezone

from app.schemas.staff import StaffAssignmentRead


class StaffAssignmentSchemaTests(unittest.TestCase):
    def test_staff_assignment_read_includes_entity_summary(self):
        now = datetime.now(timezone.utc)
        assignment_id = uuid.uuid4()
        person_id = uuid.uuid4()
        wing_id = uuid.uuid4()

        payload = {
            "id": assignment_id,
            "person_id": person_id,
            "entity_type": "wing",
            "entity_id": wing_id,
            "entity": {
                "id": wing_id,
                "name": "Registrar Academic Affairs",
                "type": "wing",
                "subtitle": "REG-AA",
                "is_active": True,
            },
            "role": "registrar_academic",
            "hierarchy_level": 4,
            "is_primary": True,
            "is_acting": False,
            "is_public": True,
            "term_renewable": True,
            "show_term_dates": False,
            "status": "active",
            "display_order": 10,
            "created_at": now,
            "updated_at": now,
        }

        assignment = StaffAssignmentRead.model_validate(payload)

        self.assertIsNotNone(assignment.entity)
        self.assertEqual(assignment.entity.id, wing_id)
        self.assertEqual(assignment.entity.name, "Registrar Academic Affairs")
        self.assertEqual(assignment.entity.type, "wing")
