"""Apply reviewed official leadership profiles to canonical seed identities."""
from __future__ import annotations

import hashlib
import json
import mimetypes
import shutil
import uuid
from pathlib import Path
from urllib.parse import unquote, urlparse

from sqlalchemy import select

from app.models import Media
from app.core.config import get_settings
from app.helpers.storage import get_public_url

SNAPSHOT = json.loads(Path(__file__).with_name('leadership_profiles_20260908.json').read_text(encoding='utf-8'))
PROFILE_FIELDS = {'bio', 'full_bio', 'qualifications', 'education_background', 'website_url'}


async def local_cv_media(db, spec):
    asset_dir = Path(__file__).parent / 'assets/staff/leadership-cvs'
    manifest = json.loads((asset_dir / 'manifest.json').read_text(encoding='utf-8'))
    entry = next(item for item in manifest if item['key'] == spec['key'])
    asset = asset_dir / entry['filename']
    content = asset.read_bytes()
    if not content.startswith(b'%PDF-') or hashlib.sha256(content).hexdigest() != entry['sha256']:
        raise ValueError(f"Invalid CV asset: {asset}")
    storage_path = f"seed/staff/leadership-cvs/{entry['filename']}"
    destination = get_settings().upload_dir_path / storage_path
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(asset, destination)
    media = await db.scalar(select(Media).where(Media.storage_path == storage_path, Media.deleted_at.is_(None)))
    if media is None:
        media = Media(id=uuid.uuid5(uuid.NAMESPACE_URL, storage_path))
        db.add(media)
    payload = dict(filename=entry['filename'], original_filename=unquote(Path(urlparse(spec['cv_url']).path).name),
                   mime_type='application/pdf', file_size=len(content), file_hash=entry['sha256'],
                   storage_provider='local', storage_path=storage_path, public_url=get_public_url(storage_path),
                   title=f"Curriculum Vitae - {spec['full_name']}", media_type='document',
                   is_public=True, is_processed=True, credit='Kisii University',
                   extra_metadata={'source_url': spec['cv_url'], 'verified_on': SNAPSHOT['verified_on']})
    for field, value in payload.items():
        setattr(media, field, value)
    await db.flush()
    return media


async def official_media(db, spec, url, media_type):
    existing = await db.scalar(select(Media).where(Media.public_url == url, Media.deleted_at.is_(None)).order_by(Media.id))
    if existing is not None:
        return existing
    filename = unquote(Path(urlparse(url).path).name)
    media = Media(
        id=uuid.uuid5(uuid.NAMESPACE_URL, url), filename=filename, original_filename=filename,
        mime_type=mimetypes.guess_type(filename)[0] or ('application/pdf' if media_type == 'document' else 'image/jpeg'),
        file_size=0, file_hash=hashlib.sha256(url.encode()).hexdigest(),
        storage_provider='remote', storage_path=url, public_url=url,
        title=f"{spec['full_name']} — {'CV' if media_type == 'document' else 'portrait'}",
        alt_text=f"Portrait of {spec['full_name']}" if media_type == 'image' else None,
        media_type=media_type, is_public=True, is_processed=True, credit='Kisii University',
        tags=['leadership', 'official-profile'],
        extra_metadata={'source_url': spec['source_url'], 'sources': spec['sources'], 'verified_on': SNAPSHOT['verified_on']},
    )
    db.add(media)
    await db.flush()
    return media


async def seed_leadership_profiles(db, ctx):
    """Update only profile content and attachments; never create or rematch people."""
    changed = []
    for spec in SNAPSHOT['profiles']:
        person = ctx.people[spec['key']]
        if person.deleted_at is not None or not person.is_active:
            raise ValueError(f"Inactive canonical leadership person: {spec['key']}")
        if not set(spec['fields']).issubset(PROFILE_FIELDS):
            raise ValueError(f"Unexpected profile fields: {spec['key']}")
        fields = [*spec['fields'], 'photo_id'] + (['cv_file_id'] if spec['cv_url'] else [])
        before = {field: getattr(person, field) for field in fields}
        for field, value in spec['fields'].items():
            setattr(person, field, value)
        person.photo_id = (await official_media(db, spec, spec['photo_url'], 'image')).id
        if spec['cv_url']:
            person.cv_file_id = (await local_cv_media(db, spec)).id
        changed.append(dict(key=spec['key'], person_id=str(person.id), name=person.full_name,
                            sources=spec['sources'], before=before,
                            after={field: getattr(person, field) for field in fields}))
    await db.flush()
    return changed
