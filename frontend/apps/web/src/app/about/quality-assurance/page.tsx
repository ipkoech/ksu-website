import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  Download,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { getQualityAssuranceData } from "@/lib/about-data";
import { publicFileUrl } from "@/lib/public-media";

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-500">
      {label} has not been published yet.
    </div>
  );
}

export default async function QualityAssurancePage() {
  const data = await getQualityAssuranceData();
  const planDocuments = data.documents.filter((document) =>
    [document.category, document.document_type, document.title]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes("strategic"),
  );
  const serviceDocuments = data.documents.filter((document) =>
    [document.category, document.document_type, document.title]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes("service"),
  );
  const qualityDocuments = data.documents.filter(
    (document) =>
      !planDocuments.some((item) => item.id === document.id) &&
      !serviceDocuments.some((item) => item.id === document.id),
  );

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="border-b border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1440px]">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "Quality Assurance" },
              ]}
            />

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-secondary">
                  Quality Assurance
                </p>
                <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950 sm:text-4xl">
                  Quality, planning, and service accountability
                </h1>
                {data.overview?.charter_summary ? (
                  <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-700">
                    {data.overview.charter_summary}
                  </p>
                ) : (
                  <EmptyState label="Quality assurance summary" />
                )}
              </article>

              <aside className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
                <ShieldCheck aria-hidden className="h-5 w-5 text-secondary" />
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-white/55">
                  Backend Records
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-2xl font-semibold leading-none">
                      {data.strategicPriorities.length}
                    </p>
                    <p className="mt-1 text-xs text-white/60">Priorities</p>
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-2xl font-semibold leading-none">
                      {data.documents.length}
                    </p>
                    <p className="mt-1 text-xs text-white/60">Documents</p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1440px] gap-4 lg:grid-cols-3">
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <ClipboardCheck aria-hidden className="h-5 w-5 text-primary" />
              <h2 className="mt-3 text-xl font-semibold text-slate-950">
                Quality Assurance
              </h2>
              {qualityDocuments.length ? (
                <DocumentList documents={qualityDocuments} />
              ) : (
                <EmptyState label="Quality assurance documents" />
              )}
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <FileText aria-hidden className="h-5 w-5 text-primary" />
              <h2 className="mt-3 text-xl font-semibold text-slate-950">
                Strategic Plan
              </h2>
              {planDocuments.length ? (
                <DocumentList documents={planDocuments} />
              ) : data.brochureUrl ? (
                <a
                  href={data.brochureUrl}
                  className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary"
                >
                  Open university brochure
                  <Download aria-hidden className="h-4 w-4" />
                </a>
              ) : (
                <EmptyState label="Strategic plan document" />
              )}
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <ShieldCheck aria-hidden className="h-5 w-5 text-primary" />
              <h2 className="mt-3 text-xl font-semibold text-slate-950">
                Service Charter
              </h2>
              {serviceDocuments.length ? (
                <DocumentList documents={serviceDocuments} />
              ) : data.overview?.charter_summary ? (
                <p className="mt-4 text-sm leading-7 text-slate-700">
                  {data.overview.charter_summary}
                </p>
              ) : (
                <EmptyState label="Service charter" />
              )}
            </article>
          </div>
        </section>

        <section className="bg-white px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1440px] gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <aside>
              <h2 className="text-xl font-semibold text-slate-950">
                Strategic priorities
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Priorities are rendered from the university information record.
              </p>
            </aside>
            {data.strategicPriorities.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {data.strategicPriorities.map((priority) => (
                  <article
                    key={priority.title}
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <h3 className="text-sm font-bold text-slate-950">
                      {priority.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {priority.body}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState label="Strategic priorities" />
            )}
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1440px]">
            <Link
              href="/about/governance"
              className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary"
            >
              View governance context
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}

function DocumentList({
  documents,
}: {
  documents: Array<{
    id: string;
    title: string;
    description?: string | null;
    file_id: string;
  }>;
}) {
  return (
    <div className="mt-4 grid gap-2">
      {documents.map((document) => {
        const href = publicFileUrl(document.file_id);
        return href ? (
          <a
            key={document.id}
            href={href}
            className="rounded-md border border-slate-200 px-3 py-2 transition hover:border-primary/30"
          >
            <span className="block text-sm font-semibold text-slate-950">
              {document.title}
            </span>
            {document.description ? (
              <span className="mt-1 block text-xs leading-5 text-slate-600">
                {document.description}
              </span>
            ) : null}
          </a>
        ) : (
          <div
            key={document.id}
            className="rounded-md border border-slate-200 px-3 py-2"
          >
            <span className="block text-sm font-semibold text-slate-950">
              {document.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
