import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Network,
} from "lucide-react";
import { CampusPageHeader } from "@ksu/ui/components";
import type { ActiveIntake } from "@/lib/get-academics";
import { PublicImage } from "./public-image";

const academicNavigation = [
  { title: "Find a Programme", href: "/academics/programmes", icon: BookOpen },
  {
    title: "Schools and Faculties",
    href: "/academics/schools",
    icon: Building2,
  },
  { title: "Departments", href: "/academics/departments", icon: Network },
  {
    title: "Academic Calendar",
    href: "/academics/calendar",
    icon: CalendarDays,
  },
  {
    title: "Examinations",
    href: "/academics/examinations",
    icon: ClipboardCheck,
  },
] as const;

const pathways = [
  {
    title: "Undergraduate",
    body: "Build disciplinary knowledge, practical capability and the confidence to contribute from your first degree.",
    href: "/academics/programmes?level=undergraduate",
  },
  {
    title: "Postgraduate",
    body: "Deepen your expertise through advanced study, professional inquiry and research-led learning.",
    href: "/academics/programmes?level=postgraduate",
  },
  {
    title: "Diploma & Certificate",
    body: "Develop focused, career-relevant skills through accessible and applied routes into higher education.",
    href: "/academics/programmes?level=diploma",
  },
] as const;

const resources = [
  [
    "Programme catalogue",
    "/academics/programmes",
    "Compare programmes, study modes and entry routes.",
  ],
  [
    "Academic calendar",
    "/academics/calendar",
    "Review semester dates, deadlines and published updates.",
  ],
  [
    "Examinations",
    "/academics/examinations",
    "Find timetables, official notices and candidate guidance.",
  ],
  [
    "University library",
    "/library",
    "Access learning resources, collections and research support.",
  ],
  [
    "Student portal",
    "https://portal.kisiiuniversity.ac.ke",
    "Open authenticated academic and student services.",
  ],
] as const;

function ActionLink({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        secondary
          ? "inline-flex min-h-12 items-center gap-3 rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-white/15 active:scale-[0.98]"
          : "inline-flex min-h-12 items-center gap-3 rounded-lg bg-secondary px-6 py-3 text-xs font-bold uppercase tracking-wide text-foreground transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-amber-400 active:scale-[0.98]"
      }
    >
      {children}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}

export function FlowingAcademicsLanding({
  activeIntake,
}: {
  activeIntake?: ActiveIntake | null;
}) {
  return (
    <div className="bg-surface text-foreground">
      <CampusPageHeader
        seed="/academics"
        variant="feature"
        titleWeight="normal"
        eyebrow="Academics"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Academics" }]}
        title={
          <>
            Knowledge with <em className="italic">Purpose.</em>
          </>
        }
        description="Discover an academic community where rigorous learning, practical experience and inquiry prepare graduates to serve, lead and create change."
        actions={
          <>
            <ActionLink href="/academics/programmes">
              Explore programmes
            </ActionLink>
            <ActionLink href="/admissions" secondary>
              Admissions
            </ActionLink>
          </>
        }
      />

      <section className="border-b border-primary/10 px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Academic experience
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-primary sm:text-5xl">
              Learning that shapes <em className="italic">the future.</em>
            </h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              Learn through strong academic foundations, hands-on practice and
              scholarship connected to the needs of communities, professions and
              a changing world.
            </p>
            <Link
              href="/academics/programmes"
              className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-lg bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Explore programmes <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-3xl ring-1 ring-primary/10">
            <PublicImage
              src="/images/Home/OurKSU-82.jpg"
              alt="Kisii University students learning together"
              ratio="hero"
              className="h-[340px] sm:h-[430px]"
              imageClassName="object-cover transition-transform duration-500 motion-safe:hover:scale-[1.03]"
              sizes="(min-width: 1024px) 58vw, 100vw"
            />
          </div>
        </div>
      </section>

      <nav
        aria-label="Explore academics"
        className="border-b border-primary/10 bg-white px-5 sm:px-8 lg:px-16 xl:px-20"
      >
        <div className="mx-auto grid w-full max-w-7xl sm:grid-cols-2 lg:grid-cols-5">
          {academicNavigation.map(({ title, href, icon: Icon }, index) => (
            <Link
              key={href}
              href={href}
              className={`group flex min-h-28 items-center gap-4 border-primary/10 py-6 transition-colors duration-200 hover:text-primary sm:px-5 ${index ? "sm:border-l" : ""}`}
            >
              <Icon aria-hidden className="h-6 w-6 shrink-0 text-secondary" />
              <span className="font-[family-name:var(--font-display)] text-lg font-normal tracking-tight">
                {title}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      <section className="bg-primary px-5 py-16 text-white sm:px-8 lg:px-16 lg:py-20 xl:px-20">
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Our academic conviction
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight sm:text-5xl">
              An education grounded in <em className="italic">discovery.</em>
            </h2>
            <p className="mt-5 text-base leading-8 text-white/75">
              Kisii University brings knowledge, practice and public purpose
              together so that learning remains both intellectually ambitious
              and useful beyond the classroom.
            </p>
          </div>
          <div className="mt-12 grid border-y border-white/15 md:grid-cols-3">
            {[
              [
                "Rigorous learning",
                "Strong disciplinary foundations create the confidence to question, analyse and act.",
              ],
              [
                "Practice with purpose",
                "Applied learning connects ideas to professions, enterprise and community needs.",
              ],
              [
                "Inquiry that matters",
                "Research and curiosity open new ways to understand and improve the world around us.",
              ],
            ].map(([title, body], index) => (
              <article
                key={title}
                className={`py-7 md:px-8 ${index ? "border-t border-white/15 md:border-l md:border-t-0" : ""}`}
              >
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-normal tracking-tight">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/70">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-primary/10 bg-white px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            Study at Kisii
          </p>
          <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-primary sm:text-5xl">
            Choose the route that moves you <em className="italic">forward.</em>
          </h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.18fr_.82fr]">
            <Link
              href={pathways[0].href}
              className="group relative min-h-[430px] overflow-hidden rounded-3xl bg-primary ring-1 ring-primary/10"
            >
              <PublicImage
                src="/images/landing-page/why-kisii/pathway-2.jpg"
                alt="Undergraduate students walking through Kisii University"
                ratio="fill"
                className="absolute inset-0 h-full w-full"
                imageClassName="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-brand-overlay/65"
              />
              <span className="absolute inset-x-0 bottom-0 p-8 text-white sm:p-10">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                  First degree
                </span>
                <span className="mt-3 block font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight">
                  {pathways[0].title}
                </span>
                <span className="mt-4 block max-w-xl text-sm leading-7 text-white/75">
                  {pathways[0].body}
                </span>
                <span className="mt-6 inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-wide">
                  Explore programmes{" "}
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </span>
              </span>
            </Link>
            <div className="border-y border-primary/15">
              {pathways.slice(1).map((pathway) => (
                <Link
                  key={pathway.title}
                  href={pathway.href}
                  className="group block border-b border-primary/15 px-1 py-8 last:border-b-0 sm:px-6"
                >
                  <GraduationCap
                    aria-hidden
                    className="h-7 w-7 text-secondary"
                  />
                  <h3 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-primary">
                    {pathway.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {pathway.body}
                  </p>
                  <span className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary group-hover:underline">
                    View programmes{" "}
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-subtle px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[.6fr_1.4fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Academic resources
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-primary">
              Everything you need to plan{" "}
              <em className="italic">your studies.</em>
            </h2>
          </div>
          <div className="border-t border-primary/15">
            {resources.map(([title, href, body]) => (
              <Link
                key={title}
                href={href}
                className="group grid gap-2 border-b border-primary/15 py-5 sm:grid-cols-[.7fr_1fr_auto] sm:items-center sm:gap-6"
              >
                <span className="font-[family-name:var(--font-display)] text-xl font-normal tracking-tight text-primary">
                  {title}
                </span>
                <span className="text-sm leading-6 text-muted-foreground">
                  {body}
                </span>
                <ArrowRight
                  aria-hidden
                  className="h-4 w-4 text-primary transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-primary/10 bg-white px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
        <div className="mx-auto flex w-full max-w-7xl flex-col justify-between gap-8 rounded-3xl bg-primary p-8 text-white ring-1 ring-primary/20 sm:p-10 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Your next step
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight sm:text-4xl">
              {activeIntake?.isOpen
                ? `${activeIntake.name} is open.`
                : "Ready to begin your academic journey?"}
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/75">
              Explore admission requirements, application guidance and the
              programme that fits your ambitions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ActionLink href="/admissions/how-to-apply">
              Start application
            </ActionLink>
            <ActionLink href="/academics/programmes" secondary>
              Browse programmes
            </ActionLink>
          </div>
        </div>
      </section>
    </div>
  );
}
