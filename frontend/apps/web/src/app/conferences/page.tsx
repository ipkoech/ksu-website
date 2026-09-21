import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { ArrowRight } from "lucide-react";
import { eventsApi } from "@ksu/api-client/server";
import { CampusPageHeader } from "@ksu/ui/components";
import {
  ConferenceRecords,
  type ConferenceEventDto,
} from "@/components/public/conference-records";
import { PageShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Conferences",
  description:
    "Find conference events, calls for papers, registration links, and multidisciplinary engagement opportunities.",
};

async function fetchEvents(): Promise<ConferenceEventDto[]> {
  try {
    const response = await eventsApi.list({
      is_published: true,
      search: "conference",
      per_page: 9,
      fields:
        "id,title,slug,summary,plain_text,rich_text,content,start_date,venue,location,is_virtual",
    });
    return Array.isArray(response.data)
      ? response.data.map((event) => ({
          id: event.id,
          title: event.title,
          slug: event.slug,
          summary: event.summary,
          startDate: event.start_date,
          venue: event.venue,
        }))
      : [];
  } catch {
    noStore();
    return [];
  }
}

export const revalidate = 300;

export default async function ConferencesPage() {
  const events = await fetchEvents();

  return (
    <PageShell>
      <CampusPageHeader
        title="Conferences and calls"
        eyebrow="Conferences"
        description="Find conference events, calls for papers, registration links, and multidisciplinary engagement opportunities."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Conferences" }]}
        seed="/conferences"
      />

      <section className="w-full bg-[linear-gradient(180deg,hsl(var(--surface-subtle))_0%,#ffffff_70%,hsl(var(--surface-muted))_100%)] px-4 py-10 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="mt-0">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
              Conference records
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-foreground sm:text-4xl">
              Published conference events
            </h2>
          </div>

          <ConferenceRecords events={events} />

          <div className="mt-14 rounded-lg border border-primary/20 bg-primary/5 p-6 sm:p-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
              Open conference portal
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Visit the official Kisii University digital conference portal for
              current calls for papers, registration, and ongoing conference
              activities.
            </p>
            <a
              href="https://digital.kisiiuniversity.ac.ke/conferences"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Go to conference portal
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
