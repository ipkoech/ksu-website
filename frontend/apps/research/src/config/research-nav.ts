import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  ClipboardList,
  FlaskConical,
  Globe,
  GraduationCap,
  Heart,
  HeartHandshake,
  Lightbulb,
  Mail,
  Newspaper,
  Rocket,
  Star,
  Target,
  TrendingUp,
  Users,
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
    activePaths: ["/innovations", "/startups", "/incubation", "/competitions", "/technology-transfer", "/partners"],
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
            href: "/startups",
            description: "Support for entrepreneurs and ventures.",
            icon: Rocket,
          },
          {
            title: "Incubation Support",
            href: "/incubation",
            description: "Cohorts, mentorship, and venture support.",
            icon: Users,
          },
          {
            title: "Competitions & Hackathons",
            href: "/competitions",
            description: "Innovation challenges and prizes.",
            icon: Award,
          },
          {
            title: "Technology Transfer",
            href: "/technology-transfer",
            description: "Licensing, disclosures, and transfer cases.",
            icon: Briefcase,
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
            title: "How to Partner",
            href: "/partners/how-to-partner",
            description: "Collaboration routes and engagement process.",
            icon: Building2,
          },
          {
            title: "Case Studies & Testimonials",
            href: "/partners/stories",
            description: "Published partner-linked work and outcomes.",
            icon: Star,
          },
          {
            title: "Partner Directory",
            href: "/partners",
            description: "Corporate, community, and institutional partners.",
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
    title: "News & Events",
    href: "/news",
    icon: Newspaper,
    description: "Research news, events, announcements, and gallery highlights.",
    activePaths: ["/news"],
    columns: [],
  },
  {
    title: "About",
    href: "/about",
    icon: Mail,
    description: "Research office mandate, leadership, team, governance, and contacts.",
    activePaths: ["/about"],
    columns: [],
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
