# HERI Africa Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a database-backed HERI Africa × Kisii University public platform, CMS workspace, publishing workflow, submissions, analytics, media, and optional social publication within the existing KSU platform.

**Architecture:** Add a dedicated `services/heri_africa` FastAPI service using the PostgreSQL `heri` schema and `/api/v1/heri` prefix. Add a dedicated `frontend/apps/heri-africa` Next.js public app while extending the existing shared admin app with HERI routes. Reuse repository auth, UI, API-client, storage, Redis, Celery, gateway, Docker, and test conventions.

**Tech Stack:** FastAPI, SQLAlchemy 2, Alembic, PostgreSQL, Redis, Celery, Pydantic v2, Next.js 15, React 19, TypeScript, Tailwind, shared KSU UI/auth/API packages, pytest, Vitest, Playwright, Docker Compose, Nginx.

## Global Constraints

- Public API prefix is `/api/v1/heri`.
- HERI tables use PostgreSQL schema `heri` and durable SQLAlchemy persistence.
- Public APIs return only published or due-scheduled records.
- Protected mutations use repository authentication/RBAC and write audit records.
- Social credentials are encrypted, server-side only, and never returned to browsers.
- Do not add in-memory production storage, fake dashboard values, generic placeholder images, or hardcoded CMS content.
- Preserve unrelated working-tree changes and stage only HERI files per commit.
- Run `git diff --check` and relevant tests before every commit using `scripts/commit-changes.sh`.
- Do not commit `.env`, generated output, caches, uploads, logs, databases, or dependency directories.

---

## Task 1: Service and public-app scaffolding

**Files:**
- Create: `services/heri_africa/{Dockerfile,pyproject.toml,alembic.ini,wsgi.py}`
- Create: `services/heri_africa/app/{__init__.py,main.py}`
- Create: `services/heri_africa/app/core/{__init__.py,config.py,database.py,auth.py}`
- Create: `services/heri_africa/app/routes/{__init__.py,v1/__init__.py,health.py}`
- Create: `services/heri_africa/migrations/env.py`
- Create: `services/heri_africa/migrations/versions/0001_heri_schema.py`
- Create: `frontend/apps/heri-africa/{package.json,tsconfig.json,next-env.d.ts,next.config.mjs,postcss.config.mjs}`
- Create: `frontend/apps/heri-africa/src/app/{layout.tsx,page.tsx,globals.css}`
- Modify: `frontend/pnpm-workspace.yaml`, `frontend/package.json`, `docker-compose.yml`, `docker-compose.vm.yml`, `gateway/nginx.conf`, `gateway/edge.vm.conf.template`, `.env.example`
- Test: `services/heri_africa/tests/test_health.py`, `frontend/apps/heri-africa/src/app/page.test.tsx`

**Interfaces:**
- `create_app() -> FastAPI` serves `/api/v1/health` and `/api/v1/heri/health`.
- `get_settings() -> HeriSettings` loads service URL, database, Redis, CORS, storage, and provider settings.
- Public app reads `NEXT_PUBLIC_HERI_API_URL` and exposes a shared `SiteShell` boundary.

- [ ] Add the FastAPI factory, config, database session dependency, schema metadata, health router, and service Docker entrypoint by copying only the structural conventions from `services/research`.
- [ ] Add the Next.js app to the workspace and compose profile with a minimal accessible shell and a data-free landing placeholder that will be replaced in Task 5.
- [ ] Register `/api/v1/heri/*` gateway forwarding and HERI health checks without changing existing routes.
- [ ] Write and run the health/API smoke tests.
- [ ] Run `python -m compileall services/heri_africa`, the targeted pytest, and `git diff --check`.
- [ ] Commit with `scripts/commit-changes.sh -m "feat(heri): add service and public app scaffolding" --run-checks -- <explicit HERI paths>`.

## Task 2: Core database models and migration

**Files:**
- Create: `services/heri_africa/app/models/{__init__.py,base.py,site.py,pages.py,content.py,research.py,people.py,partners.py,submissions.py,media.py,audit.py,analytics.py,social.py}`
- Create: `services/heri_africa/app/schemas/{__init__.py,common.py,site.py,pages.py,content.py,research.py,people.py,partners.py,submissions.py,media.py,analytics.py,social.py}`
- Modify: `services/heri_africa/migrations/versions/0001_heri_schema.py`
- Test: `services/heri_africa/tests/test_models.py`, `services/heri_africa/tests/test_migration.py`

**Interfaces:**
- All models inherit `HeriBase` with UUID primary keys, timestamps, and soft deletion.
- Editorial models expose `status`, `published_at`, `scheduled_at`, `slug`, SEO fields, and author/editor IDs.
- `SubmissionStatus` supports `new`, `reviewing`, `assigned`, `in_progress`, `responded`, `approved`, `rejected`, `closed`, and `spam`.
- `PublicationStatus` supports `draft`, `in_review`, `approved`, `scheduled`, `published`, and `archived`.

- [ ] Define normalized relational tables for site settings, navigation/footer, pages/sections/revisions, editorial records, research records, people, partners, submissions, media, audit, analytics, and social jobs.
- [ ] Add indexes for public slug/state queries, scheduled publication, submission status, analytics event time, and soft deletion.
- [ ] Generate the initial Alembic upgrade/downgrade and assert that the `heri` schema and required tables exist.
- [ ] Test enum values, relationships, soft-delete filtering, and migration execution against the repository test database.
- [ ] Run the targeted backend tests and commit the schema milestone.

## Task 3: Repositories, seed data, and public read APIs

**Files:**
- Create: `services/heri_africa/app/services/{__init__.py,public.py,seed.py}`
- Create: `services/heri_africa/app/routes/v1/{site.py,pages.py,home.py,team.py,news.py,events.py,research.py,partners.py,search.py,sitemap.py}`
- Create: `services/heri_africa/app/seeders/{__init__.py,seed_heri.py,fixtures/site.json,fixtures/pages.json,fixtures/research.json,fixtures/people.json,fixtures/partners.json,fixtures/content.json}`
- Create: `services/heri_africa/tests/test_public_visibility.py`, `services/heri_africa/tests/test_seed_data.py`

**Interfaces:**
- `PublicService.list_published(model, *, offset, limit, filters) -> tuple[list[Model], int]`.
- `PublicService.get_published_by_slug(model, slug) -> Model | None`.
- Routes implement `/site`, `/navigation`, `/footer`, `/pages/{slug}`, `/home`, `/team`, `/team/{slug}`, `/news`, `/news/{slug}`, `/stories`, `/events`, `/events/{slug}`, `/research`, `/research/themes`, `/research/projects`, `/research/projects/{slug}`, `/research/publications`, `/research/publications/{slug}`, `/partners`, `/partners/{slug}`, `/search`, and `/sitemap`.

- [ ] Build repository/service queries that exclude soft-deleted, draft, rejected, and future-scheduled rows.
- [ ] Add seed data with explicit `verified`, `ambition`, and `editable placeholder` labels; do not seed invented achieved impact.
- [ ] Add consistent pagination/filter/sort response envelopes and OpenAPI schemas.
- [ ] Test draft invisibility, due-scheduled visibility, slug lookup, pagination, and safe seed re-runs.
- [ ] Commit the public data milestone after targeted backend tests.

## Task 4: Submissions, RBAC integration, revisions, and audit

**Files:**
- Create: `services/heri_africa/app/services/{submissions.py,workflow.py,audit.py}`
- Create: `services/heri_africa/app/routes/v1/{submissions.py,admin.py}`
- Create: `services/heri_africa/tests/{test_submissions.py,test_workflow.py,test_permissions.py,test_revisions.py}`
- Modify: `frontend/packages/api-client/src/service-urls.ts`, `frontend/packages/api-client/src/index.ts`, `frontend/packages/auth/src/permissions.ts`

**Interfaces:**
- `WorkflowService.transition(actor, entity, target_status, *, note=None) -> entity` validates role and legal transitions.
- `SubmissionService.create(kind, payload, request_context) -> Submission`.
- `AuditService.record(actor, action, entity, before, after, request_context) -> AuditLog`.
- Public POST routes: `/contact`, `/partnership-applications`, `/network-applications`, `/newsletter/subscribe`, `/events/{id}/register`, `/analytics/events`.

- [ ] Integrate shared auth dependencies and map Administrator, Editor, Publisher, Partnership Manager, Social Publisher, and Viewer scopes without creating a second login system.
- [ ] Implement public validation, consent, honeypot, rate-limit hooks, and durable submission creation.
- [ ] Implement protected CRUD, assignment, internal notes, response, export, revision, and audit endpoints.
- [ ] Test unauthorized access, role matrix, legal/illegal transitions, audit snapshots, and submission status changes.
- [ ] Commit the workflow and RBAC milestone.

## Task 5: Public HERI site and forms

**Files:**
- Create/modify: `frontend/apps/heri-africa/src/app/**` for all required public routes and detail pages
- Create: `frontend/apps/heri-africa/src/components/{site-shell.tsx,hero.tsx,section-heading.tsx,content-card.tsx,impact-block.tsx,partner-strip.tsx,forms/contact-form.tsx,forms/partnership-form.tsx,forms/network-form.tsx,forms/newsletter-form.tsx}`
- Create: `frontend/apps/heri-africa/src/lib/{api.ts,queries.ts,metadata.ts,types.ts}`
- Create: `frontend/apps/heri-africa/src/app/**/*.test.tsx`

**Interfaces:**
- `heriApi.get<T>(path, init?) -> Promise<T>` uses `NEXT_PUBLIC_HERI_API_URL` and typed errors.
- `SiteShell({ children, site, navigation, footer })` renders skip link, responsive navigation, footer, and accessibility preferences.
- Forms expose controlled pending/success/error states and submit to the public routes from Task 4.

- [ ] Implement the co-branded HERI/Kisii shell and token layer from the approved screenshots using shared typography and Lucide/SVG icons.
- [ ] Implement the homepage composition and required route groups with API loading, empty, error, and not-found states.
- [ ] Add poster/fallback media, reduced-motion handling, accessible forms, labels, validation messages, and no screen-reader-exposed decorative icons.
- [ ] Add route metadata, JSON-LD, sitemap/robots, canonical URLs, and meaningful alt text.
- [ ] Run targeted Vitest/React tests, app lint, and typecheck; commit the public-site milestone.

## Task 6: HERI admin workspace

**Files:**
- Create: `frontend/apps/admin/src/app/(protected)/heri/{layout.tsx,page.tsx,content/page.tsx,research/page.tsx,team/page.tsx,partners/page.tsx,events/page.tsx,submissions/page.tsx,media/page.tsx,settings/page.tsx,social/page.tsx}`
- Create: `frontend/apps/admin/src/components/heri/{heri-nav.tsx,heri-dashboard.tsx,content-editor.tsx,workflow-actions.tsx,submission-table.tsx,media-picker.tsx}`
- Create: `frontend/packages/api-client/src/heri/{index.ts,types.ts,queries.ts,mutations.ts}`
- Test: `frontend/apps/admin/src/app/(protected)/heri/**/*.test.tsx`

**Interfaces:**
- API hooks use the shared query client and typed HERI API client.
- `HeriPermissionGate({ permission, children, fallback })` controls mutations using repository auth state.
- Dashboard consumes real `/api/v1/heri/admin/dashboard` data and accepts date-range filters.

- [ ] Add navigation and permission-gated HERI workspace routes to the existing admin shell.
- [ ] Implement live dashboard KPIs, recent activity, publication/enquiry pipelines, upcoming events, failed social jobs, and export actions.
- [ ] Implement content/page editors with draft save, preview, review, approval, scheduling, publish/archive, section ordering, revisions, and SEO fields.
- [ ] Implement research/team/partner/event/submission/media tables with pagination, filters, assignment, notes, and soft-delete controls.
- [ ] Test role visibility, mutation guards, loading/error states, and real API query wiring; commit the admin milestone.

## Task 7: Media, analytics, Celery, and social providers

**Files:**
- Create: `services/heri_africa/app/services/{media.py,analytics.py,social.py}`
- Create: `services/heri_africa/app/tasks/{__init__.py,celery_app.py,publication.py,analytics.py}`
- Create: `services/heri_africa/tests/{test_media.py,test_analytics.py,test_social_queue.py,test_social_retry.py}`
- Modify: `docker-compose.yml`, `docker-compose.vm.yml`, `services/heri_africa/scripts/start-celery-worker.sh`
- Modify: `frontend/apps/admin/src/app/(protected)/heri/social/page.tsx`, `frontend/apps/admin/src/app/(protected)/heri/media/page.tsx`

**Interfaces:**
- `MediaService.validate_upload(file) -> MediaAsset` rejects unsafe MIME, extension, size, and dimensions.
- `AnalyticsService.track(event) -> AnalyticsEvent` stores first-party events without credentials in the browser.
- `SocialProvider.publish(job) -> ProviderResult`; providers include Facebook, Instagram, X, and a development mock.
- Celery task `publish_social_job(job_id) -> ProviderResult` persists status, ID, errors, retry count, and timestamps.

- [ ] Implement storage metadata, validation, optimized variant hooks, public/private visibility, and signed download URLs where needed.
- [ ] Implement first-party event ingestion and admin reporting endpoints for pages, content, searches, CTAs, forms, downloads, registrations, and referrals.
- [ ] Implement provider interface, encrypted credentials, opt-in publication jobs, retry/cancel/manual override, and clear mock-provider configuration.
- [ ] Add worker/scheduler Compose wiring and targeted queue/retry tests.
- [ ] Commit the media/analytics/social milestone.

## Task 8: Deployment, docs, and release verification

**Files:**
- Modify: `gateway/nginx.conf`, `gateway/research.nginx.conf`, `docker-compose*.yml`, `.env.example`
- Create: `services/heri_africa/.env.example`
- Create: `docs/runbooks/heri-africa-deployment.md`, `docs/runbooks/heri-africa-admin-guide.md`, `docs/runbooks/heri-africa-publishing-guide.md`
- Create: `services/heri_africa/tests/test_openapi.py`, `frontend/apps/heri-africa/e2e/smoke.spec.ts`

- [ ] Document clean-database migration/seed, local and VM deployment, storage, email, analytics, social account setup, role assignment, publishing, backup, and rollback.
- [ ] Validate gateway routes, Compose profiles, health checks, environment templates, and worker/scheduler startup.
- [ ] Run Python compilation, all HERI backend tests, frontend lint/typecheck/unit/build, clean Alembic upgrade, OpenAPI validation, Compose config validation, and `git diff --check`.
- [ ] Review staged paths for secrets, generated output, unrelated user work, and placeholder dashboard values.
- [ ] Commit docs and release verification with the project helper.

## Self-review checklist

- [ ] Every spec domain maps to one or more tasks above.
- [ ] No task depends on an undefined API path, type, or function.
- [ ] Public visibility, verified-impact labeling, RBAC, auditing, media security, accessibility, SEO, analytics, social retries, deployment, and documentation are explicitly covered.
- [ ] Existing unrelated working-tree changes remain unstaged and uncommitted.
- [ ] Baseline library typecheck failure is tracked separately and is not attributed to HERI.
