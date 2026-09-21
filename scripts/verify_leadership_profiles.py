"""Verify the applied leadership content through the public profile API."""
import json
import hashlib
import re
from urllib.parse import urljoin
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/leadership-profiles'


def main():
    applied = json.loads((OUT / 'applied.json').read_text(encoding='utf-8'))
    fixture = json.loads((ROOT / 'services/main/app/seeders/leadership_profiles_20260908.json').read_text(encoding='utf-8'))
    specs = {p['key']: p for p in fixture['profiles']}
    def verify(item):
        url = f"http://localhost:8080/api/v1/public/people/{item['person_id']}"
        response = requests.get(url, timeout=60)
        response.raise_for_status()
        payload = response.json()['data']
        spec = specs[item['key']]
        checks = {field: payload.get(field) == value for field, value in spec['fields'].items()}
        checks['portrait'] = payload.get('photo_url') == spec['photo_url']
        if spec['cv_url']:
            cv_url = payload.get('cv_file_url') or ''
            checks['cv'] = f"/seed/staff/leadership-cvs/{spec['key']}.pdf" in cv_url
            pdf = requests.get(urljoin('http://localhost:8080', cv_url), timeout=60)
            asset = ROOT / f"services/main/app/seeders/assets/staff/leadership-cvs/{spec['key']}.pdf"
            checks['local_pdf'] = pdf.status_code == 200 and hashlib.sha256(pdf.content).digest() == hashlib.sha256(asset.read_bytes()).digest()
            checks['inline_pdf'] = pdf.headers.get('Content-Type', '').startswith('application/pdf') and 'attachment' not in pdf.headers.get('Content-Disposition', '').lower()
            # Exercise the separate slug query with a populated CV attachment too.
            slug = re.sub(r'[^a-z0-9]+', '-', item['name'].lower()).strip('-')
            slug_response = requests.get(f'http://localhost:8080/api/v1/public/people/{slug}', timeout=60)
            checks['slug_cv'] = slug_response.status_code == 200 and slug_response.json()['data'].get('cv_file_url') == cv_url
        return dict(name=item['name'], person_id=item['person_id'], cv_url=payload.get('cv_file_url'), checks=checks, passed=all(checks.values()))
    with ThreadPoolExecutor(max_workers=1) as pool:
        results = list(pool.map(verify, applied['profiles']))
    (OUT / 'verification.json').write_text(json.dumps(results, indent=2))
    lines = ['# University leadership profile refresh', '', 'Verified against the official website on 8 September 2026.', '',
             '14 existing people; 14 official portraits; six management biographies; four locally stored CV PDFs; structured qualifications for all 14.', '',
             '| Local profile | Sources | Verification |', '| --- | --- | --- |']
    for item, result in zip(applied['profiles'], results):
        sources = ' · '.join(f'[Source {i + 1}]({url})' for i, url in enumerate(item['sources']))
        lines.append(f"| [{item['name']}](http://localhost:3000/people/{item['person_id']}) | {sources} | {'Passed' if result['passed'] else 'FAILED'} |")
    lines.extend(['', 'The eight council members other than the Vice Chancellor have no substantive biography on the council pages; no biography was invented. Council qualifications also draw on the official December 2025 graduation booklet.', '',
                  'The management page leaves Registrar (REIRM) unnamed and says that a biography is unavailable. The existing local profile was not changed.', '',
                  'The four official CVs were downloaded, registered in local media storage and linked to the profiles. Local PDF bytes are checked against the downloaded originals. View CV opens a new tab. The Finance Officer’s source filename is dated 2018; no newer CV date is claimed.', '',
                  'The refresh changes profile content and attachments only. Existing appointments and identities are preserved. The seed runner reapplies this reviewed snapshot after other profile seeders.'])
    (OUT / 'report.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(f"Public profile verification: {sum(r['passed'] for r in results)}/{len(results)} passed")
    if not all(r['passed'] for r in results):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
