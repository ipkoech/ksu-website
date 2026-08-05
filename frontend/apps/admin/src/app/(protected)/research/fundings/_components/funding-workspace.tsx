"use client";

import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileCheck2, FileClock, HandCoins, ShieldCheck, WalletCards } from "lucide-react";
import { Badge, Card, CardContent } from "@ksu/ui/components";
import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import {
  relationshipAdapters,
  type RelationshipAdapter,
} from "@/components/relationships/relationship-adapters";
import { ResearchBulkActions } from "../../_components/research-resource-page";
import { ResearchDetailGuide, ResearchSectionGuide } from "../../_components/research-guidance";

export function FundingPageChrome({
  guideTitle,
  resourceKey,
  importResource,
  exportResource,
}: {
  guideTitle: string;
  resourceKey: string;
  importResource?: string;
  exportResource?: string;
}) {
  return {
    hideHeader: true,
    tableLayout: "compact" as const,
    actionsInMenuOnly: true,
    summarySlot: <FundingWorkspaceHeader />,
    toolbarSlot: (
      <>
        <ResearchBulkActions
          resourceKey={resourceKey}
          importResource={importResource}
          exportResource={exportResource}
        />
        <ResearchSectionGuide title={guideTitle} className="sm:ml-auto" />
      </>
    ),
  };
}

export function FundingDetailChrome({ title }: { title: string }) {
  return {
    hideHeader: true,
    showBackAction: false,
    showDetailGuide: false,
    actionsSlot: (record: ResearchGenericRecord) => (
      <ResearchDetailGuide
        title={title}
        status={record.status}
        isPublic={record.is_public}
        className="ml-auto"
      />
    ),
  };
}

export function FundingWorkspaceHeader() {
  return (
    <div>
      <FundingLifecycleStats />
    </div>
  );
}

function FundingLifecycleStats() {
  const grants = useQuery({
    queryKey: ["research", "funding", "summary", "grants"],
    queryFn: () => researchServiceApi.grants.list({ page: 1, per_page: 1, status: "open", fields: "id" }),
  });
  const applications = useQuery({
    queryKey: ["research", "funding", "summary", "applications"],
    queryFn: () => researchServiceApi.grantApplications.list({ page: 1, per_page: 1, fields: "id" }),
  });
  const underReview = useQuery({
    queryKey: ["research", "funding", "summary", "under-review"],
    queryFn: () => researchServiceApi.grantApplications.list({ page: 1, per_page: 1, status: "under_review", fields: "id" }),
  });
  const awarded = useQuery({
    queryKey: ["research", "funding", "summary", "awarded"],
    queryFn: () => researchServiceApi.grantApplications.list({ page: 1, per_page: 1, status: "approved", fields: "id" }),
  });
  const reportsDue = useQuery({
    queryKey: ["research", "funding", "summary", "reports-due"],
    queryFn: () => researchServiceApi.grantReports.list({ page: 1, per_page: 1, status: "draft", fields: "id" }),
  });

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <FundingMetric title="Open Calls" value={grants.data?.meta?.total} loading={grants.isLoading} icon={<HandCoins className="h-4 w-4" />} />
      <FundingMetric title="Applications" value={applications.data?.meta?.total} loading={applications.isLoading} icon={<FileClock className="h-4 w-4" />} />
      <FundingMetric title="Under Review" value={underReview.data?.meta?.total} loading={underReview.isLoading} icon={<ShieldCheck className="h-4 w-4" />} />
      <FundingMetric title="Awarded" value={awarded.data?.meta?.total} loading={awarded.isLoading} icon={<FileCheck2 className="h-4 w-4" />} />
      <FundingMetric title="Reports Due" value={reportsDue.data?.meta?.total} loading={reportsDue.isLoading} icon={<WalletCards className="h-4 w-4" />} />
    </div>
  );
}

function FundingMetric({
  title,
  value,
  loading,
  icon,
}: {
  title: string;
  value?: number;
  loading: boolean;
  icon: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold">{loading ? "--" : (value ?? 0).toLocaleString()}</p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-md border bg-muted/30 text-muted-foreground">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

export function FundingRelationCell({
  id,
  adapterKey,
  emptyLabel,
}: {
  id?: string | null;
  adapterKey: keyof typeof relationshipAdapters;
  emptyLabel: string;
}) {
  const adapter = relationshipAdapters[adapterKey] as RelationshipAdapter;
  const relationQuery = useQuery({
    queryKey: ["research", "funding", "relation", adapterKey, id],
    queryFn: () => adapter.get(id as string),
    enabled: Boolean(id),
    staleTime: 60_000,
  });

  if (!id) return <span className="text-sm text-muted-foreground">{emptyLabel}</span>;
  if (relationQuery.isLoading) return <span className="text-sm text-muted-foreground">Loading...</span>;
  const option = relationQuery.data;
  return (
    <div className="space-y-1">
      <p className="font-medium">{option?.label ?? "Related record unavailable"}</p>
      {option?.description ? <p className="text-xs text-muted-foreground">{option.description}</p> : null}
    </div>
  );
}

export function StatusBadge({ value }: { value?: string | null }) {
  return <Badge variant="outline">{labelize(value) || "Unspecified"}</Badge>;
}

export function MoneyValue({
  amount,
  currency,
}: {
  amount?: string | number | null;
  currency?: string | null;
}) {
  if (amount === null || amount === undefined || amount === "") {
    return <span className="text-sm text-muted-foreground">No amount</span>;
  }
  const numeric = Number(amount);
  return (
    <span className="font-medium">
      {currency ?? "KES"} {Number.isFinite(numeric) ? numeric.toLocaleString() : String(amount)}
    </span>
  );
}

export function formatFundingDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function labelize(value?: string | null) {
  if (!value) return "";
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function recordDisplayName(record: ResearchGenericRecord) {
  return record.title ?? record.name ?? record.project_title ?? record.application_number ?? record.code ?? "Untitled record";
}
