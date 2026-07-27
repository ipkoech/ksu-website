import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Download,
  GraduationCap,
  ReceiptText,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { RichTextRenderer } from "@ksu/ui/rich-text-renderer";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { PublicImage } from "@/components/public/public-image";
import type { PublicFactItem } from "@/components/public/public-primitives";
import type { ProgrammeDetailData } from "@/lib/programme-detail-data";
import { publicFileUrl } from "@/lib/public-media";
import type {
  AdmissionDocument,
  AdmissionRequirement,
  ProgrammeFeeStructure,
} from "@ksu/api-client";

type FactItem = PublicFactItem;

type FeeRow = {
  item: string;
  amount: string;
  notes: string;
};

function present(value?: string | number | null) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

function stripHtml(value?: string | null) {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(value?: string | null, maximum = 230) {
  const text = stripHtml(value);
  if (text.length <= maximum) return text;
  return `${text.slice(0, maximum).replace(/\s+\S*$/, "")}…`;
}

function titleFromSlug(slug: string) {
  const smallWords = new Set(["and", "for", "in", "of", "the", "to", "with"]);
  return slug
    .split("-")
    .filter(Boolean)
    .map((part, index) =>
      index > 0 && smallWords.has(part)
        ? part
        : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(" ");
}

function formatLabel(value?: string | null) {
  const text = present(value);
  if (!text) return null;
  return text
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatLevel(value: string | null | undefined, title: string) {
  const level = present(value)?.toLowerCase();
  if (level === "undergraduate" && /^bachelor\b/i.test(title))
    return "Bachelor's Degree";
  const labels: Record<string, string> = {
    certificate: "Certificate",
    diploma: "Diploma",
    bachelor: "Bachelor's Degree",
    masters: "Master's Degree",
    master: "Master's Degree",
    phd: "Doctoral Degree",
    doctoral: "Doctoral Degree",
    postgraduate: "Postgraduate Programme",
    postgraduate_diploma: "Postgraduate Diploma",
  };
  return (
    (level && labels[level]) || formatLabel(level) || "Confirm with admissions"
  );
}

function formatMode(value?: string | null) {
  const mode = present(value)?.toLowerCase();
  const labels: Record<string, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    full_time_part_time: "Full-time & part-time",
    online: "Online",
    evening: "Evening",
    weekend: "Weekend",
    blended: "Blended",
  };
  return (
    (mode && labels[mode]) || formatLabel(mode) || "Confirm with admissions"
  );
}

function formatIntakes(values?: string[] | null) {
  if (!values?.length) return "Confirm with admissions";
  if (values.length === 1) return values[0];
  return `${values.slice(0, -1).join(", ")} & ${values.at(-1)}`;
}

function feeValue(value: unknown) {
  if (typeof value === "string" || typeof value === "number")
    return String(value).trim();
  return "";
}

function normaliseFeeRow(
  value: unknown,
  fallbackItem = "Programme fee",
): FeeRow | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const item =
    feeValue(row.item ?? row.fee_item ?? row.name ?? row.label) || fallbackItem;
  const display = feeValue(row.display);
  const amountValue = feeValue(row.amount);
  const currency = feeValue(row.currency);
  const amount =
    display ||
    [currency, amountValue].filter(Boolean).join(" ") ||
    "To be confirmed";
  const notes =
    feeValue(row.notes ?? row.note ?? row.description) ||
    formatLabel(feeValue(row.period)) ||
    "—";
  return { item, amount, notes };
}

function normaliseFees(value: unknown): FeeRow[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((row) => normaliseFeeRow(row))
      .filter((row): row is FeeRow => Boolean(row));
  }
  if (typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  const collection = record.items ?? record.rows ?? record.fees;
  if (Array.isArray(collection)) {
    return collection
      .map((row) => normaliseFeeRow(row))
      .filter((row): row is FeeRow => Boolean(row));
  }
  const single = normaliseFeeRow(record, "Tuition");
  if (single && (record.amount !== undefined || record.display !== undefined))
    return [single];
  return Object.entries(record)
    .map(([item, row]) =>
      typeof row === "object"
        ? normaliseFeeRow(row, formatLabel(item) ?? item)
        : {
            item: formatLabel(item) ?? item,
            amount: feeValue(row) || "To be confirmed",
            notes: "—",
          },
    )
    .filter((row): row is FeeRow => Boolean(row));
}

function normaliseStructuredFee(fee: ProgrammeFeeStructure): FeeRow {
  return {
    item: fee.title,
    amount: fee.total_amount
      ? `${fee.currency} ${new Intl.NumberFormat("en-KE").format(fee.total_amount)}`
      : "To be confirmed",
    notes: [
      formatLabel(fee.applicant_type),
      fee.fee_category ? formatLabel(fee.fee_category) : null,
      fee.notes,
    ]
      .filter(Boolean)
      .join(" · "),
  };
}

function accreditationLabel(value?: string | null) {
  const status = present(value)?.toLowerCase();
  const labels: Record<string, string> = {
    accredited: "Accredited",
    pending: "Pending accreditation",
    pending_accreditation: "Pending accreditation",
    under_review: "Under review",
    not_accredited: "Not yet accredited",
    not_yet_accredited: "Not yet accredited",
    published_in_brochure: "Published in official brochure",
  };
  return (
    (status && labels[status]) ||
    formatLabel(status) ||
    "Confirm with the department"
  );
}

function SectionKicker({ children }: { children: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
      {children}
    </p>
  );
}

function QuickFacts({ facts }: { facts: FactItem[] }) {
  return (
    <dl className="grid grid-cols-2 divide-x divide-y divide-border border-t border-border sm:grid-cols-4 sm:divide-y-0">
      {facts.map((fact) => {
        const Icon = fact.icon;
        return (
          <div
            key={fact.label}
            className="flex min-w-0 gap-3 px-4 py-4 sm:px-5"
          >
            <Icon
              aria-hidden
              className="mt-0.5 h-5 w-5 shrink-0 text-secondary"
            />
            <div className="min-w-0">
              <dt className="text-[0.68rem] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                {fact.label}
              </dt>
              <dd className="mt-1 break-words text-sm font-bold text-primary">
                {fact.value}
              </dd>
            </div>
          </div>
        );
      })}
    </dl>
  );
}

function ProgrammeHero({
  title,
  summary,
  brochureId,
  imageUrl,
  facts,
}: {
  title: string;
  summary: string;
  brochureId?: string | null;
  imageUrl?: string | null;
  facts: FactItem[];
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-sm">
      <div className="grid min-w-0 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.48fr)]">
        <div className="min-w-0 px-5 py-6 sm:px-7 lg:px-8 lg:py-7">
          <SectionKicker>Programme Overview</SectionKicker>
          <h1 className="mt-3 max-w-4xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            {summary}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/admissions/how-to-apply"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary/90"
            >
              How to apply <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            {brochureId ? (
              <a
                href={publicFileUrl(brochureId) ?? undefined}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary/25 px-5 text-sm font-bold text-primary transition hover:bg-primary/[0.05]"
              >
                Programme brief <Download aria-hidden className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>
        <div className="min-h-52 border-t border-border bg-surface-subtle lg:border-l lg:border-t-0">
          <PublicImage
            src={imageUrl}
            alt={`Illustration representing ${title}`}
            ratio="fill"
            priority
            sizes="(min-width: 1024px) 30vw, 100vw"
            className="h-full min-h-52"
            imageClassName="object-cover object-center"
            fallbackContent={
              <BookOpenCheck aria-hidden className="h-28 w-28 stroke-[1.15]" />
            }
          />
        </div>
      </div>
      <QuickFacts facts={facts} />
    </section>
  );
}

function ContentCard({
  title,
  icon: Icon,
  content,
  fallback,
}: {
  title: string;
  icon: LucideIcon;
  content?: string | null;
  fallback: string;
}) {
  return (
    <section className="min-w-0 rounded-[1.5rem] border border-border bg-white p-5 shadow-sm sm:p-6">
      <div className="flex gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary ring-1 ring-primary/10">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-foreground">
            {title}
          </h2>
          <RichTextRenderer
            content={content}
            className="mt-3 text-sm leading-7 text-muted-foreground [&_li]:my-1 [&_ol]:pl-5 [&_p]:my-2 [&_ul]:pl-5"
            emptyFallback={
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {fallback}
              </p>
            }
          />
        </div>
      </div>
    </section>
  );
}

function FeesTable({ rows }: { rows: FeeRow[] }) {
  return (
    <section className="min-w-0 rounded-[1.5rem] border border-border bg-white p-5 shadow-sm sm:p-6">
      <div className="flex gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary ring-1 ring-primary/10">
          <ReceiptText aria-hidden className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            Fees structure
          </h2>
          {rows.length ? (
            <div className="mt-4 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                <thead className="bg-surface-subtle text-xs uppercase tracking-[0.05em] text-primary">
                  <tr>
                    <th className="px-4 py-3">Fee item</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row, index) => (
                    <tr key={`${row.item}-${index}`}>
                      <th className="px-4 py-3 font-semibold text-foreground">
                        {row.item}
                      </th>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.amount}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Programme fees are to be confirmed by the University.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function RequirementMatrix({
  requirements,
}: {
  requirements: AdmissionRequirement[];
}) {
  if (!requirements.length) return null;

  return (
    <section className="min-w-0 rounded-[1.5rem] border border-border bg-white p-5 shadow-sm sm:p-6">
      <div className="flex gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary ring-1 ring-primary/10">
          <ClipboardCheck aria-hidden className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            Admission requirements by applicant type
          </h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-4 py-3">Applicant type</th>
                  <th className="px-4 py-3">Minimum requirement</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requirements.map((item) => (
                  <tr key={item.id}>
                    <th className="px-4 py-3 font-semibold text-foreground">
                      {formatLabel(item.applicant_type)}
                    </th>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.minimum_grade ?? "Confirm with admissions"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.notes ??
                        item.level ??
                        "Programme-specific requirements may apply."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function AdmissionDocuments({ documents }: { documents: AdmissionDocument[] }) {
  if (!documents.length) return null;

  return (
    <section className="min-w-0 rounded-[1.5rem] border border-border bg-white p-5 shadow-sm sm:p-6">
      <div className="flex gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary ring-1 ring-primary/10">
          <Download aria-hidden className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            Programme admission documents
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {documents.map((document) => {
              const href =
                document.external_url ??
                publicFileUrl(document.media_id) ??
                "/admissions/documents";
              return (
                <a
                  key={document.id}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    href.startsWith("http") ? "noopener noreferrer" : undefined
                  }
                  className="group border border-border p-4 transition hover:border-primary/30 hover:bg-primary/[0.03]"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-secondary">
                    {formatLabel(document.document_type)}
                  </p>
                  <h3 className="mt-2 text-sm font-semibold text-foreground">
                    {document.title}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Open <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-border py-3 last:border-0 sm:grid-cols-[7rem_minmax(0,1fr)]">
      <dt className="text-xs font-bold text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm font-semibold text-foreground">
        {children}
      </dd>
    </div>
  );
}

function ProgrammeDetails({
  code,
  departmentName,
  departmentHref,
  accreditation,
}: {
  code: string;
  departmentName: string;
  departmentHref?: string;
  accreditation: string;
}) {
  const badgeClass =
    accreditation === "Accredited"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : "bg-amber-50 text-amber-800 ring-amber-200";
  return (
    <section className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm">
      <SectionKicker>Programme details</SectionKicker>
      <dl className="mt-2">
        <DetailRow label="Programme code">{code}</DetailRow>
        <DetailRow label="Department">
          {departmentHref ? (
            <Link
              href={departmentHref}
              className="text-primary hover:underline"
            >
              {departmentName}
            </Link>
          ) : (
            departmentName
          )}
        </DetailRow>
        <DetailRow label="Accreditation status">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${badgeClass}`}
          >
            <CheckCircle2 aria-hidden className="h-4 w-4" />
            {accreditation}
          </span>
        </DetailRow>
      </dl>
    </section>
  );
}

function ApplicationSupport() {
  return (
    <section className="rounded-[1.5rem] border border-primary/10 bg-primary/[0.06] p-5 shadow-sm">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary ring-1 ring-primary/15">
        <Users aria-hidden className="h-5 w-5" />
      </span>
      <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
        Ready to apply?
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Review the application steps or speak with admissions about
        qualifications and intake dates.
      </p>
      <div className="mt-4 grid gap-2">
        <Link
          href="/admissions/how-to-apply"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-white hover:bg-primary/90"
        >
          How to apply <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
        <Link
          href="/admissions/contact"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary/25 bg-white px-4 text-sm font-bold text-primary hover:bg-primary/[0.05]"
        >
          Contact admissions
        </Link>
      </div>
    </section>
  );
}

function RelatedProgrammes({
  programmes,
}: {
  programmes: ProgrammeDetailData["relatedProgrammes"];
}) {
  if (!programmes.length) return null;
  return (
    <section className="mt-4 rounded-[1.5rem] border border-border bg-white p-5 shadow-sm sm:p-6">
      <SectionKicker>Related programmes</SectionKicker>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {programmes.map((programme) => (
          <Link
            key={programme.id}
            href={`/academics/programmes/${programme.slug}`}
            className="group flex min-w-0 items-center gap-3 rounded-2xl border border-border p-4 transition hover:border-primary/30 hover:bg-primary/[0.04]"
          >
            <GraduationCap
              aria-hidden
              className="h-6 w-6 shrink-0 text-primary"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold leading-5 text-foreground">
                {programme.name}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {[
                  formatLevel(programme.level, programme.name),
                  programme.duration,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </span>
            <ArrowRight
              aria-hidden
              className="h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-0.5"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ProgrammeDetailPage({ data }: { data: ProgrammeDetailData }) {
  const programme = data.programme;
  const title = programme?.name ?? titleFromSlug(data.slug);
  const departmentName =
    present(programme?.department?.name) ??
    present(programme?.department_name) ??
    "Confirm with the University";
  const departmentHref = programme?.department?.slug
    ? `/academics/departments/${programme.department.slug}`
    : undefined;
  const about = programme?.about;
  const summary =
    excerpt(about) ||
    "Explore this programme's academic focus, entry requirements, career opportunities, fees, and intake information.";
  const quickFacts: FactItem[] = [
    {
      label: "Level",
      value: formatLevel(programme?.level, title),
      icon: GraduationCap,
    },
    {
      label: "Mode of study",
      value: formatMode(programme?.mode_of_study),
      icon: Users,
    },
    {
      label: "Duration",
      value: present(programme?.duration) ?? "Confirm with admissions",
      icon: CalendarDays,
    },
    {
      label: "Intake months",
      value: formatIntakes(programme?.intake_months),
      icon: CalendarDays,
    },
  ];
  const structuredFeeRows = (programme?.fee_structures ?? [])
    .filter((fee) => fee.is_active !== false)
    .map(normaliseStructuredFee);
  const feeRows = structuredFeeRows.length
    ? structuredFeeRows
    : normaliseFees(programme?.fees_structure);
  const structuredRequirements = (
    programme?.admission_requirements ?? []
  ).filter((item) => item.is_active !== false);
  const admissionDocuments = (programme?.admission_documents ?? []).filter(
    (item) => item.is_published !== false,
  );

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="w-full bg-[linear-gradient(180deg,hsl(var(--surface-subtle))_0%,#ffffff_68%,hsl(var(--surface-muted))_100%)] px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <BreadcrumbTrail
            items={[
              { label: "Academics", href: "/academics" },
              { label: "Programmes", href: "/academics/programmes" },
              { label: title },
            ]}
          />
          <div className="mt-5">
            <ProgrammeHero
              title={title}
              summary={summary}
              brochureId={programme?.brochure_id}
              imageUrl={publicFileUrl(programme?.cover_image_id)}
              facts={quickFacts}
            />
          </div>

          <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
            <div className="grid min-w-0 gap-4">
              <ContentCard
                title="About the programme"
                icon={BookOpenCheck}
                content={about}
                fallback="A detailed programme overview will be published here."
              />
              <ContentCard
                title="Entry requirements"
                icon={ClipboardCheck}
                content={programme?.entry_requirements}
                fallback="Confirm the current general, subject-specific, and alternative entry requirements with admissions before applying."
              />
              <RequirementMatrix requirements={structuredRequirements} />
              <ContentCard
                title="Career opportunities"
                icon={BriefcaseBusiness}
                content={programme?.career_prospects}
                fallback="Career and further-study pathways will be published here."
              />
              <FeesTable rows={feeRows} />
              <AdmissionDocuments documents={admissionDocuments} />
            </div>

            <aside className="grid gap-4 xl:sticky xl:top-28">
              <ProgrammeDetails
                code={present(programme?.code) ?? "To be confirmed"}
                departmentName={departmentName}
                departmentHref={departmentHref}
                accreditation={accreditationLabel(
                  programme?.accreditation_status,
                )}
              />
              <ApplicationSupport />
            </aside>
          </div>

          <RelatedProgrammes programmes={data.relatedProgrammes} />
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
