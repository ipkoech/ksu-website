import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Placeholder API client
const apiClient = {
    get: async <T>(url: string): Promise<T> => {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
        if (url === "/api/news") {
            return [
                { id: "1", title: "University reopens", status: "Published", createdAt: "2023-01-01" },
                { id: "2", title: "New research grants", status: "Draft", createdAt: "2023-02-15" },
            ] as T;
        }
        return [] as T;
    },
    delete: async (url: string) => {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
        console.log(`Deleting ${url}`);
        return {};
    },
};

interface NewsItem {
    id: string;
    title: string;
    status: string;
    createdAt: string;
}

export function useNews() {
    return useQuery<NewsItem[]>({
        queryKey: ["news"],
        queryFn: () => apiClient.get<NewsItem[]>("/api/news"),
    });
}

export function useDeleteNews() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiClient.delete(`/api/news/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["news"] });
        },
    });
}
