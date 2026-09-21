"""Verify the agenda COD assignments through the public API."""
import concurrent.futures
import json
from pathlib import Path
import requests

OUT = Path('output/agenda-cods')
local = json.loads((OUT / 'local.json').read_text())
departments = {d['code']: d for d in local['departments']}
applied = json.loads((OUT / 'applied.json').read_text())

def verify(entry):
    dept = departments[entry['code']]
    base = 'http://localhost:8080/api/v1'
    response = requests.get(f"{base}/public/departments/{dept['id']}/team", timeout=60)
    response.raise_for_status()
    team = response.json()['data']
    heads = [m for t in team['tiers'] if t['key'] == 'head' for m in t['members']]
    assert len(heads) == 1 and heads[0]['person_id'] == entry['person_id'], (entry['code'], heads)
    response = requests.get(f"{base}/departments/{dept['slug']}", params={'fields':'id,head_id'}, timeout=60)
    response.raise_for_status()
    assert response.json()['data']['head_id'] == entry['person_id']
    return {'code':entry['code'], 'name':heads[0]['name'], 'verified':True}

results = []
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    jobs = {pool.submit(verify,e):e for e in applied['departments']}
    for job in concurrent.futures.as_completed(jobs):
        try: results.append(job.result())
        except Exception as error: results.append({'code':jobs[job]['code'], 'verified':False, 'error':str(error)})
(OUT/'verification.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
lines=['# COD assignments from AGENDA.pdf','', 'Source: Senate notice dated 24 August 2026, pages 2–3. Only explicit COD rows were imported.', '', '44 departments linked; 41 existing profiles reused; 3 missing profiles created without invented emails, portraits or CVs.', '', '| Row | Department | Local staff profile |', '|---|---|---|']
for e in applied['departments']:
    lines.append(f"| {e['source_row']} | {e['department']} | [{e['person_name']}](http://localhost:3000/staff/{e['person_id']}) |")
lines += ['', f"Public API verification: {sum(r['verified'] for r in results)}/44 passed.", '', 'Seeder: services/main/app/seeders/seed_agenda_cods.py. Included at the end of the normal seed runner. Before-state audit: applied.json. Source digest is recorded in the fixture and appointment notes.']
(OUT/'report.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(json.dumps({'verified':sum(r['verified'] for r in results),'total':len(results),'failures':[r for r in results if not r['verified']]}))
raise SystemExit(0 if all(r['verified'] for r in results) else 1)
