import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  ClipboardList,
  FileText,
  FlaskConical,
  Globe,
  GraduationCap,
  Handshake,
  Heart,
  HeartHandshake,
  HelpCircle,
  Lightbulb,
  Mail,
  Newspaper,
  Rocket,
  Star,
  Target,
  TrendingUp,
  Users,
  Video,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavSubItem = {
  title: string;
  href: string;
  description: string;
  icon?: LucideIcon;
};

export type NavGroup = {
  heading: string;
  items: NavSubItem[];
};

export type NavSection = {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
  activePaths: string[];
  columns: NavGroup[];
};

export const researchNavConfig: NavSection[] = [
  {
    title: "Research",
    href: "/projects",
    icon: FlaskConical,
    description:
      "Research programmes, projects, centers, facilities, expertise, and outputs.",
    activePaths: [
      "/projects",
      "/programs",
      "/centers",
      "/facilities",
      "/expertise",
      "/publications",
      "/outputs",
    ],
    columns: [
      {
        heading: "Research & Discovery",
        items: [
          {
            title: "Research Programs",
            href: "/programs",
            description: "Multi-year institutional initiatives.",
          },
          {
            title: "Highlights & Breakthroughs",
            href: "/projects",
            description: "Featured projects and discoveries.",
          },
          {
            title: "Facilities & Labs",
            href: "/facilities",
            description: "Research infrastructure and resources.",
          },
          {
            title: "Researchers & Innovators",
            href: "/expertise",
            description: "Find research contacts and specialists.",
          },
          {
            title: "Publications",
            href: "/publications",
            description: "Articles, journals, papers, and research records.",
          },
          {
            title: "Research Outputs",
            href: "/outputs",
            description:
              "Repository outputs, reports, briefs, and documents.",
          },
        ],
      },
    ],
  },
  {
    title: "Innovation & Partnerships",
    href: "/innovations",
    icon: Lightbulb,
    description:
      "IP, startups, commercialization, partners, donors, and collaborations.",
    activePaths: ["/innovations", "/partners"],
    columns: [
      {
        heading: "Innovation",
        items: [
          {
            title: "Intellectual Property",
            href: "/innovations",
            description: "IP licensing, patents, and inventions.",
            icon: Zap,
          },
          {
            title: "Startups & Incubation",
            href: "/innovations",
            description: "Support for entrepreneurs and ventures.",
            icon: Rocket,
          },
          {
            title: "Competitions & Hackathons",
            href: "/innovations",
            description: "Innovation challenges and prizes.",
            icon: Award,
          },
          {
            title: "Innovation Ecosystem",
            href: "/partners",
            description: "Partners that help ideas reach the market.",
            icon: Globe,
          },
        ],
      },
      {
        heading: "Partner Engagement",
        items: [
          {
            title: "For Industry Partners",
            href: "/partners#how-to-partner",
            description: "How to partner with Kisii University.",
            icon: Building2,
          },
          {
            title: "Partner Showcase",
            href: "/partners",
            description: "Case studies and testimonials.",
            icon: Star,
          },
          {
            title: "Industry Network",
            href: "/partners",
            description: "Corporate and institutional partners.",
            icon: Globe,
          },
        ],
      },
    ],
  },
  {
    title: "Community & Impact",
    href: "/community-impact",
    icon: HeartHandshake,
    description:
      "Community initiatives, impact metrics, consultancies, and mentorship.",
    activePaths: [
      "/community-impact",
      "/impact-metrics",
      "/consultancies",
      "/mentorship",
    ],
    columns: [
      {
        heading: "Community Engagement",
        items: [
          {
            title: "Community Initiatives",
            href: "/community-impact",
            description: "Outreach projects and local impact.",
            icon: Users,
          },
          {
            title: "Extension Programs",
            href: "/community-impact",
            description: "Knowledge transfer and community service.",
            icon: HeartHandshake,
          },
        ],
      },
      {
        heading: "Impact & Support",
        items: [
          {
            title: "Impact Overview",
            href: "/impact-metrics",
            description: "Social and economic contribution.",
            icon: Target,
          },
          {
            title: "Metrics & Data",
            href: "/impact-metrics",
            description: "Performance dashboard.",
            icon: BarChart3,
          },
          {
            title: "Consultancies",
            href: "/consultancies",
            description: "Professional expert services.",
            icon: Briefcase,
          },
          {
            title: "Mentorship",
            href: "/mentorship",
            description: "Mentor and mentee programme details.",
            icon: GraduationCap,
          },
        ],
      },
    ],
  },
  {
    title: "News & Events",
    href: "/news",
    icon: Newspaper,
    description:
      "Research news, blogs, events, announcements, and gallery highlights.",
    activePaths: ["/news", "/events"],
    columns: [
      {
        heading: "Research Updates",
        items: [
          {
            title: "News",
            href: "/news#news",
            description: "Research stories, office updates, and public notices.",
            icon: Newspaper,
          },
          {
            title: "Blogs",
            href: "/news#blogs",
            description: "Research commentary, explainers, and field notes.",
            icon: FileText,
          },
          {
            title: "Events",
            href: "/news#events",
            description: "Conferences, workshops, forums, and seminars.",
            icon: CalendarDays,
          },
          {
            title: "Announcements",
            href: "/news#announcements",
            description: "Calls, notices, deadlines, and research alerts.",
            icon: ClipboardList,
          },
          {
            title: "Gallery",
            href: "/news#gallery",
            description: "Photos, videos, and media from research activities.",
            icon: Video,
          },
        ],
      },
    ],
  },
  {
    title: "Resources & Tools",
    href: "/resources-tools",
    icon: ClipboardList,
    description: "Policies, templates, guides, forms, and research resources.",
    activePaths: [
      "/resources-tools",
      "/outputs",
      "/forms",
      "/guidelines",
      "/services",
    ],
    columns: [
      {
        heading: "Resources",
        items: [
          {
            title: "Resource Library",
            href: "/resources-tools",
            description: "Policies, templates, reports, and guides.",
            icon: BookOpen,
          },
          {
            title: "Forms & Templates",
            href: "/forms",
            description: "Ethics, booking, and collaboration forms.",
            icon: ClipboardList,
          },
        ],
      },
    ],
  },
  {
    title: "Funding",
    href: "/funding",
    icon: Rocket,
    description: "Grant calls, scholarships, endowments, and training.",
    activePaths: [
      "/funding",
      "/capacity",
      "/scholarships",
      "/endowments",
      "/training",
    ],
    columns: [
      {
        heading: "Funding",
        items: [
          {
            title: "Scholarships",
            href: "/scholarships",
            description: "Student funding and awards.",
            icon: GraduationCap,
          },
          {
            title: "Funding Opportunities",
            href: "/funding",
            description: "Grants and calls for proposals.",
            icon: Award,
          },
          {
            title: "Endowment Funds",
            href: "/endowments",
            description: "Permanent funding initiatives.",
            icon: Heart,
          },
          {
            title: "Training Programs",
            href: "/training",
            description: "Workshops, webinars, and bootcamps.",
            icon: BookOpen,
          },
          {
            title: "Capacity Building",
            href: "/capacity",
            description: "Training and development.",
            icon: TrendingUp,
          },
        ],
      },
    ],
  },
  {
    title: "About",
    href: "/about",
    icon: Mail,
    description:
      "Research office, team, contacts, inquiries, donations, and multimedia.",
    activePaths: ["/about", "/team", "/connect", "/donate"],
    columns: [
      {
        heading: "About REIRM",
        items: [
          {
            title: "Our Team",
            href: "/team",
            description: "Leadership and research staff.",
            icon: Users,
          },
          {
            title: "Contact Us",
            href: "/connect",
            description: "Inquiries and support.",
            icon: Mail,
          },
          {
            title: "Multimedia",
            href: "/connect",
            description: "Tours, interviews, and galleries.",
            icon: Video,
          },
        ],
      },
      {
        heading: "Engage",
        items: [
          {
            title: "Research Inquiry",
            href: "/connect#research",
            description: "Project collaboration and research support.",
            icon: FlaskConical,
          },
          {
            title: "Partnership Inquiry",
            href: "/connect#partnership",
            description: "Industry, government, and funder requests.",
            icon: Handshake,
          },
          {
            title: "Media Inquiry",
            href: "/connect#media",
            description: "Expert comments and press requests.",
            icon: Newspaper,
          },
          {
            title: "Help Desk",
            href: "/connect",
            description: "Research support and general help.",
            icon: HelpCircle,
          },
          {
            title: "Donate",
            href: "/donate",
            description:
              "Support research, scholarships, endowments, and impact.",
            icon: Heart,
          },
        ],
      },
    ],
  },
];

export const popularSearches = [
  "Publications",
  "Grants",
  "Research Centers",
  "Innovation",
  "Partnerships",
  "Projects",
];
