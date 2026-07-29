import Image from "next/image";
import Link from "next/link";
import {
  Eye,
  Goal,
  Handshake,
  Lightbulb,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { SiteShell } from "../../components/site-shell";

const values = [
  ["Excellence", "We pursue the highest standards in everything we do."],
  [
    "Collaboration",
    "We work together across disciplines, sectors and communities.",
  ],
  [
    "Inclusivity",
    "We value diversity and ensure all voices are heard and respected.",
  ],
  [
    "Accountability",
    "We are transparent, ethical and answerable for our commitments.",
  ],
  [
    "Innovation",
    "We embrace creativity and evidence to drive solutions that work.",
  ],
  [
    "Responsiveness",
    "We listen, learn and adapt to emerging needs and contexts.",
  ],
  ["Integrity", "We act with honesty, respect and professionalism."],
  [
    "African-Centred Knowledge",
    "We centre African languages, contexts and priorities in our work.",
  ],
] as const;
const approaches = [
  ["Research", "We generate rigorous, contextually relevant evidence.", Search],
  [
    "Policy",
    "We translate evidence into actionable recommendations.",
    ShieldCheck,
  ],
  [
    "Practice",
    "We support teachers and schools with practical resources.",
    Lightbulb,
  ],
  [
    "Capacity Strengthening",
    "We build skills and networks across the continent.",
    UsersRound,
  ],
] as const;

export default function AboutPage() {
  return (
    <SiteShell>
      <main className="bg-white">
        <section className="relative overflow-hidden bg-heri-ink text-white">
          <div className="absolute inset-0 bg-[linear-gradient(115deg,#003c39,#006b62_54%,#07302d)]" />
          <div className="relative mx-auto grid min-h-[390px] max-w-7xl items-end gap-8 px-6 pb-14 pt-20 lg:grid-cols-2 lg:px-10">
            <div>
              <p className="text-sm text-white/70">
                Home <span className="mx-2">/</span> About Us
              </p>
              <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-heri-lime">
                ABOUT THE RESEARCH CHAIR
              </p>
              <h1 className="mt-4 max-w-2xl text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl">
                Africa-Led Research for{" "}
                <span className="text-heri-lime">Language and Learning</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/85">
                We generate, translate and apply evidence to inform language
                education policy and practice—so every African learner can read,
                understand and thrive.
              </p>
              <Link
                href="/our-work"
                className="mt-7 inline-flex items-center gap-5 rounded-lg bg-heri-lime px-5 py-3 text-xs font-bold text-heri-ink"
              >
                OUR APPROACH <span>→</span>
              </Link>
            </div>
            <div className="relative hidden h-[300px] overflow-hidden rounded-t-[5rem] rounded-bl-[5rem] lg:block">
              <Image
                src="/images/backgrounds/about-hero.jpg"
                alt="HERI Africa researchers collaborating"
                fill
                sizes="50vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:px-10">
          <div>
            <div className="h-1 w-10 bg-heri-lime" />
            <h2 className="mt-4 text-4xl font-bold text-heri-blue">
              Who We Are
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              The HERI Africa Language Education Research Chair at Kisii
              University advances Africa-led research in language education and
              foundational literacy. We produce rigorous evidence, inform
              policy, strengthen practice and build capacity across the
              continent.
            </p>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Our work is grounded in the belief that children learn best in and
              through the languages they understand, and that strong language
              education underpins equitable development and lifelong learning.
            </p>
            <Link
              href="/team"
              className="mt-7 inline-flex items-center gap-4 rounded-lg bg-heri-lime px-5 py-3 text-xs font-bold text-heri-ink"
            >
              MEET OUR TEAM <span>→</span>
            </Link>
          </div>
          <div className="relative h-[330px] overflow-hidden rounded-2xl">
            <Image
              src="/images/landing-page/why-kisii/pathway-2.jpg"
              alt="Researchers working together"
              fill
              sizes="50vw"
              className="object-cover"
            />
          </div>
        </section>
        <section className="bg-heri-cream/60 px-6 py-12">
          <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex items-center justify-center gap-5 text-heri-blue">
              <Image
                src="/logos/ksu-logo.png"
                alt="Kisii University"
                width={84}
                height={84}
                className="size-20 object-contain"
              />
              <span className="text-3xl text-slate-400">×</span>
              <div className="text-2xl font-bold">
                HERI AFRICA
                <span className="block text-xs font-normal tracking-widest text-heri-teal">
                  Language Education Research Chair
                </span>
              </div>
            </div>
            <div className="border-l border-heri-teal/40 pl-8">
              <h2 className="text-3xl font-bold text-heri-blue">
                Hosted by Kisii University
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                The HERI Africa Language Education Research Chair is hosted by
                Kisii University, a leading public university committed to
                advancing knowledge, innovation and societal transformation.
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Through this partnership, we bridge research, policy and
                practice to strengthen language education systems across Africa.
              </p>
            </div>
          </div>
        </section>
        <section className="bg-heri-ink px-6 py-14 text-white">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold">
              Why Language Education Matters
            </h2>
            <div className="mx-auto mt-3 h-1 w-12 bg-heri-lime" />
            <div className="mt-10 grid gap-8 md:grid-cols-4">
              {[
                [
                  "Learning begins in language",
                  "Children learn best when they understand. Mother-tongue instruction improves early learning outcomes.",
                  Eye,
                ],
                [
                  "Strong evidence, better results",
                  "Quality language education leads to higher achievement, greater retention and stronger transitions.",
                  Goal,
                ],
                [
                  "Equity and inclusion for all",
                  "Inclusive language policies and practices ensure no learner is left behind.",
                  UsersRound,
                ],
                [
                  "Building Africa’s knowledge future",
                  "Investing in African languages fuels innovation, local solutions and sustainable development.",
                  Lightbulb,
                ],
              ].map(([title, text, Icon]) => (
                <article
                  className="border-heri-lime/70 md:border-r md:pr-6 last:border-0"
                  key={title as string}
                >
                  <Icon className="size-9 text-heri-lime" />
                  <h3 className="mt-5 text-xl font-bold leading-tight">
                    {title as string}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    {text as string}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <article className="flex gap-5">
              <Eye className="mt-1 size-12 shrink-0 text-heri-teal" />
              <div>
                <h2 className="text-3xl font-bold text-heri-blue">
                  Our Vision
                </h2>
                <div className="mt-3 h-1 w-10 bg-heri-lime" />
                <p className="mt-5 text-sm leading-6 text-slate-600">
                  To be a leading Africa-led Centre of Excellence in language
                  education research, advancing foundational literacy,
                  educational transformation, and global societal impact.
                </p>
              </div>
            </article>
            <article className="flex gap-5 border-t border-slate-200 pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0">
              <Goal className="mt-1 size-12 shrink-0 text-heri-teal" />
              <div>
                <h2 className="text-3xl font-bold text-heri-blue">
                  Our Mission
                </h2>
                <div className="mt-3 h-1 w-10 bg-heri-lime" />
                <p className="mt-5 text-sm leading-6 text-slate-600">
                  To advance impactful, policy-responsive, and practice-oriented
                  research in language education and foundational literacy for
                  educational transformation in Africa and beyond.
                </p>
              </div>
            </article>
          </div>
        </section>
        <section className="border-t border-slate-200 px-6 py-12">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-3xl font-bold text-heri-blue">
              Our Core Values
            </h2>
            <div className="mx-auto mt-3 h-1 w-10 bg-heri-lime" />
            <div className="mt-8 grid divide-y divide-slate-200 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
              {values.map(([title, text]) => (
                <article
                  className="border-slate-200 px-5 py-6 text-center sm:border-b lg:border-r lg:nth-[4n]:border-r-0"
                  key={title}
                >
                  <Handshake className="mx-auto size-8 text-heri-lime" />
                  <h3 className="mt-3 font-bold text-heri-blue">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-6 py-12">
          <h2 className="text-3xl font-bold text-heri-blue">Our Approach</h2>
          <div className="mt-3 h-1 w-10 bg-heri-lime" />
          <div className="mt-8 grid gap-5 md:grid-cols-4">
            {approaches.map(([title, text, Icon]) => (
              <article
                className="rounded-2xl border border-slate-200 p-6"
                key={title}
              >
                <span className="grid size-12 place-items-center rounded-full bg-heri-lime text-heri-ink">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 font-bold text-heri-blue">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="mx-6 mb-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:mx-auto md:max-w-6xl">
          <div className="grid items-center md:grid-cols-[0.35fr_1fr_auto]">
            <div className="relative hidden h-32 md:block">
              <Image
                src="/images/landing-page/tc-fore.png"
                alt="Learners collaborating"
                fill
                sizes="20vw"
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-heri-blue">
                Partner With Us
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Together, we can expand opportunity, strengthen systems and
                ensure every child learns in a language they understand.
              </p>
            </div>
            <Link
              href="/partner-with-us"
              className="mx-6 mb-6 inline-flex items-center justify-center gap-4 rounded-lg bg-heri-lime px-5 py-3 text-xs font-bold text-heri-ink md:mb-0"
            >
              PARTNER WITH US →
            </Link>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
