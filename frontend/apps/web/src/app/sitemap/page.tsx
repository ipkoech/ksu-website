import Link from "next/link";
import { ArrowRight, BookOpen, Building2, CalendarDays, GraduationCap, Home, Landmark, Megaphone, Search } from "lucide-react";
import { CampusPageHeader } from "@ksu/ui/components";
import { PageShell } from "@/components/site-shell";

export const metadata = {
  title: "Sitemap",
  description: "Directory of key public website sections on the Kisii University website.",
};

const mainSections = [
  { label: "Home", href: "/", icon: Home },
  { label: "About", href: "/about", icon: Landmark },
  { label: "Admissions", href: "/admissions", icon: GraduationCap },
  { label: "Academics", href: "/academics", icon: BookOpen },
  { label: "Administration", href: "/administration", icon: Building2 },
  { label: "Campus Life", href: "/campus-life", icon: BookOpen },
  { label: "News & Media", href: "/media/news", icon: Megaphone },
  { label: "Events", href: "/media/events", icon: CalendarDays },
];

const utilitySections = [
  { label: "Contact", href: "/contact" },
  { label: "Search", href: "/search", icon: Search },
  { label: "Help Desk", href: "/help-desk" },
  { label: "FAQ", href: "/faq" },
  { label: "Downloads", href: "/downloads" },
  { label: "Staff Directory", href: "/m/staff" },
  { label: "Careers", href: "/careers" },
  { label: "Tenders", href: "/tenders" },
  { label: "Conferences", href: "/conferences" },
  { label: "Visitors", href: "/visitors" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "A-Z Index", href: "/az-index" },
];

export default function SitemapPage() {
  return (
    <PageShell>
      <CampusPageHeader
        title="Website sitemap"
        eyebrow="Sitemap"
        description="Browse the main public areas of the Kisii University website."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Sitemap" }]}
        seed="/sitemap"
      />

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="space-y-10">
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
              Main sections
            </h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {mainSections.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-md border border-border bg-white px-4 py-3 text-sm font-semibold text-muted-foreground shadow-sm transition hover:border-primary/30 hover:text-primary"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-primary transition group-hover:bg-primary group-hover:text-white">
                    <item.icon aria-hidden className="h-4 w-4" />
                  </span>
                  {item.label}
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
              Utility pages
            </h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {utilitySections.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-md border border-border bg-white px-4 py-3 text-sm font-semibold text-muted-foreground shadow-sm transition hover:border-primary/30 hover:text-primary"
                >
                  <ArrowRight aria-hidden className="h-4 w-4 text-primary/60" />
                  {item.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </article>
    </PageShell>
  );
}
