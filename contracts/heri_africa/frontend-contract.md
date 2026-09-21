# HERI Africa API



- Version: `0.1.0`
- OpenAPI: `3.1.0`

## Frontend Contract

This file is generated from the live FastAPI OpenAPI schema. Treat it as the frontend contract for request shapes, auth expectations, and response envelopes.

## HERI Admin

### `GET /api/v1/heri/admin/dashboard`

Dashboard

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 DashboardSummary

## HERI Admin CRUD

### `POST /api/v1/heri/admin/partners/sync`

Sync Partners From Research

Refresh HERI partner projections from the canonical Research Service.

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 PartnerSyncResponse

### `GET /api/v1/heri/admin/{resource}`

List Resource

- Auth: HTTPBearer
- Request body: -
- Parameters: `resource` (path, string), `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 PaginatedResponse_DynamicResourceResponse_

### `POST /api/v1/heri/admin/{resource}`

Create Resource

- Auth: HTTPBearer
- Request body: object
- Parameters: `resource` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 DynamicResourceResponse

### `GET /api/v1/heri/admin/{resource}/{record_id}`

Get Resource

- Auth: HTTPBearer
- Request body: -
- Parameters: `resource` (path, string), `record_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 DynamicResourceResponse

### `PATCH /api/v1/heri/admin/{resource}/{record_id}`

Update Resource

- Auth: HTTPBearer
- Request body: object
- Parameters: `resource` (path, string), `record_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 DynamicResourceResponse

### `DELETE /api/v1/heri/admin/{resource}/{record_id}`

Delete Resource

- Auth: HTTPBearer
- Request body: -
- Parameters: `resource` (path, string), `record_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/heri/admin/{resource}/{record_id}/audit`

List Resource Audit

Return the immutable change history used by the HERI revision panel.

- Auth: HTTPBearer
- Request body: -
- Parameters: `resource` (path, string), `record_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 array<AuditRecordResponse>

### `POST /api/v1/heri/admin/{resource}/{record_id}/restore`

Restore Resource

Restore the changed fields captured by an audit entry and record the restore itself.

- Auth: HTTPBearer
- Request body: object
- Parameters: `resource` (path, string), `record_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 DynamicResourceResponse

### `POST /api/v1/heri/admin/{resource}/{record_id}/transition`

Transition Resource

Apply the shared draft/review/publish workflow to any status-bearing resource.

- Auth: HTTPBearer
- Request body: object
- Parameters: `resource` (path, string), `record_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 DynamicResourceResponse

## HERI Admin Content

### `GET /api/v1/heri/admin/events`

List Events

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 PaginatedResponse_EventAdminResponse_

### `POST /api/v1/heri/admin/events`

Create Event

- Auth: HTTPBearer
- Request body: EventCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 EventAdminResponse

### `GET /api/v1/heri/admin/news`

List News

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 PaginatedResponse_NewsAdminResponse_

### `POST /api/v1/heri/admin/news`

Create News

- Auth: HTTPBearer
- Request body: NewsCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 NewsAdminResponse

### `PATCH /api/v1/heri/admin/news/{article_id}`

Update News

- Auth: HTTPBearer
- Request body: NewsUpdate
- Parameters: `article_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 NewsAdminResponse

### `POST /api/v1/heri/admin/news/{article_id}/transition`

Transition News

- Auth: HTTPBearer
- Request body: TransitionRequest
- Parameters: `article_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 NewsAdminResponse

## HERI Analytics

### `POST /api/v1/heri/analytics/events`

Track Event

- Auth: public
- Request body: AnalyticsEventPayload
- Parameters: -
- Success response: 202 AnalyticsAcceptedResponse

## HERI Analytics Reports

### `GET /api/v1/heri/admin/analytics/report`

Report

- Auth: HTTPBearer
- Request body: -
- Parameters: `start_date` (query, string), `end_date` (query, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 AnalyticsReport

## HERI Collections

### `GET /api/v1/heri/centers/{center_id}/partners`

Center Partners

- Auth: public
- Request body: -
- Parameters: `center_id` (path, string), `limit` (query, integer)
- Success response: 200 array<PartnerSummary>

### `GET /api/v1/heri/events`

Events

- Auth: public
- Request body: -
- Parameters: `limit` (query, integer)
- Success response: 200 array<EventSummary>

### `GET /api/v1/heri/impact-metrics`

Impact Metrics

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 array<ImpactMetricSummary>

### `GET /api/v1/heri/opportunities`

Opportunities

- Auth: public
- Request body: -
- Parameters: `limit` (query, integer)
- Success response: 200 array<OpportunitySummary>

### `GET /api/v1/heri/pages/{slug}`

Public Page

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 PublicPageResponse

### `GET /api/v1/heri/partners`

Partners

- Auth: public
- Request body: -
- Parameters: `limit` (query, integer), `center_id` (query, string | null), `center_slug` (query, string | null)
- Success response: 200 array<PartnerSummary>

### `GET /api/v1/heri/research/projects`

Projects

- Auth: public
- Request body: -
- Parameters: `limit` (query, integer)
- Success response: 200 array<ResearchSummary>

### `GET /api/v1/heri/research/projects/paginated`

Projects Paginated

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer)
- Success response: 200 PaginatedCollection

### `GET /api/v1/heri/research/projects/{slug}`

Project Detail

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 ResearchSummary

### `GET /api/v1/heri/research/publications`

Publications

- Auth: public
- Request body: -
- Parameters: `limit` (query, integer)
- Success response: 200 array<ResearchSummary>

### `GET /api/v1/heri/research/publications/paginated`

Publications Paginated

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer)
- Success response: 200 PaginatedCollection

### `GET /api/v1/heri/research/publications/{slug}`

Publication Detail

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 ResearchSummary

### `GET /api/v1/heri/research/themes`

Themes

- Auth: public
- Request body: -
- Parameters: `limit` (query, integer)
- Success response: 200 array<ResearchSummary>

### `GET /api/v1/heri/research/themes/{slug}`

Theme Detail

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 ResearchSummary

### `GET /api/v1/heri/team`

Team

- Auth: public
- Request body: -
- Parameters: `limit` (query, integer)
- Success response: 200 array<TeamSummary>

### `GET /api/v1/heri/team/{slug}`

Team Detail

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 TeamSummary

## HERI Health

### `GET /api/v1/heri/health`

Health

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 SuccessResponse_HealthPayload_

## HERI Media

### `POST /api/v1/heri/admin/media/upload`

Upload

- Auth: HTTPBearer
- Request body: -
- Parameters: `folder` (query, string), `filename` (query, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 MediaAssetResponse

### `GET /api/v1/heri/admin/media/{asset_id}/download`

Download

- Auth: HTTPBearer
- Request body: -
- Parameters: `asset_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200

## HERI Public

### `GET /api/v1/heri/chair`

Chair

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 ChairProfileResponse

### `GET /api/v1/heri/footer`

Footer

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 array<FooterLinkResponse>

### `GET /api/v1/heri/hero-slides`

Hero Slides

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 array<HeroSlideResponse>

### `GET /api/v1/heri/navigation`

Navigation

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 array<NavigationItemResponse>

### `GET /api/v1/heri/news`

News

- Auth: public
- Request body: -
- Parameters: `limit` (query, integer), `offset` (query, integer)
- Success response: 200 array<NewsSummary>

### `GET /api/v1/heri/news/{slug}`

News Detail

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 NewsDetail

### `GET /api/v1/heri/site`

Site

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 SiteResponse

## HERI Submissions

### `POST /api/v1/heri/contact`

Contact

- Auth: public
- Request body: ContactSubmission
- Parameters: -
- Success response: 202 SubmissionResponse

### `POST /api/v1/heri/events/{event_id}/register`

Register Event

- Auth: public
- Request body: EventRegistration
- Parameters: `event_id` (path, string)
- Success response: 202 SubmissionResponse

### `POST /api/v1/heri/network-applications`

Network

- Auth: public
- Request body: NetworkSubmission
- Parameters: -
- Success response: 202 SubmissionResponse

### `POST /api/v1/heri/newsletter/subscribe`

Newsletter

- Auth: public
- Request body: NewsletterSubmission
- Parameters: -
- Success response: 202 SubmissionResponse

### `POST /api/v1/heri/partnership-applications`

Partnership

- Auth: public
- Request body: PartnershipSubmission
- Parameters: -
- Success response: 202 SubmissionResponse

## Schemas

Generated component schemas: `44`

### `AnalyticsAcceptedResponse`

- `duplicate`: `boolean | null` (optional)
- `status`: `string` (optional)

### `AnalyticsEventPayload`

- `event_name`: `string` (required)
- `path`: `string` (required)
- `properties`: `object` (optional)
- `session_id`: `string | null` (optional)

### `AnalyticsReport`

- `content_views`: `integer` (required)
- `cta_conversions`: `array<object>` (required)
- `downloads`: `integer` (required)
- `end_date`: `string` (required)
- `form_submissions`: `integer` (required)
- `page_views`: `integer` (required)
- `registrations`: `integer` (required)
- `start_date`: `string` (required)
- `top_pages`: `array<object>` (required)
- `top_search_terms`: `array<object>` (required)
- `total_events`: `integer` (required)

### `AuditRecordResponse`

- `action`: `string` (required)
- `actor_id`: `string | null` (optional)
- `entity_id`: `string` (required)
- `entity_type`: `string` (required)
- `id`: `string` (required)
- `ip_address`: `string | null` (optional)
- `new_value`: `object | null` (optional)
- `previous_value`: `object | null` (optional)
- `user_agent`: `string | null` (optional)

### `ChairProfileResponse`

- `about`: `string` (required)
- `acronym`: `string | null` (required)
- `cover_image_url`: `string | null` (required)
- `host_institution`: `string` (required)
- `id`: `string` (required)
- `initiative_name`: `string` (required)
- `logo_url`: `string | null` (required)
- `mandate`: `string` (required)
- `mission`: `string` (required)
- `name`: `string` (required)
- `objectives`: `string` (required)
- `seo`: `object` (required)
- `tagline`: `string | null` (required)
- `values`: `array<-> | object | null` (required)
- `vision`: `string` (required)
- `why_it_matters`: `string` (required)

### `ContactSubmission`

- `consent`: `boolean` (required)
- `country`: `string | null` (optional)
- `email`: `string` (required)
- `message`: `string` (required)
- `name`: `string` (required)
- `organisation`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `subject`: `string | null` (optional)

### `DashboardSummary`

- `active_projects`: `integer` (required)
- `drafts_awaiting_review`: `integer` (required)
- `featured_projects`: `integer` (required)
- `media_assets`: `integer` (required)
- `media_missing_alt_text`: `integer` (required)
- `new_submissions`: `integer` (required)
- `partners`: `integer` (required)
- `publications`: `integer` (required)
- `published_articles`: `integer` (required)
- `published_pages`: `integer` (required)
- `research_themes`: `integer` (required)
- `scheduled_content`: `integer` (required)
- `social_failures`: `integer` (required)
- `submissions_in_progress`: `integer` (required)
- `team_members`: `integer` (required)
- `total_articles`: `integer` (required)
- `total_pages`: `integer` (required)
- `upcoming_events`: `integer` (required)
- `upcoming_opportunities`: `integer` (required)
- `visible_page_sections`: `integer` (required)

### `DynamicResourceResponse`

- No direct properties documented.

### `EventAdminResponse`

- `description`: `string` (optional)
- `ends_at`: `string | null` (optional)
- `event_type`: `string | null` (optional)
- `featured_image_url`: `string | null` (optional)
- `id`: `string` (required)
- `is_featured`: `boolean` (optional)
- `is_virtual`: `boolean` (optional)
- `location`: `string | null` (optional)
- `position`: `integer` (optional)
- `registration_url`: `string | null` (optional)
- `scheduled_at`: `string | null` (optional)
- `slug`: `string` (required)
- `starts_at`: `string | null` (optional)
- `status`: `string` (required)
- `summary`: `string` (optional)
- `title`: `string` (required)
- `virtual_url`: `string | null` (optional)

### `EventCreate`

- `description`: `string` (optional)
- `ends_at`: `string | null` (optional)
- `location`: `string | null` (optional)
- `registration_url`: `string | null` (optional)
- `slug`: `string` (required)
- `starts_at`: `string | null` (optional)
- `summary`: `string` (optional)
- `title`: `string` (required)

### `EventRegistration`

- `accessibility_requirements`: `string | null` (optional)
- `consent`: `boolean` (required)
- `country`: `string | null` (optional)
- `email`: `string` (required)
- `name`: `string` (required)
- `organisation`: `string | null` (optional)

### `EventSummary`

- `ends_at`: `- | null` (required)
- `event_type`: `string | null` (optional)
- `featured_image_url`: `string | null` (optional)
- `id`: `string` (required)
- `is_featured`: `boolean` (optional)
- `is_virtual`: `boolean` (optional)
- `location`: `string | null` (required)
- `position`: `integer` (optional)
- `slug`: `string` (required)
- `starts_at`: `- | null` (required)
- `summary`: `string` (required)
- `title`: `string` (required)
- `virtual_url`: `string | null` (optional)

### `FooterLinkResponse`

- `column`: `string` (required)
- `href`: `string` (required)
- `label`: `string` (required)
- `position`: `integer` (required)

### `HTTPValidationError`

- `detail`: `array<ValidationError>` (optional)

### `HealthPayload`

- `release`: `string` (required)
- `service`: `string` (required)
- `status`: `string` (required)

### `HeroSlideResponse`

- `button_href`: `string` (required)
- `button_label`: `string` (required)
- `description`: `string` (required)
- `eyebrow`: `string` (required)
- `id`: `string` (required)
- `image_url`: `string` (required)
- `mobile_image_url`: `string | null` (required)
- `position`: `integer` (required)
- `title`: `string` (required)

### `ImpactMetricSummary`

- `description`: `string` (required)
- `id`: `string` (required)
- `label`: `string` (required)
- `position`: `integer` (required)
- `unit`: `string | null` (required)
- `value`: `string` (required)

### `MediaAssetResponse`

- `alt_text`: `string` (required)
- `caption`: `string | null` (optional)
- `credit`: `string | null` (optional)
- `file_hash`: `string | null` (optional)
- `file_name`: `string` (required)
- `file_size`: `integer` (required)
- `focal_x`: `number | null` (optional)
- `focal_y`: `number | null` (optional)
- `height`: `integer | null` (optional)
- `id`: `string` (required)
- `mime_type`: `string` (required)
- `public_url`: `string | null` (optional)
- `storage_path`: `string` (required)
- `width`: `integer | null` (optional)

### `NavigationItemResponse`

- `href`: `string` (required)
- `label`: `string` (required)
- `position`: `integer` (required)

### `NetworkSubmission`

- `consent`: `boolean` (required)
- `country`: `string | null` (optional)
- `email`: `string` (required)
- `interests`: `array<string>` (optional)
- `name`: `string` (required)
- `organisation`: `string | null` (optional)
- `research_interests`: `string | null` (optional)
- `role`: `string | null` (optional)

### `NewsAdminResponse`

- `body`: `string` (optional)
- `excerpt`: `string | null` (optional)
- `featured_image_url`: `string | null` (optional)
- `id`: `string` (required)
- `published_at`: `string | null` (required)
- `scheduled_at`: `string | null` (required)
- `slug`: `string` (required)
- `status`: `string` (required)
- `title`: `string` (required)

### `NewsCreate`

- `body`: `string` (optional)
- `excerpt`: `string | null` (optional)
- `featured_image_url`: `string | null` (optional)
- `slug`: `string` (required)
- `title`: `string` (required)

### `NewsDetail`

- `body`: `string` (required)
- `excerpt`: `string | null` (required)
- `featured_image_url`: `string | null` (required)
- `id`: `string` (required)
- `published_at`: `string | null` (required)
- `slug`: `string` (required)
- `title`: `string` (required)

### `NewsSummary`

- `excerpt`: `string | null` (required)
- `id`: `string` (required)
- `published_at`: `string | null` (required)
- `slug`: `string` (required)
- `title`: `string` (required)

### `NewsUpdate`

- `body`: `string | null` (optional)
- `excerpt`: `string | null` (optional)
- `featured_image_url`: `string | null` (optional)
- `title`: `string | null` (optional)

### `NewsletterSubmission`

- `consent`: `boolean` (required)
- `email`: `string` (required)

### `OpportunitySummary`

- `application_instructions`: `string | null` (optional)
- `application_url`: `string | null` (required)
- `closing_at`: `- | null` (required)
- `description`: `string | null` (optional)
- `eligibility`: `string | null` (optional)
- `featured_image_url`: `string | null` (optional)
- `id`: `string` (required)
- `is_featured`: `boolean` (optional)
- `opportunity_type`: `string | null` (optional)
- `position`: `integer` (optional)
- `slug`: `string` (required)
- `summary`: `string` (required)
- `title`: `string` (required)

### `PageSectionSummary`

- `background_variant`: `string` (optional)
- `configuration`: `object` (required)
- `cta_href`: `string | null` (optional)
- `cta_label`: `string | null` (optional)
- `description`: `string | null` (optional)
- `eyebrow`: `string | null` (optional)
- `id`: `string` (required)
- `image_url`: `string | null` (optional)
- `position`: `integer` (required)
- `section_type`: `string` (required)
- `title`: `string | null` (optional)

### `PaginatedCollection`

- `items`: `array<->` (required)
- `page`: `integer` (required)
- `pages`: `integer` (required)
- `per_page`: `integer` (required)
- `total`: `integer` (required)

### `PaginatedResponse_DynamicResourceResponse_`

- `data`: `array<DynamicResourceResponse>` (required)
- `message`: `string` (optional)
- `meta`: `PaginationMeta` (required)
- `status`: `string` (optional)

### `PaginatedResponse_EventAdminResponse_`

- `data`: `array<EventAdminResponse>` (required)
- `message`: `string` (optional)
- `meta`: `PaginationMeta` (required)
- `status`: `string` (optional)

### `PaginatedResponse_NewsAdminResponse_`

- `data`: `array<NewsAdminResponse>` (required)
- `message`: `string` (optional)
- `meta`: `PaginationMeta` (required)
- `status`: `string` (optional)

### `PaginationMeta`

- `page`: `integer` (required)
- `pages`: `integer` (required)
- `per_page`: `integer` (required)
- `total`: `integer` (required)

### `PartnerSummary`

- `collaboration_areas`: `array<-> | object | null` (optional)
- `country`: `string | null` (required)
- `description`: `string` (required)
- `id`: `string` (required)
- `logo_url`: `string | null` (required)
- `mou_expiry_date`: `- | null` (optional)
- `mou_signed_date`: `- | null` (optional)
- `name`: `string` (required)
- `partner_type`: `string | null` (optional)
- `partnership_end`: `- | null` (optional)
- `partnership_level`: `string | null` (optional)
- `partnership_start`: `- | null` (optional)
- `relationship_notes`: `string | null` (optional)
- `relationship_status`: `string` (optional)
- `research_center_id`: `string | null` (optional)
- `research_center_slug`: `string | null` (optional)
- `research_partner_id`: `string | null` (optional)
- `slug`: `string` (required)
- `website_url`: `string | null` (required)

### `PartnerSyncResponse`

- `created`: `integer` (required)
- `total`: `integer` (required)
- `updated`: `integer` (required)

### `PartnershipSubmission`

- `consent`: `boolean` (required)
- `contact_person`: `string` (required)
- `country`: `string` (required)
- `email`: `string` (required)
- `organisation`: `string` (required)
- `partnership_interest`: `string` (required)
- `proposed_collaboration`: `string` (required)
- `website`: `string | null` (optional)

### `PublicPageResponse`

- `sections`: `array<PageSectionSummary>` (required)
- `seo_description`: `string | null` (required)
- `seo_title`: `string | null` (required)
- `slug`: `string` (required)
- `title`: `string` (required)

### `ResearchSummary`

- `cover_image_url`: `string | null` (optional)
- `id`: `string` (required)
- `is_featured`: `boolean` (optional)
- `position`: `integer` (optional)
- `publication_date`: `- | null` (optional)
- `publication_type`: `string | null` (optional)
- `slug`: `string` (required)
- `summary`: `string` (required)
- `theme_id`: `string | null` (optional)
- `title`: `string` (required)

### `SiteResponse`

- `contact`: `object` (required)
- `name`: `string` (required)
- `research_center_slug`: `string | null` (optional)
- `seo_defaults`: `object` (required)
- `social_links`: `object` (required)
- `tagline`: `string | null` (required)

### `SubmissionResponse`

- `code`: `string | null` (optional)
- `detail`: `string | null` (optional)
- `message`: `string | null` (optional)
- `status`: `string | null` (optional)

### `SuccessResponse_HealthPayload_`

- `data`: `HealthPayload | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `TeamSummary`

- `biography`: `string` (required)
- `education`: `string | null` (optional)
- `email`: `string | null` (optional)
- `expertise`: `array<-> | object | null` (optional)
- `id`: `string` (required)
- `is_featured`: `boolean` (optional)
- `name`: `string` (required)
- `photo_url`: `string | null` (required)
- `research_interests`: `string | null` (optional)
- `role`: `string` (required)
- `slug`: `string` (required)
- `social_links`: `object | null` (optional)
- `title`: `string | null` (optional)

### `TransitionRequest`

- `note`: `string | null` (optional)
- `status`: `string` (required)

### `ValidationError`

- `ctx`: `object` (optional)
- `input`: `object` (optional)
- `loc`: `array<string | integer>` (required)
- `msg`: `string` (required)
- `type`: `string` (required)
