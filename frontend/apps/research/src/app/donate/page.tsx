import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Banknote,
  BookOpen,
  GraduationCap,
  HandHeart,
  Landmark,
  Sprout,
} from "lucide-react";
import { researchServiceApi, type ResearchGenericRecord, type ResearchProject } from "@ksu/api-client";
import { Badge, PrimaryLink, ResearchSection, SecondaryLink, StatusMessage } from "../../components/research-ui";
import {
  compactText,
  formatLabel,
  getCenters,
  getDonationImpacts,
  getDonationSettings,
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

async function submitDonation(formData: FormData) {
  "use server";

  const amount = getDonationAmount(formData);
  if (!amount) redirect("/donate?error=amount");

  const designationValue = getFormString(formData, "designation") || "unrestricted:general";
  const binding = getDonationBinding(designationValue);
  const donationType = getFormString(formData, "donation_type") || "one_time";

  let donationReference: string;
  try {
    const response = await researchServiceApi.submitDonation({
      donor_type: getFormString(formData, "donor_type") || "individual",
      display_name: getFormString(formData, "display_name"),
      organization_name: getFormString(formData, "organization_name"),
      is_anonymous: getFormString(formData, "is_anonymous") === "true",
      email: getFormString(formData, "email"),
      phone: getFormString(formData, "phone"),
      amount,
      currency: getFormString(formData, "currency") || "KES",
      donation_type: donationType,
      recurring_frequency: donationType === "recurring" ? getFormString(formData, "recurring_frequency") : undefined,
      designation: binding.designation,
      purpose: getFormString(formData, "purpose"),
      project_id: binding.project_id,
      center_id: binding.center_id,
      scholarship_id: binding.scholarship_id,
      fund_id: binding.fund_id,
      preferred_payment_method: getFormString(formData, "preferred_payment_method"),
      message: getFormString(formData, "message"),
      dedication: getFormString(formData, "dedication"),
      is_tribute: getFormString(formData, "is_tribute") === "true",
      tribute_type: getFormString(formData, "tribute_type"),
      tribute_name: getFormString(formData, "tribute_name"),
      recognition_public: getFormString(formData, "recognition_public") === "true",
    });
    donationReference = response.data.donation_id;
  } catch {
    redirect("/donate?error=submit");
  }
  redirect(`/donate?submitted=${donationReference}`);
}

function getDonationAmount(formData: FormData) {
  const customAmount = Number(getFormString(formData, "custom_amount"));
  if (Number.isFinite(customAmount) && customAmount > 0) return customAmount;
  const selectedAmount = Number(getFormString(formData, "amount"));
  return Number.isFinite(selectedAmount) && selectedAmount > 0 ? selectedAmount : 0;
}

function getDonationBinding(value: string) {
  const [kind, id] = value.split(":");
  const binding = {
    designation: kind || "unrestricted",
    project_id: null as string | null,
    center_id: null as string | null,
    scholarship_id: null as string | null,
    fund_id: null as string | null,
  };

  if (!id) return binding;
  if (kind === "project") binding.project_id = id;
  if (kind === "center") binding.center_id = id;
  if (kind === "scholarship") binding.scholarship_id = id;
  if (kind === "fund") binding.fund_id = id;
  return binding;
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

type DonateSearchParams = { submitted?: string; error?: string };

export default async function DonatePage({
  searchParams,
}: {
  searchParams?: Promise<DonateSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const [
    settings,
    projects,
    scholarships,
    centers,
    endowments,
    sustainability,
    impacts,
  ] = await Promise.all([
    getDonationSettings(),
    getProjects(),
    getScholarships(),
    getCenters(),
    getEndowments(),
    getSustainability(),
    getDonationImpacts(),
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

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <DonateMasthead
        priorityCount={priorities.length}
        impactCount={impacts.data.length}
        currency={donationSettings.currency}
        contactHref={donationSettings.contactHref}
      />

      {params.submitted ? (
        <section className="px-4 pt-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto max-w-[1680px]">
            <DonationSuccessPanel
              referenceCode={params.submitted}
              bank={donationSettings.bank}
              contactEmail={donationSettings.contactEmail}
            />
          </div>
        </section>
      ) : null}
      {params.error ? (
        <section className="px-4 pt-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto max-w-[1680px]">
            <StatusMessage tone="error">Donation request could not be submitted. Please check the amount and required donor details.</StatusMessage>
          </div>
        </section>
      ) : null}

      <ResearchSection
        eyebrow="Giving Priorities"
        title="Choose what to support"
        body="Giving priorities are assembled from published research records and kept compact so donors can move quickly to the form."
        tone="white"
      >
        <PrioritySelector priorities={priorities} />
        {[settings.error, projects.error, scholarships.error, centers.error, endowments.error, sustainability.error]
          .filter(Boolean)
          .map((error) => (
            <div key={error} className="mt-5">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          ))}
      </ResearchSection>

      <ResearchSection
        eyebrow="Make a Gift"
        title="Start a donation"
        body="Submit a pending gift request for admin tracking, then continue through the configured giving channel when available."
      >
        <div id="make-a-gift" className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <DonationForm
            currency={donationSettings.currency}
            amounts={donationSettings.amounts}
            priorities={priorities}
            contactEmail={donationSettings.contactEmail}
            onlineGivingUrl={donationSettings.onlineGivingUrl}
          />
          <ImpactFeature impact={featuredImpact} />
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Major Gifts"
        title="Major gifts and endowments"
        body="Named funds, equipment support, corporate giving, and planned giving are handled through a guided conversation with the research office."
        tone="white"
      >
        {impacts.error ? (
          <div className="mb-5">
            <StatusMessage tone="error">{impacts.error}</StatusMessage>
          </div>
        ) : null}
        <MajorGiftPanel contactHref={donationSettings.contactHref} />
      </ResearchSection>
    </main>
  );
}

function DonateMasthead({
  priorityCount,
  impactCount,
  currency,
  contactHref,
}: {
  priorityCount: number;
  impactCount: number;
  currency: string;
  contactHref: string;
}) {
  const stats = [
    { label: "Giving priorities", value: priorityCount },
    { label: "Impact reports", value: impactCount },
    { label: "Currency", value: currency },
  ];

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Donate</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">Research Giving</p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">Support research that serves communities</h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">Give to published projects, student discovery, innovation, community extension, sustainability work, facilities, or endowment funds.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/donate#make-a-gift">Give now</PrimaryLink>
            <SecondaryLink href={contactHref}>Discuss major gift</SecondaryLink>
          </div>
        </div>
        <dl className="grid gap-2 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-[11px] font-semibold uppercase text-slate-500">{stat.label}</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-950">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

type DonationSettings = {
  amounts: number[];
  currency: string;
  onlineGivingUrl: string;
  contactEmail: string;
  contactHref: string;
  bank: DonationBankDetails;
};

type DonationBankDetails = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string;
  branch: string;
  instructions: string;
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
    bank: {
      bankName: getSettingValue(settings, ["bank_name", "donation_bank_name"]),
      accountName: getSettingValue(settings, ["account_name", "bank_account_name", "donation_account_name"]),
      accountNumber: getSettingValue(settings, ["account_number", "bank_account_number", "donation_account_number"]),
      swiftCode: getSettingValue(settings, ["swift_code", "bank_swift_code"]),
      branch: getSettingValue(settings, ["bank_branch", "branch"]),
      instructions: getSettingValue(settings, ["payment_instructions", "bank_transfer_instructions", "donation_instructions"]),
    },
  };
}

function getSettingValue(settings: Map<string, ResearchGenericRecord>, keys: string[]) {
  for (const key of keys) {
    const value = compactText(settings.get(key)?.value) || compactText(settings.get(key)?.description);
    if (value) return value;
  }
  return "";
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

function DonationSuccessPanel({
  referenceCode,
  bank,
  contactEmail,
}: {
  referenceCode: string;
  bank: DonationBankDetails;
  contactEmail: string;
}) {
  const accountRows = [
    { label: "Bank", value: bank.bankName },
    { label: "Account name", value: bank.accountName },
    { label: "Account number", value: bank.accountNumber },
    { label: "SWIFT code", value: bank.swiftCode },
    { label: "Branch", value: bank.branch },
  ].filter((row) => row.value);
  const hasAccountDetails = accountRows.length > 0;

  return (
    <section className="rounded-lg border border-primary/25 bg-primary/[0.04] p-5 shadow-sm">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.65fr)]">
        <div>
          <Badge>Donation submitted</Badge>
          <h2 className="mt-4 text-2xl font-semibold leading-8 text-slate-950">
            Thank you for your generosity.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Your donation request has been recorded for admin follow-up. Use this reference when completing payment or contacting the research office.
          </p>
          <div className="mt-5 rounded-md border border-primary/20 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Reference code</p>
            <p className="mt-1 break-all font-mono text-lg font-semibold text-primary">{referenceCode}</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            The request is visible under admin donation records as a pending donation.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-base font-semibold text-slate-950">Donation account details</h3>
          {hasAccountDetails ? (
            <dl className="mt-4 divide-y divide-slate-200">
              {accountRows.map((row) => (
                <div key={row.label} className="grid gap-1 py-3 sm:grid-cols-[130px_1fr]">
                  <dt className="text-xs font-semibold uppercase text-slate-500">{row.label}</dt>
                  <dd className="break-words text-sm font-semibold text-slate-950">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Account details are not published yet. The giving office will share payment instructions by email.
            </p>
          )}
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {bank.instructions || `For payment instructions, contact ${contactEmail}.`}
          </p>
        </div>
      </div>
    </section>
  );
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

function PrioritySelector({ priorities }: { priorities: Priority[] }) {
  return (
    <div id="priorities" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {priorities.map((priority, index) => {
        const Icon = priority.icon;
        return (
          <a
            key={priority.id}
            href="#make-a-gift"
            className={
              index === 0
                ? "rounded-lg border border-primary bg-primary/[0.04] p-4 shadow-sm"
                : "rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/30"
            }
          >
            <span className={index === 0 ? "inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white" : "inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-primary"}>
              <Icon aria-hidden className="h-5 w-5" />
            </span>
            <h2 className="mt-3 text-base font-semibold leading-6 text-slate-950">{priority.title}</h2>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{priority.body}</p>
          </a>
        );
      })}
    </div>
  );
}

function DonationForm({
  currency,
  amounts,
  priorities,
  contactEmail,
  onlineGivingUrl,
}: {
  currency: string;
  amounts: number[];
  priorities: Priority[];
  contactEmail: string;
  onlineGivingUrl: string;
}) {
  return (
    <form
      action={submitDonation}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
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
      <input type="hidden" name="preferred_payment_method" value={onlineGivingUrl ? "online" : "inquiry"} />

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

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
        </div>
      </div>

      <details className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-950">Additional details</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <InputField name="organization_name" label="Organization" placeholder="Optional organization" />
          <label>
            <span className="text-xs font-semibold uppercase text-slate-500">Recurring frequency</span>
            <select
              name="recurring_frequency"
              defaultValue="monthly"
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>
          <label>
            <span className="text-xs font-semibold uppercase text-slate-500">Recognition</span>
            <select
              name="recognition_public"
              defaultValue="false"
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="false">Keep private</option>
              <option value="true">May be recognized publicly</option>
            </select>
          </label>
          <label>
            <span className="text-xs font-semibold uppercase text-slate-500">Anonymous giving</span>
            <select
              name="is_anonymous"
              defaultValue="false"
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="false">Use my name internally</option>
              <option value="true">Keep me anonymous</option>
            </select>
          </label>
          <label>
            <span className="text-xs font-semibold uppercase text-slate-500">Tribute gift</span>
            <select
              name="is_tribute"
              defaultValue="false"
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="false">No tribute</option>
              <option value="true">In honor or memory</option>
            </select>
          </label>
          <label>
            <span className="text-xs font-semibold uppercase text-slate-500">Tribute type</span>
            <select
              name="tribute_type"
              defaultValue="in_honor"
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="in_honor">In honor</option>
              <option value="in_memory">In memory</option>
            </select>
          </label>
          <InputField name="tribute_name" label="Tribute name" placeholder="Optional tribute name" />
          <label className="sm:col-span-2">
            <span className="text-xs font-semibold uppercase text-slate-500">Purpose or note</span>
            <input
              name="purpose"
              placeholder="Optional purpose, fund, project, or scholarship note"
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs font-semibold uppercase text-slate-500">Message</span>
            <textarea
              name="message"
              rows={3}
              placeholder="Optional donor message or pledge note"
              className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs font-semibold uppercase text-slate-500">Dedication</span>
            <textarea
              name="dedication"
              rows={3}
              placeholder="Optional dedication text"
              className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </label>
        </div>
      </details>

      <button className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">
        Continue to giving channel
        <ArrowRight aria-hidden className="h-4 w-4" />
      </button>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        This creates a pending donation record for admin follow-up. {onlineGivingUrl ? "The giving office can reconcile it with the configured online channel." : `The giving office will respond through ${contactEmail}.`}
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
      <div className="border-t border-slate-200 px-5 py-4">
        <Link href="/community-impact" className="inline-flex text-sm font-semibold text-primary">
          View impact reports
        </Link>
      </div>
    </article>
  );
}

function MajorGiftPanel({ contactHref }: { contactHref: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
            <Landmark aria-hidden className="h-5 w-5" />
          </span>
          <div>
            <Badge>Major gifts</Badge>
            <h2 className="mt-3 text-2xl font-semibold leading-8 text-slate-950">
              Discuss endowments, named funds, and institutional support
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-600">
              For named funds, equipment support, corporate giving, planned giving, or major endowment support, contact the research office before submitting payment.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={contactHref}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Contact giving office
          </a>
          <Link
            href="/endowments"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-primary/25 bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
          >
            View endowments
          </Link>
        </div>
      </div>
    </section>
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
