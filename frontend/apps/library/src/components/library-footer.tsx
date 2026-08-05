import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { publicFrontendUrl, researchFrontendUrl } from "../lib/service-urls";

const footerColumns: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}[] = [
  {
    title: "Discover",
    links: [
      { label: "Search the Library", href: "/search" },
      { label: "Catalog", href: "/catalog" },
      { label: "E-resources A-Z", href: "/electronic" },
      { label: "Repository & access links", href: "/electronic#external-links" },
      { label: "Documents & forms", href: "/electronic#downloads" },
    ],
  },
  {
    title: "Services & help",
    links: [
      { label: "Library services", href: "/services" },
      { label: "Ask a Librarian", href: "/ask" },
      { label: "Contact & hours", href: "/contact" },
      { label: "Regulations", href: "/services#regulations-heading" },
      { label: "Updates", href: "/updates" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About the Library", href: "/about" },
      { label: "Leadership", href: "/about#leadership" },
      { label: "Staff directory", href: "/about#staff" },
      { label: "Kisii University", href: publicFrontendUrl, external: true },
      { label: "Research portal", href: researchFrontendUrl, external: true },
    ],
  },
];

export function LibraryFooter({
  contactInfo,
}: {
  contactInfo: { address: string; phone: string; email: string };
}) {
  return (
    <footer className="border-t border-primary/10 bg-primary text-white">
      <div className="mx-auto grid w-full max-w-[1680px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/logos/ksu-logo.png"
              alt="Kisii University"
              width={48}
              height={48}
              className="h-12 w-12"
            />
            <div>
              <p className="font-[family-name:var(--font-display)] text-lg font-bold uppercase leading-tight">
                Kisii University
              </p>
              <p className="text-sm font-semibold text-white/75">Library</p>
            </div>
          </div>
          <ul className="mt-6 space-y-3 text-sm text-white/80">
            <li className="flex items-center gap-2">
              <MapPin aria-hidden className="h-4 w-4 shrink-0 text-secondary" />
              {contactInfo.address}
            </li>
            <li>
              <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-2 transition hover:text-white">
                <Phone aria-hidden className="h-4 w-4 shrink-0 text-secondary" />
                {contactInfo.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-2 transition hover:text-white">
                <Mail aria-hidden className="h-4 w-4 shrink-0 text-secondary" />
                {contactInfo.email}
              </a>
            </li>
          </ul>
        </div>
        {footerColumns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
              {column.title}
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {column.links.map((link) =>
                link.external ? (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white/80 transition hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ) : (
                  <li key={link.label}>
                    <Link href={link.href} className="text-white/80 transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/60 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Kisii University Library. All rights reserved.
      </div>
    </footer>
  );
}
