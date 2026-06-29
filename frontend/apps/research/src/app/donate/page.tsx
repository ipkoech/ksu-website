import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  BookOpen,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Landmark,
  Sprout,
} from "lucide-react";
import type { ResearchGenericRecord, ResearchProject } from "@ksu/api-client";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchSidePanel } from "../../components/research-detail";
import { Badge, ResearchSection, StatusMessage } from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getCenters,
  getDonationImpacts,
  getDonationSettings,
  getDonationStories,
  getEndowments,
  getProjects,
  getScholarships,
  getSustainability,
} from "../../lib/research-public-data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Donate to Research",
  description: "Support Kisii University research, scholarships, innovation, community impact, and endowments.",
};

const defaultAmounts = [1000, 2500, 5000, 10000];
const workflow = [
  "Choose a giving priority",
  "Select one-time or recurring gift",
  "Share donor details",
  "Continue through the configured giving channel",
  "Receive acknowledgement and follow published impact",
];

const donateLinks = [
  {
    label: "Giving Priorities",
    href: "/donate#priorities",
    description: "Choose projects, scholarships, centers, sustainability, or endowments.",
    icon: HandHeart,
  },
  {
    label: "Make a Gift",
    href: "/donate#make-a-gift",
    description: "Start a donor and gift request.",
    icon: HeartHandshake,
  },
  {
    label: "Endowments",
    href: "/endowments",
    description: "Explore permanent funds and long-term giving pathways.",
    icon: Banknote,
  },
  {
    label: "Contact",
    href: "/connect#get-in-touch",
    description: "Reach the research office for major gifts or assistance.",
    icon: Landmark,
  },
];

export default async function DonatePage() {
  const [
    settings,
    projects,
    scholarships,
    centers,
    endowments,
    sustainability,
    impacts,
    stories,
  ] = await Promise.all([
    getDonationSettings(),
    getProjects(),
    getScholarships(),
    getCenters(),
    getEndowments(),
    getSustainability(),
    getDonationImpacts(),
    getDonationStories(),
  ]);

  const donationSettings = buildDonationSettings(settings.data);
  const priorities = buildPriorities({
    projects: projects.data,
    scholarships: scholarships.data,
    centers: centers.data,
    endowments: endowments.data,
    sustainability: sustainability.data,
  });
  const featuredImpact = impacts.data[0];
  const featuredStory = stories.data[0];
  const formAction = donationSettings.onlineGivingUrl || donationSettings.contactHref;

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero
        eyebrow="Research Giving"
        title="Support research that serves communities."
        body="Give to research projects, student discovery, innovation, community extension, sustainability work, facilities, or permanent endowment funds."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Research", href: "/" },
          { label: "Donate" },
        ]}
        imageSrc="/images/research/research-home-hero.svg"
        imageAlt="Researchers, students, and community partners supported by research giving"
        links={donateLinks}
        primaryAction={{ label: "Give now", href: "/donate#make-a-gift" }}
        stats={[
          { label: "Giving priorities", value: priorities.length },
          { label: "Impact reports", value: impacts.data.length },
          { label: "Donor stories", value: stories.data.length },
          { label: "Currency", value: donationSettings.currency },
        ]}
      />

      <ResearchSection
        eyebrow="Giving Priorities"
        title="Choose where your gift should make a difference"
        body="Giving priorities are assembled from published research records, so donors can connect support to real projects, scholarships, centers, sustainability work, and endowments."
        tone="white"
      >
        <div id="priorities" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {priorities.map((priority) => (
            <PriorityCard key={priority.id} priority={priority} />
          ))}
        </div>
        {[settings.error, projects.error, scholarships.error, centers.error, endowments.error, sustainability.error]
          .filter(Boolean)
          .map((error) => (
            <div key={error} className="mt-5">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          ))}
      </ResearchSection>

      <ResearchSection
        eyebrow="How Giving Moves"
        title="A clear donation workflow"
        body="The page explains the donor journey from giving priority to confirmation, receipt, impact reporting, and stories."
      >
        <div className="grid gap-4 md:grid-cols-5">
          {workflow.map((step, index) => (
            <article key={step} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-semibold text-white">
                {index + 1}
              </span>
              <h2 className="mt-4 text-base font-semibold leading-6 text-slate-950">{step}</h2>
            </article>
          ))}
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Make a Gift"
        title="Start a donation"
        body="This form collects the information needed to prepare a gift request. Approved giving channels are shown from the published donation settings."
        tone="white"
      >
        <div id="make-a-gift" className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_520px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ImpactFeature impact={featuredImpact} />
            <StoryFeature story={featuredStory} />
          </div>
          <DonationForm
            action={formAction}
            currency={donationSettings.currency}
            amounts={donationSettings.amounts}
            priorities={priorities}
            contactEmail={donationSettings.contactEmail}
          />
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Impact Published Back"
        title="Impact reports and donor stories"
        body="Donation impact and stories appear here when they are published for public view."
      >
        {[impacts.error, stories.error].filter(Boolean).map((error) => (
          <div key={error} className="mb-5">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        ))}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[...impacts.data.slice(0, 3), ...stories.data.slice(0, 3)].slice(0, 6).map((record) => (
            <ImpactCard key={record.id} record={record} />
          ))}
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Endowments & Major Gifts"
        title="Long-term giving and institutional support"
        body="Endowments and major gifts need a more guided conversation. The page keeps those pathways visible without mixing them into quick giving."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-5 md:grid-cols-2">
            {endowments.data.slice(0, 4).map((fund) => (
              <article key={fund.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <Badge>{formatLabel(fund.fund_type ?? fund.status ?? "endowment")}</Badge>
                <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
                  {fund.name ?? fund.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {compactText(fund.purpose) ||
                    compactText(fund.summary) ||
                    compactText(fund.description) ||
                    "Endowment details will appear when published."}
                </p>
                {fund.slug ? (
                  <Link href={`/endowments/${fund.slug}`} className="mt-4 inline-flex text-sm font-semibold text-primary">
                    View fund
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
          <ResearchSidePanel title="Discuss a major gift" eyebrow="Major gifts">
            <Landmark aria-hidden className="h-10 w-10 text-secondary" />
            <p className="mt-5 text-sm leading-7 text-slate-600">
              For named funds, institutional gifts, equipment support, corporate giving,
              or planned giving, contact the research office before submitting payment.
            </p>
            <a
              href={donationSettings.contactHref}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Contact giving office
            </a>
          </ResearchSidePanel>
        </div>
      </ResearchSection>
    </main>
  );
}

type DonationSettings = {
  amounts: number[];
  currency: string;
  onlineGivingUrl: string;
  contactEmail: string;
  contactHref: string;
};

function buildDonationSettings(records: ResearchGenericRecord[]): DonationSettings {
  const settings = new Map(records.map((record) => [compactText(record.key), record]));
  const amountRecord =
    settings.get("suggested_amounts") ||
    settings.get("donation_amounts") ||
    settings.get("amounts");
  const currency =
    compactText(settings.get("currency")?.value) ||
    compactText(settings.get("default_currency")?.value) ||
    "KES";
  const onlineGivingUrl =
    compactText(settings.get("online_giving_url")?.value) ||
    compactText(settings.get("payment_url")?.value) ||
    compactText(settings.get("donation_url")?.value);
  const contactEmail =
    compactText(settings.get("contact_email")?.value) ||
    compactText(settings.get("giving_email")?.value) ||
    "research@kisiiuniversity.ac.ke";

  return {
    amounts: getSuggestedAmounts(amountRecord),
    currency,
    onlineGivingUrl,
    contactEmail,
    contactHref: `mailto:${contactEmail}?subject=Research%20Donation%20Inquiry`,
  };
}

function getSuggestedAmounts(record?: ResearchGenericRecord) {
  const valueJson = record?.value_json;
  if (Array.isArray(valueJson)) {
    return valueJson.map(Number).filter((amount) => Number.isFinite(amount) && amount > 0);
  }
  if (Array.isArray(valueJson?.amounts)) {
    return valueJson.amounts.map(Number).filter((amount: number) => Number.isFinite(amount) && amount > 0);
  }
  const value = compactText(record?.value);
  if (value) {
    const amounts = value
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((amount) => Number.isFinite(amount) && amount > 0);
    if (amounts.length > 0) return amounts;
  }
  return defaultAmounts;
}

type Priority = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string;
  icon: typeof HandHeart;
  value: string;
};

function buildPriorities({
  projects,
  scholarships,
  centers,
  endowments,
  sustainability,
}: {
  projects: ResearchProject[];
  scholarships: ResearchGenericRecord[];
  centers: ResearchGenericRecord[];
  endowments: ResearchGenericRecord[];
  sustainability: ResearchGenericRecord[];
}): Priority[] {
  const featuredProject = projects[0];
  const featuredScholarship = scholarships[0];
  const featuredCenter = centers[0];
  const featuredEndowment = endowments[0];
  const featuredSustainability = sustainability[0];

  return [
    {
      id: "general-research",
      type: "General research support",
      title: "General research support",
      body: "Unrestricted support for emerging research priorities, student discovery, facilities, and public engagement.",
      href: "/about",
      icon: HandHeart,
      value: "unrestricted:general",
    },
    {
      id: featuredProject?.id ?? "projects",
      type: "Research projects",
      title: featuredProject?.title ?? "Research projects",
      body: compactText(featuredProject?.summary) || "Support active research projects and fieldwork connected to community needs.",
      href: featuredProject?.slug ? `/projects/${featuredProject.slug}` : "/projects",
      icon: BookOpen,
      value: featuredProject?.id ? `project:${featuredProject.id}` : "project",
    },
    {
      id: featuredScholarship?.id ?? "scholarships",
      type: "Scholarships",
      title: featuredScholarship?.title ?? featuredScholarship?.name ?? "Scholarships and student research",
      body: compactText(featuredScholarship?.summary) || "Help students access research scholarships, fellowships, and supervised inquiry.",
      href: featuredScholarship?.slug ? `/scholarships/${featuredScholarship.slug}` : "/scholarships",
      icon: GraduationCap,
      value: featuredScholarship?.id ? `scholarship:${featuredScholarship.id}` : "scholarship",
    },
    {
      id: featuredCenter?.id ?? "centers",
      type: "Research centers",
      title: featuredCenter?.name ?? featuredCenter?.title ?? "Research centers",
      body: compactText(featuredCenter?.summary) || "Build capacity in research centers, laboratories, and interdisciplinary programmes.",
      href: featuredCenter?.slug ? `/centers/${featuredCenter.slug}` : "/centers",
      icon: Landmark,
      value: featuredCenter?.id ? `center:${featuredCenter.id}` : "center",
    },
    {
      id: featuredSustainability?.id ?? "sustainability",
      type: "Community and sustainability",
      title: featuredSustainability?.name ?? featuredSustainability?.title ?? "Community and sustainability",
      body: compactText(featuredSustainability?.summary) || "Advance sustainability, outreach, public engagement, and community-facing research.",
      href: featuredSustainability?.slug ? `/sustainability/${featuredSustainability.slug}` : "/sustainability",
      icon: Sprout,
      value: featuredSustainability?.id ? `sustainability:${featuredSustainability.id}` : "sustainability",
    },
    {
      id: featuredEndowment?.id ?? "endowments",
      type: "Endowments",
      title: featuredEndowment?.name ?? featuredEndowment?.title ?? "Endowments and permanent funds",
      body: compactText(featuredEndowment?.purpose) || "Create durable funding for named research priorities and long-term institutional impact.",
      href: featuredEndowment?.slug ? `/endowments/${featuredEndowment.slug}` : "/endowments",
      icon: Banknote,
      value: featuredEndowment?.id ? `fund:${featuredEndowment.id}` : "fund",
    },
  ];
}

function PriorityCard({ priority }: { priority: Priority }) {
  const Icon = priority.icon;

  return (
    <article className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary text-white">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <Badge>{priority.type}</Badge>
      <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold leading-8 text-slate-950">
        {priority.title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{priority.body}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href="#make-a-gift"
          className="inline-flex min-h-10 items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          Support this area
        </a>
        <Link
          href={priority.href}
          className="inline-flex min-h-10 items-center rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          View details
        </Link>
      </div>
    </article>
  );
}

function DonationForm({
  action,
  currency,
  amounts,
  priorities,
  contactEmail,
}: {
  action: string;
  currency: string;
  amounts: number[];
  priorities: Priority[];
  contactEmail: string;
}) {
  return (
    <form
      action={action}
      method={action.startsWith("mailto:") ? "post" : "get"}
      encType={action.startsWith("mailto:") ? "text/plain" : undefined}
      className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">Make a Gift</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950">
            Giving details
          </h2>
        </div>
        <Badge>{currency}</Badge>
      </div>

      <input type="hidden" name="currency" value={currency} />
      <input type="hidden" name="donation_date" value={new Date().toISOString().slice(0, 10)} />
      <input type="hidden" name="status" value="pending" />

      <fieldset className="mt-6">
        <legend className="text-xs font-semibold uppercase text-slate-500">Amount</legend>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {amounts.slice(0, 4).map((amount, index) => (
            <label key={amount} className="cursor-pointer">
              <input
                type="radio"
                name="amount"
                value={amount}
                defaultChecked={index === 1}
                className="peer sr-only"
              />
              <span className="flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white">
                {currency} {amount.toLocaleString()}
              </span>
            </label>
          ))}
        </div>
        <label className="mt-3 block">
          <span className="text-xs font-semibold uppercase text-slate-500">Custom amount</span>
          <input
            name="custom_amount"
            inputMode="decimal"
            placeholder={`${currency} custom amount`}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </label>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-xs font-semibold uppercase text-slate-500">Gift type</legend>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[
            ["one_time", "One-time"],
            ["recurring", "Recurring"],
            ["pledge", "Pledge"],
          ].map(([value, label], index) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                name="donation_type"
                value={value}
                defaultChecked={index === 0}
                className="peer sr-only"
              />
              <span className="flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white">
                {label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 grid gap-4">
        <label>
          <span className="text-xs font-semibold uppercase text-slate-500">Giving area</span>
          <select
            name="designation"
            defaultValue={priorities[0]?.value}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {priorities.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-xs font-semibold uppercase text-slate-500">Purpose or note</span>
          <input
            name="purpose"
            placeholder="Optional purpose, fund, project, or scholarship note"
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </label>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <h3 className="text-base font-semibold text-slate-950">Donor details</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <InputField name="display_name" label="Name" placeholder="Your name" required />
          <InputField name="email" label="Email" placeholder="you@example.com" type="email" required />
          <InputField name="phone" label="Phone" placeholder="Phone number" />
          <label>
            <span className="text-xs font-semibold uppercase text-slate-500">Donor type</span>
            <select
              name="donor_type"
              defaultValue="individual"
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="individual">Individual</option>
              <option value="alumni">Alumni</option>
              <option value="corporate">Corporate</option>
              <option value="foundation">Foundation</option>
              <option value="partner">Partner</option>
            </select>
          </label>
          <InputField name="organization_name" label="Organization" placeholder="Optional organization" />
          <label>
            <span className="text-xs font-semibold uppercase text-slate-500">Recognition</span>
            <select
              name="is_public"
              defaultValue="false"
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="false">Keep private</option>
              <option value="true">May be recognized publicly</option>
            </select>
          </label>
        </div>
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase text-slate-500">Message or dedication</span>
          <textarea
            name="message"
            rows={4}
            placeholder="Optional donor message, dedication, or pledge note"
            className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </label>
      </div>

      <button className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">
        Continue to giving channel
        <ArrowRight aria-hidden className="h-4 w-4" />
      </button>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        If the online giving channel is unavailable, this request opens a donation inquiry to {contactEmail}.
      </p>
    </form>
  );
}

function InputField({
  name,
  label,
  placeholder,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    </label>
  );
}

function ImpactFeature({ impact }: { impact?: ResearchGenericRecord }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[16/7] min-h-[150px] sm:min-h-[220px]">
        <Image
          src="/images/research/research-events-hero.svg"
          alt="Donation impact reporting and research outcomes"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="p-5">
        <Badge>{formatLabel(impact?.impact_type ?? "impact")}</Badge>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
          {impact?.title ?? "Impact published back to donors"}
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {compactText(impact?.summary) ||
            compactText(impact?.description) ||
            "Donation impact reports show how gifts support projects, students, facilities, and community outcomes."}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <MiniFact label="Raised" value={formatMoney(impact?.total_raised, impact?.currency)} />
          <MiniFact label="Beneficiaries" value={compactText(impact?.beneficiary_count)} />
          <MiniFact label="Year" value={compactText(impact?.reporting_year)} />
        </div>
      </div>
    </article>
  );
}

function StoryFeature({ story }: { story?: ResearchGenericRecord }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
          <HeartHandshake aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <Badge>{formatLabel(story?.status ?? "story")}</Badge>
          <h2 className="mt-3 text-xl font-semibold leading-7 text-slate-950">
            {story?.title ?? "Donor stories"}
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {compactText(story?.summary) ||
              compactText(story?.quote) ||
              "Donor and beneficiary stories explain why giving matters and what support makes possible."}
          </p>
        </div>
      </div>
    </article>
  );
}

function ImpactCard({ record }: { record: ResearchGenericRecord }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <Badge>{formatLabel(record.impact_type ?? record.status ?? "impact")}</Badge>
      <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
        {record.title ?? record.name}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {compactText(record.summary) ||
          compactText(record.description) ||
          compactText(record.story) ||
          compactText(record.impact_witnessed) ||
          "Impact details will appear when published."}
      </p>
      {record.period_start || record.period_end || record.reporting_year ? (
        <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">
          {[formatDate(record.period_start), formatDate(record.period_end), compactText(record.reporting_year)]
            .filter(Boolean)
            .join(" - ")}
        </p>
      ) : null}
    </article>
  );
}

function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value || "Not published"}</p>
    </div>
  );
}

function formatMoney(value: unknown, currency?: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  const currencyLabel =
    typeof currency === "string" || typeof currency === "number"
      ? compactText(currency)
      : "";
  return `${currencyLabel || "KES"} ${amount.toLocaleString()}`;
}
