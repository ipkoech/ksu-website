import api, { ListParams } from "./client";

export interface Division {
    id: string;
    name: string;
    slug: string;
    description?: string;
    director?: string;
    created_at: string;
    updated_at: string;
}

export interface Wing {
    id: string;
    name: string;
    slug: string;
    division_id?: string;
    description?: string;
    head?: string;
    created_at: string;
    updated_at: string;
}

export interface GovernanceBody {
    id: string;
    name: string;
    slug: string;
    description?: string;
    members_count?: number;
    created_at: string;
    updated_at: string;
}

export const divisionsApi = {
    list: (params?: ListParams) =>
        api.get<Division[]>("/divisions", { params }),
    get: (slug: string) => api.get<Division>(`/divisions/${slug}`),
    create: (data: any) => api.post<Division>("/divisions", data),
    update: (id: string, data: any) =>
        api.patch<Division>(`/divisions/id/${id}`, data),
    delete: (id: string) => api.delete<void>(`/divisions/id/${id}`),
};

export const wingsApi = {
    list: (params?: ListParams) => api.get<Wing[]>("/wings", { params }),
    get: (slug: string) => api.get<Wing>(`/wings/${slug}`),
    create: (data: any) => api.post<Wing>("/wings", data),
    update: (id: string, data: any) =>
        api.patch<Wing>(`/wings/id/${id}`, data),
    delete: (id: string) => api.delete<void>(`/wings/id/${id}`),
};

export const governanceApi = {
    list: (params?: ListParams) =>
        api.get<GovernanceBody[]>("/governance", { params }),
    get: (slug: string) => api.get<GovernanceBody>(`/governance/${slug}`),
    create: (data: any) => api.post<GovernanceBody>("/governance", data),
    update: (id: string, data: any) =>
        api.patch<GovernanceBody>(`/governance/id/${id}`, data),
    delete: (id: string) => api.delete<void>(`/governance/id/${id}`),
};
