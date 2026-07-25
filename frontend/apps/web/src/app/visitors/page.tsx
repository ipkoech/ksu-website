import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Handshake,
  Heart,
  Landmark,
  UserRound,
} from "lucide-react";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";

export const metadata = {
  title: "Visitors",
  description:
    "Visitor information, useful routes, and quick links to explore Kisii University.",
};

const visitorRoutes = [
  {
    label: "About Kisii University",
    href: "/about",
    body: "Institutional overview, history, mission, and leadership.",
    icon: Landmark,
  },
  {
    label: "Campus life",
    href: "/campus-life",
    body: "Student experience, sports, accommodation, clubs, and support.",
    icon: Heart,
  },
  {
    label: "Events",
    href: "/media/events",
    body: "Public events, conferences, and university calendar.",
    icon: CalendarDays,
  },
  {
    label: "Schools",
    href: "/academics/schools",
    body: "Academic schools, departments, programmes, and contacts.",
    icon: Building2,
  },
  {
    label: "Contact",
    href: "/contact",
    body: "Main contact details and support request options.",
    icon: Handshake,
  },
  {
    label: "Student & staff portal",
    href: "https://portal.kisiiuniversity.ac.ke",
    body: "Open the official portal for authenticated services.",
    icon: UserRound,
    external: true,
  },
];

export default function VisitorsPage() {
  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <BreadcrumbTrail
          items={[{ label: "Home", href: "/" }, { label: "Visitors" }]}
        />

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase text-secondary">
            Visitors
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-foreground">
            Visitor information
          </h1>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            Welcome to Kisii University. Use the links below to explore the
            institution, learn about campus life, find upcoming events, browse
            academic schools, get in touch, or access the official student and
            staff portal.
          </p>
        </div>

        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            Useful visitor routes
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {visitorRoutes.map((item) => {
              const Icon = item.icon;
              const isExternal = item.external ?? /^https?:\/\//i.test(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="group flex items-start gap-3 rounded-md border border-border bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon aria-hidden className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                      {item.body}
                    </span>
                    <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      Open{" "}
                      <ArrowRight aria-hidden className="h-3 w-3" />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </article>
    </PageShell>
  );
}
