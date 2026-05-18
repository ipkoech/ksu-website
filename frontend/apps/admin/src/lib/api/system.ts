import api, { ListParams } from "./client";

export interface MediaFile {
    id: string;
    filename: string;
    mime_type: string;
    size: number;
    url: string;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role_id?: string;
    is_active: boolean;
    last_login?: string;
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: string;
    name: string;
    slug: string;
    description?: string;
    permissions?: Permission[];
    created_at: string;
    updated_at: string;
}

export interface Permission {
    id: string;
    name: string;
    scope: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface Setting {
    id: string;
    key: string;
    value: string;
    description?: string;
    type: string;
    created_at: string;
    updated_at: string;
}

export interface AuditLog {
    id: string;
    user_id: string;
    action: string;
    resource_type: string;
    resource_id: string;
    changes?: Record<string, any>;
    ip_address?: string;
    created_at: string;
}

export const mediaApi = {
    list: (params?: ListParams) => api.get<MediaFile[]>("/media", { params }),
    get: (id: string) => api.get<MediaFile>(`/media/${id}`),
    upload: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return api.post<MediaFile>("/media", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    delete: (id: string) => api.delete<void>(`/media/${id}`),
};

export const usersApi = {
    list: (params?: ListParams) =>
        api.get<User[]>("/admin/users", { params }),
    get: (id: string) => api.get<User>(`/admin/users/${id}`),
    create: (data: any) => api.post<User>("/admin/users", data),
    update: (id: string, data: any) =>
        api.patch<User>(`/admin/users/${id}`, data),
    delete: (id: string) => api.delete<void>(`/admin/users/${id}`),
};

export const rolesApi = {
    list: (params?: ListParams) =>
        api.get<Role[]>("/admin/roles", { params }),
    get: (id: string) => api.get<Role>(`/admin/roles/${id}`),
    create: (data: any) => api.post<Role>("/admin/roles", data),
    update: (id: string, data: any) =>
        api.patch<Role>(`/admin/roles/${id}`, data),
    delete: (id: string) => api.delete<void>(`/admin/roles/${id}`),
};

export const permissionsApi = {
    list: () => api.get<Permission[]>("/admin/permissions"),
};

export const settingsApi = {
    list: () => api.get<Setting[]>("/settings"),
    get: (key: string) => api.get<Setting>(`/settings/${key}`),
    update: (key: string, value: any) =>
        api.patch<Setting>(`/settings/${key}`, { value }),
};

export const auditApi = {
    list: (params?: ListParams) =>
        api.get<AuditLog[]>("/admin/audit", { params }),
};
