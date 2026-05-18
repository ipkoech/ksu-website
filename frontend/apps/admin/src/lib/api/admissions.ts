import api, { ListParams } from "./client";

export interface Intake {
    id: string;
    name: string;
    slug: string;
    start_date: string;
    end_date?: string;
    description?: string;
    status: "planning" | "open" | "closed" | "archived";
    created_at: string;
    updated_at: string;
}

export interface AdmissionInfo {
    id: string;
    title: string;
    content: string;
    category: string;
    order?: number;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export const intakesApi = {
    list: (params?: ListParams) => api.get<Intake[]>("/intakes", { params }),
    get: (slug: string) => api.get<Intake>(`/intakes/${slug}`),
    create: (data: any) => api.post<Intake>("/intakes", data),
    update: (id: string, data: any) =>
        api.patch<Intake>(`/intakes/id/${id}`, data),
    delete: (id: string) => api.delete<void>(`/intakes/id/${id}`),
};

export const admissionInfoApi = {
    list: (params?: ListParams) =>
        api.get<AdmissionInfo[]>("/admissions/info", { params }),
    get: (id: string) => api.get<AdmissionInfo>(`/admissions/info/${id}`),
    create: (data: any) => api.post<AdmissionInfo>("/admissions/info", data),
    update: (id: string, data: any) =>
        api.patch<AdmissionInfo>(`/admissions/info/${id}`, data),
    delete: (id: string) => api.delete<void>(`/admissions/info/${id}`),
};
