"use client";

import Link from "next/link";

import type {
  LibraryBranch,
  LibraryRegulation,
  LibraryServiceRecord,
} from "@ksu/api-client";
import { EditorialSection } from "../../components/library-page-sections";
import { LibraryActionLink, StatusMessage } from "../../components/library-ui";

export type PublishedService = LibraryServiceRecord & { branch: LibraryBranch };

export function ServicesRecordDisplay({
  branches,
  services,
  regulations,
}: {
  branches: LibraryBranch[];
  services: PublishedService[];
  regulations: LibraryRegulation[];
}) {
  return (
    <div data-server-data-display="library-services-records">
      <div id="branches-heading" className="scroll-mt-24">
        <EditorialSection
          eyebrow="Branches"
          title="Where services are available"
          body="Choose a branch for local contacts and visit planning."
        >
          {branches.length === 0 ? (
            <StatusMessage>No public library branches are available yet.</StatusMessage>
          ) : (
            <div className="divide-y divide-border border-y border-border">
              {branches.map((branch) => {
                const count = services.filter((service) => service.branch.id === branch.id).length;
                return (
                  <div key={branch.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{branch.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {branch.address ?? branch.location ?? "Location being updated"} · {count} published service{count === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Link href="/contact#hours" className="text-sm font-semibold text-primary hover:text-secondary">View opening hours</Link>
                  </div>
                );
              })}
            </div>
          )}
        </EditorialSection>
      </div>

      <div id="regulations-heading" className="scroll-mt-24">
        <EditorialSection
          eyebrow="Policies"
          title="Know the guidance before you visit"
          body="Review active borrowing, access, conduct, and fee guidance published by the Library."
        >
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
            <div className="divide-y divide-border border-y border-border">
              {regulations.length === 0 ? (
                <StatusMessage>No active library regulations are available yet.</StatusMessage>
              ) : (
                regulations.map((regulation) => (
                  <article key={regulation.id} className="py-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">{formatLabel(regulation.category ?? "Regulation")}</p>
                    <h3 className="mt-2 text-xl font-semibold text-foreground">{regulation.title ?? "Library regulation"}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{compactText(regulation.content) || "Regulation details are being updated."}</p>
                  </article>
                ))
              )}
            </div>
            <div className="border-l-4 border-secondary bg-surface-subtle p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">Need clarification?</p>
              <h3 className="mt-3 text-2xl font-semibold text-foreground">Talk to the Library team.</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">If a policy or service record does not answer your question, send the team the branch, resource, or deadline involved.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <LibraryActionLink href="/ask">Ask a librarian</LibraryActionLink>
                <LibraryActionLink href="/contact">Contact us</LibraryActionLink>
              </div>
            </div>
          </div>
        </EditorialSection>
      </div>
    </div>
  );
}
function compactText(value?: string | number | null) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function formatLabel(value?: string | null) {
  return compactText(value).replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
