"use client";

import Link from "next/link";
import type { ResearchGenericRecord, ResearchPublication } from "@ksu/api-client";
import { CalendarDays, ExternalLink, FileText, Link2, UsersRound } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@ksu/ui/components";
import { ResearchRichText } from "../../components/research-rich-text";
import { Badge } from "../../components/research-ui";
import { compactText, formatDate, formatLabel } from "../../lib/research-public-data";

export function PublicationDetailSheet({
  publication,
  children,
}: {
  publication: ResearchPublication & ResearchGenericRecord;
  children: React.ReactNode;
}) {
  const title = compactText(publication.title) || "Publication";
  const summary = compactText(publication.abstract) || compactText(publication.summary);
  const project = publication.project as ResearchGenericRecord | null | undefined;
  const center = publication.center as ResearchGenericRecord | null | undefined;
  const authors = getAuthors(publication);
  const accessLinks = [
    { label: "Open publication", href: publication.url },
    { label: "Download PDF", href: publication.pdf_url },
    { label: "Open DOI", href: publication.doi ? `https://doi.org/${publication.doi}` : null },
  ].filter((link) => compactText(link.href));

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto bg-white p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-slate-200 px-6 py-5 text-left">
          <div className="mb-2 flex flex-wrap gap-2">
            {publication.publication_type ? <Badge>{formatLabel(publication.publication_type)}</Badge> : null}
            {publication.access_type ? <Badge>{formatLabel(publication.access_type)}</Badge> : null}
            {publication.is_open_access ? (
              <span className="inline-flex rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold uppercase text-primary">
                Open access
              </span>
            ) : null}
          </div>
          <SheetTitle className="text-2xl font-semibold leading-tight text-slate-950">
            {title}
          </SheetTitle>
          {summary ? (
            <SheetDescription className="text-sm leading-6 text-slate-600">
              {summary}
            </SheetDescription>
          ) : null}
        </SheetHeader>

        <div className="grid gap-5 px-6 py-5">
          <dl className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
            <MetaRow icon={CalendarDays} label="Published" value={formatDate(publication.publication_date) || compactText(publication.year)} />
            <MetaRow icon={FileText} label="Venue" value={[publication.journal_name, publication.publisher, publication.conference_name].map(compactText).filter(Boolean).join(" / ")} />
            <MetaRow icon={Link2} label="DOI" value={compactText(publication.doi)} />
            <MetaRow icon={UsersRound} label="Authors" value={authors.join(", ")} />
          </dl>

          {summary ? (
            <section>
              <h3 className="text-sm font-semibold text-slate-950">Abstract</h3>
              <ResearchRichText content={summary} className="mt-2 text-sm leading-7 text-slate-700" />
            </section>
          ) : null}

          <section className="grid gap-3 sm:grid-cols-2">
            <ContextCard title="Project" record={project} hrefBase="/projects" />
            <ContextCard title="Center" record={center} hrefBase="/centers" />
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-950">Citation and access</h3>
            <dl className="mt-3 grid gap-2 text-sm">
              <CompactFact label="ISSN / ISBN" value={[publication.issn, publication.isbn].map(compactText).filter(Boolean).join(" / ")} />
              <CompactFact label="Volume / Issue" value={[publication.volume, publication.issue].map(compactText).filter(Boolean).join(" / ")} />
              <CompactFact label="Pages" value={compactText(publication.pages)} />
            </dl>
            {accessLinks.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {accessLinks.map((link) => (
                  <a
                    key={link.label}
                    href={compactText(link.href)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center gap-2 rounded-md border border-primary px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
                  >
                    {link.label}
                    <ExternalLink aria-hidden className="h-4 w-4" />
                  </a>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ContextCard({
  title,
  record,
  hrefBase,
}: {
  title: string;
  record?: ResearchGenericRecord | null;
  hrefBase: string;
}) {
  const recordTitle = compactText(record?.title) || compactText(record?.name) || compactText(record?.code);
  const href = record?.slug ? `${hrefBase}/${record.slug}` : null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase text-slate-500">{title}</p>
      {recordTitle ? (
        href ? (
          <Link href={href} className="mt-2 block text-sm font-semibold leading-6 text-primary hover:text-secondary">
            {recordTitle}
          </Link>
        ) : (
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">{recordTitle}</p>
        )
      ) : (
        <p className="mt-2 text-sm leading-6 text-slate-500">Not linked</p>
      )}
    </div>
  );
}

function CompactFact({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3">
      <dt className="font-semibold text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words text-slate-900 [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[20px_92px_minmax(0,1fr)] gap-2">
      <Icon aria-hidden className="mt-0.5 h-4 w-4 text-primary" />
      <dt className="font-semibold text-slate-600">{label}</dt>
      <dd className="min-w-0 break-words text-slate-900 [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}

function getAuthors(publication: ResearchPublication & ResearchGenericRecord) {
  const authors = Array.isArray(publication.authors) ? publication.authors : [];
  return authors
    .map((author) => compactText(author.full_name) || compactText(author.name) || compactText(author.title))
    .filter(Boolean);
}
