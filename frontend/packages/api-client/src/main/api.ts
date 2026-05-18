import { mainApi } from "../client";
import type {
  User,
  Person,
  StaffAssignment,
  Board,
  School,
  Division,
  Department,
  Programme,
  Intake,
  News,
  Blog,
  Event,
  Announcement,
  SliderGroup,
  Slider,
  Media,
  FAQ,
  Testimonial,
  Role,
  Permission,
  Session,
  UniversityInfo,
  AuditLog,
  ApiKey,
  Setting,
  LoginRequest,
  LoginResponse,
  PaginatedResponse,
} from "./types";
import type { FieldSelectionParams, QueryParams } from "../client";

type ListParams<T extends Record<string, string | number | boolean | undefined> = Record<string, string | number | boolean | undefined>> = QueryParams & T;

// Auth
export const authApi = {
  login: (data: LoginRequest) =>
    mainApi.post<LoginResponse>("/api/v1/auth/login", data),

  logout: () =>
    mainApi.post<void>("/api/v1/auth/logout"),

  refresh: (refreshToken: string) =>
    mainApi.post<{ data: { access_token: string; refresh_token: string } }>("/api/v1/auth/refresh", {
      refresh_token: refreshToken,
    }),

  me: (params?: FieldSelectionParams) =>
    mainApi.get<{ data: User }>("/api/v1/auth/me", params),

  forgotPassword: (
    email: string,
    frontendService?: "web" | "admin" | "research" | "library"
  ) =>
    mainApi.post<void>("/api/v1/auth/forgot-password", {
      email,
      frontend_service: frontendService,
    }),

  resetPassword: (token: string, password: string) =>
    mainApi.post<void>("/api/v1/auth/reset-password", { token, new_password: password }),

  changePassword: (currentPassword: string, newPassword: string) =>
    mainApi.post<void>("/api/v1/auth/change-password", {
      old_password: currentPassword,
      new_password: newPassword,
    }),
};

export const universityInfoApi = {
  getCurrent: (params?: FieldSelectionParams) =>
    mainApi.get<{ data: UniversityInfo }>("/api/v1/university-info", params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: UniversityInfo }>(`/api/v1/university-info/${slug}`, params),
};

// Users
export const usersApi = {
  list: (params?: ListParams) =>
    mainApi.get<PaginatedResponse<User>>("/api/v1/users", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: User }>(`/api/v1/users/${id}`, params),

  create: (data: Partial<User> & { password: string }) =>
    mainApi.post<{ data: User }>("/api/v1/users", data),

  update: (id: string, data: Partial<User>) =>
    mainApi.patch<{ data: User }>(`/api/v1/users/${id}`, data),

  delete: (id: string) =>
    mainApi.delete<void>(`/api/v1/users/${id}`),

  assignRole: (userId: string, roleId: string, scopeType?: string, scopeId?: string) =>
    mainApi.post<void>(`/api/v1/users/${userId}/roles`, {
      role_id: roleId,
      scope_type: scopeType,
      scope_id: scopeId,
    }),

  removeRole: (userId: string, roleId: string) =>
    mainApi.delete<void>(`/api/v1/users/${userId}/roles/${roleId}`),

  sessions: (userId: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Session[] }>(`/api/v1/users/${userId}/sessions`, params),

  revokeSession: (userId: string, sessionId: string) =>
    mainApi.delete<void>(`/api/v1/users/${userId}/sessions/${sessionId}`),
};

// Persons
export const personsApi = {
  list: (params?: ListParams<{ type?: string }>) =>
    mainApi.get<PaginatedResponse<Person>>("/api/v1/persons", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Person }>(`/api/v1/persons/${id}`, params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Person }>(`/api/v1/persons/slug/${slug}`, params),

  create: (data: Partial<Person>) =>
    mainApi.post<{ data: Person }>("/api/v1/persons", data),

  update: (id: string, data: Partial<Person>) =>
    mainApi.patch<{ data: Person }>(`/api/v1/persons/${id}`, data),

  delete: (id: string) =>
    mainApi.delete<void>(`/api/v1/persons/${id}`),
};

// Divisions
export const divisionsApi = {
  list: (params?: ListParams) =>
    mainApi.get<PaginatedResponse<Division>>("/api/v1/divisions", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Division }>(`/api/v1/divisions/id/${id}`, params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Division }>(`/api/v1/divisions/${slug}`, params),

  create: (data: Partial<Division>) =>
    mainApi.post<{ data: Division }>("/api/v1/divisions", data),

  update: (id: string, data: Partial<Division>) =>
    mainApi.patch<{ data: Division }>(`/api/v1/divisions/id/${id}`, data),

  delete: (id: string) =>
    mainApi.delete<void>(`/api/v1/divisions/id/${id}`),
};

// Staff Assignments
export const staffApi = {
  listAssignments: (params?: ListParams<{ person_id?: string; entity_type?: string; entity_id?: string }>) =>
    mainApi.get<PaginatedResponse<StaffAssignment>>("/api/v1/staff/assignments", params),

  getAssignment: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: StaffAssignment }>(`/api/v1/staff/assignments/${id}`, params),

  getReportingChain: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: StaffAssignment[] }>(`/api/v1/staff/assignments/${id}/reporting-chain`, params),

  getDirectReports: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: StaffAssignment[] }>(`/api/v1/staff/assignments/${id}/direct-reports`, params),

  createAssignment: (data: Partial<StaffAssignment>) =>
    mainApi.post<{ data: StaffAssignment }>("/api/v1/staff/assignments", data),

  updateAssignment: (id: string, data: Partial<StaffAssignment>) =>
    mainApi.patch<{ data: StaffAssignment }>(`/api/v1/staff/assignments/${id}`, data),

  endAssignment: (id: string, data?: { end_date?: string; notes?: string }) =>
    mainApi.patch<{ data: StaffAssignment }>(`/api/v1/staff/assignments/${id}/end`, data),

  deleteAssignment: (id: string) =>
    mainApi.delete<void>(`/api/v1/staff/assignments/${id}`),

  checkConflict: (entity_type: string, entity_id?: string, role?: string, exclude_assignment_id?: string) =>
    mainApi.post<{ data: { has_conflict: boolean; current_holder: any } }>("/api/v1/staff/assignments/check-conflict", {
      entity_type,
      entity_id,
      role,
      exclude_assignment_id,
    }),

  getEntityTypes: () =>
    mainApi.get<{ data: any[] }>("/api/v1/staff/entity-types"),

  getRoles: (entity_type?: string) =>
    mainApi.get<{ data: any[] }>("/api/v1/staff/roles", entity_type ? { entity_type } : {}),

  getAcademicRanks: () =>
    mainApi.get<{ data: any[] }>("/api/v1/staff/academic-ranks"),
};

// Governance Boards
export const governanceApi = {
  listBoards: (params?: ListParams<{ board_type?: string; parent_entity_type?: string; parent_entity_id?: string }>) =>
    mainApi.get<PaginatedResponse<Board>>("/api/v1/governance/boards", params),

  getBoard: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Board }>(`/api/v1/governance/boards/${slug}`, params),

  getBoardMembers: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: StaffAssignment[] }>(`/api/v1/governance/boards/${slug}/members`, params),

  getCouncil: (params?: FieldSelectionParams) =>
    mainApi.get<{ data: Board }>("/api/v1/governance/council", params),

  getManagementBoard: (params?: FieldSelectionParams) =>
    mainApi.get<{ data: Board }>("/api/v1/governance/management-board", params),

  createBoard: (data: Partial<Board>) =>
    mainApi.post<{ data: Board }>("/api/v1/governance/boards", data),

  updateBoard: (id: string, data: Partial<Board>) =>
    mainApi.patch<{ data: Board }>(`/api/v1/governance/boards/id/${id}`, data),

  deleteBoard: (id: string) =>
    mainApi.delete<void>(`/api/v1/governance/boards/id/${id}`),

  addMember: (slug: string, personId: string, role: string, data?: Partial<StaffAssignment>) =>
    mainApi.post<{ data: StaffAssignment }>(`/api/v1/governance/boards/${slug}/members?person_id=${personId}&role=${role}`, data),

  removeMember: (slug: string, personId: string) =>
    mainApi.delete<void>(`/api/v1/governance/boards/${slug}/members/${personId}`),
};

// Schools
export const schoolsApi = {
  list: (params?: ListParams<{ campus_id?: string }>) =>
    mainApi.get<PaginatedResponse<School>>("/api/v1/schools", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: School }>(`/api/v1/schools/${id}`, params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: School }>(`/api/v1/schools/slug/${slug}`, params),

  create: (data: Partial<School>) =>
    mainApi.post<{ data: School }>("/api/v1/schools", data),

  update: (id: string, data: Partial<School>) =>
    mainApi.patch<{ data: School }>(`/api/v1/schools/${id}`, data),

  delete: (id: string) =>
    mainApi.delete<void>(`/api/v1/schools/${id}`),
};

// Departments
export const departmentsApi = {
  list: (params?: ListParams<{ school_id?: string }>) =>
    mainApi.get<PaginatedResponse<Department>>("/api/v1/departments", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Department }>(`/api/v1/departments/${id}`, params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Department }>(`/api/v1/departments/slug/${slug}`, params),

  create: (data: Partial<Department>) =>
    mainApi.post<{ data: Department }>("/api/v1/departments", data),

  update: (id: string, data: Partial<Department>) =>
    mainApi.patch<{ data: Department }>(`/api/v1/departments/${id}`, data),

  delete: (id: string) =>
    mainApi.delete<void>(`/api/v1/departments/${id}`),
};

// Programmes
export const programmesApi = {
  list: (params?: ListParams<{ department_id?: string; level?: string }>) =>
    mainApi.get<PaginatedResponse<Programme>>("/api/v1/programmes", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Programme }>(`/api/v1/programmes/${id}`, params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Programme }>(`/api/v1/programmes/slug/${slug}`, params),

  create: (data: Partial<Programme>) =>
    mainApi.post<{ data: Programme }>("/api/v1/programmes", data),

  update: (id: string, data: Partial<Programme>) =>
    mainApi.patch<{ data: Programme }>(`/api/v1/programmes/${id}`, data),

  delete: (id: string) =>
    mainApi.delete<void>(`/api/v1/programmes/${id}`),
};

// Intakes
export const intakesApi = {
  list: (params?: ListParams<{ is_open?: boolean }>) =>
    mainApi.get<PaginatedResponse<Intake>>("/api/v1/intakes", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Intake }>(`/api/v1/intakes/${id}`, params),

  create: (data: Partial<Intake>) =>
    mainApi.post<{ data: Intake }>("/api/v1/intakes", data),

  update: (id: string, data: Partial<Intake>) =>
    mainApi.patch<{ data: Intake }>(`/api/v1/intakes/${id}`, data),

  delete: (id: string) =>
    mainApi.delete<void>(`/api/v1/intakes/${id}`),
};

// News
export const newsApi = {
  list: (params?: ListParams<{ category?: string; is_published?: boolean }>) =>
    mainApi.get<PaginatedResponse<News>>("/api/v1/news", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: News }>(`/api/v1/news/${id}`, params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: News }>(`/api/v1/news/slug/${slug}`, params),

  create: (data: Partial<News>) =>
    mainApi.post<{ data: News }>("/api/v1/news", data),

  update: (id: string, data: Partial<News>) =>
    mainApi.patch<{ data: News }>(`/api/v1/news/${id}`, data),

  delete: (id: string) =>
    mainApi.delete<void>(`/api/v1/news/${id}`),

  publish: (id: string) =>
    mainApi.post<{ data: News }>(`/api/v1/news/${id}/publish`),

  unpublish: (id: string) =>
    mainApi.post<{ data: News }>(`/api/v1/news/${id}/unpublish`),
};

// Blogs
export const blogsApi = {
  list: (params?: ListParams<{ category?: string; is_published?: boolean }>) =>
    mainApi.get<PaginatedResponse<Blog>>("/api/v1/blogs", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Blog }>(`/api/v1/blogs/id/${id}`, params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Blog }>(`/api/v1/blogs/${slug}`, params),

  create: (data: Partial<Blog>) =>
    mainApi.post<{ data: Blog }>("/api/v1/blogs", data),

  update: (id: string, data: Partial<Blog>) =>
    mainApi.patch<{ data: Blog }>(`/api/v1/blogs/id/${id}`, data),

  delete: (id: string) =>
    mainApi.delete<void>(`/api/v1/blogs/id/${id}`),
};

// Events
export const eventsApi = {
  list: (params?: ListParams<{ event_type?: string; upcoming?: boolean }>) =>
    mainApi.get<PaginatedResponse<Event>>("/api/v1/events", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Event }>(`/api/v1/events/${id}`, params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Event }>(`/api/v1/events/slug/${slug}`, params),

  create: (data: Partial<Event>) =>
    mainApi.post<{ data: Event }>("/api/v1/events", data),

  update: (id: string, data: Partial<Event>) =>
    mainApi.patch<{ data: Event }>(`/api/v1/events/${id}`, data),

  delete: (id: string) =>
    mainApi.delete<void>(`/api/v1/events/${id}`),
};

// Announcements
export const announcementsApi = {
  list: (params?: ListParams<{ priority?: string }>) =>
    mainApi.get<PaginatedResponse<Announcement>>("/api/v1/announcements", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Announcement }>(`/api/v1/announcements/${id}`, params),

  create: (data: Partial<Announcement>) =>
    mainApi.post<{ data: Announcement }>("/api/v1/announcements", data),

  update: (id: string, data: Partial<Announcement>) =>
    mainApi.patch<{ data: Announcement }>(`/api/v1/announcements/${id}`, data),

  delete: (id: string) =>
    mainApi.delete<void>(`/api/v1/announcements/${id}`),
};

// Sliders
export const slidersApi = {
  listGroups: (params?: ListParams) =>
    mainApi.get<PaginatedResponse<SliderGroup>>("/api/v1/slider-groups", params),

  getGroup: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: SliderGroup }>(`/api/v1/slider-groups/${id}`, params),

  createGroup: (data: Partial<SliderGroup>) =>
    mainApi.post<{ data: SliderGroup }>("/api/v1/slider-groups", data),

  updateGroup: (id: string, data: Partial<SliderGroup>) =>
    mainApi.patch<{ data: SliderGroup }>(`/api/v1/slider-groups/${id}`, data),

  deleteGroup: (id: string) =>
    mainApi.delete<void>(`/api/v1/slider-groups/${id}`),

  listSliders: (groupId: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Slider[] }>(`/api/v1/slider-groups/${groupId}/sliders`, params),

  createSlider: (groupId: string, data: Partial<Slider>) =>
    mainApi.post<{ data: Slider }>(`/api/v1/slider-groups/${groupId}/sliders`, data),

  updateSlider: (groupId: string, sliderId: string, data: Partial<Slider>) =>
    mainApi.patch<{ data: Slider }>(`/api/v1/slider-groups/${groupId}/sliders/${sliderId}`, data),

  deleteSlider: (groupId: string, sliderId: string) =>
    mainApi.delete<void>(`/api/v1/slider-groups/${groupId}/sliders/${sliderId}`),
};

// Media
export const mediaApi = {
  list: (params?: ListParams<{ folder_id?: string; mime_type?: string }>) =>
    mainApi.get<PaginatedResponse<Media>>("/api/v1/media", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Media }>(`/api/v1/media/${id}`, params),

  upload: async (file: File, folderId?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (folderId) formData.append("folder_id", folderId);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MAIN_API_URL || "http://localhost:8000"}/api/v1/media`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    return response.json() as Promise<{ data: Media }>;
  },

  delete: (id: string) =>
    mainApi.delete<void>(`/api/v1/media/${id}`),
};

// FAQs
export const faqsApi = {
  list: (params?: ListParams<{ category?: string }>) =>
    mainApi.get<PaginatedResponse<FAQ>>("/api/v1/faqs", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: FAQ }>(`/api/v1/faqs/${id}`, params),

  create: (data: Partial<FAQ>) =>
    mainApi.post<{ data: FAQ }>("/api/v1/faqs", data),

  update: (id: string, data: Partial<FAQ>) =>
    mainApi.patch<{ data: FAQ }>(`/api/v1/faqs/${id}`, data),

  delete: (id: string) =>
    mainApi.delete<void>(`/api/v1/faqs/${id}`),
};

// Testimonials
export const testimonialsApi = {
  list: (params?: ListParams<{ type?: string; is_featured?: boolean }>) =>
    mainApi.get<PaginatedResponse<Testimonial>>("/api/v1/testimonials", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Testimonial }>(`/api/v1/testimonials/${id}`, params),

  create: (data: Partial<Testimonial>) =>
    mainApi.post<{ data: Testimonial }>("/api/v1/testimonials", data),

  update: (id: string, data: Partial<Testimonial>) =>
    mainApi.patch<{ data: Testimonial }>(`/api/v1/testimonials/${id}`, data),

  delete: (id: string) =>
    mainApi.delete<void>(`/api/v1/testimonials/${id}`),

  approve: (id: string) =>
    mainApi.post<{ data: Testimonial }>(`/api/v1/testimonials/${id}/approve`),
};

// Roles
export const rolesApi = {
  list: (params?: ListParams) =>
    mainApi.get<PaginatedResponse<Role>>("/api/v1/roles", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Role }>(`/api/v1/roles/${id}`, params),

  create: (data: Partial<Role>) =>
    mainApi.post<{ data: Role }>("/api/v1/roles", data),

  update: (id: string, data: Partial<Role>) =>
    mainApi.patch<{ data: Role }>(`/api/v1/roles/${id}`, data),

  delete: (id: string) =>
    mainApi.delete<void>(`/api/v1/roles/${id}`),
};

// Permissions
export const permissionsApi = {
  list: (params?: FieldSelectionParams) =>
    mainApi.get<{ data: Permission[] }>("/api/v1/permissions", params),
};

// Audit Logs
export const auditLogsApi = {
  list: (params?: ListParams<{ user_id?: string; action?: string; entity_type?: string }>) =>
    mainApi.get<PaginatedResponse<AuditLog>>("/api/v1/audit-logs", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: AuditLog }>(`/api/v1/audit-logs/${id}`, params),
};

// API Keys (System)
export const apiKeysApi = {
  list: (params?: ListParams) =>
    mainApi.get<PaginatedResponse<ApiKey>>("/admin/system/api-keys", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: ApiKey }>(`/admin/system/api-keys/${id}`, params),

  create: (data: Partial<ApiKey>) =>
    mainApi.post<{ data: ApiKey }>("/admin/system/api-keys", data),

  update: (id: string, data: Partial<ApiKey>) =>
    mainApi.patch<{ data: ApiKey }>(`/admin/system/api-keys/${id}`, data),

  delete: (id: string) =>
    mainApi.delete<void>(`/admin/system/api-keys/${id}`),

  regenerate: (id: string) =>
    mainApi.post<{ data: ApiKey }>(`/admin/system/api-keys/${id}/regenerate`),
};

// Settings (System)
export const settingsApi = {
  list: (params?: ListParams<{ category?: string }>) =>
    mainApi.get<PaginatedResponse<Setting>>("/admin/system/settings", params),

  get: (key: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Setting }>(`/admin/system/settings/${key}`, params),

  update: (key: string, data: Partial<Setting>) =>
    mainApi.patch<{ data: Setting }>(`/admin/system/settings/${key}`, data),

  bulkUpdate: (data: Record<string, string>) =>
    mainApi.post<void>("/admin/system/settings/bulk", data),
};

// Leadership (Public)
export const leadershipApi = {
  getByRole: (params: {
    role: string;
    entity_type?: string;
    entity_id?: string;
    fields?: string;
    include?: string;
  }) =>
    mainApi.get<{ data: StaffAssignment | null }>("/api/v1/public/leadership", params),

  getViceChancellor: (params?: FieldSelectionParams) =>
    mainApi.get<{ data: StaffAssignment | null }>("/api/v1/public/leadership/vice-chancellor", params),

  getDean: (schoolId: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: StaffAssignment | null }>(`/api/v1/public/leadership/dean/${schoolId}`, params),

  getHOD: (departmentId: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: StaffAssignment | null }>(`/api/v1/public/leadership/hod/${departmentId}`, params),

  getDirector: (divisionId: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: StaffAssignment | null }>(`/api/v1/public/leadership/director/${divisionId}`, params),

  listByEntity: (params: {
    entity_type: string;
    entity_id?: string;
    fields?: string;
    include?: string;
  }) =>
    mainApi.get<PaginatedResponse<StaffAssignment>>("/api/v1/public/leadership/list", params),
};
