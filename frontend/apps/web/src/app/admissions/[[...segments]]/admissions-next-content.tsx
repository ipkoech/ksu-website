import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Download,
  ExternalLink,
  Files,
  FileText,
  GraduationCap,
  HelpCircle,
  Landmark,
  PlayCircle,
  Radio,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  AdmissionApplicantType,
  AdmissionDocument,
  AdmissionFaq,
  AdmissionPathway,
  AdmissionRequirement,
  Programme,
  ProgrammeFeeStructure,
} from "@ksu/api-client";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { PublicImage } from "@/components/public/public-image";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { publicFileUrl } from "@/lib/public-media";
import type {
  AdmissionsIntakeSummary,
  AdmissionsPageData,
} from "@/lib/get-admissions";

const officialLinks = {
  onlineApplication:
    "https://digital.kisiiuniversity.ac.ke/new_student_landing_page",
  admissionCenter:
    "https://digital.kisiiuniversity.ac.ke/students/admissions/center",
  contact: "/contact",
  programmes: "/academics/programmes",
};

const pathwayIcons: Record<string, LucideIcon> = {
  kuccps: Landmark,
  self_sponsored: GraduationCap,
  international: ShieldCheck,
  transfer: ArrowRight,
  postgraduate: BookOpenCheck,
  diploma_certificate: ClipboardCheck,
};

const fallbackPathways: AdmissionPathway[] = [
  {
    id: "fallback-kuccps",
    title: "KUCCPS",
    slug: "kuccps",
    applicant_type: "kuccps",
    summary:
      "For government-sponsored applicants placed through the Kenya Universities and Colleges Central Placement Service.",
    eligibility_notes:
      "Confirm placement details, programme requirements and reporting instructions before registration.",
    application_steps: [
      {
        title: "Confirm placement",
        body: "Use official KUCCPS and KSU records.",
      },
      {
        title: "Download documents",
        body: "Use the admission centre when letters are released.",
      },
    ],
    required_documents: [
      { title: "KCSE certificate/result slip" },
      { title: "National ID or birth certificate" },
      { title: "KUCCPS placement details" },
    ],
    cta_label: "Admission centre",
    cta_url: officialLinks.admissionCenter,
    is_published: true,
    display_order: 10,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-self",
    title: "Self-sponsored",
    slug: "self-sponsored",
    applicant_type: "self_sponsored",
    summary:
      "For applicants applying directly to Kisii University through the online application system.",
    eligibility_notes:
      "Choose a programme, confirm the entry route and apply before the advertised deadline.",
    application_steps: [
      {
        title: "Choose a programme",
        body: "Compare level, department and requirements.",
      },
      {
        title: "Apply online",
        body: "Submit through the official application portal.",
      },
    ],
    required_documents: [
      { title: "Academic certificates" },
      { title: "Identification details" },
      { title: "Passport photo" },
    ],
    cta_label: "Apply online",
    cta_url: officialLinks.onlineApplication,
    is_published: true,
    display_order: 20,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-international",
    title: "International",
    slug: "international",
    applicant_type: "international",
    summary:
      "For applicants with international qualifications and students joining from outside Kenya.",
    eligibility_notes:
      "Prepare certified academic records, passport details and equivalence documentation where required.",
    application_steps: [
      {
        title: "Prepare certified records",
        body: "Attach translated records where required.",
      },
      {
        title: "Contact admissions",
        body: "Confirm immigration and reporting guidance.",
      },
    ],
    required_documents: [
      { title: "Certified academic records" },
      { title: "Passport bio-data page" },
      { title: "Equivalence or accreditation evidence" },
    ],
    cta_label: "Contact admissions",
    cta_url: officialLinks.contact,
    is_published: true,
    display_order: 30,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-transfer",
    title: "Transfer",
    slug: "transfer",
    applicant_type: "transfer",
    summary:
      "For applicants seeking inter-university or programme transfer guidance.",
    eligibility_notes:
      "Confirm Senate-recognized transfer requirements and provide certified academic history.",
    application_steps: [
      {
        title: "Check eligibility",
        body: "Confirm transfer rules with admissions.",
      },
      { title: "Prepare transcripts", body: "Attach prior academic records." },
    ],
    required_documents: [
      { title: "Transfer request evidence" },
      { title: "Academic transcripts" },
      { title: "Identification details" },
    ],
    cta_label: "Ask admissions",
    cta_url: officialLinks.contact,
    is_published: true,
    display_order: 40,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-postgraduate",
    title: "Postgraduate",
    slug: "postgraduate",
    applicant_type: "postgraduate",
    summary: "For postgraduate diploma, masters and doctoral applicants.",
    eligibility_notes:
      "Prepare degree certificates, transcripts, referees and research concept documents where required.",
    application_steps: [
      {
        title: "Select graduate programme",
        body: "Review school and department requirements.",
      },
      {
        title: "Submit documents",
        body: "Attach transcripts and graduate-level evidence.",
      },
    ],
    required_documents: [
      { title: "Degree certificate and transcripts" },
      { title: "Referee details where required" },
      { title: "Research proposal for doctoral routes" },
    ],
    cta_label: "Apply online",
    cta_url: officialLinks.onlineApplication,
    is_published: true,
    display_order: 50,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-diploma",
    title: "Diploma / Certificate",
    slug: "diploma-certificate",
    applicant_type: "diploma_certificate",
    summary:
      "For certificate, bridging and diploma applicants joining professional and academic pathways.",
    eligibility_notes:
      "Confirm the minimum grade and programme-specific requirements before applying.",
    application_steps: [
      {
        title: "Check minimum grade",
        body: "Review certificate or diploma route.",
      },
      {
        title: "Apply before deadline",
        body: "Submit through official KSU channels.",
      },
    ],
    required_documents: [
      { title: "KCSE certificate/result slip" },
      { title: "Certificate progression evidence where applicable" },
      { title: "Identification details" },
    ],
    cta_label: "Apply online",
    cta_url: officialLinks.onlineApplication,
    is_published: true,
    display_order: 60,
    created_at: "",
    updated_at: "",
  },
];

export function AdmissionsNextContent({
  segments,
  data,
}: {
  segments: string[];
  data: AdmissionsPageData;
}) {
  const area = segments[0] ?? "landing";
  const pathways = data.pathways.length
    ? [...data.pathways].sort(byDisplayOrder)
    : fallbackPathways;
  const selectedPathway =
    pathways.find((item) => item.slug === area) ??
    pathways.find((item) => item.applicant_type === area) ??
    pathways[0];

  return (
    <PageShell>
      <AboutPageLenis>
        <AdmissionsVisualStyles />
        <AdmissionsHero data={data} />
        <PathwaySelector
          pathways={pathways}
          activeSlug={selectedPathway?.slug}
        />
        {area === "requirements" ? (
          <RequirementsPage data={data} />
        ) : area === "fees" ? (
          <FeesPage data={data} />
        ) : area === "documents" || area === "brochures" ? (
          <DocumentsPage documents={data.documents} />
        ) : area === "intakes" ? (
          <IntakesPage intakes={data.intakes} />
        ) : area === "how-to-apply" ? (
          <HowToApplyPage pathways={pathways} documents={data.documents} />
        ) : (
          <AdmissionsLanding
            data={data}
            pathways={pathways}
            selectedPathway={selectedPathway}
          />
        )}
        <AdmissionsSupport />
      </AboutPageLenis>
    </PageShell>
  );
}

function AdmissionsHero({ data }: { data: AdmissionsPageData }) {
  const current = currentIntake(data.intakes);
  const heroSection = data.pageSections.find(
    (section) =>
      section.page_key === "admissions" && section.section_key === "hero",
  );
  const heroImageUrl =
    publicFileUrl(heroSection?.media_id) ??
    data.admissionInfo.find((item) => item.coverImageUrl)?.coverImageUrl;
  const heroVideoUrl = settingString(heroSection?.settings, [
    "videoUrl",
    "video_url",
    "video",
  ]);
  return (
    <section className="overflow-hidden border-b border-border bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_34%),linear-gradient(135deg,#ffffff_0%,hsl(var(--surface-subtle))_52%,rgba(14,165,233,0.12)_100%)] px-4 py-8 sm:px-6 lg:px-8 lg:py-12 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.72fr)] lg:items-center">
        <div className="motion-safe:animate-[admissions-rise_.7s_ease-out_both]">
          <BreadcrumbTrail
            items={[
              { label: "Home", href: "/" },
              { label: "Admissions", href: "/admissions" },
            ]}
          />
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            Kisii University Admissions
          </p>
          <h1 className="mt-3 max-w-4xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.98] text-foreground sm:text-6xl lg:text-7xl">
            Start with the right pathway.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            Choose your applicant route, confirm requirements, check live
            intakes and apply through official Kisii University systems.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href={officialLinks.onlineApplication} external primary>
              Apply online
            </ButtonLink>
            <ButtonLink href={officialLinks.admissionCenter} external>
              Download admission letter
            </ButtonLink>
          </div>
          <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Use only official university admissions links before submitting or
            paying.
          </p>
        </div>
        <div className="grid gap-4 motion-safe:animate-[admissions-rise_.8s_ease-out_.08s_both]">
          <AdmissionsMediaFrame
            title="Admissions guide"
            caption="A visual walkthrough for choosing a pathway, applying and tracking your admission."
            imageUrl={heroImageUrl}
            videoUrl={heroVideoUrl}
            variant="hero"
          />
          <CurrentIntakePanel intake={current} />
        </div>
      </div>
    </section>
  );
}

function CurrentIntakePanel({ intake }: { intake?: AdmissionsIntakeSummary }) {
  const rows = intake
    ? [
        ["Application opens", formatDate(intake.applicationStart)],
        ["Application deadline", formatDate(intake.applicationEnd)],
        ["Late deadline", formatDate(intake.lateApplicationEnd)],
        ["Status", intakeStatus(intake)],
      ]
    : [
        ["Live intakes", "Confirm in the application portal"],
        ["Admission letters", "Use the admission centre"],
        ["Reporting", "Follow published instructions"],
      ];

  return (
    <aside className="rounded-[1.25rem] border border-white/70 bg-white/[0.92] p-5 shadow-xl shadow-primary/10 backdrop-blur sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
          <CalendarDays className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            Current intake status
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            {intake?.name ?? "Admissions portal"}
          </h2>
        </div>
      </div>
      <dl className="mt-5 divide-y divide-border">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 py-2.5"
          >
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-right text-sm font-semibold text-foreground">
              {value || "To be confirmed"}
            </dd>
          </div>
        ))}
      </dl>
      <ButtonLink
        href="/admissions/intakes"
        className="mt-5 w-full justify-center"
        primary
      >
        View intakes
      </ButtonLink>
    </aside>
  );
}

function PathwaySelector({
  pathways,
  activeSlug,
}: {
  pathways: AdmissionPathway[];
  activeSlug?: string;
}) {
  return (
    <nav className="border-b border-primary/20 bg-primary px-4 py-5 text-white sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto max-w-[1680px]">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/75">
          Choose your applicant pathway
        </p>
        <div className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 sm:grid-cols-2 lg:grid-cols-6">
          {pathways.map((pathway) => {
            const Icon = pathwayIcons[pathway.applicant_type] ?? GraduationCap;
            const active = pathway.slug === activeSlug;
            return (
              <Link
                key={pathway.id}
                href={`/admissions/${pathway.slug}`}
                className={`group relative flex min-h-24 flex-col items-center justify-center gap-2 overflow-hidden px-3 text-center text-sm font-semibold transition ${
                  active
                    ? "bg-white text-primary"
                    : "bg-primary text-white hover:bg-white/10"
                }`}
              >
                <span
                  className={`absolute inset-x-0 top-0 h-1 transition ${
                    active
                      ? "bg-secondary"
                      : "bg-white/0 group-hover:bg-secondary"
                  }`}
                />
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                    active
                      ? "bg-primary/10"
                      : "bg-white/10 group-hover:bg-white/15"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span>{pathway.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function AdmissionsLanding({
  data,
  pathways,
  selectedPathway,
}: {
  data: AdmissionsPageData;
  pathways: AdmissionPathway[];
  selectedPathway?: AdmissionPathway;
}) {
  return (
    <main className="bg-white px-4 py-10 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)]">
        <div className="min-w-0">
          <PathwayFeature pathway={selectedPathway ?? pathways[0]} />
          <RequirementsTable
            programmes={data.programmes}
            requirements={data.requirements}
          />
        </div>
        <aside className="grid content-start gap-5">
          <JourneyList />
          <DocumentsPanel documents={data.documents} />
          <FaqPanel faqs={data.faqs} />
        </aside>
      </div>
    </main>
  );
}

function PathwayFeature({ pathway }: { pathway: AdmissionPathway }) {
  const steps = arrayItems(pathway.application_steps);
  const docs = arrayItems(pathway.required_documents);
  const imageUrl = publicFileUrl(pathway.cover_image_id);
  const Icon = pathwayIcons[pathway.applicant_type] ?? GraduationCap;
  return (
    <section className="border-b border-border pb-8 motion-safe:animate-[admissions-rise_.65s_ease-out_both]">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(300px,0.48fr)] xl:items-stretch">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
            Applicant route
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-foreground">
            {pathway.title}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
            {pathway.summary}
          </p>
          {pathway.eligibility_notes ? (
            <p className="mt-4 border-l-4 border-secondary bg-accent px-4 py-3 text-sm leading-7 text-primary">
              {pathway.eligibility_notes}
            </p>
          ) : null}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <MiniList
              title="Application steps"
              icon={ClipboardCheck}
              items={steps}
            />
            <MiniList title="Required documents" icon={FileText} items={docs} />
          </div>
          {pathway.cta_url ? (
            <ButtonLink
              href={pathway.cta_url}
              external={pathway.cta_url.startsWith("http")}
              className="mt-6"
              primary
            >
              {pathway.cta_label ?? "Continue"}
            </ButtonLink>
          ) : null}
        </div>
        <AdmissionsMediaFrame
          title={`${pathway.title} route`}
          caption="Confirm eligibility, prepare documents and continue through official university systems."
          imageUrl={imageUrl}
          icon={Icon}
          variant="pathway"
        />
      </div>
    </section>
  );
}

function RequirementsPage({ data }: { data: AdmissionsPageData }) {
  return (
    <main className="bg-white px-4 py-10 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto max-w-[1680px]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(320px,0.4fr)] lg:items-end">
          <SectionHeader
            eyebrow="Admission requirements"
            title="Entry requirements at a glance"
            body="Use this matrix as the first filter, then open the programme detail page for programme-specific requirements and fees."
          />
          <InsightVisual
            icon={Search}
            title="Filter first. Confirm officially."
            points={[
              `${data.requirements.length || data.programmes.length} requirement records available`,
              "Programme-specific rules stay linked to programme pages",
              "Applicant route and level remain visible while comparing",
            ]}
          />
        </div>
        <RequirementsTable
          programmes={data.programmes}
          requirements={data.requirements}
          full
        />
      </div>
    </main>
  );
}

function FeesPage({ data }: { data: AdmissionsPageData }) {
  return (
    <main className="bg-white px-4 py-10 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto max-w-[1680px]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(320px,0.4fr)] lg:items-end">
          <SectionHeader
            eyebrow="Programme fees"
            title="Fees are managed under programme detail"
            body="The admissions section points applicants to programme-specific fee records. Amounts should be confirmed from the approved fee structure and the official application portal."
          />
          <InsightVisual
            icon={FileText}
            title="Fees follow programme, intake and category."
            points={[
              `${data.feeStructures.length} structured fee records`,
              "Applicants open programme pages for the approved detail",
              "Downloadable attachments can be linked as media",
            ]}
          />
        </div>
        <FeesGrid fees={data.feeStructures} programmes={data.programmes} />
      </div>
    </main>
  );
}

function DocumentsPage({ documents }: { documents: AdmissionDocument[] }) {
  return (
    <main className="bg-white px-4 py-10 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto max-w-[1680px]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(320px,0.4fr)] lg:items-end">
          <SectionHeader
            eyebrow="Admissions documents"
            title="Forms, booklets and joining documents"
            body="Download official admissions resources and follow the admission centre for admission-letter access."
          />
          <InsightVisual
            icon={Files}
            title="Official documents stay discoverable."
            points={[
              `${documents.length} published admissions resources`,
              "External portals are clearly marked",
              "Future PDFs can use the existing media attachment field",
            ]}
          />
        </div>
        <DocumentGrid documents={documents} />
      </div>
    </main>
  );
}

function IntakesPage({ intakes }: { intakes: AdmissionsIntakeSummary[] }) {
  return (
    <main className="bg-white px-4 py-10 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto max-w-[1680px]">
        <SectionHeader
          eyebrow="Current intakes"
          title="Application windows and reporting timelines"
          body="Use these records for planning, then confirm live availability in the official application portal."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(intakes.length ? intakes : []).map((intake) => (
            <article
              key={intake.id}
              className="border border-border bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                {intakeStatus(intake)}
              </p>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
                {intake.name}
              </h3>
              <dl className="mt-4 divide-y divide-border text-sm">
                <DateRow label="Opens" value={intake.applicationStart} />
                <DateRow label="Closes" value={intake.applicationEnd} />
                <DateRow
                  label="Late deadline"
                  value={intake.lateApplicationEnd}
                />
              </dl>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

function HowToApplyPage({
  pathways,
  documents,
}: {
  pathways: AdmissionPathway[];
  documents: AdmissionDocument[];
}) {
  return (
    <main className="bg-white px-4 py-10 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto max-w-[1680px]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(320px,0.4fr)] lg:items-end">
          <SectionHeader
            eyebrow="How to apply"
            title="Prepare, apply and track through official systems"
            body="The safest admissions journey is programme first, pathway second, intake third, official submission fourth."
          />
          <AdmissionsMediaFrame
            title="Application journey"
            caption="A motion-safe visual map of the admissions journey from programme discovery to reporting."
            icon={Route}
            variant="compact"
          />
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.38fr)]">
          <JourneyList large />
          <DocumentsPanel documents={documents} />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pathways.map((pathway) => (
            <Link
              key={pathway.id}
              href={`/admissions/${pathway.slug}`}
              className="group relative overflow-hidden border border-border bg-white p-5 transition hover:-translate-y-1 hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-lg hover:shadow-primary/10"
            >
              <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
                {(() => {
                  const Icon =
                    pathwayIcons[pathway.applicant_type] ?? GraduationCap;
                  return <Icon className="h-5 w-5" aria-hidden />;
                })()}
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-secondary">
                {formatApplicantType(pathway.applicant_type)}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-foreground">
                {pathway.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {pathway.summary}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                View route <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

function RequirementsTable({
  programmes,
  requirements,
  full = false,
}: {
  programmes: Programme[];
  requirements: AdmissionRequirement[];
  full?: boolean;
}) {
  const rows = requirements.length
    ? requirements.slice(0, full ? 30 : 8)
    : programmes.slice(0, full ? 24 : 6).map((programme) => ({
        id: programme.id,
        title: programme.name,
        applicant_type: inferApplicantType(programme.level),
        level: programme.level,
        minimum_grade: programme.entry_requirements
          ? stripHtml(programme.entry_requirements).slice(0, 120)
          : "Confirm with admissions",
        notes: programme.cluster_subjects?.length
          ? programme.cluster_subjects.map((item) => item.subject).join(", ")
          : "Programme-specific requirements may apply.",
        programme_id: programme.id,
        is_active: true,
        display_order: 100,
        created_at: "",
        updated_at: "",
      }));

  return (
    <section className="mt-8">
      <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
        <div className="flex min-h-11 items-center gap-2 border border-border bg-white px-3 text-sm text-muted-foreground shadow-sm">
          <Search className="h-4 w-4" aria-hidden />
          Search programmes from the programme catalogue
        </div>
        <div className="border border-border bg-white px-3 py-3 text-sm text-muted-foreground shadow-sm">
          Level
        </div>
        <div className="border border-border bg-white px-3 py-3 text-sm text-muted-foreground shadow-sm">
          Applicant type
        </div>
      </div>
      <div className="overflow-x-auto border border-border bg-white shadow-sm">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 font-semibold">Programme / rule</th>
              <th className="px-4 py-3 font-semibold">Level</th>
              <th className="px-4 py-3 font-semibold">Applicant type</th>
              <th className="px-4 py-3 font-semibold">Minimum requirement</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => {
              const programme = programmes.find(
                (item) => item.id === row.programme_id,
              );
              return (
                <tr key={row.id} className="align-top">
                  <th className="px-4 py-4 font-semibold text-foreground">
                    {programme?.name ?? row.title}
                  </th>
                  <td className="px-4 py-4 text-muted-foreground">
                    {formatText(row.level)}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {formatApplicantType(row.applicant_type)}
                  </td>
                  <td className="max-w-md px-4 py-4 leading-6 text-muted-foreground">
                    {row.minimum_grade ??
                      row.notes ??
                      "Confirm with admissions"}
                  </td>
                  <td className="px-4 py-4">
                    {programme ? (
                      <Link
                        href={`/academics/programmes/${programme.slug}`}
                        className="inline-flex items-center gap-1 font-semibold text-primary"
                      >
                        View programme <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <Link
                        href="/admissions/how-to-apply"
                        className="inline-flex items-center gap-1 font-semibold text-primary"
                      >
                        How to apply <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FeesGrid({
  fees,
  programmes,
}: {
  fees: ProgrammeFeeStructure[];
  programmes: Programme[];
}) {
  const rows = fees.slice(0, 24);
  if (!rows.length) {
    return (
      <p className="mt-8 border border-border bg-white p-5 text-sm leading-7 text-muted-foreground">
        Programme-specific fee records have not been published yet. Open each
        programme detail page or contact admissions for the approved fee
        schedule.
      </p>
    );
  }

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((fee) => {
        const programme = programmes.find(
          (item) => item.id === fee.programme_id,
        );
        return (
          <article
            key={fee.id}
            className="group relative overflow-hidden border border-border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
          >
            <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
              <FileText className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-secondary">
              {formatApplicantType(fee.applicant_type)}
            </p>
            <h3 className="mt-3 text-xl font-semibold text-foreground">
              {programme?.name ?? fee.title}
            </h3>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <FeeTerm
                label="Tuition"
                value={money(fee.currency, fee.tuition_amount)}
              />
              <FeeTerm
                label="Statutory"
                value={money(fee.currency, fee.statutory_amount)}
              />
              <FeeTerm
                label="Other"
                value={money(fee.currency, fee.other_amount)}
              />
              <FeeTerm
                label="Total"
                value={money(fee.currency, fee.total_amount)}
                strong
              />
            </dl>
            {programme ? (
              <Link
                href={`/academics/programmes/${programme.slug}`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                View programme fees <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function DocumentGrid({ documents }: { documents: AdmissionDocument[] }) {
  const rows = documents.length
    ? documents
    : [
        {
          id: "admission-centre",
          title: "Admission Letter Centre",
          slug: "admission-letter-centre",
          document_type: "joining_instructions" as const,
          summary:
            "Use the external admission centre to access admission letters and joining documents when published.",
          external_url: officialLinks.admissionCenter,
          is_published: true,
          display_order: 10,
          created_at: "",
          updated_at: "",
        },
      ];
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((doc) => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}

function DocumentsPanel({ documents }: { documents: AdmissionDocument[] }) {
  return (
    <section className="border border-border bg-white p-5 shadow-sm">
      <PanelTitle icon={Download} title="Documents" />
      <div className="mt-4 grid gap-3">
        {(documents.length ? documents.slice(0, 4) : []).map((document) => (
          <DocumentCard key={document.id} document={document} compact />
        ))}
        {!documents.length ? (
          <ButtonLink href={officialLinks.admissionCenter} external>
            Open admission centre
          </ButtonLink>
        ) : null}
      </div>
    </section>
  );
}

function DocumentCard({
  document,
  compact = false,
}: {
  document: AdmissionDocument;
  compact?: boolean;
}) {
  const href =
    document.external_url ?? `/admissions/documents/${document.slug}`;
  const mediaUrl = publicFileUrl(document.media_id);
  return (
    <Link
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className={`group block overflow-hidden border border-border bg-white transition hover:-translate-y-1 hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-lg hover:shadow-primary/10 ${
        compact ? "p-3" : "p-5 shadow-sm"
      }`}
    >
      {!compact ? (
        <div className="mb-4">
          <AdmissionsMediaFrame
            title={document.title}
            caption={
              formatText(document.document_type) ?? "Admissions document"
            }
            imageUrl={mediaUrl}
            icon={FileText}
            variant="document"
          />
        </div>
      ) : null}
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-secondary">
        {formatText(document.document_type)}
      </p>
      <h3
        className={
          compact ? "mt-1 text-sm font-semibold" : "mt-3 text-xl font-semibold"
        }
      >
        {document.title}
      </h3>
      {!compact && document.summary ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {document.summary}
        </p>
      ) : null}
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        Open <ExternalLink className="h-4 w-4" aria-hidden />
      </span>
    </Link>
  );
}

function FaqPanel({ faqs }: { faqs: AdmissionFaq[] }) {
  const rows = faqs.length
    ? faqs.slice(0, 5)
    : [
        {
          id: "faq-apply",
          question: "Where do I apply?",
          answer:
            "Use the official Kisii University online application portal.",
          is_published: true,
          display_order: 10,
          created_at: "",
          updated_at: "",
        },
        {
          id: "faq-letter",
          question: "Where do I download my admission letter?",
          answer:
            "Use the external admission centre once admission letters are released.",
          is_published: true,
          display_order: 20,
          created_at: "",
          updated_at: "",
        },
      ];
  return (
    <section className="border border-border bg-white p-5 shadow-sm">
      <PanelTitle icon={HelpCircle} title="FAQs" />
      <div className="mt-4 divide-y divide-border">
        {rows.map((faq) => (
          <details key={faq.id} className="group py-3">
            <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
              {faq.question}
            </summary>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

function JourneyList({ large = false }: { large?: boolean }) {
  const steps = [
    [
      "Find programme",
      "Compare programme level, duration and career direction.",
      officialLinks.programmes,
    ],
    [
      "Check pathway",
      "Choose KUCCPS, self-sponsored, international, transfer or postgraduate.",
      "/admissions",
    ],
    [
      "Confirm requirements",
      "Review general and programme-specific requirements.",
      "/admissions/requirements",
    ],
    [
      "Apply officially",
      "Submit only through approved Kisii University systems.",
      officialLinks.onlineApplication,
    ],
    [
      "Track admission",
      "Use the admission centre for letters and documents.",
      officialLinks.admissionCenter,
    ],
  ];
  return (
    <section
      className={large ? "" : "border border-border bg-white p-5 shadow-sm"}
    >
      {!large ? (
        <PanelTitle icon={CheckCircle2} title="Application flow" />
      ) : null}
      <ol className={large ? "grid gap-4 md:grid-cols-5" : "mt-4 grid gap-3"}>
        {steps.map(([title, body, href], index) => (
          <li
            key={title}
            className="relative overflow-hidden border border-border bg-white p-4 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <span className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--secondary)))]" />
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              {index + 1}
            </span>
            <h3 className="mt-4 text-base font-semibold text-foreground">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {body}
            </p>
            <Link
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function AdmissionsSupport() {
  return (
    <section className="bg-primary px-4 py-6 text-white sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">
            Need help?
          </p>
          <h2 className="mt-1 text-2xl font-semibold">
            Contact admissions before you submit.
          </h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink
            href="/contact"
            className="bg-white text-primary hover:bg-white/90"
          >
            Contact admissions
          </ButtonLink>
          <ButtonLink href={officialLinks.admissionCenter} external>
            Admission centre
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function AdmissionsMediaFrame({
  title,
  caption,
  imageUrl,
  videoUrl,
  icon: Icon = Sparkles,
  variant = "compact",
}: {
  title: string;
  caption: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  icon?: LucideIcon;
  variant?: "hero" | "pathway" | "compact" | "document";
}) {
  const tall = variant === "hero";
  const compact = variant === "compact" || variant === "document";

  return (
    <figure
      className={`group relative overflow-hidden rounded-[1.4rem] border border-primary/15 bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.2),transparent_28%),linear-gradient(135deg,#f8fdff,#eef9ff_52%,#ffffff)] shadow-xl shadow-primary/10 ${
        tall ? "min-h-[360px] sm:min-h-[430px]" : "min-h-[210px]"
      } ${variant === "document" ? "rounded-2xl shadow-sm" : ""}`}
    >
      {videoUrl ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          controls
          playsInline
          preload="none"
          poster={imageUrl ?? undefined}
        >
          <source src={videoUrl} />
        </video>
      ) : imageUrl ? (
        <PublicImage
          src={imageUrl}
          alt={title}
          ratio="fill"
          className="absolute inset-0 h-full w-full"
          imageClassName="object-cover transition duration-700 group-hover:scale-[1.03]"
          sizes={
            tall
              ? "(min-width: 1024px) 42vw, 100vw"
              : "(min-width: 1024px) 28vw, 100vw"
          }
          fallbackContent={<AcademicVisual icon={Icon} compact={compact} />}
        />
      ) : (
        <AcademicVisual icon={Icon} compact={compact} />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(2,57,78,0.74))]" />
      <figcaption className="absolute inset-x-0 bottom-0 z-10 p-5 text-white sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.16] text-white ring-1 ring-white/20 backdrop-blur">
            {videoUrl ? (
              <PlayCircle className="h-5 w-5" aria-hidden />
            ) : (
              <Icon className="h-5 w-5" aria-hidden />
            )}
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/75">
              {videoUrl ? "Video guide" : "Visual guide"}
            </p>
            <h3 className="mt-1 text-lg font-semibold">{title}</h3>
          </div>
        </div>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/[0.82]">
          {caption}
        </p>
      </figcaption>
    </figure>
  );
}

function AcademicVisual({
  icon: Icon,
  compact = false,
}: {
  icon: LucideIcon;
  compact?: boolean;
}) {
  const nodes = compact
    ? ["Apply", "Verify", "Track"]
    : ["Programme", "Pathway", "Requirements", "Application"];

  return (
    <div className="absolute inset-0 overflow-hidden bg-[linear-gradient(135deg,#e0f7ff_0%,#ffffff_48%,#dff4ff_100%)]">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-primary/20 bg-primary/10 motion-safe:animate-[admissions-drift_8s_ease-in-out_infinite]" />
      <div className="absolute -bottom-20 -left-14 h-56 w-56 rounded-full border border-secondary/20 bg-secondary/10 motion-safe:animate-[admissions-drift_10s_ease-in-out_infinite_reverse]" />
      <div className="absolute inset-8 grid place-items-center">
        <div className="relative w-full max-w-xl">
          <div className="absolute left-8 right-8 top-1/2 h-px -translate-y-1/2 bg-primary/25" />
          <div
            className={`relative grid gap-3 ${
              compact ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"
            }`}
          >
            {nodes.map((node, index) => (
              <div
                key={node}
                className="motion-safe:animate-[admissions-rise_.65s_ease-out_both]"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/80 bg-white text-primary shadow-lg shadow-primary/10">
                  {index === 0 ? (
                    <Icon className="h-6 w-6" aria-hidden />
                  ) : (
                    <span className="text-sm font-black">{index + 1}</span>
                  )}
                </div>
                <p className="mt-3 text-center text-xs font-bold uppercase tracking-[0.1em] text-primary/80">
                  {node}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Radio
        className="absolute right-8 top-8 h-7 w-7 text-primary/25 motion-safe:animate-pulse"
        aria-hidden
      />
    </div>
  );
}

function InsightVisual({
  icon: Icon,
  title,
  points,
}: {
  icon: LucideIcon;
  title: string;
  points: string[];
}) {
  return (
    <aside className="relative overflow-hidden rounded-[1.25rem] border border-primary/15 bg-[linear-gradient(135deg,hsl(var(--primary)),#057ca8)] p-5 text-white shadow-xl shadow-primary/15 motion-safe:animate-[admissions-rise_.75s_ease-out_both]">
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/10" />
      <div className="relative">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
          <Icon className="h-6 w-6" aria-hidden />
        </span>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight">
          {title}
        </h2>
        <ul className="mt-4 grid gap-3 text-sm leading-6 text-white/[0.84]">
          {points.map((point) => (
            <li key={point} className="flex gap-2">
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-secondary" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <header className="max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
        {eyebrow}
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 text-base leading-8 text-muted-foreground">{body}</p>
    </header>
  );
}

function AdmissionsVisualStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          @keyframes admissions-rise {
            from { opacity: 0; transform: translateY(18px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes admissions-drift {
            0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
            50% { transform: translate3d(-12px, 10px, 0) scale(1.04); }
          }
          @media (prefers-reduced-motion: reduce) {
            [class*="admissions-rise"],
            [class*="admissions-drift"] {
              animation: none !important;
            }
          }
        `,
      }}
    />
  );
}

function MiniList({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: LucideIcon;
  items: Record<string, unknown>[];
}) {
  return (
    <section className="border border-border bg-white p-4">
      <PanelTitle icon={Icon} title={title} />
      <ul className="mt-4 grid gap-3">
        {(items.length ? items : [{ title: "Confirm with admissions" }]).map(
          (item, index) => (
            <li key={index} className="flex gap-3 text-sm leading-6">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <span className="font-semibold text-foreground">
                  {String(item.title ?? item.label ?? `Item ${index + 1}`)}
                </span>
                {item.body || item.description ? (
                  <span className="block text-muted-foreground">
                    {String(item.body ?? item.description)}
                  </span>
                ) : null}
              </span>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}

function PanelTitle({
  icon: Icon,
  title,
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center bg-primary/[0.08] text-primary">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
        {title}
      </h2>
    </div>
  );
}

function ButtonLink({
  href,
  children,
  primary = false,
  external,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
  external?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`inline-flex min-h-11 items-center gap-2 rounded-md px-5 py-3 text-sm font-bold transition ${
        primary
          ? "bg-primary text-white hover:bg-primary/90"
          : "border border-primary/20 bg-white text-primary hover:bg-primary/[0.05]"
      } ${className}`}
    >
      {children}
      {external ? (
        <ExternalLink className="h-4 w-4" aria-hidden />
      ) : (
        <ArrowRight className="h-4 w-4" aria-hidden />
      )}
    </Link>
  );
}

function FeeTerm({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={strong ? "text-primary" : ""}>
      <dt className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}

function DateRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground">{formatDate(value)}</dd>
    </div>
  );
}

function settingString(value: unknown, keys: string[]) {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  for (const key of keys) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  return null;
}

function arrayItems(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" && item !== null,
      )
    : [];
}

function byDisplayOrder(
  a: { display_order?: number },
  b: { display_order?: number },
) {
  return (a.display_order ?? 100) - (b.display_order ?? 100);
}

function currentIntake(intakes: AdmissionsIntakeSummary[]) {
  return (
    intakes.find(
      (intake) => intake.isOpen && !isPastDate(intake.applicationEnd),
    ) ?? intakes[0]
  );
}

function intakeStatus(intake: AdmissionsIntakeSummary) {
  if (intake.isOpen && !isPastDate(intake.applicationEnd)) return "Open";
  if (isPastDate(intake.applicationEnd)) return "Closed";
  return "Scheduled";
}

function isPastDate(value?: string | null) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
}

function formatDate(value?: string | null) {
  if (!value) return "To be confirmed";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  }).format(date);
}

function formatApplicantType(value?: AdmissionApplicantType | string | null) {
  return formatText(value) || "General";
}

function formatText(value?: string | null) {
  return value
    ? value
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "General";
}

function stripHtml(value?: string | null) {
  return (value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferApplicantType(level?: string | null): AdmissionApplicantType {
  const text = (level ?? "").toLowerCase();
  if (text.includes("post")) return "postgraduate";
  if (text.includes("diploma") || text.includes("certificate")) {
    return "diploma_certificate";
  }
  return "self_sponsored";
}

function money(currency: string, value?: number | null) {
  if (value === null || value === undefined) return "TBC";
  return `${currency} ${new Intl.NumberFormat("en-KE").format(value)}`;
}
