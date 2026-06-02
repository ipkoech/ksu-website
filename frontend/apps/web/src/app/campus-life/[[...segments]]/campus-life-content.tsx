import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  ExternalLink,
  HeartHandshake,
  ImageIcon,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  Accommodation,
  ArtsCulture,
  Club,
  ContactDirectory,
  FAQ,
  SportsFacility,
  StudentGovernance,
} from "@ksu/api-client";
import { ScrollReveal } from "@ksu/ui/components";
import type { CampusLifePageData } from "@/lib/get-campus-life";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { PublicImage } from "@/components/public/public-image";

type CampusArea =
  | "landing"
  | "student-life"
  | "clubs"
  | "club-detail"
  | "sports"
  | "sport-detail"
  | "accommodation"
  | "accommodation-detail"
  | "support"
  | "support-detail"
  | "gallery"
  | "gallery-detail";

type CampusLifeContentProps = {
  segments: string[];
  data: CampusLifePageData;
};

type NavItem = {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
};

const officialLinks = {
  campusLife: "https://kisiiuniversity.ac.ke/campus-life",
  portal: "https://portal.kisiiuniversity.ac.ke",
  customerCare: "https://digital.kisiiuniversity.ac.ke",
  schools: "https://kisiiuniversity.ac.ke/schools_departments",
};

const media = {
  hero: "/images/about/about-overview.webp",
  student: "/images/about/about-leadership.webp",
  clubs: "/images/about/about-mission-vision.webp",
  sports: "/images/about/about-quality-assurance.webp",
  accommodation: "/images/about/about-administration.webp",
  support: "/images/about/about-service-charter.webp",
  gallery: "/images/about/about-history.webp",
};

const navItems: NavItem[] = [
  {
    title: "Campus Life",
    href: "/campus-life",
    description: "Student experience, services, and activities.",
    icon: Sparkles,
  },
  {
    title: "Student Life",
    href: "/campus-life/student-life",
    description: "Student governance, leadership, and belonging.",
    icon: Users,
  },
  {
    title: "Clubs & Societies",
    href: "/campus-life/clubs",
    description: "Academic, cultural, faith, service, and interest groups.",
    icon: Sparkles,
  },
  {
    title: "Sports & Recreation",
    href: "/campus-life/sports",
    description: "Facilities, activities, and active student wellbeing.",
    icon: Trophy,
  },
  {
    title: "Accommodation",
    href: "/campus-life/accommodation",
    description: "Housing records, amenities, rules, and applications.",
    icon: BedDouble,
  },
  {
    title: "Student Support",
    href: "/campus-life/support",
    description: "Wellbeing, health, accessibility, and service contacts.",
    icon: HeartHandshake,
  },
  {
    title: "Gallery",
    href: "/campus-life/gallery",
    description: "Arts, culture, activities, and campus moments.",
    icon: ImageIcon,
  },
];

const supportServices = [
  {
    title: "Counseling and wellbeing",
    href: "/campus-life/support/counseling",
    body: "Confidential support, referral guidance, peer wellbeing, and help when student life becomes difficult.",
    icon: HeartHandshake,
  },
  {
    title: "Health services",
    href: "/campus-life/support/health",
    body: "Clinic access, emergency guidance, health education, and prevention support for students.",
    icon: ShieldCheck,
  },
  {
    title: "Disability support",
    href: "/campus-life/support/disability",
    body: "Accessibility coordination, reasonable accommodation, and inclusive participation in campus life.",
    icon: CheckCircle2,
  },
  {
    title: "Academic and service help",
    href: officialLinks.customerCare,
    body: "Use official service channels for requests, complaints, compliments, suggestions, and information requests.",
    icon: Mail,
  },
];

const sportsFallback = [
  "Football and athletics fields",
  "Indoor games and court sports",
  "Fitness, recreation, and wellness activities",
  "Inter-school and inter-university competitions",
];

function areaFromSegments(segments: string[]): CampusArea {
  const [area, slug] = segments;
  if (!area) return "landing";
  if (area === "clubs" && slug) return "club-detail";
  if (area === "sports" && slug) return "sport-detail";
  if (area === "accommodation" && slug) return "accommodation-detail";
  if (area === "support" && slug) return "support-detail";
  if (area === "gallery" && slug) return "gallery-detail";
  if (area === "student-life") return "student-life";
  if (area === "clubs") return "clubs";
  if (area === "sports") return "sports";
  if (area === "accommodation") return "accommodation";
  if (area === "support") return "support";
  if (area === "gallery") return "gallery";
  return "landing";
}

function titleFromSlug(slug?: string) {
  if (!slug) return "Campus life";
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function shortText(value?: string | null, fallback = "Campus life record.") {
  const text = (value || fallback)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}

function money(value?: number | null) {
  if (!value) return "Not published";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value);
}

function dateText(value?: string | null) {
  if (!value) return "Not dated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function listValue(value?: string[] | null, fallback = "Not published") {
  return value?.length ? value.join(", ") : fallback;
}

function ActionLink({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  const external = href.startsWith("http");
  const host = external ? new URL(href).host : null;
  const className = primary
    ? "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
    : "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-primary hover:text-primary";

  if (external) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="flex flex-col text-left leading-tight">
          <span>{children}</span>
          {host ? (
            <span className="text-[11px] font-medium opacity-80">
              Opens {host}
            </span>
          ) : null}
        </span>
        <ExternalLink aria-hidden className="h-4 w-4" />
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}

function SideNav({ currentHref }: { currentHref: string }) {
  return (
    <nav
      aria-label="Campus life navigation"
      className="border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-28"
    >
      <p className="px-3 py-2 text-xs font-semibold uppercase text-secondary">
        Campus Life
      </p>
      <div className="mt-1 grid gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentHref === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex gap-3 border px-3 py-3 text-sm transition ${
                active
                  ? "border-primary/30 bg-primary/5 text-slate-950"
                  : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center ${
                  active
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-primary group-hover:bg-primary group-hover:text-white"
                }`}
              >
                <Icon aria-hidden className="h-4 w-4" />
              </span>
              <span>
                <span className="block font-semibold">{item.title}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function Hero({
  eyebrow,
  title,
  body,
  image,
}: {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
}) {
  return (
    <section className="border-b border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="w-full">
        <BreadcrumbTrail
          items={[
            { label: "Home", href: "/" },
            { label: "Campus Life", href: "/campus-life" },
            { label: eyebrow },
          ]}
        />
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.65fr)] lg:items-stretch">
          <div className="flex flex-col justify-end">
            <p className="text-sm font-semibold uppercase text-secondary">
              {eyebrow}
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] text-slate-950 sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              {body}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ActionLink href="/campus-life/clubs" primary>
                Explore clubs
              </ActionLink>
              <ActionLink href="/campus-life/support">
                Student support
              </ActionLink>
              <ActionLink href="/campus-life/accommodation">
                Accommodation
              </ActionLink>
            </div>
          </div>
          <div className="relative min-h-[320px] overflow-hidden border border-slate-200 bg-slate-100">
            <PublicImage
              src={image}
              alt=""
              ratio="fill"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="absolute inset-0 h-full w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="text-sm font-semibold uppercase text-white/80">
                Student experience
              </p>
              <p className="mt-2 max-w-md text-2xl font-semibold leading-tight">
                Where learning, living, service, and belonging meet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Section({
  eyebrow,
  title,
  body,
  children,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <ScrollReveal
      as="section"
      className={
        dark
          ? "border-y border-slate-900 bg-slate-950 px-4 py-14 text-white sm:px-6 lg:px-8 lg:py-16"
          : "border-b border-slate-200 bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-16"
      }
    >
      <div className="grid w-full gap-9 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div>
          <p className="text-sm font-semibold uppercase text-secondary">
            {eyebrow}
          </p>
          <h2
            className={
              dark
                ? "mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-white sm:text-4xl"
                : "mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl"
            }
          >
            {title}
          </h2>
          {body ? (
            <p
              className={
                dark
                  ? "mt-5 text-base leading-8 text-white/70"
                  : "mt-5 text-base leading-8 text-slate-600"
              }
            >
              {body}
            </p>
          ) : null}
        </div>
        <div>{children}</div>
      </div>
    </ScrollReveal>
  );
}

function StatStrip({ data }: { data: CampusLifePageData }) {
  const capacity = data.accommodations.reduce(
    (sum, item) => sum + (item.capacity ?? 0),
    0,
  );
  const contacts = data.contacts.length + data.faqs.length;

  return (
    <div className="grid border border-slate-200 bg-white md:grid-cols-4">
      {[
        ["Clubs", data.clubs.length || "Published records"],
        ["Sports facilities", data.sports.length || "Campus activities"],
        ["Housing capacity", capacity || "Portal verified"],
        ["Support records", contacts || "Service channels"],
      ].map(([label, value]) => (
        <div
          key={label}
          className="border-b border-slate-200 p-5 md:border-b-0 md:border-r last:md:border-r-0"
        >
          <p className="text-xs font-semibold uppercase text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
      ))}
    </div>
  );
}

function FeatureGrid({
  items,
  dark = false,
}: {
  items: NavItem[];
  dark?: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              dark
                ? "group border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white/[0.08]"
                : "group border border-slate-200 bg-white p-5 transition hover:border-primary/35 hover:bg-primary/5"
            }
          >
            <span
              className={
                dark
                  ? "flex h-11 w-11 items-center justify-center bg-white/10 text-secondary"
                  : "flex h-11 w-11 items-center justify-center bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white"
              }
            >
              <Icon aria-hidden className="h-5 w-5" />
            </span>
            <h3
              className={
                dark
                  ? "mt-5 text-lg font-semibold text-white"
                  : "mt-5 text-lg font-semibold text-slate-950"
              }
            >
              {item.title}
            </h3>
            <p
              className={
                dark
                  ? "mt-2 text-sm leading-7 text-white/70"
                  : "mt-2 text-sm leading-7 text-slate-600"
              }
            >
              {item.description}
            </p>
            <span
              className={
                dark
                  ? "mt-5 inline-flex items-center gap-2 text-sm font-semibold text-secondary"
                  : "mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
              }
            >
              Explore
              <ArrowRight aria-hidden className="h-4 w-4" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function RecordGrid<T>({
  items,
  emptyTitle,
  render,
}: {
  items: T[];
  emptyTitle: string;
  render: (item: T) => React.ReactNode;
}) {
  if (!items.length) {
    return (
      <div className="border border-slate-200 bg-white p-6">
        <h3 className="text-xl font-semibold text-slate-950">{emptyTitle}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          No public records were returned for this category. Use official
          university channels for current student-life guidance.
        </p>
        <div className="mt-5">
          <ActionLink href={officialLinks.campusLife}>
            Official campus life
          </ActionLink>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map(render)}
    </div>
  );
}

function ClubCard({ club }: { club: Club }) {
  return (
    <Link
      href={`/campus-life/clubs/${club.slug}`}
      className="group border border-slate-200 bg-white p-5 transition hover:border-primary/35 hover:bg-primary/5"
    >
      <p className="text-xs font-semibold uppercase text-secondary">
        {club.club_type || "Club"}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-slate-950">{club.name}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">
        {shortText(
          club.about ?? club.mission ?? club.objectives,
          "Student club or society.",
        )}
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 text-sm">
        <div>
          <dt className="text-xs uppercase text-slate-500">Members</dt>
          <dd className="mt-1 font-semibold text-slate-950">
            {club.membership_count || "Not published"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-slate-500">Meeting</dt>
          <dd className="mt-1 font-semibold text-slate-950">
            {club.meeting_schedule || "Contact club"}
          </dd>
        </div>
      </dl>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        View club
        <ArrowRight aria-hidden className="h-4 w-4" />
      </span>
    </Link>
  );
}

function HousingCard({ item }: { item: Accommodation }) {
  return (
    <Link
      href={`/campus-life/accommodation/${item.slug}`}
      className="grid gap-5 border border-slate-200 bg-white p-5 transition hover:border-primary/35 hover:bg-primary/5 md:grid-cols-[160px_minmax(0,1fr)]"
    >
      <div className="min-h-36 bg-slate-100">
        <PublicImage
          src={media.accommodation}
          alt=""
          ratio="card"
          sizes="160px"
          className="h-full w-full"
        />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-secondary">
          {item.accommodation_type} · {item.gender}
        </p>
        <h3 className="mt-2 text-xl font-semibold text-slate-950">
          {item.name}
        </h3>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          {shortText(item.about ?? item.rules, "Accommodation record.")}
        </p>
        <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
          <span>Capacity: {item.capacity || "Not published"}</span>
          <span>Rooms: {item.total_rooms || "Not published"}</span>
          <span>Fee: {money(item.fee_per_semester)}</span>
        </div>
      </div>
    </Link>
  );
}

function SportCard({ item }: { item: SportsFacility }) {
  return (
    <Link
      href={`/campus-life/sports/${item.slug}`}
      className="border border-slate-200 bg-white p-5 transition hover:border-primary/35 hover:bg-primary/5"
    >
      <span className="flex h-11 w-11 items-center justify-center bg-primary/10 text-primary">
        <Dumbbell aria-hidden className="h-5 w-5" />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-slate-950">{item.name}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">
        {shortText(
          item.about,
          listValue(item.sport_types, "Sports facility record."),
        )}
      </p>
      <p className="mt-4 text-sm font-semibold text-slate-950">
        {item.location || item.facility_type || "Main Campus"}
      </p>
    </Link>
  );
}

function ArtCard({ item }: { item: ArtsCulture }) {
  return (
    <Link
      href={`/campus-life/gallery/${item.slug}`}
      className="group overflow-hidden border border-slate-200 bg-white transition hover:border-primary/35"
    >
      <div className="h-44 bg-slate-100">
        <PublicImage
          src={media.gallery}
          alt=""
          ratio="news"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="h-full w-full"
          imageClassName="transition group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase text-secondary">
          {item.category || "Gallery"}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-950">
          {item.title}
        </h3>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          {shortText(item.about, "Arts, culture, and campus-life record.")}
        </p>
      </div>
    </Link>
  );
}

function GovernanceCard({ item }: { item: StudentGovernance }) {
  return (
    <Link
      href={`/campus-life/student-life/${item.slug}`}
      className="border border-slate-200 bg-white p-5 transition hover:border-primary/35 hover:bg-primary/5"
    >
      <p className="text-xs font-semibold uppercase text-secondary">
        {item.acronym || item.governance_type || "Student body"}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-slate-950">{item.name}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">
        {shortText(
          item.about ?? item.mandate ?? item.constitution,
          "Student governance record.",
        )}
      </p>
      <p className="mt-4 text-sm text-slate-600">
        Term: {dateText(item.term_start)} to {dateText(item.term_end)}
      </p>
    </Link>
  );
}

function Landing({ data }: { data: CampusLifePageData }) {
  return (
    <>
      <Section
        eyebrow="Campus Highlights"
        title="The student experience at a glance"
        body="Campus life brings together community, wellbeing, accommodation, sport, leadership, culture, and service pathways."
      >
        <StatStrip data={data} />
      </Section>
      <Section
        eyebrow="Explore"
        title="Choose what matters to your student experience"
        body="Prospective and current students can move directly into the practical areas they need."
        dark
      >
        <FeatureGrid dark items={navItems.slice(1)} />
      </Section>
      <Section
        eyebrow="Clubs and Activities"
        title="Find a community beyond the classroom"
        body="Club records show student groups, membership context, meeting schedules, and public contact points when published."
      >
        <RecordGrid
          items={data.clubs.slice(0, 6)}
          emptyTitle="No clubs are currently published"
          render={(club) => <ClubCard key={club.id} club={club} />}
        />
      </Section>
      <Section
        eyebrow="Living and Wellness"
        title="Housing, sport, and support work together"
        body="A good student experience depends on where students live, how they stay active, and how quickly they can find help."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <ExperiencePanel
            image={media.accommodation}
            title="Accommodation"
            body="Review housing options, capacity, amenities, rules, and application status."
            href="/campus-life/accommodation"
          />
          <ExperiencePanel
            image={media.sports}
            title="Sports and recreation"
            body="Find facilities, sports activities, operating context, and recreation opportunities."
            href="/campus-life/sports"
          />
          <ExperiencePanel
            image={media.support}
            title="Student support"
            body="Access wellbeing, health, accessibility, FAQs, and contact pathways."
            href="/campus-life/support"
          />
        </div>
      </Section>
    </>
  );
}

function ExperiencePanel({
  image,
  title,
  body,
  href,
}: {
  image: string;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group overflow-hidden border border-slate-200 bg-white"
    >
      <div className="h-48 bg-slate-100">
        <PublicImage
          src={image}
          alt=""
          ratio="news"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="h-full w-full"
          imageClassName="transition group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          Explore
          <ArrowRight aria-hidden className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function ClubsPage({ data }: { data: CampusLifePageData }) {
  const types = Array.from(
    new Set(data.clubs.map((club) => club.club_type).filter(Boolean)),
  );
  return (
    <>
      <Section
        eyebrow="Club Directory"
        title="Browse clubs and societies"
        body="Use club records to understand purpose, membership size, schedule, and contact options before joining."
      >
        {types.length ? (
          <div className="mb-6 flex flex-wrap gap-2">
            {["All", ...types].map((type) => (
              <span
                key={type}
                className="border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
              >
                {type}
              </span>
            ))}
          </div>
        ) : null}
        <RecordGrid
          items={data.clubs}
          emptyTitle="No club records are currently published"
          render={(club) => <ClubCard key={club.id} club={club} />}
        />
      </Section>
      <Section
        eyebrow="Join or Start"
        title="How students turn interest into participation"
        body="Club participation should be easy to understand: discover, attend, register, and remain accountable to student-life procedures."
        dark
      >
        <StepList
          dark
          steps={[
            "Browse clubs and identify the community that matches your interest.",
            "Attend a meeting or contact the club through the published contact details.",
            "Confirm registration or membership requirements through student-life offices.",
            "For new clubs, prepare purpose, leadership, patron, and constitution details for approval.",
          ]}
        />
      </Section>
    </>
  );
}

function ClubDetail({ club }: { club?: Club | null }) {
  return (
    <>
      <Section
        eyebrow="Club Profile"
        title={club?.name ?? "Club record not found"}
        body={
          club
            ? shortText(
                club.about ?? club.mission ?? club.objectives,
                "Club profile.",
              )
            : "The requested club was not returned by the public records API."
        }
      >
        <DetailGrid
          rows={[
            ["Type", club?.club_type || "Not published"],
            [
              "Members",
              club?.membership_count
                ? String(club.membership_count)
                : "Not published",
            ],
            ["Meeting schedule", club?.meeting_schedule || "Not published"],
            ["Membership fee", money(club?.membership_fee)],
            ["Email", club?.email || "Not published"],
            ["Phone", club?.phone || "Not published"],
          ]}
        />
      </Section>
      <Section
        eyebrow="Purpose"
        title="Mission, objectives, and participation"
        body="Club detail pages should help students decide whether to visit, join, or contact the group."
        dark
      >
        <TextBlocks
          dark
          blocks={[
            [
              "About",
              club?.about || "About information has not been published.",
            ],
            [
              "Mission",
              club?.mission || "Mission information has not been published.",
            ],
            [
              "Objectives",
              club?.objectives || "Objectives have not been published.",
            ],
          ]}
        />
      </Section>
    </>
  );
}

function SportsPage({ data }: { data: CampusLifePageData }) {
  return (
    <>
      <Section
        eyebrow="Sports Facilities"
        title="Facilities and recreation records"
        body="Sports pages should show where students can train, compete, stay fit, and participate recreationally."
      >
        <RecordGrid
          items={data.sports}
          emptyTitle="No sports facilities are currently published"
          render={(item) => <SportCard key={item.id} item={item} />}
        />
      </Section>
      <Section
        eyebrow="Activities"
        title="Common recreation pathways"
        body="When formal facility records are limited, students still need a clear picture of likely activities and where to ask for current schedules."
        dark
      >
        <StepList dark steps={sportsFallback} />
      </Section>
    </>
  );
}

function SportDetail({ sport }: { sport?: SportsFacility | null }) {
  return (
    <>
      <Section
        eyebrow="Facility Profile"
        title={sport?.name ?? "Sports facility not found"}
        body={
          sport
            ? shortText(sport.about, "Sports facility profile.")
            : "The requested sports facility was not returned by the public records API."
        }
      >
        <DetailGrid
          rows={[
            ["Facility type", sport?.facility_type || "Not published"],
            ["Sports", listValue(sport?.sport_types)],
            ["Location", sport?.location || "Not published"],
            ["Email", sport?.email || "Not published"],
            ["Phone", sport?.phone || "Not published"],
          ]}
        />
      </Section>
    </>
  );
}

function AccommodationPage({ data }: { data: CampusLifePageData }) {
  return (
    <>
      <Section
        eyebrow="Housing Directory"
        title="Student accommodation records"
        body="Accommodation pages should help students compare housing type, capacity, room availability context, amenities, rules, fees, and application status."
      >
        <RecordGrid
          items={data.accommodations}
          emptyTitle="No accommodation records are currently published"
          render={(item) => <HousingCard key={item.id} item={item} />}
        />
      </Section>
      <Section
        eyebrow="How To Apply"
        title="Housing application sequence"
        body="Students should use official portal or student-life guidance before paying accommodation charges."
        dark
      >
        <StepList
          dark
          steps={[
            "Log in to the official student portal when accommodation applications are open.",
            "Compare hostel, room type, gender allocation, capacity, and available amenities.",
            "Confirm current fee and payment instructions from official records.",
            "Keep payment evidence and allocation details for reporting.",
          ]}
        />
      </Section>
    </>
  );
}

function AccommodationDetail({ item }: { item?: Accommodation | null }) {
  return (
    <>
      <Section
        eyebrow="Accommodation Profile"
        title={item?.name ?? "Accommodation record not found"}
        body={
          item
            ? shortText(item.about ?? item.rules, "Accommodation profile.")
            : "The requested accommodation was not returned by the public records API."
        }
      >
        <DetailGrid
          rows={[
            ["Type", item?.accommodation_type || "Not published"],
            ["Gender", item?.gender || "Not published"],
            [
              "Capacity",
              item?.capacity ? String(item.capacity) : "Not published",
            ],
            [
              "Rooms",
              item?.total_rooms ? String(item.total_rooms) : "Not published",
            ],
            ["Fee per semester", money(item?.fee_per_semester)],
            [
              "Applications",
              item?.is_accepting_applications
                ? "Accepting applications"
                : "Not accepting applications",
            ],
            ["Amenities", listValue(item?.amenities)],
            ["Email", item?.email || "Not published"],
            ["Phone", item?.phone || "Not published"],
          ]}
        />
      </Section>
      <Section
        eyebrow="Rules and Amenities"
        title="Know the living conditions before applying"
        body="Published housing records should make expectations clear before allocation."
        dark
      >
        <TextBlocks
          dark
          blocks={[
            [
              "Amenities",
              listValue(item?.amenities, "Amenities have not been published."),
            ],
            ["Rules", item?.rules || "Rules have not been published."],
          ]}
        />
      </Section>
    </>
  );
}

function StudentLifePage({ data }: { data: CampusLifePageData }) {
  return (
    <>
      <Section
        eyebrow="Student Governance"
        title="Leadership, representation, and student voice"
        body="Student-life pages connect campus belonging with governance records, representative offices, leadership terms, and student engagement."
      >
        <RecordGrid
          items={data.governance}
          emptyTitle="No student governance records are currently published"
          render={(item) => <GovernanceCard key={item.id} item={item} />}
        />
      </Section>
      <Section
        eyebrow="Student Experience"
        title="What belonging should include"
        body="Campus life is more than activities. Students need representation, peer networks, service access, and safe channels for raising concerns."
        dark
      >
        <StepList
          dark
          steps={[
            "Join communities that support academic, social, cultural, and service interests.",
            "Use student governance and official offices for representation and issue escalation.",
            "Participate in events, sports, clubs, and cultural activities responsibly.",
            "Use support services early when wellbeing, health, accessibility, or academic concerns arise.",
          ]}
        />
      </Section>
    </>
  );
}

function GovernanceDetail({ item }: { item?: StudentGovernance | null }) {
  return (
    <Section
      eyebrow="Student Body"
      title={item?.name ?? "Student governance record not found"}
      body={
        item
          ? shortText(
              item.about ?? item.mandate ?? item.constitution,
              "Student governance profile.",
            )
          : "The requested student body was not returned by the public records API."
      }
    >
      <DetailGrid
        rows={[
          ["Acronym", item?.acronym || "Not published"],
          ["Type", item?.governance_type || "Not published"],
          [
            "Term",
            `${dateText(item?.term_start)} to ${dateText(item?.term_end)}`,
          ],
          ["Office", item?.office_location || "Not published"],
          ["Email", item?.email || "Not published"],
          ["Phone", item?.phone || "Not published"],
        ]}
      />
    </Section>
  );
}

function SupportPage({
  data,
  slug,
}: {
  data: CampusLifePageData;
  slug?: string;
}) {
  const selected = slug ? titleFromSlug(slug) : undefined;
  return (
    <>
      <Section
        eyebrow="Support Services"
        title={selected ? `${selected} support` : "Student support services"}
        body="Support pages should make help easy to find: what service exists, when to use it, and how to contact the right office."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {supportServices.map((service) => {
            const Icon = service.icon;
            const external = service.href.startsWith("http");
            const className =
              "border border-slate-200 bg-white p-5 transition hover:border-primary/35 hover:bg-primary/5";
            const inner = (
              <>
                <span className="flex h-11 w-11 items-center justify-center bg-primary/10 text-primary">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {service.body}
                </p>
              </>
            );
            return external ? (
              <a key={service.title} href={service.href} className={className}>
                {inner}
              </a>
            ) : (
              <Link
                key={service.title}
                href={service.href}
                className={className}
              >
                {inner}
              </Link>
            );
          })}
        </div>
      </Section>
      <Section
        eyebrow="FAQs and Contacts"
        title="Published support records"
        body="FAQs and directory contacts are shown when the public student-life records provide them."
        dark
      >
        <SupportRecords faqs={data.faqs} contacts={data.contacts} />
      </Section>
    </>
  );
}

function SupportRecords({
  faqs,
  contacts,
}: {
  faqs: FAQ[];
  contacts: ContactDirectory[];
}) {
  const hasRecords = faqs.length || contacts.length;
  if (!hasRecords) {
    return (
      <div className="border border-white/10 bg-white/[0.04] p-6">
        <h3 className="text-xl font-semibold text-white">
          Use official support channels
        </h3>
        <p className="mt-3 text-sm leading-7 text-white/70">
          No student support FAQs or contacts were returned. Use the official
          customer care centre for support requests, complaints, compliments,
          suggestions, and information requests.
        </p>
        <div className="mt-5">
          <ActionLink href={officialLinks.customerCare} primary>
            Open customer care
          </ActionLink>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {faqs.map((faq) => (
        <div
          key={faq.id}
          className="border border-white/10 bg-white/[0.04] p-5"
        >
          <p className="text-xs font-semibold uppercase text-secondary">
            {faq.category || "FAQ"}
          </p>
          <h3 className="mt-3 text-lg font-semibold text-white">
            {faq.question}
          </h3>
          <p className="mt-2 text-sm leading-7 text-white/70">
            {shortText(
              faq.answer_plain_text ?? faq.answer_rich_text ?? faq.answer,
              "Student support answer.",
            )}
          </p>
        </div>
      ))}
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="border border-white/10 bg-white/[0.04] p-5"
        >
          <p className="text-xs font-semibold uppercase text-secondary">
            {contact.contact_type || "Contact"}
          </p>
          <h3 className="mt-3 text-lg font-semibold text-white">
            {contact.name}
          </h3>
          <p className="mt-2 text-sm leading-7 text-white/70">
            {[
              contact.email,
              contact.phone?.join(", "),
              contact.building,
              contact.room_number,
            ]
              .filter(Boolean)
              .join(" · ") || "Student support contact."}
          </p>
        </div>
      ))}
    </div>
  );
}

function GalleryPage({ data }: { data: CampusLifePageData }) {
  return (
    <>
      <Section
        eyebrow="Gallery"
        title="Campus life in photos, arts, and culture"
        body="Gallery records should show the lived experience of student activities, cultural moments, clubs, leadership, and events."
      >
        <RecordGrid
          items={data.arts}
          emptyTitle="No gallery records are currently published"
          render={(item) => <ArtCard key={item.id} item={item} />}
        />
      </Section>
      <Section
        eyebrow="Albums"
        title="Visual categories to expect"
        body="When album records are limited, the gallery still gives students a clear sense of the categories that should be published."
        dark
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {["Graduation", "Cultural week", "Sports day", "Campus life"].map(
            (album) => (
              <div
                key={album}
                className="overflow-hidden border border-white/10 bg-white/[0.04]"
              >
                <div className="h-36 bg-white/10">
                  <PublicImage
                    src={media.gallery}
                    alt=""
                    ratio="news"
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className="h-full w-full"
                    imageClassName="opacity-80"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white">{album}</h3>
                  <p className="mt-1 text-sm text-white/60">
                    Photo and video records
                  </p>
                </div>
              </div>
            ),
          )}
        </div>
      </Section>
    </>
  );
}

function GalleryDetail({ item }: { item?: ArtsCulture | null }) {
  return (
    <Section
      eyebrow="Gallery Record"
      title={item?.title ?? "Gallery record not found"}
      body={
        item
          ? shortText(item.about, "Gallery profile.")
          : "The requested gallery record was not returned by the public records API."
      }
    >
      <DetailGrid
        rows={[
          ["Category", item?.category || "Not published"],
          ["Status", item?.is_active ? "Active" : "Inactive or not published"],
        ]}
      />
    </Section>
  );
}

function DetailGrid({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid border border-slate-200 bg-white md:grid-cols-2">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="border-b border-slate-200 p-5 odd:md:border-r"
        >
          <dt className="text-xs font-semibold uppercase text-slate-500">
            {label}
          </dt>
          <dd className="mt-2 text-sm font-semibold leading-7 text-slate-950">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function TextBlocks({
  blocks,
  dark = false,
}: {
  blocks: [string, string][];
  dark?: boolean;
}) {
  return (
    <div className="grid gap-4">
      {blocks.map(([title, body]) => (
        <article
          key={title}
          className={
            dark
              ? "border border-white/10 bg-white/[0.04] p-5"
              : "border border-slate-200 bg-white p-5"
          }
        >
          <h3
            className={
              dark
                ? "text-lg font-semibold text-white"
                : "text-lg font-semibold text-slate-950"
            }
          >
            {title}
          </h3>
          <p
            className={
              dark
                ? "mt-2 text-sm leading-7 text-white/70"
                : "mt-2 text-sm leading-7 text-slate-600"
            }
          >
            {body}
          </p>
        </article>
      ))}
    </div>
  );
}

function StepList({
  steps,
  dark = false,
}: {
  steps: string[];
  dark?: boolean;
}) {
  return (
    <ol className="grid gap-3">
      {steps.map((step, index) => (
        <li
          key={step}
          className={
            dark
              ? "grid gap-4 border border-white/10 bg-white/[0.04] p-4 text-white sm:grid-cols-[48px_minmax(0,1fr)]"
              : "grid gap-4 border border-slate-200 bg-white p-4 text-slate-950 sm:grid-cols-[48px_minmax(0,1fr)]"
          }
        >
          <span className="flex h-10 w-10 items-center justify-center bg-primary text-sm font-semibold text-white">
            {index + 1}
          </span>
          <span
            className={
              dark
                ? "text-sm leading-7 text-white/75"
                : "text-sm leading-7 text-slate-600"
            }
          >
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}

function PageCopy({
  area,
  slug,
  data,
}: {
  area: CampusArea;
  slug?: string;
  data: CampusLifePageData;
}) {
  if (area === "clubs") {
    return {
      eyebrow: "Clubs and Societies",
      title: "Find your community on campus",
      body: "Browse student groups, membership context, meeting schedules, and contact points so students can move from interest to participation.",
      image: media.clubs,
    };
  }
  if (area === "club-detail") {
    return {
      eyebrow: "Club Detail",
      title: data.detail?.club?.name ?? `${titleFromSlug(slug)} club`,
      body: shortText(
        data.detail?.club?.about ?? data.detail?.club?.mission,
        "Club and society profile.",
      ),
      image: media.clubs,
    };
  }
  if (area === "sports" || area === "sport-detail") {
    return {
      eyebrow: "Sports and Recreation",
      title:
        area === "sport-detail"
          ? (data.detail?.sport?.name ?? titleFromSlug(slug))
          : "Stay active, compete, and recreate",
      body: "Sports and recreation pages show facilities, activities, locations, and practical next steps for active student life.",
      image: media.sports,
    };
  }
  if (area === "accommodation" || area === "accommodation-detail") {
    return {
      eyebrow: "Accommodation",
      title:
        area === "accommodation-detail"
          ? (data.detail?.accommodation?.name ?? titleFromSlug(slug))
          : "Your home base for student life",
      body: "Accommodation pages help students compare housing options, amenities, capacity, rules, fees, and application status.",
      image: media.accommodation,
    };
  }
  if (area === "support" || area === "support-detail") {
    return {
      eyebrow: "Student Support",
      title:
        area === "support-detail"
          ? `${titleFromSlug(slug)} support`
          : "Find help before problems become barriers",
      body: "Student support brings together wellbeing, health, accessibility, academic help, FAQs, contacts, and official service channels.",
      image: media.support,
    };
  }
  if (area === "gallery" || area === "gallery-detail") {
    return {
      eyebrow: "Gallery",
      title:
        area === "gallery-detail"
          ? (data.detail?.art?.title ?? titleFromSlug(slug))
          : "See campus life in action",
      body: "Gallery pages present arts, culture, events, activities, and the visual story of student experience.",
      image: media.gallery,
    };
  }
  if (area === "student-life") {
    return {
      eyebrow: "Student Life",
      title:
        data.detail?.governance?.name ??
        "Belonging, leadership, and student voice",
      body: "Student life connects representation, communities, activities, service access, and student wellbeing across campus.",
      image: media.student,
    };
  }
  return {
    eyebrow: "Campus Life",
    title: "More than classrooms and timetables",
    body: "Campus life at Kisii University brings together clubs, sport, accommodation, student support, leadership, culture, and everyday belonging.",
    image: media.hero,
  };
}

function ContentByArea({
  area,
  slug,
  data,
}: {
  area: CampusArea;
  slug?: string;
  data: CampusLifePageData;
}) {
  if (area === "clubs") return <ClubsPage data={data} />;
  if (area === "club-detail") return <ClubDetail club={data.detail?.club} />;
  if (area === "sports") return <SportsPage data={data} />;
  if (area === "sport-detail")
    return <SportDetail sport={data.detail?.sport} />;
  if (area === "accommodation") return <AccommodationPage data={data} />;
  if (area === "accommodation-detail") {
    return <AccommodationDetail item={data.detail?.accommodation} />;
  }
  if (area === "student-life" && slug) {
    return <GovernanceDetail item={data.detail?.governance} />;
  }
  if (area === "student-life") return <StudentLifePage data={data} />;
  if (area === "support" || area === "support-detail") {
    return <SupportPage data={data} slug={slug} />;
  }
  if (area === "gallery") return <GalleryPage data={data} />;
  if (area === "gallery-detail")
    return <GalleryDetail item={data.detail?.art} />;
  return <Landing data={data} />;
}

export function CampusLifeContent({ segments, data }: CampusLifeContentProps) {
  const area = areaFromSegments(segments);
  const [, slug] = segments;
  const currentHref = `/campus-life${segments.length ? `/${segments.join("/")}` : ""}`;
  const copy = PageCopy({ area, slug, data });

  return (
    <PageShell>
      <AboutPageLenis>
        <Hero
          eyebrow={copy.eyebrow}
          title={copy.title}
          body={copy.body}
          image={copy.image}
        />
        <div className="grid w-full gap-8 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-8 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8">
          <SideNav currentHref={currentHref} />
          <div className="min-w-0">
            <ContentByArea area={area} slug={slug} data={data} />
          </div>
        </div>
        <section className="border-y border-slate-200 bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid w-full gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase text-secondary">
                Student Services
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950 sm:text-4xl">
                Keep moving through campus life
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Use official systems for service requests and student portals,
                and use the campus-life pages to understand what support,
                housing, activities, and student communities are available.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <ActionLink href={officialLinks.portal} primary>
                Student portal
              </ActionLink>
              <ActionLink href="/campus-life/support">Support</ActionLink>
              <ActionLink href="/campus-life/gallery">Gallery</ActionLink>
            </div>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
