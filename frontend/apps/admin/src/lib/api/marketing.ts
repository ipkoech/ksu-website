import api, { ListParams } from "./client";

export interface Newsletter {
    id: string;
    subject: string;
    content?: string;
    recipients_count?: number;
    sent_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Testimonial {
    id: string;
    author_name: string;
    author_title?: string;
    content: string;
    featured_media_id?: string;
    is_featured: boolean;
    status: "draft" | "published";
    created_at: string;
    updated_at: string;
}

export interface SocialPost {
    id: string;
    content: string;
    platform: "facebook" | "twitter" | "instagram" | "linkedin";
    scheduled_at?: string;
    published_at?: string;
    status: "draft" | "published" | "scheduled";
    created_at: string;
    updated_at: string;
}

export const newslettersApi = {
    list: (params?: ListParams) =>
        api.get<Newsletter[]>("/newsletters", { params }),
    get: (id: string) => api.get<Newsletter>(`/newsletters/${id}`),
    create: (data: any) => api.post<Newsletter>("/newsletters", data),
    update: (id: string, data: any) =>
        api.patch<Newsletter>(`/newsletters/${id}`, data),
    delete: (id: string) => api.delete<void>(`/newsletters/${id}`),
};

export const testimonialsApi = {
    list: (params?: ListParams) =>
        api.get<Testimonial[]>("/testimonials", { params }),
    get: (id: string) => api.get<Testimonial>(`/testimonials/${id}`),
    create: (data: any) => api.post<Testimonial>("/testimonials", data),
    update: (id: string, data: any) =>
        api.patch<Testimonial>(`/testimonials/${id}`, data),
    delete: (id: string) => api.delete<void>(`/testimonials/${id}`),
};

export const socialPostsApi = {
    list: (params?: ListParams) =>
        api.get<SocialPost[]>("/social-posts", { params }),
    get: (id: string) => api.get<SocialPost>(`/social-posts/${id}`),
    create: (data: any) => api.post<SocialPost>("/social-posts", data),
    update: (id: string, data: any) =>
        api.patch<SocialPost>(`/social-posts/${id}`, data),
    delete: (id: string) => api.delete<void>(`/social-posts/${id}`),
};
