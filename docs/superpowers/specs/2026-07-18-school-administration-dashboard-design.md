# School Administration Dashboard Design

**Date:** 2026-07-18  
**Status:** Approved for implementation  
**Scope:** School Administration Portal dashboard only

## Objective

Rebuild the school dashboard to match the supplied operational-dashboard reference while preserving the established KSU administration theme. The page must give a school administrator a useful overview immediately, use only real school-scoped data, and avoid latency caused by widget-by-widget requests.

## Experience

The dashboard opens with a compact greeting rather than a large generic workspace hero. The greeting identifies the authenticated school, shows the dashboard's generated time and live state, and provides one date-range control.

Six primary metrics occupy one row on wide screens:

1. Active Staff
2. Departments
3. Programmes
4. Draft Content
5. Pending Inquiries
6. Publications

Each metric includes its current value, comparison with the previous equivalent period when available, an icon, and a direct link to the relevant section. The cards collapse to three, two, and one column as the viewport narrows.

The main workspace follows the visual reference:

- **School Activity:** page views and unique visitors over the selected period, with totals and comparison percentages.
- **Content Workflow:** draft, submitted/in-review, changes-requested, approved/published, and archived content grouped into a compact distribution.
- **Needs Attention:** permission-aware actions such as overdue inquiries, content requiring revision, failed uploads, and incomplete profile information.
- **Recent Activity:** human-readable school events with actor or system attribution when available.
- **Quick Actions:** capability-aware shortcuts for adding staff, creating content, uploading media, adding programmes, and editing the profile.
- **Inquiry Status:** new, active, waiting, resolved, and closed inquiry distribution.

Profile completeness remains visible as an actionable attention item and compact progress context. Upload, import, download, and traffic information remains available in relevant panels without displacing the six primary metrics.

## Responsive Behaviour

- **1440px and wider:** six KPI cards in one row; the central dashboard uses a 6/3/3 column rhythm.
- **1024px–1439px:** three KPI cards per row; panels use two columns where content remains readable.
- **768px–1023px:** two KPI cards per row; charts and task lists stack in logical reading order.
- **Below 768px:** one KPI card per row when necessary, full-width panels, horizontally scrollable range controls, and no document-level horizontal overflow.

The final component chooses the number of columns from available width. It does not shrink cards until values or labels become unreadable.

## Data Architecture

The existing `GET /api/v1/school-portal/dashboard` endpoint remains the single source of truth. It is extended rather than replaced.

The response supplies:

- six primary KPI records with current and previous-period values;
- separate page-view and unique-visitor activity series;
- content and inquiry workflow distributions;
- permission-filtered attention items and quick actions;
- recent activity records;
- profile completeness and collection notes.

Unique visitors are counted from distinct non-null analytics `session_hash` values. Activity buckets use days for 7-, 30-, and 90-day ranges and months for the 12-month range.

Independent database aggregations may execute concurrently only when they use safe, separate database sessions. The initial implementation will retain the existing request session and optimize by keeping the response to one HTTP request, using bounded aggregate queries and avoiding per-record lookups.

Publication totals continue to come from the Research service. If Research is unavailable, the dashboard remains usable, marks publication comparison data unavailable, and does not fail the complete dashboard request.

No sample or fabricated values are displayed. Empty data produces explicit zero or empty-state messaging.

## Frontend Structure

The current monolithic dashboard is decomposed into focused components:

- `school-dashboard.tsx`: query state, range state, and layout composition.
- `school-dashboard-header.tsx`: greeting, school state, generated time, and range control.
- `school-stat-card.tsx`: responsive KPI card with icon and comparison.
- `school-activity-panel.tsx`: page-view and visitor totals plus the combined chart.
- `school-workflow-panel.tsx`: accessible workflow distribution visualization.
- `school-attention-panel.tsx`: severity-aware action list.
- `school-recent-activity.tsx`: readable event feed.
- `school-quick-actions.tsx`: capability-aware shortcuts.
- `school-inquiry-status.tsx`: accessible inquiry distribution.

Charts use lightweight SVG and CSS rather than introducing a new charting dependency. Every visualization includes a textual legend and accessible summary.

## Interaction and Error Handling

- Changing the date range updates one query key and keeps the prior dashboard visible while the new range loads.
- The selected range is reflected in the URL so refresh and navigation preserve it.
- Initial loading uses skeletons shaped like the final dashboard.
- Refresh errors retain the last successful dashboard and show a non-blocking retry notice.
- Initial request failure shows a full dashboard error state with Retry.
- Links and quick actions use existing portal routes and capability checks.
- Interactive cards have visible hover and keyboard-focus states without layout-shifting animation.

## Performance Constraints

- One HTTP dashboard request per selected range.
- No frontend widget waterfalls.
- No new chart library.
- No per-card API calls.
- Aggregate queries remain school-scoped and indexed.
- The page does not poll automatically; normal query invalidation and manual range changes refresh it.

## Verification

Verification is intentionally focused:

- backend dashboard service tests for unique visitors, primary KPI selection, permission filtering, and Research-service degradation;
- TypeScript typecheck;
- visual browser checks with the real school account at 375px, 768px, 1024px, and wide desktop;
- confirmation that range changes, navigation links, loading, empty states, and real school scoping work without console errors.

No broad end-to-end suite is required for this dashboard iteration.
