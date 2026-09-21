"use client";

import { CompactRecord } from "../../components/library-ui";

export type CatalogResourceDto = {
  id: string;
  title: string;
  eyebrow: string;
  body: string;
  meta: string[];
};

/** Renders the server-projected catalog records without a hydration fetch. */
export function CatalogResultsDisplay({ resources }: { resources: CatalogResourceDto[] }) {
  return (
    <div className="grid gap-4" data-server-data-display="library-catalog-results">
      {resources.map((resource) => (
        <CompactRecord
          key={resource.id}
          icon="book"
          eyebrow={resource.eyebrow}
          title={resource.title}
          body={resource.body}
          meta={resource.meta}
          href={`/catalog?q=${encodeURIComponent(resource.title)}`}
          action="Open catalog search"
        />
      ))}
    </div>
  );
}
