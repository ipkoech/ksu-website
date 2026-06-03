"use client";

import Link from "next/link";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Database, Search, X } from "lucide-react";
import { libraryApi, researchApi } from "@ksu/api-client";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@ksu/ui/components";
import { PageHeader } from "@/components/layout";
import { getResponseCount } from "@/lib/counts";

type ServiceName = "research" | "library";

type ResourceRecord = Record<string, unknown>;

type ResourceResponse = {
  data?: ResourceRecord[];
  meta?: {
    total?: number;
  };
};

interface ServiceResourcePageProps {
  title: string;
  description: string;
  service: ServiceName;
  endpoint: string;
  queryParams?: Record<string, string | number | boolean | undefined>;
  backHref: string;
  emptyMessage: string;
  backendNote: string;
}

interface NeutralServicePageProps {
  title: string;
  description: string;
  backHref: string;
  backendNote: string;
  nextStep: string;
}

const defaultParams = { page: 1, per_page: 10 };

function stringValue(record: ResourceRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
  }

  return undefined;
}

function recordTitle(record: ResourceRecord) {
  return (
    stringValue(record, [
      "title",
      "name",
      "project_title",
      "publication_title",
      "grant_title",
      "resource_title",
      "display_name",
      "slug",
      "id",
    ]) ?? "Untitled record"
  );
}

function recordMeta(record: ResourceRecord) {
  const status = stringValue(record, [
    "status",
    "approval_status",
    "is_active",
    "is_public",
  ]);
  const updated = stringValue(record, [
    "updated_at",
    "created_at",
    "start_date",
    "published_at",
  ]);

  return [status, updated].filter(Boolean).join(" · ");
}

export function ServiceResourcePage({
  title,
  description,
  service,
  endpoint,
  queryParams,
  backHref,
  emptyMessage,
  backendNote,
}: ServiceResourcePageProps) {
  const api = service === "research" ? researchApi : libraryApi;
  const [search, setSearch] = React.useState("");
  const params = React.useMemo(
    () => ({ ...defaultParams, ...queryParams, search: search || undefined }),
    [queryParams, search],
  );
  const resourceQuery = useQuery({
    queryKey: [service, endpoint, params],
    queryFn: () => api.get<ResourceResponse>(endpoint, params),
  });

  const records = resourceQuery.data?.data ?? [];
  const count = getResponseCount(resourceQuery.data);

  return (
    <div>
      <PageHeader title={title} description={description} backHref={backHref} />

      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-[0.6fr_1.4fr]">
          <Card>
            <CardHeader>
              <CardTitle>Service status</CardTitle>
              <CardDescription>Current record availability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                <div className="flex items-center gap-3">
                  <Database className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Records</span>
                </div>
                <span className="font-semibold">
                  {resourceQuery.isLoading
                    ? "--"
                    : resourceQuery.isError
                      ? "Unavailable"
                      : (count ?? records.length)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{backendNote}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Records</CardTitle>
              <CardDescription>
                Showing recent records from this service.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={`Search ${title.toLowerCase()}`}
                  className="pl-9 pr-10"
                />
                {search ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
              {resourceQuery.isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-16 animate-pulse rounded-lg bg-muted"
                    />
                  ))}
                </div>
              ) : resourceQuery.isError ? (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">
                      Data unavailable
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      The service endpoint did not return data for this session.
                    </p>
                  </div>
                </div>
              ) : records.length === 0 ? (
                <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
                  {emptyMessage}
                </p>
              ) : (
                <div className="divide-y rounded-lg border">
                  {records.map((record, index) => (
                    <div key={String(record.id ?? index)} className="p-4">
                      <div>
                        <p className="font-medium">{recordTitle(record)}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {recordMeta(record) || "No status metadata"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function NeutralServicePage({
  title,
  description,
  backHref,
  backendNote,
  nextStep,
}: NeutralServicePageProps) {
  return (
    <div>
      <PageHeader title={title} description={description} backHref={backHref} />
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Not configured</CardTitle>
            <CardDescription>{backendNote}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
              {nextStep}
            </p>
            <Button asChild variant="outline">
              <Link href={backHref}>Back</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
