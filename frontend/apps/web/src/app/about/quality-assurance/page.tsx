import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  Download,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { getQualityAssuranceData } from "@/lib/about-data";
import { publicFileUrl } from "@/lib/public-media";

type ResourceDocument = {
  id: string;
  title: string;
  description?: string | null;
  file_id: string;
  category?: string | null;
  document_type?: string | null;
};

function EmptyState({ label }: { label: string }) {
  return (
    <div
      data-backend-empty-state
      className="rounded-lg border border-dashed border-border bg-white/70 p-5 text-sm leading-6 text-muted-foreground"
    >
      {label} has not been published yet.
    </div>
  );
}

function documentText(document: ResourceDocument) {
  return [document.category, document.document_type, document.title]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function documentMatches(document: ResourceDocument, term: string) {
  return documentText(document).includes(term);
}

export default async function QualityAssurancePage() {
  const data = await getQualityAssuranceData();
  const planDocuments = data.documents.filter((document) =>
    documentMatches(document, "strategic"),
  );
  const serviceDocuments = data.documents.filter((document) =>
    documentMatches(document, "service"),
  );
  const qualityDocuments = data.documents.filter(
    (document) =>
      !planDocuments.some((item) => item.id === document.id) &&
      !serviceDocuments.some((item) => item.id === document.id),
  );

  const resourceCards = [
    {
      title: "Quality Assurance",
      kicker: "Continuous improvement",
      body: "Policies, frameworks, and evidence records that support academic quality review.",
      icon: ClipboardCheck,
      documents: qualityDocuments,
      emptyLabel: "Quality assurance documents",
    },
    {
      title: "Strategic Plan",
      kicker: "Institutional priorities",
      body: "Planning documents and priorities used to align university performance.",
      icon: FileText,
      documents: planDocuments,
      emptyLabel: "Strategic plan document",
    },
    {
      title: "Service Charter",
      kicker: "Service accountability",
      body:
        data.overview?.charter_summary ??
        "Published service commitments appear here when the charter record is available.",
      icon: ShieldCheck,
      documents: serviceDocuments,
      emptyLabel: "Service charter document",
    },
  ];

  const commitmentSteps = [
    {
      title: "Publish the commitment",
      body:
        data.overview?.charter_summary ??
        "The service charter summary is loaded from the university information record.",
    },
    {
      title: "Attach the evidence",
      body: data.documents.length
        ? `${data.documents.length} backend document record${
            data.documents.length === 1 ? "" : "s"
          } currently support this page.`
        : "Backend quality, strategic plan, and service charter documents will appear here after publication.",
    },
    {
      title: "Review against priorities",
      body: data.strategicPriorities.length
        ? "Strategic priorities guide the quality assurance and service review cycle."
        : "Strategic priorities will appear here after the university information record is updated.",
    },
  ];

  return (
    <PageShell>
      <AboutPageLenis>
        <main className="max-w-none bg-white">
          <section className="relative isolate overflow-hidden bg-brand-overlay text-white">
            <div
              aria-hidden
              className="absolute inset-0 bg-[url('/images/about/about-quality-assurance-branded.webp')] bg-cover bg-center opacity-55 mix-blend-luminosity"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-brand-overlay via-brand-overlay/88 to-primary/70"
            />
            <div className="relative px-4 py-8 sm:px-6 lg:px-8">
              <div className="mx-auto w-full max-w-none">
                <BreadcrumbTrail
                  items={[
                    { label: "Home", href: "/" },
                    { label: "About", href: "/about" },
                    { label: "Quality Assurance" },
                  ]}
                />

                <div className="grid min-h-[560px] items-end gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-20">
                  <div className="max-w-4xl">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
                      Quality Assurance
                    </p>
                    <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                      Quality, planning, and service accountability
                    </h1>
                    {data.overview?.charter_summary ? (
                      <p className="mt-6 max-w-3xl text-base leading-8 text-white/82 sm:text-lg">
                        {data.overview.charter_summary}
                      </p>
                    ) : (
                      <div className="mt-6 max-w-2xl">
                        <EmptyState label="Quality assurance summary" />
                      </div>
                    )}
                  </div>

                  <aside className="rounded-lg border border-white/15 bg-white/[0.08] p-5 shadow-2xl backdrop-blur">
                    <ShieldCheck aria-hidden className="h-6 w-6 text-secondary" />
                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-white/60">
                      Backend Records
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <MetricCard
                        value={data.strategicPriorities.length}
                        label="Priorities"
                      />
                      <MetricCard value={data.documents.length} label="Documents" />
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-surface-subtle px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-none">
              <div className="grid gap-4 lg:grid-cols-3">
                {resourceCards.map((card) => (
                  <QualityResourceCard key={card.title} {...card} />
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
            <div className="mx-auto grid w-full max-w-none gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
                  Strategic Plan Highlights
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-foreground">
                  Priorities that shape quality review
                </h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  These priorities are rendered from the university information
                  record and remain empty until backend content is published.
                </p>
              </div>

              {data.strategicPriorities.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {data.strategicPriorities.map((priority, index) => (
                    <StrategicHighlightCard
                      key={priority.title}
                      index={index + 1}
                      title={priority.title}
                      body={priority.body}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState label="Strategic priorities" />
              )}
            </div>
          </section>

          <section className="bg-primary px-4 py-14 text-white sm:px-6 lg:px-8">
            <div className="mx-auto grid w-full max-w-none gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
                  Service Commitments
                </p>
                <h2 className="mt-3 text-3xl font-semibold">
                  From charter to evidence
                </h2>
                <p className="mt-4 text-sm leading-7 text-white/78">
                  The page connects the service charter summary, official
                  backend documents, and strategic priorities into one public
                  accountability view.
                </p>
              </div>
              <div className="grid gap-3">
                {commitmentSteps.map((step, index) => (
                  <ServiceCommitmentStep
                    key={step.title}
                    index={index + 1}
                    title={step.title}
                    body={step.body}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="border-t border-border bg-white px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto grid w-full max-w-none gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
                  Official References
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-foreground">
                  Backend-published downloads
                </h2>
                <Link
                  href="/about/governance"
                  className="mt-6 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary"
                >
                  View governance context
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              </div>

              {data.documents.length ? (
                <DocumentList documents={data.documents} />
              ) : (
                <EmptyState label="Official quality assurance references" />
              )}
            </div>
          </section>
        </main>
      </AboutPageLenis>
    </PageShell>
  );
}

function MetricCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
      <p className="text-3xl font-semibold leading-none">{value}</p>
      <p className="mt-2 text-xs font-medium text-white/65">{label}</p>
    </div>
  );
}

function QualityResourceCard({
  title,
  kicker,
  body,
  icon: Icon,
  documents,
  emptyLabel,
}: {
  title: string;
  kicker: string;
  body: string;
  icon: LucideIcon;
  documents: ResourceDocument[];
  emptyLabel: string;
}) {
  return (
    <article className="flex min-h-[360px] flex-col rounded-lg border border-border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="rounded-lg bg-primary/10 p-3 text-primary">
          <Icon aria-hidden className="h-5 w-5" />
        </div>
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-secondary">
          {kicker}
        </span>
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-foreground">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{body}</p>
      <div className="mt-auto pt-6">
        {documents.length ? (
          <DocumentList documents={documents} compact />
        ) : (
          <EmptyState label={emptyLabel} />
        )}
      </div>
    </article>
  );
}

function StrategicHighlightCard({
  index,
  title,
  body,
}: {
  index: number;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-lg border border-border bg-surface-subtle p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-foreground">
        {String(index).padStart(2, "0")}
      </div>
      <h3 className="mt-5 text-base font-bold text-foreground">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{body}</p>
    </article>
  );
}

function ServiceCommitmentStep({
  index,
  title,
  body,
}: {
  index: number;
  title: string;
  body: string;
}) {
  return (
    <article className="grid gap-4 rounded-lg border border-white/15 bg-white/[0.08] p-5 backdrop-blur sm:grid-cols-[64px_minmax(0,1fr)]">
      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-secondary text-base font-bold text-foreground">
        {index}
      </div>
      <div>
        <h3 className="text-base font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-white/76">{body}</p>
      </div>
    </article>
  );
}

function DocumentList({
  documents,
  compact = false,
}: {
  documents: ResourceDocument[];
  compact?: boolean;
}) {
  return (
    <div className={compact ? "grid gap-2" : "grid gap-3 md:grid-cols-2"}>
      {documents.map((document) => {
        const href = publicFileUrl(document.file_id);
        const body = document.description ?? document.document_type ?? document.category;
        const className =
          "group rounded-lg border border-border bg-white px-4 py-3 transition hover:border-primary/35 hover:shadow-sm";

        return href ? (
          <a key={document.id} href={href} className={className}>
            <span className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">
                  {document.title}
                </span>
                {body ? (
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {body}
                  </span>
                ) : null}
              </span>
              <Download
                aria-hidden
                className="mt-0.5 h-4 w-4 shrink-0 text-primary transition group-hover:translate-y-0.5"
              />
            </span>
          </a>
        ) : (
          <div key={document.id} className={className}>
            <span className="flex items-start gap-3">
              <Sparkles
                aria-hidden
                className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
              />
              <span>
                <span className="block text-sm font-semibold text-foreground">
                  {document.title}
                </span>
                {body ? (
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {body}
                  </span>
                ) : null}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
