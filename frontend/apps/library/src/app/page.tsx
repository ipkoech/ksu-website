import Link from "next/link";
import { Fragment } from "react";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Database,
  Library,
  MessageCircle,
  Search,
  Users,
} from "lucide-react";
import { LibrarySearchHero } from "../components/library-search-hero";
import { LibraryOverviewData, type LibraryOverviewUpdate } from "../components/library-overview-data";
import {
  LibraryActionLink,
  LibraryContentBand,
  LibrarySectionHeading,
  StatusMessage,
} from "../components/library-ui";
import {
  CountUp,
  Reveal,
  StaggerGroup,
  StaggerItem,
} from "../components/library-motion";
import {
  getLibraryOverviewData,
} from "../lib/library-public-data";

export const revalidate = 300;

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
  const featuredResources = electronic.data.filter((item) => item.is_featured).slice(0, 5).map((item) => ({
    id: item.id,
    name: item.name,
    resource_type: item.resource_type,
    description: item.description ?? null,
    provider: item.provider ?? null,
    access_url: item.access_url ?? null,
  }));
  const overviewBranches = branches.data.slice(0, 4).map((branch) => ({
    id: branch.id,
    name: branch.name,
    address: branch.address ?? null,
    location: branch.location ?? null,
  }));
  const updates: LibraryOverviewUpdate[] = [
    ...news.data.slice(0, 2).map((item) => ({ id: item.id, title: item.title, slug: item.slug, summary: item.summary ?? null, plainText: item.plain_text ?? null, kind: "News", updateType: "news" })),
    ...events.data.slice(0, 2).map((item) => ({ id: item.id, title: item.title, slug: item.slug, summary: item.summary ?? null, plainText: item.plain_text ?? null, kind: "Event", updateType: "events" })),
    ...articles.data.slice(0, 1).map((item) => ({ id: item.id, title: item.title, slug: item.slug, summary: item.summary ?? null, plainText: item.plain_text ?? null, kind: "Article", updateType: "articles" })),
  ].slice(0, 3);
  const statItems = stats?.stats ?? [
    { key: "catalog", label: "Catalog records", value: catalog.meta?.total ?? catalog.data.length, description: "Books, journals, and more" },
    { key: "electronic", label: "E-resources", value: electronic.meta?.total ?? electronic.data.length, description: "Databases and digital collections" },
    { key: "branches", label: "Library branches", value: branches.data.length, description: "Access points across KSU" },
    { key: "services", label: "Library services", value: services.data.length, description: "Support for study and research" },
  ];

  return (
    <main id="library-main" className="min-h-screen bg-background">
      <LibrarySearchHero />

      {errors.length > 0 ? (
        <section className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1320px]">
            {errors.map((error) => <StatusMessage key={error} tone="error">{error}</StatusMessage>)}
          </div>
        </section>
      ) : null}

      <LibraryContentBand>
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <Reveal>
            <h2 className="max-w-2xl text-balance font-[family-name:var(--app-font-display)] text-3xl font-normal leading-tight tracking-tight text-foreground sm:text-5xl">
              Your partner in learning, research, and discovery.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
              Kisii University Library provides quality information resources,
              supportive services, and inspiring spaces that help students and
              staff excel in teaching, learning, and research.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-primary">
              <Link href="/catalog" className="group inline-flex items-center gap-2 hover:text-secondary">
                Explore the catalog
                <ArrowRight aria-hidden className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" />
              </Link>
              <Link href="/electronic" className="group inline-flex items-center gap-2 hover:text-secondary">
                Browse e-resources
                <ArrowRight aria-hidden className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="flex items-center gap-3 border-b border-border pb-5">
              <Clock3 aria-hidden className="h-5 w-5 text-secondary" />
              <p className="text-sm font-semibold text-foreground">
                {primaryHours?.is_open ? "The library is open today." : "Planning a visit?"}{" "}
                <Link href="/contact#hours" className="text-primary underline-offset-4 hover:underline">
                  See opening hours
                </Link>
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-8">
              {statItems.map((item) => (
                <Fragment key={item.key}>
                  <dt className="border-b border-border pt-5 text-sm font-semibold text-foreground">
                    {item.label}
                  </dt>
                  <dd className="border-b border-border py-5 text-3xl font-bold tabular-nums text-foreground sm:text-4xl">
                    <CountUp value={item.value} />
                  </dd>
                  <dd className="col-span-2 border-b border-border pb-5 text-sm leading-6 text-muted-foreground">{item.description}</dd>
                </Fragment>
              ))}
            </dl>
          </Reveal>
        </div>
      </LibraryContentBand>

      <LibraryContentBand tone="soft">
        <LibrarySectionHeading
          title="What would you like to do?"
          body="Move directly to the service or collection that supports your next academic task."
        />
        <StaggerGroup className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          <StaggerItem><TaskLink icon={<BookOpen aria-hidden />} title="Find a book" body="Search books, journals, theses, reports, and other print resources." href="/catalog" /></StaggerItem>
          <StaggerItem><TaskLink icon={<Search aria-hidden />} title="Find an article" body="Search across library collections and research discovery tools." href="/search?type=catalog" /></StaggerItem>
          <StaggerItem><TaskLink icon={<Database aria-hidden />} title="Access e-resources" body="Browse subscribed databases, e-books, journals, and platforms." href="/electronic" /></StaggerItem>
          <StaggerItem><TaskLink icon={<Library aria-hidden />} title="Find a thesis" body="Explore repository links and institutional research collections." href="/electronic#external-links" /></StaggerItem>
          <StaggerItem><TaskLink icon={<Users aria-hidden />} title="Get research help" body="Find research support, training, and subject guidance." href="/services" /></StaggerItem>
          <StaggerItem><TaskLink icon={<MessageCircle aria-hidden />} title="Ask a librarian" body="Send the library team a question about your study or research." href="/ask" /></StaggerItem>
        </StaggerGroup>
      </LibraryContentBand>

      <LibraryOverviewData featuredResources={featuredResources} branches={overviewBranches} updates={updates} />

      <LibraryContentBand tone="soft">
        <LibrarySectionHeading
          title="Support for every stage of your work"
          body="From choosing a topic to publishing your findings, KSU librarians help you navigate information confidently."
        />
        <StaggerGroup className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Literature reviews", "Build a strong search strategy and discover relevant evidence."],
            ["Referencing and citation", "Use sources responsibly and choose the right citation tools."],
            ["Research databases", "Find scholarly journals, e-books, theses, and specialist collections."],
            ["Thesis support", "Get guidance for postgraduate research and dissertation work."],
            ["Scholarly communication", "Understand publishing, open access, and research visibility."],
            ["Training and workshops", "Join practical sessions for information and digital literacy."],
          ].map(([title, body]) => (
            <StaggerItem key={title}>
              <div className="border-t border-border pt-4">
                <h3 className="text-base font-semibold leading-7 text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
        <div className="mt-8"><LibraryActionLink href="/services">Explore research support</LibraryActionLink></div>
      </LibraryContentBand>

      <section className="bg-primary px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <Reveal>
            <h2 className="max-w-2xl text-balance font-[family-name:var(--app-font-display)] text-3xl font-normal leading-tight tracking-tight sm:text-5xl">
              Need help finding the right <em className="italic">source?</em>
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/75">
              Talk to a KSU librarian about your catalog search, database access,
              research question, or next assignment.
            </p>
          </Reveal>
          <Link
            href="/ask"
            className="group inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[hsl(var(--secondary-deep))] px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/30 active:scale-[0.98]"
          >
            Ask a librarian
            <ArrowRight aria-hidden className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function TaskLink({ icon, title, body, href }: { icon: React.ReactNode; title: string; body: string; href: string }) {
  return (
    <Link href={href} className="group flex gap-4 rounded-lg py-5 transition hover:bg-primary/5 sm:px-3 sm:-mx-3">
      <span className="mt-1 text-primary transition-colors group-hover:text-secondary">{icon}</span>
      <span className="min-w-0">
        <span className="flex items-center gap-2 font-semibold text-foreground">
          {title}
          <ArrowRight
            aria-hidden
            className="h-4 w-4 text-secondary opacity-0 transition-all motion-safe:-translate-x-1 group-hover:opacity-100 motion-safe:group-hover:translate-x-0"
          />
        </span>
        <span className="mt-1 block text-sm leading-6 text-muted-foreground">{body}</span>
      </span>
    </Link>
  );
}
