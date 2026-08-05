from datetime import date, datetime, time, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from ksu_common.auth import TokenPayload

from ...core.auth import require_permission
from ...core.database import get_db
from ...models.analytics import AnalyticsEvent
from ...schemas.analytics_report import AnalyticsReport

router = APIRouter(prefix="/admin/analytics", tags=["HERI Analytics Reports"])


@router.get("/report", response_model=AnalyticsReport)
async def report(
    start_date: date = Query(default_factory=lambda: date.today() - timedelta(days=30)),
    end_date: date = Query(default_factory=date.today),
    db: AsyncSession = Depends(get_db),
    _: TokenPayload = Depends(require_permission("heri.analytics.read")),
) -> AnalyticsReport:
    start = datetime.combine(start_date, time.min, tzinfo=timezone.utc)
    end = datetime.combine(end_date + timedelta(days=1), time.min, tzinfo=timezone.utc)
    scope = and_(AnalyticsEvent.created_at >= start, AnalyticsEvent.created_at < end)

    totals = (await db.execute(select(AnalyticsEvent.event_name, func.count(AnalyticsEvent.id)).where(scope).group_by(AnalyticsEvent.event_name))).all()
    by_name = {str(name): int(count) for name, count in totals}
    pages = (await db.execute(select(AnalyticsEvent.path, func.count(AnalyticsEvent.id)).where(scope, AnalyticsEvent.event_name == "page_view").group_by(AnalyticsEvent.path).order_by(func.count(AnalyticsEvent.id).desc()).limit(10))).all()
    searches = (await db.execute(select(AnalyticsEvent.properties["query"].as_string().label("term"), func.count(AnalyticsEvent.id)).where(scope, AnalyticsEvent.event_name == "search").group_by(AnalyticsEvent.properties["query"].as_string()).order_by(func.count(AnalyticsEvent.id).desc()).limit(10))).all()
    ctas = (await db.execute(select(AnalyticsEvent.properties["cta"].as_string().label("cta"), func.count(AnalyticsEvent.id)).where(scope, AnalyticsEvent.event_name == "cta_click").group_by(AnalyticsEvent.properties["cta"].as_string()).order_by(func.count(AnalyticsEvent.id).desc()).limit(10))).all()
    return AnalyticsReport(
        start_date=start_date,
        end_date=end_date,
        total_events=sum(by_name.values()),
        page_views=by_name.get("page_view", 0),
        content_views=by_name.get("content_view", 0),
        form_submissions=by_name.get("form_submission", 0),
        downloads=by_name.get("download", 0),
        registrations=by_name.get("event_registration", 0),
        top_pages=[{"path": path or "/", "count": int(count)} for path, count in pages],
        top_search_terms=[{"term": term or "", "count": int(count)} for term, count in searches],
        cta_conversions=[{"cta": cta or "", "count": int(count)} for cta, count in ctas],
    )
