import type { Metadata } from "next";
import { SiteShell } from "../../../components/site-shell";
import { getPublications } from "../../../lib/api";
import { PublicResearchList } from "../../../components/data/public-content";
import { uncachedFallback } from "../../../lib/server-fallback";

export const metadata: Metadata = {
  title: "Publications",
  description:
    "Publications and resources from the HERI Africa Language Education Research Chair.",
};


export const revalidate = 300;

export default async function PublicationsPage() {
  const publications = await getPublications().catch(() => uncachedFallback([]));
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-6 py-20">
        <PublicResearchList title="Publications and resources" items={publications} columns="md:grid-cols-2" />
      </main>
    </SiteShell>
  );
}
