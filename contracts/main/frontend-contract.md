# KSU Main Site API

Shared university CMS, institutional structure, admissions, content, media, support, and platform API for Kisii University.

- Version: `0.1.0`
- OpenAPI: `3.1.0`

## Frontend Contract

This file is generated from the live FastAPI OpenAPI schema. Treat it as the frontend contract for request shapes, auth expectations, and response envelopes.

## About

### `GET /api/v1/about-content`

Get About Content Admin

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AboutPageContentSnapshot_

### `POST /api/v1/about-content`

Create About Content

- Auth: StrictHTTPBearer
- Request body: AboutPageContentCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_AboutPageContentSnapshot_

### `GET /api/v1/about-content/history-milestones`

List History Milestones

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `about_page_content_id` (query, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_HistoryMilestoneSnapshot__

### `POST /api/v1/about-content/history-milestones`

Create History Milestone

- Auth: StrictHTTPBearer
- Request body: HistoryMilestoneCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_HistoryMilestoneSnapshot_

### `PATCH /api/v1/about-content/history-milestones/{item_id}`

Update History Milestone

- Auth: StrictHTTPBearer
- Request body: HistoryMilestoneUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_HistoryMilestoneSnapshot_

### `DELETE /api/v1/about-content/history-milestones/{item_id}`

Delete History Milestone

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/about-content/history-order`

Reorder History

- Auth: StrictHTTPBearer
- Request body: ReorderRequest
- Parameters: `about_page_content_id` (query, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_HistoryMilestoneSnapshot__

### `POST /api/v1/about-content/workflow/{kind}/{item_id}`

Transition About Content

- Auth: StrictHTTPBearer
- Request body: AboutWorkflowAction
- Parameters: `kind` (path, string), `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_dict_str__object__

### `PATCH /api/v1/about-content/{item_id}`

Update About Content

- Auth: StrictHTTPBearer
- Request body: AboutPageContentUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AboutPageContentSnapshot_

### `DELETE /api/v1/about-content/{item_id}`

Delete About Content

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/fact-editions`

List Fact Editions

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_FactEditionSnapshot__

### `POST /api/v1/fact-editions`

Create Fact Edition

- Auth: StrictHTTPBearer
- Request body: FactEditionCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_FactEditionSnapshot_

### `POST /api/v1/fact-editions/{edition_id}/groups`

Create Fact Group

- Auth: StrictHTTPBearer
- Request body: FactGroupCreate
- Parameters: `edition_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_FactGroupSnapshot_

### `GET /api/v1/fact-editions/{edition_id}/groups`

List Fact Groups

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `edition_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_FactGroupSnapshot__

### `PATCH /api/v1/fact-editions/{item_id}`

Update Fact Edition

- Auth: StrictHTTPBearer
- Request body: FactEditionUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_FactEditionSnapshot_

### `DELETE /api/v1/fact-editions/{item_id}`

Delete Fact Edition

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/fact-editions/{item_id}/clone`

Clone Fact Edition

- Auth: StrictHTTPBearer
- Request body: FactEditionClone
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_FactEditionSnapshot_

### `GET /api/v1/fact-groups/evergreen`

List Evergreen Fact Groups

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_FactGroupSnapshot__

### `POST /api/v1/fact-groups/evergreen`

Create Evergreen Fact Group

- Auth: StrictHTTPBearer
- Request body: FactGroupCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_FactGroupSnapshot_

### `POST /api/v1/fact-groups/{group_id}/items`

Create Fact Item

- Auth: StrictHTTPBearer
- Request body: FactItemCreate
- Parameters: `group_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_FactItemSnapshot_

### `GET /api/v1/fact-groups/{group_id}/items`

List Fact Items

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `group_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_FactItemSnapshot__

### `PATCH /api/v1/fact-groups/{item_id}`

Update Fact Group

- Auth: StrictHTTPBearer
- Request body: FactGroupUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_FactGroupSnapshot_

### `DELETE /api/v1/fact-groups/{item_id}`

Delete Fact Group

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `PATCH /api/v1/fact-items/{item_id}`

Update Fact Item

- Auth: StrictHTTPBearer
- Request body: FactItemUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_FactItemSnapshot_

### `DELETE /api/v1/fact-items/{item_id}`

Delete Fact Item

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `PATCH /api/v1/institutional-items/{item_id}`

Update Institutional Item

- Auth: StrictHTTPBearer
- Request body: InstitutionalPageItemUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_InstitutionalPageItemSnapshot_

### `DELETE /api/v1/institutional-items/{item_id}`

Delete Institutional Item

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/institutional-pages`

List Institutional Pages

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `slug` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_InstitutionalPageSnapshot__

### `POST /api/v1/institutional-pages`

Create Institutional Page

- Auth: StrictHTTPBearer
- Request body: InstitutionalPageCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_InstitutionalPageSnapshot_

### `PATCH /api/v1/institutional-pages/{item_id}`

Update Institutional Page

- Auth: StrictHTTPBearer
- Request body: InstitutionalPageUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_InstitutionalPageSnapshot_

### `GET /api/v1/institutional-pages/{page_id}/sections`

List Institutional Sections

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_InstitutionalPageSectionSnapshot__

### `POST /api/v1/institutional-pages/{page_id}/sections`

Create Institutional Section

- Auth: StrictHTTPBearer
- Request body: InstitutionalPageSectionCreate
- Parameters: `page_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_InstitutionalPageSectionSnapshot_

### `POST /api/v1/institutional-pages/{page_id}/sections/reorder`

Reorder Institutional Sections

- Auth: StrictHTTPBearer
- Request body: ReorderRequest
- Parameters: `page_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_InstitutionalPageSectionSnapshot__

### `PATCH /api/v1/institutional-section-documents/{item_id}`

Update Institutional Document

- Auth: StrictHTTPBearer
- Request body: InstitutionalSectionDocumentUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_InstitutionalSectionDocumentSnapshot_

### `DELETE /api/v1/institutional-section-documents/{item_id}`

Delete Institutional Document

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `PATCH /api/v1/institutional-sections/{item_id}`

Update Institutional Section

- Auth: StrictHTTPBearer
- Request body: InstitutionalPageSectionUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_InstitutionalPageSectionSnapshot_

### `DELETE /api/v1/institutional-sections/{item_id}`

Delete Institutional Section

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/institutional-sections/{section_id}/documents`

List Institutional Documents

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `section_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_InstitutionalSectionDocumentSnapshot__

### `POST /api/v1/institutional-sections/{section_id}/documents`

Attach Institutional Document

- Auth: StrictHTTPBearer
- Request body: InstitutionalSectionDocumentCreate
- Parameters: `section_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_InstitutionalSectionDocumentSnapshot_

### `GET /api/v1/institutional-sections/{section_id}/items`

List Institutional Items

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `section_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_InstitutionalPageItemSnapshot__

### `POST /api/v1/institutional-sections/{section_id}/items`

Create Institutional Item

- Auth: StrictHTTPBearer
- Request body: InstitutionalPageItemCreate
- Parameters: `section_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_InstitutionalPageItemSnapshot_

### `POST /api/v1/institutional-sections/{section_id}/items/reorder`

Reorder Institutional Items

- Auth: StrictHTTPBearer
- Request body: ReorderRequest
- Parameters: `section_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_InstitutionalPageItemSnapshot__

### `GET /api/v1/public/about`

Get Public About

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 SuccessResponse_PublicAboutRead_

### `GET /api/v1/public/about/facts`

Get Public Facts

- Auth: public
- Request body: -
- Parameters: `year` (query, integer | null)
- Success response: 200 SuccessResponse_PublicFactsRead_

### `GET /api/v1/public/about/history`

Get Public History

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 SuccessResponse_PublicHistoryRead_

### `GET /api/v1/public/institutional-pages/{slug}`

Get Public Institutional Page

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 SuccessResponse_PublicInstitutionalPageRead_

## Academic

### `GET /api/v1/academic-calendars`

List Academic Calendars

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `academic_year` (query, string | null), `status` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_AcademicCalendarSnapshot__

### `POST /api/v1/academic-calendars`

Create Academic Calendar

- Auth: StrictHTTPBearer
- Request body: AcademicCalendarCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_AcademicCalendarSnapshot_

### `GET /api/v1/academic-calendars/admin`

List Admin Academic Calendars

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `academic_year` (query, string | null), `status` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_AcademicCalendarSnapshot__

### `GET /api/v1/academic-calendars/composition/current`

Get Current Calendar Composition

- Auth: public
- Request body: -
- Parameters: `academic_year` (query, string | null), `semester` (query, integer | null)
- Success response: 200 SuccessResponse_AcademicCalendarComposition_

### `GET /api/v1/academic-calendars/id/{calendar_id}`

Get Academic Calendar

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `calendar_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AcademicCalendarSnapshot_

### `PATCH /api/v1/academic-calendars/{calendar_id}`

Update Academic Calendar

- Auth: StrictHTTPBearer
- Request body: AcademicCalendarUpdate
- Parameters: `calendar_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AcademicCalendarSnapshot_

### `DELETE /api/v1/academic-calendars/{calendar_id}`

Delete Academic Calendar

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `calendar_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/academic-calendars/{calendar_id}/documents`

Attach Calendar Document

- Auth: StrictHTTPBearer
- Request body: AcademicCalendarDocumentCreate
- Parameters: `calendar_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_AcademicCalendarDocumentSnapshot_

### `GET /api/v1/academic-calendars/{calendar_id}/events`

List Public Calendar Events

- Auth: public
- Request body: -
- Parameters: `calendar_id` (path, string), `event_type` (query, string | null), `date_from` (query, string | null), `date_to` (query, string | null)
- Success response: 200 SuccessResponse_list_AcademicCalendarEventSnapshot__

### `POST /api/v1/academic-calendars/{calendar_id}/events`

Create Calendar Event

- Auth: StrictHTTPBearer
- Request body: AcademicCalendarEventCreate
- Parameters: `calendar_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_AcademicCalendarEventSnapshot_

### `PATCH /api/v1/academic-calendars/{calendar_id}/events/{event_id}`

Update Calendar Event

- Auth: StrictHTTPBearer
- Request body: AcademicCalendarEventUpdate
- Parameters: `calendar_id` (path, string), `event_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AcademicCalendarEventSnapshot_

### `POST /api/v1/academic-calendars/{calendar_id}/events/{event_id}/workflow/{action}`

Transition Calendar Event

- Auth: StrictHTTPBearer
- Request body: ContentWorkflowActionRequest
- Parameters: `calendar_id` (path, string), `event_id` (path, string), `action` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AcademicCalendarEventSnapshot_

### `POST /api/v1/academic-calendars/{calendar_id}/workflow/{action}`

Transition Academic Calendar

- Auth: StrictHTTPBearer
- Request body: ContentWorkflowActionRequest
- Parameters: `calendar_id` (path, string), `action` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AcademicCalendarSnapshot_

### `GET /api/v1/campuses`

List Campuses

- Auth: public
- Request body: -
- Parameters: `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_CampusSnapshot__

### `POST /api/v1/campuses`

Create Campus

- Auth: StrictHTTPBearer
- Request body: CampusCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_CampusSnapshot_

### `PATCH /api/v1/campuses/{campus_id}`

Update Campus

- Auth: StrictHTTPBearer
- Request body: CampusUpdate
- Parameters: `campus_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CampusSnapshot_

### `GET /api/v1/campuses/{slug}`

Get Campus

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_CampusSnapshot_

### `POST /api/v1/department-services`

Create Department Service

- Auth: StrictHTTPBearer
- Request body: DepartmentServiceCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_DepartmentServiceSnapshot_

### `GET /api/v1/department-services/admin`

List Admin Department Services

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `department_id` (query, string | null), `search` (query, string | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_DepartmentServiceSnapshot__

### `GET /api/v1/department-services/{service_id}`

Get Department Service

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `service_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_DepartmentServiceSnapshot_

### `PATCH /api/v1/department-services/{service_id}`

Update Department Service

- Auth: StrictHTTPBearer
- Request body: DepartmentServiceUpdate
- Parameters: `service_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_DepartmentServiceSnapshot_

### `DELETE /api/v1/department-services/{service_id}`

Delete Department Service

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `service_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/departments`

List Departments

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `school_id` (query, string | null), `wing_id` (query, string | null), `department_type` (query, string | null), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_DepartmentSnapshot__

### `POST /api/v1/departments`

Create Department

- Auth: StrictHTTPBearer
- Request body: DepartmentCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_DepartmentSnapshot_

### `GET /api/v1/departments/admin`

List Admin Departments

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `school_id` (query, string | null), `wing_id` (query, string | null), `department_type` (query, string | null), `search` (query, string | null), `is_active` (query, boolean | null), `is_public` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_DepartmentSnapshot__

### `GET /api/v1/departments/id/{department_id}`

Get Department By Id

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `department_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_DepartmentSnapshot_

### `PATCH /api/v1/departments/{department_id}`

Update Department

- Auth: StrictHTTPBearer
- Request body: DepartmentUpdate
- Parameters: `department_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_DepartmentSnapshot_

### `DELETE /api/v1/departments/{department_id}`

Delete Department

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `department_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/departments/{slug}`

Get Department

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_DepartmentSnapshot_

### `GET /api/v1/departments/{slug}/programmes`

Get Department Programmes

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `page` (query, integer), `per_page` (query, integer), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_ProgrammeSnapshot__

### `GET /api/v1/departments/{slug}/services`

Get Department Services

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_DepartmentServiceSnapshot__

### `GET /api/v1/departments/{slug}/staff`

Get Department Staff

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_PersonSnapshot__

### `GET /api/v1/schools`

List Schools

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `campus_id` (query, string | null), `administrative_wing_id` (query, string | null), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_SchoolSnapshot__

### `POST /api/v1/schools`

Create School

- Auth: StrictHTTPBearer
- Request body: SchoolCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_SchoolSnapshot_

### `GET /api/v1/schools/admin`

List Admin Schools

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `campus_id` (query, string | null), `administrative_wing_id` (query, string | null), `search` (query, string | null), `is_active` (query, boolean | null), `is_public` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_SchoolSnapshot__

### `GET /api/v1/schools/id/{school_id}`

Get School By Id

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `school_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolSnapshot_

### `PATCH /api/v1/schools/{school_id}`

Update School

- Auth: StrictHTTPBearer
- Request body: SchoolUpdate
- Parameters: `school_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolSnapshot_

### `DELETE /api/v1/schools/{school_id}`

Delete School

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `school_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/schools/{slug}`

Get School

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_SchoolSnapshot_

### `GET /api/v1/schools/{slug}/departments`

Get School Departments

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_DepartmentSnapshot__

### `GET /api/v1/schools/{slug}/programmes`

Get School Programmes

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `page` (query, integer), `per_page` (query, integer), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_ProgrammeSnapshot__

### `GET /api/v1/schools/{slug}/staff`

Get School Staff

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_PersonSnapshot__

## Academic Timetables

### `GET /api/v1/timetables`

List Public Timetables

- Auth: public
- Request body: -
- Parameters: `calendar_id` (query, string | null), `programme_id` (query, string | null), `timetable_type` (query, string)
- Success response: 200 SuccessResponse_list_PublicTimetableItem__

### `POST /api/v1/timetables`

Create Timetable

- Auth: StrictHTTPBearer
- Request body: AcademicTimetableCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_AcademicTimetableSnapshot_

### `GET /api/v1/timetables/venues`

List Venues

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 SuccessResponse_list_TimetableVenueSnapshot__

### `POST /api/v1/timetables/venues`

Create Venue

- Auth: StrictHTTPBearer
- Request body: TimetableVenueCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_TimetableVenueSnapshot_

### `PATCH /api/v1/timetables/{timetable_id}`

Update Timetable

- Auth: StrictHTTPBearer
- Request body: AcademicTimetableUpdate
- Parameters: `timetable_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AcademicTimetableSnapshot_

### `POST /api/v1/timetables/{timetable_id}/sittings`

Create Sitting

- Auth: StrictHTTPBearer
- Request body: TimetableSittingCreate
- Parameters: `timetable_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_TimetableSittingSnapshot_

### `PATCH /api/v1/timetables/{timetable_id}/sittings/{sitting_id}`

Update Sitting

- Auth: StrictHTTPBearer
- Request body: TimetableSittingUpdate
- Parameters: `timetable_id` (path, string), `sitting_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_TimetableSittingSnapshot_

### `POST /api/v1/timetables/{timetable_id}/workflow/{action}`

Transition Timetable

- Auth: StrictHTTPBearer
- Request body: ContentWorkflowActionRequest
- Parameters: `timetable_id` (path, string), `action` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AcademicTimetableSnapshot_

## Admin

### `GET /api/v1/admin/audit`

List Audit Logs

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `service_name` (query, string | null), `user_id` (query, string | null), `resource_type` (query, string | null), `status` (query, string | null), `action` (query, string | null), `request_path_prefix` (query, string | null), `date_from` (query, string | null), `date_to` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_AuditLogRead__

### `GET /api/v1/admin/audit/{audit_id}`

Get Audit Log

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `audit_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AuditLogRead_

### `GET /api/v1/admin/inquiries`

List Inquiries

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `status` (query, string | null), `category` (query, string | null), `priority` (query, string | null), `assigned_to_user_id` (query, string | null), `target_entity_type` (query, string | null), `owner_scope_type` (query, string | null), `owner_scope_id` (query, string | null), `include_school_owned` (query, boolean), `search` (query, string | null), `created_from` (query, string | null), `created_to` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_ContactInquiryRead__

### `GET /api/v1/admin/inquiries/{inquiry_id}`

Get Inquiry

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `inquiry_id` (path, string), `include_school_owned` (query, boolean), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ContactInquiryRead_

### `PATCH /api/v1/admin/inquiries/{inquiry_id}/assign`

Assign Inquiry

- Auth: StrictHTTPBearer
- Request body: InquiryAssign
- Parameters: `inquiry_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ContactInquiryRead_

### `POST /api/v1/admin/inquiries/{inquiry_id}/messages/{message_id}/retry`

Retry Inquiry Reply

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `inquiry_id` (path, string), `message_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ContactInquiryMessageRead_

### `POST /api/v1/admin/inquiries/{inquiry_id}/notes`

Add Inquiry Note

- Auth: StrictHTTPBearer
- Request body: InquiryNoteCreate
- Parameters: `inquiry_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ContactInquiryMessageRead_

### `POST /api/v1/admin/inquiries/{inquiry_id}/replies`

Reply To Inquiry

- Auth: StrictHTTPBearer
- Request body: InquiryReplyCreate
- Parameters: `inquiry_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ContactInquiryMessageRead_

### `PATCH /api/v1/admin/inquiries/{inquiry_id}/status`

Update Inquiry Status

- Auth: StrictHTTPBearer
- Request body: InquiryStatusUpdate
- Parameters: `inquiry_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ContactInquiryRead_

### `POST /api/v1/admin/notifications/broadcast`

Broadcast Notification

- Auth: StrictHTTPBearer
- Request body: NotificationBroadcastCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 202 SuccessResponse_NotificationBroadcastResult_

### `POST /api/v1/admin/notifications/broadcast/preview`

Preview Broadcast

- Auth: StrictHTTPBearer
- Request body: NotificationBroadcastCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NotificationBroadcastPreview_

### `GET /api/v1/admin/notifications/deliveries`

List Deliveries

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `status` (query, string | null), `channel` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_NotificationDeliverySnapshot__

### `POST /api/v1/admin/notifications/send`

Send Notification

- Auth: StrictHTTPBearer
- Request body: NotificationCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_NotificationSnapshot_

### `GET /api/v1/admin/notifications/templates`

List Templates

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_NotificationTemplateSnapshot__

### `POST /api/v1/admin/notifications/templates`

Create Template

- Auth: StrictHTTPBearer
- Request body: NotificationTemplateCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_NotificationTemplateSnapshot_

### `GET /api/v1/admin/notifications/templates/{template_id}`

Get Template

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `template_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NotificationTemplateSnapshot_

### `PATCH /api/v1/admin/notifications/templates/{template_id}`

Update Template

- Auth: StrictHTTPBearer
- Request body: NotificationTemplateUpdate
- Parameters: `template_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NotificationTemplateSnapshot_

### `DELETE /api/v1/admin/notifications/templates/{template_id}`

Delete Template

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `template_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admin/permissions`

List Permissions

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_PermissionSnapshot__

### `POST /api/v1/admin/permissions`

Create Permission

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `name` (query, string), `description` (query, string | null), `resource` (query, string | null), `action` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_PermissionSnapshot_

### `GET /api/v1/admin/reports/admin-activity`

Admin Activity

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `days` (query, integer), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AdminActivityReport_

### `GET /api/v1/admin/reports/content`

Content

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `days` (query, integer), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ContentReport_

### `GET /api/v1/admin/reports/exports/{report_name}`

Export Report

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `report_name` (path, string), `days` (query, integer), `format` (query, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200

### `GET /api/v1/admin/reports/overview`

Overview

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `days` (query, integer), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ReportsOverview_

### `GET /api/v1/admin/reports/traffic`

Traffic

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `days` (query, integer), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_TrafficReport_

### `GET /api/v1/admin/roles`

List Roles

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `system` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_RoleSnapshot__

### `POST /api/v1/admin/roles`

Create Role

- Auth: StrictHTTPBearer
- Request body: RoleCreatePayload
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_RoleSnapshot_

### `GET /api/v1/admin/roles/{role_id}`

Get Role

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `role_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_RoleSnapshot_

### `PUT /api/v1/admin/roles/{role_id}`

Update Role

- Auth: StrictHTTPBearer
- Request body: RoleUpdate
- Parameters: `role_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_RoleSnapshot_

### `PATCH /api/v1/admin/roles/{role_id}`

Update Role

- Auth: StrictHTTPBearer
- Request body: RoleUpdate
- Parameters: `role_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_RoleSnapshot_

### `DELETE /api/v1/admin/roles/{role_id}`

Delete Role

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `role_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admin/roles/{role_id}/permissions`

Get Role Permissions

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `role_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_PermissionSnapshot__

### `PUT /api/v1/admin/roles/{role_id}/permissions`

Update Role Permissions

- Auth: StrictHTTPBearer
- Request body: RolePermissionsUpdatePayload
- Parameters: `role_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_RoleSnapshot_

### `GET /api/v1/admin/system/api-keys`

List Api Keys

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_ApiKeySnapshot__

### `POST /api/v1/admin/system/api-keys`

Create Api Key

- Auth: StrictHTTPBearer
- Request body: ApiKeyCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_ApiKeyCreateEnvelope_

### `GET /api/v1/admin/system/api-keys/{item_id}`

Get Api Key

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ApiKeySnapshot_

### `PUT /api/v1/admin/system/api-keys/{item_id}`

Update Api Key

- Auth: StrictHTTPBearer
- Request body: ApiKeyUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ApiKeySnapshot_

### `PATCH /api/v1/admin/system/api-keys/{item_id}`

Update Api Key

- Auth: StrictHTTPBearer
- Request body: ApiKeyUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ApiKeySnapshot_

### `DELETE /api/v1/admin/system/api-keys/{item_id}`

Revoke Api Key

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admin/system/settings`

List Settings

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `category` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_SettingSnapshot__

### `POST /api/v1/admin/system/settings`

Create Setting

- Auth: StrictHTTPBearer
- Request body: SettingCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_SettingSnapshot_

### `PUT /api/v1/admin/system/settings`

Bulk Update Settings

- Auth: StrictHTTPBearer
- Request body: BulkSettingsUpdatePayload
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_SettingSnapshot__

### `GET /api/v1/admin/system/settings/{item_id}`

Get Setting

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SettingSnapshot_

### `PUT /api/v1/admin/system/settings/{item_id}`

Update Setting

- Auth: StrictHTTPBearer
- Request body: SettingUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SettingSnapshot_

### `PATCH /api/v1/admin/system/settings/{item_id}`

Update Setting

- Auth: StrictHTTPBearer
- Request body: SettingUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SettingSnapshot_

### `DELETE /api/v1/admin/system/settings/{item_id}`

Delete Setting

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admin/system/webhooks`

List Webhooks

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_WebhookSnapshot__

### `POST /api/v1/admin/system/webhooks`

Create Webhook

- Auth: StrictHTTPBearer
- Request body: WebhookCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_WebhookCreateEnvelope_

### `GET /api/v1/admin/system/webhooks/{item_id}`

Get Webhook

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_WebhookSnapshot_

### `PUT /api/v1/admin/system/webhooks/{item_id}`

Update Webhook

- Auth: StrictHTTPBearer
- Request body: WebhookUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_WebhookSnapshot_

### `PATCH /api/v1/admin/system/webhooks/{item_id}`

Update Webhook

- Auth: StrictHTTPBearer
- Request body: WebhookUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_WebhookSnapshot_

### `DELETE /api/v1/admin/system/webhooks/{item_id}`

Delete Webhook

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admin/system/webhooks/{item_id}/deliveries`

List Webhook Deliveries

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `page` (query, integer), `per_page` (query, integer), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_WebhookDeliveryRead__

### `POST /api/v1/admin/system/webhooks/{item_id}/deliveries/{event_id}/retry`

Retry Webhook Delivery

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `event_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 202 SuccessResponse_dict_str__str__

### `GET /api/v1/admin/users`

List Admin Users

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `role` (query, string | null), `sort` (query, string), `order` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_UserSnapshot__

### `POST /api/v1/admin/users`

Create Admin User

- Auth: StrictHTTPBearer
- Request body: UserCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_UserSnapshot_

### `GET /api/v1/admin/users/{user_id}`

Get Admin User

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `user_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_UserSnapshot_

### `PUT /api/v1/admin/users/{user_id}`

Update Admin User

- Auth: StrictHTTPBearer
- Request body: UserUpdate
- Parameters: `user_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_UserSnapshot_

### `PATCH /api/v1/admin/users/{user_id}`

Update Admin User

- Auth: StrictHTTPBearer
- Request body: UserUpdate
- Parameters: `user_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_UserSnapshot_

### `DELETE /api/v1/admin/users/{user_id}`

Delete Admin User

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `user_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admin/users/{user_id}/roles`

List Admin User Roles

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `user_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_UserRoleSnapshot__

### `PUT /api/v1/admin/users/{user_id}/roles`

Update Admin User Roles

- Auth: StrictHTTPBearer
- Request body: UserRolesUpdatePayload
- Parameters: `user_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_UserRoleSnapshot__

### `POST /api/v1/admin/users/{user_id}/roles/{role_id}`

Assign User Role

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `user_id` (path, string), `role_id` (path, string), `scope_type` (query, string | null), `scope_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_UserRoleSnapshot_

## Admissions

### `GET /api/v1/admissions`

List Admission Info

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `content_type` (query, string | null), `audience_level` (query, string | null), `school_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_AdmissionInfoSnapshot__

### `POST /api/v1/admissions`

Create Admission Info

- Auth: StrictHTTPBearer
- Request body: AdmissionInfoCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_AdmissionInfoSnapshot_

### `GET /api/v1/admissions/admin`

List Admin Admission Info

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `content_type` (query, string | null), `audience_level` (query, string | null), `school_id` (query, string | null), `is_published` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_AdmissionInfoSnapshot__

### `GET /api/v1/admissions/documents`

List Admission Documents

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `document_type` (query, string | null), `applicant_type` (query, string | null), `pathway_id` (query, string | null), `programme_id` (query, string | null), `intake_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_AdmissionDocumentSnapshot__

### `POST /api/v1/admissions/documents`

Create Admission Document

- Auth: StrictHTTPBearer
- Request body: AdmissionDocumentCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_AdmissionDocumentSnapshot_

### `PATCH /api/v1/admissions/documents/{item_id}`

Update Admission Document

- Auth: StrictHTTPBearer
- Request body: AdmissionDocumentUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AdmissionDocumentSnapshot_

### `DELETE /api/v1/admissions/documents/{item_id}`

Delete Admission Document

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admissions/documents/{slug}`

Get Admission Document

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_AdmissionDocumentSnapshot_

### `GET /api/v1/admissions/faqs`

List Admission Faqs

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `category` (query, string | null), `applicant_type` (query, string | null), `pathway_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_AdmissionFaqSnapshot__

### `POST /api/v1/admissions/faqs`

Create Admission Faq

- Auth: StrictHTTPBearer
- Request body: AdmissionFaqCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_AdmissionFaqSnapshot_

### `GET /api/v1/admissions/faqs/{item_id}`

Get Admission Faq

- Auth: public
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_AdmissionFaqSnapshot_

### `PATCH /api/v1/admissions/faqs/{item_id}`

Update Admission Faq

- Auth: StrictHTTPBearer
- Request body: AdmissionFaqUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AdmissionFaqSnapshot_

### `DELETE /api/v1/admissions/faqs/{item_id}`

Delete Admission Faq

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admissions/fee-structures`

List Programme Fee Structures

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `programme_id` (query, string | null), `intake_id` (query, string | null), `applicant_type` (query, string | null), `fee_category` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_ProgrammeFeeStructureSnapshot__

### `POST /api/v1/admissions/fee-structures`

Create Programme Fee Structure

- Auth: StrictHTTPBearer
- Request body: ProgrammeFeeStructureCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_ProgrammeFeeStructureSnapshot_

### `GET /api/v1/admissions/fee-structures/{item_id}`

Get Programme Fee Structure

- Auth: public
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_ProgrammeFeeStructureSnapshot_

### `PATCH /api/v1/admissions/fee-structures/{item_id}`

Update Programme Fee Structure

- Auth: StrictHTTPBearer
- Request body: ProgrammeFeeStructureUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ProgrammeFeeStructureSnapshot_

### `DELETE /api/v1/admissions/fee-structures/{item_id}`

Delete Programme Fee Structure

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admissions/id/{item_id}`

Get Admission Info By Id

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AdmissionInfoSnapshot_

### `GET /api/v1/admissions/page-sections`

List Admission Page Sections

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `page_key` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_AdmissionPageSectionSnapshot__

### `POST /api/v1/admissions/page-sections`

Create Admission Page Section

- Auth: StrictHTTPBearer
- Request body: AdmissionPageSectionCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_AdmissionPageSectionSnapshot_

### `GET /api/v1/admissions/page-sections/{item_id}`

Get Admission Page Section

- Auth: public
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_AdmissionPageSectionSnapshot_

### `PATCH /api/v1/admissions/page-sections/{item_id}`

Update Admission Page Section

- Auth: StrictHTTPBearer
- Request body: AdmissionPageSectionUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AdmissionPageSectionSnapshot_

### `DELETE /api/v1/admissions/page-sections/{item_id}`

Delete Admission Page Section

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admissions/pathways`

List Admission Pathways

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `applicant_type` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_AdmissionPathwaySnapshot__

### `POST /api/v1/admissions/pathways`

Create Admission Pathway

- Auth: StrictHTTPBearer
- Request body: AdmissionPathwayCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_AdmissionPathwaySnapshot_

### `PATCH /api/v1/admissions/pathways/{item_id}`

Update Admission Pathway

- Auth: StrictHTTPBearer
- Request body: AdmissionPathwayUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AdmissionPathwaySnapshot_

### `DELETE /api/v1/admissions/pathways/{item_id}`

Delete Admission Pathway

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admissions/pathways/{slug}`

Get Admission Pathway

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_AdmissionPathwaySnapshot_

### `GET /api/v1/admissions/requirements`

List Admission Requirements

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `programme_id` (query, string | null), `school_id` (query, string | null), `intake_id` (query, string | null), `pathway_id` (query, string | null), `applicant_type` (query, string | null), `level` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_AdmissionRequirementSnapshot__

### `POST /api/v1/admissions/requirements`

Create Admission Requirement

- Auth: StrictHTTPBearer
- Request body: AdmissionRequirementCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_AdmissionRequirementSnapshot_

### `GET /api/v1/admissions/requirements/{item_id}`

Get Admission Requirement

- Auth: public
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_AdmissionRequirementSnapshot_

### `PATCH /api/v1/admissions/requirements/{item_id}`

Update Admission Requirement

- Auth: StrictHTTPBearer
- Request body: AdmissionRequirementUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AdmissionRequirementSnapshot_

### `DELETE /api/v1/admissions/requirements/{item_id}`

Delete Admission Requirement

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `PATCH /api/v1/admissions/{item_id}`

Update Admission Info

- Auth: StrictHTTPBearer
- Request body: AdmissionInfoUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AdmissionInfoSnapshot_

### `DELETE /api/v1/admissions/{item_id}`

Delete Admission Info

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admissions/{slug}`

Get Admission Info

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_AdmissionInfoSnapshot_

### `GET /api/v1/intakes`

List Intakes

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `academic_calendar_id` (query, string | null), `is_open` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_IntakeSnapshot__

### `POST /api/v1/intakes`

Create Intake

- Auth: StrictHTTPBearer
- Request body: IntakeCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_IntakeSnapshot_

### `GET /api/v1/intakes/admin`

List Admin Intakes

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `academic_calendar_id` (query, string | null), `is_open` (query, boolean | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_IntakeSnapshot__

### `GET /api/v1/intakes/id/{intake_id}`

Get Intake By Id

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `intake_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_IntakeSnapshot_

### `GET /api/v1/intakes/id/{intake_id}/homepage-admission`

Get Homepage Admission

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `intake_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_IntakeHomepageAdmissionRead_

### `PATCH /api/v1/intakes/id/{intake_id}/homepage-admission`

Update Homepage Admission

- Auth: StrictHTTPBearer
- Request body: IntakeHomepageAdmissionUpdate
- Parameters: `intake_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_IntakeHomepageAdmissionRead_

### `PATCH /api/v1/intakes/{intake_id}`

Update Intake

- Auth: StrictHTTPBearer
- Request body: IntakeUpdate
- Parameters: `intake_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_IntakeSnapshot_

### `DELETE /api/v1/intakes/{intake_id}`

Delete Intake

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `intake_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/intakes/{slug}`

Get Intake

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_IntakeSnapshot_

### `GET /api/v1/programmes`

List Programmes

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `school_id` (query, string | null), `department_id` (query, string | null), `level` (query, string | null), `mode_of_study` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_ProgrammeSnapshot__

### `POST /api/v1/programmes`

Create Programme

- Auth: StrictHTTPBearer
- Request body: ProgrammeCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_ProgrammeSnapshot_

### `GET /api/v1/programmes/admin`

List Admin Programmes

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `school_id` (query, string | null), `department_id` (query, string | null), `level` (query, string | null), `mode_of_study` (query, string | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_ProgrammeSnapshot__

### `GET /api/v1/programmes/api/list`

List Programmes Api Key

List programmes via API key authentication.

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `school_id` (query, string | null), `department_id` (query, string | null), `level` (query, string | null), `mode_of_study` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `X-API-Key` (header, string | null)
- Success response: 200 SuccessResponse_list_ProgrammeSnapshot__

### `GET /api/v1/programmes/api/{slug}`

Get Programme Api Key

Get programme by slug via API key authentication.

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `X-API-Key` (header, string | null)
- Success response: 200 SuccessResponse_ProgrammeSnapshot_

### `GET /api/v1/programmes/id/{programme_id}`

Get Programme By Id

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `programme_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ProgrammeSnapshot_

### `PATCH /api/v1/programmes/{programme_id}`

Update Programme

- Auth: StrictHTTPBearer
- Request body: ProgrammeUpdate
- Parameters: `programme_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ProgrammeSnapshot_

### `DELETE /api/v1/programmes/{programme_id}`

Delete Programme

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `programme_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/programmes/{programme_id}/intakes`

Attach Programme Intake

- Auth: StrictHTTPBearer
- Request body: ProgrammeIntakeCreate
- Parameters: `programme_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_ProgrammeIntakeSnapshot_

### `POST /api/v1/programmes/{programme_id}/tutors`

Add Programme Tutor

- Auth: StrictHTTPBearer
- Request body: ProgrammeTutorCreate
- Parameters: `programme_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_ProgrammeTutorSnapshot_

### `GET /api/v1/programmes/{slug}`

Get Programme

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_ProgrammeSnapshot_

### `GET /api/v1/programmes/{slug}/staff`

Get Programme Staff

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_PersonSnapshot__

## Alumni

### `GET /api/v1/alumni`

List Alumni

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `school_id` (query, string | null), `programme_id` (query, string | null), `graduation_year` (query, integer | null), `mentor_only` (query, boolean), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_AlumniSnapshot__

### `POST /api/v1/alumni`

Create Alumnus

- Auth: StrictHTTPBearer
- Request body: AlumniCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_AlumniSnapshot_

### `GET /api/v1/alumni-associations`

List Alumni Associations

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `association_type` (query, string | null), `school_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_AlumniAssociationSnapshot__

### `POST /api/v1/alumni-associations`

Create Alumni Association

- Auth: StrictHTTPBearer
- Request body: AlumniAssociationCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_AlumniAssociationSnapshot_

### `POST /api/v1/alumni-associations/{association_id}/members`

Add Alumni Association Member

- Auth: StrictHTTPBearer
- Request body: AlumniAssociationMemberCreate
- Parameters: `association_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_AlumniAssociationMemberSnapshot_

### `DELETE /api/v1/alumni-associations/{association_id}/members/{alumni_id}`

Remove Alumni Association Member

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `association_id` (path, string), `alumni_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `PATCH /api/v1/alumni-associations/{item_id}`

Update Alumni Association

- Auth: StrictHTTPBearer
- Request body: AlumniAssociationUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AlumniAssociationSnapshot_

### `DELETE /api/v1/alumni-associations/{item_id}`

Delete Alumni Association

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/alumni-associations/{slug}`

Get Alumni Association

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_AlumniAssociationSnapshot_

### `GET /api/v1/alumni-associations/{slug}/members`

Get Alumni Association Members

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_AlumniAssociationMemberSnapshot__

### `GET /api/v1/alumni/{item_id}`

Get Alumnus

- Auth: public
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_AlumniSnapshot_

### `PATCH /api/v1/alumni/{item_id}`

Update Alumnus

- Auth: StrictHTTPBearer
- Request body: AlumniUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AlumniSnapshot_

### `DELETE /api/v1/alumni/{item_id}`

Delete Alumnus

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

## Analytics

### `POST /api/v1/analytics/events`

Ingest Events

- Auth: public
- Request body: AnalyticsEventBatchCreate
- Parameters: -
- Success response: 202 SuccessResponse_dict_str__int__

## Auth

### `POST /api/v1/auth/change-password`

Change Password

- Auth: StrictHTTPBearer
- Request body: ChangePasswordRequest
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_str_

### `POST /api/v1/auth/forgot-password`

Forgot Password

- Auth: public
- Request body: ForgotPasswordRequest
- Parameters: -
- Success response: 200 SuccessResponse_str_

### `GET /api/v1/auth/jwks`

Jwks

Publish verifier-only key material for external and internal consumers.

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 object

### `POST /api/v1/auth/login`

Login

- Auth: public
- Request body: UserLogin
- Parameters: -
- Success response: 200 SuccessResponse_Union_TokenResponse__CookieAuthResponse__

### `POST /api/v1/auth/logout`

Logout

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_dict_str__int__

### `POST /api/v1/auth/logout-all`

Logout All

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_dict_str__int__

### `GET /api/v1/auth/me`

Get Me

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AuthUserResponse_

### `POST /api/v1/auth/mfa/confirm`

Confirm

- Auth: StrictHTTPBearer
- Request body: FactorRequest
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_RecoveryResponse_

### `POST /api/v1/auth/mfa/enroll`

Enroll

- Auth: StrictHTTPBearer
- Request body: EnrollmentRequest
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_EnrollmentResponse_

### `POST /api/v1/auth/mfa/replace`

Replace

- Auth: StrictHTTPBearer
- Request body: StepUpRequest
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_EnrollmentResponse_

### `GET /api/v1/auth/mfa/status`

Mfa Status

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_MfaStatusResponse_

### `POST /api/v1/auth/mfa/step-up`

Step Up

- Auth: StrictHTTPBearer
- Request body: StepUpRequest
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AssuranceResponse_

### `POST /api/v1/auth/refresh`

Refresh

- Auth: public
- Request body: RefreshRequest
- Parameters: `ksu_refresh` (cookie, string | null)
- Success response: 200 SuccessResponse_Union_TokenResponse__CookieAuthResponse__

### `POST /api/v1/auth/reset-password`

Reset Password

- Auth: public
- Request body: ResetPasswordRequest
- Parameters: -
- Success response: 200 SuccessResponse_str_

### `POST /api/v1/auth/verify-email`

Verify Email

- Auth: public
- Request body: VerifyEmailRequest
- Parameters: -
- Success response: 200 SuccessResponse_dict_str__Union_str__bool___

## Content

### `GET /api/v1/announcements`

List Announcements

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `is_published` (query, boolean | null), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_AnnouncementSnapshot__

### `POST /api/v1/announcements`

Create Announcement

- Auth: StrictHTTPBearer
- Request body: AnnouncementCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_AnnouncementSnapshot_

### `GET /api/v1/announcements/admin`

List Admin Announcements

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `is_published` (query, boolean | null), `status` (query, string | null), `workflow_status` (query, string | null), `owner_portal` (query, string | null), `owner_scope_type` (query, string | null), `owner_scope_id` (query, string | null), `scheduled_from` (query, string | null), `scheduled_to` (query, string | null), `search` (query, string | null), `record_state` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_AnnouncementSnapshot__

### `GET /api/v1/announcements/id/{announcement_id}`

Get Announcement By Id

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `announcement_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AnnouncementSnapshot_

### `PATCH /api/v1/announcements/{announcement_id}`

Update Announcement

- Auth: StrictHTTPBearer
- Request body: AnnouncementUpdate
- Parameters: `announcement_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AnnouncementSnapshot_

### `DELETE /api/v1/announcements/{announcement_id}`

Delete Announcement

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `announcement_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/announcements/{announcement_id}/publish`

Publish Announcement

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `announcement_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AnnouncementSnapshot_

### `POST /api/v1/announcements/{announcement_id}/unpublish`

Unpublish Announcement

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `announcement_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AnnouncementSnapshot_

### `GET /api/v1/announcements/{slug}`

Get Announcement

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_AnnouncementSnapshot_

### `GET /api/v1/blogs`

List Blogs

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `is_published` (query, boolean | null), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_BlogSnapshot__

### `POST /api/v1/blogs`

Create Blog

- Auth: StrictHTTPBearer
- Request body: BlogCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_BlogSnapshot_

### `GET /api/v1/blogs/admin`

List Admin Blogs

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `is_published` (query, boolean | null), `status` (query, string | null), `workflow_status` (query, string | null), `owner_portal` (query, string | null), `owner_scope_type` (query, string | null), `owner_scope_id` (query, string | null), `scheduled_from` (query, string | null), `scheduled_to` (query, string | null), `search` (query, string | null), `record_state` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_BlogSnapshot__

### `GET /api/v1/blogs/id/{blog_id}`

Get Blog By Id

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `blog_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_BlogSnapshot_

### `PATCH /api/v1/blogs/id/{blog_id}`

Update Blog

- Auth: StrictHTTPBearer
- Request body: BlogUpdate
- Parameters: `blog_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_BlogSnapshot_

### `DELETE /api/v1/blogs/id/{blog_id}`

Delete Blog

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `blog_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/blogs/id/{blog_id}/publish`

Publish Blog

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `blog_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_BlogSnapshot_

### `POST /api/v1/blogs/id/{blog_id}/unpublish`

Unpublish Blog

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `blog_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_BlogSnapshot_

### `GET /api/v1/blogs/{slug}`

Get Blog

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_BlogSnapshot_

### `POST /api/v1/content-workflow/bulk`

Run Bulk Content Workflow Action

Apply one workflow action to many records, reporting per-item outcomes.

Authorization and transition failures never fail the whole request; each
item reports its own ``{content_id, ok, error}`` result.

- Auth: StrictHTTPBearer
- Request body: BulkWorkflowRequest
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_BulkWorkflowResult__

### `GET /api/v1/content-workflow/queue`

List Content Workflow Queue

Return reviewable public content in a single CoCMS-oriented queue.

Pagination is opt-in (pass ``per_page``); the bare-list response shape is
unchanged and ``meta`` carries totals plus per-status counts for the whole
filtered queue.

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `source_portal` (query, string | null), `content_type` (query, string | null), `status` (query, string | null), `submitted_date` (query, string | null), `scheduled_date` (query, string | null), `reviewer` (query, string | null), `q` (query, string | null), `page` (query, integer), `per_page` (query, integer | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_ContentWorkflowQueueItemRead__

### `GET /api/v1/content-workflow/{content_type}/{content_id}/logs`

List Content Workflow Logs

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `content_type` (path, string), `content_id` (path, string), `page` (query, integer), `per_page` (query, integer), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_ContentWorkflowLogRead__

### `POST /api/v1/content-workflow/{content_type}/{content_id}/{action}`

Run Content Workflow Action

- Auth: StrictHTTPBearer
- Request body: ContentWorkflowActionRequest
- Parameters: `content_type` (path, string), `content_id` (path, string), `action` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ContentWorkflowRecordSnapshot_

### `GET /api/v1/events`

List Events

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `is_published` (query, boolean | null), `upcoming` (query, boolean | null), `search` (query, string | null), `include_scope` (query, boolean), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_EventSnapshot__

### `POST /api/v1/events`

Create Event

- Auth: StrictHTTPBearer
- Request body: EventCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_EventSnapshot_

### `GET /api/v1/events/admin`

List Admin Events

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `is_published` (query, boolean | null), `upcoming` (query, boolean | null), `status` (query, string | null), `workflow_status` (query, string | null), `owner_portal` (query, string | null), `owner_scope_type` (query, string | null), `owner_scope_id` (query, string | null), `scheduled_from` (query, string | null), `scheduled_to` (query, string | null), `search` (query, string | null), `record_state` (query, string), `include_scope` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_EventSnapshot__

### `GET /api/v1/events/id/{event_id}`

Get Event By Id

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `event_id` (path, string), `include_scope` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_EventSnapshot_

### `PATCH /api/v1/events/{event_id}`

Update Event

- Auth: StrictHTTPBearer
- Request body: EventUpdate
- Parameters: `event_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_EventSnapshot_

### `DELETE /api/v1/events/{event_id}`

Delete Event

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `event_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/events/{event_id}/publish`

Publish Event

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `event_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_EventSnapshot_

### `POST /api/v1/events/{event_id}/unpublish`

Unpublish Event

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `event_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_EventSnapshot_

### `GET /api/v1/events/{slug}`

Get Event

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `include_scope` (query, boolean), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_EventSnapshot_

### `GET /api/v1/homepage`

Get Homepage

- Auth: public
- Request body: -
- Parameters: `scope_type` (query, string), `scope_id` (query, string | null)
- Success response: 200 SuccessResponse_PageCompositionResponse_

### `GET /api/v1/news`

List News

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `is_published` (query, boolean | null), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_NewsSnapshot__

### `POST /api/v1/news`

Create News

- Auth: StrictHTTPBearer
- Request body: NewsCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_NewsSnapshot_

### `GET /api/v1/news/admin`

List Admin News

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `is_published` (query, boolean | null), `status` (query, string | null), `workflow_status` (query, string | null), `owner_portal` (query, string | null), `owner_scope_type` (query, string | null), `owner_scope_id` (query, string | null), `scheduled_from` (query, string | null), `scheduled_to` (query, string | null), `search` (query, string | null), `record_state` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_NewsSnapshot__

### `GET /api/v1/news/id/{news_id}`

Get News By Id

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `news_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NewsSnapshot_

### `PATCH /api/v1/news/{news_id}`

Update News

- Auth: StrictHTTPBearer
- Request body: NewsUpdate
- Parameters: `news_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NewsSnapshot_

### `DELETE /api/v1/news/{news_id}`

Delete News

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `news_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/news/{news_id}/publish`

Publish News

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `news_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NewsSnapshot_

### `POST /api/v1/news/{news_id}/unpublish`

Unpublish News

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `news_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NewsSnapshot_

### `GET /api/v1/news/{slug}`

Get News

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_NewsSnapshot_

### `GET /api/v1/page-section-definitions`

List Page Cms Definitions

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_SectionDefinitionRead__

### `GET /api/v1/page-section-sources/{source_type}`

Search Page Cms Sources

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `source_type` (path, string), `q` (query, string), `scope_type` (query, string), `scope_id` (query, string | null), `page` (query, integer), `per_page` (query, integer), `layout_variant` (query, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_PageCmsSourceSummary__

### `POST /api/v1/page-sections`

Create Page Section

- Auth: StrictHTTPBearer
- Request body: PageSectionCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_PageSectionSnapshot_

### `GET /api/v1/page-sections/admin`

List Admin Page Sections

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `page_key` (query, string | null), `scope_type` (query, string | null), `scope_id` (query, string | null), `status` (query, string | null), `search` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_PageSectionSnapshot__

### `GET /api/v1/page-sections/{section_id}`

Get Admin Page Section

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `section_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PageSectionSnapshot_

### `PATCH /api/v1/page-sections/{section_id}`

Update Page Section

- Auth: StrictHTTPBearer
- Request body: PageSectionUpdate
- Parameters: `section_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PageSectionSnapshot_

### `POST /api/v1/page-sections/{section_id}/items`

Create Section Item

- Auth: StrictHTTPBearer
- Request body: SectionItemCreate
- Parameters: `section_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_SectionItemSnapshot_

### `PATCH /api/v1/page-sections/{section_id}/items/reorder`

Reorder Section Items

- Auth: StrictHTTPBearer
- Request body: SectionItemReorderRequest
- Parameters: `section_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_SectionItemSnapshot__

### `POST /api/v1/page-sections/{section_id}/{action}`

Run Page Section Workflow Action

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `section_id` (path, string), `action` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PageSectionSnapshot_

### `GET /api/v1/pages/{page_key}`

Get Page Composition

- Auth: public
- Request body: -
- Parameters: `page_key` (path, string), `scope_type` (query, string), `scope_id` (query, string | null)
- Success response: 200 SuccessResponse_PageCompositionResponse_

### `GET /api/v1/pages/{page_key}/preview`

Get Page Preview

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page_key` (path, string), `scope_type` (query, string), `scope_id` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PagePreviewResponse_

### `PATCH /api/v1/pages/{page_key}/sections/reorder`

Reorder Page Sections

- Auth: StrictHTTPBearer
- Request body: PageSectionReorderRequest
- Parameters: `page_key` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_PageSectionSnapshot__

### `GET /api/v1/pages/{page_key}/validate`

Validate Page

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page_key` (path, string), `scope_type` (query, string), `scope_id` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PageValidationResponse_

### `POST /api/v1/partnership-spotlights`

Create Partnership Spotlight

- Auth: StrictHTTPBearer
- Request body: PartnershipSpotlightCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_PartnershipSpotlightSnapshot_

### `GET /api/v1/partnership-spotlights/admin`

List Admin Partnership Spotlights

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `status` (query, string | null), `search` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_PartnershipSpotlightSnapshot__

### `PATCH /api/v1/partnership-spotlights/{spotlight_id}`

Update Partnership Spotlight

- Auth: StrictHTTPBearer
- Request body: PartnershipSpotlightUpdate
- Parameters: `spotlight_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PartnershipSpotlightSnapshot_

### `GET /api/v1/partnership-spotlights/{spotlight_id}`

Get Admin Partnership Spotlight

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `spotlight_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PartnershipSpotlightSnapshot_

### `POST /api/v1/partnership-spotlights/{spotlight_id}/{action}`

Run Partnership Spotlight Workflow Action

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `spotlight_id` (path, string), `action` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PartnershipSpotlightSnapshot_

### `POST /api/v1/records/{content_type}/{record_id}/restore`

Restore Record

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `content_type` (path, string), `record_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ContentWorkflowRecordSnapshot_

### `PATCH /api/v1/section-items/{item_id}`

Update Section Item

- Auth: StrictHTTPBearer
- Request body: SectionItemUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SectionItemSnapshot_

### `GET /api/v1/sliders`

List Sliders

- Auth: public
- Request body: -
- Parameters: `slider_group_id` (query, string | null), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_SliderSnapshot__

### `POST /api/v1/sliders`

Create Slider

- Auth: StrictHTTPBearer
- Request body: SliderCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_SliderSnapshot_

### `GET /api/v1/sliders/admin`

List Admin Sliders

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `slider_group_id` (query, string | null), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `status` (query, string | null), `workflow_status` (query, string | null), `is_active` (query, boolean | null), `search` (query, string | null), `record_state` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_SliderSnapshot__

### `GET /api/v1/sliders/groups`

List Slider Groups

- Auth: public
- Request body: -
- Parameters: `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_SliderGroupSnapshot__

### `POST /api/v1/sliders/groups`

Create Slider Group

- Auth: StrictHTTPBearer
- Request body: SliderGroupCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_SliderGroupSnapshot_

### `GET /api/v1/sliders/groups/admin`

List Admin Slider Groups

Admin listing of slider groups: includes inactive and non-public groups.

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `is_active` (query, boolean | null), `is_public` (query, boolean | null), `is_main` (query, boolean | null), `scope_type` (query, string | null), `scope_id` (query, string | null), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_SliderGroupSnapshot__

### `GET /api/v1/sliders/groups/id/{group_id}`

Get Slider Group By Id

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `group_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SliderGroupSnapshot_

### `PATCH /api/v1/sliders/groups/{group_id}`

Update Slider Group

- Auth: StrictHTTPBearer
- Request body: SliderGroupUpdate
- Parameters: `group_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SliderGroupSnapshot_

### `DELETE /api/v1/sliders/groups/{group_id}`

Delete Slider Group

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `group_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/sliders/groups/{slug}`

Get Slider Group

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_SliderGroupSnapshot_

### `GET /api/v1/sliders/{slider_id}`

Get Slider

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `slider_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SliderSnapshot_

### `PATCH /api/v1/sliders/{slider_id}`

Update Slider

- Auth: StrictHTTPBearer
- Request body: SliderUpdate
- Parameters: `slider_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SliderSnapshot_

### `DELETE /api/v1/sliders/{slider_id}`

Delete Slider

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `slider_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/stories`

List Stories

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `story_type` (query, string | null), `category` (query, string | null), `is_featured` (query, boolean | null), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_StorySnapshot__

### `POST /api/v1/stories`

Create Story

- Auth: StrictHTTPBearer
- Request body: StoryCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_StorySnapshot_

### `POST /api/v1/stories/account-requests`

Request Story Contributor Account

- Auth: public
- Request body: StoryContributorAccountRequestCreate
- Parameters: -
- Success response: 201 SuccessResponse_StoryContributorAccountRequestRead_

### `GET /api/v1/stories/account-requests/admin`

List Story Contributor Account Requests

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `status` (query, string | null), `search` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_StoryContributorAccountRequestRead__

### `POST /api/v1/stories/account-requests/admin/{request_id}/approve`

Approve Story Contributor Account Request

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `request_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_StoryContributorAccountRequestRead_

### `POST /api/v1/stories/account-requests/admin/{request_id}/reject`

Reject Story Contributor Account Request

- Auth: StrictHTTPBearer
- Request body: StoryContributorAccountRequestReview
- Parameters: `request_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_StoryContributorAccountRequestRead_

### `GET /api/v1/stories/admin`

List Admin Stories

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `is_published` (query, boolean | null), `status` (query, string | null), `workflow_status` (query, string | null), `story_type` (query, string | null), `category` (query, string | null), `contributor_user_id` (query, string | null), `scheduled_from` (query, string | null), `scheduled_to` (query, string | null), `search` (query, string | null), `record_state` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_StorySnapshot__

### `GET /api/v1/stories/id/{story_id}`

Get Story By Id

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `story_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_StorySnapshot_

### `PATCH /api/v1/stories/id/{story_id}`

Update Story

- Auth: StrictHTTPBearer
- Request body: StoryUpdate
- Parameters: `story_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_StorySnapshot_

### `DELETE /api/v1/stories/id/{story_id}`

Delete Story

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `story_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/stories/id/{story_id}/feedback`

List Story Feedback

Workflow history for a story, readable by its contributor.

Contributors cannot use the generic content-workflow logs route (it
requires reviewer/edit permissions), so this surfaces reviewer feedback
(request_changes / reject comments and transitions) for their own story.

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `story_id` (path, string), `page` (query, integer), `per_page` (query, integer), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_ContentWorkflowLogRead__

### `GET /api/v1/stories/mine`

List My Stories

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `workflow_status` (query, string | null), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_StorySnapshot__

### `POST /api/v1/stories/submissions`

Submit Story

- Auth: StrictHTTPBearer
- Request body: StorySubmissionCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_StorySnapshot_

### `GET /api/v1/stories/{slug}`

Get Story

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_StorySnapshot_

## Corporate Communication Portal

### `GET /api/v1/corporate-communication-portal/context`

Get Context

Return server-derived capabilities and navigation for the portal.

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CorporatePortalContextResponse_

### `POST /api/v1/corporate-communication-portal/media/batches`

Create Media Batch

- Auth: StrictHTTPBearer
- Request body: Body_create_media_batch_api_v1_corporate_communication_portal_media_batches_post
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_PortalUploadBatchRead_

### `GET /api/v1/corporate-communication-portal/media/batches/{batch_id}`

Get Media Batch

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `batch_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PortalUploadBatchRead_

### `POST /api/v1/corporate-communication-portal/media/batches/{batch_id}/files/{file_id}/retry`

Retry Media File

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `batch_id` (path, string), `file_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PortalUploadBatchRead_

### `GET /api/v1/corporate-communication-portal/settings`

Get Corporate Comm Settings

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CorporateCommSettingsResponse_

### `PUT /api/v1/corporate-communication-portal/settings`

Update Corporate Comm Settings

- Auth: StrictHTTPBearer
- Request body: CorporateCommSettingsUpdate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CorporateCommSettingsResponse_

### `GET /api/v1/corporate-communication-portal/settings/team`

List Corporate Comm Team

Read-only roster of users holding Corporate Communication roles.

A user belongs to the roster when one of their active roles grants a
signature Corporate Communication permission. Management deep-links to the
admin users screen; this endpoint intentionally exposes no user CRUD.

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CorporateCommTeamResponse_

## Documents

### `GET /api/v1/documents`

List Documents

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `document_type` (query, string | null), `category` (query, string | null), `scope_type` (query, string | null), `scope_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_DocumentSnapshot__

### `POST /api/v1/documents`

Create Document

- Auth: StrictHTTPBearer
- Request body: DocumentCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_DocumentSnapshot_

### `GET /api/v1/documents/admin`

List Admin Documents

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `document_type` (query, string | null), `category` (query, string | null), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_public` (query, boolean | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_DocumentSnapshot__

### `PATCH /api/v1/documents/{item_id}`

Update Document

- Auth: StrictHTTPBearer
- Request body: DocumentUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_DocumentSnapshot_

### `DELETE /api/v1/documents/{item_id}`

Delete Document

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/documents/{slug}`

Get Document

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_DocumentSnapshot_

### `GET /api/v1/policies`

List Policies

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `category` (query, string | null), `division_id` (query, string | null), `department_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_PolicySnapshot__

### `POST /api/v1/policies`

Create Policy

- Auth: StrictHTTPBearer
- Request body: PolicyCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_PolicySnapshot_

### `GET /api/v1/policies/admin`

List Admin Policies

Admin register listing: drafts and archived policies included.

The permission check runs in the function body (not as a dependency) so the
CSV export path, which calls this endpoint directly, is gated too.

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `category` (query, string | null), `division_id` (query, string | null), `department_id` (query, string | null), `status` (query, string | null), `is_public` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_PolicySnapshot__

### `PATCH /api/v1/policies/{item_id}`

Update Policy

- Auth: StrictHTTPBearer
- Request body: PolicyUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PolicySnapshot_

### `DELETE /api/v1/policies/{item_id}`

Delete Policy

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/policies/{slug}`

Get Policy

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_PolicySnapshot_

## Exchange

### `GET /api/v1/exchange-programmes`

List Exchange Programmes

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `programme_type` (query, string | null), `school_id` (query, string | null), `accepting_only` (query, boolean), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_ExchangeProgrammeSnapshot__

### `POST /api/v1/exchange-programmes`

Create Exchange Programme

- Auth: StrictHTTPBearer
- Request body: ExchangeProgrammeCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_ExchangeProgrammeSnapshot_

### `PATCH /api/v1/exchange-programmes/{item_id}`

Update Exchange Programme

- Auth: StrictHTTPBearer
- Request body: ExchangeProgrammeUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ExchangeProgrammeSnapshot_

### `DELETE /api/v1/exchange-programmes/{item_id}`

Delete Exchange Programme

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/exchange-programmes/{slug}`

Get Exchange Programme

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_ExchangeProgrammeSnapshot_

## Exports

### `GET /api/v1/exports/{resource}.csv`

Export Resource Csv

Export a resource's admin listing (honoring the caller's filters) as CSV.

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `resource` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200

## External Synchronization

### `POST /api/v1/sync/digital/lecturers`

Synchronize Lecturers

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SyncEnvelope

### `GET /api/v1/sync/digital/lecturers/department-stats`

Lecturer Department Stats

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SyncEnvelope

### `GET /api/v1/sync/digital/lecturers/jobs/{job_id}`

Lecturer Sync Job

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `job_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SyncJobPayload_

### `POST /api/v1/sync/digital/lecturers/preview`

Preview Lecturers Sync

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SyncEnvelope

### `GET /api/v1/sync/digital/lecturers/profile-completeness`

Lecturer Profile Completeness

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SyncEnvelope

### `POST /api/v1/sync/digital/lecturers/trigger`

Trigger Lecturer Sync

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `Idempotency-Key` (header, string | null), `X-Request-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 202 SuccessResponse_SyncJobPayload_

### `GET /api/v1/sync/digital/programmes/jobs/{job_id}`

Programme Sync Job

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `job_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SyncJobPayload_

### `GET /api/v1/sync/digital/programmes/preview`

Programme Preview

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SyncEnvelope

### `POST /api/v1/sync/digital/programmes/trigger`

Trigger Programme Sync

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `Idempotency-Key` (header, string | null), `X-Request-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 202 SuccessResponse_SyncJobPayload_

## Governance

### `GET /api/v1/governance/admin/council/audit-log`

List Council Audit Log

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_AuditLogRead__

### `GET /api/v1/governance/admin/council/dashboard`

Council Dashboard

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CouncilDashboardRead_

### `GET /api/v1/governance/admin/council/members`

List Council Members

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `workflow_status` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_CouncilMemberSnapshot__

### `POST /api/v1/governance/admin/council/members`

Create Council Member

- Auth: StrictHTTPBearer
- Request body: CouncilMemberCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_CouncilMemberSnapshot_

### `GET /api/v1/governance/admin/council/members/{assignment_id}`

Get Council Member

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CouncilMemberSnapshot_

### `PATCH /api/v1/governance/admin/council/members/{assignment_id}`

Update Council Member

- Auth: StrictHTTPBearer
- Request body: CouncilMemberUpdate
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CouncilMemberSnapshot_

### `DELETE /api/v1/governance/admin/council/members/{assignment_id}`

Delete Council Member

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/governance/admin/council/members/{assignment_id}/approve`

Approve Council Member

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `comment` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CouncilMemberSnapshot_

### `POST /api/v1/governance/admin/council/members/{assignment_id}/archive`

Archive Council Member

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `comment` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CouncilMemberSnapshot_

### `POST /api/v1/governance/admin/council/members/{assignment_id}/publish`

Publish Council Member

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `comment` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CouncilMemberSnapshot_

### `POST /api/v1/governance/admin/council/members/{assignment_id}/submit-review`

Submit Council Member For Review

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `comment` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CouncilMemberSnapshot_

### `POST /api/v1/governance/admin/council/members/{assignment_id}/unpublish`

Unpublish Council Member

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `comment` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CouncilMemberSnapshot_

### `GET /api/v1/governance/admin/council/order`

Get Council Order

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_CouncilOrderNode__

### `PUT /api/v1/governance/admin/council/order`

Update Council Order

- Auth: StrictHTTPBearer
- Request body: CouncilOrderUpdate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_CouncilMemberSnapshot__

### `GET /api/v1/governance/admin/council/page-content`

Get Council Page Content

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_GovernancePageContentRead_

### `PATCH /api/v1/governance/admin/council/page-content`

Update Council Page Content

- Auth: StrictHTTPBearer
- Request body: GovernancePageContentUpdate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_GovernancePageContentRead_

### `POST /api/v1/governance/admin/council/page-content/approve`

Approve Council Page Content

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_GovernancePageContentRead_

### `POST /api/v1/governance/admin/council/page-content/archive`

Archive Council Page Content

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_GovernancePageContentRead_

### `POST /api/v1/governance/admin/council/page-content/publish`

Publish Council Page Content

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_GovernancePageContentRead_

### `POST /api/v1/governance/admin/council/page-content/submit-review`

Submit Council Page Content For Review

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_GovernancePageContentRead_

### `POST /api/v1/governance/admin/council/page-content/unpublish`

Unpublish Council Page Content

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_GovernancePageContentRead_

### `GET /api/v1/governance/admin/council/preview`

Preview Council

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PublicCouncilResponse_

### `GET /api/v1/governance/admin/management-board/dashboard`

Management Board Dashboard

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CouncilDashboardRead_

### `GET /api/v1/governance/admin/management-board/members`

List Management Board Members

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `workflow_status` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_CouncilMemberSnapshot__

### `POST /api/v1/governance/admin/management-board/members`

Create Management Board Member

- Auth: StrictHTTPBearer
- Request body: CouncilMemberCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_CouncilMemberSnapshot_

### `GET /api/v1/governance/admin/management-board/members/{assignment_id}`

Get Management Board Member

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CouncilMemberSnapshot_

### `PATCH /api/v1/governance/admin/management-board/members/{assignment_id}`

Update Management Board Member

- Auth: StrictHTTPBearer
- Request body: CouncilMemberUpdate
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CouncilMemberSnapshot_

### `DELETE /api/v1/governance/admin/management-board/members/{assignment_id}`

Delete Management Board Member

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/governance/admin/management-board/members/{assignment_id}/approve`

Approve Management Board Member

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `comment` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CouncilMemberSnapshot_

### `POST /api/v1/governance/admin/management-board/members/{assignment_id}/archive`

Archive Management Board Member

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `comment` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CouncilMemberSnapshot_

### `POST /api/v1/governance/admin/management-board/members/{assignment_id}/publish`

Publish Management Board Member

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `comment` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CouncilMemberSnapshot_

### `POST /api/v1/governance/admin/management-board/members/{assignment_id}/submit-review`

Submit Management Board Member For Review

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `comment` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CouncilMemberSnapshot_

### `POST /api/v1/governance/admin/management-board/members/{assignment_id}/unpublish`

Unpublish Management Board Member

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `comment` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CouncilMemberSnapshot_

### `GET /api/v1/governance/admin/management-board/order`

Get Management Board Order

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_CouncilOrderNode__

### `PUT /api/v1/governance/admin/management-board/order`

Update Management Board Order

- Auth: StrictHTTPBearer
- Request body: CouncilOrderUpdate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_CouncilMemberSnapshot__

### `GET /api/v1/governance/admin/management-board/page-content`

Get Management Board Page Content

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_GovernancePageContentRead_

### `PATCH /api/v1/governance/admin/management-board/page-content`

Update Management Board Page Content

- Auth: StrictHTTPBearer
- Request body: GovernancePageContentUpdate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_GovernancePageContentRead_

### `POST /api/v1/governance/admin/management-board/page-content/approve`

Approve Management Board Page Content

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_GovernancePageContentRead_

### `POST /api/v1/governance/admin/management-board/page-content/archive`

Archive Management Board Page Content

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_GovernancePageContentRead_

### `POST /api/v1/governance/admin/management-board/page-content/publish`

Publish Management Board Page Content

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_GovernancePageContentRead_

### `POST /api/v1/governance/admin/management-board/page-content/submit-review`

Submit Management Board Page Content For Review

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_GovernancePageContentRead_

### `POST /api/v1/governance/admin/management-board/page-content/unpublish`

Unpublish Management Board Page Content

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_GovernancePageContentRead_

### `GET /api/v1/governance/admin/management-board/preview`

Preview Management Board

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PublicCouncilResponse_

### `GET /api/v1/governance/admin/roles`

List Governance Roles

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `active_only` (query, boolean), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_GovernanceRoleSnapshot__

### `POST /api/v1/governance/admin/roles`

Create Governance Role

- Auth: StrictHTTPBearer
- Request body: GovernanceRoleCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_GovernanceRoleSnapshot_

### `PATCH /api/v1/governance/admin/roles/{role_id}`

Update Governance Role

- Auth: StrictHTTPBearer
- Request body: GovernanceRoleUpdate
- Parameters: `role_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_GovernanceRoleSnapshot_

### `GET /api/v1/governance/boards`

List Boards

- Auth: public
- Request body: -
- Parameters: `board_type` (query, string | null), `parent_entity_type` (query, string | null), `parent_entity_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_BoardSnapshot__

### `POST /api/v1/governance/boards`

Create Board

- Auth: StrictHTTPBearer
- Request body: BoardCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_BoardSnapshot_

### `GET /api/v1/governance/boards/id/{board_id}`

Get Board By Id

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `board_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_BoardSnapshot_

### `PATCH /api/v1/governance/boards/id/{board_id}`

Update Board

- Auth: StrictHTTPBearer
- Request body: BoardUpdate
- Parameters: `board_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_BoardSnapshot_

### `DELETE /api/v1/governance/boards/id/{board_id}`

Delete Board

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `board_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/governance/boards/id/{board_id}/members`

Get Board Members By Id

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `board_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_BoardMemberSnapshot__

### `POST /api/v1/governance/boards/id/{board_id}/members`

Add Board Member By Id

- Auth: StrictHTTPBearer
- Request body: BoardMemberCreate
- Parameters: `board_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_BoardMemberSnapshot_

### `DELETE /api/v1/governance/boards/id/{board_id}/members/{person_id}`

Remove Board Member By Id

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `board_id` (path, string), `person_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/governance/boards/{slug}`

Get Board

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_BoardSnapshot_

### `GET /api/v1/governance/boards/{slug}/members`

Get Board Members

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_BoardMemberSnapshot__

### `POST /api/v1/governance/boards/{slug}/members`

Add Board Member

- Auth: StrictHTTPBearer
- Request body: BoardMemberCreate
- Parameters: `slug` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_BoardMemberSnapshot_

### `DELETE /api/v1/governance/boards/{slug}/members/{person_id}`

Remove Board Member

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `person_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/governance/council`

Get Council

- Auth: public
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_BoardSnapshot_

### `GET /api/v1/governance/management-board`

Get Management Board

- Auth: public
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_BoardSnapshot_

### `GET /api/v1/governance/public/university-council`

Public University Council

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 SuccessResponse_PublicCouncilResponse_

### `GET /api/v1/governance/public/university-council/{slug}`

Public University Council Profile

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 SuccessResponse_PublicCouncilProfile_

### `GET /api/v1/governance/senate`

Get Senate

- Auth: public
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_BoardSnapshot_

## Health

### `GET /api/v1/health`

Health

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 SuccessResponse_HealthPayload_

## Imports

### `GET /api/v1/imports/jobs/{job_id}`

Get Import Job

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `job_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ImportJobRead_

### `GET /api/v1/imports/resources`

List Import Resources

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_ImportResourceRead__

### `GET /api/v1/imports/resources/{resource_key}`

Get Import Resource

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `resource_key` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ImportResourceRead_

### `POST /api/v1/imports/{resource_key}/commit`

Commit Import

- Auth: StrictHTTPBearer
- Request body: ImportCommitRequest
- Parameters: `resource_key` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_ImportCommitRead_

### `POST /api/v1/imports/{resource_key}/commit-async`

Queue Import Commit

- Auth: StrictHTTPBearer
- Request body: ImportCommitRequest
- Parameters: `resource_key` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 202 SuccessResponse_ImportJobRead_

### `POST /api/v1/imports/{resource_key}/preview`

Preview Import

- Auth: StrictHTTPBearer
- Request body: Body_preview_import_api_v1_imports__resource_key__preview_post
- Parameters: `resource_key` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ImportPreviewRead_

### `GET /api/v1/imports/{resource_key}/template`

Download Import Template

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `resource_key` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200

## Internal

### `POST /api/v1/internal/audit`

Ingest Internal Audit

Idempotently persist a sibling service's audit event in Main's schema.

- Auth: public
- Request body: InternalAuditPayload
- Parameters: `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 202 object

### `GET /api/v1/internal/audit`

List Internal Audit

Return only the requested service's audit stream to authenticated callers.

- Auth: public
- Request body: -
- Parameters: `service_name` (query, string), `page` (query, integer), `per_page` (query, integer), `user_id` (query, string | null), `resource_type` (query, string | null), `resource_id` (query, string | null), `status` (query, string | null), `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 InternalAuditListResponse

### `POST /api/v1/internal/audit/batch`

Ingest Internal Audit Batch

- Auth: public
- Request body: InternalAuditBatch
- Parameters: `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 202 InternalAuditBatchResult

### `POST /api/v1/internal/auth/introspect`

Introspect Identity

Validate the real user session and return current database assignments.

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 IdentitySnapshot

### `GET /api/v1/internal/departments/{department_id}`

Get Department Snapshot

- Auth: public
- Request body: -
- Parameters: `department_id` (path, string), `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 InternalDepartmentSnapshot

### `POST /api/v1/internal/email/send`

Send Internal Email

- Auth: public
- Request body: InternalEmailPayload
- Parameters: `Idempotency-Key` (header, string | null), `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 InternalEmailResponse

### `GET /api/v1/internal/events`

List Internal Events

Return public scoped events to authenticated sibling services.

- Auth: public
- Request body: -
- Parameters: `scope_type` (query, string | null), `scope_id` (query, string | null), `page` (query, integer), `per_page` (query, integer), `fields` (query, string | null), `include` (query, string | null), `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 InternalEventListResponse

### `POST /api/v1/internal/media/resolve`

Resolve Public Media

Resolve browser-safe media snapshots without exposing Main's tables.

- Auth: public
- Request body: InternalMediaResolvePayload
- Parameters: `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 InternalMediaResolveResponse

### `GET /api/v1/internal/media/{media_id}`

Get Public Media Snapshot

Return browser-safe fields for public media referenced by sibling services.

- Auth: public
- Request body: -
- Parameters: `media_id` (path, string), `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 InternalPublicMediaSnapshot

### `POST /api/v1/internal/notifications/broadcast`

Broadcast Internal Notification

- Auth: public
- Request body: InternalNotificationBroadcastPayload
- Parameters: `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 InternalNotificationBroadcastResponse

### `POST /api/v1/internal/persons/resolve`

Resolve Public Persons

Resolve public researcher snapshots for records owned by sibling services.

- Auth: public
- Request body: InternalPersonResolvePayload
- Parameters: `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 InternalPersonResolveResponse

### `GET /api/v1/internal/persons/{person_id}`

Get Person Snapshot

Return a minimal person snapshot for sibling services (Research, Library).

- Auth: public
- Request body: -
- Parameters: `person_id` (path, string), `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 InternalPersonSnapshot

### `GET /api/v1/internal/references/{kind}/{item_id}`

Check Reference

Validate shared main-owned references for sibling services.

- Auth: public
- Request body: -
- Parameters: `kind` (path, string), `item_id` (path, string), `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 InternalReferenceCheckResponse

### `GET /api/v1/internal/schools/{school_id}/departments/{department_id}`

Check Department School

Validate the cross-service school/department ownership pair.

- Auth: public
- Request body: -
- Parameters: `school_id` (path, string), `department_id` (path, string), `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 InternalDepartmentCheckResponse

### `GET /api/v1/internal/staff-assignments/{assignment_id}`

Get Staff Assignment Snapshot

- Auth: public
- Request body: -
- Parameters: `assignment_id` (path, string), `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 InternalStaffAssignmentSnapshot

## Marketing

### `GET /api/v1/newsletters`

List Newsletters

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_NewsletterSnapshot__

### `POST /api/v1/newsletters`

Create Newsletter

- Auth: StrictHTTPBearer
- Request body: NewsletterCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_NewsletterSnapshot_

### `GET /api/v1/newsletters/admin`

List Newsletters Admin

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `search` (query, string | null), `status` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_NewsletterSnapshot__

### `GET /api/v1/newsletters/admin/{item_id}`

Get Newsletter Admin

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NewsletterSnapshot_

### `POST /api/v1/newsletters/subscribe`

Subscribe Newsletter

- Auth: public
- Request body: NewsletterSubscriberCreate
- Parameters: `Idempotency-Key` (header, string)
- Success response: 201 SuccessResponse_NewsletterSubscriberSnapshot_

### `GET /api/v1/newsletters/subscribers`

List Newsletter Subscribers

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `status` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_NewsletterSubscriberSnapshot__

### `POST /api/v1/newsletters/subscribers/{item_id}/unsubscribe`

Unsubscribe Newsletter Subscriber

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NewsletterSubscriberSnapshot_

### `POST /api/v1/newsletters/unsubscribe`

Unsubscribe Newsletter

- Auth: public
- Request body: -
- Parameters: `email` (query, string), `Idempotency-Key` (header, string)
- Success response: 200 SuccessResponse_NewsletterSubscriberSnapshot_

### `PATCH /api/v1/newsletters/{item_id}`

Update Newsletter

- Auth: StrictHTTPBearer
- Request body: NewsletterUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NewsletterSnapshot_

### `DELETE /api/v1/newsletters/{item_id}`

Delete Newsletter

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/newsletters/{item_id}/cancel-schedule`

Cancel Newsletter Schedule

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NewsletterSnapshot_

### `POST /api/v1/newsletters/{item_id}/schedule`

Schedule Newsletter

- Auth: StrictHTTPBearer
- Request body: NewsletterScheduleRequest
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NewsletterSnapshot_

### `POST /api/v1/newsletters/{item_id}/send`

Send Newsletter

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NewsletterSnapshot_

### `GET /api/v1/newsletters/{slug}`

Get Newsletter

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_NewsletterSnapshot_

### `GET /api/v1/social-posts`

List Social Posts

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `status` (query, string | null), `source_type` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_SocialMediaPostSnapshot__

### `POST /api/v1/social-posts`

Create Social Post

- Auth: StrictHTTPBearer
- Request body: SocialMediaPostCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_SocialMediaPostSnapshot_

### `GET /api/v1/social-posts/accounts`

List Social Accounts

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `provider` (query, string | null), `active_only` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_SocialPlatformAccountSnapshot__

### `POST /api/v1/social-posts/accounts`

Create Social Account

- Auth: StrictHTTPBearer
- Request body: SocialPlatformAccountCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_SocialPlatformAccountSnapshot_

### `PATCH /api/v1/social-posts/accounts/{item_id}`

Update Social Account

- Auth: StrictHTTPBearer
- Request body: SocialPlatformAccountUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SocialPlatformAccountSnapshot_

### `DELETE /api/v1/social-posts/accounts/{item_id}`

Delete Social Account

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/social-posts/accounts/{item_id}/validate`

Validate Social Account

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SocialCredentialsValidation_

### `GET /api/v1/social-posts/{item_id}`

Get Social Post

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SocialMediaPostSnapshot_

### `PATCH /api/v1/social-posts/{item_id}`

Update Social Post

- Auth: StrictHTTPBearer
- Request body: SocialMediaPostUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SocialMediaPostSnapshot_

### `DELETE /api/v1/social-posts/{item_id}`

Delete Social Post

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/social-posts/{item_id}/deliveries`

List Social Post Deliveries

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_SocialMediaDeliverySnapshot__

### `POST /api/v1/social-posts/{item_id}/publish`

Publish Social Post

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SocialMediaPostSnapshot_

### `POST /api/v1/social-posts/{item_id}/validate`

Validate Social Post

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SocialValidationSummary_

### `GET /api/v1/testimonials`

List Testimonials

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `testimonial_type` (query, string | null), `school_id` (query, string | null), `department_id` (query, string | null), `programme_id` (query, string | null), `featured_only` (query, boolean), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_TestimonialSnapshot__

### `POST /api/v1/testimonials`

Create Testimonial

- Auth: StrictHTTPBearer
- Request body: TestimonialCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_TestimonialSnapshot_

### `GET /api/v1/testimonials/admin`

List Admin Testimonials

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `testimonial_type` (query, string | null), `school_id` (query, string | null), `department_id` (query, string | null), `programme_id` (query, string | null), `featured_only` (query, boolean), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_TestimonialSnapshot__

### `GET /api/v1/testimonials/{item_id}`

Get Testimonial

- Auth: public
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_TestimonialSnapshot_

### `PATCH /api/v1/testimonials/{item_id}`

Update Testimonial

- Auth: StrictHTTPBearer
- Request body: TestimonialUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_TestimonialSnapshot_

### `DELETE /api/v1/testimonials/{item_id}`

Delete Testimonial

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

## Me

### `GET /api/v1/me/portal-access`

Get My Portal Access

Return backend-authoritative portal access records for the authenticated user.

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PortalAccessResponse_

### `GET /api/v1/me/preferences`

Get My Preferences

Return generic preferences owned by the authenticated user.

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_UserPreferencesRead_

### `PATCH /api/v1/me/preferences`

Update My Preferences

Upsert generic preferences owned by the authenticated user.

- Auth: StrictHTTPBearer
- Request body: UserPreferencesUpdate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_UserPreferencesRead_

### `GET /api/v1/me/profile`

Get My Profile

Return the authenticated user's linked public staff profile.

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PersonRead_

### `PATCH /api/v1/me/profile`

Update My Profile

Update editable fields on the authenticated user's linked public staff profile.

- Auth: StrictHTTPBearer
- Request body: MyProfileUpdate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PersonRead_

## Media

### `GET /api/v1/media`

List Media

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `folder_id` (query, string | null), `media_type` (query, string | null), `uploaded_by_id` (query, string | null), `entity_type` (query, string | null), `entity_id` (query, string | null), `role` (query, string | null), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_MediaSnapshot__

### `GET /api/v1/media/folders`

List Folders

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `parent_id` (query, string | null), `scope_type` (query, string | null), `scope_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_MediaFolderSnapshot__

### `POST /api/v1/media/folders`

Create Folder

- Auth: StrictHTTPBearer
- Request body: MediaFolderCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_MediaFolderSnapshot_

### `GET /api/v1/media/folders/{folder_id}`

Get Folder

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `folder_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_MediaFolderSnapshot_

### `PATCH /api/v1/media/folders/{folder_id}`

Update Folder

- Auth: StrictHTTPBearer
- Request body: MediaFolderUpdate
- Parameters: `folder_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_MediaFolderSnapshot_

### `DELETE /api/v1/media/folders/{folder_id}`

Delete Folder

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `folder_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/media/links`

List Media Links

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `entity_type` (query, string), `entity_id` (query, string), `role` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_MediaLinkSnapshot__

### `POST /api/v1/media/links`

Create Media Link

- Auth: StrictHTTPBearer
- Request body: MediaLinkCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_MediaLinkSnapshot_

### `GET /api/v1/media/links/{link_id}`

Get Media Link

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `link_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_MediaLinkSnapshot_

### `PATCH /api/v1/media/links/{link_id}`

Update Media Link

- Auth: StrictHTTPBearer
- Request body: MediaLinkUpdate
- Parameters: `link_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_MediaLinkSnapshot_

### `DELETE /api/v1/media/links/{link_id}`

Delete Media Link

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `link_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/media/upload`

Upload Media

- Auth: StrictHTTPBearer
- Request body: Body_upload_media_api_v1_media_upload_post
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_MediaSnapshot_

### `GET /api/v1/media/{media_id}`

Get Media

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `media_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_MediaSnapshot_

### `PATCH /api/v1/media/{media_id}`

Update Media

- Auth: StrictHTTPBearer
- Request body: MediaUpdate
- Parameters: `media_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_MediaSnapshot_

### `DELETE /api/v1/media/{media_id}`

Delete Media

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `media_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

## Organization

### `GET /api/v1/divisions`

List Divisions

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_DivisionSnapshot__

### `POST /api/v1/divisions`

Create Division

- Auth: StrictHTTPBearer
- Request body: DivisionCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_DivisionSnapshot_

### `GET /api/v1/divisions/admin`

List Admin Divisions

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_DivisionSnapshot__

### `GET /api/v1/divisions/id/{division_id}`

Get Division By Id

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `division_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_DivisionSnapshot_

### `PATCH /api/v1/divisions/id/{division_id}`

Update Division

- Auth: StrictHTTPBearer
- Request body: DivisionUpdate
- Parameters: `division_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_DivisionSnapshot_

### `DELETE /api/v1/divisions/id/{division_id}`

Delete Division

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `division_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/divisions/{slug}`

Get Division

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_DivisionSnapshot_

### `POST /api/v1/wings`

Create Wing

- Auth: StrictHTTPBearer
- Request body: WingCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_WingSnapshot_

### `GET /api/v1/wings/admin`

List Admin Wings

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `division_id` (query, string | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_WingSnapshot__

### `GET /api/v1/wings/division/{division_id}`

List Wings By Division

- Auth: public
- Request body: -
- Parameters: `division_id` (path, string), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_WingSnapshot__

### `GET /api/v1/wings/slug/{slug}`

Get Wing By Slug

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_WingSnapshot_

### `GET /api/v1/wings/{wing_id}`

Get Wing

- Auth: public
- Request body: -
- Parameters: `wing_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_WingSnapshot_

### `PATCH /api/v1/wings/{wing_id}`

Update Wing

- Auth: StrictHTTPBearer
- Request body: WingUpdate
- Parameters: `wing_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_WingSnapshot_

## Persons

### `GET /api/v1/persons`

List Persons

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `department_id` (query, string | null), `school_id` (query, string | null), `academic_rank` (query, string | null), `employment_type` (query, string | null), `is_researcher` (query, boolean | null), `status` (query, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_PersonSnapshot__

### `POST /api/v1/persons`

Create Person

- Auth: StrictHTTPBearer
- Request body: PersonCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_PersonSnapshot_

### `GET /api/v1/persons/admin`

List Admin Persons

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `department_id` (query, string | null), `school_id` (query, string | null), `academic_rank` (query, string | null), `employment_type` (query, string | null), `is_researcher` (query, boolean | null), `status` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_PersonSnapshot__

### `GET /api/v1/persons/{person_id}`

Get Person

- Auth: public
- Request body: -
- Parameters: `person_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_PersonSnapshot_

### `PATCH /api/v1/persons/{person_id}`

Update Person

- Auth: StrictHTTPBearer
- Request body: PersonUpdate
- Parameters: `person_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PersonSnapshot_

### `DELETE /api/v1/persons/{person_id}`

Delete Person

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `person_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `PATCH /api/v1/persons/{person_id}/activate`

Activate Person

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `person_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PersonSnapshot_

### `POST /api/v1/persons/{person_id}/cv`

Upload Person Cv

- Auth: StrictHTTPBearer
- Request body: Body_upload_person_cv_api_v1_persons__person_id__cv_post
- Parameters: `person_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PersonSnapshot_

### `DELETE /api/v1/persons/{person_id}/cv`

Remove Person Cv

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `person_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PersonSnapshot_

### `PATCH /api/v1/persons/{person_id}/deactivate`

Deactivate Person

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `person_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PersonSnapshot_

### `POST /api/v1/persons/{person_id}/photo`

Upload Person Photo

- Auth: StrictHTTPBearer
- Request body: Body_upload_person_photo_api_v1_persons__person_id__photo_post
- Parameters: `person_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PersonSnapshot_

### `DELETE /api/v1/persons/{person_id}/photo`

Remove Person Photo

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `person_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PersonSnapshot_

## Public

### `GET /api/v1/navigation`

Get Navigation

Single public payload backing the main-site mega menu.

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 SuccessResponse_NavigationPayload_

### `GET /api/v1/public-pages`

List Public Site Pages

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `page_type` (query, string | null), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_PublicSitePageSnapshot__

### `GET /api/v1/public-pages/{slug}`

Get Public Site Page

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_PublicSitePageSnapshot_

### `GET /api/v1/public/academic-organization`

Get Public Academic Organization

- Auth: public
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_PublicAcademicOrganizationPayload_

### `GET /api/v1/public/content/{entity_type}/{entity_id}`

Get Public Entity Content

- Auth: public
- Request body: -
- Parameters: `entity_type` (path, string), `entity_id` (path, string), `content_type` (query, string), `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_PublicEntityContentPayload_

### `GET /api/v1/public/departments/{department_id}/team`

Get Public Department Team

- Auth: public
- Request body: -
- Parameters: `department_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_PublicSchoolTeamPayload_

### `POST /api/v1/public/entities/{entity_type}/{entity_slug}/inquiries`

Create Public Entity Inquiry

- Auth: public
- Request body: PublicEntityInquiryCreate
- Parameters: `entity_type` (path, string), `entity_slug` (path, string), `Idempotency-Key` (header, string)
- Success response: 201 SuccessResponse_PublicInquirySubmission_

### `GET /api/v1/public/leadership/`

Get Leader

Get a leader by role and entity.

- Auth: public
- Request body: -
- Parameters: `role` (query, string), `entity_type` (query, string), `entity_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_Union_StaffAssignmentSnapshot__NoneType__

### `GET /api/v1/public/leadership/chancellor`

Get Chancellor

Get the current Chancellor.

- Auth: public
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_Union_StaffAssignmentSnapshot__NoneType__

### `GET /api/v1/public/leadership/dean/{school_id}`

Get Dean

Get the Dean of a school.

- Auth: public
- Request body: -
- Parameters: `school_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_Union_StaffAssignmentSnapshot__NoneType__

### `GET /api/v1/public/leadership/director/{division_id}`

Get Director

Get the Director of a division/directorate.

- Auth: public
- Request body: -
- Parameters: `division_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_Union_StaffAssignmentSnapshot__NoneType__

### `GET /api/v1/public/leadership/hod/{department_id}`

Get Hod

Get the Head of Department.

- Auth: public
- Request body: -
- Parameters: `department_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_Union_StaffAssignmentSnapshot__NoneType__

### `GET /api/v1/public/leadership/list`

List Leaders

List all public leadership assignments for an entity.

- Auth: public
- Request body: -
- Parameters: `entity_type` (query, string), `entity_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_StaffAssignmentSnapshot__

### `GET /api/v1/public/leadership/vice-chancellor`

Get Vice Chancellor

Get the current Vice Chancellor.

- Auth: public
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_Union_StaffAssignmentSnapshot__NoneType__

### `GET /api/v1/public/media`

List Public Media

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `media_type` (query, string | null), `collection` (query, string | null), `search` (query, string | null)
- Success response: 200 SuccessResponse_list_MediaSnapshot__

### `GET /api/v1/public/media/links`

List Public Media Links

- Auth: public
- Request body: -
- Parameters: `entity_type` (query, string), `entity_id` (query, string), `role` (query, string | null), `per_page` (query, integer)
- Success response: 200 SuccessResponse_list_MediaLinkSnapshot__

### `GET /api/v1/public/media/{media_id}`

Get Public Media

- Auth: public
- Request body: -
- Parameters: `media_id` (path, string)
- Success response: 200 SuccessResponse_MediaSnapshot_

### `GET /api/v1/public/people/{person_id}`

Get Public Person

- Auth: public
- Request body: -
- Parameters: `person_id` (path, string)
- Success response: 200 SuccessResponse_PersonSnapshot_

### `GET /api/v1/public/research/context`

Get Public Research Context

Return the merged public context for the research portal.

REIRM has a public wing used for navigation and a hidden administrative
department used for richer editable content. This endpoint intentionally
merges both into one public-safe research context.

- Auth: public
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_PublicResearchContextPayload_

### `PATCH /api/v1/public/research/context`

Update Public Research Context

Edit the research wing and hidden/public research department context.

- Auth: StrictHTTPBearer
- Request body: ResearchContextUpdate
- Parameters: `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PublicResearchContextPayload_

### `GET /api/v1/public/schools/{school_id}/team`

Get Public School Team

- Auth: public
- Request body: -
- Parameters: `school_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_PublicSchoolTeamPayload_

### `POST /api/v1/public/schools/{school_slug}/inquiries`

Create Public School Inquiry

- Auth: public
- Request body: PublicEntityInquiryCreate
- Parameters: `school_slug` (path, string), `Idempotency-Key` (header, string)
- Success response: 201 SuccessResponse_PublicInquirySubmission_

### `GET /api/v1/public/team`

Get Public Team

- Auth: public
- Request body: -
- Parameters: `entity_type` (query, string), `entity_id` (query, string | null)
- Success response: 200 SuccessResponse_PublicTeamPayload_

### `GET /api/v1/public/team/academic-organization`

Get Public Academic Organization

- Auth: public
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_PublicAcademicOrganizationPayload_

## Realtime

### `GET /api/v1/realtime/metrics`

Get Realtime Metrics

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 RealtimeMetricsResponse

### `GET /api/v1/realtime/research/config`

Get Research Realtime Config

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 RealtimeConfigResponse

### `POST /api/v1/realtime/ticket`

Create Realtime Ticket

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 RealtimeTicketResponse

## Research

### `GET /api/v1/partners`

List Partners

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null)
- Success response: 200 SuccessResponse_list_PartnerListSnapshot__

### `GET /api/v1/partners/{slug}`

Get Partner

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 SuccessResponse_PartnerDetailSnapshot_

## School Portal

### `GET /api/v1/school-portal/audit`

List School Audit

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `action` (query, string | null), `resource_type` (query, string | null), `status` (query, string | null), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_AuditLogRead__

### `GET /api/v1/school-portal/capabilities`

Get Capabilities

Return the current school's permission and navigation capability map.

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolPortalCapabilitiesResponse_

### `GET /api/v1/school-portal/content`

List Content

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `content_type` (query, string | null), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_SchoolContentListItem__

### `POST /api/v1/school-portal/content`

Create Content

- Auth: StrictHTTPBearer
- Request body: SchoolContentCreate
- Parameters: `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_SchoolContentRecordSnapshot_

### `GET /api/v1/school-portal/content/{content_type}/{content_id}`

Get Content

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `content_type` (path, string), `content_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolContentRecordSnapshot_

### `PATCH /api/v1/school-portal/content/{content_type}/{content_id}`

Patch Content

- Auth: StrictHTTPBearer
- Request body: SchoolContentUpdate
- Parameters: `content_type` (path, string), `content_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolContentRecordSnapshot_

### `DELETE /api/v1/school-portal/content/{content_type}/{content_id}`

Delete Content

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `content_type` (path, string), `content_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/school-portal/content/{content_type}/{content_id}/submit`

Submit Content

- Auth: StrictHTTPBearer
- Request body: SchoolContentAction
- Parameters: `content_type` (path, string), `content_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolContentRecordSnapshot_

### `POST /api/v1/school-portal/content/{content_type}/{content_id}/withdraw`

Withdraw Content

- Auth: StrictHTTPBearer
- Request body: SchoolContentAction
- Parameters: `content_type` (path, string), `content_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolContentRecordSnapshot_

### `GET /api/v1/school-portal/context`

Get Context

Return the one school and capabilities derived from server-side grants.

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolPortalContextResponse_

### `GET /api/v1/school-portal/dashboard`

Get School Dashboard

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `range` (query, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolPortalDashboardResponse_

### `GET /api/v1/school-portal/departments`

List Departments

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `department_type` (query, string | null), `is_active` (query, boolean | null), `is_public` (query, boolean | null), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_DepartmentSnapshot__

### `POST /api/v1/school-portal/departments`

Post Department

- Auth: StrictHTTPBearer
- Request body: SchoolDepartmentCreate
- Parameters: `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_DepartmentSnapshot_

### `POST /api/v1/school-portal/departments/imports`

Commit Department Import

- Auth: StrictHTTPBearer
- Request body: SchoolAcademicImportRequest
- Parameters: `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ImportCommitRead_

### `POST /api/v1/school-portal/departments/imports/preview`

Preview Department Import

- Auth: StrictHTTPBearer
- Request body: SchoolAcademicImportRequest
- Parameters: `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ImportPreviewRead_

### `GET /api/v1/school-portal/departments/{department_id}`

Get Department

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `department_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_DepartmentSnapshot_

### `PATCH /api/v1/school-portal/departments/{department_id}`

Patch Department

- Auth: StrictHTTPBearer
- Request body: SchoolDepartmentUpdate
- Parameters: `department_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_DepartmentSnapshot_

### `DELETE /api/v1/school-portal/departments/{department_id}`

Delete Department

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `department_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/school-portal/inquiries`

List Inquiries

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `status` (query, string | null), `category` (query, string | null), `priority` (query, string | null), `assigned_to_user_id` (query, string | null), `created_from` (query, string | null), `created_to` (query, string | null), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_ContactInquiryRead__

### `GET /api/v1/school-portal/inquiries/{inquiry_id}`

Get Inquiry

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `inquiry_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ContactInquiryRead_

### `PATCH /api/v1/school-portal/inquiries/{inquiry_id}/assign`

Assign Inquiry

- Auth: StrictHTTPBearer
- Request body: InquiryAssign
- Parameters: `inquiry_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ContactInquiryRead_

### `POST /api/v1/school-portal/inquiries/{inquiry_id}/messages/{message_id}/retry`

Retry Inquiry Reply

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `inquiry_id` (path, string), `message_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ContactInquiryMessageRead_

### `POST /api/v1/school-portal/inquiries/{inquiry_id}/notes`

Add Inquiry Note

- Auth: StrictHTTPBearer
- Request body: InquiryNoteCreate
- Parameters: `inquiry_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ContactInquiryMessageRead_

### `POST /api/v1/school-portal/inquiries/{inquiry_id}/replies`

Reply To Inquiry

- Auth: StrictHTTPBearer
- Request body: InquiryReplyCreate
- Parameters: `inquiry_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ContactInquiryMessageRead_

### `PATCH /api/v1/school-portal/inquiries/{inquiry_id}/status`

Update Inquiry Status

- Auth: StrictHTTPBearer
- Request body: InquiryStatusUpdate
- Parameters: `inquiry_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ContactInquiryRead_

### `GET /api/v1/school-portal/integrations/{integration}/jobs/{job_id}`

Job Status

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `integration` (path, string), `job_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SyncJobPayload_

### `GET /api/v1/school-portal/integrations/{integration}/preview`

Preview

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `integration` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SyncEnvelope

### `POST /api/v1/school-portal/integrations/{integration}/trigger`

Trigger

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `integration` (path, string), `Idempotency-Key` (header, string | null), `X-Request-ID` (header, string | null), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 202 SuccessResponse_SyncJobPayload_

### `POST /api/v1/school-portal/media/batches`

Create Media Batch

- Auth: StrictHTTPBearer
- Request body: Body_create_media_batch_api_v1_school_portal_media_batches_post
- Parameters: `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_UploadBatchRead_

### `GET /api/v1/school-portal/media/batches/{batch_id}`

Get Media Batch

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `batch_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_UploadBatchRead_

### `POST /api/v1/school-portal/media/batches/{batch_id}/files/{file_id}/retry`

Retry Media File

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `batch_id` (path, string), `file_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_UploadBatchRead_

### `POST /api/v1/school-portal/media/content-imports`

Commit Content Metadata Import

- Auth: StrictHTTPBearer
- Request body: SchoolContentMetadataImport
- Parameters: `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolContentImportResponse_

### `POST /api/v1/school-portal/media/content-imports/preview`

Preview Content Metadata Import

- Auth: StrictHTTPBearer
- Request body: SchoolContentMetadataImport
- Parameters: `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolContentImportResponse_

### `PATCH /api/v1/school-portal/media/{media_id}`

Update School Media Metadata

- Auth: StrictHTTPBearer
- Request body: SchoolPortalMediaMetadataUpdate
- Parameters: `media_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolMediaSnapshot_

### `DELETE /api/v1/school-portal/media/{media_id}`

Delete School Media

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `media_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/school-portal/notifications`

List School Notifications

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `unread_only` (query, boolean), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_NotificationSnapshot__

### `POST /api/v1/school-portal/notifications/read-all`

Mark All School Notifications Read

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NotificationUpdateCount_

### `POST /api/v1/school-portal/notifications/{notification_id}/archive`

Archive School Notification

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `notification_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NotificationSnapshot_

### `PATCH /api/v1/school-portal/notifications/{notification_id}/read`

Mark School Notification Read

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `notification_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NotificationSnapshot_

### `GET /api/v1/school-portal/profile`

Get School Profile

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolPortalProfileResponse_

### `PATCH /api/v1/school-portal/profile`

Patch School Profile

- Auth: StrictHTTPBearer
- Request body: SchoolPortalProfileUpdate
- Parameters: `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolPortalProfileResponse_

### `PUT /api/v1/school-portal/profile/dean`

Put School Dean

- Auth: StrictHTTPBearer
- Request body: SchoolPortalDeanUpdate
- Parameters: `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolPortalProfileResponse_

### `POST /api/v1/school-portal/profile/media`

Post School Profile Media

- Auth: StrictHTTPBearer
- Request body: SchoolPortalMediaLinkCreate
- Parameters: `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolPortalProfileResponse_

### `DELETE /api/v1/school-portal/profile/media/{link_id}`

Delete School Profile Media

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `link_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolPortalProfileResponse_

### `GET /api/v1/school-portal/programmes`

List Programmes

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `department_id` (query, string | null), `level` (query, string | null), `mode_of_study` (query, string | null), `is_active` (query, boolean | null), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_ProgrammeSnapshot__

### `POST /api/v1/school-portal/programmes`

Post Programme

- Auth: StrictHTTPBearer
- Request body: SchoolProgrammeCreate
- Parameters: `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_ProgrammeSnapshot_

### `POST /api/v1/school-portal/programmes/imports`

Commit Programme Import

- Auth: StrictHTTPBearer
- Request body: SchoolAcademicImportRequest
- Parameters: `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ImportCommitRead_

### `POST /api/v1/school-portal/programmes/imports/preview`

Preview Programme Import

- Auth: StrictHTTPBearer
- Request body: SchoolAcademicImportRequest
- Parameters: `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ImportPreviewRead_

### `GET /api/v1/school-portal/programmes/{programme_id}`

Get Programme

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `programme_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ProgrammeSnapshot_

### `PATCH /api/v1/school-portal/programmes/{programme_id}`

Patch Programme

- Auth: StrictHTTPBearer
- Request body: SchoolProgrammeUpdate
- Parameters: `programme_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ProgrammeSnapshot_

### `DELETE /api/v1/school-portal/programmes/{programme_id}`

Delete Programme

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `programme_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/school-portal/publications`

List Publications

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `status` (query, string | null), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 ForwardedServiceResponse

### `POST /api/v1/school-portal/publications`

Create Publication

- Auth: StrictHTTPBearer
- Request body: SchoolPublicationCreate
- Parameters: `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 ForwardedServiceResponse

### `GET /api/v1/school-portal/publications/{publication_id}`

Get Publication

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `publication_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 ForwardedServiceResponse

### `PATCH /api/v1/school-portal/publications/{publication_id}`

Update Publication

- Auth: StrictHTTPBearer
- Request body: SchoolPublicationUpdate
- Parameters: `publication_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 ForwardedServiceResponse

### `POST /api/v1/school-portal/publications/{publication_id}/submit`

Submit Publication

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `publication_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 ForwardedServiceResponse

### `POST /api/v1/school-portal/publications/{publication_id}/withdraw`

Withdraw Publication

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `publication_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 ForwardedServiceResponse

### `GET /api/v1/school-portal/team`

Get Team

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `role` (query, string | null), `sort` (query, string), `order` (query, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_SchoolTeamAssignmentRead__

### `POST /api/v1/school-portal/team`

Post Team Member

- Auth: StrictHTTPBearer
- Request body: SchoolTeamMemberCreate
- Parameters: `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_SchoolTeamAssignmentRead_

### `POST /api/v1/school-portal/team/imports`

Queue Team Import

- Auth: StrictHTTPBearer
- Request body: SchoolTeamImportRequest
- Parameters: `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 202 SuccessResponse_SchoolTeamImportJobRead_

### `POST /api/v1/school-portal/team/imports/preview`

Preview Team Import

- Auth: StrictHTTPBearer
- Request body: Body_preview_team_import_api_v1_school_portal_team_imports_preview_post
- Parameters: `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ImportPreviewRead_

### `GET /api/v1/school-portal/team/imports/template`

Download Team Import Template

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `format` (query, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200

### `GET /api/v1/school-portal/team/person-options`

Get Team Person Options

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_SchoolTeamPersonOptionRead__

### `GET /api/v1/school-portal/team/{assignment_id}`

Get Team Member

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolTeamAssignmentRead_

### `PATCH /api/v1/school-portal/team/{assignment_id}`

Patch Team Member

- Auth: StrictHTTPBearer
- Request body: SchoolTeamMemberUpdate
- Parameters: `assignment_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolTeamAssignmentRead_

### `DELETE /api/v1/school-portal/team/{assignment_id}`

Delete Team Member

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/school-portal/team/{assignment_id}/activate`

Activate Team Member

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolTeamAssignmentRead_

### `POST /api/v1/school-portal/team/{assignment_id}/deactivate`

Deactivate Team Member

- Auth: StrictHTTPBearer
- Request body: SchoolTeamLifecycleRequest
- Parameters: `assignment_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolTeamAssignmentRead_

### `POST /api/v1/school-portal/team/{assignment_id}/end`

End Team Member

- Auth: StrictHTTPBearer
- Request body: SchoolTeamLifecycleRequest
- Parameters: `assignment_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolTeamAssignmentRead_

### `POST /api/v1/school-portal/team/{assignment_id}/resend-invite`

Resend Team Member Invite

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NoneType_

### `POST /api/v1/school-portal/team/{assignment_id}/revoke-access`

Revoke Team Member Access

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NoneType_

### `POST /api/v1/school-portal/team/{assignment_id}/transfer`

Transfer Team Member

- Auth: StrictHTTPBearer
- Request body: SchoolTeamTransferRequest
- Parameters: `assignment_id` (path, string), `X-School-ID` (header, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolTeamAssignmentRead_

## Search

### `GET /api/v1/search`

Search

- Auth: public
- Request body: -
- Parameters: `q` (query, string), `limit_per_type` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `news_fields` (query, string | null), `news_include` (query, string | null), `blogs_fields` (query, string | null), `blogs_include` (query, string | null), `announcements_fields` (query, string | null), `announcements_include` (query, string | null), `events_fields` (query, string | null), `events_include` (query, string | null), `persons_fields` (query, string | null), `persons_include` (query, string | null), `schools_fields` (query, string | null), `schools_include` (query, string | null), `departments_fields` (query, string | null), `departments_include` (query, string | null)
- Success response: 200 SuccessResponse_SearchResponse_

## Staff

### `GET /api/v1/staff/academic-ranks`

List Academic Ranks

List all academic ranks in order.

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_AcademicRankOption__

### `GET /api/v1/staff/assignments`

List Assignments

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `entity_type` (query, string | null), `entity_id` (query, string | null), `person_id` (query, string | null), `status` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_StaffAssignmentSnapshot__

### `POST /api/v1/staff/assignments`

Create Assignment

- Auth: StrictHTTPBearer
- Request body: StaffAssignmentCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_StaffAssignmentSnapshot_

### `POST /api/v1/staff/assignments/check-conflict`

Check Conflict

- Auth: StrictHTTPBearer
- Request body: StaffAssignmentConflictCheck
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_StaffConflictPayload_

### `GET /api/v1/staff/assignments/{assignment_id}`

Get Assignment

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_StaffAssignmentSnapshot_

### `PATCH /api/v1/staff/assignments/{assignment_id}`

Update Assignment

- Auth: StrictHTTPBearer
- Request body: StaffAssignmentUpdate
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_StaffAssignmentSnapshot_

### `DELETE /api/v1/staff/assignments/{assignment_id}`

Delete Assignment

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `PATCH /api/v1/staff/assignments/{assignment_id}/activate`

Activate Assignment

- Auth: StrictHTTPBearer
- Request body: StaffAssignmentActivate
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_StaffAssignmentSnapshot_

### `GET /api/v1/staff/assignments/{assignment_id}/direct-reports`

Get Direct Reports

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_StaffAssignmentSnapshot__

### `PATCH /api/v1/staff/assignments/{assignment_id}/end`

End Assignment

- Auth: StrictHTTPBearer
- Request body: StaffAssignmentEnd
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_StaffAssignmentSnapshot_

### `POST /api/v1/staff/assignments/{assignment_id}/reassign`

Reassign Assignment

- Auth: StrictHTTPBearer
- Request body: StaffAssignmentReassign
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_StaffAssignmentSnapshot_

### `GET /api/v1/staff/assignments/{assignment_id}/reporting-chain`

Get Reporting Chain

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_StaffAssignmentSnapshot__

### `GET /api/v1/staff/entities`

List Staff Entities

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `entity_type` (query, string), `search` (query, string | null), `limit` (query, integer), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_StaffEntityOption__

### `GET /api/v1/staff/entity-types`

List Entity Types

List all entity types with their available roles.

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_StaffEntityTypeOption__

### `GET /api/v1/staff/roles`

List Roles

List roles, optionally filtered by entity type.

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `entity_type` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_StaffRoleOption__

## Stats

### `GET /api/v1/stats`

Get Public Stats

- Auth: public
- Request body: -
- Parameters: `scope` (query, string), `slug` (query, string | null)
- Success response: 200 SuccessResponse_PublicStatsResponse_

### `GET /api/v1/stats/admin`

Get Admin Stats

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PublicStatsResponse_

### `GET /api/v1/stats/portal/corporate-communication/dashboard`

Get Corporate Communication Dashboard

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `date_from` (query, string | null), `date_to` (query, string | null), `compare` (query, string), `bucket` (query, string), `content_type` (query, string | null), `owner_portal` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CorporateDashboardResponse_

### `GET /api/v1/stats/portal/corporate-communication/dashboard/export`

Export Corporate Communication Dashboard

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `date_from` (query, string | null), `date_to` (query, string | null), `compare` (query, string), `bucket` (query, string), `content_type` (query, string | null), `owner_portal` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200

### `GET /api/v1/stats/portal/corporate-communication/engagement`

Get Corporate Communication Engagement

Website page-view and social delivery aggregates for the comms portal.

Website numbers come from the same first-party ``analytics_events`` table
the school portal dashboard reads, scoped to the main public site. Social
numbers are delivery outcomes only — see ``social_insights_available``.

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `date_from` (query, string | null), `date_to` (query, string | null), `top_limit` (query, integer), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_CorporateCommEngagementResponse_

### `GET /api/v1/stats/portal/{portal}`

Get Portal Stats

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `portal` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_PortalStatsResponse_

## Student Life

### `GET /api/v1/accommodations`

List Accommodations

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `campus_id` (query, string | null), `accommodation_type` (query, string | null), `gender` (query, string | null), `is_active` (query, boolean | null), `is_accepting_applications` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_AccommodationSnapshot__

### `POST /api/v1/accommodations`

Create Accommodation

- Auth: StrictHTTPBearer
- Request body: AccommodationCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_AccommodationSnapshot_

### `PATCH /api/v1/accommodations/{item_id}`

Update Accommodation

- Auth: StrictHTTPBearer
- Request body: AccommodationUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AccommodationSnapshot_

### `DELETE /api/v1/accommodations/{item_id}`

Delete Accommodation

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/accommodations/{slug}`

Get Accommodation

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_AccommodationSnapshot_

### `GET /api/v1/arts-culture`

List Arts Culture

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `category` (query, string | null), `school_id` (query, string | null), `club_id` (query, string | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_ArtsCultureSnapshot__

### `POST /api/v1/arts-culture`

Create Arts Culture

- Auth: StrictHTTPBearer
- Request body: ArtsCultureCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_ArtsCultureSnapshot_

### `PATCH /api/v1/arts-culture/{item_id}`

Update Arts Culture

- Auth: StrictHTTPBearer
- Request body: ArtsCultureUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ArtsCultureSnapshot_

### `DELETE /api/v1/arts-culture/{item_id}`

Delete Arts Culture

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/arts-culture/{slug}`

Get Arts Culture

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_ArtsCultureSnapshot_

### `GET /api/v1/campus-life/homepage`

Get Life Around Studies Homepage

Return the editorial composition plus live student-life highlights.

- Auth: public
- Request body: -
- Parameters: `audience` (query, string)
- Success response: 200 SuccessResponse_CampusLifeHomepageRead_

### `GET /api/v1/clubs`

List Clubs

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `club_type` (query, string | null), `school_id` (query, string | null), `department_id` (query, string | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_ClubSnapshot__

### `POST /api/v1/clubs`

Create Club

- Auth: StrictHTTPBearer
- Request body: ClubCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_ClubSnapshot_

### `PATCH /api/v1/clubs/activities/{activity_id}`

Update Club Activity

- Auth: StrictHTTPBearer
- Request body: ClubActivityUpdate
- Parameters: `activity_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ClubActivitySnapshot_

### `DELETE /api/v1/clubs/activities/{activity_id}`

Delete Club Activity

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `activity_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/clubs/activities/{activity_id}/workflow/{action}`

Transition Club Activity

- Auth: StrictHTTPBearer
- Request body: ContentWorkflowActionRequest
- Parameters: `activity_id` (path, string), `action` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ClubActivitySnapshot_

### `PATCH /api/v1/clubs/announcements/{announcement_id}`

Update Club Announcement

- Auth: StrictHTTPBearer
- Request body: AnnouncementUpdate
- Parameters: `announcement_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AnnouncementSnapshot_

### `DELETE /api/v1/clubs/announcements/{announcement_id}`

Delete Club Announcement

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `announcement_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/clubs/announcements/{announcement_id}/workflow/{action}`

Transition Club Announcement

- Auth: StrictHTTPBearer
- Request body: ContentWorkflowActionRequest
- Parameters: `announcement_id` (path, string), `action` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_AnnouncementSnapshot_

### `GET /api/v1/clubs/id/{club_id}/activities`

List Managed Club Activities

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_ClubActivitySnapshot__

### `POST /api/v1/clubs/id/{club_id}/activities`

Create Club Activity

- Auth: StrictHTTPBearer
- Request body: ClubActivityCreate
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_ClubActivitySnapshot_

### `GET /api/v1/clubs/id/{club_id}/announcements`

List Club Announcements

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_AnnouncementSnapshot__

### `POST /api/v1/clubs/id/{club_id}/announcements`

Create Club Announcement

- Auth: StrictHTTPBearer
- Request body: AnnouncementCreate
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_AnnouncementSnapshot_

### `GET /api/v1/clubs/id/{club_id}/leaders`

List Club Leaders

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_ClubLeaderRead__

### `GET /api/v1/clubs/id/{club_id}/media`

List Club Media

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_ClubMediaRead__

### `POST /api/v1/clubs/id/{club_id}/media`

Attach Club Media

- Auth: StrictHTTPBearer
- Request body: ClubMediaCreate
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_ClubMediaRead_

### `PATCH /api/v1/clubs/id/{club_id}/media/{link_id}`

Update Club Media

- Auth: StrictHTTPBearer
- Request body: ClubMediaUpdate
- Parameters: `link_id` (path, string), `club_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ClubMediaRead_

### `PATCH /api/v1/clubs/id/{club_id}/media/{link_id}/publication`

Set Club Media Publication

Compatibility wrapper that records publication changes through workflow logs.

- Auth: StrictHTTPBearer
- Request body: ClubMediaPublicationUpdate
- Parameters: `link_id` (path, string), `club_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ClubMediaRead_

### `POST /api/v1/clubs/id/{club_id}/media/{link_id}/workflow/{action}`

Transition Club Media

- Auth: StrictHTTPBearer
- Request body: ContentWorkflowActionRequest
- Parameters: `link_id` (path, string), `club_id` (path, string), `action` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ClubMediaRead_

### `GET /api/v1/clubs/id/{club_id}/stories`

List Club Stories

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_BlogSnapshot__

### `POST /api/v1/clubs/id/{club_id}/stories`

Create Club Story

- Auth: StrictHTTPBearer
- Request body: BlogCreate
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_BlogSnapshot_

### `GET /api/v1/clubs/managed`

List Managed Clubs

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `club_id` (query, string | null), `page` (query, integer), `per_page` (query, integer), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_ClubSnapshot__

### `GET /api/v1/clubs/review`

List Clubs For Review

List every club (public and hidden) for central CoCMS review.

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `club_type` (query, string | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_ClubSnapshot__

### `PATCH /api/v1/clubs/stories/{story_id}`

Update Club Story

- Auth: StrictHTTPBearer
- Request body: BlogUpdate
- Parameters: `story_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_BlogSnapshot_

### `DELETE /api/v1/clubs/stories/{story_id}`

Delete Club Story

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `story_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/clubs/stories/{story_id}/workflow/{action}`

Transition Club Story

- Auth: StrictHTTPBearer
- Request body: ContentWorkflowActionRequest
- Parameters: `story_id` (path, string), `action` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_BlogSnapshot_

### `PATCH /api/v1/clubs/{club_id}`

Update Club

- Auth: StrictHTTPBearer
- Request body: ClubUpdate
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ClubSnapshot_

### `DELETE /api/v1/clubs/{club_id}`

Delete Club

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/clubs/{slug}`

Get Club

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_ClubSnapshot_

### `GET /api/v1/clubs/{slug}/activities`

Get Club Activities

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_ClubActivitySnapshot__

### `GET /api/v1/sports-facilities`

List Sports Facilities

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `campus_id` (query, string | null), `facility_type` (query, string | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_SportsFacilitySnapshot__

### `POST /api/v1/sports-facilities`

Create Sports Facility

- Auth: StrictHTTPBearer
- Request body: SportsFacilityCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_SportsFacilitySnapshot_

### `PATCH /api/v1/sports-facilities/{item_id}`

Update Sports Facility

- Auth: StrictHTTPBearer
- Request body: SportsFacilityUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SportsFacilitySnapshot_

### `DELETE /api/v1/sports-facilities/{item_id}`

Delete Sports Facility

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/sports-facilities/{slug}`

Get Sports Facility

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_SportsFacilitySnapshot_

### `GET /api/v1/student-governance`

List Student Governance

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `governance_type` (query, string | null), `school_id` (query, string | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_StudentGovernanceSnapshot__

### `POST /api/v1/student-governance`

Create Student Governance

- Auth: StrictHTTPBearer
- Request body: StudentGovernanceCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_StudentGovernanceSnapshot_

### `PATCH /api/v1/student-governance/{item_id}`

Update Student Governance

- Auth: StrictHTTPBearer
- Request body: StudentGovernanceUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_StudentGovernanceSnapshot_

### `DELETE /api/v1/student-governance/{item_id}`

Delete Student Governance

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/student-governance/{slug}`

Get Student Governance

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_StudentGovernanceSnapshot_

## Support

### `GET /api/v1/contact-directory`

Get Public Contact Directory

- Auth: public
- Request body: -
- Parameters: `q` (query, string | null), `contact_type` (query, string | null), `scope_type` (query, string | null), `scope_id` (query, string | null), `page` (query, integer), `per_page` (query, integer)
- Success response: 200 SuccessResponse_PublicContactDirectorySnapshot_

### `GET /api/v1/contacts`

List Contacts

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `q` (query, string | null), `contact_type` (query, string | null), `sort` (query, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_ContactDirectorySnapshot__

### `POST /api/v1/contacts`

Create Contact

- Auth: StrictHTTPBearer
- Request body: ContactDirectoryCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_ContactDirectorySnapshot_

### `GET /api/v1/contacts/admin`

List Admin Contacts

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_public` (query, boolean | null), `is_main` (query, boolean | null), `status` (query, string | null), `q` (query, string | null), `contact_type` (query, string | null), `sort` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_ContactDirectorySnapshot__

### `GET /api/v1/contacts/admin/{contact_id}`

Get Admin Contact

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `contact_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ContactDirectorySnapshot_

### `POST /api/v1/contacts/admin/{contact_id}/archive`

Archive Contact

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `contact_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ContactDirectorySnapshot_

### `POST /api/v1/contacts/admin/{contact_id}/unarchive`

Unarchive Contact

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `contact_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ContactDirectorySnapshot_

### `GET /api/v1/contacts/owners`

List Contact Owners

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `scope_type` (query, string), `q` (query, string | null), `limit` (query, integer), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_ContactOwnerRead__

### `GET /api/v1/contacts/{contact_id}`

Get Contact

- Auth: public
- Request body: -
- Parameters: `contact_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_ContactDirectorySnapshot_

### `PATCH /api/v1/contacts/{contact_id}`

Update Contact

- Auth: StrictHTTPBearer
- Request body: ContactDirectoryUpdate
- Parameters: `contact_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ContactDirectorySnapshot_

### `GET /api/v1/faqs`

List Faqs

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_FAQSnapshot__

### `POST /api/v1/faqs`

Create Faq

- Auth: StrictHTTPBearer
- Request body: FAQCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_FAQSnapshot_

### `GET /api/v1/faqs/admin`

List Admin Faqs

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_FAQSnapshot__

### `GET /api/v1/faqs/admin/{faq_id}`

Get Admin Faq

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `faq_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_FAQSnapshot_

### `GET /api/v1/faqs/{faq_id}`

Get Faq

- Auth: public
- Request body: -
- Parameters: `faq_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_FAQSnapshot_

### `PATCH /api/v1/faqs/{faq_id}`

Update Faq

- Auth: StrictHTTPBearer
- Request body: FAQUpdate
- Parameters: `faq_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_FAQSnapshot_

### `DELETE /api/v1/faqs/{faq_id}`

Delete Faq

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `faq_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/support/tickets`

List Tickets

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `status` (query, string | null), `mine` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_SupportTicketSnapshot__

### `POST /api/v1/support/tickets`

Create Ticket

- Auth: StrictHTTPBearer
- Request body: SupportTicketCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_SupportTicketSnapshot_

### `GET /api/v1/support/tickets/{ticket_id}`

Get Ticket

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ticket_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SupportTicketSnapshot_

### `PATCH /api/v1/support/tickets/{ticket_id}`

Update Ticket

- Auth: StrictHTTPBearer
- Request body: SupportTicketUpdate
- Parameters: `ticket_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_SupportTicketSnapshot_

## System

### `GET /api/v1/settings`

List Public Settings

- Auth: public
- Request body: -
- Parameters: `category` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_list_PublicSettingSnapshot__

### `GET /api/v1/settings/public`

List Public Settings Authenticated

Public settings via API key authentication.

- Auth: public
- Request body: -
- Parameters: `category` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `X-API-Key` (header, string | null)
- Success response: 200 SuccessResponse_list_PublicSettingSnapshot__

## University

### `GET /api/v1/university-info`

Get University Info

- Auth: public
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_UniversityInfoSnapshot_

### `POST /api/v1/university-info`

Create University Info

- Auth: StrictHTTPBearer
- Request body: UniversityInfoCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_UniversityInfoSnapshot_

### `PATCH /api/v1/university-info/{item_id}`

Update University Info

- Auth: StrictHTTPBearer
- Request body: UniversityInfoUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_UniversityInfoSnapshot_

### `DELETE /api/v1/university-info/{item_id}`

Delete University Info

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/university-info/{slug}`

Get University Info By Slug

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 SuccessResponse_UniversityInfoSnapshot_

## Users

### `GET /api/v1/notifications`

List Notifications

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `unread_only` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_NotificationSnapshot__

### `GET /api/v1/notifications/preferences`

Get Notification Preferences

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NotificationPreferences_

### `PUT /api/v1/notifications/preferences`

Put Notification Preferences

- Auth: StrictHTTPBearer
- Request body: NotificationPreferences
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NotificationPreferences_

### `POST /api/v1/notifications/read-all`

Mark All Notifications Read

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_dict_str__int__

### `GET /api/v1/notifications/unread-count`

Unread Notification Count

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_dict_str__int__

### `DELETE /api/v1/notifications/{notification_id}`

Delete Notification

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `notification_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/notifications/{notification_id}/archive`

Archive Notification

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `notification_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NotificationSnapshot_

### `PATCH /api/v1/notifications/{notification_id}/read`

Mark Notification As Read

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `notification_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_NotificationSnapshot_

### `GET /api/v1/users`

List Users

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_UserSnapshot__

### `POST /api/v1/users`

Create User

- Auth: StrictHTTPBearer
- Request body: UserCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_UserSnapshot_

### `GET /api/v1/users/{user_id}`

Get User

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `user_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_UserSnapshot_

### `PATCH /api/v1/users/{user_id}`

Update User

- Auth: StrictHTTPBearer
- Request body: UserUpdate
- Parameters: `user_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_UserSnapshot_

### `DELETE /api/v1/users/{user_id}`

Delete User

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `user_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

## Vice Chancellor

### `GET /api/v1/public/vice-chancellor`

Get Public Hub

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 SuccessResponse_VcPublicHubResponse_

### `GET /api/v1/public/vice-chancellor/galleries/{slug}`

Get Public Gallery

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 SuccessResponse_VcPublicGalleryResponse_

### `GET /api/v1/public/vice-chancellor/speeches/{slug}`

Get Public Speech

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 SuccessResponse_VcPublicSpeechResponse_

### `GET /api/v1/vice-chancellor/galleries`

List Galleries

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_VcGalleryPage_

### `POST /api/v1/vice-chancellor/galleries`

Create Gallery

- Auth: StrictHTTPBearer
- Request body: VcGalleryAlbumCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_VcGalleryAlbumSnapshot_

### `POST /api/v1/vice-chancellor/galleries/{album_id}/media`

Attach Gallery Media

- Auth: StrictHTTPBearer
- Request body: VcGalleryMediaCreate
- Parameters: `album_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_VcGalleryMediaResponse_

### `GET /api/v1/vice-chancellor/galleries/{album_id}/media`

List Gallery Media

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `album_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_VcGalleryMediaResponse__

### `POST /api/v1/vice-chancellor/galleries/{album_id}/media/reorder`

Reorder Gallery Media

- Auth: StrictHTTPBearer
- Request body: VcReorderRequest
- Parameters: `album_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_bool_

### `DELETE /api/v1/vice-chancellor/galleries/{album_id}/media/{link_id}`

Detach Gallery Media

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `album_id` (path, string), `link_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `PATCH /api/v1/vice-chancellor/galleries/{record_id}`

Update Gallery

- Auth: StrictHTTPBearer
- Request body: VcGalleryAlbumUpdate
- Parameters: `record_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_VcGalleryAlbumSnapshot_

### `DELETE /api/v1/vice-chancellor/galleries/{record_id}`

Delete Gallery

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `record_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/vice-chancellor/hub`

Get Hub

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_VcHubSnapshot_

### `PATCH /api/v1/vice-chancellor/hub`

Update Hub

- Auth: StrictHTTPBearer
- Request body: VcHubUpdate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_VcHubSnapshot_

### `GET /api/v1/vice-chancellor/hub/portraits`

List Portraits

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_VcPortraitSnapshot__

### `POST /api/v1/vice-chancellor/hub/portraits`

Attach Portrait

- Auth: StrictHTTPBearer
- Request body: VcPortraitCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_VcPortraitSnapshot_

### `POST /api/v1/vice-chancellor/hub/portraits/reorder`

Reorder Portraits

- Auth: StrictHTTPBearer
- Request body: VcReorderRequest
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_bool_

### `PATCH /api/v1/vice-chancellor/hub/portraits/{portrait_id}`

Update Portrait

- Auth: StrictHTTPBearer
- Request body: VcPortraitUpdate
- Parameters: `portrait_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_VcPortraitSnapshot_

### `DELETE /api/v1/vice-chancellor/hub/portraits/{portrait_id}`

Detach Portrait

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `portrait_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/vice-chancellor/hub/portraits/{portrait_id}/select`

Select Portrait

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `portrait_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_VcPortraitSnapshot_

### `POST /api/v1/vice-chancellor/hub/{action}`

Transition Hub

- Auth: StrictHTTPBearer
- Request body: VcWorkflowAction
- Parameters: `action` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_VcHubSnapshot_

### `GET /api/v1/vice-chancellor/lookups/events`

Lookup Events

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `q` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_EventSnapshot__

### `GET /api/v1/vice-chancellor/lookups/news`

Lookup News

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `q` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_NewsSnapshot__

### `GET /api/v1/vice-chancellor/placements`

List Placements

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_VcHubPlacementSnapshot__

### `POST /api/v1/vice-chancellor/placements`

Create Placement

- Auth: StrictHTTPBearer
- Request body: VcHubPlacementCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_VcHubPlacementSnapshot_

### `POST /api/v1/vice-chancellor/placements/reorder`

Reorder Placements

- Auth: StrictHTTPBearer
- Request body: VcReorderRequest
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_bool_

### `PATCH /api/v1/vice-chancellor/placements/{record_id}`

Update Placement

- Auth: StrictHTTPBearer
- Request body: VcHubPlacementUpdate
- Parameters: `record_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_VcHubPlacementSnapshot_

### `DELETE /api/v1/vice-chancellor/placements/{record_id}`

Delete Placement

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `record_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/vice-chancellor/speeches`

List Speeches

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_VcSpeechPage_

### `POST /api/v1/vice-chancellor/speeches`

Create Speech

- Auth: StrictHTTPBearer
- Request body: VcSpeechCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_VcSpeechSnapshot_

### `PATCH /api/v1/vice-chancellor/speeches/{record_id}`

Update Speech

- Auth: StrictHTTPBearer
- Request body: VcSpeechUpdate
- Parameters: `record_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_VcSpeechSnapshot_

### `DELETE /api/v1/vice-chancellor/speeches/{record_id}`

Delete Speech

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `record_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/vice-chancellor/speeches/{speech_id}/videos`

Attach Speech Video

- Auth: StrictHTTPBearer
- Request body: VcSpeechVideoCreate
- Parameters: `speech_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_VcSpeechVideoResponse_

### `GET /api/v1/vice-chancellor/speeches/{speech_id}/videos`

List Speech Videos

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `speech_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_VcSpeechVideoResponse__

### `DELETE /api/v1/vice-chancellor/speeches/{speech_id}/videos/{link_id}`

Detach Speech Video

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `speech_id` (path, string), `link_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/vice-chancellor/videos`

List Videos

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_VcVideoPage_

### `POST /api/v1/vice-chancellor/videos`

Create Video

- Auth: StrictHTTPBearer
- Request body: VcVideoCreate
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 201 SuccessResponse_VcVideoSnapshot_

### `POST /api/v1/vice-chancellor/videos/youtube/preview`

Preview Youtube

- Auth: StrictHTTPBearer
- Request body: YouTubePreviewRequest
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_VcYouTubePreviewResponse_

### `PATCH /api/v1/vice-chancellor/videos/{record_id}`

Update Video

- Auth: StrictHTTPBearer
- Request body: VcVideoUpdate
- Parameters: `record_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_VcVideoSnapshot_

### `DELETE /api/v1/vice-chancellor/videos/{record_id}`

Delete Video

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `record_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/vice-chancellor/videos/{record_id}/refresh-metadata`

Refresh Video

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `record_id` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_VcVideoSnapshot_

### `POST /api/v1/vice-chancellor/{resource}/{record_id}/{action}`

Transition Content

- Auth: StrictHTTPBearer
- Request body: VcWorkflowAction
- Parameters: `resource` (path, string), `record_id` (path, string), `action` (path, string), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_VcWorkflowTransitionResponse_

## Workspaces

### `GET /api/v1/workspaces`

List Workspaces

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_list_WorkspaceContext__

### `POST /api/v1/workspaces/{workspace}/activate`

Activate Workspace

- Auth: StrictHTTPBearer
- Request body: WorkspaceVisit
- Parameters: `workspace` (path, Workspace), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ActivatedWorkspace_

### `GET /api/v1/workspaces/{workspace}/context`

Get Workspace Context

- Auth: StrictHTTPBearer
- Request body: -
- Parameters: `workspace` (path, Workspace), `scope_type` (query, string | null), `scope_id` (query, string | null), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_WorkspaceContext_

### `POST /api/v1/workspaces/{workspace}/exit`

Exit Workspace

- Auth: StrictHTTPBearer
- Request body: WorkspaceVisit
- Parameters: `workspace` (path, Workspace), `ksu_access` (cookie, string | null), `access_token` (cookie, string | null)
- Success response: 200 SuccessResponse_ActivatedWorkspace_

## Schemas

Generated component schemas: `867`

### `AboutPageContentCreate`

- `hero_eyebrow`: `string | null` (optional)
- `hero_headline`: `string | null` (optional)
- `hero_introduction`: `string | null` (optional)
- `hero_media_id`: `string | null` (optional)
- `history_document_id`: `string | null` (optional)
- `identity_heading`: `string | null` (optional)
- `identity_media_id`: `string | null` (optional)
- `identity_narrative`: `string | null` (optional)
- `is_enabled`: `boolean` (optional)
- `mandate_introduction`: `string | null` (optional)
- `modern_campus_media_id`: `string | null` (optional)
- `old_campus_media_id`: `string | null` (optional)
- `section_settings`: `object | null` (optional)
- `university_info_id`: `string` (required)
- `video_poster_media_id`: `string | null` (optional)
- `video_title`: `string | null` (optional)
- `video_transcript_url`: `string | null` (optional)
- `video_url`: `string | null` (optional)
- `virtual_tour_accessibility_url`: `string | null` (optional)
- `virtual_tour_media_id`: `string | null` (optional)
- `virtual_tour_poster_media_id`: `string | null` (optional)
- `virtual_tour_provider`: `string | null` (optional)
- `virtual_tour_title`: `string | null` (optional)
- `virtual_tour_type`: `string | null` (optional)
- `virtual_tour_url`: `string | null` (optional)

### `AboutPageContentSnapshot`

- `created_at`: `string | null` (optional)
- `hero_eyebrow`: `string | null` (optional)
- `hero_headline`: `string | null` (optional)
- `hero_introduction`: `string | null` (optional)
- `hero_media_id`: `string | null` (optional)
- `history_document_id`: `string | null` (optional)
- `id`: `string | null` (optional)
- `identity_heading`: `string | null` (optional)
- `identity_media_id`: `string | null` (optional)
- `identity_narrative`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `mandate_introduction`: `string | null` (optional)
- `modern_campus_media_id`: `string | null` (optional)
- `old_campus_media_id`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `section_settings`: `object | null` (optional)
- `status`: `string | null` (optional)
- `university_info_id`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `video_poster_media_id`: `string | null` (optional)
- `video_title`: `string | null` (optional)
- `video_transcript_url`: `string | null` (optional)
- `video_url`: `string | null` (optional)
- `virtual_tour_accessibility_url`: `string | null` (optional)
- `virtual_tour_media_id`: `string | null` (optional)
- `virtual_tour_poster_media_id`: `string | null` (optional)
- `virtual_tour_provider`: `string | null` (optional)
- `virtual_tour_title`: `string | null` (optional)
- `virtual_tour_type`: `string | null` (optional)
- `virtual_tour_url`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `AboutPageContentUpdate`

- `hero_eyebrow`: `string | null` (optional)
- `hero_headline`: `string | null` (optional)
- `hero_introduction`: `string | null` (optional)
- `hero_media_id`: `string | null` (optional)
- `history_document_id`: `string | null` (optional)
- `identity_heading`: `string | null` (optional)
- `identity_media_id`: `string | null` (optional)
- `identity_narrative`: `string | null` (optional)
- `is_enabled`: `boolean` (optional)
- `mandate_introduction`: `string | null` (optional)
- `modern_campus_media_id`: `string | null` (optional)
- `old_campus_media_id`: `string | null` (optional)
- `section_settings`: `object | null` (optional)
- `university_info_id`: `string | null` (optional)
- `video_poster_media_id`: `string | null` (optional)
- `video_title`: `string | null` (optional)
- `video_transcript_url`: `string | null` (optional)
- `video_url`: `string | null` (optional)
- `virtual_tour_accessibility_url`: `string | null` (optional)
- `virtual_tour_media_id`: `string | null` (optional)
- `virtual_tour_poster_media_id`: `string | null` (optional)
- `virtual_tour_provider`: `string | null` (optional)
- `virtual_tour_title`: `string | null` (optional)
- `virtual_tour_type`: `string | null` (optional)
- `virtual_tour_url`: `string | null` (optional)

### `AboutWorkflowAction`

- `action`: `string` (required)
- `reason`: `string | null` (optional)

### `AcademicCalendarComposition`

- `calendar`: `AcademicCalendarSnapshot` (required)
- `documents`: `array<AcademicCalendarDocumentSnapshot>` (required)
- `events`: `array<AcademicCalendarEventSnapshot>` (required)

### `AcademicCalendarCreate`

- `academic_year`: `string` (required)
- `end_date`: `string` (required)
- `events`: `array<object> | null` (optional)
- `exam_end`: `string | null` (optional)
- `exam_start`: `string | null` (optional)
- `holidays`: `array<object> | null` (optional)
- `late_registration_end`: `string | null` (optional)
- `registration_end`: `string | null` (optional)
- `registration_start`: `string | null` (optional)
- `results_release`: `string | null` (optional)
- `semester`: `integer` (required)
- `start_date`: `string` (required)
- `status`: `string` (optional)
- `teaching_end`: `string | null` (optional)
- `teaching_start`: `string | null` (optional)

### `AcademicCalendarDocumentCreate`

- `display_order`: `integer` (optional)
- `document_id`: `string` (required)
- `relationship_type`: `string` (optional)

### `AcademicCalendarDocumentSnapshot`

- `calendar_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `document`: `object | null` (optional)
- `document_id`: `string | null` (optional)
- `id`: `string | null` (optional)
- `relationship_type`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `AcademicCalendarEventCreate`

- `audience`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `document_id`: `string | null` (optional)
- `end_date`: `string | null` (optional)
- `event_type`: `string` (required)
- `is_highlighted`: `boolean` (optional)
- `location`: `string | null` (optional)
- `start_date`: `string` (required)
- `title`: `string` (required)

### `AcademicCalendarEventSnapshot`

- `archived_at`: `string | null` (optional)
- `audience`: `string | null` (optional)
- `calendar_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `document`: `object | null` (optional)
- `document_id`: `string | null` (optional)
- `end_date`: `string | null` (optional)
- `event_type`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_highlighted`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_published`: `boolean | null` (optional)
- `location`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `start_date`: `string | null` (optional)
- `status`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `AcademicCalendarEventUpdate`

- `audience`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `document_id`: `string | null` (optional)
- `end_date`: `string | null` (optional)
- `event_type`: `string | null` (optional)
- `is_highlighted`: `boolean | null` (optional)
- `location`: `string | null` (optional)
- `start_date`: `string | null` (optional)
- `title`: `string | null` (optional)

### `AcademicCalendarSnapshot`

- `academic_year`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `document_links`: `array<object> | null` (optional)
- `end_date`: `string | null` (optional)
- `events`: `array<object> | null` (optional)
- `exam_end`: `string | null` (optional)
- `exam_start`: `string | null` (optional)
- `holidays`: `array<object> | null` (optional)
- `id`: `string | null` (optional)
- `intakes`: `array<object> | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_published`: `boolean | null` (optional)
- `late_registration_end`: `string | null` (optional)
- `normalized_events`: `array<object> | null` (optional)
- `published_at`: `string | null` (optional)
- `registration_end`: `string | null` (optional)
- `registration_start`: `string | null` (optional)
- `results_release`: `string | null` (optional)
- `semester`: `integer | null` (optional)
- `start_date`: `string | null` (optional)
- `status`: `string | null` (optional)
- `supersedes_id`: `string | null` (optional)
- `teaching_end`: `string | null` (optional)
- `teaching_start`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `AcademicCalendarUpdate`

- `academic_year`: `string | null` (optional)
- `end_date`: `string | null` (optional)
- `events`: `array<object> | null` (optional)
- `exam_end`: `string | null` (optional)
- `exam_start`: `string | null` (optional)
- `holidays`: `array<object> | null` (optional)
- `late_registration_end`: `string | null` (optional)
- `registration_end`: `string | null` (optional)
- `registration_start`: `string | null` (optional)
- `results_release`: `string | null` (optional)
- `semester`: `integer | null` (optional)
- `start_date`: `string | null` (optional)
- `status`: `string | null` (optional)
- `teaching_end`: `string | null` (optional)
- `teaching_start`: `string | null` (optional)

### `AcademicRankOption`

- `label`: `string` (required)
- `order`: `integer` (required)
- `rank`: `string` (required)

### `AcademicTimetableCreate`

- `calendar_id`: `string` (required)
- `fallback_document_id`: `string | null` (optional)
- `notes`: `string | null` (optional)
- `supersedes_id`: `string | null` (optional)
- `timetable_type`: `string` (optional)
- `title`: `string` (required)
- `version`: `integer` (optional)

### `AcademicTimetableSnapshot`

- `archived_at`: `string | null` (optional)
- `calendar_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `fallback_document`: `object | null` (optional)
- `fallback_document_id`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_published`: `boolean | null` (optional)
- `notes`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `sittings`: `array<TimetableSittingRead> | null` (optional)
- `status`: `string | null` (optional)
- `supersedes_id`: `string | null` (optional)
- `timetable_type`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `version`: `integer | null` (optional)

### `AcademicTimetableUpdate`

- `fallback_document_id`: `string | null` (optional)
- `notes`: `string | null` (optional)
- `title`: `string | null` (optional)

### `AccommodationCreate`

- `about`: `string | null` (optional)
- `accommodation_type`: `string` (required)
- `amenities`: `array<string> | null` (optional)
- `campus_id`: `string` (required)
- `capacity`: `integer | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `email`: `string | null` (optional)
- `fee_per_semester`: `integer | null` (optional)
- `fee_per_year`: `integer | null` (optional)
- `gallery_images`: `array<string> | null` (optional)
- `gender`: `string` (required)
- `is_accepting_applications`: `boolean` (optional)
- `is_active`: `boolean` (optional)
- `name`: `string` (required)
- `phone`: `string | null` (optional)
- `rules`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `total_rooms`: `integer | null` (optional)
- `warden_id`: `string | null` (optional)

### `AccommodationSnapshot`

- `about`: `string | null` (optional)
- `accommodation_type`: `string | null` (optional)
- `amenities`: `array<string> | null` (optional)
- `campus`: `object | null` (optional)
- `campus_id`: `string | null` (optional)
- `capacity`: `integer | null` (optional)
- `cover_image`: `object | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `email`: `string | null` (optional)
- `fee_per_semester`: `integer | null` (optional)
- `fee_per_year`: `integer | null` (optional)
- `gallery_images`: `array<string> | null` (optional)
- `gender`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_accepting_applications`: `boolean | null` (optional)
- `is_active`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `rules`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `total_rooms`: `integer | null` (optional)
- `updated_at`: `string | null` (optional)
- `warden`: `object | null` (optional)
- `warden_id`: `string | null` (optional)

### `AccommodationUpdate`

- `about`: `string | null` (optional)
- `accommodation_type`: `string | null` (optional)
- `amenities`: `array<string> | null` (optional)
- `campus_id`: `string | null` (optional)
- `capacity`: `integer | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `email`: `string | null` (optional)
- `fee_per_semester`: `integer | null` (optional)
- `fee_per_year`: `integer | null` (optional)
- `gallery_images`: `array<string> | null` (optional)
- `gender`: `string | null` (optional)
- `is_accepting_applications`: `boolean | null` (optional)
- `is_active`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `rules`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `total_rooms`: `integer | null` (optional)
- `warden_id`: `string | null` (optional)

### `ActivatedWorkspace`

- `context`: `WorkspaceContext` (required)
- `visit_id`: `string` (required)

### `AdminActivityReport`

- `active_admins`: `integer` (required)
- `admin_events`: `integer` (required)
- `by_day`: `array<ReportSeriesPoint>` (required)
- `top_paths`: `array<ReportDimension>` (required)

### `AdmissionDocumentCreate`

- `applicant_type`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `document_type`: `string` (required)
- `expires_at`: `string | null` (optional)
- `external_url`: `string | null` (optional)
- `intake_id`: `string | null` (optional)
- `is_published`: `boolean` (optional)
- `media_id`: `string | null` (optional)
- `pathway_id`: `string | null` (optional)
- `programme_id`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)

### `AdmissionDocumentSnapshot`

- `applicant_type`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `document_type`: `string | null` (optional)
- `expires_at`: `string | null` (optional)
- `external_url`: `string | null` (optional)
- `id`: `string | null` (optional)
- `intake`: `object | null` (optional)
- `intake_id`: `string | null` (optional)
- `is_published`: `boolean | null` (optional)
- `media`: `object | null` (optional)
- `media_id`: `string | null` (optional)
- `pathway`: `object | null` (optional)
- `pathway_id`: `string | null` (optional)
- `programme`: `object | null` (optional)
- `programme_id`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `AdmissionDocumentUpdate`

- `applicant_type`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `document_type`: `string | null` (optional)
- `expires_at`: `string | null` (optional)
- `external_url`: `string | null` (optional)
- `intake_id`: `string | null` (optional)
- `is_published`: `boolean | null` (optional)
- `media_id`: `string | null` (optional)
- `pathway_id`: `string | null` (optional)
- `programme_id`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)

### `AdmissionFaqCreate`

- `answer`: `string` (required)
- `applicant_type`: `string | null` (optional)
- `category`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `is_published`: `boolean` (optional)
- `pathway_id`: `string | null` (optional)
- `question`: `string` (required)

### `AdmissionFaqSnapshot`

- `answer`: `string | null` (optional)
- `applicant_type`: `string | null` (optional)
- `category`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `id`: `string | null` (optional)
- `is_published`: `boolean | null` (optional)
- `pathway`: `object | null` (optional)
- `pathway_id`: `string | null` (optional)
- `question`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `AdmissionFaqUpdate`

- `answer`: `string | null` (optional)
- `applicant_type`: `string | null` (optional)
- `category`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `is_published`: `boolean | null` (optional)
- `pathway_id`: `string | null` (optional)
- `question`: `string | null` (optional)

### `AdmissionInfoCreate`

- `attachment_media_id`: `string | null` (optional)
- `audience_levels`: `array<string> | null` (optional)
- `content`: `string | null` (optional)
- `content_type`: `string` (required)
- `cover_image_id`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `external_url`: `string | null` (optional)
- `is_published`: `boolean` (optional)
- `school_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)

### `AdmissionInfoSnapshot`

- `attachment_media`: `object | null` (optional)
- `attachment_media_id`: `string | null` (optional)
- `audience_levels`: `array<string> | null` (optional)
- `content`: `string | null` (optional)
- `content_type`: `string | null` (optional)
- `cover_image`: `object | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `external_url`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_published`: `boolean | null` (optional)
- `school`: `object | null` (optional)
- `school_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `AdmissionInfoUpdate`

- `attachment_media_id`: `string | null` (optional)
- `audience_levels`: `array<string> | null` (optional)
- `content`: `string | null` (optional)
- `content_type`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `external_url`: `string | null` (optional)
- `is_published`: `boolean | null` (optional)
- `school_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)

### `AdmissionPageSectionCreate`

- `body`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `is_enabled`: `boolean` (optional)
- `items`: `array<object> | null` (optional)
- `layout_variant`: `string` (optional)
- `media_id`: `string | null` (optional)
- `page_key`: `string` (required)
- `section_key`: `string` (required)
- `settings`: `object | null` (optional)
- `subtitle`: `string | null` (optional)
- `title`: `string` (required)

### `AdmissionPageSectionSnapshot`

- `body`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `id`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `items`: `array<object> | null` (optional)
- `layout_variant`: `string | null` (optional)
- `media`: `object | null` (optional)
- `media_id`: `string | null` (optional)
- `page_key`: `string | null` (optional)
- `section_key`: `string | null` (optional)
- `settings`: `object | null` (optional)
- `subtitle`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `AdmissionPageSectionUpdate`

- `body`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `items`: `array<object> | null` (optional)
- `layout_variant`: `string | null` (optional)
- `media_id`: `string | null` (optional)
- `page_key`: `string | null` (optional)
- `section_key`: `string | null` (optional)
- `settings`: `object | null` (optional)
- `subtitle`: `string | null` (optional)
- `title`: `string | null` (optional)

### `AdmissionPathwayCreate`

- `applicant_type`: `string` (required)
- `application_steps`: `array<object> | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `cta_label`: `string | null` (optional)
- `cta_url`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `eligibility_notes`: `string | null` (optional)
- `is_published`: `boolean` (optional)
- `required_documents`: `array<object> | null` (optional)
- `slug`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)

### `AdmissionPathwaySnapshot`

- `applicant_type`: `string | null` (optional)
- `application_steps`: `array<object> | null` (optional)
- `cover_image`: `object | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `cta_label`: `string | null` (optional)
- `cta_url`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `eligibility_notes`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_published`: `boolean | null` (optional)
- `required_documents`: `array<object> | null` (optional)
- `slug`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `AdmissionPathwayUpdate`

- `applicant_type`: `string | null` (optional)
- `application_steps`: `array<object> | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `cta_label`: `string | null` (optional)
- `cta_url`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `eligibility_notes`: `string | null` (optional)
- `is_published`: `boolean | null` (optional)
- `required_documents`: `array<object> | null` (optional)
- `slug`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)

### `AdmissionRequirementCreate`

- `alternative_qualifications`: `array<object> | null` (optional)
- `applicant_type`: `string` (required)
- `display_order`: `integer` (optional)
- `documents_required`: `array<object> | null` (optional)
- `effective_from`: `string | null` (optional)
- `effective_to`: `string | null` (optional)
- `intake_id`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `level`: `string | null` (optional)
- `minimum_grade`: `string | null` (optional)
- `notes`: `string | null` (optional)
- `pathway_id`: `string | null` (optional)
- `programme_id`: `string | null` (optional)
- `school_id`: `string | null` (optional)
- `subject_requirements`: `array<object> | null` (optional)
- `title`: `string` (required)

### `AdmissionRequirementSnapshot`

- `alternative_qualifications`: `array<object> | null` (optional)
- `applicant_type`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `documents_required`: `array<object> | null` (optional)
- `effective_from`: `string | null` (optional)
- `effective_to`: `string | null` (optional)
- `id`: `string | null` (optional)
- `intake`: `object | null` (optional)
- `intake_id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `level`: `string | null` (optional)
- `minimum_grade`: `string | null` (optional)
- `notes`: `string | null` (optional)
- `pathway`: `object | null` (optional)
- `pathway_id`: `string | null` (optional)
- `programme`: `object | null` (optional)
- `programme_id`: `string | null` (optional)
- `school`: `object | null` (optional)
- `school_id`: `string | null` (optional)
- `subject_requirements`: `array<object> | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `AdmissionRequirementUpdate`

- `alternative_qualifications`: `array<object> | null` (optional)
- `applicant_type`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `documents_required`: `array<object> | null` (optional)
- `effective_from`: `string | null` (optional)
- `effective_to`: `string | null` (optional)
- `intake_id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `level`: `string | null` (optional)
- `minimum_grade`: `string | null` (optional)
- `notes`: `string | null` (optional)
- `pathway_id`: `string | null` (optional)
- `programme_id`: `string | null` (optional)
- `school_id`: `string | null` (optional)
- `subject_requirements`: `array<object> | null` (optional)
- `title`: `string | null` (optional)

### `AlumniAssociationCreate`

- `about`: `string | null` (optional)
- `acronym`: `string | null` (optional)
- `association_type`: `string` (required)
- `chairperson_id`: `string | null` (optional)
- `email`: `string | null` (optional)
- `established_date`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `logo_id`: `string | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string` (required)
- `objectives`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `region`: `string | null` (optional)
- `school_id`: `string | null` (optional)
- `secretary_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `social_media`: `object | null` (optional)

### `AlumniAssociationMemberCreate`

- `alumni_id`: `string` (required)
- `is_active`: `boolean` (optional)
- `joined_at`: `string` (required)
- `left_at`: `string | null` (optional)
- `position`: `string | null` (optional)
- `role`: `string` (optional)

### `AlumniAssociationMemberRead`

- `alumni`: `object | null` (optional)
- `alumni_id`: `string` (required)
- `association`: `object | null` (optional)
- `association_id`: `string` (required)
- `created_at`: `string` (required)
- `id`: `string` (required)
- `is_active`: `boolean` (required)
- `joined_at`: `string` (required)
- `left_at`: `string | null` (optional)
- `position`: `string | null` (optional)
- `role`: `string` (required)
- `updated_at`: `string` (required)

### `AlumniAssociationMemberSnapshot`

- `alumni`: `object | null` (optional)
- `alumni_id`: `string | null` (optional)
- `association`: `object | null` (optional)
- `association_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `joined_at`: `string | null` (optional)
- `left_at`: `string | null` (optional)
- `position`: `string | null` (optional)
- `role`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `AlumniAssociationSnapshot`

- `about`: `string | null` (optional)
- `acronym`: `string | null` (optional)
- `association_type`: `string | null` (optional)
- `chairperson`: `object | null` (optional)
- `chairperson_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `email`: `string | null` (optional)
- `established_date`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `logo`: `object | null` (optional)
- `logo_id`: `string | null` (optional)
- `members`: `array<AlumniAssociationMemberRead> | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string | null` (optional)
- `objectives`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `region`: `string | null` (optional)
- `school`: `object | null` (optional)
- `school_id`: `string | null` (optional)
- `secretary`: `object | null` (optional)
- `secretary_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `social_media`: `object | null` (optional)
- `updated_at`: `string | null` (optional)

### `AlumniAssociationUpdate`

- `about`: `string | null` (optional)
- `acronym`: `string | null` (optional)
- `association_type`: `string | null` (optional)
- `chairperson_id`: `string | null` (optional)
- `email`: `string | null` (optional)
- `established_date`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `logo_id`: `string | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string | null` (optional)
- `objectives`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `region`: `string | null` (optional)
- `school_id`: `string | null` (optional)
- `secretary_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `social_media`: `object | null` (optional)

### `AlumniCreate`

- `achievements`: `string | null` (optional)
- `bio`: `string | null` (optional)
- `current_employer`: `string | null` (optional)
- `current_position`: `string | null` (optional)
- `degree_classification`: `string | null` (optional)
- `graduation_year`: `integer` (required)
- `industry`: `string | null` (optional)
- `is_mentor_available`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `is_verified`: `boolean` (optional)
- `linkedin_url`: `string | null` (optional)
- `location_city`: `string | null` (optional)
- `location_country`: `string | null` (optional)
- `mentor_areas`: `array<string> | null` (optional)
- `person_id`: `string` (required)
- `programme_id`: `string | null` (optional)
- `school_id`: `string | null` (optional)
- `show_contact`: `boolean` (optional)
- `student_number`: `string | null` (optional)
- `verified_at`: `string | null` (optional)
- `website`: `string | null` (optional)

### `AlumniSnapshot`

- `achievements`: `string | null` (optional)
- `association_memberships`: `array<object> | null` (optional)
- `bio`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `current_employer`: `string | null` (optional)
- `current_position`: `string | null` (optional)
- `degree_classification`: `string | null` (optional)
- `graduation_year`: `integer | null` (optional)
- `id`: `string | null` (optional)
- `industry`: `string | null` (optional)
- `is_mentor_available`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_verified`: `boolean | null` (optional)
- `linkedin_url`: `string | null` (optional)
- `location_city`: `string | null` (optional)
- `location_country`: `string | null` (optional)
- `mentor_areas`: `array<string> | null` (optional)
- `person`: `object | null` (optional)
- `person_id`: `string | null` (optional)
- `programme`: `object | null` (optional)
- `programme_id`: `string | null` (optional)
- `school`: `object | null` (optional)
- `school_id`: `string | null` (optional)
- `show_contact`: `boolean | null` (optional)
- `student_number`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `verified_at`: `string | null` (optional)
- `website`: `string | null` (optional)

### `AlumniUpdate`

- `achievements`: `string | null` (optional)
- `bio`: `string | null` (optional)
- `current_employer`: `string | null` (optional)
- `current_position`: `string | null` (optional)
- `degree_classification`: `string | null` (optional)
- `graduation_year`: `integer | null` (optional)
- `industry`: `string | null` (optional)
- `is_mentor_available`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_verified`: `boolean | null` (optional)
- `linkedin_url`: `string | null` (optional)
- `location_city`: `string | null` (optional)
- `location_country`: `string | null` (optional)
- `mentor_areas`: `array<string> | null` (optional)
- `programme_id`: `string | null` (optional)
- `school_id`: `string | null` (optional)
- `show_contact`: `boolean | null` (optional)
- `student_number`: `string | null` (optional)
- `verified_at`: `string | null` (optional)
- `website`: `string | null` (optional)

### `AnalyticsEventBatchCreate`

- `events`: `array<AnalyticsEventCreate>` (required)

### `AnalyticsEventCreate`

- `browser`: `string | null` (optional)
- `country_code`: `string | null` (optional)
- `device_type`: `string | null` (optional)
- `entity_id`: `string | null` (optional)
- `entity_slug`: `string | null` (optional)
- `entity_title`: `string | null` (optional)
- `entity_type`: `string | null` (optional)
- `event_metadata`: `object | null` (optional)
- `event_type`: `string` (required)
- `occurred_at`: `string | null` (optional)
- `os`: `string | null` (optional)
- `path`: `string` (required)
- `referrer`: `string | null` (optional)
- `referrer_host`: `string | null` (optional)
- `session_hash`: `string | null` (optional)
- `source_app`: `string` (required)
- `user_agent`: `string | null` (optional)

### `AnnouncementCreate`

- `audience`: `string` (optional)
- `category`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `featured_media_id`: `string | null` (optional)
- `is_main`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `priority`: `string` (optional)
- `related_links`: `array<object> | null` (optional)
- `rich_text`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string` (required)
- `structured_content`: `object | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)
- `youtube_url`: `string | null` (optional)

### `AnnouncementSnapshot`

- `approved_at`: `string | null` (optional)
- `approved_by_id`: `string | null` (optional)
- `archived_at`: `string | null` (optional)
- `audience`: `string | null` (optional)
- `author`: `object | null` (optional)
- `author_user_id`: `string | null` (optional)
- `category`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `expires_at`: `string | null` (optional)
- `featured_media`: `object | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_published`: `boolean | null` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `owner_portal`: `string | null` (optional)
- `owner_scope_id`: `string | null` (optional)
- `owner_scope_type`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `priority`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `published_by_id`: `string | null` (optional)
- `rejection_reason`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `reviewed_at`: `string | null` (optional)
- `reviewed_by_id`: `string | null` (optional)
- `revision_notes`: `string | null` (optional)
- `rich_text`: `string | null` (optional)
- `scheduled_publish_at`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `structured_content`: `object | null` (optional)
- `submitted_at`: `string | null` (optional)
- `submitted_by_id`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `unpublished_at`: `string | null` (optional)
- `unpublished_by_id`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `updated_by`: `object | null` (optional)
- `updated_by_id`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)
- `youtube_url`: `string | null` (optional)

### `AnnouncementUpdate`

- `audience`: `string | null` (optional)
- `category`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `is_main`: `boolean | null` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `priority`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `rich_text`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `structured_content`: `object | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)
- `youtube_url`: `string | null` (optional)

### `ApiKeyCreate`

- `description`: `string | null` (optional)
- `expires_at`: `string | null` (optional)
- `name`: `string` (required)
- `rate_limit`: `integer` (optional)
- `scopes`: `array<string>` (required)

### `ApiKeyCreateEnvelope`

- `api_key`: `string` (required)
- `record`: `ApiKeySnapshot` (required)

### `ApiKeySnapshot`

- `created_at`: `string | null` (optional)
- `created_by`: `object | null` (optional)
- `created_by_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `expires_at`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `last_used_at`: `string | null` (optional)
- `name`: `string | null` (optional)
- `rate_limit`: `integer | null` (optional)
- `scopes`: `array<string> | null` (optional)
- `updated_at`: `string | null` (optional)

### `ApiKeyUpdate`

- `description`: `string | null` (optional)
- `expires_at`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `rate_limit`: `integer | null` (optional)
- `scopes`: `array<string> | null` (optional)

### `ArtsCultureCreate`

- `about`: `string | null` (optional)
- `category`: `string` (required)
- `club_id`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `school_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `title`: `string` (required)

### `ArtsCultureSnapshot`

- `about`: `string | null` (optional)
- `category`: `string | null` (optional)
- `club`: `object | null` (optional)
- `club_id`: `string | null` (optional)
- `cover_image`: `object | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `school`: `object | null` (optional)
- `school_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `ArtsCultureUpdate`

- `about`: `string | null` (optional)
- `category`: `string | null` (optional)
- `club_id`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `school_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `title`: `string | null` (optional)

### `AssuranceResponse`

- `verified_at`: `string` (required)

### `AuditLogRead`

- `action`: `string` (required)
- `changes`: `object | null` (optional)
- `created_at`: `string` (required)
- `deleted_at`: `string | null` (optional)
- `details`: `object | null` (optional)
- `error_message`: `string | null` (optional)
- `happened_at`: `string` (required)
- `id`: `string` (required)
- `ip_address`: `string | null` (optional)
- `request_method`: `string` (required)
- `request_path`: `string` (required)
- `resource_id`: `string | null` (optional)
- `resource_type`: `string | null` (optional)
- `route_name`: `string | null` (optional)
- `service_name`: `string` (required)
- `session_jti`: `string | null` (optional)
- `status`: `string` (required)
- `status_code`: `integer` (required)
- `updated_at`: `string` (required)
- `user_agent`: `string | null` (optional)
- `user_id`: `string | null` (optional)

### `AuthUserResponse`

- `avatar_url`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `email`: `string | null` (optional)
- `email_verified_at`: `string | null` (optional)
- `failed_login_attempts`: `integer | null` (optional)
- `full_name`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_verified`: `boolean | null` (optional)
- `last_login_at`: `string | null` (optional)
- `locked_until`: `string | null` (optional)
- `must_change_password`: `boolean | null` (optional)
- `permissions`: `array<string> | null` (optional)
- `person_id`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `push_tokens`: `array<string> | null` (optional)
- `roles`: `array<string> | null` (optional)
- `service_memberships`: `array<string> | null` (optional)
- `updated_at`: `string | null` (optional)

### `BlogCreate`

- `display_order`: `integer` (optional)
- `excerpt`: `string | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `is_featured`: `boolean` (optional)
- `is_main`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `rich_text`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string` (required)
- `structured_content`: `object | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)

### `BlogSnapshot`

- `approved_at`: `string | null` (optional)
- `approved_by_id`: `string | null` (optional)
- `archived_at`: `string | null` (optional)
- `author`: `object | null` (optional)
- `author_user_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `excerpt`: `string | null` (optional)
- `expires_at`: `string | null` (optional)
- `featured_media`: `object | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_published`: `boolean | null` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `owner_portal`: `string | null` (optional)
- `owner_scope_id`: `string | null` (optional)
- `owner_scope_type`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `published_by_id`: `string | null` (optional)
- `rejection_reason`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `reviewed_at`: `string | null` (optional)
- `reviewed_by_id`: `string | null` (optional)
- `revision_notes`: `string | null` (optional)
- `rich_text`: `string | null` (optional)
- `scheduled_publish_at`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `structured_content`: `object | null` (optional)
- `submitted_at`: `string | null` (optional)
- `submitted_by_id`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `unpublished_at`: `string | null` (optional)
- `unpublished_by_id`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `updated_by`: `object | null` (optional)
- `updated_by_id`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `BlogUpdate`

- `display_order`: `integer | null` (optional)
- `excerpt`: `string | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_main`: `boolean | null` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `rich_text`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `structured_content`: `object | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)

### `BoardCreate`

- `board_type`: `string` (optional)
- `chairperson_id`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `division_id`: `string | null` (optional)
- `establishment_date`: `string | null` (optional)
- `head_message`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `mandate`: `string | null` (optional)
- `max_terms`: `integer | null` (optional)
- `meeting_schedule`: `string | null` (optional)
- `member_count`: `integer | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string` (required)
- `parent_entity_id`: `string | null` (optional)
- `parent_entity_type`: `string | null` (optional)
- `quorum`: `integer | null` (optional)
- `secretary_id`: `string | null` (optional)
- `show_member_terms`: `boolean` (optional)
- `slug`: `string` (required)
- `standard_term_years`: `integer | null` (optional)
- `status`: `string` (optional)
- `vice_chairperson_id`: `string | null` (optional)
- `vision`: `string | null` (optional)

### `BoardMemberCreate`

- `display_order`: `integer` (optional)
- `end_date`: `string | null` (optional)
- `hierarchy_level`: `integer | null` (optional)
- `is_acting`: `boolean` (optional)
- `is_primary`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `notes`: `string | null` (optional)
- `person_id`: `string` (required)
- `reports_to_id`: `string | null` (optional)
- `role`: `string` (optional)
- `show_term_dates`: `boolean` (optional)
- `start_date`: `string | null` (optional)
- `status`: `string` (optional)
- `term_renewable`: `boolean` (optional)
- `term_years`: `integer | null` (optional)
- `title`: `string | null` (optional)

### `BoardMemberRead`

- `display_label`: `string` (required)
- `display_order`: `integer` (required)
- `hierarchy_level`: `integer` (required)
- `id`: `string` (required)
- `is_acting`: `boolean` (required)
- `reports_to`: `BoardMemberSummary | null` (optional)
- `role`: `string` (required)
- `role_label`: `string` (required)
- `title`: `string | null` (optional)

### `BoardMemberSnapshot`

- `display_label`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `hierarchy_level`: `integer | null` (optional)
- `id`: `string | null` (optional)
- `is_acting`: `boolean | null` (optional)
- `reports_to`: `BoardMemberSummary | null` (optional)
- `role`: `string | null` (optional)
- `role_label`: `string | null` (optional)
- `title`: `string | null` (optional)

### `BoardMemberSummary`

- `display_label`: `string` (required)
- `id`: `string` (required)
- `role_label`: `string` (required)

### `BoardSnapshot`

- `board_type`: `string | null` (optional)
- `chairperson`: `object | null` (optional)
- `chairperson_id`: `string | null` (optional)
- `cover_image`: `object | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_label`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `division`: `object | null` (optional)
- `division_id`: `string | null` (optional)
- `establishment_date`: `string | null` (optional)
- `head_message`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `mandate`: `string | null` (optional)
- `max_terms`: `integer | null` (optional)
- `meeting_schedule`: `string | null` (optional)
- `member_count`: `integer | null` (optional)
- `members`: `array<BoardMemberRead> | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string | null` (optional)
- `parent_entity_id`: `string | null` (optional)
- `parent_entity_type`: `string | null` (optional)
- `quorum`: `integer | null` (optional)
- `secretary`: `object | null` (optional)
- `secretary_id`: `string | null` (optional)
- `show_member_terms`: `boolean | null` (optional)
- `slug`: `string | null` (optional)
- `standard_term_years`: `integer | null` (optional)
- `status`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `vice_chairperson`: `object | null` (optional)
- `vice_chairperson_id`: `string | null` (optional)
- `vision`: `string | null` (optional)

### `BoardUpdate`

- `board_type`: `string | null` (optional)
- `chairperson_id`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `division_id`: `string | null` (optional)
- `establishment_date`: `string | null` (optional)
- `head_message`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `mandate`: `string | null` (optional)
- `max_terms`: `integer | null` (optional)
- `meeting_schedule`: `string | null` (optional)
- `member_count`: `integer | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string | null` (optional)
- `parent_entity_id`: `string | null` (optional)
- `parent_entity_type`: `string | null` (optional)
- `quorum`: `integer | null` (optional)
- `secretary_id`: `string | null` (optional)
- `show_member_terms`: `boolean | null` (optional)
- `slug`: `string | null` (optional)
- `standard_term_years`: `integer | null` (optional)
- `status`: `string | null` (optional)
- `vice_chairperson_id`: `string | null` (optional)
- `vision`: `string | null` (optional)

### `Body_create_media_batch_api_v1_corporate_communication_portal_media_batches_post`

- `files`: `array<string>` (required)
- `folder_id`: `string | null` (optional)
- `is_public`: `boolean` (optional)

### `Body_create_media_batch_api_v1_school_portal_media_batches_post`

- `files`: `array<string>` (required)
- `target_entity_id`: `string | null` (optional)
- `target_entity_type`: `string | null` (optional)
- `target_role`: `string` (optional)

### `Body_preview_import_api_v1_imports__resource_key__preview_post`

- `file`: `string` (required)

### `Body_preview_team_import_api_v1_school_portal_team_imports_preview_post`

- `file`: `string` (required)

### `Body_upload_media_api_v1_media_upload_post`

- `entity_id`: `string | null` (optional)
- `entity_type`: `string | null` (optional)
- `file`: `string` (required)
- `folder_id`: `string | null` (optional)
- `is_public`: `boolean` (optional)
- `role`: `string | null` (optional)

### `Body_upload_person_cv_api_v1_persons__person_id__cv_post`

- `file`: `string` (required)

### `Body_upload_person_photo_api_v1_persons__person_id__photo_post`

- `file`: `string` (required)

### `BulkSettingUpdateItem`

- `key`: `string` (required)
- `value`: `object` (required)

### `BulkSettingsUpdatePayload`

- `settings`: `array<BulkSettingUpdateItem>` (optional)

### `BulkWorkflowItem`

- `content_id`: `string` (required)
- `content_type`: `string` (required)

### `BulkWorkflowRequest`

- `action`: `string` (required)
- `comments`: `string | null` (optional)
- `items`: `array<BulkWorkflowItem>` (required)

### `BulkWorkflowResult`

- `content_id`: `string` (required)
- `error`: `string | null` (optional)
- `ok`: `boolean` (required)

### `CampusCreate`

- `address`: `string | null` (optional)
- `campus_type`: `string` (optional)
- `city`: `string | null` (optional)
- `code`: `string` (required)
- `county`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `email`: `string | null` (optional)
- `gps_latitude`: `number | null` (optional)
- `gps_longitude`: `number | null` (optional)
- `is_active`: `boolean` (optional)
- `name`: `string` (required)
- `phone`: `string | null` (optional)
- `postal_code`: `string | null` (optional)
- `slug`: `string` (required)

### `CampusLifeActivityRead`

- `activity_type`: `string` (required)
- `club`: `object | null` (optional)
- `cover_image`: `CampusLifeMediaRead | null` (optional)
- `description`: `string | null` (optional)
- `end_datetime`: `string | null` (optional)
- `id`: `string` (required)
- `location`: `string | null` (optional)
- `start_datetime`: `string` (required)
- `title`: `string` (required)

### `CampusLifeContactRead`

- `building`: `string | null` (optional)
- `contact_type`: `string` (required)
- `email`: `string | null` (optional)
- `id`: `string` (required)
- `name`: `string` (required)
- `phone`: `string | null` (optional)
- `room_number`: `string | null` (optional)

### `CampusLifeFaqRead`

- `answer`: `string | null` (optional)
- `category`: `string | null` (optional)
- `id`: `string` (required)
- `question`: `string` (required)

### `CampusLifeHomepageRead`

- `accommodation`: `array<CampusLifeRecordRead>` (optional)
- `activities`: `array<CampusLifeActivityRead>` (optional)
- `arts`: `array<CampusLifeRecordRead>` (optional)
- `clubs`: `array<CampusLifeRecordRead>` (optional)
- `contacts`: `array<CampusLifeContactRead>` (optional)
- `faqs`: `array<CampusLifeFaqRead>` (optional)
- `governance`: `array<CampusLifeRecordRead>` (optional)
- `section`: `CampusLifeSectionRead` (required)
- `sports`: `array<CampusLifeRecordRead>` (optional)
- `stats`: `CampusLifeStatsRead` (required)

### `CampusLifeMediaRead`

- `alt_text`: `string | null` (optional)
- `caption`: `string | null` (optional)
- `cdn_url`: `string | null` (optional)
- `id`: `string` (required)
- `public_url`: `string | null` (optional)
- `thumbnail_url`: `string | null` (optional)
- `title`: `string | null` (optional)
- `url`: `string | null` (optional)

### `CampusLifeRecordRead`

- `accommodation_type`: `string | null` (optional)
- `acronym`: `string | null` (optional)
- `capacity`: `integer | null` (optional)
- `category`: `string | null` (optional)
- `club_type`: `string | null` (optional)
- `cover_image`: `CampusLifeMediaRead | null` (optional)
- `description`: `string | null` (optional)
- `email`: `string | null` (optional)
- `facility_type`: `string | null` (optional)
- `gender`: `string | null` (optional)
- `governance_type`: `string | null` (optional)
- `href`: `string | null` (optional)
- `id`: `string` (required)
- `is_accepting_applications`: `boolean | null` (optional)
- `is_active`: `boolean` (optional)
- `location`: `string | null` (optional)
- `meeting_schedule`: `string | null` (optional)
- `membership_count`: `integer | null` (optional)
- `name`: `string | null` (optional)
- `office_location`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `sport_types`: `array<string> | null` (optional)
- `term_end`: `string | null` (optional)
- `term_start`: `string | null` (optional)

### `CampusLifeSectionRead`

- `description`: `string | null` (optional)
- `items`: `array<object>` (optional)
- `section_key`: `string` (required)
- `subtitle`: `string | null` (optional)
- `title`: `string | null` (optional)

### `CampusLifeStatsRead`

- `accommodation`: `integer` (required)
- `arts`: `integer` (required)
- `clubs`: `integer` (required)
- `governance`: `integer` (required)
- `sports`: `integer` (required)

### `CampusSnapshot`

- `address`: `string | null` (optional)
- `campus_type`: `string | null` (optional)
- `city`: `string | null` (optional)
- `code`: `string | null` (optional)
- `county`: `string | null` (optional)
- `cover_image`: `object | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `email`: `string | null` (optional)
- `gps_latitude`: `number | null` (optional)
- `gps_longitude`: `number | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `postal_code`: `string | null` (optional)
- `schools`: `array<object> | null` (optional)
- `slug`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `CampusUpdate`

- `address`: `string | null` (optional)
- `campus_type`: `string | null` (optional)
- `city`: `string | null` (optional)
- `code`: `string | null` (optional)
- `county`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `email`: `string | null` (optional)
- `gps_latitude`: `number | null` (optional)
- `gps_longitude`: `number | null` (optional)
- `is_active`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `postal_code`: `string | null` (optional)
- `slug`: `string | null` (optional)

### `ChangePasswordRequest`

- `new_password`: `string` (required)
- `old_password`: `string` (required)

### `ClubActivityCreate`

- `activity_type`: `string` (required)
- `cover_image_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `end_datetime`: `string | null` (optional)
- `is_virtual`: `boolean` (optional)
- `location`: `string | null` (optional)
- `meeting_link`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `start_datetime`: `string` (required)
- `title`: `string` (required)

### `ClubActivityRead`

- `activity_type`: `string` (required)
- `approved_at`: `string | null` (optional)
- `author_user_id`: `string | null` (optional)
- `club`: `object | null` (optional)
- `club_id`: `string` (required)
- `cover_image`: `object | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string` (required)
- `description`: `string | null` (optional)
- `end_datetime`: `string | null` (optional)
- `id`: `string` (required)
- `is_public`: `boolean` (required)
- `is_published`: `boolean` (required)
- `is_virtual`: `boolean` (required)
- `location`: `string | null` (optional)
- `meeting_link`: `string | null` (optional)
- `owner_portal`: `string | null` (optional)
- `owner_scope_id`: `string | null` (optional)
- `owner_scope_type`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `slug`: `string` (required)
- `start_datetime`: `string` (required)
- `status`: `string` (required)
- `submitted_at`: `string | null` (optional)
- `title`: `string` (required)
- `updated_at`: `string` (required)
- `workflow_status`: `string` (required)

### `ClubActivitySnapshot`

- `activity_type`: `string | null` (optional)
- `approved_at`: `string | null` (optional)
- `author_user_id`: `string | null` (optional)
- `club`: `object | null` (optional)
- `club_id`: `string | null` (optional)
- `cover_image`: `object | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `end_datetime`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_published`: `boolean | null` (optional)
- `is_virtual`: `boolean | null` (optional)
- `location`: `string | null` (optional)
- `meeting_link`: `string | null` (optional)
- `owner_portal`: `string | null` (optional)
- `owner_scope_id`: `string | null` (optional)
- `owner_scope_type`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `start_datetime`: `string | null` (optional)
- `status`: `string | null` (optional)
- `submitted_at`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `ClubActivityUpdate`

- `activity_type`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `end_datetime`: `string | null` (optional)
- `is_virtual`: `boolean | null` (optional)
- `location`: `string | null` (optional)
- `meeting_link`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `start_datetime`: `string | null` (optional)
- `title`: `string | null` (optional)

### `ClubCreate`

- `about`: `string | null` (optional)
- `chairperson_id`: `string | null` (optional)
- `club_type`: `string` (required)
- `cover_image_id`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `email`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `logo_id`: `string | null` (optional)
- `meeting_schedule`: `string | null` (optional)
- `membership_count`: `integer` (optional)
- `membership_fee`: `integer | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string` (required)
- `objectives`: `string | null` (optional)
- `patron_id`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `registration_date`: `string | null` (optional)
- `school_id`: `string | null` (optional)
- `secretary_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `social_media`: `object | null` (optional)
- `treasurer_id`: `string | null` (optional)
- `vice_chairperson_id`: `string | null` (optional)

### `ClubLeaderRead`

- `hierarchy_level`: `integer | null` (optional)
- `id`: `string` (required)
- `name`: `string | null` (optional)
- `person_id`: `string` (required)
- `role`: `string` (required)
- `title`: `string | null` (optional)

### `ClubMediaCreate`

- `display_order`: `integer` (optional)
- `media_id`: `string` (required)
- `role`: `string` (optional)

### `ClubMediaPublicationUpdate`

- `is_public`: `boolean` (required)

### `ClubMediaRead`

- `approved_at`: `string | null` (optional)
- `display_order`: `integer` (required)
- `entity_id`: `string` (required)
- `entity_type`: `string` (required)
- `folder_id`: `string | null` (optional)
- `id`: `string` (required)
- `is_public`: `boolean` (required)
- `is_published`: `boolean` (optional)
- `media`: `object | null` (optional)
- `media_id`: `string` (required)
- `owner_portal`: `string | null` (optional)
- `owner_scope_id`: `string | null` (optional)
- `owner_scope_type`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `role`: `string` (required)
- `status`: `string` (optional)
- `submitted_at`: `string | null` (optional)
- `workflow_status`: `string` (optional)

### `ClubMediaUpdate`

- `display_order`: `integer | null` (optional)
- `role`: `string | null` (optional)

### `ClubSnapshot`

- `about`: `string | null` (optional)
- `activities`: `array<ClubActivityRead> | null` (optional)
- `chairperson`: `object | null` (optional)
- `chairperson_id`: `string | null` (optional)
- `club_type`: `string | null` (optional)
- `cover_image`: `object | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `department`: `object | null` (optional)
- `department_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `email`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `logo`: `object | null` (optional)
- `logo_id`: `string | null` (optional)
- `meeting_schedule`: `string | null` (optional)
- `membership_count`: `integer | null` (optional)
- `membership_fee`: `integer | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string | null` (optional)
- `objectives`: `string | null` (optional)
- `patron`: `object | null` (optional)
- `patron_id`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `registration_date`: `string | null` (optional)
- `school`: `object | null` (optional)
- `school_id`: `string | null` (optional)
- `secretary`: `object | null` (optional)
- `secretary_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `social_media`: `object | null` (optional)
- `treasurer`: `object | null` (optional)
- `treasurer_id`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `vice_chairperson`: `object | null` (optional)
- `vice_chairperson_id`: `string | null` (optional)

### `ClubUpdate`

- `about`: `string | null` (optional)
- `chairperson_id`: `string | null` (optional)
- `club_type`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `email`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `logo_id`: `string | null` (optional)
- `meeting_schedule`: `string | null` (optional)
- `membership_count`: `integer | null` (optional)
- `membership_fee`: `integer | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string | null` (optional)
- `objectives`: `string | null` (optional)
- `patron_id`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `registration_date`: `string | null` (optional)
- `school_id`: `string | null` (optional)
- `secretary_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `social_media`: `object | null` (optional)
- `treasurer_id`: `string | null` (optional)
- `vice_chairperson_id`: `string | null` (optional)

### `ContactDirectoryCreate`

- `building`: `string | null` (optional)
- `contact_person_id`: `string | null` (optional)
- `contact_type`: `string | null` (optional)
- `email`: `string | null` (optional)
- `extension`: `string | null` (optional)
- `is_main`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `name`: `string` (required)
- `operating_hours`: `object | null` (optional)
- `phone`: `array<string> | null` (optional)
- `physical_address`: `string | null` (optional)
- `room_number`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `status`: `string` (optional)

### `ContactDirectoryPaginationMeta`

- `page`: `integer` (required)
- `pages`: `integer` (required)
- `per_page`: `integer` (required)
- `total`: `integer` (required)

### `ContactDirectorySnapshot`

- `building`: `string | null` (optional)
- `contact_person`: `object | null` (optional)
- `contact_person_id`: `string | null` (optional)
- `contact_type`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `email`: `string | null` (optional)
- `extension`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `operating_hours`: `object | null` (optional)
- `phone`: `array<string> | null` (optional)
- `physical_address`: `string | null` (optional)
- `room_number`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `status`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `updated_by`: `object | null` (optional)
- `updated_by_id`: `string | null` (optional)

### `ContactDirectoryUpdate`

- `building`: `string | null` (optional)
- `contact_person_id`: `string | null` (optional)
- `contact_type`: `string | null` (optional)
- `email`: `string | null` (optional)
- `extension`: `string | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `operating_hours`: `object | null` (optional)
- `phone`: `array<string> | null` (optional)
- `physical_address`: `string | null` (optional)
- `room_number`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `status`: `string | null` (optional)

### `ContactInquiryMessageRead`

- `body`: `string` (required)
- `created_at`: `string` (required)
- `delivery_attempts`: `integer` (required)
- `delivery_error`: `string | null` (optional)
- `delivery_status`: `string` (required)
- `failed_at`: `string | null` (optional)
- `id`: `string` (required)
- `idempotency_key`: `string | null` (optional)
- `inquiry_id`: `string` (required)
- `is_internal_note`: `boolean` (required)
- `provider_message_id`: `string | null` (optional)
- `reply_to_email`: `string | null` (optional)
- `sender_email`: `string | null` (optional)
- `sender_name`: `string | null` (optional)
- `sender_type`: `string` (required)
- `sender_user_id`: `string | null` (optional)
- `sent_at`: `string | null` (optional)
- `updated_at`: `string` (required)

### `ContactInquiryRead`

- `assigned_to_user_id`: `string | null` (optional)
- `category`: `string` (required)
- `closed_at`: `string | null` (optional)
- `consent_to_contact`: `boolean` (required)
- `created_at`: `string` (required)
- `first_response_at`: `string | null` (optional)
- `id`: `string` (required)
- `last_message_at`: `string | null` (optional)
- `messages`: `array<ContactInquiryMessageRead>` (optional)
- `owner_scope_id`: `string | null` (optional)
- `owner_scope_type`: `string` (required)
- `priority`: `string` (required)
- `reference_number`: `string` (required)
- `resolved_at`: `string | null` (optional)
- `school_id`: `string | null` (optional)
- `sender_email`: `string` (required)
- `sender_name`: `string` (required)
- `sender_phone`: `string | null` (optional)
- `source`: `string` (required)
- `source_page_url`: `string | null` (optional)
- `status`: `string` (required)
- `subject`: `string` (required)
- `target_entity_id`: `string` (required)
- `target_entity_name`: `string | null` (optional)
- `target_entity_slug`: `string | null` (optional)
- `target_entity_type`: `string` (required)
- `updated_at`: `string` (required)

### `ContactOwnerRead`

- `entity_type`: `string` (required)
- `id`: `string | null` (optional)
- `is_active`: `boolean` (required)
- `label`: `string` (required)
- `subtitle`: `string | null` (optional)

### `ContentReport`

- `content_views`: `integer` (required)
- `event_types`: `array<ReportDimension>` (required)
- `interactions`: `integer` (required)
- `top_content`: `array<ReportDimension>` (required)

### `ContentWorkflowActionRequest`

- `changed_fields`: `object | null` (optional)
- `comments`: `string | null` (optional)
- `scheduled_for`: `string | null` (optional)

### `ContentWorkflowContributorRead`

- `affiliation`: `string | null` (optional)
- `consent_to_publish`: `boolean | null` (optional)
- `email`: `string | null` (optional)
- `name`: `string | null` (optional)
- `show_name`: `boolean | null` (optional)
- `source_type`: `string | null` (optional)

### `ContentWorkflowLogRead`

- `action`: `string` (required)
- `actor_id`: `string | null` (optional)
- `changed_fields`: `object | null` (optional)
- `comments`: `string | null` (optional)
- `content_id`: `string` (required)
- `content_type`: `string` (required)
- `created_at`: `string` (required)
- `from_status`: `string` (required)
- `id`: `string` (required)
- `to_status`: `string` (required)
- `updated_at`: `string` (required)

### `ContentWorkflowPreviewRead`

- `plain_text`: `string | null` (optional)
- `related_links`: `array<object>` (optional)
- `rich_text`: `string | null` (optional)
- `seo`: `object` (optional)
- `structured_content`: `object | null` (optional)

### `ContentWorkflowQueueItemRead`

- `content_type`: `string` (required)
- `content_type_label`: `string` (required)
- `contributor`: `ContentWorkflowContributorRead | null` (optional)
- `edit_path`: `string` (required)
- `id`: `string` (required)
- `owner_label`: `string` (required)
- `preview`: `ContentWorkflowPreviewRead` (required)
- `preview_path`: `string | null` (optional)
- `publication_target`: `string` (required)
- `reviewer_label`: `string` (required)
- `scheduled_publish_at`: `string | null` (optional)
- `source_label`: `string` (required)
- `source_portal`: `string` (required)
- `status`: `string` (required)
- `submitted_at`: `string | null` (optional)
- `submitted_by_label`: `string` (required)
- `summary`: `string | null` (optional)
- `title`: `string` (required)
- `workflow_action_path`: `string` (required)

### `ContentWorkflowRecordSnapshot`

- `created_at`: `string | null` (optional)
- `id`: `string` (required)
- `status`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `CookieAuthResponse`

- `authenticated`: `boolean` (optional)
- `token_type`: `string` (optional)

### `CorporateCommEngagementResponse`

- `note`: `string` (required)
- `period`: `EngagementPeriod` (required)
- `social`: `EngagementSocial` (required)
- `social_insights_available`: `boolean` (required)
- `website`: `EngagementWebsite` (required)

### `CorporateCommSettingsResponse`

- `can_manage`: `boolean` (required)
- `office_channels`: `OfficeChannels | null` (optional)
- `social_links`: `SocialLinks | null` (optional)

### `CorporateCommSettingsUpdate`

- `office_channels`: `OfficeChannels | null` (optional)
- `social_links`: `SocialLinks | null` (optional)

### `CorporateCommTeamMember`

- `email`: `string` (required)
- `full_name`: `string` (required)
- `id`: `string` (required)
- `last_login_at`: `string | null` (optional)
- `roles`: `array<string>` (optional)

### `CorporateCommTeamResponse`

- `members`: `array<CorporateCommTeamMember>` (optional)

### `CorporateDashboardResponse`

- `activity`: `object` (required)
- `attention_items`: `array<app__schemas__corporate_dashboard__DashboardAttentionItem>` (required)
- `comparison_period`: `DashboardPeriod | null` (optional)
- `data_quality`: `object` (required)
- `filters`: `object` (required)
- `generated_at`: `string` (required)
- `insights`: `array<DashboardInsight>` (required)
- `period`: `DashboardPeriod` (required)
- `publishing`: `object` (required)
- `readiness`: `object` (required)
- `snapshot`: `object` (required)
- `workflow`: `object` (required)

### `CorporatePortalContextResponse`

- `allowed_navigation`: `array<string>` (required)
- `capabilities`: `object` (required)

### `CouncilDashboardRead`

- `chairperson`: `CouncilMemberRead | null` (optional)
- `draft_profile_count`: `integer` (required)
- `government_representative_count`: `integer` (required)
- `inactive_profile_count`: `integer` (required)
- `last_updated_at`: `string | null` (optional)
- `member_count`: `integer` (required)
- `other_representative_count`: `integer` (required)
- `published_profile_count`: `integer` (required)
- `secretary`: `CouncilMemberRead | null` (optional)
- `total_active_members`: `integer` (required)
- `vacant_position_count`: `integer` (required)

### `CouncilMemberCreate`

- `appointing_authority`: `string | null` (optional)
- `appointment_category`: `string | null` (optional)
- `appointment_reference`: `string | null` (optional)
- `appointment_status`: `string` (optional)
- `current_office`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `end_date`: `string | null` (optional)
- `governance_role_id`: `string` (required)
- `hierarchy_level`: `integer | null` (optional)
- `is_acting`: `boolean` (optional)
- `is_ex_officio`: `boolean` (optional)
- `is_voting_member`: `boolean` (optional)
- `official_designation`: `string | null` (optional)
- `person_id`: `string` (required)
- `portrait_media_id`: `string | null` (optional)
- `profile_slug`: `string | null` (optional)
- `profile_summary`: `string | null` (optional)
- `public_role_label`: `string` (required)
- `publication_notes`: `string | null` (optional)
- `publish_without_portrait_override`: `boolean` (optional)
- `reports_to_id`: `string | null` (optional)
- `represented_institution`: `string | null` (optional)
- `show_contact_publicly`: `boolean` (optional)
- `start_date`: `string | null` (optional)
- `term_number`: `integer | null` (optional)
- `term_years`: `integer | null` (optional)
- `workflow_status`: `string` (optional)

### `CouncilMemberRead`

- `appointing_authority`: `string | null` (optional)
- `appointment_category`: `string | null` (optional)
- `appointment_reference`: `string | null` (optional)
- `appointment_status`: `string` (required)
- `archived_at`: `string | null` (optional)
- `created_at`: `string` (required)
- `current_office`: `string | null` (optional)
- `display_order`: `integer` (required)
- `end_date`: `string | null` (optional)
- `governance_role`: `GovernanceRoleRead | null` (optional)
- `governance_role_id`: `string | null` (optional)
- `hierarchy_level`: `integer` (required)
- `id`: `string` (required)
- `is_acting`: `boolean` (required)
- `is_ex_officio`: `boolean` (required)
- `is_voting_member`: `boolean` (required)
- `official_designation`: `string | null` (optional)
- `person`: `object | null` (optional)
- `person_id`: `string` (required)
- `portrait_media`: `object | null` (optional)
- `portrait_media_id`: `string | null` (optional)
- `profile_slug`: `string | null` (optional)
- `profile_summary`: `string | null` (optional)
- `public_role_label`: `string | null` (optional)
- `publication_notes`: `string | null` (optional)
- `publish_without_portrait_override`: `boolean` (required)
- `published_at`: `string | null` (optional)
- `reports_to`: `CouncilMemberReportsToRead | null` (optional)
- `reports_to_id`: `string | null` (optional)
- `represented_institution`: `string | null` (optional)
- `show_contact_publicly`: `boolean` (required)
- `start_date`: `string | null` (optional)
- `term_number`: `integer | null` (optional)
- `term_years`: `integer | null` (optional)
- `unpublished_at`: `string | null` (optional)
- `updated_at`: `string` (required)
- `workflow_status`: `string` (required)

### `CouncilMemberReportsToRead`

- `display_label`: `string` (required)
- `id`: `string` (required)
- `role_label`: `string` (required)

### `CouncilMemberSnapshot`

- `appointing_authority`: `string | null` (optional)
- `appointment_category`: `string | null` (optional)
- `appointment_reference`: `string | null` (optional)
- `appointment_status`: `string | null` (optional)
- `archived_at`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `current_office`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `end_date`: `string | null` (optional)
- `governance_role`: `GovernanceRoleRead | null` (optional)
- `governance_role_id`: `string | null` (optional)
- `hierarchy_level`: `integer | null` (optional)
- `id`: `string | null` (optional)
- `is_acting`: `boolean | null` (optional)
- `is_ex_officio`: `boolean | null` (optional)
- `is_voting_member`: `boolean | null` (optional)
- `official_designation`: `string | null` (optional)
- `person`: `object | null` (optional)
- `person_id`: `string | null` (optional)
- `portrait_media`: `object | null` (optional)
- `portrait_media_id`: `string | null` (optional)
- `profile_slug`: `string | null` (optional)
- `profile_summary`: `string | null` (optional)
- `public_role_label`: `string | null` (optional)
- `publication_notes`: `string | null` (optional)
- `publish_without_portrait_override`: `boolean | null` (optional)
- `published_at`: `string | null` (optional)
- `reports_to`: `CouncilMemberReportsToRead | null` (optional)
- `reports_to_id`: `string | null` (optional)
- `represented_institution`: `string | null` (optional)
- `show_contact_publicly`: `boolean | null` (optional)
- `start_date`: `string | null` (optional)
- `term_number`: `integer | null` (optional)
- `term_years`: `integer | null` (optional)
- `unpublished_at`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `CouncilMemberUpdate`

- `appointing_authority`: `string | null` (optional)
- `appointment_category`: `string | null` (optional)
- `appointment_reference`: `string | null` (optional)
- `appointment_status`: `string | null` (optional)
- `current_office`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `end_date`: `string | null` (optional)
- `governance_role_id`: `string | null` (optional)
- `hierarchy_level`: `integer | null` (optional)
- `is_acting`: `boolean | null` (optional)
- `is_ex_officio`: `boolean | null` (optional)
- `is_voting_member`: `boolean | null` (optional)
- `official_designation`: `string | null` (optional)
- `portrait_media_id`: `string | null` (optional)
- `profile_slug`: `string | null` (optional)
- `profile_summary`: `string | null` (optional)
- `public_role_label`: `string | null` (optional)
- `publication_notes`: `string | null` (optional)
- `publish_without_portrait_override`: `boolean | null` (optional)
- `reports_to_id`: `string | null` (optional)
- `represented_institution`: `string | null` (optional)
- `show_contact_publicly`: `boolean | null` (optional)
- `start_date`: `string | null` (optional)
- `term_number`: `integer | null` (optional)
- `term_years`: `integer | null` (optional)
- `workflow_status`: `string | null` (optional)

### `CouncilOrderNode`

- `assignment_id`: `string` (required)
- `display_group`: `string` (required)
- `display_order`: `integer` (required)
- `hierarchy_level`: `integer` (required)
- `reports_to_id`: `string | null` (optional)

### `CouncilOrderUpdate`

- `nodes`: `array<CouncilOrderNode>` (required)

### `DashboardActivityItem`

- `actor_name`: `string | null` (optional)
- `event_type`: `string` (required)
- `id`: `string` (required)
- `occurred_at`: `string` (required)
- `resource_id`: `string` (required)
- `resource_type`: `string` (required)
- `summary`: `string` (required)

### `DashboardActivitySummary`

- `page_views`: `integer` (required)
- `page_views_change_percent`: `number | null` (optional)
- `previous_page_views`: `integer` (required)
- `previous_visitors`: `integer` (required)
- `visitors`: `integer` (required)
- `visitors_change_percent`: `number | null` (optional)

### `DashboardDistributionItem`

- `key`: `string` (required)
- `label`: `string` (required)
- `value`: `integer` (required)

### `DashboardInsight`

- `code`: `string` (required)
- `description`: `string` (required)
- `href`: `string | null` (optional)
- `severity`: `string` (required)
- `title`: `string` (required)
- `total`: `integer | number | null` (optional)
- `value`: `integer | number | null` (optional)

### `DashboardPeriod`

- `bucket`: `string | null` (optional)
- `date_from`: `string` (required)
- `date_to`: `string` (required)

### `DashboardProfileCompleteness`

- `completed_fields`: `integer` (required)
- `missing_fields`: `array<string>` (required)
- `percent`: `integer` (required)
- `total_fields`: `integer` (required)

### `DashboardQuickAction`

- `description`: `string` (required)
- `href`: `string` (required)
- `key`: `string` (required)
- `label`: `string` (required)

### `DashboardQuickLink`

- `count`: `integer` (required)
- `href`: `string` (required)
- `key`: `string` (required)
- `label`: `string` (required)

### `DashboardSummaryCard`

- `change_percent`: `number | null` (optional)
- `collection_started_after_deployment`: `boolean` (optional)
- `href`: `string | null` (optional)
- `key`: `string` (required)
- `label`: `string` (required)
- `previous_value`: `integer | null` (optional)
- `value`: `integer` (required)

### `DashboardTrendPoint`

- `bucket`: `string` (required)
- `value`: `integer` (required)
- `visitors`: `integer` (optional)

### `DepartmentCreate`

- `about`: `string | null` (optional)
- `allows_staff_management`: `boolean` (optional)
- `code`: `string` (required)
- `core_values`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `department_type`: `string` (optional)
- `display_order`: `integer` (optional)
- `email`: `string | null` (optional)
- `establishment_date`: `string | null` (optional)
- `guidelines`: `string | null` (optional)
- `head_id`: `string | null` (optional)
- `head_message`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `mandate`: `string | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string` (required)
- `office_location`: `string | null` (optional)
- `parent_department_id`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `postgraduate_coordinator_id`: `string | null` (optional)
- `postgraduate_student_count`: `integer` (optional)
- `school_id`: `string | null` (optional)
- `service_charter`: `string | null` (optional)
- `slug`: `string` (required)
- `student_count`: `integer` (optional)
- `vision`: `string | null` (optional)
- `wing_id`: `string | null` (optional)

### `DepartmentServiceCreate`

- `contact_email`: `string | null` (optional)
- `contact_phone`: `string | null` (optional)
- `department_id`: `string` (required)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `fee`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `name`: `string` (required)
- `process`: `string | null` (optional)
- `requirements`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `turnaround_time`: `string | null` (optional)

### `DepartmentServiceRead`

- `contact_email`: `string | null` (optional)
- `contact_phone`: `string | null` (optional)
- `created_at`: `string` (required)
- `department`: `object | null` (optional)
- `department_id`: `string` (required)
- `description`: `string | null` (optional)
- `display_order`: `integer` (required)
- `fee`: `string | null` (optional)
- `id`: `string` (required)
- `is_active`: `boolean` (required)
- `name`: `string` (required)
- `process`: `string | null` (optional)
- `requirements`: `string | null` (optional)
- `slug`: `string` (required)
- `turnaround_time`: `string | null` (optional)
- `updated_at`: `string` (required)

### `DepartmentServiceSnapshot`

- `contact_email`: `string | null` (optional)
- `contact_phone`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `department`: `object | null` (optional)
- `department_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `fee`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `process`: `string | null` (optional)
- `requirements`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `turnaround_time`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `DepartmentServiceUpdate`

- `contact_email`: `string | null` (optional)
- `contact_phone`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `fee`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `process`: `string | null` (optional)
- `requirements`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `turnaround_time`: `string | null` (optional)

### `DepartmentSnapshot`

- `about`: `string | null` (optional)
- `allows_staff_management`: `boolean | null` (optional)
- `code`: `string | null` (optional)
- `core_values`: `string | null` (optional)
- `cover_image`: `object | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `department_type`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `email`: `string | null` (optional)
- `establishment_date`: `string | null` (optional)
- `external_name`: `string | null` (optional)
- `external_source`: `string | null` (optional)
- `external_source_id`: `string | null` (optional)
- `guidelines`: `string | null` (optional)
- `head`: `object | null` (optional)
- `head_id`: `string | null` (optional)
- `head_message`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `mandate`: `string | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string | null` (optional)
- `office_location`: `string | null` (optional)
- `parent_department`: `object | null` (optional)
- `parent_department_id`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `postgraduate_coordinator`: `object | null` (optional)
- `postgraduate_coordinator_id`: `string | null` (optional)
- `postgraduate_student_count`: `integer | null` (optional)
- `programmes`: `array<object> | null` (optional)
- `school`: `object | null` (optional)
- `school_id`: `string | null` (optional)
- `service_charter`: `string | null` (optional)
- `services`: `array<DepartmentServiceRead> | null` (optional)
- `slug`: `string | null` (optional)
- `staff`: `array<object> | null` (optional)
- `student_count`: `integer | null` (optional)
- `sub_departments`: `array<object> | null` (optional)
- `updated_at`: `string | null` (optional)
- `vision`: `string | null` (optional)
- `wing`: `object | null` (optional)
- `wing_id`: `string | null` (optional)

### `DepartmentUpdate`

- `about`: `string | null` (optional)
- `allows_staff_management`: `boolean | null` (optional)
- `code`: `string | null` (optional)
- `core_values`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `department_type`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `email`: `string | null` (optional)
- `establishment_date`: `string | null` (optional)
- `guidelines`: `string | null` (optional)
- `head_id`: `string | null` (optional)
- `head_message`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `mandate`: `string | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string | null` (optional)
- `office_location`: `string | null` (optional)
- `parent_department_id`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `postgraduate_coordinator_id`: `string | null` (optional)
- `postgraduate_student_count`: `integer | null` (optional)
- `school_id`: `string | null` (optional)
- `service_charter`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `student_count`: `integer | null` (optional)
- `vision`: `string | null` (optional)
- `wing_id`: `string | null` (optional)

### `DivisionCreate`

- `code`: `string` (required)
- `core_values`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `division_type`: `string` (optional)
- `email`: `string | null` (optional)
- `head_id`: `string | null` (optional)
- `head_message`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `mission`: `string | null` (optional)
- `name`: `string` (required)
- `office_location`: `string | null` (optional)
- `operating_hours`: `object | null` (optional)
- `phone`: `string | null` (optional)
- `settings`: `object | null` (optional)
- `slug`: `string` (required)
- `vision`: `string | null` (optional)

### `DivisionSnapshot`

- `boards`: `array<object> | null` (optional)
- `code`: `string | null` (optional)
- `core_values`: `string | null` (optional)
- `cover_image`: `object | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `division_type`: `string | null` (optional)
- `email`: `string | null` (optional)
- `head`: `object | null` (optional)
- `head_id`: `string | null` (optional)
- `head_message`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string | null` (optional)
- `office_location`: `string | null` (optional)
- `operating_hours`: `object | null` (optional)
- `phone`: `string | null` (optional)
- `settings`: `object | null` (optional)
- `slug`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `vision`: `string | null` (optional)
- `wings`: `array<object> | null` (optional)

### `DivisionUpdate`

- `code`: `string | null` (optional)
- `core_values`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `division_type`: `string | null` (optional)
- `email`: `string | null` (optional)
- `head_id`: `string | null` (optional)
- `head_message`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string | null` (optional)
- `office_location`: `string | null` (optional)
- `operating_hours`: `object | null` (optional)
- `phone`: `string | null` (optional)
- `settings`: `object | null` (optional)
- `slug`: `string | null` (optional)
- `vision`: `string | null` (optional)

### `DocumentCreate`

- `category`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `document_type`: `string` (required)
- `file_id`: `string` (required)
- `is_active`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `requires_login`: `boolean` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `title`: `string` (required)
- `version`: `string | null` (optional)

### `DocumentSnapshot`

- `category`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `document_type`: `string | null` (optional)
- `download_count`: `integer | null` (optional)
- `file`: `object | null` (optional)
- `file_id`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `requires_login`: `boolean | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `updated_by`: `object | null` (optional)
- `updated_by_id`: `string | null` (optional)
- `version`: `string | null` (optional)

### `DocumentUpdate`

- `category`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `document_type`: `string | null` (optional)
- `file_id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `requires_login`: `boolean | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `title`: `string | null` (optional)
- `version`: `string | null` (optional)

### `EngagementPeriod`

- `date_from`: `string` (required)
- `date_to`: `string` (required)

### `EngagementPlatformCount`

- `failed`: `integer` (optional)
- `pending`: `integer` (optional)
- `platform`: `string` (required)
- `posted`: `integer` (optional)
- `total`: `integer` (optional)

### `EngagementSocial`

- `by_platform`: `array<EngagementPlatformCount>` (optional)
- `note`: `string` (required)
- `social_insights_available`: `boolean` (required)
- `totals`: `EngagementTotals` (required)

### `EngagementTopContent`

- `entity_id`: `string` (required)
- `entity_type`: `string | null` (optional)
- `path`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `title`: `string | null` (optional)
- `views`: `integer` (required)
- `visitors`: `integer` (required)

### `EngagementTotals`

- `failed`: `integer` (optional)
- `pending`: `integer` (optional)
- `posted`: `integer` (optional)
- `total`: `integer` (optional)

### `EngagementTrendPoint`

- `bucket`: `string` (required)
- `views`: `integer` (required)
- `visitors`: `integer` (required)

### `EngagementTypeCount`

- `key`: `string` (required)
- `label`: `string` (required)
- `views`: `integer` (required)

### `EngagementWebsite`

- `page_views`: `integer` (required)
- `top_content`: `array<EngagementTopContent>` (optional)
- `trend`: `array<EngagementTrendPoint>` (optional)
- `unique_visitors`: `integer` (required)
- `views_by_type`: `array<EngagementTypeCount>` (optional)

### `EnrollmentRequest`

- `password`: `string` (required)

### `EnrollmentResponse`

- `otpauth_uri`: `string` (required)
- `secret`: `string` (required)

### `EventCreate`

- `display_order`: `integer` (optional)
- `end_date`: `string | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `is_featured`: `boolean` (optional)
- `is_main`: `boolean` (optional)
- `is_virtual`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `location`: `string | null` (optional)
- `meeting_link`: `string | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `rich_text`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string` (required)
- `start_date`: `string` (required)
- `structured_content`: `object | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)

### `EventSnapshot`

- `approved_at`: `string | null` (optional)
- `approved_by_id`: `string | null` (optional)
- `archived_at`: `string | null` (optional)
- `author`: `object | null` (optional)
- `author_user_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `end_date`: `string | null` (optional)
- `expires_at`: `string | null` (optional)
- `featured_media`: `object | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_published`: `boolean | null` (optional)
- `is_virtual`: `boolean | null` (optional)
- `keywords`: `object | null` (optional)
- `location`: `string | null` (optional)
- `meeting_link`: `string | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `owner_portal`: `string | null` (optional)
- `owner_scope_id`: `string | null` (optional)
- `owner_scope_type`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `published_by_id`: `string | null` (optional)
- `rejection_reason`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `reviewed_at`: `string | null` (optional)
- `reviewed_by_id`: `string | null` (optional)
- `revision_notes`: `string | null` (optional)
- `rich_text`: `string | null` (optional)
- `scheduled_publish_at`: `string | null` (optional)
- `scope`: `ScopeSummary | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `start_date`: `string | null` (optional)
- `status`: `string | null` (optional)
- `structured_content`: `object | null` (optional)
- `submitted_at`: `string | null` (optional)
- `submitted_by_id`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `unpublished_at`: `string | null` (optional)
- `unpublished_by_id`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `updated_by`: `object | null` (optional)
- `updated_by_id`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `EventUpdate`

- `display_order`: `integer | null` (optional)
- `end_date`: `string | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_virtual`: `boolean | null` (optional)
- `keywords`: `object | null` (optional)
- `location`: `string | null` (optional)
- `meeting_link`: `string | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `rich_text`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `start_date`: `string | null` (optional)
- `structured_content`: `object | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)

### `ExchangeProgrammeCreate`

- `about`: `string | null` (optional)
- `application_deadline`: `string | null` (optional)
- `application_process`: `string | null` (optional)
- `benefits`: `string | null` (optional)
- `brochure_id`: `string | null` (optional)
- `coordinator_id`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `duration`: `string | null` (optional)
- `eligibility`: `string | null` (optional)
- `email`: `string | null` (optional)
- `is_accepting_applications`: `boolean` (optional)
- `is_active`: `boolean` (optional)
- `name`: `string` (required)
- `partner_country`: `string` (required)
- `partner_institution`: `string` (required)
- `partner_website`: `string | null` (optional)
- `programme_start`: `string | null` (optional)
- `programme_type`: `string` (required)
- `school_id`: `string | null` (optional)
- `slug`: `string | null` (optional)

### `ExchangeProgrammeSnapshot`

- `about`: `string | null` (optional)
- `application_deadline`: `string | null` (optional)
- `application_process`: `string | null` (optional)
- `benefits`: `string | null` (optional)
- `brochure`: `object | null` (optional)
- `brochure_id`: `string | null` (optional)
- `coordinator`: `object | null` (optional)
- `coordinator_id`: `string | null` (optional)
- `cover_image`: `object | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `duration`: `string | null` (optional)
- `eligibility`: `string | null` (optional)
- `email`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_accepting_applications`: `boolean | null` (optional)
- `is_active`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `partner_country`: `string | null` (optional)
- `partner_institution`: `string | null` (optional)
- `partner_website`: `string | null` (optional)
- `programme_start`: `string | null` (optional)
- `programme_type`: `string | null` (optional)
- `school`: `object | null` (optional)
- `school_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `ExchangeProgrammeUpdate`

- `about`: `string | null` (optional)
- `application_deadline`: `string | null` (optional)
- `application_process`: `string | null` (optional)
- `benefits`: `string | null` (optional)
- `brochure_id`: `string | null` (optional)
- `coordinator_id`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `duration`: `string | null` (optional)
- `eligibility`: `string | null` (optional)
- `email`: `string | null` (optional)
- `is_accepting_applications`: `boolean | null` (optional)
- `is_active`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `partner_country`: `string | null` (optional)
- `partner_institution`: `string | null` (optional)
- `partner_website`: `string | null` (optional)
- `programme_start`: `string | null` (optional)
- `programme_type`: `string | null` (optional)
- `school_id`: `string | null` (optional)
- `slug`: `string | null` (optional)

### `FAQCreate`

- `answer_plain_text`: `string | null` (optional)
- `answer_rich_text`: `string | null` (optional)
- `answer_structured`: `object | null` (optional)
- `category`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `is_main`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `question`: `string` (required)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `status`: `string` (optional)

### `FAQRead`

- `answer_plain_text`: `string | null` (optional)
- `answer_rich_text`: `string | null` (optional)
- `answer_structured`: `object | null` (optional)
- `category`: `string | null` (optional)
- `created_at`: `string` (required)
- `deleted_at`: `string | null` (optional)
- `display_order`: `integer` (required)
- `helpful_count`: `integer` (required)
- `id`: `string` (required)
- `is_main`: `boolean` (required)
- `is_public`: `boolean` (required)
- `question`: `string` (required)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `status`: `string` (required)
- `updated_at`: `string` (required)
- `updated_by`: `object | null` (optional)
- `updated_by_id`: `string | null` (optional)
- `views_count`: `integer` (required)

### `FAQSnapshot`

- `answer_plain_text`: `string | null` (optional)
- `answer_rich_text`: `string | null` (optional)
- `answer_structured`: `object | null` (optional)
- `category`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `helpful_count`: `integer | null` (optional)
- `id`: `string | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `question`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `status`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `updated_by`: `object | null` (optional)
- `updated_by_id`: `string | null` (optional)
- `views_count`: `integer | null` (optional)

### `FAQUpdate`

- `answer_plain_text`: `string | null` (optional)
- `answer_rich_text`: `string | null` (optional)
- `answer_structured`: `object | null` (optional)
- `category`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `question`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `status`: `string | null` (optional)

### `FactEditionClone`

- `reporting_year`: `integer` (required)

### `FactEditionCreate`

- `introduction`: `string | null` (optional)
- `is_current`: `boolean` (optional)
- `is_enabled`: `boolean` (optional)
- `methodology_note`: `string | null` (optional)
- `reporting_year`: `integer` (required)
- `source_document_id`: `string | null` (optional)
- `title`: `string` (required)
- `verified_on`: `string | null` (optional)

### `FactEditionSnapshot`

- `created_at`: `string | null` (optional)
- `id`: `string | null` (optional)
- `introduction`: `string | null` (optional)
- `is_current`: `boolean | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `methodology_note`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `reporting_year`: `integer | null` (optional)
- `source_document`: `object | null` (optional)
- `source_document_id`: `string | null` (optional)
- `status`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `verified_on`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `FactEditionUpdate`

- `introduction`: `string | null` (optional)
- `is_current`: `boolean | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `methodology_note`: `string | null` (optional)
- `source_document_id`: `string | null` (optional)
- `title`: `string | null` (optional)
- `verified_on`: `string | null` (optional)

### `FactGroupCreate`

- `display_order`: `integer` (optional)
- `fact_edition_id`: `string | null` (optional)
- `heading`: `string` (required)
- `image_alt_text`: `string | null` (optional)
- `image_id`: `string | null` (optional)
- `is_enabled`: `boolean` (optional)
- `slug`: `string` (required)
- `summary`: `string | null` (optional)

### `FactGroupSnapshot`

- `created_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `fact_edition_id`: `string | null` (optional)
- `heading`: `string | null` (optional)
- `id`: `string | null` (optional)
- `image`: `object | null` (optional)
- `image_alt_text`: `string | null` (optional)
- `image_id`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `published_at`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `FactGroupUpdate`

- `display_order`: `integer | null` (optional)
- `heading`: `string | null` (optional)
- `image_alt_text`: `string | null` (optional)
- `image_id`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `summary`: `string | null` (optional)

### `FactItemCreate`

- `display_order`: `integer` (optional)
- `display_value`: `string` (required)
- `explanation`: `string | null` (optional)
- `fact_group_id`: `string` (required)
- `fact_kind`: `string` (required)
- `icon_key`: `string | null` (optional)
- `is_enabled`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `label`: `string` (required)
- `link_label`: `string | null` (optional)
- `link_url`: `string | null` (optional)
- `numeric_value`: `number | string | null` (optional)
- `prefix`: `string | null` (optional)
- `source_title`: `string | null` (optional)
- `source_url`: `string | null` (optional)
- `suffix`: `string | null` (optional)
- `unit`: `string | null` (optional)
- `verified_on`: `string | null` (optional)

### `FactItemSnapshot`

- `created_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `display_value`: `string | null` (optional)
- `explanation`: `string | null` (optional)
- `fact_group_id`: `string | null` (optional)
- `fact_kind`: `string | null` (optional)
- `icon_key`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `label`: `string | null` (optional)
- `link_label`: `string | null` (optional)
- `link_url`: `string | null` (optional)
- `numeric_value`: `string | null` (optional)
- `prefix`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `source_title`: `string | null` (optional)
- `source_url`: `string | null` (optional)
- `status`: `string | null` (optional)
- `suffix`: `string | null` (optional)
- `unit`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `verified_on`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `FactItemUpdate`

- `display_order`: `integer | null` (optional)
- `display_value`: `string | null` (optional)
- `explanation`: `string | null` (optional)
- `icon_key`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `label`: `string | null` (optional)
- `link_label`: `string | null` (optional)
- `link_url`: `string | null` (optional)
- `numeric_value`: `number | string | null` (optional)
- `prefix`: `string | null` (optional)
- `source_title`: `string | null` (optional)
- `source_url`: `string | null` (optional)
- `suffix`: `string | null` (optional)
- `unit`: `string | null` (optional)
- `verified_on`: `string | null` (optional)

### `FactorRequest`

- `mfa_code`: `string` (required)

### `ForgotPasswordRequest`

- `email`: `string` (required)
- `frontend_service`: `string | null` (optional)

### `ForwardedServiceResponse`

- `data`: `object` (optional)
- `error`: `object` (optional)
- `message`: `string | null` (optional)
- `meta`: `object | null` (optional)

### `GovernancePageContentRead`

- `approved_at`: `string | null` (optional)
- `board_id`: `string` (required)
- `breadcrumb_label`: `string | null` (optional)
- `created_at`: `string` (required)
- `document_cta_label`: `string | null` (optional)
- `document_cta_url`: `string | null` (optional)
- `hero_focal_point`: `string | null` (optional)
- `hero_image`: `object | null` (optional)
- `hero_image_id`: `string | null` (optional)
- `id`: `string` (required)
- `intro`: `string | null` (optional)
- `mandate_body`: `string | null` (optional)
- `mandate_heading`: `string | null` (optional)
- `mandate_icon`: `string | null` (optional)
- `mandate_label`: `string | null` (optional)
- `overlay_intensity`: `integer | null` (optional)
- `page_key`: `string` (required)
- `published_at`: `string | null` (optional)
- `status`: `string` (required)
- `submitted_at`: `string | null` (optional)
- `title`: `string | null` (optional)
- `unpublished_at`: `string | null` (optional)
- `updated_at`: `string` (required)
- `workflow_status`: `string` (required)

### `GovernancePageContentUpdate`

- `breadcrumb_label`: `string | null` (optional)
- `document_cta_label`: `string | null` (optional)
- `document_cta_url`: `string | null` (optional)
- `hero_focal_point`: `string | null` (optional)
- `hero_image_id`: `string | null` (optional)
- `intro`: `string | null` (optional)
- `mandate_body`: `string | null` (optional)
- `mandate_heading`: `string | null` (optional)
- `mandate_icon`: `string | null` (optional)
- `mandate_label`: `string | null` (optional)
- `overlay_intensity`: `integer | null` (optional)
- `title`: `string | null` (optional)

### `GovernanceRoleCreate`

- `badge_style`: `string | null` (optional)
- `category`: `string` (required)
- `default_display_order`: `integer` (optional)
- `default_hierarchy_level`: `integer` (optional)
- `description`: `string | null` (optional)
- `display_group`: `string` (required)
- `is_active`: `boolean` (optional)
- `name`: `string` (required)
- `public_label`: `string` (required)
- `slug`: `string` (required)

### `GovernanceRoleRead`

- `badge_style`: `string | null` (optional)
- `category`: `string` (required)
- `created_at`: `string` (required)
- `default_display_order`: `integer` (required)
- `default_hierarchy_level`: `integer` (required)
- `description`: `string | null` (optional)
- `display_group`: `string` (required)
- `id`: `string` (required)
- `is_active`: `boolean` (required)
- `name`: `string` (required)
- `public_label`: `string` (required)
- `slug`: `string` (required)
- `updated_at`: `string` (required)

### `GovernanceRoleSnapshot`

- `badge_style`: `string | null` (optional)
- `category`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `default_display_order`: `integer | null` (optional)
- `default_hierarchy_level`: `integer | null` (optional)
- `description`: `string | null` (optional)
- `display_group`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `public_label`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `GovernanceRoleUpdate`

- `badge_style`: `string | null` (optional)
- `category`: `string | null` (optional)
- `default_display_order`: `integer | null` (optional)
- `default_hierarchy_level`: `integer | null` (optional)
- `description`: `string | null` (optional)
- `display_group`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `public_label`: `string | null` (optional)
- `slug`: `string | null` (optional)

### `HTTPValidationError`

- `detail`: `array<ValidationError>` (optional)

### `HeadMessageItem`

- `display_order`: `integer` (optional)
- `is_active`: `boolean` (optional)
- `message`: `string` (required)
- `person_id`: `string | null` (optional)
- `role_key`: `string` (required)
- `title`: `string` (required)

### `HealthPayload`

- `release`: `string` (required)
- `service`: `string` (required)
- `status`: `string` (required)

### `HistoryMilestoneCreate`

- `about_page_content_id`: `string` (required)
- `display_order`: `integer` (optional)
- `event_date`: `string | null` (optional)
- `expanded_body`: `string | null` (optional)
- `image_alt_text`: `string | null` (optional)
- `image_id`: `string | null` (optional)
- `is_enabled`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `slug`: `string` (required)
- `source_document_id`: `string | null` (optional)
- `source_title`: `string | null` (optional)
- `source_url`: `string | null` (optional)
- `summary`: `string` (required)
- `title`: `string` (required)
- `year_label`: `string` (required)

### `HistoryMilestoneSnapshot`

- `about_page_content_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `event_date`: `string | null` (optional)
- `expanded_body`: `string | null` (optional)
- `id`: `string | null` (optional)
- `image`: `object | null` (optional)
- `image_alt_text`: `string | null` (optional)
- `image_id`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `published_at`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `source_document`: `object | null` (optional)
- `source_document_id`: `string | null` (optional)
- `source_title`: `string | null` (optional)
- `source_url`: `string | null` (optional)
- `status`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)
- `year_label`: `string | null` (optional)

### `HistoryMilestoneUpdate`

- `display_order`: `integer | null` (optional)
- `event_date`: `string | null` (optional)
- `expanded_body`: `string | null` (optional)
- `image_alt_text`: `string | null` (optional)
- `image_id`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `source_document_id`: `string | null` (optional)
- `source_title`: `string | null` (optional)
- `source_url`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `year_label`: `string | null` (optional)

### `HomepageActionConfig`

- `enabled`: `boolean` (optional)
- `ends_at`: `string | null` (optional)
- `label`: `string | null` (optional)
- `starts_at`: `string | null` (optional)
- `url`: `string | null` (optional)

### `HomepageActionConfigUpdate`

- `enabled`: `boolean | null` (optional)
- `ends_at`: `string | null` (optional)
- `label`: `string | null` (optional)
- `starts_at`: `string | null` (optional)
- `url`: `string | null` (optional)

### `HomepageReportingConfig`

- `enabled`: `boolean` (optional)
- `ends_at`: `string | null` (optional)
- `instructions_url`: `string | null` (optional)
- `location`: `string | null` (optional)
- `starts_at`: `string | null` (optional)
- `title`: `string` (optional)

### `HomepageReportingConfigUpdate`

- `enabled`: `boolean | null` (optional)
- `ends_at`: `string | null` (optional)
- `instructions_url`: `string | null` (optional)
- `location`: `string | null` (optional)
- `starts_at`: `string | null` (optional)
- `title`: `string | null` (optional)

### `IdentitySnapshot`

- `jti`: `string` (required)
- `mfa_enabled`: `boolean` (optional)
- `mfa_verified_at`: `number | null` (optional)
- `person_id`: `string | null` (optional)
- `scope_grants`: `array<object>` (required)
- `sub`: `string` (required)

### `ImportColumnRead`

- `description`: `string | null` (optional)
- `key`: `string` (required)
- `label`: `string` (required)
- `required`: `boolean` (optional)
- `sample`: `- | null` (optional)

### `ImportCommitRead`

- `created_rows`: `integer` (required)
- `failed_rows`: `integer` (required)
- `resource`: `string` (required)
- `rows`: `array<ImportCommitRowRead>` (required)
- `skipped_rows`: `integer` (required)
- `total_rows`: `integer` (required)

### `ImportCommitRequest`

- `mode`: `string` (optional)
- `rows`: `array<object>` (required)

### `ImportCommitRowRead`

- `errors`: `array<string>` (optional)
- `id`: `string | null` (optional)
- `row_number`: `integer` (required)
- `status`: `string` (required)

### `ImportJobRead`

- `error`: `string | null` (optional)
- `job_id`: `string` (required)
- `resource`: `string | null` (optional)
- `result`: `ImportCommitRead | null` (optional)
- `status`: `string` (required)

### `ImportPreviewRead`

- `duplicate_rows`: `integer` (required)
- `invalid_rows`: `integer` (required)
- `resource`: `string` (required)
- `rows`: `array<ImportPreviewRow>` (required)
- `total_rows`: `integer` (required)
- `valid_rows`: `integer` (required)

### `ImportPreviewRow`

- `errors`: `array<string>` (optional)
- `payload`: `object | null` (optional)
- `raw`: `object` (required)
- `row_number`: `integer` (required)
- `status`: `string` (required)
- `warnings`: `array<string>` (optional)

### `ImportResourceRead`

- `accepted_formats`: `array<string>` (optional)
- `columns`: `array<ImportColumnRead>` (required)
- `description`: `string` (required)
- `key`: `string` (required)
- `label`: `string` (required)
- `scope`: `string` (required)

### `InquiryAssign`

- `assigned_to_user_id`: `string | null` (optional)

### `InquiryNoteCreate`

- `body`: `string` (required)

### `InquiryReplyCreate`

- `body`: `string` (required)
- `idempotency_key`: `string` (required)

### `InquiryStatusUpdate`

- `status`: `string` (required)

### `InstitutionalPageCreate`

- `effective_date`: `string | null` (optional)
- `eyebrow`: `string | null` (optional)
- `hero_alt_text`: `string | null` (optional)
- `hero_media_id`: `string | null` (optional)
- `introduction`: `string` (required)
- `is_enabled`: `boolean` (optional)
- `mobile_hero_media_id`: `string | null` (optional)
- `page_type`: `string` (required)
- `primary_document_id`: `string | null` (optional)
- `reporting_period_label`: `string | null` (optional)
- `review_date`: `string | null` (optional)
- `seo_description`: `string | null` (optional)
- `seo_title`: `string | null` (optional)
- `slug`: `string` (required)
- `title`: `string` (required)
- `university_info_id`: `string` (required)

### `InstitutionalPageItemCreate`

- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `icon_key`: `string | null` (optional)
- `image_alt_text`: `string | null` (optional)
- `image_id`: `string | null` (optional)
- `is_enabled`: `boolean` (optional)
- `link_label`: `string | null` (optional)
- `link_url`: `string | null` (optional)
- `section_id`: `string` (required)
- `supporting_label`: `string | null` (optional)
- `supporting_value`: `string | null` (optional)
- `title`: `string` (required)

### `InstitutionalPageItemSnapshot`

- `created_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `icon_key`: `string | null` (optional)
- `id`: `string | null` (optional)
- `image_alt_text`: `string | null` (optional)
- `image_id`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `link_label`: `string | null` (optional)
- `link_url`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `section_id`: `string | null` (optional)
- `status`: `string | null` (optional)
- `supporting_label`: `string | null` (optional)
- `supporting_value`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `InstitutionalPageItemUpdate`

- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `icon_key`: `string | null` (optional)
- `image_alt_text`: `string | null` (optional)
- `image_id`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `link_label`: `string | null` (optional)
- `link_url`: `string | null` (optional)
- `supporting_label`: `string | null` (optional)
- `supporting_value`: `string | null` (optional)
- `title`: `string | null` (optional)

### `InstitutionalPageSectionCreate`

- `body`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `eyebrow`: `string | null` (optional)
- `heading`: `string` (required)
- `institutional_page_id`: `string` (required)
- `is_enabled`: `boolean` (optional)
- `layout_variant`: `string` (optional)
- `media_alt_text`: `string | null` (optional)
- `primary_media_id`: `string | null` (optional)
- `section_type`: `string` (required)
- `slug`: `string` (required)
- `summary`: `string | null` (optional)
- `theme`: `string` (optional)
- `video_url`: `string | null` (optional)

### `InstitutionalPageSectionSnapshot`

- `body`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `eyebrow`: `string | null` (optional)
- `heading`: `string | null` (optional)
- `id`: `string | null` (optional)
- `institutional_page_id`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `layout_variant`: `string | null` (optional)
- `media_alt_text`: `string | null` (optional)
- `primary_media_id`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `section_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `theme`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `video_url`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `InstitutionalPageSectionUpdate`

- `body`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `eyebrow`: `string | null` (optional)
- `heading`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `layout_variant`: `string | null` (optional)
- `media_alt_text`: `string | null` (optional)
- `primary_media_id`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `theme`: `string | null` (optional)
- `video_url`: `string | null` (optional)

### `InstitutionalPageSnapshot`

- `created_at`: `string | null` (optional)
- `effective_date`: `string | null` (optional)
- `eyebrow`: `string | null` (optional)
- `hero_alt_text`: `string | null` (optional)
- `hero_media_id`: `string | null` (optional)
- `id`: `string | null` (optional)
- `introduction`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `mobile_hero_media_id`: `string | null` (optional)
- `page_type`: `string | null` (optional)
- `primary_document_id`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `reporting_period_label`: `string | null` (optional)
- `review_date`: `string | null` (optional)
- `seo_description`: `string | null` (optional)
- `seo_title`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `title`: `string | null` (optional)
- `university_info_id`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `InstitutionalPageUpdate`

- `effective_date`: `string | null` (optional)
- `eyebrow`: `string | null` (optional)
- `hero_alt_text`: `string | null` (optional)
- `hero_media_id`: `string | null` (optional)
- `introduction`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `mobile_hero_media_id`: `string | null` (optional)
- `primary_document_id`: `string | null` (optional)
- `reporting_period_label`: `string | null` (optional)
- `review_date`: `string | null` (optional)
- `seo_description`: `string | null` (optional)
- `seo_title`: `string | null` (optional)
- `title`: `string | null` (optional)

### `InstitutionalSectionDocumentCreate`

- `display_order`: `integer` (optional)
- `document_id`: `string` (required)
- `is_enabled`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `public_label`: `string | null` (optional)

### `InstitutionalSectionDocumentSnapshot`

- `created_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `document`: `object | null` (optional)
- `document_id`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `public_label`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `InstitutionalSectionDocumentUpdate`

- `display_order`: `integer | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `public_label`: `string | null` (optional)

### `IntakeCreate`

- `academic_calendar_id`: `string` (required)
- `application_closes_at`: `string | null` (optional)
- `application_end`: `string` (required)
- `application_opens_at`: `string | null` (optional)
- `application_override`: `string` (optional)
- `application_start`: `string` (required)
- `code`: `string` (required)
- `cover_image_id`: `string | null` (optional)
- `homepage_priority`: `integer` (optional)
- `is_active`: `boolean` (optional)
- `is_featured_on_homepage`: `boolean` (optional)
- `is_open`: `boolean` (optional)
- `late_application_closes_at`: `string | null` (optional)
- `late_application_end`: `string | null` (optional)
- `late_applications_enabled`: `boolean` (optional)
- `max_students`: `integer | null` (optional)
- `name`: `string` (required)
- `override_expires_at`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `timezone`: `string` (optional)

### `IntakeHomepageAdmissionRead`

- `admission_letter`: `HomepageActionConfig` (optional)
- `application_closes_at`: `string` (required)
- `application_opens_at`: `string` (required)
- `application_override`: `string` (required)
- `apply`: `HomepageActionConfig` (optional)
- `check_requirements`: `HomepageActionConfig` (optional)
- `explore_programmes`: `HomepageActionConfig` (optional)
- `homepage_priority`: `integer` (required)
- `intake_code`: `string` (required)
- `intake_id`: `string` (required)
- `intake_name`: `string` (required)
- `is_featured_on_homepage`: `boolean` (required)
- `late_application_closes_at`: `string | null` (optional)
- `late_applications_enabled`: `boolean` (required)
- `override_expires_at`: `string | null` (optional)
- `reporting`: `HomepageReportingConfig` (optional)
- `reporting_instructions`: `HomepageActionConfig` (optional)
- `timezone`: `string` (required)

### `IntakeHomepageAdmissionUpdate`

- `admission_letter`: `HomepageActionConfigUpdate | null` (optional)
- `application_closes_at`: `string | null` (optional)
- `application_opens_at`: `string | null` (optional)
- `application_override`: `string | null` (optional)
- `apply`: `HomepageActionConfigUpdate | null` (optional)
- `check_requirements`: `HomepageActionConfigUpdate | null` (optional)
- `explore_programmes`: `HomepageActionConfigUpdate | null` (optional)
- `homepage_priority`: `integer | null` (optional)
- `is_featured_on_homepage`: `boolean | null` (optional)
- `late_application_closes_at`: `string | null` (optional)
- `late_applications_enabled`: `boolean | null` (optional)
- `override_expires_at`: `string | null` (optional)
- `reporting`: `HomepageReportingConfigUpdate | null` (optional)
- `reporting_instructions`: `HomepageActionConfigUpdate | null` (optional)
- `timezone`: `string | null` (optional)

### `IntakeSnapshot`

- `academic_calendar`: `object | null` (optional)
- `academic_calendar_id`: `string | null` (optional)
- `application_closes_at`: `string | null` (optional)
- `application_end`: `string | null` (optional)
- `application_opens_at`: `string | null` (optional)
- `application_override`: `string | null` (optional)
- `application_start`: `string | null` (optional)
- `code`: `string | null` (optional)
- `cover_image`: `object | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `homepage_priority`: `integer | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured_on_homepage`: `boolean | null` (optional)
- `is_open`: `boolean | null` (optional)
- `late_application_closes_at`: `string | null` (optional)
- `late_application_end`: `string | null` (optional)
- `late_applications_enabled`: `boolean | null` (optional)
- `max_students`: `integer | null` (optional)
- `name`: `string | null` (optional)
- `override_expires_at`: `string | null` (optional)
- `programmes`: `array<ProgrammeIntakeRead> | null` (optional)
- `slug`: `string | null` (optional)
- `timezone`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `IntakeUpdate`

- `academic_calendar_id`: `string | null` (optional)
- `application_closes_at`: `string | null` (optional)
- `application_end`: `string | null` (optional)
- `application_opens_at`: `string | null` (optional)
- `application_override`: `string | null` (optional)
- `application_start`: `string | null` (optional)
- `code`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `homepage_priority`: `integer | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured_on_homepage`: `boolean | null` (optional)
- `is_open`: `boolean | null` (optional)
- `late_application_closes_at`: `string | null` (optional)
- `late_application_end`: `string | null` (optional)
- `late_applications_enabled`: `boolean | null` (optional)
- `max_students`: `integer | null` (optional)
- `name`: `string | null` (optional)
- `override_expires_at`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `timezone`: `string | null` (optional)

### `InternalAuditBatch`

- `events`: `array<InternalAuditPayload>` (required)

### `InternalAuditBatchResult`

- `inserted`: `integer` (required)
- `received`: `integer` (required)
- `status`: `string` (required)

### `InternalAuditListResponse`

- `data`: `array<AuditLogRead>` (required)
- `message`: `string` (required)
- `meta`: `InternalAuditPageMeta` (required)
- `status`: `string` (required)

### `InternalAuditPageMeta`

- `has_next`: `boolean` (required)
- `page`: `integer` (required)
- `per_page`: `integer` (required)

### `InternalAuditPayload`

- `action`: `string` (required)
- `changes`: `object | null` (optional)
- `details`: `object | null` (optional)
- `error_message`: `string | null` (optional)
- `happened_at`: `string` (required)
- `id`: `string` (required)
- `ip_address`: `string | null` (optional)
- `request_method`: `string` (required)
- `request_path`: `string` (required)
- `resource_id`: `string | null` (optional)
- `resource_type`: `string | null` (optional)
- `route_name`: `string | null` (optional)
- `service_name`: `string` (required)
- `session_jti`: `string | null` (optional)
- `status`: `string` (required)
- `status_code`: `integer` (required)
- `user_agent`: `string | null` (optional)
- `user_id`: `string | null` (optional)

### `InternalDepartmentCheckResponse`

- `department_id`: `string` (required)
- `exists`: `boolean` (required)
- `school_id`: `string` (required)

### `InternalDepartmentSnapshot`

- `code`: `string | null` (optional)
- `department_type`: `string | null` (optional)
- `id`: `string` (required)
- `is_active`: `boolean` (required)
- `name`: `string` (required)
- `school_id`: `string | null` (optional)
- `slug`: `string` (required)

### `InternalEmailPayload`

- `html_body`: `string | null` (optional)
- `subject`: `string` (required)
- `text_body`: `string` (required)
- `to_email`: `string` (required)

### `InternalEmailResponse`

- `provider_id`: `string | null` (optional)

### `InternalEventListResponse`

- `data`: `array<InternalEventSnapshot>` (required)
- `message`: `string` (required)
- `meta`: `object` (required)
- `status`: `string` (required)

### `InternalEventSnapshot`

- `approved_at`: `string | null` (optional)
- `approved_by_id`: `string | null` (optional)
- `archived_at`: `string | null` (optional)
- `author_user_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `end_date`: `string | null` (optional)
- `expires_at`: `string | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_published`: `boolean | null` (optional)
- `is_virtual`: `boolean | null` (optional)
- `location`: `string | null` (optional)
- `meeting_link`: `string | null` (optional)
- `owner_portal`: `string | null` (optional)
- `owner_scope_id`: `string | null` (optional)
- `owner_scope_type`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `published_by_id`: `string | null` (optional)
- `rejection_reason`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `reviewed_at`: `string | null` (optional)
- `reviewed_by_id`: `string | null` (optional)
- `revision_notes`: `string | null` (optional)
- `rich_text`: `string | null` (optional)
- `scheduled_publish_at`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `start_date`: `string | null` (optional)
- `status`: `string | null` (optional)
- `structured_content`: `object | null` (optional)
- `submitted_at`: `string | null` (optional)
- `submitted_by_id`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `unpublished_at`: `string | null` (optional)
- `unpublished_by_id`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `updated_by_id`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `InternalMediaResolvePayload`

- `ids`: `array<string>` (required)

### `InternalMediaResolveResponse`

- `data`: `array<InternalMediaSnapshot>` (required)
- `status`: `string` (required)

### `InternalMediaSnapshot`

- `alt_text`: `string | null` (optional)
- `caption`: `string | null` (optional)
- `description`: `string | null` (optional)
- `id`: `string` (required)
- `is_public`: `boolean` (required)
- `media_type`: `string` (required)
- `thumbnail_url`: `string | null` (optional)
- `title`: `string | null` (optional)
- `url`: `string` (required)

### `InternalNotificationBroadcastPayload`

- `action_url`: `string | null` (optional)
- `channels`: `array<string>` (optional)
- `message`: `string` (required)
- `notification_type`: `string` (optional)
- `payload`: `object | null` (optional)
- `priority`: `string` (optional)
- `role_names`: `array<string>` (optional)
- `subject`: `string | null` (optional)
- `title`: `string` (required)

### `InternalNotificationBroadcastResponse`

- `notification_ids`: `array<string>` (required)
- `recipient_count`: `integer` (required)

### `InternalPersonResolvePayload`

- `ids`: `array<string>` (required)

### `InternalPersonResolveResponse`

- `data`: `array<InternalPersonResolveSnapshot>` (required)
- `status`: `string` (required)

### `InternalPersonResolveSnapshot`

- `academic_rank`: `string | null` (optional)
- `display_name`: `string` (required)
- `full_name`: `string` (required)
- `id`: `string` (required)
- `institutional_role`: `string | null` (optional)
- `name`: `string` (required)
- `photo_url`: `string | null` (optional)
- `slug`: `string` (required)
- `specialization`: `string | null` (optional)
- `title`: `string | null` (optional)

### `InternalPersonSnapshot`

- `department_id`: `string | null` (optional)
- `display_name`: `string` (required)
- `email`: `string | null` (optional)
- `first_name`: `string | null` (optional)
- `id`: `string` (required)
- `is_active`: `boolean` (required)
- `last_name`: `string | null` (optional)
- `photo_id`: `string | null` (optional)

### `InternalPublicMediaSnapshot`

- `alt_text`: `string | null` (optional)
- `caption`: `string | null` (optional)
- `description`: `string | null` (optional)
- `file_size`: `integer` (required)
- `filename`: `string` (required)
- `id`: `string` (required)
- `is_public`: `boolean` (required)
- `media_type`: `string` (required)
- `mime_type`: `string` (required)
- `original_filename`: `string | null` (optional)
- `thumbnail_url`: `string | null` (optional)
- `title`: `string | null` (optional)
- `url`: `string` (required)

### `InternalReferenceCheckResponse`

- `exists`: `boolean` (required)
- `id`: `string` (required)
- `kind`: `string` (required)

### `InternalStaffAssignmentSnapshot`

- `display_order`: `integer` (required)
- `entity_id`: `string | null` (optional)
- `entity_type`: `string | null` (optional)
- `id`: `string` (required)
- `is_public`: `boolean` (required)
- `person`: `InternalStaffPersonSnapshot | null` (optional)
- `person_id`: `string` (required)
- `role`: `string | null` (optional)
- `status`: `string | null` (optional)
- `title`: `string | null` (optional)

### `InternalStaffPersonSnapshot`

- `display_name`: `string` (required)
- `email`: `string | null` (optional)
- `id`: `string` (required)
- `photo_id`: `string | null` (optional)

### `MediaAttachmentSummary`

- `file_size`: `integer` (required)
- `filename`: `string` (required)
- `id`: `string` (required)
- `is_public`: `boolean` (required)
- `media_type`: `string` (required)
- `mime_type`: `string` (required)
- `original_filename`: `string` (required)
- `thumbnail_url`: `string | null` (optional)
- `title`: `string | null` (optional)
- `url`: `string` (required)

### `MediaFolderCreate`

- `description`: `string | null` (optional)
- `is_public`: `boolean` (optional)
- `name`: `string` (required)
- `parent_id`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)

### `MediaFolderSnapshot`

- `children`: `array<object> | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `files`: `array<object> | null` (optional)
- `id`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `links`: `array<object> | null` (optional)
- `name`: `string | null` (optional)
- `parent`: `object | null` (optional)
- `parent_id`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `MediaFolderUpdate`

- `description`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `parent_id`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)

### `MediaLinkCreate`

- `display_order`: `integer` (optional)
- `entity_id`: `string` (required)
- `entity_type`: `string` (required)
- `folder_id`: `string | null` (optional)
- `is_public`: `boolean` (optional)
- `media_id`: `string` (required)
- `role`: `string` (optional)

### `MediaLinkSnapshot`

- `approved_at`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `entity_id`: `string | null` (optional)
- `entity_type`: `string | null` (optional)
- `folder`: `object | null` (optional)
- `folder_id`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_published`: `boolean | null` (optional)
- `media`: `MediaAttachmentSummary | null` (optional)
- `media_id`: `string | null` (optional)
- `owner_portal`: `string | null` (optional)
- `owner_scope_id`: `string | null` (optional)
- `owner_scope_type`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `role`: `string | null` (optional)
- `status`: `string | null` (optional)
- `submitted_at`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `MediaLinkUpdate`

- `display_order`: `integer | null` (optional)
- `entity_id`: `string | null` (optional)
- `entity_type`: `string | null` (optional)
- `folder_id`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `media_id`: `string | null` (optional)
- `role`: `string | null` (optional)

### `MediaRoleDefinitionRead`

- `label`: `string` (required)
- `media_type`: `string` (required)
- `multiple`: `boolean` (optional)
- `required`: `boolean` (optional)

### `MediaSnapshot`

- `alt_text`: `string | null` (optional)
- `caption`: `string | null` (optional)
- `cdn_url`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `credit`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `duration`: `integer | null` (optional)
- `file_hash`: `string | null` (optional)
- `file_size`: `integer | null` (optional)
- `filename`: `string | null` (optional)
- `folder`: `object | null` (optional)
- `folder_id`: `string | null` (optional)
- `height`: `integer | null` (optional)
- `id`: `string | null` (optional)
- `is_processed`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `links`: `array<object> | null` (optional)
- `media_type`: `string | null` (optional)
- `metadata`: `object | null` (optional)
- `mime_type`: `string | null` (optional)
- `original_filename`: `string | null` (optional)
- `public_url`: `string | null` (optional)
- `storage_path`: `string | null` (optional)
- `storage_provider`: `string | null` (optional)
- `tags`: `array<string> | null` (optional)
- `thumbnail_url`: `string | null` (optional)
- `thumbnails`: `object | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `uploaded_by`: `object | null` (optional)
- `uploaded_by_id`: `string | null` (optional)
- `url`: `string | null` (optional)
- `width`: `integer | null` (optional)

### `MediaUpdate`

- `alt_text`: `string | null` (optional)
- `caption`: `string | null` (optional)
- `credit`: `string | null` (optional)
- `description`: `string | null` (optional)
- `folder_id`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `media_type`: `string | null` (optional)
- `metadata`: `object | null` (optional)
- `tags`: `array<string> | null` (optional)
- `thumbnail_url`: `string | null` (optional)
- `thumbnails`: `object | null` (optional)
- `title`: `string | null` (optional)

### `MfaStatusResponse`

- `enabled`: `boolean` (required)
- `recovery_codes_remaining`: `integer` (required)
- `verified_at`: `string | null` (required)

### `MyProfileUpdate`

- `alternative_email`: `string | null` (optional)
- `alternative_phone`: `string | null` (optional)
- `awards_honors`: `array<object> | null` (optional)
- `bio`: `string | null` (optional)
- `courses_taught`: `array<string> | null` (optional)
- `cv_file_id`: `string | null` (optional)
- `education_background`: `array<object> | null` (optional)
- `email`: `string | null` (optional)
- `first_name`: `string | null` (optional)
- `full_bio`: `string | null` (optional)
- `full_name`: `string | null` (optional)
- `google_scholar_id`: `string | null` (optional)
- `google_scholar_url`: `string | null` (optional)
- `is_researcher`: `boolean | null` (optional)
- `last_name`: `string | null` (optional)
- `linkedin_url`: `string | null` (optional)
- `middle_name`: `string | null` (optional)
- `office_hours`: `object | null` (optional)
- `office_location`: `string | null` (optional)
- `office_phone`: `string | null` (optional)
- `orcid`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `photo_id`: `string | null` (optional)
- `professional_memberships`: `array<object> | null` (optional)
- `publication_records`: `array<object> | null` (optional)
- `qualifications`: `array<QualificationItem> | null` (optional)
- `research_grants_won`: `array<object> | null` (optional)
- `research_interests`: `array<string> | null` (optional)
- `researchgate_url`: `string | null` (optional)
- `scopus_id`: `string | null` (optional)
- `specialization`: `string | null` (optional)
- `teaching_areas`: `array<string> | null` (optional)
- `title`: `string | null` (optional)
- `website_url`: `string | null` (optional)

### `NavigationItem`

- `code`: `string | null` (optional)
- `department_type`: `string | null` (optional)
- `division_type`: `string | null` (optional)
- `id`: `string | null` (optional)
- `name`: `string | null` (optional)
- `slug`: `string | null` (optional)

### `NavigationPayload`

- `clubs`: `array<NavigationItem>` (required)
- `departments`: `array<NavigationItem>` (required)
- `divisions`: `array<NavigationItem>` (required)
- `schools`: `array<NavigationItem>` (required)
- `wings`: `array<NavigationItem>` (required)

### `NewsCreate`

- `display_order`: `integer` (optional)
- `featured_media_id`: `string | null` (optional)
- `is_featured`: `boolean` (optional)
- `is_main`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `rich_text`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string` (required)
- `structured_content`: `object | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)

### `NewsSnapshot`

- `approved_at`: `string | null` (optional)
- `approved_by_id`: `string | null` (optional)
- `archived_at`: `string | null` (optional)
- `author`: `object | null` (optional)
- `author_user_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `expires_at`: `string | null` (optional)
- `featured_media`: `object | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_published`: `boolean | null` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `owner_portal`: `string | null` (optional)
- `owner_scope_id`: `string | null` (optional)
- `owner_scope_type`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `published_by_id`: `string | null` (optional)
- `rejection_reason`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `reviewed_at`: `string | null` (optional)
- `reviewed_by_id`: `string | null` (optional)
- `revision_notes`: `string | null` (optional)
- `rich_text`: `string | null` (optional)
- `scheduled_publish_at`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `structured_content`: `object | null` (optional)
- `submitted_at`: `string | null` (optional)
- `submitted_by_id`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `unpublished_at`: `string | null` (optional)
- `unpublished_by_id`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `updated_by`: `object | null` (optional)
- `updated_by_id`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `NewsUpdate`

- `display_order`: `integer | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_main`: `boolean | null` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `rich_text`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `structured_content`: `object | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)

### `NewsletterCreate`

- `content`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `edition`: `string | null` (optional)
- `is_public`: `boolean` (optional)
- `pdf_file_id`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `scheduled_send_at`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)

### `NewsletterScheduleRequest`

- `scheduled_send_at`: `string` (required)

### `NewsletterSnapshot`

- `content`: `string | null` (optional)
- `cover_image`: `object | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `edition`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `pdf_file`: `object | null` (optional)
- `pdf_file_id`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `recipients_count`: `integer | null` (optional)
- `scheduled_send_at`: `string | null` (optional)
- `send_error`: `string | null` (optional)
- `send_status`: `string | null` (optional)
- `sent_at`: `string | null` (optional)
- `sent_count`: `integer | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `updated_by`: `object | null` (optional)
- `updated_by_id`: `string | null` (optional)
- `view_count`: `integer | null` (optional)

### `NewsletterSubscriberCreate`

- `categories`: `array<string> | null` (optional)
- `email`: `string` (required)
- `frequency`: `string` (optional)
- `name`: `string | null` (optional)

### `NewsletterSubscriberSnapshot`

- `categories`: `array<string> | null` (optional)
- `created_at`: `string | null` (optional)
- `email`: `string | null` (optional)
- `frequency`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_verified`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `status`: `string | null` (optional)
- `subscribed_at`: `string | null` (optional)
- `unsubscribed_at`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `NewsletterUpdate`

- `content`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `edition`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `pdf_file_id`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `scheduled_send_at`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)

### `NotificationBroadcastCreate`

- `action_url`: `string | null` (optional)
- `audience_scope_id`: `string | null` (optional)
- `audience_scope_type`: `string | null` (optional)
- `channels`: `array<string>` (optional)
- `expires_at`: `string | null` (optional)
- `message`: `string | null` (optional)
- `notification_type`: `string` (optional)
- `payload`: `object | null` (optional)
- `priority`: `string` (optional)
- `role_names`: `array<string>` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `subject`: `string | null` (optional)
- `template_code`: `string | null` (optional)
- `template_context`: `object | null` (optional)
- `title`: `string | null` (optional)
- `user_ids`: `array<string>` (optional)

### `NotificationBroadcastPreview`

- `recipient_count`: `integer` (required)
- `sample_user_ids`: `array<string>` (optional)
- `truncated`: `boolean` (required)

### `NotificationBroadcastResult`

- `notification_ids`: `array<string>` (optional)
- `recipient_count`: `integer` (required)

### `NotificationCreate`

- `action_url`: `string | null` (optional)
- `channels`: `array<string>` (optional)
- `expires_at`: `string | null` (optional)
- `message`: `string` (required)
- `notification_type`: `string` (optional)
- `payload`: `object | null` (optional)
- `priority`: `string` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `subject`: `string | null` (optional)
- `template_id`: `string | null` (optional)
- `title`: `string` (required)
- `user_id`: `string` (required)

### `NotificationDeliveryRead`

- `attempts`: `integer` (required)
- `channel`: `string` (required)
- `created_at`: `string` (required)
- `dead_letter_reason`: `string | null` (optional)
- `dead_lettered_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `delivered_at`: `string | null` (optional)
- `error_message`: `string | null` (optional)
- `expires_at`: `string | null` (optional)
- `failed_at`: `string | null` (optional)
- `id`: `string` (required)
- `metadata`: `object | null` (optional)
- `next_retry_at`: `string | null` (optional)
- `notification`: `object | null` (optional)
- `notification_id`: `string` (required)
- `provider_message_id`: `string | null` (optional)
- `recipient`: `string | null` (optional)
- `scheduled_for`: `string | null` (optional)
- `sent_at`: `string | null` (optional)
- `status`: `string` (required)
- `updated_at`: `string` (required)

### `NotificationDeliverySnapshot`

- `attempts`: `integer | null` (optional)
- `channel`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `dead_letter_reason`: `string | null` (optional)
- `dead_lettered_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `delivered_at`: `string | null` (optional)
- `error_message`: `string | null` (optional)
- `expires_at`: `string | null` (optional)
- `failed_at`: `string | null` (optional)
- `id`: `string | null` (optional)
- `metadata`: `object | null` (optional)
- `next_retry_at`: `string | null` (optional)
- `notification`: `object | null` (optional)
- `notification_id`: `string | null` (optional)
- `provider_message_id`: `string | null` (optional)
- `recipient`: `string | null` (optional)
- `scheduled_for`: `string | null` (optional)
- `sent_at`: `string | null` (optional)
- `status`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `NotificationPreferences`

- `email`: `boolean` (optional)
- `in_app`: `boolean` (optional)
- `push`: `boolean` (optional)
- `sms`: `boolean` (optional)

### `NotificationSnapshot`

- `action_url`: `string | null` (optional)
- `archived_at`: `string | null` (optional)
- `channels`: `array<string> | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `deliveries`: `array<NotificationDeliveryRead> | null` (optional)
- `dispatched_at`: `string | null` (optional)
- `expires_at`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_read`: `boolean | null` (optional)
- `message`: `string | null` (optional)
- `notification_type`: `string | null` (optional)
- `payload`: `object | null` (optional)
- `priority`: `string | null` (optional)
- `read_at`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `source_event_id`: `string | null` (optional)
- `subject`: `string | null` (optional)
- `template`: `object | null` (optional)
- `template_id`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `user`: `object | null` (optional)
- `user_id`: `string | null` (optional)

### `NotificationTemplateCreate`

- `channels`: `array<string>` (optional)
- `code`: `string` (required)
- `description`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `message_template`: `string` (required)
- `name`: `string` (required)
- `subject_template`: `string | null` (optional)
- `title_template`: `string` (required)
- `variables`: `array<string> | null` (optional)

### `NotificationTemplateSnapshot`

- `channels`: `array<string> | null` (optional)
- `code`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `message_template`: `string | null` (optional)
- `name`: `string | null` (optional)
- `notifications`: `array<object> | null` (optional)
- `subject_template`: `string | null` (optional)
- `title_template`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `variables`: `array<string> | null` (optional)

### `NotificationTemplateUpdate`

- `channels`: `array<string> | null` (optional)
- `description`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `message_template`: `string | null` (optional)
- `name`: `string | null` (optional)
- `subject_template`: `string | null` (optional)
- `title_template`: `string | null` (optional)
- `variables`: `array<string> | null` (optional)

### `NotificationUpdateCount`

- `updated`: `integer` (required)

### `OfficeChannels`

- `email`: `string | null` (optional)
- `escalation_contact`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `physical_office`: `string | null` (optional)
- `service_hours`: `string | null` (optional)

### `PageCmsSourceSummary`

- `id`: `string` (required)
- `label`: `string` (required)
- `metadata`: `object` (optional)
- `published_at`: `string | null` (optional)
- `secondary_label`: `string | null` (optional)
- `selectable`: `boolean` (optional)
- `source_type`: `string` (required)
- `status`: `string` (required)
- `thumbnail_url`: `string | null` (optional)

### `PageCompositionResponse`

- `page_key`: `string` (required)
- `partnership_spotlights`: `array<PartnershipSpotlightRead>` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string` (required)
- `sections`: `array<PageSectionRead>` (optional)

### `PagePreviewItem`

- `body_text`: `string | null` (optional)
- `content`: `object | null` (optional)
- `cta_description`: `string | null` (optional)
- `cta_label`: `string | null` (optional)
- `cta_url`: `string | null` (optional)
- `display_order`: `integer` (required)
- `editorial_overrides`: `object | null` (optional)
- `id`: `string` (required)
- `is_enabled`: `boolean` (required)
- `item_type`: `string` (required)
- `media_alt_text`: `string | null` (optional)
- `media_caption`: `string | null` (optional)
- `page_section_id`: `string` (required)
- `source`: `PagePreviewResolvedSource | null` (optional)
- `source_id`: `string | null` (optional)
- `source_type`: `string | null` (optional)
- `subtitle`: `string | null` (optional)
- `title`: `string | null` (optional)
- `video_duration_seconds`: `integer | null` (optional)
- `video_provider`: `string | null` (optional)
- `video_url`: `string | null` (optional)

### `PagePreviewMedia`

- `alt_text`: `string | null` (optional)
- `caption`: `string | null` (optional)
- `cdn_url`: `string | null` (optional)
- `duration`: `integer | null` (optional)
- `filename`: `string` (required)
- `height`: `integer | null` (optional)
- `id`: `string` (required)
- `media_type`: `string` (required)
- `mime_type`: `string` (required)
- `original_filename`: `string` (required)
- `public_url`: `string | null` (optional)
- `thumbnail_url`: `string | null` (optional)
- `title`: `string | null` (optional)
- `url`: `string` (required)
- `width`: `integer | null` (optional)

### `PagePreviewMediaLink`

- `display_order`: `integer` (required)
- `entity_id`: `string` (required)
- `entity_type`: `string` (required)
- `id`: `string` (required)
- `media`: `PagePreviewMedia` (required)
- `media_id`: `string` (required)
- `role`: `string` (required)

### `PagePreviewResolvedSource`

- `id`: `string` (required)
- `label`: `string` (required)
- `metadata`: `object` (optional)
- `published_at`: `string | null` (optional)
- `secondary_label`: `string | null` (optional)
- `selectable`: `boolean` (optional)
- `source_type`: `string` (required)
- `status`: `string` (required)
- `thumbnail_url`: `string | null` (optional)

### `PagePreviewResponse`

- `issues`: `array<PageValidationIssue>` (optional)
- `page_key`: `string` (required)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string` (required)
- `sections`: `array<PagePreviewSection>` (optional)

### `PagePreviewSection`

- `approved_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (required)
- `id`: `string` (required)
- `is_enabled`: `boolean` (required)
- `items`: `array<PagePreviewItem>` (optional)
- `layout_variant`: `string` (required)
- `media`: `object` (optional)
- `page_key`: `string` (required)
- `published_at`: `string | null` (optional)
- `revision`: `integer` (required)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string` (required)
- `section_key`: `string` (required)
- `settings`: `object | null` (optional)
- `status`: `string` (required)
- `subtitle`: `string | null` (optional)
- `title`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)
- `workflow_status`: `string` (required)

### `PageSectionCreate`

- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `is_enabled`: `boolean` (optional)
- `items`: `array<SectionItemCreate>` (optional)
- `layout_variant`: `string` (optional)
- `page_key`: `string` (required)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string` (optional)
- `section_key`: `string` (required)
- `settings`: `object | null` (optional)
- `subtitle`: `string | null` (optional)
- `title`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)

### `PageSectionMediaLinkUpdate`

- `display_order`: `integer` (optional)
- `id`: `string | null` (optional)
- `is_public`: `boolean` (optional)
- `media_id`: `string` (required)
- `role`: `string` (required)

### `PageSectionRead`

- `approved_at`: `string | null` (optional)
- `approved_by`: `object | null` (optional)
- `approved_by_id`: `string | null` (optional)
- `created_at`: `string` (required)
- `created_by`: `object | null` (optional)
- `created_by_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (required)
- `expires_at`: `string | null` (optional)
- `id`: `string` (required)
- `is_enabled`: `boolean` (required)
- `items`: `array<SectionItemRead>` (optional)
- `layout_variant`: `string` (required)
- `owner_portal`: `string | null` (optional)
- `owner_scope_id`: `string | null` (optional)
- `owner_scope_type`: `string | null` (optional)
- `page_key`: `string` (required)
- `published_at`: `string | null` (optional)
- `published_by`: `object | null` (optional)
- `published_by_id`: `string | null` (optional)
- `rejection_reason`: `string | null` (optional)
- `reviewed_at`: `string | null` (optional)
- `reviewed_by_id`: `string | null` (optional)
- `revision`: `integer` (required)
- `revision_notes`: `string | null` (optional)
- `scheduled_publish_at`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string` (required)
- `section_key`: `string` (required)
- `settings`: `object | null` (optional)
- `status`: `string` (required)
- `submitted_at`: `string | null` (optional)
- `submitted_by_id`: `string | null` (optional)
- `subtitle`: `string | null` (optional)
- `title`: `string | null` (optional)
- `unpublished_at`: `string | null` (optional)
- `unpublished_by_id`: `string | null` (optional)
- `updated_at`: `string` (required)
- `updated_by`: `object | null` (optional)
- `updated_by_id`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)
- `workflow_status`: `string` (optional)

### `PageSectionReorderRequest`

- `items`: `array<ReorderEntry>` (required)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string` (optional)

### `PageSectionSnapshot`

- `approved_at`: `string | null` (optional)
- `approved_by`: `object | null` (optional)
- `approved_by_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `created_by`: `object | null` (optional)
- `created_by_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `expires_at`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `items`: `array<SectionItemRead> | null` (optional)
- `layout_variant`: `string | null` (optional)
- `owner_portal`: `string | null` (optional)
- `owner_scope_id`: `string | null` (optional)
- `owner_scope_type`: `string | null` (optional)
- `page_key`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `published_by`: `object | null` (optional)
- `published_by_id`: `string | null` (optional)
- `rejection_reason`: `string | null` (optional)
- `reviewed_at`: `string | null` (optional)
- `reviewed_by_id`: `string | null` (optional)
- `revision`: `integer | null` (optional)
- `revision_notes`: `string | null` (optional)
- `scheduled_publish_at`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `section_key`: `string | null` (optional)
- `settings`: `object | null` (optional)
- `status`: `string | null` (optional)
- `submitted_at`: `string | null` (optional)
- `submitted_by_id`: `string | null` (optional)
- `subtitle`: `string | null` (optional)
- `title`: `string | null` (optional)
- `unpublished_at`: `string | null` (optional)
- `unpublished_by_id`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `updated_by`: `object | null` (optional)
- `updated_by_id`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `PageSectionUpdate`

- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `items`: `array<SectionItemUpdate> | null` (optional)
- `layout_variant`: `string | null` (optional)
- `media_links`: `array<PageSectionMediaLinkUpdate> | null` (optional)
- `page_key`: `string | null` (optional)
- `revision`: `integer | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `section_key`: `string | null` (optional)
- `settings`: `object | null` (optional)
- `subtitle`: `string | null` (optional)
- `title`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)

### `PageValidationIssue`

- `blocking`: `boolean` (required)
- `code`: `string` (required)
- `field`: `string | null` (optional)
- `item_id`: `string | null` (optional)
- `message`: `string` (required)
- `section_id`: `string` (required)
- `severity`: `string` (required)

### `PageValidationResponse`

- `issues`: `array<PageValidationIssue>` (optional)
- `page_key`: `string` (required)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string` (required)

### `PartnerDetailSnapshot`

- `about`: `string | null` (optional)
- `acronym`: `string | null` (optional)
- `address`: `string | null` (optional)
- `collaboration_areas`: `string | null` (optional)
- `contact_person_email`: `string | null` (optional)
- `contact_person_name`: `string | null` (optional)
- `contact_person_title`: `string | null` (optional)
- `country`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `document_url`: `string | null` (optional)
- `email`: `string | null` (optional)
- `id`: `string` (required)
- `is_active`: `boolean` (required)
- `is_featured`: `boolean` (required)
- `key_achievements`: `string | null` (optional)
- `logo_url`: `string | null` (optional)
- `mou_expiry_date`: `string | null` (optional)
- `mou_signed_date`: `string | null` (optional)
- `name`: `string` (required)
- `partner_type`: `string` (required)
- `partnership_end`: `string | null` (optional)
- `partnership_level`: `string | null` (optional)
- `partnership_start`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `slug`: `string` (required)
- `social_links`: `object | null` (optional)
- `status`: `string` (required)
- `updated_at`: `string | null` (optional)
- `website`: `string | null` (optional)

### `PartnerListSnapshot`

- `acronym`: `string | null` (optional)
- `country`: `string | null` (optional)
- `id`: `string` (required)
- `is_active`: `boolean` (required)
- `is_featured`: `boolean` (required)
- `name`: `string` (required)
- `partner_type`: `string` (required)
- `slug`: `string` (required)
- `status`: `string` (required)

### `PartnershipSpotlightCreate`

- `headline`: `string` (required)
- `is_enabled`: `boolean` (optional)
- `opportunities`: `array<object> | null` (optional)
- `pillars`: `array<object> | null` (optional)
- `primary_cta_label`: `string | null` (optional)
- `primary_cta_source`: `string` (optional)
- `primary_cta_url`: `string | null` (optional)
- `source_id`: `string` (required)
- `source_type`: `string` (optional)
- `summary`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)

### `PartnershipSpotlightRead`

- `approved_at`: `string | null` (optional)
- `approved_by_id`: `string | null` (optional)
- `created_at`: `string` (required)
- `expires_at`: `string | null` (optional)
- `headline`: `string` (required)
- `id`: `string` (required)
- `is_enabled`: `boolean` (required)
- `opportunities`: `array<object> | null` (optional)
- `owner_portal`: `string | null` (optional)
- `owner_scope_id`: `string | null` (optional)
- `owner_scope_type`: `string | null` (optional)
- `pillars`: `array<object> | null` (optional)
- `primary_cta_label`: `string | null` (optional)
- `primary_cta_source`: `string` (required)
- `primary_cta_url`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `published_by_id`: `string | null` (optional)
- `rejection_reason`: `string | null` (optional)
- `reviewed_at`: `string | null` (optional)
- `reviewed_by_id`: `string | null` (optional)
- `revision_notes`: `string | null` (optional)
- `scheduled_publish_at`: `string | null` (optional)
- `source_id`: `string` (required)
- `source_type`: `string` (required)
- `status`: `string` (required)
- `submitted_at`: `string | null` (optional)
- `submitted_by_id`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `unpublished_at`: `string | null` (optional)
- `unpublished_by_id`: `string | null` (optional)
- `updated_at`: `string` (required)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)
- `workflow_status`: `string` (optional)

### `PartnershipSpotlightSnapshot`

- `approved_at`: `string | null` (optional)
- `approved_by_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `expires_at`: `string | null` (optional)
- `headline`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `opportunities`: `array<object> | null` (optional)
- `owner_portal`: `string | null` (optional)
- `owner_scope_id`: `string | null` (optional)
- `owner_scope_type`: `string | null` (optional)
- `pillars`: `array<object> | null` (optional)
- `primary_cta_label`: `string | null` (optional)
- `primary_cta_source`: `string | null` (optional)
- `primary_cta_url`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `published_by_id`: `string | null` (optional)
- `rejection_reason`: `string | null` (optional)
- `reviewed_at`: `string | null` (optional)
- `reviewed_by_id`: `string | null` (optional)
- `revision_notes`: `string | null` (optional)
- `scheduled_publish_at`: `string | null` (optional)
- `source_id`: `string | null` (optional)
- `source_type`: `string | null` (optional)
- `status`: `string | null` (optional)
- `submitted_at`: `string | null` (optional)
- `submitted_by_id`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `unpublished_at`: `string | null` (optional)
- `unpublished_by_id`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `PartnershipSpotlightUpdate`

- `headline`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `opportunities`: `array<object> | null` (optional)
- `pillars`: `array<object> | null` (optional)
- `primary_cta_label`: `string | null` (optional)
- `primary_cta_source`: `string | null` (optional)
- `primary_cta_url`: `string | null` (optional)
- `source_id`: `string | null` (optional)
- `source_type`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)

### `PermissionSnapshot`

- `action`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `resource`: `string | null` (optional)
- `role_permissions`: `array<object> | null` (optional)
- `updated_at`: `string | null` (optional)

### `PersonCreate`

- `academic_rank`: `string | null` (optional)
- `alternative_email`: `string | null` (optional)
- `alternative_phone`: `string | null` (optional)
- `awards_honors`: `array<object> | null` (optional)
- `bio`: `string | null` (optional)
- `contract_type`: `string | null` (optional)
- `courses_taught`: `array<string> | null` (optional)
- `cv_file_id`: `string | null` (optional)
- `date_of_appointment`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `education_background`: `array<object> | null` (optional)
- `email`: `string` (required)
- `employee_number`: `string | null` (optional)
- `employment_end_date`: `string | null` (optional)
- `employment_start_date`: `string | null` (optional)
- `employment_type`: `string` (optional)
- `external_avatar_url`: `string | null` (optional)
- `external_source`: `string | null` (optional)
- `external_source_id`: `string | null` (optional)
- `first_name`: `string` (required)
- `full_bio`: `string | null` (optional)
- `full_name`: `string` (required)
- `google_scholar_id`: `string | null` (optional)
- `google_scholar_url`: `string | null` (optional)
- `h_index`: `integer | null` (optional)
- `institutional_role`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `is_researcher`: `boolean` (optional)
- `job_group`: `string | null` (optional)
- `last_name`: `string` (required)
- `leadership_message`: `string | null` (optional)
- `linkedin_url`: `string | null` (optional)
- `middle_name`: `string | null` (optional)
- `office_hours`: `object | null` (optional)
- `office_location`: `string | null` (optional)
- `office_phone`: `string | null` (optional)
- `orcid`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `photo_id`: `string | null` (optional)
- `professional_memberships`: `array<object> | null` (optional)
- `publication_records`: `array<object> | null` (optional)
- `publications_count`: `integer` (optional)
- `qualifications`: `array<QualificationItem> | null` (optional)
- `research_grants_won`: `array<object> | null` (optional)
- `research_interests`: `array<string> | null` (optional)
- `researchgate_url`: `string | null` (optional)
- `scopus_id`: `string | null` (optional)
- `show_on_directory`: `boolean` (optional)
- `skills`: `array<string> | null` (optional)
- `specialization`: `string | null` (optional)
- `teaching_areas`: `array<string> | null` (optional)
- `tenure_status`: `string | null` (optional)
- `title`: `string | null` (optional)
- `user_id`: `string | null` (optional)
- `website_url`: `string | null` (optional)

### `PersonRead`

- `academic_rank`: `string | null` (optional)
- `alternative_email`: `string | null` (optional)
- `alternative_phone`: `string | null` (optional)
- `alumni_profile`: `object | null` (optional)
- `assignments`: `array<object> | null` (optional)
- `awards_honors`: `array<object> | null` (optional)
- `bio`: `string | null` (optional)
- `contract_type`: `string | null` (optional)
- `courses_taught`: `array<string> | null` (optional)
- `created_at`: `string` (required)
- `cv_file`: `object | null` (optional)
- `cv_file_id`: `string | null` (optional)
- `cv_file_url`: `string | null` (optional)
- `date_of_appointment`: `string | null` (optional)
- `department`: `object | null` (optional)
- `department_id`: `string | null` (optional)
- `education_background`: `array<object> | null` (optional)
- `email`: `string` (required)
- `employee_number`: `string | null` (optional)
- `employment_end_date`: `string | null` (optional)
- `employment_start_date`: `string | null` (optional)
- `employment_type`: `string` (required)
- `external_avatar_url`: `string | null` (optional)
- `external_source`: `string | null` (optional)
- `external_source_id`: `string | null` (optional)
- `first_name`: `string` (required)
- `full_bio`: `string | null` (optional)
- `full_name`: `string` (required)
- `google_scholar_id`: `string | null` (optional)
- `google_scholar_url`: `string | null` (optional)
- `h_index`: `integer | null` (optional)
- `id`: `string` (required)
- `institutional_role`: `string | null` (optional)
- `is_active`: `boolean` (required)
- `is_featured`: `boolean` (optional)
- `is_public`: `boolean` (required)
- `is_researcher`: `boolean` (required)
- `job_group`: `string | null` (optional)
- `last_name`: `string` (required)
- `leadership_message`: `string | null` (optional)
- `linkedin_url`: `string | null` (optional)
- `middle_name`: `string | null` (optional)
- `office_hours`: `object | null` (optional)
- `office_location`: `string | null` (optional)
- `office_phone`: `string | null` (optional)
- `orcid`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `photo`: `object | null` (optional)
- `photo_id`: `string | null` (optional)
- `photo_url`: `string | null` (optional)
- `professional_memberships`: `array<object> | null` (optional)
- `programme_tutorships`: `array<object> | null` (optional)
- `publication_records`: `array<object> | null` (optional)
- `publications_count`: `integer` (optional)
- `qualifications`: `array<object> | null` (optional)
- `research_grants_won`: `array<object> | null` (optional)
- `research_interests`: `array<string> | null` (optional)
- `researchgate_url`: `string | null` (optional)
- `scopus_id`: `string | null` (optional)
- `show_on_directory`: `boolean` (optional)
- `skills`: `array<string> | null` (optional)
- `slug`: `string` (required)
- `specialization`: `string | null` (optional)
- `teaching_areas`: `array<string> | null` (optional)
- `tenure_status`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string` (required)
- `user`: `object | null` (optional)
- `user_id`: `string | null` (optional)
- `website_url`: `string | null` (optional)

### `PersonSnapshot`

- `academic_rank`: `string | null` (optional)
- `alternative_email`: `string | null` (optional)
- `alternative_phone`: `string | null` (optional)
- `alumni_profile`: `object | null` (optional)
- `assignments`: `array<object> | null` (optional)
- `awards_honors`: `array<object> | null` (optional)
- `bio`: `string | null` (optional)
- `contract_type`: `string | null` (optional)
- `courses_taught`: `array<string> | null` (optional)
- `created_at`: `string | null` (optional)
- `cv_file`: `object | null` (optional)
- `cv_file_id`: `string | null` (optional)
- `cv_file_url`: `string | null` (optional)
- `date_of_appointment`: `string | null` (optional)
- `department`: `object | null` (optional)
- `department_id`: `string | null` (optional)
- `education_background`: `array<object> | null` (optional)
- `email`: `string | null` (optional)
- `employee_number`: `string | null` (optional)
- `employment_end_date`: `string | null` (optional)
- `employment_start_date`: `string | null` (optional)
- `employment_type`: `string | null` (optional)
- `external_avatar_url`: `string | null` (optional)
- `external_source`: `string | null` (optional)
- `external_source_id`: `string | null` (optional)
- `first_name`: `string | null` (optional)
- `full_bio`: `string | null` (optional)
- `full_name`: `string | null` (optional)
- `google_scholar_id`: `string | null` (optional)
- `google_scholar_url`: `string | null` (optional)
- `h_index`: `integer | null` (optional)
- `id`: `string | null` (optional)
- `institutional_role`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_researcher`: `boolean | null` (optional)
- `job_group`: `string | null` (optional)
- `last_name`: `string | null` (optional)
- `leadership_message`: `string | null` (optional)
- `linkedin_url`: `string | null` (optional)
- `middle_name`: `string | null` (optional)
- `office_hours`: `object | null` (optional)
- `office_location`: `string | null` (optional)
- `office_phone`: `string | null` (optional)
- `orcid`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `photo`: `object | null` (optional)
- `photo_id`: `string | null` (optional)
- `photo_url`: `string | null` (optional)
- `professional_memberships`: `array<object> | null` (optional)
- `programme_tutorships`: `array<object> | null` (optional)
- `publication_records`: `array<object> | null` (optional)
- `publications_count`: `integer | null` (optional)
- `qualifications`: `array<object> | null` (optional)
- `research_grants_won`: `array<object> | null` (optional)
- `research_interests`: `array<string> | null` (optional)
- `researchgate_url`: `string | null` (optional)
- `scopus_id`: `string | null` (optional)
- `show_on_directory`: `boolean | null` (optional)
- `skills`: `array<string> | null` (optional)
- `slug`: `string | null` (optional)
- `specialization`: `string | null` (optional)
- `teaching_areas`: `array<string> | null` (optional)
- `tenure_status`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `user`: `object | null` (optional)
- `user_id`: `string | null` (optional)
- `website_url`: `string | null` (optional)

### `PersonUpdate`

- `academic_rank`: `string | null` (optional)
- `alternative_email`: `string | null` (optional)
- `alternative_phone`: `string | null` (optional)
- `awards_honors`: `array<object> | null` (optional)
- `bio`: `string | null` (optional)
- `contract_type`: `string | null` (optional)
- `courses_taught`: `array<string> | null` (optional)
- `cv_file_id`: `string | null` (optional)
- `date_of_appointment`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `education_background`: `array<object> | null` (optional)
- `email`: `string | null` (optional)
- `employee_number`: `string | null` (optional)
- `employment_end_date`: `string | null` (optional)
- `employment_start_date`: `string | null` (optional)
- `employment_type`: `string | null` (optional)
- `external_avatar_url`: `string | null` (optional)
- `external_source`: `string | null` (optional)
- `external_source_id`: `string | null` (optional)
- `first_name`: `string | null` (optional)
- `full_bio`: `string | null` (optional)
- `full_name`: `string | null` (optional)
- `google_scholar_id`: `string | null` (optional)
- `google_scholar_url`: `string | null` (optional)
- `h_index`: `integer | null` (optional)
- `institutional_role`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_researcher`: `boolean | null` (optional)
- `job_group`: `string | null` (optional)
- `last_name`: `string | null` (optional)
- `leadership_message`: `string | null` (optional)
- `linkedin_url`: `string | null` (optional)
- `middle_name`: `string | null` (optional)
- `office_hours`: `object | null` (optional)
- `office_location`: `string | null` (optional)
- `office_phone`: `string | null` (optional)
- `orcid`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `photo_id`: `string | null` (optional)
- `professional_memberships`: `array<object> | null` (optional)
- `publication_records`: `array<object> | null` (optional)
- `publications_count`: `integer | null` (optional)
- `qualifications`: `array<QualificationItem> | null` (optional)
- `research_grants_won`: `array<object> | null` (optional)
- `research_interests`: `array<string> | null` (optional)
- `researchgate_url`: `string | null` (optional)
- `scopus_id`: `string | null` (optional)
- `show_on_directory`: `boolean | null` (optional)
- `skills`: `array<string> | null` (optional)
- `specialization`: `string | null` (optional)
- `teaching_areas`: `array<string> | null` (optional)
- `tenure_status`: `string | null` (optional)
- `title`: `string | null` (optional)
- `website_url`: `string | null` (optional)

### `PolicyCreate`

- `approved_at`: `string | null` (optional)
- `approved_by_id`: `string | null` (optional)
- `category`: `string` (required)
- `code`: `string | null` (optional)
- `content`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `division_id`: `string | null` (optional)
- `effective_date`: `string | null` (optional)
- `is_public`: `boolean` (optional)
- `pdf_file_id`: `string | null` (optional)
- `review_date`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string` (optional)
- `summary`: `string | null` (optional)
- `supersedes_id`: `string | null` (optional)
- `title`: `string` (required)
- `version`: `string | null` (optional)

### `PolicySnapshot`

- `approved_at`: `string | null` (optional)
- `approved_by`: `object | null` (optional)
- `approved_by_id`: `string | null` (optional)
- `category`: `string | null` (optional)
- `code`: `string | null` (optional)
- `content`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `department`: `object | null` (optional)
- `department_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `division`: `object | null` (optional)
- `division_id`: `string | null` (optional)
- `effective_date`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `pdf_file`: `object | null` (optional)
- `pdf_file_id`: `string | null` (optional)
- `review_date`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `supersedes`: `object | null` (optional)
- `supersedes_id`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `version`: `string | null` (optional)

### `PolicyUpdate`

- `approved_at`: `string | null` (optional)
- `approved_by_id`: `string | null` (optional)
- `category`: `string | null` (optional)
- `code`: `string | null` (optional)
- `content`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `division_id`: `string | null` (optional)
- `effective_date`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `pdf_file_id`: `string | null` (optional)
- `review_date`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `supersedes_id`: `string | null` (optional)
- `title`: `string | null` (optional)
- `version`: `string | null` (optional)

### `PortalAccessRead`

- `href`: `string` (required)
- `key`: `string` (required)
- `label`: `string` (required)
- `locked_scope`: `boolean` (optional)
- `permissions`: `array<string>` (required)
- `scope_id`: `string | null` (optional)
- `scope_label`: `string` (required)
- `scope_type`: `string` (required)
- `service`: `string` (required)
- `source`: `string` (optional)

### `PortalAccessResponse`

- `portals`: `array<PortalAccessRead>` (required)
- `preferred_workspace`: `WorkspaceContext | null` (optional)
- `workspaces`: `array<WorkspaceContext>` (optional)

### `PortalStatsResponse`

- `portal`: `string` (required)
- `stats`: `object` (required)
- `title`: `string` (required)

### `PortalUploadBatchRead`

- `completed_at`: `string | null` (optional)
- `completed_files`: `integer` (required)
- `expires_at`: `string` (required)
- `failed_files`: `integer` (required)
- `files`: `array<UploadBatchFileRead>` (optional)
- `id`: `string` (required)
- `received_bytes`: `integer` (required)
- `school_id`: `string | null` (optional)
- `status`: `string` (required)
- `total_bytes`: `integer` (required)
- `total_files`: `integer` (required)

### `ProgrammeCreate`

- `about`: `string | null` (optional)
- `accreditation_status`: `string | null` (optional)
- `accrediting_body`: `string | null` (optional)
- `brochure_id`: `string | null` (optional)
- `career_prospects`: `string | null` (optional)
- `cluster_subjects`: `array<object> | null` (optional)
- `code`: `string` (required)
- `cover_image_id`: `string | null` (optional)
- `credits_required`: `integer | null` (optional)
- `curriculum_overview`: `string | null` (optional)
- `department_id`: `string` (required)
- `display_order`: `integer` (optional)
- `duration`: `string | null` (optional)
- `entry_requirements`: `string | null` (optional)
- `external_name`: `string | null` (optional)
- `external_source`: `string | null` (optional)
- `external_source_id`: `string | null` (optional)
- `fees_structure`: `object | null` (optional)
- `intake_months`: `array<string> | null` (optional)
- `is_active`: `boolean` (optional)
- `level`: `string` (required)
- `max_students`: `integer | null` (optional)
- `min_students`: `integer | null` (optional)
- `mode_of_study`: `string` (optional)
- `name`: `string` (required)
- `objectives`: `string | null` (optional)
- `slug`: `string | null` (optional)

### `ProgrammeFeeStructureCreate`

- `applicant_type`: `string` (required)
- `attachment_media_id`: `string | null` (optional)
- `currency`: `string` (optional)
- `display_order`: `integer` (optional)
- `effective_from`: `string | null` (optional)
- `effective_to`: `string | null` (optional)
- `fee_category`: `string` (optional)
- `intake_id`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `notes`: `string | null` (optional)
- `other_amount`: `integer | null` (optional)
- `payment_schedule`: `array<object> | null` (optional)
- `programme_id`: `string` (required)
- `statutory_amount`: `integer | null` (optional)
- `title`: `string` (required)
- `total_amount`: `integer | null` (optional)
- `tuition_amount`: `integer | null` (optional)

### `ProgrammeFeeStructureSnapshot`

- `applicant_type`: `string | null` (optional)
- `attachment_media`: `object | null` (optional)
- `attachment_media_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `currency`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `effective_from`: `string | null` (optional)
- `effective_to`: `string | null` (optional)
- `fee_category`: `string | null` (optional)
- `id`: `string | null` (optional)
- `intake`: `object | null` (optional)
- `intake_id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `notes`: `string | null` (optional)
- `other_amount`: `integer | null` (optional)
- `payment_schedule`: `array<object> | null` (optional)
- `programme`: `object | null` (optional)
- `programme_id`: `string | null` (optional)
- `statutory_amount`: `integer | null` (optional)
- `title`: `string | null` (optional)
- `total_amount`: `integer | null` (optional)
- `tuition_amount`: `integer | null` (optional)
- `updated_at`: `string | null` (optional)

### `ProgrammeFeeStructureUpdate`

- `applicant_type`: `string | null` (optional)
- `attachment_media_id`: `string | null` (optional)
- `currency`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `effective_from`: `string | null` (optional)
- `effective_to`: `string | null` (optional)
- `fee_category`: `string | null` (optional)
- `intake_id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `notes`: `string | null` (optional)
- `other_amount`: `integer | null` (optional)
- `payment_schedule`: `array<object> | null` (optional)
- `programme_id`: `string | null` (optional)
- `statutory_amount`: `integer | null` (optional)
- `title`: `string | null` (optional)
- `total_amount`: `integer | null` (optional)
- `tuition_amount`: `integer | null` (optional)

### `ProgrammeIntakeCreate`

- `application_deadline`: `string | null` (optional)
- `intake_id`: `string` (required)
- `is_active`: `boolean` (optional)
- `slots_available`: `integer | null` (optional)

### `ProgrammeIntakeRead`

- `application_deadline`: `string | null` (optional)
- `created_at`: `string` (required)
- `id`: `string` (required)
- `intake`: `object | null` (optional)
- `intake_id`: `string` (required)
- `is_active`: `boolean` (required)
- `programme`: `object | null` (optional)
- `programme_id`: `string` (required)
- `slots_available`: `integer | null` (optional)
- `updated_at`: `string` (required)

### `ProgrammeIntakeSnapshot`

- `application_deadline`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `id`: `string | null` (optional)
- `intake`: `object | null` (optional)
- `intake_id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `programme`: `object | null` (optional)
- `programme_id`: `string | null` (optional)
- `slots_available`: `integer | null` (optional)
- `updated_at`: `string | null` (optional)

### `ProgrammeSnapshot`

- `about`: `string | null` (optional)
- `accreditation_status`: `string | null` (optional)
- `accrediting_body`: `string | null` (optional)
- `admission_documents`: `array<object> | null` (optional)
- `admission_requirements`: `array<object> | null` (optional)
- `brochure`: `object | null` (optional)
- `brochure_id`: `string | null` (optional)
- `career_prospects`: `string | null` (optional)
- `cluster_subjects`: `array<object> | null` (optional)
- `code`: `string | null` (optional)
- `cover_image`: `object | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `credits_required`: `integer | null` (optional)
- `curriculum_overview`: `string | null` (optional)
- `department`: `object | null` (optional)
- `department_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `duration`: `string | null` (optional)
- `entry_requirements`: `string | null` (optional)
- `external_name`: `string | null` (optional)
- `external_source`: `string | null` (optional)
- `external_source_id`: `string | null` (optional)
- `fee_structures`: `array<object> | null` (optional)
- `fees_structure`: `object | null` (optional)
- `id`: `string | null` (optional)
- `intake_months`: `array<string> | null` (optional)
- `intakes`: `array<ProgrammeIntakeRead> | null` (optional)
- `is_active`: `boolean | null` (optional)
- `level`: `string | null` (optional)
- `max_students`: `integer | null` (optional)
- `min_students`: `integer | null` (optional)
- `mode_of_study`: `string | null` (optional)
- `name`: `string | null` (optional)
- `objectives`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `tutors`: `array<ProgrammeTutorRead> | null` (optional)
- `updated_at`: `string | null` (optional)

### `ProgrammeTutorCreate`

- `is_lead`: `boolean` (optional)
- `person_id`: `string` (required)
- `role`: `string` (optional)

### `ProgrammeTutorRead`

- `created_at`: `string` (required)
- `id`: `string` (required)
- `is_lead`: `boolean` (required)
- `person`: `object | null` (optional)
- `person_id`: `string` (required)
- `programme`: `object | null` (optional)
- `programme_id`: `string` (required)
- `role`: `string` (required)
- `updated_at`: `string` (required)

### `ProgrammeTutorSnapshot`

- `created_at`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_lead`: `boolean | null` (optional)
- `person`: `object | null` (optional)
- `person_id`: `string | null` (optional)
- `programme`: `object | null` (optional)
- `programme_id`: `string | null` (optional)
- `role`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `ProgrammeUpdate`

- `about`: `string | null` (optional)
- `accreditation_status`: `string | null` (optional)
- `accrediting_body`: `string | null` (optional)
- `brochure_id`: `string | null` (optional)
- `career_prospects`: `string | null` (optional)
- `cluster_subjects`: `array<object> | null` (optional)
- `code`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `credits_required`: `integer | null` (optional)
- `curriculum_overview`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `duration`: `string | null` (optional)
- `entry_requirements`: `string | null` (optional)
- `external_name`: `string | null` (optional)
- `external_source`: `string | null` (optional)
- `external_source_id`: `string | null` (optional)
- `fees_structure`: `object | null` (optional)
- `intake_months`: `array<string> | null` (optional)
- `is_active`: `boolean | null` (optional)
- `level`: `string | null` (optional)
- `max_students`: `integer | null` (optional)
- `min_students`: `integer | null` (optional)
- `mode_of_study`: `string | null` (optional)
- `name`: `string | null` (optional)
- `objectives`: `string | null` (optional)
- `slug`: `string | null` (optional)

### `PublicAboutRead`

- `content`: `object | null` (optional)
- `history`: `PublicHistoryRead` (required)
- `institutional_page`: `object | null` (optional)
- `university`: `object` (required)

### `PublicAcademicOrganizationPayload`

- `counts`: `object` (required)
- `entity`: `object` (required)
- `hierarchy`: `array<object>` (required)
- `id`: `string | string | null` (optional)
- `key`: `string` (required)
- `label`: `string` (required)
- `tiers`: `array<object>` (required)

### `PublicCampusContactSummary`

- `address`: `string | null` (optional)
- `campus_type`: `string` (required)
- `city`: `string | null` (optional)
- `code`: `string` (required)
- `county`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string` (required)
- `description`: `string | null` (optional)
- `display_order`: `integer` (required)
- `email`: `string | null` (optional)
- `gps_latitude`: `number | null` (optional)
- `gps_longitude`: `number | null` (optional)
- `id`: `string` (required)
- `is_active`: `boolean` (required)
- `name`: `string` (required)
- `phone`: `string | null` (optional)
- `postal_code`: `string | null` (optional)
- `slug`: `string` (required)
- `updated_at`: `string` (required)

### `PublicContactDirectoryEntry`

- `building`: `string | null` (optional)
- `contact_person_id`: `string | null` (optional)
- `contact_type`: `string | null` (optional)
- `created_at`: `string` (required)
- `email`: `string | null` (optional)
- `extension`: `string | null` (optional)
- `id`: `string` (required)
- `is_main`: `boolean` (required)
- `is_public`: `boolean` (required)
- `name`: `string` (required)
- `operating_hours`: `object | null` (optional)
- `phone`: `array<string> | null` (optional)
- `physical_address`: `string | null` (optional)
- `room_number`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `status`: `string` (required)
- `updated_at`: `string` (required)

### `PublicContactDirectoryPage`

- `items`: `array<PublicContactDirectoryEntry>` (optional)
- `meta`: `ContactDirectoryPaginationMeta` (required)

### `PublicContactDirectorySnapshot`

- `campuses`: `array<PublicCampusContactSummary> | null` (optional)
- `contacts`: `PublicContactDirectoryPage | null` (optional)
- `faqs`: `array<FAQRead> | null` (optional)
- `institution`: `PublicUniversityContactSummary | null` (optional)
- `main_contacts`: `array<PublicContactDirectoryEntry> | null` (optional)

### `PublicCouncilMandate`

- `description`: `string | null` (optional)
- `document_cta`: `object` (optional)
- `heading`: `string` (required)
- `label`: `string` (required)

### `PublicCouncilMember`

- `display_order`: `integer` (required)
- `id`: `string` (required)
- `is_acting`: `boolean` (required)
- `name`: `string` (required)
- `person_id`: `string` (required)
- `portrait`: `object | null` (optional)
- `profile_summary`: `string | null` (optional)
- `role`: `string` (required)
- `slug`: `string | null` (optional)

### `PublicCouncilPage`

- `breadcrumb`: `array<string>` (optional)
- `description`: `string | null` (optional)
- `hero_image`: `object | null` (optional)
- `title`: `string` (required)

### `PublicCouncilProfile`

- `appointment_category`: `string | null` (optional)
- `current_office`: `string | null` (optional)
- `display_order`: `integer` (required)
- `id`: `string` (required)
- `is_acting`: `boolean` (required)
- `is_ex_officio`: `boolean` (required)
- `is_voting_member`: `boolean` (required)
- `name`: `string` (required)
- `official_designation`: `string | null` (optional)
- `person_id`: `string` (required)
- `portrait`: `object | null` (optional)
- `profile_summary`: `string | null` (optional)
- `represented_institution`: `string | null` (optional)
- `role`: `string` (required)
- `slug`: `string | null` (optional)

### `PublicCouncilResponse`

- `chairperson`: `PublicCouncilMember | null` (optional)
- `mandate`: `PublicCouncilMandate` (required)
- `members`: `array<PublicCouncilMember>` (optional)
- `page`: `PublicCouncilPage` (required)
- `secretary`: `PublicCouncilMember | null` (optional)

### `PublicEntityContentPayload`

- `content_type`: `string` (required)
- `entity`: `object` (required)
- `meta`: `object` (required)
- `records`: `array<object>` (required)

### `PublicEntityInquiryCreate`

- `category`: `string` (optional)
- `consent_to_contact`: `boolean` (required)
- `message`: `string` (required)
- `sender_email`: `string` (required)
- `sender_name`: `string` (required)
- `sender_phone`: `string | null` (optional)
- `source_page_url`: `string | null` (optional)
- `subject`: `string` (required)
- `website`: `string` (optional)

### `PublicFactsRead`

- `available_years`: `array<integer>` (required)
- `edition`: `object` (required)
- `groups`: `array<object>` (required)

### `PublicHistoryRead`

- `document`: `object | null` (optional)
- `milestones`: `array<object>` (required)

### `PublicInquirySubmission`

- `id`: `string` (required)
- `reference_number`: `string | null` (optional)
- `status`: `string | null` (optional)
- `target_entity_name`: `string | null` (optional)

### `PublicInstitutionalPageRead`

- `effective_date`: `string | null` (optional)
- `eyebrow`: `string | null` (optional)
- `hero_alt_text`: `string | null` (optional)
- `hero_media`: `object | null` (optional)
- `id`: `string` (required)
- `introduction`: `string` (required)
- `mobile_hero_media`: `object | null` (optional)
- `page_type`: `string` (required)
- `primary_document`: `object | null` (optional)
- `reporting_period_label`: `string | null` (optional)
- `review_date`: `string | null` (optional)
- `sections`: `array<object>` (required)
- `seo_description`: `string | null` (optional)
- `seo_title`: `string | null` (optional)
- `slug`: `string` (required)
- `title`: `string` (required)

### `PublicResearchContextPayload`

- `department`: `object | null` (optional)
- `division`: `object | null` (optional)
- `entity`: `object` (required)
- `leadership`: `object` (required)
- `relationships`: `object` (required)
- `resolved_entity`: `object` (required)
- `team`: `object` (required)
- `wing`: `object | null` (optional)

### `PublicSchoolTeamPayload`

- `assignments`: `array<object>` (optional)
- `counts`: `object` (optional)
- `entity`: `object | null` (optional)
- `groups`: `array<object>` (optional)
- `id`: `string | string | null` (optional)
- `key`: `string | null` (optional)
- `label`: `string | null` (optional)
- `members`: `array<object>` (optional)
- `persons`: `object` (optional)

### `PublicSettingSnapshot`

- `category`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `key`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `updated_by`: `object | null` (optional)
- `updated_by_id`: `string | null` (optional)
- `value`: `object` (optional)
- `value_type`: `string | null` (optional)

### `PublicSitePageSnapshot`

- `created_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `headings`: `array<object> | null` (optional)
- `id`: `string | null` (optional)
- `images`: `array<object> | null` (optional)
- `is_public`: `boolean | null` (optional)
- `links`: `array<object> | null` (optional)
- `page_type`: `string | null` (optional)
- `path`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `source_hash`: `string | null` (optional)
- `source_url`: `string | null` (optional)
- `status`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `PublicStatItem`

- `description`: `string` (required)
- `href`: `string | null` (optional)
- `key`: `string` (required)
- `label`: `string` (required)
- `suffix`: `string` (optional)
- `value`: `integer | number` (required)

### `PublicStatsResponse`

- `scope`: `string` (required)
- `stats`: `array<PublicStatItem>` (required)
- `title`: `string` (required)

### `PublicTeamPayload`

- `assignments`: `array<object>` (required)
- `counts`: `object` (required)
- `entity`: `object` (required)
- `groups`: `array<object>` (required)
- `hierarchy`: `array<object>` (required)
- `persons`: `object` (required)

### `PublicTimetableItem`

- `sittings`: `array<TimetableSittingSnapshot>` (optional)
- `timetable`: `AcademicTimetableSnapshot` (required)

### `PublicUniversityContactSummary`

- `acronym`: `string | null` (optional)
- `alternate_phone`: `string | null` (optional)
- `city`: `string | null` (optional)
- `country`: `string | null` (optional)
- `county`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string` (required)
- `email`: `string | null` (optional)
- `id`: `string` (required)
- `name`: `string` (required)
- `phone`: `string | null` (optional)
- `physical_address`: `string | null` (optional)
- `postal_address`: `string | null` (optional)
- `short_name`: `string | null` (optional)
- `social_links`: `object | null` (optional)
- `updated_at`: `string` (required)
- `website`: `string | null` (optional)

### `QualificationItem`

- `degree`: `string` (required)
- `field`: `string | null` (optional)
- `institution`: `string` (required)
- `year`: `string | integer | null` (optional)

### `RealtimeConfigData`

- `channels`: `array<string>` (required)
- `events`: `array<string>` (required)
- `heartbeat_seconds`: `integer` (required)
- `max_message_bytes`: `integer` (required)
- `scope_type`: `string` (required)
- `ticket_path`: `string` (required)
- `websocket_path`: `string` (required)

### `RealtimeConfigResponse`

- `data`: `RealtimeConfigData` (required)

### `RealtimeMetricsData`

- `connections`: `integer` (required)
- `dropped_events`: `integer` (required)
- `queue_depth`: `integer` (required)
- `rooms`: `integer` (required)

### `RealtimeMetricsResponse`

- `data`: `RealtimeMetricsData` (required)

### `RealtimeTicketData`

- `expires_in`: `integer` (required)
- `ticket`: `string` (required)

### `RealtimeTicketResponse`

- `data`: `RealtimeTicketData` (required)

### `RecoveryResponse`

- `recovery_codes`: `array<string>` (required)

### `RefreshRequest`

- `refresh_token`: `string | null` (optional)
- `token_transport`: `string` (optional)

### `ReorderEntry`

- `display_order`: `integer` (required)
- `id`: `string` (required)
- `revision`: `integer` (required)

### `ReorderItem`

- `display_order`: `integer` (required)
- `id`: `string` (required)

### `ReorderRequest`

- `items`: `array<ReorderItem>` (required)

### `ReportDimension`

- `key`: `string` (required)
- `label`: `string` (required)
- `value`: `integer` (required)

### `ReportSeriesPoint`

- `date`: `string` (required)
- `value`: `integer` (required)

### `ReportsOverview`

- `admin_events`: `integer` (required)
- `content_views`: `integer` (required)
- `page_views`: `integer` (required)
- `top_content`: `array<ReportDimension>` (required)
- `total_events`: `integer` (required)
- `traffic_by_day`: `array<ReportSeriesPoint>` (required)
- `unique_sessions`: `integer` (required)

### `ResearchContextUpdate`

- `department`: `ResearchDepartmentUpdate | null` (optional)
- `wing`: `ResearchWingUpdate | null` (optional)

### `ResearchDepartmentUpdate`

- `about`: `string | null` (optional)
- `allows_staff_management`: `boolean | null` (optional)
- `code`: `string | null` (optional)
- `core_values`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `email`: `string | null` (optional)
- `guidelines`: `string | null` (optional)
- `head_id`: `string | null` (optional)
- `head_message`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `mandate`: `string | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string | null` (optional)
- `office_location`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `service_charter`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `vision`: `string | null` (optional)

### `ResearchWingUpdate`

- `code`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `email`: `string | null` (optional)
- `head_id`: `string | null` (optional)
- `head_message`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `mandate`: `string | null` (optional)
- `name`: `string | null` (optional)
- `office_location`: `string | null` (optional)
- `operating_hours`: `object | null` (optional)
- `phone`: `string | null` (optional)
- `service_charter`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `wing_type`: `string | null` (optional)

### `ResetPasswordRequest`

- `new_password`: `string` (required)
- `token`: `string` (required)

### `RoleCreatePayload`

- `description`: `string | null` (optional)
- `display_name`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_system`: `boolean` (optional)
- `name`: `string` (required)
- `permissions`: `array<string>` (optional)

### `RolePermissionsUpdatePayload`

- `permissions`: `array<string>` (optional)

### `RoleSnapshot`

- `created_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_name`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_system`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `permissions`: `array<string> | null` (optional)
- `role_permissions`: `array<object> | null` (optional)
- `updated_at`: `string | null` (optional)
- `user_assignments`: `array<object> | null` (optional)

### `RoleUpdate`

- `description`: `string | null` (optional)
- `display_name`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_system`: `boolean | null` (optional)

### `SchoolAcademicImportRequest`

- `idempotency_key`: `string` (required)
- `mode`: `string` (optional)
- `resource`: `string` (required)
- `rows`: `array<object>` (required)

### `SchoolContentAction`

- `comments`: `string | null` (optional)

### `SchoolContentCreate`

- `content_type`: `string` (required)
- `data`: `object` (optional)

### `SchoolContentImportResponse`

- `rows`: `array<SchoolContentImportRowRead>` (required)

### `SchoolContentImportRow`

- `client_reference`: `string` (required)
- `content_type`: `string` (required)
- `data`: `object` (optional)

### `SchoolContentImportRowRead`

- `client_reference`: `string` (required)
- `content_type`: `string` (required)
- `data`: `object` (optional)
- `errors`: `array<string>` (optional)
- `row_number`: `integer` (required)
- `status`: `string` (required)

### `SchoolContentListItem`

- `content_type`: `string` (required)
- `record`: `SchoolContentRecordSnapshot` (required)

### `SchoolContentMetadataImport`

- `batch_id`: `string | null` (optional)
- `rows`: `array<SchoolContentImportRow>` (required)

### `SchoolContentRecordSnapshot`

- `created_at`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_published`: `boolean | null` (optional)
- `owner_scope_id`: `string | null` (optional)
- `owner_scope_type`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `submitted_at`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `SchoolContentUpdate`

- `content_type`: `string` (required)
- `data`: `object` (optional)

### `SchoolCreate`

- `about`: `string | null` (optional)
- `administrative_wing_id`: `string | null` (optional)
- `brochure_id`: `string | null` (optional)
- `campus_id`: `string | null` (optional)
- `code`: `string` (required)
- `core_values`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `dean_id`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `email`: `string | null` (optional)
- `establishment_date`: `string | null` (optional)
- `head_message`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `logo_image_id`: `string | null` (optional)
- `mandate`: `string | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string` (required)
- `office_location`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `school_type`: `string` (optional)
- `slug`: `string` (required)
- `vision`: `string | null` (optional)
- `website`: `string | null` (optional)

### `SchoolDepartmentCreate`

- `about`: `string | null` (optional)
- `allows_staff_management`: `boolean` (optional)
- `code`: `string` (required)
- `core_values`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `department_type`: `string` (optional)
- `display_order`: `integer` (optional)
- `email`: `string | null` (optional)
- `establishment_date`: `string | null` (optional)
- `guidelines`: `string | null` (optional)
- `head_id`: `string | null` (optional)
- `head_message`: `string | null` (optional)
- `is_public`: `boolean` (optional)
- `mandate`: `string | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string` (required)
- `office_location`: `string | null` (optional)
- `parent_department_id`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `postgraduate_coordinator_id`: `string | null` (optional)
- `service_charter`: `string | null` (optional)
- `slug`: `string` (required)
- `vision`: `string | null` (optional)

### `SchoolDepartmentUpdate`

- `about`: `string | null` (optional)
- `allows_staff_management`: `boolean | null` (optional)
- `code`: `string | null` (optional)
- `core_values`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `department_type`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `email`: `string | null` (optional)
- `establishment_date`: `string | null` (optional)
- `guidelines`: `string | null` (optional)
- `head_id`: `string | null` (optional)
- `head_message`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `mandate`: `string | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string | null` (optional)
- `office_location`: `string | null` (optional)
- `parent_department_id`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `postgraduate_coordinator_id`: `string | null` (optional)
- `service_charter`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `vision`: `string | null` (optional)

### `SchoolMediaSnapshot`

- `alt_text`: `string | null` (optional)
- `caption`: `string | null` (optional)
- `cdn_url`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `credit`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `duration`: `integer | null` (optional)
- `file_hash`: `string | null` (optional)
- `file_size`: `integer | null` (optional)
- `filename`: `string | null` (optional)
- `folder`: `object | null` (optional)
- `folder_id`: `string | null` (optional)
- `height`: `integer | null` (optional)
- `id`: `string | null` (optional)
- `is_processed`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `links`: `array<object> | null` (optional)
- `media_type`: `string | null` (optional)
- `metadata`: `object | null` (optional)
- `mime_type`: `string | null` (optional)
- `original_filename`: `string | null` (optional)
- `public_url`: `string | null` (optional)
- `storage_path`: `string | null` (optional)
- `storage_provider`: `string | null` (optional)
- `tags`: `array<string> | null` (optional)
- `thumbnail_url`: `string | null` (optional)
- `thumbnails`: `object | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `uploaded_by`: `object | null` (optional)
- `uploaded_by_id`: `string | null` (optional)
- `url`: `string | null` (optional)
- `width`: `integer | null` (optional)

### `SchoolPortalCapabilitiesResponse`

- `allowed_navigation`: `array<string>` (required)
- `capabilities`: `object` (required)
- `permissions`: `array<string>` (required)
- `school_id`: `string` (required)

### `SchoolPortalContextResponse`

- `allowed_navigation`: `array<string>` (required)
- `capabilities`: `object` (required)
- `permissions`: `array<string>` (required)
- `role_names`: `array<string>` (required)
- `school`: `SchoolPortalSchoolSummary` (required)
- `user`: `SchoolPortalUserSummary` (required)

### `SchoolPortalDashboardResponse`

- `activity_summary`: `DashboardActivitySummary` (required)
- `attention_items`: `array<app__schemas__school_portal_dashboard__DashboardAttentionItem>` (required)
- `collection_notes`: `object` (required)
- `distributions`: `object` (required)
- `generated_at`: `string` (required)
- `profile_completeness`: `DashboardProfileCompleteness` (required)
- `quick_actions`: `array<DashboardQuickAction>` (required)
- `quick_links`: `array<DashboardQuickLink>` (required)
- `range`: `string` (required)
- `recent_activity`: `array<DashboardActivityItem>` (required)
- `school_id`: `string` (required)
- `summary_cards`: `array<DashboardSummaryCard>` (required)
- `trends`: `array<DashboardTrendPoint>` (required)

### `SchoolPortalDeanUpdate`

- `person_id`: `string` (required)
- `reassign_existing`: `boolean` (optional)

### `SchoolPortalDepartmentSummary`

- `code`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `id`: `string` (required)
- `name`: `string` (required)
- `slug`: `string | null` (optional)

### `SchoolPortalEntitySummary`

- `code`: `string | null` (optional)
- `id`: `string` (required)
- `name`: `string` (required)
- `slug`: `string | null` (optional)

### `SchoolPortalMediaLinkCreate`

- `display_order`: `integer` (optional)
- `media_id`: `string` (required)
- `role`: `string` (required)

### `SchoolPortalMediaMetadataUpdate`

- `alt_text`: `string | null` (optional)
- `caption`: `string | null` (optional)
- `credit`: `string | null` (optional)
- `description`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `metadata`: `object | null` (optional)
- `tags`: `array<string> | null` (optional)
- `title`: `string | null` (optional)

### `SchoolPortalMediaSummary`

- `alt_text`: `string | null` (optional)
- `description`: `string | null` (optional)
- `id`: `string` (required)
- `link_id`: `string | null` (optional)
- `title`: `string | null` (optional)
- `url`: `string` (required)

### `SchoolPortalPersonSummary`

- `display_name`: `string` (required)
- `id`: `string` (required)

### `SchoolPortalProfileResponse`

- `about`: `string | null` (optional)
- `administrative_wing_id`: `string | null` (optional)
- `brochure`: `SchoolPortalMediaSummary | null` (optional)
- `brochure_id`: `string | null` (optional)
- `campus_id`: `string | null` (optional)
- `code`: `string` (required)
- `core_values`: `string | null` (optional)
- `cover_image`: `SchoolPortalMediaSummary | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `dean_id`: `string | null` (optional)
- `email`: `string | null` (optional)
- `establishment_date`: `string | null` (optional)
- `gallery`: `array<SchoolPortalMediaSummary>` (optional)
- `head_message`: `string | null` (optional)
- `id`: `string` (required)
- `is_active`: `boolean` (required)
- `is_public`: `boolean` (required)
- `logo_image`: `SchoolPortalMediaSummary | null` (optional)
- `logo_image_id`: `string | null` (optional)
- `mandate`: `string | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string` (required)
- `office_location`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `school_type`: `string` (required)
- `slug`: `string` (required)
- `vision`: `string | null` (optional)
- `website`: `string | null` (optional)

### `SchoolPortalProfileUpdate`

- `about`: `string | null` (optional)
- `core_values`: `string | null` (optional)
- `email`: `string | null` (optional)
- `establishment_date`: `string | null` (optional)
- `head_message`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `mandate`: `string | null` (optional)
- `mission`: `string | null` (optional)
- `office_location`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `vision`: `string | null` (optional)
- `website`: `string | null` (optional)

### `SchoolPortalSchoolSummary`

- `administrative_wing`: `SchoolPortalEntitySummary | null` (optional)
- `administrative_wing_id`: `string | null` (optional)
- `brochure`: `SchoolPortalMediaSummary | null` (optional)
- `brochure_id`: `string | null` (optional)
- `campus`: `SchoolPortalEntitySummary | null` (optional)
- `campus_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `cover_image`: `SchoolPortalMediaSummary | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `dean`: `SchoolPortalPersonSummary | null` (optional)
- `dean_id`: `string | null` (optional)
- `departments`: `array<SchoolPortalDepartmentSummary>` (optional)
- `id`: `string` (required)
- `is_active`: `boolean` (required)
- `is_public`: `boolean` (required)
- `logo_image`: `SchoolPortalMediaSummary | null` (optional)
- `logo_image_id`: `string | null` (optional)
- `name`: `string` (required)
- `school_type`: `string` (required)
- `slug`: `string | null` (optional)

### `SchoolPortalUserSummary`

- `email`: `string` (required)
- `full_name`: `string` (required)
- `id`: `string` (required)

### `SchoolProgrammeCreate`

- `about`: `string | null` (optional)
- `accreditation_status`: `string | null` (optional)
- `accrediting_body`: `string | null` (optional)
- `brochure_id`: `string | null` (optional)
- `career_prospects`: `string | null` (optional)
- `cluster_subjects`: `array<object> | null` (optional)
- `code`: `string` (required)
- `cover_image_id`: `string | null` (optional)
- `credits_required`: `integer | null` (optional)
- `curriculum_overview`: `string | null` (optional)
- `department_id`: `string` (required)
- `display_order`: `integer` (optional)
- `duration`: `string` (required)
- `entry_requirements`: `string | null` (optional)
- `fees_structure`: `object | null` (optional)
- `intake_ids`: `array<string>` (optional)
- `intake_months`: `array<string> | null` (optional)
- `is_active`: `boolean` (optional)
- `level`: `string` (required)
- `max_students`: `integer | null` (optional)
- `min_students`: `integer | null` (optional)
- `mode_of_study`: `string` (optional)
- `name`: `string` (required)
- `objectives`: `string | null` (optional)
- `slug`: `string` (required)
- `tutor_ids`: `array<string>` (optional)

### `SchoolProgrammeUpdate`

- `about`: `string | null` (optional)
- `accreditation_status`: `string | null` (optional)
- `accrediting_body`: `string | null` (optional)
- `brochure_id`: `string | null` (optional)
- `career_prospects`: `string | null` (optional)
- `cluster_subjects`: `array<object> | null` (optional)
- `code`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `credits_required`: `integer | null` (optional)
- `curriculum_overview`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `duration`: `string | null` (optional)
- `entry_requirements`: `string | null` (optional)
- `fees_structure`: `object | null` (optional)
- `intake_ids`: `array<string> | null` (optional)
- `intake_months`: `array<string> | null` (optional)
- `is_active`: `boolean | null` (optional)
- `level`: `string | null` (optional)
- `max_students`: `integer | null` (optional)
- `min_students`: `integer | null` (optional)
- `mode_of_study`: `string | null` (optional)
- `name`: `string | null` (optional)
- `objectives`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `tutor_ids`: `array<string> | null` (optional)

### `SchoolPublicationCreate`

- `abstract`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `doi`: `string | null` (optional)
- `funding_acknowledgment`: `string | null` (optional)
- `grant_numbers`: `array<string> | null` (optional)
- `is_open_access`: `boolean` (optional)
- `journal_id`: `string | null` (optional)
- `journal_name`: `string | null` (optional)
- `keywords`: `array<string> | null` (optional)
- `pdf_url`: `string | null` (optional)
- `project_id`: `string | null` (optional)
- `publication_date`: `string | null` (optional)
- `publication_type`: `string` (optional)
- `publisher`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `title`: `string` (required)
- `url`: `string | null` (optional)
- `year`: `integer | null` (optional)

### `SchoolPublicationUpdate`

- `abstract`: `string | null` (optional)
- `center_id`: `string | null` (optional)
- `cover_image_url`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `doi`: `string | null` (optional)
- `funding_acknowledgment`: `string | null` (optional)
- `grant_numbers`: `array<string> | null` (optional)
- `is_open_access`: `boolean | null` (optional)
- `journal_id`: `string | null` (optional)
- `journal_name`: `string | null` (optional)
- `keywords`: `array<string> | null` (optional)
- `pdf_url`: `string | null` (optional)
- `project_id`: `string | null` (optional)
- `publication_date`: `string | null` (optional)
- `publication_type`: `string | null` (optional)
- `publisher`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `title`: `string | null` (optional)
- `url`: `string | null` (optional)
- `year`: `integer | null` (optional)

### `SchoolSnapshot`

- `about`: `string | null` (optional)
- `administrative_wing`: `object | null` (optional)
- `administrative_wing_id`: `string | null` (optional)
- `brochure`: `object | null` (optional)
- `brochure_id`: `string | null` (optional)
- `campus`: `object | null` (optional)
- `campus_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `core_values`: `string | null` (optional)
- `cover_image`: `object | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `dean`: `object | null` (optional)
- `dean_id`: `string | null` (optional)
- `departments`: `array<object> | null` (optional)
- `display_order`: `integer | null` (optional)
- `email`: `string | null` (optional)
- `establishment_date`: `string | null` (optional)
- `head_message`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `logo_image`: `object | null` (optional)
- `logo_image_id`: `string | null` (optional)
- `mandate`: `string | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string | null` (optional)
- `office_location`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `school_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `vision`: `string | null` (optional)
- `website`: `string | null` (optional)

### `SchoolTeamAssignmentRead`

- `created_at`: `string | null` (optional)
- `department`: `object | null` (optional)
- `department_id`: `string | null` (optional)
- `display_order`: `integer` (required)
- `email`: `string | null` (optional)
- `employee_number`: `string | null` (optional)
- `end_date`: `string | null` (optional)
- `full_name`: `string | null` (optional)
- `id`: `string` (required)
- `is_active`: `boolean` (required)
- `is_primary`: `boolean` (required)
- `is_public`: `boolean` (required)
- `person_id`: `string` (required)
- `phone`: `string | null` (optional)
- `portal_role`: `string | null` (optional)
- `role`: `string` (required)
- `start_date`: `string | null` (optional)
- `title`: `string | null` (optional)
- `user_id`: `string | null` (optional)

### `SchoolTeamImportJobRead`

- `job_id`: `string` (required)
- `status`: `string` (required)

### `SchoolTeamImportRequest`

- `idempotency_key`: `string` (required)
- `mode`: `string` (optional)
- `rows`: `array<object>` (required)

### `SchoolTeamLifecycleRequest`

- `acknowledge_vacancy`: `boolean` (optional)
- `effective_date`: `string | null` (optional)
- `notes`: `string | null` (optional)
- `replacement_person_id`: `string | null` (optional)

### `SchoolTeamMemberCreate`

- `department_id`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `email`: `string | null` (optional)
- `employee_number`: `string | null` (optional)
- `first_name`: `string | null` (optional)
- `full_name`: `string | null` (optional)
- `invite_user`: `boolean` (optional)
- `is_primary`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `last_name`: `string | null` (optional)
- `middle_name`: `string | null` (optional)
- `person_id`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `portal_role`: `string | null` (optional)
- `role`: `string` (required)
- `start_date`: `string | null` (optional)
- `temporary_password`: `string | null` (optional)
- `title`: `string | null` (optional)

### `SchoolTeamMemberUpdate`

- `department_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `is_primary`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `phone`: `string | null` (optional)
- `role`: `string | null` (optional)
- `title`: `string | null` (optional)

### `SchoolTeamPersonOptionRead`

- `department`: `object | null` (optional)
- `email`: `string | null` (optional)
- `employee_number`: `string | null` (optional)
- `full_name`: `string` (required)
- `id`: `string` (required)

### `SchoolTeamTransferRequest`

- `department_id`: `string | null` (optional)
- `role`: `string | null` (optional)
- `title`: `string | null` (optional)

### `SchoolUpdate`

- `about`: `string | null` (optional)
- `administrative_wing_id`: `string | null` (optional)
- `brochure_id`: `string | null` (optional)
- `campus_id`: `string | null` (optional)
- `code`: `string | null` (optional)
- `core_values`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `dean_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `email`: `string | null` (optional)
- `establishment_date`: `string | null` (optional)
- `head_message`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `logo_image_id`: `string | null` (optional)
- `mandate`: `string | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string | null` (optional)
- `office_location`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `school_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `vision`: `string | null` (optional)
- `website`: `string | null` (optional)

### `ScopeChoice`

- `scope_id`: `string | null` (optional)
- `scope_type`: `string` (required)

### `ScopeSummary`

- `id`: `string` (required)
- `label`: `string` (required)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `type`: `string` (required)

### `SearchResponse`

- `query`: `string` (required)
- `results`: `SearchResultsRead` (required)

### `SearchResultsRead`

- `announcements`: `array<AnnouncementSnapshot>` (optional)
- `blogs`: `array<BlogSnapshot>` (optional)
- `departments`: `array<DepartmentSnapshot>` (optional)
- `events`: `array<EventSnapshot>` (optional)
- `news`: `array<NewsSnapshot>` (optional)
- `persons`: `array<PersonSnapshot>` (optional)
- `schools`: `array<SchoolSnapshot>` (optional)

### `SectionDefinitionRead`

- `allowed_item_types`: `array<string>` (required)
- `allowed_scopes`: `array<string>` (required)
- `allowed_source_types`: `array<string>` (required)
- `description`: `string` (required)
- `key`: `string` (required)
- `label`: `string` (required)
- `max_items`: `integer` (required)
- `media_roles`: `object` (required)
- `min_items`: `integer` (required)
- `required_fields`: `array<string>` (required)
- `settings_schema`: `object` (required)

### `SectionItemCreate`

- `body_text`: `string | null` (optional)
- `content`: `object | null` (optional)
- `cta_description`: `string | null` (optional)
- `cta_label`: `string | null` (optional)
- `cta_url`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `editorial_overrides`: `object | null` (optional)
- `is_enabled`: `boolean` (optional)
- `item_type`: `string` (optional)
- `media_alt_text`: `string | null` (optional)
- `media_caption`: `string | null` (optional)
- `page_section_id`: `string | null` (optional)
- `source_id`: `string | null` (optional)
- `source_type`: `string | null` (optional)
- `subtitle`: `string | null` (optional)
- `title`: `string | null` (optional)
- `video_duration_seconds`: `integer | null` (optional)
- `video_provider`: `string | null` (optional)
- `video_url`: `string | null` (optional)

### `SectionItemRead`

- `body_text`: `string | null` (optional)
- `content`: `object | null` (optional)
- `created_at`: `string` (required)
- `cta_description`: `string | null` (optional)
- `cta_label`: `string | null` (optional)
- `cta_url`: `string | null` (optional)
- `display_order`: `integer` (required)
- `editorial_overrides`: `object | null` (optional)
- `id`: `string` (required)
- `is_enabled`: `boolean` (required)
- `item_type`: `string` (required)
- `media_alt_text`: `string | null` (optional)
- `media_caption`: `string | null` (optional)
- `page_section_id`: `string` (required)
- `revision`: `integer` (required)
- `source_id`: `string | null` (optional)
- `source_type`: `string | null` (optional)
- `subtitle`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string` (required)
- `video_duration_seconds`: `integer | null` (optional)
- `video_provider`: `string | null` (optional)
- `video_url`: `string | null` (optional)

### `SectionItemReorderRequest`

- `items`: `array<ReorderEntry>` (required)

### `SectionItemSnapshot`

- `body_text`: `string | null` (optional)
- `content`: `object | null` (optional)
- `created_at`: `string | null` (optional)
- `cta_description`: `string | null` (optional)
- `cta_label`: `string | null` (optional)
- `cta_url`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `editorial_overrides`: `object | null` (optional)
- `id`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `item_type`: `string | null` (optional)
- `media_alt_text`: `string | null` (optional)
- `media_caption`: `string | null` (optional)
- `page_section_id`: `string | null` (optional)
- `revision`: `integer | null` (optional)
- `source_id`: `string | null` (optional)
- `source_type`: `string | null` (optional)
- `subtitle`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `video_duration_seconds`: `integer | null` (optional)
- `video_provider`: `string | null` (optional)
- `video_url`: `string | null` (optional)

### `SectionItemUpdate`

- `body_text`: `string | null` (optional)
- `content`: `object | null` (optional)
- `cta_description`: `string | null` (optional)
- `cta_label`: `string | null` (optional)
- `cta_url`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `editorial_overrides`: `object | null` (optional)
- `id`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `item_type`: `string | null` (optional)
- `media_alt_text`: `string | null` (optional)
- `media_caption`: `string | null` (optional)
- `page_section_id`: `string | null` (optional)
- `revision`: `integer | null` (optional)
- `source_id`: `string | null` (optional)
- `source_type`: `string | null` (optional)
- `subtitle`: `string | null` (optional)
- `title`: `string | null` (optional)
- `video_duration_seconds`: `integer | null` (optional)
- `video_provider`: `string | null` (optional)
- `video_url`: `string | null` (optional)

### `SettingCreate`

- `category`: `string` (required)
- `description`: `string | null` (optional)
- `is_public`: `boolean` (optional)
- `key`: `string` (required)
- `value`: `object` (required)
- `value_type`: `string` (required)

### `SettingSnapshot`

- `category`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `key`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `updated_by`: `object | null` (optional)
- `updated_by_id`: `string | null` (optional)
- `value`: `object` (optional)
- `value_type`: `string | null` (optional)

### `SettingUpdate`

- `category`: `string | null` (optional)
- `description`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `value`: `- | null` (optional)
- `value_type`: `string | null` (optional)

### `SliderCreate`

- `desktop_media_id`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `end_datetime`: `string | null` (optional)
- `external_url`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_main`: `boolean` (optional)
- `link_text`: `string | null` (optional)
- `mobile_media_id`: `string | null` (optional)
- `open_in_new_tab`: `boolean` (optional)
- `plain_text`: `string | null` (optional)
- `rich_text`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slider_group_id`: `string | null` (optional)
- `start_datetime`: `string | null` (optional)
- `structured_content`: `object | null` (optional)
- `subtitle`: `string | null` (optional)
- `title`: `string` (required)

### `SliderGroupCreate`

- `auto_play`: `boolean` (optional)
- `auto_play_duration`: `integer | null` (optional)
- `is_active`: `boolean` (optional)
- `is_main`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `location`: `string | null` (optional)
- `max_slides`: `integer | null` (optional)
- `name`: `string` (required)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `show_arrows`: `boolean` (optional)
- `show_navigation_dots`: `boolean` (optional)
- `slug`: `string` (required)
- `transition_effect`: `string | null` (optional)

### `SliderGroupSnapshot`

- `auto_play`: `boolean | null` (optional)
- `auto_play_duration`: `integer | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `location`: `string | null` (optional)
- `max_slides`: `integer | null` (optional)
- `name`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `show_arrows`: `boolean | null` (optional)
- `show_navigation_dots`: `boolean | null` (optional)
- `sliders`: `array<object> | null` (optional)
- `slug`: `string | null` (optional)
- `transition_effect`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `SliderGroupUpdate`

- `auto_play`: `boolean | null` (optional)
- `auto_play_duration`: `integer | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `location`: `string | null` (optional)
- `max_slides`: `integer | null` (optional)
- `name`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `show_arrows`: `boolean | null` (optional)
- `show_navigation_dots`: `boolean | null` (optional)
- `slug`: `string | null` (optional)
- `transition_effect`: `string | null` (optional)

### `SliderSnapshot`

- `approved_at`: `string | null` (optional)
- `approved_by_id`: `string | null` (optional)
- `archived_at`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `desktop_media`: `object | null` (optional)
- `desktop_media_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `end_datetime`: `string | null` (optional)
- `expires_at`: `string | null` (optional)
- `external_url`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `link_text`: `string | null` (optional)
- `mobile_media`: `object | null` (optional)
- `mobile_media_id`: `string | null` (optional)
- `open_in_new_tab`: `boolean | null` (optional)
- `owner_portal`: `string | null` (optional)
- `owner_scope_id`: `string | null` (optional)
- `owner_scope_type`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `published_by_id`: `string | null` (optional)
- `rejection_reason`: `string | null` (optional)
- `reviewed_at`: `string | null` (optional)
- `reviewed_by_id`: `string | null` (optional)
- `revision_notes`: `string | null` (optional)
- `rich_text`: `string | null` (optional)
- `scheduled_publish_at`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slider_group`: `object | null` (optional)
- `slider_group_id`: `string | null` (optional)
- `start_datetime`: `string | null` (optional)
- `structured_content`: `object | null` (optional)
- `submitted_at`: `string | null` (optional)
- `submitted_by_id`: `string | null` (optional)
- `subtitle`: `string | null` (optional)
- `title`: `string | null` (optional)
- `unpublished_at`: `string | null` (optional)
- `unpublished_by_id`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `updated_by`: `object | null` (optional)
- `updated_by_id`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `SliderUpdate`

- `desktop_media_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `end_datetime`: `string | null` (optional)
- `external_url`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_main`: `boolean | null` (optional)
- `link_text`: `string | null` (optional)
- `mobile_media_id`: `string | null` (optional)
- `open_in_new_tab`: `boolean | null` (optional)
- `plain_text`: `string | null` (optional)
- `rich_text`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slider_group_id`: `string | null` (optional)
- `start_datetime`: `string | null` (optional)
- `structured_content`: `object | null` (optional)
- `subtitle`: `string | null` (optional)
- `title`: `string | null` (optional)

### `SocialCredentialsValidation`

- `error`: `string | null` (optional)
- `valid`: `boolean` (required)

### `SocialLinks`

- `facebook`: `string | null` (optional)
- `instagram`: `string | null` (optional)
- `linkedin`: `string | null` (optional)
- `twitter`: `string | null` (optional)
- `youtube`: `string | null` (optional)

### `SocialMediaDeliverySnapshot`

- `account`: `object | null` (optional)
- `account_id`: `string | null` (optional)
- `attempts`: `integer | null` (optional)
- `created_at`: `string | null` (optional)
- `error_message`: `string | null` (optional)
- `id`: `string | null` (optional)
- `last_attempted_at`: `string | null` (optional)
- `platform`: `string | null` (optional)
- `posted_at`: `string | null` (optional)
- `provider_post_id`: `string | null` (optional)
- `request_payload`: `object | null` (optional)
- `response_payload`: `object | null` (optional)
- `social_post`: `object | null` (optional)
- `social_post_id`: `string | null` (optional)
- `status`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `validation_errors`: `array<object> | null` (optional)

### `SocialMediaPostCreate`

- `content`: `string` (required)
- `media_ids`: `array<string> | null` (optional)
- `platforms`: `array<string>` (required)
- `scheduled_at`: `string | null` (optional)
- `source_id`: `string | null` (optional)
- `source_type`: `string` (required)
- `status`: `string` (optional)
- `title`: `string | null` (optional)

### `SocialMediaPostSnapshot`

- `content`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `created_by`: `object | null` (optional)
- `created_by_id`: `string | null` (optional)
- `deliveries`: `array<object> | null` (optional)
- `error_message`: `string | null` (optional)
- `id`: `string | null` (optional)
- `media_ids`: `array<string> | null` (optional)
- `platform_post_ids`: `object | null` (optional)
- `platforms`: `array<string> | null` (optional)
- `posted_at`: `string | null` (optional)
- `scheduled_at`: `string | null` (optional)
- `source_id`: `string | null` (optional)
- `source_type`: `string | null` (optional)
- `status`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `validation_summary`: `object | null` (optional)

### `SocialMediaPostUpdate`

- `content`: `string | null` (optional)
- `error_message`: `string | null` (optional)
- `media_ids`: `array<string> | null` (optional)
- `platform_post_ids`: `object | null` (optional)
- `platforms`: `array<string> | null` (optional)
- `posted_at`: `string | null` (optional)
- `scheduled_at`: `string | null` (optional)
- `source_id`: `string | null` (optional)
- `source_type`: `string | null` (optional)
- `status`: `string | null` (optional)
- `title`: `string | null` (optional)

### `SocialPlatformAccountCreate`

- `account_ref`: `string` (required)
- `credentials`: `object` (required)
- `is_active`: `boolean` (optional)
- `name`: `string` (required)
- `provider`: `string` (required)
- `settings`: `object | null` (optional)

### `SocialPlatformAccountSnapshot`

- `account_ref`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `created_by`: `object | null` (optional)
- `created_by_id`: `string | null` (optional)
- `deliveries`: `array<object> | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `last_error`: `string | null` (optional)
- `last_used_at`: `string | null` (optional)
- `last_validated_at`: `string | null` (optional)
- `name`: `string | null` (optional)
- `provider`: `string | null` (optional)
- `settings`: `object | null` (optional)
- `updated_at`: `string | null` (optional)

### `SocialPlatformAccountUpdate`

- `account_ref`: `string | null` (optional)
- `credentials`: `object | null` (optional)
- `is_active`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `settings`: `object | null` (optional)

### `SocialValidationIssue`

- `code`: `string` (required)
- `message`: `string` (required)

### `SocialValidationSummary`

- No direct properties documented.

### `SportsFacilityCreate`

- `about`: `string | null` (optional)
- `campus_id`: `string` (required)
- `cover_image_id`: `string | null` (optional)
- `email`: `string | null` (optional)
- `facility_type`: `string` (required)
- `gps_coordinates`: `object | null` (optional)
- `is_active`: `boolean` (optional)
- `location`: `string | null` (optional)
- `manager_id`: `string | null` (optional)
- `name`: `string` (required)
- `operating_hours`: `object | null` (optional)
- `phone`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `sport_types`: `array<string>` (required)

### `SportsFacilitySnapshot`

- `about`: `string | null` (optional)
- `campus`: `object | null` (optional)
- `campus_id`: `string | null` (optional)
- `cover_image`: `object | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `email`: `string | null` (optional)
- `facility_type`: `string | null` (optional)
- `gps_coordinates`: `object | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `location`: `string | null` (optional)
- `manager`: `object | null` (optional)
- `manager_id`: `string | null` (optional)
- `name`: `string | null` (optional)
- `operating_hours`: `object | null` (optional)
- `phone`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `sport_types`: `array<string> | null` (optional)
- `updated_at`: `string | null` (optional)

### `SportsFacilityUpdate`

- `about`: `string | null` (optional)
- `campus_id`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `email`: `string | null` (optional)
- `facility_type`: `string | null` (optional)
- `gps_coordinates`: `object | null` (optional)
- `is_active`: `boolean | null` (optional)
- `location`: `string | null` (optional)
- `manager_id`: `string | null` (optional)
- `name`: `string | null` (optional)
- `operating_hours`: `object | null` (optional)
- `phone`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `sport_types`: `array<string> | null` (optional)

### `StaffAssignmentActivate`

- `conflict_end_date`: `string | null` (optional)
- `conflict_notes`: `string | null` (optional)
- `conflict_resolution`: `string | null` (optional)
- `notes`: `string | null` (optional)
- `start_date`: `string | null` (optional)

### `StaffAssignmentConflictCheck`

- `entity_id`: `string | null` (optional)
- `entity_type`: `string` (required)
- `exclude_assignment_id`: `string | null` (optional)
- `role`: `string` (required)

### `StaffAssignmentCreate`

- `conflict_end_date`: `string | null` (optional)
- `conflict_notes`: `string | null` (optional)
- `conflict_resolution`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `end_date`: `string | null` (optional)
- `entity_id`: `string | null` (optional)
- `entity_type`: `string` (required)
- `hierarchy_level`: `integer` (required)
- `is_acting`: `boolean` (optional)
- `is_primary`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `notes`: `string | null` (optional)
- `person_id`: `string` (required)
- `reports_to_id`: `string | null` (optional)
- `role`: `string` (required)
- `show_term_dates`: `boolean` (optional)
- `start_date`: `string | null` (optional)
- `status`: `string` (optional)
- `term_renewable`: `boolean` (optional)
- `term_years`: `integer | null` (optional)
- `title`: `string | null` (optional)
- `user_id`: `string | null` (optional)

### `StaffAssignmentEnd`

- `end_date`: `string | null` (optional)
- `notes`: `string | null` (optional)

### `StaffAssignmentEntitySummary`

- `id`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `name`: `string` (required)
- `subtitle`: `string | null` (optional)
- `type`: `string` (required)

### `StaffAssignmentReassign`

- `conflict_end_date`: `string | null` (optional)
- `conflict_notes`: `string | null` (optional)
- `conflict_resolution`: `string | null` (optional)
- `end_previous_date`: `string | null` (optional)
- `notes`: `string | null` (optional)
- `person_id`: `string` (required)
- `start_date`: `string | null` (optional)
- `title`: `string | null` (optional)

### `StaffAssignmentSnapshot`

- `created_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `end_date`: `string | null` (optional)
- `entity`: `StaffAssignmentEntitySummary | null` (optional)
- `entity_id`: `string | null` (optional)
- `entity_type`: `string | null` (optional)
- `external_source`: `string | null` (optional)
- `external_source_id`: `string | null` (optional)
- `hierarchy_level`: `integer | null` (optional)
- `id`: `string | null` (optional)
- `is_acting`: `boolean | null` (optional)
- `is_current`: `boolean | null` (optional)
- `is_primary`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `notes`: `string | null` (optional)
- `person`: `object | null` (optional)
- `person_id`: `string | null` (optional)
- `reports_to`: `object | null` (optional)
- `reports_to_id`: `string | null` (optional)
- `role`: `string | null` (optional)
- `role_display`: `string | null` (optional)
- `show_term_dates`: `boolean | null` (optional)
- `start_date`: `string | null` (optional)
- `status`: `string | null` (optional)
- `subordinates`: `array<object> | null` (optional)
- `term_display`: `string | null` (optional)
- `term_renewable`: `boolean | null` (optional)
- `term_years`: `integer | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `user`: `object | null` (optional)
- `user_id`: `string | null` (optional)

### `StaffAssignmentUpdate`

- `conflict_end_date`: `string | null` (optional)
- `conflict_notes`: `string | null` (optional)
- `conflict_resolution`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `end_date`: `string | null` (optional)
- `entity_id`: `string | null` (optional)
- `entity_type`: `string | null` (optional)
- `hierarchy_level`: `integer | null` (optional)
- `is_acting`: `boolean | null` (optional)
- `is_primary`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `notes`: `string | null` (optional)
- `reports_to_id`: `string | null` (optional)
- `role`: `string | null` (optional)
- `show_term_dates`: `boolean | null` (optional)
- `start_date`: `string | null` (optional)
- `status`: `string | null` (optional)
- `term_renewable`: `boolean | null` (optional)
- `term_years`: `integer | null` (optional)
- `title`: `string | null` (optional)
- `user_id`: `string | null` (optional)

### `StaffConflictHolder`

- `assignment_id`: `string` (required)
- `is_acting`: `boolean` (required)
- `person_id`: `string` (required)
- `person_name`: `string | null` (optional)
- `role`: `string` (required)
- `start_date`: `string | null` (optional)
- `title`: `string | null` (optional)

### `StaffConflictPayload`

- `allowed_resolutions`: `array<string>` (optional)
- `current_holder`: `StaffConflictHolder | null` (optional)
- `entity_label`: `string` (required)
- `has_conflict`: `boolean` (required)
- `role_label`: `string` (required)

### `StaffEntityOption`

- `entity_type`: `string` (required)
- `id`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `label`: `string` (required)
- `subtitle`: `string | null` (optional)

### `StaffEntityTypeOption`

- `description`: `string` (required)
- `label`: `string` (required)
- `roles`: `array<string>` (required)
- `type`: `string` (required)

### `StaffRoleOption`

- `hierarchy_level`: `integer` (required)
- `is_unique`: `boolean` (required)
- `label`: `string` (required)
- `role`: `string` (required)

### `StepUpRequest`

- `mfa_code`: `string` (required)
- `password`: `string` (required)

### `StoryContributorAccountRequestCreate`

- `affiliation`: `string | null` (optional)
- `contributor_type`: `string` (optional)
- `email`: `string` (required)
- `full_name`: `string` (required)
- `phone`: `string | null` (optional)
- `reason_for_request`: `string | null` (optional)

### `StoryContributorAccountRequestRead`

- `affiliation`: `string | null` (optional)
- `approved_user_id`: `string | null` (optional)
- `contributor_type`: `string` (required)
- `created_at`: `string` (required)
- `deleted_at`: `string | null` (optional)
- `email`: `string` (required)
- `full_name`: `string` (required)
- `id`: `string` (required)
- `ip_address`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `reason_for_request`: `string | null` (optional)
- `rejection_reason`: `string | null` (optional)
- `reviewed_at`: `string | null` (optional)
- `reviewed_by_id`: `string | null` (optional)
- `status`: `string` (required)
- `updated_at`: `string` (required)
- `user_agent`: `string | null` (optional)
- `verified_at`: `string | null` (optional)

### `StoryContributorAccountRequestReview`

- `rejection_reason`: `string | null` (optional)

### `StoryCreate`

- `category`: `string | null` (optional)
- `consent_to_publish`: `boolean` (optional)
- `contributor_affiliation_snapshot`: `string | null` (optional)
- `contributor_email_snapshot`: `string | null` (optional)
- `contributor_name_snapshot`: `string | null` (optional)
- `contributor_user_id`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `featured_media_id`: `string | null` (optional)
- `featured_until`: `string | null` (optional)
- `homepage_priority`: `integer` (optional)
- `is_featured`: `boolean` (optional)
- `is_main`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `reading_minutes`: `integer | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `rich_text`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `show_contributor_name`: `boolean` (optional)
- `slug`: `string` (required)
- `source_type`: `string` (optional)
- `story_type`: `string` (optional)
- `structured_content`: `object | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)

### `StorySnapshot`

- `approved_at`: `string | null` (optional)
- `approved_by_id`: `string | null` (optional)
- `archived_at`: `string | null` (optional)
- `author`: `object | null` (optional)
- `author_user_id`: `string | null` (optional)
- `category`: `string | null` (optional)
- `consent_to_publish`: `boolean | null` (optional)
- `contributor`: `object | null` (optional)
- `contributor_affiliation_snapshot`: `string | null` (optional)
- `contributor_email_snapshot`: `string | null` (optional)
- `contributor_name_snapshot`: `string | null` (optional)
- `contributor_user_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `expires_at`: `string | null` (optional)
- `featured_media`: `object | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `featured_until`: `string | null` (optional)
- `homepage_priority`: `integer | null` (optional)
- `id`: `string | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_published`: `boolean | null` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `owner_portal`: `string | null` (optional)
- `owner_scope_id`: `string | null` (optional)
- `owner_scope_type`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `published_by_id`: `string | null` (optional)
- `reading_minutes`: `integer | null` (optional)
- `rejection_reason`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `reviewed_at`: `string | null` (optional)
- `reviewed_by_id`: `string | null` (optional)
- `revision_notes`: `string | null` (optional)
- `rich_text`: `string | null` (optional)
- `scheduled_publish_at`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `show_contributor_name`: `boolean | null` (optional)
- `slug`: `string | null` (optional)
- `source_type`: `string | null` (optional)
- `status`: `string | null` (optional)
- `story_type`: `string | null` (optional)
- `structured_content`: `object | null` (optional)
- `submitted_at`: `string | null` (optional)
- `submitted_by_id`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `unpublished_at`: `string | null` (optional)
- `unpublished_by_id`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `updated_by`: `object | null` (optional)
- `updated_by_id`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `StorySubmissionCreate`

- `category`: `string | null` (optional)
- `consent_to_publish`: `boolean` (required)
- `contributor_affiliation_snapshot`: `string | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `rich_text`: `string | null` (optional)
- `show_contributor_name`: `boolean` (optional)
- `story_type`: `string` (optional)
- `structured_content`: `object | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)

### `StoryUpdate`

- `category`: `string | null` (optional)
- `consent_to_publish`: `boolean | null` (optional)
- `contributor_affiliation_snapshot`: `string | null` (optional)
- `contributor_email_snapshot`: `string | null` (optional)
- `contributor_name_snapshot`: `string | null` (optional)
- `contributor_user_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `featured_until`: `string | null` (optional)
- `homepage_priority`: `integer | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_main`: `boolean | null` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `reading_minutes`: `integer | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `rich_text`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `show_contributor_name`: `boolean | null` (optional)
- `slug`: `string | null` (optional)
- `source_type`: `string | null` (optional)
- `story_type`: `string | null` (optional)
- `structured_content`: `object | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)

### `StudentGovernanceCreate`

- `about`: `string | null` (optional)
- `acronym`: `string | null` (optional)
- `chairperson_id`: `string | null` (optional)
- `constitution`: `string | null` (optional)
- `email`: `string | null` (optional)
- `governance_type`: `string` (required)
- `is_active`: `boolean` (optional)
- `logo_id`: `string | null` (optional)
- `mandate`: `string | null` (optional)
- `name`: `string` (required)
- `office_location`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `school_id`: `string | null` (optional)
- `secretary_general_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `term_end`: `string | null` (optional)
- `term_start`: `string | null` (optional)
- `vice_chairperson_id`: `string | null` (optional)

### `StudentGovernanceSnapshot`

- `about`: `string | null` (optional)
- `acronym`: `string | null` (optional)
- `chairperson`: `object | null` (optional)
- `chairperson_id`: `string | null` (optional)
- `constitution`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `email`: `string | null` (optional)
- `governance_type`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `logo`: `object | null` (optional)
- `logo_id`: `string | null` (optional)
- `mandate`: `string | null` (optional)
- `name`: `string | null` (optional)
- `office_location`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `school`: `object | null` (optional)
- `school_id`: `string | null` (optional)
- `secretary_general`: `object | null` (optional)
- `secretary_general_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `term_end`: `string | null` (optional)
- `term_start`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `vice_chairperson`: `object | null` (optional)
- `vice_chairperson_id`: `string | null` (optional)

### `StudentGovernanceUpdate`

- `about`: `string | null` (optional)
- `acronym`: `string | null` (optional)
- `chairperson_id`: `string | null` (optional)
- `constitution`: `string | null` (optional)
- `email`: `string | null` (optional)
- `governance_type`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `logo_id`: `string | null` (optional)
- `mandate`: `string | null` (optional)
- `name`: `string | null` (optional)
- `office_location`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `school_id`: `string | null` (optional)
- `secretary_general_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `term_end`: `string | null` (optional)
- `term_start`: `string | null` (optional)
- `vice_chairperson_id`: `string | null` (optional)

### `SuccessResponse_AboutPageContentSnapshot_`

- `data`: `AboutPageContentSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_AcademicCalendarComposition_`

- `data`: `AcademicCalendarComposition | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_AcademicCalendarDocumentSnapshot_`

- `data`: `AcademicCalendarDocumentSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_AcademicCalendarEventSnapshot_`

- `data`: `AcademicCalendarEventSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_AcademicCalendarSnapshot_`

- `data`: `AcademicCalendarSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_AcademicTimetableSnapshot_`

- `data`: `AcademicTimetableSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_AccommodationSnapshot_`

- `data`: `AccommodationSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ActivatedWorkspace_`

- `data`: `ActivatedWorkspace | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_AdminActivityReport_`

- `data`: `AdminActivityReport | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_AdmissionDocumentSnapshot_`

- `data`: `AdmissionDocumentSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_AdmissionFaqSnapshot_`

- `data`: `AdmissionFaqSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_AdmissionInfoSnapshot_`

- `data`: `AdmissionInfoSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_AdmissionPageSectionSnapshot_`

- `data`: `AdmissionPageSectionSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_AdmissionPathwaySnapshot_`

- `data`: `AdmissionPathwaySnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_AdmissionRequirementSnapshot_`

- `data`: `AdmissionRequirementSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_AlumniAssociationMemberSnapshot_`

- `data`: `AlumniAssociationMemberSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_AlumniAssociationSnapshot_`

- `data`: `AlumniAssociationSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_AlumniSnapshot_`

- `data`: `AlumniSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_AnnouncementSnapshot_`

- `data`: `AnnouncementSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ApiKeyCreateEnvelope_`

- `data`: `ApiKeyCreateEnvelope | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ApiKeySnapshot_`

- `data`: `ApiKeySnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ArtsCultureSnapshot_`

- `data`: `ArtsCultureSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_AssuranceResponse_`

- `data`: `AssuranceResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_AuditLogRead_`

- `data`: `AuditLogRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_AuthUserResponse_`

- `data`: `AuthUserResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_BlogSnapshot_`

- `data`: `BlogSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_BoardMemberSnapshot_`

- `data`: `BoardMemberSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_BoardSnapshot_`

- `data`: `BoardSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_CampusLifeHomepageRead_`

- `data`: `CampusLifeHomepageRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_CampusSnapshot_`

- `data`: `CampusSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ClubActivitySnapshot_`

- `data`: `ClubActivitySnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ClubMediaRead_`

- `data`: `ClubMediaRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ClubSnapshot_`

- `data`: `ClubSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ContactDirectorySnapshot_`

- `data`: `ContactDirectorySnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ContactInquiryMessageRead_`

- `data`: `ContactInquiryMessageRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ContactInquiryRead_`

- `data`: `ContactInquiryRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ContentReport_`

- `data`: `ContentReport | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ContentWorkflowRecordSnapshot_`

- `data`: `ContentWorkflowRecordSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_CorporateCommEngagementResponse_`

- `data`: `CorporateCommEngagementResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_CorporateCommSettingsResponse_`

- `data`: `CorporateCommSettingsResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_CorporateCommTeamResponse_`

- `data`: `CorporateCommTeamResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_CorporateDashboardResponse_`

- `data`: `CorporateDashboardResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_CorporatePortalContextResponse_`

- `data`: `CorporatePortalContextResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_CouncilDashboardRead_`

- `data`: `CouncilDashboardRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_CouncilMemberSnapshot_`

- `data`: `CouncilMemberSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_DepartmentServiceSnapshot_`

- `data`: `DepartmentServiceSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_DepartmentSnapshot_`

- `data`: `DepartmentSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_DivisionSnapshot_`

- `data`: `DivisionSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_DocumentSnapshot_`

- `data`: `DocumentSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_EnrollmentResponse_`

- `data`: `EnrollmentResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_EventSnapshot_`

- `data`: `EventSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ExchangeProgrammeSnapshot_`

- `data`: `ExchangeProgrammeSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_FAQSnapshot_`

- `data`: `FAQSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_FactEditionSnapshot_`

- `data`: `FactEditionSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_FactGroupSnapshot_`

- `data`: `FactGroupSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_FactItemSnapshot_`

- `data`: `FactItemSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_GovernancePageContentRead_`

- `data`: `GovernancePageContentRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_GovernanceRoleSnapshot_`

- `data`: `GovernanceRoleSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_HealthPayload_`

- `data`: `HealthPayload | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_HistoryMilestoneSnapshot_`

- `data`: `HistoryMilestoneSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ImportCommitRead_`

- `data`: `ImportCommitRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ImportJobRead_`

- `data`: `ImportJobRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ImportPreviewRead_`

- `data`: `ImportPreviewRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ImportResourceRead_`

- `data`: `ImportResourceRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_InstitutionalPageItemSnapshot_`

- `data`: `InstitutionalPageItemSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_InstitutionalPageSectionSnapshot_`

- `data`: `InstitutionalPageSectionSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_InstitutionalPageSnapshot_`

- `data`: `InstitutionalPageSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_InstitutionalSectionDocumentSnapshot_`

- `data`: `InstitutionalSectionDocumentSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_IntakeHomepageAdmissionRead_`

- `data`: `IntakeHomepageAdmissionRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_IntakeSnapshot_`

- `data`: `IntakeSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_MediaFolderSnapshot_`

- `data`: `MediaFolderSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_MediaLinkSnapshot_`

- `data`: `MediaLinkSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_MediaSnapshot_`

- `data`: `MediaSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_MfaStatusResponse_`

- `data`: `MfaStatusResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_NavigationPayload_`

- `data`: `NavigationPayload | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_NewsSnapshot_`

- `data`: `NewsSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_NewsletterSnapshot_`

- `data`: `NewsletterSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_NewsletterSubscriberSnapshot_`

- `data`: `NewsletterSubscriberSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_NoneType_`

- `data`: `null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_NotificationBroadcastPreview_`

- `data`: `NotificationBroadcastPreview | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_NotificationBroadcastResult_`

- `data`: `NotificationBroadcastResult | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_NotificationPreferences_`

- `data`: `NotificationPreferences | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_NotificationSnapshot_`

- `data`: `NotificationSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_NotificationTemplateSnapshot_`

- `data`: `NotificationTemplateSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_NotificationUpdateCount_`

- `data`: `NotificationUpdateCount | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PageCompositionResponse_`

- `data`: `PageCompositionResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PagePreviewResponse_`

- `data`: `PagePreviewResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PageSectionSnapshot_`

- `data`: `PageSectionSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PageValidationResponse_`

- `data`: `PageValidationResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PartnerDetailSnapshot_`

- `data`: `PartnerDetailSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PartnershipSpotlightSnapshot_`

- `data`: `PartnershipSpotlightSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PermissionSnapshot_`

- `data`: `PermissionSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PersonRead_`

- `data`: `PersonRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PersonSnapshot_`

- `data`: `PersonSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PolicySnapshot_`

- `data`: `PolicySnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PortalAccessResponse_`

- `data`: `PortalAccessResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PortalStatsResponse_`

- `data`: `PortalStatsResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PortalUploadBatchRead_`

- `data`: `PortalUploadBatchRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ProgrammeFeeStructureSnapshot_`

- `data`: `ProgrammeFeeStructureSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ProgrammeIntakeSnapshot_`

- `data`: `ProgrammeIntakeSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ProgrammeSnapshot_`

- `data`: `ProgrammeSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ProgrammeTutorSnapshot_`

- `data`: `ProgrammeTutorSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PublicAboutRead_`

- `data`: `PublicAboutRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PublicAcademicOrganizationPayload_`

- `data`: `PublicAcademicOrganizationPayload | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PublicContactDirectorySnapshot_`

- `data`: `PublicContactDirectorySnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PublicCouncilProfile_`

- `data`: `PublicCouncilProfile | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PublicCouncilResponse_`

- `data`: `PublicCouncilResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PublicEntityContentPayload_`

- `data`: `PublicEntityContentPayload | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PublicFactsRead_`

- `data`: `PublicFactsRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PublicHistoryRead_`

- `data`: `PublicHistoryRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PublicInquirySubmission_`

- `data`: `PublicInquirySubmission | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PublicInstitutionalPageRead_`

- `data`: `PublicInstitutionalPageRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PublicResearchContextPayload_`

- `data`: `PublicResearchContextPayload | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PublicSchoolTeamPayload_`

- `data`: `PublicSchoolTeamPayload | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PublicSitePageSnapshot_`

- `data`: `PublicSitePageSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PublicStatsResponse_`

- `data`: `PublicStatsResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PublicTeamPayload_`

- `data`: `PublicTeamPayload | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_RecoveryResponse_`

- `data`: `RecoveryResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ReportsOverview_`

- `data`: `ReportsOverview | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_RoleSnapshot_`

- `data`: `RoleSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SchoolContentImportResponse_`

- `data`: `SchoolContentImportResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SchoolContentRecordSnapshot_`

- `data`: `SchoolContentRecordSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SchoolMediaSnapshot_`

- `data`: `SchoolMediaSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SchoolPortalCapabilitiesResponse_`

- `data`: `SchoolPortalCapabilitiesResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SchoolPortalContextResponse_`

- `data`: `SchoolPortalContextResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SchoolPortalDashboardResponse_`

- `data`: `SchoolPortalDashboardResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SchoolPortalProfileResponse_`

- `data`: `SchoolPortalProfileResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SchoolSnapshot_`

- `data`: `SchoolSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SchoolTeamAssignmentRead_`

- `data`: `SchoolTeamAssignmentRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SchoolTeamImportJobRead_`

- `data`: `SchoolTeamImportJobRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SearchResponse_`

- `data`: `SearchResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SectionItemSnapshot_`

- `data`: `SectionItemSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SettingSnapshot_`

- `data`: `SettingSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SliderGroupSnapshot_`

- `data`: `SliderGroupSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SliderSnapshot_`

- `data`: `SliderSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SocialCredentialsValidation_`

- `data`: `SocialCredentialsValidation | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SocialMediaPostSnapshot_`

- `data`: `SocialMediaPostSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SocialPlatformAccountSnapshot_`

- `data`: `SocialPlatformAccountSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SocialValidationSummary_`

- `data`: `SocialValidationSummary | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SportsFacilitySnapshot_`

- `data`: `SportsFacilitySnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_StaffAssignmentSnapshot_`

- `data`: `StaffAssignmentSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_StaffConflictPayload_`

- `data`: `StaffConflictPayload | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_StoryContributorAccountRequestRead_`

- `data`: `StoryContributorAccountRequestRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_StorySnapshot_`

- `data`: `StorySnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_StudentGovernanceSnapshot_`

- `data`: `StudentGovernanceSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SupportTicketSnapshot_`

- `data`: `SupportTicketSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SyncJobPayload_`

- `data`: `SyncJobPayload | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_TestimonialSnapshot_`

- `data`: `TestimonialSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_TimetableSittingSnapshot_`

- `data`: `TimetableSittingSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_TimetableVenueSnapshot_`

- `data`: `TimetableVenueSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_TrafficReport_`

- `data`: `TrafficReport | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_Union_StaffAssignmentSnapshot__NoneType__`

- `data`: `StaffAssignmentSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_Union_TokenResponse__CookieAuthResponse__`

- `data`: `TokenResponse | CookieAuthResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_UniversityInfoSnapshot_`

- `data`: `UniversityInfoSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_UploadBatchRead_`

- `data`: `UploadBatchRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_UserPreferencesRead_`

- `data`: `UserPreferencesRead | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_UserRoleSnapshot_`

- `data`: `UserRoleSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_UserSnapshot_`

- `data`: `UserSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_VcGalleryAlbumSnapshot_`

- `data`: `VcGalleryAlbumSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_VcGalleryMediaResponse_`

- `data`: `VcGalleryMediaResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_VcGalleryPage_`

- `data`: `VcGalleryPage | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_VcHubPlacementSnapshot_`

- `data`: `VcHubPlacementSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_VcHubSnapshot_`

- `data`: `VcHubSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_VcPortraitSnapshot_`

- `data`: `VcPortraitSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_VcPublicGalleryResponse_`

- `data`: `VcPublicGalleryResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_VcPublicHubResponse_`

- `data`: `VcPublicHubResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_VcPublicSpeechResponse_`

- `data`: `VcPublicSpeechResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_VcSpeechPage_`

- `data`: `VcSpeechPage | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_VcSpeechSnapshot_`

- `data`: `VcSpeechSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_VcSpeechVideoResponse_`

- `data`: `VcSpeechVideoResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_VcVideoPage_`

- `data`: `VcVideoPage | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_VcVideoSnapshot_`

- `data`: `VcVideoSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_VcWorkflowTransitionResponse_`

- `data`: `VcWorkflowTransitionResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_VcYouTubePreviewResponse_`

- `data`: `VcYouTubePreviewResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_WebhookCreateEnvelope_`

- `data`: `WebhookCreateEnvelope | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_WebhookSnapshot_`

- `data`: `WebhookSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_WingSnapshot_`

- `data`: `WingSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_WorkspaceContext_`

- `data`: `WorkspaceContext | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_bool_`

- `data`: `boolean | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_dict_str__Union_str__bool___`

- `data`: `object | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_dict_str__int__`

- `data`: `object | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_dict_str__object__`

- `data`: `object | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_dict_str__str__`

- `data`: `object | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_AcademicCalendarEventSnapshot__`

- `data`: `array<AcademicCalendarEventSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_AcademicCalendarSnapshot__`

- `data`: `array<AcademicCalendarSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_AcademicRankOption__`

- `data`: `array<AcademicRankOption> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_AccommodationSnapshot__`

- `data`: `array<AccommodationSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_AdmissionDocumentSnapshot__`

- `data`: `array<AdmissionDocumentSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_AdmissionFaqSnapshot__`

- `data`: `array<AdmissionFaqSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_AdmissionInfoSnapshot__`

- `data`: `array<AdmissionInfoSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_AdmissionPageSectionSnapshot__`

- `data`: `array<AdmissionPageSectionSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_AdmissionPathwaySnapshot__`

- `data`: `array<AdmissionPathwaySnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_AdmissionRequirementSnapshot__`

- `data`: `array<AdmissionRequirementSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_AlumniAssociationMemberSnapshot__`

- `data`: `array<AlumniAssociationMemberSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_AlumniAssociationSnapshot__`

- `data`: `array<AlumniAssociationSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_AlumniSnapshot__`

- `data`: `array<AlumniSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_AnnouncementSnapshot__`

- `data`: `array<AnnouncementSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_ApiKeySnapshot__`

- `data`: `array<ApiKeySnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_ArtsCultureSnapshot__`

- `data`: `array<ArtsCultureSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_AuditLogRead__`

- `data`: `array<AuditLogRead> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_BlogSnapshot__`

- `data`: `array<BlogSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_BoardMemberSnapshot__`

- `data`: `array<BoardMemberSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_BoardSnapshot__`

- `data`: `array<BoardSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_BulkWorkflowResult__`

- `data`: `array<BulkWorkflowResult> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_CampusSnapshot__`

- `data`: `array<CampusSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_ClubActivitySnapshot__`

- `data`: `array<ClubActivitySnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_ClubLeaderRead__`

- `data`: `array<ClubLeaderRead> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_ClubMediaRead__`

- `data`: `array<ClubMediaRead> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_ClubSnapshot__`

- `data`: `array<ClubSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_ContactDirectorySnapshot__`

- `data`: `array<ContactDirectorySnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_ContactInquiryRead__`

- `data`: `array<ContactInquiryRead> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_ContactOwnerRead__`

- `data`: `array<ContactOwnerRead> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_ContentWorkflowLogRead__`

- `data`: `array<ContentWorkflowLogRead> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_ContentWorkflowQueueItemRead__`

- `data`: `array<ContentWorkflowQueueItemRead> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_CouncilMemberSnapshot__`

- `data`: `array<CouncilMemberSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_CouncilOrderNode__`

- `data`: `array<CouncilOrderNode> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_DepartmentServiceSnapshot__`

- `data`: `array<DepartmentServiceSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_DepartmentSnapshot__`

- `data`: `array<DepartmentSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_DivisionSnapshot__`

- `data`: `array<DivisionSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_DocumentSnapshot__`

- `data`: `array<DocumentSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_EventSnapshot__`

- `data`: `array<EventSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_ExchangeProgrammeSnapshot__`

- `data`: `array<ExchangeProgrammeSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_FAQSnapshot__`

- `data`: `array<FAQSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_FactEditionSnapshot__`

- `data`: `array<FactEditionSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_FactGroupSnapshot__`

- `data`: `array<FactGroupSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_FactItemSnapshot__`

- `data`: `array<FactItemSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_GovernanceRoleSnapshot__`

- `data`: `array<GovernanceRoleSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_HistoryMilestoneSnapshot__`

- `data`: `array<HistoryMilestoneSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_ImportResourceRead__`

- `data`: `array<ImportResourceRead> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_InstitutionalPageItemSnapshot__`

- `data`: `array<InstitutionalPageItemSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_InstitutionalPageSectionSnapshot__`

- `data`: `array<InstitutionalPageSectionSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_InstitutionalPageSnapshot__`

- `data`: `array<InstitutionalPageSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_InstitutionalSectionDocumentSnapshot__`

- `data`: `array<InstitutionalSectionDocumentSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_IntakeSnapshot__`

- `data`: `array<IntakeSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_MediaFolderSnapshot__`

- `data`: `array<MediaFolderSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_MediaLinkSnapshot__`

- `data`: `array<MediaLinkSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_MediaSnapshot__`

- `data`: `array<MediaSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_NewsSnapshot__`

- `data`: `array<NewsSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_NewsletterSnapshot__`

- `data`: `array<NewsletterSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_NewsletterSubscriberSnapshot__`

- `data`: `array<NewsletterSubscriberSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_NotificationDeliverySnapshot__`

- `data`: `array<NotificationDeliverySnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_NotificationSnapshot__`

- `data`: `array<NotificationSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_NotificationTemplateSnapshot__`

- `data`: `array<NotificationTemplateSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_PageCmsSourceSummary__`

- `data`: `array<PageCmsSourceSummary> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_PageSectionSnapshot__`

- `data`: `array<PageSectionSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_PartnerListSnapshot__`

- `data`: `array<PartnerListSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_PartnershipSpotlightSnapshot__`

- `data`: `array<PartnershipSpotlightSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_PermissionSnapshot__`

- `data`: `array<PermissionSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_PersonSnapshot__`

- `data`: `array<PersonSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_PolicySnapshot__`

- `data`: `array<PolicySnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_ProgrammeFeeStructureSnapshot__`

- `data`: `array<ProgrammeFeeStructureSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_ProgrammeSnapshot__`

- `data`: `array<ProgrammeSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_PublicSettingSnapshot__`

- `data`: `array<PublicSettingSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_PublicSitePageSnapshot__`

- `data`: `array<PublicSitePageSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_PublicTimetableItem__`

- `data`: `array<PublicTimetableItem> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_RoleSnapshot__`

- `data`: `array<RoleSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_SchoolContentListItem__`

- `data`: `array<SchoolContentListItem> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_SchoolSnapshot__`

- `data`: `array<SchoolSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_SchoolTeamAssignmentRead__`

- `data`: `array<SchoolTeamAssignmentRead> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_SchoolTeamPersonOptionRead__`

- `data`: `array<SchoolTeamPersonOptionRead> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_SectionDefinitionRead__`

- `data`: `array<SectionDefinitionRead> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_SectionItemSnapshot__`

- `data`: `array<SectionItemSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_SettingSnapshot__`

- `data`: `array<SettingSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_SliderGroupSnapshot__`

- `data`: `array<SliderGroupSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_SliderSnapshot__`

- `data`: `array<SliderSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_SocialMediaDeliverySnapshot__`

- `data`: `array<SocialMediaDeliverySnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_SocialMediaPostSnapshot__`

- `data`: `array<SocialMediaPostSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_SocialPlatformAccountSnapshot__`

- `data`: `array<SocialPlatformAccountSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_SportsFacilitySnapshot__`

- `data`: `array<SportsFacilitySnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_StaffAssignmentSnapshot__`

- `data`: `array<StaffAssignmentSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_StaffEntityOption__`

- `data`: `array<StaffEntityOption> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_StaffEntityTypeOption__`

- `data`: `array<StaffEntityTypeOption> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_StaffRoleOption__`

- `data`: `array<StaffRoleOption> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_StoryContributorAccountRequestRead__`

- `data`: `array<StoryContributorAccountRequestRead> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_StorySnapshot__`

- `data`: `array<StorySnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_StudentGovernanceSnapshot__`

- `data`: `array<StudentGovernanceSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_SupportTicketSnapshot__`

- `data`: `array<SupportTicketSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_TestimonialSnapshot__`

- `data`: `array<TestimonialSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_TimetableVenueSnapshot__`

- `data`: `array<TimetableVenueSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_UserRoleSnapshot__`

- `data`: `array<UserRoleSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_UserSnapshot__`

- `data`: `array<UserSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_VcGalleryMediaResponse__`

- `data`: `array<VcGalleryMediaResponse> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_VcHubPlacementSnapshot__`

- `data`: `array<VcHubPlacementSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_VcPortraitSnapshot__`

- `data`: `array<VcPortraitSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_VcSpeechVideoResponse__`

- `data`: `array<VcSpeechVideoResponse> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_WebhookDeliveryRead__`

- `data`: `array<WebhookDeliveryRead> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_WebhookSnapshot__`

- `data`: `array<WebhookSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_WingSnapshot__`

- `data`: `array<WingSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_WorkspaceContext__`

- `data`: `array<WorkspaceContext> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_str_`

- `data`: `string | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SupportTicketCreate`

- `category`: `string | null` (optional)
- `description_plain_text`: `string | null` (optional)
- `description_rich_text`: `string | null` (optional)
- `description_structured`: `object | null` (optional)
- `meta_data`: `object | null` (optional)
- `priority`: `string` (optional)
- `requester_email`: `string | null` (optional)
- `requester_name`: `string | null` (optional)
- `requester_phone`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `subject`: `string` (required)
- `ticket_type`: `string | null` (optional)

### `SupportTicketSnapshot`

- `assigned_to_user`: `object | null` (optional)
- `assigned_to_user_id`: `string | null` (optional)
- `category`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `description_plain_text`: `string | null` (optional)
- `description_rich_text`: `string | null` (optional)
- `description_structured`: `object | null` (optional)
- `id`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `meta_data`: `object | null` (optional)
- `priority`: `string | null` (optional)
- `requester_email`: `string | null` (optional)
- `requester_name`: `string | null` (optional)
- `requester_phone`: `string | null` (optional)
- `requester_user`: `object | null` (optional)
- `requester_user_id`: `string | null` (optional)
- `resolution`: `string | null` (optional)
- `resolved_at`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `status`: `string | null` (optional)
- `subject`: `string | null` (optional)
- `ticket_type`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `SupportTicketUpdate`

- `assigned_to_user_id`: `string | null` (optional)
- `category`: `string | null` (optional)
- `description_plain_text`: `string | null` (optional)
- `description_rich_text`: `string | null` (optional)
- `description_structured`: `object | null` (optional)
- `meta_data`: `object | null` (optional)
- `priority`: `string | null` (optional)
- `resolution`: `string | null` (optional)
- `resolved_at`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `status`: `string | null` (optional)
- `subject`: `string | null` (optional)
- `ticket_type`: `string | null` (optional)

### `SyncAttemptPayload`

- `attempt`: `integer` (required)
- `error`: `string | null` (optional)
- `finished_at`: `string` (required)
- `status`: `string` (required)

### `SyncEnvelope`

- `data`: `object` (optional)
- `message`: `string | null` (optional)
- `meta`: `object | null` (optional)

### `SyncJobPayload`

- `attempts`: `integer` (optional)
- `error`: `string | null` (optional)
- `history`: `array<SyncAttemptPayload>` (optional)
- `job_id`: `string` (required)
- `result`: `object` (optional)
- `retryable`: `boolean` (optional)
- `status`: `string` (required)

### `TestimonialCreate`

- `department_id`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `full_story`: `string | null` (optional)
- `is_approved`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `name`: `string` (required)
- `person_id`: `string | null` (optional)
- `photo_id`: `string | null` (optional)
- `programme_id`: `string | null` (optional)
- `quote`: `string` (required)
- `role`: `string | null` (optional)
- `school_id`: `string | null` (optional)
- `testimonial_type`: `string` (required)
- `video_url`: `string | null` (optional)

### `TestimonialSnapshot`

- `created_at`: `string | null` (optional)
- `department`: `object | null` (optional)
- `department_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `full_story`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_approved`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `person`: `object | null` (optional)
- `person_id`: `string | null` (optional)
- `photo`: `object | null` (optional)
- `photo_id`: `string | null` (optional)
- `programme`: `object | null` (optional)
- `programme_id`: `string | null` (optional)
- `quote`: `string | null` (optional)
- `role`: `string | null` (optional)
- `school`: `object | null` (optional)
- `school_id`: `string | null` (optional)
- `testimonial_type`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `updated_by`: `object | null` (optional)
- `updated_by_id`: `string | null` (optional)
- `video_url`: `string | null` (optional)

### `TestimonialUpdate`

- `department_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `full_story`: `string | null` (optional)
- `is_approved`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `person_id`: `string | null` (optional)
- `photo_id`: `string | null` (optional)
- `programme_id`: `string | null` (optional)
- `quote`: `string | null` (optional)
- `role`: `string | null` (optional)
- `school_id`: `string | null` (optional)
- `testimonial_type`: `string | null` (optional)
- `video_url`: `string | null` (optional)

### `TimetableSittingCreate`

- `candidate_count`: `integer | null` (optional)
- `cohort_label`: `string | null` (optional)
- `course_code`: `string` (required)
- `course_title`: `string` (required)
- `end_time`: `string` (required)
- `programme_ids`: `array<string>` (required)
- `sitting_date`: `string` (required)
- `special_instructions`: `string | null` (optional)
- `start_time`: `string` (required)
- `venue_id`: `string | null` (optional)

### `TimetableSittingRead`

- `candidate_count`: `integer | null` (optional)
- `cohort_label`: `string | null` (optional)
- `course_code`: `string` (required)
- `course_title`: `string` (required)
- `created_at`: `string` (required)
- `end_time`: `string` (required)
- `id`: `string` (required)
- `programmes`: `array<object> | null` (optional)
- `sitting_date`: `string` (required)
- `special_instructions`: `string | null` (optional)
- `start_time`: `string` (required)
- `status`: `string` (required)
- `timetable_id`: `string` (required)
- `updated_at`: `string` (required)
- `venue`: `object | null` (optional)
- `venue_id`: `string | null` (optional)

### `TimetableSittingSnapshot`

- `candidate_count`: `integer | null` (optional)
- `cohort_label`: `string | null` (optional)
- `course_code`: `string | null` (optional)
- `course_title`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `end_time`: `string | null` (optional)
- `id`: `string | null` (optional)
- `programmes`: `array<object> | null` (optional)
- `sitting_date`: `string | null` (optional)
- `special_instructions`: `string | null` (optional)
- `start_time`: `string | null` (optional)
- `status`: `string | null` (optional)
- `timetable_id`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `venue`: `object | null` (optional)
- `venue_id`: `string | null` (optional)

### `TimetableSittingUpdate`

- `candidate_count`: `integer | null` (optional)
- `cohort_label`: `string | null` (optional)
- `course_code`: `string | null` (optional)
- `course_title`: `string | null` (optional)
- `end_time`: `string | null` (optional)
- `programme_ids`: `array<string> | null` (optional)
- `sitting_date`: `string | null` (optional)
- `special_instructions`: `string | null` (optional)
- `start_time`: `string | null` (optional)
- `status`: `string | null` (optional)
- `venue_id`: `string | null` (optional)

### `TimetableVenueCreate`

- `building`: `string | null` (optional)
- `campus_id`: `string | null` (optional)
- `capacity`: `integer | null` (optional)
- `code`: `string` (required)
- `name`: `string` (required)

### `TimetableVenueSnapshot`

- `building`: `string | null` (optional)
- `campus_id`: `string | null` (optional)
- `capacity`: `integer | null` (optional)
- `code`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

### `TokenResponse`

- `access_token`: `string` (required)
- `refresh_token`: `string` (required)
- `token_type`: `string` (optional)

### `TrafficReport`

- `by_day`: `array<ReportSeriesPoint>` (required)
- `page_views`: `integer` (required)
- `referrers`: `array<ReportDimension>` (required)
- `top_paths`: `array<ReportDimension>` (required)
- `unique_sessions`: `integer` (required)

### `UniversityInfoCreate`

- `acronym`: `string | null` (optional)
- `additional_head_messages`: `array<HeadMessageItem> | null` (optional)
- `alternate_phone`: `string | null` (optional)
- `brochure_id`: `string | null` (optional)
- `chancellor_id`: `string | null` (optional)
- `chancellor_message`: `string | null` (optional)
- `chancellor_message_title`: `string | null` (optional)
- `charter_summary`: `string | null` (optional)
- `city`: `string | null` (optional)
- `core_values`: `string | null` (optional)
- `council_chair_id`: `string | null` (optional)
- `council_chair_message`: `string | null` (optional)
- `council_chair_message_title`: `string | null` (optional)
- `country`: `string | null` (optional)
- `county`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `email`: `string | null` (optional)
- `founding_year`: `integer | null` (optional)
- `history_summary`: `string | null` (optional)
- `institution_type`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `logo_id`: `string | null` (optional)
- `main_campus_id`: `string | null` (optional)
- `mission`: `string | null` (optional)
- `motto`: `string | null` (optional)
- `name`: `string` (required)
- `overview`: `string | null` (optional)
- `philosophy`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `physical_address`: `string | null` (optional)
- `postal_address`: `string | null` (optional)
- `quick_facts`: `object | null` (optional)
- `seal_id`: `string | null` (optional)
- `short_name`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `social_links`: `object | null` (optional)
- `strategic_plan_summary`: `string | null` (optional)
- `strategic_priorities`: `array<object> | object | null` (optional)
- `vc_id`: `string | null` (optional)
- `vc_message`: `string | null` (optional)
- `vc_message_title`: `string | null` (optional)
- `vision`: `string | null` (optional)
- `website`: `string | null` (optional)

### `UniversityInfoSnapshot`

- `acronym`: `string | null` (optional)
- `additional_head_messages`: `array<HeadMessageItem> | null` (optional)
- `alternate_phone`: `string | null` (optional)
- `brochure`: `object | null` (optional)
- `brochure_id`: `string | null` (optional)
- `chancellor`: `object | null` (optional)
- `chancellor_id`: `string | null` (optional)
- `chancellor_message`: `string | null` (optional)
- `chancellor_message_title`: `string | null` (optional)
- `charter_summary`: `string | null` (optional)
- `city`: `string | null` (optional)
- `core_values`: `string | null` (optional)
- `council_chair`: `object | null` (optional)
- `council_chair_id`: `string | null` (optional)
- `council_chair_message`: `string | null` (optional)
- `council_chair_message_title`: `string | null` (optional)
- `country`: `string | null` (optional)
- `county`: `string | null` (optional)
- `cover_image`: `object | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `email`: `string | null` (optional)
- `founding_year`: `integer | null` (optional)
- `history_summary`: `string | null` (optional)
- `id`: `string | null` (optional)
- `institution_type`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `logo`: `object | null` (optional)
- `logo_id`: `string | null` (optional)
- `main_campus`: `object | null` (optional)
- `main_campus_id`: `string | null` (optional)
- `mission`: `string | null` (optional)
- `motto`: `string | null` (optional)
- `name`: `string | null` (optional)
- `overview`: `string | null` (optional)
- `philosophy`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `physical_address`: `string | null` (optional)
- `postal_address`: `string | null` (optional)
- `quick_facts`: `object | null` (optional)
- `seal`: `object | null` (optional)
- `seal_id`: `string | null` (optional)
- `short_name`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `social_links`: `object | null` (optional)
- `strategic_plan_summary`: `string | null` (optional)
- `strategic_priorities`: `array<object> | object | null` (optional)
- `updated_at`: `string | null` (optional)
- `vc`: `object | null` (optional)
- `vc_id`: `string | null` (optional)
- `vc_message`: `string | null` (optional)
- `vc_message_title`: `string | null` (optional)
- `vision`: `string | null` (optional)
- `website`: `string | null` (optional)

### `UniversityInfoUpdate`

- `acronym`: `string | null` (optional)
- `additional_head_messages`: `array<HeadMessageItem> | null` (optional)
- `alternate_phone`: `string | null` (optional)
- `brochure_id`: `string | null` (optional)
- `chancellor_id`: `string | null` (optional)
- `chancellor_message`: `string | null` (optional)
- `chancellor_message_title`: `string | null` (optional)
- `charter_summary`: `string | null` (optional)
- `city`: `string | null` (optional)
- `core_values`: `string | null` (optional)
- `council_chair_id`: `string | null` (optional)
- `council_chair_message`: `string | null` (optional)
- `council_chair_message_title`: `string | null` (optional)
- `country`: `string | null` (optional)
- `county`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `email`: `string | null` (optional)
- `founding_year`: `integer | null` (optional)
- `history_summary`: `string | null` (optional)
- `institution_type`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `logo_id`: `string | null` (optional)
- `main_campus_id`: `string | null` (optional)
- `mission`: `string | null` (optional)
- `motto`: `string | null` (optional)
- `name`: `string | null` (optional)
- `overview`: `string | null` (optional)
- `philosophy`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `physical_address`: `string | null` (optional)
- `postal_address`: `string | null` (optional)
- `quick_facts`: `object | null` (optional)
- `seal_id`: `string | null` (optional)
- `short_name`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `social_links`: `object | null` (optional)
- `strategic_plan_summary`: `string | null` (optional)
- `strategic_priorities`: `array<object> | object | null` (optional)
- `vc_id`: `string | null` (optional)
- `vc_message`: `string | null` (optional)
- `vc_message_title`: `string | null` (optional)
- `vision`: `string | null` (optional)
- `website`: `string | null` (optional)

### `UploadBatchFileRead`

- `attempts`: `integer` (required)
- `bytes_received`: `integer` (required)
- `checksum_sha256`: `string | null` (optional)
- `client_reference`: `string` (required)
- `display_order`: `integer` (required)
- `error`: `string | null` (optional)
- `file_size`: `integer` (required)
- `id`: `string` (required)
- `media_id`: `string | null` (optional)
- `mime_type`: `string` (required)
- `original_filename`: `string` (required)
- `status`: `string` (required)
- `target_entity_id`: `string | null` (optional)
- `target_entity_type`: `string | null` (optional)
- `target_role`: `string` (required)

### `UploadBatchRead`

- `completed_at`: `string | null` (optional)
- `completed_files`: `integer` (required)
- `expires_at`: `string` (required)
- `failed_files`: `integer` (required)
- `files`: `array<UploadBatchFileRead>` (optional)
- `id`: `string` (required)
- `received_bytes`: `integer` (required)
- `school_id`: `string` (required)
- `status`: `string` (required)
- `total_bytes`: `integer` (required)
- `total_files`: `integer` (required)

### `UserCreate`

- `avatar_url`: `string | null` (optional)
- `email`: `string` (required)
- `full_name`: `string` (required)
- `is_active`: `boolean` (optional)
- `is_verified`: `boolean` (optional)
- `must_change_password`: `boolean` (optional)
- `password`: `string` (required)
- `phone`: `string | null` (optional)
- `push_tokens`: `array<string> | null` (optional)
- `service_memberships`: `array<string>` (optional)

### `UserLogin`

- `email`: `string` (required)
- `mfa_code`: `string | null` (optional)
- `password`: `string` (required)
- `token_transport`: `string` (optional)

### `UserPreferenceInput`

- `key`: `string` (required)
- `namespace`: `string` (required)
- `value`: `object` (required)

### `UserPreferenceRead`

- `created_at`: `string` (required)
- `id`: `string` (required)
- `key`: `string` (required)
- `namespace`: `string` (required)
- `updated_at`: `string` (required)
- `user_id`: `string` (required)
- `value`: `object` (required)

### `UserPreferencesRead`

- `preferences`: `array<UserPreferenceRead>` (required)

### `UserPreferencesUpdate`

- `preferences`: `array<UserPreferenceInput>` (required)

### `UserRoleAssignmentPayload`

- `expires_at`: `string | null` (optional)
- `note`: `string | null` (optional)
- `role_id`: `string` (required)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)

### `UserRoleSnapshot`

- `assigned_at`: `string | null` (optional)
- `assigned_by`: `object | null` (optional)
- `assigned_by_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `expires_at`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `note`: `string | null` (optional)
- `role`: `object | null` (optional)
- `role_id`: `string | null` (optional)
- `role_name`: `string | null` (optional)
- `scope`: `object | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `user`: `object | null` (optional)
- `user_id`: `string | null` (optional)

### `UserRolesUpdatePayload`

- `roles`: `array<UserRoleAssignmentPayload>` (optional)

### `UserSnapshot`

- `avatar_url`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `email`: `string | null` (optional)
- `email_verified_at`: `string | null` (optional)
- `failed_login_attempts`: `integer | null` (optional)
- `full_name`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_verified`: `boolean | null` (optional)
- `last_login_at`: `string | null` (optional)
- `locked_until`: `string | null` (optional)
- `must_change_password`: `boolean | null` (optional)
- `notifications`: `array<object> | null` (optional)
- `person`: `object | null` (optional)
- `person_id`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `push_tokens`: `array<string> | null` (optional)
- `role_assignments`: `array<object> | null` (optional)
- `roles`: `array<string> | null` (optional)
- `service_memberships`: `array<string> | null` (optional)
- `sessions`: `array<object> | null` (optional)
- `updated_at`: `string | null` (optional)

### `UserUpdate`

- `avatar_url`: `string | null` (optional)
- `email`: `string | null` (optional)
- `full_name`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_verified`: `boolean | null` (optional)
- `must_change_password`: `boolean | null` (optional)
- `password`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `push_tokens`: `array<string> | null` (optional)
- `service_memberships`: `array<string> | null` (optional)

### `ValidationError`

- `ctx`: `object` (optional)
- `input`: `object` (optional)
- `loc`: `array<string | integer>` (required)
- `msg`: `string` (required)
- `type`: `string` (required)

### `VcGalleryAlbumCreate`

- `cover_media_id`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `event_date`: `string | null` (optional)
- `is_featured`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `location`: `string | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `slug`: `string` (required)
- `summary`: `string | null` (optional)
- `title`: `string` (required)

### `VcGalleryAlbumSnapshot`

- `approved_at`: `string | null` (optional)
- `approved_by_id`: `string | null` (optional)
- `archived_at`: `string | null` (optional)
- `cover_media_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `event_date`: `string | null` (optional)
- `expires_at`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_published`: `boolean | null` (optional)
- `keywords`: `object | null` (optional)
- `location`: `string | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `owner_portal`: `string | null` (optional)
- `owner_scope_id`: `string | null` (optional)
- `owner_scope_type`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `published_by_id`: `string | null` (optional)
- `rejection_reason`: `string | null` (optional)
- `reviewed_at`: `string | null` (optional)
- `reviewed_by_id`: `string | null` (optional)
- `revision_notes`: `string | null` (optional)
- `scheduled_publish_at`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `submitted_at`: `string | null` (optional)
- `submitted_by_id`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `unpublished_at`: `string | null` (optional)
- `unpublished_by_id`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `updated_by`: `object | null` (optional)
- `updated_by_id`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `VcGalleryAlbumUpdate`

- `cover_media_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `event_date`: `string | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `keywords`: `object | null` (optional)
- `location`: `string | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)

### `VcGalleryMediaCreate`

- `alt_text`: `string | null` (optional)
- `caption`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `media_id`: `string` (required)

### `VcGalleryMediaResponse`

- `display_order`: `integer` (required)
- `id`: `string` (required)
- `media`: `object | null` (optional)
- `media_id`: `string` (required)

### `VcGalleryPage`

- `items`: `array<VcGalleryAlbumSnapshot>` (required)
- `meta`: `object` (required)

### `VcHubPlacementCreate`

- `display_order`: `integer` (optional)
- `editorial_label`: `string | null` (optional)
- `event_id`: `string | null` (optional)
- `gallery_album_id`: `string | null` (optional)
- `is_enabled`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `news_id`: `string | null` (optional)
- `poster_media_id`: `string | null` (optional)
- `section`: `string` (required)
- `speech_id`: `string | null` (optional)
- `summary_override`: `string | null` (optional)
- `title_override`: `string | null` (optional)
- `video_id`: `string | null` (optional)
- `visible_from`: `string | null` (optional)
- `visible_to`: `string | null` (optional)

### `VcHubPlacementSnapshot`

- `created_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `editorial_label`: `string | null` (optional)
- `event_id`: `string | null` (optional)
- `gallery_album_id`: `string | null` (optional)
- `hub_id`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `news_id`: `string | null` (optional)
- `poster_media_id`: `string | null` (optional)
- `section`: `string | null` (optional)
- `speech_id`: `string | null` (optional)
- `summary_override`: `string | null` (optional)
- `title_override`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `video_id`: `string | null` (optional)
- `visible_from`: `string | null` (optional)
- `visible_to`: `string | null` (optional)

### `VcHubPlacementUpdate`

- `display_order`: `integer | null` (optional)
- `editorial_label`: `string | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `poster_media_id`: `string | null` (optional)
- `summary_override`: `string | null` (optional)
- `title_override`: `string | null` (optional)
- `visible_from`: `string | null` (optional)
- `visible_to`: `string | null` (optional)

### `VcHubSnapshot`

- `approved_at`: `string | null` (optional)
- `approved_by_id`: `string | null` (optional)
- `archived_at`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `expires_at`: `string | null` (optional)
- `eyebrow`: `string | null` (optional)
- `hero_media_id`: `string | null` (optional)
- `id`: `string | null` (optional)
- `introduction`: `string | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_published`: `boolean | null` (optional)
- `owner_portal`: `string | null` (optional)
- `owner_scope_id`: `string | null` (optional)
- `owner_scope_type`: `string | null` (optional)
- `professional_profile_url`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `published_by_id`: `string | null` (optional)
- `rejection_reason`: `string | null` (optional)
- `reviewed_at`: `string | null` (optional)
- `reviewed_by_id`: `string | null` (optional)
- `revision_notes`: `string | null` (optional)
- `scheduled_publish_at`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `section_order`: `array<string> | null` (optional)
- `section_visibility`: `object | null` (optional)
- `staff_assignment_id`: `string | null` (optional)
- `status`: `string | null` (optional)
- `submitted_at`: `string | null` (optional)
- `submitted_by_id`: `string | null` (optional)
- `title`: `string | null` (optional)
- `unpublished_at`: `string | null` (optional)
- `unpublished_by_id`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `updated_by`: `object | null` (optional)
- `updated_by_id`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)
- `welcome_message`: `string | null` (optional)
- `welcome_title`: `string | null` (optional)
- `welcome_video_id`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `VcHubUpdate`

- `eyebrow`: `string | null` (optional)
- `hero_media_id`: `string | null` (optional)
- `introduction`: `string | null` (optional)
- `professional_profile_url`: `string | null` (optional)
- `section_order`: `array<string> | null` (optional)
- `section_visibility`: `object | null` (optional)
- `staff_assignment_id`: `string | null` (optional)
- `title`: `string | null` (optional)
- `welcome_message`: `string | null` (optional)
- `welcome_title`: `string | null` (optional)
- `welcome_video_id`: `string | null` (optional)

### `VcPortraitCreate`

- `alt_text`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `media_id`: `string` (required)

### `VcPortraitSnapshot`

- `alt_text`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `hub_id`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `media`: `object | null` (optional)
- `media_id`: `string | null` (optional)

### `VcPortraitUpdate`

- `alt_text`: `string | null` (optional)
- `display_order`: `integer | null` (optional)

### `VcPublicGalleryResponse`

- `cover`: `object | null` (optional)
- `event_date`: `string | null` (optional)
- `id`: `string` (required)
- `location`: `string | null` (optional)
- `media`: `array<object>` (optional)
- `slug`: `string` (required)
- `summary`: `string | null` (optional)
- `title`: `string` (required)

### `VcPublicHubResponse`

- `eyebrow`: `string | null` (optional)
- `hero_media`: `object | null` (optional)
- `id`: `string` (required)
- `introduction`: `string | null` (optional)
- `professional_profile_url`: `string | null` (optional)
- `section_order`: `array<string>` (required)
- `section_visibility`: `object` (required)
- `sections`: `object` (required)
- `title`: `string` (required)
- `welcome_message`: `string | null` (optional)
- `welcome_title`: `string | null` (optional)
- `welcome_video`: `object | null` (optional)

### `VcPublicSpeechResponse`

- `audience`: `string | null` (optional)
- `cover`: `object | null` (optional)
- `delivered_at`: `string | null` (optional)
- `id`: `string` (required)
- `occasion`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `rich_text`: `string | null` (optional)
- `slug`: `string` (required)
- `speech_type`: `string` (required)
- `summary`: `string | null` (optional)
- `title`: `string` (required)
- `venue`: `string | null` (optional)
- `videos`: `array<object>` (optional)

### `VcReorderItem`

- `display_order`: `integer` (required)
- `id`: `string` (required)

### `VcReorderRequest`

- `items`: `array<VcReorderItem>` (required)

### `VcSpeechCreate`

- `audience`: `string | null` (optional)
- `delivered_at`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `document_media_id`: `string | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `is_featured`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `occasion`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `rich_text`: `string | null` (optional)
- `slug`: `string` (required)
- `speech_type`: `string` (optional)
- `structured_content`: `object | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)
- `venue`: `string | null` (optional)

### `VcSpeechPage`

- `items`: `array<VcSpeechSnapshot>` (required)
- `meta`: `object` (required)

### `VcSpeechSnapshot`

- `approved_at`: `string | null` (optional)
- `approved_by_id`: `string | null` (optional)
- `archived_at`: `string | null` (optional)
- `audience`: `string | null` (optional)
- `author`: `object | null` (optional)
- `author_user_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `delivered_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `document_media_id`: `string | null` (optional)
- `expires_at`: `string | null` (optional)
- `featured_media`: `object | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_published`: `boolean | null` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `occasion`: `string | null` (optional)
- `owner_portal`: `string | null` (optional)
- `owner_scope_id`: `string | null` (optional)
- `owner_scope_type`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `published_by_id`: `string | null` (optional)
- `rejection_reason`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `reviewed_at`: `string | null` (optional)
- `reviewed_by_id`: `string | null` (optional)
- `revision_notes`: `string | null` (optional)
- `rich_text`: `string | null` (optional)
- `scheduled_publish_at`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `speech_type`: `string | null` (optional)
- `status`: `string | null` (optional)
- `structured_content`: `object | null` (optional)
- `submitted_at`: `string | null` (optional)
- `submitted_by_id`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `unpublished_at`: `string | null` (optional)
- `unpublished_by_id`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `updated_by`: `object | null` (optional)
- `updated_by_id`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)
- `venue`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `VcSpeechUpdate`

- `audience`: `string | null` (optional)
- `delivered_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `document_media_id`: `string | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `occasion`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `rich_text`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `speech_type`: `string | null` (optional)
- `structured_content`: `object | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `venue`: `string | null` (optional)

### `VcSpeechVideoCreate`

- `display_order`: `integer` (optional)
- `role`: `string` (optional)
- `video_id`: `string` (required)

### `VcSpeechVideoResponse`

- `display_order`: `integer` (required)
- `id`: `string` (required)
- `role`: `string` (required)
- `speech_id`: `string` (required)
- `video`: `VcVideoSnapshot | null` (optional)
- `video_id`: `string` (required)

### `VcVideoCreate`

- `category`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `duration_seconds`: `integer | null` (optional)
- `is_featured`: `boolean` (optional)
- `poster_media_id`: `string | null` (optional)
- `provider`: `string` (required)
- `recorded_at`: `string | null` (optional)
- `slug`: `string` (required)
- `source_url`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)
- `transcript`: `string | null` (optional)
- `uploaded_media_id`: `string | null` (optional)

### `VcVideoPage`

- `items`: `array<VcVideoSnapshot>` (required)
- `meta`: `object` (required)

### `VcVideoSnapshot`

- `approved_at`: `string | null` (optional)
- `approved_by_id`: `string | null` (optional)
- `archived_at`: `string | null` (optional)
- `category`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `duration_seconds`: `integer | null` (optional)
- `embed_url`: `string | null` (optional)
- `expires_at`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_published`: `boolean | null` (optional)
- `owner_portal`: `string | null` (optional)
- `owner_scope_id`: `string | null` (optional)
- `owner_scope_type`: `string | null` (optional)
- `poster_media_id`: `string | null` (optional)
- `provider`: `string | null` (optional)
- `provider_video_id`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `published_by_id`: `string | null` (optional)
- `recorded_at`: `string | null` (optional)
- `rejection_reason`: `string | null` (optional)
- `reviewed_at`: `string | null` (optional)
- `reviewed_by_id`: `string | null` (optional)
- `revision_notes`: `string | null` (optional)
- `scheduled_publish_at`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `source_url`: `string | null` (optional)
- `status`: `string | null` (optional)
- `submitted_at`: `string | null` (optional)
- `submitted_by_id`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `thumbnail_url`: `string | null` (optional)
- `title`: `string | null` (optional)
- `transcript`: `string | null` (optional)
- `unpublished_at`: `string | null` (optional)
- `unpublished_by_id`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `updated_by`: `object | null` (optional)
- `updated_by_id`: `string | null` (optional)
- `uploaded_media_id`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `VcVideoUpdate`

- `category`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `duration_seconds`: `integer | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `poster_media_id`: `string | null` (optional)
- `recorded_at`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `source_url`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `transcript`: `string | null` (optional)
- `uploaded_media_id`: `string | null` (optional)

### `VcWorkflowAction`

- `action`: `string | null` (optional)
- `note`: `string | null` (optional)
- `reason`: `string | null` (optional)

### `VcWorkflowTransitionResponse`

- `archived_at`: `string | null` (optional)
- `id`: `string` (required)
- `is_published`: `boolean | null` (optional)
- `published_at`: `string | null` (optional)
- `status`: `string | null` (optional)
- `unpublished_at`: `string | null` (optional)
- `workflow_status`: `string | null` (optional)

### `VcYouTubePreviewResponse`

- `author_name`: `string | null` (optional)
- `canonical_url`: `string` (required)
- `embed_url`: `string` (required)
- `thumbnail_url`: `string` (required)
- `title`: `string` (required)
- `video_id`: `string` (required)

### `VerifyEmailRequest`

- `token`: `string` (required)

### `WebhookCreate`

- `events`: `array<string>` (required)
- `is_active`: `boolean` (optional)
- `name`: `string` (required)
- `secret`: `string | null` (optional)
- `url`: `string` (required)

### `WebhookCreateEnvelope`

- `record`: `WebhookSnapshot` (required)
- `signing_secret`: `string` (required)

### `WebhookDeliveryRead`

- `attempt_number`: `integer` (required)
- `attempted_at`: `string` (required)
- `created_at`: `string` (required)
- `duration_ms`: `number | null` (optional)
- `error`: `string | null` (optional)
- `event_id`: `string` (required)
- `id`: `string` (required)
- `next_attempt_at`: `string | null` (optional)
- `status`: `string` (required)
- `status_code`: `integer | null` (optional)
- `updated_at`: `string` (required)
- `webhook_id`: `string` (required)

### `WebhookSnapshot`

- `created_at`: `string | null` (optional)
- `created_by`: `object | null` (optional)
- `created_by_id`: `string | null` (optional)
- `events`: `array<string> | null` (optional)
- `failure_count`: `integer | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `last_status`: `integer | null` (optional)
- `last_triggered_at`: `string | null` (optional)
- `name`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `url`: `string | null` (optional)

### `WebhookUpdate`

- `events`: `array<string> | null` (optional)
- `is_active`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `secret`: `string | null` (optional)
- `url`: `string | null` (optional)

### `WingCreate`

- `code`: `string` (required)
- `cover_image_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `division_id`: `string` (required)
- `email`: `string | null` (optional)
- `head_id`: `string | null` (optional)
- `head_message`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `mandate`: `string | null` (optional)
- `name`: `string` (required)
- `office_location`: `string | null` (optional)
- `operating_hours`: `object | null` (optional)
- `phone`: `string | null` (optional)
- `service_charter`: `string | null` (optional)
- `slug`: `string` (required)
- `wing_type`: `string` (optional)

### `WingSnapshot`

- `code`: `string | null` (optional)
- `cover_image`: `object | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `departments`: `array<object> | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `division`: `object | null` (optional)
- `division_id`: `string | null` (optional)
- `email`: `string | null` (optional)
- `head`: `object | null` (optional)
- `head_id`: `string | null` (optional)
- `head_message`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `mandate`: `string | null` (optional)
- `name`: `string | null` (optional)
- `office_location`: `string | null` (optional)
- `operating_hours`: `object | null` (optional)
- `phone`: `string | null` (optional)
- `schools`: `array<object> | null` (optional)
- `service_charter`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `wing_type`: `string | null` (optional)

### `WingUpdate`

- `code`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `division_id`: `string | null` (optional)
- `email`: `string | null` (optional)
- `head_id`: `string | null` (optional)
- `head_message`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `mandate`: `string | null` (optional)
- `name`: `string | null` (optional)
- `office_location`: `string | null` (optional)
- `operating_hours`: `object | null` (optional)
- `phone`: `string | null` (optional)
- `service_charter`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `wing_type`: `string | null` (optional)

### `Workspace`

- No direct properties documented.

### `WorkspaceContext`

- `actor_id`: `string` (required)
- `capabilities`: `array<string>` (required)
- `platform_authority`: `boolean` (optional)
- `reporting_capabilities`: `array<string>` (optional)
- `scopes`: `array<ScopeChoice>` (required)
- `selected_scope`: `ScopeChoice | null` (optional)
- `selection_required`: `boolean` (optional)
- `sub_workspaces`: `array<string>` (optional)
- `workspace`: `Workspace` (required)

### `WorkspaceVisit`

- `previous_visit_id`: `string | null` (optional)
- `scope`: `ScopeChoice | null` (optional)
- `visit_id`: `string` (optional)

### `YouTubePreviewRequest`

- `url`: `string` (required)

### `app__schemas__corporate_dashboard__DashboardAttentionItem`

- `age_hours`: `number | null` (optional)
- `content_type`: `string` (required)
- `content_type_label`: `string` (required)
- `href`: `string` (required)
- `id`: `string` (required)
- `issue_codes`: `array<string>` (required)
- `severity`: `string` (required)
- `source_label`: `string` (required)
- `status`: `string` (required)
- `title`: `string` (required)

### `app__schemas__school_portal_dashboard__DashboardAttentionItem`

- `count`: `integer` (required)
- `href`: `string` (required)
- `key`: `string` (required)
- `label`: `string` (required)
- `severity`: `string` (required)
