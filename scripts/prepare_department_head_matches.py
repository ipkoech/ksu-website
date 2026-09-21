"""Build a reviewable, source-backed mapping without changing the database."""
from __future__ import annotations

import json
from pathlib import Path

from discover_department_heads import OUT, match


def main():
    people = json.loads((OUT / 'persons.json').read_text())
    rows = json.loads((OUT / 'discovery.json').read_text())
    by_code = {row['department']['code']: row for row in rows}
    management = 'https://kisiiuniversity.ac.ke/university_management_board'
    governance = 'https://kisiiuniversity.ac.ke/dptabout/ict-department-governance-structure'
    supplemental = [
        ('ACAFFAIRS', 'Prof. Kennedy Getange', 'Ag. Registrar (AA)', management, '2026-09-08'),
        ('AHRCS', 'Dr. Stella Omari', 'Ag. Registrar (AHRCS)', management, '2026-09-08'),
        ('FIN', 'CPA Charles M. Mwangi', 'Finance Officer', management, '2026-09-08'),
        ('ICT-CYBER', 'Mr. William Magonga', 'Head, Cyber Security, Staff, and Student Support Section', governance, '2026-09-08'),
        ('ICT-SOFTDEV', 'Mr. Benard Masita', 'Head, Software Development Section', governance, '2026-09-08'),
        ('ICT-INSTALL', 'Mr. Moffat Barongo', 'Head, Hardware and Software Installation and Maintenance Section', governance, '2026-09-08'),
        ('ICT-NET', 'Mr. George Kilili', 'Head, Networking, Internet, and LAN Connectivity Section', governance, '2026-09-08'),
        ('ICT-WEB', 'Mr. Dominic Mariita', 'Head, Website Administration and User Support Section', governance, '2026-09-08'),
        ('PROC', 'Mr. Festus Muema', 'Head of Procurement', 'https://kisiiuniversity.ac.ke/storage/public/downloads/TENDER%20DOCUMENT%20FOR%20SUPPLY%20AND%20DELIVERY%20OF%20COMPUTERS%20-SERVER-PRINTERS-AUDIO%20EQUIPMENT%20-LAPTOP%20AND%20RELATED%20ICT%20EQUIPMENT%20.pdf', '2026-02-16'),
    ]
    for code, name, title, url, evidence_date in supplemental:
        row = by_code[code]
        row['heads'] = [{'name': name, 'designation': title, 'role': title, 'photo_url': None, 'profile_url': None}]
        row['source_url'] = url
        row['source_date'] = evidence_date
    by_person = {p['id']: p for p in people}
    plan = []
    for row in rows:
        department = row['department']
        item = {k: department[k] for k in ('id', 'name', 'slug', 'code', 'department_type', 'head_id')}
        item.update(source_url=row['source_url'], checked_at=row['checked_at'])
        heads = row.get('heads', [])
        if len(heads) != 1:
            item.update(status='unresolved', reason='No named head published on the checked department page' if not row.get('error') else row['error'])
            plan.append(item)
            continue
        head = heads[0]
        candidates = match(head, people, department)
        item.update(source_name=head['name'], designation=head['designation'] or head['role'], profile_url=head.get('profile_url'), candidates=candidates)
        if not candidates:
            item.update(status='unresolved', reason='Published head has no matching active local person record; no fabricated person/email created')
            plan.append(item)
            continue
        # Match the source identity first. Prefer an existing head record, then
        # the actual portrait/name and departmental association. A stable digital
        # identity resolves otherwise equivalent duplicate local profile records.
        def rank(candidate):
            person = by_person[candidate['id']]
            return (candidate['id'] == department['head_id'], candidate['photo_match'], candidate['name_exact'], candidate['same_department'], bool(person.get('external_source_id')))
        candidates.sort(key=rank, reverse=True)
        best = candidates[0]
        if len(candidates) > 1 and rank(candidates[1]) == rank(best):
            item.update(status='unresolved', reason='Multiple equally supported local person records')
        else:
            item.update(status='matched', person_id=best['id'], local_name=best['name'], reason='Existing head, matching portrait/name, department association, then stable external identity; duplicate records are not merged')
        plan.append(item)
    (OUT / 'plan.json').write_text(json.dumps(plan, indent=2), encoding='utf-8')
    print('Matched:', sum(p['status'] == 'matched' for p in plan))
    print('Unresolved named:', [(p['code'],p['source_name'],p['reason']) for p in plan if p['status'] != 'matched' and p.get('source_name')])


if __name__ == '__main__':
    main()
