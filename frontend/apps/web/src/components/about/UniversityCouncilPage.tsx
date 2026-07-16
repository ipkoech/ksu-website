import Link from "next/link";
import { Download, Landmark } from "lucide-react";
import { PublicImage } from "@/components/public/public-image";
import type { UniversityCouncilPageData } from "@/lib/about-data";
import { UniversityCouncilCard } from "./UniversityCouncilCard";
import { AboutReveal } from "./about-reveal";

function text(value?: string | null, fallback = "") {
  const trimmed = value?.trim();
  return trimmed && trimmed.length ? trimmed : fallback;
}

function safeCouncilCtaHref(value?: string | null) {
  const href = value?.trim();
  if (!href) return null;
  if (href.startsWith("/") && !href.startsWith("//")) return href;

  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function MemberGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white px-4 py-5 sm:px-6 lg:px-8" aria-label={title}>
      <AboutReveal className="mx-auto w-full">
        <div className="mb-4 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase text-primary">
            {title}
          </h2>
          <div className="mx-auto mt-2 h-0.5 w-10 bg-secondary" />
          <p className="sr-only">
            {description}
          </p>
        </div>
        {children}
      </AboutReveal>
    </section>
  );
}

export function UniversityCouncilPage({ data }: { data: UniversityCouncilPageData }) {
  const title = text(data.page.title, "University Council");
  const description = text(
    data.page.description,
    "The University Council provides strategic direction, oversight, and policy guidance for Kisii University.",
  );
  const mandate = data.mandate;
  const documentCtaHref = safeCouncilCtaHref(mandate?.document_cta?.href);

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-brand-overlay text-white">
        <PublicImage
          src={data.page.hero_image?.url || "/images/backgrounds/KSUB-RollPhotos2025-122.jpg"}
          alt={data.page.hero_image?.alt || title}
          ratio="hero"
          priority
          className="absolute inset-0 h-full min-h-[340px] w-full opacity-75"
          imageClassName="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,51,35,0.92),rgba(0,51,35,0.58),rgba(0,0,0,0.18))]" />
        <div className="relative mx-auto min-h-[340px] w-full px-4 py-7 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs font-semibold text-white/75">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/about" className="hover:text-white">About KSU</Link>
            <span className="mx-2">/</span>
            <span>{title}</span>
          </nav>
          <div className="mt-8 max-w-xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">
              Governance
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight">
              {title}
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/90">
              {description}
            </p>
          </div>
        </div>
      </section>

      {mandate ? (
        <section className="relative z-10 -mt-8 px-4 pb-5 sm:px-6 lg:px-8">
          <AboutReveal className="mx-auto grid w-full gap-4 rounded-xl border border-border bg-white p-5 shadow-md lg:grid-cols-[3.5rem_minmax(0,1fr)_auto] lg:items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-secondary">
              <Landmark aria-hidden className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                {text(mandate.label, "Our Mandate")}
              </p>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
                {text(mandate.description, description)}
              </p>
            </div>
            {documentCtaHref ? (
              <Link
                href={documentCtaHref}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-primary px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {text(mandate.document_cta?.label, "Council Charter")}
                <Download aria-hidden className="h-4 w-4" />
              </Link>
            ) : null}
          </AboutReveal>
        </section>
      ) : null}

      <MemberGroup title="Chairperson" description="The Council chairperson leads the governing body and provides strategic oversight.">
        {data.chairperson ? (
          <UniversityCouncilCard member={data.chairperson} variant="featured" />
        ) : (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Chairperson profile is not currently published.
          </p>
        )}
      </MemberGroup>

      <MemberGroup title="Council Members" description="Council members are shown in the official order published by the University.">
        {data.members.length ? (
          <div className="mx-auto flex max-w-[1160px] flex-wrap justify-center gap-4">
            {data.members.map((member) => (
              <div key={member.slug || member.id || member.name} className="w-full sm:w-[190px] lg:w-[200px]">
                <UniversityCouncilCard member={member} />
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Council member profiles are not currently published.
          </p>
        )}
      </MemberGroup>

      <MemberGroup title="Secretary to Council" description="The secretary supports Council governance records, meetings, and official communication.">
        {data.secretary ? (
          <UniversityCouncilCard member={data.secretary} variant="secretary" />
        ) : (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Secretary to Council profile is not currently published.
          </p>
        )}
      </MemberGroup>
    </div>
  );
}
