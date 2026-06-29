"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  relationshipAdapters,
  type RelationshipAdapter,
  type RelationshipFilters,
} from "@/components/relationships/relationship-adapters";

type ResourceApi = {
  getBySlug?: (slug: string) => Promise<{ data?: ResearchGenericRecord }>;
  list?: (params?: Record<string, string | number | boolean | undefined>) => Promise<{ data?: ResearchGenericRecord[] }>;
};

type DetailSection = {
  title: string;
  fields: string[];
};

type FactField = {
  label: string;
  field: string;
  format?: "date" | "datetime" | "label" | "boolean";
  relation?: {
    adapter: keyof typeof relationshipAdapters;
    filters?: RelationshipFilters;
  };
};

export function ResearchAdminDetailPage({
  title,
  description,
  resource,
  backHref,
  editHref,
  publicHrefBase,
  slugParam = "slug",
  lookup = "slug",
  labelFields = ["status"],
  factFields = [],
  sections = [],
  renderAfter,
}: {
  title: string;
  description: string;
  resource: ResourceApi;
  backHref: string;
  editHref?: (record: ResearchGenericRecord) => string | null | undefined;
  publicHrefBase?: string;
  slugParam?: string;
  lookup?: "slug" | "id";
  labelFields?: string[];
  factFields?: FactField[];
  sections?: DetailSection[];
  renderAfter?: (record: ResearchGenericRecord) => ReactNode;
}) {
  const params = useParams<Record<string, string>>();
  const value = params[slugParam];
  const recordQuery = useQuery({
    queryKey: ["research", "detail", title, lookup, value],
    queryFn: async () => {
      if (lookup === "slug") {
        if (!resource.getBySlug) throw new Error("This resource does not support slug lookup.");
        const response = await resource.getBySlug(value);
        return response.data ?? null;
      }
      if (!resource.list) throw new Error("This resource does not support list lookup.");
      const response = await resource.list({ page: 1, per_page: 100 });
      return (response.data ?? []).find((record) => record.id === value) ?? null;
    },
    enabled: Boolean(value),
  });
  const record = recordQuery.data ?? null;
  const recordTitle = record ? getTitle(record) : title;
  const labels = record
    ? labelFields.map((field) => formatLabel(record[field])).filter(Boolean)
    : [];
  const publicHref = record?.slug && publicHrefBase ? `${publicHrefBase}/${record.slug}` : null;
  const resolvedEditHref = record ? editHref?.(record) : null;

  return (
    <div>
      <PageHeader title={recordTitle} description={description} backHref={backHref} />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={backHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          {resolvedEditHref ? (
            <Button asChild variant="outline">
              <Link href={resolvedEditHref}>Edit</Link>
            </Button>
          ) : null}
          {publicHref ? (
            <Button asChild variant="outline">
              <Link href={publicHref} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Public Page
              </Link>
            </Button>
          ) : null}
        </div>

        {recordQuery.isLoading ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">Loading record...</CardContent>
          </Card>
        ) : recordQuery.isError ? (
          <Card>
            <CardContent className="p-6 text-sm text-destructive">Failed to load record.</CardContent>
          </Card>
        ) : !record ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">Record not found.</CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              {sections.map((section) => (
                <DetailSectionCard key={section.title} record={record} section={section} />
              ))}
              {renderAfter?.(record)}
            </div>
            <aside className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Record Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {labels.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(labels)).map((label) => (
                        <Badge key={label} variant="outline">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  <dl className="space-y-3">
                    {factFields.map((fact) => (
                      <RecordFact
                        key={fact.label}
                        record={record}
                        fact={fact}
                      />
                    ))}
                  </dl>
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function RecordFact({
  record,
  fact,
}: {
  record: ResearchGenericRecord;
  fact: FactField;
}) {
  const rawValue = record[fact.field];
  const formattedValue = formatValue(rawValue, fact.format);
  if (!formattedValue) return null;

  if (fact.relation && typeof rawValue === "string") {
    return (
      <RelationshipFact
        label={fact.label}
        id={rawValue}
        adapterKey={fact.relation.adapter}
        filters={fact.relation.filters}
      />
    );
  }

  return <Fact label={fact.label} value={formattedValue} />;
}

function RelationshipFact({
  label,
  id,
  adapterKey,
  filters,
}: {
  label: string;
  id: string;
  adapterKey: keyof typeof relationshipAdapters;
  filters?: RelationshipFilters;
}) {
  const adapter = relationshipAdapters[adapterKey] as RelationshipAdapter;
  const relationQuery = useQuery({
    queryKey: ["relationship-fact", adapterKey, id, filters],
    queryFn: () => adapter.get(id, filters),
    enabled: Boolean(id),
  });
  const option = relationQuery.data;
  const value = option
    ? [option.label, option.description].filter(Boolean).join(" - ")
    : relationQuery.isLoading
      ? "Loading..."
      : "Not found";

  return <Fact label={label} value={value} />;
}

function DetailSectionCard({
  record,
  section,
}: {
  record: ResearchGenericRecord;
  section: DetailSection;
}) {
  const entries = section.fields
    .map((field) => ({ label: formatLabel(field), value: formatValue(record[field]) }))
    .filter((entry) => entry.value);

  if (entries.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{section.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.label}>
            <p className="text-xs font-semibold uppercase text-muted-foreground">{entry.label}</p>
            <p className="mt-1 whitespace-pre-line text-sm leading-6">{entry.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium">{value}</dd>
    </div>
  );
}

function getTitle(record: ResearchGenericRecord) {
  return String(record.title ?? record.name ?? record.display_name ?? record.organization_name ?? record.code ?? record.id);
}

function formatLabel(value: unknown): string {
  return formatValue(value, "label");
}

function formatValue(
  value: unknown,
  format?: "date" | "datetime" | "label" | "boolean",
): string {
  if (value === null || value === undefined || value === "") return "";
  if (format === "boolean" || typeof value === "boolean") return value ? "Yes" : "No";
  if (format === "date" || format === "datetime") {
    const date = new Date(String(value));
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        ...(format === "datetime" ? { hour: "2-digit", minute: "2-digit" } : {}),
      }).format(date);
    }
  }
  if (Array.isArray(value)) return value.map((item) => formatValue(item)).filter(Boolean).join(", ");
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  const text = String(value).replace(/\s+/g, " ").trim();
  if (format === "label") return text.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  return text;
}
