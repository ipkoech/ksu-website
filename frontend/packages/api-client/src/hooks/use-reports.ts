import { useMutation, useQuery } from "@tanstack/react-query";
import { adminReportsApi, analyticsApi } from "../main/api";
import { queryKeys } from "./query-keys";
import type { AnalyticsEventPayload } from "../main/types";

export function useReportsOverview(params?: { days?: number }) {
  return useQuery({
    queryKey: queryKeys.reports.overview(params),
    queryFn: () => adminReportsApi.overview(params),
  });
}

export function useTrafficReport(params?: { days?: number }) {
  return useQuery({
    queryKey: queryKeys.reports.traffic(params),
    queryFn: () => adminReportsApi.traffic(params),
  });
}

export function useContentReport(params?: { days?: number }) {
  return useQuery({
    queryKey: queryKeys.reports.content(params),
    queryFn: () => adminReportsApi.content(params),
  });
}

export function useAdminActivityReport(params?: { days?: number }) {
  return useQuery({
    queryKey: queryKeys.reports.adminActivity(params),
    queryFn: () => adminReportsApi.adminActivity(params),
  });
}

export function useIngestAnalyticsEvents() {
  return useMutation({
    mutationFn: (events: AnalyticsEventPayload[]) => analyticsApi.ingestEvents(events),
  });
}

export { adminReportsApi };
