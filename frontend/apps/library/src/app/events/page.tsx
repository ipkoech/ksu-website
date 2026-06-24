import {
  LibraryFilterSubmit,
  LibraryFilterTextInput,
  LibraryHero,
  LibrarySection,
  LibraryShell,
  PrimaryLink,
  RecordListItem,
  SecondaryLink,
  StatusMessage,
} from "../../components/library-ui";
import {
  formatDate,
  formatLabel,
  getLibraryEventsData,
  shortText,
} from "../../lib/library-public-data";

export const metadata = {
  title: "Events",
  description: "Kisii University Library events, training, and workshops.",
};

export const dynamic = "force-dynamic";

type EventsPageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export default async function LibraryEventsPage({ searchParams }: EventsPageProps) {
  const params = (await searchParams) ?? {};
  const { records, query, errors } = await getLibraryEventsData({
    query: params.q,
    perPage: 18,
  });

  return (
    <LibraryShell>
      <LibraryHero
        eyebrow="Library Events"
        title="Training, orientations, and research support events."
        body="Find information literacy sessions, database workshops, repository clinics, and library service events."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Library", href: "/" }, { label: "Events" }]}
        actions={
          <>
            <PrimaryLink href="/ask">Request training</PrimaryLink>
            <SecondaryLink href="/news">Library news</SecondaryLink>
          </>
        }
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
          Published events
        </p>
        <p className="mt-3 text-4xl font-bold sm:text-5xl">{records.data.length}</p>
        <p className="mt-2 text-sm leading-6 text-white/75">
          Upcoming and recent event records from the public content service.
        </p>
      </LibraryHero>

      {errors.map((error) => (
        <section key={error} className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1320px]">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        </section>
      ))}

      <LibrarySection
        eyebrow="Search"
        title="Find events"
        body="Search by topic, training area, venue, or event type."
        tone="white"
      >
        <form
          action="/events"
          className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
        >
          <LibraryFilterTextInput
            name="q"
            label="Search Events"
            value={query}
            placeholder="Training, database, citation, repository"
          />
          <LibraryFilterSubmit>Search Events</LibraryFilterSubmit>
        </form>
      </LibrarySection>

      <LibrarySection
        eyebrow="Calendar"
        title={query ? `Events matching "${query}"` : "Library events"}
        body="Event records include location, date, and access details when available."
      >
        {records.data.length === 0 ? (
          <StatusMessage>No published event records are available yet.</StatusMessage>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {records.data.map((item) => (
              <RecordListItem
                key={item.id}
                eyebrow={formatLabel(item.event_type ?? "Event")}
                title={item.title}
                body={shortText(item.summary ?? item.plain_text ?? item.rich_text ?? item.content)}
                meta={[
                  formatDate(item.start_date),
                  item.venue ?? item.location,
                  item.is_virtual ? "Virtual" : null,
                ]}
                href={`/events/${item.slug}`}
                action="View event"
              />
            ))}
          </div>
        )}
      </LibrarySection>
    </LibraryShell>
  );
}
