import Link from "next/link";
import {
  MiniHeader,
  PublicHeader,
  PublicFooter,
  type MegaMenuData,
} from "@ksu/ui/layout/public";
import { getNavData } from "@/lib/nav-data";
import { libraryFrontendUrl, researchFrontendUrl } from "@/lib/service-urls";

const socialLinks = {
  facebook: "https://facebook.com/kisiiuniversity",
  twitter: "https://twitter.com/kisiiuniversity",
  instagram: "https://instagram.com/kisiiuniversity",
  youtube: "https://youtube.com/kisiiuniversity",
  linkedin: "https://linkedin.com/school/kisiiuniversity",
};

const contactInfo = {
  address: "Main Campus, Kisii",
  phone: "+254720875082",
  email: "info@kisiiuniversity.ac.ke",
};

const miniQuickLinks = [
  {
    label: "HERI",
    href: "https://kisiiuniversity.ac.ke/event/heri-africa-launch",
    external: true,
  },
  {
    label: "HUDUMA BORA",
    href: "https://digital.kisiiuniversity.ac.ke/",
    external: true,
  },
  {
    label: "STUDENT PORTAL",
    href: "https://portal.kisiiuniversity.ac.ke",
    external: true,
  },
  {
    label: "CAREERS",
    href: "https://digital.kisiiuniversity.ac.ke/job_portal/open_adverts",
    external: true,
  },
  {
    label: "CONFERENCES",
    href: "https://digital.kisiiuniversity.ac.ke/conferences",
    external: true,
  },
];

interface PageShellProps {
  children: React.ReactNode;
  transparent?: boolean;
  megaMenuData?: MegaMenuData;
  header?: React.ReactNode;
}

export async function PageShell({
  children,
  transparent = false,
  megaMenuData,
  header,
}: PageShellProps) {
  const resolvedMegaMenuData = header
    ? megaMenuData
    : megaMenuData || (await getNavData());

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--surface-subtle))_0%,#ffffff_38%,hsl(var(--surface-muted))_100%)] text-foreground">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <MiniHeader
        contactInfo={contactInfo}
        quickLinks={miniQuickLinks}
        socialLinks={socialLinks}
      />
      {header ?? (
        <PublicHeader
          transparent={transparent}
          megaMenuData={resolvedMegaMenuData}
          researchHref={researchFrontendUrl}
          libraryHref={libraryFrontendUrl}
        />
      )}
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <PublicFooter
        contactInfo={contactInfo}
        socialLinks={socialLinks}
        researchHref={researchFrontendUrl}
        libraryHref={libraryFrontendUrl}
      />
    </div>
  );
}

// Re-export helper components for backward compatibility
export function PageHeading({
  eyebrow,
  title,
  body,
  fullWidth = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "" : "max-w-3xl"}>
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
        {eyebrow}
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-tight text-foreground sm:text-5xl">
        {title}
      </h1>
      <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
        {body}
      </p>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  fullWidth = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "" : "max-w-3xl"}>
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-foreground sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
        {body}
      </p>
    </div>
  );
}

export function BreadcrumbTrail({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href ? (
              <Link
                href={item.href}
                className="inline-flex min-h-11 items-center rounded px-1 transition hover:text-primary"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
            {index < items.length - 1 ? <span>/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
