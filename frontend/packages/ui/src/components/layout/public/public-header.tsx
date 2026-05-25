"use client";

import {
  useState,
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
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
  school_id?: string;
  department_type?: string;
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
  group?: string;
  children?: NavItem[];
}

export interface MegaMenuData {
  schools?: NavSchool[];
  departments?: NavDepartment[];
  divisions?: NavAdminUnit[];
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
  const closeDropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
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
    if (closeDropdownTimeout.current) {
      clearTimeout(closeDropdownTimeout.current);
      closeDropdownTimeout.current = null;
    }
    setIsMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (closeDropdownTimeout.current) {
        clearTimeout(closeDropdownTimeout.current);
      }
    };
  }, []);

  const openNavDropdown = (label: string) => {
    if (closeDropdownTimeout.current) {
      clearTimeout(closeDropdownTimeout.current);
      closeDropdownTimeout.current = null;
    }
    setOpenDropdown(label);
  };

  const closeNavDropdown = () => {
    if (closeDropdownTimeout.current) {
      clearTimeout(closeDropdownTimeout.current);
    }
    closeDropdownTimeout.current = setTimeout(() => {
      setOpenDropdown(null);
      closeDropdownTimeout.current = null;
    }, 120);
  };

  const isTransparent = transparent && !isScrolled;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          isTransparent
            ? "bg-transparent"
            : "bg-white/95 backdrop-blur-md shadow-sm",
          className,
        )}
      >
        <nav className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="flex h-[74px] items-center justify-between lg:h-[68px]">
            {/* Logo */}
            <Link href="/" className="z-10 flex shrink-0 items-center gap-3">
              <Image
                src="/logos/ksu-logo.png"
                alt="Kisii University"
                width={56}
                height={56}
                className="h-11 w-auto sm:h-12"
                priority
              />
              <span className="min-w-0 lg:hidden xl:block">
                <span
                  className={cn(
                    "block font-[family-name:var(--font-display)] text-lg font-bold uppercase leading-none text-primary transition-colors sm:text-2xl lg:text-xl",
                    isTransparent ? "text-white" : "text-primary",
                  )}
                >
                  Kisii University
                </span>
                <span
                  className={cn(
                    "mt-1 block text-xs font-semibold leading-none transition-colors sm:text-sm lg:text-xs",
                    isTransparent ? "text-white/80" : "text-slate-600",
                  )}
                >
                  Inclusivity & Borderlessness
                </span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navigation.map((item, index) => (
                <MegaMenuDropdown
                  key={item.label}
                  item={item}
                  align={
                    index <= 1
                      ? "start"
                      : index >= navigation.length - 4
                        ? "end"
                        : "center"
                  }
                  isTransparent={isTransparent}
                  isOpen={openDropdown === item.label}
                  onOpen={() => openNavDropdown(item.label)}
                  onClose={closeNavDropdown}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                asChild
                size="sm"
                className={cn(
                  "hidden xl:flex",
                  isTransparent
                    ? "bg-white text-primary hover:bg-gray-100"
                    : "bg-secondary text-white hover:bg-secondary/90",
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
                        : "text-gray-700 hover:bg-gray-100",
                    )}
                    aria-label="Open menu"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[min(20rem,calc(100vw-1rem))] p-0 overflow-y-auto"
                >
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
    </>
  );
}

function buildNavigation(megaMenuData?: MegaMenuData): NavItem[] {
  const schools = megaMenuData?.schools || [];
  const departments = megaMenuData?.departments || [];
  const divisions = megaMenuData?.divisions || [];
  const adminUnits = megaMenuData?.adminUnits || [];
  const clubs = megaMenuData?.clubs || [];

  // About menu
  const aboutItem: NavItem = {
    label: "About",
    href: "/about",
    children: [
      // Overview group
      {
        label: "Overview",
        href: "/about",
        description: "About Kisii University",
      },
      {
        label: "History",
        href: "/about/history",
        description: "Our journey since establishment",
      },
      {
        label: "Mission & Vision",
        href: "/about/mission-vision",
        description: "What drives us forward",
      },
      // Governance & Leadership
      {
        label: "Governance",
        href: "/about/governance",
        description: "Council and Senate",
      },
      {
        label: "Leadership",
        href: "/about/leadership",
        description: "University management team",
      },
      // Quality
      {
        label: "Quality Assurance",
        href: "/about/quality-assurance",
        description: "Standards and accreditation",
      },
    ],
  };

  // Administration menu
  const administrationItem: NavItem = {
    label: "Administration",
    href: "/administration",
    children: [
      {
        label: "Organization",
        href: "/administration/organization",
        description: "University structure",
      },
      ...divisions.map((division) => ({
        label: division.name,
        href: `/administration/divisions/${division.slug}`,
        group: "Divisions",
      })),
      ...(departments.length ? departments : adminUnits).map((unit) => ({
        label: unit.name,
        href: `/administration/units/${unit.slug}`,
        group: "Departments",
      })),
    ],
  };

  // Admissions menu
  const admissionsItem: NavItem = {
    label: "Admissions",
    href: "/admissions",
    children: [
      {
        label: "Undergraduate",
        href: "/admissions/undergraduate",
        description: "Bachelor's programmes",
      },
      {
        label: "Postgraduate",
        href: "/admissions/postgraduate",
        description: "Masters & PhD programmes",
      },
      {
        label: "International Students",
        href: "/admissions/international",
        description: "Study in Kenya",
      },
      {
        label: "Requirements",
        href: "/admissions/requirements",
        description: "Entry qualifications",
      },
      {
        label: "Fees & Scholarships",
        href: "/admissions/fees",
        description: "Tuition and financial aid",
      },
      {
        label: "How to Apply",
        href: "/admissions/how-to-apply",
        description: "Application process",
      },
    ],
  };

  // Academics with schools - restructured
  const academicsItem: NavItem = {
    label: "Academics",
    href: "/academics",
    children: [
      // Quick links
      {
        label: "All Schools",
        href: "/academics/schools",
        description: "Browse all schools",
      },
      {
        label: "Programmes",
        href: "/academics/programmes",
        description: "Find your programme",
      },
      {
        label: "Academic Calendar",
        href: "/academics/calendar",
        description: "Important dates",
      },
      {
        label: "Examinations",
        href: "/academics/examinations",
        description: "Exam schedules & results",
      },
      // Dynamic schools
      ...schools.map((school) => ({
        label: school.name.replace("School of ", "").replace("Faculty of ", ""),
        href: `/academics/schools/${school.slug}`,
        group: "Schools",
      })),
    ],
  };

  // Campus Life
  const campusLifeItem: NavItem = {
    label: "Campus Life",
    href: "/campus-life",
    children: [
      {
        label: "Student Life",
        href: "/campus-life/student-life",
        description: "Experience university life",
      },
      {
        label: "Clubs & Societies",
        href: "/campus-life/clubs",
        description: "Student organizations",
      },
      {
        label: "Sports",
        href: "/campus-life/sports",
        description: "Athletics and recreation",
      },
      {
        label: "Accommodation",
        href: "/campus-life/accommodation",
        description: "On-campus housing",
      },
      {
        label: "Support Services",
        href: "/campus-life/support",
        description: "Student welfare",
      },
      ...clubs.map((club) => ({
        label: club.name,
        href: `/campus-life/clubs/${club.slug}`,
        group: "Clubs & Societies",
      })),
    ],
  };

  // External links
  const externalItems: NavItem[] = [
    { label: "News", href: "/news" },
    {
      label: "Research",
      href: "https://research.kisiiuniversity.ac.ke",
      external: true,
    },
    {
      label: "Library",
      href: "https://library.kisiiuniversity.ac.ke",
      external: true,
    },
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
  align,
  isTransparent,
  isOpen,
  onOpen,
  onClose,
}: {
  item: NavItem;
  align: "start" | "center" | "end";
  isTransparent: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const [dropdownFrame, setDropdownFrame] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);
  const children = item.children || [];
  const hasChildren = children.length > 0;

  // Separate descriptive quick links from data-driven groups.
  const quickLinks = children.filter(
    (child) => child.description && !child.group && !child.children?.length,
  );
  const looseDynamicItems = children.filter(
    (child) => !child.description && !child.group && !child.children?.length,
  );
  const groupedSections = getGroupedMenuSections(children);
  const rightSections = [
    ...groupedSections,
    ...(looseDynamicItems.length
      ? [{ title: "More", items: looseDynamicItems }]
      : []),
  ];
  const isStructuredMegaMenu =
    item.label === "Academics" ||
    item.label === "Administration" ||
    item.label === "Campus Life";
  const isMegaMenu =
    isStructuredMegaMenu ||
    rightSections.length > 0 ||
    looseDynamicItems.length > 0;

  const getDropdownFrame = (anchorElement?: HTMLElement | null) => {
    if (typeof window === "undefined") {
      return null;
    }

    const triggerElement = anchorElement ?? triggerRef.current;
    const rect = triggerElement?.getBoundingClientRect();
    if (!triggerElement || !rect) {
      return null;
    }

    const headerRect = triggerElement
      .closest("header")
      ?.getBoundingClientRect();
    const gutter = 16;
    const availableWidth = Math.max(260, window.innerWidth - gutter * 2);
    const targetWidth = isMegaMenu
      ? item.label === "Administration"
        ? 1700
        : 1500
      : 288;
    const width = Math.min(targetWidth, availableWidth);
    const maxLeft = Math.max(gutter, window.innerWidth - width - gutter);
    const preferredLeft =
      align === "start"
        ? rect.left
        : align === "end"
          ? rect.right - width
          : rect.left + rect.width / 2 - width / 2;

    return {
      left: Math.min(Math.max(preferredLeft, gutter), maxLeft),
      top: (headerRect?.bottom ?? rect.bottom) + 2,
      width,
    };
  };

  const updateDropdownFrame = (anchorElement?: HTMLElement | null) => {
    const nextDropdownFrame = getDropdownFrame(anchorElement);
    if (nextDropdownFrame) {
      setDropdownFrame(nextDropdownFrame);
    }
  };

  const handleOpen = (event: ReactMouseEvent<HTMLElement>) => {
    updateDropdownFrame(event.currentTarget);
    onOpen();
  };

  useEffect(() => {
    if (!isOpen || !hasChildren) {
      setDropdownFrame(null);
      return;
    }

    updateDropdownFrame();

    const handleViewportChange = () => updateDropdownFrame();

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [align, hasChildren, isMegaMenu, isOpen, item.label]);

  const activeDropdownFrame = isOpen
    ? (dropdownFrame ?? getDropdownFrame())
    : null;

  // Simple link for items without children
  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
        className={cn(
          "flex min-h-9 items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isTransparent
            ? "text-white/90 hover:text-white hover:bg-white/10"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
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
      ref={triggerRef}
      onMouseEnter={handleOpen}
      onMouseLeave={onClose}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        className={cn(
          "flex min-h-9 items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isTransparent
            ? "text-white/90 hover:text-white hover:bg-white/10"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
          isOpen && (isTransparent ? "bg-white/10 text-white" : "bg-gray-100"),
        )}
      >
        {item.label}
        <ChevronDown
          className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && activeDropdownFrame
        ? createPortal(
            <motion.div
              key={`${item.label}-menu`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "fixed z-50 rounded-xl border bg-white shadow-xl",
                isMegaMenu ? "p-4" : "py-2",
              )}
              onMouseEnter={onOpen}
              onMouseLeave={onClose}
              style={{
                left: activeDropdownFrame.left,
                top: activeDropdownFrame.top,
                width: activeDropdownFrame.width,
              }}
            >
              {isMegaMenu ? (
                <div className="grid gap-5 lg:grid-cols-[minmax(13rem,16rem)_minmax(0,1fr)]">
                  <div>
                    {quickLinks.length ? (
                      <MenuSection title="Quick Links">
                        {quickLinks.map((child) => (
                          <MenuCardLink key={child.href} item={child} />
                        ))}
                      </MenuSection>
                    ) : null}
                  </div>

                  <div className="min-w-0 border-t pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                    <GroupedMenuGrid sections={rightSections} />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block min-h-12 px-4 py-2.5 transition-colors hover:bg-gray-50 group"
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

              {isMegaMenu && (
                <div className="mt-4 shrink-0 border-t pt-4">
                  <Link
                    href={item.href}
                    className="inline-flex min-h-8 items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    View all {item.label.toLowerCase()}
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </Link>
                </div>
              )}
            </motion.div>,
            document.body,
          )
        : null}
    </div>
  );
}

function MenuSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function MenuCardLink({ item }: { item: NavItem }) {
  return (
    <Link
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      className="-mx-3 block min-h-12 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50 group"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-primary">
        <span className="min-w-0 flex-1">{item.label}</span>
        {item.external ? <ExternalLink className="h-3.5 w-3.5" /> : null}
      </div>
      {item.description && (
        <div className="text-xs leading-5 text-gray-500">
          {item.description}
        </div>
      )}
    </Link>
  );
}

interface GroupedMenuSection {
  title: string;
  items: NavItem[];
}

function getGroupedMenuSections(items: NavItem[]): GroupedMenuSection[] {
  const sections = new Map<string, NavItem[]>();

  items.forEach((item) => {
    if (!item.group) {
      return;
    }

    const sectionItems = sections.get(item.group) ?? [];
    sectionItems.push(item);
    sections.set(item.group, sectionItems);
  });

  return Array.from(sections.entries()).map(([title, sectionItems]) => ({
    title,
    items: sectionItems,
  }));
}

function GroupedMenuGrid({ sections }: { sections: GroupedMenuSection[] }) {
  if (!sections.length) {
    return (
      <p className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-sm text-gray-500">
        No menu items available.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <div key={section.title}>
          {index > 0 ? <div className="mb-4 border-t border-gray-200" /> : null}
          <MenuLinkGrid title={section.title} items={section.items} />
        </div>
      ))}
    </div>
  );
}

function MenuLinkGrid({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        {title}
      </h3>
      <div
        className="grid gap-1.5"
        style={{
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(10rem, 100%), 1fr))",
        }}
      >
        {items.map((child) => (
          <Link
            key={child.href}
            href={child.href}
            target={child.external ? "_blank" : undefined}
            rel={child.external ? "noopener noreferrer" : undefined}
            className="block min-h-9 rounded-lg px-2.5 py-1.5 text-sm leading-5 text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary"
          >
            <span className="break-words">{child.label}</span>
          </Link>
        ))}
      </div>
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
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navigation.map((item) => (
          <MobileNavItem
            key={item.href}
            item={item}
            isExpanded={expandedItems.includes(item.href)}
            expandedItems={expandedItems}
            onToggle={() => toggleExpanded(item.href)}
            onToggleChild={toggleExpanded}
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
            className="block min-h-9 text-sm text-gray-700 hover:text-primary"
            onClick={onClose}
          >
            Staff Portal
          </Link>
          <a
            href="https://portal.kisiiuniversity.ac.ke"
            className="block min-h-9 text-sm text-gray-700 hover:text-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Student Portal
          </a>
          <a
            href="https://elearning.kisiiuniversity.ac.ke"
            className="block min-h-9 text-sm text-gray-700 hover:text-primary"
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
  expandedItems,
  onToggle,
  onToggleChild,
  onClose,
  depth = 0,
}: {
  item: NavItem;
  isExpanded: boolean;
  expandedItems: string[];
  onToggle: () => void;
  onToggleChild: (href: string) => void;
  onClose: () => void;
  depth?: number;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const indent = `${1 + depth}rem`;

  if (!hasChildren) {
    return <MobileNavLink item={item} depth={depth} onClose={onClose} />;
  }

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex min-h-11 w-full items-center justify-between py-3 pr-4 text-left text-gray-900 hover:bg-gray-50"
        style={{ paddingLeft: indent }}
      >
        <span className="min-w-0">
          <span className="block font-medium">{item.label}</span>
          {item.description ? (
            <span className="mt-0.5 block text-xs leading-5 text-gray-500">
              {item.description}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "ml-3 h-5 w-5 shrink-0 text-gray-400 transition-transform",
            isExpanded && "rotate-180",
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
            <MobileNavLink
              item={{
                label: `All ${item.label}`,
                href: item.href,
                external: item.external,
              }}
              depth={depth + 1}
              onClose={onClose}
            />
            {item.children!.map((child) => (
              <MobileNavItem
                key={child.href}
                item={child}
                isExpanded={expandedItems.includes(child.href)}
                expandedItems={expandedItems}
                onToggle={() => onToggleChild(child.href)}
                onToggleChild={onToggleChild}
                onClose={onClose}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileNavLink({
  item,
  depth,
  onClose,
}: {
  item: NavItem;
  depth: number;
  onClose: () => void;
}) {
  return (
    <Link
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      onClick={onClose}
      className="flex min-h-11 items-center justify-between py-3 pr-4 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"
      style={{ paddingLeft: `${1 + depth}rem` }}
    >
      <span className="min-w-0 flex-1">{item.label}</span>
      {item.external && <ExternalLink className="h-4 w-4 text-gray-400" />}
    </Link>
  );
}
