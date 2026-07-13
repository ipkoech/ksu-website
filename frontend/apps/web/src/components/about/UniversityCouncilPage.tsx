import Link from "next/link";
import { Download, Landmark } from "lucide-react";
import { PublicImage } from "@/components/public/public-image";
import type { UniversityCouncilPageData } from "@/lib/about-data";
import { UniversityCouncilCard } from "./UniversityCouncilCard";

function text(value?: string | null, fallback = "") {
  const trimmed = value?.trim();
  return trimmed && trimmed.length ? trimmed : fallback;
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
    <section className="bg-white px-4 py-12 sm:px-6 lg:px-8" aria-label={title}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
            University Council
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950">
            {title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
        {children}
      </div>
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

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <PublicImage
          src={data.page.hero_image?.url}
          alt={data.page.hero_image?.alt || title}
          ratio="hero"
          priority
          className="absolute inset-0 h-full w-full opacity-75"
          imageClassName="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,51,35,0.92),rgba(0,51,35,0.58),rgba(0,0,0,0.18))]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <nav aria-label="Breadcrumb" className="text-xs font-semibold text-white/75">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/about" className="hover:text-white">About KSU</Link>
            <span className="mx-2">/</span>
            <span>{title}</span>
          </nav>
          <div className="mt-12 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">
              Governance
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight sm:text-5xl">
              {title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/90">
              {description}
            </p>
          </div>
        </div>
      </section>

      {mandate ? (
        <section className="bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[4rem_minmax(0,1fr)_auto] lg:items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">
              <Landmark aria-hidden className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                {text(mandate.label, "Our Mandate")}
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
                {text(mandate.heading, "Our Mandate")}
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-700">
                {text(mandate.description, description)}
              </p>
            </div>
            {mandate.document_cta?.href ? (
              <Link
                href={mandate.document_cta.href}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-primary px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {text(mandate.document_cta.label, "Council Charter")}
                <Download aria-hidden className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      <MemberGroup title="Chairperson" description="The Council chairperson leads the governing body and provides strategic oversight.">
        {data.chairperson ? (
          <UniversityCouncilCard member={data.chairperson} variant="featured" />
        ) : (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
            Chairperson profile is not currently published.
          </p>
        )}
      </MemberGroup>

      <MemberGroup title="Council Members" description="Council members are shown in the official order published by the University.">
        {data.members.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.members.map((member) => (
              <UniversityCouncilCard key={member.slug || member.id || member.name} member={member} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
            Council member profiles are not currently published.
          </p>
        )}
      </MemberGroup>

      <MemberGroup title="Secretary to Council" description="The secretary supports Council governance records, meetings, and official communication.">
        {data.secretary ? (
          <UniversityCouncilCard member={data.secretary} variant="featured" />
        ) : (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
            Secretary to Council profile is not currently published.
          </p>
        )}
      </MemberGroup>
    </div>
  );
}
