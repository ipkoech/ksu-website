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
- Success response: 200 AuditProxyResponse

## Health

### `GET /api/v1/health`

Health

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 SuccessResponse_HealthPayload_

## Library Assistant Chat

### `POST /api/v1/library/assistant/answer`

Answer Question

- Auth: public
- Request body: LibraryAssistantAnswerRequest
- Parameters: `ksu_library_guest_session` (cookie, string | null), `ksu_library_conversation` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryAssistantAnswer_

### `GET /api/v1/library/assistant/conversations`

List Conversations

- Auth: public
- Request body: -
- Parameters: `ksu_library_conversation` (cookie, string | null)
- Success response: 200 SuccessResponse_list_LibraryAssistantConversationOut__

### `GET /api/v1/library/assistant/conversations/{conversation_id}`

Get Conversation

- Auth: public
- Request body: -
- Parameters: `conversation_id` (path, string), `ksu_library_conversation` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryAssistantConversationOut_

### `POST /api/v1/library/assistant/conversations/{conversation_id}/continue`

Continue Conversation

- Auth: public
- Request body: LibraryAssistantAnswerRequest
- Parameters: `conversation_id` (path, string), `ksu_library_conversation` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryAssistantAnswer_

### `GET /api/v1/library/assistant/conversations/{conversation_id}/messages`

List Messages

- Auth: public
- Request body: -
- Parameters: `conversation_id` (path, string), `ksu_library_conversation` (cookie, string | null)
- Success response: 200 SuccessResponse_list_LibraryAssistantMessageOut__

## Library Assistant Contexts

### `GET /api/v1/library/assistant-contexts/`

List Contexts

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string | null), `status` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_list_LibraryAssistantContextOut__

### `POST /api/v1/library/assistant-contexts/`

Create Context

- Auth: HTTPBearer
- Request body: LibraryAssistantContextCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryAssistantContextOut_

### `GET /api/v1/library/assistant-contexts/public`

List Public Contexts

- Auth: public
- Request body: -
- Parameters: `library_id` (query, string | null)
- Success response: 200 SuccessResponse_list_LibraryAssistantContextPublicOut__

### `GET /api/v1/library/assistant-contexts/{context_id}`

Get Context

- Auth: HTTPBearer
- Request body: -
- Parameters: `context_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryAssistantContextOut_

### `PATCH /api/v1/library/assistant-contexts/{context_id}`

Update Context

- Auth: HTTPBearer
- Request body: LibraryAssistantContextUpdate
- Parameters: `context_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryAssistantContextOut_

### `POST /api/v1/library/assistant-contexts/{context_id}/archive`

Archive Context

- Auth: HTTPBearer
- Request body: -
- Parameters: `context_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryAssistantContextOut_

### `POST /api/v1/library/assistant-contexts/{context_id}/publish`

Publish Context

- Auth: HTTPBearer
- Request body: -
- Parameters: `context_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryAssistantContextOut_

## Library Assistant Identity

### `POST /api/v1/library/assistant/guest/session`

Create Guest Session

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 SuccessResponse_LibraryAssistantGuestSessionOut_

### `POST /api/v1/library/assistant/verification/confirm`

Confirm Verification

- Auth: public
- Request body: LibraryAssistantVerificationConfirm
- Parameters: `ksu_library_guest_session` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryAssistantVerificationResponse_

### `GET /api/v1/library/assistant/verification/confirm`

Confirm Verification Link

- Auth: public
- Request body: -
- Parameters: `token` (query, string), `ksu_library_guest_session` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryAssistantVerificationResponse_

### `POST /api/v1/library/assistant/verification/request`

Request Verification

- Auth: public
- Request body: LibraryAssistantVerificationRequest
- Parameters: `ksu_library_guest_session` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryAssistantVerificationResponse_

### `POST /api/v1/library/assistant/verification/resend`

Resend Verification

- Auth: public
- Request body: LibraryAssistantVerificationRequest
- Parameters: `ksu_library_guest_session` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryAssistantVerificationResponse_

## Library Assistant Recovery

### `GET /api/v1/library/assistant/recovery/confirm`

Confirm Recovery

- Auth: public
- Request body: -
- Parameters: `token` (query, string)
- Success response: 200 SuccessResponse_LibraryAssistantRecoveryOut_

## Library Assistant Staff

### `GET /api/v1/library/assistant/staff/conversations`

List Conversations

- Auth: HTTPBearer
- Request body: -
- Parameters: `status` (query, string | null), `context_id` (query, string | null), `assigned_to` (query, string | null), `page` (query, integer), `per_page` (query, integer), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_list_LibraryAssistantConversationOut__

### `GET /api/v1/library/assistant/staff/conversations/{conversation_id}`

Get Conversation

- Auth: HTTPBearer
- Request body: -
- Parameters: `conversation_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryAssistantConversationOut_

### `POST /api/v1/library/assistant/staff/conversations/{conversation_id}/assign`

Assign Conversation

- Auth: HTTPBearer
- Request body: LibraryAssistantStaffAssignmentUpdate
- Parameters: `conversation_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryAssistantConversationOut_

### `POST /api/v1/library/assistant/staff/conversations/{conversation_id}/reply`

Reply To Conversation

- Auth: HTTPBearer
- Request body: LibraryAssistantStaffReplyCreate
- Parameters: `conversation_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryAssistantConversationOut_

### `PATCH /api/v1/library/assistant/staff/conversations/{conversation_id}/status`

Update Status

- Auth: HTTPBearer
- Request body: LibraryAssistantStaffStatusUpdate
- Parameters: `conversation_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryAssistantConversationOut_

## Library Branches

### `GET /api/v1/library/branches/`

List Libraries

- Auth: HTTPBearer
- Request body: -
- Parameters: `active_only` (query, boolean), `page` (query, integer), `per_page` (query, integer), `include_total` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_list_LibraryOutSnapshot__

### `POST /api/v1/library/branches/`

Create Library

- Auth: HTTPBearer
- Request body: LibraryCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryOut_

### `GET /api/v1/library/branches/{library_id}`

Get Library

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryOutSnapshot_

### `PATCH /api/v1/library/branches/{library_id}`

Update Library

- Auth: HTTPBearer
- Request body: LibraryUpdate
- Parameters: `library_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryOut_

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
- Success response: 200 SuccessResponse_list_LibraryChargeOut__

### `POST /api/v1/library/charges/`

Create Charge

- Auth: HTTPBearer
- Request body: LibraryChargeCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryChargeOut_

### `PATCH /api/v1/library/charges/{charge_id}`

Update Charge

- Auth: HTTPBearer
- Request body: LibraryChargeUpdate
- Parameters: `charge_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryChargeOut_

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
- Success response: 200 SuccessResponse_list_LibraryExternalLinkSnapshot__

### `POST /api/v1/library/branches/{library_id}/links/`

Create External Link

- Auth: HTTPBearer
- Request body: LibraryExternalLinkCreate
- Parameters: `library_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryExternalLinkOut_

### `PATCH /api/v1/library/branches/{library_id}/links/{link_id}`

Update External Link

- Auth: HTTPBearer
- Request body: LibraryExternalLinkUpdate
- Parameters: `library_id` (path, string), `link_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryExternalLinkOut_

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
- Success response: 200 SuccessResponse_LibraryExternalLinkOut_

## Library Files

### `GET /api/v1/library/branches/{library_id}/files/`

List Library Files

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_list_LibraryFileSnapshot__

### `POST /api/v1/library/branches/{library_id}/files/`

Create Library File

- Auth: HTTPBearer
- Request body: LibraryFileCreate
- Parameters: `library_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryFileOut_

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
- Success response: 200 SuccessResponse_list_LibraryGuideSectionSnapshot__

### `POST /api/v1/library/guide-sections/`

Create Guide Section

- Auth: HTTPBearer
- Request body: LibraryGuideSectionCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 SuccessResponse_LibraryGuideSectionOut_

### `PATCH /api/v1/library/guide-sections/{section_id}`

Update Guide Section

- Auth: HTTPBearer
- Request body: LibraryGuideSectionUpdate
- Parameters: `section_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryGuideSectionOut_

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
- Success response: 200 SuccessResponse_list_LibraryGuideSnapshot__

### `POST /api/v1/library/guides/`

Create Guide

- Auth: HTTPBearer
- Request body: LibraryGuideCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryGuideOut_

### `GET /api/v1/library/guides/records/{guide_id}`

Get Guide Record

- Auth: HTTPBearer
- Request body: -
- Parameters: `guide_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryGuideSnapshot_

### `GET /api/v1/library/guides/slug/{slug}`

Get Guide By Slug

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryGuideSnapshot_

### `PATCH /api/v1/library/guides/{guide_id}`

Update Guide

- Auth: HTTPBearer
- Request body: LibraryGuideUpdate
- Parameters: `guide_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryGuideOut_

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
- Success response: 200 SuccessResponse_LibraryGuideSnapshot_

## Library Hours

### `PUT /api/v1/library/branches/{library_id}/hours/`

Set Library Hours

- Auth: HTTPBearer
- Request body: array<LibraryHoursCreate>
- Parameters: `library_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_list_LibraryHoursOut__

### `GET /api/v1/library/branches/{library_id}/hours/`

Get Library Hours

- Auth: public
- Request body: -
- Parameters: `library_id` (path, string)
- Success response: 200 SuccessResponse_list_LibraryHoursOut__

### `GET /api/v1/library/branches/{library_id}/hours/today`

Get Library Today Hours

- Auth: public
- Request body: -
- Parameters: `library_id` (path, string), `timezone` (query, string)
- Success response: 200 SuccessResponse_Union_LibraryTodayStatus__NoneType__

### `GET /api/v1/library/hours/today`

List Today Hours

- Auth: public
- Request body: -
- Parameters: `timezone` (query, string)
- Success response: 200 SuccessResponse_list_LibraryTodayStatus__

## Library Inquiries

### `GET /api/v1/library/inquiries/`

List Inquiries

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string | null), `status` (query, string | null), `page` (query, integer), `per_page` (query, integer), `include_total` (query, boolean), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_list_LibraryInquiryOut__

### `POST /api/v1/library/inquiries/`

Submit Inquiry

- Auth: HTTPBearer
- Request body: LibraryInquiryCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryInquiryOut_

### `GET /api/v1/library/inquiries/{inquiry_id}`

Get Inquiry

- Auth: HTTPBearer
- Request body: -
- Parameters: `inquiry_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryInquiryOut_

### `PATCH /api/v1/library/inquiries/{inquiry_id}`

Update Inquiry

- Auth: HTTPBearer
- Request body: LibraryInquiryUpdate
- Parameters: `inquiry_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryInquiryOut_

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
- Success response: 200 SuccessResponse_LibraryInquiryOut_

## Library Loans

### `GET /api/v1/library/loans/`

List Loans

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string | null), `resource_id` (query, string | null), `status` (query, string | null), `page` (query, integer), `per_page` (query, integer), `include_total` (query, boolean), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_list_LibraryLoanOut__

### `POST /api/v1/library/loans/`

Issue Loan

- Auth: HTTPBearer
- Request body: LibraryLoanCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryLoanOut_

### `GET /api/v1/library/loans/{loan_id}`

Get Loan

- Auth: HTTPBearer
- Request body: -
- Parameters: `loan_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryLoanOut_

### `PATCH /api/v1/library/loans/{loan_id}`

Return Loan

- Auth: HTTPBearer
- Request body: LibraryLoanUpdate
- Parameters: `loan_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryLoanOut_

### `POST /api/v1/library/loans/{loan_id}/renew`

Renew Loan

- Auth: HTTPBearer
- Request body: -
- Parameters: `loan_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryLoanOut_

## Library Policies

### `GET /api/v1/library/policies/`

List Policies

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string | null), `policy_type` (query, string | null), `status` (query, string | null), `page` (query, integer), `per_page` (query, integer), `include_total` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_list_LibraryPolicyPageSnapshot__

### `POST /api/v1/library/policies/`

Create Policy

- Auth: HTTPBearer
- Request body: LibraryPolicyPageCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryPolicyPageOut_

### `GET /api/v1/library/policies/slug/{slug}`

Get Policy By Slug

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryPolicyPageSnapshot_

### `PATCH /api/v1/library/policies/{policy_id}`

Update Policy

- Auth: HTTPBearer
- Request body: LibraryPolicyPageUpdate
- Parameters: `policy_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryPolicyPageOut_

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
- Success response: 200 SuccessResponse_LibraryPolicyPageOut_

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
- Success response: 200 SuccessResponse_LibraryPolicyPageSnapshot_

## Library Regulations

### `GET /api/v1/library/regulations/`

List Regulations

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string | null), `category` (query, string | null), `status` (query, string | null), `page` (query, integer), `per_page` (query, integer), `include_total` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_list_LibraryRegulationSnapshot__

### `POST /api/v1/library/regulations/`

Create Regulation

- Auth: HTTPBearer
- Request body: LibraryRegulationCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryRegulationOut_

### `GET /api/v1/library/regulations/{regulation_id}`

Get Regulation

- Auth: HTTPBearer
- Request body: -
- Parameters: `regulation_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryRegulationSnapshot_

### `PATCH /api/v1/library/regulations/{regulation_id}`

Update Regulation

- Auth: HTTPBearer
- Request body: LibraryRegulationUpdate
- Parameters: `regulation_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryRegulationOut_

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
- Success response: 200 SuccessResponse_list_LibraryReservationOut__

### `POST /api/v1/library/reservations/`

Create Reservation

- Auth: HTTPBearer
- Request body: LibraryReservationCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryReservationOut_

### `PATCH /api/v1/library/reservations/{reservation_id}`

Update Reservation

- Auth: HTTPBearer
- Request body: LibraryReservationUpdate
- Parameters: `reservation_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryReservationOut_

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
- Success response: 200 SuccessResponse_list_LibraryResourceSnapshot__

### `POST /api/v1/library/resources/`

Create Resource

- Auth: HTTPBearer
- Request body: LibraryResourceCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryResourceOut_

### `GET /api/v1/library/resources/{resource_id}`

Get Resource

- Auth: HTTPBearer
- Request body: -
- Parameters: `resource_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryResourceSnapshot_

### `PATCH /api/v1/library/resources/{resource_id}`

Update Resource

- Auth: HTTPBearer
- Request body: LibraryResourceUpdate
- Parameters: `resource_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryResourceOut_

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
- Success response: 200 SuccessResponse_LibrarySearchResponse_

## Library Services

### `GET /api/v1/library/services/`

List Services

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_list_LibraryServiceSnapshot__

### `POST /api/v1/library/services/`

Create Service

- Auth: HTTPBearer
- Request body: LibraryServiceCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryServiceOut_

### `PATCH /api/v1/library/services/{service_id}`

Update Service

- Auth: HTTPBearer
- Request body: LibraryServiceUpdate
- Parameters: `service_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryServiceOut_

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
- Parameters: `library_id` (query, string | null), `subject` (query, string | null), `school` (query, string | null), `department` (query, string | null), `page` (query, integer), `per_page` (query, integer), `include_total` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_list_LibrarySpecialistSnapshot__

### `POST /api/v1/library/specialists/`

Create Specialist

- Auth: HTTPBearer
- Request body: LibrarySpecialistCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibrarySpecialistOut_

### `PATCH /api/v1/library/specialists/{specialist_id}`

Update Specialist

- Auth: HTTPBearer
- Request body: LibrarySpecialistUpdate
- Parameters: `specialist_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibrarySpecialistOut_

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
- Success response: 200 SuccessResponse_list_LibraryStaffSnapshot__

### `POST /api/v1/library/staff/`

Create Staff

- Auth: HTTPBearer
- Request body: LibraryStaffCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryStaffOut_

### `GET /api/v1/library/staff/leadership`

List Library Leadership

- Auth: HTTPBearer
- Request body: -
- Parameters: `library_id` (query, string | null), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_list_LibraryStaffSnapshot__

### `PATCH /api/v1/library/staff/{staff_id}`

Update Staff

- Auth: HTTPBearer
- Request body: LibraryStaffUpdate
- Parameters: `staff_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryStaffOut_

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
- Success response: 200 SuccessResponse_list_LibraryStatisticsOut__

### `POST /api/v1/library/statistics/`

Create Statistics

- Auth: HTTPBearer
- Request body: LibraryStatisticsCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryStatisticsOut_

## Library Support Tickets

### `GET /api/v1/library/tickets/`

List Tickets

- Auth: HTTPBearer
- Request body: -
- Parameters: `status` (query, string | null), `category` (query, string | null), `assigned_to` (query, string | null), `page` (query, integer), `per_page` (query, integer), `include_total` (query, boolean), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_list_SupportTicketOut__

### `POST /api/v1/library/tickets/`

Create Ticket

- Auth: HTTPBearer
- Request body: SupportTicketCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_SupportTicketOut_

### `GET /api/v1/library/tickets/{ticket_id}`

Get Ticket

- Auth: HTTPBearer
- Request body: -
- Parameters: `ticket_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_SupportTicketOut_

### `PATCH /api/v1/library/tickets/{ticket_id}`

Update Ticket

- Auth: HTTPBearer
- Request body: SupportTicketUpdate
- Parameters: `ticket_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_SupportTicketOut_

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
- Success response: 200 SuccessResponse_list_LibraryWorkflowStepSnapshot__

### `POST /api/v1/library/workflow-steps/`

Create Workflow Step

- Auth: HTTPBearer
- Request body: LibraryWorkflowStepCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 SuccessResponse_LibraryWorkflowStepOut_

### `PATCH /api/v1/library/workflow-steps/{step_id}`

Update Workflow Step

- Auth: HTTPBearer
- Request body: LibraryWorkflowStepUpdate
- Parameters: `step_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryWorkflowStepOut_

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
- Parameters: `library_id` (query, string | null), `workflow_type` (query, string | null), `page` (query, integer), `per_page` (query, integer), `include_total` (query, boolean), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_list_LibraryWorkflowSnapshot__

### `POST /api/v1/library/workflows/`

Create Workflow

- Auth: HTTPBearer
- Request body: LibraryWorkflowCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryWorkflowOut_

### `GET /api/v1/library/workflows/records/{workflow_id}`

Get Workflow Record

- Auth: HTTPBearer
- Request body: -
- Parameters: `workflow_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryWorkflowSnapshot_

### `GET /api/v1/library/workflows/slug/{slug}`

Get Workflow By Slug

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryWorkflowSnapshot_

### `GET /api/v1/library/workflows/{slug}`

Get Workflow

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryWorkflowSnapshot_

### `PATCH /api/v1/library/workflows/{workflow_id}`

Update Workflow

- Auth: HTTPBearer
- Request body: LibraryWorkflowUpdate
- Parameters: `workflow_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_LibraryWorkflowOut_

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
- Success response: 200 SuccessResponse_list_ElectronicResourceGuideOut__

### `POST /api/v1/library/databases/{resource_id}/guides/`

Create Guide Route

Create a guide for an electronic resource.

- Auth: HTTPBearer
- Request body: ElectronicResourceGuideCreate
- Parameters: `resource_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 201 SuccessResponse_ElectronicResourceGuideOut_

### `PATCH /api/v1/library/databases/{resource_id}/guides/{guide_id}`

Update Guide Route

Update an electronic resource guide.

- Auth: HTTPBearer
- Request body: ElectronicResourceGuideUpdate
- Parameters: `resource_id` (path, string), `guide_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_ElectronicResourceGuideOut_

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
- Success response: 200 SuccessResponse_list_ElectronicResourceSnapshot__

### `POST /api/v1/library/databases/`

Create Resource Route

Create a new electronic resource.

- Auth: HTTPBearer
- Request body: ElectronicResourceCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 SuccessResponse_ElectronicResourceOut_

### `GET /api/v1/library/databases/az`

List Resources Az

Get all electronic resources grouped by first letter (A-Z listing).

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 SuccessResponse_dict_str__list_ElectronicResourceOut___

### `GET /api/v1/library/databases/slug/{slug}`

Get Resource By Slug Route

Get electronic resource by slug with guides.

- Auth: HTTPBearer
- Request body: -
- Parameters: `slug` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_ElectronicResourceSnapshot_

### `GET /api/v1/library/databases/{resource_id}`

Get Resource Detail

Get electronic resource by ID with guides.

- Auth: HTTPBearer
- Request body: -
- Parameters: `resource_id` (path, string), `fields` (query, string | null), `include` (query, string | null), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_ElectronicResourceSnapshot_

### `PATCH /api/v1/library/databases/{resource_id}`

Update Resource Route

Update an electronic resource.

- Auth: HTTPBearer
- Request body: ElectronicResourceUpdate
- Parameters: `resource_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_ElectronicResourceOut_

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
- Success response: 200 SuccessResponse_CitationOut_

### `GET /api/v1/library/publications/saved`

List Saved Publications

List user's saved publications.

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `include_total` (query, boolean), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_list_SavedPublicationOut__

### `POST /api/v1/library/publications/saved`

Save Publication Route

Save a publication to user's reading list.

- Auth: HTTPBearer
- Request body: SavedPublicationCreate
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 201 SuccessResponse_SavedPublicationOut_

### `PATCH /api/v1/library/publications/saved/{saved_id}`

Update Saved Publication

Update a saved publication (notes, reading status).

- Auth: HTTPBearer
- Request body: SavedPublicationUpdate
- Parameters: `saved_id` (path, string), `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_SavedPublicationOut_

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
- Success response: 200 SuccessResponse_list_PublicationResult__

## Stats

### `GET /api/v1/library/stats`

Get Public Stats

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 SuccessResponse_PublicStatsResponse_

### `GET /api/v1/library/stats/admin`

Get Admin Stats

- Auth: HTTPBearer
- Request body: -
- Parameters: `ksu_access` (cookie, string | null)
- Success response: 200 SuccessResponse_PublicStatsResponse_

### `GET /api/v1/library/stats/internal/admin`

Get Internal Admin Stats

Return admin counters to an authenticated sibling service.

- Auth: public
- Request body: -
- Parameters: `X-Internal-Key` (header, string | null), `X-Internal-API-Key` (header, string | null)
- Success response: 200 SuccessResponse_PublicStatsResponse_

## Schemas

Generated component schemas: `187`

### `AuditProxyItem`

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

### `AuditProxyMeta`

- `has_next`: `boolean` (required)
- `page`: `integer` (required)
- `per_page`: `integer` (required)

### `AuditProxyResponse`

- `data`: `array<AuditProxyItem>` (required)
- `message`: `string` (required)
- `meta`: `AuditProxyMeta` (required)
- `status`: `string` (required)

### `CitationOut`

- `formatted`: `string` (required)
- `style`: `string` (required)

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

### `ElectronicResourceGuideOut`

- `access_steps`: `array<object> | null` (optional)
- `created_at`: `string` (required)
- `deleted_at`: `string | null` (optional)
- `electronic_resource_id`: `string` (required)
- `guide_type`: `string` (optional)
- `id`: `string` (required)
- `is_active`: `boolean` (optional)
- `media_id`: `string | null` (optional)
- `recommended_subjects`: `array<string> | null` (optional)
- `search_tips`: `string | null` (optional)
- `sort_order`: `integer` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)
- `updated_at`: `string` (required)

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

### `ElectronicResourceOut`

- `access_level`: `string` (optional)
- `access_type`: `string` (optional)
- `access_url`: `string` (required)
- `coverage_dates`: `string | null` (optional)
- `created_at`: `string` (required)
- `deleted_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `id`: `string` (required)
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
- `updated_at`: `string` (required)

### `ElectronicResourceSnapshot`

- `access_level`: `string | null` (optional)
- `access_type`: `string | null` (optional)
- `access_url`: `string | null` (optional)
- `coverage_dates`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `id`: `string | null` (optional)
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
- `slug`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)
- `subjects`: `array<string> | null` (optional)
- `updated_at`: `string | null` (optional)

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

### `HealthPayload`

- `release`: `string` (required)
- `service`: `string` (required)
- `status`: `string` (required)

### `LibraryAssistantAnswer`

- `answer`: `string` (required)
- `assistant_message_id`: `string | null` (optional)
- `citations`: `array<LibraryAssistantCitation>` (optional)
- `conversation_id`: `string | null` (optional)
- `metadata`: `object` (optional)
- `needs_verification`: `boolean` (optional)
- `provider`: `string` (required)
- `should_escalate`: `boolean` (optional)
- `suggested_questions`: `array<string>` (optional)
- `user_message_id`: `string | null` (optional)

### `LibraryAssistantAnswerRequest`

- `context_id`: `string | null` (optional)
- `conversation_id`: `string | null` (optional)
- `guest_session_id`: `string | null` (optional)
- `message`: `string` (required)
- `page_context`: `LibraryAssistantPageContext | null` (optional)

### `LibraryAssistantCitation`

- `snippet`: `string | null` (optional)
- `source_id`: `string` (required)
- `source_type`: `string` (required)
- `title`: `string` (required)
- `url`: `string | null` (optional)

### `LibraryAssistantContextCreate`

- `allowed_source_types`: `array<string>` (optional)
- `audience`: `string | null` (optional)
- `description`: `string | null` (optional)
- `escalation_guidance`: `string | null` (optional)
- `instructions`: `string` (required)
- `library_id`: `string | null` (optional)
- `name`: `string` (required)
- `slug`: `string` (required)
- `sort_order`: `integer` (optional)
- `sources`: `array<LibraryAssistantSourceCreate>` (optional)
- `suggested_prompts`: `array<object>` (optional)

### `LibraryAssistantContextOut`

- `allowed_source_types`: `array<string>` (required)
- `audience`: `string | null` (optional)
- `created_at`: `string` (required)
- `description`: `string | null` (optional)
- `escalation_guidance`: `string | null` (optional)
- `id`: `string` (required)
- `instructions`: `string | null` (optional)
- `is_public`: `boolean` (required)
- `library_id`: `string | null` (optional)
- `name`: `string` (required)
- `published_at`: `string | null` (optional)
- `slug`: `string` (required)
- `sort_order`: `integer` (required)
- `sources`: `array<LibraryAssistantSourceOut>` (optional)
- `status`: `string` (required)
- `suggested_prompts`: `array<object>` (required)
- `updated_at`: `string` (required)

### `LibraryAssistantContextPublicOut`

- `audience`: `string | null` (optional)
- `description`: `string | null` (optional)
- `escalation_guidance`: `string | null` (optional)
- `id`: `string` (required)
- `library_id`: `string | null` (optional)
- `name`: `string` (required)
- `slug`: `string` (required)
- `sources`: `array<LibraryAssistantSourceOut>` (optional)
- `suggested_prompts`: `array<object>` (required)

### `LibraryAssistantContextUpdate`

- `allowed_source_types`: `array<string> | null` (optional)
- `audience`: `string | null` (optional)
- `description`: `string | null` (optional)
- `escalation_guidance`: `string | null` (optional)
- `instructions`: `string | null` (optional)
- `library_id`: `string | null` (optional)
- `name`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)
- `sources`: `array<LibraryAssistantSourceCreate> | null` (optional)
- `suggested_prompts`: `array<object> | null` (optional)

### `LibraryAssistantConversationOut`

- `assigned_to_person_id`: `string | null` (optional)
- `context_id`: `string | null` (optional)
- `created_at`: `string` (required)
- `id`: `string` (required)
- `last_message_at`: `string | null` (optional)
- `messages`: `array<LibraryAssistantMessageOut>` (optional)
- `status`: `string` (required)
- `title`: `string | null` (optional)
- `updated_at`: `string` (required)
- `verified_email`: `string` (required)

### `LibraryAssistantGuestSessionOut`

- `expires_at`: `string` (required)
- `guest_session_id`: `string` (required)

### `LibraryAssistantMessageOut`

- `citations`: `array<LibraryAssistantCitation>` (optional)
- `content`: `string` (required)
- `conversation_id`: `string` (required)
- `created_at`: `string` (required)
- `id`: `string` (required)
- `metadata`: `object | null` (optional)
- `sender_person_id`: `string | null` (optional)
- `sender_type`: `string` (required)

### `LibraryAssistantPageContext`

- `entity_id`: `string | null` (optional)
- `entity_type`: `string | null` (optional)
- `title`: `string | null` (optional)
- `url`: `string | null` (optional)

### `LibraryAssistantRecoveryOut`

- `conversation`: `LibraryAssistantConversationOut` (required)

### `LibraryAssistantSourceCreate`

- `public_url`: `string | null` (optional)
- `sort_order`: `integer` (optional)
- `source_id`: `string` (required)
- `source_type`: `string` (required)
- `title`: `string` (required)

### `LibraryAssistantSourceOut`

- `approved_at`: `string | null` (optional)
- `approved_by_person_id`: `string | null` (optional)
- `context_id`: `string` (required)
- `created_at`: `string` (required)
- `id`: `string` (required)
- `is_approved`: `boolean` (required)
- `public_url`: `string | null` (optional)
- `sort_order`: `integer` (optional)
- `source_id`: `string` (required)
- `source_type`: `string` (required)
- `title`: `string` (required)
- `updated_at`: `string` (required)

### `LibraryAssistantStaffAssignmentUpdate`

- `assigned_to_person_id`: `string | null` (optional)

### `LibraryAssistantStaffReplyCreate`

- `content`: `string` (required)

### `LibraryAssistantStaffStatusUpdate`

- `status`: `string` (required)

### `LibraryAssistantVerificationConfirm`

- `code`: `string | null` (optional)
- `token`: `string | null` (optional)

### `LibraryAssistantVerificationRequest`

- `email`: `string` (required)

### `LibraryAssistantVerificationResponse`

- `accepted`: `boolean` (required)
- `continuation_token`: `string | null` (optional)
- `conversation_id`: `string | null` (optional)
- `message`: `string` (required)

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

### `LibraryChargeOut`

- `amount`: `string` (required)
- `charge_type`: `string` (required)
- `created_at`: `string` (required)
- `currency`: `string` (optional)
- `deleted_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `effective_from`: `string | null` (optional)
- `effective_to`: `string | null` (optional)
- `id`: `string` (required)
- `is_active`: `boolean` (optional)
- `library_id`: `string` (required)
- `name`: `string` (required)
- `rate_unit`: `string` (optional)
- `updated_at`: `string` (required)

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

### `LibraryExternalLinkOut`

- `created_at`: `string` (required)
- `deleted_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `icon`: `string | null` (optional)
- `id`: `string` (required)
- `is_active`: `boolean` (optional)
- `label`: `string` (required)
- `library_id`: `string` (required)
- `link_type`: `string` (required)
- `opens_in_new_tab`: `boolean` (optional)
- `sort_order`: `integer` (optional)
- `updated_at`: `string` (required)
- `url`: `string` (required)

### `LibraryExternalLinkSnapshot`

- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `icon`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `label`: `string | null` (optional)
- `library_id`: `string | null` (optional)
- `link_type`: `string | null` (optional)
- `opens_in_new_tab`: `boolean | null` (optional)
- `sort_order`: `integer | null` (optional)
- `updated_at`: `string | null` (optional)
- `url`: `string | null` (optional)

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

### `LibraryFileOut`

- `access_level`: `string` (optional)
- `created_at`: `string` (required)
- `deleted_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `file_category`: `string` (optional)
- `file_url`: `string | null` (optional)
- `id`: `string` (required)
- `is_public`: `boolean` (optional)
- `library_id`: `string` (required)
- `media`: `object | null` (optional)
- `media_id`: `string` (required)
- `related_entity_id`: `string | null` (optional)
- `related_entity_type`: `string | null` (optional)
- `sort_order`: `integer` (optional)
- `thumbnail_url`: `string | null` (optional)
- `title`: `string` (required)
- `updated_at`: `string` (required)

### `LibraryFileSnapshot`

- `access_level`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `file_category`: `string | null` (optional)
- `file_url`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `library_id`: `string | null` (optional)
- `media`: `object | null` (optional)
- `media_id`: `string | null` (optional)
- `related_entity_id`: `string | null` (optional)
- `related_entity_type`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)
- `thumbnail_url`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

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

### `LibraryGuideOut`

- `audience`: `string | null` (optional)
- `course_code`: `string | null` (optional)
- `created_at`: `string` (required)
- `deleted_at`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `guide_type`: `string` (required)
- `id`: `string` (required)
- `is_active`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `library_id`: `string | null` (optional)
- `owner_staff_id`: `string | null` (optional)
- `school_id`: `string | null` (optional)
- `sections`: `array<LibraryGuideSectionOut>` (optional)
- `slug`: `string` (required)
- `sort_order`: `integer` (optional)
- `specialists`: `array<LibrarySpecialistOut>` (optional)
- `subject`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)
- `updated_at`: `string` (required)

### `LibraryGuideSectionCreate`

- `content`: `string` (required)
- `file_ids`: `array<string> | null` (optional)
- `guide_id`: `string | null` (optional)
- `heading`: `string` (required)
- `is_active`: `boolean` (optional)
- `resource_links`: `array<object> | null` (optional)
- `section_type`: `string` (optional)
- `sort_order`: `integer` (optional)

### `LibraryGuideSectionOut`

- `content`: `string` (required)
- `created_at`: `string` (required)
- `deleted_at`: `string | null` (optional)
- `file_ids`: `array<string> | null` (optional)
- `guide_id`: `string` (required)
- `heading`: `string` (required)
- `id`: `string` (required)
- `is_active`: `boolean` (optional)
- `resource_links`: `array<object> | null` (optional)
- `section_type`: `string` (optional)
- `sort_order`: `integer` (optional)
- `updated_at`: `string` (required)

### `LibraryGuideSectionSnapshot`

- `content`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `file_ids`: `array<string> | null` (optional)
- `guide_id`: `string | null` (optional)
- `heading`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `resource_links`: `array<object> | null` (optional)
- `section_type`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)
- `updated_at`: `string | null` (optional)

### `LibraryGuideSectionUpdate`

- `content`: `string | null` (optional)
- `file_ids`: `array<string> | null` (optional)
- `guide_id`: `string | null` (optional)
- `heading`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `resource_links`: `array<object> | null` (optional)
- `section_type`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)

### `LibraryGuideSnapshot`

- `audience`: `string | null` (optional)
- `course_code`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `guide_type`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `library_id`: `string | null` (optional)
- `owner_staff_id`: `string | null` (optional)
- `school_id`: `string | null` (optional)
- `sections`: `array<LibraryGuideSectionOut> | null` (optional)
- `slug`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)
- `specialists`: `array<LibrarySpecialistOut> | null` (optional)
- `subject`: `string | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

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

### `LibraryHoursOut`

- `closes_at`: `string | null` (optional)
- `created_at`: `string` (required)
- `day_type`: `string` (required)
- `id`: `string` (required)
- `is_closed`: `boolean` (optional)
- `library_id`: `string` (required)
- `note`: `string | null` (optional)
- `opens_at`: `string | null` (optional)
- `updated_at`: `string` (required)

### `LibraryInquiryCreate`

- `library_id`: `string | null` (optional)
- `message`: `string` (required)
- `sender_email`: `string` (required)
- `sender_name`: `string` (required)
- `sender_phone`: `string | null` (optional)
- `subject`: `string` (required)

### `LibraryInquiryOut`

- `created_at`: `string` (required)
- `deleted_at`: `string | null` (optional)
- `id`: `string` (required)
- `library`: `LibraryOut | null` (optional)
- `library_id`: `string | null` (optional)
- `message`: `string` (required)
- `person_id`: `string | null` (optional)
- `replied_at`: `string | null` (optional)
- `replied_by_person_id`: `string | null` (optional)
- `reply_message`: `string | null` (optional)
- `sender_email`: `string` (required)
- `sender_name`: `string` (required)
- `sender_phone`: `string | null` (optional)
- `status`: `string` (required)
- `subject`: `string` (required)
- `updated_at`: `string` (required)

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

### `LibraryLoanOut`

- `borrowed_at`: `string` (required)
- `borrower_person_id`: `string` (required)
- `created_at`: `string` (required)
- `due_at`: `string` (required)
- `fine_amount`: `string` (required)
- `fine_paid`: `boolean` (required)
- `fine_paid_at`: `string | null` (optional)
- `id`: `string` (required)
- `issued_by_staff_id`: `string | null` (optional)
- `max_renewals`: `integer` (required)
- `notes`: `string | null` (optional)
- `renewals_count`: `integer` (required)
- `resource`: `LibraryResourceOut | null` (optional)
- `resource_id`: `string` (required)
- `returned_at`: `string | null` (optional)
- `returned_to_staff_id`: `string | null` (optional)
- `status`: `string` (required)
- `updated_at`: `string` (required)

### `LibraryLoanUpdate`

- `fine_amount`: `number | string | null` (optional)
- `fine_paid`: `boolean | null` (optional)
- `fine_paid_at`: `string | null` (optional)
- `notes`: `string | null` (optional)
- `returned_at`: `string | null` (optional)
- `returned_to_staff_id`: `string | null` (optional)
- `status`: `string | null` (optional)

### `LibraryOut`

- `address`: `string | null` (optional)
- `borrowing_policy_id`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string` (required)
- `deleted_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `email`: `string | null` (optional)
- `id`: `string` (required)
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
- `updated_at`: `string` (required)
- `vision`: `string | null` (optional)
- `website_url`: `string | null` (optional)

### `LibraryOutSnapshot`

- `address`: `string | null` (optional)
- `borrowing_policy_id`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `email`: `string | null` (optional)
- `id`: `string | null` (optional)
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
- `slug`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)
- `updated_at`: `string | null` (optional)
- `vision`: `string | null` (optional)
- `website_url`: `string | null` (optional)

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

### `LibraryPolicyPageOut`

- `content`: `string` (required)
- `created_at`: `string` (required)
- `deleted_at`: `string | null` (optional)
- `file_id`: `string | null` (optional)
- `id`: `string` (required)
- `is_public`: `boolean` (optional)
- `library_id`: `string | null` (optional)
- `policy_type`: `string` (required)
- `related_regulation_id`: `string | null` (optional)
- `slug`: `string` (required)
- `sort_order`: `integer` (optional)
- `status`: `string` (optional)
- `title`: `string` (required)
- `updated_at`: `string` (required)

### `LibraryPolicyPageSnapshot`

- `content`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `file_id`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `library_id`: `string | null` (optional)
- `policy_type`: `string | null` (optional)
- `related_regulation_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)
- `status`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

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

### `LibraryRegulationOut`

- `category`: `string | null` (optional)
- `content`: `string` (required)
- `created_at`: `string` (required)
- `deleted_at`: `string | null` (optional)
- `document_id`: `string | null` (optional)
- `effective_date`: `string | null` (optional)
- `id`: `string` (required)
- `is_public`: `boolean` (required)
- `library_id`: `string | null` (optional)
- `status`: `string` (required)
- `title`: `string` (required)
- `updated_at`: `string` (required)

### `LibraryRegulationSnapshot`

- `category`: `string | null` (optional)
- `content`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `document_id`: `string | null` (optional)
- `effective_date`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `library_id`: `string | null` (optional)
- `status`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

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

### `LibraryReservationOut`

- `created_at`: `string` (required)
- `expires_at`: `string | null` (optional)
- `id`: `string` (required)
- `notes`: `string | null` (optional)
- `queue_position`: `integer` (required)
- `ready_at`: `string | null` (optional)
- `requester_person_id`: `string` (required)
- `reserved_at`: `string` (required)
- `resource`: `LibraryResourceOut | null` (optional)
- `resource_id`: `string` (required)
- `status`: `string` (required)
- `updated_at`: `string` (required)

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

### `LibraryResourceOut`

- `authors`: `string | null` (optional)
- `available_copies`: `integer` (optional)
- `barcode`: `string | null` (optional)
- `call_number`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string` (required)
- `default_loan_days`: `integer | null` (optional)
- `deleted_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `edition`: `string | null` (optional)
- `id`: `string` (required)
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
- `updated_at`: `string` (required)

### `LibraryResourceSnapshot`

- `authors`: `string | null` (optional)
- `available_copies`: `integer | null` (optional)
- `barcode`: `string | null` (optional)
- `call_number`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `default_loan_days`: `integer | null` (optional)
- `deleted_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `edition`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_loanable`: `boolean | null` (optional)
- `is_reference_only`: `boolean | null` (optional)
- `isbn`: `string | null` (optional)
- `issn`: `string | null` (optional)
- `language`: `string | null` (optional)
- `library_id`: `string | null` (optional)
- `location_shelf`: `string | null` (optional)
- `publication_year`: `integer | null` (optional)
- `publisher`: `string | null` (optional)
- `resource_type`: `string | null` (optional)
- `status`: `string | null` (optional)
- `subject_tags`: `array<string> | null` (optional)
- `subtitle`: `string | null` (optional)
- `table_of_contents`: `string | null` (optional)
- `title`: `string | null` (optional)
- `total_copies`: `integer | null` (optional)
- `updated_at`: `string | null` (optional)

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

### `LibrarySearchResponse`

- `by_type`: `object` (required)
- `query`: `string` (required)
- `results`: `array<LibrarySearchResult>` (required)
- `total`: `integer` (required)

### `LibrarySearchResult`

- `description`: `string | null` (optional)
- `id`: `string` (required)
- `library_id`: `string | null` (optional)
- `library_name`: `string | null` (optional)
- `metadata`: `object` (optional)
- `title`: `string` (required)
- `type`: `string` (required)
- `url`: `string | null` (optional)

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

### `LibraryServiceOut`

- `contact_info`: `string | null` (optional)
- `created_at`: `string` (required)
- `deleted_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `eligibility`: `string | null` (optional)
- `how_to_access`: `string | null` (optional)
- `icon_media_id`: `string | null` (optional)
- `id`: `string` (required)
- `is_active`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `library_id`: `string` (required)
- `name`: `string` (required)
- `service_type`: `string` (optional)
- `slug`: `string` (required)
- `sort_order`: `integer` (optional)
- `updated_at`: `string` (required)

### `LibraryServiceSnapshot`

- `contact_info`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `description`: `string | null` (optional)
- `eligibility`: `string | null` (optional)
- `how_to_access`: `string | null` (optional)
- `icon_media_id`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `library_id`: `string | null` (optional)
- `name`: `string | null` (optional)
- `service_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)
- `updated_at`: `string | null` (optional)

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

### `LibrarySpecialistOut`

- `booking_url`: `string | null` (optional)
- `created_at`: `string` (required)
- `deleted_at`: `string | null` (optional)
- `departments`: `array<string>` (optional)
- `id`: `string` (required)
- `is_active`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `library_id`: `string | null` (optional)
- `schools`: `array<string>` (optional)
- `sort_order`: `integer` (optional)
- `staff_id`: `string` (required)
- `subjects`: `array<string>` (optional)
- `support_areas`: `array<string>` (optional)
- `updated_at`: `string` (required)

### `LibrarySpecialistSnapshot`

- `booking_url`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `departments`: `array<string> | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `library_id`: `string | null` (optional)
- `schools`: `array<string> | null` (optional)
- `sort_order`: `integer | null` (optional)
- `staff_id`: `string | null` (optional)
- `subjects`: `array<string> | null` (optional)
- `support_areas`: `array<string> | null` (optional)
- `updated_at`: `string | null` (optional)

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

### `LibraryStaffOut`

- `bio`: `string | null` (optional)
- `created_at`: `string` (required)
- `deleted_at`: `string | null` (optional)
- `department`: `string | null` (optional)
- `id`: `string` (required)
- `is_active`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `job_title`: `string | null` (optional)
- `library_id`: `string` (required)
- `person_id`: `string` (required)
- `role`: `string` (optional)
- `sort_order`: `integer` (optional)
- `specialization`: `string | null` (optional)
- `updated_at`: `string` (required)

### `LibraryStaffSnapshot`

- `bio`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `department`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `job_title`: `string | null` (optional)
- `library_id`: `string | null` (optional)
- `person_id`: `string | null` (optional)
- `role`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)
- `specialization`: `string | null` (optional)
- `updated_at`: `string | null` (optional)

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

### `LibraryStatisticsOut`

- `created_at`: `string` (required)
- `currency`: `string` (optional)
- `extra`: `object | null` (optional)
- `fines_collected`: `string | null` (optional)
- `id`: `string` (required)
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
- `updated_at`: `string` (required)

### `LibraryTodayStatus`

- `checked_at`: `string` (required)
- `closes_at`: `string | null` (optional)
- `day_type`: `string` (required)
- `is_closed`: `boolean` (required)
- `is_open`: `boolean` (required)
- `library_id`: `string | string` (required)
- `library_name`: `string` (required)
- `library_slug`: `string` (required)
- `note`: `string | null` (optional)
- `opens_at`: `string | null` (optional)
- `timezone`: `string` (required)

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

### `LibraryWorkflowOut`

- `audience`: `string | null` (optional)
- `created_at`: `string` (required)
- `deleted_at`: `string | null` (optional)
- `id`: `string` (required)
- `is_active`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `library_id`: `string | null` (optional)
- `slug`: `string` (required)
- `sort_order`: `integer` (optional)
- `steps`: `array<LibraryWorkflowStepOut>` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)
- `updated_at`: `string` (required)
- `workflow_type`: `string` (required)

### `LibraryWorkflowSnapshot`

- `audience`: `string | null` (optional)
- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `library_id`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)
- `steps`: `array<LibraryWorkflowStepOut> | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
- `workflow_type`: `string | null` (optional)

### `LibraryWorkflowStepCreate`

- `file_id`: `string | null` (optional)
- `instructions`: `string` (required)
- `is_active`: `boolean` (optional)
- `link_url`: `string | null` (optional)
- `sort_order`: `integer` (optional)
- `title`: `string` (required)
- `workflow_id`: `string | null` (optional)

### `LibraryWorkflowStepOut`

- `created_at`: `string` (required)
- `deleted_at`: `string | null` (optional)
- `file_id`: `string | null` (optional)
- `id`: `string` (required)
- `instructions`: `string` (required)
- `is_active`: `boolean` (optional)
- `link_url`: `string | null` (optional)
- `sort_order`: `integer` (optional)
- `title`: `string` (required)
- `updated_at`: `string` (required)
- `workflow_id`: `string` (required)

### `LibraryWorkflowStepSnapshot`

- `created_at`: `string | null` (optional)
- `deleted_at`: `string | null` (optional)
- `file_id`: `string | null` (optional)
- `id`: `string | null` (optional)
- `instructions`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `link_url`: `string | null` (optional)
- `sort_order`: `integer | null` (optional)
- `title`: `string | null` (optional)
- `updated_at`: `string | null` (optional)
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

### `SavedPublicationOut`

- `cached_metadata`: `object | null` (optional)
- `created_at`: `string` (required)
- `external_id`: `string | null` (optional)
- `id`: `string` (required)
- `internal_publication_id`: `string | null` (optional)
- `notes`: `string | null` (optional)
- `person_id`: `string` (required)
- `reading_status`: `string` (required)
- `source`: `string` (required)
- `updated_at`: `string` (required)

### `SavedPublicationUpdate`

- `cached_metadata`: `object | null` (optional)
- `notes`: `string | null` (optional)
- `reading_status`: `string | null` (optional)

### `SuccessResponse_CitationOut_`

- `data`: `CitationOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ElectronicResourceGuideOut_`

- `data`: `ElectronicResourceGuideOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ElectronicResourceOut_`

- `data`: `ElectronicResourceOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_ElectronicResourceSnapshot_`

- `data`: `ElectronicResourceSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_HealthPayload_`

- `data`: `HealthPayload | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryAssistantAnswer_`

- `data`: `LibraryAssistantAnswer | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryAssistantContextOut_`

- `data`: `LibraryAssistantContextOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryAssistantConversationOut_`

- `data`: `LibraryAssistantConversationOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryAssistantGuestSessionOut_`

- `data`: `LibraryAssistantGuestSessionOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryAssistantRecoveryOut_`

- `data`: `LibraryAssistantRecoveryOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryAssistantVerificationResponse_`

- `data`: `LibraryAssistantVerificationResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryChargeOut_`

- `data`: `LibraryChargeOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryExternalLinkOut_`

- `data`: `LibraryExternalLinkOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryFileOut_`

- `data`: `LibraryFileOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryGuideOut_`

- `data`: `LibraryGuideOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryGuideSectionOut_`

- `data`: `LibraryGuideSectionOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryGuideSnapshot_`

- `data`: `LibraryGuideSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryInquiryOut_`

- `data`: `LibraryInquiryOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryLoanOut_`

- `data`: `LibraryLoanOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryOutSnapshot_`

- `data`: `LibraryOutSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryOut_`

- `data`: `LibraryOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryPolicyPageOut_`

- `data`: `LibraryPolicyPageOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryPolicyPageSnapshot_`

- `data`: `LibraryPolicyPageSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryRegulationOut_`

- `data`: `LibraryRegulationOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryRegulationSnapshot_`

- `data`: `LibraryRegulationSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryReservationOut_`

- `data`: `LibraryReservationOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryResourceOut_`

- `data`: `LibraryResourceOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryResourceSnapshot_`

- `data`: `LibraryResourceSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibrarySearchResponse_`

- `data`: `LibrarySearchResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryServiceOut_`

- `data`: `LibraryServiceOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibrarySpecialistOut_`

- `data`: `LibrarySpecialistOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryStaffOut_`

- `data`: `LibraryStaffOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryStatisticsOut_`

- `data`: `LibraryStatisticsOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryWorkflowOut_`

- `data`: `LibraryWorkflowOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryWorkflowSnapshot_`

- `data`: `LibraryWorkflowSnapshot | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_LibraryWorkflowStepOut_`

- `data`: `LibraryWorkflowStepOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_PublicStatsResponse_`

- `data`: `PublicStatsResponse | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SavedPublicationOut_`

- `data`: `SavedPublicationOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_SupportTicketOut_`

- `data`: `SupportTicketOut | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_Union_LibraryTodayStatus__NoneType__`

- `data`: `LibraryTodayStatus | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_dict_str__list_ElectronicResourceOut___`

- `data`: `object | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_ElectronicResourceGuideOut__`

- `data`: `array<ElectronicResourceGuideOut> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_ElectronicResourceSnapshot__`

- `data`: `array<ElectronicResourceSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryAssistantContextOut__`

- `data`: `array<LibraryAssistantContextOut> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryAssistantContextPublicOut__`

- `data`: `array<LibraryAssistantContextPublicOut> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryAssistantConversationOut__`

- `data`: `array<LibraryAssistantConversationOut> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryAssistantMessageOut__`

- `data`: `array<LibraryAssistantMessageOut> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryChargeOut__`

- `data`: `array<LibraryChargeOut> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryExternalLinkSnapshot__`

- `data`: `array<LibraryExternalLinkSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryFileSnapshot__`

- `data`: `array<LibraryFileSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryGuideSectionSnapshot__`

- `data`: `array<LibraryGuideSectionSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryGuideSnapshot__`

- `data`: `array<LibraryGuideSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryHoursOut__`

- `data`: `array<LibraryHoursOut> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryInquiryOut__`

- `data`: `array<LibraryInquiryOut> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryLoanOut__`

- `data`: `array<LibraryLoanOut> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryOutSnapshot__`

- `data`: `array<LibraryOutSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryPolicyPageSnapshot__`

- `data`: `array<LibraryPolicyPageSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryRegulationSnapshot__`

- `data`: `array<LibraryRegulationSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryReservationOut__`

- `data`: `array<LibraryReservationOut> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryResourceSnapshot__`

- `data`: `array<LibraryResourceSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryServiceSnapshot__`

- `data`: `array<LibraryServiceSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibrarySpecialistSnapshot__`

- `data`: `array<LibrarySpecialistSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryStaffSnapshot__`

- `data`: `array<LibraryStaffSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryStatisticsOut__`

- `data`: `array<LibraryStatisticsOut> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryTodayStatus__`

- `data`: `array<LibraryTodayStatus> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryWorkflowSnapshot__`

- `data`: `array<LibraryWorkflowSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_LibraryWorkflowStepSnapshot__`

- `data`: `array<LibraryWorkflowStepSnapshot> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_PublicationResult__`

- `data`: `array<PublicationResult> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_SavedPublicationOut__`

- `data`: `array<SavedPublicationOut> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SuccessResponse_list_SupportTicketOut__`

- `data`: `array<SupportTicketOut> | null` (optional)
- `message`: `string` (optional)
- `meta`: `object | null` (optional)
- `status`: `string` (optional)

### `SupportTicketCreate`

- `category`: `string` (optional)
- `description`: `string` (required)
- `priority`: `string` (optional)
- `requester_email`: `string | null` (optional)
- `requester_name`: `string | null` (optional)
- `subject`: `string` (required)
- `target_entity_id`: `string | null` (optional)
- `target_entity_type`: `string | null` (optional)

### `SupportTicketOut`

- `assigned_to_person_id`: `string | null` (optional)
- `category`: `string` (required)
- `created_at`: `string` (required)
- `deleted_at`: `string | null` (optional)
- `description`: `string` (required)
- `id`: `string` (required)
- `meta`: `object | null` (optional)
- `priority`: `string` (required)
- `requester_email`: `string | null` (optional)
- `requester_name`: `string | null` (optional)
- `requester_person_id`: `string | null` (optional)
- `resolution_notes`: `string | null` (optional)
- `resolved_at`: `string | null` (optional)
- `status`: `string` (required)
- `subject`: `string` (required)
- `target`: `SupportTicketTargetSummary | null` (optional)
- `target_entity_id`: `string | null` (optional)
- `target_entity_type`: `string | null` (optional)
- `updated_at`: `string` (required)

### `SupportTicketTargetSummary`

- `description`: `string | null` (optional)
- `id`: `string` (required)
- `label`: `string` (required)
- `type`: `string` (required)

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
