"""Read official department pages and propose local identity matches (no writes)."""
from __future__ import annotations

import concurrent.futures
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output/department-head-matching"
BASE = "https://kisiiuniversity.ac.ke"


def name_tokens(value):
    value = re.sub(r"\bph\.?d\.?\b", "", value, flags=re.I)
    return set(re.findall(r"[a-z]+", value.lower())) - {"dr", "prof", "professor", "mr", "mrs", "ms", "miss", "sr", "rev", "eng", "cpa"}


def fetch(department):
    url = f"{BASE}/dpt/{department['slug']}"
    result = {"department": department, "source_url": url, "checked_at": datetime.now(timezone.utc).isoformat()}
    try:
        response = requests.get(url, timeout=35)
        result["http_status"] = response.status_code
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        result["page_title"] = soup.title.get_text(" ", strip=True) if soup.title else ""
        result["department_links"] = sorted({urljoin(BASE, a["href"]) for a in soup.select('a[href]') if '/dpt/' in a['href']})
        heads = []
        for card in soup.select('.staff-card'):
            badge = card.select_one('.role-badge')
            role = badge.get_text(' ', strip=True) if badge else ''
            if not re.search(r'\b(HOD|COD)\b|head of department', role, re.I):
                continue
            heading = card.select_one('h4,h5')
            modal = soup.select_one(card.get('data-target', '#missing'))
            profile = modal.select_one('a.bio-btn') if modal else None
            image = card.select_one('img')
            description = card.select_one('p')
            heads.append({
                'name': heading.get_text(' ', strip=True),
                'role': role,
                'designation': description.get_text(' ', strip=True) if description else '',
                'profile_url': profile.get('href') if profile else None,
                'photo_url': image.get('src', '').strip() if image else None,
                'source_person_id': card.get('data-target', '').removeprefix('#bio'),
            })
        result['heads'] = heads
        if not heads:
            # Keep only concise leadership labels for manual examination, never full biographies.
            result['leadership_labels'] = [h.get_text(' ', strip=True) for h in soup.select('h1,h2,h3,h4,h5') if re.search('head|director|chair|registrar|manager', h.get_text(), re.I)][:12]
    except Exception as error:
        result['error'] = str(error)
    return result


def match(head, people, department):
    tokens = name_tokens(head['name'])
    candidates = []
    for person in people:
        local = name_tokens(person.get('full_name') or '')
        photo_match = bool(head.get('photo_url') and 'default-avatar' not in head['photo_url'] and head['photo_url'] == person.get('photo_url'))
        exact = tokens == local
        shared = len(tokens & local)
        subset = shared >= 2 and (tokens <= local or local <= tokens)
        if photo_match or exact or subset:
            candidates.append({'id': person['id'], 'name': person.get('full_name'), 'photo_match': photo_match, 'name_exact': exact, 'name_subset': subset, 'same_department': person.get('department_id') == department['id']})
    return candidates


def main():
    departments = json.loads((OUT / 'departments.json').read_text())
    people = json.loads((OUT / 'persons.json').read_text())
    existing = {}
    path = OUT / 'discovery.json'
    if path.exists():
        existing = {r['department']['id']: r for r in json.loads(path.read_text()) if 'error' not in r}
    rows = list(existing.values())
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        futures = [pool.submit(fetch, d) for d in departments if d['id'] not in existing]
        for future in concurrent.futures.as_completed(futures):
            row = future.result()
            for head in row.get('heads', []):
                head['candidates'] = match(head, people, row['department'])
            rows.append(row)
            path.write_text(json.dumps(sorted(rows, key=lambda r:r['department']['name']), indent=2), encoding='utf-8')
            print(row['department']['code'], [(h['name'], len(h['candidates'])) for h in row.get('heads', [])], row.get('error',''), flush=True)
    print('Saved', len(rows), 'department checks to', path)


if __name__ == '__main__':
    main()
