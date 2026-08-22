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
  scope?: {
    id: string | null;
    name: string;
    type: string;
    subtitle?: string | null;
    is_active?: boolean;
  } | null;
}

export interface UserRoleAssignmentPayload {
  role_id: string;
  scope_type?: string | null;
  scope_id?: string | null;
  expires_at?: string | null;
  note?: string | null;
}

export interface UserRolesUpdatePayload {
  roles: UserRoleAssignmentPayload[];
}

export interface User extends BaseRead {
  email: string;
  phone: string | null;
  full_name: string;
  avatar_url: string | null;
  push_tokens: string[] | null;
  is_active: boolean;
  is_verified: boolean;
  service_memberships: Array<"main" | "research" | "library" | "heri" | "system">;
  must_change_password: boolean;
  last_login_at: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  email_verified_at: string | null;
  roles: string[];
  person_id: string | null;
  role_assignments?: UserRole[];
}

export interface UserCreatePayload {
  email: string;
  phone?: string | null;
  password: string;
  full_name: string;
  avatar_url?: string | null;
  push_tokens?: string[] | null;
  is_active?: boolean;
  is_verified?: boolean;
  service_memberships?: Array<"main" | "research" | "library" | "heri" | "system">;
  must_change_password?: boolean;
}

export interface UserUpdatePayload {
  email?: string | null;
  phone?: string | null;
  password?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  push_tokens?: string[] | null;
  is_active?: boolean | null;
  is_verified?: boolean | null;
  service_memberships?: Array<"main" | "research" | "library" | "heri" | "system"> | null;
  must_change_password?: boolean | null;
}

export interface Permission extends BaseRead {
  name: string;
  description: string | null;
  resource: string | null;
  action: string | null;
  is_active: boolean;
}

export interface RoleCreatePayload {
  name: string;
  display_name?: string | null;
  description?: string | null;
  is_system?: boolean;
  is_active?: boolean;
  permissions: string[];
}

export interface RoleUpdatePayload {
  display_name?: string | null;
  description?: string | null;
  is_system?: boolean | null;
  is_active?: boolean | null;
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

export interface SettingCreatePayload {
  key: string;
  value: unknown;
  value_type: string;
  category: string;
  description?: string | null;
  is_public?: boolean;
}

export interface SettingUpdatePayload {
  value?: unknown;
  value_type?: string | null;
  category?: string | null;
  description?: string | null;
  is_public?: boolean | null;
}

export interface BulkSettingsUpdatePayload {
  settings: Array<{
    key: string;
    value: unknown;
  }>;
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

export interface ApiKeyCreatePayload {
  name: string;
  description?: string | null;
  scopes: string[];
  rate_limit?: number;
  expires_at?: string | null;
}

export interface ApiKeyUpdatePayload {
  name?: string | null;
  description?: string | null;
  scopes?: string[] | null;
  rate_limit?: number | null;
  expires_at?: string | null;
  is_active?: boolean | null;
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

export interface WebhookCreatePayload {
  name: string;
  url: string;
  secret?: string | null;
  events: string[];
  is_active?: boolean;
}

export interface WebhookUpdatePayload {
  name?: string | null;
  url?: string | null;
  secret?: string | null;
  events?: string[] | null;
  is_active?: boolean | null;
  last_status?: number | null;
  failure_count?: number | null;
}

export interface NotificationTemplate extends BaseRead {
  code: string;
  name: string;
  description?: string | null;
  title_template: string | null;
  subject_template: string | null;
  message_template: string | null;
  channels: string[];
  variables?: string[] | null;
  is_active: boolean;
}

export interface NotificationTemplateCreatePayload {
  code: string;
  name: string;
  description?: string | null;
  title_template: string;
  subject_template?: string | null;
  message_template: string;
  channels?: string[];
  variables?: string[] | null;
  is_active?: boolean;
}

export interface NotificationTemplateUpdatePayload {
  name?: string | null;
  description?: string | null;
  title_template?: string | null;
  subject_template?: string | null;
  message_template?: string | null;
  channels?: string[] | null;
  variables?: string[] | null;
  is_active?: boolean | null;
}

export interface NotificationDelivery extends BaseRead {
  notification_id: string | null;
  user_id: string | null;
  channel: string;
  status: string;
  recipient: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  error_message: string | null;
}

export interface NotificationCreatePayload {
  user_id: string;
  template_id?: string | null;
  title: string;
  subject?: string | null;
  message: string;
  notification_type?: string;
  priority?: string;
  action_url?: string | null;
  scope_type?: string | null;
  scope_id?: string | null;
  channels?: string[];
  payload?: Record<string, unknown> | null;
  expires_at?: string | null;
}

export interface NotificationBroadcastPayload {
  user_ids?: string[];
  role_names?: string[];
  audience_scope_type?: string | null;
  audience_scope_id?: string | null;
  template_code?: string | null;
  template_context?: Record<string, unknown> | null;
  title?: string | null;
  subject?: string | null;
  message?: string | null;
  notification_type?: string;
  priority?: string;
  action_url?: string | null;
  scope_type?: string | null;
  scope_id?: string | null;
  channels?: string[];
  payload?: Record<string, unknown> | null;
  expires_at?: string | null;
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
  resource_type?: string;
  service_name?: string;
  status?: string;
  page?: number;
  limit?: number;
}
