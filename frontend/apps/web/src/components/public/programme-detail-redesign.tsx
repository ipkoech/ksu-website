import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Download,
  GraduationCap,
  Landmark,
  Users,
} from "lucide-react";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { PublicImage } from "@/components/public/public-image";
import { publicFileUrl } from "@/lib/public-media";
import type { ProgrammeDetailData } from "@/lib/programme-detail-data";
import {
  ProgrammeDetailSections,
  type ProgrammeDocumentDisplay,
  type ProgrammeFeeDisplay,
  type ProgrammeRequirementDisplay,
} from "./programme-detail-sections";

function clean(value?: string | null) {
  return (value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(value?: string | null, maximum = 330) {
  const text = clean(value);
  return text.length > maximum
    ? `${text.slice(0, maximum).replace(/\s+\S*$/, "")}…`
    : text;
}

function label(value?: string | null) {
  return value
    ? value
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase())
    : "Fee details pending University confirmation";
}

function level(value: string | null | undefined, title: string) {
  const current = value?.toLowerCase();
  if (current === "masters" || current === "master" || /^master\b/i.test(title))
    return "Master's Degree";
  if (current === "phd" || current === "doctoral") return "Doctoral Degree";
  if (current === "undergraduate" || current === "bachelor")
    return "Bachelor's Degree";
  return label(value);
}

function mode(value?: string | null) {
  const values: Record<string, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    full_time_part_time: "Full-time & Part-time",
    online: "Online",
    blended: "Blended",
    evening: "Evening",
    weekend: "Weekend",
  };
  return (value && values[value.toLowerCase()]) || label(value);
}

function feesFrom(value: unknown): ProgrammeFeeDisplay[] {
  if (!value) return [];
  const values = Array.isArray(value)
    ? value
    : typeof value === "object" &&
        value &&
        Array.isArray((value as Record<string, unknown>).items)
      ? ((value as Record<string, unknown>).items as unknown[])
      : [value];
  return values.flatMap((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const row = entry as Record<string, unknown>;
    const item = String(
      row.item ??
        row.name ??
        row.label ??
        (index ? `Fee item ${index + 1}` : "Tuition"),
    );
    const amount = String(
      row.display ??
        [row.currency, row.amount].filter(Boolean).join(" ") ??
        "Fee details pending University confirmation",
    );
    const notes = String(
      row.notes ?? row.description ?? label(String(row.period ?? "")),
    );
    return [
      {
        item,
        amount: amount || "Fee details pending University confirmation",
        notes:
          notes === "To Be Confirmed" ? "Confirm with the University" : notes,
      },
    ];
  });
}

function accreditation(value?: string | null) {
  const values: Record<string, string> = {
    accredited: "Accredited",
    pending: "Pending accreditation",
    pending_accreditation: "Pending accreditation",
    under_review: "Under review",
    published_in_brochure: "Published in official brochure",
  };
  return (
    (value && values[value.toLowerCase()]) ||
    label(value) ||
    "Confirm with the University"
  );
}

function Detail({
  label: title,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-primary/10 py-3 last:border-0 sm:grid-cols-[7rem_1fr]">
      <dt className="text-xs font-bold text-muted-foreground">{title}</dt>
      <dd className="break-words text-sm font-bold text-foreground">
        {children}
      </dd>
    </div>
  );
}

export function ProgrammeDetailRedesign({
  data,
}: {
  data: ProgrammeDetailData;
}) {
  const programme = data.programme;
  const title =
    programme?.name ??
    data.slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  const programmeLevel = level(programme?.level, title);
  const studyMode = mode(programme?.mode_of_study);
  const duration = programme?.duration?.trim() || "Duration details pending University confirmation";
  const intake = programme?.intake_months?.length
    ? programme.intake_months.join(", ")
    : "Intake dates pending University confirmation";
  const department =
    programme?.department?.name ??
    programme?.department_name ??
    "Confirm with the University";
  const departmentHref = programme?.department?.slug
    ? `/academics/departments/${programme.department.slug}`
    : null;
  const summary =
    excerpt(programme?.about) ||
    "Review this programme's academic focus, entry requirements, curriculum, fees and application information.";
  const structuredFees: ProgrammeFeeDisplay[] = (
    programme?.fee_structures ?? []
  )
    .filter((item) => item.is_active !== false)
    .map((item) => ({
      item: item.title,
      amount: item.total_amount
        ? `${item.currency} ${new Intl.NumberFormat("en-KE").format(item.total_amount)}`
        : "Fee details pending University confirmation",
      notes: [label(item.applicant_type), label(item.fee_category), item.notes]
        .filter(Boolean)
        .join(" · "),
    }));
  const fees = structuredFees.length
    ? structuredFees
    : feesFrom(programme?.fees_structure);
  const requirements: ProgrammeRequirementDisplay[] = (
    programme?.admission_requirements ?? []
  )
    .filter((item) => item.is_active !== false)
    .map((item) => ({
      id: item.id,
      type: label(item.applicant_type),
      minimum: item.minimum_grade ?? "Confirm with admissions",
      notes:
        item.notes ??
        item.level ??
        "Programme-specific requirements may apply.",
    }));
  const documents: ProgrammeDocumentDisplay[] = (
    programme?.admission_documents ?? []
  )
    .filter((item) => item.is_published !== false)
    .map((item) => {
      const href =
        item.external_url ??
        publicFileUrl(item.media_id) ??
        "/admissions#requirements";
      return {
        id: item.id,
        title: item.title,
        type: label(item.document_type),
        href,
        external: href.startsWith("http"),
      };
    });
  if (programme?.brochure_id)
    documents.unshift({
      id: "programme-brochure",
      title: "Official programme brief",
      type: "Programme brochure",
      href: publicFileUrl(programme.brochure_id) ?? "#",
      external: false,
    });
  const facts = [
    { icon: GraduationCap, value: programmeLevel, label: "Qualification" },
    { icon: Users, value: studyMode, label: "Mode of study" },
    { icon: CalendarDays, value: duration, label: "Duration" },
    { icon: Landmark, value: intake, label: "Intake" },
  ];
  const accreditationStatus = accreditation(programme?.accreditation_status);

  return (
    <PageShell>
      <AboutPageLenis>
        <main className="bg-[linear-gradient(180deg,hsl(var(--surface-subtle)),#fff_32%,hsl(var(--surface-muted)))] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1680px]">
            <BreadcrumbTrail
              items={[
                { label: "Academics", href: "/academics" },
                { label: "Programmes", href: "/academics/programmes" },
                { label: title },
              ]}
            />
            <section className="mt-5 overflow-hidden rounded-3xl bg-white ring-1 ring-primary/10 lg:grid lg:grid-cols-[1fr_.9fr]">
              <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                  Programme overview
                </p>
                <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal leading-[1.05] tracking-tight text-primary sm:text-5xl">
                  {title}
                </h1>
                <span className="mt-4 h-0.5 w-9 bg-secondary" aria-hidden />
                <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  {summary}
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/admissions#how-to-apply"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-secondary px-6 text-xs font-bold uppercase tracking-wide text-white hover:bg-secondary/90"
                  >
                    Apply now <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  {programme?.brochure_id ? (
                    <Link
                      href={publicFileUrl(programme.brochure_id) ?? "#"}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 text-xs font-bold uppercase tracking-wide text-primary ring-1 ring-primary/20"
                    >
                      <Download className="h-4 w-4" aria-hidden />
                      Download programme brief
                    </Link>
                  ) : null}
                </div>
              </div>
              <PublicImage
                src={
                  publicFileUrl(programme?.cover_image_id) ??
                  "/images/backgrounds/KSUGreenLandscapingMay2026-7456.jpg"
                }
                alt={`Students representing ${title}`}
                ratio="fill"
                priority
                className="min-h-64 overflow-hidden lg:min-h-[29rem] lg:rounded-bl-[8rem]"
                imageClassName="object-cover"
                sizes="(min-width: 1024px) 45vw, 100vw"
                fallbackContent={
                  <BookOpenCheck
                    className="h-24 w-24 text-primary/40"
                    aria-hidden
                  />
                }
              />
            </section>

            <dl className="relative -mt-px grid grid-cols-2 overflow-hidden rounded-3xl bg-white ring-1 ring-primary/10 lg:-mt-8 lg:mx-7 lg:grid-cols-4">
              {facts.map(({ icon: Icon, value, label: factLabel }) => (
                <div
                  key={factLabel}
                  className="flex min-w-0 flex-col items-start gap-3 border-b border-r border-primary/10 p-4 even:border-r-0 lg:flex-row lg:items-center lg:border-b-0 lg:border-r lg:p-5 lg:even:border-r"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary ring-1 ring-primary/10">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <dd className="text-sm font-bold text-primary">{value}</dd>
                    <dt className="mt-1 text-xs text-muted-foreground">
                      {factLabel}
                    </dt>
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
              <div>
                <ProgrammeDetailSections
                  about={programme?.about}
                  objectives={programme?.objectives}
                  entryRequirements={programme?.entry_requirements}
                  curriculum={programme?.curriculum_overview}
                  careers={programme?.career_prospects}
                  fees={fees}
                  requirements={requirements}
                  accreditation={accreditationStatus}
                  accreditingBody={programme?.accrediting_body}
                  documents={documents}
                />
                <Link
                  href="/admissions#how-to-apply"
                  className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-lg bg-secondary px-6 text-xs font-bold uppercase tracking-wide text-white lg:hidden"
                >
                  Apply now <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              <aside className="hidden gap-5 xl:sticky xl:top-28 xl:grid">
                <section className="rounded-3xl bg-white p-6 ring-1 ring-primary/10">
                  <h2 className="font-[family-name:var(--font-display)] text-2xl font-normal tracking-tight text-primary">
                    Programme details
                  </h2>
                  <span className="mt-3 block h-0.5 w-10 bg-secondary" />
                  <dl className="mt-3">
                    <Detail label="Programme">{title}</Detail>
                    <Detail label="Award">{programmeLevel}</Detail>
                    <Detail label="Mode of study">{studyMode}</Detail>
                    <Detail label="Duration">{duration}</Detail>
                    <Detail label="Intake">{intake}</Detail>
                    <Detail label="Department">
                      {departmentHref ? (
                        <Link
                          href={departmentHref}
                          className="text-primary hover:underline"
                        >
                          {department}
                        </Link>
                      ) : (
                        department
                      )}
                    </Detail>
                  </dl>
                </section>
                <section className="rounded-3xl bg-white p-6 ring-1 ring-primary/10">
                  <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                    Fees & funding
                  </p>
                  <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-primary">
                    {fees[0]?.amount ?? "Fee details pending University confirmation"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {fees[0]?.notes ??
                      "Confirm the latest approved fee structure with the University."}
                  </p>
                  <Link
                    href="/admissions#fees"
                    className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline"
                  >
                    Funding guidance{" "}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </section>
              </aside>
            </div>

            {data.relatedProgrammes.length ? (
              <section className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-primary/10">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-normal tracking-tight text-primary">
                  Related programmes
                </h2>
                <div className="mt-5 grid gap-3 lg:grid-cols-3">
                  {data.relatedProgrammes.slice(0, 3).map((item) => (
                    <Link
                      key={item.id}
                      href={`/academics/programmes/${item.slug}`}
                      className="group flex min-h-20 items-center gap-3 rounded-2xl p-4 ring-1 ring-primary/10 hover:ring-primary/30"
                    >
                      <GraduationCap
                        className="h-5 w-5 shrink-0 text-primary"
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-foreground">
                          {item.name}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {level(item.level, item.name)}
                          {item.duration ? ` · ${item.duration}` : ""}
                        </span>
                      </span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1"
                        aria-hidden
                      />
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </main>
      </AboutPageLenis>
    </PageShell>
  );
}
