import Link from "next/link";
import {
  ArrowRight,
  AtSign,
  Building2,
  BusFront,
  Car,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  ExternalLink,
  Facebook,
  Globe2,
  HeartHandshake,
  Instagram,
  Landmark,
  Linkedin,
  Mail,
  MapPin,
  MessageSquareWarning,
  Music2,
  Phone,
  Search,
  Send,
  ShieldAlert,
  TicketCheck,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import {
  AmbientPageBackground,
  CampusPageHeader,
  ScrollReveal,
  ScrollRevealGroup,
} from "@ksu/ui/components";
import type {
  Campus,
  PublicContactDirectoryEntry,
  PublicContactFAQ,
} from "@ksu/api-client";
import { getSocialLinks, PageShell } from "@/components/site-shell";
import { PublicImage } from "@/components/public/public-image";
import { ContactMessageForm } from "@/components/public/contact-message-form";
import {
  getContactPageConfig,
  type ContactPageConfig,
  type ContactPageFilters,
  type ContactServiceChannel,
  type ContactSocialLink,
} from "@/lib/utility-page-data";

type ContactSearchParams = Record<string, string | string[] | undefined>;

const contactTypeOptions = [
  { value: "main", label: "Main office" },
  { value: "admissions", label: "Admissions" },
  { value: "academic_affairs", label: "Academic affairs" },
  { value: "finance", label: "Finance" },
  { value: "examinations", label: "Examinations" },
  { value: "support", label: "Student support" },
  { value: "student_life", label: "Student affairs" },
  { value: "ict", label: "ICT" },
  { value: "library", label: "Library" },
  { value: "research", label: "Research" },
  { value: "security", label: "Security" },
  { value: "general", label: "General" },
];

const scopeTypeOptions = [
  { value: "university", label: "University" },
  { value: "division", label: "Division" },
  { value: "directorate", label: "Directorate" },
  { value: "wing", label: "Office / wing" },
  { value: "school", label: "School" },
  { value: "department", label: "Department" },
];

const serviceIcons: Record<ContactServiceChannel["icon"], LucideIcon> = {
  ticket: TicketCheck,
  complaint: MessageSquareWarning,
  compliment: HeartHandshake,
  suggestion: Send,
  information: ClipboardList,
};

function scalarParam(value: string | string[] | undefined, max = 120) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().slice(0, max);
  return normalized || undefined;
}

function positivePage(value: string | string[] | undefined) {
  const parsed = Number.parseInt(scalarParam(value, 8) ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 10_000) : 1;
}

function contactTypeLabel(value?: string | null) {
  if (!value) return "University contact";
  return (
    contactTypeOptions.find((option) => option.value === value)?.label ??
    value.replaceAll("_", " ")
  );
}

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}

function contactLocation(contact: PublicContactDirectoryEntry) {
  return [contact.physical_address, contact.building, contact.room_number]
    .filter(Boolean)
    .join(" · ");
}

function operatingHours(value?: Record<string, unknown> | null) {
  if (!value) return null;
  const entries = Object.entries(value)
    .map(([day, hours]) => `${day}: ${String(hours)}`)
    .slice(0, 3);
  return entries.length ? entries.join(" · ") : null;
}

function ContactMethods({
  contact,
  compact = false,
}: {
  contact: PublicContactDirectoryEntry;
  compact?: boolean;
}) {
  const location = contactLocation(contact);
  const hours = operatingHours(contact.operating_hours);
  const textClass = compact ? "text-xs leading-5" : "text-sm leading-6";

  return (
    <div className={`space-y-2 text-slate-600 ${textClass}`}>
      {contact.email ? (
        <a
          href={`mailto:${contact.email}`}
          className="flex min-h-8 items-start gap-2 break-all transition hover:text-primary"
        >
          <Mail aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>{contact.email}</span>
        </a>
      ) : null}
      {contact.phone?.map((phone) => (
        <a
          key={phone}
          href={phoneHref(phone)}
          className="flex min-h-8 items-start gap-2 transition hover:text-primary"
        >
          <Phone aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            {phone}
            {contact.extension ? ` ext. ${contact.extension}` : ""}
          </span>
        </a>
      ))}
      {location ? (
        <p className="flex items-start gap-2">
          <MapPin
            aria-hidden
            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
          />
          <span>{location}</span>
        </p>
      ) : null}
      {hours ? (
        <p className="flex items-start gap-2">
          <CircleHelp
            aria-hidden
            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
          />
          <span>{hours}</span>
        </p>
      ) : null}
    </div>
  );
}

function PriorityContactCard({
  contact,
  featured = false,
}: {
  contact: PublicContactDirectoryEntry;
  featured?: boolean;
}) {
  const Icon = /security|emergency/i.test(contact.contact_type ?? "")
    ? ShieldAlert
    : /admission|academic/i.test(contact.contact_type ?? "")
      ? Landmark
      : Building2;

  return (
    <article
      className={`relative flex min-h-[190px] flex-col overflow-hidden rounded-xl border-t-2 px-5 py-5 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.45)] ${featured ? "border-secondary bg-[#052f61] text-white" : "border-primary bg-white"}`}
    >
      {featured ? (
        <Building2
          aria-hidden
          className="absolute -bottom-8 -right-7 h-40 w-40 text-white/[0.06]"
        />
      ) : null}
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
            {contactTypeLabel(contact.contact_type)}
          </p>
          <h2
            className={`mt-1 text-base font-bold ${featured ? "text-white" : "text-slate-950"}`}
          >
            {contact.name}
          </h2>
        </div>
      </div>
      <div
        className={`relative mt-4 ${featured ? "[&_a]:text-white/75 [&_p]:text-white/75 [&_svg]:text-secondary" : ""}`}
      >
        <ContactMethods contact={contact} compact />
      </div>
      <a
        href={
          contact.email
            ? `mailto:${contact.email}`
            : contact.phone?.[0]
              ? phoneHref(contact.phone[0])
              : "#directory"
        }
        className={`relative mt-auto inline-flex min-h-10 items-center gap-2 pt-4 text-sm font-semibold ${featured ? "text-white" : "text-primary"}`}
      >
        Contact office
        <ArrowRight aria-hidden className="h-4 w-4" />
      </a>
    </article>
  );
}

function DirectoryRow({
  contact,
  index,
}: {
  contact: PublicContactDirectoryEntry;
  index: number;
}) {
  const previewId = `contact-preview-${contact.id}`;
  const location = contactLocation(contact);
  const hours = operatingHours(contact.operating_hours);

  return (
    <article
      tabIndex={0}
      aria-describedby={previewId}
      className="group relative grid min-h-14 gap-3 border-b border-primary/10 bg-white px-3 py-2 outline-none transition-colors last:border-b-0 hover:bg-surface-subtle focus-visible:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center lg:grid-cols-[minmax(12rem,1.15fr)_minmax(10rem,.9fr)_minmax(8rem,.65fr)_minmax(13rem,1.2fr)_minmax(8rem,.65fr)_auto] lg:px-4"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white group-focus-within:bg-primary group-focus-within:text-white">
          <Building2 aria-hidden className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-slate-950">
            {contact.name}
          </h3>
          <p className="mt-0.5 text-xs font-medium capitalize text-slate-500">
            {contactTypeLabel(contact.contact_type)}
          </p>
        </div>
      </div>
      <span className="hidden truncate text-xs text-slate-600 lg:block">
        {contact.email ?? "—"}
      </span>
      <span className="hidden truncate text-xs text-slate-600 lg:block">
        {contact.phone?.[0] ?? "—"}
      </span>
      <span className="hidden truncate text-xs text-slate-600 lg:block">
        {location || "Location available on request"}
      </span>
      <span className="hidden truncate text-xs text-slate-600 lg:block">
        {hours || "Office hours"}
      </span>
      <div className="hidden flex-wrap gap-2 sm:flex sm:justify-end">
        {contact.email ? (
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex min-h-9 items-center gap-2 rounded-full border border-primary/20 px-3 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            <Mail aria-hidden className="h-4 w-4" /> Email
          </a>
        ) : null}
        {contact.phone?.[0] ? (
          <a
            href={phoneHref(contact.phone[0])}
            className="inline-flex min-h-9 items-center gap-2 rounded-full border border-primary/20 px-3 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            <Phone aria-hidden className="h-4 w-4" /> Call
          </a>
        ) : null}
      </div>

      <div className="mt-1 sm:hidden">
        <ContactMethods contact={contact} compact />
      </div>

      <aside
        id={previewId}
        role="tooltip"
        className={`pointer-events-none invisible absolute top-[calc(100%-0.25rem)] z-40 hidden w-[21rem] translate-y-2 rounded-2xl border border-primary/10 bg-white p-5 opacity-0 shadow-[0_24px_60px_-20px_rgba(3,24,60,.42)] transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 lg:block ${index % 2 ? "left-12" : "right-12"}`}
      >
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-[linear-gradient(90deg,hsl(var(--secondary)),hsl(var(--primary)))]" />
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-secondary">
          Office details
        </p>
        <h4 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-primary">
          {contact.name}
        </h4>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          {contactTypeLabel(contact.contact_type)}
        </p>
        <div className="mt-4 border-t border-primary/10 pt-4">
          <ContactMethods contact={contact} compact />
        </div>
      </aside>
    </article>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950 sm:text-3xl">
        {title}
      </h2>
      {body ? (
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          {body}
        </p>
      ) : null}
    </div>
  );
}

function contactPageHref(filters: ContactPageFilters, page: number) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.contactType) params.set("contact_type", filters.contactType);
  if (filters.scopeType) params.set("scope_type", filters.scopeType);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/contact?${query}` : "/contact";
}

function campusDirectionsUrl(campus?: Campus, fallback?: string | null) {
  const hasCoordinates =
    campus?.gps_latitude != null && campus?.gps_longitude != null;
  const latitude = Number(campus?.gps_latitude);
  const longitude = Number(campus?.gps_longitude);
  const validCoordinates =
    hasCoordinates &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;
  const query = validCoordinates
    ? `${latitude},${longitude}`
    : [campus?.address, campus?.city, campus?.county, fallback]
        .filter(Boolean)
        .join(", ") || "Kisii University, Kenya";
  return `https://maps.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function campusCoordinates(campus?: Campus) {
  const hasCoordinates =
    campus?.gps_latitude != null && campus?.gps_longitude != null;
  const latitude = Number(campus?.gps_latitude);
  const longitude = Number(campus?.gps_longitude);
  if (
    hasCoordinates &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  ) {
    return { latitude, longitude };
  }

  // Main-campus fallback used only while coordinates are absent from the API.
  return { latitude: -0.691306, longitude: 34.783139 };
}

function campusMapUrl(campus?: Campus) {
  const { latitude, longitude } = campusCoordinates(campus);
  return `https://www.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`;
}

function faqAnswer(faq: PublicContactFAQ) {
  return (faq.answer_plain_text ?? faq.answer_rich_text ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function SocialIcon({ link }: { link: ContactSocialLink }) {
  const icons: Record<string, LucideIcon> = {
    facebook: Facebook,
    x: AtSign,
    instagram: Instagram,
    linkedin: Linkedin,
    youtube: Youtube,
    tiktok: Music2,
    website: Globe2,
  };
  if (link.platform === "x") {
    return (
      <span
        aria-hidden
        className="font-sans text-xl font-semibold leading-none tracking-[-0.08em]"
      >
        X
      </span>
    );
  }
  const Icon = icons[link.platform] ?? Globe2;
  return <Icon aria-hidden className="h-6 w-6" strokeWidth={1.8} />;
}

function ContactHero({ config }: { config: ContactPageConfig }) {
  return (
    <CampusPageHeader
      image="main-admin"
      variant="compact"
      titleWeight="normal"
      eyebrow="Contact & directions"
      breadcrumbs={config.breadcrumb}
      title={
        <>
          How can we <em className="italic">help?</em>
        </>
      }
      description={config.body}
      actions={
        <>
          <a
            href={phoneHref(config.phone)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-bold text-foreground"
          >
            <Phone aria-hidden className="h-4 w-4" /> Call main office
          </a>
          <a
            href={`mailto:${config.email}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary"
          >
            <Mail aria-hidden className="h-4 w-4" /> Email us
          </a>
          <a
            href={campusDirectionsUrl(
              config.campuses[0],
              config.physicalAddress,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white/10 px-5 py-3 text-sm font-bold text-primary backdrop-blur-sm md:border-white/30 md:text-white"
          >
            <MapPin aria-hidden className="h-4 w-4" /> Get directions
          </a>
        </>
      }
    />
  );
}

async function LegacyContactPage({
  searchParams,
}: {
  searchParams: Promise<ContactSearchParams>;
}) {
  const params = await searchParams;
  const filters: ContactPageFilters = {
    q: scalarParam(params.q),
    contactType: scalarParam(params.contact_type, 64),
    scopeType: scalarParam(params.scope_type, 32),
    page: positivePage(params.page),
  };
  const config = await getContactPageConfig(filters);
  const featuredCampus = config.campuses[0];
  const featuredContacts = config.mainContacts.slice(0, 4);
  const pageCount = config.contactsMeta.pages;

  return (
    <PageShell>
      <ContactHero config={config} />

      <section className="border-b border-primary/10 bg-surface-subtle px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                Start here
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-normal text-primary">
                Frequently contacted offices
              </h2>
            </div>
            <a
              href="#directory"
              className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              View complete directory{" "}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </a>
          </div>
          <ScrollRevealGroup
            className="grid gap-px bg-primary/10 sm:grid-cols-2 xl:grid-cols-4"
            variant="fade-up"
            staggerDelay={80}
          >
            {featuredContacts.length ? (
              featuredContacts.map((contact) => (
                <PriorityContactCard key={contact.id} contact={contact} />
              ))
            ) : (
              <article className="bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-4">
                <h2 className="font-bold text-slate-950">
                  Main university office
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Use the official telephone and email channels while priority
                  office records are being published.
                </p>
              </article>
            )}
          </ScrollRevealGroup>
        </div>
      </section>

      <AmbientPageBackground
        as="section"
        id="directory"
        variant="academic"
        intensity="soft"
        className="px-4 py-14 sm:px-6 lg:px-8"
      >
        <div className="mx-auto w-full max-w-[1440px]">
          <ScrollReveal variant="fade-right">
            <SectionHeading
              eyebrow="Contact directory"
              title="Find the right office"
              body="Search published university contacts and narrow the directory by service or organizational owner."
            />
          </ScrollReveal>
          <form
            method="get"
            action="/contact"
            role="search"
            aria-label="Contact directory"
            className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[minmax(260px,1fr)_220px_220px_auto]"
          >
            <label className="relative block">
              <span className="sr-only">Search contacts</span>
              <Search
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                name="q"
                defaultValue={filters.q}
                placeholder="Search office, service, email, or location"
                autoComplete="off"
                spellCheck={false}
                className="h-11 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </label>
            <label>
              <span className="sr-only">Contact type</span>
              <select
                name="contact_type"
                defaultValue={filters.contactType ?? ""}
                className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                <option value="">All contact types</option>
                {contactTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Organizational owner</span>
              <select
                name="scope_type"
                defaultValue={filters.scopeType ?? ""}
                className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                <option value="">All owner types</option>
                {scopeTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Search aria-hidden className="h-4 w-4" /> Search
            </button>
          </form>

          <div
            className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600"
            aria-live="polite"
          >
            <p>
              Showing{" "}
              <strong className="text-slate-950">
                {config.contacts.length}
              </strong>{" "}
              of{" "}
              <strong className="text-slate-950">
                {config.contactsMeta.total}
              </strong>{" "}
              published contacts
            </p>
            {filters.q || filters.contactType || filters.scopeType ? (
              <Link
                href="/contact#directory"
                className="font-semibold text-primary hover:underline"
              >
                Clear filters
              </Link>
            ) : null}
          </div>

          <ScrollRevealGroup
            className="relative mt-4 border-y border-primary/15 bg-white shadow-sm [&>div]:relative [&>div:hover]:z-30 [&>div:focus-within]:z-30"
            staggerDelay={65}
          >
            {config.contacts.length ? (
              config.contacts.map((contact, index) => (
                <DirectoryRow
                  key={contact.id}
                  contact={contact}
                  index={index}
                />
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <CircleHelp
                  aria-hidden
                  className="mx-auto h-9 w-9 text-slate-400"
                />
                <h3 className="mt-4 font-bold text-slate-950">
                  No matching contacts
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Try a broader search or clear the selected filters.
                </p>
              </div>
            )}
          </ScrollRevealGroup>

          {pageCount > 1 ? (
            <nav
              aria-label="Contact directory pagination"
              className="mt-5 flex items-center justify-between gap-3"
            >
              {config.contactsMeta.page > 1 ? (
                <Link
                  href={contactPageHref(filters, config.contactsMeta.page - 1)}
                  className="inline-flex min-h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-primary hover:border-primary/30"
                >
                  Previous
                </Link>
              ) : (
                <span />
              )}
              <p className="text-sm text-slate-600">
                Page {config.contactsMeta.page} of {pageCount}
              </p>
              {config.contactsMeta.page < pageCount ? (
                <Link
                  href={contactPageHref(filters, config.contactsMeta.page + 1)}
                  className="inline-flex min-h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-primary hover:border-primary/30"
                >
                  Next
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </div>
      </AmbientPageBackground>

      <section className="border-y border-slate-200 bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-[1440px] gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeading
              eyebrow="Digital support"
              title="Service channels"
              body="Use the official digital channels for support, feedback, and information requests."
            />
            <div className="mt-6 divide-y divide-slate-200">
              {config.serviceChannels.map((channel) => {
                const Icon = serviceIcons[channel.icon];
                return (
                  <a
                    key={channel.title}
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group grid min-h-20 grid-cols-[40px_minmax(0,1fr)_20px] items-center gap-3 py-3"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-slate-950">
                        {channel.title}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-600">
                        {channel.body}
                      </span>
                    </span>
                    <ArrowRight
                      aria-hidden
                      className="h-4 w-4 text-primary transition group-hover:translate-x-1"
                    />
                  </a>
                );
              })}
            </div>
          </article>

          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative min-h-[360px] bg-slate-100">
              <iframe
                title="Map showing Kisii University Main Campus"
                src={campusMapUrl(featuredCampus)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
            <div className="grid gap-6 p-6 md:grid-cols-[1fr_1.15fr] lg:p-8">
              <div>
                <SectionHeading eyebrow="Visit us" title="Main Campus" />
                <address className="mt-4 not-italic text-sm leading-7 text-slate-600">
                  <strong className="block text-slate-950">
                    {featuredCampus?.name ??
                      config.institution?.name ??
                      "Kisii University"}
                  </strong>
                  {[
                    featuredCampus?.address,
                    featuredCampus?.city,
                    featuredCampus?.county,
                    featuredCampus?.postal_code,
                  ]
                    .filter(Boolean)
                    .join(", ") || config.postalAddress}
                </address>
                <a
                  href={campusDirectionsUrl(
                    featuredCampus,
                    config.physicalAddress,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary/90"
                >
                  Start navigation{" "}
                  <ExternalLink aria-hidden className="h-4 w-4" />
                </a>
              </div>
              <div className="border-t border-slate-200 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                  Getting here
                </p>
                <div className="mt-4 space-y-4">
                  <div className="flex gap-3">
                    <Car
                      aria-hidden
                      className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    />
                    <p className="text-sm leading-6 text-slate-600">
                      <strong className="block text-slate-950">
                        Driving from Kisii town
                      </strong>
                      Follow the Kisii–Kilgoris Road toward the university. Main
                      Campus is approximately 2 km from the town centre.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <BusFront
                      aria-hidden
                      className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    />
                    <p className="text-sm leading-6 text-slate-600">
                      <strong className="block text-slate-950">
                        Public transport
                      </strong>
                      Ask for the Kisii University Main Campus stop on the
                      Kisii–Kilgoris route, then use the main gate for visitor
                      access.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <MapPin
                      aria-hidden
                      className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    />
                    <p className="text-sm leading-6 text-slate-600">
                      <strong className="block text-slate-950">
                        On arrival
                      </strong>
                      Check in at the main gate and ask security for the
                      building or office shown in the contact directory.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {config.campuses.length ? (
        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1440px]">
            <SectionHeading
              eyebrow="Locations"
              title="Our campuses"
              body="Use published campus contact and direction details when planning your visit."
            />
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {config.campuses.map((campus) => (
                <article
                  key={campus.id}
                  className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                >
                  <PublicImage
                    src={config.heroImageUrl}
                    fallbackSrc="/images/about/about-overview.webp"
                    alt="Kisii University leadership portrait"
                    ratio="news"
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                  />
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                      {campus.campus_type.replaceAll("_", " ")}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-slate-950">
                      {campus.name}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {[campus.address, campus.city, campus.county]
                        .filter(Boolean)
                        .join(", ") ||
                        "Campus location details are being updated."}
                    </p>
                    <a
                      href={campusDirectionsUrl(campus)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary"
                    >
                      View directions{" "}
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {config.faqs.length ? (
        <section className="border-y border-slate-200 bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-4xl">
            <SectionHeading
              eyebrow="Helpful answers"
              title="Frequently asked contact questions"
              body="Review answers published by the university before contacting an office."
            />
            <div className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              {config.faqs.map((faq) => (
                <details key={faq.id} className="group px-5 py-1">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm font-semibold text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    {faq.question}
                    <ChevronDown
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-primary transition group-open:rotate-180"
                    />
                  </summary>
                  <p className="pb-5 text-sm leading-7 text-slate-600">
                    {faqAnswer(faq) ||
                      "Please contact the relevant office for current guidance."}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <AmbientPageBackground
        as="section"
        variant="poster"
        intensity="medium"
        plateImage={config.heroImageUrl}
        className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="mx-auto grid w-full max-w-[1440px] overflow-hidden bg-primary shadow-2xl lg:grid-cols-[.72fr_1.28fr]">
          <ScrollReveal
            variant="fade-right"
            className="relative flex min-h-[320px] flex-col justify-between overflow-hidden border-b border-white/10 p-7 text-white sm:p-10 lg:min-h-[620px] lg:border-b-0 lg:border-r"
          >
            <div
              aria-hidden
              className="absolute -left-24 -top-24 h-72 w-72 rounded-full border-[42px] border-secondary/20"
            />
            <div
              aria-hidden
              className="absolute -bottom-28 -right-24 h-80 w-80 rotate-12 border border-white/10"
            />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                Write to us
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-normal leading-tight sm:text-5xl">
                Send a message. <em className="italic">We’ll route it.</em>
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
                Tell us what you need and your enquiry will be recorded and
                directed to the responsible university team.
              </p>
            </div>
            <div className="relative mt-10 border-t border-white/15 pt-6 text-sm leading-6 text-white/65">
              <p className="font-bold text-white">Prefer a direct channel?</p>
              <a
                href={`mailto:${config.email}`}
                className="mt-2 block hover:text-secondary"
              >
                {config.email}
              </a>
              <a
                href={phoneHref(config.phone)}
                className="mt-1 block hover:text-secondary"
              >
                {config.phone}
              </a>
            </div>
          </ScrollReveal>
          <ScrollReveal
            variant="fade-left"
            className="bg-[#071d3d] p-7 sm:p-10 lg:p-12"
          >
            <ContactMessageForm universitySlug="kisii-university" />
          </ScrollReveal>
        </div>
      </AmbientPageBackground>

      {config.socialLinks.length ? (
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 rounded-lg bg-primary px-6 py-8 text-white lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                Official channels
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                Connect with Kisii University
              </h2>
              <p className="mt-2 text-sm text-white/75">
                Follow verified university channels for notices, events, and
                community updates.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {config.socialLinks.map((link) => (
                <a
                  key={`${link.platform}-${link.href}`}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Kisii University on ${link.label}`}
                  className="inline-flex min-h-11 items-center gap-2.5 px-1 text-sm font-semibold text-white transition hover:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <SocialIcon link={link} /> {link.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<ContactSearchParams>;
}) {
  const params = await searchParams;
  const filters: ContactPageFilters = {
    q: scalarParam(params.q),
    contactType: scalarParam(params.contact_type, 64),
    scopeType: scalarParam(params.scope_type, 32),
    page: positivePage(params.page),
  };
  const [config, footerSocialLinks] = await Promise.all([
    getContactPageConfig(filters),
    getSocialLinks(),
  ]);
  const featuredCampus = config.campuses[0];
  const pageCount = config.contactsMeta.pages;
  const seenContacts = new Set<string>();
  const featuredContacts = [...config.mainContacts, ...config.contacts]
    .filter((contact) => {
      if (seenContacts.has(contact.id)) return false;
      seenContacts.add(contact.id);
      return true;
    })
    .slice(0, 3);
  const officialSocialLinks: ContactSocialLink[] = [
    {
      platform: "facebook",
      label: "Facebook",
      href: footerSocialLinks.facebook,
    },
    { platform: "x", label: "X / Twitter", href: footerSocialLinks.twitter },
    {
      platform: "instagram",
      label: "Instagram",
      href: footerSocialLinks.instagram,
    },
    { platform: "youtube", label: "YouTube", href: footerSocialLinks.youtube },
    {
      platform: "linkedin",
      label: "LinkedIn",
      href: footerSocialLinks.linkedin,
    },
  ];

  return (
    <PageShell>
      <ContactHero config={config} />

      <AmbientPageBackground
        as="section"
        variant="academic"
        intensity="soft"
        className="px-4 py-6 sm:px-6 lg:px-8"
      >
        <div className="mx-auto w-full max-w-[1440px]">
          <ScrollReveal className="flex items-center gap-3">
            <span aria-hidden className="h-0.5 w-7 bg-secondary" />
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-primary">
              Frequently contacted offices
            </h2>
          </ScrollReveal>
          <ScrollRevealGroup
            className="mt-4 grid gap-4 lg:grid-cols-[1.18fr_.9fr_.9fr]"
            staggerDelay={70}
          >
            {featuredContacts.map((contact, index) => (
              <PriorityContactCard
                key={contact.id}
                contact={contact}
                featured={index === 0}
              />
            ))}
          </ScrollRevealGroup>

          <div id="directory" className="mt-5 border-t border-primary/10 pt-4">
            <div className="grid gap-3 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-end">
              <div>
                <div className="flex items-center gap-3">
                  <span aria-hidden className="h-0.5 w-7 bg-secondary" />
                  <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-primary">
                    Find the right office
                  </h2>
                </div>
                <p className="mt-1 pl-10 text-xs text-muted-foreground">
                  Search offices, services or locations.
                </p>
              </div>
              <form
                method="get"
                action="/contact"
                role="search"
                aria-label="Contact directory"
                className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_180px_180px_auto]"
              >
                <label className="relative block">
                  <span className="sr-only">Search contacts</span>
                  <Search
                    aria-hidden
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="search"
                    name="q"
                    defaultValue={filters.q}
                    placeholder="Search office, service, email, or location"
                    className="h-10 w-full rounded-md border border-primary/15 bg-white pl-9 pr-3 text-xs outline-none focus:border-primary"
                  />
                </label>
                <select
                  name="contact_type"
                  aria-label="Contact type"
                  defaultValue={filters.contactType ?? ""}
                  className="h-10 rounded-md border border-primary/15 bg-white px-3 text-xs outline-none focus:border-primary"
                >
                  <option value="">All contact types</option>
                  {contactTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  name="scope_type"
                  aria-label="Organizational owner"
                  defaultValue={filters.scopeType ?? ""}
                  className="h-10 rounded-md border border-primary/15 bg-white px-3 text-xs outline-none focus:border-primary"
                >
                  <option value="">All owner types</option>
                  {scopeTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-xs font-bold text-white"
                >
                  <Search aria-hidden className="h-4 w-4" /> Search
                </button>
              </form>
            </div>

            <ScrollRevealGroup
              className="relative mt-3 border-y border-primary/15 bg-white shadow-sm [&>div]:relative [&>div:hover]:z-30 [&>div:focus-within]:z-30"
              staggerDelay={45}
            >
              {config.contacts.length ? (
                config.contacts.map((contact, index) => (
                  <DirectoryRow
                    key={contact.id}
                    contact={contact}
                    index={index}
                  />
                ))
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No matching contacts. Try a broader search.
                </div>
              )}
            </ScrollRevealGroup>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Showing {config.contacts.length} of {config.contactsMeta.total}{" "}
                contacts
              </span>
              {pageCount > 1 ? (
                <nav
                  className="flex items-center gap-4"
                  aria-label="Contact pages"
                >
                  {config.contactsMeta.page > 1 ? (
                    <Link
                      href={contactPageHref(
                        filters,
                        config.contactsMeta.page - 1,
                      )}
                      className="font-bold text-primary"
                    >
                      Previous
                    </Link>
                  ) : null}
                  <span>
                    Page {config.contactsMeta.page} of {pageCount}
                  </span>
                  {config.contactsMeta.page < pageCount ? (
                    <Link
                      href={contactPageHref(
                        filters,
                        config.contactsMeta.page + 1,
                      )}
                      className="font-bold text-primary"
                    >
                      Next
                    </Link>
                  ) : null}
                </nav>
              ) : null}
            </div>
          </div>
        </div>
      </AmbientPageBackground>

      <ScrollReveal as="section" className="bg-[#052f61] text-white">
        <div className="mx-auto grid min-h-[205px] w-full max-w-[1440px] lg:grid-cols-[.78fr_1fr_1.05fr]">
          <div className="p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <span className="h-0.5 w-7 bg-secondary" />
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
                Visit Main Campus
              </h2>
            </div>
            <div className="mt-5 space-y-4 text-xs text-white/75">
              <p className="flex gap-3">
                <Car className="h-4 w-4 text-secondary" />
                <span>
                  <strong className="block text-white">
                    Driving from Kisii town
                  </strong>
                  Follow Kisii–Kilgoris Road toward the university.
                </span>
              </p>
              <p className="flex gap-3">
                <BusFront className="h-4 w-4 text-secondary" />
                <span>
                  <strong className="block text-white">Public transport</strong>
                  Ask for the Main Campus stop.
                </span>
              </p>
              <p className="flex gap-3">
                <MapPin className="h-4 w-4 text-secondary" />
                <span>
                  <strong className="block text-white">On arrival</strong>Check
                  in at the main gate for directions.
                </span>
              </p>
            </div>
          </div>
          <div className="relative min-h-[190px] overflow-hidden">
            <PublicImage
              src="/images/about-us/gate-1.jpg"
              fallbackSrc="/images/headers/main-admin.jpg"
              alt="Kisii University Main Campus"
              ratio="fill"
              className="absolute inset-0 h-full w-full"
              imageClassName="object-cover"
              sizes="40vw"
            />
          </div>
          <div className="grid min-h-[205px] grid-rows-[1fr_auto] bg-white text-foreground">
            <div className="relative min-h-[120px]">
              <iframe
                title="Map showing Kisii University Main Campus"
                src={campusMapUrl(featuredCampus)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
            <div className="flex items-center justify-between gap-4 p-4">
              <address className="not-italic text-xs leading-5 text-muted-foreground">
                <strong className="block text-primary">
                  Central Administration Building
                </strong>
                {featuredCampus?.address ?? config.physicalAddress}
              </address>
              <a
                href={campusDirectionsUrl(
                  featuredCampus,
                  config.physicalAddress,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md border border-primary/20 px-4 text-xs font-bold text-primary"
              >
                Open in Google Maps <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <section className="border-b border-primary/10 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-[1440px] divide-y divide-primary/10 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          <ScrollReveal className="px-0 pb-6 lg:px-6 lg:pb-0">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-0.5 w-6 bg-secondary" />
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-primary">
                Send us a message
              </h2>
            </div>
            <ContactMessageForm universitySlug="kisii-university" compact />
          </ScrollReveal>
          <ScrollReveal className="px-0 py-6 lg:px-6 lg:py-0" delay={80}>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-0.5 w-6 bg-secondary" />
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-primary">
                Service channels
              </h2>
            </div>
            <div className="divide-y divide-primary/10">
              {config.serviceChannels.map((channel) => {
                const Icon = serviceIcons[channel.icon];
                return (
                  <a
                    key={channel.title}
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-h-10 items-center gap-3 py-1.5 text-xs font-bold text-foreground"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="flex-1">{channel.title}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-primary transition group-hover:translate-x-1" />
                  </a>
                );
              })}
            </div>
          </ScrollReveal>
          <ScrollReveal className="px-0 pt-6 lg:px-6 lg:pt-0" delay={160}>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-0.5 w-6 bg-secondary" />
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-primary">
                Official channels
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {officialSocialLinks.map((link) => (
                <a
                  key={`${link.platform}-${link.href}`}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-10 items-center gap-3 text-xs font-bold text-foreground hover:text-primary"
                >
                  <span className="text-primary">
                    <SocialIcon link={link} />
                  </span>
                  {link.label}
                </a>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="bg-surface-subtle px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-[1440px] gap-4 lg:grid-cols-2">
          <ScrollReveal className="border border-primary/10 bg-white p-5">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-primary">
              Our campuses
            </h2>
            {featuredCampus ? (
              <div className="mt-3 grid grid-cols-[150px_1fr] gap-4">
                <PublicImage
                  src="/images/about-us/gate-1.jpg"
                  fallbackSrc="/images/headers/main-admin.jpg"
                  alt="Kisii University leadership portrait"
                  ratio="news"
                  sizes="150px"
                  className="rounded-md"
                />
                <div className="text-xs leading-5 text-muted-foreground">
                  <strong className="block text-sm text-primary">
                    {featuredCampus.name}
                  </strong>
                  <p className="mt-1">
                    {[
                      featuredCampus.address,
                      featuredCampus.city,
                      featuredCampus.county,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <a
                    href={campusDirectionsUrl(featuredCampus)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 font-bold text-primary"
                  >
                    View directions <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ) : null}
          </ScrollReveal>
          <ScrollReveal
            className="border border-primary/10 bg-white p-5"
            delay={80}
          >
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-primary">
              Helpful answers
            </h2>
            <div className="mt-2 divide-y divide-primary/10">
              {config.faqs.slice(0, 5).map((faq) => (
                <details key={faq.id} className="group">
                  <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold text-foreground">
                    {faq.question}
                    <ChevronDown className="h-3.5 w-3.5 text-primary group-open:rotate-180" />
                  </summary>
                  <p className="pb-3 text-xs leading-5 text-muted-foreground">
                    {faqAnswer(faq)}
                  </p>
                </details>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PageShell>
  );
}
