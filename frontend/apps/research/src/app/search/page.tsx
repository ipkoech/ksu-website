import Link from "next/link";
import { Search } from "lucide-react";
import { compactText } from "../../lib/research-public-data";
import { researchServiceApi } from "@ksu/api-client";

export const metadata = {
  title: "Search | KSU Research",
  description: "Search across research projects, publications, innovations, partners, and more.",
};

export const revalidate = 300;

const PER_PAGE = 10;
const routeMap: Record<string, string> = {
  project: "/projects", publication: "/publications",
  innovation: "/innovations", partner: "/partners",
  center: "/centers", grant: "/funding", training: "/training",
};

export default async function ResearchSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (!query) {
    return (
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-16">
        <div className="text-center">
          <Search aria-hidden className="mx-auto h-12 w-12 text-slate-300" />
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950">Search Research</h1>
          <p className="mt-3 text-base text-slate-600">Search across projects, publications, grants, partners, and more.</p>
          <form action="/search" className="mx-auto mt-6 max-w-md">
            <div className="relative">
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input type="search" name="q" placeholder="Try climate, agriculture, health..." autoComplete="off"
                className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-base outline-none ring-primary/20 transition placeholder:text-slate-400 focus:border-primary focus:ring-4" />
            </div>
          </form>
        </div>
      </article>
    );
  }

  const baseParams = { search: query, per_page: PER_PAGE };
  let grouped = new Map<string, any[]>();

  try {
    const [projects, publications, partners, grants] = await Promise.all([
      researchServiceApi.projects.list(baseParams).catch(() => null),
      researchServiceApi.publications.list(baseParams).catch(() => null),
      researchServiceApi.partners.list(baseParams).catch(() => null),
      researchServiceApi.grants.list(baseParams).catch(() => null),
    ]);

    const mapResults = (response: any, type: string, label: string, titleFn: (r: any) => any, descFn: (r: any) => any) =>
      (response?.data ?? []).map((r: any) => ({
        id: r.id,
        type,
        label,
        title: compactText(titleFn(r)) || r.id,
        description: compactText(descFn(r)) || "",
        href: `${routeMap[type] || "/projects"}/${r.slug || r.id}`,
      }));

    grouped.set("project", mapResults(projects, "project", "Project", (r: any) => r.title, (r: any) => r.summary || r.abstract));
    grouped.set("publication", mapResults(publications, "publication", "Publication", (r: any) => r.title, (r: any) => r.abstract || r.summary));
    grouped.set("partner", mapResults(partners, "partner", "Partner", (r: any) => r.name, (r: any) => r.about));
    grouped.set("grant", mapResults(grants, "grant", "Grant", (r: any) => r.title, (r: any) => r.summary || r.description));
  } catch { /* silently continue */ }

  const total = Array.from(grouped.values()).reduce((sum, items) => sum + items.length, 0);

  return (
    <article className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-10">
      <form action="/search" className="relative max-w-xl">
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input type="search" name="q" defaultValue={query} placeholder="Search publications, projects, grants..." autoComplete="off"
          className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-base outline-none ring-primary/20 transition placeholder:text-slate-400 focus:border-primary focus:ring-4" />
      </form>
      <p className="mt-2 text-sm text-slate-500">{total ? `Found ${total} results for "${query}"` : `No results for "${query}"`}</p>

      {total === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
          <Search aria-hidden className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-4 text-sm font-semibold text-slate-600">No results found</p>
          <p className="mt-1 text-sm text-slate-500">Try a different search term.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {Array.from(grouped.entries()).map(([type, items]) =>
            items.length === 0 ? null : (
              <section key={type}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">{items[0]?.label}s</h2>
                  <Link href={routeMap[type] || "/projects"} className="text-xs font-semibold text-primary hover:text-secondary">View all</Link>
                </div>
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                  {items.slice(0, 5).map((item: any) => (
                    <Link key={item.id} href={item.href} className="block px-5 py-4 transition hover:bg-slate-50">
                      <h3 className="text-sm font-semibold text-slate-950 hover:text-primary">{item.title}</h3>
                      {item.description ? <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{item.description}</p> : null}
                    </Link>
                  ))}
                </div>
              </section>
            ),
          )}
        </div>
      )}
    </article>
  );
}
