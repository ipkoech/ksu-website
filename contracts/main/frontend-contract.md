# KSU Main Site API

Shared university CMS, institutional structure, admissions, content, media, support, and platform API for Kisii University.

- Version: `0.1.0`
- OpenAPI: `3.1.0`

## Frontend Contract

This file is generated from the live FastAPI OpenAPI schema. Treat it as the frontend contract for request shapes, auth expectations, and response envelopes.

## About

### `GET /api/v1/about-content`

Get About Content Admin

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/about-content`

Create About Content

- Auth: HTTPBearer
- Request body: AboutPageContentCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/about-content/history-milestones`

List History Milestones

- Auth: HTTPBearer
- Request body: -
- Parameters: `about_page_content_id` (query, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/about-content/history-milestones`

Create History Milestone

- Auth: HTTPBearer
- Request body: HistoryMilestoneCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/about-content/history-milestones/{item_id}`

Update History Milestone

- Auth: HTTPBearer
- Request body: HistoryMilestoneUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/about-content/history-milestones/{item_id}`

Delete History Milestone

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/about-content/history-order`

Reorder History

- Auth: HTTPBearer
- Request body: ReorderRequest
- Parameters: `about_page_content_id` (query, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/about-content/workflow/{kind}/{item_id}`

Transition About Content

- Auth: HTTPBearer
- Request body: AboutWorkflowAction
- Parameters: `kind` (path, string), `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/about-content/{item_id}`

Update About Content

- Auth: HTTPBearer
- Request body: AboutPageContentUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/about-content/{item_id}`

Delete About Content

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/fact-editions`

List Fact Editions

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/fact-editions`

Create Fact Edition

- Auth: HTTPBearer
- Request body: FactEditionCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `POST /api/v1/fact-editions/{edition_id}/groups`

Create Fact Group

- Auth: HTTPBearer
- Request body: FactGroupCreate
- Parameters: `edition_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/fact-editions/{edition_id}/groups`

List Fact Groups

- Auth: HTTPBearer
- Request body: -
- Parameters: `edition_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/fact-editions/{item_id}`

Update Fact Edition

- Auth: HTTPBearer
- Request body: FactEditionUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/fact-editions/{item_id}`

Delete Fact Edition

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/fact-editions/{item_id}/clone`

Clone Fact Edition

- Auth: HTTPBearer
- Request body: FactEditionClone
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/fact-groups/evergreen`

List Evergreen Fact Groups

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/fact-groups/evergreen`

Create Evergreen Fact Group

- Auth: HTTPBearer
- Request body: FactGroupCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `POST /api/v1/fact-groups/{group_id}/items`

Create Fact Item

- Auth: HTTPBearer
- Request body: FactItemCreate
- Parameters: `group_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/fact-groups/{group_id}/items`

List Fact Items

- Auth: HTTPBearer
- Request body: -
- Parameters: `group_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/fact-groups/{item_id}`

Update Fact Group

- Auth: HTTPBearer
- Request body: FactGroupUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/fact-groups/{item_id}`

Delete Fact Group

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `PATCH /api/v1/fact-items/{item_id}`

Update Fact Item

- Auth: HTTPBearer
- Request body: FactItemUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/fact-items/{item_id}`

Delete Fact Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `PATCH /api/v1/institutional-items/{item_id}`

Update Institutional Item

- Auth: HTTPBearer
- Request body: InstitutionalPageItemUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/institutional-items/{item_id}`

Delete Institutional Item

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/institutional-pages`

List Institutional Pages

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/institutional-pages`

Create Institutional Page

- Auth: HTTPBearer
- Request body: InstitutionalPageCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/institutional-pages/{item_id}`

Update Institutional Page

- Auth: HTTPBearer
- Request body: InstitutionalPageUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/institutional-pages/{page_id}/sections`

List Institutional Sections

- Auth: HTTPBearer
- Request body: -
- Parameters: `page_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/institutional-pages/{page_id}/sections`

Create Institutional Section

- Auth: HTTPBearer
- Request body: InstitutionalPageSectionCreate
- Parameters: `page_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 201 -

### `POST /api/v1/institutional-pages/{page_id}/sections/reorder`

Reorder Institutional Sections

- Auth: HTTPBearer
- Request body: ReorderRequest
- Parameters: `page_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/institutional-section-documents/{item_id}`

Update Institutional Document

- Auth: HTTPBearer
- Request body: InstitutionalSectionDocumentUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/institutional-section-documents/{item_id}`

Delete Institutional Document

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `PATCH /api/v1/institutional-sections/{item_id}`

Update Institutional Section

- Auth: HTTPBearer
- Request body: InstitutionalPageSectionUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/institutional-sections/{item_id}`

Delete Institutional Section

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/institutional-sections/{section_id}/documents`

List Institutional Documents

- Auth: HTTPBearer
- Request body: -
- Parameters: `section_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/institutional-sections/{section_id}/documents`

Attach Institutional Document

- Auth: HTTPBearer
- Request body: InstitutionalSectionDocumentCreate
- Parameters: `section_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/institutional-sections/{section_id}/items`

List Institutional Items

- Auth: HTTPBearer
- Request body: -
- Parameters: `section_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/institutional-sections/{section_id}/items`

Create Institutional Item

- Auth: HTTPBearer
- Request body: InstitutionalPageItemCreate
- Parameters: `section_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 201 -

### `POST /api/v1/institutional-sections/{section_id}/items/reorder`

Reorder Institutional Items

- Auth: HTTPBearer
- Request body: ReorderRequest
- Parameters: `section_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/public/about`

Get Public About

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 -

### `GET /api/v1/public/about/facts`

Get Public Facts

- Auth: public
- Request body: -
- Parameters: `year` (query, integer | null)
- Success response: 200 -

### `GET /api/v1/public/about/history`

Get Public History

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 -

### `GET /api/v1/public/institutional-pages/{slug}`

Get Public Institutional Page

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

## Academic

### `GET /api/v1/academic-calendars`

List Academic Calendars

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `academic_year` (query, string | null), `status` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/academic-calendars`

Create Academic Calendar

- Auth: HTTPBearer
- Request body: AcademicCalendarCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/academic-calendars/admin`

List Admin Academic Calendars

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `academic_year` (query, string | null), `status` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/academic-calendars/id/{calendar_id}`

Get Academic Calendar

- Auth: HTTPBearer
- Request body: -
- Parameters: `calendar_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/academic-calendars/{calendar_id}`

Update Academic Calendar

- Auth: HTTPBearer
- Request body: AcademicCalendarUpdate
- Parameters: `calendar_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/academic-calendars/{calendar_id}`

Delete Academic Calendar

- Auth: HTTPBearer
- Request body: -
- Parameters: `calendar_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/campuses`

List Campuses

- Auth: public
- Request body: -
- Parameters: `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/campuses`

Create Campus

- Auth: HTTPBearer
- Request body: CampusCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/campuses/{campus_id}`

Update Campus

- Auth: HTTPBearer
- Request body: CampusUpdate
- Parameters: `campus_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/campuses/{slug}`

Get Campus

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/department-services`

Create Department Service

- Auth: HTTPBearer
- Request body: DepartmentServiceCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/department-services/admin`

List Admin Department Services

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `department_id` (query, string | null), `search` (query, string | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/department-services/{service_id}`

Get Department Service

- Auth: HTTPBearer
- Request body: -
- Parameters: `service_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/department-services/{service_id}`

Update Department Service

- Auth: HTTPBearer
- Request body: DepartmentServiceUpdate
- Parameters: `service_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/department-services/{service_id}`

Delete Department Service

- Auth: HTTPBearer
- Request body: -
- Parameters: `service_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/departments`

List Departments

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `school_id` (query, string | null), `wing_id` (query, string | null), `department_type` (query, string | null), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/departments`

Create Department

- Auth: HTTPBearer
- Request body: DepartmentCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/departments/admin`

List Admin Departments

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `school_id` (query, string | null), `wing_id` (query, string | null), `department_type` (query, string | null), `search` (query, string | null), `is_active` (query, boolean | null), `is_public` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/departments/id/{department_id}`

Get Department By Id

- Auth: HTTPBearer
- Request body: -
- Parameters: `department_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/departments/{department_id}`

Update Department

- Auth: HTTPBearer
- Request body: DepartmentUpdate
- Parameters: `department_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/departments/{department_id}`

Delete Department

- Auth: HTTPBearer
- Request body: -
- Parameters: `department_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/departments/{slug}`

Get Department

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/departments/{slug}/programmes`

Get Department Programmes

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `page` (query, integer), `per_page` (query, integer), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/departments/{slug}/services`

Get Department Services

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/departments/{slug}/staff`

Get Department Staff

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/schools`

List Schools

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `campus_id` (query, string | null), `administrative_wing_id` (query, string | null), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/schools`

Create School

- Auth: HTTPBearer
- Request body: SchoolCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/schools/admin`

List Admin Schools

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `campus_id` (query, string | null), `administrative_wing_id` (query, string | null), `search` (query, string | null), `is_active` (query, boolean | null), `is_public` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/schools/id/{school_id}`

Get School By Id

- Auth: HTTPBearer
- Request body: -
- Parameters: `school_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/schools/{school_id}`

Update School

- Auth: HTTPBearer
- Request body: SchoolUpdate
- Parameters: `school_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/schools/{school_id}`

Delete School

- Auth: HTTPBearer
- Request body: -
- Parameters: `school_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/schools/{slug}`

Get School

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/schools/{slug}/departments`

Get School Departments

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/schools/{slug}/programmes`

Get School Programmes

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `page` (query, integer), `per_page` (query, integer), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/schools/{slug}/staff`

Get School Staff

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Admin

### `GET /api/v1/admin/audit`

List Audit Logs

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `service_name` (query, string | null), `user_id` (query, string | null), `resource_type` (query, string | null), `status` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/admin/audit/{audit_id}`

Get Audit Log

- Auth: HTTPBearer
- Request body: -
- Parameters: `audit_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/admin/inquiries`

List Inquiries

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `status` (query, string | null), `category` (query, string | null), `priority` (query, string | null), `assigned_to_user_id` (query, string | null), `target_entity_type` (query, string | null), `owner_scope_type` (query, string | null), `owner_scope_id` (query, string | null), `include_school_owned` (query, boolean), `search` (query, string | null), `created_from` (query, string | null), `created_to` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/admin/inquiries/{inquiry_id}`

Get Inquiry

- Auth: HTTPBearer
- Request body: -
- Parameters: `inquiry_id` (path, string), `include_school_owned` (query, boolean), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/admin/inquiries/{inquiry_id}/assign`

Assign Inquiry

- Auth: HTTPBearer
- Request body: InquiryAssign
- Parameters: `inquiry_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/admin/inquiries/{inquiry_id}/messages/{message_id}/retry`

Retry Inquiry Reply

- Auth: HTTPBearer
- Request body: -
- Parameters: `inquiry_id` (path, string), `message_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/admin/inquiries/{inquiry_id}/notes`

Add Inquiry Note

- Auth: HTTPBearer
- Request body: InquiryNoteCreate
- Parameters: `inquiry_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/admin/inquiries/{inquiry_id}/replies`

Reply To Inquiry

- Auth: HTTPBearer
- Request body: InquiryReplyCreate
- Parameters: `inquiry_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/admin/inquiries/{inquiry_id}/status`

Update Inquiry Status

- Auth: HTTPBearer
- Request body: InquiryStatusUpdate
- Parameters: `inquiry_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/admin/notifications/broadcast`

Broadcast Notification

- Auth: HTTPBearer
- Request body: NotificationBroadcastCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 202 -

### `POST /api/v1/admin/notifications/broadcast/preview`

Preview Broadcast

- Auth: HTTPBearer
- Request body: NotificationBroadcastCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/admin/notifications/deliveries`

List Deliveries

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `status` (query, string | null), `channel` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/admin/notifications/send`

Send Notification

- Auth: HTTPBearer
- Request body: NotificationCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/admin/notifications/templates`

List Templates

- Auth: HTTPBearer
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/admin/notifications/templates`

Create Template

- Auth: HTTPBearer
- Request body: NotificationTemplateCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/admin/notifications/templates/{template_id}`

Get Template

- Auth: HTTPBearer
- Request body: -
- Parameters: `template_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/admin/notifications/templates/{template_id}`

Update Template

- Auth: HTTPBearer
- Request body: NotificationTemplateUpdate
- Parameters: `template_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/admin/notifications/templates/{template_id}`

Delete Template

- Auth: HTTPBearer
- Request body: -
- Parameters: `template_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admin/permissions`

List Permissions

- Auth: HTTPBearer
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/admin/permissions`

Create Permission

- Auth: HTTPBearer
- Request body: -
- Parameters: `name` (query, string), `description` (query, string | null), `resource` (query, string | null), `action` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/admin/reports/admin-activity`

Admin Activity

- Auth: HTTPBearer
- Request body: -
- Parameters: `days` (query, integer), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/admin/reports/content`

Content

- Auth: HTTPBearer
- Request body: -
- Parameters: `days` (query, integer), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/admin/reports/exports/{report_name}`

Export Report

- Auth: HTTPBearer
- Request body: -
- Parameters: `report_name` (path, string), `days` (query, integer), `format` (query, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/admin/reports/overview`

Overview

- Auth: HTTPBearer
- Request body: -
- Parameters: `days` (query, integer), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/admin/reports/traffic`

Traffic

- Auth: HTTPBearer
- Request body: -
- Parameters: `days` (query, integer), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/admin/roles`

List Roles

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `system` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/admin/roles`

Create Role

- Auth: HTTPBearer
- Request body: RoleCreatePayload
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/admin/roles/{role_id}`

Get Role

- Auth: HTTPBearer
- Request body: -
- Parameters: `role_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PUT /api/v1/admin/roles/{role_id}`

Update Role

- Auth: HTTPBearer
- Request body: RoleUpdate
- Parameters: `role_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/admin/roles/{role_id}`

Update Role

- Auth: HTTPBearer
- Request body: RoleUpdate
- Parameters: `role_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/admin/roles/{role_id}`

Delete Role

- Auth: HTTPBearer
- Request body: -
- Parameters: `role_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admin/roles/{role_id}/permissions`

Get Role Permissions

- Auth: HTTPBearer
- Request body: -
- Parameters: `role_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PUT /api/v1/admin/roles/{role_id}/permissions`

Update Role Permissions

- Auth: HTTPBearer
- Request body: RolePermissionsUpdatePayload
- Parameters: `role_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/admin/system/api-keys`

List Api Keys

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/admin/system/api-keys`

Create Api Key

- Auth: HTTPBearer
- Request body: ApiKeyCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/admin/system/api-keys/{item_id}`

Get Api Key

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PUT /api/v1/admin/system/api-keys/{item_id}`

Update Api Key

- Auth: HTTPBearer
- Request body: ApiKeyUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/admin/system/api-keys/{item_id}`

Update Api Key

- Auth: HTTPBearer
- Request body: ApiKeyUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/admin/system/api-keys/{item_id}`

Revoke Api Key

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admin/system/settings`

List Settings

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `category` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/admin/system/settings`

Create Setting

- Auth: HTTPBearer
- Request body: SettingCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PUT /api/v1/admin/system/settings`

Bulk Update Settings

- Auth: HTTPBearer
- Request body: BulkSettingsUpdatePayload
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/admin/system/settings/{item_id}`

Get Setting

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PUT /api/v1/admin/system/settings/{item_id}`

Update Setting

- Auth: HTTPBearer
- Request body: SettingUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/admin/system/settings/{item_id}`

Update Setting

- Auth: HTTPBearer
- Request body: SettingUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/admin/system/settings/{item_id}`

Delete Setting

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admin/system/webhooks`

List Webhooks

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/admin/system/webhooks`

Create Webhook

- Auth: HTTPBearer
- Request body: WebhookCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/admin/system/webhooks/{item_id}`

Get Webhook

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PUT /api/v1/admin/system/webhooks/{item_id}`

Update Webhook

- Auth: HTTPBearer
- Request body: WebhookUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/admin/system/webhooks/{item_id}`

Update Webhook

- Auth: HTTPBearer
- Request body: WebhookUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/admin/system/webhooks/{item_id}`

Delete Webhook

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admin/users`

List Admin Users

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `role` (query, string | null), `sort` (query, string), `order` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/admin/users`

Create Admin User

- Auth: HTTPBearer
- Request body: UserCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/admin/users/{user_id}`

Get Admin User

- Auth: HTTPBearer
- Request body: -
- Parameters: `user_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PUT /api/v1/admin/users/{user_id}`

Update Admin User

- Auth: HTTPBearer
- Request body: UserUpdate
- Parameters: `user_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/admin/users/{user_id}`

Update Admin User

- Auth: HTTPBearer
- Request body: UserUpdate
- Parameters: `user_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/admin/users/{user_id}`

Delete Admin User

- Auth: HTTPBearer
- Request body: -
- Parameters: `user_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admin/users/{user_id}/roles`

List Admin User Roles

- Auth: HTTPBearer
- Request body: -
- Parameters: `user_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PUT /api/v1/admin/users/{user_id}/roles`

Update Admin User Roles

- Auth: HTTPBearer
- Request body: UserRolesUpdatePayload
- Parameters: `user_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/admin/users/{user_id}/roles/{role_id}`

Assign User Role

- Auth: HTTPBearer
- Request body: -
- Parameters: `user_id` (path, string), `role_id` (path, string), `scope_type` (query, string | null), `scope_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

## Admissions

### `GET /api/v1/admissions`

List Admission Info

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `content_type` (query, string | null), `audience_level` (query, string | null), `school_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/admissions`

Create Admission Info

- Auth: HTTPBearer
- Request body: AdmissionInfoCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/admissions/admin`

List Admin Admission Info

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `content_type` (query, string | null), `audience_level` (query, string | null), `school_id` (query, string | null), `is_published` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/admissions/documents`

List Admission Documents

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `document_type` (query, string | null), `applicant_type` (query, string | null), `pathway_id` (query, string | null), `programme_id` (query, string | null), `intake_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/admissions/documents`

Create Admission Document

- Auth: HTTPBearer
- Request body: AdmissionDocumentCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/admissions/documents/{item_id}`

Update Admission Document

- Auth: HTTPBearer
- Request body: AdmissionDocumentUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/admissions/documents/{item_id}`

Delete Admission Document

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admissions/documents/{slug}`

Get Admission Document

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/admissions/faqs`

List Admission Faqs

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `category` (query, string | null), `applicant_type` (query, string | null), `pathway_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/admissions/faqs`

Create Admission Faq

- Auth: HTTPBearer
- Request body: AdmissionFaqCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/admissions/faqs/{item_id}`

Get Admission Faq

- Auth: public
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `PATCH /api/v1/admissions/faqs/{item_id}`

Update Admission Faq

- Auth: HTTPBearer
- Request body: AdmissionFaqUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/admissions/faqs/{item_id}`

Delete Admission Faq

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admissions/fee-structures`

List Programme Fee Structures

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `programme_id` (query, string | null), `intake_id` (query, string | null), `applicant_type` (query, string | null), `fee_category` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/admissions/fee-structures`

Create Programme Fee Structure

- Auth: HTTPBearer
- Request body: ProgrammeFeeStructureCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/admissions/fee-structures/{item_id}`

Get Programme Fee Structure

- Auth: public
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `PATCH /api/v1/admissions/fee-structures/{item_id}`

Update Programme Fee Structure

- Auth: HTTPBearer
- Request body: ProgrammeFeeStructureUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/admissions/fee-structures/{item_id}`

Delete Programme Fee Structure

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admissions/id/{item_id}`

Get Admission Info By Id

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/admissions/page-sections`

List Admission Page Sections

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `page_key` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/admissions/page-sections`

Create Admission Page Section

- Auth: HTTPBearer
- Request body: AdmissionPageSectionCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/admissions/page-sections/{item_id}`

Get Admission Page Section

- Auth: public
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `PATCH /api/v1/admissions/page-sections/{item_id}`

Update Admission Page Section

- Auth: HTTPBearer
- Request body: AdmissionPageSectionUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/admissions/page-sections/{item_id}`

Delete Admission Page Section

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admissions/pathways`

List Admission Pathways

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `applicant_type` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/admissions/pathways`

Create Admission Pathway

- Auth: HTTPBearer
- Request body: AdmissionPathwayCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/admissions/pathways/{item_id}`

Update Admission Pathway

- Auth: HTTPBearer
- Request body: AdmissionPathwayUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/admissions/pathways/{item_id}`

Delete Admission Pathway

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admissions/pathways/{slug}`

Get Admission Pathway

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/admissions/requirements`

List Admission Requirements

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `programme_id` (query, string | null), `school_id` (query, string | null), `intake_id` (query, string | null), `pathway_id` (query, string | null), `applicant_type` (query, string | null), `level` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/admissions/requirements`

Create Admission Requirement

- Auth: HTTPBearer
- Request body: AdmissionRequirementCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/admissions/requirements/{item_id}`

Get Admission Requirement

- Auth: public
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `PATCH /api/v1/admissions/requirements/{item_id}`

Update Admission Requirement

- Auth: HTTPBearer
- Request body: AdmissionRequirementUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/admissions/requirements/{item_id}`

Delete Admission Requirement

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `PATCH /api/v1/admissions/{item_id}`

Update Admission Info

- Auth: HTTPBearer
- Request body: AdmissionInfoUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/admissions/{item_id}`

Delete Admission Info

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/admissions/{slug}`

Get Admission Info

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/intakes`

List Intakes

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `academic_calendar_id` (query, string | null), `is_open` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/intakes`

Create Intake

- Auth: HTTPBearer
- Request body: IntakeCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/intakes/admin`

List Admin Intakes

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `academic_calendar_id` (query, string | null), `is_open` (query, boolean | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/intakes/id/{intake_id}`

Get Intake By Id

- Auth: HTTPBearer
- Request body: -
- Parameters: `intake_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/intakes/id/{intake_id}/homepage-admission`

Get Homepage Admission

- Auth: HTTPBearer
- Request body: -
- Parameters: `intake_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/intakes/id/{intake_id}/homepage-admission`

Update Homepage Admission

- Auth: HTTPBearer
- Request body: IntakeHomepageAdmissionUpdate
- Parameters: `intake_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/intakes/{intake_id}`

Update Intake

- Auth: HTTPBearer
- Request body: IntakeUpdate
- Parameters: `intake_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/intakes/{intake_id}`

Delete Intake

- Auth: HTTPBearer
- Request body: -
- Parameters: `intake_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/intakes/{slug}`

Get Intake

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/programmes`

List Programmes

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `school_id` (query, string | null), `department_id` (query, string | null), `level` (query, string | null), `mode_of_study` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/programmes`

Create Programme

- Auth: HTTPBearer
- Request body: ProgrammeCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/programmes/admin`

List Admin Programmes

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `school_id` (query, string | null), `department_id` (query, string | null), `level` (query, string | null), `mode_of_study` (query, string | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/programmes/api/list`

List Programmes Api Key

List programmes via API key authentication.

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `school_id` (query, string | null), `department_id` (query, string | null), `level` (query, string | null), `mode_of_study` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `X-API-Key` (header, string | null)
- Success response: 200 -

### `GET /api/v1/programmes/api/{slug}`

Get Programme Api Key

Get programme by slug via API key authentication.

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `X-API-Key` (header, string | null)
- Success response: 200 -

### `GET /api/v1/programmes/id/{programme_id}`

Get Programme By Id

- Auth: HTTPBearer
- Request body: -
- Parameters: `programme_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/programmes/{programme_id}`

Update Programme

- Auth: HTTPBearer
- Request body: ProgrammeUpdate
- Parameters: `programme_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/programmes/{programme_id}`

Delete Programme

- Auth: HTTPBearer
- Request body: -
- Parameters: `programme_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/programmes/{programme_id}/intakes`

Attach Programme Intake

- Auth: HTTPBearer
- Request body: ProgrammeIntakeCreate
- Parameters: `programme_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 201 -

### `POST /api/v1/programmes/{programme_id}/tutors`

Add Programme Tutor

- Auth: HTTPBearer
- Request body: ProgrammeTutorCreate
- Parameters: `programme_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/programmes/{slug}`

Get Programme

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/programmes/{slug}/staff`

Get Programme Staff

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Alumni

### `GET /api/v1/alumni`

List Alumni

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `school_id` (query, string | null), `programme_id` (query, string | null), `graduation_year` (query, integer | null), `mentor_only` (query, boolean), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/alumni`

Create Alumnus

- Auth: HTTPBearer
- Request body: AlumniCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/alumni-associations`

List Alumni Associations

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `association_type` (query, string | null), `school_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/alumni-associations`

Create Alumni Association

- Auth: HTTPBearer
- Request body: AlumniAssociationCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `POST /api/v1/alumni-associations/{association_id}/members`

Add Alumni Association Member

- Auth: HTTPBearer
- Request body: AlumniAssociationMemberCreate
- Parameters: `association_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 201 -

### `DELETE /api/v1/alumni-associations/{association_id}/members/{alumni_id}`

Remove Alumni Association Member

- Auth: HTTPBearer
- Request body: -
- Parameters: `association_id` (path, string), `alumni_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `PATCH /api/v1/alumni-associations/{item_id}`

Update Alumni Association

- Auth: HTTPBearer
- Request body: AlumniAssociationUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/alumni-associations/{item_id}`

Delete Alumni Association

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/alumni-associations/{slug}`

Get Alumni Association

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/alumni-associations/{slug}/members`

Get Alumni Association Members

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/alumni/{item_id}`

Get Alumnus

- Auth: public
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `PATCH /api/v1/alumni/{item_id}`

Update Alumnus

- Auth: HTTPBearer
- Request body: AlumniUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/alumni/{item_id}`

Delete Alumnus

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

## Analytics

### `POST /api/v1/analytics/events`

Ingest Events

- Auth: public
- Request body: AnalyticsEventBatchCreate
- Parameters: -
- Success response: 202 -

## Auth

### `POST /api/v1/auth/change-password`

Change Password

- Auth: HTTPBearer
- Request body: ChangePasswordRequest
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/auth/forgot-password`

Forgot Password

- Auth: public
- Request body: ForgotPasswordRequest
- Parameters: -
- Success response: 200 -

### `POST /api/v1/auth/login`

Login

- Auth: public
- Request body: UserLogin
- Parameters: -
- Success response: 200 -

### `POST /api/v1/auth/logout`

Logout

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/auth/logout-all`

Logout All

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/auth/me`

Get Me

- Auth: HTTPBearer
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/auth/refresh`

Refresh

- Auth: public
- Request body: RefreshRequest
- Parameters: -
- Success response: 200 -

### `POST /api/v1/auth/reset-password`

Reset Password

- Auth: public
- Request body: ResetPasswordRequest
- Parameters: -
- Success response: 200 -

### `POST /api/v1/auth/verify-email`

Verify Email

- Auth: public
- Request body: VerifyEmailRequest
- Parameters: -
- Success response: 200 -

## Content

### `GET /api/v1/announcements`

List Announcements

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `is_published` (query, boolean | null), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/announcements`

Create Announcement

- Auth: HTTPBearer
- Request body: AnnouncementCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/announcements/admin`

List Admin Announcements

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `is_published` (query, boolean | null), `status` (query, string | null), `workflow_status` (query, string | null), `owner_portal` (query, string | null), `owner_scope_type` (query, string | null), `owner_scope_id` (query, string | null), `scheduled_from` (query, string | null), `scheduled_to` (query, string | null), `search` (query, string | null), `record_state` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/announcements/id/{announcement_id}`

Get Announcement By Id

- Auth: HTTPBearer
- Request body: -
- Parameters: `announcement_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/announcements/{announcement_id}`

Update Announcement

- Auth: HTTPBearer
- Request body: AnnouncementUpdate
- Parameters: `announcement_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/announcements/{announcement_id}`

Delete Announcement

- Auth: HTTPBearer
- Request body: -
- Parameters: `announcement_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/announcements/{announcement_id}/publish`

Publish Announcement

- Auth: HTTPBearer
- Request body: -
- Parameters: `announcement_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/announcements/{announcement_id}/unpublish`

Unpublish Announcement

- Auth: HTTPBearer
- Request body: -
- Parameters: `announcement_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/announcements/{slug}`

Get Announcement

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/blogs`

List Blogs

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `is_published` (query, boolean | null), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/blogs`

Create Blog

- Auth: HTTPBearer
- Request body: BlogCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/blogs/admin`

List Admin Blogs

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `is_published` (query, boolean | null), `status` (query, string | null), `workflow_status` (query, string | null), `owner_portal` (query, string | null), `owner_scope_type` (query, string | null), `owner_scope_id` (query, string | null), `scheduled_from` (query, string | null), `scheduled_to` (query, string | null), `search` (query, string | null), `record_state` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/blogs/id/{blog_id}`

Get Blog By Id

- Auth: HTTPBearer
- Request body: -
- Parameters: `blog_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/blogs/id/{blog_id}`

Update Blog

- Auth: HTTPBearer
- Request body: BlogUpdate
- Parameters: `blog_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/blogs/id/{blog_id}`

Delete Blog

- Auth: HTTPBearer
- Request body: -
- Parameters: `blog_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/blogs/id/{blog_id}/publish`

Publish Blog

- Auth: HTTPBearer
- Request body: -
- Parameters: `blog_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/blogs/id/{blog_id}/unpublish`

Unpublish Blog

- Auth: HTTPBearer
- Request body: -
- Parameters: `blog_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/blogs/{slug}`

Get Blog

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/content-workflow/bulk`

Run Bulk Content Workflow Action

Apply one workflow action to many records, reporting per-item outcomes.

Authorization and transition failures never fail the whole request; each
item reports its own ``{content_id, ok, error}`` result.

- Auth: HTTPBearer
- Request body: BulkWorkflowRequest
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/content-workflow/queue`

List Content Workflow Queue

Return reviewable public content in a single CoCMS-oriented queue.

- Auth: HTTPBearer
- Request body: -
- Parameters: `source_portal` (query, string | null), `content_type` (query, string | null), `status` (query, string | null), `submitted_date` (query, string | null), `scheduled_date` (query, string | null), `reviewer` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/content-workflow/{content_type}/{content_id}/logs`

List Content Workflow Logs

- Auth: HTTPBearer
- Request body: -
- Parameters: `content_type` (path, string), `content_id` (path, string), `page` (query, integer), `per_page` (query, integer), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/content-workflow/{content_type}/{content_id}/{action}`

Run Content Workflow Action

- Auth: HTTPBearer
- Request body: ContentWorkflowActionRequest
- Parameters: `content_type` (path, string), `content_id` (path, string), `action` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/events`

List Events

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `is_published` (query, boolean | null), `upcoming` (query, boolean | null), `search` (query, string | null), `include_scope` (query, boolean), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/events`

Create Event

- Auth: HTTPBearer
- Request body: EventCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/events/admin`

List Admin Events

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `is_published` (query, boolean | null), `upcoming` (query, boolean | null), `status` (query, string | null), `workflow_status` (query, string | null), `owner_portal` (query, string | null), `owner_scope_type` (query, string | null), `owner_scope_id` (query, string | null), `scheduled_from` (query, string | null), `scheduled_to` (query, string | null), `search` (query, string | null), `record_state` (query, string), `include_scope` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/events/id/{event_id}`

Get Event By Id

- Auth: HTTPBearer
- Request body: -
- Parameters: `event_id` (path, string), `include_scope` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/events/{event_id}`

Update Event

- Auth: HTTPBearer
- Request body: EventUpdate
- Parameters: `event_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/events/{event_id}`

Delete Event

- Auth: HTTPBearer
- Request body: -
- Parameters: `event_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/events/{event_id}/publish`

Publish Event

- Auth: HTTPBearer
- Request body: -
- Parameters: `event_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/events/{event_id}/unpublish`

Unpublish Event

- Auth: HTTPBearer
- Request body: -
- Parameters: `event_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/events/{slug}`

Get Event

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `include_scope` (query, boolean), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/homepage`

Get Homepage

- Auth: public
- Request body: -
- Parameters: `scope_type` (query, string), `scope_id` (query, string | null)
- Success response: 200 -

### `GET /api/v1/news`

List News

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `is_published` (query, boolean | null), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/news`

Create News

- Auth: HTTPBearer
- Request body: NewsCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/news/admin`

List Admin News

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `is_published` (query, boolean | null), `status` (query, string | null), `workflow_status` (query, string | null), `owner_portal` (query, string | null), `owner_scope_type` (query, string | null), `owner_scope_id` (query, string | null), `scheduled_from` (query, string | null), `scheduled_to` (query, string | null), `search` (query, string | null), `record_state` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/news/id/{news_id}`

Get News By Id

- Auth: HTTPBearer
- Request body: -
- Parameters: `news_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/news/{news_id}`

Update News

- Auth: HTTPBearer
- Request body: NewsUpdate
- Parameters: `news_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/news/{news_id}`

Delete News

- Auth: HTTPBearer
- Request body: -
- Parameters: `news_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/news/{news_id}/publish`

Publish News

- Auth: HTTPBearer
- Request body: -
- Parameters: `news_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/news/{news_id}/unpublish`

Unpublish News

- Auth: HTTPBearer
- Request body: -
- Parameters: `news_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/news/{slug}`

Get News

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/page-sections`

Create Page Section

- Auth: HTTPBearer
- Request body: PageSectionCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/page-sections/admin`

List Admin Page Sections

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `page_key` (query, string | null), `scope_type` (query, string | null), `scope_id` (query, string | null), `status` (query, string | null), `search` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/page-sections/{section_id}`

Get Admin Page Section

- Auth: HTTPBearer
- Request body: -
- Parameters: `section_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/page-sections/{section_id}`

Update Page Section

- Auth: HTTPBearer
- Request body: PageSectionUpdate
- Parameters: `section_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/page-sections/{section_id}/items`

Create Section Item

- Auth: HTTPBearer
- Request body: SectionItemCreate
- Parameters: `section_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PUT /api/v1/page-sections/{section_id}/items/batch`

Batch Save Section Items

Transactionally upsert and soft-disable section items in one request.

Items with an ``id`` are updated, items without are created, and every id
in ``remove_ids`` is soft-disabled (``is_enabled=False``). All changes share
the request's DB transaction, so any failure rolls back the whole batch.

- Auth: HTTPBearer
- Request body: SectionItemBatchSave
- Parameters: `section_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/page-sections/{section_id}/{action}`

Run Page Section Workflow Action

- Auth: HTTPBearer
- Request body: -
- Parameters: `section_id` (path, string), `action` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/pages/{page_key}`

Get Page Composition

- Auth: public
- Request body: -
- Parameters: `page_key` (path, string), `scope_type` (query, string), `scope_id` (query, string | null)
- Success response: 200 -

### `POST /api/v1/partnership-spotlights`

Create Partnership Spotlight

- Auth: HTTPBearer
- Request body: PartnershipSpotlightCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/partnership-spotlights/admin`

List Admin Partnership Spotlights

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `status` (query, string | null), `search` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/partnership-spotlights/{spotlight_id}`

Update Partnership Spotlight

- Auth: HTTPBearer
- Request body: PartnershipSpotlightUpdate
- Parameters: `spotlight_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/partnership-spotlights/{spotlight_id}`

Get Admin Partnership Spotlight

- Auth: HTTPBearer
- Request body: -
- Parameters: `spotlight_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/partnership-spotlights/{spotlight_id}/{action}`

Run Partnership Spotlight Workflow Action

- Auth: HTTPBearer
- Request body: -
- Parameters: `spotlight_id` (path, string), `action` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/records/{content_type}/{record_id}/restore`

Restore Record

- Auth: HTTPBearer
- Request body: -
- Parameters: `content_type` (path, string), `record_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/section-items/{item_id}`

Update Section Item

- Auth: HTTPBearer
- Request body: SectionItemUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/sliders`

List Sliders

- Auth: public
- Request body: -
- Parameters: `slider_group_id` (query, string | null), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/sliders`

Create Slider

- Auth: HTTPBearer
- Request body: SliderCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/sliders/admin`

List Admin Sliders

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `slider_group_id` (query, string | null), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `status` (query, string | null), `workflow_status` (query, string | null), `is_active` (query, boolean | null), `search` (query, string | null), `record_state` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/sliders/groups`

List Slider Groups

- Auth: public
- Request body: -
- Parameters: `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/sliders/groups`

Create Slider Group

- Auth: HTTPBearer
- Request body: SliderGroupCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/sliders/groups/admin`

List Admin Slider Groups

Admin listing of slider groups: includes inactive and non-public groups.

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `is_active` (query, boolean | null), `is_public` (query, boolean | null), `is_main` (query, boolean | null), `scope_type` (query, string | null), `scope_id` (query, string | null), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/sliders/groups/id/{group_id}`

Get Slider Group By Id

- Auth: HTTPBearer
- Request body: -
- Parameters: `group_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/sliders/groups/{group_id}`

Update Slider Group

- Auth: HTTPBearer
- Request body: SliderGroupUpdate
- Parameters: `group_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/sliders/groups/{group_id}`

Delete Slider Group

- Auth: HTTPBearer
- Request body: -
- Parameters: `group_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/sliders/groups/{slug}`

Get Slider Group

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/sliders/{slider_id}`

Get Slider

- Auth: HTTPBearer
- Request body: -
- Parameters: `slider_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/sliders/{slider_id}`

Update Slider

- Auth: HTTPBearer
- Request body: SliderUpdate
- Parameters: `slider_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/sliders/{slider_id}`

Delete Slider

- Auth: HTTPBearer
- Request body: -
- Parameters: `slider_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/stories`

List Stories

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `story_type` (query, string | null), `category` (query, string | null), `is_featured` (query, boolean | null), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/stories`

Create Story

- Auth: HTTPBearer
- Request body: StoryCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `POST /api/v1/stories/account-requests`

Request Story Contributor Account

- Auth: public
- Request body: StoryContributorAccountRequestCreate
- Parameters: -
- Success response: 201 -

### `GET /api/v1/stories/account-requests/admin`

List Story Contributor Account Requests

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `status` (query, string | null), `search` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/stories/account-requests/admin/{request_id}/approve`

Approve Story Contributor Account Request

- Auth: HTTPBearer
- Request body: -
- Parameters: `request_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/stories/account-requests/admin/{request_id}/reject`

Reject Story Contributor Account Request

- Auth: HTTPBearer
- Request body: StoryContributorAccountRequestReview
- Parameters: `request_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/stories/admin`

List Admin Stories

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `is_published` (query, boolean | null), `status` (query, string | null), `workflow_status` (query, string | null), `story_type` (query, string | null), `category` (query, string | null), `contributor_user_id` (query, string | null), `scheduled_from` (query, string | null), `scheduled_to` (query, string | null), `search` (query, string | null), `record_state` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/stories/id/{story_id}`

Get Story By Id

- Auth: HTTPBearer
- Request body: -
- Parameters: `story_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/stories/id/{story_id}`

Update Story

- Auth: HTTPBearer
- Request body: StoryUpdate
- Parameters: `story_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/stories/id/{story_id}`

Delete Story

- Auth: HTTPBearer
- Request body: -
- Parameters: `story_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/stories/mine`

List My Stories

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `workflow_status` (query, string | null), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/stories/submissions`

Submit Story

- Auth: HTTPBearer
- Request body: StorySubmissionCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/stories/{slug}`

Get Story

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Corporate Communication Portal

### `GET /api/v1/corporate-communication-portal/context`

Get Context

Return server-derived capabilities and navigation for the portal.

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/corporate-communication-portal/media/batches`

Create Media Batch

- Auth: HTTPBearer
- Request body: Body_create_media_batch_api_v1_corporate_communication_portal_media_batches_post
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/corporate-communication-portal/media/batches/{batch_id}`

Get Media Batch

- Auth: HTTPBearer
- Request body: -
- Parameters: `batch_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/corporate-communication-portal/media/batches/{batch_id}/files/{file_id}/retry`

Retry Media File

- Auth: HTTPBearer
- Request body: -
- Parameters: `batch_id` (path, string), `file_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

## Documents

### `GET /api/v1/documents`

List Documents

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `document_type` (query, string | null), `category` (query, string | null), `scope_type` (query, string | null), `scope_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/documents`

Create Document

- Auth: HTTPBearer
- Request body: DocumentCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/documents/admin`

List Admin Documents

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `document_type` (query, string | null), `category` (query, string | null), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_public` (query, boolean | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/documents/{item_id}`

Update Document

- Auth: HTTPBearer
- Request body: DocumentUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/documents/{item_id}`

Delete Document

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/documents/{slug}`

Get Document

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/policies`

List Policies

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `category` (query, string | null), `division_id` (query, string | null), `department_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/policies`

Create Policy

- Auth: HTTPBearer
- Request body: PolicyCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/policies/admin`

List Admin Policies

Admin register listing: drafts and archived policies included.

The permission check runs in the function body (not as a dependency) so the
CSV export path, which calls this endpoint directly, is gated too.

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `category` (query, string | null), `division_id` (query, string | null), `department_id` (query, string | null), `status` (query, string | null), `is_public` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/policies/{item_id}`

Update Policy

- Auth: HTTPBearer
- Request body: PolicyUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/policies/{item_id}`

Delete Policy

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/policies/{slug}`

Get Policy

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Exchange

### `GET /api/v1/exchange-programmes`

List Exchange Programmes

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `programme_type` (query, string | null), `school_id` (query, string | null), `accepting_only` (query, boolean), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/exchange-programmes`

Create Exchange Programme

- Auth: HTTPBearer
- Request body: ExchangeProgrammeCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/exchange-programmes/{item_id}`

Update Exchange Programme

- Auth: HTTPBearer
- Request body: ExchangeProgrammeUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/exchange-programmes/{item_id}`

Delete Exchange Programme

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/exchange-programmes/{slug}`

Get Exchange Programme

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Exports

### `GET /api/v1/exports/{resource}.csv`

Export Resource Csv

Export a resource's admin listing (honoring the caller's filters) as CSV.

- Auth: HTTPBearer
- Request body: -
- Parameters: `resource` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

## Governance

### `GET /api/v1/governance/admin/council/audit-log`

List Council Audit Log

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/governance/admin/council/dashboard`

Council Dashboard

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/governance/admin/council/members`

List Council Members

- Auth: HTTPBearer
- Request body: -
- Parameters: `workflow_status` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/admin/council/members`

Create Council Member

- Auth: HTTPBearer
- Request body: CouncilMemberCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/governance/admin/council/members/{assignment_id}`

Get Council Member

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/governance/admin/council/members/{assignment_id}`

Update Council Member

- Auth: HTTPBearer
- Request body: CouncilMemberUpdate
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/governance/admin/council/members/{assignment_id}`

Delete Council Member

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/governance/admin/council/members/{assignment_id}/approve`

Approve Council Member

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `comment` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/admin/council/members/{assignment_id}/archive`

Archive Council Member

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `comment` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/admin/council/members/{assignment_id}/publish`

Publish Council Member

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `comment` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/admin/council/members/{assignment_id}/submit-review`

Submit Council Member For Review

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `comment` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/admin/council/members/{assignment_id}/unpublish`

Unpublish Council Member

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `comment` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/governance/admin/council/order`

Get Council Order

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PUT /api/v1/governance/admin/council/order`

Update Council Order

- Auth: HTTPBearer
- Request body: CouncilOrderUpdate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/governance/admin/council/page-content`

Get Council Page Content

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/governance/admin/council/page-content`

Update Council Page Content

- Auth: HTTPBearer
- Request body: GovernancePageContentUpdate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/admin/council/page-content/approve`

Approve Council Page Content

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/admin/council/page-content/archive`

Archive Council Page Content

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/admin/council/page-content/publish`

Publish Council Page Content

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/admin/council/page-content/submit-review`

Submit Council Page Content For Review

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/admin/council/page-content/unpublish`

Unpublish Council Page Content

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/governance/admin/council/preview`

Preview Council

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/governance/admin/management-board/dashboard`

Management Board Dashboard

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/governance/admin/management-board/members`

List Management Board Members

- Auth: HTTPBearer
- Request body: -
- Parameters: `workflow_status` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/admin/management-board/members`

Create Management Board Member

- Auth: HTTPBearer
- Request body: CouncilMemberCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/governance/admin/management-board/members/{assignment_id}`

Get Management Board Member

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/governance/admin/management-board/members/{assignment_id}`

Update Management Board Member

- Auth: HTTPBearer
- Request body: CouncilMemberUpdate
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/governance/admin/management-board/members/{assignment_id}`

Delete Management Board Member

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/governance/admin/management-board/members/{assignment_id}/approve`

Approve Management Board Member

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `comment` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/admin/management-board/members/{assignment_id}/archive`

Archive Management Board Member

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `comment` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/admin/management-board/members/{assignment_id}/publish`

Publish Management Board Member

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `comment` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/admin/management-board/members/{assignment_id}/submit-review`

Submit Management Board Member For Review

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `comment` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/admin/management-board/members/{assignment_id}/unpublish`

Unpublish Management Board Member

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `comment` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/governance/admin/management-board/order`

Get Management Board Order

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PUT /api/v1/governance/admin/management-board/order`

Update Management Board Order

- Auth: HTTPBearer
- Request body: CouncilOrderUpdate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/governance/admin/management-board/page-content`

Get Management Board Page Content

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/governance/admin/management-board/page-content`

Update Management Board Page Content

- Auth: HTTPBearer
- Request body: GovernancePageContentUpdate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/admin/management-board/page-content/approve`

Approve Management Board Page Content

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/admin/management-board/page-content/archive`

Archive Management Board Page Content

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/admin/management-board/page-content/publish`

Publish Management Board Page Content

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/admin/management-board/page-content/submit-review`

Submit Management Board Page Content For Review

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/admin/management-board/page-content/unpublish`

Unpublish Management Board Page Content

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/governance/admin/management-board/preview`

Preview Management Board

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/governance/admin/roles`

List Governance Roles

- Auth: HTTPBearer
- Request body: -
- Parameters: `active_only` (query, boolean), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/admin/roles`

Create Governance Role

- Auth: HTTPBearer
- Request body: GovernanceRoleCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/governance/admin/roles/{role_id}`

Update Governance Role

- Auth: HTTPBearer
- Request body: GovernanceRoleUpdate
- Parameters: `role_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/governance/boards`

List Boards

- Auth: public
- Request body: -
- Parameters: `board_type` (query, string | null), `parent_entity_type` (query, string | null), `parent_entity_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/governance/boards`

Create Board

- Auth: HTTPBearer
- Request body: BoardCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/governance/boards/id/{board_id}`

Get Board By Id

- Auth: HTTPBearer
- Request body: -
- Parameters: `board_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/governance/boards/id/{board_id}`

Update Board

- Auth: HTTPBearer
- Request body: BoardUpdate
- Parameters: `board_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/governance/boards/id/{board_id}`

Delete Board

- Auth: HTTPBearer
- Request body: -
- Parameters: `board_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/governance/boards/id/{board_id}/members`

Get Board Members By Id

- Auth: HTTPBearer
- Request body: -
- Parameters: `board_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/governance/boards/id/{board_id}/members`

Add Board Member By Id

- Auth: HTTPBearer
- Request body: BoardMemberCreate
- Parameters: `board_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 201 -

### `DELETE /api/v1/governance/boards/id/{board_id}/members/{person_id}`

Remove Board Member By Id

- Auth: HTTPBearer
- Request body: -
- Parameters: `board_id` (path, string), `person_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/governance/boards/{slug}`

Get Board

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/governance/boards/{slug}/members`

Get Board Members

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/governance/boards/{slug}/members`

Add Board Member

- Auth: HTTPBearer
- Request body: BoardMemberCreate
- Parameters: `slug` (path, string), `ksu_access` (cookie, string | null)
- Success response: 201 -

### `DELETE /api/v1/governance/boards/{slug}/members/{person_id}`

Remove Board Member

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `person_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/governance/council`

Get Council

- Auth: public
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/governance/management-board`

Get Management Board

- Auth: public
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/governance/public/university-council`

Public University Council

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 -

### `GET /api/v1/governance/public/university-council/{slug}`

Public University Council Profile

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/governance/senate`

Get Senate

- Auth: public
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Health

### `GET /api/v1/health`

Health

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 -

## Imports

### `GET /api/v1/imports/jobs/{job_id}`

Get Import Job

- Auth: HTTPBearer
- Request body: -
- Parameters: `job_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/imports/resources`

List Import Resources

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/imports/resources/{resource_key}`

Get Import Resource

- Auth: HTTPBearer
- Request body: -
- Parameters: `resource_key` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/imports/{resource_key}/commit`

Commit Import

- Auth: HTTPBearer
- Request body: ImportCommitRequest
- Parameters: `resource_key` (path, string), `ksu_access` (cookie, string | null)
- Success response: 201 -

### `POST /api/v1/imports/{resource_key}/commit-async`

Queue Import Commit

- Auth: HTTPBearer
- Request body: ImportCommitRequest
- Parameters: `resource_key` (path, string), `ksu_access` (cookie, string | null)
- Success response: 202 -

### `POST /api/v1/imports/{resource_key}/preview`

Preview Import

- Auth: HTTPBearer
- Request body: Body_preview_import_api_v1_imports__resource_key__preview_post
- Parameters: `resource_key` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/imports/{resource_key}/template`

Download Import Template

- Auth: HTTPBearer
- Request body: -
- Parameters: `resource_key` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

## Internal

### `GET /api/v1/internal/departments/{department_id}`

Get Department Snapshot

- Auth: public
- Request body: -
- Parameters: `department_id` (path, string), `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 -

### `POST /api/v1/internal/email/send`

Send Internal Email

- Auth: public
- Request body: InternalEmailPayload
- Parameters: `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 -

### `GET /api/v1/internal/media/{media_id}`

Get Public Media Snapshot

Return browser-safe fields for public media referenced by sibling services.

- Auth: public
- Request body: -
- Parameters: `media_id` (path, string), `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 -

### `POST /api/v1/internal/notifications/broadcast`

Broadcast Internal Notification

- Auth: public
- Request body: InternalNotificationBroadcastPayload
- Parameters: `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 -

### `GET /api/v1/internal/persons/{person_id}`

Get Person Snapshot

Return a minimal person snapshot for sibling services (Research, Library).

- Auth: public
- Request body: -
- Parameters: `person_id` (path, string), `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 -

### `GET /api/v1/internal/references/{kind}/{item_id}`

Check Reference

Validate shared main-owned references for sibling services.

- Auth: public
- Request body: -
- Parameters: `kind` (path, string), `item_id` (path, string), `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 -

### `GET /api/v1/internal/schools/{school_id}/departments/{department_id}`

Check Department School

Validate the cross-service school/department ownership pair.

- Auth: public
- Request body: -
- Parameters: `school_id` (path, string), `department_id` (path, string), `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 -

### `GET /api/v1/internal/staff-assignments/{assignment_id}`

Get Staff Assignment Snapshot

- Auth: public
- Request body: -
- Parameters: `assignment_id` (path, string), `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 -

## Marketing

### `GET /api/v1/newsletters`

List Newsletters

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/newsletters`

Create Newsletter

- Auth: HTTPBearer
- Request body: NewsletterCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/newsletters/admin`

List Newsletters Admin

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `search` (query, string | null), `status` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/newsletters/admin/{item_id}`

Get Newsletter Admin

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/newsletters/subscribe`

Subscribe Newsletter

- Auth: public
- Request body: NewsletterSubscriberCreate
- Parameters: -
- Success response: 201 -

### `GET /api/v1/newsletters/subscribers`

List Newsletter Subscribers

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `status` (query, string | null), `q` (query, string | null), `is_verified` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/newsletters/subscribers/{item_id}/unsubscribe`

Unsubscribe Newsletter Subscriber Admin

Honor unsubscribe requests received out-of-band (phone or email).

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/newsletters/unsubscribe`

Unsubscribe Newsletter

- Auth: public
- Request body: -
- Parameters: `email` (query, string)
- Success response: 200 -

### `GET /api/v1/newsletters/unsubscribe/{token}`

Unsubscribe Newsletter By Token

One-click unsubscribe used by the link embedded in every newsletter email.

- Auth: public
- Request body: -
- Parameters: `token` (path, string)
- Success response: 200 -

### `PATCH /api/v1/newsletters/{item_id}`

Update Newsletter

- Auth: HTTPBearer
- Request body: NewsletterUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/newsletters/{item_id}`

Delete Newsletter

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/newsletters/{item_id}/cancel-schedule`

Cancel Newsletter Schedule

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/newsletters/{item_id}/schedule`

Schedule Newsletter Send

- Auth: HTTPBearer
- Request body: NewsletterScheduleRequest
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/newsletters/{item_id}/send`

Send Newsletter Now

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/newsletters/{slug}`

Get Newsletter

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/social-posts`

List Social Posts

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `status` (query, string | null), `source_type` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/social-posts`

Create Social Post

- Auth: HTTPBearer
- Request body: SocialMediaPostCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/social-posts/accounts`

List Social Accounts

- Auth: HTTPBearer
- Request body: -
- Parameters: `provider` (query, string | null), `active_only` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/social-posts/accounts`

Create Social Account

- Auth: HTTPBearer
- Request body: SocialPlatformAccountCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/social-posts/accounts/{item_id}`

Update Social Account

- Auth: HTTPBearer
- Request body: SocialPlatformAccountUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/social-posts/accounts/{item_id}`

Delete Social Account

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/social-posts/accounts/{item_id}/validate`

Validate Social Account

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/social-posts/{item_id}`

Get Social Post

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/social-posts/{item_id}`

Update Social Post

- Auth: HTTPBearer
- Request body: SocialMediaPostUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/social-posts/{item_id}`

Delete Social Post

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/social-posts/{item_id}/deliveries`

List Social Post Deliveries

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/social-posts/{item_id}/publish`

Publish Social Post

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/social-posts/{item_id}/validate`

Validate Social Post

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/testimonials`

List Testimonials

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `testimonial_type` (query, string | null), `school_id` (query, string | null), `department_id` (query, string | null), `programme_id` (query, string | null), `featured_only` (query, boolean), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/testimonials`

Create Testimonial

- Auth: HTTPBearer
- Request body: TestimonialCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/testimonials/admin`

List Admin Testimonials

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `testimonial_type` (query, string | null), `school_id` (query, string | null), `department_id` (query, string | null), `programme_id` (query, string | null), `featured_only` (query, boolean), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/testimonials/{item_id}`

Get Testimonial

- Auth: public
- Request body: -
- Parameters: `item_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `PATCH /api/v1/testimonials/{item_id}`

Update Testimonial

- Auth: HTTPBearer
- Request body: TestimonialUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/testimonials/{item_id}`

Delete Testimonial

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

## Me

### `GET /api/v1/me/portal-access`

Get My Portal Access

Return backend-authoritative portal access records for the authenticated user.

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/me/preferences`

Get My Preferences

Return generic preferences owned by the authenticated user.

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/me/preferences`

Update My Preferences

Upsert generic preferences owned by the authenticated user.

- Auth: HTTPBearer
- Request body: UserPreferencesUpdate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/me/profile`

Get My Profile

Return the authenticated user's linked public staff profile.

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/me/profile`

Update My Profile

Update editable fields on the authenticated user's linked public staff profile.

- Auth: HTTPBearer
- Request body: MyProfileUpdate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

## Media

### `GET /api/v1/media`

List Media

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `folder_id` (query, string | null), `media_type` (query, string | null), `uploaded_by_id` (query, string | null), `entity_type` (query, string | null), `entity_id` (query, string | null), `role` (query, string | null), `is_public` (query, boolean | null), `search` (query, string | null), `record_state` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/media/folders`

List Folders

- Auth: HTTPBearer
- Request body: -
- Parameters: `parent_id` (query, string | null), `scope_type` (query, string | null), `scope_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/media/folders`

Create Folder

- Auth: HTTPBearer
- Request body: MediaFolderCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/media/folders/{folder_id}`

Get Folder

- Auth: HTTPBearer
- Request body: -
- Parameters: `folder_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/media/folders/{folder_id}`

Update Folder

- Auth: HTTPBearer
- Request body: MediaFolderUpdate
- Parameters: `folder_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/media/folders/{folder_id}`

Delete Folder

- Auth: HTTPBearer
- Request body: -
- Parameters: `folder_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/media/links`

List Media Links

- Auth: HTTPBearer
- Request body: -
- Parameters: `entity_type` (query, string | null), `entity_id` (query, string | null), `media_id` (query, string | null), `role` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/media/links`

Create Media Link

- Auth: HTTPBearer
- Request body: MediaLinkCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/media/links/{link_id}`

Get Media Link

- Auth: HTTPBearer
- Request body: -
- Parameters: `link_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/media/links/{link_id}`

Update Media Link

- Auth: HTTPBearer
- Request body: MediaLinkUpdate
- Parameters: `link_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/media/links/{link_id}`

Delete Media Link

- Auth: HTTPBearer
- Request body: -
- Parameters: `link_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/media/upload`

Upload Media

- Auth: HTTPBearer
- Request body: Body_upload_media_api_v1_media_upload_post
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/media/{media_id}`

Get Media

- Auth: HTTPBearer
- Request body: -
- Parameters: `media_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/media/{media_id}`

Update Media

- Auth: HTTPBearer
- Request body: MediaUpdate
- Parameters: `media_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/media/{media_id}`

Delete Media

- Auth: HTTPBearer
- Request body: -
- Parameters: `media_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

## Organization

### `GET /api/v1/divisions`

List Divisions

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/divisions`

Create Division

- Auth: HTTPBearer
- Request body: DivisionCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/divisions/admin`

List Admin Divisions

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/divisions/id/{division_id}`

Get Division By Id

- Auth: HTTPBearer
- Request body: -
- Parameters: `division_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/divisions/id/{division_id}`

Update Division

- Auth: HTTPBearer
- Request body: DivisionUpdate
- Parameters: `division_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/divisions/id/{division_id}`

Delete Division

- Auth: HTTPBearer
- Request body: -
- Parameters: `division_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/divisions/{slug}`

Get Division

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/wings`

Create Wing

- Auth: HTTPBearer
- Request body: WingCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/wings/admin`

List Admin Wings

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `division_id` (query, string | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/wings/division/{division_id}`

List Wings By Division

- Auth: public
- Request body: -
- Parameters: `division_id` (path, string), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/wings/slug/{slug}`

Get Wing By Slug

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/wings/{wing_id}`

Get Wing

- Auth: public
- Request body: -
- Parameters: `wing_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `PATCH /api/v1/wings/{wing_id}`

Update Wing

- Auth: HTTPBearer
- Request body: WingUpdate
- Parameters: `wing_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

## Persons

### `GET /api/v1/persons`

List Persons

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `department_id` (query, string | null), `school_id` (query, string | null), `academic_rank` (query, string | null), `employment_type` (query, string | null), `is_researcher` (query, boolean | null), `status` (query, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/persons`

Create Person

- Auth: HTTPBearer
- Request body: PersonCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/persons/admin`

List Admin Persons

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `department_id` (query, string | null), `school_id` (query, string | null), `academic_rank` (query, string | null), `employment_type` (query, string | null), `is_researcher` (query, boolean | null), `status` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/persons/{person_id}`

Get Person

- Auth: public
- Request body: -
- Parameters: `person_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `PATCH /api/v1/persons/{person_id}`

Update Person

- Auth: HTTPBearer
- Request body: PersonUpdate
- Parameters: `person_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/persons/{person_id}`

Delete Person

- Auth: HTTPBearer
- Request body: -
- Parameters: `person_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `PATCH /api/v1/persons/{person_id}/activate`

Activate Person

- Auth: HTTPBearer
- Request body: -
- Parameters: `person_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/persons/{person_id}/cv`

Upload Person Cv

- Auth: HTTPBearer
- Request body: Body_upload_person_cv_api_v1_persons__person_id__cv_post
- Parameters: `person_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/persons/{person_id}/cv`

Remove Person Cv

- Auth: HTTPBearer
- Request body: -
- Parameters: `person_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/persons/{person_id}/deactivate`

Deactivate Person

- Auth: HTTPBearer
- Request body: -
- Parameters: `person_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/persons/{person_id}/photo`

Upload Person Photo

- Auth: HTTPBearer
- Request body: Body_upload_person_photo_api_v1_persons__person_id__photo_post
- Parameters: `person_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/persons/{person_id}/photo`

Remove Person Photo

- Auth: HTTPBearer
- Request body: -
- Parameters: `person_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

## Public

### `GET /api/v1/navigation`

Get Navigation

Single public payload backing the main-site mega menu.

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 -

### `GET /api/v1/public-pages`

List Public Site Pages

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `page_type` (query, string | null), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/public-pages/{slug}`

Get Public Site Page

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/public/academic-organization`

Get Public Academic Organization

- Auth: public
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/public/content/{entity_type}/{entity_id}`

Get Public Entity Content

- Auth: public
- Request body: -
- Parameters: `entity_type` (path, string), `entity_id` (path, string), `content_type` (query, string), `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/public/departments/{department_id}/team`

Get Public Department Team

- Auth: public
- Request body: -
- Parameters: `department_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/public/entities/{entity_type}/{entity_slug}/inquiries`

Create Public Entity Inquiry

- Auth: public
- Request body: PublicEntityInquiryCreate
- Parameters: `entity_type` (path, string), `entity_slug` (path, string)
- Success response: 201 -

### `GET /api/v1/public/leadership/`

Get Leader

Get a leader by role and entity.

- Auth: public
- Request body: -
- Parameters: `role` (query, string), `entity_type` (query, string), `entity_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/public/leadership/chancellor`

Get Chancellor

Get the current Chancellor.

- Auth: public
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/public/leadership/dean/{school_id}`

Get Dean

Get the Dean of a school.

- Auth: public
- Request body: -
- Parameters: `school_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/public/leadership/director/{division_id}`

Get Director

Get the Director of a division/directorate.

- Auth: public
- Request body: -
- Parameters: `division_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/public/leadership/hod/{department_id}`

Get Hod

Get the Head of Department.

- Auth: public
- Request body: -
- Parameters: `department_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/public/leadership/list`

List Leaders

List all public leadership assignments for an entity.

- Auth: public
- Request body: -
- Parameters: `entity_type` (query, string), `entity_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/public/leadership/vice-chancellor`

Get Vice Chancellor

Get the current Vice Chancellor.

- Auth: public
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/public/media`

List Public Media

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `media_type` (query, string | null), `search` (query, string | null)
- Success response: 200 -

### `GET /api/v1/public/media/links`

List Public Media Links

- Auth: public
- Request body: -
- Parameters: `entity_type` (query, string), `entity_id` (query, string), `role` (query, string | null), `per_page` (query, integer)
- Success response: 200 -

### `GET /api/v1/public/media/{media_id}`

Get Public Media

- Auth: public
- Request body: -
- Parameters: `media_id` (path, string)
- Success response: 200 -

### `GET /api/v1/public/people/{person_id}`

Get Public Person

- Auth: public
- Request body: -
- Parameters: `person_id` (path, string)
- Success response: 200 -

### `GET /api/v1/public/research/context`

Get Public Research Context

Return the merged public context for the research portal.

REIRM has a public wing used for navigation and a hidden administrative
department used for richer editable content. This endpoint intentionally
merges both into one public-safe research context.

- Auth: public
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `PATCH /api/v1/public/research/context`

Update Public Research Context

Edit the research wing and hidden/public research department context.

- Auth: HTTPBearer
- Request body: ResearchContextUpdate
- Parameters: `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/public/schools/{school_id}/team`

Get Public School Team

- Auth: public
- Request body: -
- Parameters: `school_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/public/schools/{school_slug}/inquiries`

Create Public School Inquiry

- Auth: public
- Request body: PublicEntityInquiryCreate
- Parameters: `school_slug` (path, string)
- Success response: 201 -

### `GET /api/v1/public/team`

Get Public Team

- Auth: public
- Request body: -
- Parameters: `entity_type` (query, string), `entity_id` (query, string | null)
- Success response: 200 -

### `GET /api/v1/public/team/academic-organization`

Get Public Academic Organization

- Auth: public
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Realtime

### `GET /api/v1/realtime/metrics`

Get Realtime Metrics

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/realtime/research/config`

Get Research Realtime Config

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 -

### `POST /api/v1/realtime/ticket`

Create Realtime Ticket

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

## Research

### `GET /api/v1/partners`

List Partners

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `is_active` (query, boolean | null), `is_featured` (query, boolean | null)
- Success response: 200 -

### `GET /api/v1/partners/{slug}`

Get Partner

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

## School Portal

### `GET /api/v1/school-portal/audit`

List School Audit

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `action` (query, string | null), `resource_type` (query, string | null), `status` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/school-portal/capabilities`

Get Capabilities

Return the current school's permission and navigation capability map.

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/school-portal/content`

List Content

- Auth: HTTPBearer
- Request body: -
- Parameters: `content_type` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/content`

Create Content

- Auth: HTTPBearer
- Request body: SchoolContentCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/school-portal/content/{content_type}/{content_id}`

Get Content

- Auth: HTTPBearer
- Request body: -
- Parameters: `content_type` (path, string), `content_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/school-portal/content/{content_type}/{content_id}`

Patch Content

- Auth: HTTPBearer
- Request body: SchoolContentUpdate
- Parameters: `content_type` (path, string), `content_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/school-portal/content/{content_type}/{content_id}`

Delete Content

- Auth: HTTPBearer
- Request body: -
- Parameters: `content_type` (path, string), `content_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/school-portal/content/{content_type}/{content_id}/submit`

Submit Content

- Auth: HTTPBearer
- Request body: SchoolContentAction
- Parameters: `content_type` (path, string), `content_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/content/{content_type}/{content_id}/withdraw`

Withdraw Content

- Auth: HTTPBearer
- Request body: SchoolContentAction
- Parameters: `content_type` (path, string), `content_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/school-portal/context`

Get Context

Return the one school and capabilities derived from server-side grants.

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/school-portal/dashboard`

Get School Dashboard

- Auth: HTTPBearer
- Request body: -
- Parameters: `range` (query, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_SchoolPortalDashboardResponse_

### `GET /api/v1/school-portal/departments`

List Departments

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `department_type` (query, string | null), `is_active` (query, boolean | null), `is_public` (query, boolean | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/departments`

Post Department

- Auth: HTTPBearer
- Request body: SchoolDepartmentCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `POST /api/v1/school-portal/departments/imports`

Commit Department Import

- Auth: HTTPBearer
- Request body: SchoolAcademicImportRequest
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/departments/imports/preview`

Preview Department Import

- Auth: HTTPBearer
- Request body: SchoolAcademicImportRequest
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/school-portal/departments/{department_id}`

Get Department

- Auth: HTTPBearer
- Request body: -
- Parameters: `department_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/school-portal/departments/{department_id}`

Patch Department

- Auth: HTTPBearer
- Request body: SchoolDepartmentUpdate
- Parameters: `department_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/school-portal/departments/{department_id}`

Delete Department

- Auth: HTTPBearer
- Request body: -
- Parameters: `department_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/school-portal/inquiries`

List Inquiries

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `status` (query, string | null), `category` (query, string | null), `priority` (query, string | null), `assigned_to_user_id` (query, string | null), `created_from` (query, string | null), `created_to` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/school-portal/inquiries/{inquiry_id}`

Get Inquiry

- Auth: HTTPBearer
- Request body: -
- Parameters: `inquiry_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/school-portal/inquiries/{inquiry_id}/assign`

Assign Inquiry

- Auth: HTTPBearer
- Request body: InquiryAssign
- Parameters: `inquiry_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/inquiries/{inquiry_id}/messages/{message_id}/retry`

Retry Inquiry Reply

- Auth: HTTPBearer
- Request body: -
- Parameters: `inquiry_id` (path, string), `message_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/inquiries/{inquiry_id}/notes`

Add Inquiry Note

- Auth: HTTPBearer
- Request body: InquiryNoteCreate
- Parameters: `inquiry_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/inquiries/{inquiry_id}/replies`

Reply To Inquiry

- Auth: HTTPBearer
- Request body: InquiryReplyCreate
- Parameters: `inquiry_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/school-portal/inquiries/{inquiry_id}/status`

Update Inquiry Status

- Auth: HTTPBearer
- Request body: InquiryStatusUpdate
- Parameters: `inquiry_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/media/batches`

Create Media Batch

- Auth: HTTPBearer
- Request body: Body_create_media_batch_api_v1_school_portal_media_batches_post
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/school-portal/media/batches/{batch_id}`

Get Media Batch

- Auth: HTTPBearer
- Request body: -
- Parameters: `batch_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/media/batches/{batch_id}/files/{file_id}/retry`

Retry Media File

- Auth: HTTPBearer
- Request body: -
- Parameters: `batch_id` (path, string), `file_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/media/content-imports`

Commit Content Metadata Import

- Auth: HTTPBearer
- Request body: SchoolContentMetadataImport
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/media/content-imports/preview`

Preview Content Metadata Import

- Auth: HTTPBearer
- Request body: SchoolContentMetadataImport
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/school-portal/media/{media_id}`

Update School Media Metadata

- Auth: HTTPBearer
- Request body: SchoolPortalMediaMetadataUpdate
- Parameters: `media_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/school-portal/media/{media_id}`

Delete School Media

- Auth: HTTPBearer
- Request body: -
- Parameters: `media_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/school-portal/notifications`

List School Notifications

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `unread_only` (query, boolean), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/notifications/read-all`

Mark All School Notifications Read

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/notifications/{notification_id}/archive`

Archive School Notification

- Auth: HTTPBearer
- Request body: -
- Parameters: `notification_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/school-portal/notifications/{notification_id}/read`

Mark School Notification Read

- Auth: HTTPBearer
- Request body: -
- Parameters: `notification_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/school-portal/profile`

Get School Profile

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/school-portal/profile`

Patch School Profile

- Auth: HTTPBearer
- Request body: SchoolPortalProfileUpdate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PUT /api/v1/school-portal/profile/dean`

Put School Dean

- Auth: HTTPBearer
- Request body: SchoolPortalDeanUpdate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/profile/media`

Post School Profile Media

- Auth: HTTPBearer
- Request body: SchoolPortalMediaLinkCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/school-portal/profile/media/{link_id}`

Delete School Profile Media

- Auth: HTTPBearer
- Request body: -
- Parameters: `link_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/school-portal/programmes`

List Programmes

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `department_id` (query, string | null), `level` (query, string | null), `mode_of_study` (query, string | null), `is_active` (query, boolean | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/programmes`

Post Programme

- Auth: HTTPBearer
- Request body: SchoolProgrammeCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `POST /api/v1/school-portal/programmes/imports`

Commit Programme Import

- Auth: HTTPBearer
- Request body: SchoolAcademicImportRequest
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/programmes/imports/preview`

Preview Programme Import

- Auth: HTTPBearer
- Request body: SchoolAcademicImportRequest
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/school-portal/programmes/{programme_id}`

Get Programme

- Auth: HTTPBearer
- Request body: -
- Parameters: `programme_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/school-portal/programmes/{programme_id}`

Patch Programme

- Auth: HTTPBearer
- Request body: SchoolProgrammeUpdate
- Parameters: `programme_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/school-portal/programmes/{programme_id}`

Delete Programme

- Auth: HTTPBearer
- Request body: -
- Parameters: `programme_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/school-portal/publications`

List Publications

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `status` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/publications`

Create Publication

- Auth: HTTPBearer
- Request body: SchoolPublicationCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/school-portal/publications/{publication_id}`

Get Publication

- Auth: HTTPBearer
- Request body: -
- Parameters: `publication_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/school-portal/publications/{publication_id}`

Update Publication

- Auth: HTTPBearer
- Request body: SchoolPublicationUpdate
- Parameters: `publication_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/publications/{publication_id}/submit`

Submit Publication

- Auth: HTTPBearer
- Request body: -
- Parameters: `publication_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/publications/{publication_id}/withdraw`

Withdraw Publication

- Auth: HTTPBearer
- Request body: -
- Parameters: `publication_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/school-portal/team`

Get Team

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `status` (query, string | null), `role` (query, string | null), `sort` (query, string), `order` (query, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/team`

Post Team Member

- Auth: HTTPBearer
- Request body: SchoolTeamMemberCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `POST /api/v1/school-portal/team/imports`

Queue Team Import

- Auth: HTTPBearer
- Request body: SchoolTeamImportRequest
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 202 -

### `POST /api/v1/school-portal/team/imports/preview`

Preview Team Import

- Auth: HTTPBearer
- Request body: Body_preview_team_import_api_v1_school_portal_team_imports_preview_post
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/school-portal/team/imports/template`

Download Team Import Template

- Auth: HTTPBearer
- Request body: -
- Parameters: `format` (query, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/school-portal/team/person-options`

Get Team Person Options

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/school-portal/team/{assignment_id}`

Get Team Member

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/school-portal/team/{assignment_id}`

Patch Team Member

- Auth: HTTPBearer
- Request body: SchoolTeamMemberUpdate
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/school-portal/team/{assignment_id}`

Delete Team Member

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/school-portal/team/{assignment_id}/activate`

Activate Team Member

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/team/{assignment_id}/deactivate`

Deactivate Team Member

- Auth: HTTPBearer
- Request body: SchoolTeamLifecycleRequest
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/team/{assignment_id}/end`

End Team Member

- Auth: HTTPBearer
- Request body: SchoolTeamLifecycleRequest
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/team/{assignment_id}/resend-invite`

Resend Team Member Invite

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/team/{assignment_id}/revoke-access`

Revoke Team Member Access

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/school-portal/team/{assignment_id}/transfer`

Transfer Team Member

- Auth: HTTPBearer
- Request body: SchoolTeamTransferRequest
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

## Search

### `GET /api/v1/search`

Search

- Auth: public
- Request body: -
- Parameters: `q` (query, string), `limit_per_type` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `news_fields` (query, string | null), `news_include` (query, string | null), `blogs_fields` (query, string | null), `blogs_include` (query, string | null), `announcements_fields` (query, string | null), `announcements_include` (query, string | null), `events_fields` (query, string | null), `events_include` (query, string | null), `persons_fields` (query, string | null), `persons_include` (query, string | null), `schools_fields` (query, string | null), `schools_include` (query, string | null), `departments_fields` (query, string | null), `departments_include` (query, string | null)
- Success response: 200 -

## Staff

### `GET /api/v1/staff/academic-ranks`

List Academic Ranks

List all academic ranks in order.

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/staff/assignments`

List Assignments

- Auth: HTTPBearer
- Request body: -
- Parameters: `entity_type` (query, string | null), `entity_id` (query, string | null), `person_id` (query, string | null), `status` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/staff/assignments`

Create Assignment

- Auth: HTTPBearer
- Request body: StaffAssignmentCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `POST /api/v1/staff/assignments/check-conflict`

Check Conflict

- Auth: HTTPBearer
- Request body: StaffAssignmentConflictCheck
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/staff/assignments/{assignment_id}`

Get Assignment

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/staff/assignments/{assignment_id}`

Update Assignment

- Auth: HTTPBearer
- Request body: StaffAssignmentUpdate
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/staff/assignments/{assignment_id}`

Delete Assignment

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `PATCH /api/v1/staff/assignments/{assignment_id}/activate`

Activate Assignment

- Auth: HTTPBearer
- Request body: StaffAssignmentActivate
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/staff/assignments/{assignment_id}/direct-reports`

Get Direct Reports

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/staff/assignments/{assignment_id}/end`

End Assignment

- Auth: HTTPBearer
- Request body: StaffAssignmentEnd
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/staff/assignments/{assignment_id}/reassign`

Reassign Assignment

- Auth: HTTPBearer
- Request body: StaffAssignmentReassign
- Parameters: `assignment_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/staff/assignments/{assignment_id}/reporting-chain`

Get Reporting Chain

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/staff/entities`

List Staff Entities

- Auth: HTTPBearer
- Request body: -
- Parameters: `entity_type` (query, string), `search` (query, string | null), `limit` (query, integer), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/staff/entity-types`

List Entity Types

List all entity types with their available roles.

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/staff/roles`

List Roles

List roles, optionally filtered by entity type.

- Auth: HTTPBearer
- Request body: -
- Parameters: `entity_type` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

## Stats

### `GET /api/v1/stats`

Get Public Stats

- Auth: public
- Request body: -
- Parameters: `scope` (query, string), `slug` (query, string | null)
- Success response: 200 -

### `GET /api/v1/stats/admin`

Get Admin Stats

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/stats/portal/corporate-communication/dashboard`

Get Corporate Communication Dashboard

- Auth: HTTPBearer
- Request body: -
- Parameters: `date_from` (query, string | null), `date_to` (query, string | null), `compare` (query, string), `bucket` (query, string), `content_type` (query, string | null), `owner_portal` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/stats/portal/corporate-communication/dashboard/export`

Export Corporate Communication Dashboard

- Auth: HTTPBearer
- Request body: -
- Parameters: `date_from` (query, string | null), `date_to` (query, string | null), `compare` (query, string), `bucket` (query, string), `content_type` (query, string | null), `owner_portal` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/stats/portal/{portal}`

Get Portal Stats

- Auth: HTTPBearer
- Request body: -
- Parameters: `portal` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

## Student Life

### `GET /api/v1/accommodations`

List Accommodations

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `campus_id` (query, string | null), `accommodation_type` (query, string | null), `gender` (query, string | null), `is_active` (query, boolean | null), `is_accepting_applications` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/accommodations`

Create Accommodation

- Auth: HTTPBearer
- Request body: AccommodationCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/accommodations/{item_id}`

Update Accommodation

- Auth: HTTPBearer
- Request body: AccommodationUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/accommodations/{item_id}`

Delete Accommodation

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/accommodations/{slug}`

Get Accommodation

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/arts-culture`

List Arts Culture

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `category` (query, string | null), `school_id` (query, string | null), `club_id` (query, string | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/arts-culture`

Create Arts Culture

- Auth: HTTPBearer
- Request body: ArtsCultureCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/arts-culture/{item_id}`

Update Arts Culture

- Auth: HTTPBearer
- Request body: ArtsCultureUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/arts-culture/{item_id}`

Delete Arts Culture

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/arts-culture/{slug}`

Get Arts Culture

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/campus-life/homepage`

Get Life Around Studies Homepage

Return the editorial composition plus live student-life highlights.

- Auth: public
- Request body: -
- Parameters: `audience` (query, string)
- Success response: 200 -

### `GET /api/v1/clubs`

List Clubs

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `club_type` (query, string | null), `school_id` (query, string | null), `department_id` (query, string | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/clubs`

Create Club

- Auth: HTTPBearer
- Request body: ClubCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/clubs/activities/{activity_id}`

Update Club Activity

- Auth: HTTPBearer
- Request body: ClubActivityUpdate
- Parameters: `activity_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/clubs/activities/{activity_id}`

Delete Club Activity

- Auth: HTTPBearer
- Request body: -
- Parameters: `activity_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/clubs/activities/{activity_id}/workflow/{action}`

Transition Club Activity

- Auth: HTTPBearer
- Request body: ContentWorkflowActionRequest
- Parameters: `activity_id` (path, string), `action` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/clubs/announcements/{announcement_id}`

Update Club Announcement

- Auth: HTTPBearer
- Request body: AnnouncementUpdate
- Parameters: `announcement_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/clubs/announcements/{announcement_id}`

Delete Club Announcement

- Auth: HTTPBearer
- Request body: -
- Parameters: `announcement_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/clubs/announcements/{announcement_id}/workflow/{action}`

Transition Club Announcement

- Auth: HTTPBearer
- Request body: ContentWorkflowActionRequest
- Parameters: `announcement_id` (path, string), `action` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/clubs/id/{club_id}/activities`

List Managed Club Activities

- Auth: HTTPBearer
- Request body: -
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/clubs/id/{club_id}/activities`

Create Club Activity

- Auth: HTTPBearer
- Request body: ClubActivityCreate
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/clubs/id/{club_id}/announcements`

List Club Announcements

- Auth: HTTPBearer
- Request body: -
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/clubs/id/{club_id}/announcements`

Create Club Announcement

- Auth: HTTPBearer
- Request body: AnnouncementCreate
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/clubs/id/{club_id}/leaders`

List Club Leaders

- Auth: HTTPBearer
- Request body: -
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/clubs/id/{club_id}/media`

List Club Media

- Auth: HTTPBearer
- Request body: -
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/clubs/id/{club_id}/media`

Attach Club Media

- Auth: HTTPBearer
- Request body: ClubMediaCreate
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/clubs/id/{club_id}/media/{link_id}`

Update Club Media

- Auth: HTTPBearer
- Request body: ClubMediaUpdate
- Parameters: `link_id` (path, string), `club_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/clubs/id/{club_id}/media/{link_id}/publication`

Set Club Media Publication

Compatibility wrapper that records publication changes through workflow logs.

- Auth: HTTPBearer
- Request body: ClubMediaPublicationUpdate
- Parameters: `link_id` (path, string), `club_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/clubs/id/{club_id}/media/{link_id}/workflow/{action}`

Transition Club Media

- Auth: HTTPBearer
- Request body: ContentWorkflowActionRequest
- Parameters: `link_id` (path, string), `club_id` (path, string), `action` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/clubs/id/{club_id}/stories`

List Club Stories

- Auth: HTTPBearer
- Request body: -
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/clubs/id/{club_id}/stories`

Create Club Story

- Auth: HTTPBearer
- Request body: BlogCreate
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/clubs/managed`

List Managed Clubs

- Auth: HTTPBearer
- Request body: -
- Parameters: `club_id` (query, string | null), `page` (query, integer), `per_page` (query, integer), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/clubs/review`

List Clubs For Review

List every club (public and hidden) for central CoCMS review.

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `club_type` (query, string | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/clubs/stories/{story_id}`

Update Club Story

- Auth: HTTPBearer
- Request body: BlogUpdate
- Parameters: `story_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/clubs/stories/{story_id}`

Delete Club Story

- Auth: HTTPBearer
- Request body: -
- Parameters: `story_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/clubs/stories/{story_id}/workflow/{action}`

Transition Club Story

- Auth: HTTPBearer
- Request body: ContentWorkflowActionRequest
- Parameters: `story_id` (path, string), `action` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/clubs/{club_id}`

Update Club

- Auth: HTTPBearer
- Request body: ClubUpdate
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/clubs/{club_id}`

Delete Club

- Auth: HTTPBearer
- Request body: -
- Parameters: `club_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/clubs/{slug}`

Get Club

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/clubs/{slug}/activities`

Get Club Activities

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/sports-facilities`

List Sports Facilities

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `campus_id` (query, string | null), `facility_type` (query, string | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/sports-facilities`

Create Sports Facility

- Auth: HTTPBearer
- Request body: SportsFacilityCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/sports-facilities/{item_id}`

Update Sports Facility

- Auth: HTTPBearer
- Request body: SportsFacilityUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/sports-facilities/{item_id}`

Delete Sports Facility

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/sports-facilities/{slug}`

Get Sports Facility

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/student-governance`

List Student Governance

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `governance_type` (query, string | null), `school_id` (query, string | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/student-governance`

Create Student Governance

- Auth: HTTPBearer
- Request body: StudentGovernanceCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/student-governance/{item_id}`

Update Student Governance

- Auth: HTTPBearer
- Request body: StudentGovernanceUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/student-governance/{item_id}`

Delete Student Governance

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/student-governance/{slug}`

Get Student Governance

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Support

### `GET /api/v1/contact-directory`

Get Public Contact Directory

- Auth: public
- Request body: -
- Parameters: `q` (query, string | null), `contact_type` (query, string | null), `scope_type` (query, string | null), `scope_id` (query, string | null), `page` (query, integer), `per_page` (query, integer)
- Success response: 200 -

### `GET /api/v1/contacts`

List Contacts

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `q` (query, string | null), `contact_type` (query, string | null), `sort` (query, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/contacts`

Create Contact

- Auth: HTTPBearer
- Request body: ContactDirectoryCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/contacts/admin`

List Admin Contacts

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_public` (query, boolean | null), `is_main` (query, boolean | null), `status` (query, string | null), `q` (query, string | null), `contact_type` (query, string | null), `sort` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/contacts/admin/{contact_id}`

Get Admin Contact

- Auth: HTTPBearer
- Request body: -
- Parameters: `contact_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/contacts/admin/{contact_id}/archive`

Archive Contact

- Auth: HTTPBearer
- Request body: -
- Parameters: `contact_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/contacts/admin/{contact_id}/unarchive`

Unarchive Contact

- Auth: HTTPBearer
- Request body: -
- Parameters: `contact_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/contacts/owners`

List Contact Owners

- Auth: HTTPBearer
- Request body: -
- Parameters: `scope_type` (query, string), `q` (query, string | null), `limit` (query, integer), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/contacts/{contact_id}`

Get Contact

- Auth: public
- Request body: -
- Parameters: `contact_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `PATCH /api/v1/contacts/{contact_id}`

Update Contact

- Auth: HTTPBearer
- Request body: ContactDirectoryUpdate
- Parameters: `contact_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/faqs`

List Faqs

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/faqs`

Create Faq

- Auth: HTTPBearer
- Request body: FAQCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/faqs/admin`

List Admin Faqs

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `search` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/faqs/admin/{faq_id}`

Get Admin Faq

- Auth: HTTPBearer
- Request body: -
- Parameters: `faq_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/faqs/{faq_id}`

Get Faq

- Auth: public
- Request body: -
- Parameters: `faq_id` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `PATCH /api/v1/faqs/{faq_id}`

Update Faq

- Auth: HTTPBearer
- Request body: FAQUpdate
- Parameters: `faq_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/faqs/{faq_id}`

Delete Faq

- Auth: HTTPBearer
- Request body: -
- Parameters: `faq_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/support/tickets`

List Tickets

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `status` (query, string | null), `mine` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/support/tickets`

Create Ticket

- Auth: HTTPBearer
- Request body: SupportTicketCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/support/tickets/{ticket_id}`

Get Ticket

- Auth: HTTPBearer
- Request body: -
- Parameters: `ticket_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/support/tickets/{ticket_id}`

Update Ticket

- Auth: HTTPBearer
- Request body: SupportTicketUpdate
- Parameters: `ticket_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

## System

### `GET /api/v1/settings`

List Public Settings

- Auth: public
- Request body: -
- Parameters: `category` (query, string | null), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `GET /api/v1/settings/public`

List Public Settings Authenticated

Public settings via API key authentication.

- Auth: public
- Request body: -
- Parameters: `category` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `X-API-Key` (header, string | null)
- Success response: 200 -

## University

### `GET /api/v1/university-info`

Get University Info

- Auth: public
- Request body: -
- Parameters: `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

### `POST /api/v1/university-info`

Create University Info

- Auth: HTTPBearer
- Request body: UniversityInfoCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/university-info/{item_id}`

Update University Info

- Auth: HTTPBearer
- Request body: UniversityInfoUpdate
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/university-info/{item_id}`

Delete University Info

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/university-info/{slug}`

Get University Info By Slug

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null)
- Success response: 200 -

## Users

### `GET /api/v1/notifications`

List Notifications

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `unread_only` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/notifications/preferences`

Get Notification Preferences

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PUT /api/v1/notifications/preferences`

Put Notification Preferences

- Auth: HTTPBearer
- Request body: NotificationPreferences
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/notifications/read-all`

Mark All Notifications Read

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/notifications/unread-count`

Unread Notification Count

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/notifications/{notification_id}`

Delete Notification

- Auth: HTTPBearer
- Request body: -
- Parameters: `notification_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/notifications/{notification_id}/archive`

Archive Notification

- Auth: HTTPBearer
- Request body: -
- Parameters: `notification_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/notifications/{notification_id}/read`

Mark Notification As Read

- Auth: HTTPBearer
- Request body: -
- Parameters: `notification_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/users`

List Users

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/users`

Create User

- Auth: HTTPBearer
- Request body: UserCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/users/{user_id}`

Get User

- Auth: HTTPBearer
- Request body: -
- Parameters: `user_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/users/{user_id}`

Update User

- Auth: HTTPBearer
- Request body: UserUpdate
- Parameters: `user_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/users/{user_id}`

Delete User

- Auth: HTTPBearer
- Request body: -
- Parameters: `user_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

## Vice Chancellor

### `GET /api/v1/public/vice-chancellor`

Get Public Hub

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 -

### `GET /api/v1/public/vice-chancellor/galleries/{slug}`

Get Public Gallery

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/public/vice-chancellor/speeches/{slug}`

Get Public Speech

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/vice-chancellor/galleries`

List Galleries

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/vice-chancellor/galleries`

Create Gallery

- Auth: HTTPBearer
- Request body: VcGalleryAlbumCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `POST /api/v1/vice-chancellor/galleries/{album_id}/media`

Attach Gallery Media

- Auth: HTTPBearer
- Request body: VcGalleryMediaCreate
- Parameters: `album_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/vice-chancellor/galleries/{album_id}/media`

List Gallery Media

- Auth: HTTPBearer
- Request body: -
- Parameters: `album_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/vice-chancellor/galleries/{album_id}/media/reorder`

Reorder Gallery Media

- Auth: HTTPBearer
- Request body: VcReorderRequest
- Parameters: `album_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/vice-chancellor/galleries/{album_id}/media/{link_id}`

Detach Gallery Media

- Auth: HTTPBearer
- Request body: -
- Parameters: `album_id` (path, string), `link_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `PATCH /api/v1/vice-chancellor/galleries/{record_id}`

Update Gallery

- Auth: HTTPBearer
- Request body: VcGalleryAlbumUpdate
- Parameters: `record_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/vice-chancellor/galleries/{record_id}`

Delete Gallery

- Auth: HTTPBearer
- Request body: -
- Parameters: `record_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/vice-chancellor/hub`

Get Hub

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/vice-chancellor/hub`

Update Hub

- Auth: HTTPBearer
- Request body: VcHubUpdate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/vice-chancellor/hub/portraits`

List Portraits

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/vice-chancellor/hub/portraits`

Attach Portrait

- Auth: HTTPBearer
- Request body: VcPortraitCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `POST /api/v1/vice-chancellor/hub/portraits/reorder`

Reorder Portraits

- Auth: HTTPBearer
- Request body: VcReorderRequest
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/vice-chancellor/hub/portraits/{portrait_id}`

Update Portrait

- Auth: HTTPBearer
- Request body: VcPortraitUpdate
- Parameters: `portrait_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/vice-chancellor/hub/portraits/{portrait_id}`

Detach Portrait

- Auth: HTTPBearer
- Request body: -
- Parameters: `portrait_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/vice-chancellor/hub/portraits/{portrait_id}/select`

Select Portrait

- Auth: HTTPBearer
- Request body: -
- Parameters: `portrait_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/vice-chancellor/hub/{action}`

Transition Hub

- Auth: HTTPBearer
- Request body: VcWorkflowAction
- Parameters: `action` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/vice-chancellor/lookups/events`

Lookup Events

- Auth: HTTPBearer
- Request body: -
- Parameters: `q` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/vice-chancellor/lookups/news`

Lookup News

- Auth: HTTPBearer
- Request body: -
- Parameters: `q` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/vice-chancellor/placements`

List Placements

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/vice-chancellor/placements`

Create Placement

- Auth: HTTPBearer
- Request body: VcHubPlacementCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `POST /api/v1/vice-chancellor/placements/reorder`

Reorder Placements

- Auth: HTTPBearer
- Request body: VcReorderRequest
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/vice-chancellor/placements/{record_id}`

Update Placement

- Auth: HTTPBearer
- Request body: VcHubPlacementUpdate
- Parameters: `record_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/vice-chancellor/placements/{record_id}`

Delete Placement

- Auth: HTTPBearer
- Request body: -
- Parameters: `record_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/vice-chancellor/speeches`

List Speeches

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/vice-chancellor/speeches`

Create Speech

- Auth: HTTPBearer
- Request body: VcSpeechCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/vice-chancellor/speeches/{record_id}`

Update Speech

- Auth: HTTPBearer
- Request body: VcSpeechUpdate
- Parameters: `record_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/vice-chancellor/speeches/{record_id}`

Delete Speech

- Auth: HTTPBearer
- Request body: -
- Parameters: `record_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/vice-chancellor/speeches/{speech_id}/videos`

Attach Speech Video

- Auth: HTTPBearer
- Request body: VcSpeechVideoCreate
- Parameters: `speech_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/vice-chancellor/speeches/{speech_id}/videos`

List Speech Videos

- Auth: HTTPBearer
- Request body: -
- Parameters: `speech_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/vice-chancellor/speeches/{speech_id}/videos/{link_id}`

Detach Speech Video

- Auth: HTTPBearer
- Request body: -
- Parameters: `speech_id` (path, string), `link_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/vice-chancellor/videos`

List Videos

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/vice-chancellor/videos`

Create Video

- Auth: HTTPBearer
- Request body: VcVideoCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `POST /api/v1/vice-chancellor/videos/youtube/preview`

Preview Youtube

- Auth: HTTPBearer
- Request body: YouTubePreviewRequest
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/vice-chancellor/videos/{record_id}`

Update Video

- Auth: HTTPBearer
- Request body: VcVideoUpdate
- Parameters: `record_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/vice-chancellor/videos/{record_id}`

Delete Video

- Auth: HTTPBearer
- Request body: -
- Parameters: `record_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/vice-chancellor/videos/{record_id}/refresh-metadata`

Refresh Video

- Auth: HTTPBearer
- Request body: -
- Parameters: `record_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/vice-chancellor/{resource}/{record_id}/{action}`

Transition Content

- Auth: HTTPBearer
- Request body: VcWorkflowAction
- Parameters: `resource` (path, string), `record_id` (path, string), `action` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

## Schemas

Generated component schemas: `256`

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

### `ArtsCultureUpdate`

- `about`: `string | null` (optional)
- `category`: `string | null` (optional)
- `club_id`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `school_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `title`: `string | null` (optional)

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

### `ClubMediaCreate`

- `display_order`: `integer` (optional)
- `media_id`: `string` (required)
- `role`: `string` (optional)

### `ClubMediaPublicationUpdate`

- `is_public`: `boolean` (required)

### `ClubMediaUpdate`

- `display_order`: `integer | null` (optional)
- `role`: `string | null` (optional)

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

### `ContentWorkflowActionRequest`

- `changed_fields`: `object | null` (optional)
- `comments`: `string | null` (optional)
- `scheduled_for`: `string | null` (optional)

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

### `DashboardAttentionItem`

- `count`: `integer` (required)
- `href`: `string` (required)
- `key`: `string` (required)
- `label`: `string` (required)
- `severity`: `string` (required)

### `DashboardDistributionItem`

- `key`: `string` (required)
- `label`: `string` (required)
- `value`: `integer` (required)

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

### `ForgotPasswordRequest`

- `email`: `string` (required)
- `frontend_service`: `string | null` (optional)

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

### `HomepageActionConfigUpdate`

- `enabled`: `boolean | null` (optional)
- `ends_at`: `string | null` (optional)
- `label`: `string | null` (optional)
- `starts_at`: `string | null` (optional)
- `url`: `string | null` (optional)

### `HomepageReportingConfigUpdate`

- `enabled`: `boolean | null` (optional)
- `ends_at`: `string | null` (optional)
- `instructions_url`: `string | null` (optional)
- `location`: `string | null` (optional)
- `starts_at`: `string | null` (optional)
- `title`: `string | null` (optional)

### `ImportCommitRequest`

- `mode`: `string` (optional)
- `rows`: `array<object>` (required)

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

### `InternalEmailPayload`

- `html_body`: `string | null` (optional)
- `subject`: `string` (required)
- `text_body`: `string` (required)
- `to_email`: `string` (required)

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

### `MediaFolderCreate`

- `description`: `string | null` (optional)
- `is_public`: `boolean` (optional)
- `name`: `string` (required)
- `parent_id`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)

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

### `MediaLinkUpdate`

- `display_order`: `integer | null` (optional)
- `entity_id`: `string | null` (optional)
- `entity_type`: `string | null` (optional)
- `folder_id`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `media_id`: `string | null` (optional)
- `role`: `string | null` (optional)

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

### `NewsletterSubscriberCreate`

- `categories`: `array<string> | null` (optional)
- `email`: `string` (required)
- `frequency`: `string` (optional)
- `name`: `string | null` (optional)

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

### `NotificationPreferences`

- `email`: `boolean` (optional)
- `in_app`: `boolean` (optional)
- `push`: `boolean` (optional)
- `sms`: `boolean` (optional)

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

### `NotificationTemplateUpdate`

- `channels`: `array<string> | null` (optional)
- `description`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `message_template`: `string | null` (optional)
- `name`: `string | null` (optional)
- `subject_template`: `string | null` (optional)
- `title_template`: `string | null` (optional)
- `variables`: `array<string> | null` (optional)

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

### `PageSectionUpdate`

- `description`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `items`: `array<SectionItemUpdate> | null` (optional)
- `layout_variant`: `string | null` (optional)
- `page_key`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `section_key`: `string | null` (optional)
- `settings`: `object | null` (optional)
- `subtitle`: `string | null` (optional)
- `title`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)

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
- `specialization`: `string | null` (optional)
- `teaching_areas`: `array<string> | null` (optional)
- `tenure_status`: `string | null` (optional)
- `title`: `string | null` (optional)
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
- `duration`: `string` (required)
- `entry_requirements`: `string | null` (optional)
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

### `ProgrammeTutorCreate`

- `is_lead`: `boolean` (optional)
- `person_id`: `string` (required)
- `role`: `string` (optional)

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

### `QualificationItem`

- `degree`: `string` (required)
- `field`: `string | null` (optional)
- `institution`: `string` (required)
- `year`: `string | integer | null` (optional)

### `RefreshRequest`

- `refresh_token`: `string` (required)

### `ReorderItem`

- `display_order`: `integer` (required)
- `id`: `string` (required)

### `ReorderRequest`

- `items`: `array<ReorderItem>` (required)

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

### `SchoolContentImportRow`

- `client_reference`: `string` (required)
- `content_type`: `string` (required)
- `data`: `object` (optional)

### `SchoolContentMetadataImport`

- `batch_id`: `string | null` (optional)
- `rows`: `array<SchoolContentImportRow>` (required)

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

### `SchoolPortalDashboardResponse`

- `activity_summary`: `DashboardActivitySummary` (required)
- `attention_items`: `array<DashboardAttentionItem>` (required)
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

### `SectionItemBatchEntry`

- `audience`: `string` (optional)
- `body_text`: `string | null` (optional)
- `content`: `object | null` (optional)
- `cta_description`: `string | null` (optional)
- `cta_label`: `string | null` (optional)
- `cta_url`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `id`: `string | null` (optional)
- `is_enabled`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `item_type`: `string` (optional)
- `media_alt_text`: `string | null` (optional)
- `media_caption`: `string | null` (optional)
- `page_section_id`: `string | null` (optional)
- `poster_media_id`: `string | null` (optional)
- `source_id`: `string | null` (optional)
- `source_type`: `string | null` (optional)
- `status`: `string | null` (optional)
- `subtitle`: `string | null` (optional)
- `title`: `string | null` (optional)
- `transcript`: `string | null` (optional)
- `video_duration_seconds`: `integer | null` (optional)
- `video_provider`: `string | null` (optional)
- `video_url`: `string | null` (optional)

### `SectionItemBatchSave`

- `items`: `array<SectionItemBatchEntry>` (optional)
- `remove_ids`: `array<string>` (optional)

### `SectionItemCreate`

- `audience`: `string` (optional)
- `body_text`: `string | null` (optional)
- `content`: `object | null` (optional)
- `cta_description`: `string | null` (optional)
- `cta_label`: `string | null` (optional)
- `cta_url`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `is_enabled`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `item_type`: `string` (optional)
- `media_alt_text`: `string | null` (optional)
- `media_caption`: `string | null` (optional)
- `page_section_id`: `string | null` (optional)
- `poster_media_id`: `string | null` (optional)
- `source_id`: `string | null` (optional)
- `source_type`: `string | null` (optional)
- `status`: `string | null` (optional)
- `subtitle`: `string | null` (optional)
- `title`: `string | null` (optional)
- `transcript`: `string | null` (optional)
- `video_duration_seconds`: `integer | null` (optional)
- `video_provider`: `string | null` (optional)
- `video_url`: `string | null` (optional)

### `SectionItemUpdate`

- `audience`: `string | null` (optional)
- `body_text`: `string | null` (optional)
- `content`: `object | null` (optional)
- `cta_description`: `string | null` (optional)
- `cta_label`: `string | null` (optional)
- `cta_url`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `is_enabled`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `item_type`: `string | null` (optional)
- `media_alt_text`: `string | null` (optional)
- `media_caption`: `string | null` (optional)
- `page_section_id`: `string | null` (optional)
- `poster_media_id`: `string | null` (optional)
- `source_id`: `string | null` (optional)
- `source_type`: `string | null` (optional)
- `status`: `string | null` (optional)
- `subtitle`: `string | null` (optional)
- `title`: `string | null` (optional)
- `transcript`: `string | null` (optional)
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

### `SocialMediaPostCreate`

- `content`: `string` (required)
- `media_ids`: `array<string> | null` (optional)
- `platforms`: `array<string>` (required)
- `scheduled_at`: `string | null` (optional)
- `source_id`: `string | null` (optional)
- `source_type`: `string` (required)
- `status`: `string` (optional)
- `title`: `string | null` (optional)

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

### `SocialPlatformAccountUpdate`

- `account_ref`: `string | null` (optional)
- `credentials`: `object | null` (optional)
- `is_active`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `settings`: `object | null` (optional)

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

### `StaffAssignmentReassign`

- `conflict_end_date`: `string | null` (optional)
- `conflict_notes`: `string | null` (optional)
- `conflict_resolution`: `string | null` (optional)
- `end_previous_date`: `string | null` (optional)
- `notes`: `string | null` (optional)
- `person_id`: `string` (required)
- `start_date`: `string | null` (optional)
- `title`: `string | null` (optional)

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

### `StoryContributorAccountRequestCreate`

- `affiliation`: `string | null` (optional)
- `contributor_type`: `string` (optional)
- `email`: `string` (required)
- `full_name`: `string` (required)
- `phone`: `string | null` (optional)
- `reason_for_request`: `string | null` (optional)

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

### `SuccessResponse_SchoolPortalDashboardResponse_`

- `data`: `SchoolPortalDashboardResponse | null` (optional)
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
- `strategic_priorities`: `array<object> | null` (optional)
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
- `strategic_priorities`: `array<object> | null` (optional)
- `vc_id`: `string | null` (optional)
- `vc_message`: `string | null` (optional)
- `vc_message_title`: `string | null` (optional)
- `vision`: `string | null` (optional)
- `website`: `string | null` (optional)

### `UserCreate`

- `avatar_url`: `string | null` (optional)
- `email`: `string` (required)
- `full_name`: `string` (required)
- `is_active`: `boolean` (optional)
- `is_verified`: `boolean` (optional)
- `mfa_enabled`: `boolean` (optional)
- `password`: `string` (required)
- `phone`: `string | null` (optional)
- `push_tokens`: `array<string> | null` (optional)

### `UserLogin`

- `email`: `string` (required)
- `password`: `string` (required)

### `UserPreferenceInput`

- `key`: `string` (required)
- `namespace`: `string` (required)
- `value`: `object` (required)

### `UserPreferencesUpdate`

- `preferences`: `array<UserPreferenceInput>` (required)

### `UserRoleAssignmentPayload`

- `expires_at`: `string | null` (optional)
- `note`: `string | null` (optional)
- `role_id`: `string` (required)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)

### `UserRolesUpdatePayload`

- `roles`: `array<UserRoleAssignmentPayload>` (optional)

### `UserUpdate`

- `avatar_url`: `string | null` (optional)
- `email`: `string | null` (optional)
- `full_name`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_verified`: `boolean | null` (optional)
- `mfa_enabled`: `boolean | null` (optional)
- `password`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `push_tokens`: `array<string> | null` (optional)

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

### `VcPortraitUpdate`

- `alt_text`: `string | null` (optional)
- `display_order`: `integer | null` (optional)

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

### `VerifyEmailRequest`

- `token`: `string` (required)

### `WebhookCreate`

- `events`: `array<string>` (required)
- `is_active`: `boolean` (optional)
- `name`: `string` (required)
- `secret`: `string | null` (optional)
- `url`: `string` (required)

### `WebhookUpdate`

- `events`: `array<string> | null` (optional)
- `failure_count`: `integer | null` (optional)
- `is_active`: `boolean | null` (optional)
- `last_status`: `integer | null` (optional)
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

### `YouTubePreviewRequest`

- `url`: `string` (required)
