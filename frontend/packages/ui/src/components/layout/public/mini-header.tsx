import Link from "next/link";
import { Mail, Phone, MapPin, Search } from "lucide-react";
import { cn } from "../../../lib/utils";

interface QuickLink {
  label: string;
  href: string;
  external?: boolean;
}

interface MiniHeaderProps {
  contactInfo?: {
    address?: string;
    phone?: string;
    email?: string;
  };
  quickLinks?: QuickLink[];
  socialLinks?: Record<string, string | undefined>;
  className?: string;
}

const defaultQuickLinks: QuickLink[] = [
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

const defaultContactInfo = {
  address: "Main Campus, Kisii",
  phone: "+254720875082",
  email: "info@kisiiuniversity.ac.ke",
};

export function MiniHeader({
  contactInfo = defaultContactInfo,
  quickLinks = defaultQuickLinks,
  className,
}: MiniHeaderProps) {
  return (
    <div
      className={cn(
        "hidden border-b border-white/10 bg-secondary text-xs text-white shadow-[inset_0_-1px_rgba(255,255,255,0.08)] xl:block",
        className,
      )}
    >
      <div className="w-full px-4 py-1.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex min-w-0 items-center justify-between gap-4">
          {/* Contact Info */}
          <div className="flex min-w-0 items-center gap-4">
            {contactInfo?.address && (
              <span className="flex min-w-0 items-center gap-1.5 text-white/80">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden max-w-[150px] truncate xl:inline 2xl:max-w-none">
                  {contactInfo.address}
                </span>
              </span>
            )}
            {contactInfo?.phone && (
              <a
                href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                className="flex min-h-10 shrink-0 items-center gap-1.5 text-white/80 transition-colors hover:text-white"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{contactInfo.phone}</span>
              </a>
            )}
            {contactInfo?.email && (
              <a
                href={`mailto:${contactInfo.email}`}
                className="flex min-h-10 shrink-0 items-center gap-1.5 text-white/80 transition-colors hover:text-white"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{contactInfo.email}</span>
              </a>
            )}
          </div>

          {/* Quick Links & Social */}
          <div className="flex shrink-0 items-center gap-3 2xl:gap-4">
            {/* Quick Links */}
            <nav className="flex items-center gap-2 2xl:gap-3">
              {quickLinks.map((link, index) => (
                <Link
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className={cn(
                    "inline-flex min-h-10 items-center text-white/80 transition-colors hover:text-white",
                    index > 5 && "hidden 2xl:inline-flex",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Divider */}
            <div className="h-4 w-px bg-white/20" />

            {/* Search */}
            <SearchButton />
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchButton() {
  return (
    <Link
      href="/search"
      className="flex min-h-10 items-center gap-1.5 text-white/80 transition-colors hover:text-white"
      aria-label="Search Kisii University"
    >
      <Search className="w-3.5 h-3.5" aria-hidden />
      <span>SEARCH</span>
    </Link>
  );
}
