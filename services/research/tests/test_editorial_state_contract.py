from uuid import uuid4

import sqlalchemy as sa

from app.models import ResearchFarm
from app.routes.v1._fields import FieldSelection, build_selector
from app.services._crud import apply_public_visibility
from app.services.research_workflow import apply_workflow_state, workflow_state


def test_boolean_model_retains_pending_and_rejected_state_without_changing_v1_fields():
    farm = ResearchFarm(id=uuid4(), name="Farm", editorial_state="draft", is_public=False)
    for state in ("pending", "rejected", "published"):
        apply_workflow_state("farms", farm, state)
        assert workflow_state("farms", farm) == state
        assert farm.is_public is (state == "published")
        result = build_selector(ResearchFarm, FieldSelection(fields=("id", "editorial_state", "is_public"))).apply(farm)
        assert "editorial_state" not in result
        assert result["is_public"] is farm.is_public


def test_public_query_requires_published_editorial_state_and_public_visibility():
    query = apply_public_visibility(ResearchFarm, sa.select(ResearchFarm.id))
    sql = str(query.compile(compile_kwargs={"literal_binds": True}))
    assert "editorial_state = 'published'" in sql
    assert "is_public IS true" in sql
