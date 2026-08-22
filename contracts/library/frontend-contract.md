# KSU Library API

Library branches, resources, circulation, electronic resources, staff, and engagement API for Kisii University.

- Version: `0.1.0`
- OpenAPI: `3.1.0`

## Frontend Contract

This file is generated from the live FastAPI OpenAPI schema. Treat it as the frontend contract for request shapes, auth expectations, and response envelopes.

## Audit

### `GET /api/v1/audit`

List Audit Logs

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `user_id` (query, string | null), `resource_type` (query, string | null), `status` (query, string | null), `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 -

## Health

### `GET /api/v1/health`

Health

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 -

## Library Branches

### `GET /api/v1/library/branches/`

List Libraries

- Auth: HTTPBearer
- Request body: -
- Parameters: `active_only` (query, boolean), `page` (query, integer), `per_page` (query, integer), `include_total` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/branches/`

Create Library

- Auth: HTTPBearer
- Request body: LibraryCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/library/branches/{library_id}`

Get Library

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/library/branches/{library_id}`

Update Library

- Auth: HTTPBearer
- Request body: LibraryUpdate
- Parameters: `library_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/library/branches/{library_id}`

Delete Library

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

## Library Charges

### `GET /api/v1/library/charges/`

List Charges

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string), `active_only` (query, boolean), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/charges/`

Create Charge

- Auth: HTTPBearer
- Request body: LibraryChargeCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/library/charges/{charge_id}`

Update Charge

- Auth: HTTPBearer
- Request body: LibraryChargeUpdate
- Parameters: `charge_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/library/charges/{charge_id}`

Delete Charge

- Auth: HTTPBearer
- Request body: -
- Parameters: `charge_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

## Library External Links

### `GET /api/v1/library/branches/{library_id}/links/`

List External Links

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (path, string), `active_only` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/branches/{library_id}/links/`

Create External Link

- Auth: HTTPBearer
- Request body: LibraryExternalLinkCreate
- Parameters: `library_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/library/branches/{library_id}/links/{link_id}`

Update External Link

- Auth: HTTPBearer
- Request body: LibraryExternalLinkUpdate
- Parameters: `library_id` (path, string), `link_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/library/branches/{library_id}/links/{link_id}`

Delete External Link

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (path, string), `link_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `PATCH /api/v1/library/branches/{library_id}/links/{link_id}/toggle`

Toggle External Link

- Auth: HTTPBearer
- Request body: LibraryExternalLinkToggle
- Parameters: `library_id` (path, string), `link_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

## Library Files

### `GET /api/v1/library/branches/{library_id}/files/`

List Library Files

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/branches/{library_id}/files/`

Create Library File

- Auth: HTTPBearer
- Request body: LibraryFileCreate
- Parameters: `library_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/library/branches/{library_id}/files/{file_id}`

Delete Library File

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (path, string), `file_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

## Library Guide Sections

### `GET /api/v1/library/guide-sections/`

List Guide Sections

- Auth: HTTPBearer
- Request body: -
- Parameters: `guide_id` (query, string | null), `section_type` (query, string | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/guide-sections/`

Create Guide Section

- Auth: HTTPBearer
- Request body: LibraryGuideSectionCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/library/guide-sections/{section_id}`

Update Guide Section

- Auth: HTTPBearer
- Request body: LibraryGuideSectionUpdate
- Parameters: `section_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/library/guide-sections/{section_id}`

Delete Guide Section

- Auth: HTTPBearer
- Request body: -
- Parameters: `section_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

## Library Guides

### `GET /api/v1/library/guides/`

List Guides

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string | null), `guide_type` (query, string | null), `subject` (query, string | null), `course_code` (query, string | null), `audience` (query, string | null), `page` (query, integer), `per_page` (query, integer), `include_total` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/guides/`

Create Guide

- Auth: HTTPBearer
- Request body: LibraryGuideCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/library/guides/records/{guide_id}`

Get Guide Record

- Auth: HTTPBearer
- Request body: -
- Parameters: `guide_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/library/guides/slug/{slug}`

Get Guide By Slug

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/library/guides/{guide_id}`

Update Guide

- Auth: HTTPBearer
- Request body: LibraryGuideUpdate
- Parameters: `guide_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/library/guides/{guide_id}`

Delete Guide

- Auth: HTTPBearer
- Request body: -
- Parameters: `guide_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/library/guides/{slug}`

Get Guide

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

## Library Hours

### `PUT /api/v1/library/branches/{library_id}/hours/`

Set Library Hours

- Auth: HTTPBearer
- Request body: array<LibraryHoursCreate>
- Parameters: `library_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/library/branches/{library_id}/hours/`

Get Library Hours

- Auth: public
- Request body: -
- Parameters: `library_id` (path, string)
- Success response: 200 -

### `GET /api/v1/library/branches/{library_id}/hours/today`

Get Library Today Hours

- Auth: public
- Request body: -
- Parameters: `library_id` (path, string), `timezone` (query, string)
- Success response: 200 -

### `GET /api/v1/library/hours/today`

List Today Hours

- Auth: public
- Request body: -
- Parameters: `timezone` (query, string)
- Success response: 200 -

## Library Inquiries

### `GET /api/v1/library/inquiries/`

List Inquiries

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string | null), `status` (query, string | null), `page` (query, integer), `per_page` (query, integer), `include_total` (query, boolean), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/inquiries/`

Submit Inquiry

- Auth: HTTPBearer
- Request body: LibraryInquiryCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/library/inquiries/{inquiry_id}`

Get Inquiry

- Auth: HTTPBearer
- Request body: -
- Parameters: `inquiry_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/library/inquiries/{inquiry_id}`

Update Inquiry

- Auth: HTTPBearer
- Request body: LibraryInquiryUpdate
- Parameters: `inquiry_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/library/inquiries/{inquiry_id}`

Delete Inquiry

- Auth: HTTPBearer
- Request body: -
- Parameters: `inquiry_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `POST /api/v1/library/inquiries/{inquiry_id}/reply`

Reply To Inquiry

- Auth: HTTPBearer
- Request body: LibraryInquiryReply
- Parameters: `inquiry_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

## Library Loans

### `GET /api/v1/library/loans/`

List Loans

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string | null), `resource_id` (query, string | null), `status` (query, string | null), `page` (query, integer), `per_page` (query, integer), `include_total` (query, boolean), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/loans/`

Issue Loan

- Auth: HTTPBearer
- Request body: LibraryLoanCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/library/loans/{loan_id}`

Get Loan

- Auth: HTTPBearer
- Request body: -
- Parameters: `loan_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/library/loans/{loan_id}`

Return Loan

- Auth: HTTPBearer
- Request body: LibraryLoanUpdate
- Parameters: `loan_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/loans/{loan_id}/renew`

Renew Loan

- Auth: HTTPBearer
- Request body: -
- Parameters: `loan_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

## Library Policies

### `GET /api/v1/library/policies/`

List Policy Pages

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string | null), `policy_type` (query, string | null), `status` (query, string | null), `page` (query, integer), `per_page` (query, integer), `include_total` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/policies/`

Create Policy Page

- Auth: HTTPBearer
- Request body: LibraryPolicyPageCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/library/policies/slug/{slug}`

Get Policy By Slug

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/library/policies/{policy_id}`

Update Policy

- Auth: HTTPBearer
- Request body: LibraryPolicyPageUpdate
- Parameters: `policy_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/library/policies/{policy_id}`

Delete Policy

- Auth: HTTPBearer
- Request body: -
- Parameters: `policy_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `PATCH /api/v1/library/policies/{policy_page_id}`

Update Policy Page

- Auth: HTTPBearer
- Request body: LibraryPolicyPageUpdate
- Parameters: `policy_page_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/library/policies/{policy_page_id}`

Delete Policy Page

- Auth: HTTPBearer
- Request body: -
- Parameters: `policy_page_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/library/policies/{slug}`

Get Policy Page

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

## Library Regulations

### `GET /api/v1/library/regulations/`

List Regulations

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string | null), `category` (query, string | null), `status` (query, string | null), `page` (query, integer), `per_page` (query, integer), `include_total` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/regulations/`

Create Regulation

- Auth: HTTPBearer
- Request body: LibraryRegulationCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/library/regulations/{regulation_id}`

Get Regulation

- Auth: HTTPBearer
- Request body: -
- Parameters: `regulation_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/library/regulations/{regulation_id}`

Update Regulation

- Auth: HTTPBearer
- Request body: LibraryRegulationUpdate
- Parameters: `regulation_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/library/regulations/{regulation_id}`

Delete Regulation

- Auth: HTTPBearer
- Request body: -
- Parameters: `regulation_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

## Library Reservations

### `GET /api/v1/library/reservations/`

List Reservations

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string | null), `resource_id` (query, string | null), `status` (query, string | null), `page` (query, integer), `per_page` (query, integer), `include_total` (query, boolean), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/reservations/`

Create Reservation

- Auth: HTTPBearer
- Request body: LibraryReservationCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/library/reservations/{reservation_id}`

Update Reservation

- Auth: HTTPBearer
- Request body: LibraryReservationUpdate
- Parameters: `reservation_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/library/reservations/{reservation_id}`

Cancel Reservation

- Auth: HTTPBearer
- Request body: -
- Parameters: `reservation_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

## Library Resources

### `GET /api/v1/library/resources/`

List Resources

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string), `resource_type` (query, string | null), `status` (query, string | null), `q` (query, string | null), `page` (query, integer), `per_page` (query, integer), `include_total` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/resources/`

Create Resource

- Auth: HTTPBearer
- Request body: LibraryResourceCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/library/resources/{resource_id}`

Get Resource

- Auth: HTTPBearer
- Request body: -
- Parameters: `resource_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/library/resources/{resource_id}`

Update Resource

- Auth: HTTPBearer
- Request body: LibraryResourceUpdate
- Parameters: `resource_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/library/resources/{resource_id}`

Delete Resource

- Auth: HTTPBearer
- Request body: -
- Parameters: `resource_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

## Library Search

### `GET /api/v1/library/search`

Search Library

- Auth: public
- Request body: -
- Parameters: `q` (query, string), `types` (query, string | null), `library_id` (query, string | null), `limit` (query, integer)
- Success response: 200 -

## Library Services

### `GET /api/v1/library/services/`

List Services

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/services/`

Create Service

- Auth: HTTPBearer
- Request body: LibraryServiceCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/library/services/{service_id}`

Update Service

- Auth: HTTPBearer
- Request body: LibraryServiceUpdate
- Parameters: `service_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/library/services/{service_id}`

Delete Service

- Auth: HTTPBearer
- Request body: -
- Parameters: `service_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

## Library Specialists

### `GET /api/v1/library/specialists/`

List Specialists

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string | null), `subject` (query, string | null), `school` (query, string | null), `department` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/specialists/`

Create Specialist

- Auth: HTTPBearer
- Request body: LibrarySpecialistCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/library/specialists/{specialist_id}`

Update Specialist

- Auth: HTTPBearer
- Request body: LibrarySpecialistUpdate
- Parameters: `specialist_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/library/specialists/{specialist_id}`

Delete Specialist

- Auth: HTTPBearer
- Request body: -
- Parameters: `specialist_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

## Library Staff

### `GET /api/v1/library/staff/`

List Staff

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/staff/`

Create Staff

- Auth: HTTPBearer
- Request body: LibraryStaffCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/library/staff/leadership`

List Library Leadership

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/library/staff/{staff_id}`

Update Staff

- Auth: HTTPBearer
- Request body: LibraryStaffUpdate
- Parameters: `staff_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/library/staff/{staff_id}`

Delete Staff

- Auth: HTTPBearer
- Request body: -
- Parameters: `staff_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

## Library Statistics

### `GET /api/v1/library/statistics/`

List Statistics

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string), `period_type` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/statistics/`

Create Statistics

- Auth: HTTPBearer
- Request body: LibraryStatisticsCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

## Library Support Tickets

### `GET /api/v1/library/tickets/`

List Tickets

- Auth: HTTPBearer
- Request body: -
- Parameters: `status` (query, string | null), `category` (query, string | null), `assigned_to` (query, string | null), `page` (query, integer), `per_page` (query, integer), `include_total` (query, boolean), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/tickets/`

Create Ticket

- Auth: HTTPBearer
- Request body: SupportTicketCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/library/tickets/{ticket_id}`

Get Ticket

- Auth: HTTPBearer
- Request body: -
- Parameters: `ticket_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/library/tickets/{ticket_id}`

Update Ticket

- Auth: HTTPBearer
- Request body: SupportTicketUpdate
- Parameters: `ticket_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/library/tickets/{ticket_id}`

Delete Ticket

- Auth: HTTPBearer
- Request body: -
- Parameters: `ticket_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

## Library Workflow Steps

### `GET /api/v1/library/workflow-steps/`

List Workflow Steps

- Auth: HTTPBearer
- Request body: -
- Parameters: `workflow_id` (query, string | null), `is_active` (query, boolean | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/workflow-steps/`

Create Workflow Step

- Auth: HTTPBearer
- Request body: LibraryWorkflowStepCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/library/workflow-steps/{step_id}`

Update Workflow Step

- Auth: HTTPBearer
- Request body: LibraryWorkflowStepUpdate
- Parameters: `step_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/library/workflow-steps/{step_id}`

Delete Workflow Step

- Auth: HTTPBearer
- Request body: -
- Parameters: `step_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

## Library Workflows

### `GET /api/v1/library/workflows/`

List Workflows

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string | null), `workflow_type` (query, string | null), `audience` (query, string | null), `page` (query, integer), `per_page` (query, integer), `include_total` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/workflows/`

Create Workflow

- Auth: HTTPBearer
- Request body: LibraryWorkflowCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/library/workflows/records/{workflow_id}`

Get Workflow Record

- Auth: HTTPBearer
- Request body: -
- Parameters: `workflow_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/library/workflows/slug/{slug}`

Get Workflow By Slug

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/library/workflows/{slug}`

Get Workflow

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/library/workflows/{workflow_id}`

Update Workflow

- Auth: HTTPBearer
- Request body: LibraryWorkflowUpdate
- Parameters: `workflow_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/library/workflows/{workflow_id}`

Delete Workflow

- Auth: HTTPBearer
- Request body: -
- Parameters: `workflow_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

## Library – Electronic Resource Guides

### `GET /api/v1/library/databases/{resource_id}/guides/`

List Guides Route

List guides for an electronic resource.

- Auth: public
- Request body: -
- Parameters: `resource_id` (path, string)
- Success response: 200 -

### `POST /api/v1/library/databases/{resource_id}/guides/`

Create Guide Route

Create a guide for an electronic resource.

- Auth: HTTPBearer
- Request body: ElectronicResourceGuideCreate
- Parameters: `resource_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/library/databases/{resource_id}/guides/{guide_id}`

Update Guide Route

Update an electronic resource guide.

- Auth: HTTPBearer
- Request body: ElectronicResourceGuideUpdate
- Parameters: `resource_id` (path, string), `guide_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/library/databases/{resource_id}/guides/{guide_id}`

Delete Guide Route

Delete an electronic resource guide.

- Auth: HTTPBearer
- Request body: -
- Parameters: `resource_id` (path, string), `guide_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

## Library – Electronic Resources

### `GET /api/v1/library/databases/`

List Resources Route

List electronic resources with filtering.

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string | null), `section_letter` (query, string | null), `resource_type` (query, string | null), `access_level` (query, string | null), `featured` (query, boolean | null), `q` (query, string | null), `page` (query, integer), `per_page` (query, integer), `include_total` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/databases/`

Create Resource Route

Create a new electronic resource.

- Auth: HTTPBearer
- Request body: ElectronicResourceCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `GET /api/v1/library/databases/az`

List Resources Az

Get all electronic resources grouped by first letter (A-Z listing).

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 -

### `GET /api/v1/library/databases/slug/{slug}`

Get Resource By Slug Route

Get electronic resource by slug with guides.

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/library/databases/{resource_id}`

Get Resource Detail

Get electronic resource by ID with guides.

- Auth: HTTPBearer
- Request body: -
- Parameters: `resource_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `PATCH /api/v1/library/databases/{resource_id}`

Update Resource Route

Update an electronic resource.

- Auth: HTTPBearer
- Request body: ElectronicResourceUpdate
- Parameters: `resource_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/library/databases/{resource_id}`

Delete Resource Route

Delete an electronic resource.

- Auth: HTTPBearer
- Request body: -
- Parameters: `resource_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

## Library – Publications

### `POST /api/v1/library/publications/cite`

Cite Publication

Format a publication citation in various styles (APA, MLA, Chicago, etc.).

- Auth: public
- Request body: CitationRequest
- Parameters: -
- Success response: 200 -

### `GET /api/v1/library/publications/saved`

List Saved Publications

List user's saved publications.

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `include_total` (query, boolean), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `POST /api/v1/library/publications/saved`

Save Publication Route

Save a publication to user's reading list.

- Auth: HTTPBearer
- Request body: SavedPublicationCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 -

### `PATCH /api/v1/library/publications/saved/{saved_id}`

Update Saved Publication

Update a saved publication (notes, reading status).

- Auth: HTTPBearer
- Request body: SavedPublicationUpdate
- Parameters: `saved_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 -

### `DELETE /api/v1/library/publications/saved/{saved_id}`

Unsave Publication Route

Remove a publication from user's saved list.

- Auth: HTTPBearer
- Request body: -
- Parameters: `saved_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 204 No Content

### `GET /api/v1/library/publications/search`

Search Publications Route

Search external publication databases (CrossRef, PubMed, etc.).

- Auth: public
- Request body: -
- Parameters: `q` (query, string), `author` (query, string | null), `year` (query, integer | null), `source` (query, string | null), `page` (query, integer), `per_page` (query, integer)
- Success response: 200 -

## Stats

### `GET /api/v1/library/stats`

Get Public Stats

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 -

### `GET /api/v1/library/stats/admin`

Get Admin Stats

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 -

### `GET /api/v1/library/stats/internal/admin`

Get Internal Admin Stats

Return admin counters to an authenticated sibling service.

- Auth: public
- Request body: -
- Parameters: `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 -

## Schemas

Generated component schemas: `49`

### `CitationRequest`

- `publication`: `PublicationResult` (required)
- `style`: `string` (optional)

### `ElectronicResourceCreate`

- `access_level`: `string` (optional)
- `access_type`: `string` (optional)
- `access_url`: `string` (required)
- `coverage_dates`: `string | null` (optional)
- `description`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_featured`: `boolean` (optional)
- `library_id`: `string | null` (optional)
- `logo_image_id`: `string | null` (optional)
- `name`: `string` (required)
- `notes`: `string | null` (optional)
- `provider`: `string | null` (optional)
- `requires_registration`: `boolean` (optional)
- `requires_vpn`: `boolean` (optional)
- `resource_type`: `string` (optional)
- `section_letter`: `string` (required)
- `simultaneous_users`: `string | null` (optional)
- `slug`: `string` (required)
- `sort_order`: `integer` (optional)
- `subjects`: `array<string> | null` (optional)

### `ElectronicResourceGuideCreate`

- `access_steps`: `array<object> | null` (optional)
- `guide_type`: `string` (optional)
- `is_active`: `boolean` (optional)
- `media_id`: `string | null` (optional)
- `recommended_subjects`: `array<string> | null` (optional)
- `search_tips`: `string | null` (optional)
- `sort_order`: `integer` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)

### `ElectronicResourceGuideUpdate`

- `access_steps`: `array<object> | null` (optional)
- `guide_type`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `media_id`: `string | null` (optional)
- `recommended_subjects`: `array<string> | null` (optional)
- `search_tips`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)

### `ElectronicResourceUpdate`

- `access_level`: `string | null` (optional)
- `access_type`: `string | null` (optional)
- `access_url`: `string | null` (optional)
- `coverage_dates`: `string | null` (optional)
- `description`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `library_id`: `string | null` (optional)
- `logo_image_id`: `string | null` (optional)
- `name`: `string | null` (optional)
- `notes`: `string | null` (optional)
- `provider`: `string | null` (optional)
- `requires_registration`: `boolean | null` (optional)
- `requires_vpn`: `boolean | null` (optional)
- `resource_type`: `string | null` (optional)
- `section_letter`: `string | null` (optional)
- `simultaneous_users`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)
- `subjects`: `array<string> | null` (optional)

### `HTTPValidationError`

- `detail`: `array<ValidationError>` (optional)

### `LibraryChargeCreate`

- `amount`: `number | string` (required)
- `charge_type`: `string` (required)
- `currency`: `string` (optional)
- `description`: `string | null` (optional)
- `effective_from`: `string | null` (optional)
- `effective_to`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `library_id`: `string` (required)
- `name`: `string` (required)
- `rate_unit`: `string` (optional)

### `LibraryChargeUpdate`

- `amount`: `number | string | null` (optional)
- `description`: `string | null` (optional)
- `effective_from`: `string | null` (optional)
- `effective_to`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `rate_unit`: `string | null` (optional)

### `LibraryCreate`

- `address`: `string | null` (optional)
- `borrowing_policy_id`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `email`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `latitude`: `number | null` (optional)
- `library_type`: `string` (optional)
- `longitude`: `number | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string` (required)
- `objectives`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `regulations`: `string | null` (optional)
- `short_name`: `string | null` (optional)
- `slug`: `string` (required)
- `sort_order`: `integer` (optional)
- `vision`: `string | null` (optional)
- `website_url`: `string | null` (optional)

### `LibraryExternalLinkCreate`

- `description`: `string | null` (optional)
- `icon`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `label`: `string` (required)
- `link_type`: `string` (required)
- `opens_in_new_tab`: `boolean` (optional)
- `sort_order`: `integer` (optional)
- `url`: `string` (required)

### `LibraryExternalLinkToggle`

- `is_active`: `boolean` (required)

### `LibraryExternalLinkUpdate`

- `description`: `string | null` (optional)
- `icon`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `label`: `string | null` (optional)
- `link_type`: `string | null` (optional)
- `opens_in_new_tab`: `boolean | null` (optional)
- `sort_order`: `integer | null` (optional)
- `url`: `string | null` (optional)

### `LibraryFileCreate`

- `access_level`: `string` (optional)
- `description`: `string | null` (optional)
- `file_category`: `string` (optional)
- `is_public`: `boolean` (optional)
- `media_id`: `string` (required)
- `related_entity_id`: `string | null` (optional)
- `related_entity_type`: `string | null` (optional)
- `sort_order`: `integer` (optional)
- `title`: `string` (required)

### `LibraryGuideCreate`

- `audience`: `string | null` (optional)
- `course_code`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `guide_type`: `string` (required)
- `is_active`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `library_id`: `string | null` (optional)
- `owner_staff_id`: `string | null` (optional)
- `school_id`: `string | null` (optional)
- `slug`: `string` (required)
- `sort_order`: `integer` (optional)
- `subject`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)

### `LibraryGuideSectionCreate`

- `content`: `string` (required)
- `file_ids`: `array<string> | null` (optional)
- `guide_id`: `string | null` (optional)
- `heading`: `string` (required)
- `is_active`: `boolean` (optional)
- `resource_links`: `array<object> | null` (optional)
- `section_type`: `string` (optional)
- `sort_order`: `integer` (optional)

### `LibraryGuideSectionUpdate`

- `content`: `string | null` (optional)
- `file_ids`: `array<string> | null` (optional)
- `guide_id`: `string | null` (optional)
- `heading`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `resource_links`: `array<object> | null` (optional)
- `section_type`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)

### `LibraryGuideUpdate`

- `audience`: `string | null` (optional)
- `course_code`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `guide_type`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `library_id`: `string | null` (optional)
- `owner_staff_id`: `string | null` (optional)
- `school_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)
- `subject`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)

### `LibraryHoursCreate`

- `closes_at`: `string | null` (optional)
- `day_type`: `string` (required)
- `is_closed`: `boolean` (optional)
- `note`: `string | null` (optional)
- `opens_at`: `string | null` (optional)

### `LibraryInquiryCreate`

- `library_id`: `string | null` (optional)
- `message`: `string` (required)
- `sender_email`: `string` (required)
- `sender_name`: `string` (required)
- `sender_phone`: `string | null` (optional)
- `subject`: `string` (required)

### `LibraryInquiryReply`

- `reply_message`: `string` (required)

### `LibraryInquiryUpdate`

- `status`: `string | null` (optional)

### `LibraryLoanCreate`

- `borrowed_at`: `string` (required)
- `borrower_person_id`: `string` (required)
- `due_at`: `string` (required)
- `issued_by_staff_id`: `string | null` (optional)
- `max_renewals`: `integer` (optional)
- `notes`: `string | null` (optional)
- `resource_id`: `string` (required)

### `LibraryLoanUpdate`

- `fine_amount`: `number | string | null` (optional)
- `fine_paid`: `boolean | null` (optional)
- `fine_paid_at`: `string | null` (optional)
- `notes`: `string | null` (optional)
- `returned_at`: `string | null` (optional)
- `returned_to_staff_id`: `string | null` (optional)
- `status`: `string | null` (optional)

### `LibraryPolicyPageCreate`

- `content`: `string` (required)
- `file_id`: `string | null` (optional)
- `is_public`: `boolean` (optional)
- `library_id`: `string | null` (optional)
- `policy_type`: `string` (required)
- `related_regulation_id`: `string | null` (optional)
- `slug`: `string` (required)
- `sort_order`: `integer` (optional)
- `status`: `string` (optional)
- `title`: `string` (required)

### `LibraryPolicyPageUpdate`

- `content`: `string | null` (optional)
- `file_id`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `library_id`: `string | null` (optional)
- `policy_type`: `string | null` (optional)
- `related_regulation_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)
- `status`: `string | null` (optional)
- `title`: `string | null` (optional)

### `LibraryRegulationCreate`

- `category`: `string | null` (optional)
- `content`: `string` (required)
- `document_id`: `string | null` (optional)
- `effective_date`: `string | null` (optional)
- `is_public`: `boolean` (optional)
- `library_id`: `string | null` (optional)
- `status`: `string` (optional)
- `title`: `string` (required)

### `LibraryRegulationUpdate`

- `category`: `string | null` (optional)
- `content`: `string | null` (optional)
- `document_id`: `string | null` (optional)
- `effective_date`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `status`: `string | null` (optional)
- `title`: `string | null` (optional)

### `LibraryReservationCreate`

- `notes`: `string | null` (optional)
- `requester_person_id`: `string` (required)
- `resource_id`: `string` (required)

### `LibraryReservationUpdate`

- `expires_at`: `string | null` (optional)
- `notes`: `string | null` (optional)
- `queue_position`: `integer | null` (optional)
- `ready_at`: `string | null` (optional)
- `status`: `string | null` (optional)

### `LibraryResourceCreate`

- `authors`: `string | null` (optional)
- `available_copies`: `integer` (optional)
- `barcode`: `string | null` (optional)
- `call_number`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `default_loan_days`: `integer | null` (optional)
- `description`: `string | null` (optional)
- `edition`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_loanable`: `boolean` (optional)
- `is_reference_only`: `boolean` (optional)
- `isbn`: `string | null` (optional)
- `issn`: `string | null` (optional)
- `language`: `string` (optional)
- `library_id`: `string` (required)
- `location_shelf`: `string | null` (optional)
- `publication_year`: `integer | null` (optional)
- `publisher`: `string | null` (optional)
- `resource_type`: `string` (optional)
- `status`: `string` (optional)
- `subject_tags`: `array<string> | null` (optional)
- `subtitle`: `string | null` (optional)
- `table_of_contents`: `string | null` (optional)
- `title`: `string` (required)
- `total_copies`: `integer` (optional)

### `LibraryResourceUpdate`

- `authors`: `string | null` (optional)
- `available_copies`: `integer | null` (optional)
- `barcode`: `string | null` (optional)
- `call_number`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `default_loan_days`: `integer | null` (optional)
- `description`: `string | null` (optional)
- `edition`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_loanable`: `boolean | null` (optional)
- `is_reference_only`: `boolean | null` (optional)
- `isbn`: `string | null` (optional)
- `issn`: `string | null` (optional)
- `language`: `string | null` (optional)
- `location_shelf`: `string | null` (optional)
- `publication_year`: `integer | null` (optional)
- `publisher`: `string | null` (optional)
- `resource_type`: `string | null` (optional)
- `status`: `string | null` (optional)
- `subject_tags`: `array<string> | null` (optional)
- `subtitle`: `string | null` (optional)
- `title`: `string | null` (optional)
- `total_copies`: `integer | null` (optional)

### `LibraryServiceCreate`

- `contact_info`: `string | null` (optional)
- `description`: `string | null` (optional)
- `eligibility`: `string | null` (optional)
- `how_to_access`: `string | null` (optional)
- `icon_media_id`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `library_id`: `string` (required)
- `name`: `string` (required)
- `service_type`: `string` (optional)
- `slug`: `string` (required)
- `sort_order`: `integer` (optional)

### `LibraryServiceUpdate`

- `contact_info`: `string | null` (optional)
- `description`: `string | null` (optional)
- `eligibility`: `string | null` (optional)
- `how_to_access`: `string | null` (optional)
- `icon_media_id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `name`: `string | null` (optional)
- `service_type`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)

### `LibrarySpecialistCreate`

- `booking_url`: `string | null` (optional)
- `departments`: `array<string>` (optional)
- `is_active`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `library_id`: `string | null` (optional)
- `schools`: `array<string>` (optional)
- `sort_order`: `integer` (optional)
- `staff_id`: `string` (required)
- `subjects`: `array<string>` (optional)
- `support_areas`: `array<string>` (optional)

### `LibrarySpecialistUpdate`

- `booking_url`: `string | null` (optional)
- `departments`: `array<string> | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `library_id`: `string | null` (optional)
- `schools`: `array<string> | null` (optional)
- `sort_order`: `integer | null` (optional)
- `staff_id`: `string | null` (optional)
- `subjects`: `array<string> | null` (optional)
- `support_areas`: `array<string> | null` (optional)

### `LibraryStaffCreate`

- `bio`: `string | null` (optional)
- `department`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `job_title`: `string | null` (optional)
- `library_id`: `string` (required)
- `person_id`: `string` (required)
- `role`: `string` (optional)
- `sort_order`: `integer` (optional)
- `specialization`: `string | null` (optional)

### `LibraryStaffUpdate`

- `bio`: `string | null` (optional)
- `department`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `job_title`: `string | null` (optional)
- `role`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)
- `specialization`: `string | null` (optional)

### `LibraryStatisticsCreate`

- `currency`: `string` (optional)
- `extra`: `object | null` (optional)
- `fines_collected`: `number | string | null` (optional)
- `library_id`: `string` (required)
- `notes`: `string | null` (optional)
- `period_end`: `string` (required)
- `period_start`: `string` (required)
- `period_type`: `string` (optional)
- `total_books`: `integer | null` (optional)
- `total_ebooks`: `integer | null` (optional)
- `total_journals`: `integer | null` (optional)
- `total_loans`: `integer | null` (optional)
- `total_renewals`: `integer | null` (optional)
- `total_reservations`: `integer | null` (optional)
- `total_theses`: `integer | null` (optional)
- `total_visits`: `integer | null` (optional)

### `LibraryUpdate`

- `address`: `string | null` (optional)
- `borrowing_policy_id`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `email`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `latitude`: `number | null` (optional)
- `library_type`: `string | null` (optional)
- `longitude`: `number | null` (optional)
- `mission`: `string | null` (optional)
- `name`: `string | null` (optional)
- `objectives`: `string | null` (optional)
- `phone`: `string | null` (optional)
- `regulations`: `string | null` (optional)
- `short_name`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)
- `vision`: `string | null` (optional)
- `website_url`: `string | null` (optional)

### `LibraryWorkflowCreate`

- `audience`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `library_id`: `string | null` (optional)
- `slug`: `string` (required)
- `sort_order`: `integer` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)
- `workflow_type`: `string` (required)

### `LibraryWorkflowStepCreate`

- `file_id`: `string | null` (optional)
- `instructions`: `string` (required)
- `is_active`: `boolean` (optional)
- `link_url`: `string | null` (optional)
- `sort_order`: `integer` (optional)
- `title`: `string` (required)
- `workflow_id`: `string | null` (optional)

### `LibraryWorkflowStepUpdate`

- `file_id`: `string | null` (optional)
- `instructions`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `link_url`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)
- `title`: `string | null` (optional)
- `workflow_id`: `string | null` (optional)

### `LibraryWorkflowUpdate`

- `audience`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `library_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `workflow_type`: `string | null` (optional)

### `PublicationResult`

- `abstract`: `string | null` (optional)
- `authors`: `array<string>` (optional)
- `doi`: `string | null` (optional)
- `external_id`: `string | null` (optional)
- `internal_publication_id`: `string | null` (optional)
- `is_open_access`: `boolean | null` (optional)
- `journal`: `string | null` (optional)
- `source`: `string` (required)
- `title`: `string` (required)
- `url`: `string | null` (optional)
- `year`: `integer | null` (optional)

### `SavedPublicationCreate`

- `cached_metadata`: `object | null` (optional)
- `external_id`: `string | null` (optional)
- `internal_publication_id`: `string | null` (optional)
- `notes`: `string | null` (optional)
- `reading_status`: `string` (optional)
- `source`: `string` (required)

### `SavedPublicationUpdate`

- `cached_metadata`: `object | null` (optional)
- `notes`: `string | null` (optional)
- `reading_status`: `string | null` (optional)

### `SupportTicketCreate`

- `category`: `string` (optional)
- `description`: `string` (required)
- `priority`: `string` (optional)
- `requester_email`: `string | null` (optional)
- `requester_name`: `string | null` (optional)
- `subject`: `string` (required)
- `target_entity_id`: `string | null` (optional)
- `target_entity_type`: `string | null` (optional)

### `SupportTicketUpdate`

- `assigned_to_person_id`: `string | null` (optional)
- `meta`: `object | null` (optional)
- `priority`: `string | null` (optional)
- `resolution_notes`: `string | null` (optional)
- `resolved_at`: `string | null` (optional)
- `status`: `string | null` (optional)

### `ValidationError`

- `ctx`: `object` (optional)
- `input`: `object` (optional)
- `loc`: `array<string | integer>` (required)
- `msg`: `string` (required)
- `type`: `string` (required)
