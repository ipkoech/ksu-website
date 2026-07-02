from pathlib import Path
from types import SimpleNamespace
import asyncio
import uuid

from app.models import (
    IncubationRecord,
    InnovationCompetitionEntry,
    StartupVenture,
    TechnologyTransferCase,
)
from app.routes.v1.innovation_partnership import router as innovation_partnership_router
from app.schemas import (
    CompetitionEntryStatusAction,
    CompetitionEntryCreate,
    IncubationStageAction,
    IncubationRecordCreate,
    MentorAssignmentAction,
    StartupStageAction,
    StartupVentureCreate,
    TechnologyTransferStatusAction,
    TechnologyTransferCaseCreate,
)
from app.services import (
    CompetitionEntryService,
    IncubationRecordService,
    InnovationPathwayAdminActionService,
    InnovationPathwayRelationshipService,
    StartupVentureService,
    TechnologyTransferCaseService,
)
from fastapi.routing import APIRoute


def _iter_routes(router, prefix: str = ""):
    for route in router.routes:
        if isinstance(route, APIRoute):
            yield prefix + route.path, route
            continue

        original_router = getattr(route, "original_router", None)
        include_context = getattr(route, "include_context", None)
        if original_router is not None:
            nested_prefix = prefix + getattr(include_context, "prefix", "")
            yield from _iter_routes(original_router, nested_prefix)


def test_innovation_pathway_models_are_importable():
    assert StartupVenture.__tablename__ == "startup_ventures"
    assert IncubationRecord.__tablename__ == "incubation_records"
    assert InnovationCompetitionEntry.__tablename__ == "innovation_competition_entries"
    assert TechnologyTransferCase.__tablename__ == "technology_transfer_cases"


def test_innovation_pathway_migration_exists():
    migration_dir = Path("migrations/versions")
    matches = list(migration_dir.glob("*add_innovation_pathway_models.py"))
    assert matches, "Expected Alembic migration for innovation pathway models"
    text = matches[0].read_text()
    assert "startup_ventures" in text
    assert "incubation_records" in text
    assert "innovation_competition_entries" in text
    assert "technology_transfer_cases" in text
    assert "def downgrade" in text


def test_innovation_pathway_schemas_are_importable():
    assert StartupVentureCreate.model_fields["name"].is_required()
    assert IncubationRecordCreate.model_fields["innovation_id"].is_required()
    assert CompetitionEntryCreate.model_fields["entry_type"].default == "competition"
    assert TechnologyTransferCaseCreate.model_fields["case_type"].default == "disclosure"
    assert StartupStageAction.model_fields["venture_stage"].is_required()
    assert IncubationStageAction.model_fields["stage"].is_required()
    assert MentorAssignmentAction(mentor_ids=[uuid.uuid4()]).mentor_ids
    assert CompetitionEntryStatusAction.model_fields["entry_status"].is_required()
    assert TechnologyTransferStatusAction.model_fields["transfer_status"].is_required()


def test_innovation_pathway_services_are_configured():
    assert "name" in StartupVentureService.search_fields
    assert "program_name" in IncubationRecordService.search_fields
    assert "competition_name" in CompetitionEntryService.search_fields
    assert "agreement_reference" in TechnologyTransferCaseService.search_fields
    assert hasattr(InnovationPathwayRelationshipService, "list_startups")
    assert hasattr(InnovationPathwayAdminActionService, "publish")


def test_innovation_pathway_router_paths_are_registered():
    paths = {route_path for route_path, _ in _iter_routes(innovation_partnership_router)}
    assert "/startups" in paths
    assert "/incubation-records" in paths
    assert "/competition-entries" in paths
    assert "/technology-transfer-cases" in paths
    assert "/innovations/id/{innovation_id}/startups" in paths
    assert "/startups/id/{item_id}/publish" in paths
    assert "/startups/id/{item_id}/stage" in paths
    assert "/incubation-records/id/{item_id}/assign-mentors" in paths
    assert "/competition-entries/id/{item_id}/entry-status" in paths
    assert "/technology-transfer-cases/id/{item_id}/transfer-status" in paths


def test_innovation_pathway_action_routes_are_scope_protected():
    routes = {route_path: route for route_path, route in _iter_routes(innovation_partnership_router)}

    protected_paths = [
        "/startups/id/{item_id}/publish",
        "/incubation-records/id/{item_id}/assign-mentors",
        "/competition-entries/id/{item_id}/entry-status",
        "/technology-transfer-cases/id/{item_id}/transfer-status",
    ]
    for path in protected_paths:
        route = routes[path]
        dependency_names = {dependency.call.__name__ for dependency in route.dependant.dependencies}
        assert "_check" in dependency_names


def test_innovation_pathway_admin_actions_apply_state_changes():
    async def run():
        await InnovationPathwayAdminActionService.publish(db, Service, item.id)
        assert item.status == "active"
        assert item.is_active is True
        assert item.is_public is True

        await InnovationPathwayAdminActionService.set_featured(db, Service, item.id, True)
        assert item.is_featured is True

        await InnovationPathwayAdminActionService.archive(db, Service, item.id)
        assert item.status == "archived"
        assert item.is_active is False
        assert item.is_public is False
        assert item.is_featured is False

    item = SimpleNamespace(
        id=uuid.uuid4(),
        status="draft",
        is_active=False,
        is_public=False,
        is_featured=False,
    )

    class Service:
        model = StartupVenture

        @staticmethod
        async def get_by_id(db, item_id):
            assert item_id == item.id
            return item

    class Db:
        async def flush(self):
            return None

        async def refresh(self, refreshed):
            assert refreshed is item

    db = Db()
    asyncio.run(run())
