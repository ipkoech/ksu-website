// Main service types - aligned with backend schemas

export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  mfa_enabled: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  roles: string[];
}

export interface PublicStatItem {
  key: string;
  label: string;
  value: number;
  suffix?: string;
  description: string;
  href?: string | null;
}

export interface PublicStatsResponse {
  scope: string;
  title: string;
  stats: PublicStatItem[];
}

export interface PortalStatsResponse {
  portal: string;
  title: string;
  stats: Record<string, number>;
}

export interface UserPreference {
  id?: string | null;
  user_id: string;
  namespace: string;
  key: string;
  value: unknown;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface UserPreferencesResponse {
  preferences: UserPreference[];
}

export interface UserPreferenceInput {
  namespace: string;
  key: string;
  value: unknown;
}

export interface UserPreferencesUpdatePayload {
  preferences: UserPreferenceInput[];
}

export interface Person {
  id: string;
  user_id?: string | null;
  slug: string;
  full_name?: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  other_names?: string;
  title?: string;
  salutation?: string;
  gender?: string;
  email: string;
  phone?: string;
  alternative_email?: string | null;
  alternative_phone?: string | null;
  address?: string;
  bio?: string;
  full_bio?: string;
  qualifications?:
    | {
        degree: string;
        field?: string | null;
        institution: string;
        year?: number | string | null;
      }[]
    | null;
  education_background?: Record<string, unknown>[] | null;
  professional_memberships?: Record<string, unknown>[] | null;
  awards_honors?: Record<string, unknown>[] | null;
  photo_id?: string | null;
  photo?: Media | null;
  photo_url?: string;
  cv_file_id?: string | null;
  person_type?: string;
  employment_type?: string;
  employment_start_date?: string | null;
  employment_end_date?: string | null;
  date_of_appointment?: string | null;
  contract_type?: string | null;
  employee_number?: string | null;
  job_group?: string | null;
  department_id?: string | null;
  department?: Department | null;
  department_name?: string;
  school_id?: string;
  school_name?: string;
  academic_rank?: string | null;
  tenure_status?: string | null;
  specialization?: string | null;
  teaching_areas?: string[] | null;
  courses_taught?: string[] | null;
  office_location?: string | null;
  office_hours?: Record<string, unknown> | null;
  office_phone?: string | null;
  institutional_role?: string | null;
  leadership_message?: string | null;
  research_interests?: string[] | null;
  publications_count?: number;
  h_index?: number | null;
  google_scholar_id?: string;
  google_scholar_url?: string | null;
  orcid?: string;
  linkedin_url?: string;
  website_url?: string | null;
  researchgate_url?: string | null;
  scopus_id?: string | null;
  twitter_handle?: string;
  is_active: boolean;
  is_public?: boolean;
  is_researcher?: boolean;
  is_featured?: boolean;
  show_on_directory?: boolean;
  display_order?: number;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PersonCreatePayload {
  user_id?: string | null;
  title?: string | null;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string | null;
  alternative_email?: string | null;
  alternative_phone?: string | null;
  photo_id?: string | null;
  bio?: string | null;
  full_bio?: string | null;
  qualifications?:
    | {
        degree: string;
        field?: string | null;
        institution: string;
        year?: number | string | null;
      }[]
    | null;
  education_background?: Record<string, unknown>[] | null;
  professional_memberships?: Record<string, unknown>[] | null;
  awards_honors?: Record<string, unknown>[] | null;
  cv_file_id?: string | null;
  employee_number?: string | null;
  employment_type?: string;
  employment_start_date?: string | null;
  employment_end_date?: string | null;
  date_of_appointment?: string | null;
  contract_type?: string | null;
  job_group?: string | null;
  department_id?: string | null;
  academic_rank?: string | null;
  tenure_status?: string | null;
  specialization?: string | null;
  research_interests?: string[] | null;
  teaching_areas?: string[] | null;
  courses_taught?: string[] | null;
  publications_count?: number;
  h_index?: number | null;
  office_location?: string | null;
  office_hours?: Record<string, unknown> | null;
  office_phone?: string | null;
  institutional_role?: string | null;
  leadership_message?: string | null;
  website_url?: string | null;
  linkedin_url?: string | null;
  google_scholar_id?: string | null;
  google_scholar_url?: string | null;
  orcid?: string | null;
  researchgate_url?: string | null;
  scopus_id?: string | null;
  is_active?: boolean;
  is_public?: boolean;
  is_researcher?: boolean;
  is_featured?: boolean;
  show_on_directory?: boolean;
}

export type PersonUpdatePayload = Partial<PersonCreatePayload>;

export type MyProfile = Person;

export interface PortalAccess {
  key: string;
  label: string;
  service: "main" | "research" | "library" | "system";
  href: string;
  scope_type: string;
  scope_id?: string | null;
  scope_label: string;
  permissions: string[];
  source: "role" | "assignment" | "mixed" | string;
  locked_scope: boolean;
}

export interface PortalAccessResponse {
  portals: PortalAccess[];
}

export type MyProfileUpdatePayload = Partial<
  Pick<
    PersonCreatePayload,
    | "title"
    | "first_name"
    | "middle_name"
    | "last_name"
    | "full_name"
    | "email"
    | "phone"
    | "alternative_email"
    | "alternative_phone"
    | "photo_id"
    | "bio"
    | "full_bio"
    | "qualifications"
    | "specialization"
    | "research_interests"
    | "teaching_areas"
    | "office_location"
    | "office_hours"
    | "office_phone"
    | "courses_taught"
    | "website_url"
    | "linkedin_url"
    | "google_scholar_id"
    | "google_scholar_url"
    | "orcid"
    | "researchgate_url"
    | "scopus_id"
    | "education_background"
    | "professional_memberships"
    | "awards_honors"
    | "cv_file_id"
    | "is_researcher"
  >
>;

export type PersonStatusFilter = "active" | "inactive" | "deleted" | "all";
export type StaffAssignmentStatusFilter =
  | "active"
  | "ended"
  | "inactive"
  | "pending"
  | "all";
export type StaffAssignmentConflictResolution =
  | "cancel"
  | "assign_acting"
  | "replace_current"
  | "edit_selection";

export interface PublicTeamEntity {
  id?: string | null;
  entity_type: string;
  name: string;
  slug?: string | null;
  code?: string | null;
  description?: string | null;
  head_message?: string | null;
  email?: string | null;
  phone?: string | null;
  office_location?: string | null;
}

export interface PublicTeamPerson {
  id: string;
  slug?: string | null;
  title?: string | null;
  full_name?: string | null;
  email?: string | null;
  photo_id?: string | null;
  photo_url?: string | null;
  academic_rank?: string | null;
  institutional_role?: string | null;
  office_location?: string | null;
  specialization?: string | null;
  research_interests?: string[] | null;
}

export interface PublicTeamAssignment {
  id: string;
  person_id: string;
  entity_type: string;
  entity_id?: string | null;
  role: string;
  role_label: string;
  role_display?: string | null;
  group: string;
  title?: string | null;
  hierarchy_level: number;
  reports_to_id?: string | null;
  is_primary: boolean;
  is_acting: boolean;
  is_current: boolean;
  display_order: number;
  start_date?: string | null;
  end_date?: string | null;
  term_display?: string | null;
}

export interface PublicTeamGroup {
  key: string;
  label: string;
  count: number;
  assignment_ids: string[];
}

export interface PublicTeamHierarchyLevel {
  level: number;
  label: string;
  assignment_ids: string[];
}

export interface PublicTeamResponse {
  entity: PublicTeamEntity;
  assignments: PublicTeamAssignment[];
  persons: Record<string, PublicTeamPerson>;
  groups: PublicTeamGroup[];
  hierarchy: PublicTeamHierarchyLevel[];
  counts: {
    assignments: number;
    persons: number;
    leadership: number;
  };
}

export interface PublicResearchContextEntity {
  id?: string | null;
  entity_type: string;
  source?: string | null;
  name?: string | null;
  slug?: string | null;
  code?: string | null;
  about?: string | null;
  description?: string | null;
  mission?: string | null;
  vision?: string | null;
  mandate?: string | null;
  core_values?: string | null;
  service_charter?: string | null;
  guidelines?: string | null;
  head_message?: string | null;
  email?: string | null;
  phone?: string | null;
  office_location?: string | null;
  operating_hours?: Record<string, unknown> | null;
  cover_image_id?: string | null;
}

export interface PublicResearchContextResponse {
  resolved_entity: {
    entity_type:
      | "university"
      | "department"
      | "division"
      | "wing"
      | "directorate"
      | "board";
    entity_id?: string | null;
    source?: string | null;
  };
  entity: PublicResearchContextEntity;
  division?: Record<string, unknown> | null;
  wing?: Record<string, unknown> | null;
  department?: Record<string, unknown> | null;
  team: Omit<PublicTeamResponse, "entity">;
  leadership: {
    assignment?: PublicTeamAssignment | null;
    person?:
      | (PublicTeamPerson & {
          leadership_message?: string | null;
          bio?: string | null;
        })
      | null;
    message?: string | null;
  };
  relationships: {
    division_id?: string | null;
    wing_id?: string | null;
    department_id?: string | null;
  };
}

export type PublicResearchContextWingUpdatePayload = Partial<
  Pick<
    Wing,
    | "name"
    | "slug"
    | "code"
    | "wing_type"
    | "head_id"
    | "description"
    | "head_message"
    | "mandate"
    | "service_charter"
    | "email"
    | "phone"
    | "office_location"
    | "operating_hours"
    | "cover_image_id"
    | "is_public"
    | "is_active"
    | "display_order"
  >
>;

export type PublicResearchContextDepartmentUpdatePayload = Partial<
  Pick<
    Department,
    | "name"
    | "slug"
    | "code"
    | "head_id"
    | "about"
    | "head_message"
    | "mission"
    | "vision"
    | "mandate"
    | "core_values"
    | "service_charter"
    | "guidelines"
    | "email"
    | "phone"
    | "office_location"
    | "cover_image_id"
    | "is_public"
    | "is_active"
    | "allows_staff_management"
    | "display_order"
  >
>;

export interface PublicResearchContextUpdatePayload {
  wing?: PublicResearchContextWingUpdatePayload;
  department?: PublicResearchContextDepartmentUpdatePayload;
}

export interface StaffAssignment {
  id: string;
  person_id: string;
  person?: Person;
  entity_type: string;
  entity_id?: string | null;
  entity?: {
    id: string | null;
    name: string;
    type: string;
    subtitle?: string | null;
    is_active?: boolean;
  };
  role: string;
  title?: string;
  hierarchy_level?: number;
  reports_to_id?: string;
  reports_to?: StaffAssignment;
  is_primary: boolean;
  is_acting: boolean;
  is_public: boolean;
  start_date?: string;
  end_date?: string;
  term_years?: number;
  term_renewable: boolean;
  show_term_dates: boolean;
  status: string;
  display_order: number;
  notes?: string;
  role_display?: string;
  term_display?: string;
  is_current?: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffAssignmentCreatePayload {
  person_id: string;
  user_id?: string | null;
  entity_type: string;
  entity_id?: string | null;
  role: string;
  title?: string | null;
  hierarchy_level: number;
  reports_to_id?: string | null;
  is_primary?: boolean;
  is_acting?: boolean;
  is_public?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  term_years?: number | null;
  term_renewable?: boolean;
  show_term_dates?: boolean;
  status?: string;
  display_order?: number;
  notes?: string | null;
  conflict_resolution?: StaffAssignmentConflictResolution | null;
  conflict_end_date?: string | null;
  conflict_notes?: string | null;
}

export type StaffAssignmentUpdatePayload = Partial<
  Omit<StaffAssignmentCreatePayload, "person_id">
>;

export interface StaffAssignmentEndPayload {
  end_date?: string | null;
  notes?: string | null;
}

export interface StaffAssignmentActivatePayload {
  start_date?: string | null;
  notes?: string | null;
  conflict_resolution?: StaffAssignmentConflictResolution | null;
  conflict_end_date?: string | null;
  conflict_notes?: string | null;
}

export interface StaffAssignmentReassignPayload {
  person_id: string;
  title?: string | null;
  start_date?: string | null;
  end_previous_date?: string | null;
  notes?: string | null;
  conflict_resolution?: StaffAssignmentConflictResolution | null;
  conflict_end_date?: string | null;
  conflict_notes?: string | null;
}

export interface StaffAssignmentConflictCheckPayload {
  entity_type: string;
  entity_id?: string | null;
  role: string;
  exclude_assignment_id?: string | null;
}

export interface StaffAssignmentConflict {
  has_conflict: boolean;
  current_holder: {
    assignment_id: string;
    person_id: string;
    person_name?: string | null;
    start_date?: string | null;
    is_acting: boolean;
    role?: string | null;
    title?: string | null;
  } | null;
  role_label: string;
  entity_label: string;
  allowed_resolutions: StaffAssignmentConflictResolution[];
}

export interface StaffEntityOption {
  id: string | null;
  entity_type: string;
  label: string;
  subtitle?: string | null;
  is_active: boolean;
}

export interface StaffRoleOption {
  role: string;
  label: string;
  hierarchy_level: number;
  is_unique: boolean;
}

export interface Board {
  id: string;
  name: string;
  slug: string;
  board_type: string;
  parent_entity_type?: string | null;
  parent_entity_id?: string | null;
  parent_entity?: { id: string; name: string } | null;
  chairperson_id?: string | null;
  chairperson?: Person | null;
  vice_chairperson_id?: string | null;
  vice_chairperson?: Person | null;
  secretary_id?: string | null;
  secretary?: Person | null;
  member_count?: number | null;
  current_members?: number | null;
  quorum?: number | null;
  standard_term_years?: number | null;
  max_terms?: number | null;
  show_member_terms: boolean;
  mandate?: string | null;
  establishment_date?: string | null;
  meeting_schedule?: string | null;
  description?: string | null;
  head_message?: string | null;
  mission?: string | null;
  vision?: string | null;
  cover_image_id?: string | null;
  division_id?: string | null;
  is_public: boolean;
  is_active: boolean;
  status: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BoardMemberCreatePayload {
  person_id: string;
  role: string;
  title?: string | null;
  hierarchy_level?: number | null;
  reports_to_id?: string | null;
  is_primary?: boolean;
  is_acting?: boolean;
  is_public?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  term_years?: number | null;
  term_renewable?: boolean;
  show_term_dates?: boolean;
  status?: string;
  display_order?: number;
  notes?: string | null;
}

export interface School {
  id: string;
  name: string;
  code: string;
  slug: string;
  campus_id?: string | null;
  administrative_wing_id?: string | null;
  administrative_wing?: Wing | null;
  school_type?: string | null;
  dean_id?: string | null;
  dean_name?: string | null;
  dean_email?: string | null;
  establishment_date?: string | null;
  description?: string | null;
  about?: string | null;
  head_message?: string | null;
  mission?: string | null;
  vision?: string | null;
  mandate?: string | null;
  core_values?: string | null;
  founded_year?: number | null;
  phone?: string | null;
  email?: string | null;
  office_location?: string | null;
  website?: string | null;
  logo_image_id?: string | null;
  logo_image?: Media | null;
  cover_image_id?: string | null;
  cover_image?: Media | null;
  brochure_id?: string | null;
  brochure?: Media | null;
  is_active: boolean;
  is_public?: boolean;
  display_order: number;
  departments_count?: number;
  departments?: Department[];
  created_at: string;
  updated_at: string;
}

export interface Division {
  id: string;
  name: string;
  code: string;
  slug: string;
  division_type?: string | null;
  description?: string | null;
  parent_id?: string | null;
  head_id?: string | null;
  head?: Person | null;
  head_name?: string | null;
  head_message?: string | null;
  mission?: string | null;
  vision?: string | null;
  core_values?: string | null;
  phone?: string | null;
  email?: string | null;
  office_location?: string | null;
  operating_hours?: Record<string, unknown> | null;
  cover_image_id?: string | null;
  settings?: Record<string, unknown> | null;
  is_public?: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Wing {
  id: string;
  division_id: string;
  name: string;
  slug: string;
  code: string;
  wing_type: string;
  head_id?: string | null;
  description?: string | null;
  head_message?: string | null;
  mandate?: string | null;
  service_charter?: string | null;
  email?: string | null;
  phone?: string | null;
  office_location?: string | null;
  operating_hours?: Record<string, unknown> | null;
  cover_image_id?: string | null;
  is_public: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface UniversityInfo {
  id: string;
  name: string;
  short_name?: string;
  acronym?: string;
  slug: string;
  motto?: string;
  overview?: string;
  vision?: string;
  mission?: string;
  core_values?: string;
  founding_year?: number;
  institution_type?: string;
  charter_summary?: string;
  history_summary?: string;
  email?: string;
  phone?: string;
  alternate_phone?: string;
  website?: string;
  postal_address?: string;
  physical_address?: string;
  city?: string;
  county?: string;
  country?: string;
  social_links?: Record<string, unknown>;
  quick_facts?: Record<string, unknown>;
  strategic_priorities?:
    | Record<string, unknown>
    | Array<Record<string, unknown>>;
  logo_id?: string;
  seal_id?: string;
  cover_image_id?: string;
  brochure_id?: string;
  main_campus_id?: string;
  chancellor_id?: string;
  vc_id?: string;
  council_chair_id?: string;
  chancellor_message_title?: string;
  chancellor_message?: string;
  vc_message_title?: string;
  vc_message?: string;
  council_chair_message_title?: string;
  council_chair_message?: string;
  additional_head_messages?: Array<Record<string, unknown>>;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  slug: string;
  department_type?: string | null;
  school_id?: string | null;
  wing_id?: string | null;
  parent_department_id?: string | null;
  school?: Pick<School, "id" | "name" | "code" | "slug"> | null;
  parent_department?: Pick<Department, "id" | "name" | "code" | "slug"> | null;
  school_name?: string | null;
  head_id?: string | null;
  postgraduate_coordinator_id?: string | null;
  head?: Pick<
    Person,
    "id" | "full_name" | "email" | "title" | "department_id"
  > | null;
  postgraduate_coordinator?: Pick<
    Person,
    "id" | "full_name" | "email" | "title" | "department_id"
  > | null;
  hod_id?: string | null;
  hod_name?: string | null;
  hod_email?: string | null;
  establishment_date?: string | null;
  about?: string | null;
  head_message?: string | null;
  mission?: string | null;
  vision?: string | null;
  mandate?: string | null;
  core_values?: string | null;
  service_charter?: string | null;
  guidelines?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  office_location?: string | null;
  cover_image_id?: string | null;
  student_count?: number;
  postgraduate_student_count?: number;
  is_active: boolean;
  is_public?: boolean;
  allows_staff_management?: boolean;
  display_order: number;
  programmes_count?: number;
  created_at: string;
  updated_at: string;
}

export interface DepartmentService {
  id: string;
  department_id: string;
  department?: Pick<Department, "id" | "name" | "code" | "slug"> | null;
  name: string;
  slug: string;
  description?: string | null;
  requirements?: string | null;
  process?: string | null;
  turnaround_time?: string | null;
  fee?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Programme {
  id: string;
  name: string;
  code: string;
  slug: string;
  level: string;
  mode_of_study: string;
  duration: string;
  credits_required?: number | null;
  department_id: string;
  department_name?: string | null;
  department?: Department;
  about?: string | null;
  objectives?: string | null;
  career_prospects?: string | null;
  curriculum_overview?: string | null;
  entry_requirements?: string | null;
  cluster_subjects?: ClusterSubject[] | null;
  fees_structure?: Record<string, unknown> | null;
  intake_months?: string[] | null;
  min_students?: number | null;
  max_students?: number | null;
  accreditation_status?: string | null;
  accrediting_body?: string | null;
  cover_image_id?: string | null;
  cover_image?: Media | null;
  brochure_id?: string | null;
  brochure?: Media | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Club {
  id: string;
  name: string;
  slug: string;
  club_type: string;
  school_id?: string | null;
  department_id?: string | null;
  patron_id?: string | null;
  chairperson_id?: string | null;
  vice_chairperson_id?: string | null;
  secretary_id?: string | null;
  treasurer_id?: string | null;
  about?: string | null;
  mission?: string | null;
  objectives?: string | null;
  email?: string | null;
  phone?: string | null;
  social_media?: Record<string, unknown> | null;
  membership_fee?: number | null;
  meeting_schedule?: string | null;
  registration_date?: string | null;
  logo_id?: string | null;
  cover_image_id?: string | null;
  membership_count: number;
  is_active: boolean;
  is_public: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Accommodation {
  id: string;
  name: string;
  slug: string;
  accommodation_type: string;
  gender: string;
  campus_id: string;
  about?: string | null;
  amenities?: string[] | null;
  rules?: string | null;
  total_rooms?: number | null;
  capacity?: number | null;
  fee_per_semester?: number | null;
  fee_per_year?: number | null;
  warden_id?: string | null;
  email?: string | null;
  phone?: string | null;
  cover_image_id?: string | null;
  gallery_images?: string[] | null;
  is_active: boolean;
  is_accepting_applications: boolean;
  created_at: string;
  updated_at: string;
}

export interface SportsFacility {
  id: string;
  name: string;
  slug: string;
  facility_type: string;
  sport_types: string[];
  campus_id: string;
  about?: string | null;
  operating_hours?: Record<string, unknown> | null;
  location?: string | null;
  gps_coordinates?: Record<string, unknown> | null;
  manager_id?: string | null;
  email?: string | null;
  phone?: string | null;
  cover_image_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArtsCulture {
  id: string;
  title: string;
  slug: string;
  category: string;
  about?: string | null;
  school_id?: string | null;
  club_id?: string | null;
  cover_image_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentGovernance {
  id: string;
  name: string;
  slug: string;
  acronym?: string | null;
  governance_type: string;
  school_id?: string | null;
  about?: string | null;
  constitution?: string | null;
  mandate?: string | null;
  chairperson_id?: string | null;
  vice_chairperson_id?: string | null;
  secretary_general_id?: string | null;
  term_start?: string | null;
  term_end?: string | null;
  email?: string | null;
  phone?: string | null;
  office_location?: string | null;
  logo_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Alumni {
  id: string;
  person_id: string;
  graduation_year: number;
  programme_id?: string | null;
  school_id?: string | null;
  degree_classification?: string | null;
  student_number?: string | null;
  current_employer?: string | null;
  current_position?: string | null;
  industry?: string | null;
  location_city?: string | null;
  location_country?: string | null;
  linkedin_url?: string | null;
  website?: string | null;
  bio?: string | null;
  achievements?: string | null;
  is_mentor_available: boolean;
  mentor_areas?: string[] | null;
  is_public: boolean;
  show_contact: boolean;
  is_verified: boolean;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AlumniAssociationMember {
  id: string;
  alumni_id: string;
  association_id: string;
  role: string;
  position?: string | null;
  joined_at: string;
  left_at?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlumniAssociation {
  id: string;
  name: string;
  slug: string;
  acronym?: string | null;
  association_type: string;
  school_id?: string | null;
  region?: string | null;
  about?: string | null;
  mission?: string | null;
  objectives?: string | null;
  chairperson_id?: string | null;
  secretary_id?: string | null;
  email?: string | null;
  phone?: string | null;
  social_media?: Record<string, unknown> | null;
  logo_id?: string | null;
  is_active: boolean;
  established_date?: string | null;
  members?: AlumniAssociationMember[];
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  slug: string;
  document_type: string;
  category?: string | null;
  description?: string | null;
  scope_type?: string | null;
  scope_id?: string | null;
  file_id: string;
  version?: string | null;
  is_public: boolean;
  requires_login: boolean;
  download_count: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ClusterSubject {
  subject: string;
  minimum_grade?: string;
  is_mandatory?: boolean;
}

export interface Intake {
  id: string;
  name: string;
  code: string;
  slug: string;
  academic_calendar_id: string;
  application_start: string;
  application_end: string;
  late_application_end?: string | null;
  max_students?: number | null;
  cover_image_id?: string | null;
  is_active: boolean;
  is_open: boolean;
  created_at: string;
  updated_at: string;
}

export interface AcademicCalendar {
  id: string;
  academic_year: string;
  semester: number;
  start_date: string;
  end_date: string;
  registration_start?: string | null;
  registration_end?: string | null;
  late_registration_end?: string | null;
  teaching_start?: string | null;
  teaching_end?: string | null;
  exam_start?: string | null;
  exam_end?: string | null;
  results_release?: string | null;
  holidays?: Array<Record<string, unknown>> | null;
  events?: Array<Record<string, unknown>> | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AdmissionInfo {
  id: string;
  title: string;
  slug: string;
  content_type: string;
  audience_levels?: string[] | null;
  summary?: string | null;
  content?: string | null;
  external_url?: string | null;
  school_id?: string | null;
  cover_image_id?: string | null;
  attachment_media_id?: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface News {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  plain_text?: string | null;
  rich_text?: string | null;
  content?: string;
  structured_content?: Record<string, unknown> | null;
  related_links?: Array<Record<string, unknown>> | null;
  featured_media_id?: string | null;
  cover_image_id?: string | null;
  author_id?: string | null;
  author_user_id?: string | null;
  scope_type?: string | null;
  scope_id?: string | null;
  category?: string;
  tags?: string[];
  published_at?: string | null;
  valid_from?: string | null;
  valid_to?: string | null;
  archived_at?: string | null;
  is_featured: boolean;
  is_main?: boolean;
  is_public?: boolean;
  is_published: boolean;
  status?: string;
  display_order?: number;
  meta_title?: string | null;
  meta_description?: string | null;
  keywords?: Record<string, unknown> | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  plain_text?: string | null;
  rich_text?: string | null;
  content?: string;
  structured_content?: Record<string, unknown> | null;
  excerpt?: string | null;
  related_links?: Array<Record<string, unknown>> | null;
  cover_image_id?: string | null;
  featured_media_id?: string | null;
  author_id?: string | null;
  author_user_id?: string | null;
  scope_type?: string | null;
  scope_id?: string | null;
  author_name?: string;
  category?: string;
  tags?: string[];
  published_at?: string | null;
  valid_from?: string | null;
  valid_to?: string | null;
  archived_at?: string | null;
  is_main?: boolean;
  is_public?: boolean;
  is_featured: boolean;
  is_published: boolean;
  status?: string;
  display_order?: number;
  meta_title?: string | null;
  meta_description?: string | null;
  keywords?: Record<string, unknown> | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ScopeSummary {
  type: string;
  id: string;
  label: string;
  status?: string | null;
  slug?: string | null;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  plain_text?: string | null;
  rich_text?: string | null;
  content?: string;
  structured_content?: Record<string, unknown> | null;
  related_links?: Array<Record<string, unknown>> | null;
  featured_media_id?: string | null;
  cover_image_id?: string | null;
  author_user_id?: string | null;
  scope_type?: string | null;
  scope_id?: string | null;
  scope?: ScopeSummary | null;
  event_type?: string;
  start_date: string;
  end_date?: string | null;
  location?: string | null;
  venue?: string;
  is_virtual: boolean;
  meeting_link?: string | null;
  virtual_link?: string;
  registration_required?: boolean;
  registration_deadline?: string;
  max_attendees?: number;
  is_featured: boolean;
  is_main?: boolean;
  is_public?: boolean;
  is_published: boolean;
  published_at?: string | null;
  valid_from?: string | null;
  valid_to?: string | null;
  archived_at?: string | null;
  status?: string;
  display_order?: number;
  meta_title?: string | null;
  meta_description?: string | null;
  keywords?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  plain_text?: string | null;
  rich_text?: string | null;
  content?: string;
  structured_content?: Record<string, unknown> | null;
  related_links?: Array<Record<string, unknown>> | null;
  featured_media_id?: string | null;
  author_user_id?: string | null;
  scope_type?: string | null;
  scope_id?: string | null;
  priority: string;
  category?: string | null;
  audience?: string;
  youtube_url?: string | null;
  target_audience?: string[];
  valid_from?: string | null;
  valid_to?: string | null;
  published_at?: string | null;
  archived_at?: string | null;
  deleted_at?: string | null;
  is_main?: boolean;
  is_public?: boolean;
  is_published: boolean;
  status?: string;
  display_order?: number;
  meta_title?: string | null;
  meta_description?: string | null;
  keywords?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type ContentWorkflowStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "scheduled"
  | "published"
  | "unpublished"
  | "rejected"
  | "archived";

export type ContentWorkflowAction =
  | "submit"
  | "start_review"
  | "request_changes"
  | "approve"
  | "schedule"
  | "publish"
  | "unpublish"
  | "reject"
  | "archive";

export interface ContentWorkflowQueueFilters extends Record<
  string,
  string | undefined
> {
  source_portal?: string;
  content_type?: ContentWorkflowQueueItem["content_type"];
  status?: ContentWorkflowStatus;
  submitted_date?: string;
  scheduled_date?: string;
  reviewer?: string;
}

export interface ContentWorkflowQueueItem {
  id: string;
  content_type:
    | "news"
    | "blogs"
    | "announcements"
    | "events"
    | "club-events"
    | "club-media"
    | "page-sections"
    | "partnership-spotlights"
    | "sliders";
  content_type_label: string;
  title: string;
  summary?: string | null;
  status: ContentWorkflowStatus;
  source_portal: string;
  source_label: string;
  owner_label: string;
  submitted_by_label: string;
  submitted_at?: string | null;
  reviewer_label: string;
  scheduled_publish_at?: string | null;
  publication_target: string;
  preview_path?: string | null;
  edit_path: string;
  workflow_action_path: string;
  preview: {
    rich_text?: string | null;
    plain_text?: string | null;
    structured_content?: Record<string, unknown> | null;
    related_links: Array<Record<string, unknown>>;
    seo: {
      title?: string | null;
      description?: string | null;
      keywords?: Record<string, unknown> | string[] | null;
    };
  };
}

export interface ContentWorkflowActionPayload {
  comments?: string;
  changed_fields?: Record<string, unknown>;
  scheduled_for?: string;
}

export interface ContentWorkflowActionResult {
  id: string;
  status: ContentWorkflowStatus;
  workflow_status?: ContentWorkflowStatus;
}

export interface ContentWorkflowLog {
  id: string;
  content_type: string;
  content_id: string;
  from_status: ContentWorkflowStatus;
  to_status: ContentWorkflowStatus;
  action: ContentWorkflowAction;
  actor_id?: string | null;
  comments?: string | null;
  changed_fields?: Record<string, unknown> | null;
  created_at: string;
}

export interface SliderGroup {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  location?: string | null;
  scope_type?: string | null;
  scope_id?: string | null;
  is_main?: boolean;
  is_public?: boolean;
  is_active: boolean;
  max_slides?: number | null;
  auto_play?: boolean;
  auto_play_duration?: number | null;
  show_navigation_dots?: boolean;
  show_arrows?: boolean;
  transition_effect?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Slider {
  id: string;
  slider_group_id?: string | null;
  title?: string;
  subtitle?: string | null;
  plain_text?: string | null;
  rich_text?: string | null;
  structured_content?: Record<string, unknown> | null;
  desktop_media_id?: string | null;
  mobile_media_id?: string | null;
  external_url?: string | null;
  link_text?: string | null;
  open_in_new_tab?: boolean;
  scope_type?: string | null;
  scope_id?: string | null;
  is_main?: boolean;
  is_public?: boolean;
  display_order: number;
  is_active: boolean;
  start_datetime?: string | null;
  end_datetime?: string | null;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: string;
  filename: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  size?: number;
  file_hash?: string | null;
  storage_provider?: string;
  storage_path?: string;
  public_url?: string | null;
  cdn_url?: string | null;
  url?: string;
  title?: string | null;
  thumbnail_url?: string | null;
  thumbnails?: Record<string, unknown> | null;
  alt_text?: string | null;
  description?: string | null;
  caption?: string | null;
  tags?: string[] | null;
  credit?: string | null;
  media_type?: string;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  folder_id?: string | null;
  folder?: MediaFolder | null;
  links?: MediaLink[];
  uploaded_by_id?: string | null;
  is_public?: boolean;
  is_processed?: boolean;
  metadata?: Record<string, unknown> | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  description?: string | null;
  is_public: boolean;
  scope_type?: string | null;
  scope_id?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaLink {
  id: string;
  media_id: string;
  entity_type: string;
  entity_id: string;
  role: string;
  folder_id?: string | null;
  media?: Media | null;
  folder?: MediaFolder | null;
  display_order: number;
  is_public: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaUploadOptions {
  folderId?: string;
  isPublic?: boolean;
  entityType?: string;
  entityId?: string;
  role?: string;
}

export interface MediaUpdatePayload {
  folder_id?: string | null;
  title?: string | null;
  alt_text?: string | null;
  description?: string | null;
  caption?: string | null;
  tags?: string[] | null;
  credit?: string | null;
  media_type?: string | null;
  thumbnail_url?: string | null;
  thumbnails?: Record<string, unknown> | null;
  is_public?: boolean | null;
  metadata?: Record<string, unknown> | null;
}

export interface MediaFolderCreatePayload {
  name: string;
  slug: string;
  parent_id?: string | null;
  description?: string | null;
  is_public?: boolean;
  scope_type?: string | null;
  scope_id?: string | null;
}

export type MediaFolderUpdatePayload = Partial<MediaFolderCreatePayload>;

export interface MediaLinkCreatePayload {
  media_id: string;
  entity_type: string;
  entity_id: string;
  role?: string;
  folder_id?: string | null;
  display_order?: number;
  is_public?: boolean;
}

export type MediaLinkUpdatePayload = Partial<MediaLinkCreatePayload>;

export interface FAQ {
  id: string;
  question: string;
  answer?: string;
  answer_plain_text?: string | null;
  answer_rich_text?: string | null;
  answer_structured?: Record<string, unknown> | null;
  category?: string | null;
  display_order: number;
  is_main?: boolean;
  is_public: boolean;
  status: string;
  views_count?: number;
  helpful_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ContactDirectory {
  id: string;
  name: string;
  contact_type?: string | null;
  email?: string | null;
  phone?: string[] | null;
  extension?: string | null;
  physical_address?: string | null;
  building?: string | null;
  room_number?: string | null;
  operating_hours?: Record<string, unknown> | null;
  contact_person_id?: string | null;
  scope_type?: string | null;
  scope_id?: string | null;
  is_main: boolean;
  is_public: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ContactDirectoryListParams {
  q?: string;
  contact_type?: string;
  scope_type?: string;
  scope_id?: string;
  is_main?: boolean;
  sort?: "name_asc" | "name_desc";
}

export type PublicContactDirectoryParams = {
  q?: string;
  contact_type?: string;
  scope_type?: string;
  scope_id?: string;
  page?: number;
  per_page?: number;
};

export interface PublicUniversityContactSummary {
  id: string;
  name: string;
  short_name: string | null;
  acronym: string | null;
  email: string | null;
  phone: string | null;
  alternate_phone: string | null;
  website: string | null;
  postal_address: string | null;
  physical_address: string | null;
  city: string | null;
  county: string | null;
  country: string | null;
  social_links: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface PublicContactDirectoryEntry {
  id: string;
  name: string;
  contact_type: string | null;
  email: string | null;
  phone: string[] | null;
  extension: string | null;
  physical_address: string | null;
  building: string | null;
  room_number: string | null;
  operating_hours: Record<string, unknown> | null;
  contact_person_id: string | null;
  scope_type: string | null;
  scope_id: string | null;
  is_main: boolean;
  is_public: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Campus {
  id: string;
  name: string;
  slug: string;
  code: string;
  campus_type: string;
  address: string | null;
  city: string | null;
  county: string | null;
  postal_code: string | null;
  gps_latitude: number | null;
  gps_longitude: number | null;
  description: string | null;
  email: string | null;
  phone: string | null;
  cover_image_id: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PublicContactFAQ {
  id: string;
  question: string;
  answer_plain_text: string | null;
  answer_rich_text: string | null;
  answer_structured: Record<string, unknown> | null;
  category: string | null;
  scope_type: string | null;
  scope_id: string | null;
  is_main: boolean;
  is_public: boolean;
  status: string;
  display_order: number;
  views_count: number;
  helpful_count: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicContactDirectoryPage {
  items: PublicContactDirectoryEntry[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}

export interface PublicContactDirectory {
  institution: PublicUniversityContactSummary | null;
  main_contacts: PublicContactDirectoryEntry[];
  contacts: PublicContactDirectoryPage;
  campuses: Campus[];
  faqs: PublicContactFAQ[];
}

export interface SearchPayload {
  q: string;
  limit_per_type: number;
  results: {
    news: News[];
    blogs: Blog[];
    announcements: Announcement[];
    events: Event[];
    persons: Person[];
    schools: School[];
    departments: Department[];
  };
}

export interface Testimonial {
  id: string;
  person_id?: string;
  name: string;
  role?: string;
  quote: string;
  full_story?: string;
  testimonial_type: string;
  school_id?: string;
  department_id?: string;
  programme_id?: string;
  photo_id?: string;
  video_url?: string;
  is_featured: boolean;
  display_order: number;
  is_approved: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  is_system: boolean;
  is_active: boolean;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource?: string;
  action?: string;
  is_active: boolean;
}

export interface Session {
  id: string;
  user_id: string;
  device_name?: string;
  device_type?: string;
  ip_address?: string;
  last_used_at?: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  last_used_at?: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  category: string;
  is_public: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export type AnalyticsSourceApp = "web" | "admin";
export type AnalyticsEventType =
  | "page_view"
  | "content_view"
  | "search"
  | "download"
  | "cta_click"
  | "admin_action";

export interface AnalyticsEventPayload {
  event_type: AnalyticsEventType;
  source_app: AnalyticsSourceApp;
  path: string;
  referrer?: string | null;
  referrer_host?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  entity_slug?: string | null;
  entity_title?: string | null;
  session_hash?: string | null;
  user_agent?: string | null;
  device_type?: string | null;
  browser?: string | null;
  os?: string | null;
  country_code?: string | null;
  event_metadata?: Record<string, unknown> | null;
  occurred_at?: string | null;
}

export interface ReportSeriesPoint {
  date: string;
  value: number;
}

export interface ReportDimension {
  key: string;
  label: string;
  value: number;
}

export interface ReportsOverview {
  total_events: number;
  page_views: number;
  content_views: number;
  admin_events: number;
  unique_sessions: number;
  traffic_by_day: ReportSeriesPoint[];
  top_content: ReportDimension[];
}

export interface TrafficReport {
  page_views: number;
  unique_sessions: number;
  by_day: ReportSeriesPoint[];
  top_paths: ReportDimension[];
  referrers: ReportDimension[];
}

export interface ContentReport {
  content_views: number;
  interactions: number;
  top_content: ReportDimension[];
  event_types: ReportDimension[];
}

export interface AdminActivityReport {
  admin_events: number;
  active_admins: number;
  by_day: ReportSeriesPoint[];
  top_paths: ReportDimension[];
}

export interface ImportColumn {
  key: string;
  label: string;
  required: boolean;
  description?: string | null;
  sample?: unknown;
}

export interface ImportResource {
  key: string;
  label: string;
  description: string;
  scope: string;
  accepted_formats: string[];
  columns: ImportColumn[];
}

export type ImportRowStatus = "valid" | "invalid" | "duplicate";

export interface ImportPreviewRow {
  row_number: number;
  status: ImportRowStatus;
  raw: Record<string, unknown>;
  payload?: Record<string, unknown> | null;
  errors: string[];
  warnings: string[];
}

export interface ImportPreview {
  resource: string;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicate_rows: number;
  rows: ImportPreviewRow[];
}

export interface ImportCommitRequest {
  rows: Record<string, unknown>[];
  mode?: "partial" | "all_or_nothing";
}

export interface ImportCommitRow {
  row_number: number;
  status: "created" | "skipped" | "failed";
  id?: string | null;
  errors: string[];
}

export interface ImportCommitResult {
  resource: string;
  total_rows: number;
  created_rows: number;
  skipped_rows: number;
  failed_rows: number;
  rows: ImportCommitRow[];
}

export interface ImportJob {
  job_id: string;
  status: "PENDING" | "STARTED" | "SUCCESS" | "FAILURE" | "RETRY" | string;
  resource?: string | null;
  result?: ImportCommitResult | null;
  error?: string | null;
}

// Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    limit?: number;
    total_pages?: number;
  };
}
