import type { Metadata } from "next";
import { Reveal, RevealItem } from "../../components/motion/reveal";
import { SiteShell } from "../../components/site-shell";
import { getEvents } from "../../lib/api";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming gatherings, convenings and opportunities from the HERI Africa Language Education Research Chair.",
};


export default async function EventsPage() {
  const events = await getEvents().catch(() => []);
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-6 py-20">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-heri-teal">
            Gatherings and opportunities
          </p>
          <h1 className="mt-4 text-5xl font-semibold text-heri-blue">Events</h1>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {events.map((event, index) => (
            <RevealItem key={event.id} index={index} className="h-full">
              <article className="h-full rounded-3xl bg-white p-7 ring-1 ring-heri-teal/10">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-heri-teal">
                  Event
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-heri-blue">
                  {event.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-heri-ink/70">
                  {event.summary}
                </p>
                <p className="mt-4 text-sm font-medium text-heri-ink/60">
                  {event.location ?? "Online and in person"}
                </p>
              </article>
            </RevealItem>
          ))}
        </div>
      </main>
    </SiteShell>
  );
}
