import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  CheckCircle2,
  Dumbbell,
  HeartHandshake,
  ImageIcon,
  Mail,
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
import { ListPagination, ScrollReveal } from "@ksu/ui/components";
import type { CampusLifePageData } from "@/lib/get-campus-life";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { CampusLifeStoryLanding } from "@/components/campus-life/campus-life-story-landing";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { PublicImage } from "@/components/public/public-image";
import {
  PublicListFilterForm,
  type ListFilterOption,
} from "@/components/public/list-filter-form";
import { PublicActionLink } from "@/components/public/public-primitives";

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
  filters?: CampusLifeFilters;
};

type CampusLifeFilters = {
  q?: string;
  type?: string;
  status?: string;
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

function filterValue(value?: string | null) {
  return value?.trim() || "";
}

function optionLabel(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function uniqueOptions(
  values: Array<string | null | undefined>,
): ListFilterOption[] {
  return Array.from(
    new Set(values.map((value) => filterValue(value)).filter(Boolean)),
  )
    .sort((first, second) => first.localeCompare(second))
    .map((value) => ({ value, label: optionLabel(value) }));
}

function matchesQuery(fields: Array<string | number | null | undefined>, query?: string) {
  const term = filterValue(query).toLowerCase();
  if (!term) return true;
  return fields
    .filter((value) => value !== null && value !== undefined)
    .some((value) => String(value).toLowerCase().includes(term));
}

function matchesType(value: string | null | undefined, selected?: string) {
  const type = filterValue(selected);
  return !type || value === type;
}

function filterItems<T>(
  items: T[],
  filters: CampusLifeFilters | undefined,
  config: {
    typeField: (item: T) => string | null | undefined;
    searchFields: (item: T) => Array<string | number | null | undefined>;
    statusCheck: (item: T, status?: string) => boolean;
  },
) {
  return items.filter(
    (item) =>
      matchesType(config.typeField(item), filters?.type) &&
      config.statusCheck(item, filters?.status) &&
      matchesQuery(config.searchFields(item), filters?.q),
  );
}

function statusCheck(isActive: boolean, status?: string) {
  if (!status) return true;
  if (status === "active") return isActive;
  if (status === "inactive") return !isActive;
  return true;
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
  return (
    <PublicActionLink
      action={{
        label: typeof children === "string" ? children : "Open",
        href,
        external: href.startsWith("http"),
      }}
      primary={primary}
    />
  );
}

function CampusListFilters({
  filters,
  typeLabel,
  typeOptions,
  statusOptions,
  total,
  visible,
}: {
  filters?: CampusLifeFilters;
  typeLabel: string;
  typeOptions: ListFilterOption[];
  statusOptions?: ListFilterOption[];
  total: number;
  visible: number;
}) {
  return (
    <PublicListFilterForm
      className="mb-6 border border-border bg-white p-4 shadow-sm"
      searchValue={filters?.q}
      searchPlaceholder="Search records"
      selects={[
        {
          name: "type",
          label: typeLabel,
          value: filters?.type,
          allLabel: `All ${typeLabel.toLowerCase()}`,
          options: typeOptions,
        },
        {
          name: "status",
          label: "Status",
          value: filters?.status,
          allLabel: "All statuses",
          options:
            statusOptions ?? [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
        },
      ]}
      clearHref="?"
      total={total}
      visible={visible}
    />
  );
}

function SideNav({ currentHref }: { currentHref: string }) {
  return (
    <nav
      aria-label="Campus life navigation"
      className="border border-border bg-white p-3 shadow-sm lg:sticky lg:top-28"
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
                  ? "border-primary/30 bg-primary/5 text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-surface-subtle hover:text-foreground"
              }`}
            >
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center ${
                  active
                    ? "bg-primary text-white"
                    : "bg-surface-muted text-primary group-hover:bg-primary group-hover:text-white"
                }`}
              >
                <Icon aria-hidden className="h-4 w-4" />
              </span>
              <span>
                <span className="block font-semibold">{item.title}</span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
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
    <section className="border-b border-border bg-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
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
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
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
          <div className="relative min-h-[320px] overflow-hidden border border-border bg-surface-muted">
            <PublicImage
              src={image}
              alt=""
              ratio="fill"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="absolute inset-0 h-full w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-overlay/65 via-brand-overlay/10 to-transparent" />
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
          ? "border-y border-border bg-brand-overlay px-4 py-14 text-white sm:px-6 lg:px-8 lg:py-16"
          : "border-b border-border bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-16"
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
                : "mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl"
            }
          >
            {title}
          </h2>
          {body ? (
            <p
              className={
                dark
                  ? "mt-5 text-base leading-8 text-white/70"
                  : "mt-5 text-base leading-8 text-muted-foreground"
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
      <div className="border border-border bg-white p-6">
        <h3 className="text-xl font-semibold text-foreground">{emptyTitle}</h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
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
      className="group border border-border bg-white p-5 transition hover:border-primary/35 hover:bg-primary/5"
    >
      <p className="text-xs font-semibold uppercase text-secondary">
        {club.club_type || "Club"}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-foreground">{club.name}</h3>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        {shortText(
          club.about ?? club.mission ?? club.objectives,
          "Student club or society.",
        )}
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Members</dt>
          <dd className="mt-1 font-semibold text-foreground">
            {club.membership_count || "Not published"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Meeting</dt>
          <dd className="mt-1 font-semibold text-foreground">
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
      className="grid gap-5 border border-border bg-white p-5 transition hover:border-primary/35 hover:bg-primary/5 md:grid-cols-[160px_minmax(0,1fr)]"
    >
      <div className="min-h-36 bg-surface-muted">
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
        <h3 className="mt-2 text-xl font-semibold text-foreground">
          {item.name}
        </h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {shortText(item.about ?? item.rules, "Accommodation record.")}
        </p>
        <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
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
      className="border border-border bg-white p-5 transition hover:border-primary/35 hover:bg-primary/5"
    >
      <span className="flex h-11 w-11 items-center justify-center bg-primary/10 text-primary">
        <Dumbbell aria-hidden className="h-5 w-5" />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-foreground">{item.name}</h3>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        {shortText(
          item.about,
          listValue(item.sport_types, "Sports facility record."),
        )}
      </p>
      <p className="mt-4 text-sm font-semibold text-foreground">
        {item.location || item.facility_type || "Main Campus"}
      </p>
    </Link>
  );
}

function ArtCard({ item }: { item: ArtsCulture }) {
  return (
    <Link
      href={`/campus-life/gallery/${item.slug}`}
      className="group overflow-hidden border border-border bg-white transition hover:border-primary/35"
    >
      <div className="h-44 bg-surface-muted">
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
        <h3 className="mt-2 text-lg font-semibold text-foreground">
          {item.title}
        </h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
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
      className="border border-border bg-white p-5 transition hover:border-primary/35 hover:bg-primary/5"
    >
      <p className="text-xs font-semibold uppercase text-secondary">
        {item.acronym || item.governance_type || "Student body"}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-foreground">{item.name}</h3>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        {shortText(
          item.about ?? item.mandate ?? item.constitution,
          "Student governance record.",
        )}
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Term: {dateText(item.term_start)} to {dateText(item.term_end)}
      </p>
    </Link>
  );
}

function Landing({ data }: { data: CampusLifePageData }) {
  const editorial = data.editorial;
  const items = editorial?.section.items ?? [];
  const featured = items.find((item) => item.is_featured) ?? items[0];
  const supporting = items.filter((item) => item.id !== featured?.id).slice(0, 4);
  const itemImage = (item: typeof featured) => {
    const content = item?.content;
    return content && typeof content.imageUrl === "string" ? content.imageUrl : "/images/Home/OurKSU-82.jpg";
  };

  return (
    <div className="space-y-0">
      <section className="relative overflow-hidden rounded-[2rem] bg-primary px-5 py-12 text-white shadow-xl shadow-primary/15 sm:px-8 lg:px-14 lg:py-16">
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-secondary/20 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <ScrollReveal variant="fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">{editorial?.section.subtitle ?? "Life around studies"}</p>
            <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-7xl">{editorial?.section.title ?? "A student experience with room to become."}</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/75">{editorial?.section.description ?? "Discover the communities, spaces, support and opportunities that shape everyday life at Kisii University."}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ActionLink href="/campus-life/clubs" primary>Find your community</ActionLink>
              <ActionLink href="/campus-life/support">Student support</ActionLink>
            </div>
          </ScrollReveal>
          <ScrollReveal variant="zoom-in" className="relative min-h-[280px] overflow-hidden rounded-[1.5rem] bg-white/10 sm:min-h-[360px]">
            <PublicImage src={itemImage(featured)} alt={featured?.title ?? "Students at Kisii University"} ratio="fill" className="absolute inset-0 h-full rounded-[1.5rem]" imageClassName="h-full object-cover" sizes="(min-width: 1024px) 45vw, 100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
            {featured ? <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7"><p className="text-xs uppercase tracking-[0.18em] text-secondary">{featured.subtitle ?? "Student experience"}</p><p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold">{featured.title}</p></div> : null}
          </ScrollReveal>
        </div>
      </section>

      <section className="grid gap-5 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
        {supporting.map((item, index) => (
          <ScrollReveal key={item.id} variant="fade-up" delay={index * 70}>
            <Link href={item.cta_url ?? "/campus-life"} className="group block overflow-hidden rounded-[1.35rem] bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="relative aspect-[4/3] overflow-hidden"><PublicImage src={itemImage(item)} alt={item.title ?? "Life around studies"} ratio="fill" className="absolute inset-0 h-full rounded-none" imageClassName="h-full object-cover transition duration-700 group-hover:scale-105" sizes="(min-width: 1024px) 24vw, 50vw" /><div className="absolute inset-0 bg-gradient-to-t from-primary/55 to-transparent" /></div>
              <div className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">{item.audience === "prospective" ? "Before you arrive" : item.audience === "current_student" ? "For students" : "Campus life"}</p><h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">{item.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{item.body_text}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">{item.cta_label ?? "Explore"}<ArrowRight className="size-4 transition group-hover:translate-x-1" /></span></div>
            </Link>
          </ScrollReveal>
        ))}
      </section>

      <section className="rounded-[2rem] bg-[linear-gradient(135deg,hsl(var(--surface-subtle)),#fff)] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">The KSU rhythm</p><h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground sm:text-4xl">Make space for the things that make university yours.</h2></div><Link href="/campus-life" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">Explore all student life <ArrowRight className="size-4" /></Link></div>
        <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{navItems.slice(1, 5).map((item, index) => <Link key={item.href} href={item.href} className="group rounded-2xl bg-white/75 p-5 ring-1 ring-black/5 transition hover:bg-white"><span className="text-3xl font-semibold text-primary/20">0{index + 1}</span><h3 className="mt-5 font-semibold text-foreground">{item.title}</h3><span className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground group-hover:text-primary">Open page <ArrowRight className="size-4" /></span></Link>)}</div>
      </section>
    </div>
  );
}

function listingBaseHref(path: string, filters?: CampusLifeFilters) {
  const sp = new URLSearchParams();
  if (filters?.q) sp.set("q", filters.q);
  if (filters?.type) sp.set("type", filters.type);
  if (filters?.status) sp.set("status", filters.status);
  const search = sp.toString();
  return `${path}${search ? `?${search}` : ""}`;
}

function ClubsPage({
  data,
  filters,
}: {
  data: CampusLifePageData;
  filters?: CampusLifeFilters;
}) {
  const records = filterItems(data.clubs, filters, {
    typeField: (c) => c.club_type,
    searchFields: (c) => [c.name, c.club_type, c.about, c.mission, c.objectives, c.meeting_schedule],
    statusCheck: (c, s) => statusCheck(c.is_active, s),
  });
  const types = uniqueOptions(data.clubs.map((club) => club.club_type));
  const total = data.totals?.clubs ?? data.clubs.length;
  const perPage = 24;
  return (
    <>
      <Section
        eyebrow="Club Directory"
        title="Browse clubs and societies"
        body="Use club records to understand purpose, membership size, schedule, and contact options before joining."
      >
        <CampusListFilters
          filters={filters}
          typeLabel="Type"
          typeOptions={types}
          total={total}
          visible={records.length}
        />
        <RecordGrid
          items={records}
          emptyTitle="No club records are currently published"
          render={(club) => <ClubCard key={club.id} club={club} />}
        />
        <ListPagination
          page={data.page ?? 1}
          totalPages={Math.ceil(total / perPage)}
          total={total}
          perPage={perPage}
          baseHref={listingBaseHref("/campus-life/clubs", filters)}
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

function SportsPage({
  data,
  filters,
}: {
  data: CampusLifePageData;
  filters?: CampusLifeFilters;
}) {
  const records = filterItems(data.sports, filters, {
    typeField: (s) => s.facility_type,
    searchFields: (s) => [s.name, s.facility_type, s.location, s.about, ...(s.sport_types ?? [])],
    statusCheck: (s, st) => statusCheck(s.is_active, st),
  });
  const total = data.totals?.sports ?? data.sports.length;
  const perPage = 16;
  return (
    <>
      <Section
        eyebrow="Sports Facilities"
        title="Facilities and recreation records"
        body="Sports pages should show where students can train, compete, stay fit, and participate recreationally."
      >
        <CampusListFilters
          filters={filters}
          typeLabel="Facility type"
          typeOptions={uniqueOptions(data.sports.map((item) => item.facility_type))}
          total={total}
          visible={records.length}
        />
        <RecordGrid
          items={records}
          emptyTitle="No sports facilities are currently published"
          render={(item) => <SportCard key={item.id} item={item} />}
        />
        <ListPagination
          page={data.page ?? 1}
          totalPages={Math.ceil(total / perPage)}
          total={total}
          perPage={perPage}
          baseHref={listingBaseHref("/campus-life/sports", filters)}
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

function AccommodationPage({
  data,
  filters,
}: {
  data: CampusLifePageData;
  filters?: CampusLifeFilters;
}) {
  const records = filterItems(data.accommodations, filters, {
    typeField: (a) => a.accommodation_type,
    searchFields: (a) => [a.name, a.accommodation_type, a.gender, a.about, a.rules, ...(a.amenities ?? [])],
    statusCheck: (a, s) => {
      if (!s) return true;
      if (s === "accepting") return a.is_accepting_applications;
      if (s === "closed") return !a.is_accepting_applications;
      return statusCheck(a.is_active, s);
    },
  });
  const total = data.totals?.accommodations ?? data.accommodations.length;
  const perPage = 16;
  return (
    <>
      <Section
        eyebrow="Housing Directory"
        title="Student accommodation records"
        body="Accommodation pages should help students compare housing type, capacity, room availability context, amenities, rules, fees, and application status."
      >
        <CampusListFilters
          filters={filters}
          typeLabel="Housing type"
          typeOptions={uniqueOptions(
            data.accommodations.map((item) => item.accommodation_type),
          )}
          statusOptions={[
            { value: "accepting", label: "Accepting applications" },
            { value: "closed", label: "Applications closed" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          total={total}
          visible={records.length}
        />
        <RecordGrid
          items={records}
          emptyTitle="No accommodation records are currently published"
          render={(item) => <HousingCard key={item.id} item={item} />}
        />
        <ListPagination
          page={data.page ?? 1}
          totalPages={Math.ceil(total / perPage)}
          total={total}
          perPage={perPage}
          baseHref={listingBaseHref("/campus-life/accommodation", filters)}
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

function StudentLifePage({
  data,
  filters,
}: {
  data: CampusLifePageData;
  filters?: CampusLifeFilters;
}) {
  const records = filterItems(data.governance, filters, {
    typeField: (g) => g.governance_type,
    searchFields: (g) => [g.name, g.acronym, g.governance_type, g.about, g.mandate, g.office_location],
    statusCheck: (g, s) => statusCheck(g.is_active, s),
  });
  const total = data.totals?.governance ?? data.governance.length;
  const perPage = 12;
  return (
    <>
      <Section
        eyebrow="Student Governance"
        title="Leadership, representation, and student voice"
        body="Student-life pages connect campus belonging with governance records, representative offices, leadership terms, and student engagement."
      >
        <CampusListFilters
          filters={filters}
          typeLabel="Governance type"
          typeOptions={uniqueOptions(
            data.governance.map((item) => item.governance_type),
          )}
          total={total}
          visible={records.length}
        />
        <RecordGrid
          items={records}
          emptyTitle="No student governance records are currently published"
          render={(item) => <GovernanceCard key={item.id} item={item} />}
        />
        <ListPagination
          page={data.page ?? 1}
          totalPages={Math.ceil(total / perPage)}
          total={total}
          perPage={perPage}
          baseHref={listingBaseHref("/campus-life/student-life", filters)}
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
              "border border-border bg-white p-5 transition hover:border-primary/35 hover:bg-primary/5";
            const inner = (
              <>
                <span className="flex h-11 w-11 items-center justify-center bg-primary/10 text-primary">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
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

function GalleryPage({
  data,
  filters,
}: {
  data: CampusLifePageData;
  filters?: CampusLifeFilters;
}) {
  const records = filterItems(data.arts, filters, {
    typeField: (a) => a.category,
    searchFields: (a) => [a.title, a.category, a.about],
    statusCheck: (a, s) => statusCheck(a.is_active, s),
  });
  const total = data.totals?.arts ?? data.arts.length;
  const perPage = 16;
  return (
    <>
      <Section
        eyebrow="Gallery"
        title="Campus life in photos, arts, and culture"
        body="Gallery records should show the lived experience of student activities, cultural moments, clubs, leadership, and events."
      >
        <CampusListFilters
          filters={filters}
          typeLabel="Category"
          typeOptions={uniqueOptions(data.arts.map((item) => item.category))}
          total={total}
          visible={records.length}
        />
        <RecordGrid
          items={records}
          emptyTitle="No gallery records are currently published"
          render={(item) => <ArtCard key={item.id} item={item} />}
        />
        <ListPagination
          page={data.page ?? 1}
          totalPages={Math.ceil(total / perPage)}
          total={total}
          perPage={perPage}
          baseHref={listingBaseHref("/campus-life/gallery", filters)}
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
    <dl className="grid border border-border bg-white md:grid-cols-2">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="border-b border-border p-5 odd:md:border-r"
        >
          <dt className="text-xs font-semibold uppercase text-muted-foreground">
            {label}
          </dt>
          <dd className="mt-2 text-sm font-semibold leading-7 text-foreground">
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
              : "border border-border bg-white p-5"
          }
        >
          <h3
            className={
              dark
                ? "text-lg font-semibold text-white"
                : "text-lg font-semibold text-foreground"
            }
          >
            {title}
          </h3>
          <p
            className={
              dark
                ? "mt-2 text-sm leading-7 text-white/70"
                : "mt-2 text-sm leading-7 text-muted-foreground"
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
              : "grid gap-4 border border-border bg-white p-4 text-foreground sm:grid-cols-[48px_minmax(0,1fr)]"
          }
        >
          <span className="flex h-10 w-10 items-center justify-center bg-primary text-sm font-semibold text-white">
            {index + 1}
          </span>
          <span
            className={
              dark
                ? "text-sm leading-7 text-white/75"
                : "text-sm leading-7 text-muted-foreground"
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
  filters,
}: {
  area: CampusArea;
  slug?: string;
  data: CampusLifePageData;
  filters?: CampusLifeFilters;
}) {
  if (area === "clubs") return <ClubsPage data={data} filters={filters} />;
  if (area === "club-detail") return <ClubDetail club={data.detail?.club} />;
  if (area === "sports") return <SportsPage data={data} filters={filters} />;
  if (area === "sport-detail")
    return <SportDetail sport={data.detail?.sport} />;
  if (area === "accommodation")
    return <AccommodationPage data={data} filters={filters} />;
  if (area === "accommodation-detail") {
    return <AccommodationDetail item={data.detail?.accommodation} />;
  }
  if (area === "student-life" && slug) {
    return <GovernanceDetail item={data.detail?.governance} />;
  }
  if (area === "student-life")
    return <StudentLifePage data={data} filters={filters} />;
  if (area === "support" || area === "support-detail") {
    return <SupportPage data={data} slug={slug} />;
  }
  if (area === "gallery") return <GalleryPage data={data} filters={filters} />;
  if (area === "gallery-detail")
    return <GalleryDetail item={data.detail?.art} />;
  return <Landing data={data} />;
}

export function CampusLifeContent({
  segments,
  data,
  filters,
}: CampusLifeContentProps) {
  const area = areaFromSegments(segments);
  const [, slug] = segments;
  const currentHref = `/campus-life${segments.length ? `/${segments.join("/")}` : ""}`;
  const copy = PageCopy({ area, slug, data });

  return (
    <PageShell>
      <AboutPageLenis>
        {area === "landing" ? (
          <CampusLifeStoryLanding />
        ) : (
          <>
            <Hero
              eyebrow={copy.eyebrow}
              title={copy.title}
              body={copy.body}
              image={copy.image}
            />
            <div className="grid w-full gap-8 bg-[linear-gradient(180deg,hsl(var(--surface-subtle))_0%,#ffffff_100%)] px-4 py-8 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8">
              <SideNav currentHref={currentHref} />
              <div className="min-w-0">
                <ContentByArea
                  area={area}
                  slug={slug}
                  data={data}
                  filters={filters}
                />
              </div>
            </div>
          </>
        )}
        <section className="border-y border-border bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid w-full gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase text-secondary">
                Student Services
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground sm:text-4xl">
                Keep moving through campus life
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
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
