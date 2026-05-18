import api, { ListParams } from "./client";

export interface School {
    id: string;
    name: string;
    slug: string;
    description?: string;
    dean?: string;
    contact_email?: string;
    created_at: string;
    updated_at: string;
}

export interface Department {
    id: string;
    name: string;
    slug: string;
    school_id: string;
    description?: string;
    hod?: string;
    created_at: string;
    updated_at: string;
}

export interface Programme {
    id: string;
    name: string;
    code: string;
    department_id: string;
    description?: string;
    level: string;
    duration_years: number;
    created_at: string;
    updated_at: string;
}

export interface Campus {
    id: string;
    name: string;
    slug: string;
    location?: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export const schoolsApi = {
    list: (params?: ListParams) => api.get<School[]>("/schools", { params }),
    get: (slug: string) => api.get<School>(`/schools/${slug}`),
    create: (data: any) => api.post<School>("/schools", data),
    update: (id: string, data: any) =>
        api.patch<School>(`/schools/id/${id}`, data),
    delete: (id: string) => api.delete<void>(`/schools/id/${id}`),
};

export const departmentsApi = {
    list: (params?: ListParams) =>
        api.get<Department[]>("/departments", { params }),
    get: (slug: string) => api.get<Department>(`/departments/${slug}`),
    create: (data: any) => api.post<Department>("/departments", data),
    update: (id: string, data: any) =>
        api.patch<Department>(`/departments/id/${id}`, data),
    delete: (id: string) => api.delete<void>(`/departments/id/${id}`),
};

export const programmesApi = {
    list: (params?: ListParams) =>
        api.get<Programme[]>("/programmes", { params }),
    get: (slug: string) => api.get<Programme>(`/programmes/${slug}`),
    create: (data: any) => api.post<Programme>("/programmes", data),
    update: (id: string, data: any) =>
        api.patch<Programme>(`/programmes/id/${id}`, data),
    delete: (id: string) => api.delete<void>(`/programmes/id/${id}`),
};

export const campusesApi = {
    list: (params?: ListParams) => api.get<Campus[]>("/campuses", { params }),
    get: (slug: string) => api.get<Campus>(`/campuses/${slug}`),
    create: (data: any) => api.post<Campus>("/campuses", data),
    update: (id: string, data: any) =>
        api.patch<Campus>(`/campuses/id/${id}`, data),
    delete: (id: string) => api.delete<void>(`/campuses/id/${id}`),
};
