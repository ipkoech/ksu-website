export interface BaseRead {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedMeta {
  page: number;
  per_page: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface Role extends BaseRead {
  name: string;
  display_name: string | null;
  description: string | null;
  is_system: boolean;
  is_active: boolean;
  permissions: string[];
  role_permissions?: Array<{
    permission?: Pick<Permission, "id" | "name"> | null;
  }>;
}

export interface UserRole {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  role_id: string;
  role_name: string | null;
  scope_type: string | null;
  scope_id: string | null;
  assigned_by_id: string | null;
  assigned_at: string;
  expires_at: string | null;
  note: string | null;
  is_active: boolean;
  role?: Pick<Role, "id" | "name" | "display_name" | "is_active">;
}

export interface User extends BaseRead {
  email: string;
  phone: string | null;
  full_name: string;
  avatar_url: string | null;
  push_tokens: string[] | null;
  is_active: boolean;
  is_verified: boolean;
  mfa_enabled: boolean;
  last_login_at: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  email_verified_at: string | null;
  roles: string[];
  person_id: string | null;
  role_assignments?: UserRole[];
}

export interface Permission extends BaseRead {
  name: string;
  description: string | null;
  resource: string | null;
  action: string | null;
  is_active: boolean;
}

export interface AuditLog extends BaseRead {
  service_name: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  request_method: string;
  request_path: string;
  route_name: string | null;
  status_code: number;
  status: string;
  user_id: string | null;
  session_jti: string | null;
  ip_address: string | null;
  user_agent: string | null;
  error_message: string | null;
  details: Record<string, unknown> | null;
  changes: Record<string, unknown> | null;
  happened_at: string;
  deleted_at: string | null;
  user?: {
    id?: string;
    email?: string | null;
    full_name?: string | null;
  } | null;
}

export interface Setting extends BaseRead {
  key: string;
  value: unknown;
  value_type: string;
  category: string;
  description: string | null;
  is_public: boolean;
  updated_by_id: string | null;
}

export interface ApiKey extends BaseRead {
  name: string;
  description: string | null;
  scopes: string[];
  rate_limit: number;
  expires_at: string | null;
  last_used_at: string | null;
  is_active: boolean;
  created_by_id: string;
  key_prefix?: string;
}

export interface Webhook extends BaseRead {
  name: string;
  url: string;
  secret: string | null;
  events: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  last_status: number | null;
  failure_count: number;
  created_by_id: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface RoleListParams {
  page?: number;
  limit?: number;
  search?: string;
  system?: boolean;
  sort?: string;
  order?: "asc" | "desc";
}

export interface AuditLogParams {
  user_id?: string;
  action?: string;
  resource?: string;
  resource_type?: string;
  service_name?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}
