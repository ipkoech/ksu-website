"use client";

import type {
  LibraryBranch,
  LibraryElectronicResource,
  LibraryExternalLink,
  LibraryFile,
} from "@ksu/api-client";
import { ListPagination } from "@ksu/ui/components";
import {
  CompactRecord,
  ExternalAnchor,
  LibraryActionLink,
  LibraryBadge,
  LibrarySection,
  LibraryContentBand,
  LibrarySectionHeading,
  MetricStrip,
  SidePanel,
  StatusMessage,
} from "../../components/library-ui";

type BranchLink = LibraryExternalLink & { branch: LibraryBranch };
type BranchFile = LibraryFile & { branch: LibraryBranch };

export type ElectronicResourcesDisplayProps = {
  resources: LibraryElectronicResource[];
  featured: LibraryElectronicResource[];
  grouped: Array<[string, LibraryElectronicResource[]]>;
  externalLinks: BranchLink[];
  downloadFiles: BranchFile[];
  query: string;
  resourceType: string;
  accessLevel: string;
  featuredOnly: boolean;
  offCampusCount: number;
  vpnCount: number;
  registrationCount: number;
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  baseHref: string;
};

export function ElectronicResourcesDisplay({
  resources,
  featured,
  grouped,
  externalLinks,
  downloadFiles,
  query,
  resourceType,
  accessLevel,
  featuredOnly,
  offCampusCount,
  vpnCount,
  registrationCount,
  page,
  totalPages,
  total,
  perPage,
  baseHref,
}: ElectronicResourcesDisplayProps) {
  return (
    <>
      {featured.length > 0 ? (
        <LibrarySection eyebrow="Featured" title="Frequently used platforms">
          <div className="grid gap-5 lg:grid-cols-3">
            {featured.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} featured />
            ))}
          </div>
        </LibrarySection>
      ) : null}

      <LibraryContentBand tone="soft">
          <LibrarySectionHeading
            title={query ? `Results for "${query}"` : "Browse all e-resources"}
            body={resultSummary({
              count: resources.length,
              resourceType,
              accessLevel,
              featuredOnly,
            })}
          />
          <div className="mb-6 flex flex-wrap gap-2">
            {grouped.map(([letter]) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-white text-sm font-semibold text-muted-foreground hover:border-primary/30 hover:text-primary"
              >
                {letter}
              </a>
            ))}
          </div>
          {resources.length === 0 ? (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
              <StatusMessage>
                {query
                  ? `No electronic resources matched "${query}". Try a database name, provider, subject area, or broader filter.`
                  : "No electronic resources are available yet."}
              </StatusMessage>
              <AccessHelp />
            </div>
          ) : (
            <>
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="flex flex-col gap-8">
                  {grouped.map(([letter, items]) => (
                    <section key={letter} aria-labelledby={`letter-${letter}`}>
                      <h2
                        id={`letter-${letter}`}
                        className="mb-4 border-b border-border pb-2 text-2xl font-semibold text-foreground"
                      >
                        {letter}
                      </h2>
                      <div className="grid gap-5 lg:grid-cols-2">
                        {items.map((resource) => (
                          <ResourceCard key={resource.id} resource={resource} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>

                <aside className="flex flex-col gap-5">
                  <MetricStrip
                    items={[
                      { label: "Returned", value: resources.length },
                      { label: "Off campus", value: offCampusCount },
                      { label: "VPN required", value: vpnCount },
                    ]}
                  />
                  <SidePanel title="Remote access" eyebrow="Support">
                    <p className="text-sm leading-7 text-muted-foreground">
                      Some platforms require campus network access, VPN, or a personal account.
                      Use the access notes on each record before opening the provider site.
                    </p>
                    <p className="mt-3 text-sm font-semibold text-foreground">
                      {registrationCount} resources require registration.
                    </p>
                  </SidePanel>
                  <AccessHelp />
                </aside>
              </div>
              <ListPagination
                page={page}
                totalPages={totalPages}
                total={total}
                perPage={perPage}
                baseHref={baseHref}
              />
            </>
          )}
      </LibraryContentBand>

      <LibrarySection
        eyebrow="Repository"
        title="OPAC and off-campus access points"
        tone="white"
      >
        {externalLinks.length === 0 ? (
          <StatusMessage>No public repository or external access links are available yet.</StatusMessage>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {externalLinks.map((link) => (
              <CompactRecord
                key={link.id}
                icon="database"
                eyebrow={formatLabel(link.link_type)}
                title={link.label}
                body={compactText(link.description) || "Access link details are maintained by the library team."}
                meta={[link.branch.name]}
                href={safeExternalUrl(link.url) ?? undefined}
                action="Open link"
              />
            ))}
          </div>
        )}
      </LibrarySection>

      <LibrarySection eyebrow="Downloads" title="Library documents and forms">
        {downloadFiles.length === 0 ? (
          <StatusMessage>No public library downloads are available yet.</StatusMessage>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {downloadFiles.map((file) => (
              <CompactRecord
                key={file.id}
                icon="file"
                eyebrow={formatLabel(file.file_category ?? "file")}
                title={file.title}
                body={compactText(file.description) || "Document details are being updated."}
                meta={[file.branch.name, formatLabel(file.access_level)]}
                href={file.file_url ?? undefined}
                action="Download"
              />
            ))}
          </div>
        )}
      </LibrarySection>
    </>
  );
}
function ResourceCard({
  resource,
  featured = false,
}: {
  resource: LibraryElectronicResource;
  featured?: boolean;
}) {
  const accessUrl = safeExternalUrl(resource.access_url);
  const subjects = Array.isArray(resource.subjects) ? resource.subjects : [];
  const notes = compactText(resource.notes);

  return (
    <article
      data-server-data-display="library-electronic-records"
      className={
        featured
          ? "rounded-2xl bg-card p-5 ring-1 ring-primary/30"
          : "rounded-2xl bg-card p-5 ring-1 ring-primary/10"
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <LibraryBadge>{formatLabel(resource.resource_type ?? "database")}</LibraryBadge>
        <LibraryBadge tone={resource.requires_vpn ? "secondary" : "primary"}>
          {resource.requires_vpn
            ? "VPN required"
            : formatLabel(resource.access_level ?? "library access")}
        </LibraryBadge>
        {resource.requires_registration ? <LibraryBadge tone="muted">Registration</LibraryBadge> : null}
        {featured ? <LibraryBadge tone="primary">Featured</LibraryBadge> : null}
      </div>
      <h3 className="mt-4 text-xl font-semibold leading-7 text-foreground">
        {resource.name ?? "Untitled resource"}
      </h3>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        {compactText(resource.description) ||
          compactText(resource.provider) ||
          "Access details are managed by the library team."}
      </p>
      <dl className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
        <Meta label="Provider" value={resource.provider} />
        <Meta label="Audience" value={formatLabel(resource.access_level)} />
        <Meta label="Access" value={formatLabel(resource.access_type)} />
        <Meta label="Coverage" value={resource.coverage_dates} />
        <Meta label="Users" value={resource.simultaneous_users} />
      </dl>
      {subjects.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {subjects.slice(0, 5).map((subject) => (
            <LibraryBadge key={subject}>{subject}</LibraryBadge>
          ))}
        </div>
      ) : null}
      {notes ? (
        <p className="mt-5 rounded-md border border-border bg-surface-subtle p-3 text-sm leading-6 text-muted-foreground">
          {notes}
        </p>
      ) : null}
      {accessUrl ? (
        <div className="mt-6">
          <ExternalAnchor href={accessUrl}>Open resource</ExternalAnchor>
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">Access link pending library verification.</p>
      )}
    </article>
  );
}

function AccessHelp() {
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Access help</h2>
      <ul className="mt-4 flex flex-col gap-3 text-sm leading-6 text-muted-foreground">
        <li>Use your university network or approved off-campus access method.</li>
        <li>Check resource badges for VPN or registration requirements.</li>
        <li>Contact the library team when a subscription link does not open.</li>
      </ul>
      <div className="mt-5">
        <LibraryActionLink href="/services#services-heading">Get access support</LibraryActionLink>
      </div>
    </section>
  );
}

function resultSummary({
  count,
  resourceType,
  accessLevel,
  featuredOnly,
}: {
  count: number;
  resourceType: string;
  accessLevel: string;
  featuredOnly: boolean;
}) {
  const filters = [
    resourceType ? `type: ${formatLabel(resourceType)}` : null,
    accessLevel ? `audience: ${formatLabel(accessLevel)}` : null,
    featuredOnly ? "featured resources" : null,
  ].filter(Boolean);
  return `${count} electronic resource record${count === 1 ? "" : "s"} available${filters.length ? ` for ${filters.join(", ")}` : ""}.`;
}

function Meta({ label, value }: { label: string; value?: string | number | null }) {
  if (!compactText(value)) return null;
  return <div><dt className="font-semibold text-foreground">{label}</dt><dd className="mt-1">{value}</dd></div>;
}

function compactText(value?: string | number | null) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function formatLabel(value?: string | null) {
  return compactText(value).replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function safeExternalUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}
