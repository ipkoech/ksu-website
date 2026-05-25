# Admin Back Office Contract Inventory

This inventory maps the admin back office to backend contracts so implementation
can remove raw ID entry while still submitting backend-required relationship IDs.

## Rules

- Backend `Create` and `Update` schemas are the source of truth.
- Relationship IDs are allowed in payloads and local form state, but not as user-facing text inputs.
- Canonical media fields such as `featured_media_id`, `cover_image_id`, `photo_id`, and `cv_file_id` use media pickers.
- Additional files use `/api/v1/media/links` through a shared attachment manager.
- Every relationship field needs a selected-record label hydrated from the backend.

## Main Service

| Area | Backend contract | Relationship fields | Media fields | Admin work |
| --- | --- | --- | --- | --- |
| News | `/api/v1/news`, `NewsCreate`, `NewsUpdate` | `scope_id`, `author_user_id` | `featured_media_id`, media links | Keep relationship pickers, media picker, detail media/related-content view, confirmations. |
| Blogs | `/api/v1/blogs`, `BlogCreate`, `BlogUpdate` | `scope_id`, `author_user_id` | `featured_media_id`, media links | Keep relationship pickers, rich text persistence, attachments, confirmations. |
| Announcements | `/api/v1/announcements`, `AnnouncementCreate`, `AnnouncementUpdate` | `scope_id`, `author_user_id` | `featured_media_id`, media links | Keep relationship pickers, professional detail view, attachments, confirmations. |
| Events | `/api/v1/events`, `EventCreate`, `EventUpdate` | `scope_id`, `author_user_id` | `featured_media_id`, media links | Keep event dates/status aligned with backend, attachments, confirmations. |
| Slider groups | `/api/v1/sliders/groups`, `SliderGroupCreate`, `SliderGroupUpdate` | `scope_id` | none | Add scope picker. |
| Sliders | `/api/v1/sliders`, `SliderCreate`, `SliderUpdate` | `slider_group_id`, `scope_id` | `desktop_media_id`, `mobile_media_id` | Use group/scope/media pickers only. |
| Persons | `/api/v1/persons`, `PersonCreate`, `PersonUpdate` | `user_id`, `department_id` | `photo_id`, `cv_file_id` | Use user/department/media pickers; replace visible CV media UUID input. |
| Staff assignments | `/api/v1/staff/assignments`, `StaffAssignmentCreate`, `StaffAssignmentUpdate` | `person_id`, `entity_id`, `reports_to_id`, `user_id` | none | Use staff/person/entity/reporting pickers and conflict APIs. |
| Media | `/api/v1/media`, `/api/v1/media/folders`, `/api/v1/media/links` | `folder_id`, `scope_id`, `entity_id` | media system | Use folder/scope/entity pickers and shared attachment manager. |
| Schools | `/api/v1/schools`, `SchoolCreate`, `SchoolUpdate` | `campus_id`, `dean_id` | `logo_image_id`, `cover_image_id`, `brochure_id` | Add person/media pickers and remove copy-ID workflows. |
| Departments | `/api/v1/departments`, `DepartmentCreate`, `DepartmentUpdate` | `school_id`, `wing_id`, `parent_department_id`, `head_id`, `postgraduate_coordinator_id` | `cover_image_id` | Add school/wing/department/person/media pickers. |
| Programmes | `/api/v1/programmes`, `ProgrammeCreate`, `ProgrammeUpdate` | `department_id`, tutor `person_id`, intake `intake_id` | `cover_image_id`, `brochure_id` | Add department/person/intake/media pickers. |
| Intakes | `/api/v1/intakes`, `IntakeCreate`, `IntakeUpdate` | `academic_calendar_id` | `cover_image_id` | Add academic calendar picker; backend list endpoint may be required. |
| Divisions | `/api/v1/divisions`, `DivisionCreate`, `DivisionUpdate` | `head_id` | `cover_image_id` | Add person/media pickers. |
| Governance boards | `/api/v1/governance/boards`, `BoardCreate`, `BoardUpdate` | `parent_entity_id`, `chairperson_id`, `vice_chairperson_id`, `secretary_id`, `division_id`, member `person_id` | `cover_image_id` | Use entity/person/division/media pickers and staff assignment flow. |
| FAQs | `/api/v1/faqs`, `FAQCreate`, `FAQUpdate` | `scope_id` | media links | Add scope picker and optional attachment manager. |
| Notifications | `/api/v1/admin/notifications` | `user_ids` | none | Use recipient user multi-select. |

## Library Service

| Area | Backend contract | Relationship fields | Media fields | Admin work |
| --- | --- | --- | --- | --- |
| Branches | `/api/v1/library/branches`, `LibraryCreate`, `LibraryUpdate` | `borrowing_policy_id` | `cover_image_id` | Add media picker and complete schema fields. |
| Resources | `/api/v1/library/resources`, `LibraryResourceCreate`, `LibraryResourceUpdate` | `library_id` | `cover_image_id` | Use branch and media pickers. |
| Loans | `/api/v1/library/loans`, `LibraryLoanCreate`, `LibraryLoanUpdate` | `resource_id`, `borrower_person_id`, `issued_by_staff_id`, `returned_to_staff_id` | none | Use resource/person/staff pickers. |
| Reservations | `/api/v1/library/reservations`, `LibraryReservationCreate`, `LibraryReservationUpdate` | `resource_id`, `requester_person_id` | none | Use resource/person pickers. |
| Library staff | `/api/v1/library/staff`, `LibraryStaffCreate`, `LibraryStaffUpdate` | `library_id`, `person_id` | none | Use branch/person pickers. |
| Library services | `/api/v1/library/services`, `LibraryServiceCreate`, `LibraryServiceUpdate` | `library_id` | `icon_media_id` | Use branch/media pickers. |

## Research Service

Research uses the shared CRUD router: list, get by slug, create, patch by
`/id/{item_id}`, and soft delete by `/id/{item_id}`.

| Area | Relationship fields | Media/document fields | Admin work |
| --- | --- | --- | --- |
| Centers | `school_id`, `department_id`, `director_id` | image URLs, gallery | Use school/department/person pickers and controlled image/gallery fields. |
| Projects | `program_id`, `center_id`, `pi_id` | image/document fields by schema | Use program/center/person pickers and typed forms. |
| Grants | `grant_id` on guidelines/applications | `cover_image_url`, `documents` | Use structured document controls. |
| Publications | `project_id`, `center_id`, `journal_id`, author `person_id` | `pdf_url`, `cover_image_url` | Use project/center/journal/person pickers. |

## Immediate Raw-ID Removals

- Intake edit: replace `academic_calendar_id` UUID input.
- Person detail: replace `cv_file_id` text input.
- Library circulation: replace `resource_id` and `borrower_person_id` text inputs.
- Library staff: replace `person_id` text input.
- Academic list pages: remove copy-ID/static-detail workflows.
