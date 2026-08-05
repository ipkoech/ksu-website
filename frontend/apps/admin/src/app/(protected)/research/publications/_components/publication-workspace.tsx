"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpenCheck, CalendarDays, CheckCircle2, FileSearch, LibraryBig } from "lucide-react";
import { Badge, Card, CardContent } from "@ksu/ui/components";
import { cn } from "@ksu/ui/lib";
import { researchServiceApi } from "@ksu/api-client";
import {
  relationshipAdapters,
  type RelationshipAdapter,
} from "@/components/relationships/relationship-adapters";

const publicationTabs = [
  { label: "Publications", href: "/research/publications" },
  { label: "Journals", href: "/research/publications/journals" },
  { label: "Outputs", href: "/research/outputs" },
  { label: "Reports", href: "/research/reports" },
];

export function PublicationWorkspaceHeader() {
  return (
    <div className="space-y-3">
      <PublicationAnalytics />
      <PublicationTabs />
    </div>
  );
}

function PublicationTabs() {
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto rounded-lg border bg-background p-1">
      <div className="flex min-w-max gap-1">
        {publicationTabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function PublicationAnalytics() {
  const currentYear = new Date().getFullYear();
  const totalPublications = useQuery({
    queryKey: ["research", "publication-workspace", "total-publications"],
    queryFn: () => researchServiceApi.publications.list({ page: 1, per_page: 1, fields: "id" }),
  });
  const thisYear = useQuery({
    queryKey: ["research", "publication-workspace", "this-year", currentYear],
    queryFn: () => researchServiceApi.publications.list({ page: 1, per_page: 1, year: currentYear, fields: "id" }),
  });
  const peerReviewed = useQuery({
    queryKey: ["research", "publication-workspace", "peer-reviewed"],
    queryFn: () => researchServiceApi.publications.list({ page: 1, per_page: 1, publication_type: "journal_article", fields: "id" }),
  });
  const indexedOutputs = useQuery({
    queryKey: ["research", "publication-workspace", "indexed-outputs"],
    queryFn: () => researchServiceApi.outputs.list({ page: 1, per_page: 1, status: "published", fields: "id" }),
  });
  const pendingValidation = useQuery({
    queryKey: ["research", "publication-workspace", "pending-validation"],
    queryFn: () => researchServiceApi.publications.list({ page: 1, per_page: 1, status: "under_review", fields: "id" }),
  });

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <PublicationMetric title="Total Publications" value={totalPublications.data?.meta?.total} loading={totalPublications.isLoading} icon={<LibraryBig className="h-4 w-4" />} />
      <PublicationMetric title="This Year" value={thisYear.data?.meta?.total} loading={thisYear.isLoading} icon={<CalendarDays className="h-4 w-4" />} />
      <PublicationMetric title="Peer Reviewed" value={peerReviewed.data?.meta?.total} loading={peerReviewed.isLoading} icon={<BookOpenCheck className="h-4 w-4" />} />
      <PublicationMetric title="Indexed Outputs" value={indexedOutputs.data?.meta?.total} loading={indexedOutputs.isLoading} icon={<CheckCircle2 className="h-4 w-4" />} />
      <PublicationMetric title="Pending Validation" value={pendingValidation.data?.meta?.total} loading={pendingValidation.isLoading} icon={<FileSearch className="h-4 w-4" />} />
    </div>
  );
}

function PublicationMetric({
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

export function PublicationRelationCell({
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
    queryKey: ["research", "publication-workspace", "relation", adapterKey, id],
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

export function AuthorsCell({ record }: { record: Record<string, any> }) {
  const authors = Array.isArray(record.authors) ? record.authors : [];
  const names = authors
    .map((author) => author?.name ?? author?.full_name ?? author?.display_name)
    .filter(Boolean);
  const fallback = [record.editors, record.author_name, record.creator_name].filter(Boolean);
  const visible = [...names, ...fallback].slice(0, 3);

  if (visible.length === 0) {
    return <span className="text-sm text-muted-foreground">No authors recorded</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((name) => (
        <Badge key={String(name)} variant="secondary">
          {String(name)}
        </Badge>
      ))}
      {names.length > visible.length ? (
        <Badge variant="outline">+{names.length - visible.length}</Badge>
      ) : null}
    </div>
  );
}

export function StatusBadge({ value }: { value?: string | null }) {
  return <Badge variant="outline">{labelize(value) || "Unspecified"}</Badge>;
}

export function formatPublicationDate(value?: string | null) {
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
