import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Users } from "lucide-react";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { announcementsApi, type Announcement } from "@ksu/api-client";

export const metadata = {
  title: "Careers",
  description:
    "Open job adverts and career-related public notices at Kisii University.",
};

type ListEnvelope<T> = { data?: T[] };

async function safeList<T>(
  request: Promise<ListEnvelope<T>>,
): Promise<T[]> {
  try {
    const response = await request;
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    return [];
  }
}

function stripHtml(value?: string | null) {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shortText(
  value: string | null | undefined,
  fallback: string,
  max = 180,
) {
  const text = stripHtml(value) || fallback;
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function formatDate(value?: string | null) {
  if (!value) return "Current notice";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

const JOB_PORTAL_URL =
  "https://digital.kisiiuniversity.ac.ke/job_portal/open_adverts";

export default async function CareersPage() {
  const notices = await safeList(
    announcementsApi.list({
      is_published: true,
      search: "career job vacancy advert",
      per_page: 6,
    }),
  );

  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <BreadcrumbTrail
          items={[
            { label: "Home", href: "/" },
            { label: "Careers" },
          ]}
        />

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase text-secondary">
            Careers
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-foreground">
            Careers and job adverts
          </h1>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            Open job adverts and career-related notices. Formal applications
            are handled through the official digital job portal.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            Current notices
          </h2>
          <p className="mt-3 text-base leading-8 text-muted-foreground">
            {notices.length
              ? "These notices are loaded from published announcement records."
              : "No career notices were returned. Use the official job portal for current adverts."}
          </p>

          {notices.length > 0 && (
            <div className="mt-6 space-y-4">
              {notices.map((notice: Announcement) => (
                <Card key={notice.id} notice={notice} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 rounded-[1.25rem] border border-border bg-accent/60 p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BriefcaseBusiness aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Open job portal
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                View and apply for current open adverts through the official
                digital job portal. All formal applications are processed
                through this channel.
              </p>
              <a
                href={JOB_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-secondary"
              >
                Open job portal
                <ArrowRight aria-hidden className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </article>
    </PageShell>
  );
}

function Card({ notice }: { notice: Announcement }) {
  return (
    <Link
      href={`/media/announcements/${notice.slug}`}
      className="group block rounded-[1.25rem] border border-border bg-white p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold leading-snug text-foreground group-hover:text-primary">
            {notice.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {shortText(
              notice.rich_text ?? notice.content ?? notice.plain_text,
              "No summary available.",
            )}
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
          <Users aria-hidden className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-xs font-medium text-muted-foreground/70">
        {formatDate(notice.published_at)}
      </p>
    </Link>
  );
}
