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

export interface Person {
  id: string;
  user_id?: string;
  slug: string;
  first_name: string;
  last_name: string;
  other_names?: string;
  title?: string;
  salutation?: string;
  gender?: string;
  email: string;
  phone?: string;
  address?: string;
  bio?: string;
  full_bio?: string;
  photo_url?: string;
  person_type: string;
  department_id?: string;
  department_name?: string;
  school_id?: string;
  school_name?: string;
  academic_rank?: string;
  office_location?: string;
  office_hours?: string;
  qualifications?: { degree: string; field: string; institution: string; year: number }[];
  research_interests?: string[];
  publications_count?: number;
  google_scholar_id?: string;
  orcid?: string;
  linkedin_url?: string;
  twitter_handle?: string;
  is_active: boolean;
  display_order?: number;
created_at: string;
  updated_at: string;
}

export interface StaffAssignment {
  id: string;
  person_id: string;
  person?: Person;
  entity_type: string;
  entity_id?: string;
  entity?: { id: string; name: string; type: string };
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

export interface Board {
  id: string;
  name: string;
  slug: string;
  board_type: string;
  parent_entity_type?: string;
  parent_entity_id?: string;
  parent_entity?: { id: string; name: string };
  chairperson_id?: string;
  chairperson?: Person;
  vice_chairperson_id?: string;
  vice_chairperson?: Person;
  secretary_id?: string;
  secretary?: Person;
  member_count?: number;
  current_members?: number;
  quorum?: number;
  standard_term_years?: number;
  max_terms?: number;
  show_member_terms: boolean;
  mandate?: string;
  establishment_date?: string;
  meeting_schedule?: string;
  description?: string;
  head_message?: string;
  mission?: string;
  vision?: string;
  is_public: boolean;
  is_active: boolean;
  status: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  slug: string;
  campus_id: string;
  dean_id?: string;
  dean_name?: string;
  dean_email?: string;
  description?: string;
  about?: string;
  mission?: string;
  vision?: string;
  founded_year?: number;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  cover_image_id?: string;
  is_active: boolean;
  display_order: number;
  departments_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Division {
  id: string;
  name: string;
  code: string;
  slug: string;
  description?: string;
  parent_id?: string;
  head_id?: string;
  head_name?: string;
  phone?: string;
  email?: string;
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
  strategic_priorities?: Record<string, unknown> | Array<Record<string, unknown>>;
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
  school_id: string;
  school_name?: string;
  hod_id?: string;
  hod_name?: string;
  hod_email?: string;
  about?: string;
  mission?: string;
  vision?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  cover_image_id?: string;
  is_active: boolean;
  display_order: number;
  programmes_count?: number;
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
  credits_required?: number;
  department_id: string;
  department_name?: string;
  about?: string;
  objectives?: string;
  career_prospects?: string;
  curriculum_overview?: string;
  entry_requirements?: string;
  cluster_subjects?: ClusterSubject[];
  fees_structure?: Record<string, unknown>;
  intake_months?: string[];
  min_students?: number;
  max_students?: number;
  accreditation_status?: string;
  accrediting_body?: string;
  cover_image_id?: string;
  brochure_id?: string;
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
  late_application_end?: string;
  max_students?: number;
  cover_image_id?: string;
  is_active: boolean;
  is_open: boolean;
  created_at: string;
  updated_at: string;
}

export interface News {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  cover_image_id?: string;
  author_id?: string;
  category?: string;
  tags?: string[];
  published_at?: string;
  is_featured: boolean;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  cover_image_id?: string;
  author_id?: string;
  author_name?: string;
  category?: string;
  tags?: string[];
  published_at?: string;
  is_featured: boolean;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  cover_image_id?: string;
  event_type: string;
  start_date: string;
  end_date?: string;
  location?: string;
  venue?: string;
  is_virtual: boolean;
  virtual_link?: string;
  registration_required: boolean;
  registration_deadline?: string;
  max_attendees?: number;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  slug: string;
  content: string;
  priority: string;
  target_audience: string[];
  start_date: string;
  end_date?: string;
  is_pinned: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SliderGroup {
  id: string;
  name: string;
  slug: string;
  location: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Slider {
  id: string;
  slider_group_id: string;
  title?: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
  image_id: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: string;
  filename: string;
  original_filename: string;
  mime_type: string;
  size: number;
  url: string;
  thumbnail_url?: string;
  alt_text?: string;
  folder_id?: string;
  uploaded_by_id: string;
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_published: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
    limit: number;
    total: number;
    total_pages: number;
  };
}
