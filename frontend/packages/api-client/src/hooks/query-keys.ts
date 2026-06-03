// Centralized query keys for cache management

export const queryKeys = {
  // Auth
  auth: {
    me: ["auth", "me"] as const,
  },

  // Users
  users: {
    all: ["users"] as const,
    list: (params?: Record<string, unknown>) => ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
    sessions: (id: string) => ["users", id, "sessions"] as const,
  },

  // Persons
  persons: {
    all: ["persons"] as const,
    list: (params?: Record<string, unknown>) => ["persons", "list", params] as const,
    detail: (id: string) => ["persons", "detail", id] as const,
    bySlug: (slug: string) => ["persons", "slug", slug] as const,
  },

  // Staff Assignments
  staff: {
    all: ["staff"] as const,
    assignments: (params?: Record<string, unknown>) => ["staff", "assignments", params] as const,
    assignment: (id: string) => ["staff", "assignments", id] as const,
    reportingChain: (id: string) => ["staff", "assignments", id, "reporting-chain"] as const,
    directReports: (id: string) => ["staff", "assignments", id, "direct-reports"] as const,
  },

  // Governance
  governance: {
    all: ["governance"] as const,
    boards: (params?: Record<string, unknown>) => ["governance", "boards", params] as const,
    board: (slug: string) => ["governance", "boards", slug] as const,
    boardMembers: (slug: string) => ["governance", "boards", slug, "members"] as const,
    council: ["governance", "council"] as const,
    managementBoard: ["governance", "management-board"] as const,
  },

  // Schools
  schools: {
    all: ["schools"] as const,
    list: (params?: Record<string, unknown>) => ["schools", "list", params] as const,
    detail: (id: string) => ["schools", "detail", id] as const,
    bySlug: (slug: string) => ["schools", "slug", slug] as const,
  },

  // Divisions
  divisions: {
    all: ["divisions"] as const,
    list: (params?: Record<string, unknown>) => ["divisions", "list", params] as const,
    detail: (id: string) => ["divisions", "detail", id] as const,
    bySlug: (slug: string) => ["divisions", "slug", slug] as const,
  },

  // Wings / directorates
  wings: {
    all: ["wings"] as const,
    byDivision: (divisionId: string, params?: Record<string, unknown>) => ["wings", "division", divisionId, params] as const,
    detail: (id: string) => ["wings", "detail", id] as const,
    bySlug: (slug: string) => ["wings", "slug", slug] as const,
  },

  // Departments
  departments: {
    all: ["departments"] as const,
    list: (params?: Record<string, unknown>) => ["departments", "list", params] as const,
    detail: (id: string) => ["departments", "detail", id] as const,
    bySlug: (slug: string) => ["departments", "slug", slug] as const,
  },

  // Programmes
  programmes: {
    all: ["programmes"] as const,
    list: (params?: Record<string, unknown>) => ["programmes", "list", params] as const,
    detail: (id: string) => ["programmes", "detail", id] as const,
    bySlug: (slug: string) => ["programmes", "slug", slug] as const,
  },

  // Intakes
  intakes: {
    all: ["intakes"] as const,
    list: (params?: Record<string, unknown>) => ["intakes", "list", params] as const,
    detail: (id: string) => ["intakes", "detail", id] as const,
    bySlug: (slug: string) => ["intakes", "slug", slug] as const,
  },

  // Admission information
  admissions: {
    all: ["admissions"] as const,
    list: (params?: Record<string, unknown>) => ["admissions", "list", params] as const,
    detail: (id: string) => ["admissions", "detail", id] as const,
    bySlug: (slug: string) => ["admissions", "slug", slug] as const,
  },

  // Academic calendars
  academicCalendars: {
    all: ["academic-calendars"] as const,
    list: (params?: Record<string, unknown>) => ["academic-calendars", "list", params] as const,
    detail: (id: string) => ["academic-calendars", "detail", id] as const,
  },

  // News
  news: {
    all: ["news"] as const,
    list: (params?: Record<string, unknown>) => ["news", "list", params] as const,
    detail: (id: string) => ["news", "detail", id] as const,
    bySlug: (slug: string) => ["news", "slug", slug] as const,
  },

  // Blogs
  blogs: {
    all: ["blogs"] as const,
    list: (params?: Record<string, unknown>) => ["blogs", "list", params] as const,
    detail: (id: string) => ["blogs", "detail", id] as const,
    bySlug: (slug: string) => ["blogs", "slug", slug] as const,
  },

  // Events
  events: {
    all: ["events"] as const,
    list: (params?: Record<string, unknown>) => ["events", "list", params] as const,
    detail: (id: string) => ["events", "detail", id] as const,
    bySlug: (slug: string) => ["events", "slug", slug] as const,
  },

  // Announcements
  announcements: {
    all: ["announcements"] as const,
    list: (params?: Record<string, unknown>) => ["announcements", "list", params] as const,
    detail: (id: string) => ["announcements", "detail", id] as const,
    bySlug: (slug: string) => ["announcements", "slug", slug] as const,
  },

  // Sliders
  sliders: {
    groups: ["slider-groups"] as const,
    groupList: (params?: Record<string, unknown>) => ["slider-groups", "list", params] as const,
    groupDetail: (id: string) => ["slider-groups", "detail", id] as const,
    sliderList: (params?: Record<string, unknown>) => ["sliders", "list", params] as const,
    items: (groupId: string) => ["slider-groups", groupId, "sliders"] as const,
  },

  // Media
  media: {
    all: ["media"] as const,
    list: (params?: Record<string, unknown>) => ["media", "list", params] as const,
    detail: (id: string) => ["media", "detail", id] as const,
    folders: (params?: Record<string, unknown>) => ["media", "folders", params] as const,
    folder: (id: string) => ["media", "folders", id] as const,
    links: (params?: Record<string, unknown>) => ["media", "links", params] as const,
    link: (id: string) => ["media", "links", id] as const,
  },

  // FAQs
  faqs: {
    all: ["faqs"] as const,
    list: (params?: Record<string, unknown>) => ["faqs", "list", params] as const,
    detail: (id: string) => ["faqs", "detail", id] as const,
  },

  // Testimonials
  testimonials: {
    all: ["testimonials"] as const,
    list: (params?: Record<string, unknown>) => ["testimonials", "list", params] as const,
    detail: (id: string) => ["testimonials", "detail", id] as const,
  },

  // Roles
  roles: {
    all: ["roles"] as const,
    list: (params?: Record<string, unknown>) => ["roles", "list", params] as const,
    detail: (id: string) => ["roles", "detail", id] as const,
  },

  // Permissions
  permissions: {
    all: ["permissions"] as const,
  },

  // Audit Logs
  auditLogs: {
    all: ["audit-logs"] as const,
    list: (params?: Record<string, unknown>) => ["audit-logs", "list", params] as const,
    detail: (id: string) => ["audit-logs", "detail", id] as const,
  },

  // Reports
  reports: {
    all: ["reports"] as const,
    overview: (params?: Record<string, unknown>) => ["reports", "overview", params] as const,
    traffic: (params?: Record<string, unknown>) => ["reports", "traffic", params] as const,
    content: (params?: Record<string, unknown>) => ["reports", "content", params] as const,
    adminActivity: (params?: Record<string, unknown>) => ["reports", "admin-activity", params] as const,
  },

  // Imports
  imports: {
    all: ["imports"] as const,
    resources: ["imports", "resources"] as const,
    resource: (resource: string) => ["imports", "resources", resource] as const,
  },

  // API Keys
  apiKeys: {
    all: ["api-keys"] as const,
    list: (params?: Record<string, unknown>) => ["api-keys", "list", params] as const,
    detail: (id: string) => ["api-keys", "detail", id] as const,
  },

  // Settings
  settings: {
    all: ["settings"] as const,
    list: (params?: Record<string, unknown>) => ["settings", "list", params] as const,
    detail: (key: string) => ["settings", "detail", key] as const,
  },
};
