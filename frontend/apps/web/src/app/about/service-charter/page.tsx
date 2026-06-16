import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Landmark,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { ScrollReveal } from "@ksu/ui/components";
import { PublicImage } from "@/components/public/public-image";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import {
  getServiceCharterOverviewData,
  serviceCharterUrl,
} from "@/lib/about-data";

function present(value?: string | number | null) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

function compactAddress(values: Array<string | null | undefined>) {
  return values.map(present).filter(Boolean).join(", ");
}

export default async function ServiceCharterPage() {
  const overview = await getServiceCharterOverviewData();
  const contacts = [
    {
      label: "Phone",
      value: present(overview.phone),
      href: overview.phone ? `tel:${overview.phone}` : undefined,
      icon: Phone,
    },
    {
      label: "Email",
      value: present(overview.email),
      href: overview.email ? `mailto:${overview.email}` : undefined,
      icon: Mail,
    },
    {
      label: "Postal Address",
      value: present(overview.postal_address),
      icon: Landmark,
    },
    {
      label: "Location",
      value: compactAddress([
        overview.physical_address,
        overview.city,
        overview.county,
        overview.country,
      ]),
      icon: MapPin,
    },
  ].filter((item) => item.value);

  const commitments = [
    {
      title: "Service standards",
      body: "The charter communicates the standards students, staff, partners, and the public should expect from university service points.",
      icon: ClipboardCheck,
    },
    {
      title: "Public accountability",
      body: "Service commitments give users a clear reference when seeking information, support, or follow-up from the institution.",
      icon: ShieldCheck,
    },
    {
      title: "Administrative access",
      body: "Administration offices and departments remain the operational route for specific services and response channels.",
      icon: Building2,
    },
  ];

  const serviceFlow = [
    "Identify the service you need",
    "Use the charter to confirm the expected standard",
    "Contact the responsible office or service desk",
    "Follow up through administration where escalation is needed",
  ];

  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_46%,#eef4ff_100%)] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="relative w-full">
          <BreadcrumbTrail
            items={[
              { label: "Home", href: "/" },
              { label: "About", href: "/about" },
              { label: "Service Charter" },
            ]}
          />

          <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.45)]">
              <div className="grid h-full gap-0 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
                  <p className="text-sm font-semibold uppercase text-secondary">
                    Service Charter
                  </p>
                  <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] text-slate-950 sm:text-5xl xl:text-6xl">
                    Service commitments and accountability
                  </h1>
                  <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                    The service charter sets out the standards, access points,
                    and accountability expectations that guide public service at
                    {` ${overview.name || "Kisii University"}`}.
                  </p>
                  {overview.charter_summary ? (
                    <p className="mt-5 max-w-3xl rounded-[1.25rem] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                      {overview.charter_summary}
                    </p>
                  ) : null}
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <a
                      href={serviceCharterUrl}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                    >
                      Open service charter
                      <ExternalLink aria-hidden className="h-4 w-4" />
                    </a>
                    <Link
                      href="/administration"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/25 bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
                    >
                      See administration
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <div className="border-t border-slate-200 bg-slate-950 p-4 xl:border-l xl:border-t-0">
                  <PublicImage
                    src="/images/about/about-service-charter-branded.webp"
                    alt="University service desk staff assisting students with public service information"
                    ratio="profile"
                    priority
                    sizes="(min-width: 1280px) 320px, (min-width: 1024px) 30vw, 100vw"
                    className="h-full min-h-[320px] rounded-[1.5rem]"
                  />
                </div>
              </div>
            </div>

            <aside className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_70px_-44px_rgba(15,23,42,0.72)]">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-secondary ring-1 ring-white/10">
                <FileText aria-hidden className="h-5 w-5" />
              </span>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                How to use the charter
              </p>
              <div className="mt-5 space-y-4">
                {serviceFlow.map((item, index) => (
                  <div key={item} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white ring-1 ring-white/10">
                      {index + 1}
                    </span>
                    <p className="pt-1 text-sm leading-6 text-white/75">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <ScrollReveal
        as="section"
        className="border-b border-slate-200 bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-16"
      >
        <div className="grid w-full gap-5 md:grid-cols-3">
          {commitments.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-slate-200">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <h2 className="mt-6 text-xl font-semibold text-slate-950">
                  {item.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {item.body}
                </p>
              </article>
            );
          })}
        </div>
      </ScrollReveal>

      <ScrollReveal
        as="section"
        className="bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-14 sm:px-6 lg:px-8 lg:py-16"
      >
        <div className="grid w-full gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase text-secondary">
              Contact and Access
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
              Use official university contacts for service follow-up
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              The contact details below come from the public university
              information record. Specific offices and departments provide more
              detailed service routes where available.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {contacts.map((item) => {
              const Icon = item.icon;
              const body = (
                <>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <span className="mt-5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {item.label}
                  </span>
                  <span className="mt-2 block text-base font-semibold leading-7 text-slate-950">
                    {item.value}
                  </span>
                </>
              );

              return item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:bg-slate-50"
                >
                  {body}
                </a>
              ) : (
                <article
                  key={item.label}
                  className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  {body}
                </article>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal as="section" className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-[0_28px_80px_-44px_rgba(15,23,42,0.7)] lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="border-b border-white/10 bg-white/[0.04] p-7 sm:p-8 lg:border-b-0 lg:border-r">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-secondary ring-1 ring-white/10">
              <CheckCircle2 aria-hidden className="h-5 w-5" />
            </span>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight">
              Related accountability pages
            </h2>
          </div>

          <div className="grid gap-0 md:grid-cols-3">
            {[
              {
                title: "Quality Assurance",
                href: "/about/quality-assurance",
                body: "Standards, quality references, and accountability context.",
              },
              {
                title: "Governance",
                href: "/about/governance",
                body: "Council oversight and institutional stewardship.",
              },
              {
                title: "Administration",
                href: "/administration",
                body: "Divisions, units, directorates, and service pathways.",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group border-b border-white/10 p-7 transition hover:bg-white/[0.04] md:border-r md:last:border-r-0"
              >
                <h3 className="text-xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/65">
                  {item.body}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-secondary">
                  Open page
                  <ArrowRight
                    aria-hidden
                    className="h-4 w-4 transition group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </PageShell>
  );
}
