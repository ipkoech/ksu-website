import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Download,
  ExternalLink,
  Files,
  FileText,
  GraduationCap,
  HelpCircle,
  Landmark,
  Banknote,
  Home,
  Scale,
  WalletCards,
  Globe2,
  Plane,
  PlayCircle,
  Plus,
  Minus,
  Radio,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CampusPageHeader } from "@ksu/ui/components";
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
import { AboutReveal } from "@/components/about/about-reveal";
import { PublicImage } from "@/components/public/public-image";
import { PageShell } from "@/components/site-shell";
import { publicFileUrl } from "@/lib/public-media";
import type {
  AdmissionsIntakeSummary,
  AdmissionsPageData,
} from "@/lib/get-admissions";
import { AdmissionsCountdown } from "./admissions-countdown";

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
        <AdmissionsHero data={data} area={area} />
        <AdmissionsSectionNav activeArea={area} />
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
        ) : area === "international" ? (
          <InternationalApplicantsPage
            data={data}
            pathway={
              pathways.find(
                (item) => item.applicant_type === "international",
              ) ?? selectedPathway
            }
          />
        ) : (
          <AdmissionsLanding data={data} pathways={pathways} />
        )}
        <AdmissionsSupport />
      </AboutPageLenis>
    </PageShell>
  );
}

const admissionsScreenCopy: Record<
  string,
  { eyebrow: string; title: React.ReactNode; summary: string }
> = {
  landing: {
    eyebrow: "Study at Kisii University",
    title: (
      <>
        Your application starts <em className="italic">here.</em>
      </>
    ),
    summary:
      "Check the requirements, confirm an open intake, understand fees and funding, then apply through the official Kisii University portal.",
  },
  "how-to-apply": {
    eyebrow: "Admissions guide",
    title: (
      <>
        How to <em className="italic">apply.</em>
      </>
    ),
    summary:
      "A clear journey from choosing a programme to receiving your admission documents.",
  },
  intakes: {
    eyebrow: "Intakes & dates",
    title: (
      <>
        Plan your <em className="italic">application.</em>
      </>
    ),
    summary:
      "Review published application windows and verify current availability before you submit.",
  },
  requirements: {
    eyebrow: "Entry requirements",
    title: (
      <>
        Find your route <em className="italic">in.</em>
      </>
    ),
    summary:
      "Compare general admission rules, then confirm the requirements listed on your programme page.",
  },
  fees: {
    eyebrow: "Fees & funding",
    title: (
      <>
        Plan with <em className="italic">confidence.</em>
      </>
    ),
    summary:
      "Explore published programme fee records and use approved university documents when budgeting.",
  },
  international: {
    eyebrow: "International applicants",
    title: (
      <>
        Study at Kisii, feel at <em className="italic">home.</em>
      </>
    ),
    summary:
      "Qualification, document and arrival guidance for students applying from outside Kenya.",
  },
};

function AdmissionsHero({
  data,
  area,
}: {
  data: AdmissionsPageData;
  area: string;
}) {
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
  const copy = admissionsScreenCopy[area] ?? admissionsScreenCopy.landing;

  if (area !== "landing") {
    return (
      <CampusPageHeader
        seed={`/admissions/${area}`}
        variant="feature"
        titleWeight="normal"
        eyebrow={copy.eyebrow}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Admissions", href: "/admissions" },
          { label: copy.eyebrow },
        ]}
        title={copy.title}
        description={copy.summary}
      />
    );
  }

  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-primary text-white">
      <Image
        src="/images/about-us/pavilion-2.jpg"
        alt="Kisii University campus"
        fill
        priority
        sizes="100vw"
        className={`object-cover motion-safe:animate-ken-burns ${heroVideoUrl ? "opacity-0" : ""}`}
      />
      {heroVideoUrl ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={heroImageUrl ?? "/images/about-us/pavilion-2.jpg"}
          aria-hidden
        >
          <source src={heroVideoUrl} />
        </video>
      ) : null}
      <div className="relative mx-auto min-h-[480px] w-full max-w-[1680px] px-5 py-12 sm:px-8 lg:px-10 lg:py-14 xl:px-12">
        <div className="motion-safe:animate-[admissions-rise_.7s_ease-out_both]">
          <nav
            aria-label="Breadcrumb"
            className="text-xs font-semibold text-white/70"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <span>Admissions</span>
          </nav>
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-5xl font-normal leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-white/75 sm:text-lg">
            {copy.summary}
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link
              href={officialLinks.onlineApplication}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-secondary px-3 py-3 text-[0.9375rem] font-medium text-white transition-colors duration-200 hover:bg-secondary/90 active:scale-[0.98] sm:px-7 sm:text-base"
            >
              Apply online
              <ExternalLink className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={officialLinks.admissionCenter}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-white/10 px-3 py-3 text-[0.9375rem] font-medium text-white ring-1 ring-white/45 backdrop-blur-sm transition-colors duration-200 hover:bg-white hover:text-brand-overlay active:scale-[0.98] sm:px-7 sm:text-base"
            >
              Download admission letter
              <ExternalLink className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const admissionsSections = [
  ["Requirements", "/admissions#requirements", "landing"],
  ["How to apply", "/admissions#how-to-apply", "how-to-apply"],
  ["Intakes", "/admissions#intakes", "intakes"],
  ["Fees & funding", "/admissions#fees", "fees"],
  ["International", "/admissions#international", "international"],
  ["FAQs", "/admissions#faqs", "faqs"],
] as const;

function AdmissionsSectionNav({ activeArea }: { activeArea: string }) {
  return (
    <nav
      aria-label="Admissions sections"
      className="border-b border-primary/10 bg-white px-5 sm:px-8 lg:px-16"
    >
      <div className="mx-auto flex w-full max-w-7xl gap-7 overflow-x-auto">
        {admissionsSections.map(([label, href, key]) => (
          <Link
            key={key}
            href={href}
            aria-current={activeArea === key ? "location" : undefined}
            className={`relative flex min-h-14 shrink-0 items-center text-xs font-bold uppercase tracking-[0.08em] transition-colors duration-200 ${
              activeArea === key
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            {label}
            {activeArea === key ? (
              <span className="absolute inset-x-0 bottom-0 h-1 bg-secondary" />
            ) : null}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function AdmissionsLanding({
  data,
  pathways,
}: {
  data: AdmissionsPageData;
  pathways: AdmissionPathway[];
}) {
  const essentials = [
    {
      icon: ClipboardCheck,
      title: "Entry requirements",
      body: "Confirm the qualification, grade and supporting evidence required for your applicant route.",
      note: `${data.requirements.length || "Published"} requirement records available`,
    },
    {
      icon: FileText,
      title: "Application documents",
      body: "Prepare your academic records, identification and any route-specific documents before starting.",
      note: `${data.documents.length || "Official"} admissions resources published`,
    },
    {
      icon: Files,
      title: "Fees and funding",
      body: "Use published university fee records and approved documents when planning your costs.",
      note: "Amounts depend on course, intake and applicant category",
    },
  ];

  const applicationSteps = [
    [
      "Choose your route",
      "Select the pathway that matches how you are joining Kisii University.",
    ],
    [
      "Check eligibility",
      "Read the general and route-specific requirements before opening the portal.",
    ],
    [
      "Prepare documents",
      "Have clear copies of every required academic and identity document ready.",
    ],
    [
      "Apply officially",
      "Complete your submission through the official Kisii University application portal.",
    ],
  ];
  const internationalPathway = pathways.find(
    (item) => item.applicant_type === "international",
  );
  const activeIntake = data.intakes.find(
    (intake) =>
      intake.isOpen &&
      !isPastDate(intake.lateApplicationEnd ?? intake.applicationEnd),
  );
  const activeDeadline = activeIntake
    ? (activeIntake.lateApplicationEnd ?? activeIntake.applicationEnd)
    : null;
  const internationalGuidance = [
    {
      icon: Banknote,
      title: "Fees",
      body: "International fees can differ by course and applicant category. Open the relevant course page for published fees, then confirm the approved structure with admissions.",
      href: "/academics/programmes",
      label: "Explore course fees",
    },
    {
      icon: WalletCards,
      title: "Funding",
      body: "Do not assume Kenyan government funding applies to an international application. Plan for self, family, sponsor or external scholarship funding and keep evidence of funds.",
      href: "https://www.hef.co.ke/faqs/",
      label: "Check HEF eligibility",
      external: true,
    },
    {
      icon: Home,
      title: "Accommodation",
      body: "Apply for housing after admission guidance is issued. Spaces and charges are separate from tuition and are subject to availability.",
      href: "/campus-life/accommodation",
      label: "Accommodation guidance",
    },
    {
      icon: Globe2,
      title: "Immigration",
      body: "A foreign student admitted to an approved institution generally needs a Kenyan Student's Pass. The institution must support parts of the application.",
      href: "https://immigration.go.ke/students-pass/",
      label: "Student's Pass requirements",
      external: true,
    },
    {
      icon: Scale,
      title: "Legal responsibilities",
      body: "Maintain valid immigration status and follow the conditions of your pass. A Student's Pass does not by itself authorize employment or business activity.",
      href: "https://fns.immigration.go.ke/infopack/passes/studentpass/",
      label: "Read official conditions",
      external: true,
    },
  ];

  return (
    <div className="bg-surface text-foreground">
      <section
        id="requirements"
        className="scroll-mt-20 bg-primary px-5 py-14 text-white sm:px-8 lg:px-16 lg:py-20 xl:px-20"
      >
        <div className="mx-auto w-full max-w-7xl">
          <AboutReveal className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Before you apply
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight sm:text-5xl">
              Prepare the right <em className="italic">information.</em>
            </h2>
          </AboutReveal>
          <div className="mt-10 grid gap-px overflow-hidden rounded-3xl bg-white/15 lg:grid-cols-3">
            {essentials.map(({ icon: Icon, title, body, note }) => (
              <article
                key={title}
                className="flex flex-col bg-primary p-7 sm:p-8"
              >
                <Icon className="h-7 w-7 text-secondary" aria-hidden />
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-normal tracking-tight">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/70">{body}</p>
                <p className="mt-6 border-t border-white/15 pt-5 text-xs font-bold uppercase tracking-wider text-secondary">
                  {note}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-to-apply"
        className="scroll-mt-20 border-b border-primary/10 bg-white px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1fr_.48fr]">
          <AboutReveal>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Application process
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-primary sm:text-5xl">
              Four steps to <em className="italic">submit.</em>
            </h2>
            <ol className="mt-9 border-t border-primary/15">
              {applicationSteps.map(([title, body], index) => (
                <li
                  key={title}
                  className="grid gap-3 border-b border-primary/15 py-6 sm:grid-cols-[3rem_1fr]"
                >
                  <span className="font-[family-name:var(--font-display)] text-2xl font-normal text-secondary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-[family-name:var(--font-display)] text-xl font-normal tracking-tight text-primary">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <ButtonLink
              href={officialLinks.onlineApplication}
              className="mt-7"
              external
              primary
            >
              Start your application
            </ButtonLink>
          </AboutReveal>
          <AboutReveal variant="right" delay={100} className="lg:pt-20">
            <PublicImage
              src="/images/backgrounds/KSUGreenLandscapingMay2026-7456.jpg"
              alt="Students walking through the landscaped Kisii University campus"
              ratio="card"
              className="mb-6 overflow-hidden rounded-3xl ring-1 ring-primary/10"
              imageClassName="object-cover"
              sizes="(min-width: 1024px) 32vw, 100vw"
            />
            <aside className="rounded-3xl bg-surface-subtle p-7 ring-1 ring-primary/10 sm:p-8">
              <ShieldCheck className="h-7 w-7 text-primary" aria-hidden />
              <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-normal tracking-tight text-primary">
                Submit through official systems.
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Do not send application fees or personal documents through
                unofficial links. The application portal opens in a new tab.
              </p>
              <ButtonLink
                href={officialLinks.admissionCenter}
                className="mt-6"
                external
              >
                Admission centre
              </ButtonLink>
            </aside>
          </AboutReveal>
        </div>
      </section>

      <section
        id="intakes"
        className="scroll-mt-20 bg-surface-subtle px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20"
      >
        <div className="mx-auto w-full max-w-7xl">
          <AboutReveal className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Intakes and dates
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-primary sm:text-5xl">
              Know when to <em className="italic">apply.</em>
            </h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              Published windows are shown below. Always confirm availability in
              the application portal before preparing payment.
            </p>
          </AboutReveal>
          {activeIntake && activeDeadline ? (
            <AboutReveal
              delay={100}
              className="mt-9 grid overflow-hidden rounded-3xl bg-primary text-white ring-1 ring-primary/15 lg:grid-cols-[1fr_.72fr]"
            >
              <div className="p-7 sm:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                  Applications open
                </p>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight sm:text-4xl">
                  {activeIntake.name}
                </h3>
                <dl className="mt-7 divide-y divide-white/15 text-sm">
                  {[
                    ["Applications opened", activeIntake.applicationStart],
                    ["Application deadline", activeIntake.applicationEnd],
                    ...(activeIntake.lateApplicationEnd
                      ? [["Late deadline", activeIntake.lateApplicationEnd]]
                      : []),
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between gap-4 py-3"
                    >
                      <dt className="text-white/60">{label}</dt>
                      <dd className="text-right font-bold text-white">
                        {formatDate(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
                <ButtonLink
                  href={officialLinks.onlineApplication}
                  className="mt-7"
                  external
                  secondary
                >
                  Apply for this intake
                </ButtonLink>
              </div>
              <div className="bg-primary/80 p-7 ring-1 ring-white/10 sm:p-10">
                <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                  Time remaining
                </p>
                <AdmissionsCountdown deadline={activeDeadline} />
                <p className="mt-5 text-xs leading-5 text-white/55">
                  Countdown uses the latest published application deadline.
                </p>
              </div>
            </AboutReveal>
          ) : (
            <p className="mt-9 rounded-3xl bg-white p-6 text-sm leading-7 text-muted-foreground ring-1 ring-primary/10">
              No intake is currently open. Closed and scheduled intakes are not
              shown. Check the official application portal or contact admissions
              for the next available window.
            </p>
          )}
        </div>
      </section>

      <section
        id="fees"
        className="scroll-mt-20 border-b border-primary/10 bg-white px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
          <AboutReveal variant="left">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Fees and funding
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-primary sm:text-5xl">
              Plan from an approved <em className="italic">fee structure.</em>
            </h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              Fees vary by course, intake and applicant category. Confirm the
              total from an approved university fee structure; do not rely on an
              amount copied from another applicant.
            </p>
            <p className="mt-5 text-sm font-bold text-primary">
              {data.feeStructures.length
                ? `${data.feeStructures.length} structured fee records are currently published.`
                : "Structured fee records will appear here when published."}
            </p>
          </AboutReveal>
          <AboutReveal variant="right" delay={100}>
            <div className="grid gap-px overflow-hidden rounded-3xl bg-primary/15 sm:grid-cols-3">
              {[
                ["Tuition", "Academic instruction and course delivery."],
                [
                  "Statutory charges",
                  "Mandatory university charges listed in the approved structure.",
                ],
                [
                  "Other costs",
                  "Course, accommodation or activity costs where applicable.",
                ],
              ].map(([title, body]) => (
                <article key={title} className="bg-surface-subtle p-6">
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-normal tracking-tight text-primary">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {body}
                  </p>
                </article>
              ))}
            </div>
            <ButtonLink href="/academics/programmes" className="mt-6" primary>
              Browse programmes and published fees
            </ButtonLink>
          </AboutReveal>
        </div>
        <AboutReveal className="mx-auto mt-12 w-full max-w-7xl rounded-3xl bg-surface-subtle p-7 ring-1 ring-primary/10 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[.65fr_1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                Government student funding
              </p>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-primary">
                Scholarships, loans and household contribution.
              </h3>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Kenya&apos;s Higher Education Financing system combines
                government scholarships, HELB loans and a household contribution
                determined through a means assessment. Eligible students must
                apply; funding is not assigned automatically.
              </p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-3xl bg-primary/15 sm:grid-cols-2">
              <article className="bg-white p-6">
                <WalletCards className="h-6 w-6 text-primary" aria-hidden />
                <h4 className="mt-4 font-[family-name:var(--font-display)] text-xl font-normal text-primary">
                  Who should apply
                </h4>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Government-sponsored students placed by KUCCPS in public
                  universities may be considered for scholarships and loans. An
                  official admission letter is required, and applications are
                  made annually when the portal is open.
                </p>
              </article>
              <article className="bg-white p-6">
                <Banknote className="h-6 w-6 text-primary" aria-hidden />
                <h4 className="mt-4 font-[family-name:var(--font-display)] text-xl font-normal text-primary">
                  Prepare before applying
                </h4>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Have your admission details, identification, contact
                  information and the family or guarantor information requested
                  by HEF. Use only the official portal; HELB does not charge an
                  application-access fee.
                </p>
              </article>
            </div>
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink
              href="https://portal.hef.co.ke/auth/signin"
              external
              primary
            >
              Apply through the HEF portal
            </ButtonLink>
            <ButtonLink
              href="https://portal.hef.co.ke/auth/index/application_guide"
              external
            >
              Read the official application guide
            </ButtonLink>
            <ButtonLink href="https://www.hef.co.ke/faqs/" external>
              Funding eligibility FAQs
            </ButtonLink>
          </div>
          <p className="mt-5 text-xs leading-5 text-muted-foreground">
            Funding windows, eligibility and allocations are controlled by the
            relevant government agencies and can change. Confirm the current
            notice on the HEF portal before applying.
          </p>
        </AboutReveal>
      </section>

      <section
        id="international"
        className="scroll-mt-20 bg-primary px-5 py-14 text-white sm:px-8 lg:px-16 lg:py-20 xl:px-20"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <AboutReveal variant="left">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              International applicants
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight sm:text-5xl">
              Prepare before you <em className="italic">travel.</em>
            </h2>
            <p className="mt-5 text-base leading-8 text-white/70">
              {internationalPathway?.summary ??
                "Applicants with international qualifications should prepare certified academic records, passport details and equivalence evidence where required."}
            </p>
          </AboutReveal>
          <AboutReveal variant="right" delay={100}>
            <div className="grid gap-px overflow-hidden rounded-3xl bg-white/15 sm:grid-cols-2">
              {internationalGuidance.map(
                ({ icon: Icon, title, body, href, label, external }) => (
                  <article
                    key={title}
                    className="flex flex-col bg-primary p-6 sm:p-7"
                  >
                    <Icon className="h-6 w-6 text-secondary" aria-hidden />
                    <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-normal">
                      {title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-white/70">
                      {body}
                    </p>
                    <Link
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-bold text-white hover:underline"
                    >
                      {label}
                      <ArrowRight
                        className="h-4 w-4 text-secondary"
                        aria-hidden
                      />
                    </Link>
                  </article>
                ),
              )}
              <article className="flex flex-col bg-primary p-6 sm:p-7">
                <FileText className="h-6 w-6 text-secondary" aria-hidden />
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-normal">
                  Documents
                </h3>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/70">
                  {(arrayItems(internationalPathway?.required_documents).length
                    ? arrayItems(internationalPathway?.required_documents)
                    : [
                        { title: "Certified academic records" },
                        { title: "Passport bio-data page" },
                        { title: "Qualification equivalence evidence" },
                      ]
                  )
                    .slice(0, 4)
                    .map((item, index) => (
                      <li key={index} className="flex gap-2">
                        <CheckCircle2
                          className="mt-1 h-4 w-4 shrink-0 text-secondary"
                          aria-hidden
                        />
                        {String(
                          item.title ?? item.label ?? "Required document",
                        )}
                      </li>
                    ))}
                </ul>
                <ButtonLink
                  href={internationalPathway?.cta_url ?? "/contact"}
                  className="mt-5 w-fit"
                  external={Boolean(
                    internationalPathway?.cta_url?.startsWith("http"),
                  )}
                  secondary
                >
                  {internationalPathway?.cta_label ?? "Contact admissions"}
                </ButtonLink>
              </article>
            </div>
          </AboutReveal>
        </div>
      </section>

      <section
        id="faqs"
        className="scroll-mt-20 bg-white px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[.55fr_1fr]">
          <AboutReveal>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Common questions
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-primary sm:text-5xl">
              Answers before you <em className="italic">apply.</em>
            </h2>
          </AboutReveal>
          <AboutReveal variant="right" delay={100}>
            <FaqPanel faqs={data.faqs} />
          </AboutReveal>
        </div>
      </section>
    </div>
  );
}

function RequirementsPage({ data }: { data: AdmissionsPageData }) {
  return (
    <div className="bg-white px-4 py-10 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
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
        <AboutReveal>
          <RequirementsTable
            programmes={data.programmes}
            requirements={data.requirements}
            full
          />
        </AboutReveal>
      </div>
    </div>
  );
}

function FeesPage({ data }: { data: AdmissionsPageData }) {
  return (
    <div className="bg-white px-4 py-10 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
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
        <AboutReveal>
          <FeesGrid fees={data.feeStructures} programmes={data.programmes} />
        </AboutReveal>
      </div>
    </div>
  );
}

function DocumentsPage({ documents }: { documents: AdmissionDocument[] }) {
  return (
    <div className="bg-white px-4 py-10 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
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
        <AboutReveal>
          <DocumentGrid documents={documents} />
        </AboutReveal>
      </div>
    </div>
  );
}

function IntakesPage({ intakes }: { intakes: AdmissionsIntakeSummary[] }) {
  return (
    <div className="bg-white px-4 py-10 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto max-w-[1680px]">
        <SectionHeader
          eyebrow="Current intakes"
          title="Application windows and reporting timelines"
          body="Use these records for planning, then confirm live availability in the official application portal."
        />
        <AboutReveal className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(intakes.length ? intakes : []).map((intake) => (
            <article
              key={intake.id}
              className="rounded-3xl border border-border bg-white p-5 shadow-sm"
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
        </AboutReveal>
      </div>
    </div>
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
    <div className="bg-white px-4 py-10 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
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
        <AboutReveal className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.38fr)]">
          <JourneyList large />
          <DocumentsPanel documents={documents} />
        </AboutReveal>
        <AboutReveal
          delay={120}
          className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {pathways.map((pathway) => (
            <Link
              key={pathway.id}
              href={`/admissions/${pathway.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-border bg-white p-5 transition-transform duration-200 hover:-translate-y-1 hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-lg hover:shadow-primary/10"
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
        </AboutReveal>
      </div>
    </div>
  );
}

function InternationalApplicantsPage({
  data,
  pathway,
}: {
  data: AdmissionsPageData;
  pathway?: AdmissionPathway;
}) {
  const steps = arrayItems(pathway?.application_steps);
  const documents = arrayItems(pathway?.required_documents);
  const internationalRequirements = data.requirements.filter(
    (item) => item.applicant_type === "international",
  );

  return (
    <div className="bg-surface text-foreground">
      <section className="border-b border-primary/10 px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
          <AboutReveal variant="left">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Before you apply
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-primary sm:text-5xl">
              Prepare your <em className="italic">documents.</em>
            </h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              {pathway?.summary ??
                "International applicants should prepare certified academic records, identity documents and evidence of qualification equivalence where required."}
            </p>
            {pathway?.eligibility_notes ? (
              <p className="mt-5 border-l-2 border-secondary pl-5 text-sm leading-7 text-muted-foreground">
                {pathway.eligibility_notes}
              </p>
            ) : null}
            <ButtonLink
              href={pathway?.cta_url ?? officialLinks.onlineApplication}
              external
              className="mt-7"
              primary
            >
              {pathway?.cta_label ?? "Start application"}
            </ButtonLink>
          </AboutReveal>
          <AboutReveal variant="right" delay={100}>
            <AdmissionsMediaFrame
              title="Welcome to Kisii University"
              caption="Plan your application, travel and arrival with guidance from the admissions team."
              imageUrl={publicFileUrl(pathway?.cover_image_id)}
              icon={Globe2}
              variant="pathway"
            />
          </AboutReveal>
        </div>
      </section>

      <section className="bg-primary px-5 py-14 text-white sm:px-8 lg:px-16 lg:py-20 xl:px-20">
        <div className="mx-auto w-full max-w-7xl">
          <AboutReveal>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              International checklist
            </p>
            <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight sm:text-5xl">
              From application to <em className="italic">arrival.</em>
            </h2>
          </AboutReveal>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-white/15 md:grid-cols-3">
            <InternationalChecklist
              title="Application steps"
              icon={ClipboardCheck}
              items={steps}
            />
            <InternationalChecklist
              title="Documents"
              icon={FileText}
              items={documents}
            />
            <InternationalChecklist
              title="Qualification check"
              icon={ShieldCheck}
              items={internationalRequirements.slice(0, 4).map((item) => ({
                title: item.title,
                body: item.minimum_grade ?? item.notes,
              }))}
            />
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
        <AboutReveal className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1fr_.55fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Arrival planning
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-primary sm:text-5xl">
              Make Kisii your <em className="italic">home.</em>
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
              Confirm immigration, reporting and accommodation arrangements with
              the university before travelling. Requirements vary by citizenship
              and programme.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-primary/15 ring-1 ring-primary/10">
            {[
              { label: "Apply", icon: GraduationCap },
              { label: "Verify", icon: ShieldCheck },
              { label: "Travel", icon: Plane },
              { label: "Report", icon: Landmark },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="bg-white p-6 text-center">
                <Icon className="mx-auto h-7 w-7 text-primary" aria-hidden />
                <p className="mt-3 text-sm font-bold uppercase tracking-wider text-primary">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </AboutReveal>
      </section>
    </div>
  );
}

function InternationalChecklist({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: LucideIcon;
  items: Record<string, unknown>[];
}) {
  const rows = items.length ? items : [{ title: "Confirm with admissions" }];
  return (
    <article className="bg-primary p-6 sm:p-8">
      <Icon className="h-7 w-7 text-secondary" aria-hidden />
      <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-normal">
        {title}
      </h3>
      <ul className="mt-5 space-y-3 text-sm leading-6 text-white/75">
        {rows.slice(0, 5).map((item, index) => (
          <li key={index} className="flex gap-3">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-secondary" />
            <span>
              {String(item.title ?? item.label ?? "Confirm requirement")}
              {item.body ? (
                <span className="block text-white/55">{String(item.body)}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </article>
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
        <div className="flex min-h-11 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm text-muted-foreground shadow-sm">
          <Search className="h-4 w-4" aria-hidden />
          Search programmes from the programme catalogue
        </div>
        <div className="rounded-lg border border-border bg-white px-3 py-3 text-sm text-muted-foreground shadow-sm">
          Level
        </div>
        <div className="rounded-lg border border-border bg-white px-3 py-3 text-sm text-muted-foreground shadow-sm">
          Applicant type
        </div>
      </div>
      <div
        className="overflow-x-auto rounded-3xl border border-border bg-white shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
        role="region"
        aria-label="Admission requirements comparison table"
        tabIndex={0}
      >
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
            className="group relative overflow-hidden rounded-3xl border border-border bg-white p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
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
    <section className="rounded-3xl border border-border bg-white p-5 shadow-sm">
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
      className={`group block overflow-hidden rounded-3xl border border-border bg-white transition-transform duration-200 hover:-translate-y-1 hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-lg hover:shadow-primary/10 ${
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
          answer: `Use the <a href="${officialLinks.onlineApplication}">official Kisii University online application portal</a>.`,
          is_published: true,
          display_order: 10,
          created_at: "",
          updated_at: "",
        },
        {
          id: "faq-letter",
          question: "Where do I download my admission letter?",
          answer: `Use the <a href="${officialLinks.admissionCenter}">admission centre</a> once admission letters are released.`,
          is_published: true,
          display_order: 20,
          created_at: "",
          updated_at: "",
        },
      ];
  return (
    <section className="rounded-3xl border border-border bg-white p-5 shadow-sm">
      <PanelTitle icon={HelpCircle} title="FAQs" />
      <div className="mt-4 divide-y divide-border">
        {rows.map((faq) => (
          <details key={faq.id} className="group py-3">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-foreground">
              <span>{faq.question}</span>
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary ring-1 ring-primary/10"
                aria-hidden
              >
                <Plus className="h-4 w-4 group-open:hidden" />
                <Minus className="hidden h-4 w-4 group-open:block" />
              </span>
            </summary>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {renderFaqAnswer(faq.answer)}
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
      className={
        large ? "" : "rounded-3xl border border-border bg-white p-5 shadow-sm"
      }
    >
      {!large ? (
        <PanelTitle icon={CheckCircle2} title="Application flow" />
      ) : null}
      <ol className={large ? "grid gap-4 md:grid-cols-5" : "mt-4 grid gap-3"}>
        {steps.map(([title, body, href], index) => (
          <li
            key={title}
            className="relative overflow-hidden rounded-3xl border border-border bg-white p-4 transition-transform duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
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
      <AboutReveal className="mx-auto flex max-w-[1680px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
      </AboutReveal>
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
      className={`group relative overflow-hidden rounded-3xl border border-primary/15 bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.2),transparent_28%),linear-gradient(135deg,#f8fdff,#eef9ff_52%,#ffffff)] shadow-xl shadow-primary/10 ${
        tall ? "min-h-[360px] sm:min-h-[430px]" : "min-h-[210px]"
      } ${variant === "document" ? "shadow-sm" : ""}`}
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
          imageClassName="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
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

function PanelTitle({
  icon: Icon,
  title,
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/[0.08] text-primary">
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
  secondary = false,
  external,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
  secondary?: boolean;
  external?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold transition-colors duration-200 active:scale-[0.98] ${
        secondary
          ? "bg-secondary text-white hover:bg-secondary/90"
          : primary
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

function intakeStatus(intake: AdmissionsIntakeSummary) {
  if (intake.isOpen && !isPastDate(intake.applicationEnd)) return "Open";
  if (isPastDate(intake.applicationEnd)) return "Closed";
  return "Scheduled";
}

function renderFaqAnswer(answer: string) {
  const pattern =
    /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>|https?:\/\/[^\s<]+/gi;
  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  for (const match of answer.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(stripHtml(answer.slice(cursor, index)));
    const href = match[1] ?? match[0];
    const label = stripHtml(match[2] ?? match[0]).replace(/[.,;:]$/, "");
    nodes.push(
      <Link
        key={`${href}-${index}`}
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="font-bold text-primary underline decoration-secondary/60 underline-offset-4"
      >
        {label}
      </Link>,
    );
    cursor = index + match[0].length;
  }

  if (cursor < answer.length) nodes.push(stripHtml(answer.slice(cursor)));
  return nodes.length ? nodes : stripHtml(answer);
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
