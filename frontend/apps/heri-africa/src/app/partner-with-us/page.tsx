import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Building2,
  Clock3,
  HandCoins,
  Landmark,
  Mail,
  MapPin,
  Network,
  Phone,
  School,
  UsersRound,
} from "lucide-react";
import { ContactForm } from "../../components/forms/contact-form";
import { SiteShell } from "../../components/site-shell";
import { getPartners } from "../../lib/api";

const pathways = [
  [
    "Research Collaboration",
    "Co-design and implement contextually relevant research that addresses real needs and drives transformative change.",
    UsersRound,
  ],
  [
    "Funding & Grants",
    "Mobilise resources and co-create funding opportunities to scale high-impact research and practice.",
    HandCoins,
  ],
  [
    "Policy Engagement",
    "Generate evidence that informs language education policy and supports evidence-based reforms.",
    Landmark,
  ],
  [
    "Schools & Communities",
    "Work together to test, refine and sustain solutions that improve learning outcomes.",
    School,
  ],
  [
    "Researcher Development",
    "Strengthen research capacity through training, mentorship and collaborative learning.",
    Network,
  ],
  [
    "Events & Knowledge Exchange",
    "Host and participate in events, webinars and forums that connect ideas, people and evidence.",
    Building2,
  ],
] as const;
const partnerTypes = [
  "Universities",
  "Governments",
  "Schools",
  "Researchers",
  "Funders",
  "Communities",
  "Development Organisations",
];
const fallbackPartners = [
  {
    id: "kisii",
    name: "Kisii University",
    description: "Host institution",
    logo_url: "/logos/ksu-logo.png",
    website_url: null,
    country: "Kenya",
  },
  {
    id: "heri",
    name: "HERI Africa",
    description: "Language Education Research Chair",
    logo_url: null,
    website_url: null,
    country: "Africa",
  },
  {
    id: "kenyatta",
    name: "Kenyatta University",
    description: "Research and education partner",
    logo_url: null,
    website_url: null,
    country: "Kenya",
  },
  {
    id: "maseno",
    name: "Maseno University",
    description: "Research and education partner",
    logo_url: null,
    website_url: null,
    country: "Kenya",
  },
];

export const revalidate = 300;

export default async function PartnerPage() {
  const partners = await getPartners()
    .then((items) => (items.length ? items : fallbackPartners))
    .catch(() => fallbackPartners);
  return (
    <SiteShell>
      <main className="bg-white">
        <section className="relative overflow-hidden bg-heri-ink text-white">
          <div className="absolute inset-0 bg-[linear-gradient(115deg,#003c39,#006b62_54%,#07302d)]" />
          <div className="relative mx-auto grid min-h-[440px] max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
            <div>
              <p className="text-sm text-white/70">
                Home <span className="mx-2">/</span> Partner With Us
              </p>
              <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-heri-lime">
                Collaborate for impact
              </p>
              <h1 className="mt-4 text-5xl font-bold leading-[1.02] sm:text-6xl">
                Partner With Us to
                <br />
                Advance Language
                <br />
                Education Research
                <br />
                <span className="text-heri-lime">in Africa</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/85">
                Together, we can generate evidence, influence policy, strengthen
                capacity and ensure every learner can read, understand and
                thrive in their language and in the world.
              </p>
              <a
                className="mt-7 inline-flex rounded-lg bg-heri-lime px-5 py-3 text-xs font-bold text-heri-ink"
                href="#partnership-enquiry"
              >
                START A PARTNERSHIP ENQUIRY <span className="ml-4">→</span>
              </a>
            </div>
            <div className="relative h-[310px] overflow-hidden rounded-t-[6rem] rounded-bl-[6rem]">
              <Image
                alt="HERI Africa partners collaborating"
                className="object-cover"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                src="/images/landing-page/why-kisii/pathway-2.jpg"
              />
            </div>
          </div>
        </section>
        <section className="px-6 py-14">
          <div className="mx-auto max-w-7xl text-center">
            <h2 className="text-4xl font-bold text-heri-blue">
              Collaboration That Moves Research Into Action
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-slate-600">
              HERI Africa works with partners across the education ecosystem to
              co-create knowledge, influence decisions and strengthen systems
              for sustainable language education and foundational literacy.
            </p>
            <h3 className="mt-10 text-2xl font-bold text-heri-teal">
              Our Partnership Pathways
            </h3>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
              {pathways.map(([title, text, Icon]) => (
                <article
                  className="border-slate-200 px-4 lg:border-r lg:last:border-0"
                  key={title}
                >
                  <span className="mx-auto grid size-14 place-items-center rounded-full bg-heri-lime text-heri-ink">
                    <Icon className="size-7" />
                  </span>
                  <h4 className="mt-4 text-lg font-bold leading-tight text-heri-blue">
                    {title}
                  </h4>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {text}
                  </p>
                  <span className="mt-4 block text-xl text-heri-lime">→</span>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="bg-heri-cream/50 px-6 py-12">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-3xl font-bold text-heri-blue">
              Who We Partner With
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
              {partnerTypes.map((type) => (
                <div className="text-center" key={type}>
                  <span className="mx-auto grid size-12 place-items-center rounded-full border border-heri-teal/30 text-heri-teal">
                    <Building2 className="size-6" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-heri-blue">
                    {type}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section
          className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:px-10"
          id="partnership-enquiry"
        >
          <aside className="rounded-3xl bg-heri-cream/60 p-7 lg:p-8">
            <div className="h-1 w-10 bg-heri-lime" />
            <h2 className="mt-4 text-4xl font-bold text-heri-blue">
              Let’s work together
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Whether you have a partnership idea, a research question, or a
              general enquiry, our team will connect you with the right person.
            </p>
            <div className="mt-8 grid gap-6 text-sm text-slate-700">
              <ContactDetail icon={MapPin} title="Visit us">
                Kisii University Main Campus
                <br />
                Nyanchwa, Kisii County, Kenya
              </ContactDetail>
              <ContactDetail icon={Mail} title="Email">
                <a className="hover:text-heri-teal" href="mailto:heri-language@kisiiuniversity.ac.ke">
                  heri-language@kisiiuniversity.ac.ke
                </a>
              </ContactDetail>
              <ContactDetail icon={Phone} title="Telephone">
                <a className="hover:text-heri-teal" href="tel:+254796123456">
                  +254 796 123 456
                </a>
              </ContactDetail>
              <ContactDetail icon={Clock3} title="Office hours">
                Monday – Friday: 8:00 AM – 5:00 PM (EAT)
              </ContactDetail>
            </div>
            <div className="mt-8 rounded-2xl bg-heri-teal p-5 text-white">
              <h3 className="font-bold text-heri-lime">What happens next?</h3>
              <p className="mt-2 text-sm leading-6 text-white/80">
                We review every enquiry and respond within five working days.
              </p>
            </div>
          </aside>
          <div>
            <h2 className="text-4xl font-bold text-heri-blue">
              Send us an enquiry
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Select “Partnership enquiry” for collaboration proposals, or use
              the other categories for general, research, media and event questions.
            </p>
            <div className="mt-7">
              <ContactForm />
            </div>
          </div>
        </section>
        <section className="border-t border-slate-200 px-6 py-12">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-3xl font-bold text-heri-blue">
              Our Partners
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {partners.slice(0, 8).map((partner) => (
                <article
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 p-5"
                  key={partner.id}
                >
                  {partner.logo_url ? (
                    <Image
                      alt={`${partner.name} logo`}
                      className="size-14 object-contain"
                      height={56}
                      src={partner.logo_url}
                      unoptimized
                      width={56}
                    />
                  ) : (
                    <span className="grid size-14 place-items-center rounded-full bg-heri-cream text-sm font-bold text-heri-teal">
                      {partner.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <div>
                    <h3 className="font-bold text-heri-blue">{partner.name}</h3>
                    <p className="text-xs text-slate-500">
                      {partner.country ?? "Africa"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
            <Link
              className="mx-auto mt-8 block w-fit text-sm font-bold text-heri-teal"
              href="/partners"
            >
              View partner directory →
            </Link>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}

function ContactDetail({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof MapPin;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <Icon className="mt-0.5 size-6 shrink-0 text-heri-teal" />
      <div>
        <p className="font-bold text-heri-blue">{title}</p>
        <div className="mt-1 leading-6">{children}</div>
      </div>
    </div>
  );
}
