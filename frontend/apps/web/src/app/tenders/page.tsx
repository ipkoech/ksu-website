import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ClipboardList } from "lucide-react";
import { announcementsApi } from "@ksu/api-client";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Tenders",
  description:
    "Access procurement notices, supplier opportunities, and tender-related public information through official Kisii University channels.",
};

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function TendersPage() {
  const notices = await announcementsApi
    .list({
      is_published: true,
      search: "tender procurement supplier prequalification",
      per_page: 6,
    })
    .then((response) => response.data ?? [])
    .catch((error) => {
      console.error("Failed to fetch tender notices:", error);
      return [];
    });

  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <BreadcrumbTrail
          items={[{ label: "Home", href: "/" }, { label: "Tenders" }]}
        />

        <header className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
            Tenders
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
            Tenders and procurement notices
          </h1>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Access procurement notices, supplier opportunities, and
            tender-related public information through official university
            channels.
          </p>
        </header>

        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
            Current notices
          </h2>

          {notices.length === 0 ? (
            <p className="mt-4 text-base leading-7 text-slate-600">
              No tender-related notices have been published yet. Please check the
              official procurement portal for current tender opportunities.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {notices.map((notice) => {
                const summary = stripHtml(
                  notice.summary ??
                    notice.plain_text ??
                    notice.rich_text ??
                    notice.content,
                );
                const truncated =
                  summary.length > 200
                    ? `${summary.slice(0, 200)}...`
                    : summary;
                const date = formatDate(notice.published_at);

                return (
                  <Link
                    key={notice.id}
                    href={`/media/announcements/${notice.slug}`}
                    className="group block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-950 group-hover:text-primary">
                          {notice.title}
                        </h3>
                        {truncated && (
                          <p className="mt-1.5 text-sm leading-6 text-slate-600">
                            {truncated}
                          </p>
                        )}
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ClipboardList aria-hidden className="h-4 w-4" />
                      </span>
                    </div>
                    {date && (
                      <p className="mt-3 text-xs text-slate-400">
                        Published {date}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-12 rounded-lg border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
            Open tenders portal
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            For full details, current tender documents, and submission
            instructions, visit the official procurement portal.
          </p>
          <a
            href="https://digital.kisiiuniversity.ac.ke/procurement_portal/tenders"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Open tenders portal
            <ArrowRight aria-hidden className="h-4 w-4" />
          </a>
        </section>
      </article>
    </PageShell>
  );
}
