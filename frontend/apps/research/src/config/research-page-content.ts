import {
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CircleHelp,
  ClipboardList,
  FlaskConical,
  Grid3X3,
  Handshake,
  Image as ImageIcon,
  Mail,
  MessageSquareText,
  PenLine,
  ShieldCheck,
  Sprout,
  Trophy,
  Users,
} from "lucide-react";

export const researchNewsFallbackImages = [
  "/images/research/research-hero-imagegen.webp",
  "/images/research/research-projects-hero.webp",
  "/images/research/research-events-hero.webp",
  "/images/research/research-demo-imagegen.webp",
  "/images/research/research-innovation-hero.webp",
  "/images/research/sustainability-hero-imagegen.webp",
  "/images/research/university-farm-hero-imagegen.webp",
];

export const researchNewsTabs = [
  { id: "news", label: "News", icon: Grid3X3 },
  { id: "articles", label: "Articles", icon: PenLine },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "announcements", label: "Announcements", icon: Bell },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
] as const;

export const innovationPathwayLinks = [
  { label: "Intellectual Property", href: "/innovations?ip=filed", body: "Protect and commercialize university innovations", icon: ShieldCheck },
  { label: "Startups & incubation", href: "/innovations?commercial=pilot", body: "Turn innovations into scalable ventures", icon: Sprout },
  { label: "Industry partners", href: "/partners?type=industry", body: "Collaborate on applied solutions", icon: BriefcaseBusiness },
  { label: "Competitions & showcases", href: "/innovations?type=prototype", body: "Spotlight innovations and win support", icon: Trophy },
];

export const innovationReadingSteps = [
  { label: "Problem", body: "The real-world challenge the innovation is designed to solve.", icon: CircleHelp },
  { label: "Evidence", body: "Research and validation data that demonstrates impact.", icon: BadgeCheck },
  { label: "Readiness", body: "Current stage in the journey from idea to field-ready solution.", icon: FlaskConical },
  { label: "Next step", body: "How you can engage and help move the innovation forward.", icon: Handshake },
];

export const researchAboutSections = [
  { id: "overview", anchor: "about-overview", label: "Overview", icon: ClipboardList },
  { id: "mandate", anchor: "about-mandate", label: "Mandate", icon: ClipboardList },
  { id: "leadership", anchor: "about-leadership", label: "Leadership", icon: MessageSquareText },
  { id: "team", anchor: "about-team", label: "Team", icon: Users },
  { id: "governance", anchor: "about-governance", label: "Governance", icon: ShieldCheck },
  { id: "contact", anchor: "about-contact", label: "Contact", icon: Mail },
];
