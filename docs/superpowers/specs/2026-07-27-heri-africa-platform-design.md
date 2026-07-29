# HERI Africa × Kisii University Platform Design

## Scope

Build a production-ready, database-backed HERI Africa public platform hosted in partnership with Kisii University. The platform consists of a dedicated FastAPI service, a dedicated public Next.js app, and a HERI workspace in the existing admin portal. It covers editorial content, research communication, team and partner records, submissions, media, analytics, publishing workflow, and optional social distribution.

The implementation preserves existing repository conventions for authentication, authorization, SQLAlchemy/Alembic, Redis, Celery, shared UI, API clients, Docker Compose, gateway routing, accessibility, and testing.

## Architecture

### Service boundary

`services/heri_africa` is a dedicated FastAPI service using the PostgreSQL `heri` schema and the `/api/v1/heri` API prefix. It follows the existing research-service structure: async SQLAlchemy models, Alembic migrations, Pydantic schemas, service/repository layers, shared auth and audit middleware, Redis caching, and Celery jobs.

`frontend/apps/heri-africa` is a dedicated public Next.js application using shared UI, accessibility, API-client, and motion primitives.

`frontend/apps/admin` remains the shared operational shell and receives a permission-aware HERI workspace rather than a second admin application.

Compose, gateway, environment templates, workers, schedulers, migrations, and deployment documentation are updated together.

### Persistence domains

- Site configuration: branding, navigation, footer, SEO defaults, contact details, social links, and feature flags.
- Page composition: pages, ordered sections, section configuration, preview state, publication state, revisions, and authorship.
- Editorial content: news, stories, announcements, events, opportunities, categories, tags, authors, and relationships.
- Research: themes, priorities, projects, members, publications, reports, resources, impact stories, and external links.
- People and partners: team profiles, roles, expertise, organisations, logos, countries, and Kisii partnership metadata.
- Submissions: contacts, partnership applications, network applications, newsletter subscriptions, event registrations, and research enquiries.
- Media and audit: assets, optimized variants, usage rights, revisions, audit events, and soft deletion.
- Analytics and social: first-party events, reports, social accounts, publication jobs, retries, provider responses, and audit trails.

Every impact indicator stores its value, label, reporting period, source, and verification status so verified results remain distinct from strategic ambitions and planned targets.

## Publishing and submission flows

Editorial workflow:

`draft → in_review → approved → scheduled/published → archived`

Editors create and submit drafts. Publishers approve, reject, schedule, publish, archive, or restore. Public APIs return only published or due-scheduled content. Workflow actions record the authenticated actor, role, entity, previous state, new state, timestamp, IP address, and user agent.

Public submissions are validated at the API boundary, persisted durably, optionally handed to Celery for notification or follow-up work, then managed through assignment, response, and resolution states in the admin workspace.

If social distribution is enabled, publication creates a platform-specific Celery job. Credentials remain encrypted and server-side; publication status, external IDs, errors, retry counts, and manual overrides are persisted.

## Public experience

The public app provides API-driven routes for the homepage, about, work, research, impact, team, news, events, partners, opportunities, partnership and network forms, contact, search, privacy, and accessibility. Detail routes use slugs and route-level metadata.

The visual system translates the supplied references into reusable components:

- Co-branded HERI Africa × Kisii University floating header.
- Green, teal, blue, lime, and cream token layer over shared typography and spacing conventions.
- Editorial hero with poster/fallback media, accessible controls, and reduced-motion behavior.
- Research theme, publication, impact, team, partner, news, event, and CTA components.
- Accessible responsive navigation and forms with explicit loading, empty, error, success, focus, keyboard, and mobile states.

Homepage composition is API-driven and includes the hero, HERI purpose, research priorities, Kisii partnership, featured research, verified impact, labelled ambitions, geographic reach, leadership, partners, news/events, partnership CTA, newsletter, and footer.

## Admin experience

The HERI workspace reuses the existing admin shell, permission guards, query hooks, tables, forms, modals, charts, media selection, and audit patterns. It provides dashboard, page and section editing, content review, research, people, partners, events, opportunities, media, enquiries, applications, newsletter management, SEO/settings, revisions, and social publishing.

The dashboard uses live HERI reporting endpoints for publication pipeline, submissions, events, research records, partners, social failures, traffic, date ranges, and comparisons. No dashboard metric is hardcoded.

Role behavior follows the existing repository authorization system:

- Administrator: full HERI access.
- Editor: create/edit/upload/draft/submit, but no publishing.
- Publisher: review/approve/schedule/publish/archive.
- Partnership Manager: partner and submission pipelines.
- Social Publisher: provider accounts and publication jobs.
- Viewer: read-only reporting and records.

## Operations and security

The platform adds HERI API, public app, worker, scheduler, gateway routes, health checks, migrations, seed instructions, and environment templates to local and VM deployment profiles.

Uploads enforce MIME and extension validation, size limits, sanitized filenames, image dimensions, storage visibility, usage rights, alt text, credits, and soft deletion. Protected downloads use signed URLs where required.

Public forms use rate limiting, honeypot/spam protection, consent capture, validation, and safe error handling. Rich text is sanitized. ORM parameters prevent injection. Secrets are redacted from logs and never returned to the browser.

SEO includes route metadata, canonical URLs, Open Graph/X cards, organization/person/article/event/publication/breadcrumb JSON-LD, sitemap, and robots. Accessibility includes semantic headings, one primary H1, labels, error announcements, skip links, focus states, keyboard navigation, meaningful alt text, accessible media fallbacks, and reduced-motion support.

## Verification strategy

Backend checks cover models, migrations, public published-only visibility, workflow transitions, RBAC, soft deletion, revisions, enquiries, media validation, analytics, social queueing, retry behavior, and API contracts.

Frontend checks cover route rendering, API loading/error/empty states, form validation/submission, admin permission visibility, editor/media selection, responsive behavior, accessibility, and SEO metadata.

Required release checks include Python compilation, backend tests, frontend lint/typecheck/unit tests/build, clean Alembic upgrade, OpenAPI validation, Docker Compose validation, and `git diff --check`. Commits use `scripts/commit-changes.sh` after relevant checks and exclude unrelated working-tree changes.

## Delivery milestones

1. Add service/app scaffolding, shared configuration, migrations, seed foundations, Compose, and gateway wiring.
2. Implement durable HERI models, public read APIs, submissions, and seed content.
3. Add shared-auth RBAC, audit logs, revisions, and publishing workflow.
4. Build the public API client and core HERI routes/components.
5. Add HERI admin workspace and live dashboard.
6. Add media, analytics reporting, and social provider interfaces/jobs.
7. Complete SEO, accessibility, security hardening, documentation, and release verification.

## Acceptance criteria

The platform is complete when HERI data persists in PostgreSQL, migrations and seed data work from a clean database, public content is API-driven and published-only, permissions and workflow transitions are enforced, admin CRUD and section reordering work, forms and enquiries are operational, dashboard values are API-backed, analytics are stored/reportable, social jobs are queued/retryable, credentials remain protected, public routes/search/archives/SEO work, accessibility requirements are met, builds/tests/Compose validation pass, and documentation describes deployment, administration, media, social setup, publishing, backup, and rollback.
