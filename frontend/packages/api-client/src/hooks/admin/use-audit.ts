import { useQuery } from "@tanstack/react-query";
import type { AuditLog, AuditLogParams, PaginatedResponse } from "../../types/admin";
import { adminRequest } from "./_utils";

export const auditKeys = {
  all: ["admin", "audit"] as const,
  list: (params?: AuditLogParams) => [...auditKeys.all, params] as const,
};

const AUDIT_LOG_FIELDS = "id,service_name,action,resource_type,resource_id,status_code,status,ip_address,request_method,request_path,error_message,happened_at";
const AUDIT_LOG_INCLUDE = "user(id,full_name,email)";

export function useAuditLogs(params?: AuditLogParams) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: () =>
      adminRequest<PaginatedResponse<AuditLog>>("GET", "/api/admin/audit", {
        params: {
          ...params,
          per_page: params?.limit,
          limit: undefined,
          fields: AUDIT_LOG_FIELDS,
          include: AUDIT_LOG_INCLUDE,
        } as Record<string, unknown> | undefined,
      }),
  });
}
