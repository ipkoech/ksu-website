import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  Landmark,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import type { Club, FAQ, Story, Testimonial } from "@ksu/api-client";
import { cn } from "@ksu/ui/lib/utils";
import { AboutReveal } from "@/components/about/about-reveal";
import { YouTubeFacade } from "@/components/home/youtube-facade";
import { PublicImage } from "@/components/public/public-image";
import { CampusLifeHeader } from "@/components/campus-life/campus-life-header";
import { ClubRoster } from "@/components/campus-life/club-roster";
import { hubForCategory } from "@/components/campus-life/story-hubs";
import { publicFileUrl, publicMediaUrl } from "@/lib/public-media";
import type {
  CampusLifeActivity,
  CampusLifeRecordSummary,
  LifeAroundStudiesEditorial,
} from "@/lib/get-campus-life";

/**
 * THESIS: Kisii's student life is associational — seventy-one clubs, twenty-nine
 * of them county associations. The page prints the whole register as its spine
 * and refuses the university-landing default of six mood cards over stock photos.
 * OWN-WORLD: The house system recorded in DESIGN.md — landmark header band with
 * its orange kicker rule, Bookman display at regular weight with one italic
 * accent per heading, hairline dividers, a single navy conviction section.
 * STORY: A visitor watches the film, reads the register, finds their own county
 * or course in it, follows a chapter into the stories, and leaves able to name
 * something specific about student life here.
 * FIRST VIEWPORT: The student film as the header band's backdrop, carrying the
 * breadcrumb chip, orange eyebrow pill and italic serif title, with the play
 * control centred and two actions at the foot.
 * FORM: Candidate 4 of the grounded list, the county roll-call. Seed e1fd2aff.
 * FINISH: unreviewed and undocumented is unfinished; this build ends with the
 * finish review, the verdict, and DESIGN.md.
 */

const CAMPUS_FILM = {
  id: "tv2zAL4ry08",
  title: "Student social life at Kisii University",
};

const INTERNATIONAL_FILM = {
  id: "CKeQVKib57o",
  title: "Kisii University Internationalization Agenda 2025",
};

const nairobiDate = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "Africa/Nairobi",
});
const nairobiTime = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Africa/Nairobi",
});

function activityWhen(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return `${nairobiDate.format(parsed)}, ${nairobiTime.format(parsed).toLowerCase()}`;
}

/** Section shell: the house width and padding scale from DESIGN.md §7. */
const SECTION = "px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20";
const INNER = "mx-auto w-full max-w-7xl";

function InlineLink({
  href,
  children,
  tone = "primary",
}: {
  href: string;
  children: React.ReactNode;
  tone?: "primary" | "light";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 text-sm font-bold hover:underline",
        tone === "primary" ? "text-primary" : "text-white",
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

export function CampusLifeLanding({
  editorial,
  testimonials = [],
  roster = [],
  stories = [],
  faqs = [],
}: {
  editorial?: LifeAroundStudiesEditorial | null;
  testimonials?: Testimonial[];
  roster?: Club[];
  stories?: Story[];
  faqs?: FAQ[];
}) {
  const activities = editorial?.activities ?? [];
  const governance = editorial?.governance ?? [];

  return (
    <div className="bg-surface text-foreground">
      <CampusLifeHeader
        videoId={CAMPUS_FILM.id}
        videoTitle={CAMPUS_FILM.title}
        eyebrow="Campus Life"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Campus Life" }]}
        title={
          <>
            Your years here, outside the{" "}
            <em className="italic">lecture hall.</em>
          </>
        }
        description={
          editorial?.section.description?.trim() ||
          "Seventy-one clubs, a cultural festival that closes the town, and a first-aid brigade that trains students to be useful when it matters."
        }
        credit="Student life on campus"
        actions={
          <>
            <Link
              href="#clubs"
              className="inline-flex min-h-12 items-center gap-3 rounded-2xl bg-secondary px-6 py-3 text-xs font-bold uppercase text-foreground transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-white active:scale-[0.98] motion-reduce:transform-none"
            >
              Find Your People <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/visitors"
              className="inline-flex min-h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-bold uppercase text-white backdrop-blur transition-colors duration-200 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white active:scale-[0.98]"
            >
              Visit Campus
            </Link>
          </>
        }
        mobileActions={
          <>
            <Link
              href="#clubs"
              className="inline-flex min-h-12 items-center gap-3 rounded-2xl bg-secondary px-6 py-3 text-xs font-bold uppercase text-foreground transition-colors duration-200 hover:bg-amber-400 active:scale-[0.98]"
            >
              Find Your People <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/visitors"
              className="inline-flex min-h-12 items-center gap-3 rounded-2xl border border-primary/20 px-6 py-3 text-xs font-bold uppercase text-primary transition-colors duration-200 hover:bg-primary/5 active:scale-[0.98]"
            >
              Visit Campus
            </Link>
          </>
        }
      />

      {/* Oslo's student-life page leads with practical wayfinding, states
          student democracy early, and closes on what is actually happening.
          The same order is used here, but every entry is backed by records this
          service holds: nothing links to an empty collection. */}
      <WhatYouNeed roster={roster} stories={stories} governance={governance} />
      <Opening roster={roster} />
      <StudentDemocracy governance={governance} />
      <ClubRoster clubs={roster} />
      <Chapters stories={stories} />
      <ThisWeek activities={activities} />
      <International />
      <StudentVoices testimonials={testimonials} />
      <StartAClub />
      <PracticalAnswers faqs={faqs} />
      <AtAGlance roster={roster} stories={stories} />
    </div>
  );
}

/* ------------------------------ what you need --------------------------- */

/**
 * The practical row, in Oslo's position: immediately under the header, before
 * any editorial.
 *
 * Each entry names a real destination with a real count behind it. Collections
 * this service holds no records for — accommodation, sports facilities, arts —
 * are absent rather than present-and-empty, because a tile that leads nowhere
 * is worse than no tile.
 */
function WhatYouNeed({
  roster,
  stories,
  governance,
}: {
  roster: Club[];
  stories: Story[];
  governance: CampusLifeRecordSummary[];
}) {
  const entries = [
    roster.length > 0
      ? {
          href: "#clubs",
          title: "Clubs and societies",
          note: `${roster.length} registered`,
          icon: Sparkles,
        }
      : null,
    governance.length > 0
      ? {
          href: "#democracy",
          title: "Student democracy",
          note: governance[0]?.acronym
            ? `Led by ${governance[0].acronym}`
            : "Who represents you",
          icon: Landmark,
        }
      : null,
    campusLifeStories(stories).length > 0
      ? {
          href: "#stories",
          title: "Student stories",
          note: `${campusLifeStories(stories).length} published`,
          icon: BookOpen,
        }
      : null,
    {
      href: "/campus-life/support",
      title: "Support and wellbeing",
      note: "Help and service contacts",
      icon: HeartHandshake,
    },
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (entries.length === 0) return null;

  return (
    <section className="border-b border-primary/10 bg-white px-5 py-10 sm:px-8 lg:px-16 xl:px-20">
      <div className={INNER}>
        <ul className="grid grid-cols-2 lg:grid-cols-4">
          {entries.map(({ href, title, note, icon: Icon }) => (
            <li key={title} className="border-b border-primary/15 lg:border-b-0">
              <Link
                href={href}
                className="flex h-full flex-col px-3 py-5 first:pl-0 transition-colors duration-200 hover:bg-primary/[0.04]"
              >
                <Icon className="h-6 w-6 text-primary" aria-hidden />
                <span className="mt-3 font-[family-name:var(--font-display)] text-lg font-normal leading-snug tracking-tight text-primary">
                  {title}
                </span>
                <span className="mt-1 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                  {note}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------- opening ------------------------------- */

/**
 * The lede: what the register means, stated before the register itself.
 *
 * Follows the house identity section — copy left, image right, asymmetric
 * columns, closing on a hairline fact row.
 */
function Opening({ roster }: { roster: Club[] }) {
  const county = roster.filter((club) => club.club_type === "county").length;
  const professional = roster.filter(
    (club) => club.club_type === "professional",
  ).length;

  const facts = [
    { label: "Registered Clubs", value: roster.length ? String(roster.length) : null, icon: Sparkles },
    { label: "County Associations", value: county ? String(county) : null, icon: Users },
    { label: "Professional Bodies", value: professional ? String(professional) : null, icon: Trophy },
    { label: "Cost to Join Most", value: "Nothing", icon: HeartHandshake },
  ].filter((item): item is { label: string; value: string; icon: typeof Users } =>
    Boolean(item.value),
  );

  return (
    <section className={cn("border-b border-primary/10", SECTION)}>
      <div className={cn(INNER, "grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-center")}>
        <AboutReveal variant="left">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            Life around studies
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal leading-tight tracking-tight text-primary sm:text-5xl">
            Nobody Arrives <em className="italic">Alone.</em>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
            Kisii draws students from every corner of Kenya, and the first thing
            most of them find is a room of people from home already meeting.
            Twenty-nine county associations, seventeen professional bodies, choirs,
            brigades, a comedy club and a tax society that has been to State House.
            Student life here is something you join in your first week, not
            something you wait to be invited into.
          </p>
          {facts.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 border-t border-primary/15 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {facts.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="border-b border-primary/15 px-3 py-5 first:pl-0 sm:border-r sm:last:border-r-0 lg:border-r-0 xl:border-r"
                >
                  <Icon className="h-6 w-6 text-primary" aria-hidden />
                  <p className="mt-3 font-[family-name:var(--font-display)] text-xl font-normal tracking-tight text-primary">
                    {value}
                  </p>
                  <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </AboutReveal>

        <AboutReveal variant="right" delay={100}>
          <div className="relative min-h-[390px] overflow-hidden rounded-2xl ring-1 ring-primary/10 lg:min-h-[440px]">
            <PublicImage
              src="/images/student-life/Life-around-studies/culture.jpg"
              alt="Kisii University students in cultural dress during the annual festival"
              ratio="fill"
              className="absolute inset-0 h-full w-full"
              imageClassName="object-cover"
              sizes="(min-width:1024px) 58vw, 100vw"
            />
          </div>
        </AboutReveal>
      </div>
    </section>
  );
}

/* ------------------------------- chapters ------------------------------- */

/**
 * The stories themselves, each linking straight to its own page.
 *
 * There is no category index in between: a reader who wants a story should
 * reach it in one click, so the landing shows the actual headlines rather than
 * six doors marked "2 stories".
 */
function Chapters({ stories }: { stories: Story[] }) {
  // Only the Corporate Communication features belong here. Admissions notices
  // and graduation bulletins are official news written for the homepage; mixed
  // into this section they lead the page with a KUCCPS deadline instead of the
  // cultural festival.
  const published = campusLifeStories(stories);
  if (published.length === 0) return null;

  // The longest read leads. These are features of very different weight — a
  // nine-minute Innovation Week report beside a two-minute award notice — and a
  // grid of identical cards states the opposite.
  const ordered = [...published].sort(
    (first, second) =>
      (second.reading_minutes ?? 0) - (first.reading_minutes ?? 0),
  );
  const withImages = assignStoryImages(ordered);
  const [lead, ...rest] = withImages;

  return (
    <section id="stories" className={cn("scroll-mt-24 bg-white", SECTION)}>
      <div className={INNER}>
        <AboutReveal variant="left">
          <div className="grid gap-5 lg:grid-cols-2 lg:items-end">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-primary sm:text-4xl">
              What Actually <em className="italic">Happened.</em>
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Written up by the people who were in the room — a festival that
              closed the town, a brigade at a presidential parade, a first
              Innovation Week, a club crowned best in the country.
            </p>
          </div>
        </AboutReveal>

        {lead ? <LeadStory story={lead.story} image={lead.image} /> : null}

        {rest.length > 0 ? (
          <ul className="mt-12 grid border-t border-primary/15 md:grid-cols-2 xl:grid-cols-3">
            {rest.map(({ story, image }, index) => (
              <li
                key={story.id}
                className="border-b border-primary/15 md:odd:border-r xl:border-r xl:[&:nth-child(3n)]:border-r-0 xl:odd:border-r"
              >
                <AboutReveal variant="up" delay={(index % 3) * 80}>
                  <StoryRow story={story} image={image} />
                </AboutReveal>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

/** The lead feature: one wide card that reads as the section's opening. */
function LeadStory({
  story,
  image,
}: {
  story: Story;
  image: { src: string; alt: string };
}) {
  const href = `/campus-life/stories/${story.slug}`;
  return (
    <AboutReveal variant="up" className="group mt-10 block">
      <article className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <Link
          href={href}
          className="relative block overflow-hidden rounded-2xl ring-1 ring-primary/10"
        >
          <PublicImage
            src={image.src}
            alt={image.alt}
            ratio="news"
            className="w-full"
            imageClassName="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03] motion-reduce:transition-none"
            sizes="(min-width: 1024px) 58vw, 100vw"
          />
        </Link>
        <div className="min-w-0">
          <p className="text-[0.68rem] font-bold uppercase tracking-wider text-secondary">
            {[story.category, readingLabel(story)].filter(Boolean).join("  ·  ")}
          </p>
          <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-normal leading-tight tracking-tight text-primary sm:text-4xl">
            <Link
              href={href}
              className="transition-colors duration-200 hover:text-secondary"
            >
              {story.title}
            </Link>
          </h3>
          {story.summary ? (
            <p className="mt-4 max-w-[52ch] text-base leading-8 text-muted-foreground">
              {storyExcerpt(story.summary, 260)}
            </p>
          ) : null}
          <div className="mt-6">
            <InlineLink href={href}>Read the story</InlineLink>
          </div>
        </div>
      </article>
    </AboutReveal>
  );
}

/** One entry in the index beneath the lead. */
function StoryRow({
  story,
  image,
}: {
  story: Story;
  image: { src: string; alt: string };
}) {
  const href = `/campus-life/stories/${story.slug}`;
  return (
    <article className="group/row flex h-full flex-col px-3 py-6 first:pl-0">
      <Link
        href={href}
        className="relative block overflow-hidden rounded-xl ring-1 ring-primary/10"
      >
        <PublicImage
          src={image.src}
          alt={image.alt}
          ratio="news"
          className="w-full"
          imageClassName="object-cover transition-transform duration-500 motion-safe:group-hover/row:scale-[1.03] motion-reduce:transition-none"
          sizes="(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 100vw"
        />
      </Link>
      <p className="mt-5 text-[0.68rem] font-bold uppercase tracking-wider text-secondary">
        {[story.category, readingLabel(story)].filter(Boolean).join("  ·  ")}
      </p>
      <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-normal leading-snug tracking-tight text-primary">
        <Link
          href={href}
          className="transition-colors duration-200 hover:text-secondary"
        >
          {story.title}
        </Link>
      </h3>
      {story.summary ? (
        <p className="mt-2.5 text-sm leading-7 text-muted-foreground">
          {storyExcerpt(story.summary)}
        </p>
      ) : null}
    </article>
  );
}

function readingLabel(story: Story) {
  const minutes = story.reading_minutes;
  return typeof minutes === "number" && minutes > 0 ? `${minutes} min read` : null;
}

/**
 * The campus-life stories: the seeded Corporate Communication features.
 *
 * Official news (admissions, graduation) shares the same endpoint but belongs
 * to the homepage, so every count and list on this page filters by it rather
 * than reporting a total the section does not show.
 */
function campusLifeStories(stories: Story[]) {
  return stories.filter(
    (story) => story.title && story.source_type === "editorial",
  );
}

function storyExcerpt(value: string, limit = 160) {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > limit ? `${text.slice(0, limit - 3)}…` : text;
}

/** The standing photographs available when a story carries none of its own. */
const STORY_FALLBACK_IMAGES = [
  {
    src: "/images/student-life/Life-around-studies/culture.jpg",
    alt: "Kisii University students in cultural dress during the festival",
  },
  {
    src: "/images/student-life/Life-around-studies/leadership.jpg",
    alt: "Kisii University students at a leadership parade",
  },
  {
    src: "/images/student-life/Life-around-studies/innovation.jpg",
    alt: "Exhibition stands at Kisii University's Innovation Week",
  },
  {
    src: "/images/student-life/Life-around-studies/career-mentorship.jpg",
    alt: "A career mentorship session at Kisii University",
  },
  {
    src: "/images/student-life/Life-around-studies/health.jpg",
    alt: "Kisii University students on campus",
  },
  {
    src: "/images/student-life/Life-around-studies/summer-exchange.jpg",
    alt: "Kisii University students representing the university abroad",
  },
];

/**
 * Give every card a distinct photograph.
 *
 * Most stories carry no media of their own, and letting each fall back to its
 * category's image puts the same picture on five of six cards — the repeated-
 * imagery failure the design rules exist to prevent. Stories with real media
 * keep it; the rest are dealt unused fallbacks in turn, and only once the pool
 * is exhausted does an image appear twice.
 */
function assignStoryImages(stories: Story[]) {
  const used = new Set<string>();
  const pool = [...STORY_FALLBACK_IMAGES];

  return stories.map((story) => {
    const own = storyImage(story);
    // A story with its own photograph always keeps it.
    if (own.src.startsWith("/api/files/") || own.src.startsWith("http")) {
      return { story, image: own };
    }
    const preferred = pool.findIndex(
      (candidate) => candidate.src === own.src && !used.has(candidate.src),
    );
    const next =
      preferred >= 0
        ? pool[preferred]
        : (pool.find((candidate) => !used.has(candidate.src)) ?? own);
    used.add(next.src);
    return { story, image: next };
  });
}

/**
 * Story photography.
 *
 * The list endpoint returns `featured_media_id` but not the expanded
 * `featured_media` object, so the id is the reliable source; `publicFileUrl`
 * turns it into a served path. Stories with no media fall back to their
 * category's standing image, and the caller de-duplicates those so one
 * photograph is never repeated across the grid.
 */
function storyImage(story: Story) {
  const media =
    publicMediaUrl(
      (story as { featured_media?: Parameters<typeof publicMediaUrl>[0] })
        .featured_media,
    ) ?? publicFileUrl(story.featured_media_id);
  if (media) return { src: media, alt: "" };
  const hub = hubForCategory(story.category);
  return {
    src: hub?.image ?? "/images/student-life/Life-around-studies/culture.jpg",
    alt: hub?.imageAlt ?? "Kisii University students on campus",
  };
}

/* ------------------------------- this week ------------------------------ */

function ThisWeek({ activities }: { activities: CampusLifeActivity[] }) {
  const upcoming = activities.filter((activity) => activity.start_datetime);
  if (upcoming.length === 0) return null;

  return (
    <section className={cn("border-y border-primary/10", SECTION)}>
      <div className={INNER}>
        <AboutReveal variant="left">
          <div className="flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-primary sm:text-4xl">
              This Week on <em className="italic">Campus.</em>
            </h2>
            <InlineLink href="/events">All student activities</InlineLink>
          </div>
        </AboutReveal>

        <ul className="grid gap-0 md:grid-cols-2 lg:grid-cols-3">
          {upcoming.slice(0, 6).map((activity) => (
            <li
              key={activity.id}
              className="border-b border-border px-3 py-6 first:pl-0 md:border-r md:last:border-r-0"
            >
              <p className="text-[0.68rem] font-bold uppercase tracking-wider text-secondary">
                {activityWhen(activity.start_datetime)}
              </p>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-normal tracking-tight text-primary">
                {activity.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {[activity.club?.name, activity.location].filter(Boolean).join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ----------------------------- international ---------------------------- */

/**
 * The page's one navy section, per DESIGN.md §5.
 *
 * The internationalization film is the argument this page most needs to make to
 * a prospective student weighing Kisii against a larger university, so it gets
 * the conviction ground rather than the club roster.
 */
function International() {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-primary text-white lg:py-20",
        SECTION,
      )}
    >
      <div
        className="absolute -left-20 top-0 h-full w-80 opacity-[0.06] [background-image:radial-gradient(circle_at_center,white_0,white_1px,transparent_1.5px)] [background-size:18px_18px]"
        aria-hidden
      />
      <div className={cn("relative grid gap-12 lg:grid-cols-2 lg:items-center", INNER)}>
        <AboutReveal variant="left">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            Internationalization agenda
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-white">
            Beyond the County <em className="italic">Line.</em>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-white/75">
            Exchange places, visiting partners and joint research put Kisii
            students in rooms well beyond Kisii. The 2025 internationalization
            agenda sets out where that goes next — and what it opens up for a
            student starting here in first year.
          </p>
          <div className="mt-8">
            <InlineLink href="/about/partnerships" tone="light">
              Partnerships and exchange
            </InlineLink>
          </div>
        </AboutReveal>
        <AboutReveal variant="right" delay={100}>
          <YouTubeFacade
            id={INTERNATIONAL_FILM.id}
            title={INTERNATIONAL_FILM.title}
            className="aspect-video w-full rounded-2xl ring-1 ring-white/15"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </AboutReveal>
      </div>
    </section>
  );
}

/* --------------------------- student voices ----------------------------- */

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function StudentVoices({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  const shown = testimonials.slice(0, 3);

  return (
    <section className={cn("bg-white", SECTION)}>
      <div className={INNER}>
        <AboutReveal variant="left">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-primary sm:text-4xl">
            Told by the People <em className="italic">Living It.</em>
          </h2>
        </AboutReveal>

        <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-0">
          {shown.map((item, index) => (
            <AboutReveal key={item.id} variant="up" delay={index * 100}>
              <figure className="border-primary/15 py-2 md:border-l md:px-10 md:first:border-l-0 md:first:pl-0">
                <blockquote className="text-base leading-8 text-muted-foreground">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3.5">
                  <span
                    aria-hidden
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ring-primary/20 text-sm font-bold text-primary"
                  >
                    {initials(item.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-[family-name:var(--font-display)] text-lg font-normal tracking-tight text-primary">
                      {item.name}
                    </span>
                    {item.role ? (
                      <span className="mt-0.5 block text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                        {item.role}
                      </span>
                    ) : null}
                  </span>
                </figcaption>
              </figure>
            </AboutReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- run it yourself ---------------------------- */

/**
 * Student democracy, in Oslo's position: stated early, before the editorial.
 *
 * The elected association and the office it works with are named in full with
 * their mandate, because "student governance" means nothing to a reader who
 * cannot see who actually holds it.
 */
function StudentDemocracy({
  governance,
}: {
  governance: CampusLifeRecordSummary[];
}) {
  const bodies = governance.slice(0, 3);
  if (bodies.length === 0) return null;

  return (
    <section
      id="democracy"
      className={cn("scroll-mt-24 border-b border-primary/10 bg-white", SECTION)}
    >
      <div className={INNER}>
        <AboutReveal variant="left">
          <div className="grid gap-5 lg:grid-cols-2 lg:items-end">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-primary sm:text-4xl">
              Student <em className="italic">Democracy.</em>
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Students here elect their own leadership and sit in the decisions
              that affect them. These are the bodies that carry that mandate.
            </p>
          </div>
        </AboutReveal>

        <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-0">
          {bodies.map((body, index) => (
            <AboutReveal key={body.id} variant="up" delay={index * 100}>
              <article className="h-full border-primary/15 py-2 md:border-l md:px-10 md:first:border-l-0 md:first:pl-0">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-primary ring-1 ring-primary/20">
                  <Landmark className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-normal tracking-tight text-primary">
                  {body.name}
                  {body.acronym ? (
                    <span className="ml-2 text-muted-foreground">
                      ({body.acronym})
                    </span>
                  ) : null}
                </h3>
                {body.description ? (
                  <p className="mt-3 max-w-sm text-base leading-7 text-muted-foreground">
                    {body.description}
                  </p>
                ) : null}
                {[body.office_location, body.email, body.phone].some(Boolean) ? (
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    {[body.office_location, body.email, body.phone]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                ) : null}
              </article>
            </AboutReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * The practical questions, answered on the page rather than behind a link.
 *
 * Oslo's page puts the housing, health and cost answers within reach of the
 * first screen; these are the equivalent questions this service can actually
 * answer, drawn from the published department mandates.
 */
function PracticalAnswers({ faqs }: { faqs: FAQ[] }) {
  // The body is stored as `answer_plain_text`; `answer` holds the rich-text
  // version and is null on these records, so it cannot be the test.
  const published = faqs
    .map((faq) => ({
      faq,
      body: faq.answer_plain_text ?? faq.answer ?? null,
    }))
    .filter((entry) => entry.faq.question && entry.body);
  if (published.length === 0) return null;

  return (
    <section
      id="answers"
      className={cn("scroll-mt-24 border-t border-primary/10 bg-white", SECTION)}
    >
      <div className={INNER}>
        <AboutReveal variant="left">
          <div className="grid gap-5 lg:grid-cols-2 lg:items-end">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-primary sm:text-4xl">
              Practical <em className="italic">Answers.</em>
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              The questions students ask most often, answered by the offices
              that handle them.
            </p>
          </div>
        </AboutReveal>

        <dl className="mt-10 grid gap-x-10 gap-y-9 md:grid-cols-2">
          {published.slice(0, 6).map(({ faq, body }, index) => (
            <AboutReveal key={faq.id} variant="up" delay={(index % 2) * 100}>
              <div className="border-t border-primary/15 pt-6">
                {faq.category ? (
                  <p className="text-[0.68rem] font-bold uppercase tracking-wider text-secondary">
                    {faq.category}
                  </p>
                ) : null}
                <dt className="mt-2 font-[family-name:var(--font-display)] text-xl font-normal leading-snug tracking-tight text-primary">
                  {faq.question}
                </dt>
                <dd className="mt-3 text-base leading-8 text-muted-foreground">
                  {body}
                </dd>
              </div>
            </AboutReveal>
          ))}
        </dl>

        <div className="mt-9">
          <InlineLink href="/campus-life/support">
            All student support
          </InlineLink>
        </div>
      </div>
    </section>
  );
}

/** How a student starts their own club, kept as its own step-by-step block. */
function StartAClub() {
  return (
    <section className={cn("border-t border-primary/10 bg-white", SECTION)}>
      <AboutReveal className={INNER} variant="up">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-primary sm:text-4xl">
          Start a <em className="italic">Club.</em>
        </h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-3">
          {[
            "Write the purpose and find fifteen founding members.",
            "Ask a member of staff to stand as patron.",
            "Register the constitution with Student Affairs.",
          ].map((step, index) => (
            <li
              key={step}
              className="flex items-start gap-3.5 text-base leading-8 text-muted-foreground"
            >
              <span
                aria-hidden
                className="mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-2xl text-[0.7rem] font-bold text-primary ring-1 ring-primary/20"
              >
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-7">
          <InlineLink href="/campus-life/clubs">Club registration</InlineLink>
        </div>
      </AboutReveal>
    </section>
  );
}

/* ------------------------------ at a glance ----------------------------- */

function AtAGlance({ roster, stories }: { roster: Club[]; stories: Story[] }) {
  const county = roster.filter((club) => club.club_type === "county").length;
  const professional = roster.filter((club) => club.club_type === "professional").length;
  const faith = roster.filter((club) => club.club_type === "religious").length;
  const performing = roster.filter((club) => club.club_type === "edu-tainment").length;

  const items = [
    { label: "Registered Clubs", value: roster.length, icon: Sparkles },
    { label: "County Associations", value: county, icon: Users },
    { label: "Professional Bodies", value: professional, icon: Trophy },
    { label: "Performing Arts", value: performing, icon: Sparkles },
    { label: "Faith Communities", value: faith, icon: HeartHandshake },
    {
      label: "Stories Published",
      value: campusLifeStories(stories).length,
      icon: Users,
    },
  ].filter((item) => item.value > 0);

  if (items.length === 0) return null;

  return (
    <section className="bg-white px-5 pb-14 sm:px-8 lg:px-16 xl:px-20">
      <AboutReveal className={INNER} variant="scale">
        <div className="flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-normal tracking-tight text-primary">
            Campus life at a <em className="italic">glance</em>
          </h2>
          <Link
            href="/campus-life/clubs"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            Browse every club <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-6">
          {items.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="border-b border-border px-3 py-6 text-center lg:border-r lg:last:border-r-0"
            >
              <Icon className="mx-auto h-7 w-7 text-primary" aria-hidden />
              <p className="mt-3 font-[family-name:var(--font-display)] text-lg font-normal tracking-tight text-primary">
                {value}
              </p>
              <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
            </div>
          ))}
        </div>
      </AboutReveal>
    </section>
  );
}

export default CampusLifeLanding;
