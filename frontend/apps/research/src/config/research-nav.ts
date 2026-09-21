import { BookOpen, FlaskConical, HeartHandshake, Lightbulb, Mail, Newspaper } from "lucide-react";
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
    title: "About",
    href: "/about",
    icon: Mail,
    description: "Overview, Team, Centers.",
    activePaths: ["/about", "/team", "/centers"],
    columns: [
  {
    "heading": "About",
    "items": [
      {
        "title": "Overview",
        "href": "/about",
        "description": ""
      },
      {
        "title": "Team",
        "href": "/team",
        "description": ""
      },
      {
        "title": "Centers",
        "href": "/centers",
        "description": ""
      }
    ]
  }
],
  },
  {
    title: "Discovery",
    href: "/projects",
    icon: FlaskConical,
    description: "Projects, Programs, Publications, Outputs, Facilities, Expertise.",
    activePaths: ["/projects", "/programs", "/publications", "/outputs", "/facilities", "/expertise"],
    columns: [
  {
    "heading": "Discover",
    "items": [
      {
        "title": "Projects",
        "href": "/projects",
        "description": ""
      },
      {
        "title": "Programs",
        "href": "/programs",
        "description": ""
      },
      {
        "title": "Publications",
        "href": "/publications",
        "description": ""
      },
      {
        "title": "Outputs",
        "href": "/outputs",
        "description": ""
      },
      {
        "title": "Facilities",
        "href": "/facilities",
        "description": ""
      },
      {
        "title": "Expertise",
        "href": "/expertise",
        "description": ""
      }
    ]
  }
],
  },
  {
    title: "Innovation",
    href: "/innovations",
    icon: Lightbulb,
    description: "Innovations, Startups, Incubation, Competitions, Technology Transfer, Partners, How to Partner, Partner Stories.",
    activePaths: ["/innovations", "/startups", "/incubation", "/competitions", "/technology-transfer", "/partners", "/partners/how-to-partner", "/partners/stories"],
    columns: [
  {
    "heading": "Innovation",
    "items": [
      {
        "title": "Innovations",
        "href": "/innovations",
        "description": ""
      },
      {
        "title": "Startups",
        "href": "/startups",
        "description": ""
      },
      {
        "title": "Incubation",
        "href": "/incubation",
        "description": ""
      },
      {
        "title": "Competitions",
        "href": "/competitions",
        "description": ""
      },
      {
        "title": "Technology Transfer",
        "href": "/technology-transfer",
        "description": ""
      }
    ]
  },
  {
    "heading": "Partnerships",
    "items": [
      {
        "title": "Partners",
        "href": "/partners",
        "description": ""
      },
      {
        "title": "How to Partner",
        "href": "/partners/how-to-partner",
        "description": ""
      },
      {
        "title": "Partner Stories",
        "href": "/partners/stories",
        "description": ""
      }
    ]
  }
],
  },
  {
    title: "Impact",
    href: "/community-impact",
    icon: HeartHandshake,
    description: "Community Impact, Impact Metrics, Sustainability, University Farm.",
    activePaths: ["/community-impact", "/impact-metrics", "/sustainability", "/farm"],
    columns: [
  {
    "heading": "Impact",
    "items": [
      {
        "title": "Community Impact",
        "href": "/community-impact",
        "description": ""
      },
      {
        "title": "Impact Metrics",
        "href": "/impact-metrics",
        "description": ""
      },
      {
        "title": "Sustainability",
        "href": "/sustainability",
        "description": ""
      },
      {
        "title": "University Farm",
        "href": "/farm",
        "description": ""
      }
    ]
  }
],
  },
  {
    title: "Support",
    href: "/funding",
    icon: BookOpen,
    description: "Funding Opportunities, Scholarships, Endowments, Training, Mentorship, Capacity Building, Services, Consultancies, Resources & Tools, Forms & Templates, Guidelines.",
    activePaths: ["/funding", "/scholarships", "/endowments", "/training", "/mentorship", "/capacity", "/services", "/consultancies", "/resources-tools", "/forms", "/guidelines"],
    columns: [
  {
    "heading": "Funding",
    "items": [
      {
        "title": "Funding Opportunities",
        "href": "/funding",
        "description": ""
      },
      {
        "title": "Scholarships",
        "href": "/scholarships",
        "description": ""
      },
      {
        "title": "Endowments",
        "href": "/endowments",
        "description": ""
      }
    ]
  },
  {
    "heading": "Development",
    "items": [
      {
        "title": "Training",
        "href": "/training",
        "description": ""
      },
      {
        "title": "Mentorship",
        "href": "/mentorship",
        "description": ""
      },
      {
        "title": "Capacity Building",
        "href": "/capacity",
        "description": ""
      },
      {
        "title": "Services",
        "href": "/services",
        "description": ""
      },
      {
        "title": "Consultancies",
        "href": "/consultancies",
        "description": ""
      }
    ]
  },
  {
    "heading": "Resources",
    "items": [
      {
        "title": "Resources & Tools",
        "href": "/resources-tools",
        "description": ""
      },
      {
        "title": "Forms & Templates",
        "href": "/forms",
        "description": ""
      },
      {
        "title": "Guidelines",
        "href": "/guidelines",
        "description": ""
      }
    ]
  }
],
  },
  {
    title: "News & Events",
    href: "/news",
    icon: Newspaper,
    description: "News, Events.",
    activePaths: ["/news", "/events"],
    columns: [
  {
    "heading": "Updates",
    "items": [
      {
        "title": "News",
        "href": "/news",
        "description": ""
      },
      {
        "title": "Events",
        "href": "/events",
        "description": ""
      }
    ]
  }
],
  },
  {
    title: "Contact Us",
    href: "/connect",
    icon: Mail,
    description: "Contact the research office.",
    activePaths: ["/connect"],
    columns: [],
  },
];

export const popularSearches = ["Publications", "Grants", "Centers", "Innovation", "Partnerships", "Projects"];
