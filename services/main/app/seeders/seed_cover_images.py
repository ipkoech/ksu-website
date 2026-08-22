"""Generate and seed creative cover images for schools and departments."""

from __future__ import annotations

import hashlib
import math
import shutil
import struct
import uuid
import zlib
from pathlib import Path
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models import Department, Media, MediaLink, School
from app.schemas.base import slugify

from ._shared import (
    ADMIN_DEPARTMENTS,
    ICT_SECTION_DEPARTMENTS,
    SCHOOL_SPECS,
    SeedContext,
)


COVER_WIDTH = 960
COVER_HEIGHT = 540
COVER_ROOT = "seed/covers"
SCHOOL_COVER_ASSET_ROOT = Path(__file__).with_name("assets") / "school-covers"


def _theme_for_name(name: str) -> str:
    lower = name.lower()
    if any(
        token in lower
        for token in (
            "health",
            "medical",
            "medicine",
            "nursing",
            "pharmacy",
            "clinical",
            "anatomy",
            "pathology",
            "pediatrics",
            "surgery",
            "hiv",
        )
    ):
        return "health"
    if any(
        token in lower
        for token in (
            "ict",
            "comput",
            "software",
            "network",
            "website",
            "information science",
            "e-learning",
            "communication media",
        )
    ):
        return "ict"
    if any(
        token in lower
        for token in (
            "agric",
            "natural",
            "aquatic",
            "fisheries",
            "environment",
            "resources",
        )
    ):
        return "agriculture"
    if any(
        token in lower
        for token in (
            "business",
            "finance",
            "accounting",
            "economics",
            "management",
            "tourism",
            "hospitality",
            "procurement",
            "salaries",
        )
    ):
        return "business"
    if any(
        token in lower
        for token in (
            "education",
            "curriculum",
            "childhood",
            "psychology",
            "student",
            "library",
            "post graduate",
        )
    ):
        return "education"
    if any(token in lower for token in ("law", "legal", "audit", "security")):
        return "law"
    if any(
        token in lower
        for token in (
            "science",
            "physics",
            "chemistry",
            "biology",
            "mathematics",
            "laboratory",
        )
    ):
        return "science"
    if any(
        token in lower
        for token in (
            "arts",
            "language",
            "history",
            "heritage",
            "geography",
            "sociology",
            "philosophy",
            "religious",
            "political",
            "peace",
            "corporate",
        )
    ):
        return "humanities"
    return "administration"


THEMES: dict[str, dict[str, Any]] = {
    "health": {
        "palette": ((16, 109, 122), (54, 179, 162), (238, 249, 246)),
        "motif": "pulse",
    },
    "ict": {
        "palette": ((24, 50, 92), (27, 126, 166), (190, 232, 240)),
        "motif": "circuit",
    },
    "agriculture": {
        "palette": ((34, 92, 55), (112, 154, 72), (229, 238, 197)),
        "motif": "terraces",
    },
    "business": {
        "palette": ((74, 55, 108), (207, 139, 60), (246, 228, 184)),
        "motif": "chart",
    },
    "education": {
        "palette": ((112, 47, 68), (219, 120, 87), (248, 230, 198)),
        "motif": "book",
    },
    "law": {
        "palette": ((49, 54, 63), (159, 134, 89), (235, 225, 205)),
        "motif": "columns",
    },
    "science": {
        "palette": ((31, 83, 112), (85, 176, 134), (226, 239, 219)),
        "motif": "orbit",
    },
    "humanities": {
        "palette": ((95, 55, 88), (196, 95, 105), (245, 217, 192)),
        "motif": "waves",
    },
    "administration": {
        "palette": ((45, 72, 94), (131, 151, 103), (232, 226, 202)),
        "motif": "grid",
    },
}


def _blend(
    base: bytearray,
    width: int,
    x: int,
    y: int,
    color: tuple[int, int, int],
    alpha: float,
) -> None:
    if x < 0 or y < 0 or x >= width or y >= COVER_HEIGHT:
        return
    idx = (y * width + x) * 3
    inv = 1.0 - alpha
    base[idx] = int(base[idx] * inv + color[0] * alpha)
    base[idx + 1] = int(base[idx + 1] * inv + color[1] * alpha)
    base[idx + 2] = int(base[idx + 2] * inv + color[2] * alpha)


def _line(
    base: bytearray,
    width: int,
    p1: tuple[int, int],
    p2: tuple[int, int],
    color: tuple[int, int, int],
    alpha: float,
    thickness: int = 1,
) -> None:
    x1, y1 = p1
    x2, y2 = p2
    dx = abs(x2 - x1)
    dy = -abs(y2 - y1)
    sx = 1 if x1 < x2 else -1
    sy = 1 if y1 < y2 else -1
    err = dx + dy
    while True:
        for oy in range(-thickness, thickness + 1):
            for ox in range(-thickness, thickness + 1):
                if ox * ox + oy * oy <= thickness * thickness:
                    _blend(base, width, x1 + ox, y1 + oy, color, alpha)
        if x1 == x2 and y1 == y2:
            break
        e2 = 2 * err
        if e2 >= dy:
            err += dy
            x1 += sx
        if e2 <= dx:
            err += dx
            y1 += sy


def _circle(
    base: bytearray,
    width: int,
    cx: int,
    cy: int,
    radius: int,
    color: tuple[int, int, int],
    alpha: float,
    *,
    fill: bool = False,
    thickness: int = 2,
) -> None:
    r2 = radius * radius
    inner = max(0, radius - thickness)
    inner2 = inner * inner
    for y in range(cy - radius, cy + radius + 1):
        for x in range(cx - radius, cx + radius + 1):
            d2 = (x - cx) * (x - cx) + (y - cy) * (y - cy)
            if d2 <= r2 and (fill or d2 >= inner2):
                _blend(base, width, x, y, color, alpha)


def _rect(
    base: bytearray,
    width: int,
    x: int,
    y: int,
    w: int,
    h: int,
    color: tuple[int, int, int],
    alpha: float,
) -> None:
    for yy in range(max(0, y), min(COVER_HEIGHT, y + h)):
        for xx in range(max(0, x), min(width, x + w)):
            _blend(base, width, xx, yy, color, alpha)


def _hash_int(value: str) -> int:
    return int(hashlib.sha256(value.encode("utf-8")).hexdigest()[:8], 16)


def _base_canvas(name: str, theme: str) -> bytearray:
    seed = _hash_int(name)
    phase = (seed % 997) / 997
    drift = ((seed >> 10) % 431) / 431
    dark, mid, light = THEMES[theme]["palette"]
    data = bytearray(COVER_WIDTH * COVER_HEIGHT * 3)
    for y in range(COVER_HEIGHT):
        yy = y / max(1, COVER_HEIGHT - 1)
        for x in range(COVER_WIDTH):
            xx = x / max(1, COVER_WIDTH - 1)
            wave = 0.5 + 0.5 * math.sin(
                (xx * (3.4 + drift * 1.8) + yy * (1.8 + phase) + phase * 7.0) * math.pi
            )
            sweep = 0.5 + 0.5 * math.cos((xx * 1.7 - yy * 1.3 + drift * 4.0) * math.pi)
            t = min(
                1.0, max(0.0, 0.16 + xx * 0.42 + yy * 0.34 + wave * 0.07 + sweep * 0.05)
            )
            idx = (y * COVER_WIDTH + x) * 3
            if t < 0.58:
                local = t / 0.58
                c1, c2 = dark, mid
            else:
                local = (t - 0.58) / 0.42
                c1, c2 = mid, light
            vignette = 0.90 - 0.25 * ((xx - 0.5) ** 2 + (yy - 0.5) ** 2)
            data[idx] = int((c1[0] * (1 - local) + c2[0] * local) * vignette)
            data[idx + 1] = int((c1[1] * (1 - local) + c2[1] * local) * vignette)
            data[idx + 2] = int((c1[2] * (1 - local) + c2[2] * local) * vignette)
    return data


def _draw_motif(data: bytearray, name: str, theme: str) -> None:
    seed = _hash_int(name)
    dark, mid, light = THEMES[theme]["palette"]
    motif = THEMES[theme]["motif"]
    ink = light
    accent = tuple(min(255, c + 34) for c in mid)

    if motif == "circuit":
        for i in range(12):
            x = 90 + ((seed >> (i % 16)) + i * 73) % 780
            y = 70 + ((seed >> ((i + 5) % 16)) + i * 41) % 400
            _circle(data, COVER_WIDTH, x, y, 7 + i % 4, ink, 0.42, fill=True)
            _line(
                data,
                COVER_WIDTH,
                (x, y),
                (min(COVER_WIDTH - 80, x + 80 + i * 8), y + ((i % 3) - 1) * 48),
                ink,
                0.22,
                2,
            )
        for x in range(120, COVER_WIDTH, 120):
            _line(
                data, COVER_WIDTH, (x, 80), (x + 80, COVER_HEIGHT - 80), accent, 0.10, 1
            )
    elif motif == "pulse":
        offset = (seed % 70) - 35
        lift = ((seed >> 8) % 50) - 25
        points = [
            (90, 300 + lift),
            (230, 300 + lift // 2),
            (270, 240 + offset),
            (320, 370 - offset // 2),
            (380, 190 + lift),
            (450, 300 - offset // 3),
            (760, 300 + lift // 3),
            (860, 245 + offset // 2),
        ]
        for p1, p2 in zip(points, points[1:]):
            _line(data, COVER_WIDTH, p1, p2, ink, 0.34, 5)
        for x in range(190, 830, 150):
            _circle(
                data,
                COVER_WIDTH,
                x + ((seed >> (x % 13)) % 34) - 17,
                250 + (x % 90) + lift,
                38 + ((seed >> (x % 11)) % 18),
                accent,
                0.16,
                thickness=5,
            )
    elif motif == "terraces":
        slope = ((seed >> 4) % 37) - 18
        for i in range(9):
            y = 170 + i * 35
            _line(
                data,
                COVER_WIDTH,
                (40, y + slope),
                (920, y + int(math.sin(i + seed % 5) * 28) - slope),
                ink,
                0.20,
                3,
            )
        for i in range(8):
            x = 190 + i * 75 + ((seed >> i) % 24) - 12
            _line(data, COVER_WIDTH, (x, 420), (x + 48, 210), accent, 0.12, 2)
    elif motif == "chart":
        for i in range(7):
            h = 90 + ((seed >> i) % 210)
            _rect(data, COVER_WIDTH, 150 + i * 90, 410 - h, 42, h, ink, 0.22)
        chart_points = [
            (120, 360 + ((seed >> 1) % 70)),
            (260, 260 + ((seed >> 3) % 90)),
            (420, 275 + ((seed >> 5) % 80)),
            (610, 185 + ((seed >> 7) % 100)),
            (800, 150 + ((seed >> 9) % 80)),
            (900, 120 + ((seed >> 11) % 70)),
        ]
        for p1, p2 in zip(chart_points, chart_points[1:]):
            _line(data, COVER_WIDTH, p1, p2, accent, 0.30, 4)
    elif motif == "book":
        spread = ((seed >> 6) % 50) - 25
        _line(data, COVER_WIDTH, (210, 165 + spread), (470, 245), ink, 0.24, 4)
        _line(data, COVER_WIDTH, (750, 165 - spread), (490, 245), ink, 0.24, 4)
        _line(data, COVER_WIDTH, (210, 165 + spread), (210, 395), ink, 0.20, 4)
        _line(data, COVER_WIDTH, (750, 165 - spread), (750, 395), ink, 0.20, 4)
        for i in range(7):
            _line(
                data,
                COVER_WIDTH,
                (250, 225 + i * 25),
                (445, 270 + i * 13),
                accent,
                0.13,
                2,
            )
            _line(
                data,
                COVER_WIDTH,
                (710, 225 + i * 25),
                (515, 270 + i * 13),
                accent,
                0.13,
                2,
            )
    elif motif == "columns":
        shift = ((seed >> 12) % 50) - 25
        _rect(data, COVER_WIDTH, 190 + shift, 150, 570, 24, ink, 0.20)
        _rect(data, COVER_WIDTH, 170, 390, 610, 30, ink, 0.22)
        for x in range(235, 720, 120):
            xx = x + shift // 2
            _rect(data, COVER_WIDTH, xx, 180, 48, 205, ink, 0.16)
            _line(data, COVER_WIDTH, (xx - 20, 190), (xx + 68, 190), accent, 0.20, 3)
            _line(data, COVER_WIDTH, (xx - 20, 380), (xx + 68, 380), accent, 0.20, 3)
    elif motif == "orbit":
        cx, cy = 495 + ((seed >> 5) % 80) - 40, 280 + ((seed >> 9) % 50) - 25
        for r in (85, 145, 205):
            for deg in range(0, 360, 3):
                rad = math.radians(deg)
                x = int(cx + math.cos(rad + (seed % 31) / 10) * r)
                y = int(cy + math.sin(rad + (seed % 19) / 10) * r * 0.42)
                _blend(data, COVER_WIDTH, x, y, ink, 0.18)
        for deg in (30, 145, 270):
            _circle(
                data,
                COVER_WIDTH,
                int(cx + math.cos(math.radians(deg)) * 170),
                int(cy + math.sin(math.radians(deg)) * 72),
                12,
                accent,
                0.35,
                fill=True,
            )
    elif motif == "waves":
        for i in range(8):
            last = None
            for x in range(40, 930, 12):
                y = int(180 + i * 34 + math.sin(x / 56 + i * 0.7) * 25)
                if last:
                    _line(
                        data,
                        COVER_WIDTH,
                        last,
                        (x, y),
                        ink if i % 2 else accent,
                        0.16,
                        2,
                    )
                last = (x, y)
    else:
        for x in range(80, 900, 90):
            _line(data, COVER_WIDTH, (x, 80), (x, 460), ink, 0.10, 1)
        for y in range(90, 460, 70):
            _line(data, COVER_WIDTH, (80, y), (900, y), ink, 0.10, 1)
        for i in range(10):
            _circle(
                data,
                COVER_WIDTH,
                140 + i * 78,
                160 + ((seed >> i) % 240),
                24,
                accent,
                0.12,
                thickness=4,
            )

    _circle(data, COVER_WIDTH, 820, 105, 92, light, 0.13, fill=True)
    _circle(data, COVER_WIDTH, 120, 455, 74, dark, 0.12, fill=True)


def _png_chunk(kind: bytes, payload: bytes) -> bytes:
    return (
        struct.pack(">I", len(payload))
        + kind
        + payload
        + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)
    )


def _write_png(path: Path, data: bytearray) -> None:
    rows = []
    row_size = COVER_WIDTH * 3
    for y in range(COVER_HEIGHT):
        rows.append(b"\x00" + bytes(data[y * row_size : (y + 1) * row_size]))
    raw = b"".join(rows)
    encoded = zlib.compress(raw, level=6)
    payload = struct.pack(">IIBBBBB", COVER_WIDTH, COVER_HEIGHT, 8, 2, 0, 0, 0)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + _png_chunk(b"IHDR", payload)
        + _png_chunk(b"IDAT", encoded)
        + _png_chunk(b"IEND", b"")
    )


def _render_cover(path: Path, *, name: str, theme: str) -> None:
    data = _base_canvas(name, theme)
    _draw_motif(data, name, theme)
    _write_png(path, data)


def _bundled_school_cover(target: dict[str, str]) -> Path | None:
    """Return the reviewed, repository-bundled cover for a school target."""

    if target["entity_type"] != "school":
        return None
    path = SCHOOL_COVER_ASSET_ROOT / Path(_target_storage_path(target)).name
    return path if path.is_file() else None


def _materialize_cover(path: Path, target: dict[str, str]) -> bool:
    """Copy a bundled school cover, falling back to generated department artwork."""

    bundled_cover = _bundled_school_cover(target)
    if bundled_cover is not None:
        path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(bundled_cover, path)
        return True
    _render_cover(path, name=target["name"], theme=target["theme"])
    return False


def cover_targets_from_specs() -> list[dict[str, str]]:
    targets: list[dict[str, str]] = []
    for school in SCHOOL_SPECS:
        targets.append(
            {
                "entity_type": "school",
                "code": str(school["code"]),
                "name": str(school["name"]),
                "theme": _theme_for_name(str(school["name"])),
            }
        )
        for department in school["departments"]:
            targets.append(
                {
                    "entity_type": "department",
                    "code": str(department["code"]),
                    "name": str(department["name"]),
                    "theme": _theme_for_name(str(department["name"])),
                }
            )
    for department in ADMIN_DEPARTMENTS:
        targets.append(
            {
                "entity_type": "department",
                "code": str(department["code"]),
                "name": str(department["name"]),
                "theme": _theme_for_name(str(department["name"])),
            }
        )
    for department in ICT_SECTION_DEPARTMENTS:
        targets.append(
            {
                "entity_type": "department",
                "code": str(department["code"]),
                "name": str(department["name"]),
                "theme": _theme_for_name(str(department["name"])),
            }
        )
    return targets


def _target_storage_path(target: dict[str, str]) -> str:
    return f"{COVER_ROOT}/{target['entity_type']}/{slugify(target['code'])}-{slugify(target['name'])}.png"


async def preserves_generated_school_panorama(
    db: AsyncSession,
    school: School,
) -> bool:
    """Return whether a school already has a reviewed panorama cover."""

    if school.cover_image_id is None:
        return False
    cover_image = await db.get(Media, school.cover_image_id)
    metadata = getattr(cover_image, "extra_metadata", None)
    return (
        isinstance(metadata, dict)
        and metadata.get("source") == "generated-school-panorama"
    )


async def _upsert_cover_media(
    db: AsyncSession,
    target: dict[str, str],
    path: Path,
    storage_path: str,
    *,
    bundled: bool = False,
) -> Media:
    content = path.read_bytes()
    file_hash = hashlib.sha256(content).hexdigest()
    media = (
        await db.execute(select(Media).where(Media.storage_path == storage_path))
    ).scalar_one_or_none()
    payload = {
        "filename": path.name,
        "original_filename": path.name,
        "mime_type": "image/png",
        "file_size": len(content),
        "file_hash": file_hash,
        "storage_provider": "local",
        "storage_path": storage_path,
        "public_url": f"/uploads/{storage_path}",
        "cdn_url": None,
        "title": f"{target['name']} cover image",
        "alt_text": f"Kisii University cover image for {target['name']}",
        "description": f"Kisii University branded cover image for {target['name']}.",
        "caption": None,
        "tags": [
            "kisii-university",
            "cover-image",
            target["entity_type"],
            target["theme"],
        ],
        "credit": "Generated for Kisii University seed data",
        "media_type": "image",
        "width": 1200 if bundled else COVER_WIDTH,
        "height": 675 if bundled else COVER_HEIGHT,
        "thumbnail_url": f"/uploads/{storage_path}",
        "thumbnails": None,
        "uploaded_by_id": None,
        "is_public": True,
        "is_processed": True,
        "extra_metadata": {
            "source": "generated-school-cover" if bundled else "generated",
            "seed_asset": True,
            "generated_by": "imagegen" if bundled else "seed_cover_images",
            "theme": target["theme"],
        },
    }
    if media is None:
        media = Media(id=uuid.uuid4(), **payload)
        db.add(media)
    else:
        for field_name, value in payload.items():
            setattr(media, field_name, value)
    await db.flush()
    return media


async def _link_cover(
    db: AsyncSession, media: Media, *, entity_type: str, entity_id: uuid.UUID
) -> None:
    link = (
        await db.execute(
            select(MediaLink).where(
                MediaLink.media_id == media.id,
                MediaLink.entity_type == entity_type,
                MediaLink.entity_id == entity_id,
                MediaLink.role == "cover-image",
            )
        )
    ).scalar_one_or_none()
    payload = {
        "media_id": media.id,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "role": "cover-image",
        "folder_id": None,
        "display_order": 1,
        "is_public": True,
    }
    if link is None:
        db.add(MediaLink(id=uuid.uuid4(), **payload))
    else:
        for field_name, value in payload.items():
            setattr(link, field_name, value)
    await db.flush()


async def seed_cover_images(db: AsyncSession, ctx: SeedContext) -> None:
    settings = get_settings()
    upload_root = settings.upload_dir_path
    targets = cover_targets_from_specs()
    seen_targets = {(target["entity_type"], target["code"]) for target in targets}
    for target in targets:
        entity: School | Department | None
        if target["entity_type"] == "school":
            entity = ctx.schools.get(target["code"])
            if entity is None:
                entity = (
                    await db.execute(
                        select(School).where(School.code == target["code"])
                    )
                ).scalar_one_or_none()
        else:
            entity = ctx.departments.get(target["code"])
            if entity is None:
                entity = (
                    await db.execute(
                        select(Department).where(Department.code == target["code"])
                    )
                ).scalar_one_or_none()
        if entity is None:
            continue
        if (
            target["entity_type"] == "school"
            and isinstance(entity, School)
            and await preserves_generated_school_panorama(db, entity)
        ):
            continue

        storage_path = _target_storage_path(target)
        absolute_path = upload_root / storage_path
        bundled = _materialize_cover(absolute_path, target)
        media = await _upsert_cover_media(
            db, target, absolute_path, storage_path, bundled=bundled
        )
        entity.cover_image_id = media.id
        await _link_cover(
            db, media, entity_type=target["entity_type"], entity_id=entity.id
        )

    fallback_schools = (
        await db.execute(
            select(School).where(
                School.is_public.is_(True),
                School.is_active.is_(True),
                School.cover_image_id.is_(None),
            )
        )
    ).scalars()
    for school in fallback_schools:
        key = ("school", school.code)
        if key in seen_targets:
            continue
        seen_targets.add(key)
        target = {
            "entity_type": "school",
            "code": school.code,
            "name": school.name,
            "theme": _theme_for_name(school.name),
        }
        storage_path = _target_storage_path(target)
        absolute_path = upload_root / storage_path
        bundled = _materialize_cover(absolute_path, target)
        media = await _upsert_cover_media(
            db, target, absolute_path, storage_path, bundled=bundled
        )
        school.cover_image_id = media.id
        await _link_cover(db, media, entity_type="school", entity_id=school.id)

    fallback_departments = (
        await db.execute(
            select(Department).where(
                Department.is_public.is_(True),
                Department.is_active.is_(True),
                Department.cover_image_id.is_(None),
            )
        )
    ).scalars()
    for department in fallback_departments:
        key = ("department", department.code)
        if key in seen_targets:
            continue
        seen_targets.add(key)
        target = {
            "entity_type": "department",
            "code": department.code,
            "name": department.name,
            "theme": _theme_for_name(department.name),
        }
        storage_path = _target_storage_path(target)
        absolute_path = upload_root / storage_path
        _render_cover(absolute_path, name=target["name"], theme=target["theme"])
        media = await _upsert_cover_media(db, target, absolute_path, storage_path)
        department.cover_image_id = media.id
        await _link_cover(db, media, entity_type="department", entity_id=department.id)
    await db.flush()
