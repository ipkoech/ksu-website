import Link from "next/link";
import { ArrowRight } from "lucide-react";

const chips = [
  { label: "Prospective student", href: "/admissions/how-to-apply" },
  {
    label: "Current student",
    href: "https://portal.kisiiuniversity.ac.ke",
    external: true,
  },
  {
    label: "Staff",
    href: "https://digital.kisiiuniversity.ac.ke/staff/services/login",
    external: true,
  },
  { label: "Parent or guardian", href: "/admissions/fees" },
];

const chipClassName =
  "inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function AudienceChips() {
  return (
    <nav aria-label="I am a" className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-[1680px] flex-wrap items-center justify-center gap-x-2 gap-y-2 px-4 py-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <span className="mr-1 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
          I am a
        </span>
        {chips.map((chip) =>
          chip.external ? (
            <a
              key={chip.label}
              href={chip.href}
              target="_blank"
              rel="noopener noreferrer"
              className={chipClassName}
            >
              {chip.label}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </a>
          ) : (
            <Link key={chip.label} href={chip.href} className={chipClassName}>
              {chip.label}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ),
        )}
      </div>
    </nav>
  );
}

export function UniversityJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: "Kisii University",
    url: "https://kisiiuniversity.ac.ke",
    foundingDate: "1965",
    address: {
      "@type": "PostalAddress",
      streetAddress: "P.O. Box 408-40200",
      addressLocality: "Kisii",
      addressCountry: "KE",
    },
    email: "info@kisiiuniversity.ac.ke",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
