"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ChevronDown, ExternalLink } from "lucide-react";
import { Button } from "../../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
import { cn } from "../../../lib/utils";

// Minimal data types for navigation
export interface NavSchool {
  id: string;
  name: string;
  slug: string;
}

export interface NavDepartment {
  id: string;
  name: string;
  slug: string;
  school_id: string;
}

export interface NavAdminUnit {
  id: string;
  name: string;
  slug: string;
}

export interface NavClub {
  id: string;
  name: string;
  slug: string;
}

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  description?: string;
  children?: NavItem[];
}

export interface MegaMenuData {
  schools?: NavSchool[];
  departments?: NavDepartment[];
  adminUnits?: NavAdminUnit[];
  clubs?: NavClub[];
}

interface PublicHeaderProps {
  megaMenuData?: MegaMenuData;
  transparent?: boolean;
  className?: string;
}

export function PublicHeader({
  megaMenuData,
  transparent = false,
  className,
}: PublicHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Build navigation with dynamic data
  const navigation = buildNavigation(megaMenuData);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  const isTransparent = transparent && !isScrolled;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isTransparent
            ? "bg-transparent"
            : "bg-white/95 backdrop-blur-md shadow-sm",
          className
        )}
        style={{ top: "var(--mini-header-height, 0px)" }}
      >
        <nav className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Logo - Stacked layout */}
            <Link href="/" className="flex flex-col items-center gap-1 z-10">
              <Image
                src="/logos/ksu-logo.png"
                alt="Kisii University"
                width={56}
                height={56}
                className="h-12 w-auto lg:h-14"
                priority
              />
              <span
                className={cn(
                  "hidden sm:block font-bold text-sm lg:text-base transition-colors text-center leading-tight",
                  isTransparent ? "text-white" : "text-gray-900"
                )}
              >
                Kisii University
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <MegaMenuDropdown
                  key={item.label}
                  item={item}
                  isTransparent={isTransparent}
                  isOpen={openDropdown === item.label}
                  onOpen={() => setOpenDropdown(item.label)}
                  onClose={() => setOpenDropdown(null)}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                asChild
                size="sm"
                className={cn(
                  "hidden sm:flex",
                  isTransparent
                    ? "bg-white text-primary hover:bg-gray-100"
                    : "bg-primary text-white hover:bg-primary/90"
                )}
              >
                <Link href="/admissions/how-to-apply">Apply Now</Link>
              </Button>

              {/* Mobile Menu Trigger */}
              <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetTrigger asChild>
                  <button
                    className={cn(
                      "lg:hidden p-2 rounded-md transition-colors",
                      isTransparent
                        ? "text-white hover:bg-white/10"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    aria-label="Open menu"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0 overflow-y-auto">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex flex-col items-center gap-1">
                      <Image
                        src="/logos/ksu-logo.png"
                        alt="Kisii University"
                        width={40}
                        height={40}
                      />
                      <span>Kisii University</span>
                    </SheetTitle>
                  </SheetHeader>
                  <MobileNav
                    navigation={navigation}
                    onClose={() => setIsMobileOpen(false)}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </header>

      {/* Spacer for non-transparent headers */}
      {!transparent && <div className="h-20 lg:h-24" />}
    </>
  );
}

function buildNavigation(megaMenuData?: MegaMenuData): NavItem[] {
  const schools = megaMenuData?.schools || [];
  const adminUnits = megaMenuData?.adminUnits || [];

  // About menu
  const aboutItem: NavItem = {
    label: "About",
    href: "/about",
    children: [
      // Overview group
      { label: "Overview", href: "/about", description: "About Kisii University" },
      { label: "History", href: "/about/history", description: "Our journey since establishment" },
      { label: "Mission & Vision", href: "/about/mission-vision", description: "What drives us forward" },
      // Governance & Leadership
      { label: "Governance", href: "/about/governance", description: "Council and Senate" },
      { label: "Leadership", href: "/about/leadership", description: "University management team" },
      // Quality
      { label: "Quality Assurance", href: "/about/quality-assurance", description: "Standards and accreditation" },
    ],
  };

  // Administration menu
  const administrationItem: NavItem = {
    label: "Administration",
    href: "/administration",
    children: [
      { label: "Organization", href: "/administration/organization", description: "University structure" },
      { label: "Divisions", href: "/administration/divisions", description: "Administrative divisions" },
      { label: "Directorates", href: "/administration/directorates", description: "Support directorates" },
      // Dynamic admin units
      ...adminUnits.map((unit) => ({
        label: unit.name,
        href: `/administration/units/${unit.slug}`,
      })),
    ],
  };

  // Admissions menu
  const admissionsItem: NavItem = {
    label: "Admissions",
    href: "/admissions",
    children: [
      { label: "Undergraduate", href: "/admissions/undergraduate", description: "Bachelor's programmes" },
      { label: "Postgraduate", href: "/admissions/postgraduate", description: "Masters & PhD programmes" },
      { label: "International Students", href: "/admissions/international", description: "Study in Kenya" },
      { label: "Requirements", href: "/admissions/requirements", description: "Entry qualifications" },
      { label: "Fees & Scholarships", href: "/admissions/fees", description: "Tuition and financial aid" },
      { label: "How to Apply", href: "/admissions/how-to-apply", description: "Application process" },
    ],
  };

  // Academics with schools - restructured
  const academicsItem: NavItem = {
    label: "Academics",
    href: "/academics",
    children: [
      // Quick links
      { label: "All Schools", href: "/academics/schools", description: "Browse all schools" },
      { label: "Programmes", href: "/academics/programmes", description: "Find your programme" },
      { label: "Academic Calendar", href: "/academics/calendar", description: "Important dates" },
      { label: "Examinations", href: "/academics/examinations", description: "Exam schedules & results" },
      // Dynamic schools
      ...schools.map((school) => ({
        label: school.name.replace("School of ", "").replace("Faculty of ", ""),
        href: `/academics/schools/${school.slug}`,
      })),
    ],
  };

  // Campus Life
  const campusLifeItem: NavItem = {
    label: "Campus Life",
    href: "/campus-life",
    children: [
      { label: "Student Life", href: "/campus-life/student-life", description: "Experience university life" },
      { label: "Clubs & Societies", href: "/campus-life/clubs", description: "Student organizations" },
      { label: "Sports", href: "/campus-life/sports", description: "Athletics and recreation" },
      { label: "Accommodation", href: "/campus-life/accommodation", description: "On-campus housing" },
      { label: "Support Services", href: "/campus-life/support", description: "Student welfare" },
    ],
  };

  // External links
  const externalItems: NavItem[] = [
    { label: "News", href: "/news" },
    { label: "Research", href: "https://research.kisiiuniversity.ac.ke", external: true },
    { label: "Library", href: "https://library.kisiiuniversity.ac.ke", external: true },
  ];

  return [
    aboutItem,
    administrationItem,
    admissionsItem,
    academicsItem,
    campusLifeItem,
    ...externalItems,
  ];
}

function MegaMenuDropdown({
  item,
  isTransparent,
  isOpen,
  onOpen,
  onClose,
}: {
  item: NavItem;
  isTransparent: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const hasChildren = item.children && item.children.length > 0;

  // Simple link for items without children
  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
        className={cn(
          "px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1",
          isTransparent
            ? "text-white/90 hover:text-white hover:bg-white/10"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        )}
      >
        {item.label}
        {item.external && <ExternalLink className="w-3 h-3" />}
      </Link>
    );
  }

  const children = item.children || [];

  // Separate items with descriptions (quick links) from items without (dynamic items)
  const quickLinks = children.filter((c) => c.description);
  const dynamicItems = children.filter((c) => !c.description);

  // Determine if this is a mega menu (has dynamic items) or simple dropdown
  const isMegaMenu = dynamicItems.length > 0;

  return (
    <div
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button
        className={cn(
          "px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1",
          isTransparent
            ? "text-white/90 hover:text-white hover:bg-white/10"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
          isOpen && (isTransparent ? "bg-white/10 text-white" : "bg-gray-100")
        )}
      >
        {item.label}
        <ChevronDown
          className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-xl shadow-xl border z-50",
              isMegaMenu ? "p-6" : "py-2 w-64"
            )}
            style={isMegaMenu ? { width: "max-content", maxWidth: "90vw", minWidth: "500px" } : undefined}
          >
            {isMegaMenu ? (
              // Mega menu layout
              <div className="flex gap-8">
                {/* Quick Links */}
                <div className="min-w-[200px]">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                    Quick Links
                  </h3>
                  <div className="space-y-1">
                    {quickLinks.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block py-2 px-3 -mx-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="font-medium text-gray-900 group-hover:text-primary transition-colors text-sm">
                          {child.label}
                        </div>
                        {child.description && (
                          <div className="text-xs text-gray-500">
                            {child.description}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Vertical divider */}
                <div className="w-px bg-gray-200" />

                {/* Dynamic Items Grid */}
                <div className="flex-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                    {item.label === "Academics" ? "Schools" : item.label === "Administration" ? "Units" : "More"}
                  </h3>
                  <div
                    className="grid gap-1"
                    style={{
                      gridTemplateColumns: `repeat(${Math.min(Math.ceil(dynamicItems.length / 4), 3)}, minmax(150px, 1fr))`,
                    }}
                  >
                    {dynamicItems.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 hover:text-primary"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Simple dropdown layout
              <div className="space-y-1">
                {children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block px-4 py-2.5 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="font-medium text-gray-900 group-hover:text-primary transition-colors text-sm">
                      {child.label}
                    </div>
                    {child.description && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {child.description}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {/* View All Link for mega menus */}
            {isMegaMenu && (
              <div className="mt-4 pt-4 border-t">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  View all {item.label.toLowerCase()}
                  <ChevronDown className="w-4 h-4 -rotate-90" />
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileNav({
  navigation,
  onClose,
}: {
  navigation: NavItem[];
  onClose: () => void;
}) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Navigation */}
      <nav className="flex-1 py-4">
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
      <div className="border-t p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase">
          Quick Links
        </p>
        <div className="space-y-2">
          <Link
            href="/m/staff"
            className="block text-sm text-gray-700 hover:text-primary"
            onClick={onClose}
          >
            Staff Portal
          </Link>
          <a
            href="https://portal.kisiiuniversity.ac.ke"
            className="block text-sm text-gray-700 hover:text-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Student Portal
          </a>
          <a
            href="https://elearning.kisiiuniversity.ac.ke"
            className="block text-sm text-gray-700 hover:text-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            E-Learning
          </a>
        </div>
      </div>

      {/* CTA */}
      <div className="p-4 border-t">
        <Button asChild className="w-full">
          <Link href="/admissions/how-to-apply" onClick={onClose}>
            Apply Now
          </Link>
        </Button>
      </div>
    </div>
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
        <ChevronDown
          className={cn(
            "w-5 h-5 text-gray-400 transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
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
