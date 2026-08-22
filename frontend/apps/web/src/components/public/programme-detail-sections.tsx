"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Download, Minus, Plus } from "lucide-react";
import { RichTextRenderer } from "@ksu/ui/rich-text-renderer";

export type ProgrammeFeeDisplay = {
  item: string;
  amount: string;
  notes: string;
};
export type ProgrammeRequirementDisplay = {
  id: string;
  type: string;
  minimum: string;
  notes: string;
};
export type ProgrammeDocumentDisplay = {
  id: string;
  title: string;
  type: string;
  href: string;
  external: boolean;
};

type Props = {
  about?: string | null;
  objectives?: string | null;
  entryRequirements?: string | null;
  curriculum?: string | null;
  careers?: string | null;
  fees: ProgrammeFeeDisplay[];
  requirements: ProgrammeRequirementDisplay[];
  accreditation: string;
  accreditingBody?: string | null;
  documents: ProgrammeDocumentDisplay[];
};

const tabs = [
  ["overview", "Overview"],
  ["requirements", "Requirements"],
  ["curriculum", "Curriculum"],
  ["fees", "Fees & Funding"],
  ["careers", "Careers"],
  ["accreditation", "Accreditation"],
] as const;

function Copy({
  content,
  fallback,
}: {
  content?: string | null;
  fallback: string;
}) {
  return (
    <RichTextRenderer
      content={content}
      className="min-w-0 max-w-full text-sm leading-7 text-muted-foreground [overflow-wrap:anywhere] [&_a]:break-all [&_li]:my-1.5 [&_ol]:pl-5 [&_p]:my-3 [&_ul]:pl-5"
      emptyFallback={
        <p className="text-sm leading-7 text-muted-foreground">{fallback}</p>
      }
    />
  );
}

function SectionBody({
  id,
  data,
}: {
  id: (typeof tabs)[number][0];
  data: Props;
}) {
  if (id === "overview")
    return (
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-primary">
          Overview
        </h2>
        <div className="mt-4">
          <Copy
            content={data.about}
            fallback="A detailed programme overview will be published here."
          />
        </div>
        {data.objectives ? (
          <div className="mt-7 border-t border-primary/10 pt-6">
            <h3 className="font-[family-name:var(--font-display)] text-xl font-normal text-primary">
              Learning outcomes
            </h3>
            <div className="mt-3">
              <Copy content={data.objectives} fallback="" />
            </div>
          </div>
        ) : null}
      </div>
    );
  if (id === "requirements")
    return (
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-primary">
          Entry requirements
        </h2>
        <div className="mt-4">
          <Copy
            content={data.entryRequirements}
            fallback="Confirm the current entry requirements with admissions before applying."
          />
        </div>
        {data.requirements.length ? (
          <div className="mt-6 grid gap-3">
            {data.requirements.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl bg-surface-subtle p-5 ring-1 ring-primary/10"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                  {item.type}
                </p>
                <p className="mt-2 font-bold text-primary">{item.minimum}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.notes}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    );
  if (id === "curriculum")
    return (
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-primary">
          Curriculum
        </h2>
        <div className="mt-4">
          <Copy
            content={data.curriculum}
            fallback="The curriculum outline is being prepared for publication. Download the official programme brief or contact the department for the current course structure."
          />
        </div>
      </div>
    );
  if (id === "fees")
    return (
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-primary">
          Fees & funding
        </h2>
        {data.fees.length ? (
          <dl className="mt-5 grid gap-3">
            {data.fees.map((fee, index) => (
              <div
                key={`${fee.item}-${index}`}
                className="grid gap-2 rounded-2xl bg-surface-subtle p-5 ring-1 ring-primary/10 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div>
                  <dt className="text-sm font-bold text-primary">{fee.item}</dt>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {fee.notes}
                  </p>
                </div>
                <dd className="font-[family-name:var(--font-display)] text-xl font-normal text-primary">
                  {fee.amount}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Programme fees are to be confirmed by the University.
          </p>
        )}
        <Link
          href="/admissions#fees"
          className="mt-6 inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline"
        >
          View fees and government funding guidance
        </Link>
      </div>
    );
  if (id === "careers")
    return (
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-primary">
          Career pathways
        </h2>
        <div className="mt-4">
          <Copy
            content={data.careers}
            fallback="Career information has not yet been published for this programme. Contact the department for professional and further-study guidance."
          />
        </div>
      </div>
    );
  return (
    <div>
      <h2 className="font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-primary">
        Accreditation & documents
      </h2>
      <div className="mt-5 rounded-2xl border border-secondary/30 bg-secondary/5 p-5">
        <p className="flex items-center gap-2 font-bold text-primary">
          <CheckCircle2 className="h-5 w-5 text-secondary" aria-hidden />
          {data.accreditation}
        </p>
        {data.accreditingBody ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Accrediting body:{" "}
            <strong className="text-foreground">{data.accreditingBody}</strong>
          </p>
        ) : null}
      </div>
      {data.documents.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {data.documents.map((document) => (
            <Link
              key={document.id}
              href={document.href}
              target={document.external ? "_blank" : undefined}
              rel={document.external ? "noopener noreferrer" : undefined}
              className="group rounded-2xl bg-white p-4 ring-1 ring-primary/10 hover:ring-primary/30"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                {document.type}
              </p>
              <p className="mt-2 text-sm font-bold text-primary">
                {document.title}
              </p>
              <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-primary">
                <Download className="h-4 w-4" aria-hidden />
                Open document
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ProgrammeDetailSections(data: Props) {
  const [active, setActive] = useState<(typeof tabs)[number][0]>("overview");
  return (
    <>
      <section className="hidden overflow-hidden rounded-3xl bg-white ring-1 ring-primary/10 lg:block">
        <div
          role="tablist"
          aria-label="Programme information"
          className="grid grid-cols-6 border-b border-primary/10 bg-surface-subtle"
        >
          {tabs.map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={active === id}
              onClick={() => setActive(id)}
              className={`relative min-h-14 px-3 text-sm font-bold transition-colors ${active === id ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            >
              {label}
              {active === id ? (
                <span className="absolute inset-x-4 bottom-0 h-1 bg-secondary" />
              ) : null}
            </button>
          ))}
        </div>
        <div role="tabpanel" className="min-h-[25rem] p-7 sm:p-9">
          <SectionBody id={active} data={data} />
        </div>
      </section>
      <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-primary/10 lg:hidden">
        {tabs.map(([id, label], index) => (
          <details
            key={id}
            open={index === 0}
            className="group border-b border-primary/10 last:border-0"
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 text-sm font-bold text-primary">
              <span>{label}</span>
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 ring-1 ring-primary/10"
                aria-hidden
              >
                <Plus className="h-4 w-4 group-open:hidden" />
                <Minus className="hidden h-4 w-4 group-open:block" />
              </span>
            </summary>
            <div className="border-t border-primary/10 px-5 py-6">
              <SectionBody id={id} data={data} />
            </div>
          </details>
        ))}
      </section>
    </>
  );
}
