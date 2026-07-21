"""Studio and public endpoints for the Meet the Vice Chancellor hub."""

from __future__ import annotations

import uuid
from dataclasses import asdict
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query, Response, status
from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, user_has_scope
from ...models import Event, Media, MediaLink, News, VcGalleryAlbum, VcHubPlacement, VcSpeech, VcSpeechVideo, VcVideo
from ...schemas.vice_chancellor import (
    VcGalleryAlbumCreate,
    VcGalleryAlbumUpdate,
    VcGalleryMediaCreate,
    VcHubPlacementCreate,
    VcHubPlacementUpdate,
    VcHubUpdate,
    VcReorderRequest,
    VcSpeechCreate,
    VcSpeechUpdate,
    VcSpeechVideoCreate,
    VcVideoCreate,
    VcVideoUpdate,
    VcWorkflowAction,
    YouTubePreviewRequest,
)
from ...services import (
    ViceChancellorAdminService,
    ViceChancellorPublicService,
    ViceChancellorWorkflowService,
)
from ...services._base import apply_updates
from ...services.vice_chancellor_youtube import (
    YouTubeMetadataUnavailable,
    fetch_youtube_oembed,
    normalize_youtube_url,
)
from ...services.vice_chancellor import serialize_public_media

router = APIRouter()


def _require_vc_action(user: CurrentUser, action: str) -> None:
    required = {
        "view": ("vc_hub.view", "vc_hub.manage", "vc_hub.review", "vc_hub.publish"),
        "manage": ("vc_hub.manage",),
        "review": ("vc_hub.review",),
        "publish": ("vc_hub.publish",),
    }[action]
    if not any(user_has_scope(user, scope) for scope in (*required, "admin:*")):
        raise HTTPException(status_code=403, detail="Insufficient privileges")


def _validation_error(exc: ValueError) -> HTTPException:
    return HTTPException(status_code=422, detail=str(exc))


async def _record_or_404(db: DbSession, model: type, record_id: uuid.UUID):
    record = await db.get(model, record_id)
    if record is None or record.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Vice Chancellor content not found")
    return record


@router.get("/vice-chancellor/hub")
async def get_hub(db: DbSession, user: CurrentUser):
    _require_vc_action(user, "view")
    return success(data=await ViceChancellorAdminService.get_or_create_hub(db))


@router.patch("/vice-chancellor/hub")
async def update_hub(data: VcHubUpdate, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "manage")
    try:
        hub = await ViceChancellorAdminService.get_or_create_hub(db)
        return success(data=await ViceChancellorAdminService.update_hub(db, hub, data, user.id))
    except ValueError as exc:
        raise _validation_error(exc) from exc


@router.post("/vice-chancellor/hub/{action}")
async def transition_hub(action: str, data: VcWorkflowAction, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "publish" if action in {"publish", "unpublish"} else "review" if action in {"approve", "request_changes"} else "manage")
    try:
        hub = await ViceChancellorAdminService.get_or_create_hub(db)
        return success(data=await ViceChancellorWorkflowService.transition(db, hub, action, user.id, reason=data.reason or data.note))
    except ValueError as exc:
        raise _validation_error(exc) from exc


@router.get("/vice-chancellor/videos")
async def list_videos(db: DbSession, user: CurrentUser, page: int = Query(1, ge=1), per_page: int = Query(20, ge=1, le=100)):
    _require_vc_action(user, "view")
    return success(data=await ViceChancellorAdminService.list_videos(db, page=page, per_page=per_page))


@router.post("/vice-chancellor/videos/youtube/preview")
async def preview_youtube(data: YouTubePreviewRequest, user: CurrentUser):
    _require_vc_action(user, "manage")
    try:
        reference = normalize_youtube_url(data.url)
        metadata = await fetch_youtube_oembed(reference)
        return success(data={**asdict(reference), **asdict(metadata)})
    except ValueError as exc:
        raise _validation_error(exc) from exc
    except YouTubeMetadataUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/vice-chancellor/videos", status_code=status.HTTP_201_CREATED)
async def create_video(data: VcVideoCreate, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "manage")
    try:
        result = await ViceChancellorAdminService.create_video(db, data, user.id)
        return success(data=result.record, meta={"created": result.created, "metadata_warning": result.metadata_warning})
    except ValueError as exc:
        raise _validation_error(exc) from exc


@router.patch("/vice-chancellor/videos/{record_id}")
async def update_video(record_id: uuid.UUID, data: VcVideoUpdate, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "manage")
    try:
        record = await _record_or_404(db, VcVideo, record_id)
        return success(data=await ViceChancellorAdminService.update_video(db, record, data.model_dump(exclude_unset=True), user.id))
    except ValueError as exc:
        raise _validation_error(exc) from exc


@router.post("/vice-chancellor/videos/{record_id}/refresh-metadata")
async def refresh_video(record_id: uuid.UUID, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "manage")
    try:
        return success(data=await ViceChancellorAdminService.refresh_video_metadata(db, await _record_or_404(db, VcVideo, record_id)))
    except ValueError as exc:
        raise _validation_error(exc) from exc
    except YouTubeMetadataUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.delete("/vice-chancellor/videos/{record_id}", status_code=204)
async def delete_video(record_id: uuid.UUID, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "manage")
    record = await _record_or_404(db, VcVideo, record_id)
    record.deleted_at = datetime.now(timezone.utc)
    await db.flush()
    return Response(status_code=204)


@router.get("/vice-chancellor/speeches")
async def list_speeches(db: DbSession, user: CurrentUser, page: int = Query(1, ge=1), per_page: int = Query(20, ge=1, le=100)):
    _require_vc_action(user, "view")
    return success(data=await ViceChancellorAdminService.list_speeches(db, page=page, per_page=per_page))


@router.post("/vice-chancellor/speeches", status_code=201)
async def create_speech(data: VcSpeechCreate, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "manage")
    try:
        return success(data=await ViceChancellorAdminService.create_speech(db, data, user.id))
    except ValueError as exc:
        raise _validation_error(exc) from exc


@router.patch("/vice-chancellor/speeches/{record_id}")
async def update_speech(record_id: uuid.UUID, data: VcSpeechUpdate, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "manage")
    try:
        record = await _record_or_404(db, VcSpeech, record_id)
        return success(data=await ViceChancellorAdminService.update_speech(db, record, data.model_dump(exclude_unset=True), user.id))
    except ValueError as exc:
        raise _validation_error(exc) from exc


@router.delete("/vice-chancellor/speeches/{record_id}", status_code=204)
async def delete_speech(record_id: uuid.UUID, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "manage")
    (await _record_or_404(db, VcSpeech, record_id)).deleted_at = datetime.now(timezone.utc)
    await db.flush()
    return Response(status_code=204)


@router.post("/vice-chancellor/speeches/{speech_id}/videos", status_code=201)
async def attach_speech_video(speech_id: uuid.UUID, data: VcSpeechVideoCreate, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "manage")
    try:
        return success(data=await ViceChancellorAdminService.attach_speech_video(db, await _record_or_404(db, VcSpeech, speech_id), data))
    except ValueError as exc:
        raise _validation_error(exc) from exc


@router.get("/vice-chancellor/speeches/{speech_id}/videos")
async def list_speech_videos(speech_id: uuid.UUID, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "view")
    await _record_or_404(db, VcSpeech, speech_id)
    links = (await db.execute(
        VcSpeechVideo.active_query().where(
            VcSpeechVideo.speech_id == speech_id,
        ).order_by(VcSpeechVideo.display_order)
    )).scalars().all()
    videos = {link.video_id: await db.get(VcVideo, link.video_id) for link in links}
    return success(data=[{
        "id": link.id,
        "speech_id": link.speech_id,
        "video_id": link.video_id,
        "role": link.role,
        "display_order": link.display_order,
        "video": videos.get(link.video_id),
    } for link in links])


@router.delete("/vice-chancellor/speeches/{speech_id}/videos/{link_id}", status_code=204)
async def detach_speech_video(speech_id: uuid.UUID, link_id: uuid.UUID, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "manage")
    link = await _record_or_404(db, VcSpeechVideo, link_id)
    if link.speech_id != speech_id:
        raise HTTPException(status_code=404, detail="Speech video link not found")
    link.deleted_at = datetime.now(timezone.utc)
    await db.flush()
    return Response(status_code=204)


@router.get("/vice-chancellor/galleries")
async def list_galleries(db: DbSession, user: CurrentUser, page: int = Query(1, ge=1), per_page: int = Query(20, ge=1, le=100)):
    _require_vc_action(user, "view")
    return success(data=await ViceChancellorAdminService.list_galleries(db, page=page, per_page=per_page))


@router.post("/vice-chancellor/galleries", status_code=201)
async def create_gallery(data: VcGalleryAlbumCreate, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "manage")
    try:
        return success(data=await ViceChancellorAdminService.create_gallery(db, data, user.id))
    except ValueError as exc:
        raise _validation_error(exc) from exc


@router.patch("/vice-chancellor/galleries/{record_id}")
async def update_gallery(record_id: uuid.UUID, data: VcGalleryAlbumUpdate, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "manage")
    try:
        record = await _record_or_404(db, VcGalleryAlbum, record_id)
        return success(data=await ViceChancellorAdminService.update_gallery(db, record, data.model_dump(exclude_unset=True), user.id))
    except ValueError as exc:
        raise _validation_error(exc) from exc


@router.delete("/vice-chancellor/galleries/{record_id}", status_code=204)
async def delete_gallery(record_id: uuid.UUID, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "manage")
    (await _record_or_404(db, VcGalleryAlbum, record_id)).deleted_at = datetime.now(timezone.utc)
    await db.flush()
    return Response(status_code=204)


@router.post("/vice-chancellor/galleries/{album_id}/media", status_code=201)
async def attach_gallery_media(album_id: uuid.UUID, data: VcGalleryMediaCreate, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "manage")
    try:
        return success(data=await ViceChancellorAdminService.attach_gallery_media(db, await _record_or_404(db, VcGalleryAlbum, album_id), data))
    except ValueError as exc:
        raise _validation_error(exc) from exc


@router.get("/vice-chancellor/galleries/{album_id}/media")
async def list_gallery_media(album_id: uuid.UUID, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "view")
    await _record_or_404(db, VcGalleryAlbum, album_id)
    links = (await db.execute(
        MediaLink.active_query().where(
            MediaLink.entity_type == "vc_gallery_album",
            MediaLink.entity_id == album_id,
        ).order_by(MediaLink.display_order)
    )).scalars().all()
    media = {link.media_id: await db.get(Media, link.media_id) for link in links}
    return success(data=[{
        "id": link.id,
        "media_id": link.media_id,
        "display_order": link.display_order,
        "media": serialize_public_media(media.get(link.media_id)),
    } for link in links])


@router.post("/vice-chancellor/galleries/{album_id}/media/reorder")
async def reorder_gallery_media(album_id: uuid.UUID, data: VcReorderRequest, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "manage")
    try:
        await ViceChancellorAdminService.reorder_gallery_media(db, album_id, ((item.id, item.display_order) for item in data.items))
        return success(data=True)
    except ValueError as exc:
        raise _validation_error(exc) from exc


@router.delete("/vice-chancellor/galleries/{album_id}/media/{link_id}", status_code=204)
async def detach_gallery_media(album_id: uuid.UUID, link_id: uuid.UUID, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "manage")
    link = await _record_or_404(db, MediaLink, link_id)
    if link.entity_type != "vc_gallery_album" or link.entity_id != album_id:
        raise HTTPException(status_code=404, detail="Gallery media link not found")
    link.deleted_at = datetime.now(timezone.utc)
    await db.flush()
    return Response(status_code=204)


@router.get("/vice-chancellor/placements")
async def list_placements(db: DbSession, user: CurrentUser):
    _require_vc_action(user, "view")
    hub = await ViceChancellorAdminService.get_or_create_hub(db)
    records = (await db.execute(VcHubPlacement.active_query().where(VcHubPlacement.hub_id == hub.id).order_by(VcHubPlacement.section, VcHubPlacement.display_order))).scalars().all()
    return success(data=records)


@router.post("/vice-chancellor/placements", status_code=201)
async def create_placement(data: VcHubPlacementCreate, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "manage")
    try:
        hub = await ViceChancellorAdminService.get_or_create_hub(db)
        return success(data=await ViceChancellorAdminService.create_placement(db, hub, data))
    except ValueError as exc:
        raise _validation_error(exc) from exc


@router.post("/vice-chancellor/placements/reorder")
async def reorder_placements(data: VcReorderRequest, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "manage")
    try:
        hub = await ViceChancellorAdminService.get_or_create_hub(db)
        await ViceChancellorAdminService.reorder_placements(db, hub.id, ((item.id, item.display_order) for item in data.items))
        return success(data=True)
    except ValueError as exc:
        raise _validation_error(exc) from exc


@router.patch("/vice-chancellor/placements/{record_id}")
async def update_placement(record_id: uuid.UUID, data: VcHubPlacementUpdate, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "manage")
    record = await _record_or_404(db, VcHubPlacement, record_id)
    apply_updates(record, **data.model_dump(exclude_unset=True))
    await db.flush()
    return success(data=record)


@router.delete("/vice-chancellor/placements/{record_id}", status_code=204)
async def delete_placement(record_id: uuid.UUID, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "manage")
    (await _record_or_404(db, VcHubPlacement, record_id)).deleted_at = datetime.now(timezone.utc)
    await db.flush()
    return Response(status_code=204)


@router.get("/vice-chancellor/lookups/news")
async def lookup_news(db: DbSession, user: CurrentUser, q: str | None = None):
    _require_vc_action(user, "view")
    query = News.active_query().order_by(News.created_at.desc()).limit(50)
    if q:
        query = query.where(News.title.ilike(f"%{q}%"))
    return success(data=(await db.execute(query)).scalars().all())


@router.get("/vice-chancellor/lookups/events")
async def lookup_events(db: DbSession, user: CurrentUser, q: str | None = None):
    _require_vc_action(user, "view")
    query = Event.active_query().order_by(Event.start_date.desc()).limit(50)
    if q:
        query = query.where(Event.title.ilike(f"%{q}%"))
    return success(data=(await db.execute(query)).scalars().all())


@router.post("/vice-chancellor/{resource}/{record_id}/{action}")
async def transition_content(resource: str, record_id: uuid.UUID, action: str, data: VcWorkflowAction, db: DbSession, user: CurrentUser):
    _require_vc_action(user, "publish" if action in {"publish", "unpublish"} else "review" if action in {"approve", "request_changes"} else "manage")
    models = {"videos": VcVideo, "speeches": VcSpeech, "galleries": VcGalleryAlbum}
    if resource not in models:
        raise HTTPException(status_code=404, detail="Unknown Vice Chancellor resource")
    try:
        record = await _record_or_404(db, models[resource], record_id)
        return success(data=await ViceChancellorWorkflowService.transition(db, record, action, user.id, reason=data.reason or data.note))
    except ValueError as exc:
        raise _validation_error(exc) from exc


@router.get("/public/vice-chancellor")
@cached_public(timeout=600)
async def get_public_hub(db: DbSession):
    payload = await ViceChancellorPublicService.get_hub(db)
    if payload is None:
        raise HTTPException(status_code=404, detail="Published Vice Chancellor hub not found")
    return success(data=payload)


@router.get("/public/vice-chancellor/speeches/{slug}")
@cached_public(timeout=600, vary_on=("slug",))
async def get_public_speech(slug: str, db: DbSession):
    payload = await ViceChancellorPublicService.get_speech(db, slug)
    if payload is None:
        raise HTTPException(status_code=404, detail="Published speech not found")
    return success(data=payload)


@router.get("/public/vice-chancellor/galleries/{slug}")
@cached_public(timeout=600, vary_on=("slug",))
async def get_public_gallery(slug: str, db: DbSession):
    payload = await ViceChancellorPublicService.get_gallery(db, slug)
    if payload is None:
        raise HTTPException(status_code=404, detail="Published gallery not found")
    return success(data=payload)
