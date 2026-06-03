"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, FlaskConical, GraduationCap, HandCoins, HeartHandshake, Leaf, Lightbulb, Newspaper, Settings, Sprout } from "lucide-react";
import { researchApi } from "@ksu/api-client";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ksu/ui/components";
import { PageHeader } from "@/components/layout";
import { formatCount } from "@/lib/counts";

type CountResponse = {
  data?: unknown[];
  meta?: {
    total?: number;
  };
};

const countParams = { page: 1, per_page: 1 };

const researchAreas = [
  {
    title: "Main Research",
    description: "Projects, fundings, impact, publications, partnerships, donations, innovation, and outputs.",
    href: "/research/main",
    icon: FlaskConical,
  },
  {
    title: "Research Content",
    description: "Manage research-scoped news, blogs, events, and announcements through the main content service.",
    href: "/research/content",
    icon: Newspaper,
  },
  {
    title: "Sustainability and Climate Change",
    description: "Projects, partners, activities, and content for sustainability work.",
    href: "/research/sustainability",
    icon: Leaf,
  },
  {
    title: "University Farm",
    description: "Farm projects, partnerships, impact stories, activities, and focus areas.",
    href: "/research/farm",
    icon: Sprout,
  },
  {
    title: "Capacity Building",
    description: "Training programs, mentorship programs, scholarships, and consultancies.",
    href: "/research/capacity",
    icon: GraduationCap,
  },
  {
    title: "Settings",
    description: "Research configuration and donation settings.",
    href: "/research/settings",
    icon: Settings,
  },
];

export function ResearchDashboardClient() {
  const projects = useQuery({
    queryKey: ["research", "projects", "count"],
    queryFn: () => researchApi.get<CountResponse>("/api/v1/projects", countParams),
  });
  const publications = useQuery({
    queryKey: ["research", "publications", "count"],
    queryFn: () => researchApi.get<CountResponse>("/api/v1/publications", countParams),
  });
  const grants = useQuery({
    queryKey: ["research", "grants", "count"],
    queryFn: () => researchApi.get<CountResponse>("/api/v1/grants", countParams),
  });
  const partners = useQuery({
    queryKey: ["research", "partners", "count"],
    queryFn: () => researchApi.get<CountResponse>("/api/v1/partners", countParams),
  });
  const innovations = useQuery({
    queryKey: ["research", "innovations", "count"],
    queryFn: () => researchApi.get<CountResponse>("/api/v1/innovations", countParams),
  });
  const sustainability = useQuery({
    queryKey: ["research", "sustainability", "count"],
    queryFn: () => researchApi.get<CountResponse>("/api/v1/sustainability", countParams),
  });

  const stats = [
    {
      title: "Research projects",
      value: formatCount(projects.data, projects.isLoading, projects.isError),
      description: "From /api/v1/projects",
      icon: FlaskConical,
      href: "/research/projects",
    },
    {
      title: "Publications",
      value: formatCount(publications.data, publications.isLoading, publications.isError),
      description: "From /api/v1/publications",
      icon: BookOpen,
      href: "/research/publications",
    },
    {
      title: "Grants",
      value: formatCount(grants.data, grants.isLoading, grants.isError),
      description: "From /api/v1/grants",
      icon: HandCoins,
      href: "/research/grants",
    },
    {
      title: "Partnerships",
      value: formatCount(partners.data, partners.isLoading, partners.isError),
      description: "From /api/v1/partners",
      icon: HeartHandshake,
      href: "/research/partnerships",
    },
    {
      title: "Innovations",
      value: formatCount(innovations.data, innovations.isLoading, innovations.isError),
      description: "From /api/v1/innovations",
      icon: Lightbulb,
      href: "/research/innovations",
    },
    {
      title: "Sustainability",
      value: formatCount(sustainability.data, sustainability.isLoading, sustainability.isError),
      description: "From /api/v1/sustainability",
      icon: Leaf,
      href: "/research/sustainability",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Research Dashboard"
        description="Manage main research records, scoped content, sustainability, university farm, capacity building, and settings."
      />

      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Link key={stat.title} href={stat.href} className="block">
                <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Research work areas</CardTitle>
            <CardDescription>Navigation reflects the research backend modules currently exposed by the admin shell.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {researchAreas.map((area) => {
              const Icon = area.icon;

              return (
                <Button key={area.href} variant="outline" className="h-auto justify-start p-4" asChild>
                  <Link href={area.href}>
                    <Icon className="mr-3 h-5 w-5 text-primary" />
                    <span className="text-left">
                      <span className="block font-medium">{area.title}</span>
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">{area.description}</span>
                    </span>
                  </Link>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
