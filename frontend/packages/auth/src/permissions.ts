import type { Service } from "./types";

export const SERVICE_ROLES: Record<Service, readonly string[]> = {
  main: [
    "super-admin",
    "admin",
    "academic-admin",
    "content-admin",
    "content-manager",
    "content-staff",
    "institution-admin",
    "office-admin",
    "office-editor",
    "office-staff-manager",
    "school-admin",
    "dept-admin",
    "dept-staff",
    "staff-admin",
    "staff",
    "lecturer",
  ],
  research: [
    "super-admin",
    "research-admin",
    "research-manager",
    "research-staff",
    "researcher",
    "innovation-officer",
    "lecturer",
  ],
  library: [
    "super-admin",
    "admin",
    "library-admin",
    "library-manager",
    "library-staff",
  ],
  system: [
    "super-admin",
    "admin",
    "system-admin",
  ],
} as const;

export const ROLE_HIERARCHY: Record<Service, readonly string[]> = {
  main: [
    "super-admin",
    "admin",
    "academic-admin",
    "content-admin",
    "staff-admin",
    "institution-admin",
    "office-admin",
    "office-editor",
    "office-staff-manager",
    "school-admin",
    "content-manager",
    "dept-admin",
    "content-staff",
    "dept-staff",
    "staff",
    "lecturer",
  ],
  research: [
    "super-admin",
    "research-admin",
    "research-manager",
    "innovation-officer",
    "research-staff",
    "researcher",
    "lecturer",
  ],
  library: [
    "super-admin",
    "admin",
    "library-admin",
    "library-manager",
    "library-staff",
  ],
  system: [
    "super-admin",
    "admin",
    "system-admin",
  ],
};

function normalizeRole(role: string) {
  return role.trim().toLowerCase().replace(/_/g, "-");
}

export function getAccessibleServices(roles: string[]): Service[] {
  const normalizedRoles = roles.map(normalizeRole);
  return (Object.entries(SERVICE_ROLES) as [Service, readonly string[]][])
    .filter(([_, serviceRoles]) =>
      normalizedRoles.some((role) => serviceRoles.includes(role))
    )
    .map(([service]) => service);
}

export function hasServiceAccess(roles: string[], service: Service): boolean {
  const normalizedRoles = roles.map(normalizeRole);
  return normalizedRoles.some((role) => SERVICE_ROLES[service].includes(role));
}

export function getPrimaryService(roles: string[]): Service | null {
  const services = getAccessibleServices(roles);
  if (services.includes("main")) return "main";
  if (services.includes("system")) return "system";
  if (services.includes("research")) return "research";
  if (services.includes("library")) return "library";
  return null;
}

export function getHighestRole(roles: string[], service: Service): string | null {
  const hierarchy = ROLE_HIERARCHY[service];
  const normalizedRoles = roles.map(normalizeRole);
  for (const role of hierarchy) {
    if (normalizedRoles.includes(role)) return role;
  }
  return null;
}

export function isSuperAdmin(roles: string[]): boolean {
  return roles.map(normalizeRole).includes("super-admin");
}

export function formatRoleName(role: string): string {
  return role
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const ALL_SCOPES = [
  // User management
  "users.view", "users.create", "users.edit", "users.delete", "users.suspend", "users.invite",
  // Roles
  "roles.view", "roles.manage", "roles.delete", "permissions.view", "permissions.manage",
  // System
  "audit.view", "audit.manage", "settings.view", "settings.manage", "api_keys.view", "api_keys.manage", "webhooks.view", "webhooks.manage",
  "analytics.view", "analytics.manage",
  "notifications.view", "notifications.manage", "notifications.send",
  // Academic
  "academic.manage_campuses", "academic.manage_schools", "academic.manage_departments",
  "academic.manage_staff", "academic.manage_programmes", "academic.manage_calendar", "academic.view",
  // Content
  "content.manage_pages", "content.manage_news", "content.manage_events", "content.manage_blogs",
  "content.manage_announcements", "content.manage_categories", "content.view_drafts",
  "content.publish", "content.view",
  // Research
  "research.view_projects", "research.manage_projects", "research.manage_publications",
  "research.manage_centers", "research.manage_collaborations", "research.view",
  // Library
  "library.manage_resources", "library.manage_services", "library.manage_collections",
  "library.manage_staff", "library.manage_loans", "library.view",
  // Admissions
  "admissions.view_applications", "admissions.manage_applications", "admissions.manage_intakes",
  "admissions.manage_info", "admissions.view",
  // Media
  "media.manage", "media.upload", "media.delete", "media.view",
  // Marketing
  "marketing.manage_sliders", "marketing.manage_testimonials",
  "marketing.manage_newsletters", "marketing.view",
  // Support
  "support.manage_faqs", "support.manage_contacts", "support.view",
  // Staff
  "staff.manage_assignments", "staff.view_assignments", "profile.self_edit",
  // Institutional administration / office self-service
  "administration.view", "administration.manage_units", "administration.manage_content",
  "administration.manage_staff", "administration.manage_services",
  "office.view", "office.manage_content", "office.manage_staff", "office.manage_services",
  // Persons
  "persons.manage", "persons.view",
  // Alumni
  "alumni.manage", "alumni.view",
] as const;

export type Scope = (typeof ALL_SCOPES)[number];
