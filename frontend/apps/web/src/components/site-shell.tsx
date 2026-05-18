import Link from "next/link";
import {
  MiniHeader,
  PublicHeader,
  PublicFooter,
  Announcements,
  type MegaMenuData,
} from "@ksu/ui/layout/public";

const socialLinks = {
  facebook: "https://facebook.com/kisiiuniversity",
  twitter: "https://twitter.com/kisiiuniversity",
  instagram: "https://instagram.com/kisiiuniversity",
  youtube: "https://youtube.com/kisiiuniversity",
  linkedin: "https://linkedin.com/school/kisiiuniversity",
};

const contactInfo = {
  address: "P.O. Box 408-40200, Kisii",
  phone: "+254 XXX XXX XXX",
  email: "info@kisiiuniversity.ac.ke",
};

// Sample announcements - in production, fetch from API
const announcements = [
  {
    id: "intake-2026",
    message: "September 2026 intake applications are now open!",
    linkText: "Apply Now",
    linkHref: "/admissions/how-to-apply",
    variant: "info" as const,
    dismissible: true,
  },
];

interface PageShellProps {
  children: React.ReactNode;
  transparent?: boolean;
  megaMenuData?: MegaMenuData;
}

export function PageShell({
  children,
  transparent = false,
  megaMenuData,
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_38%,#f6f8fc_100%)] text-slate-950">
      <Announcements announcements={announcements} />
      <MiniHeader contactInfo={contactInfo} socialLinks={socialLinks} />
      <PublicHeader transparent={transparent} megaMenuData={megaMenuData} />
      <main>{children}</main>
      <PublicFooter />
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
              <Link href={item.href} className="transition hover:text-primary">
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
