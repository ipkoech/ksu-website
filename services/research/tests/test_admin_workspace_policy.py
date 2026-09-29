import importlib.util
from pathlib import Path
from types import SimpleNamespace
import pytest
from sqlalchemy import Boolean, Column, Integer, MetaData, String, Table, create_engine, select

ROOT = Path(__file__).resolve().parents[1] / 'app/services'
def load(name):
    spec = importlib.util.spec_from_file_location(name, ROOT / f'{name}.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module
p = load('admin_workspace_policy')
q = load('admin_workspace_query')

def test_empty_decisions_deny():
    with pytest.raises(PermissionError): p.merge_read_filters([], {'center_id'})

def test_invalid_ownership_column_does_not_widen():
    with pytest.raises(PermissionError): p.merge_read_filters([{'__domain_any__':[{'center_id':'a'}]}], {'id'})

def test_invalid_and_predicate_is_not_partially_stripped():
    with pytest.raises(PermissionError): p.merge_read_filters([{'__domain_any__':[{'center_id':'a','farm_type':'wrong'}]}], {'center_id'})

def test_empty_or_alternative_does_not_grant_everything():
    with pytest.raises(PermissionError): p.merge_read_filters([{'__domain_any__':[{}]}], {'id'})

def test_null_scope_is_not_unowned_access():
    with pytest.raises(PermissionError): p.merge_read_filters([{'__domain_any__':[{'center_id':None}]}], {'center_id'})

def test_verified_global_decision_is_unrestricted():
    assert p.merge_read_filters([{}], {'id'}) == {}

def test_alternatives_preserve_and_constraints():
    alternatives=[{'center_id':'a','project_type':'farm'}, {'center_id':'b'}]
    assert p.merge_read_filters([{'__domain_any__':alternatives}], {'id','center_id','project_type'}) == {'__domain_any__':alternatives}

def test_duplicate_alternatives_are_removed():
    grant={'__domain_any__':[{'center_id':'a'}]}
    assert p.merge_read_filters([grant,grant], {'center_id'}) == grant

def test_grants_cannot_be_spliced_across_permissions_and_scopes():
    grants=[{'scope_type':'global','permissions':['other']}, {'scope_type':'research','scope_id':'a','permissions':['view']}]
    decisions=p.direct_read_decisions(grants, ('view',), lambda grant,permission:permission in grant['permissions'])
    assert decisions == [{'__domain_any__':[{'center_id':'a'}]}]

def test_school_assignment_is_not_research_ownership():
    grants=[{'scope_type':'school','scope_id':'a','permissions':['view']}]
    assert p.direct_read_decisions(grants, ('view',), lambda *_:True) == []

@pytest.mark.parametrize('state', ['draft','pending','published','rejected',None])
@pytest.mark.parametrize('review,publish', [(False,False),(True,False),(False,True),(True,True)])
def test_transition_permissions_are_conjunctive(state,review,publish):
    actions=p.editorial_actions(state,edit=True,submit=True,review=review,publish=publish,history=True)
    assert actions['approve'] == (state=='pending' and review and publish)
    assert actions['edit'] == (state not in {'pending','published'})
    assert actions['submit'] == (state in {'draft','rejected'})
    assert actions['unpublish'] == (state=='published' and publish)
    assert actions['history'] == (state is not None)

@pytest.mark.parametrize('has_editorial', [False,True])
def test_sql_projection_matches_workflow_state_for_legacy_and_current_models(has_editorial):
    metadata=MetaData()
    columns=[Column('id',Integer,primary_key=True),Column('is_active',Boolean),Column('status',String)]
    if has_editorial: columns.append(Column('editorial_state',String))
    table=Table('records',metadata,*columns)
    model=SimpleNamespace(**{column.name:column for column in table.columns})
    adapter=SimpleNamespace(boolean_field='is_active',status_field='status',hidden_status='draft')
    engine=create_engine('sqlite://');metadata.create_all(engine)
    records=[];expected={};n=0
    for flag in [False,True,None]:
        for status in ['draft','pending','published','rejected','ongoing',None]:
            for editorial in (['draft','pending','published','rejected','unknown',None] if has_editorial else [None]):
                n+=1;record={'id':n,'is_active':flag,'status':status}
                if has_editorial:record['editorial_state']=editorial
                records.append(record)
                if editorial in ['draft','pending','published','rejected']:state=editorial
                elif status in ['pending','rejected']:state=status
                else:state='published' if bool(flag) and status not in ['draft','pending','rejected'] else 'draft'
                expected[n]=state
    with engine.begin() as db:
        db.execute(table.insert(),records)
        actual=dict(db.execute(select(table.c.id,q.editorial_state_expression(model,adapter))).all())
        assert actual==expected
        for state in ['draft','pending','published','rejected']:
            found=set(db.scalars(select(table.c.id).where(q.editorial_state_expression(model,adapter)==state)))
            assert found=={key for key,value in expected.items() if value==state}
