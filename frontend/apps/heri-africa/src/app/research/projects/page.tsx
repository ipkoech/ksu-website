import type { Metadata } from "next";
import { SiteShell } from "../../../components/site-shell";
import { getProjects } from "../../../lib/api";
import { PublicResearchList } from "../../../components/data/public-content";
import { uncachedFallback } from "../../../lib/server-fallback";

export const metadata: Metadata = {
  title: "Research Projects",
  description:
    "Active and completed research projects of the HERI Africa Language Education Research Chair.",
};


export const revalidate = 300;

export default async function ProjectsPage() {
  const projects = await getProjects().catch(() => uncachedFallback([]));
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-6 py-20">
        <PublicResearchList title="Research projects" items={projects} />
      </main>
    </SiteShell>
  );
}
