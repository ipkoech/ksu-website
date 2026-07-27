import Link from "next/link";
import {
  ArrowRight,
  AtSign,
  Building2,
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
import type {
  Campus,
  PublicContactDirectoryEntry,
  PublicContactFAQ,
} from "@ksu/api-client";
import { PageShell } from "@/components/site-shell";
import { PublicImage } from "@/components/public/public-image";
import {
  getContactPageConfig,
  type ContactPageConfig,
  type ContactPageFilters,
  type ContactServiceChannel,
  type ContactSocialLink,
} from "@/lib/utility-page-data";
import { publicFileUrl } from "@/lib/public-media";

type ContactSearchParams = Record<
  string,
  string | string[] | undefined
>;

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
          <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>{location}</span>
        </p>
      ) : null}
      {hours ? (
        <p className="flex items-start gap-2">
          <CircleHelp aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>{hours}</span>
        </p>
      ) : null}
    </div>
  );
}

function PriorityContactCard({
  contact,
}: {
  contact: PublicContactDirectoryEntry;
}) {
  const Icon = /security|emergency/i.test(contact.contact_type ?? "")
    ? ShieldAlert
    : /admission|academic/i.test(contact.contact_type ?? "")
      ? Landmark
      : Building2;

  return (
    <article className="flex min-h-[250px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.45)]">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
            {contactTypeLabel(contact.contact_type)}
          </p>
          <h2 className="mt-1 text-base font-bold text-slate-950">
            {contact.name}
          </h2>
        </div>
      </div>
      <div className="mt-5">
        <ContactMethods contact={contact} compact />
      </div>
      <a
        href={contact.email ? `mailto:${contact.email}` : contact.phone?.[0] ? phoneHref(contact.phone[0]) : "#directory"}
        className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-semibold text-primary"
      >
        Contact office
        <ArrowRight aria-hidden className="h-4 w-4" />
      </a>
    </article>
  );
}

function DirectoryRow({ contact }: { contact: PublicContactDirectoryEntry }) {
  return (
    <article className="grid gap-4 border-b border-slate-200 px-4 py-5 last:border-b-0 sm:px-5 lg:grid-cols-[minmax(180px,0.8fr)_minmax(260px,1.35fr)_auto] lg:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Building2 aria-hidden className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-950">{contact.name}</h3>
          <p className="mt-1 text-xs font-medium capitalize text-slate-500">
            {contactTypeLabel(contact.contact_type)}
          </p>
        </div>
      </div>
      <ContactMethods contact={contact} compact />
      <div className="flex flex-wrap gap-2 lg:justify-end">
        {contact.email ? (
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-primary/25 px-3 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            <Mail aria-hidden className="h-4 w-4" /> Email
          </a>
        ) : null}
        {contact.phone?.[0] ? (
          <a
            href={phoneHref(contact.phone[0])}
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-primary/25 px-3 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            <Phone aria-hidden className="h-4 w-4" /> Call
          </a>
        ) : null}
      </div>
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
      {body ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{body}</p> : null}
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
  const latitude = Number(campus?.gps_latitude);
  const longitude = Number(campus?.gps_longitude);
  const validCoordinates =
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
  const Icon = icons[link.platform] ?? Globe2;
  return <Icon aria-hidden className="h-5 w-5" />;
}

function ContactHero({ config }: { config: ContactPageConfig }) {
  return (
    <section className="relative min-h-[430px] overflow-hidden bg-slate-950 text-white">
      <PublicImage
        src={config.heroImageUrl}
        fallbackSrc="/images/about/about-overview.webp"
        alt="Kisii University campus"
        ratio="fill"
        priority
        sizes="100vw"
        className="absolute inset-0 h-full w-full"
        imageClassName="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,44,27,0.94)_0%,rgba(2,44,27,0.76)_52%,rgba(2,44,27,0.35)_100%)]" />
      <div className="relative mx-auto flex min-h-[430px] w-full max-w-[1440px] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-white/75">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="inline-flex min-h-10 items-center hover:text-white">Home</Link></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-white">Contact</li>
          </ol>
        </nav>
        <p className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
          University contacts
        </p>
        <h1 className="mt-3 max-w-4xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
          {config.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
          {config.body}
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a href={phoneHref(config.phone)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90">
            <Phone aria-hidden className="h-4 w-4" /> Call main office
          </a>
          <a href={`mailto:${config.email}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
            <Mail aria-hidden className="h-4 w-4" /> Email the university
          </a>
          <a href={campusDirectionsUrl(config.campuses[0], config.physicalAddress)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/45 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">
            <MapPin aria-hidden className="h-4 w-4" /> Get directions
          </a>
        </div>
      </div>
    </section>
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
  const config = await getContactPageConfig(filters);
  const featuredCampus = config.campuses[0];
  const featuredContacts = config.mainContacts.slice(0, 4);
  const pageCount = config.contactsMeta.pages;

  return (
    <PageShell>
      <ContactHero config={config} />

      <div className="relative z-10 mx-auto -mt-12 w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <p className="sr-only">Priority contacts</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featuredContacts.length ? (
            featuredContacts.map((contact) => (
              <PriorityContactCard key={contact.id} contact={contact} />
            ))
          ) : (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-4">
              <h2 className="font-bold text-slate-950">Main university office</h2>
              <p className="mt-2 text-sm text-slate-600">Use the official telephone and email channels while priority office records are being published.</p>
            </article>
          )}
        </div>
      </div>

      <section id="directory" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1440px]">
          <SectionHeading
            eyebrow="Contact directory"
            title="Find the right office"
            body="Search published university contacts and narrow the directory by service or organizational owner."
          />
          <form
            method="get"
            action="/contact"
            role="search"
            aria-label="Contact directory"
            className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[minmax(260px,1fr)_220px_220px_auto]"
          >
            <label className="relative block">
              <span className="sr-only">Search contacts</span>
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
              <select name="contact_type" defaultValue={filters.contactType ?? ""} className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10">
                <option value="">All contact types</option>
                {contactTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Organizational owner</span>
              <select name="scope_type" defaultValue={filters.scopeType ?? ""} className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10">
                <option value="">All owner types</option>
                {scopeTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              <Search aria-hidden className="h-4 w-4" /> Search
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600" aria-live="polite">
            <p>
              Showing <strong className="text-slate-950">{config.contacts.length}</strong> of <strong className="text-slate-950">{config.contactsMeta.total}</strong> published contacts
            </p>
            {filters.q || filters.contactType || filters.scopeType ? (
              <Link href="/contact#directory" className="font-semibold text-primary hover:underline">Clear filters</Link>
            ) : null}
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {config.contacts.length ? (
              config.contacts.map((contact) => <DirectoryRow key={contact.id} contact={contact} />)
            ) : (
              <div className="px-6 py-12 text-center">
                <CircleHelp aria-hidden className="mx-auto h-9 w-9 text-slate-400" />
                <h3 className="mt-4 font-bold text-slate-950">No matching contacts</h3>
                <p className="mt-2 text-sm text-slate-600">Try a broader search or clear the selected filters.</p>
              </div>
            )}
          </div>

          {pageCount > 1 ? (
            <nav aria-label="Contact directory pagination" className="mt-5 flex items-center justify-between gap-3">
              {config.contactsMeta.page > 1 ? (
                <Link href={contactPageHref(filters, config.contactsMeta.page - 1)} className="inline-flex min-h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-primary hover:border-primary/30">Previous</Link>
              ) : <span />}
              <p className="text-sm text-slate-600">Page {config.contactsMeta.page} of {pageCount}</p>
              {config.contactsMeta.page < pageCount ? (
                <Link href={contactPageHref(filters, config.contactsMeta.page + 1)} className="inline-flex min-h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-primary hover:border-primary/30">Next</Link>
              ) : <span />}
            </nav>
          ) : null}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-[1440px] gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeading eyebrow="Digital support" title="Service channels" body="Use the official digital channels for support, feedback, and information requests." />
            <div className="mt-6 divide-y divide-slate-200">
              {config.serviceChannels.map((channel) => {
                const Icon = serviceIcons[channel.icon];
                return (
                  <a key={channel.title} href={channel.href} target="_blank" rel="noopener noreferrer" className="group grid min-h-20 grid-cols-[40px_minmax(0,1fr)_20px] items-center gap-3 py-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden className="h-5 w-5" /></span>
                    <span><span className="block text-sm font-bold text-slate-950">{channel.title}</span><span className="mt-1 block text-xs leading-5 text-slate-600">{channel.body}</span></span>
                    <ArrowRight aria-hidden className="h-4 w-4 text-primary transition group-hover:translate-x-1" />
                  </a>
                );
              })}
            </div>
          </article>

          <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="grid min-h-full md:grid-cols-[1.15fr_0.85fr]">
              <div className="relative min-h-[300px] overflow-hidden bg-[linear-gradient(135deg,#dbeafe_0%,#ecfdf5_100%)] p-6">
                <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(15,118,110,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(15,118,110,0.14)_1px,transparent_1px)] [background-size:32px_32px]" />
                <div className="relative flex h-full flex-col items-center justify-center text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg"><MapPin aria-hidden className="h-8 w-8" /></span>
                  <p className="mt-4 text-lg font-bold text-slate-950">{featuredCampus?.name ?? "Kisii University"}</p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">{[featuredCampus?.address, featuredCampus?.city, featuredCampus?.county].filter(Boolean).join(", ") || config.physicalAddress || config.postalAddress}</p>
                </div>
              </div>
              <div className="flex flex-col p-5">
                <SectionHeading eyebrow="Visit us" title="Campus location & directions" />
                <address className="mt-5 not-italic text-sm leading-7 text-slate-600">
                  <strong className="block text-slate-950">{featuredCampus?.name ?? config.institution?.name ?? "Kisii University"}</strong>
                  {[featuredCampus?.address, featuredCampus?.city, featuredCampus?.county, featuredCampus?.postal_code].filter(Boolean).join(", ") || config.postalAddress}
                </address>
                <a href={campusDirectionsUrl(featuredCampus, config.physicalAddress)} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90">
                  <MapPin aria-hidden className="h-4 w-4" /> Open in Google Maps <ExternalLink aria-hidden className="h-4 w-4" />
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>

      {config.campuses.length ? (
        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1440px]">
            <SectionHeading eyebrow="Locations" title="Our campuses" body="Use published campus contact and direction details when planning your visit." />
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {config.campuses.map((campus) => (
                <article key={campus.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                  <PublicImage src={publicFileUrl(campus.cover_image_id)} fallbackSrc="/images/about/about-overview.webp" alt={`${campus.name} campus`} ratio="news" sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" />
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">{campus.campus_type.replaceAll("_", " ")}</p>
                    <h3 className="mt-2 text-lg font-bold text-slate-950">{campus.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{[campus.address, campus.city, campus.county].filter(Boolean).join(", ") || "Campus location details are being updated."}</p>
                    <a href={campusDirectionsUrl(campus)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary">View directions <ArrowRight aria-hidden className="h-4 w-4" /></a>
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
            <SectionHeading eyebrow="Helpful answers" title="Frequently asked contact questions" body="Review answers published by the university before contacting an office." />
            <div className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              {config.faqs.map((faq) => (
                <details key={faq.id} className="group px-5 py-1">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm font-semibold text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    {faq.question}<ChevronDown aria-hidden className="h-4 w-4 shrink-0 text-primary transition group-open:rotate-180" />
                  </summary>
                  <p className="pb-5 text-sm leading-7 text-slate-600">{faqAnswer(faq) || "Please contact the relevant office for current guidance."}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {config.socialLinks.length ? (
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 rounded-lg bg-primary px-6 py-8 text-white lg:flex-row lg:items-center lg:justify-between">
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Official channels</p><h2 className="mt-2 text-2xl font-bold">Connect with Kisii University</h2><p className="mt-2 text-sm text-white/75">Follow verified university channels for notices, events, and community updates.</p></div>
            <div className="flex flex-wrap gap-3">
              {config.socialLinks.map((link) => (
                <a key={`${link.platform}-${link.href}`} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`Kisii University on ${link.label}`} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 text-sm font-semibold transition hover:bg-white/20">
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
