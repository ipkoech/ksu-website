import Link from "next/link";
import {
  MiniHeader,
  PublicHeader,
  PublicFooter,
  Announcements,
  type MegaMenuData,
} from "@ksu/ui/layout/public";
import {
  getLandingAnnouncements,
  type LandingAnnouncement,
} from "@/lib/landing-data";
import { getNavData } from "@/lib/nav-data";

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
    label: "Student Portal",
    href: "https://portal.kisiiuniversity.ac.ke",
    external: true,
  },
  { label: "Staff Portal", href: "/m/staff" },
  {
    label: "E-Learning",
    href: "https://elearning.kisiiuniversity.ac.ke",
    external: true,
  },
  { label: "Alumni", href: "/alumni" },
  { label: "A-Z Index", href: "/az-index" },
];

interface PageShellProps {
  children: React.ReactNode;
  transparent?: boolean;
  megaMenuData?: MegaMenuData;
  header?: React.ReactNode;
}

export async function AnnouncementHeader({
  announcements,
}: {
  announcements?: LandingAnnouncement[];
}) {
  const items = announcements ?? (await getLandingAnnouncements());

  return (
    <Announcements
      announcements={items}
      rotating={items.length > 1}
      intervalMs={6500}
      background="secondary"
    />
  );
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_38%,#f6f8fc_100%)] text-slate-950">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <AnnouncementHeader />
      <MiniHeader
        contactInfo={contactInfo}
        quickLinks={miniQuickLinks}
        socialLinks={socialLinks}
      />
      {header ?? (
        <PublicHeader
          transparent={transparent}
          megaMenuData={resolvedMegaMenuData}
        />
      )}
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <PublicFooter contactInfo={contactInfo} socialLinks={socialLinks} />
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
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-tight text-slate-950 sm:text-5xl">
        {title}
      </h1>
      <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
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
      <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-slate-950 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
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
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
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
              <span className="text-slate-900">{item.label}</span>
            )}
            {index < items.length - 1 ? <span>/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
