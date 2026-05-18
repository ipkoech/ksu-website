import api, { ApiResponse, ListParams } from "./client";

// Types
export interface News {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    featured_media_id?: string;
    status: "draft" | "published" | "archived";
    is_featured: boolean;
    is_public: boolean;
    published_at?: string;
    created_at: string;
    updated_at: string;
}

export interface NewsCreate {
    title: string;
    excerpt?: string;
    content?: string;
    featured_media_id?: string;
    status?: string;
    is_featured?: boolean;
    is_public?: boolean;
    published_at?: string;
}

export interface Blog {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    author?: string;
    featured_media_id?: string;
    status: "draft" | "published" | "archived";
    created_at: string;
    updated_at: string;
}

export interface Event {
    id: string;
    title: string;
    slug: string;
    description?: string;
    location?: string;
    start_date: string;
    end_date?: string;
    featured_media_id?: string;
    status: "draft" | "published" | "archived";
    created_at: string;
    updated_at: string;
}

export interface Announcement {
    id: string;
    title: string;
    content?: string;
    priority: "low" | "medium" | "high";
    status: "draft" | "published" | "archived";
    created_at: string;
    updated_at: string;
}

// API functions
export const newsApi = {
    list: (params?: ListParams) => api.get<News[]>("/news", { params }),
    get: (slug: string) => api.get<News>(`/news/${slug}`),
    create: (data: NewsCreate) => api.post<News>("/news", data),
    update: (id: string, data: Partial<NewsCreate>) =>
        api.patch<News>(`/news/id/${id}`, data),
    delete: (id: string) => api.delete<void>(`/news/id/${id}`),
};

export const blogsApi = {
    list: (params?: ListParams) => api.get<Blog[]>("/blogs", { params }),
    get: (slug: string) => api.get<Blog>(`/blogs/${slug}`),
    create: (data: any) => api.post<Blog>("/blogs", data),
    update: (id: string, data: any) => api.patch<Blog>(`/blogs/id/${id}`, data),
    delete: (id: string) => api.delete<void>(`/blogs/id/${id}`),
};

export const eventsApi = {
    list: (params?: ListParams) => api.get<Event[]>("/events", { params }),
    get: (slug: string) => api.get<Event>(`/events/${slug}`),
    create: (data: any) => api.post<Event>("/events", data),
    update: (id: string, data: any) =>
        api.patch<Event>(`/events/id/${id}`, data),
    delete: (id: string) => api.delete<void>(`/events/id/${id}`),
};

export const announcementsApi = {
    list: (params?: ListParams) =>
        api.get<Announcement[]>("/announcements", { params }),
    get: (id: string) => api.get<Announcement>(`/announcements/${id}`),
    create: (data: any) => api.post<Announcement>("/announcements", data),
    update: (id: string, data: any) =>
        api.patch<Announcement>(`/announcements/${id}`, data),
    delete: (id: string) => api.delete<void>(`/announcements/${id}`),
};
