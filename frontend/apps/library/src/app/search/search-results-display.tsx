"use client";

import Link from "next/link";
import { CompactRecord } from "../../components/library-ui";

export type SearchResultDto = {
  id: string;
  type: string;
  title: string;
  description: string;
  libraryName: string | null;
  url: string | null;
  metadata: {
    resourceType: string | null;
    status: string | null;
    slug: string | null;
    workflowType: string | null;
  };
};

export type SearchResultPanelDto = {
  title: string;
  href: string;
  results: SearchResultDto[];
};

export function LibrarySearchResultsDisplay({ panels }: { panels: SearchResultPanelDto[] }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2" data-server-data-display="library-search-results">
      {panels.map((panel) => (
        <section key={panel.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-950">{panel.title}</h2>
            <Link href={panel.href} className="text-sm font-semibold text-primary">Open</Link>
          </div>
          <div className="mt-4 grid gap-3">
            {panel.results.length > 0 ? panel.results.slice(0, 6).map((item) => (
              <CompactRecord
                key={`${item.type}-${item.id}`}
                icon={iconForType(item.type)}
                eyebrow={formatLabel(item.type)}
                title={item.title}
                body={item.description || "Result details are being updated."}
                meta={[item.libraryName, item.metadata.resourceType, item.metadata.status]}
                href={resultHref(item)}
                action="Open result"
              />
            )) : <p className="py-4 text-sm text-slate-600">No records available.</p>}
          </div>
        </section>
      ))}
    </div>
  );
}

function resultHref(item: SearchResultDto) {
  if (item.type === "workflow") return workflowHref(item.metadata.workflowType) ?? item.url;
  if (item.url) return item.url;
  if (item.type === "guide" && item.metadata.slug) return `/guides/${item.metadata.slug}`;
  if (item.type === "policy" && item.metadata.slug) return `/policies/${item.metadata.slug}`;
  return null;
}

function workflowHref(workflowType: string | null) {
  if (workflowType === "borrowing_access") return "/borrowing";
  if (workflowType === "remote_access") return "/remote-access";
  if (workflowType === "repository_deposit") return "/repositories";
  if (workflowType === "digital_scholarship") return "/digital-scholarship";
  return null;
}

function iconForType(type: string): "book" | "database" | "users" | "shield" | "file" {
  if (type === "catalog" || type === "guide") return "book";
  if (["database", "e_resource", "electronic", "workflow"].includes(type)) return "database";
  if (type === "specialist") return "users";
  if (type === "policy") return "shield";
  return "file";
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
