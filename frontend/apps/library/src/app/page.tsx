import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Database,
  ExternalLink,
  Library,
  MapPin,
  MessageCircle,
  Search,
  Users,
} from "lucide-react";
import { LibrarySearchHero } from "../components/library-search-hero";
import {
  LibraryActionLink,
  LibraryContentBand,
  LibrarySectionHeading,
  StatusMessage,
} from "../components/library-ui";
import {
  compactText,
  formatLabel,
  getLibraryOverviewData,
  safeExternalUrl,
} from "../lib/library-public-data";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const {
    branches,
    catalog,
    electronic,
    services,
    todayHours,
    news,
    events,
    articles,
    stats,
    errors,
  } = await getLibraryOverviewData();
  const primaryHours = todayHours.data[0];
  const featuredResources = electronic.data.filter((item) => item.is_featured).slice(0, 6);
  const updates = [
    ...news.data.slice(0, 2).map((item) => ({ ...item, kind: "News", updateType: "news" })),
    ...events.data.slice(0, 2).map((item) => ({ ...item, kind: "Event", updateType: "events" })),
    ...articles.data.slice(0, 1).map((item) => ({ ...item, kind: "Article", updateType: "articles" })),
  ].slice(0, 3);
  const statItems = stats?.stats ?? [
    { key: "catalog", label: "Catalog records", value: catalog.meta?.total ?? catalog.data.length, description: "Books, journals, and more" },
    { key: "electronic", label: "E-resources", value: electronic.meta?.total ?? electronic.data.length, description: "Databases and digital collections" },
    { key: "branches", label: "Library branches", value: branches.data.length, description: "Access points across KSU" },
    { key: "services", label: "Library services", value: services.data.length, description: "Support for your study and research" },
  ];

  return (
    <main id="library-main" className="min-h-screen bg-white">
      <LibrarySearchHero />

      {errors.length > 0 ? (
        <section className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1320px]">
            {errors.map((error) => <StatusMessage key={error} tone="error">{error}</StatusMessage>)}
          </div>
        </section>
      ) : null}

      <section className="bg-primary px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1680px] divide-y divide-white/20 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {statItems.map((item) => (
            <div key={item.key} className="flex items-center gap-4 px-4 py-4 first:pl-0 last:pr-0">
              <MetricIcon index={statItems.indexOf(item)} />
              <div>
                <p className="text-2xl font-bold tabular-nums">{item.value.toLocaleString()}</p>
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="mt-1 text-xs text-white/65">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <LibraryContentBand>
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Welcome to the Library</p>
            <h2 className="mt-4 max-w-2xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-5xl">
              Your partner in learning, research, and discovery.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
              Kisii University Library provides quality information resources,
              supportive services, and inspiring spaces that help students and
              staff excel in teaching, learning, and research.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-primary">
              <Link href="/catalog" className="inline-flex items-center gap-2 hover:text-secondary">Explore the catalog <ArrowRight aria-hidden className="h-4 w-4" /></Link>
              <Link href="/electronic" className="inline-flex items-center gap-2 hover:text-secondary">Browse e-resources <ArrowRight aria-hidden className="h-4 w-4" /></Link>
              <Link href="/ask" className="inline-flex items-center gap-2 hover:text-secondary">Ask a librarian <ArrowRight aria-hidden className="h-4 w-4" /></Link>
            </div>
          </div>
          <div className="border-l-4 border-secondary bg-surface-subtle p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">At a glance</p>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              <Snapshot label="Today" value={primaryHours?.is_open ? "Open now" : "Check hours"} icon={<Clock3 aria-hidden className="h-5 w-5" />} />
              <Snapshot label="Branches" value={`${branches.data.length} access points`} icon={<MapPin aria-hidden className="h-5 w-5" />} />
              <Snapshot label="Digital access" value={`${electronic.data.length} resources`} icon={<Database aria-hidden className="h-5 w-5" />} />
              <Snapshot label="Support" value="Ask a librarian" icon={<MessageCircle aria-hidden className="h-5 w-5" />} />
            </dl>
          </div>
        </div>
      </LibraryContentBand>

      <LibraryContentBand tone="soft">
        <LibrarySectionHeading eyebrow="Start with a task" title="What would you like to do?" body="Move directly to the service or collection that supports your next academic task." />
        <div className="grid gap-x-8 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
          <TaskLink icon={<BookOpen aria-hidden />} title="Find a book" body="Search books, journals, theses, reports, and other print resources." href="/catalog" />
          <TaskLink icon={<Search aria-hidden />} title="Find an article" body="Search across library collections and research discovery tools." href="/search?type=catalog" />
          <TaskLink icon={<Database aria-hidden />} title="Access e-resources" body="Browse subscribed databases, e-books, journals, and platforms." href="/electronic" />
          <TaskLink icon={<Library aria-hidden />} title="Find a thesis" body="Explore repository links and institutional research collections." href="/electronic#external-links" />
          <TaskLink icon={<Users aria-hidden />} title="Get research help" body="Find research support, training, and subject guidance." href="/services" />
          <TaskLink icon={<MessageCircle aria-hidden />} title="Ask a librarian" body="Send the library team a question about your study or research." href="/ask" />
        </div>
      </LibraryContentBand>

      <LibraryContentBand>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <LibrarySectionHeading eyebrow="Research support" title="Support for every stage of your work" body="From choosing a topic to publishing your findings, KSU librarians help you navigate information confidently." />
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {[
              ["Literature reviews", "Build a strong search strategy and discover relevant evidence."],
              ["Referencing and citation", "Use sources responsibly and choose the right citation tools."],
              ["Research databases", "Find scholarly journals, e-books, theses, and specialist collections."],
              ["Thesis support", "Get guidance for postgraduate research and dissertation work."],
              ["Scholarly communication", "Understand publishing, open access, and research visibility."],
              ["Training and workshops", "Join practical sessions for information and digital literacy."],
            ].map(([title, body]) => (
              <div key={title} className="border-t border-border pt-4">
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            ))}
            <div className="sm:col-span-2 pt-2"><LibraryActionLink href="/services">Explore research support</LibraryActionLink></div>
          </div>
        </div>
      </LibraryContentBand>

      <LibraryContentBand tone="soft">
        <LibrarySectionHeading eyebrow="Digital collections" title="Featured e-resources" body="Start with the digital platforms and collections most useful for study, teaching, and research." />
        {featuredResources.length === 0 ? (
          <StatusMessage>No featured electronic resources are available yet.</StatusMessage>
        ) : (
          <div className="divide-y divide-border border-y border-border">
            {featuredResources.map((resource) => (
              <div key={resource.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3"><h3 className="text-lg font-semibold text-foreground">{resource.name}</h3><span className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">{formatLabel(resource.resource_type)}</span></div>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{compactText(resource.description) || resource.provider || "Access details are maintained by the library team."}</p>
                </div>
                {safeExternalUrl(resource.access_url) ? <a href={safeExternalUrl(resource.access_url)!} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">Open resource <ExternalLink aria-hidden className="h-4 w-4" /></a> : <span className="text-sm text-muted-foreground">Access link pending</span>}
              </div>
            ))}
          </div>
        )}
        <div className="mt-6"><LibraryActionLink href="/electronic">View all e-resources</LibraryActionLink></div>
      </LibraryContentBand>

      <LibraryContentBand>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <LibrarySectionHeading eyebrow="Library spaces" title="Find a place to study and connect" body="Explore KSU library branches, published opening hours, services, and contact points before your visit." />
          <div className="divide-y divide-border border-y border-border">
            {branches.data.slice(0, 4).map((branch) => (
              <div key={branch.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div><h3 className="text-lg font-semibold text-foreground">{branch.name}</h3><p className="mt-1 text-sm text-muted-foreground">{branch.address ?? branch.location ?? "Location being updated"}</p></div>
                <Link href="/contact#hours" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">View hours <ArrowRight aria-hidden className="h-4 w-4" /></Link>
              </div>
            ))}
          </div>
        </div>
      </LibraryContentBand>

      <LibraryContentBand tone="soft">
        <LibrarySectionHeading eyebrow="News and events" title="What is happening at the Library" body="Keep up with workshops, new resources, service updates, and academic support announcements." />
        {updates.length === 0 ? <StatusMessage>No library updates are available yet.</StatusMessage> : <div className="grid gap-8 lg:grid-cols-3">{updates.map((item) => <article key={`${item.kind}-${item.id}`} className="border-t-4 border-secondary pt-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">{item.kind}</p><h3 className="mt-3 text-xl font-semibold leading-7 text-foreground">{item.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{compactText(item.summary ?? item.plain_text) || "Read the latest library update."}</p><Link href={`/updates/${item.updateType}/${item.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">Read update <ArrowRight aria-hidden className="h-4 w-4" /></Link></article>)}</div>}
        <div className="mt-6"><LibraryActionLink href="/updates">View all updates</LibraryActionLink></div>
      </LibraryContentBand>

      <section className="bg-primary px-4 py-16 text-white sm:px-6 lg:px-8"><div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-8 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Personal support</p><h2 className="mt-3 max-w-2xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight sm:text-5xl">Need help finding the right source?</h2><p className="mt-4 max-w-xl text-base leading-7 text-white/75">Talk to a KSU librarian about your catalog search, database access, research question, or next assignment.</p></div><Link href="/ask" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/30">Ask a librarian <ArrowRight aria-hidden className="h-4 w-4" /></Link></div></section>
    </main>
  );
}

function MetricIcon({ index }: { index: number }) {
  const Icon = [BookOpen, Database, MapPin, Users][index] ?? Library;
  return <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-secondary/50 text-secondary"><Icon aria-hidden className="h-5 w-5" /></span>;
}

function Snapshot({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <div className="flex gap-3"><span className="mt-0.5 text-secondary">{icon}</span><div><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-semibold text-foreground">{value}</dd></div></div>;
}

function TaskLink({ icon, title, body, href }: { icon: React.ReactNode; title: string; body: string; href: string }) {
  return <Link href={href} className="group flex gap-4 border-b border-border py-5 first:pt-0 sm:nth-[n+3]:border-b-0 lg:nth-[n+4]:border-b-0"><span className="mt-1 text-primary transition group-hover:text-secondary">{icon}</span><span><span className="block font-semibold text-foreground">{title}</span><span className="mt-1 block text-sm leading-6 text-muted-foreground">{body}</span></span></Link>;
}
