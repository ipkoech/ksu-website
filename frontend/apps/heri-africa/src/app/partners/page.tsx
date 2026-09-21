import type { Metadata } from "next";
import { SiteShell } from "../../components/site-shell";
import { getPartners, getSite } from "../../lib/api";
import { uncachedFallback } from "../../lib/server-fallback";
import { PublicPartnersList } from "../../components/data/public-content";

export const metadata: Metadata = {
  title: "Our Partners",
  description:
    "The universities, funders and organisations working with the HERI Africa Language Education Research Chair.",
};


export const revalidate = 300;

export default async function PartnersPage() {
  const site = await getSite().catch(() => uncachedFallback(null));
  const partners = await getPartners(undefined, site?.research_center_slug ?? undefined).catch(() => uncachedFallback([]));
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-heri-teal">Collaboration ecosystem</p>
        <h1 className="mt-4 text-5xl font-semibold text-heri-blue">Who we work with</h1>
        <PublicPartnersList partners={partners} />
      </main>
    </SiteShell>
  );
}
