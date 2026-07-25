# Corporate Communication Analytics Dashboard Design

## Purpose

Replace the current Corporate Communication landing page, which exposes only a few independent counters, with a single premium operational analytics dashboard. The dashboard will report on activity that the Corporate Communication portal and Main service authoritatively control: content workflow, publishing output, schedules, readiness, media hygiene, and actionable exceptions.

The dashboard will not claim to measure public page views, visitors, click-through, reach, engagement, sentiment, or subjective content quality. Although the system contains first-party analytics infrastructure, audience-view reporting is outside this dashboard's reliable scope.

## Audience

The dashboard serves two audiences from one shared view:

- Corporate Communication staff need a daily operational command centre for backlog, review delays, publishing output, readiness problems, and direct navigation to work areas.
- University management need understandable period comparisons, trend charts, accountable definitions, and PDF or CSV reporting.

The result is one dashboard rather than separate tabs or role-specific variants. Permissions continue to determine which quick actions and linked records a user can access.

## Scope

### Included

- A dedicated Corporate Communication dashboard analytics endpoint.
- Current operational snapshots.
- Selected-period activity and immediately preceding equal-period comparisons.
- Chart-ready time series and grouped distributions.
- Deterministic readiness and media-hygiene checks.
- Explainable, rule-based operational insights.
- Actionable exception records with links into existing editors and queues.
- A redesigned premium dashboard using the endpoint as its single analytics data source.
- PDF and CSV exports derived from the same filtered dashboard dataset.
- Reuse of the existing Corporate Communication portal access rules.

### Excluded

- Public page views, visitor counts, reach, engagement, or click-through rates.
- Sentiment analysis.
- AI-generated recommendations.
- Subjective content-quality scores.
- Configurable KPI targets.
- Staff rankings or public employee leaderboards.
- A separate Reports tab or dashboard sub-navigation.

## Endpoint

Add:

```text
GET /api/v1/stats/portal/corporate-communication/dashboard
```

Preserve the existing lightweight endpoint:

```text
GET /api/v1/stats/portal/corporate-communication
```

The existing endpoint remains backward-compatible for any current consumers. The new endpoint owns all aggregation required by the premium dashboard; the frontend must not fetch raw resource lists and reproduce analytics calculations.

### Authorization

Reuse the existing Corporate Communication portal-stat access check. A user may access the dashboard endpoint when they hold any configured Corporate Communication scope or have a Corporate Communication portal access record.

Sensitive actor-level audit records are not returned. Aggregated workflow activity can be reported without ranking named employees.

### Query parameters

| Parameter | Type | Default | Rules |
| --- | --- | --- | --- |
| `date_from` | ISO date | 30 days before `date_to` | Inclusive start date |
| `date_to` | ISO date | Current date | Inclusive end date |
| `compare` | `previous` or `none` | `previous` | Previous uses the immediately preceding equal-length period |
| `bucket` | `auto`, `day`, `week`, or `month` | `auto` | Auto chooses a readable bucket for the selected range |
| `content_type` | Supported workflow content type | All | Optional content-type filter |
| `owner_portal` | Owner portal key | All | Optional source filter |

The maximum selectable range is 366 days. Invalid ranges, unknown content types, and unknown owner portals return a validation error.

### Period semantics

The response distinguishes current state from activity:

- `snapshot` reports the state at request time, such as current backlog, drafts, scheduled content, and readiness exceptions.
- Period sections report events or transitions that happened between `date_from` and `date_to`.
- Comparison values are only returned for period metrics that can be calculated reliably for both periods.
- Snapshot metrics do not present historical deltas unless reliable state reconstruction is implemented later.

## Response contract

```json
{
  "data": {
    "generated_at": "2026-07-14T10:00:00Z",
    "period": {
      "date_from": "2026-06-15",
      "date_to": "2026-07-14",
      "bucket": "day"
    },
    "comparison_period": {
      "date_from": "2026-05-16",
      "date_to": "2026-06-14"
    },
    "filters": {
      "content_type": null,
      "owner_portal": null
    },
    "snapshot": {},
    "activity": {},
    "workflow": {},
    "publishing": {},
    "readiness": {},
    "insights": [],
    "attention_items": [],
    "data_quality": {}
  }
}
```

### Metric shape

Comparable metrics use a consistent shape:

```json
{
  "key": "published",
  "label": "Published output",
  "value": 64,
  "unit": "items",
  "previous_value": 57,
  "change": 7,
  "change_percent": 12.28,
  "trend": "up",
  "favourability": "positive"
}
```

`trend` describes mathematical direction. `favourability` describes whether the change is operationally desirable. For example, an increase in published output can be positive while an increase in rework rate is negative. The frontend must not infer favourability from direction alone.

## Data sections

### Snapshot

Return current counts for:

- Review backlog total.
- Submitted and in-review backlog components.
- Overdue reviews using a 48-hour threshold.
- Scheduled content in the next 7 and 30 days.
- Total drafts and stale drafts not updated for 14 days.
- Current workflow-status distribution.
- Current content-type distribution.

### Activity

Return current-period and comparison-period metrics for:

- Submissions.
- Review decisions.
- Approvals.
- Changes requested.
- Rejections.
- Publications.
- Unpublications.
- Archives.
- Median submission-to-decision time.
- Median approval-to-publication time.
- Approval rate.
- Rework rate.
- Rejection rate.

A decision is an `approve`, `request_changes`, or `reject` workflow action. Rates use total decisions as the denominator.

Time metrics are calculated from immutable `content_workflow_logs`. A workflow cycle begins with `submit`. Submission-to-decision time pairs that submission with the first subsequent decision for the same content record before a later submission begins another cycle. Approval-to-publication pairs an approval with its subsequent publication within the same cycle.

### Workflow

Return chart-ready data for:

- Workflow action counts over time.
- Decision outcomes over time.
- Current backlog-aging buckets: under 24 hours, 24–48 hours, 2–7 days, and over 7 days.
- Workflow action distribution.
- Breakdown by content type.
- Breakdown by owner portal.

The dashboard will show transition activity rather than label unrelated period totals as a conversion funnel. This avoids implying cohort conversion where submissions and publications may belong to different workflow cycles.

### Publishing

Return:

- Published output over time, split by content type.
- Published output by owner portal.
- Publishing cadence by day of week.
- Upcoming scheduled items.
- Calendar coverage for the next 30 days.
- Gaps of seven or more consecutive days without scheduled content.

### Readiness

Readiness is deterministic and content-type-aware. Return counts and affected-record links for:

- Missing title, summary, or body where required.
- Missing featured media where required for the content type.
- Missing SEO title or description on models that support SEO fields.
- Featured or linked images missing alt text.
- Scheduled items missing required media.
- Unprocessed media.
- Unlinked media assets.
- Published but expired content.
- Content expiring within seven days.
- Stale drafts.

Readiness rules live in one backend registry keyed by content type so exceptions and future requirements are explicit rather than scattered across queries.

### Insights

Insights are produced by deterministic rules and include evidence:

```json
{
  "code": "OVERDUE_REVIEWS_BY_SOURCE",
  "severity": "warning",
  "title": "Department submissions dominate overdue reviews",
  "description": "5 of 7 items waiting over 48 hours came from departments.",
  "value": 5,
  "total": 7,
  "href": "/corporate-communication/review-queue?source_portal=departments"
}
```

Initial rules cover:

- Backlog concentration by source or content type.
- Deteriorating decision time.
- Increasing rework or rejection rate.
- Declining publishing output by content type.
- Upcoming publishing-calendar gaps.
- Concentrations of missing metadata or media.
- Stale, overdue, or soon-expiring content.

Rules emit nothing when evidence is insufficient. They do not produce prose that cannot be traced to returned values.

### Attention items

Return a bounded list of the highest-priority actionable records:

- Oldest review items.
- Stale drafts.
- Scheduled records with readiness failures.
- Soon-expiring records.
- Unprocessed or incomplete media.

Each item includes an ID, title, content type, status, age, issue codes, severity, source label, and editor or queue URL. The response returns at most 20 attention items, ordered by severity and age.

### Data quality

The endpoint declares its coverage:

```json
{
  "workflow_logs_available": true,
  "audience_analytics_available": false,
  "excluded_metrics": [
    "page_views",
    "unique_visitors",
    "click_through_rate",
    "public_engagement",
    "sentiment"
  ],
  "warnings": []
}
```

Warnings describe partial historical workflow-log coverage or unsupported readiness checks. The dashboard displays a compact notice when warnings are present.

## Backend architecture

Create a focused Corporate Communication dashboard service rather than expanding the existing generic `portal_stats` function into a large conditional branch.

Suggested boundaries:

- The API route validates filters and authorization.
- A dashboard service coordinates period calculation and section builders.
- Query helpers aggregate workflow logs and current content models.
- A readiness registry defines content-type-specific checks.
- An insight evaluator consumes already-computed metrics and emits evidence-backed findings.
- Pydantic response schemas document the complete contract.

All supported workflow content types must come from one shared registry so the review queue, existing counters, and dashboard cannot silently diverge. The registry covers news, blogs or press releases, announcements, events, club events, club media, page sections, partnership spotlights, and sliders.

Independent aggregate queries may run concurrently where safe, but each query must remain bounded and execute aggregation in the database rather than loading all records into application memory.

## Dashboard design

The dashboard remains a single page with no analytics tabs.

### Header and controls

- Page title and concise operational description.
- Date-range selector with 7-day, 30-day, 90-day, and custom presets.
- Content-type and owner-portal filters.
- PDF and CSV export actions.
- Generated-at timestamp and data-quality notice where applicable.

### Visual hierarchy

1. Five primary KPI cards: review backlog, published output, median decision time, rework rate, and overdue reviews.
2. A large publishing-throughput chart with previous-period comparison.
3. Workflow status distribution and decision-outcome visualizations.
4. Backlog-aging and owner-portal breakdown charts.
5. Publishing calendar and readiness control panels.
6. Evidence-backed insight cards and an actionable attention list.
7. Permission-aware quick links to Review Queue, News, Notices, Events, Media, and Page CMS.

Charts use the existing Chart.js and React Chart.js dependencies. Presentation should be premium but restrained: strong typographic hierarchy, consistent chart color semantics, informative tooltips, accessible legends, loading skeletons, and responsive layouts. Every chart must expose the underlying values in accessible text or a table alternative. Color is never the sole status indicator.

### Loading and error behavior

- Preserve the previous successful response while filters refresh.
- Show skeletons only on initial load.
- A total endpoint failure shows an error panel with retry while quick links remain available.
- A failed optional section is represented through `data_quality.warnings`; other sections remain usable.
- Empty series display a truthful empty state, not a zero-valued chart.
- Filter values remain visible in all states.

## Exports

PDF and CSV exports use the same filters, metric definitions, and service layer as the dashboard endpoint.

- CSV contains machine-readable summary metrics, time series, breakdowns, readiness counts, and attention items with section identifiers.
- PDF contains the reporting period, comparison period, headline metrics, selected charts, evidence-backed insights, readiness exceptions, and generation timestamp.
- Exports must not introduce audience analytics or staff rankings absent from the dashboard.

If PDF generation cannot be completed safely in the first implementation slice, the dashboard endpoint and UI may ship with CSV first only if the limitation is clearly reported. PDF remains part of the accepted feature scope, not silently discarded.

## Performance and caching

- Cache dashboard responses briefly by user-access context and normalized filter set.
- Target a warm response under one second and a cold response under three seconds for a 30-day range on production-scale data.
- Avoid caching attention URLs or data across users when their accessible scopes differ.
- Invalidate or expire caches after workflow transitions, content publication changes, and relevant media updates.

## Verification strategy

The user explicitly requested that no tests be created or run for this implementation. Verification will therefore be limited to non-test checks:

- Existing frontend lint.
- Existing frontend TypeScript typecheck.
- Python syntax or import compilation checks that do not execute the test suite.
- Production build checks where proportionate and feasible.
- Manual inspection of representative endpoint payloads and dashboard states when a local service and authenticated session are available.

No new test files will be added, and no existing test command will be executed.

## Compatibility and migration

- Keep the current portal-stats endpoint and response unchanged.
- Add the new endpoint and typed API-client methods additively.
- Replace only the Corporate Communication dashboard composition; other portal dashboards continue using the generic dashboard component.
- Reuse existing routes and permissions for quick links.
- Do not alter or depend on legacy `/cocms` routes beyond their existing redirects.

## Success criteria

- Corporate Communication users see one professional dashboard backed by portal-owned data.
- All headline metrics have explicit and consistent definitions.
- Period metrics compare with the immediately preceding equal period.
- Charts consume server-aggregated, chart-ready structures.
- The dashboard surfaces actionable records, not only aggregate counts.
- No unsupported audience metric is displayed or exported.
- PDF and CSV use the same source calculations as the screen.
- Existing portal routes and lightweight counters remain backward-compatible.
