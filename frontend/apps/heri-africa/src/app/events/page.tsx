import type { Metadata } from "next";
import { Reveal } from "../../components/motion/reveal";
import { SiteShell } from "../../components/site-shell";
import { getEvents } from "../../lib/api";
import { uncachedFallback } from "../../lib/server-fallback";
import { PublicEventsList } from "../../components/data/public-content";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming gatherings, convenings and opportunities from the HERI Africa Language Education Research Chair.",
};


export const revalidate = 300;

export default async function EventsPage() {
  const events = await getEvents().catch(() => uncachedFallback([]));
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-6 py-20">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-heri-teal">
            Gatherings and opportunities
          </p>
          <h1 className="mt-4 text-5xl font-semibold text-heri-blue">Events</h1>
        </Reveal>
        <PublicEventsList events={events} />
      </main>
    </SiteShell>
  );
}
