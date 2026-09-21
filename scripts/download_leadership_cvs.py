"""Download the four published leadership CVs for local media import."""
import hashlib
import json
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / 'services/main/app/seeders'
ASSETS = SEED / 'assets/staff/leadership-cvs'

def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    profiles = json.loads((SEED / 'leadership_profiles_20260908.json').read_text(encoding='utf-8'))['profiles']
    manifest = []
    for spec in profiles:
        if not spec['cv_url']:
            continue
        response = requests.get(spec['cv_url'], timeout=60)
        response.raise_for_status()
        if not response.content.startswith(b'%PDF-'):
            raise ValueError(f"Not a PDF: {spec['cv_url']}")
        filename = spec['key'] + '.pdf'
        (ASSETS / filename).write_bytes(response.content)
        manifest.append(dict(key=spec['key'], filename=filename, source_url=spec['cv_url'],
                             file_size=len(response.content), sha256=hashlib.sha256(response.content).hexdigest()))
    (ASSETS / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    print(f'Downloaded {len(manifest)} PDFs ({sum(x["file_size"] for x in manifest):,} bytes).')

if __name__ == '__main__':
    main()
