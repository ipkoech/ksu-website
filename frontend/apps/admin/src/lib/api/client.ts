import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { toast } from "sonner";

const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

// Request interceptor
client.interceptors.request.use((config) => {
    // Token is in httpOnly cookie, handled by browser
    return config;
});

// Response interceptor
client.interceptors.response.use(
    (response) => response.data,
    async (error: AxiosError<{ error?: { message?: string } }>) => {
        const message = error.response?.data?.error?.message || error.message;

        if (error.response?.status === 401) {
            window.location.href = "/login";
            return Promise.reject(error);
        }

        if (error.response?.status === 403) {
            toast.error("You don't have permission to perform this action");
        } else if (error.response?.status === 404) {
            toast.error("Resource not found");
        } else if (error.response?.status && error.response.status >= 500) {
            toast.error("Server error. Please try again later.");
        }

        return Promise.reject(error);
    }
);

export interface ApiResponse<T> {
    data: T;
    meta?: {
        total: number;
        page: number;
        per_page: number;
        total_pages: number;
    };
}

export interface ListParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    is_active?: boolean;
    is_featured?: boolean;
    is_public?: boolean;
}

export const api = {
    get: <T,>(url: string, config?: AxiosRequestConfig) =>
        client.get<any, ApiResponse<T>>(url, config),

    post: <T,>(url: string, data?: any, config?: AxiosRequestConfig) =>
        client.post<any, ApiResponse<T>>(url, data, config),

    patch: <T,>(url: string, data?: any, config?: AxiosRequestConfig) =>
        client.patch<any, ApiResponse<T>>(url, data, config),

    delete: <T,>(url: string, config?: AxiosRequestConfig) =>
        client.delete<any, ApiResponse<T>>(url, config),
};

export default api;
