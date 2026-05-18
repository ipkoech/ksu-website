import api, { ListParams } from "./client";

export interface Person {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    national_id?: string;
    date_of_birth?: string;
    gender?: string;
    created_at: string;
    updated_at: string;
}

export interface StaffAssignment {
    id: string;
    person_id: string;
    designation: string;
    department_id?: string;
    employment_type: string;
    start_date: string;
    end_date?: string;
    created_at: string;
    updated_at: string;
}

export interface Alumni {
    id: string;
    person_id: string;
    graduation_year: number;
    programme_id?: string;
    current_position?: string;
    company?: string;
    created_at: string;
    updated_at: string;
}

export const personsApi = {
    list: (params?: ListParams) => api.get<Person[]>("/persons", { params }),
    get: (id: string) => api.get<Person>(`/persons/${id}`),
    create: (data: any) => api.post<Person>("/persons", data),
    update: (id: string, data: any) =>
        api.patch<Person>(`/persons/${id}`, data),
    delete: (id: string) => api.delete<void>(`/persons/${id}`),
};

export const staffApi = {
    list: (params?: ListParams) => api.get<StaffAssignment[]>("/staff", { params }),
    get: (id: string) => api.get<StaffAssignment>(`/staff/${id}`),
    create: (data: any) => api.post<StaffAssignment>("/staff", data),
    update: (id: string, data: any) =>
        api.patch<StaffAssignment>(`/staff/${id}`, data),
    delete: (id: string) => api.delete<void>(`/staff/${id}`),
};

export const alumniApi = {
    list: (params?: ListParams) => api.get<Alumni[]>("/alumni", { params }),
    get: (id: string) => api.get<Alumni>(`/alumni/${id}`),
    create: (data: any) => api.post<Alumni>("/alumni", data),
    update: (id: string, data: any) =>
        api.patch<Alumni>(`/alumni/${id}`, data),
    delete: (id: string) => api.delete<void>(`/alumni/${id}`),
};
