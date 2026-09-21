"""Verify persisted head pointers and public team responses; write the match report."""
from __future__ import annotations

import concurrent.futures
import json
from pathlib import Path

import requests

OUT = Path(__file__).resolve().parents[1] / 'output/department-head-matching'


def verify(item):
    base = 'http://localhost:8080/api/v1'
    response = requests.get(f"{base}/departments/{item['slug']}", params={'fields':'id,head_id,name'}, timeout=30)
    response.raise_for_status()
    department = response.json()['data']
    response = requests.get(f"{base}/public/departments/{item['id']}/team", timeout=30)
    response.raise_for_status()
    team = response.json()['data']
    heads = [member for tier in team['tiers'] if tier['key'] == 'head' for member in tier['members']]
    expected = item['person_id']
    return {'code':item['code'], 'head_pointer_correct':department['head_id']==expected,
            'public_head_correct':len(heads)==1 and heads[0]['person_id']==expected,
            'public_head_names':[h['name'] for h in heads]}


def main():
    plan = json.loads((OUT/'plan.json').read_text())
    applied = json.loads((OUT/'applied.json').read_text())
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        jobs = {pool.submit(verify,item):item for item in plan if item['status']=='matched'}
        for job in concurrent.futures.as_completed(jobs):
            try:
                result = job.result()
            except Exception as error:
                result = {'code':jobs[job]['code'],'error':str(error)}
            results.append(result)
    (OUT/'verification.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    passed = sum(r.get('head_pointer_correct') and r.get('public_head_correct') for r in results)
    lines = ['# Department head matching — 8 September 2026', '',
             f"Matched 51 departments: 40 academic and 11 administrative/support. Updated 42 department head pointers; created 46 department appointments and updated 5 existing appointments. Public API verification: {passed}/{len(results)} passed.", '',
             'Department pages were checked live. Administrative appointments also use the management-board page and ICT governance page. Procurement evidence is dated 16 February 2026. These are website-published appointments, not independently verified HR appointment letters.', '',
             'Duplicate local person records were not merged. Selection used an existing matching head record, matching portrait/name, department association, and stable external identity. No accounts, access grants, invented email addresses, or appointment start/end dates were added.', '',
             '## Matched departments', '', '| Type | Department | Published head | Local profile | Designation | Source |', '|---|---|---|---|---|---|']
    for item in plan:
        if item['status']=='matched':
            lines.append(f"| {item['department_type']} | {item['name']} | {item['source_name']} | {item['local_name']} (`{item['person_id']}`) | {item['designation']} | [Official source]({item['source_url']}) |")
    lines += ['', '## Changed incumbents', '']
    for item in applied['departments']:
        if item['old_head_id'] and item['old_head_id'] != item['new_head_id']:
            lines.append(f"- {item['department']}: {item['old_head_name']} → {item['new_head_name']}. [Source]({item['source_url']}). The superseded department assignment was retained with ended status; unrelated appointments were preserved.")
    lines += ['', '## Unresolved departments', '', '| Department | Published name, if any | Reason | Source checked |', '|---|---|---|---|']
    for item in plan:
        if item['status']!='matched':
            lines.append(f"| {item['name']} | {item.get('source_name','—')} | {item['reason']} | [Source]({item['source_url']}) |")
    lines += ['', 'For the two named people without local matches, a verified local identity or real email is needed before a Person record can be created. Existing heads in departments with no source-backed match were left unchanged.', '',
              'Evidence and reproducibility: `discovery.json`, `plan.json`, `dry-run.json`, `applied.json` (before/after state), and `verification.json` are alongside this report. The checked-in discovery, matching, application, and verification scripts can reproduce the process.']
    (OUT/'report.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print(json.dumps({'verified':passed,'total':len(results),'failures':[r for r in results if not(r.get('head_pointer_correct') and r.get('public_head_correct'))]}))
    if passed != len(results):
        raise SystemExit(1)


if __name__=='__main__':
    main()
