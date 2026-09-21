"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { LibraryBranch, LibraryElectronicResource } from "@ksu/api-client";
import { LibraryActionLink, LibraryContentBand, LibrarySectionHeading, StatusMessage } from "./library-ui";
import { ParallaxFigure, Reveal, StaggerGroup, StaggerItem } from "./library-motion";
import { compactText, formatLabel, safeExternalUrl } from "../lib/library-formatters";

export type LibraryOverviewUpdate = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  plainText: string | null;
  kind: string;
  updateType: string;
};

type LibraryOverviewDataProps = {
  featuredResources: Array<Pick<LibraryElectronicResource, "id" | "name" | "resource_type" | "description" | "provider" | "access_url">>;
  branches: Array<Pick<LibraryBranch, "id" | "name" | "address" | "location">>;
  updates: LibraryOverviewUpdate[];
};

export function LibraryOverviewData({ featuredResources, branches, updates }: LibraryOverviewDataProps) {
  return (
    <>
      <LibraryContentBand>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <ParallaxFigure
            src="/images/library/shelves.jpg"
            alt="Shelves of books inside the Kisii University Library"
            className="aspect-[4/3] lg:aspect-auto lg:min-h-full"
          />
          <div data-server-data-display="library-featured-resources">
            <LibrarySectionHeading
              title="Featured e-resources"
              body="Start with the digital platforms and collections most useful for study, teaching, and research."
            />
            {featuredResources.length === 0 ? (
              <StatusMessage>No featured electronic resources are available yet.</StatusMessage>
            ) : (
              <Reveal>
                <div className="divide-y divide-border border-y border-border">
                  {featuredResources.map((resource) => {
                    const accessUrl = safeExternalUrl(resource.access_url);
                    return (
                      <div key={resource.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <h3 className="text-lg font-semibold text-foreground">{resource.name}</h3>
                            <span className="text-xs font-semibold text-secondary">{formatLabel(resource.resource_type)}</span>
                          </div>
                          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                            {compactText(resource.description) || resource.provider || "Access details are maintained by the library team."}
                          </p>
                        </div>
                        {accessUrl ? (
                          <a href={accessUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">
                            Open resource <ExternalLink aria-hidden className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="shrink-0 text-sm text-muted-foreground">Access link pending</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6"><LibraryActionLink href="/electronic">View all e-resources</LibraryActionLink></div>
              </Reveal>
            )}
          </div>
        </div>
      </LibraryContentBand>

      <LibraryContentBand>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div data-server-data-display="library-branches">
            <LibrarySectionHeading
              title="Find a place to study and connect"
              body="Explore KSU library branches, published opening hours, services, and contact points before your visit."
            />
            <Reveal>
              {branches.length === 0 ? (
                <StatusMessage>No library branches are available yet.</StatusMessage>
              ) : (
                <div className="divide-y divide-border border-y border-border">
                  {branches.map((branch) => (
                    <div key={branch.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{branch.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{branch.address ?? branch.location ?? "Location being updated"}</p>
                      </div>
                      <Link href="/contact#hours" className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">
                        View hours
                        <ArrowRight aria-hidden className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </Reveal>
          </div>
          <ParallaxFigure src="/images/library/reading-veranda.jpg" alt="Students reading on the veranda of the Kisii University Library" className="aspect-[4/3] lg:aspect-auto lg:min-h-full" />
        </div>
      </LibraryContentBand>

      <LibraryContentBand tone="soft">
        <LibrarySectionHeading
          title="What is happening at the Library"
          body="Keep up with workshops, new resources, service updates, and support announcements."
        />
        <div data-server-data-display="library-updates">
          {updates.length === 0 ? (
            <StatusMessage>No library updates are available yet.</StatusMessage>
          ) : (
            <StaggerGroup className="grid gap-8 lg:grid-cols-3">
              {updates.map((item) => (
                <StaggerItem key={`${item.kind}-${item.id}`}>
                  <article className="border-t border-border pt-5">
                    <p className="text-sm font-semibold text-secondary">{item.kind}</p>
                    <h3 className="mt-2 text-xl font-semibold leading-7 text-foreground">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{compactText(item.summary ?? item.plainText) || "Read the latest library update."}</p>
                    <Link href={`/updates/${item.updateType}/${item.slug}`} className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">
                      Read update
                      <ArrowRight aria-hidden className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" />
                    </Link>
                  </article>
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </div>
        <div className="mt-8"><LibraryActionLink href="/updates">View all updates</LibraryActionLink></div>
      </LibraryContentBand>
    </>
  );
}
