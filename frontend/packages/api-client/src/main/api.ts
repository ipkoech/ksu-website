import { mainApi } from "../client";
import { getStoredAccessToken } from "../auth-tokens";
import type {
  User,
  Person,
  PersonCreatePayload,
  PersonStatusFilter,
  PersonUpdatePayload,
  StaffAssignment,
  StaffAssignmentActivatePayload,
  StaffAssignmentConflict,
  StaffAssignmentConflictCheckPayload,
  StaffAssignmentCreatePayload,
  StaffAssignmentEndPayload,
  StaffAssignmentReassignPayload,
  StaffAssignmentStatusFilter,
  StaffAssignmentUpdatePayload,
  StaffEntityOption,
  StaffRoleOption,
  Board,
  BoardMemberCreatePayload,
  School,
  Division,
  Wing,
  Department,
  Programme,
  Club,
  Accommodation,
  SportsFacility,
  ArtsCulture,
  StudentGovernance,
  Alumni,
  AlumniAssociation,
  Document,
  Intake,
  AcademicCalendar,
  AdmissionInfo,
  News,
  Blog,
  Event,
  Announcement,
  SliderGroup,
  Slider,
  Media,
  MediaFolder,
  MediaLink,
  FAQ,
  ContactDirectory,
  Testimonial,
  Role,
  Permission,
  UniversityInfo,
  AuditLog,
  AdminActivityReport,
  AnalyticsEventPayload,
  ApiKey,
  ContentReport,
  ImportCommitRequest,
  ImportCommitResult,
  ImportPreview,
  ImportResource,
  Setting,
  SearchPayload,
  ReportsOverview,
  TrafficReport,
  LoginRequest,
  LoginResponse,
  MediaFolderCreatePayload,
  MediaFolderUpdatePayload,
  MediaLinkCreatePayload,
  MediaLinkUpdatePayload,
  MediaUpdatePayload,
  MediaUploadOptions,
  PaginatedResponse,
  PublicStatsResponse,
} from "./types";
import type { FieldSelectionParams, QueryParams } from "../client";

type ListParams<
  T extends Record<string, string | number | boolean | undefined> = Record<
    string,
    string | number | boolean | undefined
  >,
> = QueryParams & T;
const MAIN_API_BASE_URL =
  process.env.NEXT_PUBLIC_MAIN_API_URL || "http://localhost:8000";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function resolveMainMediaUrl(value?: string | null): string | undefined {
  const rawValue = value?.trim();
  if (!rawValue) return undefined;
  if (/^(https?:|data:|blob:)/i.test(rawValue)) return rawValue;

  let path = rawValue;
  while (/^\/?uploads\/uploads\//.test(path)) {
    path = path.replace(/^\/?uploads\/uploads\//, "/uploads/");
  }
  if (!path.startsWith("/")) {
    path = path.startsWith("uploads/") ? `/${path}` : `/uploads/${path}`;
  }
  while (/^\/uploads\/uploads\//.test(path)) {
    path = path.replace(/^\/uploads\/uploads\//, "/uploads/");
  }

  return new URL(path, MAIN_API_BASE_URL).toString();
}

async function parseImportResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.message || "Import request failed");
  }
  return response.json() as Promise<T>;
}

// Auth
export const authApi = {
  login: (data: LoginRequest) =>
    mainApi.post<LoginResponse>("/api/v1/auth/login", data),

  logout: () => mainApi.post<void>("/api/v1/auth/logout"),

  refresh: (refreshToken: string) =>
    mainApi.post<{ data: { access_token: string; refresh_token: string } }>(
      "/api/v1/auth/refresh",
      {
        refresh_token: refreshToken,
      },
    ),

  me: (params?: FieldSelectionParams) =>
    mainApi.get<{ data: User }>("/api/v1/auth/me", params),

  forgotPassword: (
    email: string,
    frontendService?: "web" | "admin" | "research" | "library",
  ) =>
    mainApi.post<void>("/api/v1/auth/forgot-password", {
      email,
      frontend_service: frontendService,
    }),

  resetPassword: (token: string, password: string) =>
    mainApi.post<void>("/api/v1/auth/reset-password", {
      token,
      new_password: password,
    }),

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
    mainApi.get<{ data: UniversityInfo }>(
      `/api/v1/university-info/${slug}`,
      params,
    ),
};

export const statsApi = {
  get: (
    params?: ListParams<{
      scope?: "homepage" | "university" | "school" | "department";
      slug?: string;
    }>,
  ) => mainApi.get<{ data: PublicStatsResponse }>("/api/v1/stats", params),
  admin: () =>
    mainApi.get<{ data: PublicStatsResponse }>("/api/v1/stats/admin"),
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

  delete: (id: string) => mainApi.delete<void>(`/api/v1/users/${id}`),
};

// Persons
export const personsApi = {
  list: (
    params?: ListParams<{
      search?: string;
      department_id?: string;
      school_id?: string;
      academic_rank?: string;
      employment_type?: string;
      status?: PersonStatusFilter;
    }>,
  ) => mainApi.get<PaginatedResponse<Person>>("/api/v1/persons", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Person }>(`/api/v1/persons/${id}`, params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Person }>(`/api/v1/persons/${slug}`, params),

  create: (data: PersonCreatePayload) =>
    mainApi.post<{ data: Person }>("/api/v1/persons", data),

  update: (id: string, data: PersonUpdatePayload) =>
    mainApi.patch<{ data: Person }>(`/api/v1/persons/${id}`, data),

  activate: (id: string) =>
    mainApi.patch<{ data: Person }>(`/api/v1/persons/${id}/activate`),

  deactivate: (id: string) =>
    mainApi.patch<{ data: Person }>(`/api/v1/persons/${id}/deactivate`),

  uploadPhoto: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = getStoredAccessToken();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MAIN_API_URL || "http://localhost:8000"}/api/v1/persons/${id}/photo`,
      {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      },
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Profile photo upload failed");
    }
    return response.json() as Promise<{ data: Person }>;
  },

  removePhoto: (id: string) =>
    mainApi.delete<{ data: Person }>(`/api/v1/persons/${id}/photo`),

  delete: (id: string) => mainApi.delete<void>(`/api/v1/persons/${id}`),
};

// Divisions
export const divisionsApi = {
  list: (params?: ListParams<{ is_active?: boolean }>) =>
    mainApi.get<PaginatedResponse<Division>>("/api/v1/divisions", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Division }>(`/api/v1/divisions/id/${id}`, params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Division }>(`/api/v1/divisions/${slug}`, params),

  create: (data: Partial<Division>) =>
    mainApi.post<{ data: Division }>("/api/v1/divisions", data),

  update: (id: string, data: Partial<Division>) =>
    mainApi.patch<{ data: Division }>(`/api/v1/divisions/id/${id}`, data),

  delete: (id: string) => mainApi.delete<void>(`/api/v1/divisions/id/${id}`),
};

// Wings
export const wingsApi = {
  listByDivision: (
    divisionId: string,
    params?: FieldSelectionParams & { is_active?: boolean },
  ) =>
    mainApi.get<{ data: Wing[] }>(
      `/api/v1/wings/division/${divisionId}`,
      params,
    ),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Wing }>(`/api/v1/wings/${id}`, params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Wing }>(`/api/v1/wings/slug/${slug}`, params),

  create: (data: Partial<Wing>) =>
    mainApi.post<{ data: Wing }>("/api/v1/wings", data),

  update: (id: string, data: Partial<Wing>) =>
    mainApi.patch<{ data: Wing }>(`/api/v1/wings/${id}`, data),
};

// Staff Assignments
export const staffApi = {
  listAssignments: (
    params?: ListParams<{
      person_id?: string;
      entity_type?: string;
      entity_id?: string;
      status?: StaffAssignmentStatusFilter;
    }>,
  ) =>
    mainApi.get<{ data: StaffAssignment[] }>(
      "/api/v1/staff/assignments",
      params,
    ),

  getAssignment: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: StaffAssignment }>(
      `/api/v1/staff/assignments/${id}`,
      params,
    ),

  getReportingChain: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: StaffAssignment[] }>(
      `/api/v1/staff/assignments/${id}/reporting-chain`,
      params,
    ),

  getDirectReports: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: StaffAssignment[] }>(
      `/api/v1/staff/assignments/${id}/direct-reports`,
      params,
    ),

  createAssignment: (data: StaffAssignmentCreatePayload) =>
    mainApi.post<{ data: StaffAssignment }>("/api/v1/staff/assignments", data),

  updateAssignment: (id: string, data: StaffAssignmentUpdatePayload) =>
    mainApi.patch<{ data: StaffAssignment }>(
      `/api/v1/staff/assignments/${id}`,
      data,
    ),

  endAssignment: (id: string, data: StaffAssignmentEndPayload = {}) =>
    mainApi.patch<{ data: StaffAssignment }>(
      `/api/v1/staff/assignments/${id}/end`,
      data,
    ),

  activateAssignment: (id: string, data: StaffAssignmentActivatePayload = {}) =>
    mainApi.patch<{ data: StaffAssignment }>(
      `/api/v1/staff/assignments/${id}/activate`,
      data,
    ),

  reassignAssignment: (id: string, data: StaffAssignmentReassignPayload) =>
    mainApi.post<{ data: StaffAssignment }>(
      `/api/v1/staff/assignments/${id}/reassign`,
      data,
    ),

  deleteAssignment: (id: string) =>
    mainApi.delete<void>(`/api/v1/staff/assignments/${id}`),

  checkConflict: (data: StaffAssignmentConflictCheckPayload) =>
    mainApi.post<{ data: StaffAssignmentConflict }>(
      "/api/v1/staff/assignments/check-conflict",
      data,
    ),

  listEntities: (params: {
    entity_type: string;
    search?: string;
    limit?: number;
  }) =>
    mainApi.get<{ data: StaffEntityOption[] }>(
      "/api/v1/staff/entities",
      params,
    ),

  getEntityTypes: () =>
    mainApi.get<{ data: any[] }>("/api/v1/staff/entity-types"),

  getRoles: (entity_type?: string) =>
    mainApi.get<{ data: StaffRoleOption[] }>(
      "/api/v1/staff/roles",
      entity_type ? { entity_type } : {},
    ),

  getAcademicRanks: () =>
    mainApi.get<{ data: any[] }>("/api/v1/staff/academic-ranks"),
};

// Governance Boards
export const governanceApi = {
  listBoards: (
    params?: ListParams<{
      board_type?: string;
      parent_entity_type?: string;
      parent_entity_id?: string;
    }>,
  ) => mainApi.get<{ data: Board[] }>("/api/v1/governance/boards", params),

  getBoard: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Board }>(`/api/v1/governance/boards/id/${id}`, params),

  getBoardBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Board }>(`/api/v1/governance/boards/${slug}`, params),

  getBoardMembers: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: StaffAssignment[] }>(
      `/api/v1/governance/boards/id/${id}/members`,
      params,
    ),

  getBoardMembersBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: StaffAssignment[] }>(
      `/api/v1/governance/boards/${slug}/members`,
      params,
    ),

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

  addMember: (idOrSlug: string, data: BoardMemberCreatePayload) =>
    mainApi.post<{ data: StaffAssignment }>(
      UUID_PATTERN.test(idOrSlug)
        ? `/api/v1/governance/boards/id/${idOrSlug}/members`
        : `/api/v1/governance/boards/${idOrSlug}/members`,
      data,
    ),

  removeMember: (idOrSlug: string, personId: string) =>
    mainApi.delete<void>(
      UUID_PATTERN.test(idOrSlug)
        ? `/api/v1/governance/boards/id/${idOrSlug}/members/${personId}`
        : `/api/v1/governance/boards/${idOrSlug}/members/${personId}`,
    ),
};

// Schools
export const schoolsApi = {
  list: (
    params?: ListParams<{
      campus_id?: string;
      administrative_wing_id?: string;
      search?: string;
    }>,
  ) => mainApi.get<PaginatedResponse<School>>("/api/v1/schools", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: School }>(`/api/v1/schools/id/${id}`, params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: School }>(`/api/v1/schools/${slug}`, params),

  departments: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Department[] }>(
      `/api/v1/schools/${slug}/departments`,
      params,
    ),

  staff: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Person[] }>(`/api/v1/schools/${slug}/staff`, params),

  programmes: (
    slug: string,
    params?: ListParams<{ level?: string; mode_of_study?: string }>,
  ) =>
    mainApi.get<PaginatedResponse<Programme>>(
      `/api/v1/schools/${slug}/programmes`,
      params,
    ),

  create: (data: Partial<School>) =>
    mainApi.post<{ data: School }>("/api/v1/schools", data),

  update: (id: string, data: Partial<School>) =>
    mainApi.patch<{ data: School }>(`/api/v1/schools/${id}`, data),

  delete: (id: string) => mainApi.delete<void>(`/api/v1/schools/${id}`),
};

// Departments
export const departmentsApi = {
  list: (
    params?: ListParams<{
      school_id?: string;
      wing_id?: string;
      department_type?: string;
      search?: string;
    }>,
  ) =>
    mainApi.get<PaginatedResponse<Department>>("/api/v1/departments", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Department }>(`/api/v1/departments/id/${id}`, params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Department }>(`/api/v1/departments/${slug}`, params),

  staff: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Person[] }>(
      `/api/v1/departments/${slug}/staff`,
      params,
    ),

  services: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: unknown[] }>(
      `/api/v1/departments/${slug}/services`,
      params,
    ),

  programmes: (
    slug: string,
    params?: ListParams<{ level?: string; mode_of_study?: string }>,
  ) =>
    mainApi.get<PaginatedResponse<Programme>>(
      `/api/v1/departments/${slug}/programmes`,
      params,
    ),

  create: (data: Partial<Department>) =>
    mainApi.post<{ data: Department }>("/api/v1/departments", data),

  update: (id: string, data: Partial<Department>) =>
    mainApi.patch<{ data: Department }>(`/api/v1/departments/${id}`, data),

  delete: (id: string) => mainApi.delete<void>(`/api/v1/departments/${id}`),
};

// Programmes
export const programmesApi = {
  list: (
    params?: ListParams<{
      q?: string;
      school_id?: string;
      department_id?: string;
      level?: string;
      mode_of_study?: string;
    }>,
  ) => mainApi.get<PaginatedResponse<Programme>>("/api/v1/programmes", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Programme }>(`/api/v1/programmes/id/${id}`, params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Programme }>(`/api/v1/programmes/${slug}`, params),

  staff: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Person[] }>(`/api/v1/programmes/${slug}/staff`, params),

  create: (data: Partial<Programme>) =>
    mainApi.post<{ data: Programme }>("/api/v1/programmes", data),

  update: (id: string, data: Partial<Programme>) =>
    mainApi.patch<{ data: Programme }>(`/api/v1/programmes/${id}`, data),

  addTutor: (
    id: string,
    data: { person_id: string; role?: string; is_lead?: boolean },
  ) => mainApi.post<{ data: unknown }>(`/api/v1/programmes/${id}/tutors`, data),

  addIntake: (
    id: string,
    data: {
      intake_id: string;
      slots_available?: number;
      application_deadline?: string;
      is_active?: boolean;
    },
  ) =>
    mainApi.post<{ data: unknown }>(`/api/v1/programmes/${id}/intakes`, data),

  delete: (id: string) => mainApi.delete<void>(`/api/v1/programmes/${id}`),
};

// Clubs
export const clubsApi = {
  list: (
    params?: ListParams<{
      q?: string;
      club_type?: string;
      school_id?: string;
      department_id?: string;
      is_active?: boolean;
    }>,
  ) => mainApi.get<PaginatedResponse<Club>>("/api/v1/clubs", params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Club }>(`/api/v1/clubs/${slug}`, params),

  activities: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: unknown[] }>(
      `/api/v1/clubs/${slug}/activities`,
      params,
    ),

  create: (data: Partial<Club>) =>
    mainApi.post<{ data: Club }>("/api/v1/clubs", data),

  update: (id: string, data: Partial<Club>) =>
    mainApi.patch<{ data: Club }>(`/api/v1/clubs/${id}`, data),

  delete: (id: string) => mainApi.delete<void>(`/api/v1/clubs/${id}`),
};

export const accommodationsApi = {
  list: (
    params?: ListParams<{
      campus_id?: string;
      accommodation_type?: string;
      gender?: string;
      is_active?: boolean;
      is_accepting_applications?: boolean;
    }>,
  ) =>
    mainApi.get<PaginatedResponse<Accommodation>>(
      "/api/v1/accommodations",
      params,
    ),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Accommodation }>(
      `/api/v1/accommodations/${slug}`,
      params,
    ),

  create: (data: Partial<Accommodation>) =>
    mainApi.post<{ data: Accommodation }>("/api/v1/accommodations", data),

  update: (id: string, data: Partial<Accommodation>) =>
    mainApi.patch<{ data: Accommodation }>(
      `/api/v1/accommodations/${id}`,
      data,
    ),

  delete: (id: string) => mainApi.delete<void>(`/api/v1/accommodations/${id}`),
};

export const sportsFacilitiesApi = {
  list: (
    params?: ListParams<{
      campus_id?: string;
      facility_type?: string;
      is_active?: boolean;
    }>,
  ) =>
    mainApi.get<PaginatedResponse<SportsFacility>>(
      "/api/v1/sports-facilities",
      params,
    ),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: SportsFacility }>(
      `/api/v1/sports-facilities/${slug}`,
      params,
    ),

  create: (data: Partial<SportsFacility>) =>
    mainApi.post<{ data: SportsFacility }>("/api/v1/sports-facilities", data),

  update: (id: string, data: Partial<SportsFacility>) =>
    mainApi.patch<{ data: SportsFacility }>(
      `/api/v1/sports-facilities/${id}`,
      data,
    ),

  delete: (id: string) =>
    mainApi.delete<void>(`/api/v1/sports-facilities/${id}`),
};

export const artsCultureApi = {
  list: (
    params?: ListParams<{
      category?: string;
      school_id?: string;
      club_id?: string;
      is_active?: boolean;
    }>,
  ) =>
    mainApi.get<PaginatedResponse<ArtsCulture>>("/api/v1/arts-culture", params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: ArtsCulture }>(`/api/v1/arts-culture/${slug}`, params),

  create: (data: Partial<ArtsCulture>) =>
    mainApi.post<{ data: ArtsCulture }>("/api/v1/arts-culture", data),

  update: (id: string, data: Partial<ArtsCulture>) =>
    mainApi.patch<{ data: ArtsCulture }>(`/api/v1/arts-culture/${id}`, data),

  delete: (id: string) => mainApi.delete<void>(`/api/v1/arts-culture/${id}`),
};

export const studentGovernanceApi = {
  list: (
    params?: ListParams<{
      governance_type?: string;
      school_id?: string;
      is_active?: boolean;
    }>,
  ) =>
    mainApi.get<PaginatedResponse<StudentGovernance>>(
      "/api/v1/student-governance",
      params,
    ),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: StudentGovernance }>(
      `/api/v1/student-governance/${slug}`,
      params,
    ),

  create: (data: Partial<StudentGovernance>) =>
    mainApi.post<{ data: StudentGovernance }>(
      "/api/v1/student-governance",
      data,
    ),

  update: (id: string, data: Partial<StudentGovernance>) =>
    mainApi.patch<{ data: StudentGovernance }>(
      `/api/v1/student-governance/${id}`,
      data,
    ),

  delete: (id: string) =>
    mainApi.delete<void>(`/api/v1/student-governance/${id}`),
};

export const alumniApi = {
  list: (
    params?: ListParams<{
      school_id?: string;
      programme_id?: string;
      graduation_year?: number;
      mentor_only?: boolean;
    }>,
  ) => mainApi.get<PaginatedResponse<Alumni>>("/api/v1/alumni", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Alumni }>(`/api/v1/alumni/${id}`, params),

  create: (data: Partial<Alumni>) =>
    mainApi.post<{ data: Alumni }>("/api/v1/alumni", data),

  update: (id: string, data: Partial<Alumni>) =>
    mainApi.patch<{ data: Alumni }>(`/api/v1/alumni/${id}`, data),

  delete: (id: string) => mainApi.delete<void>(`/api/v1/alumni/${id}`),
};

export const alumniAssociationsApi = {
  list: (
    params?: ListParams<{ association_type?: string; school_id?: string }>,
  ) =>
    mainApi.get<PaginatedResponse<AlumniAssociation>>(
      "/api/v1/alumni-associations",
      params,
    ),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: AlumniAssociation }>(
      `/api/v1/alumni-associations/${slug}`,
      params,
    ),

  members: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: unknown[] }>(
      `/api/v1/alumni-associations/${slug}/members`,
      params,
    ),

  create: (data: Partial<AlumniAssociation>) =>
    mainApi.post<{ data: AlumniAssociation }>(
      "/api/v1/alumni-associations",
      data,
    ),

  update: (id: string, data: Partial<AlumniAssociation>) =>
    mainApi.patch<{ data: AlumniAssociation }>(
      `/api/v1/alumni-associations/${id}`,
      data,
    ),

  delete: (id: string) =>
    mainApi.delete<void>(`/api/v1/alumni-associations/${id}`),
};

// Documents
export const documentsApi = {
  list: (
    params?: ListParams<{
      q?: string;
      document_type?: string;
      category?: string;
      scope_type?: string;
      scope_id?: string;
    }>,
  ) => mainApi.get<PaginatedResponse<Document>>("/api/v1/documents", params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Document }>(`/api/v1/documents/${slug}`, params),

  create: (data: Partial<Document>) =>
    mainApi.post<{ data: Document }>("/api/v1/documents", data),

  update: (id: string, data: Partial<Document>) =>
    mainApi.patch<{ data: Document }>(`/api/v1/documents/${id}`, data),

  delete: (id: string) => mainApi.delete<void>(`/api/v1/documents/${id}`),
};

// Intakes
export const intakesApi = {
  list: (
    params?: ListParams<{ academic_calendar_id?: string; is_open?: boolean }>,
  ) => mainApi.get<PaginatedResponse<Intake>>("/api/v1/intakes", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Intake }>(`/api/v1/intakes/id/${id}`, params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Intake }>(`/api/v1/intakes/${slug}`, params),

  create: (data: Partial<Intake>) =>
    mainApi.post<{ data: Intake }>("/api/v1/intakes", data),

  update: (id: string, data: Partial<Intake>) =>
    mainApi.patch<{ data: Intake }>(`/api/v1/intakes/${id}`, data),

  delete: (id: string) => mainApi.delete<void>(`/api/v1/intakes/${id}`),
};

// Academic calendars
export const academicCalendarsApi = {
  list: (params?: ListParams<{ academic_year?: string; status?: string }>) =>
    mainApi.get<PaginatedResponse<AcademicCalendar>>(
      "/api/v1/academic-calendars",
      params,
    ),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: AcademicCalendar }>(
      `/api/v1/academic-calendars/id/${id}`,
      params,
    ),

  create: (data: Partial<AcademicCalendar>) =>
    mainApi.post<{ data: AcademicCalendar }>(
      "/api/v1/academic-calendars",
      data,
    ),

  update: (id: string, data: Partial<AcademicCalendar>) =>
    mainApi.patch<{ data: AcademicCalendar }>(
      `/api/v1/academic-calendars/${id}`,
      data,
    ),

  delete: (id: string) =>
    mainApi.delete<void>(`/api/v1/academic-calendars/${id}`),
};

// Admission information
export const admissionsApi = {
  list: (
    params?: ListParams<{
      content_type?: string;
      audience_level?: string;
      school_id?: string;
    }>,
  ) =>
    mainApi.get<PaginatedResponse<AdmissionInfo>>("/api/v1/admissions", params),

  listAdmin: (
    params?: ListParams<{
      content_type?: string;
      audience_level?: string;
      school_id?: string;
      is_published?: boolean;
    }>,
  ) =>
    mainApi.get<PaginatedResponse<AdmissionInfo>>(
      "/api/v1/admissions/admin",
      params,
    ),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: AdmissionInfo }>(`/api/v1/admissions/id/${id}`, params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: AdmissionInfo }>(`/api/v1/admissions/${slug}`, params),

  create: (data: Partial<AdmissionInfo>) =>
    mainApi.post<{ data: AdmissionInfo }>("/api/v1/admissions", data),

  update: (id: string, data: Partial<AdmissionInfo>) =>
    mainApi.patch<{ data: AdmissionInfo }>(`/api/v1/admissions/${id}`, data),

  delete: (id: string) => mainApi.delete<void>(`/api/v1/admissions/${id}`),
};

// News
export const newsApi = {
  list: (
    params?: ListParams<{
      scope_type?: string;
      scope_id?: string;
      is_main?: boolean;
      is_published?: boolean;
      search?: string;
    }>,
  ) => mainApi.get<PaginatedResponse<News>>("/api/v1/news", params),

  listAdmin: (
    params?: ListParams<{
      scope_type?: string;
      scope_id?: string;
      is_main?: boolean;
      is_published?: boolean;
      status?: string;
      search?: string;
    }>,
  ) => mainApi.get<PaginatedResponse<News>>("/api/v1/news/admin", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: News }>(`/api/v1/news/id/${id}`, params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: News }>(`/api/v1/news/${slug}`, params),

  create: (data: Partial<News>) =>
    mainApi.post<{ data: News }>("/api/v1/news", data),

  update: (id: string, data: Partial<News>) =>
    mainApi.patch<{ data: News }>(`/api/v1/news/${id}`, data),

  publish: (id: string) =>
    mainApi.post<{ data: News }>(`/api/v1/news/${id}/publish`),

  unpublish: (id: string) =>
    mainApi.post<{ data: News }>(`/api/v1/news/${id}/unpublish`),

  delete: (id: string) => mainApi.delete<void>(`/api/v1/news/${id}`),
};

// Blogs
export const blogsApi = {
  list: (
    params?: ListParams<{
      scope_type?: string;
      scope_id?: string;
      is_main?: boolean;
      is_published?: boolean;
      search?: string;
    }>,
  ) => mainApi.get<PaginatedResponse<Blog>>("/api/v1/blogs", params),

  listAdmin: (
    params?: ListParams<{
      scope_type?: string;
      scope_id?: string;
      is_main?: boolean;
      is_published?: boolean;
      status?: string;
      search?: string;
    }>,
  ) => mainApi.get<PaginatedResponse<Blog>>("/api/v1/blogs/admin", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Blog }>(`/api/v1/blogs/id/${id}`, params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Blog }>(`/api/v1/blogs/${slug}`, params),

  create: (data: Partial<Blog>) =>
    mainApi.post<{ data: Blog }>("/api/v1/blogs", data),

  update: (id: string, data: Partial<Blog>) =>
    mainApi.patch<{ data: Blog }>(`/api/v1/blogs/id/${id}`, data),

  publish: (id: string) =>
    mainApi.post<{ data: Blog }>(`/api/v1/blogs/id/${id}/publish`),

  unpublish: (id: string) =>
    mainApi.post<{ data: Blog }>(`/api/v1/blogs/id/${id}/unpublish`),

  delete: (id: string) => mainApi.delete<void>(`/api/v1/blogs/id/${id}`),
};

// Events
export const eventsApi = {
  list: (
    params?: ListParams<{
      scope_type?: string;
      scope_id?: string;
      is_main?: boolean;
      is_published?: boolean;
      upcoming?: boolean;
      search?: string;
    }>,
  ) => mainApi.get<PaginatedResponse<Event>>("/api/v1/events", params),

  listAdmin: (
    params?: ListParams<{
      scope_type?: string;
      scope_id?: string;
      is_main?: boolean;
      is_published?: boolean;
      upcoming?: boolean;
      status?: string;
      search?: string;
    }>,
  ) => mainApi.get<PaginatedResponse<Event>>("/api/v1/events/admin", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Event }>(`/api/v1/events/id/${id}`, params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Event }>(`/api/v1/events/${slug}`, params),

  create: (data: Partial<Event>) =>
    mainApi.post<{ data: Event }>("/api/v1/events", data),

  update: (id: string, data: Partial<Event>) =>
    mainApi.patch<{ data: Event }>(`/api/v1/events/${id}`, data),

  publish: (id: string) =>
    mainApi.post<{ data: Event }>(`/api/v1/events/${id}/publish`),

  unpublish: (id: string) =>
    mainApi.post<{ data: Event }>(`/api/v1/events/${id}/unpublish`),

  delete: (id: string) => mainApi.delete<void>(`/api/v1/events/${id}`),
};

// Announcements
export const announcementsApi = {
  list: (
    params?: ListParams<{
      scope_type?: string;
      scope_id?: string;
      is_main?: boolean;
      is_published?: boolean;
      search?: string;
    }>,
  ) =>
    mainApi.get<PaginatedResponse<Announcement>>(
      "/api/v1/announcements",
      params,
    ),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Announcement }>(
      `/api/v1/announcements/id/${id}`,
      params,
    ),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Announcement }>(
      `/api/v1/announcements/${slug}`,
      params,
    ),

  create: (data: Partial<Announcement>) =>
    mainApi.post<{ data: Announcement }>("/api/v1/announcements", data),

  update: (id: string, data: Partial<Announcement>) =>
    mainApi.patch<{ data: Announcement }>(`/api/v1/announcements/${id}`, data),

  publish: (id: string) =>
    mainApi.post<{ data: Announcement }>(`/api/v1/announcements/${id}/publish`),

  unpublish: (id: string) =>
    mainApi.post<{ data: Announcement }>(
      `/api/v1/announcements/${id}/unpublish`,
    ),

  delete: (id: string) => mainApi.delete<void>(`/api/v1/announcements/${id}`),
};

// Sliders
export const slidersApi = {
  listGroups: (
    params?: ListParams<{
      scope_type?: string;
      scope_id?: string;
      is_main?: boolean;
    }>,
  ) => mainApi.get<{ data: SliderGroup[] }>("/api/v1/sliders/groups", params),

  getGroup: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: SliderGroup }>(
      `/api/v1/sliders/groups/id/${id}`,
      params,
    ),

  getGroupBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: SliderGroup }>(
      `/api/v1/sliders/groups/${slug}`,
      params,
    ),

  createGroup: (data: Partial<SliderGroup>) =>
    mainApi.post<{ data: SliderGroup }>("/api/v1/sliders/groups", data),

  updateGroup: (id: string, data: Partial<SliderGroup>) =>
    mainApi.patch<{ data: SliderGroup }>(`/api/v1/sliders/groups/${id}`, data),

  deleteGroup: (id: string) =>
    mainApi.delete<void>(`/api/v1/sliders/groups/${id}`),

  listSliders: (
    params?: ListParams<{
      slider_group_id?: string;
      scope_type?: string;
      scope_id?: string;
      is_main?: boolean;
    }>,
  ) => mainApi.get<{ data: Slider[] }>("/api/v1/sliders", params),

  listAdminSliders: (
    params?: ListParams<{
      slider_group_id?: string;
      scope_type?: string;
      scope_id?: string;
      is_main?: boolean;
      status?: string;
    }>,
  ) => mainApi.get<{ data: Slider[] }>("/api/v1/sliders/admin", params),

  listGroupSliders: (groupId: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Slider[] }>("/api/v1/sliders/admin", {
      ...params,
      slider_group_id: groupId,
    }),

  createSlider: (groupId: string, data: Partial<Slider>) =>
    mainApi.post<{ data: Slider }>("/api/v1/sliders", {
      ...data,
      slider_group_id: groupId,
    }),

  getSlider: (sliderId: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Slider }>(`/api/v1/sliders/${sliderId}`, params),

  updateSlider: (sliderId: string, data: Partial<Slider>) =>
    mainApi.patch<{ data: Slider }>(`/api/v1/sliders/${sliderId}`, data),

  deleteSlider: (sliderId: string) =>
    mainApi.delete<void>(`/api/v1/sliders/${sliderId}`),
};

// Partners proxied through the main service for the public website
export const partnersApi = {
  list: (
    params?: ListParams<{
      search?: string;
      status?: string;
      is_active?: boolean;
      is_featured?: boolean;
    }>,
  ) =>
    mainApi.get<{
      data: Record<string, unknown>[];
      meta?: Record<string, unknown>;
    }>("/api/v1/partners", params),

  getBySlug: (slug: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Record<string, unknown> }>(
      `/api/v1/partners/${slug}`,
      params,
    ),
};

// Media
export const mediaApi = {
  list: (
    params?: ListParams<{
      folder_id?: string;
      media_type?: string;
      uploaded_by_id?: string;
      search?: string;
    }>,
  ) => mainApi.get<PaginatedResponse<Media>>("/api/v1/media", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Media }>(`/api/v1/media/${id}`, params),

  update: (id: string, data: MediaUpdatePayload) =>
    mainApi.patch<{ data: Media }>(`/api/v1/media/${id}`, data),

  upload: async (file: File, options?: MediaUploadOptions) => {
    const formData = new FormData();
    formData.append("file", file);
    if (options?.folderId) formData.append("folder_id", options.folderId);
    if (options?.isPublic !== undefined)
      formData.append("is_public", String(options.isPublic));
    if (options?.entityType) formData.append("entity_type", options.entityType);
    if (options?.entityId) formData.append("entity_id", options.entityId);
    if (options?.role) formData.append("role", options.role);
    const token = getStoredAccessToken();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MAIN_API_URL || "http://localhost:8000"}/api/v1/media/upload`,
      {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.message || "Upload failed");
    }

    return response.json() as Promise<{ data: Media }>;
  },

  listFolders: (params?: FieldSelectionParams & { parent_id?: string }) =>
    mainApi.get<{ data: MediaFolder[] }>("/api/v1/media/folders", params),

  createFolder: (data: MediaFolderCreatePayload) =>
    mainApi.post<{ data: MediaFolder }>("/api/v1/media/folders", data),

  getFolder: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: MediaFolder }>(`/api/v1/media/folders/${id}`, params),

  updateFolder: (id: string, data: MediaFolderUpdatePayload) =>
    mainApi.patch<{ data: MediaFolder }>(`/api/v1/media/folders/${id}`, data),

  deleteFolder: (id: string) =>
    mainApi.delete<void>(`/api/v1/media/folders/${id}`),

  listLinks: (
    params: FieldSelectionParams & {
      entity_type: string;
      entity_id: string;
      role?: string;
    },
  ) => mainApi.get<{ data: MediaLink[] }>("/api/v1/media/links", params),

  createLink: (data: MediaLinkCreatePayload) =>
    mainApi.post<{ data: MediaLink }>("/api/v1/media/links", data),

  getLink: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: MediaLink }>(`/api/v1/media/links/${id}`, params),

  updateLink: (id: string, data: MediaLinkUpdatePayload) =>
    mainApi.patch<{ data: MediaLink }>(`/api/v1/media/links/${id}`, data),

  deleteLink: (id: string) => mainApi.delete<void>(`/api/v1/media/links/${id}`),

  delete: (id: string) => mainApi.delete<void>(`/api/v1/media/${id}`),
};

// FAQs
export const faqsApi = {
  list: (
    params?: ListParams<{
      scope_type?: string;
      scope_id?: string;
      is_main?: boolean;
    }>,
  ) => mainApi.get<PaginatedResponse<FAQ>>("/api/v1/faqs", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: FAQ }>(`/api/v1/faqs/${id}`, params),

  create: (data: Partial<FAQ>) =>
    mainApi.post<{ data: FAQ }>("/api/v1/faqs", data),

  update: (id: string, data: Partial<FAQ>) =>
    mainApi.patch<{ data: FAQ }>(`/api/v1/faqs/${id}`, data),

  delete: (id: string) => mainApi.delete<void>(`/api/v1/faqs/${id}`),
};

export const contactsApi = {
  list: (
    params?: ListParams<{
      scope_type?: string;
      scope_id?: string;
      is_main?: boolean;
    }>,
  ) =>
    mainApi.get<PaginatedResponse<ContactDirectory>>(
      "/api/v1/contacts",
      params,
    ),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: ContactDirectory }>(`/api/v1/contacts/${id}`, params),

  create: (data: Partial<ContactDirectory>) =>
    mainApi.post<{ data: ContactDirectory }>("/api/v1/contacts", data),

  update: (id: string, data: Partial<ContactDirectory>) =>
    mainApi.patch<{ data: ContactDirectory }>(`/api/v1/contacts/${id}`, data),
};

export const searchApi = {
  query: (
    params: FieldSelectionParams & {
      q: string;
      limit_per_type?: number;
      scope_type?: string;
      scope_id?: string;
    },
  ) => mainApi.get<{ data: SearchPayload }>("/api/v1/search", params),
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

  delete: (id: string) => mainApi.delete<void>(`/api/v1/testimonials/${id}`),
};

// Roles
export const rolesApi = {
  list: (params?: ListParams) =>
    mainApi.get<PaginatedResponse<Role>>("/api/v1/admin/roles", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Role }>(`/api/v1/admin/roles/${id}`, params),

  create: (data: Partial<Role>) =>
    mainApi.post<{ data: Role }>("/api/v1/admin/roles", data),

  update: (id: string, data: Partial<Role>) =>
    mainApi.patch<{ data: Role }>(`/api/v1/admin/roles/${id}`, data),

  delete: (id: string) => mainApi.delete<void>(`/api/v1/admin/roles/${id}`),
};

// Permissions
export const permissionsApi = {
  list: (params?: FieldSelectionParams) =>
    mainApi.get<{ data: Permission[] }>("/api/v1/admin/permissions", params),

  create: (data: {
    name: string;
    description?: string;
    resource?: string;
    action?: string;
  }) =>
    mainApi.post<{ data: Permission }>(
      `/api/v1/admin/permissions?name=${encodeURIComponent(data.name)}${data.description ? `&description=${encodeURIComponent(data.description)}` : ""}${data.resource ? `&resource=${encodeURIComponent(data.resource)}` : ""}${data.action ? `&action=${encodeURIComponent(data.action)}` : ""}`,
    ),
};

// Audit Logs
export const auditLogsApi = {
  list: (
    params?: ListParams<{
      user_id?: string;
      service_name?: string;
      action?: string;
      resource_type?: string;
      resource_id?: string;
      status?: string;
      date_from?: string;
      date_to?: string;
    }>,
  ) => mainApi.get<PaginatedResponse<AuditLog>>("/api/v1/admin/audit", params),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: AuditLog }>(`/api/v1/admin/audit/${id}`, params),
};

export const analyticsApi = {
  ingestEvents: (events: AnalyticsEventPayload[]) =>
    mainApi.post<{ data: { accepted: number } }>("/api/v1/analytics/events", {
      events,
    }),
};

export const importsApi = {
  listResources: () =>
    mainApi.get<{ data: ImportResource[] }>("/api/v1/imports/resources"),

  getResource: (resource: string) =>
    mainApi.get<{ data: ImportResource }>(
      `/api/v1/imports/resources/${resource}`,
    ),

  preview: async (resource: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = getStoredAccessToken();
    const response = await fetch(
      `${MAIN_API_BASE_URL}/api/v1/imports/${resource}/preview`,
      {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      },
    );
    return parseImportResponse<{ data: ImportPreview }>(response);
  },

  commit: (resource: string, data: ImportCommitRequest) =>
    mainApi.post<{ data: ImportCommitResult }>(
      `/api/v1/imports/${resource}/commit`,
      data,
    ),

  downloadTemplate: async (resource: string) => {
    const token = getStoredAccessToken();
    const response = await fetch(
      `${MAIN_API_BASE_URL}/api/v1/imports/${resource}/template`,
      {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      },
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.detail || error.message || "Template download failed",
      );
    }
    return response.blob();
  },
};

export const adminReportsApi = {
  overview: (params?: { days?: number }) =>
    mainApi.get<{ data: ReportsOverview }>(
      "/api/v1/admin/reports/overview",
      params,
    ),

  traffic: (params?: { days?: number }) =>
    mainApi.get<{ data: TrafficReport }>(
      "/api/v1/admin/reports/traffic",
      params,
    ),

  content: (params?: { days?: number }) =>
    mainApi.get<{ data: ContentReport }>(
      "/api/v1/admin/reports/content",
      params,
    ),

  adminActivity: (params?: { days?: number }) =>
    mainApi.get<{ data: AdminActivityReport }>(
      "/api/v1/admin/reports/admin-activity",
      params,
    ),

  exportUrl: (
    reportName: "overview" | "traffic" | "content" | "admin-activity",
    params?: { days?: number; format?: "csv" | "json" },
  ) => {
    const query = new URLSearchParams();
    if (params?.days) query.set("days", String(params.days));
    if (params?.format) query.set("format", params.format);
    const suffix = query.toString();
    return `${process.env.NEXT_PUBLIC_MAIN_API_URL || "http://localhost:8000"}/api/v1/admin/reports/exports/${reportName}${suffix ? `?${suffix}` : ""}`;
  },
};

// API Keys (System)
export const apiKeysApi = {
  list: (params?: ListParams) =>
    mainApi.get<PaginatedResponse<ApiKey>>(
      "/api/v1/admin/system/api-keys",
      params,
    ),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: ApiKey }>(
      `/api/v1/admin/system/api-keys/${id}`,
      params,
    ),

  create: (data: Partial<ApiKey>) =>
    mainApi.post<{ data: { api_key: string; record: ApiKey } }>(
      "/api/v1/admin/system/api-keys",
      data,
    ),

  update: (id: string, data: Partial<ApiKey>) =>
    mainApi.patch<{ data: ApiKey }>(
      `/api/v1/admin/system/api-keys/${id}`,
      data,
    ),

  delete: (id: string) =>
    mainApi.delete<void>(`/api/v1/admin/system/api-keys/${id}`),
};

// Settings (System)
export const settingsApi = {
  list: (params?: ListParams<{ category?: string }>) =>
    mainApi.get<PaginatedResponse<Setting>>(
      "/api/v1/admin/system/settings",
      params,
    ),

  get: (id: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: Setting }>(
      `/api/v1/admin/system/settings/${id}`,
      params,
    ),

  create: (data: Partial<Setting>) =>
    mainApi.post<{ data: Setting }>("/api/v1/admin/system/settings", data),

  update: (id: string, data: Partial<Setting>) =>
    mainApi.patch<{ data: Setting }>(
      `/api/v1/admin/system/settings/${id}`,
      data,
    ),

  bulkUpdate: (settings: Array<{ key: string; value: unknown }>) =>
    mainApi.put<{ data: Setting[] }>("/api/v1/admin/system/settings", {
      settings,
    }),

  delete: (id: string) =>
    mainApi.delete<void>(`/api/v1/admin/system/settings/${id}`),
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
    mainApi.get<{ data: StaffAssignment | null }>(
      "/api/v1/public/leadership",
      params,
    ),

  getViceChancellor: (params?: FieldSelectionParams) =>
    mainApi.get<{ data: StaffAssignment | null }>(
      "/api/v1/public/leadership/vice-chancellor",
      params,
    ),

  getDean: (schoolId: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: StaffAssignment | null }>(
      `/api/v1/public/leadership/dean/${schoolId}`,
      params,
    ),

  getHOD: (departmentId: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: StaffAssignment | null }>(
      `/api/v1/public/leadership/hod/${departmentId}`,
      params,
    ),

  getDirector: (divisionId: string, params?: FieldSelectionParams) =>
    mainApi.get<{ data: StaffAssignment | null }>(
      `/api/v1/public/leadership/director/${divisionId}`,
      params,
    ),

  listByEntity: (params: {
    entity_type: string;
    entity_id?: string;
    fields?: string;
    include?: string;
  }) =>
    mainApi.get<PaginatedResponse<StaffAssignment>>(
      "/api/v1/public/leadership/list",
      params,
    ),
};
