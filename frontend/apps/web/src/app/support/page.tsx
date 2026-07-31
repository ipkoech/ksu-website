import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Banknote,
  FlaskConical,
  GraduationCap,
  HandHeart,
  Landmark,
  Sprout,
} from "lucide-react";
import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { PageShell } from "@/components/site-shell";
import { DonationForm, type DonationFormState } from "./support-form";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Support KSU",
  description:
    "Give to Kisii University — scholarships, research and innovation, facilities, community programmes, and endowment funds.",
};

const defaultAmounts = [1000, 2500, 5000, 10000];

async function submitDonation(
  _prevState: DonationFormState,
  formData: FormData,
): Promise<DonationFormState> {
  "use server";

  const amount = getDonationAmount(formData);
  if (!amount) return { error: "Please choose or enter a valid gift amount." };

  const designationValue = getFormString(formData, "designation") || "unrestricted:general";
  const designation = designationValue.split(":")[0] || "unrestricted";
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
      recurring_frequency:
        donationType === "recurring" ? getFormString(formData, "recurring_frequency") : undefined,
      designation,
      purpose: getFormString(formData, "purpose"),
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
    return {
      error:
        "Your gift could not be submitted. Please check your details and try again, or contact the giving office.",
    };
  }
  redirect(`/support?submitted=${donationReference}`);
}

function getDonationAmount(formData: FormData) {
  const customAmount = Number(getFormString(formData, "custom_amount"));
  if (Number.isFinite(customAmount) && customAmount > 0) return customAmount;
  const selectedAmount = Number(getFormString(formData, "amount"));
  return Number.isFinite(selectedAmount) && selectedAmount > 0 ? selectedAmount : 0;
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

type SupportSearchParams = { submitted?: string };

export default async function SupportKsuPage({
  searchParams,
}: {
  searchParams?: Promise<SupportSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const settingsRecords = await researchServiceApi.donationSettings
    .list({ is_active: true, is_public: true, page: 1, per_page: 100 })
    .then((response) => response.data ?? [])
    .catch((error) => {
      console.error("Failed to fetch donation settings:", error);
      return [] as ResearchGenericRecord[];
    });
  const settings = buildDonationSettings(settingsRecords);

  return (
    <PageShell>
      <SupportHero contactHref={settings.contactHref} />

      {params.submitted ? (
        <section className="px-4 pt-8 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto max-w-[1680px]">
            <DonationSuccessPanel
              referenceCode={params.submitted}
              bank={settings.bank}
              contactEmail={settings.contactEmail}
            />
          </div>
        </section>
      ) : null}
      <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8 lg:py-14 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.85fr)] lg:items-start">
          <div>
            <SupportKicker>Your Impact</SupportKicker>
            <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              How your support benefits Kisii University.
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
              <p>
                Kisii University serves thousands of students, many of whom are the first in their
                families to reach university. Tuition and public funding cover the basics of
                teaching — but they rarely stretch to the things that transform an education:
                keeping a bright student enrolled when their family hits hardship, equipping a
                laboratory for hands-on discovery, or carrying research out of the campus and into
                the communities of the Kisii region.
              </p>
              <p>
                That is the gap donor support fills. Gifts from alumni, friends, corporations, and
                foundations let the university act where the need is most urgent and the impact is
                most direct — quickly, and without diverting funds from core teaching.
              </p>
              <p>
                Every gift is recorded against a reference code, directed to the priority you
                choose, and acknowledged by the advancement office. Donors to named funds and
                endowments receive reports on how their fund is applied.
              </p>
            </div>
          </div>
          <aside className="rounded-md border border-border bg-white p-5 shadow-sm sm:p-6">
            <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-7 text-foreground">
              What donations are used for
            </h3>
            <ul className="mt-5 grid gap-4">
              {donationUses.map((use) => {
                const Icon = use.icon;
                return (
                  <li key={use.title} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-primary ring-1 ring-border">
                      <Icon aria-hidden className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{use.title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{use.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 rounded-md bg-surface-subtle p-3 text-xs leading-5 text-muted-foreground">
              Donations are applied to the giving area you select on the form. Unrestricted gifts
              are allocated by the university to the most urgent of these needs.
            </p>
          </aside>
        </div>
      </section>

      <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8 lg:py-14 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-[1680px]">
          <SupportKicker>Giving Priorities</SupportKicker>
          <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Choose what your gift supports.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Direct your gift to the area you care about most, or give unrestricted support and let
            the university apply it where the need is greatest.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {givingPriorities.map((priority, index) => {
              const Icon = priority.icon;
              return (
                <a
                  key={priority.value}
                  href="#make-a-gift"
                  className={
                    index === 0
                      ? "group rounded-md border border-secondary bg-secondary/[0.06] p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                      : "group rounded-md border border-border bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                  }
                >
                  <span
                    className={
                      index === 0
                        ? "inline-flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-white"
                        : "inline-flex h-11 w-11 items-center justify-center rounded-md bg-accent text-primary ring-1 ring-border"
                    }
                  >
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 text-base font-semibold leading-6 text-foreground">
                    {priority.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">
                    {priority.body}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="make-a-gift"
        className="border-b border-border px-4 py-12 sm:px-6 lg:px-8 lg:py-14 xl:px-10 2xl:px-12"
      >
        <div className="mx-auto max-w-[1680px]">
          <SupportKicker>Make a Gift</SupportKicker>
          <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Start your donation.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Submitting this form records your gift with the advancement office. You will receive a
            reference code and the payment details to complete your gift.
          </p>
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
            <DonationForm
              currency={settings.currency}
              amounts={settings.amounts}
              givingOptions={givingPriorities.map(({ title, value }) => ({ title, value }))}
              action={submitDonation}
            />
            <div className="grid gap-6">
              <DonationAccountPanel bank={settings.bank} contactEmail={settings.contactEmail} />
              <WhyGivePanel />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-14 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-[1680px] overflow-hidden rounded-md bg-brand-overlay p-6 text-white sm:p-10">
          <div className="relative">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20">
                  <Landmark aria-hidden className="h-5 w-5" />
                </span>
                <div>
                  <SupportKicker>Major Gifts</SupportKicker>
                  <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-8 sm:text-3xl">
                    Endowments, named funds, and institutional support
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-white/80">
                    For named scholarships, equipment and facility support, corporate partnerships,
                    planned giving, or endowment gifts, talk to the advancement office first — we
                    will structure the gift around your intent.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={settings.contactHref}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-secondary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary/90"
                >
                  Contact the giving office
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </a>
                <Link
                  href="/contact"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  All contacts
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function SupportHero({ contactHref }: { contactHref: string }) {
  return (
    <header className="relative isolate min-h-[280px] overflow-hidden bg-brand-overlay sm:min-h-[320px] lg:min-h-[360px]">
      <Image
        src="/images/headers/main-admin.jpg"
        alt="Main administration building at Kisii University"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,20,49,0.78)_0%,rgba(2,20,49,0.42)_55%,rgba(2,20,49,0.1)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
      <div className="relative mx-auto flex min-h-[280px] max-w-[1680px] flex-col justify-end px-4 pb-8 pt-20 sm:min-h-[320px] sm:px-6 sm:pb-10 lg:min-h-[360px] lg:px-8 xl:px-10 2xl:px-12">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
          Advancement &amp; Giving
          <span aria-hidden className="mt-2 block h-0.5 w-7 bg-secondary" />
        </p>
        <h1 className="mt-3 max-w-3xl text-balance font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.1] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)] sm:text-4xl lg:text-5xl">
          Support Kisii University
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base sm:leading-8">
          Every gift — from scholarships to laboratories — helps students learn, researchers
          discover, and communities thrive. Choose a priority and give in minutes.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="#make-a-gift"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-secondary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary/90"
          >
            Give now
            <ArrowRight aria-hidden className="h-4 w-4" />
          </a>
          <a
            href={contactHref}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/45 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            Discuss a major gift
          </a>
        </div>
      </div>
    </header>
  );
}

type GivingPriority = {
  title: string;
  body: string;
  value: string;
  icon: LucideIcon;
};

type DonationUse = {
  title: string;
  body: string;
  icon: LucideIcon;
};

const donationUses: DonationUse[] = [
  {
    title: "Student bursaries and welfare",
    body: "Fees, accommodation, and emergency support that keep needy students in class through to graduation.",
    icon: GraduationCap,
  },
  {
    title: "Research, laboratories, and equipment",
    body: "Seed grants, lab consumables, instruments, and support for student and staff research projects.",
    icon: FlaskConical,
  },
  {
    title: "Learning facilities and infrastructure",
    body: "Modernizing lecture spaces, the library, ICT, and accessibility across the campus.",
    icon: Landmark,
  },
  {
    title: "Community outreach and extension",
    body: "Health, agriculture, and education programmes that take university expertise into the region.",
    icon: Sprout,
  },
  {
    title: "Endowment growth",
    body: "Permanent invested funds whose annual income sustains scholarships and research in perpetuity.",
    icon: Banknote,
  },
];

const givingPriorities: GivingPriority[] = [
  {
    title: "Greatest need",
    body: "Unrestricted support the university directs to its most urgent priorities across teaching, research, and student life.",
    value: "unrestricted:general",
    icon: HandHeart,
  },
  {
    title: "Scholarships & student support",
    body: "Bursaries, scholarships, and welfare support that keep talented students in class through to graduation.",
    value: "scholarship",
    icon: GraduationCap,
  },
  {
    title: "Research & innovation",
    body: "Fund research projects, student discovery, innovation, and the translation of knowledge into public value.",
    value: "project",
    icon: FlaskConical,
  },
  {
    title: "Facilities & learning spaces",
    body: "Laboratories, libraries, lecture spaces, and campus infrastructure that shape the learning experience.",
    value: "center",
    icon: Landmark,
  },
  {
    title: "Community & sustainability",
    body: "Extension programmes, outreach, and sustainability initiatives serving the wider Kisii region.",
    value: "sustainability",
    icon: Sprout,
  },
  {
    title: "Endowments & named funds",
    body: "Permanent funds that generate income year after year for a purpose you name.",
    value: "fund",
    icon: Banknote,
  },
];

function SupportKicker({ children }: { children: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
      {children}
      <span aria-hidden className="mt-2 block h-0.5 w-7 bg-secondary" />
    </p>
  );
}

type DonationSettings = {
  amounts: number[];
  currency: string;
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

function compact(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function buildDonationSettings(records: ResearchGenericRecord[]): DonationSettings {
  const settings = new Map(records.map((record) => [compact(record.key), record]));
  const getValue = (keys: string[]) => {
    for (const key of keys) {
      const record = settings.get(key);
      const value = compact(record?.value) || compact(record?.description);
      if (value) return value;
    }
    return "";
  };

  const contactEmail =
    getValue(["giving_email", "contact_email"]) || "research@kisiiuniversity.ac.ke";

  return {
    amounts: getSuggestedAmounts(
      settings.get("suggested_amounts") ?? settings.get("donation_amounts") ?? settings.get("amounts"),
    ),
    currency: getValue(["currency", "default_currency"]) || "KES",
    contactEmail,
    contactHref: `mailto:${contactEmail}?subject=${encodeURIComponent("Support KSU — Giving Inquiry")}`,
    bank: {
      bankName: getValue(["bank_name", "donation_bank_name"]),
      accountName: getValue(["account_name", "bank_account_name", "donation_account_name"]),
      accountNumber: getValue(["account_number", "bank_account_number", "donation_account_number"]),
      swiftCode: getValue(["swift_code", "bank_swift_code"]),
      branch: getValue(["bank_branch", "branch"]),
      instructions: getValue([
        "payment_instructions",
        "bank_transfer_instructions",
        "donation_instructions",
      ]),
    },
  };
}

function getSuggestedAmounts(record?: ResearchGenericRecord) {
  const valueJson = record?.value_json;
  if (Array.isArray(valueJson)) {
    const amounts = valueJson.map(Number).filter((amount) => Number.isFinite(amount) && amount > 0);
    if (amounts.length > 0) return amounts;
  }
  if (Array.isArray(valueJson?.amounts)) {
    const amounts = valueJson.amounts
      .map(Number)
      .filter((amount: number) => Number.isFinite(amount) && amount > 0);
    if (amounts.length > 0) return amounts;
  }
  const value = compact(record?.value);
  if (value) {
    const amounts = value
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((amount) => Number.isFinite(amount) && amount > 0);
    if (amounts.length > 0) return amounts;
  }
  return defaultAmounts;
}

function DonationAccountPanel({
  bank,
  contactEmail,
}: {
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

  return (
    <aside className="rounded-md border border-border bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent text-primary ring-1 ring-border">
          <Banknote aria-hidden className="h-5 w-5" />
        </span>
        <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-7 text-foreground">
          How to complete your gift
        </h3>
      </div>
      {accountRows.length > 0 ? (
        <dl className="mt-5 divide-y divide-slate-200">
          {accountRows.map((row) => (
            <div key={row.label} className="grid gap-1 py-3 first:pt-0 sm:grid-cols-[128px_1fr]">
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {row.label}
              </dt>
              <dd className="break-words text-sm font-semibold text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <p className="mt-4 rounded-md bg-surface-subtle p-3 text-sm leading-6 text-muted-foreground">
        {bank.instructions ||
          `After submitting the form, complete your gift by bank transfer or contact ${contactEmail} for payment instructions. Quote your reference code so the gift is matched to you.`}
      </p>
    </aside>
  );
}

function WhyGivePanel() {
  const points = [
    "Every gift is recorded and acknowledged with an official reference.",
    "You choose the priority — or leave it unrestricted for the greatest need.",
    "Gifts can honor a person, create a named fund, or recur automatically.",
  ];

  return (
    <aside className="rounded-md border border-border bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent text-primary ring-1 ring-border">
          <HandHeart aria-hidden className="h-5 w-5" />
        </span>
        <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-7 text-foreground">
          Why give to KSU
        </h3>
      </div>
      <ul className="mt-5 grid gap-3">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
            {point}
          </li>
        ))}
      </ul>
      <Link
        href="/alumni"
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-secondary"
      >
        Alumni giving and engagement
        <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
    </aside>
  );
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

  return (
    <section className="rounded-md border border-secondary/30 bg-secondary/[0.05] p-5 shadow-sm sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.65fr)]">
        <div>
          <p className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white">
            Gift submitted
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold leading-8 text-foreground">
            Thank you for supporting Kisii University.
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Your gift has been recorded and the advancement office will follow up. Quote this
            reference when completing payment or contacting the university.
          </p>
          <div className="mt-5 rounded-md border border-secondary/25 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Reference code
            </p>
            <p className="mt-1 break-all font-mono text-lg font-semibold text-secondary">
              {referenceCode}
            </p>
          </div>
        </div>
        <div className="rounded-md border border-border bg-white p-4 sm:p-5">
          <h3 className="text-base font-semibold text-foreground">Payment details</h3>
          {accountRows.length > 0 ? (
            <dl className="mt-4 divide-y divide-slate-200">
              {accountRows.map((row) => (
                <div key={row.label} className="grid gap-1 py-3 sm:grid-cols-[130px_1fr]">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {row.label}
                  </dt>
                  <dd className="break-words text-sm font-semibold text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {bank.instructions || `For payment instructions, contact ${contactEmail}.`}
          </p>
        </div>
      </div>
    </section>
  );
}
