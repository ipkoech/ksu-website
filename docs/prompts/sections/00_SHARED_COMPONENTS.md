# Section 0: Shared Layout Components

## Overview
These components form the global layout structure used across all pages of the main public website. They are designed to be responsive, accessible, and reusable across services (main site, research, library).

## Design System Reference
- **Primary:** #2563EB (Blue)
- **Secondary:** #F97316 (Orange)
- **Foreground:** White
- **Typography:** System font stack, responsive scaling
- **Animations:** Framer Motion with subtle transitions

---

## 0.1 Mini Top Header

The mini header sits above the main navigation and contains quick utility links, contact info, and social links.

### Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📍 P.O. Box 408-40200, Kisii    📞 +254 xxx xxx xxx    📧 info@ksu.ac.ke │
│ ─────────────────────────────────────────────────────────────────────── │
│ [Staff Portal] [Student Portal] [E-Learning] [Webmail]    [FB][TW][IG] │
└─────────────────────────────────────────────────────────────────────────┘
```

### Mobile Behavior
- Hidden on mobile (< 768px)
- Quick links move to mobile drawer menu
- Social links move to footer on mobile

### Component
```tsx
// src/components/layout/mini-header.tsx
"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

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
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  className?: string;
}

const defaultQuickLinks: QuickLink[] = [
  { label: "Staff Portal", href: "/m/staff", external: false },
  { label: "Student Portal", href: "https://portal.kisiiuniversity.ac.ke", external: true },
  { label: "E-Learning", href: "https://elearning.kisiiuniversity.ac.ke", external: true },
  { label: "Webmail", href: "https://mail.kisiiuniversity.ac.ke", external: true },
];

export function MiniHeader({
  contactInfo,
  quickLinks = defaultQuickLinks,
  socialLinks,
  className,
}: MiniHeaderProps) {
  return (
    <div className={cn("hidden md:block bg-gray-900 text-white text-sm", className)}>
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Contact Info */}
          <div className="flex items-center gap-6">
            {contactInfo?.address && (
              <span className="flex items-center gap-1.5 text-gray-300">
                <MapPin className="w-3.5 h-3.5" />
                {contactInfo.address}
              </span>
            )}
            {contactInfo?.phone && (
              <a
                href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                {contactInfo.phone}
              </a>
            )}
            {contactInfo?.email && (
              <a
                href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                {contactInfo.email}
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

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
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

// SVG Icons (simplified)
function FacebookIcon() {
  return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>;
}
function TwitterIcon() {
  return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>;
}
function InstagramIcon() {
  return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2"/></svg>;
}
function LinkedInIcon() {
  return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>;
}
function YouTubeIcon() {
  return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white"/></svg>;
}
```

---

## 0.2 Main Navigation (PublicHeader)

The primary navigation header with logo, main menu, search, and mobile drawer.

### Layout — Desktop
```
┌─────────────────────────────────────────────────────────────────────────┐
│  [LOGO]   Home  About▾  Administration▾  Admissions▾  Academics▾       │
│           Campus Life▾  News  Research  Library           [🔍] [Apply] │
└─────────────────────────────────────────────────────────────────────────┘
```

### Layout — Mobile
```
┌─────────────────────────────────────────────────────────────────────────┐
│  [☰]                        [LOGO]                              [🔍]   │
└─────────────────────────────────────────────────────────────────────────┘

Drawer (slides from left):
┌──────────────────────────┐
│  [X]        [LOGO]       │
│  ─────────────────────── │
│  Home                    │
│  About                 ▼ │
│    └─ History            │
│    └─ Mission & Vision   │
│    └─ Leadership         │
│    └─ Governance         │
│  Administration        ▼ │
│  Admissions            ▼ │
│  Academics             ▼ │
│  Campus Life           ▼ │
│  News                    │
│  Research              → │
│  Library               → │
│  ─────────────────────── │
│  Quick Links             │
│  • Staff Portal          │
│  • Student Portal        │
│  • E-Learning            │
│  ─────────────────────── │
│  [Apply Now]             │
└──────────────────────────┘
```

### Behavior
- **Transparent on hero:** When page has hero section, header is transparent with white text
- **Solid on scroll:** After scrolling 100px, header becomes solid white with shadow
- **Sticky:** Always visible at top of viewport
- **Dropdowns:** Hover on desktop, click to expand on mobile
- **External links:** Research and Library open their respective services

### Component
```tsx
// src/components/layout/public-header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ChevronDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  children?: NavItem[];
}

interface PublicHeaderProps {
  transparent?: boolean;
}

const navigation: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "History", href: "/about/history" },
      { label: "Mission & Vision", href: "/about/mission-vision" },
      { label: "Leadership", href: "/about/leadership" },
      { label: "Governance", href: "/about/governance" },
      { label: "Quality Assurance", href: "/about/quality-assurance" },
    ],
  },
  {
    label: "Administration",
    href: "/administration",
    children: [
      { label: "Organization", href: "/administration/organization" },
      { label: "Divisions", href: "/administration/divisions" },
      { label: "Directorates", href: "/administration/directorates" },
      { label: "Administrative Units", href: "/administration/units" },
    ],
  },
  {
    label: "Admissions",
    href: "/admissions",
    children: [
      { label: "Undergraduate", href: "/admissions/undergraduate" },
      { label: "Postgraduate", href: "/admissions/postgraduate" },
      { label: "International Students", href: "/admissions/international" },
      { label: "Requirements", href: "/admissions/requirements" },
      { label: "Fees & Scholarships", href: "/admissions/fees" },
      { label: "How to Apply", href: "/admissions/how-to-apply" },
    ],
  },
  {
    label: "Academics",
    href: "/academics",
    children: [
      { label: "Schools", href: "/academics/schools" },
      { label: "Programmes", href: "/academics/programmes" },
      { label: "Academic Calendar", href: "/academics/calendar" },
      { label: "Examinations", href: "/academics/examinations" },
    ],
  },
  {
    label: "Campus Life",
    href: "/campus-life",
    children: [
      { label: "Student Life", href: "/campus-life/student-life" },
      { label: "Clubs & Societies", href: "/campus-life/clubs" },
      { label: "Sports", href: "/campus-life/sports" },
      { label: "Accommodation", href: "/campus-life/accommodation" },
      { label: "Support Services", href: "/campus-life/support" },
    ],
  },
  { label: "News", href: "/news" },
  { label: "Research", href: "https://research.kisiiuniversity.ac.ke", external: true },
  { label: "Library", href: "https://library.kisiiuniversity.ac.ke", external: true },
];

export function PublicHeader({ transparent = false }: PublicHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  const isTransparent = transparent && !isScrolled && !isMobileMenuOpen;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isTransparent
            ? "bg-transparent text-white"
            : "bg-white text-gray-900 shadow-md"
        )}
      >
        <nav className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src={isTransparent ? "/logo-white.svg" : "/logo.svg"}
                alt="Kisii University"
                width={48}
                height={48}
                className="h-10 w-auto lg:h-12"
              />
              <span className="hidden sm:block font-bold text-lg">
                Kisii University
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <NavItemDesktop
                  key={item.label}
                  item={item}
                  isTransparent={isTransparent}
                  openDropdown={openDropdown}
                  setOpenDropdown={setOpenDropdown}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-full hover:bg-black/10 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <Button
                asChild
                className={cn(
                  "hidden sm:flex",
                  isTransparent
                    ? "bg-white text-primary hover:bg-gray-100"
                    : "bg-primary text-white hover:bg-primary/90"
                )}
              >
                <Link href="/admissions/how-to-apply">Apply Now</Link>
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navigation={navigation}
      />

      {/* Spacer for fixed header */}
      {!transparent && <div className="h-16 lg:h-20" />}
    </>
  );
}

function NavItemDesktop({
  item,
  isTransparent,
  openDropdown,
  setOpenDropdown,
}: {
  item: NavItem;
  isTransparent: boolean;
  openDropdown: string | null;
  setOpenDropdown: (key: string | null) => void;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isOpen = openDropdown === item.label;

  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
        className={cn(
          "px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1",
          isTransparent ? "hover:bg-white/10" : "hover:bg-gray-100"
        )}
      >
        {item.label}
        {item.external && <ExternalLink className="w-3 h-3" />}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpenDropdown(item.label)}
      onMouseLeave={() => setOpenDropdown(null)}
    >
      <button
        className={cn(
          "px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1",
          isTransparent ? "hover:bg-white/10" : "hover:bg-gray-100"
        )}
      >
        {item.label}
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border py-2"
          >
            {item.children!.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
              >
                {child.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileDrawer({
  isOpen,
  onClose,
  navigation,
}: {
  isOpen: boolean;
  onClose: () => void;
  navigation: NavItem[];
}) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <Link href="/" onClick={onClose} className="flex items-center gap-2">
                <Image src="/logo.svg" alt="Kisii University" width={40} height={40} />
                <span className="font-bold">Kisii University</span>
              </Link>
              <button onClick={onClose} className="p-2" aria-label="Close menu">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="py-4">
              {navigation.map((item) => (
                <MobileNavItem
                  key={item.label}
                  item={item}
                  isExpanded={expandedItems.includes(item.label)}
                  onToggle={() => toggleExpanded(item.label)}
                  onClose={onClose}
                />
              ))}
            </nav>

            {/* Quick Links */}
            <div className="border-t px-4 py-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Quick Links</p>
              <div className="space-y-2">
                <Link href="/m/staff" className="block text-sm text-gray-700 hover:text-primary" onClick={onClose}>
                  Staff Portal
                </Link>
                <a href="https://portal.kisiiuniversity.ac.ke" className="block text-sm text-gray-700 hover:text-primary" target="_blank" rel="noopener noreferrer">
                  Student Portal
                </a>
                <a href="https://elearning.kisiiuniversity.ac.ke" className="block text-sm text-gray-700 hover:text-primary" target="_blank" rel="noopener noreferrer">
                  E-Learning
                </a>
              </div>
            </div>

            {/* CTA */}
            <div className="p-4 border-t">
              <Button asChild className="w-full">
                <Link href="/admissions/how-to-apply" onClick={onClose}>Apply Now</Link>
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MobileNavItem({
  item,
  isExpanded,
  onToggle,
  onClose,
}: {
  item: NavItem;
  isExpanded: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const hasChildren = item.children && item.children.length > 0;

  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
        onClick={onClose}
        className="flex items-center justify-between px-4 py-3 text-gray-900 hover:bg-gray-50"
      >
        {item.label}
        {item.external && <ExternalLink className="w-4 h-4 text-gray-400" />}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 py-3 text-gray-900 hover:bg-gray-50"
      >
        {item.label}
        <ChevronDown className={cn("w-5 h-5 transition-transform", isExpanded && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-gray-50"
          >
            {item.children!.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={onClose}
                className="block px-8 py-2.5 text-sm text-gray-700 hover:text-primary"
              >
                {child.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## 0.3 Footer

A comprehensive footer with multiple columns, contact info, and legal links.

### Layout — Desktop
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  [LOGO]                                                                  │
│  Kisii University                                                        │
│  Transforming Lives Through Education,                                   │
│  Research, and Community Service                                         │
│                                                                          │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┬────────┐ │
│  │ Quick Links  │ Academics    │ Admissions   │ Resources    │Contact │ │
│  │ About Us     │ Schools      │ Undergraduate│ Library      │Address │ │
│  │ Leadership   │ Programmes   │ Postgraduate │ E-Learning   │Phone   │ │
│  │ News         │ Calendar     │ International│ Research     │Email   │ │
│  │ Events       │ Examinations │ How to Apply │ Student Portal│       │ │
│  │ Careers      │              │ Fees         │ Staff Portal │        │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┴────────┘ │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  © 2026 Kisii University. All rights reserved.                          │
│  [Privacy Policy] [Terms of Use] [Sitemap] [Accessibility]              │
│                                                        [FB][TW][IG][YT] │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Layout — Mobile
```
┌─────────────────────────────────┐
│  [LOGO]                         │
│  Kisii University               │
│  Tagline...                     │
│                                 │
│  Quick Links              [▼]   │
│  Academics                [▼]   │
│  Admissions               [▼]   │
│  Resources                [▼]   │
│                                 │
│  Contact Us                     │
│  📍 Address                     │
│  📞 Phone                       │
│  📧 Email                       │
│                                 │
│  ───────────────────────────    │
│  © 2026 Kisii University        │
│  [Privacy] [Terms] [Sitemap]    │
│  [FB] [TW] [IG] [YT]            │
└─────────────────────────────────┘
```

### Component
```tsx
// src/components/layout/public-footer.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterColumn {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}

const footerColumns: FooterColumn[] = [
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

const contactInfo = {
  address: "P.O. Box 408-40200, Kisii, Kenya",
  phone: "+254 XXX XXX XXX",
  email: "info@kisiiuniversity.ac.ke",
};

const socialLinks = {
  facebook: "https://facebook.com/kisiiuniversity",
  twitter: "https://twitter.com/kisiiuniversity",
  instagram: "https://instagram.com/kisiiuniversity",
  youtube: "https://youtube.com/kisiiuniversity",
  linkedin: "https://linkedin.com/school/kisiiuniversity",
};

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Sitemap", href: "/sitemap" },
  { label: "Accessibility", href: "/accessibility" },
];

export function PublicFooter() {
  const [expandedColumn, setExpandedColumn] = useState<string | null>(null);

  const toggleColumn = (title: string) => {
    setExpandedColumn((prev) => (prev === title ? null : title));
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image src="/logo-white.svg" alt="Kisii University" width={56} height={56} />
              <span className="text-xl font-bold">Kisii University</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Transforming Lives Through Education, Research, and Community Service.
            </p>
            {/* Contact Info - Desktop */}
            <div className="hidden lg:block space-y-3">
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{contactInfo.address}</span>
              </div>
              <a href={`tel:${contactInfo.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
                <span>{contactInfo.phone}</span>
              </a>
              <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
                <span>{contactInfo.email}</span>
              </a>
            </div>
          </div>

          {/* Link Columns - Desktop */}
          {footerColumns.map((column) => (
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
            {footerColumns.map((column) => (
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
              <a href={`tel:${contactInfo.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-gray-400 hover:text-white">
                <Phone className="w-5 h-5" />
                <span>{contactInfo.phone}</span>
              </a>
              <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 text-gray-400 hover:text-white">
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
              © {new Date().getFullYear()} Kisii University. All rights reserved.
            </p>

            {/* Legal Links */}
            <nav className="flex flex-wrap justify-center gap-4 text-sm">
              {legalLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-gray-400 hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {Object.entries(socialLinks).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={platform}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <SocialIcon platform={platform} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ platform }: { platform: string }) {
  const icons: Record<string, JSX.Element> = {
    facebook: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>,
    twitter: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>,
    instagram: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="none" stroke="currentColor" strokeWidth="2"/></svg>,
    youtube: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48" fill="white"/></svg>,
    linkedin: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>,
  };
  return icons[platform] || null;
}
```

---

## 0.4 Reusable CTA Component

A flexible call-to-action component for use across pages.

### Variants
```
┌─────────────────────────────────────────────────────────────────────────┐
│ BANNER (full-width)                                                      │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ [Background Image or Gradient]                                       │ │
│ │                                                                      │ │
│ │       Ready to Start Your Journey?                                  │ │
│ │       Join thousands of students building their future at KSU       │ │
│ │                                                                      │ │
│ │       [Apply Now]  [Explore Programmes]                             │ │
│ │                                                                      │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────┐
│ CARD (inline)                     │
│ ┌───────────────────────────────┐ │
│ │ 📞 Need Help?                 │ │
│ │ Our admissions team is here  │ │
│ │ to guide you.                │ │
│ │                              │ │
│ │ [Contact Us]                 │ │
│ └───────────────────────────────┘ │
└───────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ INLINE (within content)                                                  │
│                                                                          │
│ Want to learn more? [Get in Touch →]                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component
```tsx
// src/components/ui/cta.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CTAAction {
  label: string;
  href: string;
  variant?: "default" | "outline" | "ghost";
  external?: boolean;
}

interface CTAProps {
  variant?: "banner" | "card" | "inline";
  title: string;
  description?: string;
  actions: CTAAction[];
  backgroundImage?: string;
  backgroundColor?: "primary" | "secondary" | "dark" | "gradient";
  icon?: React.ReactNode;
  className?: string;
}

export function CTA({
  variant = "banner",
  title,
  description,
  actions,
  backgroundImage,
  backgroundColor = "primary",
  icon,
  className,
}: CTAProps) {
  const bgClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    dark: "bg-gray-900",
    gradient: "bg-gradient-to-r from-primary to-blue-700",
  };

  if (variant === "inline") {
    return (
      <div className={cn("flex flex-wrap items-center gap-4", className)}>
        <span className="text-gray-700">{title}</span>
        {actions.map((action, idx) => (
          <Link
            key={idx}
            href={action.href}
            target={action.external ? "_blank" : undefined}
            className="inline-flex items-center gap-1 text-primary font-medium hover:gap-2 transition-all"
          >
            {action.label}
            <ArrowRight className="w-4 h-4" />
          </Link>
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={cn(
          "rounded-xl p-6 text-white",
          bgClasses[backgroundColor],
          className
        )}
      >
        {icon && <div className="mb-4">{icon}</div>}
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        {description && <p className="text-white/80 mb-4">{description}</p>}
        <div className="flex flex-wrap gap-3">
          {actions.map((action, idx) => (
            <Button
              key={idx}
              asChild
              variant={action.variant === "outline" ? "outline" : "secondary"}
              className={cn(
                action.variant === "outline" && "border-white text-white hover:bg-white hover:text-primary"
              )}
            >
              <Link
                href={action.href}
                target={action.external ? "_blank" : undefined}
              >
                {action.label}
              </Link>
            </Button>
          ))}
        </div>
      </motion.div>
    );
  }

  // Banner variant (default)
  return (
    <section
      className={cn(
        "relative py-16 lg:py-24 text-white overflow-hidden",
        !backgroundImage && bgClasses[backgroundColor],
        className
      )}
    >
      {/* Background Image */}
      {backgroundImage && (
        <>
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary/80" />
        </>
      )}

      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">{title}</h2>
          {description && (
            <p className="text-lg lg:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {description}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-4">
            {actions.map((action, idx) => (
              <Button
                key={idx}
                asChild
                size="lg"
                variant={action.variant === "outline" ? "outline" : "secondary"}
                className={cn(
                  action.variant === "outline" && "border-white text-white hover:bg-white hover:text-primary"
                )}
              >
                <Link
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                >
                  {action.label}
                  {idx === 0 && <ArrowRight className="w-4 h-4 ml-2" />}
                </Link>
              </Button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

### Usage Examples
```tsx
// Banner CTA
<CTA
  variant="banner"
  title="Ready to Start Your Journey?"
  description="Join thousands of students building their future at Kisii University"
  backgroundImage="/images/campus-aerial.jpg"
  actions={[
    { label: "Apply Now", href: "/admissions/how-to-apply" },
    { label: "Explore Programmes", href: "/academics/programmes", variant: "outline" },
  ]}
/>

// Card CTA
<CTA
  variant="card"
  title="Need Help?"
  description="Our admissions team is here to guide you."
  icon={<Phone className="w-8 h-8" />}
  backgroundColor="secondary"
  actions={[
    { label: "Contact Us", href: "/contact" },
  ]}
/>

// Inline CTA
<CTA
  variant="inline"
  title="Want to learn more?"
  actions={[{ label: "Get in Touch", href: "/contact" }]}
/>
```

---

## 0.5 Announcement Bar

A persistent or dismissible notification bar for urgent announcements.

### Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🔔 KUCCPS placement applications are now open! Deadline: Aug 15, 2026   │
│    [Apply Now →]                                                    [X] │
└─────────────────────────────────────────────────────────────────────────┘
```

### Variants
- **Info** (blue): General announcements
- **Warning** (orange): Important notices
- **Urgent** (red): Critical alerts
- **Success** (green): Positive updates

### Component
```tsx
// src/components/layout/announcement-bar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnouncementBarProps {
  id: string; // Used for localStorage dismissal tracking
  message: string;
  linkText?: string;
  linkHref?: string;
  variant?: "info" | "warning" | "urgent" | "success";
  dismissible?: boolean;
  expiresAt?: string; // ISO date string
  className?: string;
}

const variantStyles = {
  info: {
    bg: "bg-primary",
    text: "text-white",
    icon: Bell,
  },
  warning: {
    bg: "bg-secondary",
    text: "text-white",
    icon: AlertTriangle,
  },
  urgent: {
    bg: "bg-red-600",
    text: "text-white",
    icon: AlertCircle,
  },
  success: {
    bg: "bg-green-600",
    text: "text-white",
    icon: CheckCircle,
  },
};

export function AnnouncementBar({
  id,
  message,
  linkText,
  linkHref,
  variant = "info",
  dismissible = true,
  expiresAt,
  className,
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  useEffect(() => {
    // Check if dismissed
    const dismissedAnnouncements = JSON.parse(
      localStorage.getItem("dismissedAnnouncements") || "[]"
    );
    if (dismissedAnnouncements.includes(id)) {
      return;
    }

    // Check if expired
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return;
    }

    setIsVisible(true);
  }, [id, expiresAt]);

  const handleDismiss = () => {
    setIsVisible(false);
    const dismissed = JSON.parse(
      localStorage.getItem("dismissedAnnouncements") || "[]"
    );
    localStorage.setItem(
      "dismissedAnnouncements",
      JSON.stringify([...dismissed, id])
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className={cn(styles.bg, styles.text, className)}
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-3 text-sm">
              <Icon className="w-4 h-4 flex-shrink-0" />
              
              <span className="text-center">
                {message}
                {linkText && linkHref && (
                  <Link
                    href={linkHref}
                    className="ml-2 font-semibold underline underline-offset-2 hover:no-underline"
                  >
                    {linkText} →
                  </Link>
                )}
              </span>

              {dismissible && (
                <button
                  onClick={handleDismiss}
                  className="ml-auto p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
                  aria-label="Dismiss announcement"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Multiple Announcements Container
```tsx
// src/components/layout/announcements.tsx
"use client";

import { AnnouncementBar } from "./announcement-bar";

interface Announcement {
  id: string;
  message: string;
  linkText?: string;
  linkHref?: string;
  variant?: "info" | "warning" | "urgent" | "success";
  dismissible?: boolean;
  expiresAt?: string;
}

interface AnnouncementsProps {
  announcements: Announcement[];
}

export function Announcements({ announcements }: AnnouncementsProps) {
  if (!announcements.length) return null;

  return (
    <div className="announcement-stack">
      {announcements.map((announcement) => (
        <AnnouncementBar key={announcement.id} {...announcement} />
      ))}
    </div>
  );
}
```

### Data Source
```
GET /api/announcements/active
  Response: { data: Announcement[] }
```

### Usage in Layout
```tsx
// app/(site)/layout.tsx
import { MiniHeader } from "@/components/layout/mini-header";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Announcements } from "@/components/layout/announcements";

export default async function SiteLayout({ children }) {
  const announcements = await getActiveAnnouncements();

  return (
    <>
      <Announcements announcements={announcements} />
      <MiniHeader
        contactInfo={{
          address: "P.O. Box 408-40200, Kisii",
          phone: "+254 XXX XXX XXX",
          email: "info@kisiiuniversity.ac.ke",
        }}
        socialLinks={{
          facebook: "https://facebook.com/kisiiuniversity",
          twitter: "https://twitter.com/kisiiuniversity",
          instagram: "https://instagram.com/kisiiuniversity",
        }}
      />
      <PublicHeader transparent={false} />
      <main>{children}</main>
      <PublicFooter />
    </>
  );
}
```

---

## Component File Structure

```
src/components/
├── layout/
│   ├── mini-header.tsx
│   ├── public-header.tsx
│   ├── public-footer.tsx
│   ├── announcement-bar.tsx
│   └── announcements.tsx
│
└── ui/
    └── cta.tsx
```

---

## Responsive Summary

| Component | Mobile (< 768px) | Tablet (768-1024px) | Desktop (> 1024px) |
|-----------|------------------|---------------------|-------------------|
| Mini Header | Hidden | Visible | Visible |
| Main Nav | Hamburger drawer | Hamburger drawer | Full horizontal menu |
| Footer | Accordion columns | 2-col grid | Full 6-col grid |
| CTA Banner | Stacked, smaller text | Same | Full width, larger text |
| Announcement | Full width, smaller text | Same | Same |

---

## Accessibility

- All interactive elements have focus states
- Mobile drawer traps focus when open
- Proper ARIA labels on buttons and links
- Keyboard navigation support (Tab, Enter, Escape)
- Skip to content link (add to layout)
- `prefers-reduced-motion` respected

---

## Checklist

- [ ] MiniHeader with contact info, quick links, social
- [ ] PublicHeader with transparent/solid modes
- [ ] Mobile drawer with accordion navigation
- [ ] PublicFooter with accordion on mobile
- [ ] CTA component (banner, card, inline variants)
- [ ] AnnouncementBar with dismiss + localStorage
- [ ] All components responsive
- [ ] All components accessible
- [ ] Social icons as separate component
- [ ] Skip to content link
