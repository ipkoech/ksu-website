"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin, Phone, Mail } from "lucide-react";
import { cn } from "../../../lib/utils";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface ContactInfo {
  address: string;
  phone: string;
  email: string;
}

interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
}

interface PublicFooterProps {
  columns?: FooterColumn[];
  contactInfo?: ContactInfo;
  socialLinks?: SocialLinks;
  legalLinks?: FooterLink[];
  className?: string;
}

const defaultColumns: FooterColumn[] = [
  {
    title: "Quick Links",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Leadership", href: "/about/leadership" },
      { label: "News & Events", href: "/news" },
      { label: "Careers", href: "/careers" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Academics",
    links: [
      { label: "Schools", href: "/academics/schools" },
      { label: "Programmes", href: "/academics/programmes" },
      { label: "Academic Calendar", href: "/academics/calendar" },
      { label: "Examinations", href: "/academics/examinations" },
      { label: "E-Learning", href: "https://elearning.kisiiuniversity.ac.ke", external: true },
    ],
  },
  {
    title: "Admissions",
    links: [
      { label: "Undergraduate", href: "/admissions/undergraduate" },
      { label: "Postgraduate", href: "/admissions/postgraduate" },
      { label: "International Students", href: "/admissions/international" },
      { label: "How to Apply", href: "/admissions/how-to-apply" },
      { label: "Fees & Scholarships", href: "/admissions/fees" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Library", href: "https://library.kisiiuniversity.ac.ke", external: true },
      { label: "Research Portal", href: "https://research.kisiiuniversity.ac.ke", external: true },
      { label: "Student Portal", href: "https://portal.kisiiuniversity.ac.ke", external: true },
      { label: "Staff Portal", href: "/m/staff" },
      { label: "Webmail", href: "https://mail.kisiiuniversity.ac.ke", external: true },
    ],
  },
];

const defaultContactInfo: ContactInfo = {
  address: "P.O. Box 408-40200, Kisii, Kenya",
  phone: "+254 XXX XXX XXX",
  email: "info@kisiiuniversity.ac.ke",
};

const defaultSocialLinks: SocialLinks = {
  facebook: "https://facebook.com/kisiiuniversity",
  twitter: "https://twitter.com/kisiiuniversity",
  instagram: "https://instagram.com/kisiiuniversity",
  youtube: "https://youtube.com/kisiiuniversity",
  linkedin: "https://linkedin.com/school/kisiiuniversity",
};

const defaultLegalLinks: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Sitemap", href: "/sitemap" },
  { label: "Accessibility", href: "/accessibility" },
];

export function PublicFooter({
  columns = defaultColumns,
  contactInfo = defaultContactInfo,
  socialLinks = defaultSocialLinks,
  legalLinks = defaultLegalLinks,
  className,
}: PublicFooterProps) {
  const [expandedColumn, setExpandedColumn] = useState<string | null>(null);

  const toggleColumn = (title: string) => {
    setExpandedColumn((prev) => (prev === title ? null : title));
  };

  return (
    <footer className={cn("bg-gray-900 text-white", className)}>
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image
                src="/logos/ksu-logo.png"
                alt="Kisii University"
                width={56}
                height={56}
                className="brightness-0 invert"
              />
              <span className="text-xl font-bold">Kisii University</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Transforming Lives Through Education, Research, and Community
              Service.
            </p>

            {/* Contact Info - Desktop */}
            <div className="hidden lg:block space-y-3">
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{contactInfo.address}</span>
              </div>
              <a
                href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>{contactInfo.phone}</span>
              </a>
              <a
                href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>{contactInfo.email}</span>
              </a>
            </div>
          </div>

          {/* Link Columns - Desktop */}
          {columns.map((column) => (
            <div key={column.title} className="hidden lg:block">
              <h3 className="font-semibold text-lg mb-4">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Link Columns - Mobile Accordion */}
          <div className="lg:hidden col-span-full space-y-0 border-t border-gray-800">
            {columns.map((column) => (
              <div key={column.title} className="border-b border-gray-800">
                <button
                  onClick={() => toggleColumn(column.title)}
                  className="flex items-center justify-between w-full py-4 text-left"
                >
                  <span className="font-semibold">{column.title}</span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 transition-transform",
                      expandedColumn === column.title && "rotate-180"
                    )}
                  />
                </button>
                <AnimatePresence>
                  {expandedColumn === column.title && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden pb-4 space-y-3"
                    >
                      {column.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            target={link.external ? "_blank" : undefined}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Contact Info - Mobile */}
          <div className="lg:hidden col-span-full pt-4">
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{contactInfo.address}</span>
              </div>
              <a
                href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3 text-gray-400 hover:text-white"
              >
                <Phone className="w-5 h-5" />
                <span>{contactInfo.phone}</span>
              </a>
              <a
                href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-3 text-gray-400 hover:text-white"
              >
                <Mail className="w-5 h-5" />
                <span>{contactInfo.email}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Kisii University. All rights
              reserved.
            </p>

            {/* Legal Links */}
            <nav className="flex flex-wrap justify-center gap-4 text-sm">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Social Links */}
            <div className="flex items-center gap-4">
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
              {socialLinks.youtube && (
                <SocialIcon href={socialLinks.youtube} label="YouTube">
                  <YouTubeIcon />
                </SocialIcon>
              )}
              {socialLinks.linkedin && (
                <SocialIcon href={socialLinks.linkedin} label="LinkedIn">
                  <LinkedInIcon />
                </SocialIcon>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
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
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path
        d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48" fill="white" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
