import api, { ListParams } from "./client";

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    category?: string;
    order?: number;
    created_at: string;
    updated_at: string;
}

export interface Contact {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    department?: string;
    location?: string;
    created_at: string;
    updated_at: string;
}

export interface SupportTicket {
    id: string;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high";
    status: "open" | "in_progress" | "resolved" | "closed";
    assignee?: string;
    created_at: string;
    updated_at: string;
}

export const faqsApi = {
    list: (params?: ListParams) => api.get<FAQ[]>("/faqs", { params }),
    get: (id: string) => api.get<FAQ>(`/faqs/${id}`),
    create: (data: any) => api.post<FAQ>("/faqs", data),
    update: (id: string, data: any) =>
        api.patch<FAQ>(`/faqs/${id}`, data),
    delete: (id: string) => api.delete<void>(`/faqs/${id}`),
};

export const contactsApi = {
    list: (params?: ListParams) => api.get<Contact[]>("/contacts", { params }),
    get: (id: string) => api.get<Contact>(`/contacts/${id}`),
    create: (data: any) => api.post<Contact>("/contacts", data),
    update: (id: string, data: any) =>
        api.patch<Contact>(`/contacts/${id}`, data),
    delete: (id: string) => api.delete<void>(`/contacts/${id}`),
};

export const supportTicketsApi = {
    list: (params?: ListParams) =>
        api.get<SupportTicket[]>("/support", { params }),
    get: (id: string) => api.get<SupportTicket>(`/support/${id}`),
    create: (data: any) => api.post<SupportTicket>("/support", data),
    update: (id: string, data: any) =>
        api.patch<SupportTicket>(`/support/${id}`, data),
    delete: (id: string) => api.delete<void>(`/support/${id}`),
};
