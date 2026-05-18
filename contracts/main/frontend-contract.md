# KSU Main Site API

Shared university CMS, institutional structure, admissions, content, media, support, and platform API for Kisii University.

- Version: `0.1.0`
- OpenAPI: `3.1.0`

## Frontend Contract

This file is generated from the live FastAPI OpenAPI schema. Treat it as the frontend contract for request shapes, auth expectations, and response envelopes.

## Academic

### `GET /api/v1/campuses`

List Campuses

- Auth: public
- Request body: -
- Parameters: `is_active` (query, boolean | null)
- Success response: 200 -

### `POST /api/v1/campuses`

Create Campus

- Auth: HTTPBearer
- Request body: CampusCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/campuses/{campus_id}`

Update Campus

- Auth: HTTPBearer
- Request body: CampusUpdate
- Parameters: `campus_id` (path, string)
- Success response: 200 -

### `GET /api/v1/campuses/{slug}`

Get Campus

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/departments`

List Departments

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `school_id` (query, string | null), `wing_id` (query, string | null), `department_type` (query, string | null)
- Success response: 200 -

### `POST /api/v1/departments`

Create Department

- Auth: HTTPBearer
- Request body: DepartmentCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/departments/{department_id}`

Update Department

- Auth: HTTPBearer
- Request body: DepartmentUpdate
- Parameters: `department_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/departments/{department_id}`

Delete Department

- Auth: HTTPBearer
- Request body: -
- Parameters: `department_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/departments/{slug}`

Get Department

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/departments/{slug}/programmes`

Get Department Programmes

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `page` (query, integer), `per_page` (query, integer)
- Success response: 200 -

### `GET /api/v1/departments/{slug}/services`

Get Department Services

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/departments/{slug}/staff`

Get Department Staff

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/schools`

List Schools

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `campus_id` (query, string | null)
- Success response: 200 -

### `POST /api/v1/schools`

Create School

- Auth: HTTPBearer
- Request body: SchoolCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/schools/{school_id}`

Update School

- Auth: HTTPBearer
- Request body: SchoolUpdate
- Parameters: `school_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/schools/{school_id}`

Delete School

- Auth: HTTPBearer
- Request body: -
- Parameters: `school_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/schools/{slug}`

Get School

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/schools/{slug}/departments`

Get School Departments

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/schools/{slug}/programmes`

Get School Programmes

- Auth: public
- Request body: -
- Parameters: `slug` (path, string), `page` (query, integer), `per_page` (query, integer)
- Success response: 200 -

### `GET /api/v1/schools/{slug}/staff`

Get School Staff

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

## Admin

### `GET /api/v1/admin/audit`

List Audit Logs

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `service_name` (query, string | null), `user_id` (query, string | null), `resource_type` (query, string | null), `status` (query, string | null)
- Success response: 200 -

### `GET /api/v1/admin/audit/{audit_id}`

Get Audit Log

- Auth: HTTPBearer
- Request body: -
- Parameters: `audit_id` (path, string)
- Success response: 200 -

### `POST /api/v1/admin/notifications/broadcast`

Broadcast Notification

- Auth: HTTPBearer
- Request body: NotificationBroadcastCreate
- Parameters: -
- Success response: 202 -

### `POST /api/v1/admin/notifications/broadcast/preview`

Preview Broadcast

- Auth: HTTPBearer
- Request body: NotificationBroadcastCreate
- Parameters: -
- Success response: 200 -

### `GET /api/v1/admin/notifications/deliveries`

List Deliveries

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `status` (query, string | null), `channel` (query, string | null)
- Success response: 200 -

### `POST /api/v1/admin/notifications/send`

Send Notification

- Auth: HTTPBearer
- Request body: NotificationCreate
- Parameters: -
- Success response: 201 -

### `GET /api/v1/admin/notifications/templates`

List Templates

- Auth: HTTPBearer
- Request body: -
- Parameters: -
- Success response: 200 -

### `POST /api/v1/admin/notifications/templates`

Create Template

- Auth: HTTPBearer
- Request body: NotificationTemplateCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/admin/notifications/templates/{template_id}`

Update Template

- Auth: HTTPBearer
- Request body: NotificationTemplateUpdate
- Parameters: `template_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/admin/notifications/templates/{template_id}`

Delete Template

- Auth: HTTPBearer
- Request body: -
- Parameters: `template_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/admin/permissions`

List Permissions

- Auth: HTTPBearer
- Request body: -
- Parameters: -
- Success response: 200 -

### `POST /api/v1/admin/permissions`

Create Permission

- Auth: HTTPBearer
- Request body: -
- Parameters: `name` (query, string), `description` (query, string | null), `resource` (query, string | null), `action` (query, string | null)
- Success response: 201 -

### `GET /api/v1/admin/roles`

List Roles

- Auth: HTTPBearer
- Request body: -
- Parameters: -
- Success response: 200 -

### `POST /api/v1/admin/roles`

Create Role

- Auth: HTTPBearer
- Request body: RoleCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/admin/roles/{role_id}`

Update Role

- Auth: HTTPBearer
- Request body: RoleUpdate
- Parameters: `role_id` (path, string)
- Success response: 200 -

### `GET /api/v1/admin/system/api-keys`

List Api Keys

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `is_active` (query, boolean | null)
- Success response: 200 -

### `POST /api/v1/admin/system/api-keys`

Create Api Key

- Auth: HTTPBearer
- Request body: ApiKeyCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/admin/system/api-keys/{item_id}`

Update Api Key

- Auth: HTTPBearer
- Request body: ApiKeyUpdate
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/admin/system/api-keys/{item_id}`

Revoke Api Key

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/admin/system/settings`

List Settings

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `category` (query, string | null)
- Success response: 200 -

### `POST /api/v1/admin/system/settings`

Create Setting

- Auth: HTTPBearer
- Request body: SettingCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/admin/system/settings/{item_id}`

Update Setting

- Auth: HTTPBearer
- Request body: SettingUpdate
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/admin/system/settings/{item_id}`

Delete Setting

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/admin/system/webhooks`

List Webhooks

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `is_active` (query, boolean | null)
- Success response: 200 -

### `POST /api/v1/admin/system/webhooks`

Create Webhook

- Auth: HTTPBearer
- Request body: WebhookCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/admin/system/webhooks/{item_id}`

Update Webhook

- Auth: HTTPBearer
- Request body: WebhookUpdate
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/admin/system/webhooks/{item_id}`

Delete Webhook

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/admin/users`

List Admin Users

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer)
- Success response: 200 -

### `POST /api/v1/admin/users`

Create Admin User

- Auth: HTTPBearer
- Request body: UserCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/admin/users/{user_id}`

Update Admin User

- Auth: HTTPBearer
- Request body: UserUpdate
- Parameters: `user_id` (path, string)
- Success response: 200 -

### `POST /api/v1/admin/users/{user_id}/roles/{role_id}`

Assign User Role

- Auth: HTTPBearer
- Request body: -
- Parameters: `user_id` (path, string), `role_id` (path, string), `scope_type` (query, string | null), `scope_id` (query, string | null)
- Success response: 200 -

## Admissions

### `GET /api/v1/admissions`

List Admission Info

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `content_type` (query, string | null), `audience_level` (query, string | null), `school_id` (query, string | null)
- Success response: 200 -

### `POST /api/v1/admissions`

Create Admission Info

- Auth: HTTPBearer
- Request body: AdmissionInfoCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/admissions/{item_id}`

Update Admission Info

- Auth: HTTPBearer
- Request body: AdmissionInfoUpdate
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/admissions/{item_id}`

Delete Admission Info

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/admissions/{slug}`

Get Admission Info

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/intakes`

List Intakes

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `academic_calendar_id` (query, string | null), `is_open` (query, boolean | null)
- Success response: 200 -

### `POST /api/v1/intakes`

Create Intake

- Auth: HTTPBearer
- Request body: IntakeCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/intakes/{intake_id}`

Update Intake

- Auth: HTTPBearer
- Request body: IntakeUpdate
- Parameters: `intake_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/intakes/{intake_id}`

Delete Intake

- Auth: HTTPBearer
- Request body: -
- Parameters: `intake_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/intakes/{slug}`

Get Intake

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/programmes`

List Programmes

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `school_id` (query, string | null), `department_id` (query, string | null), `level` (query, string | null), `mode_of_study` (query, string | null)
- Success response: 200 -

### `POST /api/v1/programmes`

Create Programme

- Auth: HTTPBearer
- Request body: ProgrammeCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/programmes/{programme_id}`

Update Programme

- Auth: HTTPBearer
- Request body: ProgrammeUpdate
- Parameters: `programme_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/programmes/{programme_id}`

Delete Programme

- Auth: HTTPBearer
- Request body: -
- Parameters: `programme_id` (path, string)
- Success response: 204 No Content

### `POST /api/v1/programmes/{programme_id}/intakes`

Attach Programme Intake

- Auth: HTTPBearer
- Request body: ProgrammeIntakeCreate
- Parameters: `programme_id` (path, string)
- Success response: 201 -

### `POST /api/v1/programmes/{programme_id}/tutors`

Add Programme Tutor

- Auth: HTTPBearer
- Request body: ProgrammeTutorCreate
- Parameters: `programme_id` (path, string)
- Success response: 201 -

### `GET /api/v1/programmes/{slug}`

Get Programme

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/programmes/{slug}/staff`

Get Programme Staff

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

## Alumni

### `GET /api/v1/alumni`

List Alumni

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `school_id` (query, string | null), `programme_id` (query, string | null), `graduation_year` (query, integer | null), `mentor_only` (query, boolean)
- Success response: 200 -

### `POST /api/v1/alumni`

Create Alumnus

- Auth: HTTPBearer
- Request body: AlumniCreate
- Parameters: -
- Success response: 201 -

### `GET /api/v1/alumni-associations`

List Alumni Associations

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `association_type` (query, string | null), `school_id` (query, string | null)
- Success response: 200 -

### `POST /api/v1/alumni-associations`

Create Alumni Association

- Auth: HTTPBearer
- Request body: AlumniAssociationCreate
- Parameters: -
- Success response: 201 -

### `POST /api/v1/alumni-associations/{association_id}/members`

Add Alumni Association Member

- Auth: HTTPBearer
- Request body: AlumniAssociationMemberCreate
- Parameters: `association_id` (path, string)
- Success response: 201 -

### `DELETE /api/v1/alumni-associations/{association_id}/members/{alumni_id}`

Remove Alumni Association Member

- Auth: HTTPBearer
- Request body: -
- Parameters: `association_id` (path, string), `alumni_id` (path, string)
- Success response: 204 No Content

### `PATCH /api/v1/alumni-associations/{item_id}`

Update Alumni Association

- Auth: HTTPBearer
- Request body: AlumniAssociationUpdate
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/alumni-associations/{item_id}`

Delete Alumni Association

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/alumni-associations/{slug}`

Get Alumni Association

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/alumni-associations/{slug}/members`

Get Alumni Association Members

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/alumni/{item_id}`

Get Alumnus

- Auth: public
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `PATCH /api/v1/alumni/{item_id}`

Update Alumnus

- Auth: HTTPBearer
- Request body: AlumniUpdate
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/alumni/{item_id}`

Delete Alumnus

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 204 No Content

## Auth

### `POST /api/v1/auth/change-password`

Change Password

- Auth: HTTPBearer
- Request body: ChangePasswordRequest
- Parameters: -
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
- Parameters: -
- Success response: 200 -

### `POST /api/v1/auth/logout-all`

Logout All

- Auth: HTTPBearer
- Request body: -
- Parameters: -
- Success response: 200 -

### `GET /api/v1/auth/me`

Get Me

- Auth: HTTPBearer
- Request body: -
- Parameters: -
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
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null)
- Success response: 200 -

### `POST /api/v1/announcements`

Create Announcement

- Auth: HTTPBearer
- Request body: AnnouncementCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/announcements/{announcement_id}`

Update Announcement

- Auth: HTTPBearer
- Request body: AnnouncementUpdate
- Parameters: `announcement_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/announcements/{announcement_id}`

Delete Announcement

- Auth: HTTPBearer
- Request body: -
- Parameters: `announcement_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/announcements/{slug}`

Get Announcement

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/blogs`

List Blogs

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null)
- Success response: 200 -

### `POST /api/v1/blogs`

Create Blog

- Auth: HTTPBearer
- Request body: BlogCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/blogs/{blog_id}`

Update Blog

- Auth: HTTPBearer
- Request body: BlogUpdate
- Parameters: `blog_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/blogs/{blog_id}`

Delete Blog

- Auth: HTTPBearer
- Request body: -
- Parameters: `blog_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/blogs/{slug}`

Get Blog

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/events`

List Events

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null), `upcoming` (query, boolean | null)
- Success response: 200 -

### `POST /api/v1/events`

Create Event

- Auth: HTTPBearer
- Request body: EventCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/events/{event_id}`

Update Event

- Auth: HTTPBearer
- Request body: EventUpdate
- Parameters: `event_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/events/{event_id}`

Delete Event

- Auth: HTTPBearer
- Request body: -
- Parameters: `event_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/events/{slug}`

Get Event

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/news`

List News

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null)
- Success response: 200 -

### `POST /api/v1/news`

Create News

- Auth: HTTPBearer
- Request body: NewsCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/news/{news_id}`

Update News

- Auth: HTTPBearer
- Request body: NewsUpdate
- Parameters: `news_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/news/{news_id}`

Delete News

- Auth: HTTPBearer
- Request body: -
- Parameters: `news_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/news/{slug}`

Get News

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/sliders`

List Sliders

- Auth: public
- Request body: -
- Parameters: `slider_group_id` (query, string | null), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null)
- Success response: 200 -

### `POST /api/v1/sliders`

Create Slider

- Auth: HTTPBearer
- Request body: SliderCreate
- Parameters: -
- Success response: 201 -

### `GET /api/v1/sliders/groups`

List Slider Groups

- Auth: public
- Request body: -
- Parameters: `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null)
- Success response: 200 -

### `POST /api/v1/sliders/groups`

Create Slider Group

- Auth: HTTPBearer
- Request body: SliderGroupCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/sliders/groups/{group_id}`

Update Slider Group

- Auth: HTTPBearer
- Request body: SliderGroupUpdate
- Parameters: `group_id` (path, string)
- Success response: 200 -

### `GET /api/v1/sliders/groups/{slug}`

Get Slider Group

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `PATCH /api/v1/sliders/{slider_id}`

Update Slider

- Auth: HTTPBearer
- Request body: SliderUpdate
- Parameters: `slider_id` (path, string)
- Success response: 200 -

## Documents

### `GET /api/v1/documents`

List Documents

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `document_type` (query, string | null), `category` (query, string | null), `scope_type` (query, string | null), `scope_id` (query, string | null)
- Success response: 200 -

### `POST /api/v1/documents`

Create Document

- Auth: HTTPBearer
- Request body: DocumentCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/documents/{item_id}`

Update Document

- Auth: HTTPBearer
- Request body: DocumentUpdate
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/documents/{item_id}`

Delete Document

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/documents/{slug}`

Get Document

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/policies`

List Policies

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `category` (query, string | null), `division_id` (query, string | null), `department_id` (query, string | null)
- Success response: 200 -

### `POST /api/v1/policies`

Create Policy

- Auth: HTTPBearer
- Request body: PolicyCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/policies/{item_id}`

Update Policy

- Auth: HTTPBearer
- Request body: PolicyUpdate
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/policies/{item_id}`

Delete Policy

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/policies/{slug}`

Get Policy

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

## Exchange

### `GET /api/v1/exchange-programmes`

List Exchange Programmes

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `programme_type` (query, string | null), `school_id` (query, string | null), `accepting_only` (query, boolean)
- Success response: 200 -

### `POST /api/v1/exchange-programmes`

Create Exchange Programme

- Auth: HTTPBearer
- Request body: ExchangeProgrammeCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/exchange-programmes/{item_id}`

Update Exchange Programme

- Auth: HTTPBearer
- Request body: ExchangeProgrammeUpdate
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/exchange-programmes/{item_id}`

Delete Exchange Programme

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/exchange-programmes/{slug}`

Get Exchange Programme

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

## Governance

### `GET /api/v1/governance/boards`

List Boards

- Auth: public
- Request body: -
- Parameters: `board_type` (query, string | null)
- Success response: 200 -

### `GET /api/v1/governance/boards/{slug}`

Get Board

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/governance/boards/{slug}/members`

Get Board Members

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/governance/council`

Get Council

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 -

### `GET /api/v1/governance/management-board`

Get Management Board

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 -

### `GET /api/v1/governance/senate`

Get Senate

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 -

## Health

### `GET /api/v1/health`

Health

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 -

## Internal

### `GET /api/v1/internal/persons/{person_id}`

Get Person Snapshot

Return a minimal person snapshot for sibling services (Research, Library).

- Auth: public
- Request body: -
- Parameters: `person_id` (path, string), `x-internal-key` (header, string)
- Success response: 200 -

## Marketing

### `GET /api/v1/newsletters`

List Newsletters

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null)
- Success response: 200 -

### `POST /api/v1/newsletters`

Create Newsletter

- Auth: HTTPBearer
- Request body: NewsletterCreate
- Parameters: -
- Success response: 201 -

### `POST /api/v1/newsletters/subscribe`

Subscribe Newsletter

- Auth: public
- Request body: NewsletterSubscriberCreate
- Parameters: -
- Success response: 201 -

### `POST /api/v1/newsletters/unsubscribe`

Unsubscribe Newsletter

- Auth: public
- Request body: -
- Parameters: `email` (query, string)
- Success response: 200 -

### `PATCH /api/v1/newsletters/{item_id}`

Update Newsletter

- Auth: HTTPBearer
- Request body: NewsletterUpdate
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/newsletters/{item_id}`

Delete Newsletter

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/newsletters/{slug}`

Get Newsletter

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/social-posts`

List Social Posts

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `status` (query, string | null), `source_type` (query, string | null)
- Success response: 200 -

### `POST /api/v1/social-posts`

Create Social Post

- Auth: HTTPBearer
- Request body: SocialMediaPostCreate
- Parameters: -
- Success response: 201 -

### `GET /api/v1/social-posts/accounts`

List Social Accounts

- Auth: HTTPBearer
- Request body: -
- Parameters: `provider` (query, string | null), `active_only` (query, boolean)
- Success response: 200 -

### `POST /api/v1/social-posts/accounts`

Create Social Account

- Auth: HTTPBearer
- Request body: SocialPlatformAccountCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/social-posts/accounts/{item_id}`

Update Social Account

- Auth: HTTPBearer
- Request body: SocialPlatformAccountUpdate
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/social-posts/accounts/{item_id}`

Delete Social Account

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 204 No Content

### `POST /api/v1/social-posts/accounts/{item_id}/validate`

Validate Social Account

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `GET /api/v1/social-posts/{item_id}`

Get Social Post

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `PATCH /api/v1/social-posts/{item_id}`

Update Social Post

- Auth: HTTPBearer
- Request body: SocialMediaPostUpdate
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/social-posts/{item_id}`

Delete Social Post

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/social-posts/{item_id}/deliveries`

List Social Post Deliveries

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `POST /api/v1/social-posts/{item_id}/publish`

Publish Social Post

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `POST /api/v1/social-posts/{item_id}/validate`

Validate Social Post

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `GET /api/v1/testimonials`

List Testimonials

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `testimonial_type` (query, string | null), `school_id` (query, string | null), `department_id` (query, string | null), `programme_id` (query, string | null), `featured_only` (query, boolean)
- Success response: 200 -

### `POST /api/v1/testimonials`

Create Testimonial

- Auth: HTTPBearer
- Request body: TestimonialCreate
- Parameters: -
- Success response: 201 -

### `GET /api/v1/testimonials/{item_id}`

Get Testimonial

- Auth: public
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `PATCH /api/v1/testimonials/{item_id}`

Update Testimonial

- Auth: HTTPBearer
- Request body: TestimonialUpdate
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/testimonials/{item_id}`

Delete Testimonial

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 204 No Content

## Media

### `GET /api/v1/media`

List Media

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `folder_id` (query, string | null), `media_type` (query, string | null), `uploaded_by_id` (query, string | null)
- Success response: 200 -

### `GET /api/v1/media/folders`

List Folders

- Auth: HTTPBearer
- Request body: -
- Parameters: `parent_id` (query, string | null)
- Success response: 200 -

### `POST /api/v1/media/folders`

Create Folder

- Auth: HTTPBearer
- Request body: MediaFolderCreate
- Parameters: -
- Success response: 201 -

### `GET /api/v1/media/links`

List Media Links

- Auth: HTTPBearer
- Request body: -
- Parameters: `entity_type` (query, string), `entity_id` (query, string), `role` (query, string | null)
- Success response: 200 -

### `POST /api/v1/media/links`

Create Media Link

- Auth: HTTPBearer
- Request body: MediaLinkCreate
- Parameters: -
- Success response: 201 -

### `POST /api/v1/media/upload`

Upload Media

- Auth: HTTPBearer
- Request body: Body_upload_media_api_v1_media_upload_post
- Parameters: `folder_id` (query, string | null), `is_public` (query, boolean)
- Success response: 201 -

### `DELETE /api/v1/media/{media_id}`

Delete Media

- Auth: HTTPBearer
- Request body: -
- Parameters: `media_id` (path, string)
- Success response: 204 No Content

## Organization

### `GET /api/v1/divisions`

List Divisions

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `is_active` (query, boolean | null)
- Success response: 200 -

### `POST /api/v1/divisions`

Create Division

- Auth: HTTPBearer
- Request body: DivisionCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/divisions/{division_id}`

Update Division

- Auth: HTTPBearer
- Request body: DivisionUpdate
- Parameters: `division_id` (path, string)
- Success response: 200 -

### `GET /api/v1/divisions/{slug}`

Get Division

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `POST /api/v1/wings`

Create Wing

- Auth: HTTPBearer
- Request body: WingCreate
- Parameters: -
- Success response: 201 -

### `GET /api/v1/wings/division/{division_id}`

List Wings By Division

- Auth: public
- Request body: -
- Parameters: `division_id` (path, string), `is_active` (query, boolean | null)
- Success response: 200 -

### `GET /api/v1/wings/{wing_id}`

Get Wing

- Auth: public
- Request body: -
- Parameters: `wing_id` (path, string)
- Success response: 200 -

### `PATCH /api/v1/wings/{wing_id}`

Update Wing

- Auth: HTTPBearer
- Request body: WingUpdate
- Parameters: `wing_id` (path, string)
- Success response: 200 -

## Persons

### `GET /api/v1/persons`

List Persons

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `department_id` (query, string | null), `academic_rank` (query, string | null), `employment_type` (query, string | null)
- Success response: 200 -

### `POST /api/v1/persons`

Create Person

- Auth: HTTPBearer
- Request body: PersonCreate
- Parameters: -
- Success response: 201 -

### `GET /api/v1/persons/{person_id}`

Get Person

- Auth: public
- Request body: -
- Parameters: `person_id` (path, string)
- Success response: 200 -

### `PATCH /api/v1/persons/{person_id}`

Update Person

- Auth: HTTPBearer
- Request body: PersonUpdate
- Parameters: `person_id` (path, string)
- Success response: 200 -

## Search

### `GET /api/v1/search`

Search

- Auth: public
- Request body: -
- Parameters: `q` (query, string), `limit_per_type` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null)
- Success response: 200 -

## Staff

### `GET /api/v1/staff/assignments`

List Assignments

- Auth: HTTPBearer
- Request body: -
- Parameters: `entity_type` (query, string | null), `entity_id` (query, string | null), `person_id` (query, string | null)
- Success response: 200 -

### `POST /api/v1/staff/assignments`

Create Assignment

- Auth: HTTPBearer
- Request body: StaffAssignmentCreate
- Parameters: -
- Success response: 201 -

### `GET /api/v1/staff/assignments/{assignment_id}`

Get Assignment

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string)
- Success response: 200 -

### `GET /api/v1/staff/assignments/{assignment_id}/direct-reports`

Get Direct Reports

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string)
- Success response: 200 -

### `PATCH /api/v1/staff/assignments/{assignment_id}/end`

End Assignment

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string)
- Success response: 200 -

### `GET /api/v1/staff/assignments/{assignment_id}/reporting-chain`

Get Reporting Chain

- Auth: HTTPBearer
- Request body: -
- Parameters: `assignment_id` (path, string)
- Success response: 200 -

## Student Life

### `GET /api/v1/accommodations`

List Accommodations

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `campus_id` (query, string | null), `accommodation_type` (query, string | null), `gender` (query, string | null)
- Success response: 200 -

### `POST /api/v1/accommodations`

Create Accommodation

- Auth: HTTPBearer
- Request body: AccommodationCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/accommodations/{item_id}`

Update Accommodation

- Auth: HTTPBearer
- Request body: AccommodationUpdate
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/accommodations/{item_id}`

Delete Accommodation

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/accommodations/{slug}`

Get Accommodation

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/arts-culture`

List Arts Culture

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `category` (query, string | null), `school_id` (query, string | null), `club_id` (query, string | null)
- Success response: 200 -

### `POST /api/v1/arts-culture`

Create Arts Culture

- Auth: HTTPBearer
- Request body: ArtsCultureCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/arts-culture/{item_id}`

Update Arts Culture

- Auth: HTTPBearer
- Request body: ArtsCultureUpdate
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/arts-culture/{item_id}`

Delete Arts Culture

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/arts-culture/{slug}`

Get Arts Culture

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/clubs`

List Clubs

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `q` (query, string | null), `club_type` (query, string | null), `school_id` (query, string | null), `department_id` (query, string | null)
- Success response: 200 -

### `POST /api/v1/clubs`

Create Club

- Auth: HTTPBearer
- Request body: ClubCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/clubs/activities/{activity_id}`

Update Club Activity

- Auth: HTTPBearer
- Request body: ClubActivityUpdate
- Parameters: `activity_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/clubs/activities/{activity_id}`

Delete Club Activity

- Auth: HTTPBearer
- Request body: -
- Parameters: `activity_id` (path, string)
- Success response: 204 No Content

### `PATCH /api/v1/clubs/{club_id}`

Update Club

- Auth: HTTPBearer
- Request body: ClubUpdate
- Parameters: `club_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/clubs/{club_id}`

Delete Club

- Auth: HTTPBearer
- Request body: -
- Parameters: `club_id` (path, string)
- Success response: 204 No Content

### `POST /api/v1/clubs/{club_id}/activities`

Create Club Activity

- Auth: HTTPBearer
- Request body: ClubActivityCreate
- Parameters: `club_id` (path, string)
- Success response: 201 -

### `GET /api/v1/clubs/{slug}`

Get Club

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/clubs/{slug}/activities`

Get Club Activities

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/sports-facilities`

List Sports Facilities

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `campus_id` (query, string | null), `facility_type` (query, string | null)
- Success response: 200 -

### `POST /api/v1/sports-facilities`

Create Sports Facility

- Auth: HTTPBearer
- Request body: SportsFacilityCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/sports-facilities/{item_id}`

Update Sports Facility

- Auth: HTTPBearer
- Request body: SportsFacilityUpdate
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/sports-facilities/{item_id}`

Delete Sports Facility

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/sports-facilities/{slug}`

Get Sports Facility

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

### `GET /api/v1/student-governance`

List Student Governance

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `governance_type` (query, string | null), `school_id` (query, string | null)
- Success response: 200 -

### `POST /api/v1/student-governance`

Create Student Governance

- Auth: HTTPBearer
- Request body: StudentGovernanceCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/student-governance/{item_id}`

Update Student Governance

- Auth: HTTPBearer
- Request body: StudentGovernanceUpdate
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/student-governance/{item_id}`

Delete Student Governance

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/student-governance/{slug}`

Get Student Governance

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

## Support

### `GET /api/v1/contacts`

List Contacts

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null)
- Success response: 200 -

### `POST /api/v1/contacts`

Create Contact

- Auth: HTTPBearer
- Request body: ContactDirectoryCreate
- Parameters: -
- Success response: 201 -

### `GET /api/v1/contacts/{contact_id}`

Get Contact

- Auth: public
- Request body: -
- Parameters: `contact_id` (path, string)
- Success response: 200 -

### `PATCH /api/v1/contacts/{contact_id}`

Update Contact

- Auth: HTTPBearer
- Request body: ContactDirectoryUpdate
- Parameters: `contact_id` (path, string)
- Success response: 200 -

### `GET /api/v1/faqs`

List Faqs

- Auth: public
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `is_main` (query, boolean | null)
- Success response: 200 -

### `POST /api/v1/faqs`

Create Faq

- Auth: HTTPBearer
- Request body: FAQCreate
- Parameters: -
- Success response: 201 -

### `GET /api/v1/faqs/{faq_id}`

Get Faq

- Auth: public
- Request body: -
- Parameters: `faq_id` (path, string)
- Success response: 200 -

### `PATCH /api/v1/faqs/{faq_id}`

Update Faq

- Auth: HTTPBearer
- Request body: FAQUpdate
- Parameters: `faq_id` (path, string)
- Success response: 200 -

### `GET /api/v1/support/tickets`

List Tickets

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `scope_type` (query, string | null), `scope_id` (query, string | null), `status` (query, string | null), `mine` (query, boolean)
- Success response: 200 -

### `POST /api/v1/support/tickets`

Create Ticket

- Auth: HTTPBearer
- Request body: SupportTicketCreate
- Parameters: -
- Success response: 201 -

### `GET /api/v1/support/tickets/{ticket_id}`

Get Ticket

- Auth: HTTPBearer
- Request body: -
- Parameters: `ticket_id` (path, string)
- Success response: 200 -

### `PATCH /api/v1/support/tickets/{ticket_id}`

Update Ticket

- Auth: HTTPBearer
- Request body: SupportTicketUpdate
- Parameters: `ticket_id` (path, string)
- Success response: 200 -

## System

### `GET /api/v1/settings`

List Public Settings

- Auth: public
- Request body: -
- Parameters: `category` (query, string | null)
- Success response: 200 -

## University

### `GET /api/v1/university-info`

Get University Info

- Auth: public
- Request body: -
- Parameters: -
- Success response: 200 -

### `POST /api/v1/university-info`

Create University Info

- Auth: HTTPBearer
- Request body: UniversityInfoCreate
- Parameters: -
- Success response: 201 -

### `PATCH /api/v1/university-info/{item_id}`

Update University Info

- Auth: HTTPBearer
- Request body: UniversityInfoUpdate
- Parameters: `item_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/university-info/{item_id}`

Delete University Info

- Auth: HTTPBearer
- Request body: -
- Parameters: `item_id` (path, string)
- Success response: 204 No Content

### `GET /api/v1/university-info/{slug}`

Get University Info By Slug

- Auth: public
- Request body: -
- Parameters: `slug` (path, string)
- Success response: 200 -

## Users

### `GET /api/v1/notifications`

List Notifications

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `unread_only` (query, boolean)
- Success response: 200 -

### `DELETE /api/v1/notifications/{notification_id}`

Delete Notification

- Auth: HTTPBearer
- Request body: -
- Parameters: `notification_id` (path, string)
- Success response: 204 No Content

### `PATCH /api/v1/notifications/{notification_id}/read`

Mark Notification As Read

- Auth: HTTPBearer
- Request body: -
- Parameters: `notification_id` (path, string)
- Success response: 200 -

### `GET /api/v1/users`

List Users

- Auth: HTTPBearer
- Request body: -
- Parameters: `page` (query, integer), `per_page` (query, integer), `search` (query, string | null), `is_active` (query, boolean | null)
- Success response: 200 -

### `POST /api/v1/users`

Create User

- Auth: HTTPBearer
- Request body: UserCreate
- Parameters: -
- Success response: 201 -

### `GET /api/v1/users/{user_id}`

Get User

- Auth: HTTPBearer
- Request body: -
- Parameters: `user_id` (path, string)
- Success response: 200 -

### `PATCH /api/v1/users/{user_id}`

Update User

- Auth: HTTPBearer
- Request body: UserUpdate
- Parameters: `user_id` (path, string)
- Success response: 200 -

### `DELETE /api/v1/users/{user_id}`

Delete User

- Auth: HTTPBearer
- Request body: -
- Parameters: `user_id` (path, string)
- Success response: 204 No Content

## Schemas

Generated component schemas: `100`

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

### `AnnouncementCreate`

- `audience`: `string` (optional)
- `author_user_id`: `string | null` (optional)
- `category`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `featured_media_id`: `string | null` (optional)
- `is_main`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `is_published`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `priority`: `string` (optional)
- `published_at`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `rich_text`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string` (required)
- `status`: `string` (optional)
- `structured_content`: `object | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)

### `AnnouncementUpdate`

- `archived_at`: `string | null` (optional)
- `audience`: `string | null` (optional)
- `author_user_id`: `string | null` (optional)
- `category`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_published`: `boolean | null` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `priority`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `rich_text`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `structured_content`: `object | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)

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

- `author_user_id`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `excerpt`: `string | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `is_featured`: `boolean` (optional)
- `is_main`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `is_published`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `rich_text`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string` (required)
- `status`: `string` (optional)
- `structured_content`: `object | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)

### `BlogUpdate`

- `archived_at`: `string | null` (optional)
- `author_user_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `excerpt`: `string | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_published`: `boolean | null` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `rich_text`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
- `structured_content`: `object | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string | null` (optional)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)

### `Body_upload_media_api_v1_media_upload_post`

- `file`: `string` (required)

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
- `is_public`: `boolean` (optional)
- `is_virtual`: `boolean` (optional)
- `location`: `string | null` (optional)
- `meeting_link`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `start_datetime`: `string` (required)
- `status`: `string` (optional)
- `title`: `string` (required)

### `ClubActivityUpdate`

- `activity_type`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `description`: `string | null` (optional)
- `end_datetime`: `string | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_virtual`: `boolean | null` (optional)
- `location`: `string | null` (optional)
- `meeting_link`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `start_datetime`: `string | null` (optional)
- `status`: `string | null` (optional)
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

- `author_user_id`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `end_date`: `string | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `is_featured`: `boolean` (optional)
- `is_main`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `is_published`: `boolean` (optional)
- `is_virtual`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `location`: `string | null` (optional)
- `meeting_link`: `string | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `rich_text`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string` (required)
- `start_date`: `string` (required)
- `status`: `string` (optional)
- `structured_content`: `object | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)

### `EventUpdate`

- `archived_at`: `string | null` (optional)
- `author_user_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `end_date`: `string | null` (optional)
- `featured_media_id`: `string | null` (optional)
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
- `plain_text`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `rich_text`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `start_date`: `string | null` (optional)
- `status`: `string | null` (optional)
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

### `ForgotPasswordRequest`

- `email`: `string` (required)

### `HTTPValidationError`

- `detail`: `array<ValidationError>` (optional)

### `HeadMessageItem`

- `display_order`: `integer` (optional)
- `is_active`: `boolean` (optional)
- `message`: `string` (required)
- `person_id`: `string | null` (optional)
- `role_key`: `string` (required)
- `title`: `string` (required)

### `IntakeCreate`

- `academic_calendar_id`: `string` (required)
- `application_end`: `string` (required)
- `application_start`: `string` (required)
- `code`: `string` (required)
- `cover_image_id`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_open`: `boolean` (optional)
- `late_application_end`: `string | null` (optional)
- `max_students`: `integer | null` (optional)
- `name`: `string` (required)
- `slug`: `string | null` (optional)

### `IntakeUpdate`

- `academic_calendar_id`: `string | null` (optional)
- `application_end`: `string | null` (optional)
- `application_start`: `string | null` (optional)
- `code`: `string | null` (optional)
- `cover_image_id`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_open`: `boolean | null` (optional)
- `late_application_end`: `string | null` (optional)
- `max_students`: `integer | null` (optional)
- `name`: `string | null` (optional)
- `slug`: `string | null` (optional)

### `MediaFolderCreate`

- `description`: `string | null` (optional)
- `is_public`: `boolean` (optional)
- `name`: `string` (required)
- `parent_id`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string` (required)

### `MediaLinkCreate`

- `display_order`: `integer` (optional)
- `entity_id`: `string` (required)
- `entity_type`: `string` (required)
- `folder_id`: `string | null` (optional)
- `is_public`: `boolean` (optional)
- `media_id`: `string` (required)
- `role`: `string` (optional)

### `NewsCreate`

- `author_user_id`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `featured_media_id`: `string | null` (optional)
- `is_featured`: `boolean` (optional)
- `is_main`: `boolean` (optional)
- `is_public`: `boolean` (optional)
- `is_published`: `boolean` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `rich_text`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string` (required)
- `status`: `string` (optional)
- `structured_content`: `object | null` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)
- `valid_from`: `string | null` (optional)
- `valid_to`: `string | null` (optional)

### `NewsUpdate`

- `archived_at`: `string | null` (optional)
- `author_user_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `featured_media_id`: `string | null` (optional)
- `is_featured`: `boolean | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
- `is_published`: `boolean | null` (optional)
- `keywords`: `object | null` (optional)
- `meta_description`: `string | null` (optional)
- `meta_title`: `string | null` (optional)
- `plain_text`: `string | null` (optional)
- `published_at`: `string | null` (optional)
- `related_links`: `array<object> | null` (optional)
- `rich_text`: `string | null` (optional)
- `scope_id`: `string | null` (optional)
- `scope_type`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `status`: `string | null` (optional)
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
- `slug`: `string | null` (optional)
- `status`: `string` (optional)
- `summary`: `string | null` (optional)
- `title`: `string` (required)

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

### `PersonCreate`

- `academic_rank`: `string | null` (optional)
- `alternative_email`: `string | null` (optional)
- `alternative_phone`: `string | null` (optional)
- `bio`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `email`: `string` (required)
- `employee_number`: `string | null` (optional)
- `employment_end_date`: `string | null` (optional)
- `employment_start_date`: `string | null` (optional)
- `employment_type`: `string` (optional)
- `first_name`: `string` (required)
- `full_name`: `string` (required)
- `google_scholar_url`: `string | null` (optional)
- `institutional_role`: `string | null` (optional)
- `is_active`: `boolean` (optional)
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
- `qualifications`: `array<QualificationItem> | null` (optional)
- `research_interests`: `array<string> | null` (optional)
- `researchgate_url`: `string | null` (optional)
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
- `bio`: `string | null` (optional)
- `department_id`: `string | null` (optional)
- `email`: `string | null` (optional)
- `employee_number`: `string | null` (optional)
- `employment_end_date`: `string | null` (optional)
- `employment_start_date`: `string | null` (optional)
- `employment_type`: `string | null` (optional)
- `first_name`: `string | null` (optional)
- `full_name`: `string | null` (optional)
- `google_scholar_url`: `string | null` (optional)
- `institutional_role`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
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
- `qualifications`: `array<QualificationItem> | null` (optional)
- `research_interests`: `array<string> | null` (optional)
- `researchgate_url`: `string | null` (optional)
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

### `QualificationItem`

- `degree`: `string` (required)
- `field`: `string | null` (optional)
- `institution`: `string` (required)
- `year`: `string | integer | null` (optional)

### `RefreshRequest`

- `refresh_token`: `string` (required)

### `ResetPasswordRequest`

- `new_password`: `string` (required)
- `token`: `string` (required)

### `RoleCreate`

- `description`: `string | null` (optional)
- `display_name`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_system`: `boolean` (optional)
- `name`: `string` (required)

### `RoleUpdate`

- `description`: `string | null` (optional)
- `display_name`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_system`: `boolean | null` (optional)

### `SchoolCreate`

- `about`: `string | null` (optional)
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

### `SchoolUpdate`

- `about`: `string | null` (optional)
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

- `archived_at`: `string | null` (optional)
- `desktop_media_id`: `string | null` (optional)
- `display_order`: `integer` (optional)
- `end_datetime`: `string | null` (optional)
- `external_url`: `string | null` (optional)
- `is_active`: `boolean` (optional)
- `is_main`: `boolean` (optional)
- `is_public`: `boolean` (optional)
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

- `archived_at`: `string | null` (optional)
- `desktop_media_id`: `string | null` (optional)
- `display_order`: `integer | null` (optional)
- `end_datetime`: `string | null` (optional)
- `external_url`: `string | null` (optional)
- `is_active`: `boolean | null` (optional)
- `is_main`: `boolean | null` (optional)
- `is_public`: `boolean | null` (optional)
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

### `StaffAssignmentCreate`

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
- `start_date`: `string | null` (optional)
- `status`: `string` (optional)
- `title`: `string | null` (optional)
- `user_id`: `string | null` (optional)

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
- `phone`: `string | null` (optional)
- `physical_address`: `string | null` (optional)
- `postal_address`: `string | null` (optional)
- `quick_facts`: `object | null` (optional)
- `seal_id`: `string | null` (optional)
- `short_name`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `social_links`: `object | null` (optional)
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
- `phone`: `string | null` (optional)
- `physical_address`: `string | null` (optional)
- `postal_address`: `string | null` (optional)
- `quick_facts`: `object | null` (optional)
- `seal_id`: `string | null` (optional)
- `short_name`: `string | null` (optional)
- `slug`: `string | null` (optional)
- `social_links`: `object | null` (optional)
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
