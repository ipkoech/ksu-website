"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Search, X } from "lucide-react";
import { cn } from "../../../lib/utils";

interface QuickLink {
  label: string;
  href: string;
  external?: boolean;
}

interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
}

interface MiniHeaderProps {
  contactInfo?: {
    address?: string;
    phone?: string;
    email?: string;
  };
  quickLinks?: QuickLink[];
  socialLinks?: SocialLinks;
  className?: string;
}

const defaultQuickLinks: QuickLink[] = [
  { label: "Staff Portal", href: "/m/staff" },
  { label: "Student Portal", href: "https://portal.kisiiuniversity.ac.ke", external: true },
  { label: "E-Learning", href: "https://elearning.kisiiuniversity.ac.ke", external: true },
  { label: "Webmail", href: "https://mail.kisiiuniversity.ac.ke", external: true },
];

const defaultContactInfo = {
  address: "P.O. Box 408-40200, Kisii",
  phone: "+254 XXX XXX XXX",
  email: "info@kisiiuniversity.ac.ke",
};

export function MiniHeader({
  contactInfo = defaultContactInfo,
  quickLinks = defaultQuickLinks,
  socialLinks,
  className,
}: MiniHeaderProps) {
  return (
    <div className={cn("hidden sm:block bg-gray-900 text-white text-sm", className)}>
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Contact Info */}
          <div className="flex items-center gap-6">
            {contactInfo?.address && (
              <span className="flex items-center gap-1.5 text-gray-300">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden lg:inline">{contactInfo.address}</span>
              </span>
            )}
            {contactInfo?.phone && (
              <a
                href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{contactInfo.phone}</span>
              </a>
            )}
            {contactInfo?.email && (
              <a
                href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{contactInfo.email}</span>
              </a>
            )}
          </div>

          {/* Quick Links & Social */}
          <div className="flex items-center gap-6">
            {/* Quick Links */}
            <nav className="flex items-center gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Divider */}
            <div className="w-px h-4 bg-gray-700" />

            {/* Search */}
            <SearchButton />

            {/* Divider */}
            {socialLinks && <div className="w-px h-4 bg-gray-700" />}

            {/* Social Links */}
            {socialLinks && (
              <div className="flex items-center gap-3">
                {socialLinks.facebook && (
                  <SocialIcon href={socialLinks.facebook} label="Facebook">
                    <FacebookIcon />
                  </SocialIcon>
                )}
                {socialLinks.twitter && (
                  <SocialIcon href={socialLinks.twitter} label="Twitter">
                    <TwitterIcon />
                  </SocialIcon>
                )}
                {socialLinks.instagram && (
                  <SocialIcon href={socialLinks.instagram} label="Instagram">
                    <InstagramIcon />
                  </SocialIcon>
                )}
                {socialLinks.linkedin && (
                  <SocialIcon href={socialLinks.linkedin} label="LinkedIn">
                    <LinkedInIcon />
                  </SocialIcon>
                )}
                {socialLinks.youtube && (
                  <SocialIcon href={socialLinks.youtube} label="YouTube">
                    <YouTubeIcon />
                  </SocialIcon>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  if (isOpen) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          autoFocus
          className="w-40 px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
        />
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setQuery("");
          }}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close search"
        >
          <X className="w-4 h-4" />
        </button>
      </form>
    );
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
      aria-label="Search"
    >
      <Search className="w-3.5 h-3.5" />
      <span>Search</span>
    </button>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="text-gray-400 hover:text-white transition-colors"
    >
      {children}
    </a>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path
        d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white" />
    </svg>
  );
}
