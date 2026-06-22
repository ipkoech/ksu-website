import type { ComponentType } from "react";
import type { Service } from "@ksu/auth";
import type { LucideIcon } from "lucide-react";
import type {
  EditableField,
  EditableListFilter,
  EditableRecordWorkflowAction,
} from "@/components/dashboard/editable-service-resource-page";

export type PortalKey =
  | "institutional-administration"
  | "governance"
  | "schools"
  | "departments"
  | "corporate-communication"
  | "research"
  | "library"
  | "publications";

export type PortalRecord = Record<string, any> & { id: string };
export type PortalPayload = Record<string, any>;

export interface PortalNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  scope?: string | string[];
}

export interface PortalDashboardStat {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  scopes?: string[];
  queryKey: readonly unknown[];
  query: () => Promise<unknown>;
}

export interface PortalDashboardPanel {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  scopes?: string[];
}

export interface PortalResourceConfig<
  TRecord extends PortalRecord = PortalRecord,
  TPayload extends PortalPayload = PortalPayload,
> {
  key: string;
  title: string;
  description: string;
  backHref: string;
  queryKey: readonly unknown[];
  fields: EditableField[];
  listFilters?: EditableListFilter[];
  list: (filters?: PortalPayload) => Promise<{ data?: TRecord[] }>;
  create: (payload: TPayload) => Promise<unknown>;
  update: (id: string, payload: Partial<TPayload>) => Promise<unknown>;
  delete?: (id: string) => Promise<unknown>;
  getRecordTitle: (record: TRecord) => string;
  getRecordMeta?: (record: TRecord) => string;
  getRecordDetailHref?: (record: TRecord) => string | null | undefined;
  getRecordWorkflowActions?: (
    record: TRecord,
  ) => Array<EditableRecordWorkflowAction<TRecord, TPayload>>;
  emptyMessage: string;
  buildPayload?: (values: PortalPayload, editingRecord?: TRecord | null) => any;
  validate?: (values: PortalPayload, editingRecord?: TRecord | null) => Record<string, string>;
  viewScopes: string[];
  manageScopes: string[];
  deleteScopes?: string[];
  readOnlyMessage?: string;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  portalScope?: {
    typeField?: string;
    idField?: string;
    allowedScopeTypes?: string[];
    stampPayload?: boolean;
    lockedCanCreate?: boolean;
  };
}

export interface PortalConfig {
  key: PortalKey;
  title: string;
  shortTitle: string;
  description: string;
  service: Service;
  baseHref: string;
  icon: LucideIcon;
  accentClassName: string;
  nav: PortalNavItem[];
  dashboard: {
    title: string;
    description: string;
    stats: PortalDashboardStat[];
    panels: PortalDashboardPanel[];
    scopeBadges: string[];
  };
  resources: Record<string, PortalResourceConfig<any, any>>;
  publicPortal?: {
    label: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
  };
}
