"""Domain services for the Meet the Vice Chancellor publishing hub."""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Awaitable, Callable, Iterable

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models import (
    ContentWorkflowLog,
    Event,
    Media,
    MediaLink,
    News,
    VcGalleryAlbum,
    VcHub,
    VcHubPlacement,
    VcPortrait,
    VcSpeech,
    VcSpeechVideo,
    VcVideo,
)
from ..schemas.vice_chancellor import (
    VcGalleryAlbumCreate,
    VcGalleryMediaCreate,
    VcHubPlacementCreate,
    VcHubUpdate,
    VcSpeechCreate,
    VcSpeechVideoCreate,
    VcVideoCreate,
)
from ._base import apply_updates, paginate_query
from .vice_chancellor_youtube import (
    YouTubeMetadata,
    YouTubeMetadataUnavailable,
    YouTubeReference,
    fetch_youtube_oembed,
    normalize_youtube_url,
)

MetadataLoader = Callable[[YouTubeReference], Awaitable[YouTubeMetadata]]


@dataclass(frozen=True, slots=True)
class VideoMutationResult:
    record: VcVideo
    created: bool
    metadata_warning: str | None = None


def _visibility(model: type, now: datetime) -> tuple[Any, ...]:
    return (
        model.deleted_at.is_(None),
        model.status == "published",
        model.workflow_status == "published",
        model.is_public.is_(True),
        model.is_published.is_(True),
        or_(model.valid_from.is_(None), model.valid_from <= now),
        or_(model.valid_to.is_(None), model.valid_to >= now),
        or_(model.scheduled_publish_at.is_(None), model.scheduled_publish_at <= now),
        or_(model.expires_at.is_(None), model.expires_at >= now),
    )


def _is_public_now(record: Any, now: datetime) -> bool:
    if record is None:
        return False
    return (
        getattr(record, "deleted_at", None) is None
        and getattr(record, "status", None) == "published"
        and getattr(record, "workflow_status", None) == "published"
        and bool(getattr(record, "is_public", False))
        and bool(getattr(record, "is_published", False))
        and (getattr(record, "valid_from", None) is None or record.valid_from <= now)
        and (getattr(record, "valid_to", None) is None or record.valid_to >= now)
        and (getattr(record, "scheduled_publish_at", None) is None or record.scheduled_publish_at <= now)
        and (getattr(record, "expires_at", None) is None or record.expires_at >= now)
    )


def serialize_public_media(media: Media | None) -> dict[str, Any] | None:
    """Return the safe public representation of an asset."""
    if media is None or not media.is_public:
        return None
    return {
        "id": str(media.id),
        "filename": media.filename,
        "original_filename": media.original_filename,
        "mime_type": media.mime_type,
        "media_type": media.media_type,
        "url": media.cdn_url or media.public_url,
        "thumbnail_url": media.thumbnail_url,
        "alt_text": media.alt_text,
        "title": media.title,
        "caption": media.caption,
        "width": media.width,
        "height": media.height,
        "duration": media.duration,
    }


async def validate_media(
    db: AsyncSession,
    media_id: uuid.UUID | None,
    *,
    allowed_types: Iterable[str],
) -> Media | None:
    if media_id is None:
        return None
    media = await db.get(Media, media_id)
    if media is None or media.deleted_at is not None:
        raise ValueError("Media asset was not found")
    allowed = set(allowed_types)
    if media.media_type not in allowed:
        raise ValueError(f"Media must be one of: {', '.join(sorted(allowed))}")
    return media


async def validate_placement_source(db: AsyncSession, payload: VcHubPlacementCreate) -> None:
    model_and_id = {
        "activities": (News, payload.news_id),
        "events": (Event, payload.event_id),
        "speeches": (VcSpeech, payload.speech_id),
        "videos": (VcVideo, payload.video_id),
        "gallery": (VcGalleryAlbum, payload.gallery_album_id),
    }[payload.section]
    source = await db.get(*model_and_id)
    if source is None or source.deleted_at is not None:
        raise ValueError(f"The {payload.section} source was not found")


async def _reset_published_edit(
    db: AsyncSession, record: Any, actor_id: uuid.UUID, changed_fields: dict[str, Any]
) -> None:
    current = record.workflow_status or record.status
    if current != "published":
        return
    record.status = "draft"
    record.workflow_status = "draft"
    record.is_published = False
    db.add(ContentWorkflowLog(
        content_type="vice-chancellor",
        content_id=record.id,
        from_status=current,
        to_status="draft",
        action="edit_reset",
        actor_id=actor_id,
        changed_fields=changed_fields,
    ))


class ViceChancellorWorkflowService:
    TRANSITIONS = {
        "draft": {"submit": "in_review", "archive": "archived"},
        "changes_requested": {"submit": "in_review", "archive": "archived"},
        "in_review": {"approve": "approved", "request_changes": "changes_requested", "archive": "archived"},
        "approved": {"publish": "published", "archive": "archived"},
        "published": {"unpublish": "approved", "archive": "archived"},
        "archived": {},
    }

    @classmethod
    async def transition(
        cls,
        db: AsyncSession,
        record: Any,
        action: str,
        actor_id: uuid.UUID,
        *,
        reason: str | None = None,
    ) -> Any:
        current = record.workflow_status or record.status
        target = cls.TRANSITIONS.get(current, {}).get(action)
        if target is None:
            raise ValueError(f"Cannot {action} vice-chancellor content in {current}")
        now = datetime.now(timezone.utc)
        record.status = target
        record.workflow_status = target
        record.is_published = target == "published"
        if action == "submit":
            record.submitted_by_id, record.submitted_at = actor_id, now
        elif action in {"approve", "request_changes"}:
            record.reviewed_by_id, record.reviewed_at = actor_id, now
            record.rejection_reason = reason if action == "request_changes" else None
            if action == "approve":
                record.approved_by_id, record.approved_at = actor_id, now
        elif action == "publish":
            record.published_by_id, record.published_at = actor_id, now
        elif action == "unpublish":
            record.unpublished_by_id, record.unpublished_at = actor_id, now
        elif action == "archive":
            record.archived_at = now
        db.add(ContentWorkflowLog(
            content_type="vice-chancellor",
            content_id=record.id,
            from_status=current,
            to_status=target,
            action=action,
            actor_id=actor_id,
            comments=reason,
        ))
        await db.flush()
        return record


class ViceChancellorAdminService:
    @staticmethod
    async def get_or_create_hub(db: AsyncSession) -> VcHub:
        result = await db.execute(select(VcHub).where(VcHub.deleted_at.is_(None)))
        hub = result.scalar_one_or_none()
        if hub is None:
            hub = VcHub(scope_type="university", scope_id=None)
            db.add(hub)
            await db.flush()
        return hub

    @staticmethod
    async def update_hub(db: AsyncSession, hub: VcHub, payload: VcHubUpdate, actor_id: uuid.UUID) -> VcHub:
        values = payload.model_dump(exclude_unset=True)
        if "hero_media_id" in values:
            await validate_media(db, values["hero_media_id"], allowed_types={"image"})
        if values.get("welcome_video_id") and await db.get(VcVideo, values["welcome_video_id"]) is None:
            raise ValueError("Welcome video was not found")
        await _reset_published_edit(db, hub, actor_id, values)
        apply_updates(hub, **values)
        hub.updated_by_id = actor_id
        await db.flush()
        return hub

    @staticmethod
    async def list_records(db: AsyncSession, model: type, *, page: int = 1, per_page: int = 20):
        query = model.active_query().order_by(model.display_order, model.created_at.desc())
        return await paginate_query(db, query, page=page, per_page=per_page)

    @classmethod
    async def list_videos(cls, db: AsyncSession, **kwargs):
        return await cls.list_records(db, VcVideo, **kwargs)

    @classmethod
    async def list_speeches(cls, db: AsyncSession, **kwargs):
        return await cls.list_records(db, VcSpeech, **kwargs)

    @classmethod
    async def list_galleries(cls, db: AsyncSession, **kwargs):
        return await cls.list_records(db, VcGalleryAlbum, **kwargs)

    @staticmethod
    async def create_video(
        db: AsyncSession,
        payload: VcVideoCreate,
        actor_id: uuid.UUID,
        *,
        metadata_loader: MetadataLoader = fetch_youtube_oembed,
    ) -> VideoMutationResult:
        values = payload.model_dump()
        warning = None
        if payload.provider == "youtube":
            reference = normalize_youtube_url(payload.source_url or "")
            existing = (await db.execute(
                select(VcVideo).where(
                    VcVideo.provider == "youtube",
                    VcVideo.provider_video_id == reference.video_id,
                    VcVideo.deleted_at.is_(None),
                )
            )).scalar_one_or_none()
            if existing is not None:
                return VideoMutationResult(existing, False)
            values.update(
                source_url=reference.canonical_url,
                provider_video_id=reference.video_id,
                embed_url=reference.embed_url,
                thumbnail_url=reference.thumbnail_url,
            )
            try:
                metadata = await metadata_loader(reference)
                if not values.get("title"):
                    values["title"] = metadata.title
                values["thumbnail_url"] = metadata.thumbnail_url or reference.thumbnail_url
            except YouTubeMetadataUnavailable as exc:
                warning = str(exc)
        else:
            await validate_media(db, payload.uploaded_media_id, allowed_types={"video"})
            values.update(provider_video_id=None, embed_url=None, thumbnail_url=None)
        if payload.poster_media_id:
            await validate_media(db, payload.poster_media_id, allowed_types={"image"})
        record = VcVideo(**values, owner_portal="corporate_communication")
        db.add(record)
        await db.flush()
        return VideoMutationResult(record, True, warning)

    @staticmethod
    async def update_video(db: AsyncSession, record: VcVideo, values: dict[str, Any], actor_id: uuid.UUID) -> VcVideo:
        if "poster_media_id" in values:
            await validate_media(db, values["poster_media_id"], allowed_types={"image"})
        if "uploaded_media_id" in values:
            await validate_media(db, values["uploaded_media_id"], allowed_types={"video"})
        if "source_url" in values and record.provider == "youtube":
            reference = normalize_youtube_url(values["source_url"])
            values.update(source_url=reference.canonical_url, provider_video_id=reference.video_id,
                          embed_url=reference.embed_url, thumbnail_url=reference.thumbnail_url)
        await _reset_published_edit(db, record, actor_id, values)
        apply_updates(record, **values)
        await db.flush()
        return record

    @staticmethod
    async def refresh_video_metadata(db: AsyncSession, record: VcVideo, *, metadata_loader: MetadataLoader = fetch_youtube_oembed) -> VcVideo:
        if record.provider != "youtube" or not record.source_url:
            raise ValueError("Only YouTube video metadata can be refreshed")
        reference = normalize_youtube_url(record.source_url)
        metadata = await metadata_loader(reference)
        record.thumbnail_url = metadata.thumbnail_url or reference.thumbnail_url
        await db.flush()
        return record

    @staticmethod
    async def create_speech(db: AsyncSession, payload: VcSpeechCreate, actor_id: uuid.UUID) -> VcSpeech:
        if payload.featured_media_id:
            await validate_media(db, payload.featured_media_id, allowed_types={"image"})
        if payload.document_media_id:
            await validate_media(db, payload.document_media_id, allowed_types={"document"})
        record = VcSpeech(**payload.model_dump(), author_user_id=actor_id, owner_portal="corporate_communication")
        db.add(record)
        await db.flush()
        return record

    @staticmethod
    async def update_speech(db: AsyncSession, record: VcSpeech, values: dict[str, Any], actor_id: uuid.UUID) -> VcSpeech:
        if "featured_media_id" in values:
            await validate_media(db, values["featured_media_id"], allowed_types={"image"})
        if "document_media_id" in values:
            await validate_media(db, values["document_media_id"], allowed_types={"document"})
        await _reset_published_edit(db, record, actor_id, values)
        apply_updates(record, **values)
        await db.flush()
        return record

    @staticmethod
    async def attach_speech_video(db: AsyncSession, speech: VcSpeech, payload: VcSpeechVideoCreate) -> VcSpeechVideo:
        if await db.get(VcVideo, payload.video_id) is None:
            raise ValueError("Video was not found")
        if payload.role == "primary":
            existing = (await db.execute(select(VcSpeechVideo).where(
                VcSpeechVideo.speech_id == speech.id,
                VcSpeechVideo.role == "primary",
                VcSpeechVideo.deleted_at.is_(None),
            ))).scalar_one_or_none()
            if existing:
                raise ValueError("Speech already has a primary video")
        link = VcSpeechVideo(speech_id=speech.id, **payload.model_dump())
        db.add(link)
        await db.flush()
        return link

    @staticmethod
    async def create_gallery(db: AsyncSession, payload: VcGalleryAlbumCreate, actor_id: uuid.UUID) -> VcGalleryAlbum:
        if payload.cover_media_id:
            await validate_media(db, payload.cover_media_id, allowed_types={"image"})
        record = VcGalleryAlbum(**payload.model_dump(), owner_portal="corporate_communication")
        db.add(record)
        await db.flush()
        return record

    @staticmethod
    async def update_gallery(db: AsyncSession, record: VcGalleryAlbum, values: dict[str, Any], actor_id: uuid.UUID) -> VcGalleryAlbum:
        if "cover_media_id" in values:
            await validate_media(db, values["cover_media_id"], allowed_types={"image"})
        await _reset_published_edit(db, record, actor_id, values)
        apply_updates(record, **values)
        await db.flush()
        return record

    @staticmethod
    async def attach_gallery_media(db: AsyncSession, album: VcGalleryAlbum, payload: VcGalleryMediaCreate) -> MediaLink:
        media = await validate_media(db, payload.media_id, allowed_types={"image"})
        if payload.caption is not None:
            media.caption = payload.caption
        if payload.alt_text is not None:
            media.alt_text = payload.alt_text
        link = MediaLink(
            media_id=media.id, entity_type="vc_gallery_album", entity_id=album.id,
            role="gallery", display_order=payload.display_order, is_public=True,
            status="published", workflow_status="published", is_published=True,
            published_at=datetime.now(timezone.utc),
        )
        db.add(link)
        await db.flush()
        return link

    @staticmethod
    async def reorder_gallery_media(db: AsyncSession, album_id: uuid.UUID, items: Iterable[tuple[uuid.UUID, int]]) -> None:
        for link_id, order in items:
            link = await db.get(MediaLink, link_id)
            if link is None or link.entity_type != "vc_gallery_album" or link.entity_id != album_id or link.deleted_at is not None:
                raise ValueError("Media link does not belong to this gallery")
            link.display_order = order
        await db.flush()

    @staticmethod
    async def create_placement(db: AsyncSession, hub: VcHub, payload: VcHubPlacementCreate) -> VcHubPlacement:
        await validate_placement_source(db, payload)
        if payload.poster_media_id:
            await validate_media(db, payload.poster_media_id, allowed_types={"image"})
        record = VcHubPlacement(hub_id=hub.id, **payload.model_dump())
        db.add(record)
        await db.flush()
        return record

    @staticmethod
    async def reorder_placements(db: AsyncSession, hub_id: uuid.UUID, items: Iterable[tuple[uuid.UUID, int]]) -> None:
        for placement_id, order in items:
            placement = await db.get(VcHubPlacement, placement_id)
            if placement is None or placement.hub_id != hub_id or placement.deleted_at is not None:
                raise ValueError("Placement does not belong to this hub")
            placement.display_order = order
        await db.flush()


def _serialize_video(video: VcVideo) -> dict[str, Any]:
    return {
        "id": str(video.id), "title": video.title, "slug": video.slug,
        "summary": video.summary, "provider": video.provider, "source_url": video.source_url,
        "embed_url": video.embed_url, "thumbnail_url": video.thumbnail_url,
        "duration_seconds": video.duration_seconds, "recorded_at": video.recorded_at,
        "category": video.category, "cover": serialize_public_media(video.poster_media),
    }


def _serialize_speech(speech: VcSpeech) -> dict[str, Any]:
    return {
        "id": str(speech.id), "title": speech.title, "slug": speech.slug,
        "summary": speech.summary, "plain_text": speech.plain_text, "rich_text": speech.rich_text,
        "speech_type": speech.speech_type, "delivered_at": speech.delivered_at,
        "venue": speech.venue, "occasion": speech.occasion, "audience": speech.audience,
        "cover": serialize_public_media(speech.featured_media),
    }


def _serialize_gallery(album: VcGalleryAlbum) -> dict[str, Any]:
    return {
        "id": str(album.id), "title": album.title, "slug": album.slug,
        "summary": album.summary, "event_date": album.event_date, "location": album.location,
        "cover": serialize_public_media(album.cover_media),
    }


class ViceChancellorPublicService:
    @staticmethod
    async def get_hub(db: AsyncSession, *, now: datetime | None = None) -> dict[str, Any] | None:
        now = now or datetime.now(timezone.utc)
        query = (
            select(VcHub)
            .options(
                selectinload(VcHub.hero_media),
                selectinload(VcHub.portraits).selectinload(VcPortrait.media),
                selectinload(VcHub.welcome_video).selectinload(VcVideo.poster_media),
                selectinload(VcHub.staff_assignment),
                selectinload(VcHub.placements).selectinload(VcHubPlacement.poster_media),
                selectinload(VcHub.placements).selectinload(VcHubPlacement.news).selectinload(News.featured_media),
                selectinload(VcHub.placements).selectinload(VcHubPlacement.event).selectinload(Event.featured_media),
                selectinload(VcHub.placements).selectinload(VcHubPlacement.speech).selectinload(VcSpeech.featured_media),
                selectinload(VcHub.placements).selectinload(VcHubPlacement.video).selectinload(VcVideo.poster_media),
                selectinload(VcHub.placements).selectinload(VcHubPlacement.gallery_album).selectinload(VcGalleryAlbum.cover_media),
            )
            .where(*_visibility(VcHub, now))
        )
        hub = (await db.execute(query)).scalar_one_or_none()
        if hub is None:
            return None
        sections: dict[str, list[dict[str, Any]]] = {section: [] for section in hub.section_order}
        for placement in sorted(hub.placements, key=lambda item: item.display_order):
            if placement.deleted_at is not None or not placement.is_enabled:
                continue
            if placement.visible_from and placement.visible_from > now:
                continue
            if placement.visible_to and placement.visible_to < now:
                continue
            source = placement.news or placement.event or placement.speech or placement.video or placement.gallery_album
            if not _is_public_now(source, now):
                continue
            if placement.section == "speeches":
                item = _serialize_speech(source)
            elif placement.section == "videos":
                item = _serialize_video(source)
            elif placement.section == "gallery":
                item = _serialize_gallery(source)
            else:
                item = {
                    "id": str(source.id), "title": source.title, "slug": source.slug,
                    "summary": getattr(source, "summary", None),
                    "start_date": getattr(source, "start_date", None),
                    "location": getattr(source, "location", None),
                    "cover": serialize_public_media(
                        placement.poster_media or getattr(source, "featured_media", None)
                    ),
                }
            if placement.poster_media is not None:
                item["cover"] = serialize_public_media(placement.poster_media)
            item.update(
                editorial_label=placement.editorial_label,
                title=placement.title_override or item.get("title"),
                summary=placement.summary_override or item.get("summary"),
                is_featured=placement.is_featured,
            )
            sections.setdefault(placement.section, []).append(item)
        hero_media = serialize_public_media(hub.hero_media)
        active_portrait = next(
            (
                portrait
                for portrait in hub.portraits
                if portrait.deleted_at is None and portrait.media_id == hub.hero_media_id
            ),
            None,
        )
        if hero_media is not None and active_portrait and active_portrait.alt_text:
            hero_media["alt_text"] = active_portrait.alt_text
        return {
            "id": str(hub.id), "eyebrow": hub.eyebrow, "title": hub.title,
            "introduction": hub.introduction, "welcome_title": hub.welcome_title,
            "welcome_message": hub.welcome_message, "hero_media": hero_media,
            "welcome_video": _serialize_video(hub.welcome_video) if hub.welcome_video and _is_public_now(hub.welcome_video, now) else None,
            "professional_profile_url": hub.professional_profile_url,
            "section_order": hub.section_order, "section_visibility": hub.section_visibility,
            "sections": sections,
        }

    @staticmethod
    async def get_speech(db: AsyncSession, slug: str, *, now: datetime | None = None) -> dict[str, Any] | None:
        now = now or datetime.now(timezone.utc)
        speech = (await db.execute(
            select(VcSpeech)
            .options(
                selectinload(VcSpeech.featured_media),
                selectinload(VcSpeech.video_links)
                .selectinload(VcSpeechVideo.video)
                .selectinload(VcVideo.poster_media),
            )
            .where(VcSpeech.slug == slug, *_visibility(VcSpeech, now))
        )).scalar_one_or_none()
        if speech is None:
            return None
        payload = _serialize_speech(speech)
        payload["videos"] = [
            {**_serialize_video(link.video), "role": link.role, "display_order": link.display_order}
            for link in speech.video_links
            if _is_public_now(link.video, now)
        ]
        return payload

    @staticmethod
    async def get_gallery(db: AsyncSession, slug: str, *, now: datetime | None = None) -> dict[str, Any] | None:
        now = now or datetime.now(timezone.utc)
        album = (await db.execute(
            select(VcGalleryAlbum).options(selectinload(VcGalleryAlbum.cover_media)).where(
                VcGalleryAlbum.slug == slug, *_visibility(VcGalleryAlbum, now)
            )
        )).scalar_one_or_none()
        if album is None:
            return None
        payload = _serialize_gallery(album)
        links = (await db.execute(
            select(MediaLink).options(selectinload(MediaLink.media)).where(
                MediaLink.entity_type == "vc_gallery_album", MediaLink.entity_id == album.id,
                MediaLink.deleted_at.is_(None), MediaLink.is_public.is_(True),
                MediaLink.is_published.is_(True), MediaLink.workflow_status == "published",
            ).order_by(MediaLink.display_order)
        )).scalars().all()
        payload["media"] = [item for link in links if (item := serialize_public_media(link.media)) is not None]
        return payload


__all__ = [
    "VideoMutationResult", "ViceChancellorAdminService", "ViceChancellorPublicService",
    "ViceChancellorWorkflowService", "serialize_public_media", "validate_media",
    "validate_placement_source",
]
