import api, { ListParams } from "./client";

export interface Club {
    id: string;
    name: string;
    slug: string;
    description?: string;
    patron?: string;
    members_count?: number;
    created_at: string;
    updated_at: string;
}

export interface Accommodation {
    id: string;
    name: string;
    slug: string;
    description?: string;
    capacity?: number;
    occupancy?: number;
    location?: string;
    created_at: string;
    updated_at: string;
}

export interface SportsFacility {
    id: string;
    name: string;
    slug: string;
    description?: string;
    location?: string;
    capacity?: number;
    created_at: string;
    updated_at: string;
}

export interface ArtsCulture {
    id: string;
    name: string;
    slug: string;
    category: string;
    description?: string;
    coordinator?: string;
    created_at: string;
    updated_at: string;
}

export const clubsApi = {
    list: (params?: ListParams) => api.get<Club[]>("/clubs", { params }),
    get: (slug: string) => api.get<Club>(`/clubs/${slug}`),
    create: (data: any) => api.post<Club>("/clubs", data),
    update: (id: string, data: any) =>
        api.patch<Club>(`/clubs/id/${id}`, data),
    delete: (id: string) => api.delete<void>(`/clubs/id/${id}`),
};

export const accommodationsApi = {
    list: (params?: ListParams) =>
        api.get<Accommodation[]>("/accommodations", { params }),
    get: (slug: string) => api.get<Accommodation>(`/accommodations/${slug}`),
    create: (data: any) => api.post<Accommodation>("/accommodations", data),
    update: (id: string, data: any) =>
        api.patch<Accommodation>(`/accommodations/id/${id}`, data),
    delete: (id: string) => api.delete<void>(`/accommodations/id/${id}`),
};

export const sportsFacilitiesApi = {
    list: (params?: ListParams) =>
        api.get<SportsFacility[]>("/sports-facilities", { params }),
    get: (slug: string) =>
        api.get<SportsFacility>(`/sports-facilities/${slug}`),
    create: (data: any) => api.post<SportsFacility>("/sports-facilities", data),
    update: (id: string, data: any) =>
        api.patch<SportsFacility>(`/sports-facilities/id/${id}`, data),
    delete: (id: string) =>
        api.delete<void>(`/sports-facilities/id/${id}`),
};

export const artsCultureApi = {
    list: (params?: ListParams) =>
        api.get<ArtsCulture[]>("/arts-culture", { params }),
    get: (slug: string) => api.get<ArtsCulture>(`/arts-culture/${slug}`),
    create: (data: any) => api.post<ArtsCulture>("/arts-culture", data),
    update: (id: string, data: any) =>
        api.patch<ArtsCulture>(`/arts-culture/id/${id}`, data),
    delete: (id: string) => api.delete<void>(`/arts-culture/id/${id}`),
};
