# KSU Research API



- Version: `0.1.0`
- OpenAPI: `3.1.0`

## Frontend Contract

This file is generated from the live FastAPI OpenAPI schema. Treat it as the frontend contract for request shapes, auth expectations, and response envelopes.

## Audit

### `GET /api/v1/audit`

List Audit Logs

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `user_id` (query, string | null), `resource_type` (query, string | null), `status` (query, string | null), `x-internal-api-key` (header, string | null)
- Success response: 200 -

## Competition Entries

### `GET /api/v1/competition-entries`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/competition-entries`

Create Item

- Auth: HTTPBearer
- Request body: CompetitionEntryCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/competition-entries/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: CompetitionEntryUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/competition-entries/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/competition-entries/id/{item_id}/approve`

Approve Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/competition-entries/id/{item_id}/archive`

Archive Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/competition-entries/id/{item_id}/entry-status`

Set Competition Entry Status

- Auth: HTTPBearer
- Request body: CompetitionEntryStatusAction
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/competition-entries/id/{item_id}/feature`

Feature Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/competition-entries/id/{item_id}/publish`

Publish Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/competition-entries/id/{item_id}/unfeature`

Unfeature Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/competition-entries/id/{item_id}/unpublish`

Unpublish Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/competition-entries/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Consultancies

### `GET /api/v1/consultancies`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/consultancies`

Create Item

- Auth: HTTPBearer
- Request body: ConsultancyCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/consultancies/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: ConsultancyUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/consultancies/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/consultancies/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Donation Impacts

### `GET /api/v1/donation-impacts`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/donation-impacts`

Create Item

- Auth: HTTPBearer
- Request body: DonationImpactCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/donation-impacts/id/{impact_id}/donations`

List Impact Donations

- Auth: HTTPBearer
- Request body: -
- Parameters: `impact_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/donation-impacts/id/{impact_id}/stories`

List Impact Stories

- Auth: HTTPBearer
- Request body: -
- Parameters: `impact_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/donation-impacts/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: DonationImpactUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/donation-impacts/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/donation-impacts/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Donation Settings

### `GET /api/v1/donation-settings`

List Items

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/donation-settings`

Create Item

- Auth: HTTPBearer
- Request body: DonationSettingsCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/donation-settings/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: DonationSettingsUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/donation-settings/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/donation-settings/{slug}`

Get Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `access_token` (cookie, string | null)
- Success response: 200 -

## Donation Stories

### `GET /api/v1/donation-stories`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/donation-stories`

Create Item

- Auth: HTTPBearer
- Request body: DonationStoryCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/donation-stories/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: DonationStoryUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/donation-stories/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/donation-stories/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Donations

### `GET /api/v1/donations`

List Items

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/donations`

Create Item

- Auth: HTTPBearer
- Request body: DonationCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/donations/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: DonationUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/donations/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/donations/submit`

Submit Public Donation

- Auth: public
- Request body: PublicDonationSubmission
- Parameters: -
- Success response: 201 -

### `GET /api/v1/donations/summary`

Get Donation Summary

- Auth: HTTPBearer
- Request body: -
- Parameters: `access_token` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/donations/{slug}`

Get Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `access_token` (cookie, string | null)
- Success response: 200 -

## Donors

### `GET /api/v1/donors`

List Items

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/donors`

Create Item

- Auth: HTTPBearer
- Request body: DonorCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/donors/id/{donor_id}/impacts`

List Donor Impacts

- Auth: HTTPBearer
- Request body: -
- Parameters: `donor_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/donors/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: DonorUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/donors/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/donors/{slug}`

Get Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `access_token` (cookie, string | null)
- Success response: 200 -

## Endowment Funds

### `GET /api/v1/endowments`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/endowments`

Create Item

- Auth: HTTPBearer
- Request body: EndowmentFundCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/endowments/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: EndowmentFundUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/endowments/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/endowments/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Expertise Tags

### `GET /api/v1/expertise-tags`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/expertise-tags`

Create Item

- Auth: HTTPBearer
- Request body: ExpertiseTagCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/expertise-tags/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: ExpertiseTagUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/expertise-tags/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/expertise-tags/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Focus Areas

### `GET /api/v1/focus-areas`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/focus-areas`

Create Item

- Auth: HTTPBearer
- Request body: FocusAreaCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/focus-areas/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: FocusAreaUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/focus-areas/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/focus-areas/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Funding Sources

### `GET /api/v1/funders`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/funders`

Create Item

- Auth: HTTPBearer
- Request body: FundingCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/funders/id/{funder_id}/grants`

List Funder Grants

- Auth: public
- Request body: -
- Parameters: `funder_id` (path, string)
- Success response: 200 -

### `GET /api/v1/funders/id/{funder_id}/projects`

List Funder Projects

- Auth: public
- Request body: -
- Parameters: `funder_id` (path, string)
- Success response: 200 -

### `PATCH /api/v1/funders/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: FundingUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/funders/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/funders/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Grant Applications

### `GET /api/v1/grant-applications`

List Items

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/grant-applications`

Create Item

- Auth: HTTPBearer
- Request body: GrantApplicationCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/grant-applications/id/{application_id}/reports`

List Application Reports

- Auth: HTTPBearer
- Request body: -
- Parameters: `application_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/grant-applications/id/{application_id}/reviews`

List Application Reviews

- Auth: HTTPBearer
- Request body: -
- Parameters: `application_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/grant-applications/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: GrantApplicationUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/grant-applications/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/grant-applications/{slug}`

Get Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `access_token` (cookie, string | null)
- Success response: 200 -

## Grant Guidelines

### `GET /api/v1/grant-guidelines`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/grant-guidelines`

Create Item

- Auth: HTTPBearer
- Request body: GrantGuidelineCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/grant-guidelines/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: GrantGuidelineUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/grant-guidelines/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/grant-guidelines/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Grant Reports

### `GET /api/v1/grant-reports`

List Items

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/grant-reports`

Create Item

- Auth: HTTPBearer
- Request body: GrantReportCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/grant-reports/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: GrantReportUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/grant-reports/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/grant-reports/{slug}`

Get Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `access_token` (cookie, string | null)
- Success response: 200 -

## Grant Reviews

### `GET /api/v1/grant-reviews`

List Items

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/grant-reviews`

Create Item

- Auth: HTTPBearer
- Request body: GrantReviewCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/grant-reviews/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: GrantReviewUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/grant-reviews/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/grant-reviews/{slug}`

Get Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `access_token` (cookie, string | null)
- Success response: 200 -

## Grants

### `GET /api/v1/grants`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/grants`

Create Item

- Auth: HTTPBearer
- Request body: GrantCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/grants/id/{grant_id}/projects`

List Grant Projects

- Auth: public
- Request body: -
- Parameters: `grant_id` (path, string)
- Success response: 200 -

### `GET /api/v1/grants/id/{grant_id}/themes`

List Grant Themes

- Auth: public
- Request body: -
- Parameters: `grant_id` (path, string)
- Success response: 200 -

### `PUT /api/v1/grants/id/{grant_id}/themes/{theme_id}`

Add Grant Theme

- Auth: HTTPBearer
- Request body: -
- Parameters: `grant_id` (path, string), `theme_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/grants/id/{grant_id}/themes/{theme_id}`

Remove Grant Theme

- Auth: HTTPBearer
- Request body: -
- Parameters: `grant_id` (path, string), `theme_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `PATCH /api/v1/grants/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: GrantUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/grants/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/grants/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Health

### `GET /api/v1/health`

Health

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 -

## Impact Metrics

### `GET /api/v1/impact-metrics`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/impact-metrics`

Create Item

- Auth: HTTPBearer
- Request body: ImpactMetricCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/impact-metrics/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: ImpactMetricUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/impact-metrics/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/impact-metrics/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Incubation Records

### `GET /api/v1/incubation-records`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/incubation-records`

Create Item

- Auth: HTTPBearer
- Request body: IncubationRecordCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/incubation-records/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: IncubationRecordUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/incubation-records/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/incubation-records/id/{item_id}/approve`

Approve Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/incubation-records/id/{item_id}/archive`

Archive Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/incubation-records/id/{item_id}/assign-mentors`

Assign Incubation Mentors

- Auth: HTTPBearer
- Request body: MentorAssignmentAction
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/incubation-records/id/{item_id}/feature`

Feature Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/incubation-records/id/{item_id}/publish`

Publish Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/incubation-records/id/{item_id}/stage`

Set Incubation Stage

- Auth: HTTPBearer
- Request body: IncubationStageAction
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/incubation-records/id/{item_id}/unfeature`

Unfeature Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/incubation-records/id/{item_id}/unpublish`

Unpublish Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/incubation-records/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Innovations

### `GET /api/v1/innovations`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/innovations`

Create Item

- Auth: HTTPBearer
- Request body: InnovationCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/innovations/id/{innovation_id}/competition-entries`

List Innovation Competition Entries

- Auth: public
- Request body: -
- Parameters: `innovation_id` (path, string)
- Success response: 200 -

### `GET /api/v1/innovations/id/{innovation_id}/incubation-records`

List Innovation Incubation Records

- Auth: public
- Request body: -
- Parameters: `innovation_id` (path, string)
- Success response: 200 -

### `GET /api/v1/innovations/id/{innovation_id}/startups`

List Innovation Startups

- Auth: public
- Request body: -
- Parameters: `innovation_id` (path, string)
- Success response: 200 -

### `GET /api/v1/innovations/id/{innovation_id}/technology-transfer-cases`

List Innovation Technology Transfer Cases

- Auth: public
- Request body: -
- Parameters: `innovation_id` (path, string)
- Success response: 200 -

### `PATCH /api/v1/innovations/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: InnovationUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/innovations/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/innovations/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Journals

### `GET /api/v1/journals`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/journals`

Create Item

- Auth: HTTPBearer
- Request body: JournalCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/journals/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: JournalUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/journals/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/journals/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Mentorship Applications

### `GET /api/v1/mentorship-applications`

List Items

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/mentorship-applications`

Create Item

- Auth: HTTPBearer
- Request body: MentorshipApplicationCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/mentorship-applications/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: MentorshipApplicationUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/mentorship-applications/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/mentorship-applications/{slug}`

Get Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `access_token` (cookie, string | null)
- Success response: 200 -

## Mentorship Matches

### `GET /api/v1/mentorship-matches`

List Items

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/mentorship-matches`

Create Item

- Auth: HTTPBearer
- Request body: MentorshipMatchCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/mentorship-matches/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: MentorshipMatchUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/mentorship-matches/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/mentorship-matches/{slug}`

Get Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `access_token` (cookie, string | null)
- Success response: 200 -

## Mentorship Programs

### `GET /api/v1/mentorship`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/mentorship`

Create Item

- Auth: HTTPBearer
- Request body: MentorshipProgramCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/mentorship/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: MentorshipProgramUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/mentorship/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/mentorship/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Partners

### `GET /api/v1/partners`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/partners`

Create Item

- Auth: HTTPBearer
- Request body: PartnerCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/partners/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: PartnerUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/partners/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/partners/id/{partner_id}/activities`

List Partner Activities

- Auth: public
- Request body: -
- Parameters: `partner_id` (path, string)
- Success response: 200 -

### `GET /api/v1/partners/id/{partner_id}/competition-entries`

List Partner Competition Entries

- Auth: public
- Request body: -
- Parameters: `partner_id` (path, string)
- Success response: 200 -

### `GET /api/v1/partners/id/{partner_id}/consultancies`

List Partner Consultancies

- Auth: public
- Request body: -
- Parameters: `partner_id` (path, string)
- Success response: 200 -

### `GET /api/v1/partners/id/{partner_id}/farms`

List Partner Farms

- Auth: public
- Request body: -
- Parameters: `partner_id` (path, string)
- Success response: 200 -

### `GET /api/v1/partners/id/{partner_id}/impact-metrics`

List Partner Impact Metrics

- Auth: public
- Request body: -
- Parameters: `partner_id` (path, string)
- Success response: 200 -

### `GET /api/v1/partners/id/{partner_id}/impact-stories`

List Partner Impact Stories

- Auth: public
- Request body: -
- Parameters: `partner_id` (path, string)
- Success response: 200 -

### `GET /api/v1/partners/id/{partner_id}/incubation-records`

List Partner Incubation Records

- Auth: public
- Request body: -
- Parameters: `partner_id` (path, string)
- Success response: 200 -

### `GET /api/v1/partners/id/{partner_id}/projects`

List Partner Projects

- Auth: public
- Request body: -
- Parameters: `partner_id` (path, string)
- Success response: 200 -

### `GET /api/v1/partners/id/{partner_id}/startups`

List Partner Startups

- Auth: public
- Request body: -
- Parameters: `partner_id` (path, string)
- Success response: 200 -

### `GET /api/v1/partners/id/{partner_id}/sustainability`

List Partner Sustainability

- Auth: public
- Request body: -
- Parameters: `partner_id` (path, string)
- Success response: 200 -

### `GET /api/v1/partners/id/{partner_id}/technology-transfer-cases`

List Partner Technology Transfer Cases

- Auth: public
- Request body: -
- Parameters: `partner_id` (path, string)
- Success response: 200 -

### `GET /api/v1/partners/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Publications

### `GET /api/v1/publications`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/publications`

Create Item

- Auth: HTTPBearer
- Request body: PublicationCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/publications/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: PublicationUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/publications/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/publications/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Realtime

### `GET /api/v1/realtime/research/config`

Get Research Realtime Config

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 -

## Research Analytics

### `GET /api/v1/analytics/dashboard`

Get Research Dashboard Analytics

- Auth: HTTPBearer
- Request body: -
- Parameters: `access_token` (cookie, string | null)
- Success response: 200 -

## Research Ask AI

### `POST /api/v1/ask-ai`

Ask Research Ai

- Auth: HTTPBearer
- Request body: ResearchAskAIRequest
- Parameters: `access_token` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/ask-ai/conversations`

List Ask Ai Conversations

- Auth: HTTPBearer
- Request body: -
- Parameters: `access_token` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/ask-ai/conversations/{conversation_id}/messages`

List Ask Ai Messages

- Auth: HTTPBearer
- Request body: -
- Parameters: `conversation_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/ask-ai/stream`

Stream Research Ai

- Auth: HTTPBearer
- Request body: ResearchAskAIRequest
- Parameters: `access_token` (cookie, string | null)
- Success response: 200 -

## Research Centers

### `GET /api/v1/centers`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/centers`

Create Item

- Auth: HTTPBearer
- Request body: ResearchCenterCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/centers/id/{center_id}/farms`

List Center Farms

- Auth: public
- Request body: -
- Parameters: `center_id` (path, string)
- Success response: 200 -

### `GET /api/v1/centers/id/{center_id}/focus-areas`

List Center Focus Areas

- Auth: public
- Request body: -
- Parameters: `center_id` (path, string)
- Success response: 200 -

### `PUT /api/v1/centers/id/{center_id}/focus-areas/{focus_area_id}`

Add Center Focus Area

- Auth: HTTPBearer
- Request body: -
- Parameters: `center_id` (path, string), `focus_area_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/centers/id/{center_id}/focus-areas/{focus_area_id}`

Remove Center Focus Area

- Auth: HTTPBearer
- Request body: -
- Parameters: `center_id` (path, string), `focus_area_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/centers/id/{center_id}/programs`

List Center Programs

- Auth: public
- Request body: -
- Parameters: `center_id` (path, string)
- Success response: 200 -

### `GET /api/v1/centers/id/{center_id}/projects`

List Center Projects

- Auth: public
- Request body: -
- Parameters: `center_id` (path, string)
- Success response: 200 -

### `PATCH /api/v1/centers/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: ResearchCenterUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/centers/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/centers/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Research Exports

### `GET /api/v1/exports/jobs/{job_id}`

Get Research Export Job

- Auth: HTTPBearer
- Request body: -
- Parameters: `job_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/exports/jobs/{job_id}/download`

Download Research Export Job

- Auth: HTTPBearer
- Request body: -
- Parameters: `job_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/exports/{resource_key}`

Export Research Resource

- Auth: HTTPBearer
- Request body: -
- Parameters: `resource_key` (path, string), `format` (query, string), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `publication_type` (query, string | null), `partner_type` (query, string | null), `consultancy_type` (query, string | null), `fund_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `initiative_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `grant_id` (query, string | null), `farm_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `limit` (query, integer), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/exports/{resource_key}/jobs`

Queue Research Export

- Auth: HTTPBearer
- Request body: -
- Parameters: `resource_key` (path, string), `format` (query, string), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `publication_type` (query, string | null), `partner_type` (query, string | null), `consultancy_type` (query, string | null), `fund_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `initiative_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `grant_id` (query, string | null), `farm_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `limit` (query, integer), `access_token` (cookie, string | null)
- Success response: 202 -

## Research Farms

### `GET /api/v1/farms`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/farms`

Create Item

- Auth: HTTPBearer
- Request body: ResearchFarmCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/farms/id/{farm_id}/activities`

List Farm Activities

- Auth: public
- Request body: -
- Parameters: `farm_id` (path, string)
- Success response: 200 -

### `GET /api/v1/farms/id/{farm_id}/impact-stories`

List Farm Impact Stories

- Auth: public
- Request body: -
- Parameters: `farm_id` (path, string)
- Success response: 200 -

### `GET /api/v1/farms/id/{farm_id}/partners`

List Farm Partners

- Auth: public
- Request body: -
- Parameters: `farm_id` (path, string)
- Success response: 200 -

### `GET /api/v1/farms/id/{farm_id}/projects`

List Farm Projects

- Auth: public
- Request body: -
- Parameters: `farm_id` (path, string)
- Success response: 200 -

### `PUT /api/v1/farms/id/{farm_id}/projects/{project_id}`

Add Farm Project

- Auth: HTTPBearer
- Request body: -
- Parameters: `farm_id` (path, string), `project_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/farms/id/{farm_id}/projects/{project_id}`

Remove Farm Project

- Auth: HTTPBearer
- Request body: -
- Parameters: `farm_id` (path, string), `project_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `PATCH /api/v1/farms/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: ResearchFarmUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/farms/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/farms/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/farms/{slug}/detail`

Get Farm Detail

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

## Research Guidelines

### `GET /api/v1/guidelines`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/guidelines`

Create Item

- Auth: HTTPBearer
- Request body: ResearchGuidelineCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/guidelines/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: ResearchGuidelineUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/guidelines/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/guidelines/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Research Outputs

### `GET /api/v1/outputs`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/outputs`

Create Item

- Auth: HTTPBearer
- Request body: ResearchOutputCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/outputs/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: ResearchOutputUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/outputs/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/outputs/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Research Programs

### `GET /api/v1/programs`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/programs`

Create Item

- Auth: HTTPBearer
- Request body: ResearchProgramCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/programs/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: ResearchProgramUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/programs/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/programs/id/{program_id}/projects`

List Program Projects

- Auth: public
- Request body: -
- Parameters: `program_id` (path, string)
- Success response: 200 -

### `GET /api/v1/programs/id/{program_id}/themes`

List Program Themes

- Auth: public
- Request body: -
- Parameters: `program_id` (path, string)
- Success response: 200 -

### `PUT /api/v1/programs/id/{program_id}/themes/{theme_id}`

Add Program Theme

- Auth: HTTPBearer
- Request body: -
- Parameters: `program_id` (path, string), `theme_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/programs/id/{program_id}/themes/{theme_id}`

Remove Program Theme

- Auth: HTTPBearer
- Request body: -
- Parameters: `program_id` (path, string), `theme_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/programs/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Research Projects

### `GET /api/v1/projects`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/projects`

Create Item

- Auth: HTTPBearer
- Request body: ResearchProjectCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/projects/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: ResearchProjectUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/projects/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/projects/id/{project_id}/activities`

List Project Activities

- Auth: public
- Request body: -
- Parameters: `project_id` (path, string)
- Success response: 200 -

### `GET /api/v1/projects/id/{project_id}/focus-areas`

List Project Focus Areas

- Auth: public
- Request body: -
- Parameters: `project_id` (path, string)
- Success response: 200 -

### `PUT /api/v1/projects/id/{project_id}/focus-areas/{focus_area_id}`

Add Project Focus Area

- Auth: HTTPBearer
- Request body: -
- Parameters: `project_id` (path, string), `focus_area_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/projects/id/{project_id}/focus-areas/{focus_area_id}`

Remove Project Focus Area

- Auth: HTTPBearer
- Request body: -
- Parameters: `project_id` (path, string), `focus_area_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/projects/id/{project_id}/funders`

List Project Funders

- Auth: public
- Request body: -
- Parameters: `project_id` (path, string)
- Success response: 200 -

### `PUT /api/v1/projects/id/{project_id}/funders/{funder_id}`

Add Project Funder

- Auth: HTTPBearer
- Request body: -
- Parameters: `project_id` (path, string), `funder_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/projects/id/{project_id}/funders/{funder_id}`

Remove Project Funder

- Auth: HTTPBearer
- Request body: -
- Parameters: `project_id` (path, string), `funder_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/projects/id/{project_id}/impact-metrics`

List Project Impact Metrics

- Auth: public
- Request body: -
- Parameters: `project_id` (path, string)
- Success response: 200 -

### `GET /api/v1/projects/id/{project_id}/impact-stories`

List Project Impact Stories

- Auth: public
- Request body: -
- Parameters: `project_id` (path, string)
- Success response: 200 -

### `GET /api/v1/projects/id/{project_id}/partners`

List Project Partners

- Auth: public
- Request body: -
- Parameters: `project_id` (path, string)
- Success response: 200 -

### `PUT /api/v1/projects/id/{project_id}/partners/{partner_id}`

Add Project Partner

- Auth: HTTPBearer
- Request body: -
- Parameters: `project_id` (path, string), `partner_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/projects/id/{project_id}/partners/{partner_id}`

Remove Project Partner

- Auth: HTTPBearer
- Request body: -
- Parameters: `project_id` (path, string), `partner_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/projects/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/projects/{slug}/detail`

Get Project Detail

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

## Research Resources

### `GET /api/v1/resources`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/resources`

Create Item

- Auth: HTTPBearer
- Request body: ResearchResourceCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/resources/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: ResearchResourceUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/resources/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/resources/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Research Search

### `GET /api/v1/search`

Search Research

- Auth: public
- Request body: -
- Parameters: `q` (query, string), `types` (query, string | null), `limit` (query, integer)
- Success response: 200 -

## Research Services

### `GET /api/v1/services`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/services`

Create Item

- Auth: HTTPBearer
- Request body: ResearchServiceCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/services/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: ResearchServiceUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/services/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/services/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Research Themes

### `GET /api/v1/themes`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/themes`

Create Item

- Auth: HTTPBearer
- Request body: ResearchThemeCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/themes/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: ResearchThemeUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/themes/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/themes/id/{theme_id}/focus-areas`

List Theme Focus Areas

- Auth: public
- Request body: -
- Parameters: `theme_id` (path, string)
- Success response: 200 -

### `GET /api/v1/themes/id/{theme_id}/grants`

List Theme Grants

- Auth: public
- Request body: -
- Parameters: `theme_id` (path, string)
- Success response: 200 -

### `PUT /api/v1/themes/id/{theme_id}/grants/{grant_id}`

Add Theme Grant

- Auth: HTTPBearer
- Request body: -
- Parameters: `theme_id` (path, string), `grant_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/themes/id/{theme_id}/grants/{grant_id}`

Remove Theme Grant

- Auth: HTTPBearer
- Request body: -
- Parameters: `theme_id` (path, string), `grant_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/themes/id/{theme_id}/programs`

List Theme Programs

- Auth: public
- Request body: -
- Parameters: `theme_id` (path, string)
- Success response: 200 -

### `PUT /api/v1/themes/id/{theme_id}/programs/{program_id}`

Add Theme Program

- Auth: HTTPBearer
- Request body: -
- Parameters: `theme_id` (path, string), `program_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/themes/id/{theme_id}/programs/{program_id}`

Remove Theme Program

- Auth: HTTPBearer
- Request body: -
- Parameters: `theme_id` (path, string), `program_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/themes/id/{theme_id}/projects`

List Theme Projects

- Auth: public
- Request body: -
- Parameters: `theme_id` (path, string)
- Success response: 200 -

### `PUT /api/v1/themes/id/{theme_id}/projects/{project_id}`

Add Theme Project

- Auth: HTTPBearer
- Request body: -
- Parameters: `theme_id` (path, string), `project_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/themes/id/{theme_id}/projects/{project_id}`

Remove Theme Project

- Auth: HTTPBearer
- Request body: -
- Parameters: `theme_id` (path, string), `project_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/themes/id/{theme_id}/publications`

List Theme Publications

- Auth: public
- Request body: -
- Parameters: `theme_id` (path, string)
- Success response: 200 -

### `PUT /api/v1/themes/id/{theme_id}/publications/{publication_id}`

Add Theme Publication

- Auth: HTTPBearer
- Request body: -
- Parameters: `theme_id` (path, string), `publication_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/themes/id/{theme_id}/publications/{publication_id}`

Remove Theme Publication

- Auth: HTTPBearer
- Request body: -
- Parameters: `theme_id` (path, string), `publication_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/themes/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Scholarship Applications

### `GET /api/v1/scholarship-applications`

List Items

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/scholarship-applications`

Create Item

- Auth: HTTPBearer
- Request body: ScholarshipApplicationCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/scholarship-applications/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: ScholarshipApplicationUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/scholarship-applications/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/scholarship-applications/{slug}`

Get Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `access_token` (cookie, string | null)
- Success response: 200 -

## Scholarships

### `GET /api/v1/scholarships`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/scholarships`

Create Item

- Auth: HTTPBearer
- Request body: ScholarshipCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/scholarships/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: ScholarshipUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/scholarships/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/scholarships/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## School Publications

### `GET /api/v1/school-publications`

List School Publications

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `status` (query, string | null), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-publications`

Create School Publication

- Auth: HTTPBearer
- Request body: SchoolPublicationCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/school-publications/summary`

Summarize School Publications

- Auth: HTTPBearer
- Request body: -
- Parameters: `access_token` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/school-publications/{publication_id}`

Get School Publication

- Auth: HTTPBearer
- Request body: -
- Parameters: `publication_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/school-publications/{publication_id}`

Update School Publication

- Auth: HTTPBearer
- Request body: SchoolPublicationUpdate
- Parameters: `publication_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-publications/{publication_id}/submit`

Submit School Publication

- Auth: HTTPBearer
- Request body: -
- Parameters: `publication_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-publications/{publication_id}/withdraw`

Withdraw School Publication

- Auth: HTTPBearer
- Request body: -
- Parameters: `publication_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

## Startup Ventures

### `GET /api/v1/startups`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/startups`

Create Item

- Auth: HTTPBearer
- Request body: StartupVentureCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/startups/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: StartupVentureUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/startups/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/startups/id/{item_id}/approve`

Approve Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/startups/id/{item_id}/archive`

Archive Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/startups/id/{item_id}/feature`

Feature Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/startups/id/{item_id}/publish`

Publish Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/startups/id/{item_id}/stage`

Set Startup Stage

- Auth: HTTPBearer
- Request body: StartupStageAction
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/startups/id/{item_id}/unfeature`

Unfeature Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/startups/id/{item_id}/unpublish`

Unpublish Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/startups/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Stats

### `GET /api/v1/stats`

Get Public Stats

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 -

### `GET /api/v1/stats/admin`

Get Admin Stats

- Auth: HTTPBearer
- Request body: -
- Parameters: `access_token` (cookie, string | null)
- Success response: 200 -

## Success Stories

### `GET /api/v1/stories`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/stories`

Create Item

- Auth: HTTPBearer
- Request body: SuccessStoryCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/stories/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: SuccessStoryUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/stories/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/stories/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Sustainability

### `GET /api/v1/sustainability`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/sustainability`

Create Item

- Auth: HTTPBearer
- Request body: SustainabilityCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/sustainability/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: SustainabilityUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/sustainability/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/sustainability/id/{sustainability_id}/partners`

List Sustainability Partners

- Auth: public
- Request body: -
- Parameters: `sustainability_id` (path, string)
- Success response: 200 -

### `PUT /api/v1/sustainability/id/{sustainability_id}/partners/{partner_id}`

Add Sustainability Partner

- Auth: HTTPBearer
- Request body: -
- Parameters: `sustainability_id` (path, string), `partner_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/sustainability/id/{sustainability_id}/partners/{partner_id}`

Remove Sustainability Partner

- Auth: HTTPBearer
- Request body: -
- Parameters: `sustainability_id` (path, string), `partner_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/sustainability/id/{sustainability_id}/projects`

List Sustainability Projects

- Auth: public
- Request body: -
- Parameters: `sustainability_id` (path, string)
- Success response: 200 -

### `PUT /api/v1/sustainability/id/{sustainability_id}/projects/{project_id}`

Add Sustainability Project

- Auth: HTTPBearer
- Request body: -
- Parameters: `sustainability_id` (path, string), `project_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/sustainability/id/{sustainability_id}/projects/{project_id}`

Remove Sustainability Project

- Auth: HTTPBearer
- Request body: -
- Parameters: `sustainability_id` (path, string), `project_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/sustainability/id/{sustainability_id}/stories`

List Sustainability Stories

- Auth: public
- Request body: -
- Parameters: `sustainability_id` (path, string)
- Success response: 200 -

### `PUT /api/v1/sustainability/id/{sustainability_id}/stories/{story_id}`

Add Sustainability Story

- Auth: HTTPBearer
- Request body: -
- Parameters: `sustainability_id` (path, string), `story_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/sustainability/id/{sustainability_id}/stories/{story_id}`

Remove Sustainability Story

- Auth: HTTPBearer
- Request body: -
- Parameters: `sustainability_id` (path, string), `story_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/sustainability/id/{sustainability_id}/training`

List Sustainability Training

- Auth: public
- Request body: -
- Parameters: `sustainability_id` (path, string)
- Success response: 200 -

### `PUT /api/v1/sustainability/id/{sustainability_id}/training/{training_id}`

Add Sustainability Training

- Auth: HTTPBearer
- Request body: -
- Parameters: `sustainability_id` (path, string), `training_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/sustainability/id/{sustainability_id}/training/{training_id}`

Remove Sustainability Training

- Auth: HTTPBearer
- Request body: -
- Parameters: `sustainability_id` (path, string), `training_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/sustainability/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Technology Transfer Cases

### `GET /api/v1/technology-transfer-cases`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/technology-transfer-cases`

Create Item

- Auth: HTTPBearer
- Request body: TechnologyTransferCaseCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/technology-transfer-cases/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: TechnologyTransferCaseUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/technology-transfer-cases/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/technology-transfer-cases/id/{item_id}/approve`

Approve Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/technology-transfer-cases/id/{item_id}/archive`

Archive Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/technology-transfer-cases/id/{item_id}/feature`

Feature Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/technology-transfer-cases/id/{item_id}/publish`

Publish Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/technology-transfer-cases/id/{item_id}/transfer-status`

Set Technology Transfer Status

- Auth: HTTPBearer
- Request body: TechnologyTransferStatusAction
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/technology-transfer-cases/id/{item_id}/unfeature`

Unfeature Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/technology-transfer-cases/id/{item_id}/unpublish`

Unpublish Item

- Auth: HTTPBearer
- Request body: PathwayActionNote | null
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/technology-transfer-cases/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Training Programs

### `GET /api/v1/training`

List Items

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null), `is_public` (query, boolean | null), `is_open_access` (query, boolean | null), `is_university_journal` (query, boolean | null), `category` (query, string | null), `grant_type` (query, string | null), `project_type` (query, string | null), `center_type` (query, string | null), `farm_type` (query, string | null), `publication_type` (query, string | null), `access_type` (query, string | null), `innovation_type` (query, string | null), `development_stage` (query, string | null), `ip_status` (query, string | null), `commercialization_status` (query, string | null), `partner_type` (query, string | null), `partnership_level` (query, string | null), `consultancy_type` (query, string | null), `client_type` (query, string | null), `venture_stage` (query, string | null), `registration_status` (query, string | null), `startup_id` (query, string | null), `incubation_type` (query, string | null), `stage` (query, string | null), `entry_type` (query, string | null), `entry_status` (query, string | null), `case_type` (query, string | null), `transfer_status` (query, string | null), `fund_type` (query, string | null), `event_type` (query, string | null), `output_type` (query, string | null), `program_type` (query, string | null), `delivery_mode` (query, string | null), `scholarship_type` (query, string | null), `resource_type` (query, string | null), `service_type` (query, string | null), `guideline_type` (query, string | null), `initiative_type` (query, string | null), `news_type` (query, string | null), `article_type` (query, string | null), `center_id` (query, string | null), `program_id` (query, string | null), `project_id` (query, string | null), `innovation_id` (query, string | null), `partner_id` (query, string | null), `pi_id` (query, string | null), `journal_id` (query, string | null), `author_id` (query, string | null), `grant_id` (query, string | null), `funder_id` (query, string | null), `farm_id` (query, string | null), `focus_area_id` (query, string | null), `has_grant` (query, boolean | null), `missing_pi` (query, boolean | null), `start_date_from` (query, string | null), `end_date_to` (query, string | null), `application_id` (query, string | null), `applicant_id` (query, string | null), `reviewer_id` (query, string | null), `submitter_id` (query, string | null), `report_type` (query, string | null), `funder_type` (query, string | null), `is_required` (query, boolean | null), `is_accepting_contributions` (query, boolean | null), `year` (query, integer | null), `sort` (query, string | null), `order` (query, string | null), `user` (query, object), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/training`

Create Item

- Auth: HTTPBearer
- Request body: TrainingProgramCreate
- Parameters: `access_token` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/training/id/{item_id}`

Update Item

- Auth: HTTPBearer
- Request body: TrainingProgramUpdate
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/training/id/{item_id}`

Delete Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/training/{slug}`

Get Item

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Untagged

### `GET /api/v1/guidelines/{item_id}/download`

Download Guideline

- Auth: public
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `GET /api/v1/resources/{item_id}/download`

Download Resource

- Auth: public
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 200 -

## Schemas

Generated component schemas: `96`

### `CompetitionEntryCreate`

- `application_deadline`: `string | null` (optional)
- `award`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `competition_name`: `string | null` (optional)
- `country`: `string | null` (optional)
- `currency`: `string` (optional)
- `display_order`: `integer` (optional)
- `documents`: `array<object> | null` (optional)
- `entry_status`: `string` (optional)
- `entry_type`: `string` (optional)
- `event_date`: `string | null` (optional)
- `event_id`: `string | null` (optional)
- `innovation_id`: `string` (required)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `judges_feedback`: `string | null` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `organizer_name`: `string | null` (optional)
- `partner_id`: `string | null` (optional)
- `pitch_deck_url`: `string | null` (optional)
- `pitch_summary`: `string | null` (optional)
- `position`: `string | null` (optional)
- `prize_value`: `number | string | null` (optional)
- `public_url`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `startup_id`: `string | null` (optional)
- `status`: `string` (optional)
- `title`: `string` (required)
- `venue`: `string | null` (optional)

### `CompetitionEntryStatusAction`

- `award`: `string | null` (optional)
- `entry_status`: `string` (required)
- `note`: `string | null` (optional)
- `position`: `string | null` (optional)
- `status`: `string | null` (optional)

### `CompetitionEntryUpdate`

- `application_deadline`: `string | null` (optional)
- `award`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `competition_name`: `string | null` (optional)
- `country`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `entry_status`: `string | null` (optional)
- `entry_type`: `string | null` (optional)
- `event_date`: `string | null` (optional)
- `event_id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `judges_feedback`: `string | null` (optional)
- `organizer_name`: `string | null` (optional)
- `partner_id`: `string | null` (optional)
- `pitch_deck_url`: `string | null` (optional)
- `pitch_summary`: `string | null` (optional)
- `position`: `string | null` (optional)
- `prize_value`: `number | string | null` (optional)
- `public_url`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `startup_id`: `string | null` (optional)
- `status`: `string | null` (optional)
- `title`: `string | null` (optional)
- `venue`: `string | null` (optional)

### `ConsultancyCreate`

- `center_id`: `string | null` (optional)
- `client_name`: `string | null` (optional)
- `client_type`: `string | null` (optional)
- `code`: `string | null` (optional)
- `consultancy_type`: `string` (optional)
- `contract_value`: `number | string | null` (optional)
- `country`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `currency`: `string` (optional)
- `deliverables`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `documents`: `array<object> | null` (optional)
- `end_date`: `string | null` (optional)
- `impact`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `lead_consultant_id`: `string | null` (optional)
- `location`: `string | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `methodology`: `string | null` (optional)
- `objectives`: `string | null` (optional)
- `outcomes`: `string | null` (optional)
- `partner_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `start_date`: `string | null` (optional)
- `status`: `string` (optional)
- `summary`: `string | null` (optional)
- `team_members`: `array<object> | null` (optional)
- `title`: `string` (required)

### `ConsultancyUpdate`

- `contract_value`: `number | string | null` (optional)
- `display_order`: `integer | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `title`: `string | null` (optional)

### `DonationCreate`

- `amount`: `number | string` (required)
- `amount_usd`: `number | string | null` (optional)
- `center_id`: `string | null` (optional)
- `currency`: `string` (optional)
- `dedication`: `string | null` (optional)
- `designation`: `string` (optional)
- `donation_date`: `string` (required)
- `donation_type`: `string` (optional)
- `donor_id`: `string` (required)
- `fund_id`: `string | null` (optional)
- `is_public`: `boolean` (optional)
- `is_tax_deductible`: `boolean` (optional)
- `is_tribute`: `boolean` (optional)
- `message`: `string | null` (optional)
- `notes`: `string | null` (optional)
- `payment_method`: `string | null` (optional)
- `payment_provider`: `string | null` (optional)
- `payment_reference`: `string | null` (optional)
- `project_id`: `string | null` (optional)
- `purpose`: `string | null` (optional)
- `receipt_number`: `string | null` (optional)
- `receipt_sent`: `boolean` (optional)
- `receipt_sent_at`: `string | null` (optional)
- `received_date`: `string | null` (optional)
- `recurring_frequency`: `string | null` (optional)
- `scholarship_id`: `string | null` (optional)
- `status`: `string` (optional)
- `tribute_name`: `string | null` (optional)
- `tribute_type`: `string | null` (optional)

### `DonationImpactCreate`

- `achievements`: `string | null` (optional)
- `attachments`: `array<object> | null` (optional)
- `beneficiaries`: `string | null` (optional)
- `beneficiary_count`: `integer | null` (optional)
- `center_id`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `currency`: `string` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `fund_id`: `string | null` (optional)
- `impact_type`: `string` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `metrics`: `array<object> | null` (optional)
- `period_end`: `string | null` (optional)
- `period_start`: `string | null` (optional)
- `project_id`: `string | null` (optional)
- `quotes`: `array<object> | null` (optional)
- `reporting_year`: `integer | null` (optional)
- `scholarship_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)
- `total_raised`: `number | string | null` (optional)
- `total_spent`: `number | string | null` (optional)
- `video_url`: `string | null` (optional)

### `DonationImpactUpdate`

- `display_order`: `integer | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `reporting_year`: `integer | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `title`: `string | null` (optional)

### `DonationSettingsCreate`

- `description`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `key`: `string` (required)
- `setting_type`: `string` (optional)
- `value`: `string | null` (optional)
- `value_json`: `object | null` (optional)

### `DonationSettingsUpdate`

- `description`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `value`: `string | null` (optional)
- `value_json`: `object | null` (optional)

### `DonationStoryCreate`

- `display_order`: `integer` (optional)
- `donor_id`: `string | null` (optional)
- `donor_name`: `string | null` (optional)
- `donor_organization`: `string | null` (optional)
- `donor_title`: `string | null` (optional)
- `impact_witnessed`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `motivation`: `string | null` (optional)
- `photo_url`: `string | null` (optional)
- `quote`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string` (optional)
- `story`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)
- `video_url`: `string | null` (optional)

### `DonationStoryUpdate`

- `display_order`: `integer | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `quote`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `title`: `string | null` (optional)

### `DonationUpdate`

- `amount`: `number | string | null` (optional)
- `notes`: `string | null` (optional)
- `receipt_sent`: `boolean | null` (optional)
- `receipt_sent_at`: `string | null` (optional)
- `received_date`: `string | null` (optional)
- `recurring_frequency`: `string | null` (optional)
- `status`: `string | null` (optional)

### `DonorCreate`

- `address`: `string | null` (optional)
- `city`: `string | null` (optional)
- `communication_preferences`: `object | null` (optional)
- `country`: `string | null` (optional)
- `display_name`: `string | null` (optional)
- `donor_type`: `string` (optional)
- `email`: `string | null` (optional)
- `first_name`: `string | null` (optional)
- `interests`: `array<string> | null` (optional)
- `is_active`: `boolean` (optional)
- `is_anonymous`: `boolean` (optional)
- `last_name`: `string | null` (optional)
- `logo_url`: `string | null` (optional)
- `notes`: `string | null` (optional)
- `organization_name`: `string | null` (optional)
- `organization_type`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `photo_url`: `string | null` (optional)
- `tier`: `string | null` (optional)
- `title`: `string | null` (optional)
- `user_id`: `string | null` (optional)

### `DonorUpdate`

- `display_name`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_anonymous`: `boolean | null` (optional)
- `notes`: `string | null` (optional)
- `tier`: `string | null` (optional)

### `EndowmentFundCreate`

- `annual_distribution`: `number | string | null` (optional)
- `attachment_media_ids`: `array<string> | null` (optional)
- `code`: `string | null` (optional)
- `contact_email`: `string | null` (optional)
- `contact_name`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `currency`: `string` (optional)
- `current_value`: `number | string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `document_media_ids`: `array<string> | null` (optional)
- `donor_message`: `string | null` (optional)
- `donor_name`: `string | null` (optional)
- `eligibility`: `string | null` (optional)
- `established_date`: `string | null` (optional)
- `fund_type`: `string` (optional)
- `gallery_media_ids`: `array<string> | null` (optional)
- `is_accepting_contributions`: `boolean` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `name`: `string` (required)
- `principal_amount`: `number | string | null` (optional)
- `purpose`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string` (optional)
- `use_guidelines`: `string | null` (optional)

### `EndowmentFundUpdate`

- `annual_distribution`: `number | string | null` (optional)
- `attachment_media_ids`: `array<string> | null` (optional)
- `code`: `string | null` (optional)
- `contact_email`: `string | null` (optional)
- `contact_name`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `currency`: `string | null` (optional)
- `current_value`: `number | string | null` (optional)
- `description`: `string | null` (optional)
- `document_media_ids`: `array<string> | null` (optional)
- `donor_message`: `string | null` (optional)
- `donor_name`: `string | null` (optional)
- `eligibility`: `string | null` (optional)
- `established_date`: `string | null` (optional)
- `fund_type`: `string | null` (optional)
- `gallery_media_ids`: `array<string> | null` (optional)
- `is_accepting_contributions`: `boolean | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `principal_amount`: `number | string | null` (optional)
- `purpose`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `use_guidelines`: `string | null` (optional)

### `ExpertiseTagCreate`

- `category`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `name`: `string` (required)
- `slug`: `string | null` (optional)

### `ExpertiseTagUpdate`

- `category`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `slug`: `string | null` (optional)

### `FocusAreaCreate`

- `code`: `string | null` (optional)
- `color`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `icon`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `key_questions`: `string | null` (optional)
- `name`: `string` (required)
- `slug`: `string | null` (optional)
- `theme_id`: `string | null` (optional)

### `FocusAreaUpdate`

- `description`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `theme_id`: `string | null` (optional)

### `FundingCreate`

- `about`: `string | null` (optional)
- `acronym`: `string | null` (optional)
- `address`: `string | null` (optional)
- `country`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `email`: `string | null` (optional)
- `focus_areas`: `string | null` (optional)
- `funder_type`: `string` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `logo_id`: `string | null` (optional)
- `logo_url`: `string | null` (optional)
- `name`: `string` (required)
- `phone`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `website`: `string | null` (optional)

### `FundingUpdate`

- `about`: `string | null` (optional)
- `acronym`: `string | null` (optional)
- `address`: `string | null` (optional)
- `country`: `string | null` (optional)
- `email`: `string | null` (optional)
- `focus_areas`: `string | null` (optional)
- `funder_type`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `logo_id`: `string | null` (optional)
- `logo_url`: `string | null` (optional)
- `name`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `website`: `string | null` (optional)

### `GrantApplicationCreate`

- `abstract`: `string | null` (optional)
- `applicant_id`: `string` (required)
- `attachment_media_ids`: `array<string> | null` (optional)
- `budget_breakdown`: `object | null` (optional)
- `co_investigators`: `array<object> | null` (optional)
- `currency`: `string` (optional)
- `document_media_ids`: `array<string> | null` (optional)
- `documents`: `array<object> | null` (optional)
- `duration_months`: `integer | null` (optional)
- `expected_outcomes`: `string | null` (optional)
- `gallery_media_ids`: `array<string> | null` (optional)
- `grant_id`: `string` (required)
- `methodology`: `string | null` (optional)
- `objectives`: `string | null` (optional)
- `project_title`: `string` (required)
- `proposed_end_date`: `string | null` (optional)
- `proposed_start_date`: `string | null` (optional)
- `requested_amount`: `number | string | null` (optional)
- `status`: `string` (optional)
- `summary`: `string | null` (optional)
- `timeline`: `string | null` (optional)
- `work_plan`: `string | null` (optional)

### `GrantApplicationUpdate`

- `abstract`: `string | null` (optional)
- `applicant_id`: `string | null` (optional)
- `attachment_media_ids`: `array<string> | null` (optional)
- `budget_breakdown`: `object | null` (optional)
- `co_investigators`: `array<object> | null` (optional)
- `currency`: `string | null` (optional)
- `document_media_ids`: `array<string> | null` (optional)
- `documents`: `array<object> | null` (optional)
- `duration_months`: `integer | null` (optional)
- `expected_outcomes`: `string | null` (optional)
- `gallery_media_ids`: `array<string> | null` (optional)
- `grant_id`: `string | null` (optional)
- `methodology`: `string | null` (optional)
- `objectives`: `string | null` (optional)
- `project_title`: `string | null` (optional)
- `proposed_end_date`: `string | null` (optional)
- `proposed_start_date`: `string | null` (optional)
- `requested_amount`: `number | string | null` (optional)
- `status`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `timeline`: `string | null` (optional)
- `work_plan`: `string | null` (optional)

### `GrantCreate`

- `announcement_date`: `string | null` (optional)
- `application_url`: `string | null` (optional)
- `attachment_media_ids`: `array<string> | null` (optional)
- `award_date`: `string | null` (optional)
- `category`: `string` (optional)
- `code`: `string | null` (optional)
- `contact_email`: `string | null` (optional)
- `contact_name`: `string | null` (optional)
- `contact_phone`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `currency`: `string` (optional)
- `deadline`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `document_media_ids`: `array<string> | null` (optional)
- `documents`: `array<object> | null` (optional)
- `eligibility`: `string | null` (optional)
- `external_url`: `string | null` (optional)
- `focus_areas`: `string | null` (optional)
- `funder_id`: `string | null` (optional)
- `funder_logo_url`: `string | null` (optional)
- `funder_name`: `string | null` (optional)
- `gallery_media_ids`: `array<string> | null` (optional)
- `grant_type`: `string` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `logo_id`: `string | null` (optional)
- `max_award`: `number | string | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `min_award`: `number | string | null` (optional)
- `number_of_awards`: `integer | null` (optional)
- `objectives`: `string | null` (optional)
- `open_date`: `string | null` (optional)
- `project_end_date`: `string | null` (optional)
- `project_start_date`: `string | null` (optional)
- `requirements`: `string | null` (optional)
- `review_start_date`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)
- `total_budget`: `number | string | null` (optional)

### `GrantGuidelineCreate`

- `content`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `document_id`: `string | null` (optional)
- `document_name`: `string | null` (optional)
- `document_url`: `string | null` (optional)
- `grant_id`: `string` (required)
- `guideline_type`: `string` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `is_required`: `boolean` (optional)
- `slug`: `string | null` (optional)
- `title`: `string` (required)

### `GrantGuidelineUpdate`

- `content`: `string | null` (optional)
- `document_id`: `string | null` (optional)
- `document_name`: `string | null` (optional)
- `document_url`: `string | null` (optional)
- `grant_id`: `string | null` (optional)
- `guideline_type`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_required`: `boolean | null` (optional)
- `slug`: `string | null` (optional)
- `title`: `string | null` (optional)

### `GrantReportCreate`

- `achievements`: `string | null` (optional)
- `activities`: `string | null` (optional)
- `amount_spent`: `number | string | null` (optional)
- `application_id`: `string | null` (optional)
- `attachment_media_ids`: `array<string> | null` (optional)
- `balance`: `number | string | null` (optional)
- `challenges`: `string | null` (optional)
- `document_media_ids`: `array<string> | null` (optional)
- `documents`: `array<object> | null` (optional)
- `expenditure_summary`: `object | null` (optional)
- `gallery_media_ids`: `array<string> | null` (optional)
- `grant_id`: `string` (required)
- `lessons_learned`: `string | null` (optional)
- `next_steps`: `string | null` (optional)
- `project_id`: `string | null` (optional)
- `report_type`: `string` (optional)
- `reporting_period_end`: `string | null` (optional)
- `reporting_period_start`: `string | null` (optional)
- `status`: `string` (optional)
- `submitter_id`: `string` (required)
- `summary`: `string | null` (optional)
- `title`: `string` (required)

### `GrantReportUpdate`

- `achievements`: `string | null` (optional)
- `activities`: `string | null` (optional)
- `amount_spent`: `number | string | null` (optional)
- `application_id`: `string | null` (optional)
- `attachment_media_ids`: `array<string> | null` (optional)
- `balance`: `number | string | null` (optional)
- `challenges`: `string | null` (optional)
- `document_media_ids`: `array<string> | null` (optional)
- `documents`: `array<object> | null` (optional)
- `expenditure_summary`: `object | null` (optional)
- `gallery_media_ids`: `array<string> | null` (optional)
- `grant_id`: `string | null` (optional)
- `lessons_learned`: `string | null` (optional)
- `next_steps`: `string | null` (optional)
- `project_id`: `string | null` (optional)
- `report_type`: `string | null` (optional)
- `reporting_period_end`: `string | null` (optional)
- `reporting_period_start`: `string | null` (optional)
- `status`: `string | null` (optional)
- `submitter_id`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)

### `GrantReviewCreate`

- `application_id`: `string` (required)
- `comments`: `string | null` (optional)
- `criteria_scores`: `object | null` (optional)
- `overall_score`: `integer | null` (optional)
- `recommendation`: `string | null` (optional)
- `reviewer_id`: `string` (required)
- `status`: `string` (optional)
- `strengths`: `string | null` (optional)
- `weaknesses`: `string | null` (optional)

### `GrantReviewUpdate`

- `application_id`: `string | null` (optional)
- `comments`: `string | null` (optional)
- `criteria_scores`: `object | null` (optional)
- `overall_score`: `integer | null` (optional)
- `recommendation`: `string | null` (optional)
- `reviewer_id`: `string | null` (optional)
- `status`: `string | null` (optional)
- `strengths`: `string | null` (optional)
- `weaknesses`: `string | null` (optional)

### `GrantUpdate`

- `announcement_date`: `string | null` (optional)
- `application_url`: `string | null` (optional)
- `attachment_media_ids`: `array<string> | null` (optional)
- `award_date`: `string | null` (optional)
- `category`: `string | null` (optional)
- `code`: `string | null` (optional)
- `contact_email`: `string | null` (optional)
- `contact_name`: `string | null` (optional)
- `contact_phone`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `currency`: `string | null` (optional)
- `deadline`: `string | null` (optional)
- `description`: `string | null` (optional)
- `document_media_ids`: `array<string> | null` (optional)
- `documents`: `array<object> | null` (optional)
- `eligibility`: `string | null` (optional)
- `external_url`: `string | null` (optional)
- `focus_areas`: `string | null` (optional)
- `funder_id`: `string | null` (optional)
- `funder_logo_url`: `string | null` (optional)
- `funder_name`: `string | null` (optional)
- `gallery_media_ids`: `array<string> | null` (optional)
- `grant_type`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `logo_id`: `string | null` (optional)
- `max_award`: `number | string | null` (optional)
- `min_award`: `number | string | null` (optional)
- `number_of_awards`: `integer | null` (optional)
- `objectives`: `string | null` (optional)
- `open_date`: `string | null` (optional)
- `project_end_date`: `string | null` (optional)
- `project_start_date`: `string | null` (optional)
- `requirements`: `string | null` (optional)
- `review_start_date`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `total_budget`: `number | string | null` (optional)

### `HTTPValidationError`

- `detail`: `array<ValidationError>` (optional)

### `ImpactMetricCreate`

- `baseline_value`: `number | string | null` (optional)
- `category`: `string` (optional)
- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `color`: `string | null` (optional)
- `data_source`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `icon`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `methodology`: `string | null` (optional)
- `metric_type`: `string` (optional)
- `name`: `string` (required)
- `period_end`: `string | null` (optional)
- `period_start`: `string | null` (optional)
- `program_id`: `string | null` (optional)
- `project_id`: `string | null` (optional)
- `reporting_year`: `integer | null` (optional)
- `slug`: `string | null` (optional)
- `target_value`: `number | string | null` (optional)
- `unit`: `string | null` (optional)
- `value`: `number | string` (optional)

### `ImpactMetricUpdate`

- `display_order`: `integer | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `reporting_year`: `integer | null` (optional)
- `slug`: `string | null` (optional)
- `target_value`: `number | string | null` (optional)
- `value`: `number | string | null` (optional)

### `IncubationRecordCreate`

- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `cohort`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `documents`: `array<object> | null` (optional)
- `end_date`: `string | null` (optional)
- `incubation_type`: `string` (optional)
- `innovation_id`: `string` (required)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `mentor_ids`: `array<string> | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `milestones`: `array<object> | null` (optional)
- `next_steps`: `string | null` (optional)
- `outcomes`: `string | null` (optional)
- `partner_id`: `string | null` (optional)
- `program_name`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `stage`: `string` (optional)
- `start_date`: `string | null` (optional)
- `startup_id`: `string | null` (optional)
- `status`: `string` (optional)
- `support_received`: `string | null` (optional)
- `title`: `string` (required)

### `IncubationRecordUpdate`

- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `cohort`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `end_date`: `string | null` (optional)
- `incubation_type`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `mentor_ids`: `array<string> | null` (optional)
- `milestones`: `array<object> | null` (optional)
- `next_steps`: `string | null` (optional)
- `outcomes`: `string | null` (optional)
- `partner_id`: `string | null` (optional)
- `program_name`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `stage`: `string | null` (optional)
- `start_date`: `string | null` (optional)
- `startup_id`: `string | null` (optional)
- `status`: `string | null` (optional)
- `support_received`: `string | null` (optional)
- `title`: `string | null` (optional)

### `IncubationStageAction`

- `note`: `string | null` (optional)
- `stage`: `string` (required)
- `status`: `string | null` (optional)

### `InnovationCreate`

- `applications`: `string | null` (optional)
- `awards`: `array<object> | null` (optional)
- `benefits`: `string | null` (optional)
- `category`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `commercial_value`: `number | string | null` (optional)
- `commercialization_status`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `currency`: `string` (optional)
- `description`: `string | null` (optional)
- `development_stage`: `string` (optional)
- `display_order`: `integer` (optional)
- `documents`: `array<object> | null` (optional)
- `gallery`: `array<object> | null` (optional)
- `innovation_type`: `string` (optional)
- `invention_date`: `string | null` (optional)
- `inventors`: `array<object> | null` (optional)
- `ip_status`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `lead_inventor_id`: `string | null` (optional)
- `license_type`: `string | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `patent_countries`: `array<string> | null` (optional)
- `patent_filing_date`: `string | null` (optional)
- `patent_grant_date`: `string | null` (optional)
- `patent_number`: `string | null` (optional)
- `problem_addressed`: `string | null` (optional)
- `project_id`: `string | null` (optional)
- `revenue_generated`: `number | string | null` (optional)
- `slug`: `string | null` (optional)
- `solution`: `string | null` (optional)
- `status`: `string` (optional)
- `summary`: `string | null` (optional)
- `target_users`: `string | null` (optional)
- `title`: `string` (required)
- `trl_level`: `integer | null` (optional)
- `video_url`: `string | null` (optional)

### `InnovationUpdate`

- `commercialization_status`: `string | null` (optional)
- `development_stage`: `string | null` (optional)
- `ip_status`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `title`: `string | null` (optional)
- `trl_level`: `integer | null` (optional)

### `JournalCreate`

- `abbreviation`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `editor_in_chief_id`: `string | null` (optional)
- `eissn`: `string | null` (optional)
- `h_index`: `integer | null` (optional)
- `impact_factor`: `number | null` (optional)
- `impact_factor_year`: `integer | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `is_open_access`: `boolean` (optional)
- `is_university_journal`: `boolean` (optional)
- `issn`: `string | null` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `name`: `string` (required)
- `publisher`: `string | null` (optional)
- `publisher_location`: `string | null` (optional)
- `quartile`: `string | null` (optional)
- `scope`: `string | null` (optional)
- `sjr_score`: `number | null` (optional)
- `slug`: `string | null` (optional)
- `subject_areas`: `array<string> | null` (optional)
- `submission_url`: `string | null` (optional)
- `website`: `string | null` (optional)

### `JournalUpdate`

- `abbreviation`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `description`: `string | null` (optional)
- `editor_in_chief_id`: `string | null` (optional)
- `eissn`: `string | null` (optional)
- `h_index`: `integer | null` (optional)
- `impact_factor`: `number | null` (optional)
- `impact_factor_year`: `integer | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_open_access`: `boolean | null` (optional)
- `is_university_journal`: `boolean | null` (optional)
- `issn`: `string | null` (optional)
- `name`: `string | null` (optional)
- `publisher`: `string | null` (optional)
- `publisher_location`: `string | null` (optional)
- `quartile`: `string | null` (optional)
- `scope`: `string | null` (optional)
- `sjr_score`: `number | null` (optional)
- `slug`: `string | null` (optional)
- `subject_areas`: `array<string> | null` (optional)
- `submission_url`: `string | null` (optional)
- `website`: `string | null` (optional)

### `MentorAssignmentAction`

- `mentor_ids`: `array<string>` (optional)
- `note`: `string | null` (optional)

### `MentorshipApplicationCreate`

- `applicant_id`: `string` (required)
- `application_type`: `string` (required)
- `availability`: `string | null` (optional)
- `cv_url`: `string | null` (optional)
- `experience`: `string | null` (optional)
- `expertise_areas`: `array<string> | null` (optional)
- `goals`: `string | null` (optional)
- `looking_for`: `string | null` (optional)
- `motivation`: `string | null` (optional)
- `preferred_communication`: `string | null` (optional)
- `program_id`: `string` (required)
- `status`: `string` (optional)
- `supporting_documents`: `array<object> | null` (optional)

### `MentorshipApplicationUpdate`

- `motivation`: `string | null` (optional)
- `review_notes`: `string | null` (optional)
- `reviewed_at`: `string | null` (optional)
- `reviewed_by_id`: `string | null` (optional)
- `status`: `string | null` (optional)

### `MentorshipMatchCreate`

- `end_date`: `string | null` (optional)
- `goals`: `string | null` (optional)
- `match_date`: `string` (required)
- `meeting_schedule`: `string | null` (optional)
- `mentee_id`: `string` (required)
- `mentor_id`: `string` (required)
- `milestones`: `array<object> | null` (optional)
- `program_id`: `string` (required)
- `start_date`: `string | null` (optional)
- `status`: `string` (optional)

### `MentorshipMatchUpdate`

- `goals`: `string | null` (optional)
- `status`: `string | null` (optional)

### `MentorshipProgramCreate`

- `application_deadline`: `string | null` (optional)
- `application_open`: `string | null` (optional)
- `benefits`: `string | null` (optional)
- `brochure_url`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `cohort_end_date`: `string | null` (optional)
- `cohort_start_date`: `string | null` (optional)
- `commitment_hours_weekly`: `integer | null` (optional)
- `contact_email`: `string | null` (optional)
- `contact_phone`: `string | null` (optional)
- `coordinator_id`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `duration_months`: `integer | null` (optional)
- `expectations`: `string | null` (optional)
- `guidelines`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `max_mentees`: `integer | null` (optional)
- `max_mentors`: `integer | null` (optional)
- `mentee_requirements`: `string | null` (optional)
- `mentor_requirements`: `string | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `name`: `string` (required)
- `objectives`: `string | null` (optional)
- `program_type`: `string` (optional)
- `slug`: `string | null` (optional)
- `status`: `string` (optional)
- `summary`: `string | null` (optional)

### `MentorshipProgramUpdate`

- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)

### `PartnerCreate`

- `about`: `string | null` (optional)
- `acronym`: `string | null` (optional)
- `address`: `string | null` (optional)
- `collaboration_areas`: `string | null` (optional)
- `contact_person_email`: `string | null` (optional)
- `contact_person_name`: `string | null` (optional)
- `contact_person_title`: `string | null` (optional)
- `country`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `document_url`: `string | null` (optional)
- `email`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `key_achievements`: `string | null` (optional)
- `keywords`: `object | null` (optional)
- `logo_url`: `string | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `mou_expiry_date`: `string | null` (optional)
- `mou_signed_date`: `string | null` (optional)
- `name`: `string` (required)
- `partner_type`: `string` (optional)
- `partnership_end`: `string | null` (optional)
- `partnership_level`: `string | null` (optional)
- `partnership_start`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `social_links`: `object | null` (optional)
- `status`: `string` (optional)
- `website`: `string | null` (optional)

### `PartnerUpdate`

- `display_order`: `integer | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `partnership_level`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)

### `PathwayActionNote`

- `note`: `string | null` (optional)

### `PublicDonationSubmission`

- `amount`: `number | string` (required)
- `center_id`: `string | null` (optional)
- `city`: `string | null` (optional)
- `country`: `string | null` (optional)
- `currency`: `string` (optional)
- `dedication`: `string | null` (optional)
- `designation`: `string` (optional)
- `display_name`: `string | null` (optional)
- `donation_type`: `string` (optional)
- `donor_type`: `string` (optional)
- `email`: `string | null` (optional)
- `first_name`: `string | null` (optional)
- `fund_id`: `string | null` (optional)
- `interests`: `array<string> | null` (optional)
- `is_anonymous`: `boolean` (optional)
- `is_tribute`: `boolean` (optional)
- `last_name`: `string | null` (optional)
- `message`: `string | null` (optional)
- `organization_name`: `string | null` (optional)
- `organization_type`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `preferred_payment_method`: `string | null` (optional)
- `project_id`: `string | null` (optional)
- `purpose`: `string | null` (optional)
- `recognition_public`: `boolean` (optional)
- `recurring_frequency`: `string | null` (optional)
- `scholarship_id`: `string | null` (optional)
- `tribute_name`: `string | null` (optional)
- `tribute_type`: `string | null` (optional)

### `PublicationCreate`

- `abstract`: `string | null` (optional)
- `acceptance_date`: `string | null` (optional)
- `access_type`: `string | null` (optional)
- `article_number`: `string | null` (optional)
- `arxiv_id`: `string | null` (optional)
- `book_title`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `conference_date`: `string | null` (optional)
- `conference_location`: `string | null` (optional)
- `conference_name`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `doi`: `string | null` (optional)
- `edition`: `string | null` (optional)
- `editors`: `string | null` (optional)
- `funding_acknowledgment`: `string | null` (optional)
- `grant_numbers`: `array<string> | null` (optional)
- `h_index`: `integer | null` (optional)
- `impact_factor`: `number | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `is_open_access`: `boolean` (optional)
- `isbn`: `string | null` (optional)
- `issn`: `string | null` (optional)
- `issue`: `string | null` (optional)
- `journal_id`: `string | null` (optional)
- `journal_name`: `string | null` (optional)
- `keywords`: `array<string> | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `pages`: `string | null` (optional)
- `pdf_url`: `string | null` (optional)
- `pmid`: `string | null` (optional)
- `project_id`: `string | null` (optional)
- `publication_date`: `string | null` (optional)
- `publication_type`: `string` (optional)
- `publisher`: `string | null` (optional)
- `quartile`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string` (optional)
- `submission_date`: `string | null` (optional)
- `title`: `string` (required)
- `url`: `string | null` (optional)
- `volume`: `string | null` (optional)
- `year`: `integer | null` (optional)

### `PublicationUpdate`

- `abstract`: `string | null` (optional)
- `acceptance_date`: `string | null` (optional)
- `access_type`: `string | null` (optional)
- `article_number`: `string | null` (optional)
- `arxiv_id`: `string | null` (optional)
- `book_title`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `citation_count`: `integer | null` (optional)
- `conference_date`: `string | null` (optional)
- `conference_location`: `string | null` (optional)
- `conference_name`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `doi`: `string | null` (optional)
- `edition`: `string | null` (optional)
- `editors`: `string | null` (optional)
- `funding_acknowledgment`: `string | null` (optional)
- `grant_numbers`: `array<string> | null` (optional)
- `h_index`: `integer | null` (optional)
- `impact_factor`: `number | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_open_access`: `boolean | null` (optional)
- `isbn`: `string | null` (optional)
- `issn`: `string | null` (optional)
- `issue`: `string | null` (optional)
- `journal_id`: `string | null` (optional)
- `journal_name`: `string | null` (optional)
- `keywords`: `array<string> | null` (optional)
- `pages`: `string | null` (optional)
- `pdf_url`: `string | null` (optional)
- `pmid`: `string | null` (optional)
- `project_id`: `string | null` (optional)
- `publication_date`: `string | null` (optional)
- `publication_type`: `string | null` (optional)
- `publisher`: `string | null` (optional)
- `quartile`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `submission_date`: `string | null` (optional)
- `title`: `string | null` (optional)
- `url`: `string | null` (optional)
- `volume`: `string | null` (optional)
- `year`: `integer | null` (optional)

### `ResearchAskAIContextRequest`

- `path`: `string` (optional)
- `record_id`: `string | null` (optional)
- `resource_key`: `string | null` (optional)
- `section`: `string | null` (optional)

### `ResearchAskAIReference`

- `href`: `string` (required)
- `label`: `string` (required)
- `resource_key`: `string | null` (optional)
- `type`: `string` (required)

### `ResearchAskAIRequest`

- `context`: `ResearchAskAIContextRequest` (optional)
- `conversation_id`: `string | null` (optional)
- `intent_mode`: `string` (optional)
- `message`: `string` (required)
- `references`: `array<ResearchAskAIReference>` (optional)
- `scope`: `string` (optional)

### `ResearchCenterCreate`

- `about`: `string | null` (optional)
- `acronym`: `string | null` (optional)
- `address`: `string | null` (optional)
- `center_type`: `string` (optional)
- `code`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `director_id`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `email`: `string | null` (optional)
- `established_date`: `string | null` (optional)
- `gallery`: `array<object> | null` (optional)
- `gps_latitude`: `number | null` (optional)
- `gps_longitude`: `number | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `location`: `string | null` (optional)
- `logo_image_url`: `string | null` (optional)
- `mandate`: `string | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string` (required)
- `objectives`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `research_areas`: `string | null` (optional)
- `school_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `social_links`: `object | null` (optional)
- `vision`: `string | null` (optional)
- `website`: `string | null` (optional)

### `ResearchCenterUpdate`

- `about`: `string | null` (optional)
- `acronym`: `string | null` (optional)
- `center_type`: `string | null` (optional)
- `code`: `string | null` (optional)
- `director_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `vision`: `string | null` (optional)

### `ResearchFarmCreate`

- `about`: `string | null` (optional)
- `activities`: `string | null` (optional)
- `address`: `string | null` (optional)
- `capacity_info`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `county`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `email`: `string | null` (optional)
- `facilities`: `string | null` (optional)
- `farm_type`: `string` (optional)
- `gallery`: `array<object> | null` (optional)
- `gps_latitude`: `number | null` (optional)
- `gps_longitude`: `number | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `location`: `string | null` (optional)
- `manager_name`: `string | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `name`: `string` (required)
- `phone`: `string | null` (optional)
- `products`: `string | null` (optional)
- `size_hectares`: `number | string | null` (optional)
- `slug`: `string | null` (optional)

### `ResearchFarmUpdate`

- `about`: `string | null` (optional)
- `activities`: `string | null` (optional)
- `address`: `string | null` (optional)
- `capacity_info`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `county`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `email`: `string | null` (optional)
- `facilities`: `string | null` (optional)
- `farm_type`: `string | null` (optional)
- `gallery`: `array<object> | null` (optional)
- `gps_latitude`: `number | null` (optional)
- `gps_longitude`: `number | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `location`: `string | null` (optional)
- `manager_name`: `string | null` (optional)
- `name`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `products`: `string | null` (optional)
- `size_hectares`: `number | string | null` (optional)
- `slug`: `string | null` (optional)

### `ResearchGuidelineCreate`

- `applicability`: `string | null` (optional)
- `approval_date`: `string | null` (optional)
- `approved_by`: `string | null` (optional)
- `category`: `string` (optional)
- `code`: `string | null` (optional)
- `contact_email`: `string | null` (optional)
- `content`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `document_name`: `string | null` (optional)
- `document_url`: `string | null` (optional)
- `effective_date`: `string | null` (optional)
- `guideline_type`: `string` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `is_mandatory`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `related_guideline_ids`: `array<string> | null` (optional)
- `review_date`: `string | null` (optional)
- `scope`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string` (optional)
- `summary`: `string | null` (optional)
- `supersedes_id`: `string | null` (optional)
- `title`: `string` (required)
- `version`: `string | null` (optional)

### `ResearchGuidelineUpdate`

- `applicability`: `string | null` (optional)
- `approval_date`: `string | null` (optional)
- `approved_by`: `string | null` (optional)
- `category`: `string | null` (optional)
- `code`: `string | null` (optional)
- `contact_email`: `string | null` (optional)
- `content`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `document_name`: `string | null` (optional)
- `document_url`: `string | null` (optional)
- `effective_date`: `string | null` (optional)
- `guideline_type`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_mandatory`: `boolean | null` (optional)
- `related_guideline_ids`: `array<string> | null` (optional)
- `review_date`: `string | null` (optional)
- `scope`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `supersedes_id`: `string | null` (optional)
- `title`: `string | null` (optional)
- `version`: `string | null` (optional)

### `ResearchOutputCreate`

- `access_type`: `string` (optional)
- `access_url`: `string | null` (optional)
- `author_ids`: `array<string> | null` (optional)
- `center_id`: `string | null` (optional)
- `citation`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `doi`: `string | null` (optional)
- `download_url`: `string | null` (optional)
- `format`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `keywords`: `array<string> | null` (optional)
- `last_updated`: `string | null` (optional)
- `license`: `string | null` (optional)
- `license_url`: `string | null` (optional)
- `methodology`: `string | null` (optional)
- `output_type`: `string` (optional)
- `project_id`: `string | null` (optional)
- `release_date`: `string | null` (optional)
- `repository_url`: `string | null` (optional)
- `size_bytes`: `integer | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string` (optional)
- `summary`: `string | null` (optional)
- `technical_requirements`: `string | null` (optional)
- `title`: `string` (required)
- `usage_notes`: `string | null` (optional)
- `version`: `string | null` (optional)

### `ResearchOutputUpdate`

- `access_type`: `string | null` (optional)
- `access_url`: `string | null` (optional)
- `author_ids`: `array<string> | null` (optional)
- `center_id`: `string | null` (optional)
- `citation`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `description`: `string | null` (optional)
- `doi`: `string | null` (optional)
- `download_url`: `string | null` (optional)
- `format`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `keywords`: `array<string> | null` (optional)
- `last_updated`: `string | null` (optional)
- `license`: `string | null` (optional)
- `license_url`: `string | null` (optional)
- `methodology`: `string | null` (optional)
- `output_type`: `string | null` (optional)
- `project_id`: `string | null` (optional)
- `release_date`: `string | null` (optional)
- `repository_url`: `string | null` (optional)
- `size_bytes`: `integer | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `technical_requirements`: `string | null` (optional)
- `title`: `string | null` (optional)
- `usage_notes`: `string | null` (optional)
- `version`: `string | null` (optional)

### `ResearchProgramCreate`

- `budget`: `number | string | null` (optional)
- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `currency`: `string` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `end_date`: `string | null` (optional)
- `expected_outcomes`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `lead_id`: `string | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `methodology`: `string | null` (optional)
- `name`: `string` (required)
- `objectives`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `start_date`: `string | null` (optional)
- `status`: `string` (optional)
- `summary`: `string | null` (optional)

### `ResearchProgramUpdate`

- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `lead_id`: `string | null` (optional)
- `name`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)

### `ResearchProjectCreate`

- `abstract`: `string | null` (optional)
- `background`: `string | null` (optional)
- `budget`: `number | string | null` (optional)
- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `currency`: `string` (optional)
- `deliverables`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `documents`: `array<object> | null` (optional)
- `end_date`: `string | null` (optional)
- `expected_outcomes`: `string | null` (optional)
- `farm_id`: `string | null` (optional)
- `gallery`: `array<object> | null` (optional)
- `grant_id`: `string | null` (optional)
- `impact`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `methodology`: `string | null` (optional)
- `objectives`: `string | null` (optional)
- `pi_id`: `string | null` (optional)
- `program_id`: `string | null` (optional)
- `progress_percentage`: `integer` (optional)
- `project_type`: `string` (optional)
- `slug`: `string | null` (optional)
- `start_date`: `string | null` (optional)
- `status`: `string` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)

### `ResearchProjectUpdate`

- `abstract`: `string | null` (optional)
- `attachment_media_ids`: `array<string> | null` (optional)
- `background`: `string | null` (optional)
- `budget`: `number | string | null` (optional)
- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `currency`: `string | null` (optional)
- `deliverables`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `document_media_ids`: `array<string> | null` (optional)
- `end_date`: `string | null` (optional)
- `expected_outcomes`: `string | null` (optional)
- `farm_id`: `string | null` (optional)
- `gallery_media_ids`: `array<string> | null` (optional)
- `grant_id`: `string | null` (optional)
- `impact`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `methodology`: `string | null` (optional)
- `objectives`: `string | null` (optional)
- `pi_id`: `string | null` (optional)
- `program_id`: `string | null` (optional)
- `progress_percentage`: `integer | null` (optional)
- `project_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `start_date`: `string | null` (optional)
- `status`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)

### `ResearchResourceCreate`

- `access_type`: `string` (optional)
- `access_url`: `string | null` (optional)
- `attachments`: `array<object> | null` (optional)
- `availability`: `string | null` (optional)
- `booking_url`: `string | null` (optional)
- `capabilities`: `string | null` (optional)
- `category`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `contact_email`: `string | null` (optional)
- `contact_name`: `string | null` (optional)
- `contact_phone`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `fee_structure`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `is_free`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `location`: `string | null` (optional)
- `manager_id`: `string | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `name`: `string` (required)
- `operating_hours`: `string | null` (optional)
- `resource_type`: `string` (optional)
- `room`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `specifications`: `string | null` (optional)
- `status`: `string` (optional)
- `training_required`: `string | null` (optional)
- `usage_guidelines`: `string | null` (optional)

### `ResearchResourceUpdate`

- `access_type`: `string | null` (optional)
- `access_url`: `string | null` (optional)
- `attachments`: `array<object> | null` (optional)
- `availability`: `string | null` (optional)
- `booking_url`: `string | null` (optional)
- `capabilities`: `string | null` (optional)
- `category`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `contact_email`: `string | null` (optional)
- `contact_name`: `string | null` (optional)
- `contact_phone`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `fee_structure`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_free`: `boolean | null` (optional)
- `location`: `string | null` (optional)
- `manager_id`: `string | null` (optional)
- `name`: `string | null` (optional)
- `operating_hours`: `string | null` (optional)
- `resource_type`: `string | null` (optional)
- `room`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `specifications`: `string | null` (optional)
- `status`: `string | null` (optional)
- `training_required`: `string | null` (optional)
- `usage_guidelines`: `string | null` (optional)

### `ResearchServiceCreate`

- `attachments`: `array<object> | null` (optional)
- `category`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `contact_email`: `string | null` (optional)
- `contact_name`: `string | null` (optional)
- `contact_phone`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `deliverables`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `eligibility`: `string | null` (optional)
- `fee_structure`: `string | null` (optional)
- `how_to_access`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `is_free`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `name`: `string` (required)
- `process`: `string | null` (optional)
- `request_url`: `string | null` (optional)
- `scope`: `string | null` (optional)
- `service_type`: `string` (optional)
- `slug`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `turnaround_time`: `string | null` (optional)

### `ResearchServiceUpdate`

- `attachments`: `array<object> | null` (optional)
- `category`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `contact_email`: `string | null` (optional)
- `contact_name`: `string | null` (optional)
- `contact_phone`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `deliverables`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `eligibility`: `string | null` (optional)
- `fee_structure`: `string | null` (optional)
- `how_to_access`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_free`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `process`: `string | null` (optional)
- `request_url`: `string | null` (optional)
- `scope`: `string | null` (optional)
- `service_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `turnaround_time`: `string | null` (optional)

### `ResearchThemeCreate`

- `code`: `string | null` (optional)
- `color`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `icon`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `name`: `string` (required)
- `objectives`: `string | null` (optional)
- `slug`: `string | null` (optional)

### `ResearchThemeUpdate`

- `color`: `string | null` (optional)
- `description`: `string | null` (optional)
- `icon`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `slug`: `string | null` (optional)

### `ScholarshipApplicationCreate`

- `applicant_id`: `string` (required)
- `budget_justification`: `string | null` (optional)
- `career_goals`: `string | null` (optional)
- `cv_url`: `string | null` (optional)
- `personal_statement`: `string | null` (optional)
- `references`: `array<object> | null` (optional)
- `research_experience`: `string | null` (optional)
- `research_proposal`: `string | null` (optional)
- `scholarship_id`: `string` (required)
- `status`: `string` (optional)
- `supporting_documents`: `array<object> | null` (optional)
- `transcripts_url`: `string | null` (optional)

### `ScholarshipApplicationUpdate`

- `awarded_amount`: `number | string | null` (optional)
- `decision_date`: `string | null` (optional)
- `research_proposal`: `string | null` (optional)
- `review_score`: `integer | null` (optional)
- `status`: `string | null` (optional)

### `ScholarshipCreate`

- `application_deadline`: `string | null` (optional)
- `application_open`: `string | null` (optional)
- `application_url`: `string | null` (optional)
- `award_date`: `string | null` (optional)
- `benefits`: `string | null` (optional)
- `code`: `string | null` (optional)
- `contact_email`: `string | null` (optional)
- `contact_name`: `string | null` (optional)
- `contact_phone`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `covers_research`: `boolean` (optional)
- `covers_stipend`: `boolean` (optional)
- `covers_travel`: `boolean` (optional)
- `covers_tuition`: `boolean` (optional)
- `currency`: `string` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `documents`: `array<object> | null` (optional)
- `duration_months`: `integer | null` (optional)
- `eligibility`: `string | null` (optional)
- `endowment_fund_id`: `string | null` (optional)
- `external_url`: `string | null` (optional)
- `funder_logo_url`: `string | null` (optional)
- `funder_name`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `name`: `string` (required)
- `number_available`: `integer | null` (optional)
- `obligations`: `string | null` (optional)
- `renewable`: `boolean` (optional)
- `requirements`: `string | null` (optional)
- `scholarship_type`: `string` (optional)
- `selection_criteria`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `start_date`: `string | null` (optional)
- `status`: `string` (optional)
- `summary`: `string | null` (optional)
- `value`: `number | string | null` (optional)

### `ScholarshipUpdate`

- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)

### `SchoolPublicationCreate`

- `abstract`: `string | null` (optional)
- `acceptance_date`: `string | null` (optional)
- `access_type`: `string | null` (optional)
- `article_number`: `string | null` (optional)
- `arxiv_id`: `string | null` (optional)
- `book_title`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `conference_date`: `string | null` (optional)
- `conference_location`: `string | null` (optional)
- `conference_name`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `doi`: `string | null` (optional)
- `edition`: `string | null` (optional)
- `editors`: `string | null` (optional)
- `funding_acknowledgment`: `string | null` (optional)
- `grant_numbers`: `array<string> | null` (optional)
- `h_index`: `integer | null` (optional)
- `impact_factor`: `number | null` (optional)
- `is_open_access`: `boolean` (optional)
- `isbn`: `string | null` (optional)
- `issn`: `string | null` (optional)
- `issue`: `string | null` (optional)
- `journal_id`: `string | null` (optional)
- `journal_name`: `string | null` (optional)
- `keywords`: `array<string> | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `pages`: `string | null` (optional)
- `pdf_url`: `string | null` (optional)
- `pmid`: `string | null` (optional)
- `project_id`: `string | null` (optional)
- `publication_date`: `string | null` (optional)
- `publication_type`: `string` (optional)
- `publisher`: `string | null` (optional)
- `quartile`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `submission_date`: `string | null` (optional)
- `title`: `string` (required)
- `url`: `string | null` (optional)
- `volume`: `string | null` (optional)
- `year`: `integer | null` (optional)

### `SchoolPublicationUpdate`

- `abstract`: `string | null` (optional)
- `acceptance_date`: `string | null` (optional)
- `access_type`: `string | null` (optional)
- `article_number`: `string | null` (optional)
- `arxiv_id`: `string | null` (optional)
- `book_title`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `conference_date`: `string | null` (optional)
- `conference_location`: `string | null` (optional)
- `conference_name`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `doi`: `string | null` (optional)
- `edition`: `string | null` (optional)
- `editors`: `string | null` (optional)
- `funding_acknowledgment`: `string | null` (optional)
- `grant_numbers`: `array<string> | null` (optional)
- `h_index`: `integer | null` (optional)
- `impact_factor`: `number | null` (optional)
- `is_open_access`: `boolean | null` (optional)
- `isbn`: `string | null` (optional)
- `issn`: `string | null` (optional)
- `issue`: `string | null` (optional)
- `journal_id`: `string | null` (optional)
- `journal_name`: `string | null` (optional)
- `keywords`: `array<string> | null` (optional)
- `pages`: `string | null` (optional)
- `pdf_url`: `string | null` (optional)
- `pmid`: `string | null` (optional)
- `project_id`: `string | null` (optional)
- `publication_date`: `string | null` (optional)
- `publication_type`: `string | null` (optional)
- `publisher`: `string | null` (optional)
- `quartile`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `submission_date`: `string | null` (optional)
- `title`: `string | null` (optional)
- `url`: `string | null` (optional)
- `volume`: `string | null` (optional)
- `year`: `integer | null` (optional)

### `StartupStageAction`

- `note`: `string | null` (optional)
- `registration_status`: `string | null` (optional)
- `status`: `string | null` (optional)
- `venture_stage`: `string` (required)

### `StartupVentureCreate`

- `business_model`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `currency`: `string` (optional)
- `display_order`: `integer` (optional)
- `documents`: `array<object> | null` (optional)
- `founders`: `array<object> | null` (optional)
- `funding_raised`: `number | string | null` (optional)
- `incorporation_date`: `string | null` (optional)
- `innovation_id`: `string` (required)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `lead_founder_id`: `string | null` (optional)
- `market`: `string | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `name`: `string` (required)
- `partner_id`: `string | null` (optional)
- `pitch_deck_url`: `string | null` (optional)
- `problem`: `string | null` (optional)
- `registration_number`: `string | null` (optional)
- `registration_status`: `string` (optional)
- `sector`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `solution`: `string | null` (optional)
- `status`: `string` (optional)
- `summary`: `string | null` (optional)
- `traction`: `string | null` (optional)
- `venture_stage`: `string` (optional)
- `website`: `string | null` (optional)

### `StartupVentureUpdate`

- `business_model`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `founders`: `array<object> | null` (optional)
- `funding_raised`: `number | string | null` (optional)
- `incorporation_date`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `lead_founder_id`: `string | null` (optional)
- `market`: `string | null` (optional)
- `name`: `string | null` (optional)
- `partner_id`: `string | null` (optional)
- `pitch_deck_url`: `string | null` (optional)
- `problem`: `string | null` (optional)
- `registration_number`: `string | null` (optional)
- `registration_status`: `string | null` (optional)
- `sector`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `solution`: `string | null` (optional)
- `status`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `traction`: `string | null` (optional)
- `venture_stage`: `string | null` (optional)
- `website`: `string | null` (optional)

### `SuccessStoryCreate`

- `approach`: `string | null` (optional)
- `attachments`: `array<object> | null` (optional)
- `beneficiaries`: `string | null` (optional)
- `beneficiary_count`: `integer | null` (optional)
- `center_id`: `string | null` (optional)
- `challenge`: `string | null` (optional)
- `country`: `string | null` (optional)
- `county`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `future_directions`: `string | null` (optional)
- `impact`: `string | null` (optional)
- `innovation_id`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `lessons_learned`: `string | null` (optional)
- `location`: `string | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `outcomes`: `string | null` (optional)
- `project_id`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `quotes`: `array<object> | null` (optional)
- `researchers`: `array<object> | null` (optional)
- `slug`: `string | null` (optional)
- `solution`: `string | null` (optional)
- `status`: `string` (optional)
- `story_date`: `string | null` (optional)
- `story_type`: `string` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)
- `video_url`: `string | null` (optional)

### `SuccessStoryUpdate`

- `display_order`: `integer | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `published_at`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `title`: `string | null` (optional)

### `SustainabilityCreate`

- `activities`: `string | null` (optional)
- `approach`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `contact_email`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `documents`: `array<object> | null` (optional)
- `end_date`: `string | null` (optional)
- `impact`: `string | null` (optional)
- `initiative_type`: `string` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `lead_id`: `string | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `name`: `string` (required)
- `objectives`: `string | null` (optional)
- `sdg_goals`: `array<integer> | null` (optional)
- `slug`: `string | null` (optional)
- `start_date`: `string | null` (optional)
- `status`: `string` (optional)
- `summary`: `string | null` (optional)
- `video_url`: `string | null` (optional)
- `website`: `string | null` (optional)

### `SustainabilityUpdate`

- `activities`: `string | null` (optional)
- `approach`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `contact_email`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `documents`: `array<object> | null` (optional)
- `end_date`: `string | null` (optional)
- `impact`: `string | null` (optional)
- `initiative_type`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `lead_id`: `string | null` (optional)
- `name`: `string | null` (optional)
- `objectives`: `string | null` (optional)
- `sdg_goals`: `array<integer> | null` (optional)
- `slug`: `string | null` (optional)
- `start_date`: `string | null` (optional)
- `status`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `video_url`: `string | null` (optional)
- `website`: `string | null` (optional)

### `TechnologyTransferCaseCreate`

- `agreement_date`: `string | null` (optional)
- `agreement_reference`: `string | null` (optional)
- `annual_value`: `number | string | null` (optional)
- `case_type`: `string` (optional)
- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `commercial_terms`: `string | null` (optional)
- `currency`: `string` (optional)
- `disclosure_date`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `documents`: `array<object> | null` (optional)
- `exclusivity`: `string | null` (optional)
- `expiry_date`: `string | null` (optional)
- `innovation_id`: `string` (required)
- `ip_reference`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `lead_officer_id`: `string | null` (optional)
- `license_type`: `string | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `next_steps`: `string | null` (optional)
- `partner_id`: `string | null` (optional)
- `protection_date`: `string | null` (optional)
- `public_benefit`: `string | null` (optional)
- `revenue_generated`: `number | string | null` (optional)
- `revenue_terms`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string` (optional)
- `summary`: `string | null` (optional)
- `territory`: `string | null` (optional)
- `title`: `string` (required)
- `transfer_status`: `string` (optional)
- `upfront_value`: `number | string | null` (optional)

### `TechnologyTransferCaseUpdate`

- `agreement_date`: `string | null` (optional)
- `agreement_reference`: `string | null` (optional)
- `annual_value`: `number | string | null` (optional)
- `case_type`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `commercial_terms`: `string | null` (optional)
- `disclosure_date`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `exclusivity`: `string | null` (optional)
- `expiry_date`: `string | null` (optional)
- `ip_reference`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `lead_officer_id`: `string | null` (optional)
- `license_type`: `string | null` (optional)
- `next_steps`: `string | null` (optional)
- `partner_id`: `string | null` (optional)
- `protection_date`: `string | null` (optional)
- `public_benefit`: `string | null` (optional)
- `revenue_generated`: `number | string | null` (optional)
- `revenue_terms`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `territory`: `string | null` (optional)
- `title`: `string | null` (optional)
- `transfer_status`: `string | null` (optional)
- `upfront_value`: `number | string | null` (optional)

### `TechnologyTransferStatusAction`

- `case_type`: `string | null` (optional)
- `note`: `string | null` (optional)
- `status`: `string | null` (optional)
- `transfer_status`: `string` (required)

### `TrainingProgramCreate`

- `brochure_url`: `string | null` (optional)
- `category`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `contact_email`: `string | null` (optional)
- `contact_name`: `string | null` (optional)
- `contact_phone`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `cpd_points`: `integer | null` (optional)
- `currency`: `string` (optional)
- `curriculum`: `string | null` (optional)
- `delivery_mode`: `string` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `duration_hours`: `integer | null` (optional)
- `early_bird_deadline`: `string | null` (optional)
- `early_bird_fee`: `number | string | null` (optional)
- `end_date`: `string | null` (optional)
- `facilitators`: `array<object> | null` (optional)
- `fee`: `number | string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `is_free`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `materials`: `array<object> | null` (optional)
- `max_participants`: `integer | null` (optional)
- `meeting_link`: `string | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `objectives`: `string | null` (optional)
- `offers_certificate`: `boolean` (optional)
- `organizer_id`: `string | null` (optional)
- `outcomes`: `string | null` (optional)
- `platform`: `string | null` (optional)
- `prerequisites`: `string | null` (optional)
- `program_type`: `string` (optional)
- `registration_deadline`: `string | null` (optional)
- `schedule`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `start_date`: `string | null` (optional)
- `status`: `string` (optional)
- `summary`: `string | null` (optional)
- `target_audience`: `string | null` (optional)
- `title`: `string` (required)
- `venue`: `string | null` (optional)

### `TrainingProgramUpdate`

- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `title`: `string | null` (optional)

### `ValidationError`

- `ctx`: `object` (optional)
- `input`: `object` (optional)
- `loc`: `array<string | integer>` (required)
- `msg`: `string` (required)
- `type`: `string` (required)
