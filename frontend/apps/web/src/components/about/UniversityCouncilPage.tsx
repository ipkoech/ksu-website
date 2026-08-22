import Link from "next/link";
import { Download, Landmark } from "lucide-react";
import { CampusPageHeader } from "@ksu/ui/components";
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
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
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
    <section className="bg-white px-5 py-8 sm:px-8 lg:px-10" aria-label={title}>
      <AboutReveal
        className="mx-auto w-full max-w-7xl"
        variant={title === "Council Members" ? "up" : "scale"}
      >
        <div className="mb-4 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-normal tracking-tight uppercase text-primary">
            {title}
          </h2>
          <div className="mx-auto mt-2 h-0.5 w-10 bg-secondary" />
          <p className="sr-only">{description}</p>
        </div>
        {children}
      </AboutReveal>
    </section>
  );
}

export function UniversityCouncilPage({
  data,
}: {
  data: UniversityCouncilPageData;
}) {
  const title = text(data.page.title, "University Council");
  const description = text(
    data.page.description,
    "The University Council provides strategic direction, oversight, and policy guidance for Kisii University.",
  );
  const mandate = data.mandate;
  const documentCtaHref = safeCouncilCtaHref(mandate?.document_cta?.href);
  // What the Council is for. Only worth its own passage when it actually says
  // something beyond the page description already carried by the header.
  const remit = text(mandate?.description);
  const showRemit = Boolean(remit) && remit !== description;

  return (
    <div className="bg-white">
      <CampusPageHeader
        image="main-admin"
        variant="feature"
        titleWeight="normal"
        eyebrow="Governance"
        title={
          <>
            University <em className="italic">Council</em>
          </>
        }
        description={description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About KSU", href: "/about" },
          { label: title },
        ]}
        actions={
          documentCtaHref ? (
            <Link
              href={documentCtaHref}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/45 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition-colors duration-200 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white active:scale-[0.98]"
            >
              {text(mandate?.document_cta?.label, "Council Charter")}
              <Download aria-hidden className="h-4 w-4" />
            </Link>
          ) : null
        }
      />

      {showRemit ? (
        <section
          className="bg-white px-5 py-10 sm:px-8 lg:px-10"
          aria-label="What the Council does"
        >
          <AboutReveal className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-secondary">
                <Landmark aria-hidden className="h-5 w-5" />
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-normal tracking-tight text-primary">
                What the Council does
              </h2>
            </div>
            <p className="max-w-4xl border-l-2 border-secondary pl-5 text-base leading-8 text-muted-foreground">
              {remit}
            </p>
          </AboutReveal>
        </section>
      ) : null}

      <MemberGroup
        title="Chairperson"
        description="The Council chairperson leads the governing body and provides strategic oversight."
      >
        {data.chairperson ? (
          <UniversityCouncilCard member={data.chairperson} variant="featured" />
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Chairperson profile is not currently published.
          </p>
        )}
      </MemberGroup>

      <MemberGroup
        title="Council Members"
        description="Council members are shown in the official order published by the University."
      >
        {data.members.length ? (
          <div className="mx-auto flex max-w-[1160px] flex-wrap justify-center gap-4">
            {data.members.map((member) => (
              <div
                key={member.slug || member.id || member.name}
                className="w-full sm:w-[190px] lg:w-[200px]"
              >
                <UniversityCouncilCard member={member} />
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Council member profiles are not currently published.
          </p>
        )}
      </MemberGroup>

      <MemberGroup
        title="Secretary to Council"
        description="The secretary supports Council governance records, meetings, and official communication."
      >
        {data.secretary ? (
          <UniversityCouncilCard member={data.secretary} variant="secretary" />
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Secretary to Council profile is not currently published.
          </p>
        )}
      </MemberGroup>
    </div>
  );
}
